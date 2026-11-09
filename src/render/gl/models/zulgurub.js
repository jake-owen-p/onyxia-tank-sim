// Zul'Gurub. Hunched long-armed trolls, and the beasts their priests become:
// a bat, a cobra, a spider, a tiger, a panther, the raptor-riding Bloodlord,
// the great fish Gahz'ranka and Hakkar, the winged serpent.

import { ModelBuilder } from '../model.js';
import { SCHOOLS, emitFlame } from '../fx.js';
import { bipedRig, animateBiped, SIDES } from './biped.js';

const skinMat = { noise: 0.42, scales: 0, cracks: 0, rim: 0.3, paintF: 1.1, scaleF: 1, gloss: 0.26, crackF: 0.5 };
const scaleMat = { noise: 0.42, scales: 0.55, cracks: 0, rim: 0.3, paintF: 0.8, scaleF: 3.2, gloss: 0.42, crackF: 0.5 };
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

function buildTroll(o) {
  const c = { skin: '#4f7a6a', hair: '#c8452a', cloth: '#7a3a1e', trim: '#d0a848', metal: '#7a7a82', eye: '#ffd24a', ...o.colors };
  const k = o.size ?? 1, B = o.build ?? 1;
  const m = new ModelBuilder();
  const hip = 3.9 * k, chest = 6.6 * k, neck = 8.2 * k, sw = 2.5 * k * B;
  bipedRig(m, { hip, chest, neck, sw, armU: 2.6 * k, armL: 2.9 * k, hipW: 1 * k * B, shoulderDrop: 0.9 * k, armOut: 0.5 * k, wristF: 1 * k, headUp: 0.05, lean: 1.3 * k });
  m.ell('chest', [0.5 * k, 0, 6.8 * k], [1.7 * k * B, 2.3 * k * B, 1.7 * k], c.skin, { k: 0.6 * k });
  m.ell('spine', [0.2 * k, 0, 5.2 * k], [1.15 * k * B, 1.5 * k * B, 1.5 * k], c.skin, { k: 0.5 * k });
  m.ell('hips', [0, 0, 3.8 * k], [1.2 * k * B, 1.5 * k * B, 0.95 * k], c.cloth, { k: 0.4 * k });
  m.blob('neck', [0.8 * k, 0, 7.9 * k], [1.3 * k, 0, 8.4 * k], 0.62 * k, 0.55 * k, c.skin, { k: 0.3 * k });
  // Long jutting face, tusks and the mohawk are what make a troll.
  m.ell('head', [1.9 * k, 0, 9.3 * k], [1.2 * k, 1 * k, 1 * k], c.skin, { k: 0.3 * k });
  m.blob('head', [2.8 * k, 0, 9.05 * k], [4.2 * k, 0, 8.85 * k], 0.62 * k, 0.42 * k, c.skin, { k: 0.2 * k });
  m.blob('neck', [1 * k, 0, 8.3 * k], [1.7 * k, 0, 9 * k], 0.66 * k, 0.6 * k, c.skin, { k: 0.3 * k });
  for (const [s, y] of SIDES) {
    m.ball('head', [2.95 * k, y * 0.6 * k, 9.75 * k], 0.17 * k, c.eye, { em: 3 });
    m.spike('head', [3.7 * k, y * 0.42 * k, 8.65 * k], [4.5 * k, y * 0.85 * k, 10.3 * k], 0.3 * k, '#e6dcc0', { bend: [0.4 * k, 0, -0.1 * k], sides: 5 });
    m.spike('head', [1.5 * k, y * 0.85 * k, 9.6 * k], [0.5 * k, y * 3.2 * k, 10.1 * k], 0.42 * k, c.skin, { sides: 4 });
    m.blob(`${s}up`, [0, y * sw, 7.3 * k], [-0.1 * k, y * (sw + 0.5 * k), 4.7 * k], 0.75 * k * B, 0.6 * k * B, c.skin, { k: 0.3 * k });
    m.blob(`${s}lo`, [-0.1 * k, y * (sw + 0.5 * k), 4.6 * k], [0.9 * k, y * (sw + 0.6 * k), 1.8 * k], 0.6 * k * B, 0.55 * k * B, c.skin, { k: 0.25 * k });
    m.ell(`${s}hand`, [1 * k, y * (sw + 0.6 * k), 1.2 * k], [0.62 * k, 0.56 * k, 0.72 * k], c.skin, { k: 0.15 * k });
    m.blob(`${s}th`, [0, y * 1 * k, 3.7 * k], [0.3 * k, y * 1.15 * k, 2 * k], 0.74 * k, 0.5 * k, c.skin, { k: 0.3 * k });
    m.blob(`${s}sh`, [0.3 * k, y * 1.15 * k, 2 * k], [0, y * 1.2 * k, 0.32 * k], 0.5 * k, 0.62 * k, c.skin, { k: 0.25 * k });
    m.ell('chest', [0, y * sw, 7.7 * k], [0.72 * k, 0.72 * k, 0.5 * k], c.metal, { k: 0.05 });
    for (let i = 0; i < 3; i++) m.spike('chest', [-0.2 * k + i * 0.3 * k, y * (sw + 0.25 * k), 8.4 * k], [-0.6 * k + i * 0.4 * k, y * (sw + 0.7 * k), 10 * k - i * 0.5 * k], 0.22 * k, '#e6dcc0', { sides: 4 });
  }
  // Mohawk.
  for (let i = 0; i < 9; i++) m.spike('head', [2.6 * k - i * 0.36 * k, 0, 10.15 * k - i * 0.05 * k], [1.3 * k - i * 0.48 * k, 0, 12.3 * k - i * 0.22 * k], 0.42 * k, c.hair, { sides: 4 });
  m.lathe('hips', [0, 0, 2.2 * k], [0, 0, 3.7 * k], [[1.65 * k, 0], [1.25 * k, 1]], c.cloth, { sides: 9 });
  m.box('hips', [1.4 * k, 0, 3.2 * k], [0.25 * k, 1.1 * k, 1.8 * k], c.trim, {});
  if (o.weapon === 'axe') {
    m.tube('Rhand', [[1.1 * k, -(sw + 0.6 * k), 3.2 * k], [1.1 * k, -(sw + 0.6 * k), -0.4 * k]], 0.17 * k, '#4a3a2a', { sides: 6 });
    m.box('Rhand', [1.8 * k, -(sw + 0.6 * k), 3 * k], [1.5 * k, 0.2 * k, 1.8 * k], c.metal, { taper: 0.5 });
  } else if (o.weapon === 'staff') {
    m.tube('Rhand', [[1.1 * k, -(sw + 0.6 * k), 0.1], [1.1 * k, -(sw + 0.6 * k), 8.2 * k]], 0.14 * k, '#5a4228', { sides: 6 });
    m.ball('Rhand', [1.1 * k, -(sw + 0.6 * k), 8.8 * k], 0.48 * k, o.orb || '#50ff90', { em: 2.4 });
    m.spike('Rhand', [1.1 * k, -(sw + 0.6 * k), 9.2 * k], [1.1 * k, -(sw + 0.6 * k), 10.2 * k], 0.22 * k, '#e6dcc0', { sides: 4 });
  } else if (o.weapon === 'blades') {
    for (const [s, y] of SIDES) m.tube(`${s}hand`, [[1.1 * k, y * (sw + 0.6 * k), 1.3 * k], [2.7 * k, y * (sw + 0.8 * k), 3.8 * k]], [0.3 * k, 0.02], '#b8c4cc', { sides: 3 });
  }
  if (o.mask) {
    // Jin'do's huge carved mask.
    m.ell('head', [3.5 * k, 0, 9.5 * k], [0.28 * k, 2 * k, 2.5 * k], '#8a5a2c', { k: 0.05 });
    for (const [, y] of SIDES) { m.ball('head', [3.8 * k, y * 0.8 * k, 10.1 * k], 0.28 * k, '#50ff70', { em: 2.4 }); m.spike('head', [3.4 * k, y * 1.3 * k, 11 * k], [3.2 * k, y * 2.2 * k, 13.2 * k], 0.3 * k, '#d8c8a0', { sides: 5 }); }
    m.box('head', [3.82 * k, 0, 8.5 * k], [0.15 * k, 1.6 * k, 0.5 * k], '#3a2410', {});
    for (let i = 0; i < 5; i++) m.spike('head', [2.4 * k, (i - 2) * 0.7 * k, 11.2 * k], [1.8 * k, (i - 2) * 1.2 * k, 13.8 * k - Math.abs(i - 2) * 0.4 * k], 0.22 * k, ['#d85030', '#50a0d8', '#e0c040', '#50a0d8', '#d85030'][i], { sides: 3 });
  }
  return m.build({ cell: 0.11 * Math.max(0.8, k), smooth: 1, ao: 1, aoReach: 0.9 * k });
}

