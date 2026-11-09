// Ahn'Qiraj, Ruins and Temple, modelled from screenshots of the instance.
//  Crawlers: Kurinnaxx (scorpion-tailed, tiger-striped) and Fankriss (flame-marked, moustached).
//  Domed beetles: Buru and the Bug Trio.  Wasps: Ayamiss and Huhuran.
//  Qiraji: Rajaxx, Ossirian, Skeram on his insect legs, Sartura, the two Emperors.
//  One of a kind: Moam the obsidian sphinx, Viscidus the slime and skull, Ouro the worm, C'Thun.

import { ModelBuilder } from '../model.js';
import { animateBiped, bipedRig, SIDES } from './biped.js';

// ---- small maths, in the same conventions as the rest of the renderer
const hexc = (c) => (Array.isArray(c) ? c : [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255]);
const mix = (a, b, k) => { const A = hexc(a), B = hexc(b); return [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
const fract = (x) => x - Math.floor(x);
const PI = Math.PI;
const bez = (a, c, b, t) => { const s = 1 - t; return [s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1], s * s * a[2] + 2 * s * t * c[2] + t * t * b[2]]; };
const bezN = (a, c, b, n) => Array.from({ length: n + 1 }, (_, i) => bez(a, c, b, i / n));
const toWorld = (M, p) => [M[0] * p[0] + M[4] * p[1] + M[12], M[1] * p[0] + M[5] * p[1] + M[13], M[10] * p[2] + M[14]];
const memo = (fn) => { let v; return () => (v ??= fn()); };

const hash3 = (i, j, k) => fract(Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453);
/** Smooth value noise in 0..1, for paint marks that should look hand-laid rather than ruled. */
function noise3(x, y, z) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
  const u = x - i, v = y - j, w = z - k;
  const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), sw = w * w * (3 - 2 * w);
  const c = (a, b, d) => hash3(i + a, j + b, k + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), su), lerp(c(0, 1, 0), c(1, 1, 0), su), sv), lerp(lerp(c(0, 0, 1), c(1, 0, 1), su), lerp(c(0, 1, 1), c(1, 1, 1), su), sv), sw);
}

/**
 * A curved plate of hard geometry, painted cell by cell so marks stay crisp at
 * any mesh resolution. pos(u, v) gives the point, col(u, v) the colour of the
 * cell around it; both faces are emitted because models are back-face culled.
 */
function patch(m, bone, nu, nv, pos, col, o = {}) {
  const b = m.b(bone), E = 0.003;
  const nrm = (u, v) => {
    const a = pos(Math.min(1, u + E), v), a2 = pos(Math.max(0, u - E), v), c = pos(u, Math.min(1, v + E)), c2 = pos(u, Math.max(0, v - E));
    const ux = a[0] - a2[0], uy = a[1] - a2[1], uz = a[2] - a2[2], vx = c[0] - c2[0], vy = c[1] - c2[1], vz = c[2] - c2[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  };
  const neg = (n) => [-n[0], -n[1], -n[2]];
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
      const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2, c = hexc(col(uc, vc)), em = typeof o.em === 'function' ? o.em(uc, vc) : (o.em || 0);
      const P = [pos(u0, v0), pos(u1, v0), pos(u1, v1), pos(u0, v1)], N = [nrm(u0, v0), nrm(u1, v0), nrm(u1, v1), nrm(u0, v1)];
      const a = m._vert(P[0], N[0], c, em, b), b1 = m._vert(P[1], N[1], c, em, b), c1 = m._vert(P[2], N[2], c, em, b), d = m._vert(P[3], N[3], c, em, b);
      m.i.push(a, b1, c1, a, c1, d);
      const a2 = m._vert(P[0], neg(N[0]), c, em, b), b2 = m._vert(P[1], neg(N[1]), c, em, b), c2 = m._vert(P[2], neg(N[2]), c, em, b), d2 = m._vert(P[3], neg(N[3]), c, em, b);
      m.i.push(a2, c2, b2, a2, d2, c2);
    }
  }
}

/** Saw teeth along a plate's edge from A to B, pointing along `drop`: the ragged hem silithid plates have. */
function serrate(m, bone, A, B, n, drop, color) {
  for (let i = 0; i < n; i++) {
    const a = bez(A, A, B, i / n), b = bez(A, A, B, (i + 1) / n);
    const midK = 0.3 + 0.4 * ((i * 7) % 3) / 2, tip = [lerp(a[0], b[0], midK) + drop[0], lerp(a[1], b[1], midK) + drop[1], lerp(a[2], b[2], midK) + drop[2]];
    m.tri(a, tip, b, color, 0, [bone], true);
  }
}

/** A long curved blade: a tube through a quadratic curve, fat at the root and sharp at the tip. */
function blade(m, bone, a, ctrl, b, r, colA, colB, o = {}) {
  const n = o.n ?? 6, pts = bezN(a, ctrl, b, n);
  const radii = pts.map((_, i) => { const k = i / n; return Math.max(0.01, r * (o.fat ? Math.sin(Math.min(1, k * 1.15 + 0.12) * PI) ** 0.6 : (1 - k) ** (o.pow ?? 0.75))); });
  const cols = pts.map((_, i) => mix(colA, colB, i / n));
  m.tube(bone, pts, radii, cols, { sides: o.sides ?? 5, em: o.em });
}

/** Smoothed easing of a named value held in the frame's memory block. */
const ease = (mem, key, target, dt, rate) => { mem[key] = (mem[key] ?? target) + (target - (mem[key] ?? target)) * Math.min(1, dt * rate); return mem[key]; };

// Insect shell: hand-painted, slightly glossy, no procedural scales or lava cracks.
const shellMat = { noise: 0.2, scales: 0, cracks: 0, rim: 0.34, paintF: 1.1, scaleF: 1, gloss: 0.42, crackF: 1 };
const clothMat = { noise: 0.16, scales: 0, cracks: 0, rim: 0.26, paintF: 2.4, scaleF: 1, gloss: 0.2, crackF: 1 };

// ---- Crawlers: a long low shell of overlapping plates on tall bladed legs.

/**
 * Shared by Kurinnaxx and Fankriss (and their small spawn). o: segs, segLen,
 * width, back (top of shell), depth, frontX, legSegs, knee and foot shape, tail,
 * head kind, colours and mark(i, u, v) which paints one shell plate.
 */
export function buildCrawler(o) {
  const m = new ModelBuilder();
  const C = o.colors, n = o.segs, sl = o.segLen, drop = o.depth, cell = o.cell ?? 0.14;
  const fx = o.frontX, segX = (i) => fx - sl * (i + 0.5);
  const wid = (i) => o.width * lerp(1, o.taper ?? 0.7, Math.max(0, i - 1) / Math.max(1, n - 2)) * (i === 0 ? 0.9 : 1);
  const top = (i) => o.back + (o.arch ?? 0.4) * Math.sin(((i + 0.5) / n) * PI);
  m.bone('root', null, [0, 0, 0]);
  for (let i = 0; i < n; i++) m.bone(`b${i}`, i ? `b${i - 1}` : 'root', [segX(i) + sl / 2, 0, top(i) - drop * 0.5]);
  const hz = top(0) - drop * (o.headDrop ?? 0.5), hx = fx + (o.headLen ?? 1.4);
  m.bone('head', 'b0', [fx, 0, hz]);
  m.bone('jaw', 'head', [hx + 0.2, 0, hz - 0.6]);
  m.bone('mouth', 'head', [hx + 2, 0, hz - 0.8]);
  const femurs = new Set(), tails = new Set();

  // Dark body under the plates, with the ribbed underside showing between the legs.
  for (let i = 0; i < n; i++) {
    m.ell(`b${i}`, [segX(i), 0, top(i) - drop * 0.75], [sl * 0.85, wid(i) * 0.88, drop * 0.82], C.under, { k: 0.5 });
  }
  // Overlapping back plates, each lifting at its rear edge over the next.
  for (let i = 0; i < n; i++) {
    const x0 = fx - sl * i + 0.3, x1 = fx - sl * (i + 1) - 0.42, w0 = wid(i), zt = top(i);
    patch(m, `b${i}`, 14, 26, (u, v) => {
      const av = Math.abs(v), x = lerp(x0, x1, u) - 0.25 * av * av, y = v * w0 * (1.04 - 0.14 * (u - 0.45) * (u - 0.45));
      const h = (1 - av ** 2.4) ** 0.62;
      return [x, y, zt - drop + drop * h + (0.36 * sstep(0.5, 1, u) - 0.3 * (1 - sstep(0, 0.3, u))) * h];
    }, (u, v) => C.mark(i, u, v));
    for (const [, y] of SIDES) serrate(m, `b${i}`, [x0 - 0.2, y * w0 * 1.02, zt - drop + 0.02], [x1, y * w0 * 1.0, zt - drop], 5, [0, y * 0.12, -0.5], C.teeth);
  }

  // Legs: a plated femur rising to the knee, then a long dark blade to the floor.
  (o.legSegs || []).forEach((seg, k) => {
    const x = segX(seg), w = wid(seg), zt = top(seg);
    for (const [s, y] of SIDES) {
      const leg = o.legs[k], hip = [x, y * w * 0.86, zt - drop * 0.55], knee = [x + leg.kneeX, y * (w + leg.kneeOut), leg.kneeZ], foot = [x + leg.footX, y * (w + leg.footOut), 0.08];
      m.bone(`${s}f${k}`, `b${seg}`, hip); m.bone(`${s}t${k}`, `${s}f${k}`, knee);
      femurs.add(m.b(`${s}f${k}`));
      if (o.kite) {
        // A flat diamond plate standing up from the body.
        m.lathe(`${s}f${k}`, hip, knee, [[0.05, 0], [leg.fat * 0.9, 0.2], [leg.fat * 1.25, 0.52], [leg.fat * 0.55, 0.9], [0.1, 1]], C.femur, { sides: 4 });
      } else {
        m.blob(`${s}f${k}`, hip, knee, leg.fat * 0.72, leg.fat, C.femur, { k: 0.22 });
      }
      serrate(m, `${s}f${k}`, lerp3(hip, knee, 0.25), lerp3(hip, knee, 1.02), 5, [0.05, y * 0.1, -0.62], C.teeth);
      m.ball(`${s}t${k}`, knee, leg.fat * 0.55, C.jointCap);
      const ctrl = [lerp(knee[0], foot[0], 0.5) + leg.bendX, lerp(knee[1], foot[1], 0.5) + y * leg.bend, lerp(knee[2], foot[2], 0.5) + leg.bendZ];
      m.tube(`${s}t${k}`, bezN(knee, ctrl, foot, 7), [leg.fat * 1.05, leg.fat * 1.02, leg.fat * 0.9, leg.fat * 0.72, leg.fat * 0.54, leg.fat * 0.34, leg.fat * 0.17, 0.02], [C.blade, C.blade, C.blade, C.blade2, C.blade2, C.blade2, C.blade2, C.blade2], { sides: 6 });
    }
  });

  if (o.head) o.head(m, { hx, hz, top: top(0), fx, drop, C });

  // Tail: a scorpion arch ending in a two-pronged pincer, or a short plated stub.
  if (o.tail) {
    const P = o.tail.pts;
    P.forEach((p, i) => m.bone(`t${i}`, i ? `t${i - 1}` : `b${n - 1}`, p));
    P.forEach((p, i) => { if (i < P.length - 1) { m.blob(`t${i}`, p, P[i + 1], o.tail.r[i], o.tail.r[i + 1], C.tail, { k: 0.12 }); tails.add(m.b(`t${i}`)); } });
    const e = P[P.length - 1], last = `t${P.length - 1}`;
    if (o.tail.pincer) {
      blade(m, last, e, [e[0] - 1.2, 0, e[2] + 1.2], [e[0] - 2.9, 0, e[2] - 0.5], 0.52, C.femur, C.blade2, { n: 6, pow: 0.6 });
      blade(m, last, [e[0], 0, e[2] - 0.2], [e[0] - 0.8, 0, e[2] - 1.5], [e[0] - 2.7, 0, e[2] - 1.5], 0.42, C.femur, C.blade2, { n: 6, pow: 0.6 });
    }
  }

  const built = m.build({
    cell, smooth: 1, ao: 0.95, aoReach: 1,
    paint(v) {
      if (femurs.has(v.bone) && !o.kite) { v.color = mix(C.femur, C.femurLow, sstep(0.3, -0.5, v.nz)); }
      if (tails.has(v.bone) && o.tail.mark) o.tail.mark(v);
    },
  });
  built.legsDef = (o.legSegs || []).map((_, k) => k);
  built.tailN = o.tail ? o.tail.pts.length : 0;
  built.segN = n;
  return built;
}
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

function kurinnaxxHead(m, { hx, hz, C }) {
  // Orange wedge of a head, round red eye with a black pupil, grey parrot beak, pincer arms.
  m.ell('head', [hx - 0.3, 0, hz + 0.1], [2.1, 2, 1.65], C.femur, { k: 0.5 });
  m.ell('head', [hx + 0.85, 0, hz + 0.2], [1.3, 1.45, 1.15], C.head, { k: 0.4 });
  for (const [s, y] of SIDES) {
    m.ball('head', [hx + 0.72, y * 1.55, hz + 0.72], 0.4, '#c8341c', { em: 0.35 });
    m.ball('head', [hx + 0.98, y * 1.72, hz + 0.78], 0.2, '#0c0a10', {});
    m.bone(`${s}arm`, 'head', [hx + 0.2, y * 1.5, hz - 0.5]);
    m.tube(`${s}arm`, bezN([hx + 0.2, y * 1.55, hz - 0.5], [hx + 2.3, y * 3, hz - 0.8], [hx + 3.1, y * 1.05, 0.25], 6), [0.5, 0.62, 0.58, 0.45, 0.32, 0.18, 0.03], [C.femur, C.femur, C.femur, C.femurLow, C.femurLow, C.blade, C.blade2], { sides: 6 });
  }
  blade(m, 'jaw', [hx + 1.4, 0, hz + 0.3], [hx + 3.6, 0, hz + 0.2], [hx + 2.6, 0, hz - 4.2], 1.05, '#35343c', '#141319', { n: 7, pow: 0.62, sides: 7 });
  blade(m, 'jaw', [hx + 1.1, 0, hz - 0.6], [hx + 2.4, 0, hz - 1.3], [hx + 1.9, 0, hz - 3.3], 0.6, '#28272e', '#101015', { n: 5, sides: 6 });
}

function fankrissHead(m, { hx, hz, C }) {
  // Broad yellow head, two black bead eyes and three dots, and the great ribbed dark moustache.
  m.ell('head', [hx - 0.15, 0, hz + 0.35], [2.1, 2.5, 1.7], C.head, { k: 0.55 });
  m.ell('head', [hx + 0.85, 0, hz + 0.4], [1.3, 2.05, 1.15], C.head, { k: 0.5 });
  for (const [s, y] of SIDES) {
    m.ball('head', [hx + 1.55, y * 1.18, hz + 0.95], 0.56, '#7a2614', {});
    m.ball('head', [hx + 1.82, y * 1.28, hz + 1.03], 0.42, '#08070a', {});
    m.ball('head', [hx + 2.1, y * 1.3, hz + 1.16], 0.1, '#aaaaaa', { em: 0.6, sides: 5, rings: 3 });
    m.bone(`${s}arm`, 'head', [hx + 0.3, y * 2.1, hz - 0.4]);
    m.blob(`${s}arm`, [hx + 0.3, y * 2.1, hz - 0.3], [hx + 1.9, y * 3.7, hz - 1.3], 0.9, 0.62, C.femur, { k: 0.3 });
    m.blob(`${s}arm`, [hx + 1.9, y * 3.7, hz - 1.3], [hx + 3.2, y * 3.2, 0.5], 0.62, 0.34, C.femurLow, { k: 0.2 });
    m.spike(`${s}arm`, [hx + 3.15, y * 3.15, 0.75], [hx + 3.9, y * 2.9, 0.02], 0.34, C.blade2, { bend: [0.1, 0, -0.1], sides: 5 });
    serrate(m, `${s}arm`, [hx + 0.9, y * 2.7, hz - 0.95], [hx + 2.6, y * 3.55, hz - 1.5], 4, [0, 0, -0.42], C.teeth);
  }
  for (const [x, y] of [[0, 0.32], [0, -0.32], [0.05, 0]]) m.ball('head', [hx + 1.82 + x, y, hz + 1.62 - Math.abs(y) * 0.3], 0.1, '#1a1210', { sides: 5, rings: 3 });
  // Moustache: two heavy lobes hanging from under the eyes.
  for (const [, y] of SIDES) {
    m.blob('jaw', [hx + 1.95, y * 0.62, hz + 0.75], [hx + 2.55, y * 0.82, hz - 1.45], 0.62, 1.12, '#2a2622', { k: 0.15 });
    m.blob('jaw', [hx + 2.5, y * 0.82, hz - 1.4], [hx + 2.3, y * 0.74, hz - 2.75], 1.1, 0.68, '#1f1c1a', { k: 0.15 });
  }
  m.cut([hx + 3.6, 0, hz + 0.6], [hx + 3.6, 0, hz - 3.2], 0.13, 0.17, { k: 0.08 });
}

export function animateCrawler(p, s) {
  p.reset();
  const m = s.mem, t = s.t, B = p.built;
  const walk = ease(m, 'walk', s.moving ? 1 : 0, s.dt, 7), c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 7);
  const br = Math.sin(t * 1.5) * 0.02;
  p.r('b0', 0, br - 0.14 * c, 0.04 * Math.sin(t * 0.7));
  p.r('head', 0, 0.05 * Math.sin(t * 1.1) - 0.2 * c, 0.1 * Math.sin(t * 0.6));
  p.r('jaw', 0, 0.08 * Math.sin(t * 2.3) + 0.5 * c, 0);
  for (let i = 1; i < B.segN; i++) p.r(`b${i}`, 0, 0, 0.018 * Math.sin(t * 1.4 + i * 0.7));
  for (let i = 0; i < B.tailN; i++) p.r(`t${i}`, 0, -0.04 * Math.sin(t * 1.3 + i * 0.6) - 0.05 * c, 0.05 * Math.sin(t * 0.9 + i * 0.5));
  for (const [sd, y] of SIDES) {
    p.r(`${sd}arm`, 0, 0.1 * Math.sin(t * 1.6 + y) - 0.4 * c, y * 0.08 * Math.sin(t * 2.1));
    for (const k of B.legsDef) {
      const ph = t * 8 + k * 2.1 + (y > 0 ? 0 : PI);
      if (walk > 0.01) p.r(`${sd}f${k}`, y * 0.16 * Math.max(0, Math.sin(ph)) * walk, 0, -y * 0.28 * Math.cos(ph) * walk);
      p.r(`${sd}t${k}`, y * 0.03 * Math.sin(t * 1.2 + k), 0, 0);
    }
  }
  p.evaluate();
}

const ORANGE = '#c96a10', KGOLD = '#d5941e', KRED = '#86260e', PLUM = '#1d1026';
const buildKurinnaxx = () => buildCrawler({
  segs: 8, segLen: 2.25, width: 4, taper: 0.55, back: 6.2, depth: 2.9, frontX: 8.2, arch: 0.75, headDrop: 0.62, headLen: 1.1, cell: 0.14, kite: true,
  legSegs: [1, 3, 5],
  legs: [
    { kneeX: 1.3, kneeOut: 2.1, kneeZ: 9.2, footX: 4.8, footOut: 5.6, bendX: 1, bend: 0.5, bendZ: 2.6, fat: 1.15 },
    { kneeX: 0.3, kneeOut: 1.9, kneeZ: 10.4, footX: 0.6, footOut: 6.5, bendX: 0.3, bend: 0.8, bendZ: 2.8, fat: 1.3 },
    { kneeX: -1.1, kneeOut: 1.8, kneeZ: 8.6, footX: -4.6, footOut: 5.4, bendX: -1, bend: 0.5, bendZ: 2.3, fat: 1.1 },
  ],
  head: kurinnaxxHead,
  tail: {
    pts: [[-10.4, 0, 6.1], [-13, 0, 7.5], [-15.6, 0, 8.3], [-18.2, 0, 8.5], [-20.6, 0, 7.8], [-22.5, 0, 6.5]],
    r: [2.05, 1.7, 1.35, 1.05, 0.8, 0.55],
    pincer: true,
    mark(v) { const b = fract(v.x * 0.62) < 0.36 && v.nz > 0.15 && Math.abs(v.ny) < 0.8; const c = b ? hexc(PLUM) : mix(v.nz > 0.2 ? ORANGE : KRED, KRED, sstep(0.1, -0.8, v.nz)); v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2]; },
  },
  colors: {
    under: '#2e2228', femur: KGOLD, femurLow: KRED, head: '#cf7712', teeth: '#a4400f', jointCap: '#3a1826', blade: '#2c1f35', blade2: '#17101f', tail: ORANGE,
    mark(i, u, v) {
      const av = Math.abs(v);
      let c = mix(KGOLD, ORANGE, sstep(0.05, 0.6, av)); c = mix(c, KRED, sstep(0.68, 1, av));
      const n = noise3(i * 3.1, u * 3, av * 4);
      // Slanting tiger bars running back from the spine, wider near the middle of the body.
      const bar = fract(u * 1.45 - av * 1.2 + i * 0.41 + n * 0.28);
      const reach = 0.98 - 0.3 * Math.abs(i - 3) / 4;
      const dark = bar < 0.44 && av < reach && av > 0.06;
      const spine = av < 0.09 + 0.12 * (1 - u);
      const speck = n > 0.7 && av > 0.74 && fract(u * 5 + i) < 0.5;
      if (dark || spine) return mix(PLUM, '#3a2240', n * 0.6);
      if (speck) return mix(c, PLUM, 0.7);
      return c;
    },
  },
});

