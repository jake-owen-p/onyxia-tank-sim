// Naxxramas, modelled from screenshots of the instance.
//  Spider wing: Anub'Rekhan, a blue crypt lord; Faerlina in orange and green; Maexxna.
//  Plague wing: Noth with his raised fists; Heigan's beard and skull; Loatheb the shaggy fungus.
//  Military wing: Razuvious's ice shoulders; Gothik's chains; the Four Horsemen on barded horses.
//  Construct wing: Patchwerk's open belly; Grobbulus's mutagen tubes; Gluth; Thaddius.
//  Frostwyrm Lair: Sapphiron's bare bones and Kel'Thuzad's halo.

import { ModelBuilder } from '../model.js';
import { SCHOOLS } from '../fx.js';
import { SIDES } from './biped.js';
import { animateDragon } from './dragon.js';

// ---- small maths and painting helpers
const HC = new Map();
const hex = (c) => { if (Array.isArray(c)) return c; let r = HC.get(c); if (!r) { const n = parseInt(c.slice(1), 16); r = [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; HC.set(c, r); } return r; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const tint = (v, c, k = 1) => { const C = hex(c); v.color[0] += (C[0] - v.color[0]) * k; v.color[1] += (C[1] - v.color[1]) * k; v.color[2] += (C[2] - v.color[2]) * k; };
const shade = (v, k) => { v.color[0] *= k; v.color[1] *= k; v.color[2] *= k; };
const wave = (x) => Math.abs(((x % 2) + 2) % 2 - 1);
const toWorld = (M, p) => [M[0] * p[0] + M[4] * p[1] + M[12], M[1] * p[0] + M[5] * p[1] + M[13], M[10] * p[2] + M[14]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mirrorY = (p) => [p[0], -p[1], p[2]];
const flat = (y, list) => (y > 0 ? list : list.map(mirrorY));

const MAT = {
  cloth: { noise: 0.22, scales: 0, cracks: 0, rim: 0.22, paintF: 1.6, scaleF: 1, gloss: 0.16, crackF: 0.6 },
  flesh: { noise: 0.3, scales: 0, cracks: 0, rim: 0.18, paintF: 1.1, scaleF: 1, gloss: 0.2, crackF: 0.6 },
  plate: { noise: 0.2, scales: 0, cracks: 0, rim: 0.34, paintF: 1.4, scaleF: 1, gloss: 0.5, crackF: 0.6 },
  chitin: { noise: 0.18, scales: 0, cracks: 0, rim: 0.4, paintF: 1.3, scaleF: 1, gloss: 0.62, crackF: 0.6 },
  fur: { noise: 0.5, scales: 0, cracks: 0, rim: 0.14, paintF: 2.6, scaleF: 1, gloss: 0.06, crackF: 0.6 },
  bone: { noise: 0.3, scales: 0, cracks: 0, rim: 0.34, paintF: 1.4, scaleF: 1, gloss: 0.34, crackF: 0.6 },
};

// ---- shared hard-part builders
/** A faceted plate: a fan from a raised centre to an outline, with a bright rim piped round it. */
function plate(m, bone, centre, outline, color, o = {}) {
  const b = [m.b(bone)], em = o.em || 0, n = outline.length;
  for (let i = 0; i < n; i++) m.tri(centre, outline[i], outline[(i + 1) % n], color, em, b, true);
  if (o.trim) m.tube(bone, [...outline, outline[0]], o.trimR ?? 0.07, o.trim, { sides: 4, em: o.trimEm || 0 });
  return m;
}
/** A blade: stations along its centre, half-widths at each, and `perp` the direction of its edge. */
function blade(m, bone, pts, widths, thick, perp, colors, o = {}) {
  const b = [m.b(bone)], n = pts.length, cols = Array.isArray(colors) ? colors : pts.map(() => colors);
  const ring = pts.map((p, i) => {
    const d = norm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])), nr = norm(cross(d, perp)), t = (Array.isArray(thick) ? thick[i] : thick), w = widths[i];
    return [add(p, mul(perp, w)), add(p, mul(nr, t)), add(p, mul(perp, -w)), add(p, mul(nr, -t))];
  });
  const em = o.em || 0;
  for (let i = 0; i < n - 1; i++) for (let s = 0; s < 4; s++) {
    const a = ring[i][s], c = ring[i][(s + 1) % 4], d = ring[i + 1][s], e = ring[i + 1][(s + 1) % 4];
    m.tri(a, c, e, cols[i], em, b, true); m.tri(a, e, d, cols[i], em, b, true);
  }
  if (o.inlay) for (let i = 0; i < n - 1; i++) {
    const k = o.inlayW ?? 0.32;
    for (const f of [1, 3]) {
      const a = lerp(ring[i][f], ring[i][0], k), c = lerp(ring[i][f], ring[i][2], k), d = lerp(ring[i + 1][f], ring[i + 1][0], k), e = lerp(ring[i + 1][f], ring[i + 1][2], k);
      const lift = mul(sub(ring[i][f], pts[i]), 0.1);
      m.tri(add(a, lift), add(c, lift), add(e, lift), o.inlay, o.inlayEm || 0, b, true); m.tri(add(a, lift), add(e, lift), add(d, lift), o.inlay, o.inlayEm || 0, b, true);
    }
  }
  return m;
}
/** A chain of alternating oval links along a path. */
function chain(m, bone, path, r, col, o = {}) {
  const step = r * 2.15; let s = 0, seg = 0, flip = 0;
  const lens = path.slice(1).map((p, i) => Math.hypot(...sub(p, path[i])));
  const em = o.em || 0;
  while (seg < lens.length) {
    while (seg < lens.length && s > lens[seg]) { s -= lens[seg]; seg++; }
    if (seg >= lens.length) break;
    const a = path[seg], b2 = path[seg + 1], d = norm(sub(b2, a)), c = lerp(a, b2, s / lens[seg]);
    const e0 = norm(cross(d, Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), e1 = cross(d, e0), e = flip % 2 ? e0 : e1;
    const pts = [];
    for (let i = 0; i <= 6; i++) { const t = (i / 6) * Math.PI * 2; pts.push(add(c, add(mul(d, Math.cos(t) * r * 1.45), mul(e, Math.sin(t) * r * 0.78)))); }
    m.tube(bone, pts, r * 0.26, col, { sides: 4, em });
    s += step; flip++;
  }
  return m;
}
/** A metal band round an axis. */
function hoop(m, bone, c, axis, r, h, col, o = {}) {
  const d = mul(norm(axis), h / 2);
  m.lathe(bone, sub(c, d), add(c, d), o.rings ?? [[r * 0.96, 0], [r, 0.22], [r, 0.78], [r * 0.96, 1]], col, { sides: o.sides ?? 14, em: o.em });
  return m;
}
/** An open bell sleeve: a flare from the elbow out to a gold-rimmed cuff, with a dark lining. */
function bellSleeve(m, bone, el, cuff, r0, r1, col, trim, o = {}) {
  const ax = sub(cuff, el), d = norm(ax), sides = o.sides ?? 12;
  m.lathe(bone, el, cuff, [[r0, 0], [r0 * 1.15, 0.35], [r1 * 0.72, 0.72], [r1, 1]], col, { sides });
  const e = norm(cross(d, [0.2, 0.3, 0.9])), f = cross(d, e), rim = [], c = add(cuff, mul(d, -0.12));
  for (let i = 0; i < sides; i++) { const a = (i / sides) * Math.PI * 2; rim.push(add(c, add(mul(e, Math.cos(a) * r1 * 0.97), mul(f, Math.sin(a) * r1 * 0.97)))); }
  plate(m, bone, c, rim, o.lining ?? '#0a0710', {});
  hoop(m, bone, cuff, ax, r1 * 1.06, o.rim ?? 0.32, trim, { sides, rings: [[r1 * 0.98, 0], [r1 * 1.08, 0.25], [r1 * 1.08, 0.75], [r1 * 0.98, 1]] });
  return m;
}
/** A round-capped skull stuck on a surface, facing +x. */
function skull(m, bone, c, s, col, o = {}) {
  m.ell(bone, c, [0.55 * s, 0.72 * s, 0.72 * s], col, { k: 0.12 });
  m.ell(bone, [c[0] + 0.3 * s, c[1], c[2] - 0.5 * s], [0.34 * s, 0.42 * s, 0.32 * s], col, { k: 0.1 });
  const dk = o.dark || '#160f12';
  for (const [, y] of SIDES) m.ball(bone, [c[0] + 0.5 * s, c[1] + y * 0.3 * s, c[2] + 0.02 * s], 0.17 * s, dk, { em: o.em || 0, rings: 4, sides: 5 });
  m.ball(bone, [c[0] + 0.56 * s, c[1], c[2] - 0.3 * s], 0.08 * s, dk, { rings: 3, sides: 4 });
  return m;
}

// ---- rigs
/** A humanoid skeleton. `arms` lets a pose (raised fists, an extended staff) be sculpted in place. */
function rig(m, o) {
  const H = { hip: 4, chest: 6.4, neck: 8, sw: 2.6, lean: 0, headUp: 0.4, hipW: 1.1, armU: 2.4, armL: 2.2, armOut: 0.5, ...o };
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [0, 0, H.hip]);
  m.bone('spine', 'hips', [0, 0, (H.hip + H.chest) / 2]);
  m.bone('chest', 'spine', [0, 0, H.chest]);
  m.bone('neck', 'chest', [H.lean, 0, H.neck]);
  m.bone('head', 'neck', [H.lean, 0, H.neck + H.headUp]);
  m.bone('jaw', 'head', [H.lean + 0.3, 0, H.neck + H.headUp]);
  m.bone('mouth', 'head', [H.lean + 1, 0, H.neck + 0.8]);
  H.a = {};
  for (const [s, y] of SIDES) {
    const a = (H.arms && H.arms[s]) || {};
    const sh = a.sh || [0, y * H.sw, H.neck - 0.6];
    const el = a.el || [-0.1, y * (H.sw + H.armOut), sh[2] - H.armU];
    const wr = a.wr || [0.4, y * (H.sw + H.armOut * 1.2), el[2] - H.armL];
    H.a[s] = { sh, el, wr };
    m.bone(`${s}up`, 'chest', sh); m.bone(`${s}lo`, `${s}up`, el); m.bone(`${s}hand`, `${s}lo`, wr);
    m.bone(`${s}th`, 'hips', [0, y * H.hipW, H.hip - 0.1]);
    m.bone(`${s}sh`, `${s}th`, [0.18, y * (H.hipW + 0.1), H.hip * 0.52]);
  }
  return H;
}

/** Idle, walk, swing and raised-hand gestures; amplitudes per boss so sculpted poses stay readable. */
function animateHuman(p, s, o = {}) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 7);
  const cast = s.cast, k = cast ? Math.min(1, cast.frac) : 0;
  const swing = ease('swing', cast && (cast.kind === 'cone' || cast.kind === 'knockback') ? 1 : 0, 9);
  const raise = ease('raise', cast && cast.kind !== 'cone' && cast.kind !== 'knockback' ? 1 : 0, 6);
  const br = Math.sin(t * 1.4) * 0.03;
  const armK = o.arms ?? 1;
  p.r('chest', 0, br, 0).r('head', 0, 0.02 * Math.sin(t * 0.8), 0.05 * Math.sin(t * 0.5));
  p.r('Lup', 0.06 * armK, br, 0).r('Rup', -0.06 * armK, br, 0);
  if (walk > 0.01) {
    const w = t * 6.4, a = Math.sin(w) * walk, b = Math.cos(w) * walk;
    p.r('Lth', 0, -a * 0.6, 0).r('Rth', 0, a * 0.6, 0).r('Lsh', 0, Math.max(0, -b) * 0.9, 0).r('Rsh', 0, Math.max(0, b) * 0.9, 0);
    p.r('Lup', 0, a * 0.3 * armK, 0).r('Rup', 0, -a * 0.3 * armK, 0).r('spine', 0, 0.06 * walk, Math.sin(w) * 0.06 * walk);
    p.o('hips', 0, 0, Math.abs(b) * 0.14);
  }
  if (swing > 0.01) {
    const up = k < 0.68 ? k / 0.68 : 1, down = k > 0.68 ? (k - 0.68) / 0.32 : 0, v = swing * (up - down * 1.4);
    p.r('Rup', 0, -2.2 * v * (o.swing ?? 1), -0.3 * v).r('Rlo', 0, -0.45 * v, 0).r('chest', 0, 0.2 * v, -0.42 * v + 0.6 * down * swing);
  }
  if (raise > 0.01) {
    const a = raise * (0.8 + 0.2 * Math.sin(t * 6)) * (o.raise ?? 1);
    p.r('Lup', 0.3 * a, -1.9 * a, 0).r('Rup', -0.3 * a, -1.9 * a, 0).r('Llo', 0, -0.3 * a, 0).r('Rlo', 0, -0.3 * a, 0).r('head', 0, -0.16 * a, 0).r('chest', 0, -0.1 * a, 0);
  }
  if (o.extra) o.extra(p, s, { walk, swing, raise, ease });
  p.evaluate();
}
const human = (o) => (p, s) => animateHuman(p, s, o);

/** Crawlers: legs lift and sweep in alternating sets, head and pincers work during casts. */
function crawler(legs, o = {}) {
  return (p, s) => {
    p.reset();
    const m = s.mem, t = s.t;
    const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
    const walk = ease('walk', s.moving ? 1 : 0, 8), c = ease('c', s.cast ? 1 : 0, 6);
    const breathe = Math.sin(t * 1.8);
    p.o('body', 0, 0, 0.1 * breathe);
    p.r('body', 0, 0.02 * breathe - 0.14 * c, 0.02 * Math.sin(t * 0.7));
    if (m.abd !== 0) p.r('abd', 0, 0.03 * breathe, 0.03 * Math.sin(t * 0.8));
    p.r('head', 0, 0.05 * Math.sin(t * 1.3) - 0.2 * c, 0.08 * Math.sin(t * 0.6));
    for (const [n, sg] of o.pincers || []) p.r(n, 0, 0, sg * (0.1 + 0.08 * Math.sin(t * 3) + 0.4 * c * (0.6 + 0.4 * Math.sin(t * 14))));
    for (const [a, b, sg, fr, ph] of legs) {
      const w = t * (o.stride ?? 7) + ph * Math.PI;
      const lift = walk * Math.max(0, Math.sin(w)), sweep = walk * Math.cos(w) * 0.3;
      p.r(a, sg * lift * 0.38, -fr * lift * 0.2, sg * sweep * 0.8 + 0.02 * Math.sin(t * 1.2 + ph * 2) * sg);
      p.r(b, -sg * lift * 0.34, fr * lift * 0.12, 0);
    }
    if (o.extra) o.extra(p, s, { walk, c, ease });
    p.evaluate();
  };
}

// ---- Anub'Rekhan: a squat crypt lord, royal-blue shell, gold piping, teal humps, black spike feet.
function buildAnub() {
  const m = new ModelBuilder();
  const blue = '#2333bd', deep = '#101a78', teal = '#14808c', gold = '#c8a14e', salmon = '#d99a6c', ink = '#0d0d16', ivory = '#e2d4bd';
  m.bone('root', null, [0, 0, 0]);
  m.bone('body', 'root', [0, 0, 6]);
  m.bone('abd', 'body', [-2.6, 0, 8]);
  m.bone('head', 'body', [3.8, 0, 5]);
  m.bone('mouth', 'head', [5.5, 0, 4.6]);
  const legs = [['f', 3.1, 1.1, 0], ['b', -2.8, 0.55, 1]];
  for (const [s] of SIDES) {
    m.bone(`${s}man`, 'head', [4.6, s === 'L' ? 1 : -1, 4.7]);
    m.bone(`${s}cl`, 'body', [3, s === 'L' ? 1.7 : -1.7, 4.3]);
    m.bone(`${s}wing`, 'abd', [-3.2, s === 'L' ? 1.4 : -1.4, 9.2]);
  }
  for (const [s, y] of SIDES) for (const [n, x] of legs) {
    m.bone(`${s}${n}1`, 'body', [x, y * 2.4, 5.8]);
    m.bone(`${s}${n}2`, `${s}${n}1`, [x + (x > 0 ? 1.7 : -1.2), y * 5.4, 5.4]);
  }
  // Thorax hump and the tall front mantle.
  m.ell('body', [0.1, 0, 6.5], [5, 4.4, 3.8], blue, { k: 0.5 });
  m.ell('body', [2.5, 0, 8.3], [3, 3.8, 2.9], blue, { k: 0.5 });
  m.ell('body', [0.6, 0, 3.8], [3.1, 2.5, 1.2], deep, { k: 0.5 });
  // Shell plates: gold-piped ribs across the dome, a ridge along it.
  for (const px of [3.6, 1, -1.6]) {
    const k = Math.sqrt(Math.max(0.05, 1 - ((px - 0.1) / 5) ** 2)), pts = [];
    for (let i = 0; i <= 10; i++) { const a = -1.45 + (i / 10) * 2.9; pts.push([px, Math.sin(a) * 4.45 * k, 6.5 + Math.cos(a) * 3.85 * k]); }
    m.tube('body', pts, 0.13, gold, { sides: 4 });
  }
  { const pts = []; for (let i = 0; i <= 8; i++) { const x = 4.6 - i * 1.1; pts.push([x, 0, 6.5 + 3.86 * Math.sqrt(Math.max(0.02, 1 - ((x - 0.1) / 5) ** 2))]); } m.tube('body', pts, 0.16, gold, { sides: 4 }); }
  // Teal shell at the rear, as the model has.
  m.ell('abd', [-3.6, 0, 8.4], [3.6, 3.5, 3.4], teal, { k: 0.3 });
  m.ell('abd', [-6.4, 0, 6.8], [1.9, 2.1, 1.8], deep, { k: 0.3 });
  for (const [, y] of SIDES) m.ell('abd', [-1.6, y * 3.5, 10], [1.5, 1.45, 1.3], teal, { k: 0.18 });
  // Head tucked below the mantle, dark and mandibled.
  m.ell('head', [4.3, 0, 4.9], [1.5, 1.35, 1.2], '#1a1745', { k: 0.3 });
  m.ell('head', [5.3, 0, 4.6], [0.8, 0.85, 0.7], '#22205a', { k: 0.2 });
  for (const [s, y] of SIDES) {
    m.ball('head', [5.2, y * 0.75, 5.35], 0.26, '#ff3a2a', { em: 3 });
    // Long ivory tusks sweeping up in front of the shell.
    m.tube(`${s}man`, [[4.8, y * 1, 4.8], [6.6, y * 1.6, 4.9], [8, y * 2, 6.7], [7.8, y * 2, 9.2], [6.4, y * 1.7, 10.9]], [0.42, 0.42, 0.34, 0.2, 0.02], ivory, { sides: 6 });
    m.spike(`${s}man`, [5.1, y * 0.6, 4.3], [6.6, y * 0.25, 3.2], 0.24, ivory, { sides: 4, bend: [0.2, y * 0.2, -0.2] });
    // Blue horns off the mantle corners.
    m.spike('body', [3.9, y * 2.2, 8.5], [6.1, y * 3.4, 9.3], 0.5, blue, { sides: 5, bend: [0.3, 0, -0.4] });
    // Two short front claws hang under the chin.
    m.blob(`${s}cl`, [3.2, y * 1.8, 4.2], [4.5, y * 2.5, 2.3], 0.42, 0.32, deep, { k: 0.2 });
    m.spike(`${s}cl`, [4.5, y * 2.5, 2.3], [5.3, y * 2.3, 0.7], 0.3, ivory, { sides: 4, bend: [0.2, 0, 0] });
    m.spike(`${s}cl`, [4.4, y * 2.7, 2.3], [4.6, y * 3.1, 0.7], 0.2, ivory, { sides: 4 });
    // Shield-shaped flank plates, piped in gold.
    const outline = flat(y, [[3.7, 4.7, 8], [0.5, 5.4, 10.2], [-2.9, 5.1, 9.2], [-3.4, 4.8, 5.6], [-0.2, 4.0, 2.7], [2.9, 4.2, 4.8]]);
    plate(m, 'body', flat(y, [[0.2, 6.75, 6.6]])[0], outline, blue, { trim: gold, trimR: 0.15 });
    m.tube('body', flat(y, [[-0.3, 5.6, 9.4], [1.8, 5.75, 7], [-0.2, 6.05, 4.4], [-2.3, 5.7, 7.2], [-0.3, 5.6, 9.4]]), 0.1, gold, { sides: 4 });
    // Translucent blade wings rising behind.
    const w = (a, sp) => add([-3.2, y * 1.4, 9.2], [Math.cos(a) * -0.75 * sp, y * Math.sin(a) * sp * 1.05, Math.cos(a) * sp * 0.62]);
    const fan = [w(0.12, 0.2), w(0.2, 3.2), w(0.34, 6.4), w(0.42, 9), w(0.66, 6.4), w(0.82, 3)];
    plate(m, `${s}wing`, w(0.5, 4.6), fan, '#dcd0dd', { em: 0.15, trim: '#b9a6c5', trimR: 0.04 });
  }
  // Legs: blue thigh, gold seam, salmon cuff, black spike foot.
  for (const [s, y] of SIDES) for (const [n, x] of legs) {
    const hip = [x, y * 2.8, 5.6], knee = [x + (x > 0 ? 1.7 : -1.2), y * 5.4, 5.4], ank = [x + (x > 0 ? 2.2 : -1.9), y * 6.2, 2.75], fw = x > 0 ? 1 : -1;
    m.blob(`${s}${n}1`, hip, knee, 1.25, 1.2, blue, { k: 0.4 });
    m.blob(`${s}${n}2`, knee, ank, 1.3, 1.4, blue, { k: 0.3 });
    m.ell(`${s}${n}2`, [knee[0] + fw * 0.2, knee[1], knee[2] + 0.2], [1.5, 1.5, 1.45], blue, { k: 0.3 });
    hoop(m, `${s}${n}2`, lerp(knee, ank, 0.55), sub(ank, knee), 1.42, 0.5, gold, { sides: 10 });
    hoop(m, `${s}${n}2`, lerp(knee, ank, 0.98), sub(ank, knee), 1.55, 0.6, salmon, { sides: 10, rings: [[1.3, 0], [1.55, 0.3], [1.55, 0.7], [1.45, 1]] });
    m.lathe(`${s}${n}2`, [ank[0], ank[1], ank[2] - 0.15], [ank[0] + fw * 0.35, ank[1] + y * 0.15, 0], [[1.45, 0], [1.4, 0.2], [0.82, 0.68], [0.1, 1]], ink, { sides: 8 });
    m.tube(`${s}${n}1`, [[hip[0], hip[1], hip[2] + 1.35], [lerp(hip, knee, 0.5)[0], lerp(hip, knee, 0.5)[1], 7.2], [knee[0], knee[1], knee[2] + 1.4]], 0.11, gold, { sides: 4 });
  }
  const bodyB = m.b('body'), abdB = m.b('abd');
  const built = m.build({
    cell: 0.14, smooth: 1, ao: 1, aoReach: 1.2,
    paint(v) {
      if (v.bone === abdB && v.x < -1.3 && v.z > 5.6) {
        // Dark grooves on the teal shell.
        const g = wave((v.x * 0.9 + 100) * 1.7);
        if (g < 0.12) shade(v, 0.45);
        if (v.nz > 0.82 && Math.abs(v.y) < 0.14) shade(v, 0.5);
      }
      if (v.bone === bodyB && v.z > 4.6 && v.x > -3) {
        // Each shell plate is lit a little differently, darker toward its edges.
        const band = Math.floor((v.x + 100) / 2.6), f = (v.x + 100) / 2.6 - band;
        shade(v, (band % 2 ? 0.9 : 1.08) * (0.72 + 0.36 * Math.sin(f * Math.PI)));
      }
    },
  });
  return built;
}
const animAnub = crawler([['Lf1', 'Lf2', 1, 1, 0], ['Rf1', 'Rf2', -1, 1, 1], ['Lb1', 'Lb2', 1, -1, 1], ['Rb1', 'Rb2', -1, -1, 0]], {
  stride: 6.4, pincers: [['Lman', 1], ['Rman', -1]],
  extra: (p, s) => { for (const [n, sg] of [['Lwing', 1], ['Rwing', -1]]) p.r(n, sg * 0.05 * Math.sin(s.t * 2.2), 0, sg * 0.05 * Math.sin(s.t * 1.1)); for (const [n, sg] of [['Lcl', 1], ['Rcl', -1]]) p.r(n, 0, 0.12 * Math.sin(s.t * 2 + sg), sg * 0.06); },
});

