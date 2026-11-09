// Molten Core, modelled from screenshots of the instance.
//  Flamewakers: tall serpent-bodied lords with banded bellies and a fan of long spines.
//  Core hounds: squat two-headed brutes with fire on their backs.
//  Garr: a heap of black boulders with gold cuffs.  Geddon: a burning teardrop with floating cuffs.
//  Golemagg: a molten giant with a pale mane.  Ragnaros: burning from the lava with white horns.

import { ModelBuilder } from '../model.js';
import { emitFlame, SCHOOLS } from '../fx.js';
import { bipedRig, animateBiped, SIDES } from './biped.js';

const FIRE = SCHOOLS.fire;
const toWorld = (M, p) => [M[0] * p[0] + M[4] * p[1] + M[12], M[1] * p[0] + M[5] * p[1] + M[13], M[10] * p[2] + M[14]];

export function buildFlamewaker({ skin, belly, spine, eye = '#ffd24a', weapon = 'mace' }) {
  const m = new ModelBuilder();
  const hip = 4.3, chest = 7.0, neckZ = 8.9;
  bipedRig(m, { hip, chest, neck: neckZ, sw: 2.0, armU: 2.3, armL: 2.2, hipW: 0.3, headUp: 0.1, shoulderDrop: 0.7 });
  for (let i = 0; i < 5; i++) m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', [-0.5 - i * 1.25, 0, hip - 1.2 - Math.min(i, 3) * 0.8]);
  // Serpent lower body coiling to the floor.
  m.blob('hips', [0, 0, hip + 0.5], [-0.15, 0, hip - 1.0], 1.15, 1.15, belly, { k: 0.5 });
  m.blob('tail0', [-0.15, 0, hip - 1], [-1.6, 0, 1.55], 1.12, 0.95, skin, { k: 0.4 });
  m.blob('tail1', [-1.6, 0, 1.55], [-3.2, 0.2, 0.75], 0.95, 0.72, skin, { k: 0.3 });
  m.blob('tail2', [-3.2, 0.2, 0.75], [-5, -0.4, 0.5], 0.72, 0.5, skin, { k: 0.2 });
  m.blob('tail3', [-5, -0.4, 0.5], [-6.8, 0.2, 0.32], 0.5, 0.26, skin, { k: 0.18 });
  m.blob('tail4', [-6.8, 0.2, 0.32], [-8.2, 0, 0.2], 0.26, 0.06, skin, { k: 0.1 });
  m.blob('hips', [-0.15, 0, hip - 1], [0.5, 0, 0.6], 1.05, 1.15, skin, { k: 0.7 });
  // Torso: lean, banded pale belly from throat to hips.
  m.blob('spine', [0, 0, hip + 0.3], [0, 0, chest - 0.4], 1.05, 1.32, skin, { k: 0.45 });
  m.ell('chest', [0.1, 0, chest], [1.25, 1.9, 1.45], skin, { k: 0.45 });
  m.blob('chest', [0.72, 0, chest + 0.7], [0.92, 0, hip + 0.3], 0.85, 0.85, belly, { k: 0.35 });
  m.blob('neck', [0, 0, neckZ - 0.4], [0.18, 0, neckZ + 0.5], 0.68, 0.58, skin, { k: 0.3 });
  // Head: long, snouted and fanged.
  m.ell('head', [0.3, 0, neckZ + 0.9], [0.92, 0.66, 0.74], skin, { k: 0.2 });
  m.blob('head', [0.6, 0, neckZ + 0.75], [1.65, 0, neckZ + 0.5], 0.5, 0.3, skin, { k: 0.18 });
  for (const [, y] of SIDES) {
    m.ball('head', [0.88, y * 0.42, neckZ + 1.1], 0.14, eye, { em: 3 });
    m.spike('head', [1.35, y * 0.2, neckZ + 0.35], [1.55, y * 0.22, neckZ - 0.15], 0.1, '#e8dcc0', { sides: 3 });
    // Spine fan: the Flamewaker silhouette, long curving rods above the head and shoulders.
    for (let i = 0; i < 4; i++) {
      const a = 0.25 + i * 0.5, len = 5.2 - i * 0.55;
      m.spike('head', [-0.25, y * (0.15 + 0.12 * i), neckZ + 1.3], [-0.6 - 0.25 * i, y * (0.6 + Math.sin(a) * 1.7), neckZ + 1.3 + Math.cos(a) * len], 0.2, spine, { bend: [-0.75, y * 0.3, 0.3], sides: 5, tipColor: '#e8dcc0' });
    }
  }
  for (let i = 0; i < 6; i++) m.spike('spine', [-1.1, 0, hip + i * 0.7], [-3.2, 0, hip + i * 0.9 + 0.8], 0.26, spine, { bend: [0, 0, 0.5], sides: 4 });
  for (const [s, y] of SIDES) {
    const sh = [0, y * 2, neckZ - 0.7], el = [-0.1, y * 2.55, neckZ - 3], wr = [0.5, y * 2.9, neckZ - 5.2];
    m.blob(`${s}up`, sh, el, 0.72, 0.5, skin, { k: 0.3 });
    m.blob(`${s}lo`, el, wr, 0.5, 0.36, skin, { k: 0.2 });
    m.ell(`${s}hand`, wr, [0.42, 0.34, 0.5], skin, { k: 0.1 });
    for (let i = 0; i < 4; i++) m.spike(`${s}up`, [-0.3, y * (2 + i * 0.1), neckZ - 0.3 - i * 0.7], [-1.5, y * (3.2 + i * 0.1), neckZ + 0.6 - i * 0.7], 0.2, spine, { sides: 4 });
  }
  if (weapon === 'mace') {
    m.tube('Rhand', [[0.6, -2.9, neckZ - 7.2], [0.6, -2.9, neckZ - 3.7]], 0.14, '#6a5a44', { sides: 5 });
    m.lathe('Rhand', [0.6, -2.9, neckZ - 7.4], [0.6, -2.9, neckZ - 8.6], [[0.2, 0], [0.82, 0.4], [0.82, 0.6], [0.2, 1]], '#55525e', { sides: 6 });
  } else if (weapon === 'staff') {
    m.tube('Rhand', [[0.6, -2.9, 0.4], [0.6, -2.9, neckZ + 0.9]], 0.13, '#4a3a2a', { sides: 5 });
    m.ball('Rhand', [0.6, -2.9, neckZ + 1.2], 0.42, eye, { em: 3 });
  } else if (weapon === 'hammer') {
    m.tube('Rhand', [[0.6, -2.9, neckZ - 7.6], [0.6, -2.9, neckZ - 2.8]], 0.17, '#3a2d24', { sides: 6 });
    m.box('Rhand', [0.6, -2.9, neckZ - 8.2], [1.4, 3, 1.4], '#3b3640', { taper: 0.82 });
  }
  const built = m.build({
    cell: 0.13, smooth: 1, ao: 1, aoReach: 0.9,
    paint(v) {
      // Bands across the pale front.
      if (v.nx > 0.55 && v.z > hip - 3 && v.z < chest + 1.2 && Math.abs(v.y) < 0.9) { const s = Math.sin(v.z * 8.2) * 0.5 + 0.5; const k = 0.74 + 0.34 * s; v.color[0] *= k; v.color[1] *= k; v.color[2] *= k; }
    },
  });
  return built;
}