const FYEL = '#d8a820', FORG = '#c98218', FRED = '#b01c10';
const buildFankriss = () => buildCrawler({
  segs: 6, segLen: 3, width: 5.1, taper: 0.62, back: 5.8, depth: 2.9, frontX: 8.4, arch: 0.5, headDrop: 0.5, headLen: 1.4, cell: 0.14,
  legSegs: [0, 2, 4],
  legs: [
    { kneeX: 1.3, kneeOut: 3.3, kneeZ: 6.3, footX: 5.6, footOut: 6.8, bendX: 1.5, bend: 0.5, bendZ: 2.5, fat: 1.35 },
    { kneeX: 0.4, kneeOut: 3.6, kneeZ: 6.7, footX: 0.7, footOut: 8, bendX: 0.3, bend: 1, bendZ: 2.8, fat: 1.45 },
    { kneeX: -1, kneeOut: 3.2, kneeZ: 6.1, footX: -5, footOut: 6.8, bendX: -1.3, bend: 0.8, bendZ: 2.5, fat: 1.3 },
  ],
  head: fankrissHead,
  tail: { pts: [[-9.6, 0, 5.1], [-11.4, 0, 4.6], [-12.8, 0, 4]], r: [2, 1.4, 0.7], pincer: false },
  colors: {
    under: '#3a3026', femur: FYEL, femurLow: '#b83a1c', head: '#d8aa22', teeth: '#8c1d14', jointCap: '#3a0d10', blade: '#6e1218', blade2: '#250a10', tail: FORG,
    mark(i, u, v) {
      const av = Math.abs(v), n = noise3(i * 2.3, u * 3.4, av * 3.2);
      let c = mix(FYEL, FORG, sstep(0.45, 0.92, av)); c = mix(c, '#b4411a', sstep(0.86, 1, av));
      // A red flame running down the spine with licks thrown sideways.
      const core = av < 0.34 * (1 - 0.75 * u) + 0.05 + 0.05 * Math.sin(u * 9 + i);
      const lick = fract(u * 1.7 + av * 1.6 + n * 0.3 + i * 0.33);
      const flame = lick < 0.3 && av > 0.1 && av < 0.8 - 0.25 * u;
      if (core) return mix('#b4140c', '#d8280f', n);
      if (flame) return mix('#c8200e', '#ea5a16', n * 0.8);
      return c;
    },
  },
});

// ---- Domed beetles: a tall ogive shell, a low head with a long proboscis, blade flanges and bladed legs.

/**
 * Adds one beetle to a builder at [ox, oy] and scale s, every bone named with
 * `pre` so three of them can share a mesh. Returns the bones its paint needs.
 */
function addBeetle(m, pre, ox, oy, s, o) {
  const C = o.colors;
  const P = (x, y, z) => [ox + x * s, oy + y * s, z * s];
  const R = (r) => r * s;
  m.bone(`${pre}root`, 'root', P(0, 0, 0));
  m.bone(`${pre}body`, `${pre}root`, P(-1, 0, 5));
  m.bone(`${pre}collar`, `${pre}body`, P(2.8, 0, 4.4));
  m.bone(`${pre}head`, `${pre}collar`, P(4.6, 0, 3.1));
  m.bone(`${pre}prob`, `${pre}head`, P(6.2, 0, 2.9));
  const reg = { pre, ox, oy, s, o, body: m.b(`${pre}body`), collar: m.b(`${pre}collar`), head: m.b(`${pre}head`), femurs: new Set() };

  // The dome and its peak, sliced down the middle into two wing-cases.
  const domeZ = 7.4, domeH = o.domeH ?? 5.6, topZ = domeZ + domeH * 0.55;
  m.ell(`${pre}body`, P(-1.2, 0, domeZ), [R(5.4), R(o.domeW ?? 5), R(domeH)], C.shell, { k: R(0.7) });
  m.blob(`${pre}body`, P(-1.2, 0, topZ), P(-1.7, 0, (domeZ + domeH + 1.2) * (o.peak ?? 1)), R(3.1), R(0.8), C.shell, { k: R(1.2) });
  m.ell(`${pre}body`, P(-1.2, 0, 3.6), [R(4.6), R(4.3), R(2.6)], C.shell2, { k: R(0.8) });
  for (let i = 0; i < 9; i++) {
    const x = -6.2 + i * 1.05, z = domeZ + domeH * Math.sqrt(Math.max(0, 1 - ((x + 1.2) / 5.4) ** 2)) * 1.02 + Math.max(0, 2.5 - Math.abs(x + 1.7) * 0.9) * (o.peak ?? 1) * 0.72;
    if (x > -5.1 && x < 1.2) continue;   // the painted seam carries the crown; a groove there leaves pits
    m.cut(P(x, 0, z + 0.05), P(x + 1.05, 0, z + 0.05), R(0.26), R(0.26), { k: R(0.12) });
  }
  // Pronotum, head and belly.
  m.ell(`${pre}collar`, P(3, 0, 4.7), [R(2.4), R(3.7), R(2.7)], C.collar, { k: R(0.5) });
  m.ell(`${pre}collar`, P(2.2, 0, 2.4), [R(3.3), R(3.3), R(2.2)], C.belly, { k: R(0.7) });
  m.ell(`${pre}head`, P(5.4, 0, 3.1), [R(1.8), R(1.75), R(1.4)], C.head, { k: R(0.4) });
  for (const y of [1, -1]) {
    m.ball(`${pre}head`, P(6.3, y * 1.2, 3.75), R(0.42), C.eye, { em: o.eyeEm ?? 0.6 });
    m.ball(`${pre}head`, P(6.55, y * 1.32, 3.86), R(0.2), '#07060a', {});
  }
  // Long proboscis and two tusks curling in beneath it.
  blade(m, `${pre}prob`, P(6.3, 0, 2.7), P(9, 0, 2.5), P(11, 0, 0.5), R(0.72), C.head, C.tip, { n: 8, pow: 0.7, sides: 7 });
  for (const y of [1, -1]) {
    blade(m, `${pre}prob`, P(6.1, y * 1.05, 2.5), P(7.9, y * 2, 1.7), P(7.9, y * 0.5, 0.25), R(0.45), C.tusk, C.tip, { n: 6, pow: 0.7 });
  }

  // Blade flanges sweeping from the top of the shell down past the head.
  for (const [, y] of SIDES) {
    const a = o.flangeRear ?? [-6.8, 3.3, 10.8], c = o.flangeCtrl ?? [2, 7.8, 5.9], b = o.flangeTip ?? [9.5, 2.8, 1.5];
    const A = P(a[0], y * a[1], a[2]), B = P(b[0], y * b[1], b[2]), Cc = P(c[0], y * c[1], c[2]);
    const W = R(o.flangeW ?? 1.35);
    patch(m, `${pre}body`, 34, 6, (u, v) => {
      const p = bez(A, Cc, B, u), w = W * Math.sin(PI * Math.min(1, u * 0.96 + 0.02)) ** 0.75;
      return [p[0] + v * w * 0.28, p[1] + v * w * 0.55 * y, p[2] + v * w];
    }, (u, v) => { const av = Math.abs(v - 0.5) * 2; return av > 0.74 ? C.flangeEdge : mix(C.flange, C.flangeEdge, 0.25 + 0.5 * Math.abs(Math.sin(u * 22)) * 0.35); });
    if (o.flangeExtra) {
      // Buru carries a second, lower pair of long red blades.
      patch(m, `${pre}body`, 28, 5, (u, v) => {
        const p = bez(P(-3.5, y * 4.4, 4), P(-7, y * 9.5, 5.6), P(-12.5, y * 8.8, 8.6), u), w = R(1.15) * Math.sin(PI * Math.min(1, u * 0.96 + 0.03)) ** 0.8;
        return [p[0] + v * w * 0.4, p[1] + v * w * 0.45 * y, p[2] + v * w];
      }, (u, v) => { const av = Math.abs(v - 0.5) * 2; return av > 0.72 ? C.flangeEdge : mix(C.flange, C.flangeEdge, 0.2 + u * 0.3); });
    }
  }

  // Three pairs of legs: short serrated femur, long dark curved blade.
  const LEG = o.legs ?? [
    { h: [3.8, 3, 2.7], k: [5.9, 5.6, 3.1], f: [7.9, 7, 0.06], fat: 1.25, c: [1.1, 0.4, 1.8] },
    { h: [0, 4, 3.1], k: [0.5, 7, 3.6], f: [1.4, 9.4, 0.06], fat: 1.4, c: [0.3, 0.8, 2.2] },
    { h: [-3.5, 3.8, 3.3], k: [-5.2, 6.4, 3.5], f: [-7.4, 7.8, 0.06], fat: 1.3, c: [-0.9, 0.6, 2.1] },
  ];
  LEG.forEach((L, k) => {
    for (const [sd, y] of SIDES) {
      const hip = P(L.h[0], y * L.h[1], L.h[2]), knee = P(L.k[0], y * L.k[1], L.k[2]), foot = P(L.f[0], y * L.f[1], L.f[2]);
      m.bone(`${pre}${sd}f${k}`, k === 0 ? `${pre}collar` : `${pre}body`, hip);
      m.bone(`${pre}${sd}t${k}`, `${pre}${sd}f${k}`, knee);
      m.blob(`${pre}${sd}f${k}`, hip, knee, R(L.fat * 0.7), R(L.fat), C.femur, { k: R(0.28) });
      reg.femurs.add(m.b(`${pre}${sd}f${k}`));
      serrate(m, `${pre}${sd}f${k}`, lerp3(hip, knee, 0.25), lerp3(hip, knee, 1), 5, [0.04 * s, y * 0.1 * s, -0.66 * s], C.teeth);
      m.ball(`${pre}${sd}t${k}`, knee, R(L.fat * 0.62), C.jointCap);
      if (o.spines) for (let i = 0; i < 3; i++) { const a = lerp3(hip, knee, 0.3 + i * 0.26); m.spike(`${pre}${sd}f${k}`, a, [a[0] + 0.15 * s, a[1] + y * 0.2 * s, a[2] + R(1.05)], R(0.2), C.spine, { sides: 4 }); }
      const ctrl = [lerp(knee[0], foot[0], 0.5) + R(L.c[0]), lerp(knee[1], foot[1], 0.5) + y * R(L.c[1]), lerp(knee[2], foot[2], 0.5) + R(L.c[2])];
      m.tube(`${pre}${sd}t${k}`, bezN(knee, ctrl, foot, 7), [0.9, 0.82, 0.68, 0.54, 0.4, 0.26, 0.13, 0.02].map((v) => R(v * L.fat)), [C.blade, C.blade, C.blade, C.blade2, C.blade2, C.blade2, C.blade2, C.blade2], { sides: 6 });
    }
  });
  return reg;
}

/** Wing-case marks, dark blotches over the shell colour. X, Y, Z are in beetle units. */
function beetlePaint(reg, v) {
  const { ox, oy, s, o } = reg, C = o.colors;
  const X = (v.x - ox) / s, Y = (v.y - oy) / s, Z = v.z / s;
  if (v.bone === reg.body) {
    const ay = Math.abs(Y), n = noise3(X * 0.85 + o.seed, Y * 0.85, Z * 0.85);
    let c = hexc(C.shell);
    c = mix(c, C.shell2, sstep(0.55, -0.1, v.nz));
    if (o.veins) {
      // Buru: red veins over a blue shell, and a red flood across the upper back.
      const wet = noise3(X * 0.28 + 7, Y * 0.28, Z * 0.2 + 4);
      const v1 = Math.abs(noise3(X * 0.42 + 3, Y * 0.42, Z * 0.42) - 0.5), v2 = Math.abs(noise3(X * 0.9 + 9, Y * 0.9, Z * 0.9) - 0.5);
      const vein = Math.min(v1, v2 * 1.4 + 0.02);
      const band = fract(Z * 0.62 + 0.15 * noise3(X, Y, Z)) < 0.1;
      if (band) c = mix(c, '#0e0d3c', 0.45);
      if (vein < 0.034) c = mix(c, C.veins, 1);
      else if (vein < 0.055) c = mix(c, C.veins, 0.5);
      else if (vein < 0.08) c = mix(c, '#100f38', 0.5);
      if (wet > 0.52 && Z > 6.5 && Z < 14.5 && X < 1.5) c = mix(c, C.veins, sstep(0.52, 0.65, wet) * 0.95);
      if (ay < 0.1) c = hexc('#0c0a24');
    } else {
      // Bug Trio: a dark jagged crown and rows of wedge blotches.
      const crown = ay < 0.5 + 0.09 * (Z - 4.5) * (Z - 4.5) * 0.45 + 0.62 * Math.sin(Z * 2.1 + n * 2) && Z > 5.2;
      const wedge = fract(Z * 0.56 + ay * 0.5 + n * 0.45) < 0.34 && ay > 1.4 && ay < 4.05 && Z > 3.6 && Z < 10 && X < 2.6;
      if (crown || wedge) c = mix(C.mark, '#3a2040', n * 0.5);
      if (ay < 0.09) c = hexc('#120a16');
    }
    v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2];
  } else if (v.bone === reg.collar) {
    const up = v.nz > 0.12 && v.nx > -0.3 && Z > 3.5;
    let c = hexc(v.nz > 0.0 ? C.collar : C.belly);
    if (up && o.fineLines) {
      const line = fract(Z * 3.6 + Math.abs(Y) * 0.7 + noise3(X, Y, Z) * 0.7);
      if (line < 0.3 && Math.abs(Y) < 3.3) c = mix(c, C.mark, 0.85);
    }
    v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2];
  } else if (reg.femurs.has(v.bone)) {
    const c = mix(C.femur, C.femurLow, sstep(0.4, -0.55, v.nz));
    v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2];
  }
}

export function buildBeetle(o) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  const reg = addBeetle(m, '', 0, 0, 1, o);
  m.bone('mouth', 'root', [6.6, 0, 3]);
  const built = m.build({ cell: o.cell ?? 0.14, smooth: 1, ao: 0.9, aoReach: 1.2, paint(v) { beetlePaint(reg, v); } });
  built.bugs = [''];
  return built;
}

function poseBug(p, s, pre, off = 0) {
  const t = s.t + off, m = s.mem;
  const walk = ease(m, `walk${pre}`, s.moving ? 1 : 0, s.dt, 7), c = ease(m, `c${pre}`, s.cast ? 1 : 0, s.dt, 7);
  p.r(`${pre}body`, 0, 0.018 * Math.sin(t * 1.4), 0);
  p.r(`${pre}head`, 0, 0.05 * Math.sin(t * 1.1) - 0.3 * c, 0.1 * Math.sin(t * 0.6));
  p.r(`${pre}prob`, 0, 0.06 * Math.sin(t * 1.9) + 0.35 * c, 0);
  for (const [sd, y] of SIDES) {
    for (let k = 0; k < 3; k++) {
      const ph = t * 9 + k * 2.1 + (y > 0 ? 0 : PI);
      if (walk > 0.01) p.r(`${pre}${sd}f${k}`, y * 0.14 * Math.max(0, Math.sin(ph)) * walk, 0, -y * 0.26 * Math.cos(ph) * walk);
      p.r(`${pre}${sd}t${k}`, y * 0.03 * Math.sin(t * 1.3 + k), 0, 0);
    }
  }
}

export function animateBeetle(p, s) { p.reset(); poseBug(p, s, ''); p.evaluate(); }

const buruColors = {
  shell: '#232383', shell2: '#1d1c66', veins: '#d91a0c', collar: '#252689', belly: '#22226e', head: '#1f2072', eye: '#d02012', tip: '#d4190a', tusk: '#d8200c',
  flange: '#c4170a', flangeEdge: '#7a0a08', femur: '#2c2c8a', femurLow: '#201f62', teeth: '#a31208', jointCap: '#141040', blade: '#b41508', blade2: '#c7190a', spine: '#d21a0a', mark: '#101030',
};
const buildBuru = () => buildBeetle({
  seed: 11, veins: true, spines: true, flangeExtra: true, domeW: 5.6, domeH: 6, peak: 0.95, flangeW: 1.85, fineLines: false, eyeEm: 1.4,
  flangeRear: [-7.6, 3.2, 8.2], flangeCtrl: [1.6, 9.4, 4.6], flangeTip: [12.5, 3.2, 1.5],
  colors: buruColors,
  legs: [
    { h: [3.8, 3, 2.7], k: [5.8, 5.4, 2.9], f: [8.1, 6, 0.06], fat: 1.35, c: [1.5, 0.4, 1.3] },
    { h: [0, 3.8, 3], k: [0.5, 6.8, 3], f: [1.4, 8.8, 0.06], fat: 1.45, c: [0.3, 0.8, 1.6] },
    { h: [-3.5, 3.6, 3.2], k: [-5, 6.2, 3], f: [-7.3, 7.6, 0.06], fat: 1.35, c: [-0.9, 0.6, 1.5] },
  ],
});

// The Bug Trio, one mesh so all three can stand together before the pull, as the raid first sees them.
const TRIO = {
  vem: {
    pos: [-3, 14.5], s: 1.12, seed: 2, fineLines: true,
    colors: { shell: '#c56a22', shell2: '#7c3517', mark: '#2c1433', collar: '#c8702a', belly: '#b05e23', head: '#b86c2c', eye: '#150c12', tip: '#7a2a10', tusk: '#e0a56a', flange: '#54213a', flangeEdge: '#2a1022', femur: '#b5531e', femurLow: '#6e2a16', teeth: '#d57a33', jointCap: '#34182a', blade: '#4a2636', blade2: '#1c1020' },
  },
  yauj: {
    pos: [-1.5, -9.5], s: 0.98, seed: 5, fineLines: true,
    colors: { shell: '#2b6aa0', shell2: '#1e8a78', mark: '#26143a', collar: '#256c98', belly: '#27387c', head: '#2c4190', eye: '#11162a', tip: '#14c2a8', tusk: '#2484a4', flange: '#2a2152', flangeEdge: '#1590a0', femur: '#23548e', femurLow: '#172a60', teeth: '#1c8c8c', jointCap: '#191338', blade: '#3a2058', blade2: '#1b1132' },
  },
  kri: {
    pos: [8, 1.5], s: 0.86, seed: 8.5, fineLines: true,
    colors: { shell: '#a43a1c', shell2: '#6c1f16', mark: '#26101e', collar: '#a8401f', belly: '#8e2c1c', head: '#963220', eye: '#150a0e', tip: '#c02818', tusk: '#c43a1c', flange: '#581424', flangeEdge: '#2e0a12', femur: '#8f2c1c', femurLow: '#581818', teeth: '#c0441c', jointCap: '#2a1020', blade: '#4a1a2a', blade2: '#1c0c16' },
  },
};

export function buildBugTrio() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  const regs = [];
  for (const [name, b] of Object.entries(TRIO)) regs.push(addBeetle(m, `${name}_`, b.pos[0], b.pos[1], b.s, b));
  m.bone('mouth', 'root', [6.2, 0, 3]);
  const built = m.build({ cell: 0.17, smooth: 1, ao: 0.9, aoReach: 1.2, paint(v) { for (const r of regs) if (v.bone >= r.body - 1 && v.bone < r.body + 25) beetlePaint(r, v); } });
  built.bugs = Object.keys(TRIO);
  return built;
}

/** Before the pull all three stand together; in the fight only the bug whose phase it is shows, at the origin. */
const trioOrder = ['kri', 'yauj', 'vem'];
function makeBugTrio() {
  const live = { phase: 1, hero: false };
  return {
    built: buildBugTrio(),
    animate: (p, s) => animateTrioOrdered(p, s, live),
    mat: { ...shellMat, gloss: 0.5 }, scale: 0.92, mouth: 'mouth', school: 'poison', height: 12, heroDist: 40,
    fx(P, ctx) { live.phase = ctx.view.phase || 1; live.hero = heroView(ctx); },
  };
}
function animateTrioOrdered(p, s, live) {
  p.reset();
  const solo = s.engaged && !live.hero ? trioOrder[Math.min(2, Math.max(0, (live.phase || 1) - 1))] : null;
  trioOrder.forEach((n, i) => {
    if (solo && n !== solo) { p.s(`${n}_root`, 0.0005); return; }
    poseBug(p, s, `${n}_`, i * 1.7);
    if (solo) { const b = TRIO[n]; p.o(`${n}_root`, -b.pos[0], -b.pos[1], 0); }
  });
  p.evaluate();
}