// ---- Grand Widow Faerlina: auburn bob, orange gown with teal and black waves, green-eyed shoulders, pale sword.
function buildFaerlina() {
  const m = new ModelBuilder();
  const skin = '#c98a55', hair = '#8c3a2e', gold = '#e6ad1f', orange = '#d9701a', ink = '#110c12', teal = '#178a6a', purple = '#5a3388';
  const hip = 3.95, chest = 6, neck = 7.35;
  const H = rig(m, {
    hip, chest, neck, sw: 1.55, hipW: 0.62, headUp: 0.25,
    arms: { L: { sh: [0, 1.6, 6.8], el: [-0.05, 2.0, 5.1], wr: [0.2, 2.05, 3.55] }, R: { sh: [0, -1.6, 6.8], el: [0.3, -2.05, 5.1], wr: [1.2, -2.1, 4.0] } },
  });
  // Gown, waist, bodice.
  m.blob('hips', [0, 0, 3.95], [0, 0, 0.4], 1.25, 2.45, orange, { k: 0.5 });
  m.cut([0, 0, -30], [0, 0, -29.9], 30, 30, { k: 0.05 });
  m.ell('spine', [0, 0, 4.85], [0.74, 0.95, 1.3], ink, { k: 0.35 });
  m.ell('chest', [0.04, 0, 6.2], [0.86, 1.22, 1.05], gold, { k: 0.35 });
  for (const [, y] of SIDES) m.ell('chest', [0.62, y * 0.5, 6.25], [0.42, 0.42, 0.42], gold, { k: 0.2 });
  // Black high collar and the neck.
  m.blob('neck', [0, 0, 7.05], [0, 0, 7.7], 0.45, 0.4, ink, { k: 0.1 });
  // Head: fine jaw, straight fringe, shoulder-length auburn hair.
  m.ell('head', [0.05, 0, 8.4], [0.62, 0.55, 0.76], skin, { k: 0.15 });
  m.ell('head', [0.32, 0, 7.98], [0.38, 0.36, 0.34], skin, { k: 0.15 });
  m.ell('head', [0.62, 0, 8.3], [0.17, 0.12, 0.24], skin, { k: 0.08 });
  m.ell('head', [-0.2, 0, 8.72], [0.74, 0.72, 0.68], hair, { k: 0.08 });
  m.blob('head', [-0.55, 0, 8.6], [-0.65, 0, 6.95], 0.6, 0.5, hair, { k: 0.1 });
  m.box('head', [0.6, 0, 9.05], [0.18, 1.02, 0.2], hair, { taper: 0.95 });
  for (const [s, y] of SIDES) {
    m.blob('head', [0.02, y * 0.62, 8.5], [-0.05, y * 0.72, 6.92], 0.36, 0.25, hair, { k: 0.1 });
    m.ball('head', [0.6, y * 0.25, 8.42], 0.075, '#1b1208', { rings: 4, sides: 5 });
    m.ball('head', [0.55, y * 0.25, 8.44], 0.105, '#f0e8dd', { rings: 4, sides: 5 });
    m.box('head', [0.58, y * 0.25, 8.54], [0.1, 0.34, 0.05], '#3c1a14', {});
    // Shoulders: gold spheres, a great green eye, black and green claws.
    m.ell('chest', [0, y * 1.78, 7.18], [0.8, 0.78, 0.74], gold, { k: 0.15 });
    m.ball('chest', [0.42, y * 2.18, 7.2], 0.42, '#2f9a2a', { em: 1.3, rings: 6, sides: 10 });
    m.ball('chest', [0.62, y * 2.34, 7.2], 0.19, '#0c1404', { rings: 4, sides: 6 });
    for (let i = 0; i < 6; i++) {
      const a = -0.2 + i * 0.5, ca = Math.cos(a), sa = Math.sin(a);
      m.spike('chest', [0.1 + ca * 0.6, y * (2.02), 7.2 + sa * 0.68], [0.1 + ca * 1.25, y * 2.42, 7.0 + sa * 1.3], 0.16, i % 2 ? '#1a7a2a' : ink, { sides: 4, bend: [0, y * 0.1, -0.15] });
    }
    // Bare upper arm, black vambrace striped orange, black glove.
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 0.34, 0.3, skin, { k: 0.15 });
    m.blob(`${s}lo`, el, wr, 0.42, 0.34, ink, { k: 0.12 });
    m.tube(`${s}lo`, [lerp(el, wr, 0.05), lerp(el, wr, 0.95)], 0.44, orange, { sides: 8 });
    m.tube(`${s}lo`, [add(lerp(el, wr, 0.05), [0.42, 0, 0]), add(lerp(el, wr, 0.95), [0.34, 0, 0])], 0.07, teal, { sides: 4 });
    m.ell(`${s}hand`, wr, [0.28, 0.2, 0.42], ink, { k: 0.08 });
    for (let i = 0; i < 4; i++) m.spike(`${s}hand`, [wr[0] + 0.06 + (i - 1.5) * 0.09, wr[1] + y * 0.02, wr[2] - 0.2], [wr[0] + 0.1 + (i - 1.5) * 0.11, wr[1] + y * 0.04, wr[2] - 0.82], 0.07, ink, { sides: 3 });
    // Dark red shoes under the hem.
    m.ell(`${s}sh`, [0.42, y * 0.8, 0.3], [0.62, 0.42, 0.34], '#4a1a24', { k: 0.15 });
    m.blob(`${s}th`, [0, y * 0.62, 3.8], [0.2, y * 0.75, 0.5], 0.5, 0.4, ink, { k: 0.3 });
  }
  // Belt and purple boss.
  hoop(m, 'hips', [0, 0, 3.98], [0, 0, 1], 1.3, 0.5, '#23222a', { sides: 14 });
  m.ball('hips', [1.28, 0, 3.98], 0.26, '#6a2f9a', { em: 0.8, rings: 5, sides: 8 });
  m.tube('hips', [[1.28, -0.34, 3.98], [1.34, 0, 4.3], [1.28, 0.34, 3.98], [1.34, 0, 3.66], [1.28, -0.34, 3.98]], 0.05, '#b89a4a', { sides: 4 });
  // The pale curved greatsword held out low, skull pommel at the grip.
  const hand = [1.3, -2.15, 4.1];
  m.bone('blade', 'Rhand', hand);
  m.ball('Rhand', [1.2, -2.05, 4.55], 0.34, '#d8c8a0', { rings: 5, sides: 7 });
  m.tube('Rhand', [[1.2, -2.05, 4.3], [1.34, -2.18, 3.55]], 0.11, '#6d5430', { sides: 6 });
  m.tube('Rhand', [[1.02, -1.75, 3.5], [1.42, -2.42, 3.6]], 0.13, '#caa86a', { sides: 6 });
  const perp = norm([0.05, 1, 0.1]);
  blade(m, 'blade', [[1.42, -2.2, 3.5], [2.3, -2.22, 2.5], [3.2, -2.2, 1.45], [4.0, -2.15, 0.7], [4.75, -2.12, 0.28]], [0.4, 0.58, 0.62, 0.42, 0.02], 0.1, perp, ['#f0e9cf', '#f4efd9', '#f4efd9', '#fbf7e9'], { inlay: '#a87a3a', inlayW: 0.42 });
  const bodyB = m.b('hips'), chestB = m.b('chest'), spineB = m.b('spine');
  const built = m.build({
    cell: 0.1, smooth: 1, ao: 0.8, aoReach: 0.8,
    paint(v) {
      const A = Math.abs(Math.atan2(v.y, v.x) / Math.PI);
      if (v.bone === bodyB && v.z < hip + 0.05) {
        // The gown: waves of teal, black and orange flowing from the waist, a dark flame at the centre.
        const fl = 1 - clamp(v.z / hip), wob = 0.05 * Math.sin(v.z * 2.3 + A * 9);
        const u = (A + wob) / (0.22 + 0.42 * fl);
        let c = orange;
        if (u < 0.17 + 0.05 * sstep(2.4, 0.8, v.z)) c = v.z < 2.5 ? '#7a2a14' : orange;
        else if (u < 0.5) c = orange;
        else if (u < 0.72) c = teal;
        else if (u < 0.96) c = ink;
        else if (u < 1.34) c = '#b9551b';
        else if (u < 1.62) c = teal;
        else c = ink;
        tint(v, c);
        if (u >= 1.3 && u < 1.5 && v.z < 1.5) tint(v, '#c8701a', 0.8);
        if (v.z < 1.1 && wave(A * 12 + v.z * 2) < 0.16) tint(v, teal, 0.85);
        if (v.z < 0.34) tint(v, teal, 0.8);
      } else if ((v.bone === chestB || v.bone === spineB) && v.z < neck && v.x > -0.45) {
        const ay = Math.abs(v.y), z = v.z;
        // Yellow bodice top with purple butterfly wings and a teal diamond, black waist striped gold.
        if (z > 5.45) {
          tint(v, gold);
          const wing = Math.hypot((ay - 0.72) / 0.4, (z - 6.72) / 0.26 + (ay - 0.72) * 1.2);
          if (wing < 1) tint(v, purple, 0.92);
          const wing2 = Math.hypot((ay - 0.5) / 0.3, (z - 6.3) / 0.2);
          if (wing2 < 1) tint(v, purple, 0.92);
          if (ay + Math.abs(z - 6.45) * 0.62 < 0.2) tint(v, teal, 1);
          if (z < 5.72) tint(v, ink, 0.9);
          if (Math.abs(z - 5.72) < 0.05) tint(v, '#d8921e', 0.9);
        } else {
          tint(v, ink);
          const line = wave(ay * 2.4 + z * 0.6);
          if (ay < 0.85 && line < 0.2) tint(v, '#d8921e', 0.9);
          if (ay < 0.9 && line > 0.42 && line < 0.56) tint(v, teal, 0.6);
        }
      }
    },
  });
  return built;
}
function faerlinaFX(P, ctx) {
  // Sickly green glints on the pauldron eyes and the sword hilt, as in the screenshot.
  const c = SCHOOLS.poison;
  for (const y of [2.5, -2.5]) { const q = toWorld(ctx.M, [0.55, y, 7.2]); P.emit(q[0], q[1], q[2], 0, 0, 0.1, 0.22, 0.2, c[0] * 0.35, c[1] * 0.35, c[2] * 0.35, 0, 0.5, 0); }
}

// ---- Maexxna: a huge spider. Glossy orange abdomen, black ridge; thin black and yellow legs tufted red.
function buildMaexxna() {
  const m = new ModelBuilder();
  const orange = '#c9530e', ink = '#120e0e', red = '#a51b10', yellow = '#c79a18';
  m.bone('root', null, [0, 0, 0]);
  m.bone('body', 'root', [0, 0, 7]);
  m.bone('abd', 'body', [-1.6, 0, 7.4]);
  m.bone('head', 'body', [3.2, 0, 6.6]);
  m.bone('mouth', 'head', [6, 0, 5]);
  for (const [s, y] of SIDES) { m.bone(`${s}f`, 'head', [5.1, y * 0.55, 5.4]); }
  // Abdomen: large, glossy, tapering behind.
  m.ell('abd', [-4.2, 0, 8.1], [6.3, 4.5, 4.4], orange, { k: 0.3 });
  m.ell('abd', [-9.3, 0, 7.6], [2.5, 2.3, 2.4], '#b8470c', { k: 0.5 });
  // Cephalothorax and small yellow-faced head.
  m.ell('body', [1.8, 0, 7], [3.1, 2.5, 1.9], ink, { k: 0.3 });
  m.ell('head', [4.8, 0, 6.4], [1.4, 1.2, 1.15], '#1e1410', { k: 0.25 });
  m.ell('head', [5.75, 0, 6.5], [0.55, 0.85, 0.72], yellow, { k: 0.1 });
  for (const [s, y] of SIDES) {
    m.ball('head', [6.2, y * 0.34, 6.82], 0.14, '#ff2010', { em: 3 });
    m.ball('head', [6.28, y * 0.18, 6.45], 0.09, '#ff2010', { em: 3 });
    // Red fangs hanging from the face.
    m.blob(`${s}f`, [5.35, y * 0.55, 5.5], [5.75, y * 0.72, 3.5], 0.52, 0.46, red, { k: 0.18 });
    m.spike(`${s}f`, [5.75, y * 0.72, 3.5], [5.45, y * 0.55, 2.25], 0.42, '#1b0f0f', { sides: 5, bend: [0.05, 0, 0] });
  }
  // Black ridge along the abdomen, spiked.
  for (let i = 0; i < 11; i++) { const t = i / 10, x = -0.6 - t * 9.8, a = Math.PI * t, top = 8.1 + Math.sin(a * 0.97 + 0.15) * 4.35; m.spike('abd', [x, 0, top - 0.3], [x + 0.2, 0, top + 1.1 - t * 0.4], 0.32, ink, { sides: 4 }); }
  m.tube('abd', [[-0.3, 0, 11.6], [-3, 0, 12.7], [-6, 0, 12.3], [-9, 0, 10.3], [-10.6, 0, 8.6]], 0.26, ink, { sides: 5 });
  for (const [, y] of SIDES) m.tube('abd', [[-1, y * 1.1, 11.4], [-3.5, y * 2.1, 12.2], [-7, y * 2.2, 11], [-9.5, y * 1.4, 9.2]], 0.12, '#160e0e', { sides: 4 });
  // Legs: black femur, joint tufted red, long yellow tibia, black and red tip.
  const angles = [52, 78, 104, 132];
  const legBones = [];
  for (const [s, y] of SIDES) angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const out = (d) => [ca * d, y * sa * d];
    const base = [2.8 - i * 1.15, y * 1.9, 6.8];
    const at = (d, z) => { const [ox, oy] = out(d); return [base[0] + ox, base[1] + oy, z]; };
    const knee = at(4.6, 12.5 - i * 0.5), joint = at(10.6, 8.2 - i * 0.2), foot = at(16 - i * 0.5, 0.05);
    const a1 = `${s}${i}a`, b1 = `${s}${i}b`;
    m.bone(a1, 'body', base);
    m.bone(b1, a1, knee);
    legBones.push([a1, b1, y, i < 2 ? 1 : -1, ((i + (y > 0 ? 0 : 1)) % 2)]);
    m.tube(a1, [base, lerp(base, knee, 0.5), knee], [0.45, 0.34, 0.3], ink, { sides: 6 });
    m.ell(a1, knee, [0.5, 0.5, 0.46], ink, { k: 0.1 });
    m.tube(b1, [knee, lerp(knee, joint, 0.5), joint], [0.3, 0.24, 0.2], ['#1a1414', '#1a1414', yellow], { sides: 6 });
    m.ell(b1, joint, [0.42, 0.42, 0.42], ink, { k: 0.1 });
    m.tube(b1, [joint, lerp(joint, foot, 0.28), lerp(joint, foot, 0.62)], [0.2, 0.17, 0.14], yellow, { sides: 5 });
    m.spike(b1, lerp(joint, foot, 0.62), lerp(joint, foot, 0.84), 0.32, ink, { sides: 5 });
    m.spike(b1, lerp(joint, foot, 0.84), foot, 0.3, red, { sides: 5 });
    for (let k = 0; k < 5; k++) {
      const b = (k / 5) * Math.PI * 2, dir = [Math.cos(b) * 1.1 + ca * 0.5, Math.sin(b) * 1.1 * y + sa * 0.5 * y, 0.9 + Math.sin(b) * 0.5];
      m.spike(a1, knee, add(knee, dir), 0.28, k % 2 ? red : '#7d1109', { sides: 4 });
      if (k % 2 === 0) m.spike(b1, joint, add(joint, mul(dir, 0.75)), 0.2, red, { sides: 3 });
    }
    m.spike(a1, lerp(base, knee, 0.5), add(lerp(base, knee, 0.5), [ca * 1.2, y * sa * 1.2, 0.9]), 0.2, red, { sides: 4 });
  });
  const abdB = m.b('abd');
  const built = m.build({
    cell: 0.16, smooth: 1, ao: 0.8, aoReach: 1.2,
    paint(v) {
      if (v.bone === abdB) {
        const dorsal = v.nz, side = Math.abs(v.y) / 4.5;
        // Yellow sides and belly, orange-red back, black dorsal band and faint rings.
        if (dorsal < 0.55) tint(v, '#d59a1a', sstep(0.55, 0.15, dorsal) * 0.8);
        if (Math.abs(v.y) < 0.75 && dorsal > 0.2) tint(v, '#190e0c', 0.95);
        if (side > 0.55 && dorsal > 0.4) tint(v, '#8f2d0a', 0.4);
        if (wave((v.x + 100) * 0.42) < 0.14 && dorsal > -0.1) shade(v, 0.62);
      }
    },
  });
  built.legs = legBones;
  return built;
}


// ---- Noth the Plaguebringer: an enormous black bell robe with lightning-gold panels, fists raised, white hair.
function buildNoth() {
  const m = new ModelBuilder();
  const skin = '#a98cae', robe = '#100c15', purple = '#5a169c', gold = '#c8a165', hair = '#d6cede', bronze = '#8d6c3f';
  const hip = 3.75, chest = 6.1, neck = 7.85;
  const H = rig(m, {
    hip, chest, neck, sw: 2.05, hipW: 0.8, headUp: 0.3,
    arms: { L: { sh: [0.05, 2.05, 7.2], el: [0.55, 3.45, 5.4], wr: [2.05, 1.55, 6.75] }, R: { sh: [0.05, -2.05, 7.2], el: [0.55, -3.45, 5.4], wr: [2.05, -1.55, 6.75] } },
  });
  // The bell.
  m.blob('hips', [0, 0, 3.8], [0, 0, 0.55], 1.8, 4.5, robe, { k: 0.5 });
  m.cut([0, 0, -30], [0, 0, -29.9], 30, 30, { k: 0.05 });
  m.ell('spine', [0, 0, 5], [1.45, 1.75, 1.45], robe, { k: 0.45 });
  m.ell('chest', [0.1, 0, 6.5], [1.5, 2.05, 1.4], robe, { k: 0.4 });
  for (const [, y] of SIDES) m.ell('chest', [0.05, y * 2.15, 7.4], [0.82, 0.8, 0.52], robe, { k: 0.2 });
  // Head: long and grey-violet, white moustache and goatee, painted mask, long white hair.
  m.blob('neck', [0, 0, 7.5], [0.1, 0, 8.35], 0.55, 0.46, skin, { k: 0.15 });
  m.ell('head', [0.12, 0, 9], [0.74, 0.62, 0.92], skin, { k: 0.15 });
  m.ell('head', [0.42, 0, 8.45], [0.42, 0.42, 0.42], skin, { k: 0.15 });
  m.ell('head', [0.84, 0, 8.86], [0.16, 0.14, 0.32], skin, { k: 0.08 });
  m.ell('head', [0.62, 0, 9.26], [0.14, 0.5, 0.1], '#6c4a78', { k: 0.06 });
  m.ell('head', [-0.38, 0, 9.35], [0.72, 0.78, 0.78], hair, { k: 0.08 });
  for (const [, y] of SIDES) { m.blob('head', [0.28, y * 0.5, 9.78], [0.12, y * 0.72, 8.7], 0.2, 0.3, hair, { k: 0.06 }); m.ell('head', [0.74, y * 0.28, 9.32], [0.1, 0.22, 0.05], hair, { k: 0.03 }); }
  m.ell('head', [0.74, 0, 8.32], [0.14, 0.2, 0.3], hair, { k: 0.05 });
  for (const [s, y] of SIDES) {
    m.blob('head', [0.86, y * 0.04, 8.62], [0.76, y * 0.62, 8.42], 0.1, 0.05, hair, { k: 0.04 });
    m.ball('head', [0.8, y * 0.25, 9.04], 0.075, '#ffb030', { em: 2.8, rings: 4, sides: 5 });
    // Long locks over the chest, clamped by iron bands.
    m.blob('chest', [0.15, y * 0.7, 8.75], [0.82, y * 0.92, 5.2], 0.42, 0.3, hair, { k: 0.1 });
    hoop(m, 'chest', [0.68, y * 0.88, 6.5], [0.1, 0, 1], 0.42, 0.38, '#54505c', { sides: 8 });
    hoop(m, 'chest', [0.76, y * 0.9, 5.95], [0.1, 0, 1], 0.4, 0.22, bronze, { sides: 8 });
    for (let i = 0; i < 6; i++) m.spike('chest', [0.85, y * (0.62 + i * 0.13), 5.35], [0.92, y * (0.6 + i * 0.13), 4.75 - (i % 2) * 0.28], 0.1, hair, { sides: 3 });
    // Sleeves: huge bell cuffs ringed in gold with the forearm rising out of them.
    const { sh, el, wr } = H.a[s], cuff = lerp(el, wr, 0.66), axis = sub(wr, el);
    m.blob(`${s}up`, sh, el, 0.68, 0.62, robe, { k: 0.18 });
    bellSleeve(m, `${s}lo`, el, cuff, 0.6, 1.5, robe, gold, { rim: 0.4, sides: 16 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.46), axis, 0.98, 0.16, gold, { sides: 14 });
    m.tube(`${s}lo`, [lerp(el, wr, 0.4), wr], [0.36, 0.42], skin, { sides: 8 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.88), axis, 0.5, 0.26, gold, { sides: 10 });
    m.ell(`${s}hand`, add(wr, [0.05, 0, 0.26]), [0.56, 0.55, 0.62], skin, { k: 0.12 });
    for (let i = 0; i < 4; i++) m.ell(`${s}hand`, add(wr, [0.42, (i - 1.5) * 0.24, 0.2]), [0.17, 0.13, 0.22], '#7d5b8b', { k: 0.04 });
    m.ell(`${s}hand`, add(wr, [0.3, y * -0.36, 0.42]), [0.28, 0.13, 0.13], skin, { k: 0.04 });
    // Gold-rimmed shoulder with the upturned tip.
    hoop(m, 'chest', [0.05, y * 2.32, 7.15], [0, y * 0.4, 1], 1.02, 0.18, gold, { sides: 14 });
    m.ell('chest', [0.15, y * 3.0, 7.75], [0.5, 0.4, 0.44], gold, { k: 0.18 });
    m.ell('chest', [0.45, y * 3.05, 7.82], [0.22, 0.26, 0.26], '#e8a0c0', { k: 0.08 });
  }
  skull(m, 'chest', [1.42, 0, 6.72], 0.62, '#cfc3dc', { dark: '#1a1030' });
  // Belt with the skull buckle.
  hoop(m, 'hips', [0, 0, 3.95], [0, 0, 1], 1.95, 0.68, bronze, { sides: 16 });
  hoop(m, 'hips', [0, 0, 3.95], [0, 0, 1], 1.99, 0.18, gold, { sides: 16 });
  m.ell('hips', [1.92, 0, 3.95], [0.32, 0.56, 0.42], purple, { k: 0.08 });
  skull(m, 'hips', [2.15, 0, 4.02], 0.34, '#d7cbe2', { dark: '#1b0f2b' });
  // Boots peeping out at the hem.
  m.ell('Rsh', [3.4, -2.2, 0.3], [0.85, 0.45, 0.28], '#c86422', { k: 0.08 });
  m.ell('Rsh', [2.9, -2.2, 0.42], [0.36, 0.42, 0.2], '#2a4aa0', { k: 0.08 });
  const hipsB = m.b('hips'), chestB = m.b('chest'), spineB = m.b('spine'), headB = m.b('head');
  const built = m.build({
    cell: 0.11, smooth: 1, ao: 0.75, aoReach: 0.85,
    paint(v) {
      const A = Math.abs(Math.atan2(v.y, v.x) / Math.PI);
      if (v.bone === hipsB && v.z < hip + 0.2) {
        const z = v.z, r = Math.hypot(v.x, v.y), h = clamp(z / hip);
        const edge = 0.11 + 0.26 * (1 - h) + 0.075 * wave(z * 1.55);
        if (A < edge - 0.09) tint(v, z < 2.3 ? '#2b1f9b' : purple);
        else if (A < edge - 0.05) tint(v, '#e8c896');
        else if (A < edge) tint(v, gold);
        const u = Math.atan2(v.y, v.x) * r, w = z - 1.42;
        if (A < 0.3 && z < 2.45) {
          const sk = Math.hypot(u / 0.72, w / 0.68);
          if (sk < 1) tint(v, '#d3b9df');
          if (Math.hypot((Math.abs(u) - 0.3) / 0.16, (w - 0.08) / 0.2) < 1) tint(v, '#2233b0');
          if (Math.abs(u) < 0.12 && Math.abs(w + 0.32) < 0.12) tint(v, '#2233b0');
          if (Math.abs(u) < 0.42 && w < -0.52 && w > -0.92) tint(v, '#bfa6d2', 0.9);
          if (Math.hypot((Math.abs(u) - 0.42) / 0.13, (z - 2.36) / 0.32) < 1) tint(v, '#cdb0e8', 0.9);
          if (Math.hypot((Math.abs(u) - 1.15) / 0.22, (z - 1.05) / 0.12) < 1) tint(v, '#cdb0e8', 0.9);
        }
        // A gold jagged band around the hem.
        const hem = 0.9 + 0.32 * wave(A * 5.5);
        if (A > edge && z < hem && z > hem - 0.3) tint(v, gold);
        if (v.z < 0.16) tint(v, gold, 0.9);
        if (A > 0.6) shade(v, 0.85);
      } else if ((v.bone === chestB || v.bone === spineB) && v.x > 0 && Math.abs(v.y) < 1.5) {
        const ay = Math.abs(v.y), z = v.z;
        if (z < 5.8 && z > 4.05 && ay < 0.72 + (5.8 - z) * 0.04) tint(v, purple, 0.95);
        if (z >= 4.05 && z < 5.85 && Math.abs(ay - (0.74 + (5.8 - z) * 0.04)) < 0.08) tint(v, gold);
        if (Math.abs(z - (5.95 - ay * 0.9)) < 0.09 && ay < 0.9) tint(v, gold);
        if (Math.abs(z - (5.55 - ay * 0.9)) < 0.08 && ay < 0.7) tint(v, gold);
      } else if (v.bone === headB && v.x > 0.2) {
        // Purple warpaint across the eyes.
        if (v.z > 8.96 && v.z < 9.24 && Math.abs(v.y) < 0.58) tint(v, '#3f2358', 0.9);
        if (v.z > 9.1 && v.z < 9.2 && Math.abs(v.y) > 0.55 && Math.abs(v.y) < 0.78) tint(v, '#3f2358', 0.7);
      }
    },
  });
  return built;
}