// ---- beasts
function buildFeline(o) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-3, 0, 3.8]); m.bone('chest', 'hips', [1.8, 0, 4.2]); m.bone('neck', 'chest', [3.6, 0, 5.2]); m.bone('head', 'neck', [5.1, 0, 5.8]); m.bone('jaw', 'head', [5.6, 0, 5.3]); m.bone('mouth', 'head', [7.6, 0, 5.3]);
  for (let i = 0; i < 5; i++) m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', [-5 - i * 1.7, 0, 4 + i * 0.25]);
  const c = o.skin, d = o.dark, b = o.belly;
  m.ell('chest', [1.7, 0, 4.4], [3.1, 1.95, 1.95], c, { k: 0.8 }); m.ell('hips', [-3, 0, 4.2], [2.9, 1.75, 1.8], c, { k: 0.8 });
  m.blob('neck', [3.2, 0, 4.9], [5, 0, 5.7], 1.25, 0.9, c, { k: 0.5 });
  m.ell('head', [5.8, 0, 5.8], [1.35, 1.2, 1], c, { k: 0.3 }); m.blob('head', [6.6, 0, 5.5], [7.5, 0, 5.3], 0.72, 0.52, c, { k: 0.25 });
  m.blob('jaw', [6, 0, 5], [7.3, 0, 4.9], 0.5, 0.36, b, { k: 0.12 });
  for (const [s, y] of SIDES) {
    m.ball('head', [6.8, y * 0.68, 6.2], 0.15, o.eye || '#ffe060', { em: 3.2 });
    m.spike('head', [5.5, y * 0.9, 6.55], [4.9, y * 1.25, 7.8], 0.42, c, { sides: 4 });
    for (let i = 0; i < 2; i++) m.spike('head', [7.2, y * 0.3, 5.05], [7.25, y * 0.34, 4.3], 0.1, '#f0e6c8', { sides: 3 });
    m.bone(`${s}fu`, 'chest', [2, y * 1.6, 4]); m.bone(`${s}fl`, `${s}fu`, [2.6, y * 1.8, 2]);
    m.bone(`${s}bu`, 'hips', [-3.3, y * 1.5, 3.8]); m.bone(`${s}bl`, `${s}bu`, [-3.8, y * 1.7, 1.8]);
    m.ell(`${s}fu`, [2, y * 1.75, 3.5], [1.05, 0.7, 1.55], c, { k: 0.4 }); m.blob(`${s}fl`, [2.5, y * 1.8, 2.1], [2.7, y * 1.8, 0.4], 0.56, 0.6, c, { k: 0.2 }); m.ell(`${s}fl`, [3.1, y * 1.8, 0.32], [0.82, 0.55, 0.3], c, { k: 0.1 });
    m.ell(`${s}bu`, [-3.3, y * 1.6, 3.4], [1.35, 0.85, 1.75], c, { k: 0.45 }); m.blob(`${s}bl`, [-3.8, y * 1.7, 1.9], [-3.3, y * 1.8, 0.4], 0.56, 0.6, c, { k: 0.2 }); m.ell(`${s}bl`, [-2.8, y * 1.8, 0.32], [0.82, 0.55, 0.3], c, { k: 0.1 });
    for (let i = -1; i <= 1; i++) { m.spike(`${s}fl`, [3.75, y * 1.8 + i * 0.3, 0.3], [4.4, y * 1.8 + i * 0.36, 0.03], 0.12, '#f0e6c8', { sides: 3 }); m.spike(`${s}bl`, [-2.2, y * 1.8 + i * 0.3, 0.3], [-1.55, y * 1.8 + i * 0.36, 0.03], 0.12, '#f0e6c8', { sides: 3 }); }
  }
  const tp = Array.from({ length: 6 }, (_, i) => [-5 - i * 1.7, 0, 4 + i * 0.25 + Math.sin(i) * 0.25]);
  for (let i = 0; i < 5; i++) m.blob(`tail${i}`, tp[i], tp[i + 1], 0.46 - i * 0.05, 0.42 - i * 0.05, c, { k: 0.12 });
  return m.build({ cell: 0.11, smooth: 1, ao: 1, aoReach: 1, paint(v) {
    if (v.nz < -0.25) { const k = Math.min(1, (-v.nz - 0.25) * 2); v.color = v.color.map((x, i) => x + (((parseInt(b.slice(1), 16) >> (16 - i * 8)) & 255) / 255 - x) * k); }
    if (o.stripes && v.nz > -0.4) {
      const s = Math.sin(v.x * 2.6 + Math.sin(v.y * 1.7) * 0.8);
      if (s > 0.5) { const dk = parseInt(d.slice(1), 16); const k = Math.min(1, (s - 0.5) * 5); for (let i = 0; i < 3; i++) v.color[i] += (((dk >> (16 - i * 8)) & 255) / 255 - v.color[i]) * k; }
    }
    if (o.glowSpots) { const s = Math.sin(v.x * 3) * Math.sin(v.y * 4); if (s > 0.74 && v.nz > 0.2) v.em = 1.1; }
  } });
}