// ---- Wasps: Ayamiss and Huhuran hang in the air on four veined wings with huge curved scythes.

export function buildWasp(o) {
  const m = new ModelBuilder();
  const Z = o.z, C = o.colors, ab = o.abdomen;
  m.bone('root', null, [0, 0, 0]);
  m.bone('body', 'root', [0, 0, Z]);
  m.bone('head', 'body', [0.8, 0, Z + 1.7]);
  m.bone('mouth', 'head', [2.4, 0, Z + 1.6]);
  m.bone('ab0', 'body', [-0.3, 0, Z - 1.4]);
  m.bone('ab1', 'ab0', [ab[1][0], 0, ab[1][2]]);
  m.bone('ab2', 'ab1', [ab[2][0], 0, ab[2][2]]);

  // Thorax and the plated collar around the neck.
  m.ell('body', [0.1, 0, Z + 0.1], [1.7, 1.95, 1.9], C.thorax, { k: 0.5 });
  m.ell('body', [0.5, 0, Z + 0.7], [1.3, 2.2, 1.05], C.collar, { k: 0.35 });
  for (const [, y] of SIDES) m.ell('body', [0.1, y * 1.55, Z + 0.4], [1.05, 0.95, 1.15], C.thorax2, { k: 0.3 });

  // Abdomen: a long dagger hanging from the waist.
  m.blob('ab0', [ab[0][0], 0, ab[0][2]], [ab[1][0], 0, ab[1][2]], o.abR[0], o.abR[1], C.ab, { k: 0.3 });
  m.blob('ab1', [ab[1][0], 0, ab[1][2]], [ab[2][0], 0, ab[2][2]], o.abR[1], o.abR[2], C.ab, { k: 0.25 });
  m.blob('ab2', [ab[2][0], 0, ab[2][2]], [ab[3][0], 0, ab[3][2]], o.abR[2], 0.14, C.ab2, { k: 0.15 });
  const bones = new Map([[m.b('ab0'), 0], [m.b('ab1'), 1], [m.b('ab2'), 2]]);

  // Head.
  const hz = Z + 2, hx = 1.1;
  m.ell('head', [hx, 0, hz], [1.3, 1.65, 1.2], C.head, { k: 0.4 });
  if (o.mask) o.mask(m, { hx, hz, C });
  for (const [sd, y] of SIDES) {
    // Compound eyes and the mandible.
    m.ell('head', [hx + 0.82, y * 0.92, hz + 0.34], [0.42, 0.4, 0.5], C.eye, { k: 0.05, em: C.eyeEm ?? 0.5 });
    m.spike('head', [hx + 1, y * 0.5, hz - 0.7], [hx + 1.6, y * 0.15, hz - 2], 0.3, C.mand, { bend: [0.3, y * 0.3, 0], sides: 5 });
    // Antenna.
    const a0 = [hx + 0.2, y * 0.45, hz + 1], ac = [hx - 1, y * 3.2, hz + 4.2], a1 = [hx - 1.8, y * 7, hz + 0.7];
    m.tube('head', bezN(a0, ac, a1, 8), [0.14, 0.12, 0.11, 0.1, 0.09, 0.08, 0.06, 0.05, 0.02], C.ant, { sides: 5 });
    // Wings, a pair each side, on their own hinge bones so they can beat.
    const hinge = [-0.3, y * 1.1, Z + 1], lower = [-0.5, y * 1.2, Z + 0.35];
    m.bone(`${sd}wu`, 'body', hinge); m.bone(`${sd}wl`, 'body', lower);
    wing(m, `${sd}wu`, hinge, o.wingU, y, o.paintWing, 1);
    wing(m, `${sd}wl`, lower, o.wingL, y, o.paintWing, 0);

    // Scythes: the huge curved forelimbs that frame the body.
    const sA = [0.5, y * 1.9, Z + 0.9], sB = [o.sc.bx, y * o.sc.by, Z + o.sc.bz], sC = [o.sc.cx, y * o.sc.cy, Z + o.sc.cz], sD = [o.sc.dx, y * o.sc.dy, Z + o.sc.dz];
    m.bone(`${sd}s0`, 'body', sA); m.bone(`${sd}s1`, `${sd}s0`, sB);
    m.tube(`${sd}s0`, bezN(sA, [lerp(sA[0], sB[0], 0.5), y * lerp(sA[1] * y, sB[1] * y, 0.55), lerp(sA[2], sB[2], 0.5) + 1.1], sB, 5), [1, 1.05, 1, 0.9, 0.8, 0.72], C.sc1, { sides: 7 });
    m.tube(`${sd}s1`, [...bezN(sB, sC, sD, 8)], [0.72, 0.68, 0.62, 0.55, 0.47, 0.38, 0.28, 0.16, 0.02], [C.sc1, C.sc1, C.sc1, C.sc2, C.sc2, C.sc2, C.sc3, C.sc3, C.sc4], { sides: 7 });
    if (o.scytheSerrate) serrate(m, `${sd}s0`, [0.2, y * 3.6, Z - 0.3], [1, y * 4.9, Z - 1.5], 4, [0, y * 0.06, -0.6], C.teeth);
    if (o.femurPlates) {
      // Huhuran's serrated leg plates, hanging under the scythes.
      m.ell(`${sd}s0`, [0.5, y * 3.1, Z - 1.3], [0.9, 0.85, 1.65], C.sc1, { k: 0.3 });
      serrate(m, `${sd}s0`, [0.2, y * 2.5, Z - 2.6], [0.9, y * 3.7, Z - 2.7], 5, [0, 0, -0.55], C.teeth);
    }
    // Two thin dark legs each side.
    for (let k = 0; k < 2; k++) {
      const hip = [0.2 - k * 0.7, y * 1.7, Z - 0.9 - k * 0.5], knee = [0.6 - k, y * (4.2 + k * 0.6), Z - 2.4 + k * 0.7], foot = [0.8 - k * 1.6, y * (6.3 + k), Z - 6.2 - k];
      m.bone(`${sd}l${k}`, 'body', hip);
      m.tube(`${sd}l${k}`, [hip, knee, foot], [0.3, 0.2, 0.05], [C.leg, C.leg, C.leg2], { sides: 5 });
    }
  }
  if (o.abdomenPlates) o.abdomenPlates(m, ab);
  const built = m.build({
    cell: 0.1, smooth: 1, ao: 0.8, aoReach: 0.7,
    paint(v) { if (bones.has(v.bone) && o.paintAb) o.paintAb(v); },
  });
  return built;
}

/** One veined wing. spec: tip offset, chord, pow shaping; the painter gets (u along, v across). */
function wing(m, bone, hinge, spec, y, painter, upper) {
  const t = [spec.tip[0], y * spec.tip[1], spec.tip[2]];
  const span = Math.hypot(...t), dir = t.map((v) => v / span);
  // Across the wing: at right angles to the span, tipped a little forward.
  let cx = 0.22, cy = -t[2], cz = t[1];
  const cl = Math.hypot(cx, cy, cz); cx /= cl; cy /= cl; cz /= cl;
  const nx = dir[1] * cz - dir[2] * cy, ny = dir[2] * cx - dir[0] * cz, nz = dir[0] * cy - dir[1] * cx;
  const flip = cz >= 0 ? 1 : -1;
  const chord = (u) => spec.chord * Math.sin(PI * Math.min(1, spec.base + (1 - spec.base) * (u ** spec.pow))) ** spec.sq;
  patch(m, bone, 70, 26, (u, v) => {
    const c = chord(u) * (v * 2 - 1) * flip, bulge = 0.45 * Math.sin(PI * u) * Math.cos((v - 0.5) * PI), droop = spec.droop ? spec.droop * u * u : 0;
    return [hinge[0] + dir[0] * span * u + cx * c * flip + nx * bulge, hinge[1] + dir[1] * span * u + cy * c * flip + ny * bulge, hinge[2] + dir[2] * span * u + cz * c * flip + nz * bulge - droop];
  }, (u, v) => painter(u, v * 2 - 1, upper));
}

export function animateWasp(p, s) {
  p.reset();
  const t = s.t, m = s.mem;
  const c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 7), walk = ease(m, 'walk', s.moving ? 1 : 0, s.dt, 6);
  const beat = Math.sin(t * 26), beat2 = Math.sin(t * 26 + 1.1);
  p.o('body', 0, 0, 0.28 * Math.sin(t * 2.6));
  p.r('body', 0.04 * Math.sin(t * 0.7), 0.06 * Math.sin(t * 1.3), 0.03 * Math.sin(t * 0.9));
  p.r('ab0', 0, 0.09 * Math.sin(t * 1.7) + 0.06 * walk, 0).r('ab1', 0, 0.05 * Math.sin(t * 2.1), 0).r('ab2', 0, 0.06 * Math.sin(t * 2.4), 0);
  p.r('head', 0, 0.06 * Math.sin(t * 1.4) - 0.1 * c, 0.1 * Math.sin(t * 0.8));
  for (const [sd, y] of SIDES) {
    const a = 0.34 * beat, b = 0.28 * beat2;
    p.r(`${sd}wu`, y * a, 0, 0).r(`${sd}wl`, y * b, 0, 0);
    const up = 0.09 * Math.sin(t * 1.6 + y) + 0.75 * c;
    p.r(`${sd}s0`, y * up, -0.28 * c, 0).r(`${sd}s1`, y * (0.1 * Math.sin(t * 1.9 + y) + 0.4 * c), 0, 0);
    for (let k = 0; k < 2; k++) p.r(`${sd}l${k}`, y * 0.08 * Math.sin(t * 3 + k), 0.12 * Math.sin(t * 2 + k * 2), 0);
  }
  p.evaluate();
}

const buildAyamiss = () => buildWasp({
  z: 10,
  abdomen: [[-0.35, 0, 8.6], [-0.45, 0, 5.6], [-0.3, 0, 2.8], [0, 0, 0.5]], abR: [1.05, 1.9, 1.05],
  wingU: { tip: [-1.8, 7.8, 8.2], chord: 3.9, base: 0.1, pow: 0.75, sq: 0.7, droop: 0 },
  wingL: { tip: [-1.6, 8.9, 2.4], chord: 2.8, base: 0.12, pow: 0.8, sq: 0.7, droop: 0.9 },
  sc: { bx: 1.1, by: 5.6, bz: 1.6, cx: 2.2, cy: 8.9, cz: -0.5, dx: 1.2, dy: 7, dz: -5.3 },
  colors: {
    thorax: '#c23a16', thorax2: '#d8541a', collar: '#e87020', ab: '#241846', ab2: '#1a1236', head: '#c84018', eye: '#e8a838', eyeEm: 0.35, mand: '#e88a2a', ant: '#a8341a',
    sc1: '#e8a938', sc2: '#e38a2a', sc3: '#b84a1a', sc4: '#3c1a14', leg: '#2c2044', leg2: '#140f24', teeth: '#a42412',
  },
  paintWing(u, v) {
    const av = Math.abs(v), radial = fract(v * 5 + 0.5) < 0.09, cross = fract(u * 6 + Math.abs(v) * 0.4) < 0.05;
    let c = mix('#f58a24', '#e02c10', sstep(0.15, 0.85, u));
    c = mix(c, '#f2b830', sstep(0.2, 0, u) * 0.9);
    if (radial) c = mix(c, '#ffc24e', 0.55);
    else if (cross) c = mix(c, '#ffb040', 0.3);
    if (av > 0.9 || u > 0.97) c = mix('#84170a', '#b32a10', u);
    return c;
  },
  mask(m, { hx, hz }) {
    // The red V across her forehead.
    for (const [, y] of SIDES) m.tube('head', [[hx + 0.95, y * 0.14, hz + 0.1], [hx + 0.98, y * 0.82, hz + 0.95]], [0.15, 0.1], '#a01c10', { sides: 4 });
  },
  abdomenPlates(m) {
    // Gold chevrons down her sides, and the red and yellow barb.
    for (const [, y] of SIDES) {
      for (let i = 0; i < 3; i++) {
        const z0 = 8.4 - i * 1.9, r = 1.75 - i * 0.28;
        m.tri([-0.3, y * r, z0], [-0.3, y * (r + 1.3), z0 - 1.5], [-0.3, y * (r - 0.3), z0 - 1.9], '#e6a82c', 0, ['ab1'], true);
      }
      m.tri([0, y * 0.05, 2.4], [0, y * 0.95, 1.5], [0, y * 0.1, 0.9], '#ee4418', 0, ['ab2'], true);
    }
    m.tube('ab2', [[0, 0, 1], [0.1, 0, 0.2], [0.2, 0, -0.05]], [0.26, 0.1, 0.01], ['#e0841e', '#ffdd55', '#ffee99'], { sides: 5 });
  },
  paintAb(v) { if (Math.abs(v.y) < 0.18 && v.nx > 0.2) { v.color[0] *= 2; v.color[1] *= 1.6; v.color[2] *= 2.3; } },
});

const HUW_RED = [[0.56, 0.62, 0.05, 0.16], [0.66, 0.45, 0.05, 0.14], [0.76, 0.6, 0.05, 0.15], [0.74, 0.22, 0.05, 0.13], [0.62, 0.2, 0.05, 0.11], [0.52, 0.38, 0.04, 0.12], [0.86, 0.4, 0.05, 0.12], [0.88, 0.7, 0.04, 0.1], [0.46, 0.66, 0.04, 0.1], [0.84, 0.15, 0.04, 0.09]];
const buildHuhuran = () => buildWasp({
  z: 9.6,
  abdomen: [[-0.4, 0, 8.2], [-0.8, 0, 5.6], [-0.7, 0, 3.1], [0.4, 0, 0.25]], abR: [0.95, 1.65, 0.8],
  wingU: { tip: [-0.4, 12.4, 10.6], chord: 2.7, base: 0.05, pow: 1.5, sq: 1.15, droop: 0 },
  wingL: { tip: [-1.2, 4.6, 7.4], chord: 1.55, base: 0.05, pow: 1.3, sq: 1, droop: 0 },
  sc: { bx: 2.2, by: 4.5, bz: 1, cx: 4.8, cy: 6.4, cz: -0.5, dx: 4.2, dy: 5.1, dz: -5.2 },
  colors: {
    thorax: '#8a9a1e', thorax2: '#a9a226', collar: '#c2a828', ab: '#4f3a14', ab2: '#3a2810', head: '#a8a828', eye: '#2c3a18', eyeEm: 0.12, mand: '#d9a42c', ant: '#c8a838',
    sc1: '#b9b52c', sc2: '#d59a2c', sc3: '#d46620', sc4: '#742210', leg: '#6e7a1c', leg2: '#3a3e12', teeth: '#c98a22',
  },
  scytheSerrate: true, femurPlates: true,
  paintWing(u, v, upper) {
    const av = Math.abs(v);
    if (av > 0.82 || u > 0.92) return mix('#d9b52e', '#efcf40', u);
    let c = mix('#82b432', '#4d8a24', sstep(0.1, 0.9, u));
    if (u < 0.2) c = mix(c, '#bda82a', sstep(0.2, 0, u) * 0.8);
    const vein = fract(v * 4.4) < 0.1 || fract(u * 7.2) < 0.08;
    if (vein) c = mix(c, '#3f6a16', 0.8);
    for (const [ou, ov, ru, rv] of HUW_RED) {
      const d = Math.hypot((u - ou) / (upper ? ru : ru * 1.15), (Math.abs(v) - ov) / (upper ? rv : rv * 1.2));
      if (d < 1) return mix('#d22a26', '#e84a40', d);
    }
    return c;
  },
  mask(m, { hx, hz }) { for (const [, y] of SIDES) m.ball('head', [hx + 1.1, y * 0.38, hz + 0.75], 0.09, '#2a2410', { sides: 5, rings: 3 }); },
  abdomenPlates(m) {
    m.tube('ab2', [[0.4, 0, 0.25], [1.3, 0, -0.1], [1.7, 0, 0.5]], [0.2, 0.1, 0.01], ['#c8b830', '#e8d840', '#f2913a'], { sides: 5 });
  },
  paintAb(v) {
    const band = fract(v.z * 1.25);
    if (band < 0.13) { v.color[0] *= 0.45; v.color[1] *= 0.42; v.color[2] *= 0.45; }
    if (Math.abs(v.y) < 0.14 && v.nx > 0.1) { v.color[0] = 0.72; v.color[1] = 0.62; v.color[2] = 0.2; }
  },
});

// ---- Qiraji: bipeds in armour and silks.

/** A triangular plate: base edge A-B narrowing to tip T. u runs base to tip, v across. */
function triPlate(m, bone, A, B, T, col, nu = 12, nv = 10) {
  patch(m, bone, nu, nv, (u, v) => {
    const b = lerp3(A, B, v), w = 1 - u, k = 0.5;
    return [lerp(b[0], T[0], u), lerp(b[1], T[1], u), lerp(b[2], T[2], u) + Math.sin(u * PI) * Math.sin(v * PI) * k * 0.15 * w];
  }, col);
}