export function buildCoreHound({ twoHeads = true, skin = '#3d2a24', plate = '#6f6a74', fire = true }) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-3.2, 0, 3.8]);
  m.bone('chest', 'hips', [1.2, 0, 5.2]);
  const heads = twoHeads ? [['H1', 1.5], ['H2', -1.5]] : [['H1', 0]];
  for (const [n, y] of heads) {
    m.bone(`${n}n`, 'chest', [2.8, y * 0.7, 6]);
    m.bone(n, `${n}n`, [4.4, y, 6.1]);
    m.bone(`${n}j`, n, [4.7, y, 5.5]);
  }
  m.bone('mouth', 'H1', [7, 0, 5.4]);
  for (let i = 0; i < 3; i++) m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', [-5.2 - i * 1.5, 0, 3.8 - i * 0.4]);
  // Huge shoulders over a shorter rear, as the model has.
  m.ell('chest', [1.2, 0, 5.2], [3.5, 3.1, 3], skin, { k: 0.9 });
  m.ell('chest', [-0.5, 0, 6.4], [2.6, 2.5, 1.6], skin, { k: 0.7 });
  m.ell('hips', [-3.2, 0, 3.9], [2.5, 2.1, 2.2], skin, { k: 0.8 });
  for (const [n, y] of heads) {
    m.blob(`${n}n`, [2.2, y * 0.6, 5.9], [4.1, y, 6.1], 1.5, 1.2, skin, { k: 0.6 });
    m.ell(n, [5, y, 6.2], [1.6, 1.25, 1.1], skin, { k: 0.3 });
    m.blob(n, [5.4, y, 5.95], [6.9, y, 5.75], 0.92, 0.72, skin, { k: 0.25 });
    m.blob(`${n}j`, [5, y, 5.2], [6.7, y, 5.05], 0.72, 0.5, skin, { k: 0.15 });
    m.ell(`${n}j`, [5.9, y, 5.5], [1, 0.55, 0.14], '#2a0d08', { k: 0.03, em: 0 });
    m.ell(`${n}j`, [5.5, y, 5.46], [0.5, 0.32, 0.06], '#ff6a18', { k: 0.01, em: 1.6 });
    for (const sy of [1, -1]) { m.ell(n, [5.75, y + sy * 0.72, 6.92], [0.92, 0.34, 0.26], '#21171a', { k: 0.1 }); for (let t = 0; t < 4; t++) { m.spike(`${n}j`, [6.75 - t * 0.42, y + sy * (0.45 - t * 0.02), 5.4], [6.77 - t * 0.42, y + sy * (0.45 - t * 0.02), 6.05], 0.11, '#efe2c4', { sides: 3 }); m.spike(n, [6.85 - t * 0.42, y + sy * (0.5 - t * 0.02), 5.72], [6.87 - t * 0.42, y + sy * (0.5 - t * 0.02), 5.2], 0.1, '#efe2c4', { sides: 3 }); } }
    for (const sy of [1, -1]) {
      m.ball(n, [5.7, y + sy * 0.86, 6.55], 0.18, '#ffd040', { em: 3.4 });
      m.spike(n, [6.6, y + sy * 0.55, 5.45], [6.75, y + sy * 0.55, 4.8], 0.13, '#e6d8b8', { sides: 3 });
      m.spike(n, [4.8, y + sy * 0.8, 7.0], [3.4, y + sy * 1.7, 9.4], 0.42, '#2a2024', { bend: [-0.6, 0, 0.3], sides: 5 });
      m.spike(n, [4.2, y + sy * 0.9, 6.3], [2.4, y + sy * 2.3, 7.4], 0.32, '#2a2024', { bend: [-0.2, 0, 0.5], sides: 4 });
    }
  }
  // Spiked armour plates and steel bands.
  for (let i = 0; i < 6; i++) {
    const x = 2.6 - i * 1.25;
    m.spike('chest', [x, 0, 7.6 - i * 0.25], [x - 0.8, 0, 9.5 - i * 0.2], 0.5, '#2a2024', { sides: 4 });
    for (const y of [1, -1]) m.spike('chest', [x, y * 2.2, 6.9 - i * 0.3], [x - 0.7, y * 3.8, 8 - i * 0.3], 0.36, '#2a2024', { sides: 4 });
  }
  m.box('chest', [-0.1, 0, 4.6], [3.4, 6.6, 1.2], plate, { taper: 0.9 });
  for (const [s, y] of SIDES) {
    m.bone(`${s}fu`, 'chest', [2, y * 2.6, 4.6]); m.bone(`${s}fl`, `${s}fu`, [2.2, y * 3, 2.2]);
    m.bone(`${s}bu`, 'hips', [-3.4, y * 1.9, 3.6]); m.bone(`${s}bl`, `${s}bu`, [-2.5, y * 2.3, 2]);
    m.ell(`${s}fu`, [2, y * 2.9, 3.6], [1.4, 1, 2], skin, { k: 0.5 });
    m.blob(`${s}fl`, [2.2, y * 3, 2.4], [2.6, y * 3, 0.5], 0.9, 1, skin, { k: 0.3 });
    m.ell(`${s}bu`, [-3, y * 2.1, 3.3], [1.6, 1.1, 1.9], skin, { k: 0.5 });
    m.blob(`${s}bl`, [-2.5, y * 2.3, 2.2], [-2.2, y * 2.4, 0.5], 0.8, 0.85, skin, { k: 0.3 });
    for (let c = -1; c <= 1; c++) {
      m.spike(`${s}fl`, [3.3, y * 3 + c * 0.42, 0.42], [4.3, y * 3 + c * 0.52, 0.03], 0.18, '#d8ccb0', { sides: 3 });
      m.spike(`${s}bl`, [-1.4, y * 2.4 + c * 0.4, 0.42], [-0.4, y * 2.4 + c * 0.5, 0.03], 0.18, '#d8ccb0', { sides: 3 });
    }
  }
  m.blob('tail0', [-5, 0, 3.9], [-6.8, 0, 3.4], 1, 0.7, skin, { k: 0.3 });
  m.blob('tail1', [-6.8, 0, 3.4], [-8.3, 0, 2.9], 0.7, 0.4, skin, { k: 0.2 });
  m.blob('tail2', [-8.3, 0, 2.9], [-9.5, 0, 2.5], 0.4, 0.06, skin, { k: 0.1 });
  const built = m.build({ cell: 0.15, smooth: 1, ao: 1, aoReach: 1.2 });
  built.fire = fire;
  return built;
}