// ---- Heigan the Unclean: ram-skull helm, waist-long grey beard, pagoda shoulders, glowing green orb.
function buildHeigan() {
  const m = new ModelBuilder();
  const purple = '#401f86', deep = '#1f1148', gold = '#a07a2a', red = '#7a1418', beard = '#847b86', bone = '#8f8796', ink = '#120d16';
  const hip = 3.75, chest = 6.05, neck = 7.7;
  const H = rig(m, {
    hip, chest, neck, sw: 2.0, hipW: 0.8, headUp: 0.28,
    arms: { L: { sh: [0, 2, 7.1], el: [0, 3.0, 5.3], wr: [0.7, 3.05, 3.85] }, R: { sh: [0.1, -2, 7.1], el: [0.9, -2.95, 5.55], wr: [2.15, -2.95, 4.9] } },
  });
  m.blob('hips', [0, 0, 3.85], [0, 0, 0.45], 1.72, 3.25, purple, { k: 0.5 });
  m.cut([0, 0, -30], [0, 0, -29.9], 30, 30, { k: 0.05 });
  m.ell('spine', [0, 0, 5], [1.35, 1.72, 1.4], purple, { k: 0.45 });
  m.ell('chest', [0.05, 0, 6.5], [1.42, 1.98, 1.32], purple, { k: 0.4 });
  // Skull helm: a long pale ram skull worn low over a grey face.
  m.ell('head', [0.15, 0, 9.05], [0.95, 0.74, 0.74], bone, { k: 0.2 });
  m.blob('head', [0.7, 0, 8.95], [1.55, 0, 8.55], 0.46, 0.28, bone, { k: 0.15 });
  m.ell('head', [0.5, 0, 8.25], [0.5, 0.45, 0.42], '#5e5563', { k: 0.15 });
  m.ball('head', [0.86, 0.34, 8.5], 0.075, '#c8a8ff', { em: 3, rings: 4, sides: 5 });
  m.ball('head', [0.86, -0.34, 8.5], 0.075, '#c8a8ff', { em: 3, rings: 4, sides: 5 });
  for (const [s, y] of SIDES) {
    m.ball('head', [1.0, y * 0.5, 9.2], 0.17, '#0f0a14', { rings: 4, sides: 6 });
    // Great dark horns sweeping up and out.
    m.tube('head', [[-0.1, y * 0.6, 9.5], [-0.45, y * 1.9, 9.95], [-0.7, y * 3.0, 10.6], [-0.45, y * 3.55, 11.35], [0.1, y * 3.55, 11.9]], [0.42, 0.42, 0.34, 0.2, 0.02], ['#2f2838', '#2a2534', '#231f2c', '#1d1a24', '#b7aec2'], { sides: 7 });
    // Pagoda shoulders: red fans edged gold, with a purple layer beneath.
    const up = flat(y, [[0.55, 1.3, 7.6], [0.5, 2.6, 9.15], [0.2, 3.9, 9.7], [0, 4.55, 8.95], [-0.1, 3.9, 7.5], [0.2, 2.55, 7.15]]);
    plate(m, 'chest', flat(y, [[0.85, 2.9, 8.2]])[0], up, red, { trim: gold, trimR: 0.1 });
    const back = up.map((p) => add(p, [-0.5, 0, -0.1]));
    plate(m, 'chest', add(flat(y, [[0.85, 2.9, 8.2]])[0], [-1.3, 0, 0]), back, '#3e0d12', { trim: gold, trimR: 0.08 });
    const low = flat(y, [[0.9, 1.35, 7.05], [0.6, 2.9, 7.3], [0.1, 4.0, 6.5], [-0.2, 3.35, 5.8], [0.2, 2.1, 6]]);
    plate(m, 'chest', flat(y, [[1.05, 2.75, 6.5]])[0], low, purple, { trim: gold, trimR: 0.08 });
    // Sleeves, gold-banded.
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 0.72, 0.66, purple, { k: 0.2 });
    bellSleeve(m, `${s}lo`, el, lerp(el, wr, 0.8), 0.62, 1.25, purple, gold, { rim: 0.32, sides: 14 });
    m.tube(`${s}lo`, [lerp(el, wr, 0.5), wr], 0.28, '#6a5e78', { sides: 7 });
    m.ell(`${s}hand`, wr, [0.45, 0.4, 0.5], '#6a5e78', { k: 0.1 });
  }
  // The beard: wide at the jaw, tapering down to the waist.
  m.blob('head', [0.62, 0, 8.45], [0.95, 0, 7.15], 1.05, 0.92, beard, { k: 0.12 });
  m.blob('chest', [1.05, 0, 7.3], [1.25, 0, 5.3], 0.95, 0.62, beard, { k: 0.2 });
  m.blob('chest', [1.25, 0, 5.3], [1.32, 0, 3.55], 0.62, 0.12, beard, { k: 0.15 });
  // Staff, its orb lit green.
  m.tube('Rhand', [[2.55, -3.05, 0.1], [2.25, -2.95, 7.3]], 0.17, '#231c20', { sides: 6 });
  m.ball('Rhand', [2.25, -2.95, 7.85], 0.7, '#b6e13e', { em: 2, rings: 3, sides: 8 });
  hoop(m, 'Rhand', [2.26, -2.95, 7.25], [0, 0, 1], 0.32, 0.3, '#57472e', { sides: 8 });
  // Belt and chains down the dark centre panel to a hanging skull.
  hoop(m, 'hips', [0, 0, 4], [0, 0, 1], 1.86, 0.44, deep, { sides: 16 });
  hoop(m, 'hips', [0, 0, 4], [0, 0, 1], 1.9, 0.12, gold, { sides: 16 });
  chain(m, 'hips', [[1.72, -0.7, 3.95], [2.4, -0.5, 2.5], [2.65, 0, 2.05]], 0.1, '#6a6474');
  chain(m, 'hips', [[1.72, 0.7, 3.95], [2.4, 0.5, 2.5], [2.65, 0, 2.05]], 0.1, '#6a6474');
  skull(m, 'hips', [2.9, 0, 1.75], 0.46, '#bdb4c4', { dark: '#120c16' });
  const hipsB = m.b('hips'), chestB = m.b('chest'), spineB = m.b('spine');
  const built = m.build({
    cell: 0.11, smooth: 1, ao: 0.8, aoReach: 0.85,
    paint(v) {
      const A = Math.abs(Math.atan2(v.y, v.x) / Math.PI);
      const strands = (v.bone === chestB || v.bone === hipsB || v.bone === spineB) && v.x > 0.75 && Math.abs(v.y) < 1.1 && v.z > 3.4 && v.z < 8.3;
      if (v.bone === hipsB && v.z < hip + 0.15) {
        const z = v.z;
        // A dark front panel edged gold, red under-robe showing at the sides.
        const panel = 0.13 + 0.05 * (1 - z / hip);
        if (A < panel) tint(v, ink, 1);
        else if (A < panel + 0.035) tint(v, gold, 0.95);
        const rSide = Math.abs(A - 0.62);
        if (rSide < 0.09 && z < 3.2) tint(v, red, 0.9);
        if (Math.abs(rSide - 0.09) < 0.018 && z < 3.2) tint(v, gold, 0.9);
        if (v.z < 0.22) tint(v, gold, 0.9);
      } else if (v.bone === chestB || v.bone === spineB) {
        if (v.x > 0 && Math.abs(v.y) < 1.5 && Math.abs(Math.abs(v.y) - 0.92) < 0.06 && v.z < 7) tint(v, gold, 0.9);
      }
      if (strands) {
        const st = wave(v.y * 6 + Math.sin(v.z * 1.3) * 0.4);
        tint(v, beard, 0.5);
        shade(v, 0.8 + 0.36 * st);
      }
    },
  });
  return built;
}
function heiganFX(P, ctx) {
  const q = toWorld(ctx.M, [2.25, -2.95, 7.9]), c = SCHOOLS.poison;
  if (Math.random() < 0.5) P.emit(q[0] + (Math.random() - 0.5), q[1] + (Math.random() - 0.5), q[2], (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0.5, 0.3, 0.3, c[0] * 0.4, c[1] * 0.5, c[2] * 0.4, 0, 0.9, 0);
}

// ---- Loatheb: a haystack of shaggy fungus, pale tentacled face, long arms ending in orange gilled claws.
function buildLoatheb() {
  const m = new ModelBuilder();
  const shag = '#7a5a2e', shag2 = '#9a7a44', shag3 = '#5a3f20', pale = '#b39a70', orange = '#d9752c', pink = '#d65a4c', stem = '#6f4b27';
  const hip = 4.8, chest = 8.4, neck = 10.4;
  const H = rig(m, {
    hip, chest, neck, sw: 3.6, hipW: 1.4, headUp: 0.2,
    arms: { L: { sh: [0, 3.6, 10.3], el: [0.4, 8.1, 7.5], wr: [1.8, 10.1, 4.3] }, R: { sh: [0, -3.6, 10.3], el: [0.4, -8.1, 7.5], wr: [1.8, -10.1, 4.3] } },
  });
  // Mane core: everything above the waist is hidden by shag.
  m.ell('chest', [0, 0, 9.4], [3.1, 3.5, 3], shag, { k: 0.6 });
  m.ell('spine', [0, 0, 6.7], [1.7, 1.95, 2.2], '#6a4726', { k: 0.5 });
  m.ell('chest', [-0.1, 0, 12.2], [3.3, 3.45, 2.2], shag, { k: 0.5 });
  m.blob('chest', [-0.1, 0, 13.4], [-0.2, 0, 15.1], 1.8, 0.55, shag2, { k: 0.4 });
  // Thick stalk legs flaring at the root.
  for (const [s, y] of SIDES) {
    m.blob(`${s}th`, [0, y * 1.3, 5.2], [0.15, y * 1.6, 2.6], 1.5, 1.45, stem, { k: 0.5 });
    m.blob(`${s}sh`, [0.15, y * 1.6, 2.6], [0.5, y * 2.3, 0.45], 1.45, 2.05, stem, { k: 0.4 });
  }
  m.blob('hips', [0, 0, 5.8], [0, 0, 4], 2.3, 2.45, stem, { k: 0.6 });
  m.cut([0, 0, -30], [0, 0, -29.9], 30, 30, { k: 0.05 });
  // The face: long and pale, sunken red eyes, a beard of tentacles.
  m.ell('head', [3.15, 0, 10.05], [1.15, 1.32, 1.62], pale, { k: 0.3 });
  m.ell('head', [3.9, 0, 9.2], [0.8, 0.92, 0.9], pale, { k: 0.2 });
  m.ell('head', [4.1, 0, 10.55], [0.32, 1.05, 0.3], '#3a2614', { k: 0.15 });
  for (const [, y] of SIDES) {
    m.ball('head', [4.26, y * 0.56, 10.62], 0.24, '#ff1e12', { em: 5 });
    m.ell('head', [4.2, y * 0.58, 10.95], [0.26, 0.42, 0.14], '#2e1d10', { k: 0.05 });
  }
  m.cut([4.72, 0, 9.42], [4.72, 0, 9.42], 0.4, 0.4, { k: 0.1 });
  m.cut([4.75, 0, 9.85], [4.6, 0, 9.85], 0.13, 0.09, { k: 0.05 });
  for (let i = 0; i < 7; i++) {
    const y = (i - 3) * 0.3, drop = 3.4 - Math.abs(i - 3) * 0.4, fwd = 0.55 - Math.abs(i - 3) * 0.08, sw = (i - 3) * 0.3;
    m.tube('head', [[4.3, y, 9.0], [4.75 + fwd, y + sw * 0.5, 8.1], [4.95 + fwd, y + sw * 1.1, 7.0], [4.65 + fwd, y + sw * 1.5, 9.0 - drop - 0.5], [4.9 + fwd, y + sw * 1.2, 9.0 - drop - 1.2]], [0.3, 0.26, 0.2, 0.13, 0.03], ['#c8ad80', '#c8ad80', '#d6b896', '#e6bea8', '#e6bea8'], { sides: 6 });
  }
  // Hair: bushy straw falling from the crown in tiers.
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const c = [shag, shag2, shag3, '#8a6a34'];
  for (let tier = 0; tier < 11; tier++) {
    const z = 15 - tier * 0.84, r0 = tier < 2 ? 1.5 + tier * 1.05 : Math.min(3.9, 3 + tier * 0.28), n = 14 + tier * 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + tier * 0.4 + rnd(i, tier) * 0.2, ca = Math.cos(a), sa = Math.sin(a);
      // Leave an opening for the face.
      if (ca > 0.55 && Math.abs(sa) < 0.74 && z < 12.6 && z > 7.6) continue;
      const len = 1.9 + rnd(i + 1, tier) * 1.3, base = [ca * r0, sa * r0 * 1.05, z + 0.2];
      const tip = [ca * (r0 + 0.7 + rnd(i + 3, tier) * 0.8) , sa * (r0 + 0.9 + rnd(i + 3, tier) * 0.8), z - len];
      m.spike('chest', base, tip, 0.2 + rnd(i, tier + 4) * 0.12, c[(i + tier) % 4], { sides: 3, bend: [ca * 0.25, sa * 0.25, -0.15] });
    }
  }
  // Toadstools sprouting from the crown.
  const cap = (x, y, z, r, col, spots = true) => {
    m.tube('chest', [[x, y, z - 1.2], [x * 1.04, y * 1.04, z - 0.3]], [0.26 * r / 1.3, 0.2 * r / 1.3], '#e0d0a8', { sides: 6 });
    m.lathe('chest', [x, y, z - 0.42], [x, y, z + 0.5], [[0.5 * r, 0], [1.02 * r, 0.1], [1.02 * r, 0.3], [0.62 * r, 0.75], [0.1 * r, 1]], col, { sides: 12 });
    if (spots) for (let i = 0; i < 7; i++) { const a = i * 0.9; m.ball('chest', [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, z + 0.06], 0.1 * r, '#f0e0c4', { rings: 3, sides: 4 }); }
  };
  cap(0.2, 0.7, 16.1, 2.2, '#d05f4a'); cap(-0.8, -1.6, 15.2, 1.7, '#dd8a58'); cap(1.5, 2.1, 14.2, 1.25, '#cf6a4e'); cap(-1.7, 1.9, 14.1, 1.05, '#d77355', false);
  // Arms: long and bony, gilled shelves at the wrist, huge claw-fingered hands.
  for (const [s, y] of SIDES) {
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 0.95, 0.72, '#7f6b3e', { k: 0.3 });
    m.blob(`${s}lo`, el, wr, 0.8, 0.95, '#9b8452', { k: 0.25 });
    for (let i = 0; i < 4; i++) {
      const p = lerp(el, wr, 0.55 + i * 0.15);
      m.ell(`${s}lo`, [p[0] + 0.2, p[1] + y * 0.45, p[2] + 0.1 - i * 0.05], [1.05 - i * 0.04, 0.42, 0.72 - i * 0.04], i % 2 ? pink : orange, { k: 0.1 });
    }
    m.ell(`${s}hand`, wr, [1.15, 0.95, 0.9], orange, { k: 0.3 });
    const fingers = [[1, -0.72, 0.15], [1.2, -0.25, 0], [1.15, 0.25, -0.1], [0.9, 0.72, -0.3], [-0.2, 0.9, -0.5]];
    fingers.forEach(([fx, fy, fz]) => {
      const f1 = add(wr, [fx * 0.85, y * fy * 0.95, fz * 0.5 - 0.3]);
      const f2 = add(f1, [fx * 0.75, y * fy * 0.65, -1.2]);
      const f3 = add(f2, [fx * 0.45, y * fy * 0.3, -1.7]);
      const f4 = add(f3, [fx * 0.1, y * fy * 0.05, -0.85]);
      m.tube(`${s}hand`, [f1, f2, f3], [0.44, 0.34, 0.3], [orange, '#d4613a', pink], { sides: 6 });
      m.spike(`${s}hand`, f3, f4, 0.3, '#c9361e', { sides: 5, tipColor: '#7b1a10', bend: [fx * 0.2, 0, 0.1] });
    });
  }
  const headB = m.b('head'), hipsB = m.b('hips'), thighs = new Set(['Lth', 'Rth', 'Lsh', 'Rsh'].map((n) => m.b(n)));
  const built = m.build({
    cell: 0.15, smooth: 1, ao: 1, aoReach: 1.3,
    paint(v) {
      if (v.bone === hipsB || thighs.has(v.bone)) {
        // Fibrous stem, darker in the grooves and at the base.
        const ridges = wave((Math.atan2(v.y, v.x) + Math.sin(v.z) * 0.15) * 5.5);
        shade(v, 0.62 + 0.55 * ridges);
        if (v.z < 1.4) tint(v, '#3f2a15', sstep(1.4, 0.2, v.z) * 0.8);
      } else if (v.bone === headB && v.x > 1.5) {
        // Hollows round the eyes and a streaked pale face.
        if (v.z > 8.7 && v.z < 10.6) shade(v, 0.82 + 0.3 * wave(v.y * 1.6));
      }
    },
  });
  return built;
}
function loathebFX(P, ctx) {
  const c = [1.6, 3.2, 0.7];
  let n = 18 * ctx.dt; n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, r = 2 + Math.random() * 4;
    const q = toWorld(ctx.M, [Math.cos(a) * r, Math.sin(a) * r, 2 + Math.random() * 12]);
    P.emit(q[0], q[1], q[2], (Math.random() - 0.5), (Math.random() - 0.5), 0.5 + Math.random(), 0.1 + Math.random() * 0.12, 0, c[0], c[1], c[2], 0, 2.4, 0);
  }
}
const animLoatheb = human({
  arms: 0.4, swing: 0.8, raise: 0.45,
  extra: (p, s) => {
    const t = s.t;
    p.r('head', 0, 0.03 * Math.sin(t * 1.1), 0);
    p.r('Lup', 0.06 * Math.sin(t * 0.9), 0.05 * Math.sin(t * 0.7), 0).r('Rup', -0.06 * Math.sin(t * 0.9 + 1), 0.05 * Math.sin(t * 0.7 + 1), 0);
    p.r('Lhand', 0, 0.1 * Math.sin(t * 1.3), 0).r('Rhand', 0, 0.1 * Math.sin(t * 1.3 + 0.7), 0);
  },
});