export function buildRajaxx() {
  const m = new ModelBuilder();
  const hip = 4.2, chest = 7.2, neck = 9.1;
  bipedRig(m, { hip, chest, neck, sw: 3.3, armU: 2.7, armL: 3, hipW: 1.45, shoulderDrop: 0.3, armOut: 1.3, headUp: 0.1, lean: 0.9, elbowF: 0.5, wristF: 0.8 });
  const INK = '#23203f', VIO = '#3b3668', LIT = '#5a5396', SIL = '#c4beb4', GREY = '#807c84', TAN = '#a98450', RED = '#d42e28', BLK = '#14121f';
  const silverCol = (u, v, c1 = INK, c2 = VIO) => (u > 0.86 || v < 0.1 || v > 0.9 ? SIL : ((u + v) * 7) % 1 < 0.22 ? c2 : c1);

  // Torso: chest barrel, banded waist.
  m.ell('chest', [0.25, 0, 7.7], [1.3, 2.05, 1.5], VIO, { k: 0.35 });
  m.ell('spine', [0.2, 0, 5.6], [0.95, 1.4, 1.3], INK, { k: 0.3 });
  m.ell('hips', [0.15, 0, 4.35], [1.15, 1.75, 0.85], VIO, { k: 0.35 });
  // Chest plate: two angular slabs meeting in a ridge.
  for (const [, y] of SIDES) m.tri([1.55, y * 0.04, 9], [1.6, y * 2.1, 8.6], [1.5, y * 0.04, 6.1], LIT, 0, ['chest'], true);
  for (const z of [5, 5.75]) m.lathe('spine', [0.22, 0, z - 0.17], [0.22, 0, z + 0.17], [[1.55, 0], [1.68, 0.5], [1.55, 1]], z === 5 ? SIL : GREY, { sides: 16, flatten: 1 });
  // Tabard: the long plate hanging at the front, red gem and blue stripe.
  m.box('hips', [1.4, 0, 2.7], [0.3, 1.5, 4.8], INK, { taper: 1.4 });
  m.tri([1.56, 0.8, 0.3], [1.56, -0.8, 0.3], [1.56, 0, -0.5], INK, 0, ['hips']);
  m.box('hips', [1.58, 0, 2.7], [0.05, 0.42, 4.6], '#3f3aa0', {});
  m.lathe('hips', [1.45, 0, 5.05], [1.9, 0, 5.05], [[0.72, 0], [0.74, 0.55], [0.34, 1]], SIL, { sides: 10 });
  m.ball('hips', [1.86, 0, 5.05], 0.42, RED, { em: 2.2 });
  for (const [, y] of SIDES) {
    // Side tasset plates.
    m.box('hips', [0.75, y * 1.35, 3.1], [0.3, 0.95, 2.5], VIO, { taper: 1.25 });
    // Wide flaring collar plates: the silhouette.
    triPlate(m, 'chest', [1.5, y * 0.75, 9.85], [-1.2, y * 1.2, 8.1], [0.3, y * 8.2, 11.7], (u, v) => silverCol(u, v), 18, 12);
    triPlate(m, 'chest', [1.3, y * 1.4, 8.8], [-1.4, y * 1.5, 7.5], [-0.3, y * 7.8, 7.9], (u, v) => silverCol(u, v, VIO, INK), 18, 12);
    triPlate(m, 'chest', [0.8, y * 1.6, 7.5], [-1, y * 1.6, 6.5], [-0.6, y * 6.4, 5.5], (u, v) => silverCol(u, v), 14, 10);
    // Knee gems.
    m.ball(`${y > 0 ? 'L' : 'R'}th`, [0.82, y * 1.55, 2.5], 0.28, RED, { em: 2 });
  }
  // Cowl behind the head, then the insect head with its long pointed visor.
  m.ell('chest', [-0.4, 0, 9.3], [1.3, 1.9, 1.25], INK, { k: 0.3 });
  m.ell('head', [0.75, 0, 9.8], [0.85, 0.8, 0.95], VIO, { k: 0.3 });
  patch(m, 'head', 16, 16, (u, v) => {
    const w = 1.1 * (1 - u) ** 0.65 + 0.03, y = (v * 2 - 1) * w;
    return [1.55 + u * 0.9 - Math.abs(v * 2 - 1) * 0.42 * (1 - u), y, 10.5 - u * 3.5];
  }, (u, v) => { const a = Math.abs(v * 2 - 1); return a > 0.74 ? SIL : a < 0.12 ? LIT : mix(VIO, LIT, 0.4 + u * 0.5); });
  for (const [, y] of SIDES) m.ball('head', [1.9, y * 0.46, 10.35], 0.17, '#ff3a30', { em: 5 });
  m.tube('head', bezN([0.35, 0, 10.8], [0.05, 0, 13.2], [0.75, 0, 15.2], 6), [0.5, 0.43, 0.36, 0.28, 0.2, 0.11, 0.015], BLK, { sides: 7 });
  // Arms: bare tan upper arm, plated forearm, a crab claw on the right, talons on the left.
  for (const [s, y] of SIDES) {
    const sh = [0, y * 3.3, 8.8], el = [0.5, y * 4.6, 6.1], wr = [1.3, y * 4.86, 3.1];
    m.blob(`${s}up`, sh, el, 0.8, 0.62, TAN, { k: 0.25 });
    for (const t of [0.4, 0.62]) { const c = lerp3(sh, el, t); m.lathe(`${s}up`, [c[0], c[1], c[2] - 0.12], [c[0], c[1], c[2] + 0.12], [[0.78, 0], [0.82, 0.5], [0.78, 1]], '#2a2748', { sides: 12 }); }
    m.blob(`${s}lo`, el, wr, 0.74, 0.94, INK, { k: 0.2 });
    m.lathe(`${s}lo`, [el[0], el[1], el[2] - 0.15], [el[0] + 0.08, el[1], el[2] - 0.95], [[0.88, 0], [1, 0.25], [1.05, 0.7], [0.9, 1]], GREY, { sides: 12 });
    m.spike(`${s}lo`, [el[0], el[1], el[2] - 0.3], [el[0] - 0.9, el[1] + y * 2.2, el[2] + 1], 0.42, SIL, { bend: [0, 0, 0.3], sides: 5 });
    const hand = `${s}hand`;
    if (y < 0) {
      m.tube(hand, bezN([wr[0], wr[1], wr[2] - 0.3], [wr[0] + 0.9, wr[1] - 2.3, wr[2] - 0.9], [wr[0] + 1.45, wr[1] - 0.5, wr[2] - 3.4], 8), [0.95, 1.08, 1.05, 0.9, 0.7, 0.5, 0.32, 0.16, 0.02], [INK, INK, VIO, INK, INK, INK, BLK, BLK, BLK], { sides: 8 });
      m.tube(hand, bezN([wr[0] + 0.1, wr[1] + 0.3, wr[2] - 0.4], [wr[0] + 1, wr[1] + 2.1, wr[2] - 0.9], [wr[0] + 1.35, wr[1] + 0.55, wr[2] - 3.3], 8), [0.82, 0.92, 0.9, 0.78, 0.6, 0.42, 0.26, 0.13, 0.02], [INK, INK, VIO, INK, INK, INK, BLK, BLK, BLK], { sides: 8 });
    } else {
      m.ell(hand, [wr[0], wr[1], wr[2] - 0.35], [0.7, 0.7, 0.75], INK, { k: 0.2 });
      for (let f = -1; f <= 1; f++) blade(m, hand, [wr[0] + 0.1 + f * 0.32, wr[1] + f * 0.42, wr[2] - 0.9], [wr[0] + 0.9, wr[1] + f * 0.75, wr[2] - 2], [wr[0] + 0.5 + f * 0.25, wr[1] + f * 0.45, wr[2] - 3.5], 0.34, VIO, BLK, { n: 5, sides: 5 });
    }
    // Stubby armoured legs, plated shins, clawed feet.
    m.blob(`${s}th`, [0, y * 1.45, 4.1], [0.18, y * 1.55, 2.2], 1.2, 0.85, INK, { k: 0.4 });
    m.blob(`${s}sh`, [0.18, y * 1.55, 2.2], [0.1, y * 1.65, 0.75], 0.82, 0.68, VIO, { k: 0.25 });
    m.box(`${s}sh`, [0.65, y * 1.6, 1.5], [0.28, 1.15, 1.9], INK, { taper: 0.8 });
    for (let f = -1; f <= 1; f++) m.spike(`${s}sh`, [0.7, y * 1.65 + f * 0.42, 0.42], [1.8, y * 1.7 + f * 0.62, 0.02], 0.22, BLK, { sides: 4 });
  }
  return m.build({ cell: 0.1, smooth: 1, ao: 1, aoReach: 0.6 });
}

export function buildOssirian() {
  const m = new ModelBuilder();
  const hip = 5.2, chest = 8.4, neck = 10.8;
  bipedRig(m, { hip, chest, neck, sw: 3.7, armU: 3.2, armL: 3, hipW: 1.55, shoulderDrop: 0.7, armOut: 1.25, headUp: 0.3, lean: 1.2, elbowF: 0.2, wristF: 0.7 });
  const B = '#1766c4', BH = '#3b98e8', BD = '#0b3a80', W = '#efe8d4', GO = '#caa04a', GD = '#8a6a26', TEAL = '#1aa49a', RED = '#c23a22';
  // Massive shoulders and arms under a barrel chest.
  m.ell('chest', [0.3, 0, 8.6], [1.9, 3, 2], B, { k: 0.7 });
  m.ell('spine', [0.25, 0, 6.45], [1.35, 1.8, 1.7], B, { k: 0.5 });
  for (const [, y] of SIDES) m.ell('chest', [1.65, y * 1.4, 9], [0.8, 1.4, 0.95], BH, { k: 0.35 });
  for (const [, y] of SIDES) m.blob('chest', [0, y * 2.2, 8.9], [0.2, y * 1.5, 6.6], 1.1, 0.5, B, { k: 0.6 });
  for (const z of [7.3, 6.6, 5.85]) for (const [, y] of SIDES) m.ell('spine', [1.6, y * 0.5, z], [0.5, 0.48, 0.34], BH, { k: 0.2 });
  // Neck hunched forward into a long dark Set-beast muzzle.
  m.blob('neck', [0.85, 0, 10.4], [1.25, 0, 11.4], 1, 0.78, BD, { k: 0.45 });
  m.ell('head', [1.5, 0, 11.7], [1.2, 1, 0.95], BD, { k: 0.4 });
  m.blob('head', [2.3, 0, 11.6], [4.6, 0, 10.75], 0.72, 0.5, BD, { k: 0.3 });
  m.ell('head', [4.4, 0, 10.9], [0.75, 0.56, 0.42], '#0c2a60', { k: 0.25 });
  for (const [, y] of SIDES) m.ell('head', [2.3, y * 0.82, 12.1], [0.38, 0.14, 0.14], '#d6ecff', { k: 0.05, em: 2.4 });
  // Headdress: gold band, red cap, two tall thin gold horns.
  m.lathe('head', [1.25, 0, 12.15], [1.2, 0, 12.75], [[1.28, 0], [1.42, 0.5], [1.3, 1]], GO, { sides: 14 });
  m.ell('head', [1.05, 0, 13], [1.3, 1.25, 0.95], RED, { k: 0.3 });
  m.ball('head', [1, 0, 13.85], 0.3, GO, {});
  for (const [, y] of SIDES) {
    m.tube('head', bezN([1.15, y * 1.25, 12.4], [1.3, y * 2.3, 15.2], [0.85, y * 1.4, 19], 7), [0.34, 0.27, 0.21, 0.17, 0.13, 0.1, 0.06, 0.01], [GO, GO, GO, GO, GD, GD, GD, GD], { sides: 6 });
    // Nemes lappets: white cloth bordered in gold, hanging either side of the chest.
    patch(m, 'chest', 18, 8, (u, v) => {
      const w = lerp(1.25, 1.08, u), yc = lerp(1.6, 1.65, u) + Math.sin(u * PI) * 0.16;
      return [lerp(1.35, 2.45, sstep(0, 0.35, u)) + Math.sin(v * PI) * 0.1, y * (yc + (v - 0.5) * w), lerp(12.7, 6.35, u)];
    }, (u, v) => { const inside = y > 0 ? v : 1 - v; if (inside < 0.14 || inside > 0.86 || u < 0.08) return GO; return inside < 0.26 && fract(u * 11) < 0.5 ? TEAL : W; });
    m.ell('chest', [1.8, y * 1.4, 12.2], [0.5, 0.7, 0.7], W, { k: 0.15 });
  }
  // Collar and gem at the throat.
  patch(m, 'chest', 40, 5, (u, v) => {
    const a = (u - 0.5) * 2.3, rx = lerp(1.7, 2.2, v), z = lerp(11, 9.7, v) - Math.abs(a) * 0.15;
    return [0.55 + Math.cos(a) * rx, Math.sin(a) * lerp(1.65, 3, v), z];
  }, (u, v) => (v < 0.2 || v > 0.8 ? GO : Math.sin(u * 60) > 0 ? TEAL : GO));
  m.ball('chest', [2.7, 0, 10.4], 0.36, '#3ee0c8', { em: 2.2 });
  // Belt, kilt and apron.
  m.lathe('hips', [0.2, 0, 5.05], [0.2, 0, 5.85], [[2.15, 0], [2.28, 0.5], [2.1, 1]], TEAL, { sides: 18 });
  m.lathe('hips', [0.2, 0, 5.1], [0.2, 0, 5.3], [[2.3, 0], [2.3, 1]], GO, { sides: 18 });
  m.lathe('hips', [0.2, 0, 5.65], [0.2, 0, 5.85], [[2.25, 0], [2.25, 1]], GO, { sides: 18 });
  m.lathe('hips', [0.2, 0, 2.3], [0.2, 0, 5.2], [[2.9, 0], [2.6, 0.5], [2.25, 1]], W, { sides: 14 });
  patch(m, 'hips', 10, 8, (u, v) => {
    const w = lerp(1.15, 0.5, u) * (v * 2 - 1);
    return [lerp(2.55, 3.25, u), w, lerp(5, 1.6, u)];
  }, (u, v) => (Math.abs(v * 2 - 1) < 0.2 ? TEAL : Math.abs(v * 2 - 1) > 0.82 ? GO : mix(GO, GD, 0.3 + u * 0.4)));
  for (const [s, y] of SIDES) {
    const sh = [0, y * 3.7, 10.1], el = [0.2, y * 4.95, 6.9], wr = [0.9, y * 5.2, 3.9];
    m.ell(`${s}up`, [0.1, y * 3.75, 10.05], [1.3, 1.15, 1.2], B, { k: 0.45 });
    m.ell(`${s}up`, [0.75, y * 3.6, 8.9], [0.75, 0.7, 1.05], BH, { k: 0.3 });
    m.blob(`${s}up`, sh, el, 1.2, 0.98, B, { k: 0.3 });
    m.blob(`${s}lo`, el, wr, 1.04, 0.8, BD, { k: 0.25 });
    m.ell(`${s}hand`, [wr[0] + 0.1, wr[1], wr[2] - 0.5], [0.8, 0.72, 0.85], B, { k: 0.25 });
    for (let f = -1; f <= 1; f++) m.spike(`${s}hand`, [wr[0] + 0.5, wr[1] + f * 0.42, wr[2] - 1.05], [wr[0] + 0.9, wr[1] + f * 0.5, wr[2] - 1.7], 0.14, BD, { sides: 4 });
    for (const [t, c] of [[0.42, GO], [0.5, GD]]) { const q = lerp3(sh, el, t); m.lathe(`${s}up`, [q[0], q[1], q[2] - 0.14], [q[0], q[1], q[2] + 0.14], [[1.14, 0], [1.2, 0.5], [1.14, 1]], c, { sides: 12 }); }
    m.lathe(`${s}lo`, [wr[0] - 0.05, wr[1], wr[2] + 0.2], [wr[0] - 0.15, wr[1], wr[2] + 1.1], [[0.98, 0], [1.08, 0.5], [0.95, 1]], GO, { sides: 12 });
    m.blob(`${s}th`, [0, y * 1.55, 5.1], [0.18, y * 1.65, 2.7], 1.45, 1.05, B, { k: 0.45 });
    m.blob(`${s}sh`, [0.18, y * 1.65, 2.7], [0, y * 1.7, 0.8], 1.05, 0.82, BD, { k: 0.3 });
    m.lathe(`${s}sh`, [0.1, y * 1.68, 1.3], [0.15, y * 1.66, 2.3], [[1.05, 0], [1.15, 0.5], [1.02, 1]], TEAL, { sides: 12 });
    m.lathe(`${s}sh`, [0.1, y * 1.68, 1.2], [0.1, y * 1.68, 1.42], [[1.1, 0], [1.1, 1]], GO, { sides: 12 });
    m.lathe(`${s}sh`, [0.14, y * 1.66, 2.2], [0.14, y * 1.66, 2.42], [[1.14, 0], [1.14, 1]], GO, { sides: 12 });
    m.ell(`${s}sh`, [0.4, y * 1.7, 0.42], [1.3, 0.75, 0.45], BD, { k: 0.2 });
  }
  return m.build({ cell: 0.11, smooth: 1, ao: 1, aoReach: 0.8 });
}