export function animateFeline(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 8), c = ease('c', s.cast ? 1 : 0, 8);
  const br = Math.sin(t * 2) * 0.025;
  p.r('chest', 0, br, 0).r('neck', 0, 0.1 * Math.sin(t * 0.7) - 0.3 * c, 0.05 * Math.sin(t * 0.6)).r('head', 0, -0.2 * c, 0.06 * Math.sin(t * 0.9)).r('jaw', 0, 0.12 + 0.55 * c, 0);
  for (let i = 0; i < 5; i++) p.r(`tail${i}`, 0, 0.05 * Math.sin(t * 2 + i), 0.16 * Math.sin(t * 1.4 + i * 0.7));
  if (walk > 0.01) { const w = t * 9, a = Math.sin(w) * walk * 0.7, b = Math.cos(w) * walk; p.r('Lfu', 0, -a, 0).r('Rbu', 0, -a, 0).r('Rfu', 0, a, 0).r('Lbu', 0, a, 0).r('Lfl', 0, Math.max(0, b) * 0.8, 0).r('Rbl', 0, Math.max(0, b) * 0.8, 0).r('Rfl', 0, Math.max(0, -b) * 0.8, 0).r('Lbl', 0, Math.max(0, -b) * 0.8, 0).o('hips', 0, 0, Math.abs(a) * 0.3); }
  p.evaluate();
}

