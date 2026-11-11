// The WebGL world renderer: rooms, bosses, the raid, spell effects, post.
// One GL context lives for the whole session; encounters swap what it draws.

import { program, meshVAO, freeMesh, colorTexture, targetFor } from './glutil.js';
import * as S from './shaders.js';
import { STRIDE, Pose } from './model.js';
import { perspective, lookAt, mul4, placement, hex, cssColor, clamp01, lerp, hash } from './math.js';
import { themeFor } from './themes.js';
import { buildEnvironment, ENV_STRIDE } from './environment.js';
import { buildFigure, animateFigure, RAID_LOOKS, playerLook } from './models/figures.js';
import { makeBossModel, makeAddModel } from './bosses.js';
import { Particles, P_STRIDE, emitAmbient, emitFlame, stepBossFX, SCHOOLS, schoolOf } from './fx.js';
import { DecalStream, DECAL_STRIDE } from './decals.js';
import { conePoly, circlePoly, localToWorld, bossFootprint } from '../shapes.js';
import { spotTolerance } from '../topdown.js';
import { createCamera, updateBasis } from '../projection.js';
import { createAssetRenderer } from './assets.js';
import { playerCombatAnimation, bossCombatAnimation } from '../combat-animation.js';

const MAT_FIGURE = { noise: 0.3, scales: 0, cracks: 0, rim: 0.42, paintF: 7, scaleF: 1, gloss: 0.34, crackF: 1 };
const lin = (c) => [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)];
const rad = (d) => (d * Math.PI) / 180;

let singleton;

export function acquireWorld() {
  if (singleton !== undefined) return singleton;
  singleton = null;
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const stage = document.getElementById('stage');
  if (!stage) return null;
  const canvas = document.createElement('canvas');
  canvas.id = 'world3d';
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;display:block;';
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
  stage.parentNode.insertBefore(canvas, stage);
  stage.style.background = 'transparent';
  singleton = createWorld(gl, canvas);
  return singleton;
}