export function animateHound(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 8);
  const c = ease('c', s.cast ? 1 : 0, 7);
  const br = Math.sin(t * 1.8) * 0.03;
  for (const n of ['H1', 'H2']) {
    const off = n === 'H1' ? 0 : 1.3;
    p.r(`${n}n`, 0, br - 0.2 * c, 0.06 * Math.sin(t * 0.9 + off));
    p.r(n, 0, 0.05 * Math.sin(t * 1.1 + off) - 0.28 * c, 0.1 * Math.sin(t * 0.7 + off));
    p.r(`${n}j`, 0, 0.1 + 0.08 * Math.sin(t * 2.2 + off) + 0.5 * c, 0);
  }
  p.r('chest', 0, br, 0);
  for (let i = 0; i < 3; i++) p.r(`tail${i}`, 0, 0, 0.16 * Math.sin(t * 2 + i));
  if (walk > 0.01) {
    const w = t * 8, a = Math.sin(w) * walk * 0.6, b = Math.cos(w) * walk;
    p.r('Lfu', 0, -a, 0).r('Rbu', 0, -a, 0).r('Rfu', 0, a, 0).r('Lbu', 0, a, 0).r('Lfl', 0, Math.max(0, b) * 0.7, 0).r('Rbl', 0, Math.max(0, b) * 0.7, 0).r('Rfl', 0, Math.max(0, -b) * 0.7, 0).r('Lbl', 0, Math.max(0, -b) * 0.7, 0);
    p.o('hips', 0, 0, Math.abs(a) * 0.4);
  }
  p.evaluate();
}