function buildBat() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 8]); m.bone('head', 'body', [1, 0, 10]); m.bone('mouth', 'head', [3, 0, 9.7]);
  const c = '#6e3a2a', w = '#7a2a24', e = '#ffe060';
  m.ell('body', [0, 0, 8.6], [2.3, 2.3, 3], c, { k: 0.8 }); m.ell('head', [1.8, 0, 11], [1.6, 1.35, 1.3], c, { k: 0.5 }); m.blob('head', [2.9, 0, 10.6], [3.7, 0, 10.2], 0.75, 0.42, '#5a2f24', { k: 0.3 });
  m.blob('body', [0, 0, 6.5], [-0.6, 0, 4.6], 1.1, 0.5, c, { k: 0.5 });
  for (const [s, y] of SIDES) {
    m.ball('head', [3, y * 0.72, 11.5], 0.2, e, { em: 3.4 }); m.spike('head', [1.2, y * 1, 12], [0.6, y * 2.6, 15.3], 0.82, c, { sides: 5 });
    for (let i = 0; i < 2; i++) m.spike('head', [3.5, y * 0.3, 10], [3.6, y * 0.32, 9.1], 0.11, '#f0e6c8', { sides: 3 });
    m.bone(`${s}w1`, 'body', [0, y * 2, 10]); m.bone(`${s}w2`, `${s}w1`, [-0.5, y * 7.5, 13]); 
    const S = [0, y * 2, 10], E = [-0.5, y * 7.5, 13], tips = [[-2, y * 17.5, 12.3], [-4.4, y * 14.8, 6], [-4.2, y * 9.2, 3.5], [-3.6, y * 4, 3.5]];
    m.tube(`${s}w1`, [S, E], [0.5, 0.35], '#3a2018', { sides: 6 });
    tips.forEach((t) => m.tube(`${s}w2`, [E, t], [0.28, 0.04], '#3a2018', { sides: 5 }));
    m.spike(`${s}w2`, E, [E[0] + 0.5, E[1] + y * 0.6, E[2] + 1.9], 0.26, '#e8dcc0', { sides: 4 });
    for (let i = 0; i < tips.length - 1; i++) { const b = [`${s}w2`, `${s}w2`]; m.membrane([E, tips[i]], [E, tips[i + 1]], b, b, w, { steps: 3, fade: 0.18 }); }
    m.membrane([S, [0, y * 2, 6]], [E, tips[3]], [`${s}w1`, `${s}w1`], [`${s}w2`, `${s}w2`], w, { steps: 2, fade: 0.1 });
    for (let c2 = -1; c2 <= 1; c2++) m.spike('body', [0.2, y * 1 + c2 * 0.28, 4.4], [0.6, y * 1 + c2 * 0.32, 3.2], 0.15, '#f0e6c8', { sides: 3 });
  }
  return m.build({ cell: 0.12, smooth: 1, ao: 1, aoReach: 1 });
}
function animateBat(p, s) {
  p.reset(); const t = s.t, c = s.cast ? 1 : 0, b = Math.sin(t * 7.4);
  p.o('body', 0, 0, 0.5 * Math.sin(t * 2.3)); p.r('head', 0, 0.08 * Math.sin(t * 1.5) - 0.2 * c, 0);
  for (const [n, y] of SIDES) { p.r(`${n}w1`, y * b * 0.5, 0, 0); p.r(`${n}w2`, y * (b * 0.26 + 0.1), 0, 0); }
  p.evaluate();
}