function createWorld(gl, canvas) {
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  gl.getExtension('OES_texture_float_linear');
  const P = {
    lit: program(gl, S.litVS, S.litFS, 'lit'), env: program(gl, S.envVS, S.envFS, 'env'), decal: program(gl, S.decalVS, S.decalFS, 'decal'),
    part: program(gl, S.particleVS, S.particleFS, 'particle'), bright: program(gl, S.fullVS, S.brightFS, 'bright'), blur: program(gl, S.fullVS, S.blurFS, 'blur'),
    comp: program(gl, S.fullVS, S.compositeFS, 'composite'), bake: program(gl, S.fullVS, S.bakeFS, 'bake'),
  };
  const emptyVAO = gl.createVertexArray();
  const art = createAssetRenderer(gl, setCommon, () => portraits.clear());
  const drawArt = (...args) => { const drawn = art.draw(...args); gl.useProgram(P.lit.p); return drawn; };

  // ---- dynamic streams
  const decals = new DecalStream();
  const decalVAO = gl.createVertexArray(), decalVBO = gl.createBuffer();
  gl.bindVertexArray(decalVAO); gl.bindBuffer(gl.ARRAY_BUFFER, decalVBO);
  gl.bufferData(gl.ARRAY_BUFFER, decals.d.byteLength, gl.DYNAMIC_DRAW);
  [[0, 3, 0], [1, 4, 3], [2, 3, 7]].forEach(([l, s, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, DECAL_STRIDE * 4, o * 4); });

  const parts = new Particles();
  const partVAO = gl.createVertexArray(), cornerVBO = gl.createBuffer(), instVBO = gl.createBuffer();
  gl.bindVertexArray(partVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, cornerVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, instVBO);
  gl.bufferData(gl.ARRAY_BUFFER, parts.out.byteLength, gl.DYNAMIC_DRAW);
  [[1, 4, 0], [2, 4, 4], [3, 2, 8]].forEach(([l, s, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, P_STRIDE * 4, o * 4); gl.vertexAttribDivisor(l, 1); });
  gl.bindVertexArray(null);

  // ---- models and textures
  const models = new Map();
  const upload = (built) => meshVAO(gl, built.verts, STRIDE, [[0, 3, 0], [1, 3, 3], [2, 3, 6], [3, 1, 9], [4, 2, 10], [5, 1, 12]], built.indices);
  function model(key, make) {
    let m = models.get(key);
    if (!m) { const def = make(); m = { ...def, mesh: upload(def.built), pose: new Pose(def.built), mem: {} }; models.set(key, m); }
    return m;
  }
  const IDENT_BONES = new Float32Array(S.MAX_BONES * 12);
  for (let i = 0; i < S.MAX_BONES; i++) { IDENT_BONES[i * 12] = 1; IDENT_BONES[i * 12 + 5] = 1; IDENT_BONES[i * 12 + 10] = 1; }

  const textures = new Map();
  function bake(def) {
    const key = JSON.stringify([def.kind, def.a, def.b, def.c]);
    if (textures.has(key)) return textures.get(key);
    const size = 1024;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 11, gl.RGBA8, size, size);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, size, size);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    gl.useProgram(P.bake.p);
    gl.uniform1i(P.bake.u.uKind, def.kind);
    gl.uniform3fv(P.bake.u.uA, hex(def.a)); gl.uniform3fv(P.bake.u.uB, hex(def.b)); gl.uniform3fv(P.bake.u.uC, hex(def.c));
    gl.uniform1f(P.bake.u.uSeed, def.kind * 3.1 + 1.2);
    gl.bindVertexArray(emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteFramebuffer(fb);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    textures.set(key, tex);
    return tex;
  }

  // ---- encounter
  let E = null;
  function setEncounter(script) {
    const raid = (script.raidInfo && script.raidInfo.id) || 'onyxia', boss = script.id || 'onyxia';
    if (E && E.key === `${raid}/${boss}` && E.script === script) return;
    if (E) { [E.floor, E.walls, E.dome, E.outerMesh].forEach((m) => freeMesh(gl, m)); if (E.props) freeMesh(gl, E.props); }
    const theme = themeFor(raid, boss);
    const env = buildEnvironment(script, theme);
    const up = (a) => meshVAO(gl, a.verts, ENV_STRIDE, [[0, 3, 0], [1, 3, 3], [2, 2, 6], [3, 3, 8]], a.indices);
    const info = env.info, far = 900, fs = theme.floor.scale;
    const oz = theme.outer === 'lava' ? -1.2 : theme.outer === 'water' || theme.outer === 'slime' ? -0.9 : theme.outer === 'pit' ? -6 : -0.12;
    const quad = {
      verts: new Float32Array([
        info.cx - far, info.cy - far, oz, 0, 0, 1, (info.cx - far) * fs, (info.cy - far) * fs, 0.6, 0.6, 0.6,
        info.cx + far, info.cy - far, oz, 0, 0, 1, (info.cx + far) * fs, (info.cy - far) * fs, 0.6, 0.6, 0.6,
        info.cx + far, info.cy + far, oz, 0, 0, 1, (info.cx + far) * fs, (info.cy + far) * fs, 0.6, 0.6, 0.6,
        info.cx - far, info.cy + far, oz, 0, 0, 1, (info.cx - far) * fs, (info.cy + far) * fs, 0.6, 0.6, 0.6]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    };
    E = {
      key: `${raid}/${boss}`, script, raid, boss, theme, env, info,
      floor: up(env.floor), walls: up(env.walls), dome: env.dome.indices.length ? up(env.dome) : null, outerMesh: up(quad),
      props: env.props ? upload(env.props) : null,
      floorTex: bake(theme.floor), wallTex: bake(theme.wall),
      bossM: null, raidMem: new Map(), playerMem: {}, addMem: new Map(),
    };
    E.bossM = model(`boss:${E.key}`, () => makeBossModel(raid, boss));
    E.addM = model(`add:${E.key}`, () => makeAddModel(raid, boss));
    E.bossM.mem = {};
    E.artReady = art.preload([boss, 'tank', 'rogue', 'caster', 'whelp', ...env.artProps.map(p => p.key)]);
    const encounter = E;
    const surfaces = ['floor', 'wall'].map(surface => art.surface(`${raid}-${surface}`).then(tex => {
      if (tex && E === encounter) { E[`${surface}Tex`] = tex; E[`${surface}Art`] = true; }
    }).catch(error => console.warn(`Unable to load ${surface} texture`, error)));
    E.artReady = Promise.all([E.artReady, ...surfaces]);
    parts.clear();
  }

  // ---- targets
  let target = null;
  function ensureTargets(pw, ph) {
    if (target && target.w === pw && target.h === ph) return;
    if (target) {
      gl.deleteFramebuffer(target.msFB); gl.deleteRenderbuffer(target.msC); gl.deleteRenderbuffer(target.msD); gl.deleteFramebuffer(target.sceneFB); gl.deleteTexture(target.scene);
      for (const b of target.bloom) { gl.deleteFramebuffer(b.fbA); gl.deleteTexture(b.a); gl.deleteFramebuffer(b.fbB); gl.deleteTexture(b.b); }
    }
    const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES));
    const msC = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, msC); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA16F, pw, ph);
    const msD = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, msD); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, pw, ph);
    const msFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, msFB);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msC);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, msD);
    const scene = colorTexture(gl, pw, ph, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    const sceneFB = targetFor(gl, scene);
    const bloom = [];
    let w = pw, h = ph;
    for (let i = 0; i < 3; i++) {
      w = Math.max(2, w >> 2 || 2); h = Math.max(2, h >> 2 || 2);
      if (i === 0) { w = Math.max(2, pw >> 1); h = Math.max(2, ph >> 1); }
      const a = colorTexture(gl, w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT), b = colorTexture(gl, w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
      bloom.push({ a, b, fbA: targetFor(gl, a), fbB: targetFor(gl, b), w, h });
    }
    target = { w: pw, h: ph, msC, msD, msFB, scene, sceneFB, bloom };
  }

  // ---- common uniforms
  const lightPos = new Float32Array(S.MAX_LIGHTS * 4), lightCol = new Float32Array(S.MAX_LIGHTS * 3);
  let lightN = 0;
  const VP = new Float32Array(16), proj = new Float32Array(16), viewM = new Float32Array(16), model4 = new Float32Array(16);
  let fogScale = 1;
  function setCommon(p, eye, now, th) {
    gl.uniform3fv(p.u.uCam, eye);
    const lift = fogScale === 0 ? 1.4 : 1;
    gl.uniform3f(p.u.uAmbUp, th.ambUp[0] * lift, th.ambUp[1] * lift, th.ambUp[2] * lift); gl.uniform3fv(p.u.uAmbDown, th.ambDown);
    const k = th.key, l = Math.hypot(k[0], k[1], k[2]) || 1;
    gl.uniform3f(p.u.uKeyDir, k[0] / l, k[1] / l, k[2] / l);
    gl.uniform3fv(p.u.uKeyCol, th.keyCol);
    gl.uniform3fv(p.u.uFog, th.fog);
    gl.uniform1f(p.u.uFogD, th.fogD * fogScale);
    gl.uniform1f(p.u.uTime, now);
    gl.uniform4fv(p.u.uLP, lightPos); gl.uniform3fv(p.u.uLC, lightCol); gl.uniform1i(p.u.uLN, lightN);
  }

  let emissiveScale = 1;
  function setMat(m, tint = [1, 1, 1], fade = 1, flash = 0, crack = [0, 0, 0]) {
    const u = P.lit.u;
    gl.uniform4f(u.uMat, m.noise, m.scales, m.cracks, m.rim);
    gl.uniform4f(u.uMat2, m.paintF, m.scaleF, m.gloss, m.crackF);
    gl.uniform3fv(u.uCrack, m.crackColor || crack);
    gl.uniform3fv(u.uTint, tint);
    gl.uniform1f(u.uFade, fade); gl.uniform1f(u.uFlash, flash); gl.uniform1f(u.uEmK, emissiveScale);
  }

  function drawMesh(mesh, bones, M) {
    gl.uniformMatrix4fv(P.lit.u.uModel, false, M);
    gl.uniformMatrix3x4fv(P.lit.u.uBones, false, bones);
    gl.bindVertexArray(mesh.vao);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
  }

  // ---- cameras
  const mapCam = createCamera();
  const blend = { from: null, start: 0, mode: null, eye: [0, 0, 0], look: [0, 0, 0] };
  const outCam = createCamera();

  function fitMap(info, w, h) {
    const aspect = w / h, fov = (34 * Math.PI) / 180, ty = Math.tan(fov / 2);
    const spanX = (info.maxx - info.minx) / 2 + 6, spanY = (info.maxy - info.miny) / 2 + 6;
    const d = Math.max(spanY / ty, spanX / (ty * aspect)) * 1.08;
    mapCam.fov = fov;
    mapCam.lookX = info.cx; mapCam.lookY = info.cy - d * 0.018; mapCam.lookZ = 0;
    mapCam.x = info.cx; mapCam.y = info.cy - d * 0.2; mapCam.z = d;
    updateBasis(mapCam);
    return mapCam;
  }

  /** Pull the chase camera in front of any wall between it and the player. */
  function collide(cam, script) {
    const lx = cam.lookX, ly = cam.lookY;
    let dx = cam.x - lx, dy = cam.y - ly, best = 1;
    for (const wall of script.arena.walls) for (let i = 0; i < wall.points.length - 1; i++) {
      const a = wall.points[i], b = wall.points[i + 1];
      const ex = b[0] - a[0], ey = b[1] - a[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-6) continue;
      const fx = a[0] - lx, fy = a[1] - ly, t = (fx * ey - fy * ex) / den, u = (fx * dy - fy * dx) / den;
      if (t > 0 && t < best && u >= 0 && u <= 1) best = t;
    }
    if (best < 1) {
      const k = Math.max(0.12, best - 0.1);
      cam.x = lx + dx * k; cam.y = ly + dy * k;
      cam.z = cam.lookZ + (cam.z - cam.lookZ) * Math.max(k, 0.55);
      updateBasis(cam);
    }
  }

  function heroCamera(view, now) {
    const m = E.bossM, s = m.scale, b = { x: E.info.cx, y: E.info.cy };
    const fullH = m.built.maxz * s;
    const r = Math.max(9, (m.heroDist ?? (m.height || 10) * 2.5) * s, fullH * 2.2);
    const face = -Math.PI / 2;
    const a = face + 0.55 + Math.sin(now * 0.12) * 0.16;
    const h = fullH;
    outCam.lookX = b.x + Math.cos(face) * r * 0.1 - Math.sin(face) * r * 0.25;
    outCam.lookY = b.y + Math.sin(face) * r * 0.1 + Math.cos(face) * r * 0.25;
    outCam.lookZ = h * 0.5;
    outCam.x = b.x + Math.cos(a) * r; outCam.y = b.y + Math.sin(a) * r; outCam.z = Math.max(3, h * 0.36);
    outCam.fov = (42 * Math.PI) / 180;
    updateBasis(outCam);
    // A camera in or beyond the wall would stare at rock: drop the shell for this shot instead.
    let clear = Infinity;
    const dx = Math.cos(a), dy = Math.sin(a);
    for (const wall of E.script.arena.walls) for (let i = 0; i < wall.points.length - 1; i++) {
      const p = wall.points[i], q = wall.points[i + 1], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-6) continue;
      const fx = p[0] - b.x, fy = p[1] - b.y, t = (fx * ey - fy * ex) / den, u = (fx * dy - fy * dx) / den;
      if (t > 0 && u >= 0 && u <= 1 && t < clear) clear = t;
    }
    E.heroOutside = r > clear - 9;
    return outCam;
  }

  // ---- frame
  const scratch = [0, 0, 0];
  const pxc = { };
  let renderScale = 1, emaFrame = 16;

  function draw(a) {
    const { view, script, settings, pal, cam, w, h, dpr, now, dtReal, mode } = a;
    setEncounter(script);
    const th = E.theme, wd = view.world, t = view.t, dt = Math.min(0.05, dtReal || 0.016);

    // Adaptive resolution keeps the frame rate up on weaker GPUs.
    emaFrame = emaFrame * 0.95 + (dtReal * 1000 || 16) * 0.05;
    if (emaFrame > 24 && renderScale > 0.55) { renderScale -= 0.05; emaFrame = 16; } else if (emaFrame < 15 && renderScale < 1) { renderScale = Math.min(1, renderScale + 0.01); }
    const quality = settings.renderScale ?? 1;
    const limit = Math.min(1, Math.sqrt(3.4e6 / (w * h * dpr * dpr)));
    const scale = Math.min(limit, renderScale) * dpr * quality;
    const pw = Math.max(2, Math.round(w * scale)), ph = Math.max(2, Math.round(h * scale));
    if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
    if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
    ensureTargets(pw, ph);

    // Camera.
    let c = cam;
    if (mode === 'map') c = fitMap(E.info, w, h);
    else if (mode === 'hero') c = heroCamera(view, now);
    else collide(cam, script);
    let eye = [c.x, c.y, c.z], look = [c.lookX, c.lookY, c.lookZ], fov = c.fov;
    if (blend.mode !== mode) { blend.from = blend.mode ? { eye: blend.eye.slice(), look: blend.look.slice(), fov: blend.fov } : null; blend.start = now; blend.mode = mode; }
    if (blend.from) {
      const k = clamp01((now - blend.start) / 0.45), e = k * k * (3 - 2 * k);
      if (k >= 1) blend.from = null;
      else {
        eye = eye.map((v, i) => lerp(blend.from.eye[i], v, e)); look = look.map((v, i) => lerp(blend.from.look[i], v, e)); fov = lerp(blend.from.fov, fov, e);
        outCam.x = eye[0]; outCam.y = eye[1]; outCam.z = eye[2]; outCam.lookX = look[0]; outCam.lookY = look[1]; outCam.lookZ = look[2]; outCam.fov = fov; updateBasis(outCam); c = outCam;
      }
    }
    blend.eye = eye; blend.look = look; blend.fov = fov;
    perspective(fov, w / h, 0.3, 1400, proj);
    if (mode === 'hero' && w > 980) {
      const edge = a.heroInset || w * 0.58;
      proj[8] = -Math.min(0.7, ((edge + w) / 2 / w) * 2 - 1);
    }
    lookAt(eye, look, [0, 0, 1], viewM);
    mul4(proj, viewM, VP);

    // Boss pose. Some bosses change form with the phase (C'Thun's Eye and body).
    const boss = wd.boss;
    let bm = E.bossM;
    if (E.bossM.variants && mode !== 'hero') for (const v of E.bossM.variants) if (v.match.test(view.phaseName || '')) { bm = model(`boss:${E.key}:${v.key}`, v.make); break; }
    if (bm !== E.bossM && !bm.mem) bm.mem = {};
    const mem = bm.mem;
    const moved = mem.px === undefined ? 0 : Math.hypot(boss.x - mem.px, boss.y - mem.py);
    mem.speed = (mem.speed || 0) * 0.85 + (moved / Math.max(0.001, dt)) * 0.15;
    mem.px = boss.x; mem.py = boss.y;
    const cast = boss.cast && script.actions[boss.cast.id] ? { id: boss.cast.id, kind: script.actions[boss.cast.id].kind, frac: clamp01((t - boss.cast.start) / Math.max(0.05, boss.cast.end - boss.cast.start)) } : null;
    bm.animate(bm.pose, { t: now, dt, mem, state: boss.state, moving: mem.speed > 1, cast, engaged: boss.engaged });
    const sinkTarget = boss.state === 'submerged' && !bm.staysVisible ? 1 : 0;
    mem.sink = (mem.sink ?? sinkTarget) + (sinkTarget - (mem.sink ?? sinkTarget)) * Math.min(1, dt * 2.2);
    const bossZ = (boss.z || 0) - mem.sink * (bm.built.maxz * bm.scale + 1);
    if (mode === 'hero') placement(E.info.cx, E.info.cy, Math.max(0, bossZ), -Math.PI / 2 + 0.55 + Math.sin(now * 0.12) * 0.16 + 0.42, bm.scale, model4);
    else placement(boss.x, boss.y, bossZ, bm.facePlayer ? Math.atan2(wd.player.y - boss.y, wd.player.x - boss.x) : boss.heading, bm.scale, model4);
    const mouthL = bm.pose.bonePos(bm.mouth || 'head', scratch);
    const mouth = [
      model4[0] * mouthL[0] + model4[4] * mouthL[1] + model4[12],
      model4[1] * mouthL[0] + model4[5] * mouthL[1] + model4[13],
      model4[10] * mouthL[2] + model4[14],
    ];

    // Lights: the nearest torches plus anything burning right now.
    lightN = 0;
    const addLight = (x, y, z, col, r) => { if (lightN >= S.MAX_LIGHTS) return; const i = lightN++; lightPos[i * 4] = x; lightPos[i * 4 + 1] = y; lightPos[i * 4 + 2] = z; lightPos[i * 4 + 3] = r; lightCol[i * 3] = col[0]; lightCol[i * 3 + 1] = col[1]; lightCol[i * 3 + 2] = col[2]; };
    if (cast) {
      const c2 = SCHOOLS[schoolOf(`${boss.cast.id} ${script.actions[boss.cast.id].label}`, bm.school)];
      const k = 0.4 + cast.frac * 0.8;
      addLight(mouth[0], mouth[1], mouth[2], [c2[0] * k * 3, c2[1] * k * 3, c2[2] * k * 3], 34);
    }
    if (bm.glow) addLight(boss.x, boss.y, bossZ + (bm.height || 8) * bm.scale * 0.6, bm.glow, (bm.glowR || 42));
    for (const hazard of wd.hazards) {
    const hz = hazard.damagePoly ? { ...hazard, poly: hazard.damagePoly } : hazard;
      if (hz.state !== 'active' || lightN >= 4) continue;
      let cx = 0, cy = 0; for (const [x, y] of hz.poly) { cx += x; cy += y; } cx /= hz.poly.length; cy /= hz.poly.length;
      const sc = SCHOOLS[hz.applies ? 'holy' : schoolOf(`${hz.id} ${hz.label}`, bm.school)];
      addLight(cx, cy, 2.2, [sc[0] * 2.4, sc[1] * 2.4, sc[2] * 2.4], 24);
    }
    const px = wd.player.x, py = wd.player.y;
    const near = E.env.torches.slice().sort((p, q) => ((p.x - px) ** 2 + (p.y - py) ** 2) - ((q.x - px) ** 2 + (q.y - py) ** 2));
    for (const tc of near) { const fl = 0.3 * (1 + 0.14 * Math.sin(now * 9 + tc.x) * Math.sin(now * 13.7 + tc.y)); addLight(tc.x, tc.y, tc.z, [tc.color[0] * fl, tc.color[1] * fl, tc.color[2] * fl], tc.radius); }

    // Effects.
    parts.step(dt);
    const playerAction = playerCombatAnimation(view), lastAction = view.abilities?.lastUsed;
    if (mode !== 'hero' && lastAction?.kind === 'attack' && lastAction.target && playerAction.actionProgress != null && E.playerMem.effectAt !== lastAction.at) {
      const p=wd.player, target=lastAction.target, ranged=view.role==='ranged' || view.role==='healer';
      const angle=Math.atan2(target.y-p.y,target.x-p.x), reach=Math.min(2.5,Math.hypot(target.x-p.x,target.y-p.y));
      for (let i=0;i<16;i++) {
        const a=angle-.8+i*.1, d=reach*(.65+.35*i/16);
        parts.emit(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,(p.z||0)+1.2+i*.035,Math.cos(a)*1.2,Math.sin(a)*1.2,.3,.08,.08,ranged ? .4 : 3,ranged ? 1.6 : 1.8,ranged ? 4 : .55,0,.28,3);
      }
      if (ranged) {
        const travel=.35;
        parts.emit(p.x,p.y,(p.z||0)+1.5,(target.x-p.x)/travel,(target.y-p.y)/travel,((target.z||0)-(p.z||0))/travel,.32,.1,.5,1.8,4,0,travel,0);
      }
    }
    E.playerMem.effectAt=lastAction?.at;
    if (th.ambient && mode !== 'map') emitAmbient(parts, th.ambient, E.info, dt, [px, py, 0]);
    if (mode !== 'map') for (const tc of near.slice(0, 16)) if (tc.color && tc.z < 8) emitFlame(parts, tc.x, tc.y, tc.z, 0.32, [tc.color[0] * 0.5, tc.color[1] * 0.5, tc.color[2] * 0.5], dt, 34);
    for (const v of E.env.vents) if (Math.random() < dt * 3) for (let i = 0; i < 6; i++) parts.emit(v.x, v.y, v.z, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 5 + Math.random() * 7, 0.7, 1.4, 0.05, 0.04, 0.035, 0.2, 2.4, 2);
    if (bm.fx && mem.sink < 0.9) bm.fx(parts, { dt, now, pose: bm.pose, M: model4, boss, view, scale: bm.scale });
    if (view.world.boss.state !== 'submerged') stepBossFX(parts, { view, script, dt, now, mouth, look: bm, mem, scale: bm.scale });

    fogScale = mode === 'map' ? 0 : 1;
    buildDecals(view, script, settings, pal, now, decals);
    if (mode !== 'hero') addContactShadows(view, script, decals, bm, bossZ, mem);


    // ---- geometry pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.msFB);
    gl.viewport(0, 0, pw, ph);
    if (mode === 'map') gl.clearColor(th.fog[0] * 0.25, th.fog[1] * 0.25, th.fog[2] * 0.25, 1); else gl.clearColor(th.fog[0], th.fog[1], th.fog[2], 1);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);

    // Environment.
    gl.useProgram(P.env.p);
    gl.uniformMatrix4fv(P.env.u.uVP, false, VP);
    setCommon(P.env, eye, now, th);
    gl.uniform3fv(P.env.u.uGlowA, th.glow); gl.uniform3fv(P.env.u.uGlowB, th.glowB);
    gl.uniform1i(P.env.u.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    const drawEnv = (mesh, tex, modeId, bump, gloss, culled = true) => {
      if (!mesh) return;
      if (culled) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(P.env.u.uMode, modeId); gl.uniform1f(P.env.u.uBump, bump); gl.uniform1f(P.env.u.uGloss, gloss);
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    };
    const hideShell = mode === 'hero' && E.heroOutside;
    if (E.dome && mode !== 'map' && !hideShell) drawEnv(E.dome, E.wallTex, 2, 0, th.domeGlow ?? 0.5, false);
    const outerMode = th.outer === 'lava' ? 1 : (th.outer === 'water' || th.outer === 'slime') ? 3 : 0;
    if (th.outer === 'slime') { gl.uniform3f(P.env.u.uGlowA, 0.12, 0.5, 0.05); gl.uniform3f(P.env.u.uGlowB, 0.45, 1.5, 0.1); }
    else if (mode === 'map') { gl.uniform3f(P.env.u.uGlowA, th.glow[0] * 0.4, th.glow[1] * 0.4, th.glow[2] * 0.4); gl.uniform3f(P.env.u.uGlowB, th.glowB[0] * 0.3, th.glowB[1] * 0.3, th.glowB[2] * 0.3); }
    if (outerMode === 0 && mode === 'map') { /* the void around the room in the tactical view */ } else drawEnv(E.outerMesh, E.floorTex, outerMode, th.bump, 0.1, false);
    gl.uniform3fv(P.env.u.uGlowA, th.glow); gl.uniform3fv(P.env.u.uGlowB, th.glowB);
    drawEnv(E.floor, E.floorTex, 0, E.floorArt ? 0 : th.bump, E.floorArt ? 0.025 : 0.22, false);
    if (!hideShell) drawEnv(E.walls, E.wallTex, 0, E.wallArt ? 0 : th.bump * 1.2, E.wallArt ? 0.025 : 0.12, true);

    // Characters and props.
    gl.useProgram(P.lit.p);
    gl.uniformMatrix4fv(P.lit.u.uVP, false, VP);
    setCommon(P.lit, eye, now, th);
    gl.enable(gl.CULL_FACE);
    // Set dressing between the camera and its subject is cut away, so nothing can block the view.
    gl.uniform1f(P.lit.u.uCutR, mode === 'hero' ? 7 : mode === 'pov' ? 3.2 : 0);
    if (mode === 'hero') gl.uniform4f(P.lit.u.uCut, eye[0], eye[1], E.info.cx, E.info.cy);
    else if (mode === 'pov') gl.uniform4f(P.lit.u.uCut, eye[0], eye[1], look[0], look[1]);
    if (E.props && mode !== 'map') { setMat({ noise: 0.5, scales: 0, cracks: 0, rim: 0.05, paintF: 0.9, scaleF: 1, gloss: 0.1, crackF: 1 }); placement(0, 0, 0, 0, 1, FIXED); drawMesh(E.props, IDENT_BONES, FIXED); }
    gl.uniform1f(P.lit.u.uCutR, 0);
    art.begin(VP, eye, now, th);
    if (mode !== 'map') for (const prop of E.env.artProps) {
      const dx=look[0]-eye[0], dy=look[1]-eye[1], length=dx*dx+dy*dy;
      const along=length ? Math.max(0,Math.min(1,((prop.x-eye[0])*dx+(prop.y-eye[1])*dy)/length)) : 0;
      if (along < .98 && Math.hypot(prop.x-eye[0]-along*dx,prop.y-eye[1]-along*dy) < 3) continue;
      placement(prop.x, prop.y, prop.z, prop.heading, 1, FIXED);
      drawArt(prop.key, FIXED, now, { prop: true }, 1, 0, prop.height);
    }

    // Boss, dithered out when the camera is inside its body.
    const R = script.boss.radius, dc = Math.hypot(eye[0] - boss.x, eye[1] - boss.y);
    const nearFade = mode === 'pov' ? Math.max(0.3, Math.min(1, (dc - R * 0.8) / (R * 1.1))) : 1;
    const hit = Math.max(0, 1 - (t - (boss.lastDamagedAt ?? -Infinity)) / 0.25);
    const bossAction = mode === 'hero' ? {} : bossCombatAnimation(view, script);
    if ((mode === 'hero' || mem.sink < 0.98) && !drawArt(E.boss, model4, now, { moving: mem.speed > 1, airborne: boss.state === 'airborne' || boss.z > 0.1, ...bossAction }, nearFade, hit * 0.4, bm.height || bm.built.maxz)) {
      setMat(bm.mat, bm.tint || [1, 1, 1], nearFade, hit * 0.09); drawMesh(bm.mesh, bm.pose.matrices, model4);
    }
    if (bm.drawExtra) bm.drawExtra((mesh, bones, M) => drawMesh(mesh, bones, M), { boss, view, now });

    if (mode !== 'hero') { drawRaid(view, script, settings, pal, now, dt, eye, mode); drawAdds(view, now, dt); }

    // Floor telegraphs.
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -2);
    gl.useProgram(P.decal.p);
    gl.uniformMatrix4fv(P.decal.u.uVP, false, VP);
    gl.uniform1f(P.decal.u.uTime, now);
    gl.bindVertexArray(decalVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, decalVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, decals.d.subarray(0, decals.n * DECAL_STRIDE));
    if (mode !== 'hero') gl.drawArrays(gl.TRIANGLES, 0, decals.n);
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // Particles.
    const nParts = parts.write();
    gl.useProgram(P.part.p);
    gl.uniformMatrix4fv(P.part.u.uVP, false, VP);
    gl.uniform1f(P.part.u.uTime, now);
    gl.uniform3f(P.part.u.uRight, viewM[0], viewM[4], viewM[8]);
    gl.uniform3f(P.part.u.uUp, viewM[1], viewM[5], viewM[9]);
    gl.bindVertexArray(partVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, instVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, parts.out.subarray(0, nParts * P_STRIDE));
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, nParts);
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // ---- resolve and post
    gl.bindVertexArray(emptyVAO);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, target.msFB);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target.sceneFB);
    gl.blitFramebuffer(0, 0, pw, ph, 0, 0, pw, ph, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.activeTexture(gl.TEXTURE0);
    let src = target.scene;
    target.bloom.forEach((b, i) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbA); gl.viewport(0, 0, b.w, b.h);
      gl.useProgram(i === 0 ? P.bright.p : P.blur.p);
      if (i) gl.uniform2f(P.blur.u.uDir, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, src);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.useProgram(P.blur.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbB);
      gl.uniform2f(P.blur.u.uDir, 1 / b.w, 0); gl.bindTexture(gl.TEXTURE_2D, b.a); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbA);
      gl.uniform2f(P.blur.u.uDir, 0, 1 / b.h); gl.bindTexture(gl.TEXTURE_2D, b.b); gl.drawArrays(gl.TRIANGLES, 0, 3);
      src = b.a;
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(P.comp.p);
    const tx = [target.scene, target.bloom[0].a, target.bloom[1].a, target.bloom[2].a];
    ['uScene', 'uB0', 'uB1', 'uB2'].forEach((n, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx[i]); gl.uniform1i(P.comp.u[n], i); });
    gl.uniform3fv(P.comp.u.uGrade, th.grade);
    gl.uniform1f(P.comp.u.uVignette, 0.55); gl.uniform1f(P.comp.u.uExposure, th.exposure); gl.uniform1f(P.comp.u.uDim, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(null);
    if (portraitQueue.length) pumpPortraits();
    return c;
  }
  const FIXED = new Float32Array(16);

  // ---- figures
  const LOOK_MODELS = (i) => model(`raid:${i}`, () => ({ built: buildFigure({ ...RAID_LOOKS[i], cell: 0.07, helm: i !== 3 }), mat: MAT_FIGURE }));
  const pickLook = (i, melee) => { const r = hash(i, 7); return melee ? Math.floor(r * 4) : 4 + Math.floor(r * 5); };
  const M2 = new Float32Array(16);
  const figureAlpha = (d) => Math.max(0.2, Math.min(1, (d - 1.2) / 3));

  function drawRaid(view, script, settings, pal, now, dt, eye, mode) {
    const wd = view.world, b = wd.boss;
    setMat(MAT_FIGURE);
    wd.raid.dots.forEach((d, i) => {
      const mi = pickLook(i, d.melee), m = LOOK_MODELS(mi);
      let st = E.raidMem.get(i); if (!st) { st = { x: d.x, y: d.y, speed: 0 }; E.raidMem.set(i, st); }
      const mv = Math.hypot(d.x - st.x, d.y - st.y) / Math.max(0.001, dt);
      st.speed = st.speed * 0.8 + mv * 0.2; st.x = d.x; st.y = d.y;
      const moving = st.speed > 0.8;
      const phase = hash(i, 3) * 6.28, engaged = b.engaged;
      const beat = (now * (d.melee ? 0.9 : 0.42) + hash(i, 5)) % 1;
      animateFigure(m.pose, { t: now, moving, phase, attack: engaged && d.melee && !moving ? (beat < 0.35 ? beat / 0.35 : 0) : 0, cast: engaged && !d.melee && !moving ? 0.5 + 0.5 * Math.sin(now * 1.2 + phase) : 0 });
      const heading = Math.atan2(b.y - d.y, b.x - d.x);
      placement(d.x, d.y, 0, moving && st.dirSet ? st.dir : heading, 1.05, M2);
      const dc = Math.hypot(eye[0] - d.x, eye[1] - d.y, eye[2] - 1);
      setMat(MAT_FIGURE, [1, 1, 1], mode === 'pov' ? figureAlpha(dc) : 1);
      if (!drawArt(mi < 2 ? 'tank' : mi < 4 ? 'rogue' : 'caster', M2, now + phase, { moving, attack: engaged && d.melee, cast: engaged && !d.melee }, mode === 'pov' ? figureAlpha(dc) : 1)) drawMesh(m.mesh, m.pose.matrices, M2);
    });
    // Ghost tank.
    const g = wd.ghost;
    if (g && (g.tanking || (settings.ghostAlpha ?? 0.6) > 0.01)) {
      const m = model('ghost', () => ({ built: buildFigure({ ...playerLook('mt'), cell: 0.06 }), mat: MAT_FIGURE }));
      animateFigure(m.pose, { t: now, moving: !!g.moving, phase: 1.1, attack: g.tanking && !g.moving ? (now * 0.65 % 1 < 0.35 ? (now * 0.65 % 1) / 0.35 : 0) : 0 });
      placement(g.x, g.y, 0, g.heading, 1.14, M2);
      if (g.tanking) setMat(MAT_FIGURE, [1, 1, 1], 1); else setMat({ ...MAT_FIGURE, rim: 1.6 }, [0.55, 0.85, 1.3], Math.max(0.15, (settings.ghostAlpha ?? 0.6) * 0.75));
      if (!drawArt('tank', M2, now + 1.1, { moving: !!g.moving, attack: g.tanking }, g.tanking ? 1 : Math.max(0.15, (settings.ghostAlpha ?? 0.6) * 0.75))) drawMesh(m.mesh, m.pose.matrices, M2);
    }
    // You.
    const p = wd.player;
    const role = view.role || 'mt';
    const pm = model(`player:${role}`, () => ({ built: buildFigure({ ...playerLook(role), cell: 0.045 }), mat: MAT_FIGURE }));
    const action = playerCombatAnimation(view);
    const feared = p.fearedUntil > view.t;
    animateFigure(pm.pose, { t: now, moving: !!p.moving, phase: 0, attack: action.attack ? action.actionProgress : 0, cast: action.cast ? action.actionProgress : 0, feared, jump: p.z > 0.05 ? 1 : 0 });
    placement(p.x, p.y, p.z || 0, p.heading, 1.1, M2);
    const dcp = Math.hypot(eye[0] - p.x, eye[1] - p.y, eye[2] - 1);
    setMat({ ...MAT_FIGURE, rim: 0.65 }, [1, 1, 1], mode === 'pov' ? figureAlpha(dcp) : 1);
    const playerArt = role === 'healer' || role === 'ranged' ? 'caster' : role === 'melee' ? 'rogue' : 'tank';
    if (!drawArt(playerArt, M2, now, { moving: !!p.moving || feared, jump: p.z > .05, ...action }, mode === 'pov' ? figureAlpha(dcp) : 1)) drawMesh(pm.mesh, pm.pose.matrices, M2);
  }

  function drawAdds(view, now, dt) {
    const wd = view.world, am = E.addM;
    if (!wd.whelps.length) return;
    setMat(am.mat);
    wd.whelps.forEach((wh, i) => {
      const key = wh.uid ?? i;
      let mem = E.addMem.get(key); if (!mem) { mem = {}; E.addMem.set(key, mem); }
      am.animate(am.pose, { t: now + i * 0.7, dt, mem, state: 'grounded', moving: true, cast: null });
      placement(wh.x, wh.y, 0, wh.heading, am.scale, M2);
      if (E.raid !== 'onyxia' || !drawArt('whelp', M2, now + i * 0.7, { moving: true }, 1, 0, am.built.maxz)) drawMesh(am.mesh, am.pose.matrices, M2);
    });
  }

  /** Dark soft discs that plant the boss, the raid and adds on the floor. */
  function addContactShadows(view, script, D, bm, bossZ, mem) {
    const wd = view.world, black = [0, 0, 0];
    const disc = (x, y, r, a) => { const c = circlePoly(x, y, r, 18); D.fill(c, 0.018, black, a * 0.55); D.fill(circlePoly(x, y, r * 0.62, 14), 0.019, black, a * 0.45); };
    if (mem.sink < 0.9) {
      const lift = Math.max(0, wd.boss.z || 0), r = script.boss.radius * (1.05 + lift * 0.008);
      disc(wd.boss.x, wd.boss.y, r, Math.max(0.16, 0.5 - lift * 0.012));
    }
    for (const d of wd.raid.dots) disc(d.x, d.y, 0.75, 0.42);
    for (const a of wd.whelps) disc(a.x, a.y, 1, 0.42);
    if (wd.ghost) disc(wd.ghost.x, wd.ghost.y, 0.85, 0.42);
    disc(wd.player.x, wd.player.y, 0.85, 0.5 - Math.min(0.3, (wd.player.z || 0) * 0.1));
  }

  // ---- floor telegraphs: same information as the 2D views, painted into the room.
  function colour(pal, name, boost = 1.5) { const c = cssColor(pal[name]); const v = lin(c); return [v[0] * boost, v[1] * boost, v[2] * boost, c[3]]; }

  function buildDecals(view, script, settings, pal, now, D) {
    D.reset();
    const wd = view.world, t = view.t, boss = wd.boss, p = wd.player, R = script.boss.radius, ha = settings.hazardOpacity ?? 0.7;
    const WARN = colour(pal, 'hazardWarn', 1.9), HOT = colour(pal, 'hazardActive', 2.6), GOOD = colour(pal, 'good', 2.2), CRACK = colour(pal, 'crackIdleStroke', 1.2), IDEAL = colour(pal, 'ideal', 2.4), IB = colour(pal, 'idealBoss', 2), FRONT = colour(pal, 'bossFront', 2.2), TAIL = colour(pal, 'coneTailStroke', 1.6), CLV = colour(pal, 'coneCleaveStroke', 1.6), BREATH = colour(pal, 'coneBreathStroke', 2.4), BUFFET = colour(pal, 'buffetRing', 2.4), ROUTE = colour(pal, 'route', 2), BAD = colour(pal, 'bad', 2.4);

    for (const hazard of wd.hazards) {
    const hz = hazard.damagePoly ? { ...hazard, poly: hazard.damagePoly } : hazard;
      if (hz.kind === 'crack' && hz.state === 'idle') { D.fill(hz.poly, 0.03, CRACK, 0.16 * ha + 0.06); D.ring(hz.poly, 0.04, 0.09, CRACK, 0.4); continue; }
      if (hz.state === 'warning') {
        const left = Math.max(0, hz.activeAt - t), urg = 1 - Math.min(1, left / Math.max(0.5, hz.activeAt - hz.warnAt));
        const pulse = 0.72 + 0.28 * Math.sin(now * (6 + urg * 10));
        D.fill(hz.poly, 0.03, WARN, ha * (0.12 + 0.16 * urg), 0);
        D.fill(hz.poly, 0.035, WARN, ha * (0.26 + 0.34 * urg), 2);
        D.rim(hz.poly, 0.04, WARN, ha * pulse, Math.max(0.8, 1.2 + urg * 0.9));
        D.ring(hz.poly, 0.05, 0.14, WARN, ha, 3, now * 0.9);
      } else if (hz.state === 'active') {
        const pulse = 0.85 + 0.15 * Math.sin(now * 14);
        const col = hz.applies ? GOOD : HOT;
        D.fill(hz.poly, 0.03, col, ha * 0.5 * pulse, 3);
        D.rim(hz.poly, 0.04, col, ha, 2.2);
        D.ring(hz.poly, 0.05, 0.2, col, ha * pulse);
      }
    }

    const cones = script.boss.cones || {};
    const grounded = boss.state === 'grounded';
    if (grounded && boss.engaged) {
      const cast = boss.cast, castDef = cast && script.actions[cast.id];
      for (const [name, c] of Object.entries(cones)) {
        const style = c.style || (c.facing === 'back' ? 'tail' : name === 'breath' ? 'breath' : 'cleave');
        const flash = Math.max(0, 1 - (t - (wd.coneFlash[name] ?? -Infinity)) / (style === 'breath' ? 0.6 : 0.4));
        const heading = boss.heading + (c.facing === 'back' ? Math.PI : 0);
        const casting = castDef && castDef.cone === name;
        if (style === 'breath' && !casting && !flash) continue;
        const poly = conePoly(boss.x, boss.y, heading, rad(c.angle), c.range, 26);
        if (casting) {
          const prog = Math.min(1, (t - cast.start) / (cast.end - cast.start));
          D.fill(poly, 0.06, HOT, 0.2 + 0.42 * prog, 2);
          D.rim(poly, 0.07, BREATH, 0.55 + 0.45 * prog, 2.2);
          D.ring(poly, 0.075, 0.22, BREATH, 0.5 + 0.5 * prog);
        } else if (style === 'breath') {
          D.fill(poly, 0.06, HOT, 0.6 * flash, 3); D.rim(poly, 0.07, BREATH, flash, 2);
        } else {
          const col = style === 'tail' ? TAIL : CLV;
          D.fill(poly, 0.05, flash ? HOT : col, flash ? 0.14 + 0.42 * flash : 0.018);
          D.ring(poly, 0.055, 0.08, col, 0.2 + 0.5 * flash);
        }
      }
      const kb = Object.values(script.actions).find((a) => a.kind === 'knockback');
      const bf = Math.max(0, 1 - (t - (wd.coneFlash.knockback ?? wd.coneFlash.buffet ?? -Infinity)) / 0.7);
      if (bf && kb) D.ring(circlePoly(boss.x, boss.y, R + (1 - bf) * kb.knockbackRange, 40), 0.08, 0.35, BUFFET, bf);
    }

    // Which way the boss faces.
    if (boss.engaged || grounded) {
      const c = Math.cos(boss.heading), s = Math.sin(boss.heading);
      const bx = boss.x + c * R * 1.7, by = boss.y + s * R * 1.7, ex = bx + c * 6, ey = by + s * 6;
      D.line(bx, by, ex, ey, 0.09, 0.32, FRONT, 0.85);
      D.fill([[ex, ey], [ex - c * 1.4 - s * 0.9, ey - s * 1.4 + c * 0.9], [ex - c * 1.4 + s * 0.9, ey - s * 1.4 - c * 0.9]], 0.09, FRONT, 0.9);
    }

    // Boss target pulse in the map view and where it should end up.
    if ((boss.target === 'raid' || (boss.target === 'player' && view.tankRole === false)) && boss.engaged && grounded) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 10);
      D.ring(circlePoly(boss.x, boss.y, R * 1.2, 36), 0.08, 0.3, BAD, 0.35 + pulse * 0.5);
    }
    const ib = wd.idealBoss;
    if (ib) {
      const a = ib.satisfied ? 0.3 : 0.75;
      const shape = bossFootprint(R, script.boss.shape || 'standing');
      for (const name of ['body', 'head', 'neck', 'tail']) {
        if (shape[name]) D.ring(shape[name].poly.map((q) => localToWorld(q, ib.x, ib.y, ib.heading)), 0.1, 0.2, IB, a, 2.2, now * 0.6);
      }
      if (!ib.satisfied && Math.hypot(boss.x - ib.x, boss.y - ib.y) > 3) {
        D.line(boss.x, boss.y, ib.x, ib.y, 0.1, 0.3, ROUTE, 0.9, 3, now * 1.6);
        const ang = Math.atan2(ib.y - boss.y, ib.x - boss.x);
        D.fill([[ib.x, ib.y], [ib.x - Math.cos(ang - 0.45) * 3, ib.y - Math.sin(ang - 0.45) * 3], [ib.x - Math.cos(ang + 0.45) * 3, ib.y - Math.sin(ang + 0.45) * 3]], 0.1, IB, 0.7);
      }
    }

    // Where you should be.
    const ideal = wd.idealPlayer;
    if (ideal && ideal.reason !== 'wait') {
      const tol = spotTolerance(script, ideal.reason), pulse = 0.5 + 0.5 * Math.sin(now * 3);
      D.fill(circlePoly(ideal.x, ideal.y, tol, 30), 0.1, IDEAL, 0.07);
      D.rim(circlePoly(ideal.x, ideal.y, tol, 30), 0.11, IDEAL, 0.65, Math.min(0.7, tol * 0.3));
      D.fill(circlePoly(ideal.x, ideal.y, Math.min(1.2, tol * (0.3 + pulse * 0.2)), 24), 0.12, IDEAL, 0.32 + pulse * 0.2);
      const d = Math.hypot(p.x - ideal.x, p.y - ideal.y);
      if (d > 2) {
        D.line(p.x, p.y, ideal.x, ideal.y, 0.12, 0.7, IDEAL, 0.14);
        D.line(p.x, p.y, ideal.x, ideal.y, 0.13, 0.2, IDEAL, 0.72, 2.2, now * 2.4);
      }
    }

    // Selection ring under you, in the game's style.
    D.ring(circlePoly(p.x, p.y, 0.95, 24), 0.14, 0.09, IDEAL, 0.85);
    for (const pr of wd.projectiles) {
      if (t >= pr.t1 && t < pr.t1 + 0.6) { const k = (t - pr.t1) / 0.6; D.ring(circlePoly(pr.tx, pr.ty, (pr.splash || 6) * k, 22), 0.1, 0.2, HOT, 1 - k); }
    }
  }

  // ---- portraits: the boss's own model, rendered once and cached as a 2D canvas
  const portraits = new Map();
  const portraitQueue = [];
  function renderPortrait(m, size, artKey) {
    const mem = {};
    m.animate(m.pose, { t: 1.2, dt: 0.016, mem, state: 'grounded', moving: false, cast: null, engaged: false });
    const focusName = m.focusBone || (m.pose.idx('head') >= 0 ? 'head' : m.mouth || 'mouth');
    const client = art.portraitFrame(artKey);
    const focus = client ? client.focus : m.pose.bonePos(focusName, [0, 0, 0]);
    if (m.pose.idx(focusName) < 0) focus[2] = (m.built.maxz || 6) * 0.7;
    const tex = colorTexture(gl, size, size, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    const depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, size, size);
    const fb = targetFor(gl, tex, depth);
    gl.viewport(0, 0, size, size);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); gl.depthMask(true);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const dist = client?.distance ?? m.portraitDist ?? Math.max(2.4, (m.built.maxz || 6) * 0.42);
    const eye = [focus[0] + dist * 0.92, focus[1] - dist * 0.42, focus[2] + dist * 0.08];
    perspective(0.62, 1, 0.1, 400, proj); lookAt(eye, [focus[0], focus[1], focus[2] - dist * 0.04], [0, 0, 1], viewM); mul4(proj, viewM, VP);
    lightN = 0;
    const th = { ambUp: [0.42, 0.4, 0.44], ambDown: [0.14, 0.11, 0.12], key: [0.7, -0.5, 0.75], keyCol: [1.15, 1.02, 0.9], fog: [0, 0, 0], fogD: 0 };
    gl.useProgram(P.lit.p);
    gl.uniformMatrix4fv(P.lit.u.uVP, false, VP);
    const prevFog = fogScale; fogScale = 0; setCommon(P.lit, eye, 1.2, th); fogScale = prevFog;
    emissiveScale = 0.2;
    setMat({ ...m.mat, cracks: m.mat.cracks * 0.4 });
    emissiveScale = 1;
    placement(0, 0, 0, 0, 1, FIXED);
    art.begin(VP, eye, 1.2, th);
    if (!client || !drawArt(artKey, FIXED, 1.2)) drawMesh(m.mesh, m.pose.matrices, FIXED);
    const raw = new Float32Array(size * size * 4);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, raw);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb); gl.deleteRenderbuffer(depth); gl.deleteTexture(tex);
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx2 = c.getContext('2d'), img = ctx2.createImageData(size, size);
    // The same filmic curve as the world, so glowing bosses keep their detail.
    // Auto-exposure: a burning elemental and a black dragon should both show a readable face.
    let lum = 0, cnt = 0;
    for (let i = 0; i < raw.length; i += 4) if (raw[i + 3] > 0.5) { lum += Math.log(1e-4 + 0.3 * raw[i] + 0.59 * raw[i + 1] + 0.11 * raw[i + 2]); cnt++; }
    const key = Math.max(0.5, Math.min(1.5, 0.2 / Math.exp(lum / Math.max(1, cnt))));
    const aces = (v) => { const x = v * key; return Math.max(0, Math.min(1, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14))); };
    for (let y = 0; y < size; y++) for (let x = 0; x < size * 4; x++) {
      const v = raw[(size - 1 - y) * size * 4 + x];
      img.data[y * size * 4 + x] = x % 4 === 3 ? Math.min(255, v * 255) : Math.pow(aces(v), 1 / 2.2) * 255;
    }
    ctx2.putImageData(img, 0, 0);
    return c;
  }
  function portrait(raidId, bossId, size = 128) {
    const key = `${raidId}/${bossId}/${size}`;
    if (portraits.has(key)) return portraits.get(key);
    if (!portraitQueue.some((q) => q.key === key)) portraitQueue.push({ key, size, artKey: bossId, model: () => model(`boss:${raidId}/${bossId}`, () => makeBossModel(raidId, bossId)) });
    return null;
  }
  function playerPortrait(role, size = 128) {
    const key = `player:${role}/${size}`;
    if (portraits.has(key)) return portraits.get(key);
    if (!portraitQueue.some((q) => q.key === key)) {
      portraitQueue.push({ key, size, artKey: role === 'healer' || role === 'ranged' ? 'caster' : role === 'melee' ? 'rogue' : 'tank', model: () => {
        const m = model(`player:${role}`, () => ({ built: buildFigure({ ...playerLook(role), cell: 0.045 }), mat: MAT_FIGURE }));
        return { ...m, animate: (p) => animateFigure(p, { t: 1.2, moving: false, phase: 0 }), focusBone: 'head', portraitDist: 1.05 };
      } });
    }
    return null;
  }
  /** Build at most one queued portrait, so a menu of bosses never stalls a frame for long. */
  function pumpPortraits() {
    const q = portraitQueue.shift();
    if (!q) return false;
    try { portraits.set(q.key, renderPortrait(q.model(), q.size, q.artKey)); } catch (e) { portraits.set(q.key, null); console.warn('portrait failed', q.key, e); }
    return true;
  }

  /** Height of the top of the current boss in world yards, for its name plate. */
  function bossTop(view) {
    if (!E || !E.bossM) return null;
    return (view.world.boss.z || 0) + E.bossM.built.maxz * E.bossM.scale;
  }

  const bossStaysVisible = () => !!(E && E.bossM && E.bossM.staysVisible);

  return { canvas, draw, setEncounter, gl, portrait, playerPortrait, pumpPortraits, bossTop, bossStaysVisible, artReady: () => E?.artReady || Promise.resolve() };
}