export function houndFX(P, ctx) {
  // A burning mane along the back.
  const s = ctx.scale || 1;
  for (const [x, z] of [[2, 8.2], [0, 8.4], [-2, 7.6]]) { const q = toWorld(ctx.M, [x, 0, z]); emitFlame(P, q[0], q[1], q[2], 1.15 * s, FIRE, ctx.dt, 34); }
}

/** Garr: a mound of black boulders, gold-cuffed, lava in the cracks. */
export function buildGarr() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 3]); m.bone('mouth', 'body', [2.6, 0, 3.2]);
  const rocks = [[0, 0, 2.2, 3.4, 2.8, 2.5], [1.8, 1.6, 2, 2.1, 1.9, 1.9], [1.9, -1.7, 2, 2.2, 1.8, 2], [-1.7, 2, 1.6, 1.9, 1.8, 1.6], [-1.9, -1.9, 1.8, 2, 1.7, 1.8], [0.2, 0.4, 4.6, 1.9, 1.7, 1.8], [-1, -0.6, 4.2, 1.6, 1.4, 1.5], [1.5, 0, 3.9, 1.4, 1.2, 1.4], [-3.4, 0, 1.2, 1.4, 1.5, 1.2], [3.4, 0.6, 1.1, 1.2, 1.1, 1.1], [3.2, -2.2, 0.9, 1, 1, 0.9], [-0.4, 3.2, 1, 1.1, 1.1, 1], [0, -3.3, 1, 1.1, 1.1, 1]];
  rocks.forEach((r, i) => m.ell('body', [r[0], r[1], r[2]], [r[3], r[4], r[5]], i % 3 === 0 ? '#191517' : '#26201f', { k: 0.1 }));
  for (const [x, y, z, w] of [[1.8, 1.8, 1.6, 2.2], [1.9, -1.9, 1.6, 2.1], [-1.8, 2.1, 1.4, 1.9], [-2, -2, 1.4, 1.9], [0.2, 0.4, 3.9, 1.8]]) {
    m.lathe('body', [x, y, z - 0.42], [x, y, z + 0.42], [[w, 0], [w, 1]], '#c9a13e', { sides: 10, em: 0.08 });
  }
  m.ball('body', [2.75, 0.5, 3.5], 0.2, '#ffc030', { em: 4 }); m.ball('body', [2.75, -0.5, 3.5], 0.2, '#ffc030', { em: 4 });
  return m.build({ cell: 0.16, smooth: 1, ao: 1.1, aoReach: 1.6 });
}