function buildSerpent(o) {
  const m = new ModelBuilder();
  const c = o.skin, b = o.belly, N = 9;
  m.bone('root', null, [0, 0, 0]);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1), a = k * (o.coils ?? 7.5);
    const r = (1 - k) * (o.rad ?? 5) + k * 0.2;
    pts.push([Math.cos(a + 1.4) * r * 0.45 + k * 2.6, Math.sin(a + 1.4) * r * 0.5, Math.pow(k, 1.6) * (o.h ?? 13) + 0.9 * (1 - k)]);
  }
  pts.forEach((p, i) => m.bone(`s${i}`, i ? `s${i - 1}` : 'root', p));
  const hp = pts[N - 1];
  m.bone('head', `s${N - 1}`, [hp[0], hp[1], hp[2] + 0.4]); m.bone('jaw', 'head', [hp[0] + 0.6, hp[1], hp[2] + 0.2]); m.bone('mouth', 'head', [hp[0] + 3.2, hp[1], hp[2] + 0.2]);
  for (let i = 0; i < N - 1; i++) { const k = i / (N - 1), r = (1 - k) * 1.65 * (o.fat ?? 1) + 0.7; m.blob(`s${i}`, pts[i], pts[i + 1], r, r - 0.1, c, { k: 0.5 }); }
  m.ell('head', [hp[0] + 1, hp[1], hp[2] + 0.45], [1.7 * (o.headK ?? 1), 1.25 * (o.headK ?? 1), 0.82 * (o.headK ?? 1)], c, { k: 0.3 }); m.blob('head', [hp[0] + 2, hp[1], hp[2] + 0.2], [hp[0] + 3.4, hp[1], hp[2] + 0.05], 0.6, 0.34, c, { k: 0.2 });
  m.blob('jaw', [hp[0] + 0.9, hp[1], hp[2] - 0.45], [hp[0] + 3.1, hp[1], hp[2] - 0.6], 0.48, 0.28, b, { k: 0.1 });
  for (const [, y] of SIDES) {
    m.ball('head', [hp[0] + 2.1, hp[1] + y * 0.75, hp[2] + 0.82], 0.17, o.eye || '#ffd030', { em: 3.4 });
    m.spike('head', [hp[0] + 3.1, hp[1] + y * 0.22, hp[2] - 0.2], [hp[0] + 3.18, hp[1] + y * 0.24, hp[2] - 1.05], 0.12, '#f0e6c8', { sides: 3 });
    if (o.hood) m.tri([hp[0] + 0.5, hp[1] + y * 0.9, hp[2] + 0.2], [hp[0] - 1.2, hp[1] + y * 4.3, hp[2] - 1.4], [hp[0] - 1.2, hp[1] + y * 0.8, hp[2] - 3.4], o.hood, 0.1, ['head', 'head', 'head'], true);
    if (o.wings) {
      m.bone(`${y > 0 ? 'L' : 'R'}w`, `s${Math.floor(N * 0.68)}`, [hp[0] - 2.5, hp[1] + y, hp[2] - 3.5]);
      const n = `${y > 0 ? 'L' : 'R'}w`, S = [hp[0] - 2.5, hp[1] + y, hp[2] - 3.5], tips = [[hp[0] - 7.4, hp[1] + y * 15, hp[2] + 3.4], [hp[0] - 9.5, hp[1] + y * 13.5, hp[2] - 1.6], [hp[0] - 8.6, hp[1] + y * 8, hp[2] - 4.8]];
      tips.forEach((t) => m.tube(n, [S, lerp3(S, t, 0.5), t], [0.34, 0.2, 0.03], '#7a2a18', { sides: 5 }));
      for (let i = 0; i < 2; i++) m.membrane([S, tips[i]], [S, tips[i + 1]], [n, n], [n, n], o.wings, { steps: 3, fade: 0.2 });
      m.membrane([S, tips[2]], [S, [S[0] - 1.4, S[1] + y * 0.5, S[2] - 3.1]], [n, n], [n, n], o.wings, { steps: 2, fade: 0.1 });
    }
  }
  if (o.crest) for (let i = 0; i < 6; i++) m.spike('head', [hp[0] + 0.4 - i * 0.3, hp[1], hp[2] + 1.15], [hp[0] - 1.4 - i * 0.45, hp[1], hp[2] + 3 - i * 0.2], 0.34, o.crest, { sides: 4 });
  return m.build({ cell: 0.14, smooth: 1, ao: 1, aoReach: 1.1, paint(v) { if (v.nx > 0.45 && v.z > 0.5) { const k = Math.min(1, (v.nx - 0.45) * 2.5) * (0.78 + 0.22 * Math.sin(v.z * 5.5)), bb = parseInt(b.slice(1), 16); for (let i = 0; i < 3; i++) v.color[i] += (((bb >> (16 - i * 8)) & 255) / 255 - v.color[i]) * k; } } });
}
function animateSerpent(p, s) {
  p.reset(); const m = s.mem, t = s.t;
  m.c = (m.c ?? 0) + ((s.cast ? 1 : 0) - (m.c ?? 0)) * Math.min(1, s.dt * 7);
  for (let i = 1; i < 9; i++) p.r(`s${i}`, 0, 0.012 * Math.sin(t * 1.1 + i * 0.7), 0.012 * Math.sin(t * 0.9 + i * 0.8));
  p.r('head', 0, 0.06 * Math.sin(t * 0.9) - 0.22 * m.c, 0.1 * Math.sin(t * 0.6)).r('jaw', 0, 0.08 + 0.6 * m.c, 0);
  for (const [n, y] of SIDES) p.r(`${n}w`, y * 0.3 * Math.sin(t * 2.6), 0, 0);
  p.evaluate();
}

function buildSpider(o) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 4.4]); m.bone('head', 'body', [3, 0, 5]); m.bone('mouth', 'head', [5, 0, 4.6]);
  const c = o.skin, d = o.dark;
  m.ell('body', [-3.2, 0, 5.6], [4.4, 3.5, 3], c, { k: 0.4 }); m.ell('body', [1.2, 0, 4.6], [2.5, 2.2, 1.7], c, { k: 0.6 });
  m.ell('head', [3.7, 0, 4.9], [1.4, 1.2, 1], d, { k: 0.3 });
  for (const [, y] of SIDES) { m.spike('head', [4.8, y * 0.5, 4.3], [5.5, y * 0.42, 3.1], 0.26, '#f0e6c8', { sides: 4, bend: [0.2, 0, 0] }); for (let i = 0; i < 2; i++) m.ball('head', [4.75 - i * 0.5, y * (0.5 + i * 0.25), 5.5 + i * 0.1], 0.15, o.eye || '#ff4040', { em: 3.4 }); }
  for (const [s, y] of SIDES) for (let i = 0; i < 4; i++) {
    const x0 = 1.6 - i * 1.15, a = 0.5 - i * 0.34, n = `${s}leg${i}`;
    m.bone(n, 'body', [x0, y * 1.8, 5]);
    const K = [x0 + Math.sin(a) * 3.4, y * (1.8 + Math.cos(a) * 3.8), 8.8], F = [x0 + Math.sin(a) * 6.8, y * (1.8 + Math.cos(a) * 7.9), 0.1];
    m.tube(n, [[x0, y * 1.8, 5], K], [0.42, 0.3], d, { sides: 6 }); m.tube(n, [K, lerp3(K, F, 0.6), F], [0.3, 0.2, 0.04], d, { sides: 5 });
  }
  return m.build({ cell: 0.13, smooth: 1, ao: 1, aoReach: 1.2 });
}
function animateSpider(p, s) {
  p.reset(); const t = s.t, w = s.moving ? t * 9 : 0, c = s.cast ? 0.2 : 0;
  p.o('body', 0, 0, 0.1 * Math.sin(t * 2)).r('head', 0, -c, 0);
  for (const [n, y] of SIDES) for (let i = 0; i < 4; i++) { const ph = i * 1.6 + (y > 0 ? 0 : 1.6); p.r(`${n}leg${i}`, 0, 0, s.moving ? y * 0.3 * Math.sin(w + ph) : y * 0.04 * Math.sin(t + ph)); }
  p.evaluate();
}