export function buildSartura() {
  const m = new ModelBuilder();
  const hip = 5.8, chest = 8.6, neck = 10.4;
  bipedRig(m, { hip, chest, neck, sw: 1.75, armU: 2.35, armL: 2.5, hipW: 0.7, shoulderDrop: 0.2, armOut: 2.1, headUp: 0.2, lean: 0, elbowF: 0.05, wristF: 0.1 });
  const P = '#aab6dc', PD = '#7b89b6', TEAL = '#1d9c88', TL = '#3ccdaa', SK = '#c6a98a', BK = '#14121c', SIL = '#d6d9e6', W = '#eff1f6';
  for (const [s, y] of SIDES) {
    // Trousers: loose but long, gathered at the knee.
    m.blob(`${s}th`, [0, y * 0.7, 5.7], [0.1, y * 0.85, 3.3], 0.85, 0.82, P, { k: 0.35 });
    m.blob(`${s}th`, [0.1, y * 0.85, 3.3], [0.05, y * 0.92, 2.9], 0.82, 0.5, PD, { k: 0.25 });
    // Insect shins: black banded in white, splayed claw foot.
    const kn = [0.1, y * 0.85, 3.15], ank = [0.1, y * 0.88, 0.85];
    m.bone(`${s}ft`, `${s}sh`, ank);
    m.tube(`${s}sh`, [kn, lerp3(kn, ank, 0.3), lerp3(kn, ank, 0.55), lerp3(kn, ank, 0.8), ank], [0.3, 0.22, 0.2, 0.18, 0.16], [BK, BK, W, BK, W], { sides: 7 });
    for (let f = -1; f <= 1; f++) m.spike(`${s}ft`, [0.15, y * 0.88 + f * 0.14, 0.8], [1.35, y * 0.88 + f * 0.6, 0.03], 0.14, BK, { bend: [0, 0, 0.35], sides: 4, tipColor: W });
    m.spike(`${s}ft`, [-0.1, y * 0.88, 0.8], [-1, y * 0.95, 0.03], 0.13, BK, { bend: [0, 0, 0.3], sides: 4, tipColor: W });
    // Slender upper arm, then a sleeve widening to a great triangular teal cuff.
    const sh = [0, y * 1.75, 10.2], el = [0.05, y * 3.85, 7.85], wr = [0.15, y * 4.27, 5.35];
    m.blob(`${s}up`, sh, el, 0.42, 0.5, P, { k: 0.2 });
    m.blob(`${s}lo`, el, wr, 0.52, 0.95, P, { k: 0.2 });
    m.lathe(`${s}lo`, [wr[0], wr[1], wr[2] + 0.5], [wr[0], wr[1], wr[2] - 0.45], [[0.95, 0], [1.05, 0.45], [1.32, 1]], PD, { sides: 12 });
    for (const [cx, cy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) m.tri([wr[0] + cx * 1.25, wr[1] + y * cy * 1.25, wr[2] - 0.5], [wr[0] + cx * 1.25, wr[1] - y * cy * 1.25, wr[2] - 0.5], [wr[0] + cx * 0.85, wr[1], wr[2] + 1.6], TEAL, 0, [`${s}lo`], true);
    m.lathe(`${s}lo`, [wr[0], wr[1], wr[2] - 0.55], [wr[0], wr[1], wr[2] + 0.25], [[1.42, 0], [1.36, 0.45], [1.2, 1]], TL, { sides: 12 });
    m.ell(`${s}hand`, [wr[0], wr[1], wr[2] - 0.75], [0.38, 0.38, 0.42], BK, { k: 0.08 });
    for (let f = -1; f <= 1; f++) m.spike(`${s}hand`, [wr[0] + 0.15, wr[1] + f * 0.22, wr[2] - 1.05], [wr[0] + 0.4, wr[1] + f * 0.35, wr[2] - 1.85], 0.1, BK, { sides: 3, tipColor: W });
    // Teal shoulder band and the black up-curving horn.
    m.lathe(`${s}up`, [0, y * 1.95, 10.05], [0.02, y * 2.65, 9.55], [[0.7, 0], [0.82, 0.5], [0.72, 1]], TEAL, { sides: 12 });
    blade(m, `${s}up`, [0, y * 2.6, 9.7], [-0.4, y * 4.4, 10.2], [-0.3, y * 3.3, 12.7], 0.42, '#2a2840', '#07060c', { n: 7, pow: 0.7, sides: 6 });
    // Long pale fins fanned from the shoulder blades.
    for (let i = 0; i < 3; i++) {
      const a = 0.45 + i * 0.42, L = 7.2 - i * 1.1, base = [-1, y * 0.85, 9.4 - i * 0.6];
      const tip = [-2.8 - i * 0.2, y * (0.85 + Math.cos(a) * L), 9.4 + Math.sin(a) * L * 1.2 - i * 2.1];
      patch(m, 'chest', 8, 3, (u, v) => {
        const p = lerp3(base, tip, u), w = (v - 0.5) * 1.25 * Math.sin(u * PI * 0.92 + 0.15);
        return [p[0], p[1], p[2] + w];
      }, (u, v) => (Math.abs(v - 0.5) < 0.07 ? '#6d7382' : mix('#c7ccd8', '#9aa0ae', u)));
    }
  }
  // Waist, ribbed armour, bare midriff.
  m.ell('spine', [0.05, 0, 7], [0.72, 0.95, 1.2], SK, { k: 0.4 });
  m.ell('hips', [0, 0, 5.75], [0.95, 1.2, 0.7], P, { k: 0.4 });
  m.ell('chest', [0.1, 0, 8.9], [1, 1.35, 1.25], SIL, { k: 0.4 });
  patch(m, 'chest', 18, 12, (u, v) => {
    const a = (v - 0.5) * 1.5;
    return [0.25 + Math.cos(a) * 0.95 + 0.04, Math.sin(a) * 1.25, lerp(9.7, 7.75, u)];
  }, (u) => (fract(u * 5.5) < 0.42 ? '#3a3a54' : '#d6d6e0'));
  m.box('hips', [1.0, 0, 4.7], [0.12, 0.5, 2.6], PD, { taper: 0.55 });
  m.blob('neck', [0, 0, 10.3], [0.05, 0, 10.85], 0.32, 0.34, SK, { k: 0.15 });
  m.ell('head', [0.15, 0, 11.45], [0.62, 0.55, 0.74], '#3a3448', { k: 0.2 });
  m.ell('head', [0.62, 0, 11.3], [0.28, 0.46, 0.55], W, { k: 0.12 });
  for (const [, y] of SIDES) {
    m.ball('head', [0.86, y * 0.22, 11.5], 0.08, '#7fe8ff', { em: 3, sides: 6, rings: 3 });
    m.tube('head', bezN([0, y * 0.2, 12.1], [-0.5, y * 0.5, 13.8], [-0.15, y * 0.8, 15.4], 6), [0.18, 0.16, 0.13, 0.1, 0.07, 0.04, 0.01], [SIL, SIL, W, W, SIL, SIL, W], { sides: 5 });
  }
  return m.build({ cell: 0.08, smooth: 1, ao: 0.85, aoReach: 0.5 });
}

// The Twin Emperors share everything but their build, colours and horns.
function rigEmperor(m, pre, ox, oy, s, H) {
  const P = (x, y, z) => [ox + x * s, oy + y * s, z * s];
  const n = (b) => `${pre}${b}`;
  if (pre) m.bone(n('root'), 'root', P(0, 0, 0));
  const parent = pre ? n('root') : 'root';
  m.bone(n('hips'), parent, P(0, 0, H.hip));
  m.bone(n('spine'), n('hips'), P(0, 0, (H.hip + H.chest) / 2));
  m.bone(n('chest'), n('spine'), P(0, 0, H.chest));
  m.bone(n('neck'), n('chest'), P(H.lean, 0, H.neck));
  m.bone(n('head'), n('neck'), P(H.lean, 0, H.neck + 0.4));
  if (!pre) { m.bone(n('mouth'), n('head'), P(H.lean + 1.2, 0, H.neck + 1)); m.bone(n('jaw'), n('head'), P(H.lean + 0.3, 0, H.neck + 0.3)); }
  for (const [sd, y] of SIDES) {
    const sh = P(0, y * H.sw, H.neck - 0.5);
    const el = P(H.ef, y * (H.sw + H.armOut), H.neck - 0.5 - H.armU);
    const wr = P(H.ef + H.wf, y * (H.sw + H.armOut * 1.2), H.neck - 0.5 - H.armU - H.armL);
    m.bone(n(`${sd}up`), n('chest'), sh); m.bone(n(`${sd}lo`), n(`${sd}up`), el); m.bone(n(`${sd}hand`), n(`${sd}lo`), wr);
    m.bone(n(`${sd}th`), n('hips'), P(0, y * H.hipW, H.hip - 0.1));
    m.bone(n(`${sd}sh`), n(`${sd}th`), P(0.2, y * (H.hipW + 0.15), H.hip * 0.52));
  }
}

function addEmperor(m, pre, ox, oy, s, o) {
  const H = o.H, P = (x, y, z) => [ox + x * s, oy + y * s, z * s], R = (r) => r * s, n = (b) => `${pre}${b}`, C = o.colors;
  rigEmperor(m, pre, ox, oy, s, H);
  const { hip, chest, neck, sw } = H;
  // Lean torso and waist.
  m.ell(n('chest'), P(0.2, 0, chest + 0.5), [R(1.22 * o.bulk), R(sw * 0.72), R(1.5)], C.torso, { k: R(0.4) });
  for (const [, y] of SIDES) m.ell(n('chest'), P(1.05, y * (sw * 0.32), chest + 0.85), [R(0.62), R(sw * 0.3), R(0.75)], C.torso2, { k: R(0.25) });
  m.ell(n('spine'), P(0.15, 0, (hip + chest) / 2 - 0.2), [R(0.9), R(1.2 * o.bulk), R(1.3)], C.torso2, { k: R(0.35) });
  m.ell(n('hips'), P(0.05, 0, hip + 0.3), [R(1.2), R(1.6 * o.bulk), R(0.85)], C.torso, { k: R(0.45) });
  // Sash: the long pointed V of coloured cloth down the front.
  patch(m, n('hips'), 14, 10, (u, v) => {
    const w = R(lerp(1.5 * o.bulk, 0.04, u ** 1.2)) * (v * 2 - 1);
    return P(lerp(1.15, 1.75, u), w / s, lerp(hip + 0.9, hip - 4.4, u));
  }, (u, v) => { const a = Math.abs(v * 2 - 1); return a > 0.86 ? C.trim : a < 0.1 ? C.sash2 : mix(C.sash, C.sash2, 0.2 + u * 0.5 + a * 0.2); });
  // Hood stripe running over the head and down the chest.
  patch(m, n('chest'), 22, 8, (u, v) => {
    const w = (v * 2 - 1) * 0.3;
    if (u < 0.45) {
      const k = u / 0.45, a = lerp(0.2, 1.5, k);
      return P(H.lean + Math.cos(a) * 0.98 + 0.25, w * lerp(1.1, 0.95, k), neck + 1.1 + Math.sin(a) * 1.35 - 0.45);
    }
    const k = (u - 0.45) / 0.55;
    return P(H.lean + lerp(1.15, 1.75 * o.bulk, sstep(0, 0.5, k)) + 0.1, w * lerp(0.95, 1.1, k), lerp(neck + 0.9, hip + 0.55, k));
  }, (u, v) => { const a = Math.abs(v * 2 - 1); return a > 0.72 ? C.trim2 : mix(C.hood, C.hood2, u * 0.7); });
  // V collar of dark plate and two straps over the chest.
  for (const [, y] of SIDES) {
    triPlate(m, n('chest'), P(H.lean + 1, y * 0.25, neck - 0.1), P(H.lean + 0.2, y * (sw * 0.92), neck - 0.55), P(H.lean + 1.35, y * 0.1, neck - 2.6), () => C.dark, 8, 8);
    m.tube(n('chest'), [P(0.95 * o.bulk, y * 0.55, chest + 1.5), P(1.25 * o.bulk, y * (sw * 0.55), chest + 0.2)], R(0.13), C.trim, { sides: 5 });
  }
  m.ell(n('neck'), P(H.lean + 0.1, 0, neck + 0.1), [R(0.55), R(0.55), R(0.6)], C.dark, { k: R(0.2) });
  m.ell(n('head'), P(H.lean + 0.2, 0, neck + 1.05), [R(0.95), R(0.9), R(1.1)], C.hood, { k: R(0.3) });
  m.ell(n('head'), P(H.lean + 0.95, 0, neck + 0.75), [R(0.45), R(0.62), R(0.72)], C.dark, { k: R(0.15) });
  for (const [, y] of SIDES) m.ball(n('head'), P(H.lean + 1.3, y * 0.32, neck + 0.98), R(0.12), C.eye, { em: 4, sides: 6, rings: 3 });
  if (o.horns) for (const [, y] of SIDES) {
    m.tube(n('head'), bezN(P(H.lean + 0.1, y * 0.9, neck + 1.45), P(H.lean - 0.5, y * 4.9, neck + 2.4), P(H.lean + 0.1, y * 3.1, neck + 6.1), 8), [0.58, 0.72, 0.66, 0.58, 0.48, 0.36, 0.25, 0.13, 0.01].map(R), [C.dark, C.horn, C.horn, C.horn, C.horn2, C.horn2, C.horn2, C.horn2, C.horn2], { sides: 7 });
  } else {
    // Vek'lor's small dorsal fin instead of horns.
    for (const y of [1, -1]) m.tri(P(H.lean - 0.4, y * 0.02, neck + 1.5), P(H.lean + 1.2, y * 0.02, neck + 2), P(H.lean - 0.9, y * 0.02, neck + 3.4), C.trim2, 0, [n('head')], true);
  }
  for (const [sd, y] of SIDES) {
    const armTop = P(0, y * sw, neck - 0.5), el = P(H.ef, y * (sw + H.armOut), neck - 0.5 - H.armU), wr = P(H.ef + H.wf, y * (sw + H.armOut * 1.2), neck - 0.5 - H.armU - H.armL);
    // Dark shoulder and huge clawed gauntlet.
    m.ell(n(`${sd}up`), [armTop[0], armTop[1], armTop[2] + R(0.05)], [R(0.85 * o.bulk), R(0.95 * o.bulk), R(0.7)], C.shoulder, { k: R(0.25) });
    for (let f = 0; f < 3; f++) m.spike(n(`${sd}up`), [armTop[0] - R(0.35) + R(f * 0.35), armTop[1] + y * R(0.5), armTop[2] + R(0.3)], [armTop[0] - R(0.5) + R(f * 0.5), armTop[1] + y * R(1.5), armTop[2] + R(1.05 - f * 0.2)], R(0.2), C.dark, { sides: 4 });
    m.blob(n(`${sd}up`), armTop, el, R(0.55 * o.bulk), R(0.42), C.torso2, { k: R(0.2) });
    m.blob(n(`${sd}lo`), el, wr, R(0.45), R(0.55), C.arm, { k: R(0.15) });
    m.lathe(n(`${sd}lo`), [wr[0], wr[1], wr[2] + R(0.4)], [wr[0], wr[1], wr[2] - R(0.3)], [[R(0.62), 0], [R(0.92), 0.6], [R(0.95), 1]], C.trim, { sides: 10 });
    m.ell(n(`${sd}hand`), [wr[0], wr[1], wr[2] - R(0.7)], [R(0.72), R(0.82), R(0.82)], C.dark, { k: R(0.18) });
    for (let f = -1; f <= 1; f++) m.spike(n(`${sd}hand`), [wr[0] + R(0.35), wr[1] + R(f * 0.5), wr[2] - R(1.45)], [wr[0] + R(0.9), wr[1] + R(f * 0.75), wr[2] - R(3)], R(0.27), '#2c2a30', { bend: [R(0.25), 0, 0], sides: 4, tipColor: '#74706a' });
    m.spike(n(`${sd}hand`), [wr[0], wr[1] + y * R(0.75), wr[2] - R(0.85)], [wr[0] - R(0.2), wr[1] + y * R(2), wr[2] - R(1.6)], R(0.2), '#2c2a30', { sides: 4, tipColor: '#74706a' });
    // Legs and the spike-winged boots.
    const hipP = P(0, y * H.hipW, hip - 0.1), knee = P(0.2, y * (H.hipW + 0.15), hip * 0.52);
    m.blob(n(`${sd}th`), hipP, knee, R(0.85 * o.bulk), R(0.56), C.legT, { k: R(0.35) });
    const ankle = P(0.15, y * (H.hipW + 0.2), 0.95);
    m.blob(n(`${sd}sh`), knee, ankle, R(0.7), R(0.58), C.legS, { k: R(0.3) });
    const knees = lerp3(knee, ankle, 0.04);
    m.spike(n(`${sd}sh`), knees, [knees[0] - R(0.1), knees[1] + y * R(1.9), knees[2] + R(0.8)], R(0.34), C.dark, { sides: 4 });
    m.ell(n(`${sd}sh`), P(0.55, y * (H.hipW + 0.22), 0.4), [R(1.3), R(0.74), R(0.52)], C.boot, { k: R(0.25) });
    m.spike(n(`${sd}sh`), P(0.05, y * (H.hipW + 0.3), 1.2), P(-1.2, y * (H.hipW + 1.3), 2.1), R(0.3), C.boot2, { sides: 4 });
    m.spike(n(`${sd}sh`), P(1.3, y * (H.hipW + 0.22), 0.3), P(2.25, y * (H.hipW + 0.22), 0.03), R(0.24), C.dark, { sides: 4 });
  }
}

const VEKNILASH = {
  bulk: 1.28, horns: true, H: { hip: 5.6, chest: 8.9, neck: 11.1, sw: 3.6, armU: 3.3, armL: 3.1, hipW: 1.45, lean: 0.55, armOut: 1.4, ef: 0.25, wf: 0.5 },
  colors: { torso: '#4b2880', torso2: '#3a2064', sash: '#d94f12', sash2: '#ee7e1c', trim: '#f2b43a', hood: '#d42a14', hood2: '#e65a1a', trim2: '#a01610', dark: '#2c2830', eye: '#ffda66', horn: '#4a4038', horn2: '#26221e', shoulder: '#37333e', arm: '#7c3f30', legT: '#e4681a', legS: '#c8421a', boot: '#5f2fa0', boot2: '#3a2064' },
};
const VEKLOR = {
  bulk: 0.92, horns: false, H: { hip: 5.2, chest: 8.2, neck: 10.2, sw: 2.55, armU: 3, armL: 2.9, hipW: 1.1, lean: 0.5, armOut: 1.1, ef: 0.25, wf: 0.5 },
  colors: { torso: '#5a2d8a', torso2: '#452372', sash: '#e8561a', sash2: '#ec8820', trim: '#d0a040', hood: '#c8281a', hood2: '#e45a1c', trim2: '#8a1610', dark: '#2a2630', eye: '#ffe07a', horn: '#4a4038', horn2: '#26221e', shoulder: '#6a3a8e', arm: '#3a2750', legT: '#4c2876', legS: '#6a3a9a', boot: '#df6016', boot2: '#b04012' },
};
const TWIN_POS = { nilash: [0, 5.2], lor: [0, -5.6] };

export function buildTwins() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  addEmperor(m, '', TWIN_POS.nilash[0], TWIN_POS.nilash[1], 1, VEKNILASH);
  addEmperor(m, 'v_', TWIN_POS.lor[0], TWIN_POS.lor[1], 1, VEKLOR);
  return m.build({ cell: 0.1, smooth: 1, ao: 0.9, aoReach: 0.6 });
}
const TWIN_BONES = ['hips', 'spine', 'chest', 'neck', 'head', 'Lup', 'Llo', 'Lhand', 'Rup', 'Rlo', 'Rhand', 'Lth', 'Lsh', 'Rth', 'Rsh'];
function makeTwins() {
  const built = buildTwins();
  const live = { hero: false };
  const animate = (p, s) => {
    animateBiped(p, s);
    const solo = s.engaged && !live.hero;
    if (solo) {
      // One Emperor per side of the room: the other is drawn as this encounter's add.
      p.o('root', 0, -TWIN_POS.nilash[1], 0);
      p.s('v_root', 0.0005);
    } else {
      // Vek'lor mirrors his brother with the fist held high, as in their pose together.
      for (const b of TWIN_BONES) {
        const i = p.idx(b), j = p.idx(`v_${b}`);
        if (i < 0 || j < 0) continue;
        for (let k = 0; k < 3; k++) { p.rot[j * 3 + k] = p.rot[i * 3 + k]; p.off[j * 3 + k] = p.off[i * 3 + k]; }
      }
      p.r('v_Lup', 0.25, -2.9, 0).r('v_Llo', 0, -0.4, 0);
      p.r('Rup', -0.2, -1.5, 0);
    }
    p.evaluate();
  };
  return { built, animate, mat: clothMat, scale: 1, mouth: 'mouth', school: 'shadow', height: 16, heroDist: 34, fx(P, ctx) { live.hero = heroView(ctx); } };
}

export function buildVeklorAdd() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  addEmperor(m, '', 0, 0, 1, VEKLOR);
  return m.build({ cell: 0.1, smooth: 1, ao: 0.9, aoReach: 0.6 });
}

/** True when the frame is drawn in the menu's hero view, which places the boss at the room's centre. */
function heroView(ctx) { return Math.hypot(ctx.M[12] - ctx.boss.x, ctx.M[13] - ctx.boss.y) > 0.25; }

// ---- The Prophet Skeram: a robed scarecrow of a thing on a ring of pink insect legs.
const SK = { P: '#df2c78', PL: '#f0507f', PD: '#8e1a52', B: '#14080f', G: '#d9b35c', GD: '#8c6b28', V: '#4d1668', VD: '#340e4a', R: '#801228', W: '#f6f1e3', GM: '#25d08a' };