/** Baron Geddon: a downward-pointed flame with floating gold-cuffed fists and no legs. */
export function buildGeddon() {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]); m.bone('body', 'root', [0, 0, 6]); m.bone('mouth', 'body', [2.4, 0, 9]);
  const c = '#ffd23f', c2 = '#ff8a1e';
  m.ell('body', [0, 0, 8.6], [3.3, 3.5, 3.2], c, { k: 1, em: 0.72 });
  m.blob('body', [0, 0, 7], [0, 0, 1.3], 2.9, 0.16, c2, { k: 0.9, em: 0.85 });
  m.ell('body', [2.6, 0, 9.3], [0.9, 1.7, 0.7], '#ff5a12', { k: 0.5, em: 1.1 });
  for (const [, y] of SIDES) {
    m.ball('body', [3.1, y * 0.9, 9.8], 0.3, '#fff0c0', { em: 6 });
    m.lathe('body', [0.2, y * 5.6, 8.2], [0.2, y * 7.1, 8.2], [[1.1, 0], [1.3, 0.5], [1.05, 1]], '#c9a13e', { sides: 8, em: 0.14 });
    m.ell('body', [0.2, y * 7.6, 7.4], [1.2, 1.05, 1.5], c2, { k: 0.6, em: 1 });
    for (let i = -1; i <= 1; i++) m.spike('body', [0.5 + i * 0.35, y * 7.6, 6.3], [0.6 + i * 0.7, y * 7.7, 4.4], 0.28, '#ffcf60', { em: 1.5, sides: 4 });
  }
  return m.build({ cell: 0.17, smooth: 1, ao: 0.1, aoReach: 1 });
}

export function animateFloat(p, s) {
  p.reset();
  const t = s.t;
  p.o('body', 0, 0, 0.3 * Math.sin(t * 1.3));
  p.r('body', 0, 0.05 * Math.sin(t * 0.7), s.t * (s.spin || 0));
  p.evaluate();
}

export function geddonFX(P, ctx) {
  const q = (x, y, z) => toWorld(ctx.M, [x, y, z]);
  for (const [x, y, z, sz] of [[0, 0, 11.2, 1.8], [0.5, 2, 10.6, 1], [0.5, -2, 10.6, 1], [0.2, 7.6, 5.5, 0.8], [0.2, -7.6, 5.5, 0.8]]) {
    const p = q(x, y, z); emitFlame(P, p[0], p[1], p[2], sz * (ctx.scale || 1), [8, 3.6, 0.6], ctx.dt, 30);
  }
}