function buildRaptor(o) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('hips', 'root', [-1, 0, 4]); m.bone('chest', 'hips', [1.5, 0, 4.6]); m.bone('head', 'chest', [4.4, 0, 7]); m.bone('jaw', 'head', [5, 0, 6.6]); m.bone('mouth', 'head', [7.2, 0, 6.6]);
  for (let i = 0; i < 4; i++) m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', [-3 - i * 1.8, 0, 4 + i * 0.2]);
  const c = o.skin, b = o.belly;
  m.ell('hips', [-0.8, 0, 4.2], [2.6, 1.6, 1.8], c, { k: 0.7 }); m.ell('chest', [1.7, 0, 4.9], [1.9, 1.3, 1.4], c, { k: 0.7 });
  m.blob('chest', [2.5, 0, 5.3], [4.4, 0, 6.8], 1, 0.68, c, { k: 0.4 });
  m.ell('head', [5.2, 0, 7], [1.3, 0.72, 0.68], c, { k: 0.3 }); m.blob('jaw', [5.1, 0, 6.5], [6.8, 0, 6.4], 0.42, 0.24, b, { k: 0.1 });
  for (let i = 0; i < 4; i++) { const x = -3 - i * 1.8; m.blob(`tail${i}`, [x, 0, 4 + i * 0.2], [x - 1.8, 0, 4.2 + i * 0.2], 0.95 - i * 0.2, 0.75 - i * 0.2, c, { k: 0.2 }); }
  for (const [s, y] of SIDES) {
    m.ball('head', [5.8, y * 0.55, 7.35], 0.13, '#ffe060', { em: 3.2 });
    m.bone(`${s}th`, 'hips', [-0.8, y * 1.3, 3.5]); m.bone(`${s}sh`, `${s}th`, [0.5, y * 1.4, 2]);
    m.ell(`${s}th`, [-0.8, y * 1.4, 3], [1.4, 0.8, 1.7], c, { k: 0.4 });
    m.blob(`${s}sh`, [0.5, y * 1.4, 2], [-0.3, y * 1.4, 0.4], 0.5, 0.42, c, { k: 0.2 });
    m.ell(`${s}sh`, [0.2, y * 1.4, 0.3], [1, 0.5, 0.28], c, { k: 0.1 });
    for (let i = -1; i <= 1; i++) m.spike(`${s}sh`, [1, y * 1.4 + i * 0.26, 0.28], [1.7, y * 1.4 + i * 0.3, 0.02], 0.1, '#f0e6c8', { sides: 3 });
  }
  for (let i = 0; i < 8; i++) m.spike('hips', [1.6 - i * 0.9, 0, 6 - i * 0.05], [1 - i * 1, 0, 7.4 - i * 0.05], 0.3, o.crest || '#d8c078', { sides: 4 });
  return m;
}

