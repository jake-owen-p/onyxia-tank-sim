// Local, converted client art. Loading is lazy; the procedural renderer remains
// available while downloads finish or when an encounter has no imported model.
import { program } from './glutil.js';
import { assetVS, assetFS } from './shaders.js';
import { AssetPose, posedBounds } from './asset-pose.js';
import { mul4, placement } from './math.js';

const ROOT = new URL('../../../assets/wow/', import.meta.url);
export const artManifest = typeof window === 'undefined' ? Promise.resolve(null) : fetch(new URL('manifest.json', ROOT)).then(r => { if (!r.ok) throw new Error('Art manifest unavailable'); return r.json(); }).catch(error => { console.warn(error); return null; });
export const artURL = path => new URL(path, ROOT).href;

export function createAssetRenderer(gl, setCommon, onLoad = () => {}) {
  const p = program(gl, assetVS, assetFS, 'client art');
  const models = new Map(), textures = new Map(), loading = new Map();
  let manifest, vp, eye, now, theme;
  artManifest.then(m => { manifest = m; });
  async function texture(path, repeat = false) {
    const key = `${path}:${repeat}`;
    if (!textures.has(key)) textures.set(key, (async () => {
      const image = new Image(); image.src = artURL(path); await image.decode();
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      for (const axis of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, axis, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      return tex;
    })());
    return textures.get(key);
  }
  function request(key) {
    if (models.has(key) || !manifest?.models[key]) return loading.get(key);
    models.set(key, null);
    const config = manifest.models[key];
    const task = (async () => {
      const [mr, br] = await Promise.all([fetch(artURL(config.model)), fetch(artURL(config.model.replace('.json', '.bin')))]);
      if (!mr.ok || !br.ok) throw new Error(`Missing art: ${key}`);
      const [meta, binary] = await Promise.all([mr.json(), br.arrayBuffer()]);
      const images = await Promise.all(meta.textures.map(t => t.image ? texture(t.image, !!(t.flags & 3)) : null));
      const view = new DataView(binary), count = view.getUint32(0, true), offset = 4 + count * 40;
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const vertices = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
      gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(binary, 4, count * 40), gl.STATIC_DRAW);
      for (const [i,n,type,normalized,off] of [[0,3,gl.FLOAT,false,0],[1,4,gl.UNSIGNED_BYTE,true,12],[2,4,gl.UNSIGNED_BYTE,false,16],[3,3,gl.FLOAT,false,20],[4,2,gl.FLOAT,false,32]]) {
        gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i,n,type,normalized,40,off);
      }
      const indices = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(binary, offset + 4, view.getUint32(offset,true)), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      const pose = new AssetPose(meta), skeleton = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,skeleton);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,4,Math.max(1,meta.bones.length),0,gl.RGBA,gl.FLOAT,pose.matrices);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      const bounds = posedBounds(meta, binary, pose.evaluate(0, {}));
      models.set(key,{meta,config,images,vao,pose,skeleton,bounds});
      onLoad(key);
      await Promise.all((config.equipment || []).map(item => request(item.model)));
    })().catch(error => console.warn(`Unable to load ${key}; using built-in art.`,error));
    loading.set(key, task);
    return task;
  }
  const scaled = new Float32Array(16);
  function drawModel(m, M, time, state, fade, flash) {
    gl.useProgram(p.p); gl.uniformMatrix4fv(p.u.uVP,false,vp); setCommon(p,eye,now,theme);
    gl.uniformMatrix4fv(p.u.uModel,false,M); gl.uniform1f(p.u.uFade,fade); gl.uniform1f(p.u.uFlash,flash);
    m.pose.evaluate(time,state);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,m.skeleton);
    gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,4,Math.max(1,m.meta.bones.length),gl.RGBA,gl.FLOAT,m.pose.matrices);
    gl.uniform1i(p.u.uBones,1); gl.uniform1i(p.u.uTex,0); gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(m.vao);
    for (const b of m.meta.batches) {
      if (b.flags & 4) gl.disable(gl.CULL_FACE); else gl.enable(gl.CULL_FACE);
      gl.uniform1i(p.u.uUnlit,b.flags & 1 ? 1 : 0); gl.uniform1i(p.u.uBlend,b.blend);
      gl.uniform1i(p.u.uEnvironment,b.environment ? 1 : 0);
      if (b.blend >= 2) {
        gl.enable(gl.BLEND); gl.depthMask(false);
        if (b.blend === 3) gl.blendFunc(gl.ONE,gl.ONE);
        else if (b.blend === 4) gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        else if (b.blend === 5) gl.blendFunc(gl.DST_COLOR,gl.ZERO);
        else if (b.blend === 6) gl.blendFunc(gl.DST_COLOR,gl.SRC_COLOR);
        else gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      }
      else { gl.disable(gl.BLEND); gl.depthMask(true); }
      gl.bindTexture(gl.TEXTURE_2D,m.images[b.texture]);
      gl.drawElements(gl.TRIANGLES,b.count,gl.UNSIGNED_SHORT,b.start*2);
    }
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
  }
  return {
    begin(VP, camera, clock, th) { vp=VP; eye=camera; now=clock; theme=th; },
    preload(keys) { return artManifest.then(() => Promise.all(keys.map(request))); },
    async surface(key) { const m=await artManifest; return m?.surfaces[key] ? texture(m.surfaces[key],true) : null; },
    portraitFrame(key) {
      request(key); const m=models.get(key); if (!m) return null;
      m.pose.evaluate(1.2,{});
      const at=m.meta.attachments[17] || m.meta.attachments[20];
      const height=m.bounds[1][2]-m.bounds[0][2];
      let focus=[0,0,m.bounds[0][2]+height*.78];
      if (at) { const b=m.pose.bones[at.bone], [x,y,z]=at.position; focus=[0,1,2].map(i=>b[i]*x+b[i+4]*y+b[i+8]*z+b[i+12]); }
      return { focus, distance: Math.max(.95,height*.4) };
    },
    draw(key,M,time,state={},fade=1,flash=0,height=0) {
      request(key); const m=models.get(key); if (!m) return false;
      scaled.set(M);
      const scale = height ? height / Math.max(.01,m.bounds[1][2]-m.bounds[0][2]) : m.config.scale;
      for (let i=0;i<12;i++) scaled[i]*=scale;
      if (m.config.flipZ) for (let i=4;i<12;i++) scaled[i]*=-1;
      if (state.prop) scaled[14] += (m.config.flipZ ? m.bounds[1][2] : -m.bounds[0][2]) * scale;
      drawModel(m,scaled,time,state,fade,flash);
      // Attach equipment in the animated character's coordinate system.
      for (const item of m.config.equipment || []) {
        const child=models.get(item.model), at=m.meta.attachments[item.attachment];
        if (!child || !at) continue;
        const offset=placement(...at.position,0,1,new Float32Array(16));
        const local=mul4(m.pose.bones[at.bone],offset,new Float32Array(16));
        const world=mul4(scaled,local,new Float32Array(16));
        drawModel(child,world,time,{},fade,flash);
      }
      return true;
    },
  };
}