export function buildSkeram() {
  const m = new ModelBuilder();
  const C = SK;
  m.bone('root', null, [0, 0, 0]);
  m.bone('robe', 'root', [0, 0, 6]);
  m.bone('chest', 'robe', [0, 0, 11.2]);
  m.bone('neck', 'chest', [0, 0, 14]);
  m.bone('head', 'neck', [0.15, 0, 14.6]);
  m.bone('mouth', 'head', [1, 0, 15]);
  for (const [s, y] of SIDES) {
    m.bone(`${s}up`, 'chest', [0, y * 2.3, 13.3]);
    m.bone(`${s}lo`, `${s}up`, [0.15, y * 3.6, 9.6]);
    m.bone(`${s}hand`, `${s}lo`, [0.4, y * 3.8, 7]);
  }
  // Six insect legs splayed around the hem: fat pink spindle, gold-and-black band, dark foot, ivory claw.
  const LEGS = [0, 0.5, -0.5, 1.05, -1.05, PI];
  LEGS.forEach((a, i) => {
    m.bone(`leg${i}`, 'root', [Math.cos(a) * 1.2, Math.sin(a) * 1.2, 5.6]);
    const out = (r, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
    const top = out(1.9, 7.4), mid = out(4.3, 4.3), low = out(5.5, 1.55), tip = out(5.95, 0.05);
    m.blob(`leg${i}`, top, mid, 0.34, 1.35, C.P, { k: 0.15 });
    m.blob(`leg${i}`, mid, low, 1.35, 0.72, C.PL, { k: 0.15 });
    m.blob(`leg${i}`, low, out(5.75, 0.72), 0.7, 0.32, C.PD, { k: 0.1 });
    const b = lerp3(top, mid, 0.56), b2 = lerp3(top, mid, 0.68);
    m.lathe(`leg${i}`, [b[0], b[1], b[2]], [b2[0], b2[1], b2[2]], [[1.2, 0], [1.26, 0.3], [1.3, 0.7], [1.33, 1]], C.B, { sides: 12 });
    const g1 = lerp3(top, mid, 0.52), g1e = lerp3(top, mid, 0.57), g2 = lerp3(top, mid, 0.67), g2e = lerp3(top, mid, 0.72);
    m.lathe(`leg${i}`, g1, g1e, [[1.26, 0], [1.3, 1]], C.G, { sides: 12 });
    m.lathe(`leg${i}`, g2, g2e, [[1.3, 0], [1.32, 1]], C.G, { sides: 12 });
    m.tube(`leg${i}`, [out(5.75, 0.85), out(5.95, 0.4), out(6.1, 0.03)], [0.36, 0.24, 0.01], ['#d6cdb8', '#efe7d2', '#fffaf0'], { sides: 6 });
  });
  // The robe, painted panel by panel: red front, black-and-gold scroll border, purple sides.
  const robeRad = (u) => lerp(1.65, 2.75, u ** 1.1) + 0.2 * Math.sin(u * 5);
  patch(m, 'robe', 46, 92, (u, v) => {
    const a = (v - 0.5) * 2 * PI, r = robeRad(u) * (1 + (Math.abs(Math.cos(a * 5)) ** 3) * 0.05 * u);
    return [Math.cos(a) * r * 0.95, Math.sin(a) * r, lerp(13.3, 4.4, u)];
  }, (u, v) => {
    const a = (v - 0.5) * 2 * PI, front = Math.abs(a), edge = u > 0.965;
    if (edge) return C.G;
    if (front < 0.34) return mix(C.R, '#a11734', 1 - u * 0.4);
    if (front < 0.42) return C.G;
    if (a < 0 && front >= 0.42 && front < 0.78) {
      // A black-and-gold scroll panel down the robe's edge.
      const sc = Math.sin(u * 46 + Math.sin(v * 70) * 1.7) * Math.cos(v * 95);
      return Math.abs(sc) > 0.52 ? C.G : C.B;
    }
    if (front < 0.48) return C.G;
    return mix(C.V, C.VD, 0.2 + Math.abs(Math.sin(a * 6)) * 0.5);
  });
  m.ell('robe', [0, 0, 11.5], [1.5, 1.75, 2.2], C.VD, { k: 0.5 });
  m.ell('robe', [0, 0, 6.5], [2, 2.3, 2.6], C.VD, { k: 0.8 });

  // Chest: maroon ribs laced in gold with the green jewel at the throat.
  patch(m, 'chest', 30, 20, (u, v) => {
    const a = (v - 0.5) * 2.1;
    return [Math.cos(a) * 1.72 + 0.12, Math.sin(a) * 2.05, lerp(14.2, 9.2, u)];
  }, (u, v) => {
    const a = Math.abs(v - 0.5) * 2;
    const rib = fract(u * 4.2 + a * 0.45);
    if (a < 0.09) return C.G;
    if (rib < 0.2 && a < 0.92) return C.G;
    if (a > 0.82) return C.G;
    return mix('#a21733', '#700f26', a);
  });
  m.lathe('chest', [1.8, 0, 13.3], [2.2, 0, 13.3], [[0.6, 0], [0.62, 0.5], [0.3, 1]], C.G, { sides: 12 });
  m.ball('chest', [2.06, 0, 13.3], 0.34, C.GM, { em: 3.2 });
  // Skeletal gold fringe hanging from the ribs down the robe.
  for (let i = -2; i <= 2; i++) {
    const y = i * 0.52, len = 3.2 - Math.abs(i) * 0.5;
    m.tube('robe', bezN([2.0, y, 9.6], [2.45, y * 1.25, 9.6 - len * 0.5], [1.95, y * 0.72, 9.6 - len], 2), [0.13, 0.11, 0.03], C.G, { sides: 5 });
  }
  // Tiers of pink plates down each arm, black-striped and studded with gold-ringed eyes.
  const plateCol = (u, v) => {
    const n = noise3(u * 6, v * 6, 2);
    if (v < 0.05 || v > 0.95) return C.PD;
    if (fract(u * 3.6 + v * 0.9 + n * 0.35) < 0.28 || (v > 0.62 && fract(u * 7) < 0.22)) return C.B;
    return mix(C.P, C.PL, n);
  };
  for (const [s, y] of SIDES) {
    const tier = (z0, z1, inner, out, tipZ, nu = 20) => {
      patch(m, `${s}up`, nu, 14, (u, v) => {
        const yy = lerp(inner, out, u), zTop = lerp(z0, tipZ, u), zBot = lerp(z1, tipZ - 0.75, u);
        const bulge = Math.sin(u * PI * 0.92) * 1.6;
        return [0.2 + Math.cos(v * PI) * bulge * 0.55, y * yy, lerp(zTop, zBot, v)];
      }, plateCol);
    };
    tier(15.3, 12.2, 1.1, 8.2, 13.6);
    tier(13.6, 9.9, 2.2, 9.7, 11.3);
    tier(11.1, 7.7, 2.4, 8.6, 8.1);
    // Gold-rimmed pale studs.
    for (const [yy, z, r] of [[3.2, 14.3, 0.42], [5.4, 13.6, 0.38], [3.7, 11.9, 0.4], [6.1, 11.4, 0.36], [3.6, 9.5, 0.34], [5.4, 9.2, 0.3]]) {
      m.lathe(`${s}up`, [0.8, y * yy, z], [1.32, y * yy, z], [[r, 0], [r * 1.05, 0.55], [r * 0.45, 1]], C.G, { sides: 14 });
      m.ball(`${s}up`, [1.3, y * yy, z], r * 0.56, C.W, { em: 1.3 });
    }
    // Sleeve, cuffed in gold and black.
    m.blob(`${s}up`, [0, y * 2.3, 13.2], [0.15, y * 3.6, 9.6], 0.7, 1.15, C.V, { k: 0.4 });
    m.blob(`${s}lo`, [0.15, y * 3.6, 9.6], [0.4, y * 3.8, 7.1], 1.15, 1.25, C.V, { k: 0.4 });
    m.lathe(`${s}lo`, [0.4, y * 3.8, 7.05], [0.42, y * 3.82, 6.45], [[1.32, 0], [1.32, 1]], C.B, { sides: 16 });
    m.lathe(`${s}lo`, [0.4, y * 3.8, 7.14], [0.4, y * 3.8, 7.02], [[1.36, 0], [1.36, 1]], C.G, { sides: 16 });
    m.lathe(`${s}lo`, [0.42, y * 3.82, 6.5], [0.42, y * 3.82, 6.38], [[1.36, 0], [1.36, 1]], C.G, { sides: 16 });
    m.ell(`${s}hand`, [0.45, y * 3.85, 6.15], [0.55, 0.55, 0.45], '#2a1420', { k: 0.1 });
    for (let f = -1; f <= 1; f++) m.spike(`${s}hand`, [0.6 + f * 0.1, y * 3.85 + f * 0.25, 5.85], [0.95 + f * 0.15, y * 3.9 + f * 0.42, 4.75], 0.15, C.PD, { sides: 4, tipColor: C.W });
    // Hood wings rising beside the head.
    triPlate(m, 'chest', [0.2, y * 0.9, 14.9], [-1, y * 1.05, 14], [-0.7, y * 3.1, 16.6], plateCol);
  }
  // Cowl, small gold mask, and the antennae: one long whip reaches down to the floor.
  m.ell('neck', [-0.45, 0, 15], [1.15, 1.35, 1.25], '#7e1854', { k: 0.3 });
  for (const [, y] of SIDES) triPlate(m, 'neck', [0.7, y * 0.5, 16.2], [-1.3, y * 1, 16], [0.25, y * 1.5, 13.5], plateCol, 10, 8);
  m.ell('head', [0.5, 0, 15.15], [0.5, 0.5, 0.65], C.G, { k: 0.2 });
  m.ell('head', [0.85, 0, 15.2], [0.22, 0.34, 0.42], '#f0d48a', { k: 0.1 });
  for (const [, y] of SIDES) m.ball('head', [1.02, y * 0.16, 15.3], 0.06, '#6ff0a0', { em: 3.5, sides: 6, rings: 3 });
  for (const [, y] of SIDES) {
    const ctrl = y > 0 ? [-1, 2.1, 22.5] : [-1, -5, 25];
    const tip = y > 0 ? [-1.2, 3.8, 21] : [-2.5, -13, 0.4];
    const pts = bezN([0.1, y * 0.32, 15.9], ctrl, tip, 16);
    m.tube('head', pts, pts.map((_, i) => lerp(0.13, 0.05, i / pts.length)), '#3a1b1a', { sides: 5 });
  }
  const built = m.build({ cell: 0.1, smooth: 1, ao: 0.9, aoReach: 0.6 });
  built.legs = LEGS.length;
  return built;
}

export function animateSkeram(p, s) {
  p.reset();
  const t = s.t, m = s.mem;
  const walk = ease(m, 'walk', s.moving ? 1 : 0, s.dt, 6), raise = ease(m, 'raise', s.cast ? 1 : 0, s.dt, 6);
  const br = Math.sin(t * 1.3) * 0.02;
  p.o('robe', 0, 0, 0.12 * Math.sin(t * 1.6)).r('robe', 0, 0, 0.03 * Math.sin(t * 0.6));
  p.r('chest', 0, br, 0).r('head', 0.04 * Math.sin(t * 0.7), 0.06 * Math.sin(t * 0.9), 0.1 * Math.sin(t * 0.5));
  for (let i = 0; i < p.built.legs; i++) {
    const ph = t * (walk > 0.05 ? 9 : 2.2) + i * 2.1;
    const a = walk > 0.05 ? Math.sin(ph) * 0.4 * walk : Math.sin(ph) * 0.05;
    p.r(`leg${i}`, 0, a * 0.5, a);
  }
  const a = raise * (0.8 + 0.2 * Math.sin(t * 6));
  p.r('Lup', 0.1 + 0.3 * a, -2.1 * a, 0).r('Rup', -0.1 - 0.3 * a, -2.1 * a, 0).r('Llo', 0, -0.2 - 0.4 * a, 0).r('Rlo', 0, -0.2 - 0.4 * a, 0);
  p.evaluate();
}

// ---- Moam: an obsidian winged sphinx, cut facets of black glass with gold-tipped feathers.
export function buildMoam() {
  const m = new ModelBuilder();
  const D = '#1c1636', L = '#4a3e7c', M = '#2c2452', GO = '#d7a640', GD = '#b5762a', RE = '#b23a1a';
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-5.5, 0, 6]);
  m.bone('chest', 'hips', [1.4, 0, 8.6]);
  m.bone('neck', 'chest', [3.2, 0, 11.4]);
  m.bone('head', 'neck', [4.7, 0, 14.1]);
  m.bone('jaw', 'head', [6, 0, 13.5]);
  m.bone('mouth', 'head', [7, 0, 13.7]);
  const tailP = [[-9, 0, 5.1], [-13, 0, 3.5], [-17, 0, 2.4], [-20.5, 0, 1.6]];
  tailP.forEach((p, i) => m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', p));
  for (const [s, y] of SIDES) {
    m.bone(`${s}w0`, 'chest', [-0.8, y * 3.2, 11.6]);
    m.bone(`${s}w1`, `${s}w0`, [-5, y * 10.8, 20]);
    m.bone(`${s}fu`, 'chest', [2.6, y * 2.7, 7.3]); m.bone(`${s}fl`, `${s}fu`, [2.8, y * 3, 3.3]);
    m.bone(`${s}bu`, 'hips', [-6, y * 2.6, 5.6]); m.bone(`${s}bl`, `${s}bu`, [-4.8, y * 2.9, 2.8]);
  }
  // Body: deep chest, rising to a proud neck, thin waist, heavy haunches.
  m.ell('chest', [1.5, 0, 8.7], [4.2, 3.6, 4], M, { k: 1 });
  m.ell('chest', [3.2, 0, 7.6], [2.3, 2.8, 2.8], D, { k: 0.8 });
  m.ell('hips', [-2.3, 0, 7.2], [4.7, 3, 2.8], M, { k: 0.9 });
  m.ell('hips', [-6.2, 0, 6.3], [3.3, 3.2, 3], D, { k: 0.8 });
  m.blob('neck', [2.8, 0, 10], [4.5, 0, 13.5], 2.1, 1.25, M, { k: 0.7 });
  // Head: tall brow, hooked beak.
  m.ell('head', [5, 0, 14.5], [1.55, 1.35, 1.45], D, { k: 0.5 });
  m.blob('head', [5.9, 0, 14.5], [7.8, 0, 13.4], 0.82, 0.35, D, { k: 0.3 });
  m.tube('head', bezN([6.9, 0, 13.9], [8.4, 0, 13.8], [8, 0, 12.2], 5), [0.42, 0.32, 0.24, 0.16, 0.09, 0.01], '#1a1525', { sides: 7 });
  m.blob('jaw', [6, 0, 13.25], [7.2, 0, 12.75], 0.5, 0.22, D, { k: 0.2 });
  for (const [s, y] of SIDES) {
    m.ball('head', [6.05, y * 1.0, 15], 0.17, '#ffd66a', { em: 4 });
    // Gold nemes wings with a red inlay, sweeping back from the crown.
    const goldCol = (u, v) => (u > 0.88 || v < 0.08 || v > 0.92 ? '#f0c65a' : fract((u + v * 0.5) * 5) < 0.3 ? RE : mix(GO, GD, u));
    triPlate(m, 'head', [6.7, y * 0.3, 15.9], [5.6, y * 1.2, 13.4], [1.3, y * 1.55, 16.5], goldCol, 14, 10);
    triPlate(m, 'head', [5.4, y * 1.35, 15.2], [4.3, y * 1.45, 13.1], [2.4, y * 2.6, 10.5], goldCol, 14, 10);
    // Crest of dark quills down the back of the neck.
    for (let i = 0; i < 5; i++) {
      m.spike('neck', [3.7 - i * 0.5, y * (0.4 + i * 0.15), 15.2 - i * 0.95], [0.9 - i * 0.7, y * (1.8 + i * 0.4), 18.2 - i * 1.5], 0.42, '#3d3262', { sides: 4 });
    }
    // Wing arm.
    const S = [-0.8, y * 3.2, 11.6], Wt = [-5, y * 10.8, 20], W = lerp3(S, Wt, 0.55);
    m.blob(`${s}w0`, S, W, 0.85, 0.45, M, { k: 0.4 });
    // Fan of long primaries: the top ones longest, black glass with gold ends.
    const feather = (bone, base, dir, len, w, c0, c1, tipFrac) => {
      const mk = (k) => [base[0] + dir[0] * len * k, base[1] + dir[1] * len * k, base[2] + dir[2] * len * k];
      m.tube(bone, [base, mk(0.34), mk(tipFrac - 0.01), mk(tipFrac), mk(tipFrac + 0.2), mk(1)], [w * 0.58, w, w, w * 0.95, w * 0.62, 0.012], [c0, c0, c0, c1, c1, c1], { sides: 4 });
    };
    const N = 24;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), phi = lerp(0.62, 1.8, t ** 0.75), L0 = lerp(17, 8, t ** 0.72);
      const base = lerp3(W, S, 0.02 + 0.95 * t), dir = [-Math.sin(phi) * 0.82, y * (0.62 - 0.5 * t), Math.cos(phi)];
      const dl = Math.hypot(...dir), d = dir.map((v) => v / dl);
      feather(`${s}w0`, base, d, L0, 0.55 + 0.45 * Math.min(1, t * 3), i % 3 === 0 ? D : (i % 3 === 1 ? L : M), GO, 0.68);
    }
    // Coverts and small scapulars laid over them.
    const NC = 20;
    for (let i = 0; i < NC; i++) {
      const t = i / (NC - 1), phi = lerp(0.5, 1.65, t), base = lerp3(W, S, 0.02 + 0.96 * t);
      const dir = [-Math.sin(phi) * 0.85, y * (0.6 - 0.45 * t), Math.cos(phi) + 0.1], dl = Math.hypot(...dir);
      const d = dir.map((v) => v / dl);
      const off = [base[0] - 0.5, base[1] + y * 0.4, base[2]];
      feather(`${s}w0`, off, d, lerp(10.5, 5.5, t), 1.05, i % 2 ? M : L, L, 0.97);
      feather(`${s}w0`, off, d, lerp(5.6, 3.2, t), 1.25, i % 2 ? L : D, L, 0.97);
    }
    // Legs: straight forelimbs and bent haunches with gold cuffs and big claws.
    m.blob(`${s}fu`, [2.6, y * 2.7, 7.6], [2.8, y * 3, 3.4], 1.25, 0.8, M, { k: 0.45 });
    m.blob(`${s}fl`, [2.8, y * 3, 3.4], [2.9, y * 3.1, 1], 0.8, 0.62, D, { k: 0.25 });
    m.blob(`${s}bu`, [-6.2, y * 2.8, 6.4], [-5, y * 2.95, 3.1], 1.95, 0.92, M, { k: 0.55 });
    m.blob(`${s}bl`, [-5, y * 2.95, 3.1], [-5.8, y * 3.05, 0.9], 0.85, 0.62, D, { k: 0.25 });
    for (const [bone, c] of [[`${s}fl`, [2.9, y * 3.1, 1.4]], [`${s}bl`, [-5.75, y * 3.05, 1.3]]]) {
      m.lathe(bone, [c[0], c[1], c[2] - 0.5], [c[0], c[1], c[2] + 0.5], [[0.82, 0], [0.95, 0.5], [0.82, 1]], GO, { sides: 12 });
      m.lathe(bone, [c[0], c[1], c[2] - 0.1], [c[0], c[1], c[2] + 0.12], [[0.98, 0], [0.98, 1]], RE, { sides: 12 });
      m.ell(bone, [c[0] + 0.6, c[1], 0.5], [1.5, 1.1, 0.55], D, { k: 0.25 });
      for (let f = -1; f <= 1; f++) m.spike(bone, [c[0] + 1, c[1] + f * 0.62, 0.42], [c[0] + 2.7, c[1] + f * 0.95, 0.03], 0.27, '#14101e', { bend: [0, 0, 0.3], sides: 4 });
    }
    // Gold chest band with the buckles at the shoulders.
    m.lathe('chest', [1.5, y * 3.55, 8.6], [1.55, y * 3.95, 8.35], [[1, 0], [0.8, 1]], GO, { sides: 10 });
  }
  m.lathe('chest', [1.5, 0, 7.9], [1.5, 0, 8.9], [[3.75, 0], [3.9, 0.5], [3.72, 1]], '#0f0d16', { sides: 3 });
  m.lathe('chest', [3.4, 0, 11.1], [3.1, 0, 12], [[2.2, 0], [2.3, 0.5], [2, 1]], GO, { sides: 16 });
  // Tail, long and thin, ending in a spearhead.
  m.tube('tail0', [[-8, 0, 5.4], tailP[0]], [1.1, 0.6], M, { sides: 7 });
  m.tube(['tail0', 'tail1', 'tail2', 'tail3'], tailP, [0.6, 0.46, 0.34, 0.28], D, { sides: 6 });
  const s0 = tailP[3];
  m.lathe('tail3', s0, [s0[0] - 3, s0[1], s0[2] - 0.45], [[0.15, 0], [0.8, 0.3], [0.35, 0.72], [0.02, 1]], '#3d3262', { sides: 4 });
  return m.build({
    cell: 0.14, smooth: 1, ao: 0.8, aoReach: 1,
    paint(v) { const n = noise3(v.x * 1.15, v.y * 1.15, v.z * 1.15), n2 = noise3(v.x * 3.1, v.y * 3.1 + 4, v.z * 3.1); const c = mix(D, L, clamp((Math.floor(n * 6) / 5) ** 1.25 * 1.2)); const c2 = mix(c, M, n2 * 0.4); v.color[0] = c2[0]; v.color[1] = c2[1]; v.color[2] = c2[2]; },
  });
}

function animateMoam(p, s) {
  p.reset();
  const t = s.t, m = s.mem;
  const walk = ease(m, 'walk', s.moving ? 1 : 0, s.dt, 7), c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 7);
  const br = Math.sin(t * 1.2) * 0.02;
  p.r('chest', 0, br - 0.16 * c, 0.02 * Math.sin(t * 0.7));
  p.r('neck', 0, 0.03 * Math.sin(t * 0.9) + 0.1 * c, 0.03 * Math.sin(t * 0.6)).r('head', 0, 0.05 * Math.sin(t * 0.8) - 0.2 * c, 0.06 * Math.sin(t * 0.5));
  p.r('jaw', 0, 0.15 + 0.1 * Math.sin(t * 2.3) + 0.5 * c, 0);
  for (let i = 0; i < 4; i++) p.r(`tail${i}`, 0, 0, 0.07 * Math.sin(t * 1.1 + i * 0.9));
  for (const [sd, y] of SIDES) {
    const fl = 0.05 * Math.sin(t * 1.3 + y) + 0.5 * c;
    p.r(`${sd}w0`, y * fl, 0.04 * Math.sin(t * 1.3), 0);
  }
  if (walk > 0.01) {
    const w = t * 6, a = Math.sin(w) * walk * 0.55, b = Math.cos(w) * walk;
    p.r('Lfu', 0, -a, 0).r('Rbu', 0, -a, 0).r('Rfu', 0, a, 0).r('Lbu', 0, a, 0).r('Lfl', 0, Math.max(0, b) * 0.6, 0).r('Rbl', 0, Math.max(0, b) * 0.6, 0).r('Rfl', 0, Math.max(0, -b) * 0.6, 0).r('Lbl', 0, Math.max(0, -b) * 0.6, 0);
    p.o('hips', 0, 0, Math.abs(a) * 0.35);
  }
  p.evaluate();
}

// ---- Viscidus: a heap of green ooze wearing a skull and a fan of long bones.
export function buildViscidus() {
  const m = new ModelBuilder();
  const G = '#46c854', T = '#34d486', LT = '#b4f09a', D = '#1e8f45', BN = '#dcc898', BND = '#a58a55';
  m.bone('root', null, [0, 0, 0]);
  m.bone('body', 'root', [0, 0, 3]);
  m.bone('skull', 'body', [2.6, 0, 8.1]);
  m.bone('jaw', 'skull', [3.5, 0, 7.5]);
  m.bone('mouth', 'skull', [4.3, 0, 7.4]);
  const lobes = [[1.2, 7.8, 8], [2.6, 5.6, 6.5], [-2.3, 6.8, 7.6], [0.2, -3.3, 7.4], [-1, -7.2, 8.2], [2.8, -6.5, 7], [4, -3.5, 5.8], [-5.8, -0.5, 7.5], [-4, 4.6, 7.2], [6.8, 0.6, 7.4]];
  lobes.forEach((l, i) => m.bone(`w${i}`, 'body', [l[0], l[1], 0.6]));
  // The heap: a flat pool, a sagging mound, a neck of slime holding the skull up.
  m.ell('body', [0, 0, 1.1], [7.2, 7, 1.5], G, { k: 1.6 });
  m.ell('body', [-0.5, 0, 3.1], [5.1, 4.8, 2.7], G, { k: 1.4 });
  m.blob('body', [-0.4, 0, 4.4], [1.1, 0, 7.8], 3.7, 1.75, G, { k: 1 });
  lobes.forEach((l, i) => {
    const dx = l[0], dy = l[1], d = Math.hypot(dx, dy) || 1;
    m.ell(`w${i}`, [dx, dy, 0.5], [Math.abs(dx) / d * 1.5 + 1.2, Math.abs(dy) / d * 1.5 + 1.2, 0.6 + (i % 3) * 0.12], i % 2 ? T : G, { k: 1.1 });
    if (i % 3 === 0) m.ell(`w${i}`, [dx * 1.18, dy * 1.18, 0.28], [1.05, 1.05, 0.35], G, { k: 0.5 });
  });
  for (const [x, y, z, r] of [[3.4, 3, 3.2, 1.3], [-2.4, -3.6, 4.1, 1.2], [-3.3, 2.9, 3.9, 1.1], [3.2, -2.4, 4.3, 1.2], [-1.1, 0.5, 6.3, 1.1], [1.1, -2.1, 5.8, 0.9], [5, 1, 1.8, 1.25], [-1, 4.8, 2.2, 1.2], [0.7, -5.6, 2, 1.25]]) m.ell('body', [x, y, z], [r, r, r * 0.7], T, { k: 1.6 });
  // Skull: cranium, cheekbones, sockets with one bright cyan eye, teeth, and a slack open jaw.
  m.ell('skull', [2.7, 0, 9.1], [1.95, 1.65, 1.7], BN, { k: 0.35 });
  m.ell('skull', [3.85, 0, 8.3], [1.2, 1.3, 1.05], BN, { k: 0.3 });
  m.ell('skull', [4.5, 0, 7.6], [0.56, 0.96, 0.4], BN, { k: 0.2 });
  for (const [, y] of SIDES) {
    m.ell('skull', [4.65, y * 0.62, 8.6], [0.4, 0.43, 0.42], '#0b0908', { k: 0.05 });
    m.ell('skull', [4.1, y * 1.28, 7.95], [0.56, 0.34, 0.33], BN, { k: 0.15 });
  }
  m.ball('skull', [4.95, 0.62, 8.65], 0.19, '#2cf2e0', { em: 8 });
  m.ball('skull', [4.95, -0.62, 8.65], 0.12, '#2cc0c0', { em: 3 });
  m.ell('skull', [5.1, 0, 7.98], [0.16, 0.27, 0.24], '#0b0908', { k: 0.05 });
  for (let i = 0; i < 8; i++) { const y = -0.76 + i * 0.22; m.tri([4.65 + (0.76 - Math.abs(y)) * 0.42, y + 0.1, 7.42], [4.65 + (0.76 - Math.abs(y)) * 0.42, y - 0.1, 7.42], [4.74 + (0.76 - Math.abs(y)) * 0.42, y, 6.82], '#f2e8c8', 0, ['skull'], true); }
  m.ell('skull', [3.85, 0, 7.15], [0.85, 0.92, 0.42], '#3d120e', { k: 0.1 });
  m.blob('jaw', [3.3, 0, 6.65], [4.65, 0, 6], 0.55, 0.32, BN, { k: 0.22 });
  m.ell('jaw', [4.3, 0, 6.18], [0.85, 0.85, 0.28], BN, { k: 0.2 });
  for (let i = 0; i < 7; i++) { const y = -0.66 + i * 0.22; m.tri([4.4 + (0.66 - Math.abs(y)) * 0.4, y + 0.09, 6.32], [4.4 + (0.66 - Math.abs(y)) * 0.4, y - 0.09, 6.32], [4.44 + (0.66 - Math.abs(y)) * 0.4, y, 6.72], '#efe5c5', 0, ['jaw'], true); }
  // A dark green drool sheet under the chin.
  for (const [y, len] of [[-0.6, 1.7], [0.1, 2.6], [0.72, 1.4]]) m.tube('skull', [[3.65, y, 6.05], [3.72, y + 0.05, 6.05 - len * 0.5], [3.62, y, 6.05 - len]], [0.2, 0.15, 0.03], '#0a6444', { sides: 5 });
  // The fan of long bones out of the back of the skull.
  const RODS = [[-0.9, 0.6, 1.05], [-1.25, 0.95, 0.75], [-1.55, 1.1, 0.3], [-1.75, 0.6, -0.1], [-0.75, -1.35, 0.5]];
  RODS.forEach(([dx, dy, dz], i) => {
    const b = [1.6 + dx * 0.25, dy * 0.6, 10.2 - i * 0.16], len = 4.2 + (i === 4 ? -0.6 : (i < 2 ? 0.9 : 0)), e = [b[0] + dx * len, b[1] + dy * len, b[2] + dz * len];
    m.tube('skull', [b, lerp3(b, e, 0.5), e], [0.42, 0.34, 0.22], [BND, BN, '#efe0b0'], { sides: 5 });
    m.ball('skull', e, 0.24, '#f2e6bd', { sides: 5, rings: 3 });
  });
  return m.build({
    cell: 0.13, smooth: 2, ao: 0.6, aoReach: 1.2,
    paint(v) {
      if (v.color[0] > 0.45) return; // bone keeps its colour
      const n = noise3(v.x * 0.62, v.y * 0.62, v.z * 0.8), n2 = noise3(v.x * 1.9 + 3, v.y * 1.9, v.z * 2.2);
      let c = mix(D, G, sstep(0.25, 0.6, n)); c = mix(c, T, sstep(0.5, 0.82, n2));
      c = mix(c, LT, sstep(0.72, 0.9, n) * sstep(0.3, 0.9, v.nz) * 0.85);
      if (n < 0.22 && v.z < 2.4) c = mix(c, '#6a5a3a', 0.45);
      v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2];
    },
  });
}