function buildMandokir() {
  const m = buildRaptor({ skin: '#a33a26', belly: '#e6c088', crest: '#f0d06a' });
  // The Bloodlord riding on top, one big axe held high.
  const z = 4.6, c = { skin: '#3a7f76', armor: '#a02a22', metal: '#9a8f88' };
  m.ell('hips', [0.2, 0, z + 2.6], [1.3, 1.6, 1.7], c.armor, { k: 0.6 });
  m.ell('hips', [0.2, 0, z + 1.3], [1, 1.3, 1], c.skin, { k: 0.5 });
  m.ell('hips', [1, 0, z + 4.7], [0.8, 0.7, 0.72], c.skin, { k: 0.4 });
  m.blob('hips', [1.6, 0, z + 4.5], [2.5, 0, z + 4.3], 0.4, 0.28, c.skin, { k: 0.2 });
  for (const [, y] of SIDES) {
    m.ball('hips', [1.8, y * 0.4, z + 5], 0.13, '#ff4030', { em: 3.4 });
    m.spike('hips', [2.2, y * 0.26, z + 4], [2.6, y * 0.5, z + 5.2], 0.17, '#e6dcc0', { bend: [0.2, 0, 0], sides: 4 });
    m.ell('hips', [0.2, y * 2.05, z + 3.9], [0.9, 0.9, 0.7], c.metal, { k: 0.05 });
    m.spike('hips', [0.1, y * 2.4, z + 4.4], [-0.4, y * 3.2, z + 6.2], 0.3, '#e6dcc0', { sides: 4 });
    m.blob('hips', [0.2, y * 2.1, z + 3.4], [0.6, y * 2.6, z + 1.4], 0.55, 0.45, c.skin, { k: 0.3 });
    m.blob('hips', [0, y * 1, z + 1], [0.5, y * 2.3, z - 1.2], 0.6, 0.44, c.skin, { k: 0.25 });
  }
  for (let i = 0; i < 6; i++) m.spike('hips', [0.9 - i * 0.2, 0, z + 5.25], [0.1 - i * 0.3, 0, z + 6.8 - i * 0.12], 0.25, '#d4432a', { sides: 4 });
  m.tube('hips', [[0.7, -2.7, z - 1.4], [0.7, -2.7, z + 5.8]], 0.17, '#4a3a2a', { sides: 6 });
  m.box('hips', [1.3, -2.7, z + 5.3], [1.8, 0.2, 2.6], '#b4b8bc', { taper: 0.5 });
  m.box('hips', [0.1, -2.7, z + 5.3], [1.1, 0.2, 2.2], '#b4b8bc', { taper: 0.6 });
  return m.build({ cell: 0.11, smooth: 1, ao: 1, aoReach: 1 });
}
function animateRaptor(p, s) {
  p.reset(); const m = s.mem, t = s.t;
  m.c = (m.c ?? 0) + ((s.cast ? 1 : 0) - (m.c ?? 0)) * Math.min(1, s.dt * 7);
  p.r('chest', 0, 0.03 * Math.sin(t * 2), 0).r('head', 0, 0.08 * Math.sin(t * 1.2) - 0.25 * m.c, 0.1 * Math.sin(t * 0.8)).r('jaw', 0, 0.1 + 0.55 * m.c, 0);
  for (let i = 0; i < 4; i++) p.r(`tail${i}`, 0, 0, 0.14 * Math.sin(t * 1.8 + i));
  if (s.moving) { const w = t * 10, a = Math.sin(w) * 0.8, b = Math.cos(w); p.r('Lth', 0, -a, 0).r('Rth', 0, a, 0).r('Lsh', 0, Math.max(0, b) * 0.8, 0).r('Rsh', 0, Math.max(0, -b) * 0.8, 0).o('hips', 0, 0, Math.abs(a) * 0.3); }
  p.evaluate();
}

function buildGahz() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 5]); m.bone('head', 'body', [5.5, 0, 5.2]); m.bone('jaw', 'head', [6, 0, 4.5]); m.bone('mouth', 'head', [10, 0, 4.8]); m.bone('tail', 'body', [-6.5, 0, 5]);
  const c = '#3a6a78', b = '#c8d8b8';
  m.ell('body', [0, 0, 5.2], [6.5, 3.6, 3.4], c, { k: 1 }); m.ell('head', [6.5, 0, 5.3], [3.2, 2.8, 2.5], c, { k: 0.9 });
  m.blob('jaw', [7, 0, 3.6], [10, 0, 3.8], 1.5, 0.8, b, { k: 0.3 });
  m.ell('jaw', [8.5, 0, 4.25], [2.1, 1.6, 0.25], '#c0352a', { k: 0.05, em: 0.4 });
  m.blob('tail', [-6, 0, 5], [-11, 0, 5], 2.2, 0.7, c, { k: 0.6 });
  for (const [s, y] of SIDES) {
    m.ball('head', [7.6, y * 2.3, 6.3], 0.42, '#ffe060', { em: 3.2 });
    m.tri([1, y * 3.1, 3.6], [-1, y * 9, 1.3], [-4, y * 3.1, 3.6], '#6aa0a6', 0, ['body', 'body', 'body'], true);
    m.tri([3.4, y * 2.7, 2.4], [3, y * 6.4, 0.1], [0.5, y * 2.7, 2.4], '#6aa0a6', 0, ['body', 'body', 'body'], true);
    for (let i = 0; i < 6; i++) m.spike('jaw', [7.3 + i * 0.5, y * (1.3 - i * 0.1), 4.25], [7.35 + i * 0.5, y * (1.3 - i * 0.1), 5.4], 0.18, '#f0e6c8', { sides: 3 });
  }
  m.tri([-10.5, 0, 5.4], [-15.6, 0, 11], [-13.5, 0, 5], '#6aa0a6', 0, ['tail', 'tail', 'tail'], true);
  m.tri([-10.5, 0, 4.6], [-13.5, 0, 5], [-15.6, 0, 0.5], '#6aa0a6', 0, ['tail', 'tail', 'tail'], true);
  for (let i = 0; i < 9; i++) { const x = 5 - i * 1.5; m.spike('body', [x, 0, 8.2], [x - 1.2, 0, 11 - Math.abs(i - 3) * 0.3], 0.55, '#6aa0a6', { sides: 4 }); }
  return m.build({ cell: 0.17, smooth: 1, ao: 1, aoReach: 1.3, paint(v) { if (v.nz < -0.1) { const k = Math.min(1, (-v.nz) * 2); v.color[0] += (0.78 - v.color[0]) * k; v.color[1] += (0.85 - v.color[1]) * k; v.color[2] += (0.72 - v.color[2]) * k; } } });
}
function animateGahz(p, s) { p.reset(); const m = s.mem, t = s.t; m.c = (m.c ?? 0) + ((s.cast ? 1 : 0) - (m.c ?? 0)) * Math.min(1, s.dt * 6); p.o('body', 0, 0, 0.3 * Math.sin(t)); p.r('tail', 0, 0, 0.2 * Math.sin(t * 1.6)).r('head', 0, -0.15 * m.c, 0.05 * Math.sin(t)).r('jaw', 0, 0.1 + 0.6 * m.c, 0); p.evaluate(); }