// ---- Instructor Razuvious: huge triangular ice pauldrons, turquoise armour veined white, a giant notched sword.
function buildRazuvious() {
  const m = new ModelBuilder();
  const teal = '#1498b6', navy = '#0d2d66', white = '#d6f2f4', skin = '#ba8a68', brown = '#7a5a3e';
  const hip = 4.1, chest = 6.7, neck = 8.4;
  const H = rig(m, {
    hip, chest, neck, sw: 2.55, hipW: 1.25, headUp: 0.25,
    arms: { L: { sh: [0, 2.6, 7.9], el: [0.1, 3.55, 6.2], wr: [0.9, 3.9, 4.6] }, R: { sh: [0, -2.6, 7.9], el: [0.15, -3.5, 6.1], wr: [1.1, -3.55, 4.55] } },
  });
  m.ell('spine', [0, 0, 5.3], [1, 1.35, 1.5], navy, { k: 0.4 });
  m.ell('chest', [0.15, 0, 7.05], [1.35, 2.15, 1.4], teal, { k: 0.4 });
  m.ell('hips', [0, 0, 4.1], [1.05, 1.5, 0.85], navy, { k: 0.35 });
  for (const [s, y] of SIDES) {
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}th`, [0, y * 1.2, 3.9], [0.2, y * 1.5, 2], 0.9, 0.66, teal, { k: 0.3 });
    m.blob(`${s}sh`, [0.2, y * 1.55, 2], [0.1, y * 1.6, 0.4], 0.72, 0.72, navy, { k: 0.2 });
    // Boots flare wide at the knee.
    m.lathe(`${s}sh`, [0.12, y * 1.58, 0.55], [0.18, y * 1.58, 2.45], [[0.95, 0], [0.86, 0.4], [1.0, 0.8], [1.28, 1]], teal, { sides: 10 });
    hoop(m, `${s}sh`, [0.18, y * 1.58, 2.45], [0, 0, 1], 1.32, 0.16, white, { sides: 12 });
    m.ell(`${s}sh`, [0.65, y * 1.6, 0.42], [1.35, 0.74, 0.48], teal, { k: 0.2 });
    m.blob(`${s}up`, sh, el, 0.68, 0.6, navy, { k: 0.3 });
    m.blob(`${s}lo`, el, wr, 0.6, 0.52, navy, { k: 0.2 });
    // Wide bracers and turquoise fists.
    m.lathe(`${s}lo`, lerp(el, wr, 0.3), wr, [[0.82, 0], [1.05, 0.5], [0.95, 1]], teal, { sides: 10 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.62), sub(wr, el), 1.06, 0.2, white, { sides: 12 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.98), sub(wr, el), 0.96, 0.16, white, { sides: 12 });
    m.ell(`${s}hand`, add(wr, [0.15, 0, -0.3]), [0.72, 0.62, 0.72], '#2bb0a8', { k: 0.15 });
    // The towering pauldrons: white crown sweeping up beside the head, out to a long point.
    const outline = flat(y, [[0.75, 0.9, 9.3], [0.85, 1.6, 11.05], [0.25, 3.0, 9.85], [-0.05, 7.1, 8.65], [0.15, 4.6, 7.6], [0.45, 2.1, 7.75]]);
    plate(m, 'chest', flat(y, [[1.55, 3.2, 8.9]])[0], outline, white, { trim: '#f4ffff', trimR: 0.08, em: 0.1 });
    const back = outline.map((p) => add(p, [-0.9, 0, 0]));
    plate(m, 'chest', flat(y, [[-1.25, 3.2, 8.9]])[0], back, teal, { trim: white, trimR: 0.06 });
    // Blue windows on the plate.
    plate(m, 'chest', flat(y, [[1.42, 2.3, 9.0]])[0], flat(y, [[1.4, 1.5, 9.5], [1.32, 2.5, 9.4], [1.3, 2.7, 8.5], [1.4, 1.75, 8.4]]), '#1b66d6', { em: 0.5, trim: '#0b3c8c', trimR: 0.03 });
    plate(m, 'chest', flat(y, [[1.2, 4.1, 8.55]])[0], flat(y, [[1.16, 3.4, 9.0], [1.05, 4.9, 8.75], [1.1, 4.3, 8.0], [1.2, 3.3, 8.2]]), '#1b66d6', { em: 0.5, trim: '#0b3c8c', trimR: 0.03 });
    const lower = flat(y, [[0.7, 2.2, 7.75], [0.5, 3.0, 7.25], [0.2, 5.6, 7.5], [0.2, 3.9, 6.75], [0.55, 2.35, 7.05]]);
    plate(m, 'chest', flat(y, [[1.05, 3.3, 7.35]])[0], lower, teal, { trim: white, trimR: 0.07 });
  }
  // Head: square-jawed, spiked brown hair, goatee, a stripe of red war-paint.
  m.blob('neck', [0, 0, 8.15], [0.1, 0, 8.75], 0.6, 0.55, skin, { k: 0.12 });
  m.ell('head', [0.18, 0, 9.3], [0.78, 0.66, 0.92], skin, { k: 0.15 });
  m.ell('head', [0.5, 0, 8.72], [0.5, 0.56, 0.5], skin, { k: 0.12 });
  m.ell('head', [0.98, 0, 9.2], [0.17, 0.14, 0.34], '#b07f60', { k: 0.08 });
  m.ell('head', [0.84, 0, 8.55], [0.28, 0.36, 0.36], '#5b4230', { k: 0.05 });
  m.box('head', [1.06, 0, 8.85], [0.1, 0.56, 0.1], '#2f1c14', {});
  for (const [, y] of SIDES) {
    m.ball('head', [0.96, y * 0.3, 9.42], 0.12, '#f6e48a', { em: 2.2, rings: 4, sides: 5 });
    m.box('head', [0.98, y * 0.3, 9.62], [0.14, 0.42, 0.1], '#3a2212', {});
  }
  m.box('head', [0.96, 0, 9.14], [0.08, 1.0, 0.09], '#a51f22', {});
  for (const [, y] of SIDES) m.box('head', [0.95, y * 0.34, 9.28], [0.08, 0.12, 0.4], '#a51f22', {});
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2, r = 0.52 + rnd(i, 1) * 0.3, x = 0.1 + Math.cos(a) * r, y = Math.sin(a) * r;
    m.spike('head', [x, y, 10 + rnd(i, 2) * 0.1], [x + Math.cos(a) * 0.3, y + Math.sin(a) * 0.3, 10.55 + rnd(i, 3) * 0.4], 0.14, i % 2 ? brown : '#6a4c32', { sides: 3 });
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, r = 0.45 * rnd(i, 7) + 0.1;
    m.spike('head', [0.15 + Math.cos(a) * r, Math.sin(a) * r, 10.05], [0.15 + Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, 10.85 + rnd(i, 9) * 0.3], 0.13, brown, { sides: 3 });
  }
  // The sword: as long as he is tall, jagged, black and white with red etching.
  m.bone('sword', 'Rhand', [1.35, -3.6, 4.4]);
  m.tube('sword', [[1.35, -3.6, 4.4], [1.9, -5.1, 3.9]], 0.15, '#5a3a22', { sides: 6 });
  m.tube('sword', [[1.5, -2.2, 3.5], [2.15, -5.5, 4.55]], 0.09, '#8a2a24', { sides: 5 });
  m.ball('sword', [1.2, -3.2, 4.5], 0.24, '#2f7fd8', { em: 2, rings: 4, sides: 6 });
  const P0 = [1.95, -5.2, 3.86], dir = norm([1.3, -6.8, -0.55]), st = (d) => add(P0, mul(dir, d));
  const perp = [0, 0.14, 0.99];
  blade(m, 'sword', [st(0), st(1.1), st(1.9), st(3), st(3.8), st(5.2), st(6.2), st(7.6), st(8.6), st(10.4)], [0.55, 0.85, 0.5, 0.88, 0.52, 0.8, 0.5, 0.65, 0.4, 0.02], 0.12, perp, ['#2d2629', '#cfc7c8', '#2d2629', '#d6cfd0', '#2d2629', '#dfd9d9', '#3a3236', '#e5e0df', '#d8d2d3'], { inlay: '#a51f26', inlayW: 0.3 });
  const chestB = m.b('chest'), spineB = m.b('spine'), hipsB = m.b('hips'), thB = new Set(['Lth', 'Rth'].map((n) => m.b(n)));
  const built = m.build({
    cell: 0.11, smooth: 1, ao: 0.75, aoReach: 0.85,
    paint(v) {
      const ay = Math.abs(v.y);
      if (v.bone === chestB) {
        if (v.x > 0) {
          // Plated chest: white shoulder lines, navy pectorals, abdominal plates.
          tint(v, teal);
          if (v.z < 7.3 && v.z > 5.5 && ay < 1.65) tint(v, navy, 0.9);
          const veins = wave(ay * 1.7 + v.z * 0.9), rib = wave((v.z + 100) * 1.6);
          if (v.z > 7.1 && veins < 0.14) tint(v, white, 0.95);
          if (v.z <= 7.1 && rib < 0.16 && ay < 1.7) tint(v, white, 0.95);
          if (Math.abs(ay - 0.08) < 0.07) tint(v, white, 0.95);
          if (Math.hypot((ay - 0.9) / 0.5, (v.z - 7.7) / 0.34) < 1) tint(v, '#1a72d6', 0.95);
        }
      } else if (v.bone === spineB) {
        tint(v, navy);
        if (wave((v.z + 100) * 1.7) < 0.16 && ay < 1.6) tint(v, teal, 0.9);
      } else if (v.bone === hipsB && v.z > 3.5) {
        tint(v, navy);
        if (v.z > 3.95 && v.z < 4.55) tint(v, teal);
        if (v.z > 4.5 && v.z < 4.65) tint(v, white);
        if (v.z > 3.9 && v.z < 4.0) tint(v, white);
        if (ay < 0.65 && v.x > 0.2 && Math.abs(ay - (0.65 - (4.0 - v.z))) < 0.09 && v.z < 4) tint(v, white);
      } else if (thB.has(v.bone)) {
        // Thigh plates, veined white.
        const veins = wave(v.z * 1.3 + Math.atan2(v.y, v.x) * 1.7);
        if (v.x < 0) tint(v, navy, 0.8);
        if (veins < 0.13) tint(v, white, 0.9);
        else if (veins > 0.82) tint(v, navy, 0.8);
      }
    },
  });
  return built;
}
const animRazuvious = human({ swing: 0.9, raise: 0.6 });

// ---- Gothik the Harvester: blue robe wrapped in chains, gold cuirass, ram-skull helm with its tall single horn.
function buildGothik() {
  const m = new ModelBuilder();
  const blue = '#1c47ab', ink = '#120f18', gold = '#d9ad4a', bone = '#d2c9b6', steel = '#7d8290', black = '#0f0d16';
  const hip = 3.8, chest = 5.9, neck = 7.4;
  const H = rig(m, {
    hip, chest, neck, sw: 1.65, hipW: 0.6, headUp: 0.26,
    arms: { L: { sh: [0, 1.7, 6.85], el: [0.55, 2.7, 5.55], wr: [1.8, 3.25, 6.1] }, R: { sh: [0, -1.7, 6.85], el: [-0.25, -2.65, 5.2], wr: [0.95, -2.2, 4.35] } },
  });
  m.blob('hips', [0, 0, 3.85], [0, 0, 0.42], 1.3, 2.85, blue, { k: 0.45 });
  m.cut([0, 0, -30], [0, 0, -29.9], 30, 30, { k: 0.05 });
  m.ell('spine', [0, 0, 4.7], [0.92, 1.25, 1.1], blue, { k: 0.4 });
  m.ell('chest', [0.06, 0, 6.2], [0.95, 1.32, 1], gold, { k: 0.3 });
  m.blob('neck', [0, 0, 7.15], [0.05, 0, 7.75], 0.34, 0.32, '#8d8598', { k: 0.1 });
  // Helm: a ram's skull with one great ridged horn rising from the right side.
  m.ell('head', [0.15, 0, 8.2], [0.75, 0.6, 0.62], bone, { k: 0.2 });
  m.blob('head', [0.55, 0, 8.05], [1.25, 0, 7.6], 0.4, 0.26, bone, { k: 0.15 });
  for (const [, y] of SIDES) m.ball('head', [0.74, y * 0.4, 8.15], 0.15, '#10080e', { rings: 4, sides: 6 });
  m.tube('head', [[-0.1, -0.5, 8.55], [-0.5, -0.95, 9.2], [-0.72, -1.15, 10.0], [-0.6, -1.1, 10.75], [-0.25, -0.9, 11.2]], [0.36, 0.34, 0.26, 0.16, 0.02], ['#2a2230', '#2a2230', '#3a3142', '#2a2230', '#c8bdd4'], { sides: 7 });
  m.spike('head', [-0.15, 0.5, 8.55], [-0.75, 1.15, 9.35], 0.24, '#3a3142', { sides: 5, bend: [-0.1, 0.15, 0.1] });
  // Gold collar piece and shoulders.
  for (const [s, y] of SIDES) {
    m.ell('chest', [0, y * 1.72, 7.0], [0.6, 0.55, 0.42], gold, { k: 0.15 });
    m.spike('chest', [0, y * 2.05, 7.2], [-0.35, y * 2.85, 8.05], 0.24, '#2c2733', { sides: 4, bend: [0, 0, 0.1] });
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 0.44, 0.42, black, { k: 0.18 });
    m.blob(`${s}lo`, el, wr, 0.46, 0.34, black, { k: 0.15 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.9), sub(wr, el), 0.46, 0.22, gold, { sides: 10 });
    m.ell(`${s}hand`, wr, [0.36, 0.3, 0.44], gold, { k: 0.1 });
    for (let i = 0; i < 4; i++) m.spike(`${s}hand`, add(wr, [0.2, (i - 1.5) * 0.2, 0.2]), add(wr, [0.6, (i - 1.5) * 0.34, 0.9]), 0.08, gold, { sides: 3 });
  }
  // Skulls set on the robe, chains looped round it.
  skull(m, 'hips', [1.78, 0, 2.85], 0.55, bone, { dark: '#120c16' });
  skull(m, 'hips', [2.55, 0, 0.95], 0.62, bone, { dark: '#120c16' });
  const ring = (z, r, lift) => { const pts = []; for (let i = 0; i <= 44; i++) { const a = (i / 44) * Math.PI * 2; pts.push([Math.cos(a) * (r + lift), Math.sin(a) * (r + lift), z + 0.1 * Math.sin(a * 5)]); } return pts; };
  chain(m, 'hips', ring(2.35, 2.28, 0.08), 0.11, steel);
  chain(m, 'hips', ring(1.1, 2.95, 0.12), 0.12, steel);
  chain(m, 'hips', ring(3.6, 1.52, 0.1), 0.09, steel);
  chain(m, 'hips', [[1.2, 0.85, 3.8], [2.1, 1.05, 2.6], [2.6, 1.2, 1.5], [3.05, 1.4, 0.3]], 0.1, steel);
  chain(m, 'hips', [[1.2, -0.85, 3.8], [2.1, -1.05, 2.6], [2.6, -1.2, 1.5], [3.05, -1.4, 0.3]], 0.1, steel);
  hoop(m, 'hips', [0, 0, 3.9], [0, 0, 1], 1.45, 0.42, '#2a2535', { sides: 14 });
  m.ball('hips', [1.4, 0, 3.9], 0.2, '#6a2f9a', { em: 0.9, rings: 4, sides: 6 });
  const hipsB = m.b('hips'), chestB = m.b('chest'), spineB = m.b('spine');
  const built = m.build({
    cell: 0.1, smooth: 1, ao: 0.8, aoReach: 0.8,
    paint(v) {
      const A = Math.abs(Math.atan2(v.y, v.x) / Math.PI), ay = Math.abs(v.y);
      if (v.bone === hipsB && v.z < hip + 0.1) {
        // Black side panels on the blue robe, with gold lines at the edges.
        const w = 0.34 + 0.08 * (1 - v.z / hip);
        if (A > w && A < 0.82) tint(v, ink, 0.92);
        if (Math.abs(A - w) < 0.018) tint(v, gold, 0.95);
        if (v.z < 0.22) tint(v, gold, 0.85);
      } else if (v.bone === chestB) {
        if (v.x > 0 && v.z < 6.85 && ay < 0.09) tint(v, '#8d6a26', 0.85);
      } else if (v.bone === spineB) {
        if (v.x > 0 && v.z > 4.3 && ay < 0.5 + (5.3 - v.z) * 0.4) tint(v, gold, 0.9);
      }
    },
  });
  return built;
}

// ---- The Four Horsemen: four riders on barded, horned skeletal chargers.
const RIDERS = {
  mograine: { x: 3.4, y: 2.9, barding: '#23347e', trim: '#b8a26a', main: '#3a3f58', accent: '#23252f' },
  blaumeux: { x: 2.2, y: -3.5, barding: '#2e2f7a', trim: '#b89a5a', main: '#6276c4', accent: '#3a3a78' },
  zeliek: { x: -4.6, y: 7.1, barding: '#cfc3d4', trim: '#d9b860', main: '#e8e0e6', accent: '#c8a64e' },
  korthazz: { x: -4.6, y: -7.1, barding: '#2d7a30', trim: '#e0a828', main: '#3d8c35', accent: '#c88d24' },
};
function addHorse(m, id, cfg) {
  const { x: ox, y: oy, barding, trim, main, accent } = cfg;
  const T = (p) => [p[0] + ox, p[1] + oy, p[2]];
  const pale = '#d8cfda', paleD = '#b8aabb', ink = '#17121c', gem = '#7b3ccc', horn = '#3a2c26', hair = '#10101a';
  const body = `b${id}`, neck = `n${id}`, head = `h${id}`, rider = `r${id}`, arm = `a${id}`;
  m.bone(body, 'root', T([0, 0, 3.8]));
  m.bone(neck, body, T([2.2, 0, 5]));
  m.bone(head, neck, T([3.4, 0, 6.4]));
  m.bone(rider, body, T([-0.5, 0, 5.45]));
  m.bone(arm, rider, T([-0.3, -0.9, 7.4]));
  const legsAt = [['f', 1, 1.9, 1], ['g', -1, 1.9, 0], ['h', 1, -2.5, 0], ['i', -1, -2.5, 1]];
  for (const [n, y, x] of legsAt) m.bone(`l${id}${n}`, body, T([x, y * 1.05, 3.7]));
  // Body, armoured pale.
  m.ell(body, T([0, 0, 4.2]), [3.5, 1.65, 1.75], pale, { k: 0.5 });
  m.ell(body, T([1.9, 0, 4.2]), [1.7, 1.5, 1.8], pale, { k: 0.5 });
  m.ell(body, T([-2.2, 0, 4.3]), [1.65, 1.6, 1.7], pale, { k: 0.5 });
  // Neck rising to a long horned skull.
  m.blob(neck, T([2.2, 0, 5]), T([3.4, 0, 6.4]), 1.35, 0.8, pale, { k: 0.45 });
  m.ell(head, T([3.75, 0, 6.6]), [1.05, 0.6, 0.66], pale, { k: 0.2 });
  m.blob(head, T([4.1, 0, 6.45]), T([5.75, 0, 5.5]), 0.58, 0.32, paleD, { k: 0.2 });
  m.ell(head, T([4.7, 0, 5.6]), [0.95, 0.42, 0.28], ink, { k: 0.1 });
  for (const [, y] of SIDES) {
    m.ball(head, T([4.55, y * 0.5, 6.7]), 0.26, gem, { em: 1.6, rings: 5, sides: 8 });
    // Tall banded horns.
    const hb = T([3.45, y * 0.45, 7.05]);
    const pts = [hb, add(hb, [-0.15, y * 0.35, 1.05]), add(hb, [-0.32, y * 0.42, 2.2]), add(hb, [-0.5, y * 0.32, 3.3]), add(hb, [-0.5, y * 0.1, 4.2])];
    m.tube(head, pts, [0.3, 0.27, 0.22, 0.14, 0.02], [horn, '#c8bda8', horn, '#c8bda8', horn], { sides: 6 });
    // Mane and reins.
    for (let i = 0; i < 6; i++) { const k = i / 5, p = lerp([2.2, 0, 5.8], [3.3, 0, 7], k); m.spike(neck, T([p[0], y * 0.28, p[2]]), T([p[0] - 0.5, y * 1.25, p[2] - 2.3 - (i % 2) * 0.5]), 0.17, hair, { sides: 3 }); }
    m.tube(head, [T([5.05, y * 0.4, 5.85]), T([4, y * 1.05, 5.3]), T([1, y * 1.45, 5.5])], 0.07, '#a85a26', { sides: 4 });
    // Barded flanks in the rider's colour, ragged at the hem, with a pale rimmed plate above.
    const skirt = flat(y, [[3.3, 1.8, 5.1], [0, 1.95, 5.5], [-3.5, 1.9, 5], [-3.5, 1.5, 2.05], [-2.6, 1.55, 2.5], [-1.7, 1.55, 1.75], [-0.7, 1.55, 2.55], [0.5, 1.6, 1.75], [1.6, 1.6, 2.5], [3, 1.55, 2]]).map(T);
    plate(m, body, T(flat(y, [[0, 2.2, 3.7]])[0]), skirt, barding, { trim, trimR: 0.06 });
    const gbase = T(flat(y, [[0.3, 2.25, 4.4]])[0]);
    m.ball(body, gbase, 0.3, gem, { em: 1.2, rings: 5, sides: 8 });
    hoop(m, body, gbase, [0, y, 0], 0.34, 0.1, trim, { sides: 10 });
  }
  // Chest plate: a pointed shield bearing a horned skull.
  plate(m, body, T([4.0, 0, 3.7]), [[3.5, 1.2, 5.6], [3.85, 0, 6.1], [3.5, -1.2, 5.6], [3.5, -1, 3.1], [3.4, 0, 1.75], [3.5, 1, 3.1]].map(T), pale, { trim, trimR: 0.07 });
  skull(m, body, T([3.75, 0, 4]), 0.68, '#efe6d4', { dark: '#1a1020' });
  for (const [, y] of SIDES) m.spike(body, T([3.6, y * 0.55, 4.45]), T([3.5, y * 1.5, 5.25]), 0.15, '#efe6d4', { sides: 4, bend: [0, 0, -0.2] });
  // Legs and bell-shaped hoof guards each set with a purple gem.
  for (const [n, y, x] of legsAt) {
    const b = `l${id}${n}`;
    const hip = T([x, y * 1.05, 3.5]), knee = T([x + 0.12, y * 1.1, 1.95]), hoof = T([x + 0.05, y * 1.12, 0.7]);
    m.blob(b, hip, knee, 0.5, 0.33, ink, { k: 0.2 });
    m.blob(b, knee, hoof, 0.33, 0.28, ink, { k: 0.15 });
    m.lathe(b, T([x + 0.05, y * 1.12, 0]), T([x + 0.05, y * 1.12, 1.35]), [[0.98, 0], [0.86, 0.2], [0.56, 0.6], [0.14, 1]], pale, { sides: 7 });
    m.ball(b, T([x + 0.72, y * 1.12, 0.62]), 0.2, gem, { em: 1.8, rings: 4, sides: 6 });
    for (let i = 0; i < 5; i++) { const a = i * 1.26; m.spike(b, add(knee, [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0]), add(knee, [Math.cos(a) * 0.5, Math.sin(a) * 0.5, -0.9]), 0.1, hair, { sides: 3 }); }
  }
  // Rider: common seat, arms and helm, then each Horseman's own markings.
  const up = (p) => T([p[0] * 1.14, p[1] * 1.14, 5.45 + (p[2] - 5.1) * 1.16]);
  m.ell(rider, up([-0.45, 0, 6.5]), [1.08, 1.31, 1.42], main, { k: 0.3 });
  m.ell(rider, up([-0.4, 0, 5.3]), [1.2, 1.25, 0.68], accent, { k: 0.3 });
  for (const [, y] of SIDES) m.blob(rider, up([-0.4, y * 0.85, 5.2]), up([0.5, y * 1.55, 3.9]), 0.52, 0.4, main, { k: 0.2 });
  return { T: up, body, rider, arm, head, neck, cfg, pale, gem };
}
function buildHorsemen() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  m.bone('mouth', 'root', [4, 0, 8]);
  const ids = Object.keys(RIDERS);
  ids.forEach((name, id) => {
    const { T, rider, arm, cfg } = addHorse(m, id, RIDERS[name]);
    const { main, accent, trim } = cfg;
    const helm = (col, r = 0.68) => { m.ell(rider, T([-0.4, 0, 8]), [r * 1.05, r, r * 1.08], col, { k: 0.2 }); };
    const shoulders = (col) => { for (const [, y] of SIDES) m.ell(rider, T([-0.45, y * 1.25, 7.3]), [0.68, 0.68, 0.58], col, { k: 0.2 }); };
    const leftArm = (col) => { m.blob(rider, T([-0.4, 1.2, 7.1]), T([0.2, 1.5, 5.6]), 0.34, 0.3, col, { k: 0.2 }); };
    if (name === 'mograine') {
      // Highlord Mograine: dark plate, an enormous sword held upright.
      helm(accent); shoulders('#2a2c38'); leftArm(main);
      for (const [, y] of SIDES) for (let i = 0; i < 3; i++) m.spike(rider, T([-0.45, y * 1.3, 7.65]), T([-0.7 - i * 0.3, y * (1.95 + i * 0.25), 8.5 + i * 0.5]), 0.2, '#5a5f7a', { sides: 4 });
      m.ball(rider, T([0.32, 0.22, 8.12]), 0.07, '#bfe0ff', { em: 4, rings: 3, sides: 4 });
      m.ball(rider, T([0.32, -0.22, 8.12]), 0.07, '#bfe0ff', { em: 4, rings: 3, sides: 4 });
      m.blob(arm, T([-0.3, -1.3, 7.1]), T([0.6, -1.7, 6.5]), 0.36, 0.32, main, { k: 0.2 });
      m.tube(arm, [T([0.7, -1.75, 6.1]), T([0.7, -1.75, 7.4])], 0.12, '#3a2e24', { sides: 5 });
      m.tube(arm, [T([0.4, -2.5, 7.45]), T([1, -1, 7.45])], 0.13, trim, { sides: 5 });
      blade(m, arm, [T([0.7, -1.75, 7.45]), T([0.7, -1.75, 9.5]), T([0.68, -1.75, 11.5]), T([0.66, -1.75, 13.4])], [0.34, 0.42, 0.34, 0.02], 0.1, [1, 0, 0], ['#a7b4d8', '#cbd6ee', '#dfe6f4'], { inlay: '#3b4a80', inlayW: 0.3 });
    } else if (name === 'blaumeux') {
      // Lady Blaumeux: violet-blue plate and a plume of red hair.
      helm(main, 0.6); shoulders(accent); leftArm(main);
      m.ell(rider, T([0.05, 0, 7.9]), [0.42, 0.42, 0.46], '#c0a0b4', { k: 0.1 });
      for (let i = 0; i < 11; i++) { const a = (i / 10 - 0.5) * 1.8; m.spike(rider, T([-0.55, Math.sin(a) * 0.5, 8.5]), T([-1.2 - 0.55 * Math.cos(a), Math.sin(a) * 1.15, 9.7 - Math.abs(a) * 0.4]), 0.22, '#d83a6e', { sides: 4 }); m.spike(rider, T([-0.65, Math.sin(a) * 0.5, 8.1]), T([-1.2, Math.sin(a) * 1.2, 6.5]), 0.2, '#bb2a58', { sides: 3 }); }
      m.blob(arm, T([-0.3, -1.2, 7.1]), T([0.7, -1.6, 6.2]), 0.3, 0.28, main, { k: 0.2 });
      blade(m, arm, [T([1, -1.6, 6.1]), T([2, -1.65, 7.2]), T([3, -1.7, 8.2])], [0.2, 0.22, 0.02], 0.07, [0.64, 0, -0.76], ['#9fc4e8', '#d0e0f4'], { inlay: '#30407a' });
    } else if (name === 'zeliek') {
      // Sir Zeliek: white and gold, a helm with a great feather crest.
      helm('#ece2ce', 0.62); shoulders('#efe8ec'); leftArm(main);
      m.box(rider, T([0.15, 0, 8.05]), [0.5, 0.86, 0.2], '#1b1420', {});
      m.ball(rider, T([0.33, 0.25, 8.07]), 0.06, '#ffe28c', { em: 4, rings: 3, sides: 4 });
      m.ball(rider, T([0.33, -0.25, 8.07]), 0.06, '#ffe28c', { em: 4, rings: 3, sides: 4 });
      for (const [, y] of SIDES) for (let i = 0; i < 5; i++) { const b = T([-0.5 - i * 0.05, y * 0.5, 8.45 + i * 0.06]); m.tube(rider, [b, add(b, [-0.3 - i * 0.2, y * 0.2, 1.25 - i * 0.05]), add(b, [-0.95 - i * 0.5, y * 0.34, 2.45 - i * 0.28])], [0.16, 0.22, 0.02], ['#fcf8ee', '#fcf8ee', '#efe1c0'], { sides: 4 }); }
      for (const [, y] of SIDES) m.ball(rider, T([-0.1, y * 1.35, 7.5]), 0.24, '#7b3ccc', { em: 1.2, rings: 4, sides: 6 });
      m.tube(arm, [T([0.2, -1.5, 7.2]), T([0.5, -1.6, 2.5]), T([0.5, -1.6, 9.8])], [0.1, 0.1, 0.1], '#c8a64e', { sides: 5 });
      m.spike(arm, T([0.5, -1.6, 9.8]), T([0.5, -1.6, 11.2]), 0.3, '#f4ecc4', { sides: 6 });
      m.blob(arm, T([-0.3, -1.2, 7.1]), T([0.35, -1.5, 6.5]), 0.3, 0.28, main, { k: 0.2 });
    } else {
      // Thane Korth'azz: a stout dwarf in green, skulls on his shoulders, wild white hair, a skull-headed mace.
      m.ell(rider, T([-0.4, 0, 6.5]), [1.15, 1.45, 1.2], main, { k: 0.3 });
      helm('#caa040', 0.55);
      for (const [, y] of SIDES) { skull(m, rider, T([-0.2, y * 1.55, 7.35]), 0.5, '#ece0b8', { dark: '#231810' }); m.spike(rider, T([-0.4, y * 1.5, 7.75]), T([-0.5, y * 2.15, 8.55]), 0.22, '#e8c070', { sides: 4 }); }
      m.ell(rider, T([0.25, 0, 7.45]), [0.42, 0.55, 0.65], '#efe9de', { k: 0.1 });
      for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.2; m.spike(rider, T([-0.4 + Math.cos(a) * 0.2, Math.sin(a) * 0.5, 8.3]), T([-0.5 + Math.cos(a) * 0.25, Math.sin(a) * 1.1, 9.7]), 0.16, '#d2c9c2', { sides: 3 }); }
      m.blob(arm, T([-0.3, -1.45, 7]), T([0.5, -1.95, 6.8]), 0.38, 0.33, main, { k: 0.2 });
      m.tube(arm, [T([0.5, -1.95, 6.3]), T([0.5, -1.95, 9.2])], 0.1, '#3a2c20', { sides: 5 });
      skull(m, arm, T([0.5, -1.95, 9.65]), 0.82, '#eadfc0', { dark: '#231810' });
      for (const [, y] of SIDES) m.spike(arm, T([0.5, -1.95 + y * 0.5, 9.95]), T([0.5, -1.95 + y * 1.15, 10.75]), 0.14, trim, { sides: 4 });
    }
  });
  return m.build({ cell: 0.13, smooth: 1, ao: 0.7, aoReach: 0.8 });
}
function animateHorsemen(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 6), c = ease('c', s.cast ? 1 : 0, 6);
  for (let id = 0; id < 4; id++) {
    const off = id * 1.7, w = t * 6.2 + off;
    p.r(`n${id}`, 0, 0.05 * Math.sin(t * 1.3 + off), 0.03 * Math.sin(t * 0.7 + off));
    p.r(`h${id}`, 0, 0.05 * Math.sin(t * 1.1 + off), 0.05 * Math.sin(t * 0.9 + off));
    p.r(`r${id}`, 0, 0.03 * Math.sin(t * 1.2 + off) + 0.06 * c, 0.05 * Math.sin(t * 0.5 + off));
    const up = c * (0.6 + 0.3 * Math.sin(t * 5 + off));
    p.r(`a${id}`, -0.25 * up, -0.55 * up, 0);
    p.o(`b${id}`, 0, 0, 0.07 * Math.sin(t * 1.8 + off));
    if (walk > 0.01) {
      p.o(`b${id}`, 0, 0, 0.14 * walk * Math.abs(Math.sin(w)));
      for (const [n, ph] of [['f', 0], ['g', Math.PI], ['h', Math.PI], ['i', 0]]) p.r(`l${id}${n}`, 0, Math.sin(w + ph) * 0.55 * walk, 0);
    }
  }
  p.evaluate();
}
function horsemenFX(P, ctx) {
  // A faint violet shimmer at the hooves, as the screenshot shows.
  const c = [2, 0.8, 4];
  if (Math.random() < 0.5) {
    const R = Object.values(RIDERS)[Math.floor(Math.random() * 4)];
    const q = toWorld(ctx.M, [R.x + (Math.random() < 0.5 ? 1.9 : -2.5), R.y + (Math.random() < 0.5 ? 1.1 : -1.1), 0.4]);
    P.emit(q[0], q[1], q[2], 0, 0, 0.7, 0.3, 0.2, c[0], c[1], c[2], 0, 1, 0);
  }
}

// ---- Patchwerk: a bloated white abomination, belly hooked open on purple guts, cleaver and chain, a third arm above.
function buildPatchwerk() {
  const m = new ModelBuilder();
  const skin = '#dcd6d8', dark = '#b8b1b4', guts = '#6f50c0', guts2 = '#3a2a86', rod = '#6e4a22', steel = '#72727a', tan = '#d8ba8e', rust = '#7a5a34';
  const hip = 3.3, chest = 7, neck = 9.3;
  const H = rig(m, {
    hip, chest, neck, sw: 5.2, hipW: 2.2, headUp: 0.1, lean: 1.3,
    arms: { L: { sh: [-0.2, 5.3, 9], el: [0.3, 6.7, 6.2], wr: [1.6, 7.3, 3.8] }, R: { sh: [-0.2, -5.3, 9], el: [0.2, -6.7, 6.2], wr: [1.0, -7, 3.5] } },
  });
  m.bone('Xup', 'chest', [-2, 3.6, 9.8]);
  m.bone('Xlo', 'Xup', [-3.3, 6.2, 11.4]);
  m.bone('Xhd', 'Xlo', [-3.2, 8.6, 12.9]);
  // A huge sagging gut and a yoke of shoulder.
  m.ell('spine', [0.5, 0, 5.7], [4.5, 5.3, 4.7], skin, { k: 0.8 });
  m.ell('chest', [-0.3, 0, 9.3], [3.1, 5.3, 2.3], skin, { k: 0.8 });
  m.ell('chest', [-1.2, 0, 7.2], [2.8, 4.3, 2.5], skin, { k: 0.7 });
  m.ell('hips', [0.2, 0, 3.4], [3.1, 3.4, 1.9], skin, { k: 0.6 });
  // Small head sunk between the shoulders.
  m.ell('head', [2.45, 0, 11.05], [1.5, 1.45, 1.35], skin, { k: 0.5 });
  m.ell('head', [3.2, 0, 10.35], [0.8, 1.15, 0.55], skin, { k: 0.2 });
  m.cut([3.95, -1.0, 10.32], [3.95, 1.0, 10.32], 0.3, 0.3, { k: 0.06 });
  for (let i = 0; i < 8; i++) m.spike('jaw', [3.72, -0.98 + i * 0.28, 10.04], [3.86, -0.98 + i * 0.28, 10.55], 0.11, '#ece4bc', { sides: 3 });
  for (let i = 0; i < 7; i++) m.spike('head', [3.86, -0.84 + i * 0.28, 10.68], [3.84, -0.84 + i * 0.28, 10.2], 0.1, '#ece4bc', { sides: 3 });
  // One great eye in an iron ring, one little one.
  m.ball('head', [3.68, -0.62, 11.45], 0.42, '#f2e8dd', { rings: 6, sides: 10 });
  m.ball('head', [3.98, -0.72, 11.48], 0.16, '#10100c', { rings: 4, sides: 6 });
  hoop(m, 'head', [3.72, -0.62, 11.45], [1, -0.15, 0], 0.48, 0.18, '#57565c', { sides: 12 });
  m.ball('head', [3.74, 0.66, 11.55], 0.16, '#e6dcc9', { rings: 4, sides: 6 });
  m.ball('head', [3.86, 0.72, 11.58], 0.08, '#10100c', { rings: 3, sides: 5 });
  // The belly wound: hollowed, packed with purple guts, hooked open.
  m.cut([5.3, 0, 5.3], [3.45, 0, 5.3], 2.75, 2.2, { k: 0.5 });
  const gutsA = [[2.5, 1.1, 6.4, 1.3], [2.7, -1.0, 6.7, 1.2], [2.6, 0, 5.4, 1.5], [2.45, 1.3, 4.5, 1.1], [2.55, -1.25, 4.4, 1.15], [3, 0, 3.6, 0.95], [3.4, 0.9, 5.6, 0.7], [3.3, -0.9, 5.1, 0.7]];
  gutsA.forEach(([x, y, z, r], i) => m.ball('spine', [x, y, z], r, i % 2 ? guts : guts2, { rings: 7, sides: 10 }));
  for (let i = 0; i < 5; i++) {
    const y = -1.3 + i * 0.65, top = 3.15 + (i % 2) * 0.35, x = 3.9 + (i === 2 ? 0.2 : 0);
    m.tube('spine', [[x - 0.6, y, top + 1], [x + 0.1, y + 0.15, top - 0.4], [x + 0.15, y - 0.12, top - 1.5], [x, y + 0.12, top - 2.3]], [0.32, 0.27, 0.22, 0.13], ['#5a3fb0', '#6a4cc0', '#7c5cd0', '#8d6fd8'], { sides: 6 });
  }
  // Bronze rods pinning it open.
  for (const z of [7.15, 3.9]) {
    const b = z > 5 ? 0.42 : -0.38;
    m.tube('spine', [[3.5, -3.05, z - b * 2], [4.72, -2.1, z - b], [5.25, 0, z], [4.72, 2.1, z - b], [3.5, 3.05, z - b * 2]], [0.22, 0.21, 0.21, 0.21, 0.22], rod, { sides: 6 });
  }
  const diamond = (p, dir, s) => { const u = norm(dir), e = norm(cross(u, [0, 0, 1])), up = cross(e, u), c = add(p, mul(u, 0.3)); const cl = [add(c, mul(up, 0.9 * s)), add(c, mul(e, 0.5 * s)), add(c, mul(up, -0.9 * s)), add(c, mul(e, -0.5 * s))]; for (const f of [-1, 1]) for (let i = 0; i < 4; i++) m.tri(add(c, mul(u, f * 0.22 * s)), cl[i], cl[(i + 1) % 4], tan, 0.05, [m.b('spine')], true); };
  for (const [y, z, ang] of [[1, 8.0, 0], [-1, 8.0, 0], [3.0, 6.6, 0.4], [-3.0, 6.6, 0.4], [3.05, 4.3, -0.3], [-3.05, 4.3, -0.3], [1.1, 2.75, 0], [-1.1, 2.75, 0]]) {
    const yy = y, x = Math.sqrt(Math.max(0.4, 22 - yy * yy * 0.55 - (z - 5.5) * (z - 5.5) * 0.75));
    diamond([x, yy, z], [0.7, yy * 0.2, (z - 5.5) * 0.2], 1.05 + ang * 0.2);
  }
  // Arms: huge, the lower arm wrapped at the wrist.
  for (const [s, y] of SIDES) {
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 2.0, 1.75, skin, { k: 0.5 });
    m.blob(`${s}lo`, el, wr, 1.75, 1.95, skin, { k: 0.45 });
    m.ell(`${s}hand`, add(wr, [0.6, 0, -0.6]), [1.45, 1.25, 1.4], dark, { k: 0.4 });
    for (let i = 0; i < 4; i++) { const py = wr[1] + (i - 1.5) * 0.6; m.ell(`${s}hand`, [wr[0] + 1.25, py, wr[2] - 1.1], [0.44, 0.34, 0.75], skin, { k: 0.15 }); }
    hoop(m, `${s}lo`, lerp(el, wr, 0.82), sub(wr, el), 1.95, 0.5, '#57515c', { sides: 12 });
    // Short bowed legs.
    m.blob(`${s}th`, [0.1, y * 2.3, hip + 0.3], [0.3, y * 2.5, 1.9], 2.1, 1.7, skin, { k: 0.5 });
    m.blob(`${s}sh`, [0.3, y * 2.5, 1.9], [0.45, y * 2.5, 0.5], 1.65, 1.5, dark, { k: 0.35 });
    m.ell(`${s}sh`, [0.95, y * 2.5, 0.42], [1.85, 1.3, 0.55], dark, { k: 0.25 });
  }
  // Great cleaver in the left fist, reaching to the floor.
  const clv = (bone, c, dx, dz, h) => {
    const p = [c[0], c[1], c[2]];
    const outline = [add(p, [0, 0, 0]), add(p, [dx, 0, dz]), add(p, [dx + 0.5, 0, dz - h]), add(p, [0.3, 0, -h - dz * 0.05])];
    plate(m, bone, add(lerp(p, outline[2], 0.5), [0, 0.3, 0]), outline, '#d9d4c8', { trim: rust, trimR: 0.1 });
    plate(m, bone, add(lerp(p, outline[2], 0.5), [0, -0.3, 0]), outline, '#c7c2b5', {});
  };
  clv('Lhand', [2.8, 7.6, 3.7], 2.1, 0.35, 7.4);
  m.tube('Lhand', [[1.9, 7.4, 3.8], [3.4, 7.65, 3.9]], 0.24, '#50402a', { sides: 6 });
  // Chain and hook dragged from the right fist.
  chain(m, 'Rhand', [[1.8, -7.3, 2.6], [2.15, -7.6, 1.3], [1.9, -8, 0.3], [2.5, -9, 0.1], [3.4, -9.4, 0.05]], 0.3, '#747078');
  chain(m, 'Rhand', [[1.2, -7.3, 2.6], [0.4, -8, 1.3], [0.1, -8.6, 0.2]], 0.3, '#747078');
  m.tube('Rhand', [[3.4, -9.4, 0.3], [4.7, -9.4, 0.35], [5.25, -9.3, 1.05], [4.8, -9.3, 1.75]], [0.2, 0.16, 0.12, 0.02], '#8a8690', { sides: 5 });
  // The third arm, raised over the back with a butcher's cleaver.
  m.blob('Xup', [-2, 3.6, 9.8], [-3.3, 6.2, 11.4], 1.4, 1.05, skin, { k: 0.5 });
  m.blob('Xlo', [-3.3, 6.2, 11.4], [-3.2, 8.6, 12.9], 1.05, 0.92, skin, { k: 0.3 });
  m.ell('Xhd', [-3.2, 8.8, 13.15], [0.95, 0.85, 1], skin, { k: 0.3 });
  chain(m, 'Xlo', [[-3, 6.7, 12], [-3, 7.8, 12.7]], 0.22, '#5e5862');
  m.tube('Xhd', [[-3.2, 8.8, 12.9], [-3.2, 8.8, 14.5]], 0.22, '#50402a', { sides: 6 });
  plate(m, 'Xhd', [-3.1, 9.2, 15.5], [[-3.3, 7.7, 14.4], [-3.3, 10.5, 14.1], [-3.3, 10.9, 16.5], [-3.3, 8.9, 16.8]], '#d7d2c6', { trim: rust, trimR: 0.1 });
  plate(m, 'Xhd', [-3.45, 9.2, 15.5], [[-3.3, 7.7, 14.4], [-3.3, 10.5, 14.1], [-3.3, 10.9, 16.5], [-3.3, 8.9, 16.8]], '#bcb6a8', {});
  const hipsB = m.b('hips'), spineB = m.b('spine'), chestB = m.b('chest'), headB = m.b('head');
  const built = m.build({
    cell: 0.16, smooth: 1, ao: 0.9, aoReach: 1.3,
    paint(v) {
      const body = v.bone === spineB || v.bone === hipsB || v.bone === chestB;
      if (body) {
        // The hollow is dark and purple, ragged at the lip.
        const ry = Math.hypot(v.y / 2.8, (v.z - 5.35) / 2.85);
        if (v.x > 1 && v.x < 5 && ry < 1.15) tint(v, ry > 0.92 ? '#4f3b8a' : '#221a50', 1);
        // Purple bruising around the wound and in the folds.
        else if (v.x > 2 && ry < 1.5) tint(v, '#b49ccc', 0.5 * sstep(1.5, 1.15, ry));
        // Stitches: vertical seams with cross-ticks.
        const seam = (u, v2, ax, ab) => { const d = Math.abs(u - (ax + (v2 - 7) * ab)); return d; };
        const ay = Math.abs(v.y), zt = (v.z + 100) * 2.4;
        const ticks = wave(zt) > 0.5;
        const front = v.x > 1.5 ? 1 : 0;
        if (front && v.z > 7.5) {
          const d = seam(ay, v.z, 0.05, 0);
          if (d < 0.1 && ticks) tint(v, '#3f3a34', 0.9);
          if (d < 0.26 && d > 0.1 && ticks && Math.abs(wave(zt) - 0.75) < 0.1) tint(v, '#3f3a34', 0.8);
        }
        for (const ax of [2.7, 4.1]) {
          const d = Math.abs(ay - ax - 0.5 * Math.sin(v.z));
          if (d < 0.09 && v.z > 5 && ticks) tint(v, '#403b33', 0.85);
          if (d < 0.27 && d > 0.09 && Math.abs(wave(zt) - 0.75) < 0.09 && v.z > 5) tint(v, '#403b33', 0.75);
        }
        if (v.z > 8.5 && Math.abs((v.z + 100) % 1.8 - 0.9) < 0.07) tint(v, '#6a6a60', 0.5);
      } else if (v.bone !== headB) {
        // Stitched wraps along the limbs.
        const zt = (v.z + 100) * 2.4, ang = Math.atan2(v.y, v.x);
        if (Math.abs(((ang + 7) % 2) - 1) < 0.07 && wave(zt) > 0.5) tint(v, '#403b33', 0.8);
      }
      if (v.bone === headB && v.x > 3 && Math.abs(v.z - 10.32) < 0.3 && Math.abs(v.y) < 1.15) tint(v, '#1f0c0d', 1);
      if (v.bone === headB && v.x > 2.6) {
        // Puckered seams on the scalp.
        if (Math.abs(v.y) < 0.09 && v.z > 11.3 && wave((v.x + 100) * 3) > 0.5) tint(v, '#3a352c', 0.9);
      }
    },
  });
  return built;
}
const animPatchwerk = human({
  arms: 0.5, swing: 0.7, raise: 0.5,
  extra: (p, s, q) => { const t = s.t; p.r('Xup', 0.08 * Math.sin(t * 1.5), 0.06 * Math.sin(t * 1.1), 0); p.r('Xlo', 0, 0.12 * Math.sin(t * 1.5 + 0.4) - 0.6 * q.swing, 0); p.r('Xhd', 0.2 * Math.sin(t * 2.1), -0.4 * q.swing, 0); },
});

// ---- Grobbulus: pale lilac and bloated, green-lit mutagen ports, a hose from the skull, glass syringe and brass gauntlet.
function buildGrobbulus() {
  const m = new ModelBuilder();
  const skin = '#d8c6e6', dk = '#b39ccc', iron = '#4e4a5c', iron2 = '#34304a', brass = '#b88a30', green = '#62e23a', leather = '#3d3550';
  const hip = 3.7, chest = 7, neck = 9.5;
  const H = rig(m, {
    hip, chest, neck, sw: 4.6, hipW: 1.9, headUp: 0, lean: 0.8,
    arms: { L: { sh: [-0.1, 4.7, 9.1], el: [0.1, 6.3, 6.4], wr: [1.8, 6.5, 4.5] }, R: { sh: [-0.1, -4.7, 9.1], el: [0.35, -6.4, 6.6], wr: [2.1, -6.6, 5.2] } },
  });
  m.ell('spine', [0.2, 0, 6], [3.5, 4, 3.6], skin, { k: 0.8 });
  m.ell('chest', [0, 0, 8.5], [3.05, 4.5, 2.5], skin, { k: 0.7 });
  m.ell('hips', [0.1, 0, 3.6], [2.5, 3, 1.5], leather, { k: 0.45 });
  m.ell('head', [1.3, 0, 10.7], [1.45, 1.3, 1.25], skin, { k: 0.5 });
  m.ell('head', [2.4, 0, 10.5], [0.5, 0.8, 0.55], dk, { k: 0.2 });
  m.lathe('head', [1.2, 0, 11.5], [1.2, 0, 12.5], [[1.0, 0], [0.86, 0.4], [0.34, 0.8], [0.3, 1]], '#55526a', { sides: 12 });
  m.ball('head', [2.82, 0.3, 11], 0.16, '#f0f0d0', { em: 1, rings: 4, sides: 6 });
  m.ball('head', [2.82, -0.3, 11], 0.16, '#f0f0d0', { em: 1, rings: 4, sides: 6 });
  m.box('head', [2.82, 0, 10.45], [0.12, 0.95, 0.14], '#2a2030', {});
  // Hose from the crown down the chest.
  const hose = [[1.25, 0.3, 12.2], [2.3, -0.5, 12.5], [3.25, -1.15, 11.6], [3.65, -1.5, 10.4], [3.72, -1.6, 9.2], [3.55, -1.6, 8]];
  m.tube('chest', hose, 0.34, '#4d4a58', { sides: 7 });
  for (let i = 0; i < 18; i++) { const k = i / 18 * (hose.length - 1), a = Math.floor(k), f = k - a, p = lerp(hose[a], hose[Math.min(a + 1, hose.length - 1)], f), q = lerp(hose[Math.min(a + 1, hose.length - 1)], hose[Math.min(a + 2, hose.length - 1)], f); hoop(m, 'chest', p, sub(q, p), 0.42, 0.13, '#898595', { sides: 8 }); }
  // Glowing ports.
  const port = (bone, c, r, nrm) => {
    const d = norm(nrm);
    m.ball(bone, c, r * 0.9, green, { em: 2.4, rings: 5, sides: 10 });
    m.lathe(bone, add(c, mul(d, -0.2)), add(c, mul(d, 0.34)), [[r * 1.08, 0], [r * 1.22, 0.45], [r * 1, 1]], '#666273', { sides: 10 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28, u = norm(cross(d, [0.3, 0.5, 0.8])), w = cross(d, u), q = add(c, add(mul(u, Math.cos(a) * r * 1.55), mul(w, Math.sin(a) * r * 1.55))); m.ball(bone, q, r * 0.2, '#57535f', { rings: 3, sides: 5 }); }
  };
  port('chest', [2.72, 2.15, 9.3], 0.62, [0.9, 0.45, 0.3]);
  port('chest', [3.4, -1.55, 7.85], 0.45, [1, -0.2, 0.05]);
  port('spine', [3.5, 1.6, 6.2], 0.46, [1, 0.3, 0.1]);
  port('spine', [3.55, -1.95, 5.5], 0.52, [1, -0.3, -0.05]);
  port('chest', [1.2, 4.4, 8.9], 0.5, [0.45, 1, 0.45]);
  port('chest', [1.2, -4.4, 8.9], 0.4, [0.45, -1, 0.45]);
  for (const [, y] of SIDES) { m.ell('chest', [-0.1, y * 4.7, 8.9], [1.55, 1.7, 1.5], skin, { k: 0.4 }); }
  // Waist band and iron-shod legs.
  hoop(m, 'hips', [0.1, 0, 3.95], [0, 0, 1], 3.2, 0.82, iron, { sides: 18 });
  for (let i = -3; i <= 3; i++) m.ball('hips', [Math.sqrt(10.2 - (i * 0.8) ** 2), i * 0.8, 3.98], 0.13, '#8f8a98', { rings: 3, sides: 5 });
  for (const [s, y] of SIDES) {
    m.blob(`${s}th`, [0.1, y * 1.8, 3.6], [0.25, y * 2.1, 1.85], 1.55, 1.25, iron, { k: 0.35 });
    hoop(m, `${s}th`, [0.15, y * 1.95, 2.85], [0, 0, 1], 1.55, 0.5, brass, { sides: 14 });
    hoop(m, `${s}th`, [0.2, y * 2.08, 2.15], [0, 0, 1], 1.42, 0.3, iron2, { sides: 14 });
    m.blob(`${s}sh`, [0.25, y * 2.1, 1.85], [0.3, y * 2.15, 0.7], 1.25, 1.2, iron2, { k: 0.3 });
    m.ell(`${s}sh`, [0.5, y * 2.2, 0.52], [1.75, 1.4, 0.72], '#615d72', { k: 0.25 });
  }
  // Left arm (his right, image left): a green glass mutagen tube ending in a needle.
  { const { sh, el, wr } = H.a.R, f = sub(wr, el);
    m.blob('Rup', sh, el, 1.55, 1.25, skin, { k: 0.4 });
    hoop(m, 'Rlo', lerp(el, wr, 0.1), f, 1.32, 0.36, iron, { sides: 12 });
    m.blob('Rlo', el, lerp(el, wr, 0.55), 1.1, 1.0, skin, { k: 0.2 });
    m.lathe('Rlo', lerp(el, wr, 0.35), add(wr, mul(norm(f), 0.25)), [[0.95, 0], [1.02, 0.15], [1.02, 0.85], [0.8, 1]], '#7ce83f', { sides: 12, em: 1.05 });
    hoop(m, 'Rlo', lerp(el, wr, 0.42), f, 1.1, 0.26, brass, { sides: 12 });
    hoop(m, 'Rlo', lerp(el, wr, 1.02), f, 1.08, 0.3, iron, { sides: 12 });
    m.lathe('Rhand', add(wr, mul(norm(f), 0.2)), add(wr, mul(norm(f), 1.45)), [[0.76, 0], [0.5, 0.5], [0.32, 1]], iron2, { sides: 9 });
    m.spike('Rhand', add(wr, mul(norm(f), 1.45)), add(wr, mul(norm(f), 4.05)), 0.26, '#c7c7d2', { sides: 6, tipColor: '#effaf2' }); }
  // Right arm (his left, image right): a brass mechanical gauntlet with a heavy hammer face.
  { const { sh, el, wr } = H.a.L, f = sub(wr, el), d = norm(f);
    m.blob('Lup', sh, el, 1.55, 1.25, skin, { k: 0.4 });
    m.blob('Llo', el, lerp(el, wr, 0.4), 1.15, 1.05, skin, { k: 0.2 });
    m.lathe('Llo', lerp(el, wr, 0.25), wr, [[1.2, 0], [1.3, 0.2], [1.25, 0.8], [1.08, 1]], brass, { sides: 12 });
    hoop(m, 'Llo', lerp(el, wr, 0.42), f, 1.35, 0.25, iron2, { sides: 12 });
    hoop(m, 'Llo', lerp(el, wr, 0.68), f, 1.34, 0.25, iron2, { sides: 12 });
    m.lathe('Lhand', add(wr, mul(d, -0.1)), add(wr, mul(d, 1.2)), [[0.9, 0], [0.74, 0.4], [0.62, 1]], '#5a4a30', { sides: 8 });
    m.lathe('Lhand', add(wr, mul(d, 1.2)), add(wr, mul(d, 2.5)), [[1.35, 0], [1.42, 0.15], [1.42, 0.85], [1.25, 1]], '#a07c2c', { sides: 8 });
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28, e = norm(cross(d, [0, 1, 0])), g = cross(d, e), q = add(wr, add(mul(d, 1.85), add(mul(e, Math.cos(a) * 1.45), mul(g, Math.sin(a) * 1.45)))); m.ball('Lhand', q, 0.16, '#55472c', { rings: 3, sides: 5 }); } }
  const spineB = m.b('spine'), chestB = m.b('chest');
  const built = m.build({
    cell: 0.14, smooth: 1, ao: 0.85, aoReach: 1.2,
    paint(v) {
      if (v.bone === spineB || v.bone === chestB) {
        // Bruised lilac skin with faint seams and a darker sag under the chest.
        const bruise = sstep(0.32, 0.72, wave(v.x * 0.5 + v.y * 0.7 + 2) * wave(v.z * 0.6 + v.y * 0.3));
        tint(v, '#a98cc4', bruise * 0.45);
        const ay = Math.abs(v.y);
        if (v.x > 1.2 && Math.abs(ay - 0.08) < 0.08 && v.z > 6 && wave((v.z + 100) * 2.2) > 0.5) tint(v, '#6a5a7a', 0.8);
        if (v.nz < -0.25 && v.z < 8) shade(v, 0.8);
      }
    },
  });
  return built;
}
function grobbulusFX(P, ctx) {
  const c = SCHOOLS.poison;
  if (Math.random() < 0.7) {
    const q = toWorld(ctx.M, [3.2 + Math.random() * 3, -7 + Math.random() * 2, 3.5]);
    P.emit(q[0], q[1], q[2], 0, 0, -1, 0.12, 0, c[0] * 0.6, c[1] * 0.6, c[2] * 0.6, 0, 0.8, 0);
  }
}
const animGrobbulus = human({ arms: 0.6, swing: 0.6, raise: 0.5 });

// ---- Gluth: a hunched zombie hound, brown shag over stitched green hide, iron-braced jaw and legs.
function buildGluth() {
  const m = new ModelBuilder();
  const fur = '#4b2e18', fur2 = '#6c4726', fur3 = '#38220f', green = '#8a9a46', pale = '#c9bd98', iron = '#5a6f92', claw = '#c4b070', bone2 = '#d6ceb0';
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-4.2, 0, 5.4]);
  m.bone('chest', 'hips', [1.6, 0, 7.4]);
  m.bone('neck', 'chest', [4, 0, 7.2]);
  m.bone('head', 'neck', [5.7, 0, 5.6]);
  m.bone('jaw', 'head', [6.4, 0, 4.5]);
  m.bone('mouth', 'head', [9.2, 0, 4.2]);
  m.bone('tail0', 'hips', [-7.2, 0, 7]);
  m.bone('tail1', 'tail0', [-8.6, 0, 8.3]);
  const legPts = { f: { sh: [2.2, 3.5, 6.9], el: [3.1, 4.6, 3.8], pw: [4, 4.5, 1.15] }, b: { sh: [-4.6, 2.9, 5.2], el: [-3.4, 3.8, 3.2], pw: [-4.6, 3.7, 1.1] } };
  for (const [s, y] of SIDES) for (const [n, L] of Object.entries(legPts)) { m.bone(`${s}${n}u`, n === 'f' ? 'chest' : 'hips', flat(y, [L.sh])[0]); m.bone(`${s}${n}l`, `${s}${n}u`, flat(y, [L.el])[0]); }
  // Enormous shoulders, a sloped back, smaller hindquarters.
  m.ell('chest', [1.3, 0, 7.7], [4.9, 4.3, 3.9], fur, { k: 0.9 });
  m.ell('chest', [-0.8, 0, 9.3], [3.6, 3.5, 2.6], fur, { k: 0.8 });
  m.ell('hips', [-4.3, 0, 5.8], [3.5, 3.2, 3.1], fur, { k: 0.9 });
  m.ell('chest', [2.6, 0, 5.2], [3.2, 3, 2.2], fur3, { k: 0.8 });
  // Neck plunges down to a low bony head.
  m.blob('neck', [3.6, 0, 7.8], [6.2, 0, 5.8], 2.1, 1.6, fur, { k: 0.8 });
  m.ell('head', [6.6, 0, 6.05], [1.95, 1.65, 1.55], pale, { k: 0.45 });
  m.blob('head', [7.8, 0, 5.65], [9.5, 0, 4.95], 1.02, 0.66, pale, { k: 0.25 });
  m.blob('jaw', [6.9, 0, 4.3], [9.1, 0, 3.75], 0.75, 0.52, pale, { k: 0.2 });
  m.ell('jaw', [8.45, 0, 4.25], [1.05, 0.6, 0.14], '#3a0f0c', { k: 0.05 });
  // Iron bands round the muzzle, riveted.
  for (const [cx, r] of [[7.75, 1.2], [8.95, 0.92]]) {
    const c = [cx, 0, 5.62 - (cx - 7.75) * 0.5];
    hoop(m, 'head', c, [0.92, 0, -0.38], r, 0.5, iron, { sides: 10 });
    for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.28; m.ball('head', [c[0] + Math.sin(a) * r * 0.38, c[1] + Math.cos(a) * (r + 0.02), c[2] + Math.sin(a) * (r + 0.02) * 0.92], 0.13, '#9db0c8', { rings: 3, sides: 5 }); }
  }
  m.ell('head', [7.7, 0, 7.15], [1.35, 1.05, 0.34], '#b6a982', { k: 0.25 });
  m.ell('head', [5.2, 0, 7], [1.65, 1.5, 0.9], fur2, { k: 0.5 });
  for (const [, y] of SIDES) {
    // A sunken socket, a pale eye ringed by an iron rivet plate.
    m.ell('head', [7.75, y * 1.3, 6.5], [0.5, 0.22, 0.4], '#20180f', { k: 0.1 });
    m.ball('head', [7.9, y * 1.42, 6.5], 0.2, '#d8d29e', { em: 1, rings: 4, sides: 6 });
    m.ball('head', [8.04, y * 1.5, 6.52], 0.09, '#12120a', { rings: 3, sides: 4 });
    hoop(m, 'head', [7.88, y * 1.4, 6.5], [0.5, y * 0.8, 0], 0.34, 0.12, iron, { sides: 10 });
    m.spike('head', [9.5, y * 0.5, 4.75], [9.55, y * 0.5, 3.45], 0.22, '#ece4bc', { sides: 4 });
    m.spike('head', [8.7, y * 0.74, 4.95], [8.75, y * 0.82, 3.75], 0.18, '#ece4bc', { sides: 4 });
    m.spike('jaw', [9, y * 0.42, 4], [9.15, y * 0.46, 4.95], 0.2, '#ece4bc', { sides: 4 });
    m.spike('jaw', [8.2, y * 0.6, 4.15], [8.3, y * 0.62, 5.1], 0.16, '#ece4bc', { sides: 4 });
    // Iron plate bolted along the lower jaw, as on the model.
    const plateOut = flat(y, [[6.8, 0.85, 4.75], [9.2, 0.62, 4.35], [9.3, 0.6, 3.35], [7.3, 0.95, 3.15], [6.3, 1.0, 3.7]]);
    plate(m, 'jaw', flat(y, [[7.8, 1.2, 3.95]])[0], plateOut, iron, { trim: '#3b4a64', trimR: 0.07 });
    for (const [ax, az] of [[6.9, 3.6], [8.4, 3.4], [8.7, 4.3], [7.3, 4.5]]) m.ball('jaw', flat(y, [[ax, 1.03, az]])[0], 0.13, '#9db0c8', { rings: 3, sides: 5 });
    // Drool.
    m.tube('jaw', [[9.3, y * 0.3, 3.4], [9.4, y * 0.3, 2.1], [9.35, y * 0.3, 1.05]], [0.06, 0.05, 0.02], '#b6c870', { sides: 3, em: 0.3 });
    // Fore and hind legs, heavy-furred, armoured cuff at the knee.
    const Lf = legPts.f, Lb = legPts.b;
    const [fs, fe, fp, bs, be, bp] = [Lf.sh, Lf.el, Lf.pw, Lb.sh, Lb.el, Lb.pw].map((p) => flat(y, [p])[0]);
    const S = y > 0 ? 'L' : 'R';
    m.blob(`${S}fu`, fs, fe, 2.4, 1.9, fur, { k: 0.7 });
    m.blob(`${S}fl`, fe, fp, 1.85, 1.75, fur, { k: 0.4 });
    m.ell(`${S}fl`, [fp[0] + 0.4, fp[1], 0.95], [2.1, 1.85, 1], fur3, { k: 0.3 });
    hoop(m, `${S}fl`, lerp(fe, fp, 0.28), sub(fp, fe), 2.08, 0.75, iron, { sides: 12, rings: [[2, 0], [2.14, 0.2], [2.14, 0.8], [2, 1]] });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.28, c = lerp(fe, fp, 0.28); m.ball(`${S}fl`, add(c, [Math.cos(a) * 2.18, Math.sin(a) * 2.18, 0]), 0.14, '#9db0c8', { rings: 3, sides: 5 }); }
    m.blob(`${S}bu`, bs, be, 2.2, 1.6, fur, { k: 0.6 });
    m.blob(`${S}bl`, be, bp, 1.55, 1.45, fur, { k: 0.35 });
    m.ell(`${S}bl`, [bp[0] + 0.5, bp[1], 0.82], [1.75, 1.55, 0.85], fur3, { k: 0.25 });
    for (let c = -1; c <= 1; c++) {
      m.spike(`${S}fl`, [fp[0] + 1.5, fp[1] + c * 0.95, 0.85], [fp[0] + 3.7, fp[1] + c * 1.05, 0.02], 0.52, claw, { sides: 5, bend: [0.1, 0, 0.42], tipColor: '#efe4b9' });
      m.spike(`${S}bl`, [bp[0] + 1.35, bp[1] + c * 0.8, 0.72], [bp[0] + 3, bp[1] + c * 0.88, 0.02], 0.4, claw, { sides: 5, bend: [0.1, 0, 0.32], tipColor: '#efe4b9' });
    }
  }
  // Short raised tail, spiked.
  m.blob('tail0', [-7, 0, 6.8], [-8.6, 0, 8.4], 1.1, 0.5, fur, { k: 0.4 });
  m.spike('tail1', [-8.6, 0, 8.4], [-9.4, 0, 10.2], 0.5, '#57381c', { sides: 5 });
  // Bolts along the spine and shag along the neck, back and limbs.
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  for (const [x, y, z, s] of [[-0.8, 0, 11.7, 1], [0.8, 1.2, 11.4, 0.85], [-2.4, -1.1, 11, 0.8], [2.2, -0.8, 11.2, 0.95], [-4.3, 0.2, 9, 0.85], [3.8, 1.5, 10.3, 0.7]]) {
    m.box('chest', [x, y, z], [0.9 * s, 0.9 * s, 1.4 * s], bone2, { taper: 0.7 });
    m.box('chest', [x, y, z + 0.86 * s], [1.25 * s, 1.25 * s, 0.28 * s], '#e4ddc0', {});
  }
  const shagPts = [];
  for (let i = 0; i < 260; i++) {
    const t = i / 260, x = 4.5 - t * 12.5, env = t < 0.15 ? 2.8 : t < 0.55 ? 3.9 : 3.2 - (t - 0.55) * 2, a = 0.55 + rnd(i, 1) * 2.05, side = i % 2 ? 1 : -1;
    const cz = x > -1 ? 7.9 + x * -0.18 : 6.4 + (x + 8) * 0.25, cy = 0;
    shagPts.push([x, side * Math.sin(a) * env + cy, cz + Math.cos(a) * env, side, a]);
  }
  shagPts.forEach(([x, y, z, side, a], i) => {
    const b = i % 3 === 0 ? 'hips' : 'chest';
    const useB = x < -2.5 ? 'hips' : b === 'hips' ? 'chest' : b;
    m.spike(useB, [x, y, z], [x - 0.9 - rnd(i, 4) * 0.8, y * 1.25 + side * (0.4 + Math.cos(a) * 0.3), z + (Math.cos(a) * 0.95 - 0.9) * (1.2 + rnd(i, 5) * 0.9)], 0.32, i % 2 ? fur2 : fur3, { sides: 3 });
  });
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * 6.28, f = i % 2;
    const S = f ? 'Lfl' : 'Rfl', y = f ? 1 : -1, c = flat(y, [lerp(legPts.f.el, legPts.f.pw, 0.5 + rnd(i, 7) * 0.5)])[0];
    m.spike(S, add(c, [Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0.1]), add(c, [Math.cos(a) * 2.5, Math.sin(a) * 2.5, -1.1 - rnd(i, 8)]), 0.26, i % 3 ? fur2 : fur3, { sides: 3 });
  }
  const chestB = m.b('chest'), hipsB = m.b('hips');
  const hide = new Set([chestB, hipsB, ...['Lfu', 'Rfu', 'Lbu', 'Rbu'].map((n) => m.b(n))]);
  // Patches of stitched green flesh.
  const patches = [[1.5, 9.4, 2.5], [-1.9, 7.4, 1.8], [-5.1, 7.6, 1.5], [3.1, 5.8, 1.45], [-0.6, 4.3, 1.25]];
  const built = m.build({
    cell: 0.16, smooth: 1, ao: 1, aoReach: 1.3,
    paint(v) {
      if (hide.has(v.bone)) {
        if (v.nz < -0.5) shade(v, 0.7);
        const ay = Math.abs(v.y);
        if (ay > 0.6) for (const [px, pz, r] of patches) {
          const d = Math.hypot(v.x - px, v.z - pz) + 0.14 * Math.sin(Math.atan2(v.z - pz, v.x - px) * 5);
          if (d < r) {
            tint(v, green, 0.95);
            if (d > r * 0.84) tint(v, '#d8d2a0', 0.9);
          } else if (d < r + 0.26 && wave(Math.atan2(v.z - pz, v.x - px) * 3.3) > 0.5) tint(v, '#2a1c10', 0.85);
        }
        // A pale stripe across the top where the hide is stretched.
        if (v.nz > 0.82 && v.x > 0 && v.x < 3.5) tint(v, '#7b9244', 0.8);
      }
    },
  });
  return built;
}
function animateGluth(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 8), c = ease('c', s.cast ? 1 : 0, 7);
  const br = Math.sin(t * 1.6) * 0.03;
  p.r('chest', 0, br, 0);
  p.r('neck', 0, -0.06 + 0.04 * Math.sin(t * 1.1) - 0.2 * c, 0.05 * Math.sin(t * 0.7));
  p.r('head', 0, 0.06 * Math.sin(t * 1.3) - 0.22 * c, 0.1 * Math.sin(t * 0.6));
  p.r('jaw', 0, 0.12 + 0.08 * Math.sin(t * 2.2) + 0.55 * c, 0);
  p.r('tail0', 0, 0.1 * Math.sin(t * 2.2), 0.2 * Math.sin(t * 1.7)).r('tail1', 0, 0.1 * Math.sin(t * 2.4), 0.3 * Math.sin(t * 1.9));
  if (walk > 0.01) {
    const w = t * 7, a = Math.sin(w) * walk * 0.55, b = Math.cos(w) * walk;
    p.r('Lfu', 0, -a, 0).r('Rbu', 0, -a, 0).r('Rfu', 0, a, 0).r('Lbu', 0, a, 0).r('Lfl', 0, Math.max(0, b) * 0.7, 0).r('Rbl', 0, Math.max(0, b) * 0.7, 0).r('Rfl', 0, Math.max(0, -b) * 0.7, 0).r('Lbl', 0, Math.max(0, -b) * 0.7, 0);
    p.o('hips', 0, 0, Math.abs(a) * 0.4);
  }
  p.evaluate();
}

// ---- Thaddius: a stitched flesh giant, pale cream, red cowl behind, iron jaw, huge dark gauntlets and iron boots.
function buildThaddius() {
  const m = new ModelBuilder();
  const skin = '#dcc98f', skinD = '#bda66c', red = '#8c1d15', redD = '#5a100c', dark = '#1e2014', iron = '#585b62', ironL = '#868991', stitch = '#6a5a34';
  const hip = 6.4, chest = 11, neck = 14.2;
  const H = rig(m, {
    hip, chest, neck, sw: 5.6, hipW: 2.5, headUp: 0.1, lean: 1.6,
    arms: { L: { sh: [0, 5.9, 13.4], el: [0.4, 8.3, 9.8], wr: [2.8, 8.6, 7.6] }, R: { sh: [0, -5.9, 13.4], el: [0.7, -8.3, 9.9], wr: [3.4, -8.2, 8.1] } },
  });
  m.ell('chest', [0.5, 0, 12], [3.1, 5.3, 3], skin, { k: 0.7 });
  m.ell('spine', [0.2, 0, 9.1], [2.15, 3, 2.4], skin, { k: 0.6 });
  m.ell('hips', [0.1, 0, 6.9], [2.4, 3.1, 1.5], skin, { k: 0.45 });
  m.ell('chest', [-1.2, 0, 13], [2.4, 4.6, 1.9], skin, { k: 0.6 });
  // Small head thrust forward.
  m.blob('neck', [1.3, 0, 13.7], [1.85, 0, 14.9], 1.25, 1.05, skin, { k: 0.3 });
  m.ell('head', [2.25, 0, 15.5], [1.2, 1.12, 1.42], skin, { k: 0.3 });
  m.ell('head', [2.9, 0, 14.9], [0.75, 0.85, 0.6], skin, { k: 0.2 });
  m.ell('head', [3.2, 0, 15.45], [0.25, 0.22, 0.42], skinD, { k: 0.1 });
  m.ball('head', [3.25, 0.5, 15.9], 0.16, '#6cff6a', { em: 6, rings: 4, sides: 6 });
  m.ball('head', [3.25, -0.5, 15.9], 0.16, '#6cff6a', { em: 6, rings: 4, sides: 6 });
  m.box('head', [3.3, 0, 16.2], [0.14, 1.25, 0.22], '#7a6c42', {});
  // Exposed red scalp, iron plates and bolts holding the skull together.
  m.ell('head', [1.95, 0, 16.75], [1.25, 1.05, 0.6], '#c84a4a', { k: 0.1 });
  for (let i = 0; i < 32; i++) { const a = (i / 32) * 6.28, r = 0.52 + (i % 3) * 0.13; m.spike('head', [1.95 + Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.85, 17.15], [1.95 + Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.85, 17.65], 0.11, '#dd5560', { sides: 3 }); }
  for (const [, y] of SIDES) {
    plate(m, 'head', flat(y, [[1.6, 1.42, 15.9]])[0], flat(y, [[2.6, 1, 16.9], [0.9, 1.05, 16.95], [0.75, 1.2, 15.2], [2.55, 1.05, 15.3]]), iron, { trim: ironL, trimR: 0.05 });
    m.tube('head', flat(y, [[1.3, 1.2, 16.1], [1.3, 2.05, 16.3]]), 0.2, ironL, { sides: 6 });
    m.ball('head', flat(y, [[1.3, 2.05, 16.3]])[0], 0.26, ironL, { rings: 4, sides: 6 });
    // Iron jaw cage bolted to the neck.
    plate(m, 'neck', flat(y, [[3.0, 1.2, 14]])[0], flat(y, [[3.7, 0.85, 14.8], [3.5, 0.95, 13.4], [2, 1.3, 13.2], [1.9, 1.2, 14.6]]), iron, { trim: ironL, trimR: 0.06 });
    m.spike('neck', flat(y, [[1.8, 1.5, 13.3]])[0], flat(y, [[1, 2.9, 12.9]])[0], 0.3, ironL, { sides: 6 });
    m.ball('neck', flat(y, [[1, 2.9, 12.9]])[0], 0.34, ironL, { rings: 4, sides: 6 });
  }
  plate(m, 'neck', [3.6, 0, 13.1], [[3.8, -0.85, 14.1], [3.8, 0.85, 14.1], [3.7, 0.95, 13], [3.7, -0.95, 13]], iron, { trim: ironL, trimR: 0.06 });
  // The tall red cowl at his back.
  m.ell('chest', [-3, 0, 15.6], [2.6, 3, 3.5], red, { k: 0.3 });
  m.cut([0.2, 0, 15.2], [-2.1, 0, 15.7], 2.5, 2.05, { k: 0.2 });
  m.ball('chest', [-3, 0, 19], 0.55, '#e0d2b0', { rings: 5, sides: 8 });
  m.tube('chest', [[-1.9, 2.65, 13.8], [-1.3, 3.2, 15.8], [-1.9, 2.3, 18], [-3, 0, 18.8]], 0.26, '#b83a2a', { sides: 6 });
  m.tube('chest', [[-1.9, -2.65, 13.8], [-1.3, -3.2, 15.8], [-1.9, -2.3, 18], [-3, 0, 18.8]], 0.26, '#b83a2a', { sides: 6 });
  // Left shoulder armour, red over iron.
  { m.ell('Lup', [0, 6.15, 13.6], [1.95, 2.05, 1.5], redD, { k: 0.2 });
    plate(m, 'Lup', [1.2, 6.7, 15.1], [[1.9, 4.9, 14.6], [0.4, 5.3, 15.5], [-1.7, 5.6, 15.1], [-1.7, 7.9, 14.1], [0.4, 8.5, 14.2], [2, 7.7, 13.8]], red, { trim: '#c23a2a', trimR: 0.12 });
    plate(m, 'Lup', [1.1, 7.2, 14.1], [[1.95, 5.5, 14.3], [0.5, 7.3, 14.9], [-1.5, 6.8, 14.6], [-1.3, 8.4, 13], [1.2, 8.75, 12.9], [2, 7.5, 13.2]], iron, { trim: ironL, trimR: 0.08 });
    plate(m, 'Lup', [1.15, 7.65, 13], [[1.75, 6.6, 13], [0.55, 8.2, 13.5], [-1.2, 7.7, 13.1], [-1, 8.8, 11.9], [1.25, 8.85, 11.85], [1.85, 7.8, 12.1]], red, { trim: '#c23a2a', trimR: 0.1 });
  }
  m.ell('Rup', [0.1, -6.1, 13.7], [1.7, 1.7, 1.5], skin, { k: 0.4 });
  // Arms, massive; dark gauntlets with red cuffs.
  for (const [s, y] of SIDES) {
    const { sh, el, wr } = H.a[s], f = sub(wr, el), d = norm(f);
    m.blob(`${s}up`, sh, el, 1.65, 1.35, skin, { k: 0.45 });
    m.blob(`${s}lo`, el, lerp(el, wr, 0.7), 1.3, 1.25, skin, { k: 0.3 });
    // Gauntlet: wide dark block widening to a heavy fist.
    m.lathe(`${s}lo`, lerp(el, wr, 0.3), add(wr, mul(d, 0.45)), [[1.6, 0], [2, 0.18], [2.45, 0.9], [2.55, 1]], redD, { sides: 6 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.42), f, 2.1, 0.5, red, { sides: 6 });
    hoop(m, `${s}lo`, lerp(el, wr, 0.95), f, 2.6, 0.42, '#3a0b08', { sides: 6 });
    const fist = add(wr, mul(d, 1.1));
    m.ell(`${s}hand`, fist, [1.6, 1.55, 1.6], dark, { k: 0.2 });
    for (let i = 0; i < 4; i++) m.ell(`${s}hand`, add(fist, [1 + d[0] * 0.3, (i - 1.5) * 0.75, -0.55 + d[2] * 0.3]), [0.44, 0.36, 0.56], '#2d3020', { k: 0.05 });
    m.ell(`${s}hand`, add(fist, [0.4, y * -1.05, 0.5]), [0.42, 0.3, 0.42], dark, { k: 0.05 });
    // Legs, then tall iron boots banded in red with bolts at the top.
    m.blob(`${s}th`, [0.15, y * 2.5, 6.6], [0.35, y * 2.9, 3.7], 2.15, 1.6, skin, { k: 0.5 });
    m.blob(`${s}sh`, [0.35, y * 2.9, 3.7], [0.45, y * 3, 1.6], 1.45, 1.35, iron, { k: 0.2 });
    m.lathe(`${s}sh`, [0.45, y * 3, 0.6], [0.3, y * 2.9, 5], [[1.85, 0], [1.72, 0.3], [1.86, 0.75], [2.05, 1]], iron, { sides: 8 });
    for (const z of [1.4, 2.4, 3.4, 4.3]) hoop(m, `${s}sh`, [0.42, y * 2.95, z], [0, 0, 1], 2.06 - (4.3 - z) * 0.08, 0.32, red, { sides: 8, rings: [[1.92, 0], [2.06, 0.3], [2.06, 0.7], [1.94, 1]] });
    m.ell(`${s}sh`, [1.05, y * 3, 0.65], [2.25, 1.8, 0.72], redD, { k: 0.2 });
    for (const [ax, ay] of [[0.8, 1], [-0.9, 1], [0.1, 1.2]]) { const c = [0.3 + ax, y * (2.9 + ay), 5.2]; m.lathe(`${s}sh`, add(c, [0, 0, -0.1]), add(c, [0, 0, 0.75]), [[0.45, 0], [0.45, 0.6], [0.3, 1]], ironL, { sides: 6 }); }
  }
  // Riveted iron belt and red loincloth.
  hoop(m, 'hips', [0.1, 0, 7.6], [0, 0, 1], 3.25, 1.25, iron, { sides: 16 });
  hoop(m, 'hips', [0.1, 0, 8.3], [0, 0, 1], 3.3, 0.22, red, { sides: 16 });
  hoop(m, 'hips', [0.1, 0, 6.9], [0, 0, 1], 3.32, 0.22, red, { sides: 16 });
  for (let i = -5; i <= 5; i++) for (const z of [7.3, 7.75]) m.ball('hips', [Math.sqrt(Math.max(0.1, 10.8 - (i * 0.56) ** 2)), i * 0.56, z], 0.1, '#a4a7ad', { rings: 3, sides: 5 });
  plate(m, 'hips', [2.9, 0, 5.7], [[2.8, 1.4, 7], [2.8, -1.4, 7], [2.5, -1, 4.5], [3, 0, 3.6], [2.5, 1, 4.5]], red, { trim: '#c79a48', trimR: 0.06 });
  plate(m, 'hips', [-3, 0, 5.7], [[-2.8, 1.5, 7], [-2.8, -1.5, 7], [-2.5, -1.2, 4], [-2.9, 0, 3.4], [-2.5, 1.2, 4]], redD, {});
  m.ball('hips', [3.5, 0, 7.6], 0.32, '#7fd0ff', { em: 2.5, rings: 4, sides: 8 });
  const chestB = m.b('chest'), spineB = m.b('spine'), hipsB = m.b('hips'), th = new Set(['Lth', 'Rth', 'Lup', 'Rup', 'Llo', 'Rlo'].map((n) => m.b(n)));
  const built = m.build({
    cell: 0.16, smooth: 1, ao: 0.85, aoReach: 1.3,
    paint(v) {
      const seam = (d, along, k = 1) => { if (d < 0.1 && wave(along * 3) > 0.5) tint(v, stitch, 0.9 * k); if (d < 0.32 && d > 0.1 && Math.abs(wave(along * 3) - 0.75) < 0.09) tint(v, stitch, 0.75 * k); };
      const ay = Math.abs(v.y);
      if (v.bone === chestB || v.bone === spineB) {
        if (v.x > 0.5) {
          // The Y-seam across the chest and down the belly.
          if (v.z > 12.3) seam(Math.abs(v.z - (14.3 - ay * 0.42)), ay);
          seam(ay, v.z);
          // Short seams across the pectorals.
          if (v.z > 9) seam(Math.abs(v.z - (11.7 - ay * 0.2)), ay, 0.7);
        }
        if (v.bone === chestB && v.x < -1.5 && v.z > 14.4 && v.nx > -0.2) tint(v, '#150406', 1);
        if (v.bone === chestB && v.z > 13.6 && v.x < -0.2 && v.z < 20 && Math.hypot(v.y * 0.9, v.z - 16.2) < 3.6 && v.nx > 0.1) tint(v, '#1a0706', 1);
      } else if (th.has(v.bone) && v.z > 6) {
        seam(Math.abs(Math.atan2(v.y, v.x) % 1.4), v.z, 0.8);
      } else if (v.bone === hipsB && v.z < 7) {
        tint(v, red, 0.95);
      }
    },
  });
  return built;
}
function thaddiusFX(P, ctx) {
  // Blue electricity crawls round the boots.
  const c = SCHOOLS.storm;
  const s = ctx.scale || 1;
  for (const y of [3, -3]) {
    if (Math.random() < 0.7) {
      const a = Math.random() * 6.28, q = toWorld(ctx.M, [0.4 + Math.cos(a) * 2, y + Math.sin(a) * 2, 0.5 + Math.random() * 2.6]);
      P.emit(q[0], q[1], q[2], (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 1 + Math.random() * 2, 0.22 * s, 0.1, c[0], c[1], c[2], 0, 0.28, 0);
    }
    const q2 = toWorld(ctx.M, [0.6 + (Math.random() - 0.5) * 3.2, y + (Math.random() - 0.5) * 3, 0.15]);
    if (Math.random() < 0.45) P.emit(q2[0], q2[1], q2[2], 0, 0, 2.2, 0.5 * s, 0.3, c[0] * 0.45, c[1] * 0.45, c[2] * 0.45, 0, 0.5, 0);
  }
}
const animThaddius = human({ arms: 0.55, swing: 0.7, raise: 0.55 });

// ---- Sapphiron: an undead frost wyrm, bones bleached and iced, no flesh on its wings, a cold light in its ribs.
function buildSapphiron() {
  const m = new ModelBuilder();
  const bone = '#d9eaf0', bone2 = '#bcd3df', bone3 = '#93b4c6', deep = '#153a78', tipC = '#1f5cae';
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-5, 0, 7.6]);
  m.bone('chest', 'hips', [3, 0, 9.2]);
  const neck = [[6, 0, 11.2], [9, 0, 14.6], [11.8, 0, 17.6], [14.5, 0, 19]];
  m.bone('neck1', 'chest', neck[0]); m.bone('neck2', 'neck1', neck[1]); m.bone('neck3', 'neck2', neck[2]);
  m.bone('head', 'neck3', neck[3]); m.bone('jaw', 'head', [15.1, 0, 18.2]); m.bone('mouth', 'head', [20, 0, 18]);
  const tail = [[-8.5, 0, 7.6], [-12.5, 0, 6.4], [-16.5, 0, 5.2], [-20.5, 0, 4.1], [-24.5, 0, 3.1], [-28, 0, 2.3]];
  tail.forEach((p, i) => m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', p));
  // Heart of frost inside the ribs.
  m.ell('chest', [2.2, 0, 8.4], [2.5, 1.8, 2], '#6fb9e0', { em: 0.42, k: 0.9 });
  m.ell('chest', [-0.4, 0, 8.3], [2.9, 1.7, 1.8], '#3f7fb4', { em: 0.28, k: 0.9 });
  m.ell('hips', [-5.3, 0, 7.6], [2.3, 1.9, 1.5], bone2, { k: 0.4 });
  // Vertebrae along the back, neck and tail, each with a back-swept spine.
  const back = [[6.6, 0, 11.6], [4.2, 0, 11.8], [1.8, 0, 11.7], [-0.6, 0, 11.3], [-3, 0, 10.6], [-5.6, 0, 9.8], [-8.2, 0, 8.6]];
  const spinePts = [...back.map((p, i) => [p, i < 4 ? 'chest' : 'hips', 1 - i * 0.05])];
  neck.forEach((p, i) => { if (i > 0) { const q = lerp(neck[i - 1], p, 0.5); spinePts.push([p, `neck${i}`, 0.72 - i * 0.1]); spinePts.push([q, `neck${i}`, 0.62 - i * 0.05]); } });
  tail.forEach((p, i) => spinePts.push([p, `tail${i}`, 0.7 - i * 0.1]));
  for (const [p, b, s] of spinePts) {
    m.ell(b, p, [0.7 * s + 0.15, 0.55 * s + 0.15, 0.55 * s + 0.15], bone, { k: 0.15 });
    m.spike(b, [p[0], 0, p[2] + 0.2], [p[0] - 1.1 * s, 0, p[2] + 2.3 * s], 0.28 * s + 0.08, bone2, { sides: 4, tipColor: tipC });
  }
  for (let i = 0; i < neck.length - 1; i++) m.tube(`neck${i + 1}`, [neck[i], neck[i + 1]], [0.55, 0.42], bone3, { sides: 6 });
  m.tube('chest', [[6.3, 0, 11.6], [1.8, 0, 11.7], [-3, 0, 10.6]], 0.42, bone3, { sides: 6 });
  m.tube('hips', [[-3, 0, 10.6], [-8.2, 0, 8.6]], 0.42, bone3, { sides: 6 });
  tail.forEach((p, i) => m.tube(`tail${i}`, [i ? tail[i - 1] : [-8.2, 0, 8.6], p], [0.42 - i * 0.05, 0.36 - i * 0.05], bone3, { sides: 5 }));
  // Ribs, sternum.
  for (let i = 0; i < 9; i++) {
    const x = 5.3 - i * 1.25, top = 11.4 - i * 0.12, h = 4.6 + 1.05 * Math.sin((i / 8) * Math.PI), half = 2.75 + 0.7 * Math.sin((i / 8) * Math.PI);
    for (const [, y] of SIDES) m.tube('chest', [[x, y * 0.3, top], [x - 0.3, y * half, top - h * 0.28], [x - 0.5, y * half * 0.86, top - h * 0.76], [x - 0.5, y * 0.25, top - h]], [0.28, 0.24, 0.2, 0.16], [bone, bone, bone2, bone2], { sides: 5 });
  }
  m.tube('chest', [[5.2, 0, 5.8], [1.6, 0, 5.4], [-2.8, 0, 6]], 0.28, bone2, { sides: 5 });
  // Skull: long, cage-browed, with a crown of swept spines.
  m.ell('head', [15.7, 0, 19.1], [2.3, 1.5, 1.45], bone, { k: 0.3 });
  m.blob('head', [16.9, 0, 18.9], [20.3, 0, 18.4], 1.15, 0.5, bone, { k: 0.25 });
  m.blob('jaw', [15.3, 0, 17.8], [19.8, 0, 16.9], 0.68, 0.32, bone2, { k: 0.2 });
  for (const [, y] of SIDES) {
    m.ball('head', [17.6, y * 0.92, 19.7], 0.34, '#2c6fd0', { em: 3, rings: 4, sides: 6 });
    m.ball('head', [17.75, y * 1.0, 19.74], 0.16, '#a8f4ff', { em: 8, rings: 3, sides: 5 });
    m.spike('head', [17.4, y * 1.0, 20.3], [14.5, y * 2.05, 22.5], 0.42, bone, { sides: 5, tipColor: tipC, bend: [0, y * 0.2, 0.4] });
    m.spike('head', [15.4, y * 1.05, 20.4], [11.2, y * 2.4, 23.9], 0.42, bone, { sides: 5, tipColor: tipC, bend: [0, y * 0.4, 0.6] });
    m.spike('head', [15, y * 1.2, 19.8], [10.4, y * 3.7, 22.3], 0.34, bone2, { sides: 5, tipColor: tipC, bend: [0, y * 0.3, 0.3] });
    m.spike('head', [15, y * 1.2, 18.9], [11.5, y * 3.1, 18.9], 0.3, bone2, { sides: 5, tipColor: tipC });
    m.spike('jaw', [17, y * 0.65, 17.6], [14.9, y * 1.6, 16.3], 0.2, bone2, { sides: 4, tipColor: tipC });
    for (let i = 0; i < 5; i++) { m.spike('head', [17.5 + i * 0.6, y * 0.56, 18.2 - i * 0.04], [17.6 + i * 0.6, y * 0.54, 17.55 - i * 0.04], 0.09, '#eefaff', { sides: 3 }); m.spike('jaw', [17.8 + i * 0.5, y * 0.34, 17.05 - i * 0.1], [17.8 + i * 0.5, y * 0.34, 17.65 - i * 0.1], 0.08, '#eefaff', { sides: 3 }); }
  }
  // Legs: long bones, knobbed joints, blue-tipped claws.
  for (const [s, y] of SIDES) {
    const f = { sh: [3.6, y * 3.3, 8.2], el: [2.6, y * 4.8, 4.8], wr: [4.2, y * 4.5, 1.6], ft: [6.2, y * 4.5, 0.6] };
    const b = { sh: [-5, y * 2.8, 7.4], el: [-3, y * 4.5, 4.4], wr: [-5.4, y * 4.2, 1.7], ft: [-3.5, y * 4.2, 0.6] };
    m.bone(`${s}fu`, 'chest', f.sh); m.bone(`${s}fl`, `${s}fu`, f.el); m.bone(`${s}ff`, `${s}fl`, f.wr);
    m.bone(`${s}bu`, 'hips', b.sh); m.bone(`${s}bl`, `${s}bu`, b.el); m.bone(`${s}bf`, `${s}bl`, b.wr);
    m.ell('chest', [3.4, y * 3.2, 9.2], [1.4, 0.7, 1.9], bone2, { k: 0.2 });
    m.tube(`${s}fu`, [f.sh, f.el], [0.72, 0.54], bone, { sides: 7 }); m.ball(`${s}fu`, f.el, 0.78, bone, { rings: 5, sides: 7 });
    m.tube(`${s}fl`, [f.el, f.wr], [0.54, 0.42], bone, { sides: 6 }); m.ball(`${s}fl`, f.wr, 0.56, bone2, { rings: 4, sides: 6 });
    m.tube(`${s}ff`, [f.wr, f.ft], [0.42, 0.42], bone2, { sides: 5 });
    m.tube(`${s}bu`, [b.sh, b.el], [0.82, 0.58], bone, { sides: 7 }); m.ball(`${s}bu`, b.el, 0.86, bone, { rings: 5, sides: 7 });
    m.ell('hips', [-5.2, y * 2.4, 8], [1.9, 0.6, 1.9], bone2, { k: 0.2 });
    m.tube(`${s}bl`, [b.el, b.wr], [0.58, 0.44], bone, { sides: 6 }); m.ball(`${s}bl`, b.wr, 0.6, bone2, { rings: 4, sides: 6 });
    m.tube(`${s}bf`, [b.wr, b.ft], [0.44, 0.42], bone2, { sides: 5 });
    for (let i = -1; i <= 1; i++) {
      m.spike(`${s}ff`, [f.ft[0], f.ft[1] + i * 0.6, 0.65], [f.ft[0] + 2.7, f.ft[1] + i * 0.95, 0.02], 0.3, bone, { sides: 4, bend: [0, 0, 0.45], tipColor: tipC });
      m.spike(`${s}bf`, [b.ft[0], b.ft[1] + i * 0.6, 0.65], [b.ft[0] + 2.6, b.ft[1] + i * 0.9, 0.02], 0.3, bone, { sides: 4, bend: [0, 0, 0.42], tipColor: tipC });
    }
    // Wings: bare, spidery bones ending in dark blue hooked blades. No membrane.
    const S = [2.8, y * 2.4, 11.2], E = [1.2, y * 9.4, 18.6], W = [-1.8, y * 16.6, 14.6];
    m.bone(`${s}w1`, 'chest', S); m.bone(`${s}w2`, `${s}w1`, E); m.bone(`${s}w3`, `${s}w2`, W);
    m.tube(`${s}w1`, [S, E], [0.85, 0.5], bone, { sides: 7 }); m.ball(`${s}w1`, E, 0.62, bone2, { rings: 4, sides: 7 });
    m.tube(`${s}w2`, [E, W], [0.5, 0.34], bone, { sides: 6 }); m.ball(`${s}w2`, W, 0.48, bone2, { rings: 4, sides: 6 });
    m.spike(`${s}w2`, E, [E[0] + 2.2, E[1] + y * 0.2, E[2] + 3.4], 0.34, bone2, { sides: 4, tipColor: tipC });
    const tips = [[-6.5, y * 27, 2.6], [-13, y * 22, 1.5], [-15.5, y * 13.5, 4.4]];
    tips.forEach((tp, i) => {
      const b1 = `${s}f${i}`, k1 = lerp(W, tp, 0.45), k2 = add(lerp(W, tp, 0.8), [0, 0, 1.6]);
      m.bone(b1, `${s}w3`, W);
      m.tube(b1, [W, k1, k2], [0.34, 0.22, 0.16], [bone, bone, bone2], { sides: 5 });
      m.ball(b1, k2, 0.24, bone2, { rings: 3, sides: 5 });
      const dir = norm(sub(tp, k2));
      m.tube(b1, [add(k2, mul(dir, 0.1)), add(lerp(k2, tp, 0.55), [0, 0, 0.3]), tp], [0.46, 0.36, 0.02], [deep, tipC, '#0f2a5c'], { sides: 5 });
      m.spike(b1, lerp(k2, tp, 0.42), add(lerp(k2, tp, 0.42), [-0.9, y * 0.8, 1.9]), 0.2, deep, { sides: 4 });
    });
  }
  // The tail ends in a spiked mace.
  const tipT = tail[5];
  m.ell('tail5', tipT, [1.05, 0.95, 0.95], bone2, { k: 0.2 });
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28; m.spike('tail5', tipT, add(tipT, [-1.3 + Math.cos(a) * 0.3, Math.cos(a) * 2.2, Math.sin(a) * 2.1]), 0.36, bone, { sides: 4, tipColor: tipC }); }
  m.spike('tail5', tipT, add(tipT, [-3.8, 0, 0.4]), 0.55, deep, { sides: 5, tipColor: '#0f2a5c' });
  return m.build({ cell: 0.2, smooth: 1, ao: 0.5, aoReach: 1.2 });
}
function sapphironFX(P, ctx) {
  const c = SCHOOLS.frost, M = ctx.M;
  // Cold rolling off the ribs and falling from the wing tips.
  let n = 60 * ctx.dt; n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    const q = toWorld(M, [2 + r * -6 + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 5.5, 6 + Math.random() * 6]);
    P.emit(q[0], q[1], q[2], (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, -0.5 - Math.random() * 1.5, 0.28 + Math.random() * 0.5, 0.2, c[0] * 0.6, c[1] * 0.62, c[2] * 0.62, 0, 1.2 + Math.random(), 0);
  }
  for (const [x, y, z] of [[-6.5, 27, 3], [-6.5, -27, 3], [-13, 22, 2], [-13, -22, 2]]) if (Math.random() < 0.3) { const q = toWorld(M, [x, y, z]); P.emit(q[0], q[1], q[2], 0, 0, -1, 0.3, 0, c[0] * 0.5, c[1] * 0.5, c[2] * 0.5, 0, 1, 0); }
}

// ---- Kel'Thuzad: a blue lich, halo of gold and navy behind him, lantern hands of ice, three tails of robe.
function buildKelthuzad() {
  const m = new ModelBuilder();
  const navy = '#1a2b7d', navyD = '#101a58', gold = '#c9a750', goldD = '#7a6226', ice = '#a9dcff', iceB = '#5aa8e8', red = '#a11d22', chainC = '#8db4dc', robe = '#3346c0';
  const hip = 5.6, chest = 8.4, neck = 10.1;
  const H = rig(m, {
    hip, chest, neck, sw: 2.2, hipW: 0.6, headUp: 0.3,
    arms: { L: { sh: [0, 2.3, 9.5], el: [0.1, 4.2, 8.4], wr: [0.7, 5.3, 6.7] }, R: { sh: [0, -2.3, 9.5], el: [0.1, -4.2, 8.4], wr: [0.7, -5.3, 6.7] } },
  });
  m.bone('tail0', 'hips', [1.6, 0, 4.2]); m.bone('tail1', 'hips', [0.6, 2.1, 4.2]); m.bone('tail2', 'hips', [0.6, -2.1, 4.2]);
  m.bone('chainB', 'chest', [0, 0, 9.4]);
  // The tall navy column of the robe.
  m.lathe('hips', [0, 0, 1.5], [0, 0, 5.4], [[0.95, 0], [1.15, 0.2], [1.3, 0.55], [1.6, 1]], robe, { sides: 10 });
  m.ell('hips', [0, 0, 1.55], [1.05, 1.05, 0.5], navy, { k: 0.3 });
  m.ell('hips', [0, 0, 5.3], [1.65, 1.85, 0.9], navy, { k: 0.3 });
  m.box('hips', [1.2, 0, 3.4], [0.3, 1.7, 3.4], navyD, {});
  m.tube('hips', [[1.36, -0.85, 5.1], [1.36, -0.85, 1.75], [1.36, 0.85, 1.75], [1.36, 0.85, 5.1], [1.36, -0.85, 5.1]], 0.1, gold, { sides: 4 });
  m.box('hips', [1.42, 0, 3.45], [0.2, 0.5, 2.3], gold, {});
  m.box('hips', [1.54, 0, 3.45], [0.16, 0.26, 1.9], navyD, {});
  // Belt: gold, the great red gem.
  hoop(m, 'hips', [0, 0, 5.5], [0, 0, 1], 2.05, 0.75, gold, { sides: 16 });
  hoop(m, 'hips', [0, 0, 5.18], [0, 0, 1], 2.08, 0.14, goldD, { sides: 16 });
  hoop(m, 'hips', [0, 0, 5.85], [0, 0, 1], 2.08, 0.14, goldD, { sides: 16 });
  const gem = (bone, c, r, axis = [1, 0, 0]) => { const a = norm(axis), up = norm(cross(a, [0.05, 1, 0.1])), s = norm(cross(a, up)); const cl = [add(c, mul(up, r)), add(c, mul(s, r)), add(c, mul(up, -r)), add(c, mul(s, -r))]; for (let i = 0; i < 4; i++) { m.tri(add(c, mul(a, r * 0.42)), cl[i], cl[(i + 1) % 4], red, 0.8, [m.b(bone)], true); m.tube(bone, [cl[i], cl[(i + 1) % 4]], r * 0.1, gold, { sides: 4 }); } };
  gem('hips', [2.15, 0, 5.5], 0.55);
  for (const [, y] of SIDES) gem('hips', [1.55, y * 1.5, 5.5], 0.32, [0.6, y * 0.8, 0]);
  // The three tails spread across the floor.
  const panel = (top, axis, side, len, w) => {
    // A long ragged cloth from the waist out to the floor, widening, gold-hemmed.
    const seg = 6, pts0 = [], pts1 = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, c = add(top, mul(axis, t * len)), cz = c[2] - 4.0 * t * t, width = w * (0.55 + 0.62 * t);
      pts0.push([c[0] + side[0] * width, c[1] + side[1] * width, Math.max(0.03, top[2] + (cz - top[2]) - 0.2 * Math.sin(t * 9))]);
      pts1.push([c[0] - side[0] * width, c[1] - side[1] * width, Math.max(0.03, top[2] + (cz - top[2]) - 0.2 * Math.sin(t * 9))]);
    }
    return { pts0, pts1 };
  };
  const addTail = (bone, top, axis, side, len, w) => {
    const { pts0, pts1 } = panel(top, axis, side, len, w);
    const b = m.b(bone);
    for (let i = 0; i < pts0.length - 1; i++) {
      const shade1 = 0.9 + 0.2 * Math.sin(i * 2);
      const c = hex(robe).map((v) => v * shade1);
      m.tri(pts0[i], pts1[i], pts1[i + 1], c, 0, [b], true);
      m.tri(pts0[i], pts1[i + 1], pts0[i + 1], c, 0, [b], true);
      // Dark ragged holes.
      if (i % 2 === 1) { const mid = lerp(lerp(pts0[i], pts1[i], 0.5), lerp(pts0[i + 1], pts1[i + 1], 0.5), 0.5); const u = mul(sub(pts0[i + 1], pts0[i]), 0.32), v2 = mul(sub(pts0[i], pts1[i]), 0.1), lift = [0, 0, 0.05]; m.tri(add(mid, add(u, lift)), add(add(mid, v2), lift), add(mid, add(mul(u, -1), lift)), navyD, 0, [b], true); m.tri(add(mid, add(u, lift)), add(mid, add(mul(u, -1), lift)), add(add(mid, mul(v2, -1)), lift), navyD, 0, [b], true); }
    }
    m.tube(bone, pts0, 0.11, gold, { sides: 4 }); m.tube(bone, pts1, 0.11, gold, { sides: 4 });
    // Gold hem and the red gem at each point.
    const end0 = pts0[pts0.length - 1], end1 = pts1[pts1.length - 1], mid = lerp(end0, end1, 0.5), tip = add(mid, add(mul(norm(axis), 1.05), [0, 0, 0]));
    plate(m, bone, add(lerp(mid, tip, 0.5), [0, 0, 0.4]), [end0, tip, end1, add(mid, mul(norm(axis), -0.6))], gold, {});
    m.tube(bone, [end0, tip, end1], 0.12, goldD, { sides: 4 });
    gem(bone, add(lerp(mid, tip, 0.2), [0, 0, 0.38]), 0.42, [0.35, 0, 0.94]);
  };
  addTail('tail0', [1.6, 0, 4.4], [1, 0, 0], [0, 1, 0], 4.2, 1.5);
  addTail('tail1', [0.5, 1.9, 4.5], norm([0.18, 1, 0]), [1, -0.1, 0], 5.4, 1.1);
  addTail('tail2', [0.5, -1.9, 4.5], norm([0.18, -1, 0]), [1, 0.1, 0], 5.4, 1.1);
  // Ribcage of ice with light inside; chest crossed by chains.
  m.ell('chest', [0.05, 0, 8.3], [1.05, 1.45, 1.3], '#2c6fc2', { em: 1.3, k: 0.4 });
  m.ell('chest', [0.5, 0, 8.2], [0.55, 0.7, 0.72], '#dff6ff', { em: 3.5, k: 0.4 });
  for (let i = 0; i < 5; i++) {
    const z = 9.2 - i * 0.48;
    for (const [, y] of SIDES) m.tube('chest', [[-0.5, y * 0.2, z + 0.1], [0.7, y * 1.55, z], [1.2, y * 0.6, z - 0.3], [1.22, y * 0.1, z - 0.42]], [0.14, 0.13, 0.12, 0.1], ice, { sides: 4, em: 0.35 });
  }
  m.tube('chest', [[1.3, 0, 9.3], [1.35, 0, 7.05]], 0.11, ice, { sides: 4, em: 0.4 });
  for (const [, y] of SIDES) {
    chain(m, 'chainB', [[1.45, y * 1.9, 9.5], [1.6, -y * 0.3, 8.2], [1.45, -y * 1.6, 6.9]], 0.12, chainC);
    // Chains also fall from the belt and loop out round the robe.
    chain(m, 'hips', [[1.7, y * 1.5, 5.3], [1.9, y * 3.0, 4.4], [1.4, y * 3.6, 4.15]], 0.13, chainC);
  }
  const loop = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; loop.push([Math.cos(a) * 3.5, Math.sin(a) * 3.65, 4.25 + 0.1 * Math.sin(a * 6)]); }
  chain(m, 'hips', loop, 0.15, chainC);
  // Head: a blue skull under a stacked gold mitre.
  m.ell('head', [0.25, 0, 11.3], [0.92, 0.82, 0.95], iceB, { k: 0.2, em: 0.35 });
  m.ell('head', [0.65, 0, 10.75], [0.42, 0.42, 0.38], iceB, { k: 0.15, em: 0.35 });
  m.ell('neck', [0.1, 0, 10.2], [0.5, 0.6, 0.5], '#3a63a8', { k: 0.2 });
  for (const [, y] of SIDES) {
    m.ball('head', [1.0, y * 0.34, 11.35], 0.2, '#0a0e22', { rings: 4, sides: 6 });
    m.ball('head', [1.12, y * 0.34, 11.36], 0.1, '#bffcff', { em: 7, rings: 3, sides: 5 });
  }
  m.ball('head', [1.05, 0, 11.0], 0.1, '#0a0e22', { rings: 3, sides: 4 });
  for (let i = 0; i < 6; i++) m.spike('head', [0.98, -0.5 + i * 0.2, 10.55], [1.05, -0.5 + i * 0.2, 10.3], 0.07, '#e8f4ff', { sides: 3 });
  // Stacked gold mitre.
  m.lathe('head', [0.15, 0, 11.95], [0.15, 0, 13.7], [[0.95, 0], [1.14, 0.18], [0.92, 0.36], [1.1, 0.5], [0.84, 0.68], [0.98, 0.84], [0.74, 1]], gold, { sides: 8 });
  for (const z of [12.25, 12.95, 13.55]) hoop(m, 'head', [0.15, 0, z], [0, 0, 1], 1.02 - (z - 12.25) * 0.18, 0.16, navy, { sides: 8 });
  m.lathe('head', [0.15, 0, 13.7], [0.15, 0, 14.75], [[0.7, 0], [0.86, 0.35], [0.06, 1]], navy, { sides: 8 });
  m.ball('head', [0.9, 0, 12.9], 0.2, red, { em: 0.8, rings: 3, sides: 6 });
  // Halo: an octagon of gold and navy framing a white heart-shaped swirl.
  const octa = []; for (let i = 0; i < 8; i++) { const a = ((i + 0.5) / 8) * Math.PI * 2; octa.push([-1.45, Math.cos(a) * 3.65, 12.55 + Math.sin(a) * 3.65]); }
  plate(m, 'chest', [-1.55, 0, 12.55], octa, navyD, {});
  const octa2 = octa.map((p) => [p[0] + 0.03, p[1] * 0.74, 12.55 + (p[2] - 12.55) * 0.74]);
  plate(m, 'chest', [-1.45, 0, 12.55], octa2, navy, {});
  for (let i = 0; i < 8; i++) {
    const a = octa[i], b = octa[(i + 1) % 8];
    m.tube('chest', [add(lerp(a, b, 0.05), [0.05, 0, 0]), add(lerp(a, b, 0.95), [0.05, 0, 0])], 0.45, i % 2 ? gold : goldD, { sides: 5 });
    m.ball('chest', add(a, [0.08, 0, 0]), 0.52, navy, { rings: 3, sides: 6 });
  }
  // Heart-shaped white swirls.
  const swirl = (s) => {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * Math.PI * 1.75 - 0.5, r = 1.45 - 0.72 * t; pts.push([-1.25, s * (1.05 + Math.cos(a) * r), 12.6 + Math.sin(a) * r * 1.15]); }
    return pts;
  };
  for (const s of [1, -1]) m.tube('chest', swirl(s), 0.13, '#eef6ff', { sides: 4, em: 0.35 });
  m.tube('chest', [[-1.25, 0, 11.05], [-1.25, 0, 14.25]], 0.1, '#eef6ff', { sides: 4, em: 0.35 });
  // Shoulders: faceted gold lanterns, long gold and navy blades, chains.
  for (const [s, y] of SIDES) {
    const c = [0.1, y * 2.85, 9.75];
    const lantern = (bone, p, r) => {
      m.ball(bone, p, r, gold, { rings: 4, sides: 7 });
      m.lathe(bone, [p[0], p[1], p[2] - r * 1.05], [p[0], p[1], p[2] + r * 1.05], [[r * 0.62, 0], [r * 1.05, 0.5], [r * 0.62, 1]], navyD, { sides: 7 });
      for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28; m.tube(bone, [[p[0] + Math.cos(a) * r * 0.62, p[1] + Math.sin(a) * r * 0.62, p[2] - r], [p[0] + Math.cos(a) * r * 1.08, p[1] + Math.sin(a) * r * 1.08, p[2]], [p[0] + Math.cos(a) * r * 0.62, p[1] + Math.sin(a) * r * 0.62, p[2] + r]], r * 0.075, gold, { sides: 3 }); }
      hoop(m, bone, p, [0, 0, 1], r * 1.08, r * 0.2, goldD, { sides: 8 });
    };
    lantern(`${s}up`, c, 0.95);
    for (const [ang, len, wid] of [[0.32, 5.6, 0.5], [0.82, 4.9, 0.42]]) {
      const dir = [-0.35, y * Math.cos(ang), Math.sin(ang)], base = add(c, mul(dir, 0.9));
      const tip = add(base, mul(dir, len)), mid = lerp(base, tip, 0.42);
      m.tube(`${s}up`, [base, mid, tip], [wid * 1.4, wid * 1.15, 0.03], [navyD, navy, navy], { sides: 5 });
      m.tube(`${s}up`, [add(base, [0.05, 0, 0.1]), add(mid, [0.05, 0, 0.1]), add(tip, [0.05, 0, 0.1])], [wid * 0.42, wid * 0.42, 0.02], gold, { sides: 4 });
      hoop(m, `${s}up`, lerp(base, tip, 0.2), dir, wid * 1.45, 0.25, gold, { sides: 8 });
      hoop(m, `${s}up`, lerp(base, tip, 0.48), dir, wid * 1.2, 0.22, gold, { sides: 8 });
    }
    gem('chest', add([0.85, y * 1.15, 9.55], [0.15, 0, 0]), 0.44, [0.5, y * 0.5, 0.05]);
    // Arms and lantern hands with ice crystals for fingers.
    const { sh, el, wr } = H.a[s], armC = '#7a97c8';
    m.blob(`${s}up`, sh, el, 0.42, 0.34, armC, { k: 0.15 });
    m.blob(`${s}lo`, el, wr, 0.34, 0.26, armC, { k: 0.12 });
    lantern(`${s}hand`, add(wr, [0.15, y * 0.15, -0.1]), 0.95);
    for (let i = 0; i < 6; i++) { const a = -0.7 + i * 0.3, tip = add(wr, [0.2 + Math.cos(a) * 1.3, y * (0.5 + Math.sin(a) * 0.5), 1.4 + (i % 2) * 0.6]); m.spike(`${s}hand`, add(wr, [0.15, y * 0.25, 0.3]), tip, 0.42, iceB, { sides: 4, tipColor: '#e6f6ff', em: 0.7 }); }
    chain(m, `${s}lo`, [add(wr, [0.2, -y * 0.5, 0.5]), add(lerp(el, wr, 0.3), [0.5, -y * 0.8, -1]), [0.9, y * 1.8, 8.6]], 0.11, chainC);
  }
  // Two long chains rising from the halo out to each side.
  for (const [, y] of SIDES) {
    chain(m, 'chest', [[-1.1, y * 2.7, 14.8], [-0.2, y * 3.85, 15.5], [0.6, y * 4.25, 14.5], [0.8, y * 3.3, 13.5]], 0.13, chainC);
  }
  const hipsB = m.b('hips');
  const built = m.build({
    cell: 0.13, smooth: 1, ao: 0.7, aoReach: 1,
    paint(v) {
      if (v.bone === hipsB && v.z < 5.2) {
        const A = Math.abs(Math.atan2(v.y, v.x) / Math.PI);
        // Tattered dark slashes down the robe.
        if (wave((A + v.z * 0.05) * 9) < 0.09 && v.z < 4.6) tint(v, navyD, 0.9);
      }
    },
  });
  return built;
}
// Kel'Thuzad and Gothik are in plain sight while out of reach (Phase 1 on the throne and the balcony), but the
// sim marks that state 'submerged' and the renderer would sink them through the floor. Stay above ground.
const animKelthuzad = human({
  arms: 0.5, swing: 0.5, raise: 0.5,
  extra: (p, s) => {
    const t = s.t;
    p.o('root', 0, 0, 0.3 * Math.sin(t * 1.1) + 0.3);
    p.r('tail0', 0, 0.05 * Math.sin(t * 1.5), 0.04 * Math.sin(t * 1.1));
    p.r('tail1', 0.08 * Math.sin(t * 1.3), 0, 0.05 * Math.sin(t * 0.9 + 1));
    p.r('tail2', -0.08 * Math.sin(t * 1.3 + 1), 0, -0.05 * Math.sin(t * 0.9 + 2));
    p.r('chainB', 0.05 * Math.sin(t * 0.8), 0, 0);
  },
});
function kelFX(P, ctx) {
  const c = SCHOOLS.frost;
  for (const [x, y, z] of [[0.7, 5.3, 7.2], [0.7, -5.3, 7.2]]) {
    if (Math.random() < 0.6) { const q = toWorld(ctx.M, [x, y, z + Math.random() * 1.4]); P.emit(q[0], q[1], q[2], (Math.random() - 0.5), (Math.random() - 0.5), 0.8, 0.26, 0.2, c[0] * 0.5, c[1] * 0.55, c[2] * 0.55, 0, 0.8, 0); }
  }
  const q = toWorld(ctx.M, [0.5, 0, 8.3]);
  if (Math.random() < 0.5) P.emit(q[0] + (Math.random() - 0.5) * 2, q[1] + (Math.random() - 0.5) * 2, q[2], 0, 0, 1.1, 0.34, 0.3, c[0] * 0.5, c[1] * 0.5, c[2] * 0.55, 0, 0.9, 0);
}

// ---- Adds: small models for what each boss summons.
const memo = (f) => { let v; return () => { if (!v) v = f(); return v; }; };
/** A small humanoid: skeleton, zombie, cultist or knight, 2.2 yards tall. */
function buildMinion(o) {
  const m = new ModelBuilder();
  const { skin = '#cfc6ae', cloth = '#3a2c4e', trim = '#b89a4a', kind = 'skeleton', eye = '#7fe0ff', weapon } = o;
  const H = rig(m, { hip: 1.02, chest: 1.5, neck: 1.9, sw: 0.45, hipW: 0.17, headUp: 0.08, armU: 0.52, armL: 0.48, armOut: 0.08 });
  const lean = kind === 'zombie' ? 0.16 : 0;
  m.ell('spine', [lean * 0.4, 0, 1.3], [0.2, 0.3, 0.24], kind === 'robed' ? cloth : kind === 'knight' ? cloth : skin, { k: 0.08 });
  m.ell('chest', [lean, 0, 1.62], [0.25, 0.38, 0.28], kind === 'robed' || kind === 'knight' ? cloth : skin, { k: 0.08 });
  m.ell('head', [lean + 0.02, 0, 2.16], [0.19, 0.17, 0.21], skin, { k: 0.05 });
  for (const [, y] of SIDES) m.ball('head', [lean + 0.17, y * 0.07, 2.18], 0.035, eye, { em: 4, rings: 3, sides: 4 });
  for (const [s, y] of SIDES) {
    const { sh, el, wr } = H.a[s];
    m.blob(`${s}up`, sh, el, 0.1, 0.085, kind === 'skeleton' || kind === 'zombie' ? skin : cloth, { k: 0.04 });
    m.blob(`${s}lo`, el, wr, 0.085, 0.07, kind === 'zombie' ? skin : kind === 'skeleton' ? skin : cloth, { k: 0.04 });
    m.ell(`${s}hand`, wr, [0.075, 0.065, 0.1], skin, { k: 0.03 });
    m.blob(`${s}th`, [0, y * 0.17, 0.98], [0.04, y * 0.18, 0.54], 0.11, 0.085, kind === 'knight' ? cloth : skin, { k: 0.04 });
    m.blob(`${s}sh`, [0.04, y * 0.18, 0.52], [0.02, y * 0.18, 0.08], 0.085, 0.075, kind === 'knight' ? cloth : skin, { k: 0.04 });
    m.ell(`${s}sh`, [0.09, y * 0.18, 0.05], [0.16, 0.08, 0.05], kind === 'skeleton' ? skin : '#2a2228', { k: 0.03 });
  }
  if (kind === 'robed') { m.blob('hips', [0, 0, 1.05], [0, 0, 0.06], 0.26, 0.5, cloth, { k: 0.08 }); m.cut([0, 0, -8], [0, 0, -7.95], 8, 8, { k: 0.02 }); m.ell('head', [lean - 0.05, 0, 2.25], [0.23, 0.22, 0.24], cloth, { k: 0.04 }); }
  if (kind === 'skeleton') for (let i = 0; i < 4; i++) { const z = 1.72 - i * 0.14; for (const [, y] of SIDES) m.tube('chest', [[0.08, y * 0.05, z], [0.14, y * 0.34, z - 0.02], [-0.14, y * 0.32, z - 0.04], [-0.14, y * 0.05, z - 0.05]], 0.022, skin, { sides: 3 }); }
  if (kind === 'knight') { m.ell('chest', [0, 0.42, 1.88], [0.22, 0.22, 0.18], trim, { k: 0.03 }); m.ell('chest', [0, -0.42, 1.88], [0.22, 0.22, 0.18], trim, { k: 0.03 }); m.ell('head', [0, 0, 2.2], [0.21, 0.2, 0.23], trim, { k: 0.04 }); }
  if (kind === 'zombie') { for (let i = 0; i < 5; i++) m.ell('chest', [lean + 0.18 + i * 0.01, (i - 2) * 0.13, 1.5 - (i % 2) * 0.1], [0.06, 0.05, 0.06], '#6a2030', { k: 0.03 }); }
  if (weapon === 'sword') { m.tube('Rhand', [[0.1, -0.5, 0.75], [0.32, -0.5, 1.75]], [0.04, 0.012], '#b7bfcd', { sides: 4 }); m.tube('Rhand', [[0.04, -0.62, 1], [0.04, -0.38, 1]], 0.025, trim, { sides: 3 }); }
  return m.build({ cell: 0.05, smooth: 1, ao: 0.7, aoReach: 0.3 });
}
function buildMiniSpider({ abd = '#b84a10', ink = '#0e0a0a', accent = '#c79a18', r = 1 }) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 0.6]); m.bone('abd', 'body', [-0.2, 0, 0.7]); m.bone('head', 'body', [0.45, 0, 0.6]);
  m.ell('abd', [-0.55 * r, 0, 0.75 * r], [0.55 * r, 0.42 * r, 0.42 * r], abd, { k: 0.1 });
  m.ell('body', [0.2 * r, 0, 0.62 * r], [0.34 * r, 0.3 * r, 0.22 * r], ink, { k: 0.1 });
  m.ell('head', [0.5 * r, 0, 0.58 * r], [0.16 * r, 0.16 * r, 0.14 * r], ink, { k: 0.06 });
  m.ball('head', [0.64 * r, 0.06 * r, 0.62 * r], 0.04 * r, '#ff3a10', { em: 3, rings: 3, sides: 4 });
  m.ball('head', [0.64 * r, -0.06 * r, 0.62 * r], 0.04 * r, '#ff3a10', { em: 3, rings: 3, sides: 4 });
  const legs = [];
  for (const [s, y] of SIDES) [40, 75, 110, 140].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const base = [0.25 * r - i * 0.1 * r, y * 0.2 * r, 0.6 * r], knee = [base[0] + ca * 0.55 * r, base[1] + y * sa * 0.55 * r, 1.05 * r], foot = [base[0] + ca * 1.25 * r, base[1] + y * sa * 1.25 * r, 0.02];
    const n = `${s}${i}`;
    m.bone(`${n}a`, 'body', base); m.bone(`${n}b`, `${n}a`, knee);
    m.tube(`${n}a`, [base, knee], [0.05 * r, 0.04 * r], ink, { sides: 4 });
    m.tube(`${n}b`, [knee, foot], [0.04 * r, 0.015], accent, { sides: 4 });
    legs.push([`${n}a`, `${n}b`, y, i < 2 ? 1 : -1, (i + (y > 0 ? 0 : 1)) % 2]);
  });
  const built = m.build({ cell: 0.04, smooth: 1, ao: 0.6, aoReach: 0.2 });
  built.legs = legs;
  return built;
}
const minionAnim = human({ arms: 0.6, swing: 0.5, raise: 0.5 });
const bobAnim = (p, s) => { p.reset(); p.o('body', 0, 0, 0.08 * Math.sin(s.t * 3)); p.r('body', 0, 0, s.t * 0.8); p.s('body', 1 + 0.06 * Math.sin(s.t * 4)); p.evaluate(); };
const figureAdd = (o, scale = 1) => { const make = memo(() => buildMinion(o)); return () => ({ built: make(), animate: minionAnim, mat: MAT.flesh, scale }); };
const spiderAdd = (o, scale = 1) => { const make = memo(() => buildMiniSpider(o)); return () => { const built = make(); return { built, animate: crawler(built.legs, { stride: 11 }), mat: MAT.chitin, scale }; }; };
const cryptGuard = memo(() => {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 1.3]); m.bone('head', 'body', [1.5, 0, 1.2]);
  m.ell('body', [0, 0, 1.4], [1.5, 1.1, 1], '#1b2cb0', { k: 0.3 });
  m.ell('body', [-1.1, 0, 1.6], [1.2, 1, 0.9], '#14808c', { k: 0.3 });
  m.ell('head', [1.7, 0, 1.15], [0.55, 0.5, 0.42], '#1a1745', { k: 0.15 });
  m.tube('body', [[1.5, -0.75, 2.2], [0, -0.95, 2.5], [-1.5, -0.8, 2.2]], 0.07, '#c8a14e', { sides: 3 });
  m.tube('body', [[1.5, 0.75, 2.2], [0, 0.95, 2.5], [-1.5, 0.8, 2.2]], 0.07, '#c8a14e', { sides: 3 });
  const legs = [];
  for (const [s, y] of SIDES) [0, 1, 2].forEach((i) => {
    const base = [0.8 - i * 0.8, y * 1, 1.1], knee = [1 - i * 1.0, y * 2, 1.5], foot = [1.2 - i * 1.2, y * 2.8, 0.02];
    const n = `${s}${i}`;
    m.bone(`${n}a`, 'body', base); m.bone(`${n}b`, `${n}a`, knee);
    m.tube(`${n}a`, [base, knee], [0.14, 0.12], '#1b2cb0', { sides: 5 });
    m.tube(`${n}b`, [knee, foot], [0.12, 0.02], '#0d0d16', { sides: 5 });
    legs.push([`${n}a`, `${n}b`, y, i < 1 ? 1 : -1, (i + (y > 0 ? 0 : 1)) % 2]);
  });
  const built = m.build({ cell: 0.1, smooth: 1, ao: 0.7, aoReach: 0.5 });
  built.legs = legs;
  return built;
});
const slime = memo(() => {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 0.9]);
  m.ell('body', [0, 0, 0.85], [1.4, 1.4, 0.95], '#54c22a', { k: 0.5, em: 0.35 });
  m.ell('body', [0.3, 0.3, 1.65], [0.72, 0.65, 0.55], '#6be83a', { k: 0.5, em: 0.5 });
  m.cut([0, 0, -6], [0, 0, -5.95], 6, 6, { k: 0.05 });
  m.ball('body', [1.1, 0.42, 1.15], 0.13, '#08280a', { rings: 3, sides: 5 });
  m.ball('body', [1.1, -0.42, 1.15], 0.13, '#08280a', { rings: 3, sides: 5 });
  return m.build({ cell: 0.1, smooth: 2, ao: 0.4, aoReach: 0.6 });
});
const spore = memo(() => {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 1.2]);
  m.ell('body', [0, 0, 1.15], [0.9, 0.9, 1.05], '#b58d5e', { k: 0.4 });
  for (let i = 0; i < 7; i++) { const a = i * 0.9; m.ell('body', [Math.cos(a) * 0.86, Math.sin(a) * 0.86, 1.3 + Math.sin(a * 2) * 0.35], [0.26, 0.26, 0.2], '#d4714c', { k: 0.1 }); }
  m.ball('body', [0.82, 0.3, 1.25], 0.13, '#ff2810', { em: 3, rings: 3, sides: 5 });
  m.ball('body', [0.82, -0.3, 1.25], 0.13, '#ff2810', { em: 3, rings: 3, sides: 5 });
  return m.build({ cell: 0.09, smooth: 1, ao: 0.5, aoReach: 0.4 });
});

export const ADDS = {
  'naxxramas/anubrekhan': () => { const built = cryptGuard(); return { built, animate: crawler(built.legs, { stride: 9 }), mat: MAT.chitin, scale: 1 }; },
  'naxxramas/faerlina': figureAdd({ kind: 'robed', skin: '#b58a6a', cloth: '#6e2a1a', trim: '#d4a22a', eye: '#ffcf60' }),
  'naxxramas/maexxna': spiderAdd({ abd: '#a23b0e', accent: '#b98a16', r: 1 }),
  'naxxramas/noth': figureAdd({ kind: 'skeleton', skin: '#c5c0a8', eye: '#6ff0a0', weapon: 'sword' }),
  'naxxramas/loatheb': () => ({ built: spore(), animate: bobAnim, mat: MAT.flesh, scale: 1 }),
  'naxxramas/razuvious': figureAdd({ kind: 'knight', skin: '#b6c7cf', cloth: '#1d4f8a', trim: '#cfe2ee', eye: '#a0f0ff', weapon: 'sword' }),
  'naxxramas/gothik': figureAdd({ kind: 'knight', skin: '#7d7d7d', cloth: '#2a2a48', trim: '#7a7fa0', eye: '#a0d0ff', weapon: 'sword' }),
  'naxxramas/grobbulus': () => ({ built: slime(), animate: bobAnim, mat: { ...MAT.flesh, gloss: 0.6, rim: 0.5 }, scale: 1 }),
  'naxxramas/gluth': figureAdd({ kind: 'zombie', skin: '#6a8040', eye: '#e8f060' }),
  'naxxramas/kelthuzad': figureAdd({ kind: 'skeleton', skin: '#9fc6dc', eye: '#7fe0ff', weapon: 'sword' }),
};

// ---- The registry.
const maexxna = memo(buildMaexxna);
export const BOSSES = {
  'naxxramas/anubrekhan': () => ({ built: buildAnub(), animate: animAnub, mat: MAT.chitin, scale: 1, mouth: 'mouth', school: 'poison', height: 11, heroDist: 26 }),
  'naxxramas/faerlina': () => ({ built: buildFaerlina(), animate: human({ arms: 0.8, swing: 1, raise: 0.8 }), mat: MAT.cloth, scale: 0.72, mouth: 'mouth', school: 'fire', height: 9.3, heroDist: 20, fx: faerlinaFX }),
  'naxxramas/maexxna': () => { const built = maexxna(); return { built, animate: crawler(built.legs, { stride: 7.5, pincers: [['Lf', 1], ['Rf', -1]] }), mat: MAT.chitin, scale: 0.75, mouth: 'mouth', school: 'poison', height: 13.5, heroDist: 30 }; },
  'naxxramas/noth': () => ({ built: buildNoth(), animate: human({ arms: 0.5, swing: 0.5, raise: 0.5 }), mat: MAT.cloth, scale: 0.78, mouth: 'mouth', school: 'shadow', height: 10, heroDist: 22 }),
  'naxxramas/heigan': () => ({ built: buildHeigan(), animate: human({ arms: 0.7, swing: 0.6, raise: 0.7 }), mat: MAT.cloth, scale: 0.7, mouth: 'Rhand', school: 'poison', height: 12, heroDist: 26, fx: heiganFX, glow: [0.9, 2.2, 0.3], glowR: 16 }),
  'naxxramas/loatheb': () => ({ built: buildLoatheb(), animate: animLoatheb, mat: MAT.fur, scale: 0.62, mouth: 'mouth', school: 'shadow', height: 16.4, heroDist: 34, fx: loathebFX }),
  'naxxramas/razuvious': () => ({ built: buildRazuvious(), animate: animRazuvious, mat: MAT.plate, scale: 0.78, mouth: 'mouth', school: 'physical', height: 11.3, heroDist: 26 }),
  'naxxramas/gothik': () => ({ built: buildGothik(), animate: human({ arms: 0.7, swing: 0.6, raise: 0.7 }), staysVisible: true, mat: MAT.cloth, scale: 0.72, mouth: 'mouth', school: 'shadow', height: 11, heroDist: 24 }),
  'naxxramas/four-horsemen': () => ({ built: buildHorsemen(), animate: animateHorsemen, mat: MAT.plate, scale: 0.92, mouth: 'mouth', school: 'shadow', height: 12, heroDist: 30, fx: horsemenFX }),
  'naxxramas/patchwerk': () => ({ built: buildPatchwerk(), animate: animPatchwerk, mat: MAT.flesh, scale: 0.68, mouth: 'mouth', school: 'physical', height: 16, heroDist: 34 }),
  'naxxramas/grobbulus': () => ({ built: buildGrobbulus(), animate: animGrobbulus, mat: MAT.flesh, scale: 0.85, mouth: 'mouth', school: 'poison', height: 13, heroDist: 28, fx: grobbulusFX, glow: [0.6, 2.2, 0.3], glowR: 18 }),
  'naxxramas/gluth': () => ({ built: buildGluth(), animate: animateGluth, mat: MAT.fur, scale: 0.85, mouth: 'mouth', school: 'physical', height: 12, heroDist: 28 }),
  'naxxramas/thaddius': () => ({ built: buildThaddius(), animate: animThaddius, mat: MAT.flesh, scale: 0.6, mouth: 'mouth', school: 'storm', height: 19, heroDist: 36, fx: thaddiusFX, glow: [0.5, 1.2, 3.2], glowR: 26 }),
  'naxxramas/sapphiron': () => ({ built: buildSapphiron(), animate: animateDragon, mat: MAT.bone, scale: 0.85, mouth: 'mouth', school: 'frost', height: 24, heroDist: 52, fx: sapphironFX, glow: [0.9, 2.6, 5.2], glowR: 42 }),
  'naxxramas/kelthuzad': () => ({ built: buildKelthuzad(), animate: animKelthuzad, staysVisible: true, mat: { ...MAT.plate, noise: 0.15 }, scale: 0.8, mouth: 'mouth', school: 'frost', height: 16, heroDist: 30, fx: kelFX, glow: [1.1, 2.4, 5], glowR: 30 }),
};