/** Golemagg: a molten giant, red cracked hide, a pale shaggy mantle, heavy fists. */
export function buildGolemagg() {
  const m = new ModelBuilder();
  const hip = 4.8, chest = 8.4, neck = 11;
  bipedRig(m, { hip, chest, neck, sw: 4.2, armU: 3.4, armL: 3.2, hipW: 1.9, shoulderDrop: 0.6, armOut: 0.9, headUp: 0.1, lean: 0.6 });
  const red = '#9a2714', dark = '#4c130b';
  m.ell('spine', [0.1, 0, 7], [2.6, 3.3, 2.2], red, { k: 0.8 });
  m.ell('chest', [0.5, 0, 9.5], [2.9, 4, 2.2], red, { k: 0.7 });
  m.ell('hips', [0, 0, 4.9], [2.2, 2.9, 1.6], dark, { k: 0.7 });
  m.ell('head', [1.6, 0, 11.7], [1.45, 1.35, 1.45], red, { k: 0.5 });
  m.blob('head', [2.6, 0, 11.2], [3.3, 0, 10.9], 0.7, 0.45, dark, { k: 0.3 });
  for (const [s, y] of SIDES) {
    m.ball('head', [2.65, y * 0.72, 12.3], 0.2, '#ffc23a', { em: 4 });
    m.blob(`${s}up`, [0, y * 4.2, 10.3], [-0.1, y * 5, 7.2], 1.75, 1.3, red, { k: 0.45 });
    m.blob(`${s}lo`, [-0.1, y * 5, 7], [0.5, y * 5.5, 4.1], 1.3, 1.5, red, { k: 0.3 });
    m.ell(`${s}hand`, [0.6, y * 5.6, 3.2], [1.6, 1.5, 1.7], dark, { k: 0.3 });
    m.blob(`${s}th`, [0, y * 2, 4.7], [0.2, y * 2.1, 2.4], 1.75, 1.35, red, { k: 0.45 });
    m.blob(`${s}sh`, [0.2, y * 2.1, 2.4], [0.1, y * 2.1, 0.5], 1.35, 1.55, dark, { k: 0.3 });
    // Pale shaggy mantle over the shoulders.
    for (let i = 0; i < 8; i++) { const a = i * 0.42; m.spike('chest', [-0.5 - Math.sin(a) * 2, y * (1.6 + 0.42 * i), 11.2 - i * 0.05], [-1.4 - Math.sin(a) * 2.5, y * (2 + 0.5 * i), 12.6 + (i % 2) * 0.5 - i * 0.13], 0.7, '#d8c9a8', { sides: 4 }); }
  }
  for (let i = 0; i < 7; i++) m.spike('chest', [-0.6 - i * 0.2, (i - 3) * 0.75, 11.3], [-1.6 - i * 0.2, (i - 3) * 0.95, 13.4 - Math.abs(i - 3) * 0.2], 0.72, '#d8c9a8', { sides: 4 });
  return m.build({ cell: 0.16, smooth: 1, ao: 1, aoReach: 1.3 });
}