const stormFX = (P, ctx) => { const M = ctx.M, q = [M[0] * 1.1 + M[4] * -3.1 + M[12], M[1] * 1.1 + M[5] * -3.1 + M[13], M[10] * 9.1 + M[14]]; if (Math.random() < ctx.dt * 40) P.emit(q[0], q[1], q[2], (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0.2, 0, 2, 3.2, 8, 0, 0.18, 3); };
const troll = (o, extra = {}) => () => ({ built: buildTroll(o), animate: animateBiped, mat: skinMat, scale: o.scale ?? 1, mouth: 'mouth', school: extra.school || 'physical', height: 11, heroDist: 19, ...extra });

export const BOSSES = {
  'zul-gurub/jeklik': () => ({ built: buildBat(), animate: animateBat, mat: { ...skinMat, noise: 0.5 }, scale: 1, mouth: 'mouth', school: 'shadow', height: 15, heroDist: 22 }),
  'zul-gurub/venoxis': () => ({ built: buildSerpent({ skin: '#3f7a35', belly: '#d9d08a', hood: '#2c5d2c', eye: '#ffd030' }), animate: animateSerpent, mat: scaleMat, scale: 0.95, mouth: 'mouth', school: 'poison', height: 16, heroDist: 22 }),
  'zul-gurub/marli': () => ({ built: buildSpider({ skin: '#6a5a7a', dark: '#2c2438', eye: '#ff5048' }), animate: animateSpider, mat: { ...skinMat, scales: 0.2, scaleF: 3 }, scale: 1, mouth: 'mouth', school: 'poison', height: 9, heroDist: 21 }),
  'zul-gurub/thekal': () => ({ built: buildFeline({ skin: '#c87a26', dark: '#201410', belly: '#e8d2a0', stripes: true, eye: '#ffe060' }), animate: animateFeline, mat: skinMat, scale: 1.05, mouth: 'mouth', school: 'physical', height: 8, heroDist: 18 }),
  'zul-gurub/arlokk': () => ({ built: buildFeline({ skin: '#2c2238', dark: '#120c1a', belly: '#5a4a6a', glowSpots: true, eye: '#ff70e0' }), animate: animateFeline, mat: { ...skinMat, rim: 0.55 }, scale: 1, mouth: 'mouth', school: 'shadow', height: 8, heroDist: 18 }),
  'zul-gurub/mandokir': () => ({ built: buildMandokir(), animate: animateRaptor, mat: skinMat, scale: 1.1, mouth: 'mouth', school: 'physical', height: 12, heroDist: 19 }),
  'zul-gurub/gahzranka': () => ({ built: buildGahz(), animate: animateGahz, mat: { ...scaleMat, scaleF: 1.8 }, scale: 1, mouth: 'mouth', school: 'frost', height: 11, heroDist: 30 }),
  'zul-gurub/grilek': troll({ colors: { skin: '#556067', hair: '#2a2a2a', cloth: '#3a3a42', metal: '#8a8a94', eye: '#ff5038' }, build: 1.45, size: 1.3, weapon: 'axe' }, { heroDist: 22, height: 14 }),
  'zul-gurub/hazzarah': troll({ colors: { skin: '#6f5a9a', hair: '#e6dcc0', cloth: '#4a2a6a', trim: '#e0c040', metal: '#6a4a9a', eye: '#a0e0ff' }, build: 0.75, weapon: 'staff', orb: '#a070ff' }, { school: 'arcane' }),
  'zul-gurub/renataki': troll({ colors: { skin: '#3a4048', hair: '#c8452a', cloth: '#1f2228', metal: '#3a3e46', eye: '#ffe060' }, build: 0.85, weapon: 'blades' }),
  'zul-gurub/wushoolay': troll({ colors: { skin: '#3a5a9a', hair: '#e8f0ff', cloth: '#22345c', metal: '#6a8ac0', eye: '#a0e0ff' }, weapon: 'staff', orb: '#80c0ff' }, { school: 'storm', fx: stormFX }),
  'zul-gurub/jindo': troll({ colors: { skin: '#4a8a6a', hair: '#d85030', cloth: '#7a3a1e', metal: '#7a5a34' }, build: 0.8, size: 0.82, weapon: 'staff', orb: '#ff50a0', mask: true }, { school: 'shadow', heroDist: 16, height: 11 }),
  'zul-gurub/hakkar': () => ({ built: buildSerpent({ skin: '#a4202c', belly: '#e6c078', wings: '#2f7f7a', crest: '#e0c040', eye: '#ffef70', coils: 9, h: 19, fat: 2.1, rad: 7, headK: 1.45 }), animate: animateSerpent, mat: scaleMat, scale: 1, mouth: 'mouth', school: 'shadow', height: 22, heroDist: 30, glow: [1.6, 0.2, 0.3], glowR: 30 }),
};

export const ADDS = {};
void emitFlame; void SCHOOLS;