function animateViscidus(p, s) {
  p.reset();
  const t = s.t, m = s.mem, c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 6), walk = ease(m, 'walk', s.moving ? 1 : 0, s.dt, 6);
  p.o('body', 0, 0, 0.05 * Math.sin(t * 1.8) - 0.1 * c).r('body', 0.02 * Math.sin(t * 1.1), 0.02 * Math.sin(t * 1.3), 0);
  p.r('skull', 0.05 * Math.sin(t * 0.9), 0.05 * Math.sin(t * 1.2) - 0.22 * c, 0.1 * Math.sin(t * 0.6));
  p.r('jaw', 0, 0.28 + 0.1 * Math.sin(t * 2.1) + 0.3 * c, 0);
  for (let i = 0; i < 10; i++) { const k = 0.09 * Math.sin(t * (1.6 + (i % 3) * 0.3) + i * 1.7) + walk * 0.05 * Math.sin(t * 6 + i); p.o(`w${i}`, 0, 0, k); }
  p.evaluate();
}

// ---- Ouro: a towering sandworm of stacked armoured rings.
export function buildOuro() {
  const m = new ModelBuilder();
  const TAN = '#deae76', DK = '#2e150c', RIB = '#b5692c', RIBD = '#83451e', RED = '#ad2a1c', REDD = '#751a14', SAND = '#a98a58';
  m.bone('root', null, [0, 0, 0]);
  const N = 7, SEG = 2.45, top = 2 + N * SEG;
  for (let i = 0; i < N; i++) m.bone(`s${i}`, i ? `s${i - 1}` : 'root', [0, 0, 1.6 + i * SEG]);
  m.bone('head', `s${N - 1}`, [0.4, 0, top - 0.3]);
  m.bone('jaw', 'head', [2, 0, top + 0.5]);
  m.bone('mouth', 'head', [3.6, 0, top + 1.2]);

  // Stacked rings, each one a ribbed collar under a tan chevron plate with a dark zigzag lip.
  const R = (i) => lerp(4.7, 3.05, i / (N - 1));
  for (let i = 0; i < N; i++) {
    const z0 = 1.6 + i * SEG, z1 = z0 + SEG + 0.5, r0 = R(i) * 1.07, r1 = R(Math.min(N - 1, i + 1)) * 1.02 + 0.22;
    patch(m, `s${i}`, 60, 9, (u, v) => {
      const a = u * 2 * PI, r = lerp(r0, r1, v), z = lerp(z0, z1, v);
      return [Math.cos(a) * r, Math.sin(a) * r, z];
    }, (u, v) => { const rib = fract(u * 26) < 0.12; const base = mix(RIB, RIBD, 0.3 + Math.abs(Math.sin(u * 13)) * 0.4); return v < 0.14 ? DK : rib ? mix(base, DK, 0.55) : base; });
    // Zigzag chevron plate over the ring's top: points hang on the ring below.
    const zc = z1 + 0.05, depth = 1.15;
    patch(m, `s${i}`, 120, 6, (u, v) => {
      const a = u * 2 * PI, dir = (v - 0.5) * 2;
      const zig = Math.abs(fract(u * 8 + 0.0625) - 0.5) * 2;
      const zbot = zc - depth * (0.42 + 0.75 * zig), r = (r1 + 0.28) + (1 - v) * 0.5;
      return [Math.cos(a) * r, Math.sin(a) * r, lerp(zbot, zc + 0.05, v)];
    }, (u, v) => (v < 0.2 ? DK : mix(TAN, '#f0c48a', v)));
  }
  // Head: a red carapace hood over a wide fanged mouth.
  const hz = top + 1.3;
  m.ell('head', [0.4, 0, hz + 0.2], [3.9, 4.3, 2.1], RED, { k: 0.8 });
  m.ell('head', [1.5, 0, hz - 0.2], [2.9, 3.4, 1.65], REDD, { k: 0.5 });
  // Crest and side spines.
  m.lathe('head', [1.1, 0, hz + 1.3], [2.2, 0, hz + 3.9], [[1.4, 0], [0.5, 0.75], [0.03, 1]], '#c43a24', { sides: 4 });
  for (const [, y] of SIDES) {
    m.spike('head', [-0.4, y * 3.5, hz + 0.7], [-2, y * 7.2, hz + 2.1], 0.8, RED, { sides: 4, bend: [0.2, 0, 0.3] });
    m.spike('head', [1.8, y * 3.2, hz + 0.1], [3, y * 6.6, hz - 1.3], 0.7, RED, { sides: 4, bend: [0.3, 0, -0.2] });
    m.ball('head', [3.5, y * 2.3, hz + 0.75], 0.36, '#ffb838', { em: 2.8 });
  }
  // Mouth: dark maw lined with rows of pale teeth, red lower lip.
  m.ell('jaw', [2.5, 0, hz - 1.5], [2, 3, 0.75], RED, { k: 0.3 });
  m.ell('head', [3.5, 0, hz - 0.75], [1.15, 2.5, 0.6], '#120708', { k: 0.1 });
  for (let i = 0; i < 14; i++) {
    const a = -1.15 + i * 0.177;
    m.spike('head', [3.5 + Math.cos(a) * 0.82 - 0.6, Math.sin(a) * 2.6, hz - 0.15], [3.95 + Math.cos(a) * 0.82 - 0.6, Math.sin(a) * 2.55, hz - 1.3], 0.22, '#eadfbe', { sides: 3 });
    m.spike('jaw', [3.5 + Math.cos(a) * 0.82 - 0.7, Math.sin(a) * 2.5, hz - 1.45], [3.85 + Math.cos(a) * 0.82 - 0.7, Math.sin(a) * 2.5, hz - 0.55], 0.18, '#d8cfae', { sides: 3 });
  }
  // Three pairs of thin red limbs spiked along the upper body.
  const ARMS = [[N - 2, 8.2, 3.6], [N - 3, 7.1, 1.7], [N - 4, 6, -0.2]];
  ARMS.forEach(([s, out, up], k) => {
    for (const [sd, y] of SIDES) {
      const z = 1.6 + s * SEG + 1.3;
      const sh = [0.5, y * R(s) * 0.92, z], el = [1.2, y * (R(s) + out * 0.5), z + up * 0.9 + 0.8], hand = [1.8, y * (R(s) + out), z + up + 2];
      m.bone(`${sd}a${k}`, `s${s}`, sh); m.bone(`${sd}b${k}`, `${sd}a${k}`, el);
      const spiky = (a, b, r0, bone) => {
        const P = bezN(a, lerp3(a, b, 0.5), b, 5);
        m.tube(bone, P, [r0, r0 * 1.25, r0 * 0.8, r0 * 1.2, r0 * 0.7, r0 * 0.5], RED, { sides: 5 });
        for (const t of [0.35, 0.7]) { const q = lerp3(a, b, t); m.spike(bone, q, [q[0] + 0.15, q[1] + y * 0.6, q[2] + 0.75], 0.2, '#d03a22', { sides: 3 }); }
      };
      spiky(sh, el, 0.46, `${sd}a${k}`);
      spiky(el, hand, 0.34, `${sd}b${k}`);
      m.lathe(`${sd}b${k}`, hand, [hand[0] + 0.15, hand[1] + y * 1.35, hand[2] + 1.3], [[0.4, 0], [0.42, 0.25], [0.04, 1]], REDD, { sides: 4 });
    }
  });
  // Sand mound the worm bursts from.
  m.ell('root', [0, 0, 0.5], [7.4, 7.3, 1.75], SAND, { k: 0.8 });
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.2, d = 4.6 + (i % 3) * 1.1, r = 1.45 + (i % 2) * 0.9;
    m.ell('root', [Math.cos(a) * d, Math.sin(a) * d, 0.75 + (i % 2) * 0.35], [r, r * 0.92, 0.95 + (i % 3) * 0.3], i % 2 ? '#8c6c44' : SAND, { k: 0.35 });
  }
  const built = m.build({ cell: 0.15, smooth: 1, ao: 0.9, aoReach: 1.1, paint(v) { if (v.bone === 0) { const n = noise3(v.x * 1.4, v.y * 1.4, v.z * 2); const k = 0.82 + n * 0.32; v.color[0] *= k; v.color[1] *= k; v.color[2] *= k; } } });
  built.segN = N;
  return built;
}

function animateOuro(p, s) {
  p.reset();
  const t = s.t, m = s.mem, c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 6);
  const N = p.built.segN;
  for (let i = 0; i < N; i++) p.r(`s${i}`, 0.016 * Math.sin(t * 1.1 + i * 0.55), 0.02 * Math.sin(t * 0.8 + i * 0.5) + (i > 3 ? 0.045 * c : 0), 0.025 * Math.sin(t * 0.7 + i * 0.4));
  p.r('head', 0, 0.08 * Math.sin(t * 1.3) + 0.3 * c, 0.1 * Math.sin(t * 0.9));
  p.r('jaw', 0, 0.12 + 0.08 * Math.sin(t * 2.2) + 0.55 * c, 0);
  for (const [sd, y] of SIDES) for (let k = 0; k < 3; k++) {
    p.r(`${sd}a${k}`, y * 0.1 * Math.sin(t * 2.4 + k * 1.3), 0.08 * Math.sin(t * 1.7 + k), y * 0.08 * Math.sin(t * 2 + k * 0.9));
    p.r(`${sd}b${k}`, y * (0.12 * Math.sin(t * 3 + k * 2) + 0.2 * c), 0, 0);
  }
  p.evaluate();
}

// ---- C'Thun: the great dome of flesh, crowned in bone, staring out of two huge eyes.
export function buildCThun() {
  const m = new ModelBuilder();
  const F = '#d4b39a', FD = '#a08674', BONE = '#e8dcc4', TAN = '#c9a878', BR = '#6a4227', BRD = '#3e2616', GO = '#c9962e', LID = '#7a5526';
  m.bone('root', null, [0, 0, 0]);
  m.bone('dome', 'root', [0, 0, 8]);
  m.bone('jaw', 'dome', [16, 0, 1.5]);
  m.bone('mouth', 'dome', [15.5, 0, 6]);
  m.bone('Leye', 'dome', [12.2, 4.6, 9.6]); m.bone('Reye', 'dome', [12.2, -4.6, 9.6]);

  // The dome, slumped on the floor.
  m.ell('dome', [0, 0, 9.5], [15.5, 14.8, 11.5], F, { k: 2 });
  m.ell('dome', [3, 0, 4.2], [14, 15, 4.6], FD, { k: 2.4 });
  for (const [x, y, z, r] of [[-3, 8, 13, 3.4], [-3, -8, 13, 3.4], [6, 11, 7.5, 3], [6, -11, 7.5, 3], [11.6, 0, 13.5, 2.6], [-9, 0, 15, 3.4]]) m.ell('dome', [x, y, z], [r, r, r * 0.8], F, { k: 1.8 });

  // The crown: a row of great bone spikes across the top, tallest in the middle.
  const crown = 13;
  for (let i = 0; i < crown; i++) {
    const a = ((i + 0.5) / crown - 0.5) * 3.1, big = 1 - Math.abs(a) / 1.7;
    const x = lerp(5.5, 1, Math.abs(a) / 1.6) + 1.5, y = Math.sin(a) * 13.4, z = 19.2 - a * a * 2.3;
    const h = lerp(5.5, 11.5, big), r = lerp(1.15, 2.1, big), dx = lerp(0.6, 2.1, Math.abs(a) / 1.6), tip = [x + dx, y * 1.14, z + h];
    m.tube('dome', [[x - 0.6, y * 0.96, z - 1.4], [x, y, z], [lerp(x, tip[0], 0.35), lerp(y, tip[1], 0.35), lerp(z, tip[2], 0.35)], [lerp(x, tip[0], 0.72), lerp(y, tip[1], 0.72), lerp(z, tip[2], 0.72)], tip], [r * 1.25, r, r * 0.68, r * 0.34, 0.03], [BR, BR, TAN, BONE, '#fff9e6'], { sides: 6 });
  }
  // Small purple eyes around the crown.
  for (const [x, y, z, r] of [[11, 3.1, 15.6, 0.95], [11, -3.1, 15.6, 0.95], [5.8, 10.1, 15.2, 1], [5.8, -10.1, 15.2, 1], [10.6, 8.7, 13.8, 0.8], [10.6, -8.7, 13.8, 0.8], [0.6, 12.9, 16.8, 0.85], [0.6, -12.9, 16.8, 0.85]]) {
    const d = [x / 13, y / 13, 0.4].map((v, i, a) => v / Math.hypot(...a));
    m.lathe('dome', [x - d[0] * 0.6, y - d[1] * 0.6, z - d[2] * 0.6], [x + d[0] * 0.05, y + d[1] * 0.05, z + d[2] * 0.05], [[r * 1.4, 0], [r * 1.35, 1]], TAN, { sides: 12 });
    m.ball('dome', [x + d[0] * 0.5, y + d[1] * 0.5, z + d[2] * 0.5], r * 0.9, '#7f7cf0', { em: 2.8 });
    m.ball('dome', [x + d[0] * 1.1, y + d[1] * 1.1, z + d[2] * 1.1], r * 0.42, '#d8dcff', { em: 3.4, sides: 6, rings: 3 });
  }
  // The two great eyes: pale lavender glare under a heavy gold-brown lid.
  for (const [sd, y] of SIDES) {
    const c = [13.1, y * 4.6, 9.5];
    m.ball(`${sd}eye`, c, 3, '#c6b4ec', { em: 0.75 });
    const shell = (az, r) => (u, v) => {
      const a = (u - 0.5) * az, ev = v;
      return [c[0] + Math.cos(ev) * Math.cos(a) * r, c[1] + Math.cos(ev) * Math.sin(a) * r, c[2] + Math.sin(ev) * r];
    };
    // Heavy upper lid, gold along its edge.
    patch(m, `${sd}eye`, 26, 10, (u, v) => shell(1.9, 3.16)(u, lerp(0.05, 1.3, v)), (u, v) => (v < 0.12 ? GO : v > 0.84 ? GO : mix(LID, '#a07630', Math.abs(Math.sin(u * 22)) * 0.4)));
    // Lower lid.
    patch(m, `${sd}eye`, 26, 6, (u, v) => shell(1.9, 3.12)(u, lerp(-0.52, -1.25, v)), (u, v) => (v < 0.22 ? GO : FD));
    // Horizontal slit pupil across the bare eye, gold-rimmed.
    patch(m, `${sd}eye`, 24, 4, (u, v) => shell(1.75, 3.2)(u, lerp(-0.26, -0.03, v)), (u, v) => (Math.abs(v - 0.5) * 2 < 0.5 ? '#160c06' : '#c8882a'), { em: (u, v) => (Math.abs(v - 0.5) * 2 < 0.5 ? 0 : 0.5) });
    // Banded spikes standing proud of the mid-body.
    for (const [x, yy, z, dx, dy, dz, r] of [[9.4, y * 8.2, 11, 3.2, y * 3, 1, 0.82], [13.2, y * 1.3, 15, 2.4, y * 0.6, 3, 0.8], [4, y * 13.8, 10, 1.4, y * 4, 0.6, 1], [11, y * 12, 6.5, 2.2, y * 3.8, 0.1, 1.05], [-3, y * 13.2, 12, 0.5, y * 3.4, 2.6, 0.9]]) {
      m.tube('dome', [[x - dx * 0.08, yy - dy * 0.08, z - dz * 0.08], [x + dx * 0.25, yy + dy * 0.25, z + dz * 0.25], [x + dx * 0.5, yy + dy * 0.5, z + dz * 0.5], [x + dx * 0.72, yy + dy * 0.72, z + dz * 0.72], [x + dx, yy + dy, z + dz]], [r, r * 0.86, r * 0.62, r * 0.36, 0.02], [BR, TAN, BONE, BR, BONE], { sides: 6 });
    }
    // Teeth in two rows either side of the beak.
    for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
      const yy = y * (4.1 + i * 0.86 + row * 0.25), z = 2.2 + row * 2.3 - i * 0.05, x = Math.sqrt(Math.max(0, 15.2 * 15.2 - yy * yy)) * 0.94;
      m.tri([x - 0.1, yy - y * 0.38, z + 1.05], [x - 0.1, yy + y * 0.38, z + 1.05], [x + 1.2, yy, z - 0.25], '#ecdfc4', 0, ['dome'], true);
    }
    // Heavy bony feet splayed on the floor.
    for (const [a, len] of [[0.5, 21], [0.98, 22.5], [1.5, 21], [2.2, 19.5]]) {
      const dir = [Math.cos(a), y * Math.sin(a)];
      const tip = [dir[0] * len, dir[1] * len, 0.2], b0 = [dir[0] * 12 - dir[1] * 3.8, dir[1] * 12 + dir[0] * 3.8, 3.4], b1 = [dir[0] * 12 + dir[1] * 3.8, dir[1] * 12 - dir[0] * 3.8, 3.4];
      m.ell('dome', [dir[0] * 12.5, dir[1] * 12.5, 1.5], [5.2, 5.2, 2.3], TAN, { k: 1.1 });
      triPlate(m, 'root', b0, b1, tip, (u, v) => (u > 0.72 ? BRD : u > 0.45 ? mix(BR, TAN, 0.3) : mix(TAN, BONE, Math.abs(Math.sin(v * 9)) * 0.5)), 10, 10);
      m.spike('root', [dir[0] * 16, dir[1] * 16, 1.6], [dir[0] * (len + 1.6), dir[1] * (len + 1.6), 0.05], 1.2, BONE, { sides: 5, tipColor: BRD });
    }
  }
  // The great brown beak plate at the base.
  const beakA = [16.4, 5, 0.6], beakB = [20, 0, 0.3], beakC = [16.4, -5, 0.6], beakApex = [16, 0, 12];
  m.tri(beakA, beakApex, beakB, BR, 0, ['jaw'], true);
  m.tri(beakB, beakApex, beakC, BR, 0, ['jaw'], true);
  m.tri([17.2, 3.7, 1.1], [16.3, 0, 10.2], [19.5, 0.05, 1.1], BRD, 0, ['jaw'], true);
  m.tri([19.5, -0.05, 1.1], [16.3, 0, 10.2], [17.2, -3.7, 1.1], BRD, 0, ['jaw'], true);
  m.tube('jaw', [beakA, beakApex, beakC], [0.42, 0.34, 0.42], BONE, { sides: 5 });
  m.tube('jaw', [[20.1, 0, 0.3], [16.15, 0, 11.7]], [0.36, 0.26], '#dcc8a2', { sides: 5 });

  const built = m.build({
    cell: 0.24, smooth: 1, ao: 0.7, aoReach: 1.8,
    paint(v) {
      if (v.color[0] > 0.7 || v.bone !== m.b('dome')) return;
      const n = noise3(v.x * 0.9, v.y * 0.9, v.z * 0.9), n2 = noise3(v.x * 4, v.y * 4, v.z * 4);
      let c = mix(FD, F, sstep(0.2, 0.65, n));
      if (n2 > 0.74) c = mix(c, '#5e4d58', 0.65);   // speckle
      // Yellow-green seam under the crown.
      const seam = Math.abs(v.z - (18.6 - (v.y * v.y) * 0.028)) < 0.55 + 0.25 * n && v.x > -6;
      if (seam) c = mix('#9a9a48', '#c8c070', n);
      v.color[0] = c[0]; v.color[1] = c[1]; v.color[2] = c[2];
    },
  });
  return built;
}