/** Ragnaros: white-hot torso rising from the lava, gold belt, horns, Sulfuras in his fist. */
export function buildRagnaros() {
  const m = new ModelBuilder();
  const chest = 11.5, neck = 16;
  bipedRig(m, { hip: 4, chest, neck, sw: 6.2, armU: 5, armL: 4.4, hipW: 2, shoulderDrop: 0.5, armOut: 1.5, headUp: 0, lean: 1 });
  const hot = '#ffcf52', core = '#ffe9a6', orange = '#ff7a1a', rock = '#5a1b0a';
  m.ell('chest', [0.8, 0, 12.5], [4.4, 6.2, 4.3], hot, { k: 1.2, em: 0.42 });
  m.ell('spine', [0.5, 0, 8.4], [3.4, 4.4, 3.2], orange, { k: 1.1, em: 0.5 });
  m.blob('hips', [0.2, 0, 7], [0.1, 0, 0], 3.5, 5.2, '#d84a10', { k: 1, em: 0.7 });
  m.ell('chest', [3.4, 0, 12.8], [1.5, 3.3, 2.4], core, { k: 0.9, em: 0.7 });
  m.ell('head', [2.6, 0, 17.2], [2.1, 1.95, 2.1], hot, { k: 0.8, em: 0.42 });
  m.blob('jaw', [4, 0, 16.1], [4.6, 0, 15.4], 1.4, 1, orange, { k: 0.45, em: 0.6 });
  m.box('spine', [0.5, 0, 7.6], [7.6, 9.8, 1.7], '#c49a38', { taper: 0.94, em: 0.25 });
  m.ball('spine', [4.3, 0, 7.6], 1.1, '#ff5a20', { em: 3.4 });
  m.box('head', [4.5, 0, 17.3], [0.5, 2.8, 0.34], '#1a0805', { em: 0 });
  for (const [s, y] of SIDES) {
    m.ball('head', [4.55, y * 0.82, 17.8], 0.42, '#ff2a10', { em: 6 });
    // Big white horns.
    m.tube('head', [[2.1, y * 1.5, 18.5], [1.9, y * 4.2, 20.6], [1.2, y * 5.8, 23.8], [0.6, y * 5.2, 26.4]], [0.95, 0.72, 0.4, 0.02], ['#f4efd8', '#f4efd8', '#fffbe6', '#ffffff'], { sides: 8, em: 0.45 });
    m.ell(`${s}up`, [0, y * 7.1, 15.4], [2.9, 2.4, 2.4], '#b84512', { k: 0.8, em: 0.8 });
    for (let i = 0; i < 4; i++) m.spike(`${s}up`, [-0.5, y * (6.4 + i * 0.7), 17.2], [-1.3, y * (6.9 + i * 0.95), 20.4 - i * 0.6], 0.7, '#d8c090', { sides: 4 });
    m.blob(`${s}up`, [0, y * 7.2, 15], [0, y * 7.7, 10.6], 2.05, 1.6, hot, { k: 0.5, em: 0.42 });
    m.blob(`${s}lo`, [0, y * 7.7, 10.4], [0.5, y * 8.2, 6.4], 1.55, 2, orange, { k: 0.4, em: 0.6 });
    m.lathe(`${s}lo`, [0.5, y * 8.2, 7.6], [0.5, y * 8.2, 6.2], [[2.3, 0], [2.4, 0.5], [2.3, 1]], '#c49a38', { sides: 9, em: 0.2 });
    m.ell(`${s}hand`, [0.6, y * 8.3, 5.2], [1.9, 1.75, 1.9], core, { k: 0.5, em: 0.7 });
  }
  // Sulfuras.
  m.tube('Rhand', [[0.6, -8.3, 0], [0.6, -8.3, 15]], 0.55, '#3b2d22', { sides: 7 });
  m.box('Rhand', [0.6, -8.3, 16.8], [4.4, 7.2, 4.4], '#ffb03a', { taper: 0.86, em: 1.7 });
  m.box('Rhand', [0.6, -8.3, 16.8], [4.9, 2, 4.9], '#3b2d22', {});
  const built = m.build({ cell: 0.26, smooth: 1, ao: 0.25, aoReach: 1 });
  return built;
}

export function ragnarosFX(P, ctx) {
  const s = ctx.scale || 1;
  for (const [x, y, z, sz] of [[2.3, 0, 19.9, 2.5], [0.6, 3, 18.2, 1.8], [0.6, -3, 18.2, 1.8], [-0.5, 6.6, 18.5, 1.6], [-0.5, -6.6, 18.5, 1.6], [0.5, 0, 16, 2.6], [0.6, -8.3, 20, 2]]) {
    const q = toWorld(ctx.M, [x, y, z]); emitFlame(P, q[0], q[1], q[2], sz * s, [8.5, 3.4, 0.55], ctx.dt, 38);
  }
}

export function animateRagnaros(p, s) {
  animateBiped(p, s);
  p.reset();
  const m = s.mem, t = s.t;
  const c = s.cast, k = c ? c.frac : 0;
  m.swing = (m.swing ?? 0) + ((c ? 1 : 0) - (m.swing ?? 0)) * Math.min(1, s.dt * 6);
  const v = m.swing * (k < 0.7 ? k / 0.7 : 1 - (k - 0.7) / 0.3 * 1.5);
  p.r('chest', 0, 0.05 * Math.sin(t * 1.1) + 0.2 * v, 0.06 * Math.sin(t * 0.6));
  p.r('head', 0, 0.04 * Math.sin(t * 0.9), 0.06 * Math.sin(t * 0.7));
  p.r('Lup', 0.1, 0.04 * Math.sin(t), 0).r('Llo', 0, -0.3, 0);
  p.r('Rup', -0.1, -0.15 - 2.4 * v, -0.3 * v).r('Rlo', 0, -0.25 - 0.3 * v, 0);
  p.evaluate();
}