function animateCThun(p, s) {
  p.reset();
  const t = s.t, m = s.mem, c = ease(m, 'c', s.cast ? 1 : 0, s.dt, 5);
  p.r('dome', 0, 0.006 * Math.sin(t * 0.8), 0).o('dome', 0, 0, 0.1 * Math.sin(t * 0.9) - 0.08);
  p.s('dome', 1 + 0.006 * Math.sin(t * 1.3));
  p.r('jaw', 0, -0.05 + 0.02 * Math.sin(t * 1.7) - 0.28 * c, 0);
  const look = Math.sin(t * 0.37) * 0.12;
  p.r('Leye', 0, 0.02 * Math.sin(t * 0.8), look).r('Reye', 0, 0.02 * Math.sin(t * 0.8), look);
  p.evaluate();
}

function cthunFX(P, ctx) {
  const s = ctx.scale || 1;
  for (const y of [4.6, -4.6]) {
    const q = toWorld(ctx.M, [17, y, 9.5]);
    if (Math.random() < ctx.dt * 12) P.emit(q[0], q[1], q[2], 0, 0, 0.6, 0.5 * s, 0.4, 1.4, 0.8, 3.2, 0, 0.55, 0);
  }
}

// ---- Adds: small and quick to build; one mesh serves every add of an encounter.
function buildTentacle() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  for (let i = 0; i < 5; i++) m.bone(`s${i}`, i ? `s${i - 1}` : 'root', [0, 0, 1.2 * i]);
  for (let i = 0; i < 5; i++) m.tube(`s${i}`, [[0, 0, 1.2 * i], [0, 0, 1.2 * (i + 1)]], [1.05 - i * 0.14, 0.94 - i * 0.14], ['#3a2850', i % 2 ? '#4a3266' : '#2f2044'], { sides: 9 });
  m.ball('s4', [0.75, 0, 6.05], 0.55, '#d8c8ff', { em: 2.6 });
  m.ball('s4', [1.08, 0, 6.05], 0.25, '#2a1040', {});
  for (let f = -1; f <= 1; f++) m.spike('s4', [0.1, f * 0.3, 6.9], [-0.25 + f * 0.1, f * 1.1, 8.9], 0.26, '#2a1838', { sides: 4, tipColor: '#d8cfba' });
  return m.build();
}
function animateTentacle(p, s) { p.reset(); for (let i = 0; i < 5; i++) p.r(`s${i}`, 0.12 * Math.sin(s.t * 2 + i * 0.8), 0.14 * Math.sin(s.t * 1.7 + i * 0.9), 0.15 * Math.sin(s.t * 1.3 + i)); p.evaluate(); }

function buildGrub(col, col2, eye) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 0.6]);
  for (let i = 0; i < 5; i++) m.ell('body', [0.7 - i * 0.62, 0, 0.5 + Math.sin(i * 0.8) * 0.12], [0.46, 0.5 - i * 0.05, 0.45 - i * 0.03], i % 2 ? col : col2, { k: 0.1 });
  for (const y of [1, -1]) { m.ball('body', [1.05, y * 0.26, 0.72], 0.1, eye, { em: 2, sides: 5, rings: 3 }); for (let i = 0; i < 3; i++) m.tube('body', [[0.5 - i * 0.6, y * 0.4, 0.25], [0.6 - i * 0.6, y * 0.72, 0.02]], [0.05, 0.02], '#20161a', { sides: 3 }); }
  return m.build({ cell: 0.1, smooth: 1, ao: 0.8, aoReach: 0.3 });
}
const animateGrub = (p, s) => { p.reset(); p.o('body', 0, 0, 0.04 * Math.sin(s.t * 7)); p.r('body', 0, 0.05 * Math.sin(s.t * 7), 0.08 * Math.sin(s.t * 3)); p.evaluate(); };

function buildEgg() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 1.4]);
  m.ell('body', [0, 0, 1.45], [1.25, 1.25, 1.7], '#e8d0d0', { k: 0.3 });
  return m.build({ cell: 0.08, smooth: 1, ao: 0.4, aoReach: 0.4, paint(v) { if (noise3(v.x * 2.2, v.y * 2.2, v.z * 2.2) > 0.72) { v.color[0] = 0.62; v.color[1] = 0.5; v.color[2] = 0.48; } } });
}
const animateEgg = (p, s) => { p.reset(); p.r('body', 0.04 * Math.sin(s.t * 1.7), 0.04 * Math.sin(s.t * 2.1), 0); p.evaluate(); };

function buildGlob() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 0.7]);
  m.ell('body', [0, 0, 0.8], [1.3, 1.25, 0.95], '#2bbd7c', { k: 0.5 });
  m.ell('body', [0.4, 0.3, 1.1], [0.7, 0.7, 0.55], '#3fd8a0', { k: 0.4 });
  m.ell('body', [-0.5, -0.4, 0.5], [0.8, 0.7, 0.45], '#1b9a66', { k: 0.4 });
  return m.build({ cell: 0.08, smooth: 2, ao: 0.4, aoReach: 0.4 });
}
const animateGlob = (p, s) => { p.reset(); p.o('body', 0, 0, 0.12 * Math.abs(Math.sin(s.t * 4))); p.s('body', 1 + 0.05 * Math.sin(s.t * 6)); p.evaluate(); };

function buildManaFiend() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 1.8]);
  m.ell('body', [0, 0, 1.9], [0.75, 0.75, 1], '#5a7cf0', { k: 0.3, em: 0.9 });
  for (const [x, y, z, s] of [[0.5, 0.75, 2.5, 1.2], [0.5, -0.75, 2.5, 1.2], [-0.7, 0, 2.7, 1.5], [0.1, 0.1, 3.3, 1.7]]) m.spike('body', [x * 0.5, y * 0.5, z - 0.5], [x + x * s * 0.3, y + y * s * 0.3, z + s], 0.24, '#7fb0ff', { sides: 4, em: 1.2 });
  for (const y of [1, -1]) m.ball('body', [0.7, y * 0.3, 2.2], 0.1, '#fff0a8', { em: 6, sides: 5, rings: 3 });
  return m.build({ cell: 0.08, smooth: 1, ao: 0.2, aoReach: 0.3 });
}
const animateFiend = (p, s) => { p.reset(); p.o('body', 0, 0, 0.18 * Math.sin(s.t * 3)); p.r('body', 0, 0, s.t * 0.9); p.evaluate(); };

function buildScarab(shell = '#2c5a6a') {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 0.4]);
  m.ell('body', [-0.1, 0, 0.55], [0.75, 0.55, 0.42], shell, { k: 0.15 });
  m.ell('body', [0.6, 0, 0.45], [0.32, 0.36, 0.24], '#1a2a30', { k: 0.1 });
  for (const y of [1, -1]) for (let i = 0; i < 3; i++) m.tube('body', [[0.25 - i * 0.4, y * 0.4, 0.3], [0.3 - i * 0.45, y * 0.85, 0.02]], [0.06, 0.02], '#101416', { sides: 3 });
  m.spike('body', [0.75, 0, 0.5], [1.15, 0, 0.75], 0.08, '#b09030', { sides: 3 });
  return m.build({ cell: 0.06, smooth: 1, ao: 0.5, aoReach: 0.25 });
}
const animateScarab = (p, s) => { p.reset(); p.o('body', 0, 0, 0.02 * Math.sin(s.t * 12)); p.r('body', 0, 0, 0.1 * Math.sin(s.t * 7)); p.evaluate(); };

function buildGuard() {
  // A Qiraji soldier: Rajaxx's armour at infantry scale.
  const m = new ModelBuilder();
  bipedRig(m, { hip: 1.15, chest: 2, neck: 2.5, sw: 0.72, armU: 0.72, armL: 0.72, hipW: 0.32, shoulderDrop: 0.1, armOut: 0.25, headUp: 0.05, lean: 0.2, elbowF: 0.1, wristF: 0.18 });
  const INK = '#3a3158', GO = '#b89a4e', TAN = '#a2824c';
  m.ell('chest', [0.05, 0, 2.05], [0.42, 0.68, 0.48], INK, { k: 0.15 });
  m.ell('spine', [0.05, 0, 1.55], [0.3, 0.42, 0.4], INK, { k: 0.12 });
  m.ell('head', [0.25, 0, 2.72], [0.32, 0.3, 0.34], INK, { k: 0.1 });
  m.ball('head', [0.58, 0.14, 2.76], 0.05, '#ff5040', { em: 4, sides: 5, rings: 3 });
  m.ball('head', [0.58, -0.14, 2.76], 0.05, '#ff5040', { em: 4, sides: 5, rings: 3 });
  m.spike('head', [0.05, 0, 2.95], [0, 0, 3.8], 0.12, '#1a1630', { bend: [-0.1, 0, 0], sides: 4 });
  m.box('hips', [0.32, 0, 0.85], [0.08, 0.3, 1], INK, { taper: 0.7 });
  for (const [s, y] of SIDES) {
    const sh = [0, y * 0.72, 2.4], el = [0.1, y * 0.97, 1.68], wr = [0.28, y * 1.02, 0.96];
    m.ell('chest', [0, y * 0.75, 2.46], [0.28, 0.3, 0.2], GO, { k: 0.05 });
    m.spike('chest', [0, y * 0.9, 2.5], [-0.05, y * 1.4, 2.85], 0.09, GO, { sides: 4 });
    m.blob(`${s}up`, sh, el, 0.18, 0.15, TAN, { k: 0.06 });
    m.blob(`${s}lo`, el, wr, 0.17, 0.16, INK, { k: 0.05 });
    m.tube(`${s}hand`, [[wr[0], wr[1], wr[2]], [wr[0] + 0.1, wr[1], wr[2] - 0.5]], [0.14, 0.02], '#16121f', { sides: 4 });
    m.blob(`${s}th`, [0, y * 0.32, 1.1], [0.04, y * 0.34, 0.6], 0.2, 0.15, INK, { k: 0.08 });
    m.blob(`${s}sh`, [0.04, y * 0.34, 0.6], [0.02, y * 0.36, 0.08], 0.14, 0.12, INK, { k: 0.05 });
  }
  return m.build({ cell: 0.05, smooth: 1, ao: 0.8, aoReach: 0.25 });
}

// ---- registry
const boss = (built, animate, mat, scale, school, height, heroDist, more = {}) => ({ built, animate, mat, scale, mouth: 'mouth', school, height, heroDist, ...more });
const obsidianMat = { noise: 0.14, scales: 0.55, cracks: 0, rim: 0.3, paintF: 1.2, scaleF: 0.85, gloss: 0.5, crackF: 1 };
const slimeMat = { noise: 0.1, scales: 0, cracks: 0, rim: 0.55, paintF: 0.7, scaleF: 1, gloss: 0.95, crackF: 1 };
const fleshMat = { noise: 0.22, scales: 0, cracks: 0, rim: 0.28, paintF: 0.9, scaleF: 1, gloss: 0.3, crackF: 1 };

/** Phase one: the great Eye on its stalk, staring out from the pit. */
function buildCThunEye() {
  const m = new ModelBuilder();
  const flesh = '#b98f88', dark = '#5a3a55', lid = '#8d6a68';
  m.bone('root', null, [0, 0, 0]);
  const zs = [0, 4, 8, 12];
  zs.forEach((z, i) => m.bone(`stalk${i}`, i ? `stalk${i - 1}` : 'root', [0, 0, z]));
  m.bone('eye', 'stalk3', [0, 0, 19.5]);
  m.bone('mouth', 'eye', [11, 0, 19.5]);
  m.ell('root', [0, 0, 1], [11, 11, 3.4], dark, { k: 2 });
  for (let i = 0; i < 3; i++) m.blob(`stalk${i}`, [0, 0, zs[i]], [0, 0, zs[i + 1]], 4.6 - i * 0.7, 3.9 - i * 0.7, i ? flesh : dark, { k: 1 });
  m.blob('stalk3', [0, 0, 12], [0, 0, 16], 2.8, 3.4, flesh, { k: 0.9 });
  m.ell('eye', [0, 0, 19.5], [9.4, 9.8, 9.4], flesh, { k: 0.8 });
  // Heavy upper and lower lids frame the stare.
  m.ell('eye', [6.6, 0, 24.8], [3.6, 7.2, 1.9], lid, { k: 0.8 });
  m.ell('eye', [6.8, 0, 14.3], [3.2, 6.6, 1.5], lid, { k: 0.8 });
  m.ell('eye', [9, 0, 19.5], [1.25, 6.2, 5.4], '#f0e2c8', { k: 0.2 });
  m.ell('eye', [9.9, 0, 19.5], [0.75, 4.3, 4.3], '#9d2fa6', { k: 0.1, em: 0.8 });
  m.ball('eye', [10.5, 0, 19.5], 2.15, '#190612', { sides: 12, rings: 8 });
  m.ball('eye', [11.6, 0.7, 20.5], 0.45, '#ffd6ff', { em: 4, sides: 6, rings: 3 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r = 9.7;
    m.spike('eye', [Math.cos(a) * 2 - 1, Math.cos(a) * r * 0.86, 19.5 + Math.sin(a) * r * 0.86], [-6, Math.cos(a) * (r + 5), 19.5 + Math.sin(a) * (r + 5)], 0.85, '#d8c8a8', { sides: 5, bend: [0.8, 0, 0] });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, x = Math.cos(a) * 12.5, y = Math.sin(a) * 12.5;
    m.tube('root', [[x * 0.72, y * 0.72, 1.6], [x, y, 5.5], [x * 1.08, y * 1.08, 10.4], [x * 0.94, y * 0.94, 14]], [1.4, 1, 0.6, 0.1], [dark, dark, flesh, flesh], { sides: 6 });
  }
  return m.build({ cell: 0.3, smooth: 1, ao: 1, aoReach: 2.2 });
}
function animateCThunEye(p, s) {
  p.reset();
  const t = s.t, m = s.mem;
  m.c = (m.c ?? 0) + ((s.cast ? 1 : 0) - (m.c ?? 0)) * Math.min(1, s.dt * 6);
  for (let i = 1; i < 4; i++) p.r(`stalk${i}`, 0.04 * Math.sin(t * 0.6 + i), 0.05 * Math.sin(t * 0.7 + i * 1.3), 0);
  p.r('eye', 0, -0.08 * m.c + 0.03 * Math.sin(t * 0.9), 0.05 * Math.sin(t * 0.5));
  p.evaluate();
}

export const BOSSES = {
  'ruins-of-ahnqiraj/kurinnaxx': () => boss(buildKurinnaxx(), animateCrawler, shellMat, 0.78, 'poison', 10, 46),
  'ruins-of-ahnqiraj/general-rajaxx': () => boss(buildRajaxx(), animateBiped, clothMat, 1, 'shadow', 15, 24),
  'ruins-of-ahnqiraj/moam': () => boss(buildMoam(), animateMoam, obsidianMat, 1, 'arcane', 26, 42),
  'ruins-of-ahnqiraj/buru': () => boss(buildBuru(), animateBeetle, { ...shellMat, gloss: 0.5 }, 1.05, 'physical', 15, 28),
  'ruins-of-ahnqiraj/ayamiss': () => boss(buildAyamiss(), animateWasp, shellMat, 1, 'poison', 19, 30),
  'ruins-of-ahnqiraj/ossirian': () => boss(buildOssirian(), animateBiped, clothMat, 1, 'storm', 19, 24),
  'temple-of-ahnqiraj/skeram': () => boss(skeramMesh(), animateSkeram, clothMat, 1, 'arcane', 17, 30),
  'temple-of-ahnqiraj/bug-trio': makeBugTrio,
  'temple-of-ahnqiraj/sartura': () => boss(buildSartura(), animateBiped, clothMat, 1, 'physical', 15, 24),
  'temple-of-ahnqiraj/fankriss': () => boss(buildFankriss(), animateCrawler, shellMat, 0.92, 'poison', 8, 38),
  'temple-of-ahnqiraj/viscidus': () => boss(buildViscidus(), animateViscidus, slimeMat, 1, 'frost', 13, 26),
  'temple-of-ahnqiraj/huhuran': () => boss(buildHuhuran(), animateWasp, shellMat, 0.95, 'poison', 20, 30),
  'temple-of-ahnqiraj/twin-emperors': makeTwins,
  'temple-of-ahnqiraj/ouro': () => boss(buildOuro(), animateOuro, shellMat, 1, 'physical', 22, 36),
  'temple-of-ahnqiraj/cthun': () => boss(buildCThun(), animateCThun, fleshMat, 1, 'shadow', 28, 62, {
    glow: [1, 0.55, 2.2], glowR: 60, fx: cthunFX,
    variants: [{ key: 'eye', match: /^eye/i, make: () => boss(buildCThunEye(), animateCThunEye, fleshMat, 0.72, 'shadow', 28, 62, { glow: [1.4, 0.4, 2.6], glowR: 60, facePlayer: true }) }],
  }),
};

// One mesh per encounter serves every add it spawns.
const skeramMesh = memo(buildSkeram);
const hatchling = memo(() => buildGrub('#d8a83a', '#a5661e', '#201810'));
const larva = memo(() => buildGrub('#5a3a7a', '#7a4a8c', '#f0d060'));
const guard = memo(buildGuard), scarabs = memo(() => buildScarab('#2c5a6a'));
export const ADDS = {
  'ruins-of-ahnqiraj/general-rajaxx': () => ({ built: guard(), animate: animateBiped, mat: clothMat, scale: 1.1 }),
  'ruins-of-ahnqiraj/moam': () => ({ built: buildManaFiend(), animate: animateFiend, mat: shellMat, scale: 1 }),
  'ruins-of-ahnqiraj/buru': () => ({ built: buildEgg(), animate: animateEgg, mat: shellMat, scale: 1.1 }),
  'ruins-of-ahnqiraj/ayamiss': () => ({ built: larva(), animate: animateGrub, mat: shellMat, scale: 1.25 }),
  'temple-of-ahnqiraj/skeram': () => ({ built: skeramMesh(), animate: animateSkeram, mat: clothMat, scale: 1 }),
  'temple-of-ahnqiraj/bug-trio': () => ({ built: buildBeetle({ ...TRIO.vem, seed: 2, cell: 0.24 }), animate: animateBeetle, mat: { ...shellMat, gloss: 0.5 }, scale: 0.7 }),
  'temple-of-ahnqiraj/sartura': () => ({ built: guard(), animate: animateBiped, mat: clothMat, scale: 1.2 }),
  'temple-of-ahnqiraj/fankriss': () => ({ built: hatchling(), animate: animateGrub, mat: shellMat, scale: 1.1 }),
  'temple-of-ahnqiraj/viscidus': () => ({ built: buildGlob(), animate: animateGlob, mat: slimeMat, scale: 1 }),
  'temple-of-ahnqiraj/ouro': () => ({ built: scarabs(), animate: animateScarab, mat: shellMat, scale: 1.2 }),
  'temple-of-ahnqiraj/twin-emperors': () => ({ built: buildVeklorAdd(), animate: animateBiped, mat: clothMat, scale: 1 }),
  'temple-of-ahnqiraj/cthun': () => ({ built: buildTentacle(), animate: animateTentacle, mat: fleshMat, scale: 1 }),
};
