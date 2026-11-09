// Blackwing Lair. Dragons share the dragon body with very different colouring;
// Razorgore and the Broodlord stand upright; Chromaggus is a spined, two-headed brute.

import { ModelBuilder } from '../model.js';
import { SCHOOLS, emitFlame } from '../fx.js';
import { bipedRig, animateBiped, SIDES } from './biped.js';
import { buildDragon, animateDragon } from './dragon.js';
import { buildCoreHound, animateHound } from './moltencore.js';

const dragonMat = { noise: 0.5, scales: 0.55, cracks: 0, rim: 0.3, paintF: 0.35, scaleF: 1.9, gloss: 0.28, crackF: 0.5 };
const hide = { noise: 0.45, scales: 0.3, cracks: 0, rim: 0.26, paintF: 0.8, scaleF: 2.6, gloss: 0.3, crackF: 0.6 };
const toWorld = (M, p) => [M[0] * p[0] + M[4] * p[1] + M[12], M[1] * p[0] + M[5] * p[1] + M[13], M[10] * p[2] + M[14]];

/** A simple three-fingered bat wing on an upright body. */
function addWings(m, chestBone, z, span, membrane, boneCol) {
  for (const [s, y] of SIDES) {
    m.bone(`${s}wing`, chestBone, [-1, y * 2, z]);
    const S = [-1, y * 2, z], E = [-3.4, y * (2 + span * 0.42), z + span * 0.34];
    const tips = [[-5.6, y * (2 + span), z + span * 0.62], [-7.8, y * (2 + span * 0.84), z - span * 0.08], [-7.2, y * (2 + span * 0.45), z - span * 0.55]];
    m.tube(`${s}wing`, [S, E], [0.45, 0.32], boneCol, { sides: 6 });
    tips.forEach((t) => m.tube(`${s}wing`, [E, t], [0.26, 0.04], boneCol, { sides: 5 }));
    m.spike(`${s}wing`, E, [E[0] + 0.8, E[1] + y * 0.2, E[2] + 1.8], 0.3, '#d8ccb0', { sides: 4 });
    const bones = [`${s}wing`, `${s}wing`];
    m.membrane([E, tips[0]], [E, tips[1]], bones, bones, membrane, { fade: 0.2, steps: 3 });
    m.membrane([E, tips[1]], [E, tips[2]], bones, bones, membrane, { fade: 0.2, steps: 3 });
    m.membrane([E, tips[2]], [S, [-3.4, y * 2.2, z - span * 0.52]], bones, bones, membrane, { fade: 0.12, steps: 2 });
  }
}

function buildRazorgore() {
  const m = new ModelBuilder();
  const hip = 4.6, chest = 7.8, neck = 9.8;
  bipedRig(m, { hip, chest, neck, sw: 3.3, armU: 2.9, armL: 2.6, hipW: 1.6, shoulderDrop: 0.6, armOut: 0.7, headUp: 0.1, lean: 0.8 });
  const hideCol = '#2a1f1c', belly = '#d98a2a', pale = '#efe6d2';
  m.ell('chest', [0.5, 0, 8], [2.7, 3.3, 2.3], hideCol, { k: 0.8 });
  m.ell('spine', [0.2, 0, 6], [2.2, 2.7, 2.1], hideCol, { k: 0.8 });
  m.ell('chest', [1.6, 0, 7.7], [1.5, 2.4, 2.1], belly, { k: 0.5 });
  m.ell('spine', [1.45, 0, 5.8], [1.25, 2, 1.9], belly, { k: 0.5 });
  m.ell('hips', [0.1, 0, 4.4], [2, 2.5, 1.4], hideCol, { k: 0.7 });
  m.blob('neck', [0.6, 0, 9.6], [1.1, 0, 10.5], 1.15, 0.9, hideCol, { k: 0.4 });
  m.ell('head', [1.6, 0, 11], [1.15, 0.95, 0.8], hideCol, { k: 0.35 });
  m.blob('head', [2.4, 0, 10.8], [3.7, 0, 10.5], 0.62, 0.34, hideCol, { k: 0.25 });
  for (const [s, y] of SIDES) {
    m.ball('head', [2.55, y * 0.62, 11.3], 0.16, '#ffd040', { em: 3.2 });
    m.spike('head', [1.2, y * 0.6, 11.5], [-0.3, y * 1.6, 12.4], 0.26, pale, { bend: [0, 0, 0.3], sides: 5 });
    m.blob(`${s}up`, [0, y * 3.3, 9.2], [-0.1, y * 4, 6.3], 1.25, 1, hideCol, { k: 0.4 });
    m.blob(`${s}lo`, [-0.1, y * 4, 6.1], [0.4, y * 4.5, 3.6], 1, 1.25, hideCol, { k: 0.3 });
    for (const zz of [5.4, 4.6, 3.8]) m.lathe(`${s}lo`, [0.3, y * 4.3, zz - 0.3], [0.3, y * 4.3, zz + 0.3], [[1.42, 0], [1.42, 1]], zz > 5 ? pale : '#b8502a', { sides: 9 });
    for (let c = -1; c <= 1; c++) m.spike(`${s}hand`, [0.8, y * 4.5 + c * 0.42, 2.7], [1.8, y * 4.5 + c * 0.55, 1.5], 0.24, pale, { sides: 4, bend: [0.1, 0, -0.2] });
    m.blob(`${s}th`, [0, y * 1.7, 4.5], [0.3, y * 1.9, 2.4], 1.4, 1.05, hideCol, { k: 0.4 });
    m.blob(`${s}sh`, [0.3, y * 1.9, 2.4], [0.1, y * 1.9, 0.4], 1.05, 1.15, hideCol, { k: 0.3 });
    for (let c = -1; c <= 1; c++) m.spike(`${s}sh`, [1, y * 1.9 + c * 0.42, 0.4], [2.1, y * 1.9 + c * 0.55, 0.02], 0.2, pale, { sides: 4 });
  }
  addWings(m, 'chest', 9.3, 9, '#a85a1f', '#2a1f1c');
  const built = m.build({ cell: 0.14, smooth: 1, ao: 1, aoReach: 1.2 });
  return built;
}
function razorFlame(P, ctx) { const q = toWorld(ctx.M, [1.2, 0, 12.2]); emitFlame(P, q[0], q[1], q[2], 1.3 * (ctx.scale || 1), SCHOOLS.fire, ctx.dt, 36); }

function buildBroodlord() {
  const m = new ModelBuilder();
  const hip = 3.8, chest = 6.5, neck = 8.1;
  bipedRig(m, { hip, chest, neck, sw: 3.1, armU: 2.4, armL: 2.1, hipW: 1.5, shoulderDrop: 0.4, armOut: 0.7, headUp: 0.05, lean: 0.5 });
  const skin = '#6a6a72', gold = '#c8a24a', purple = '#6a1f5a', dark = '#2a2228';
  m.ell('chest', [0.3, 0, 6.8], [2.3, 3, 1.9], dark, { k: 0.5 });
  m.ell('spine', [0.1, 0, 5], [1.9, 2.5, 1.7], purple, { k: 0.6 });
  m.ell('hips', [0, 0, 3.8], [1.8, 2.3, 1.1], dark, { k: 0.5 });
  m.ell('head', [0.9, 0, 9], [1, 0.9, 0.75], skin, { k: 0.35 });
  m.blob('head', [1.6, 0, 8.8], [2.9, 0, 8.6], 0.55, 0.3, skin, { k: 0.2 });
  m.blob('neck', [0.3, 0, 8], [0.8, 0, 8.8], 0.8, 0.7, skin, { k: 0.3 });
  // Gold breastplate and the flaring pauldrons that define him.
  m.box('chest', [2, 0, 7.2], [0.5, 3.2, 2.2], gold, { taper: 0.7 });
  m.ball('chest', [2.4, 0, 7.1], 0.5, '#ffb030', { em: 2.2 });
  for (const [s, y] of SIDES) {
    m.ball('head', [1.75, y * 0.56, 9.3], 0.13, '#ffd040', { em: 3.2 });
    m.spike('head', [0.4, y * 0.5, 9.6], [-1.7, y * 1.6, 11.8], 0.3, '#b7b0b8', { bend: [0, 0, 0.3], sides: 5 });
    m.spike('head', [0.7, y * 0.2, 9.7], [-0.2, y * 0.5, 11.9], 0.26, '#b7b0b8', { sides: 5 });
    m.ell('chest', [0.1, y * 3.3, 8.2], [1.9, 1.5, 1], gold, { k: 0.1 });
    m.spike('chest', [0, y * 4.1, 8.5], [-0.8, y * 6.8, 10.3], 0.75, gold, { sides: 5 });
    m.blob(`${s}up`, [0, y * 3.2, 7.7], [-0.1, y * 3.8, 5.4], 1, 0.82, skin, { k: 0.35 });
    m.blob(`${s}lo`, [-0.1, y * 3.8, 5.2], [0.4, y * 4.2, 3.1], 0.82, 0.8, skin, { k: 0.25 });
    m.lathe(`${s}lo`, [0.2, y * 4, 4.5], [0.3, y * 4.1, 3.7], [[0.98, 0], [1, 0.5], [0.95, 1]], gold, { sides: 9 });
    m.ell(`${s}hand`, [0.5, y * 4.3, 2.5], [0.8, 0.75, 0.85], skin, { k: 0.2 });
    m.blob(`${s}th`, [0, y * 1.6, 3.8], [0.3, y * 1.8, 2], 1.15, 0.9, dark, { k: 0.3 });
    m.blob(`${s}sh`, [0.3, y * 1.8, 2], [0.1, y * 1.8, 0.4], 0.9, 1.05, dark, { k: 0.3 });
    m.box(`${s}sh`, [0.9, y * 1.8, 1.4], [0.5, 1.5, 1.8], gold, { taper: 0.8 });
  }
  addWings(m, 'chest', 7.8, 5.5, '#4c3a2c', '#2a2228');
  return m.build({ cell: 0.13, smooth: 1, ao: 1, aoReach: 1 });
}

function buildChromaggus() {
  const built = buildCoreHound({ skin: '#2a2f58', plate: '#b08a3a', fire: false });
  return built;
}
function chromaSpikes(P, ctx) { void P; void ctx; }

const drake = (colors, o = {}, scale = 0.88, extra = {}) => () => ({ built: buildDragon({ colors, neck: 1, bulk: 1, ...o }), animate: animateDragon, mat: dragonMat, scale, mouth: 'mouth', school: extra.school || 'fire', height: 13, heroDist: 34, ...extra });

export const BOSSES = {
  'blackwing-lair/razorgore': () => ({ built: buildRazorgore(), animate: animateBiped, mat: hide, scale: 1.05, mouth: 'mouth', school: 'fire', height: 12, heroDist: 24, fx: razorFlame }),
  'blackwing-lair/vaelastrasz': drake({ skin: '#a33d1c', belly: '#e6b98a', wing: '#d9c9a2', wingBone: '#7a2a14', spike: '#e6b98a', horn: '#e6d3a8', eye: '#ffe07a', mouth: '#ff5a1a', claw: '#e6d3a8' }, { horns: 1.15, spines: 0.9 }, 0.92, { glow: [1, 0.36, 0.1], glowR: 22 }),
  'blackwing-lair/broodlord-lashlayer': () => ({ built: buildBroodlord(), animate: animateBiped, mat: { ...hide, scales: 0.16, gloss: 0.55 }, scale: 1.1, mouth: 'mouth', school: 'physical', height: 11, heroDist: 21 }),
  'blackwing-lair/firemaw': drake({ skin: '#2b1e19', belly: '#b05a22', wing: '#c0651c', wingBone: '#2b1e19', spike: '#c98a3a', horn: '#d8a83a', eye: '#ffc03a', mouth: '#ff7020' }, { spines: 1.1 }, 0.82),
  'blackwing-lair/ebonroc': drake({ skin: '#16151c', belly: '#4a4a55', wing: '#34323e', wingBone: '#0e0e14', spike: '#7a7a88', horn: '#8a8a98', eye: '#a0e070', mouth: '#70c040' }, { spines: 1.2, horns: 1.1 }, 0.82, { school: 'shadow' }),
  'blackwing-lair/flamegor': drake({ skin: '#4a1a18', belly: '#c23a1c', wing: '#7a1e1c', wingBone: '#2a0e0e', spike: '#d8522a', horn: '#d8822a', eye: '#ffb03a', mouth: '#ff4a1a' }, { spines: 1.1 }, 0.82, { glow: [1.2, 0.3, 0.1], glowR: 20 }),
  'blackwing-lair/chromaggus': () => ({ built: buildChromaggus(), animate: animateHound, mat: { ...hide, scales: 0.46 }, scale: 1.2, mouth: 'mouth', school: 'arcane', height: 9.5, heroDist: 23, fx: chromaSpikes }),
  'blackwing-lair/nefarian': drake({ skin: '#120f12', belly: '#6a5636', wing: '#7a6a3c', wingBone: '#14110e', spike: '#3a3226', horn: '#d4b44a', eye: '#ff3a2a', mouth: '#ff5a2a', claw: '#d4b44a' }, { neck: 1.12, horns: 1.45, wingspan: 1.12, bulk: 1.05, spines: 1.15 }, 1.02, { school: 'shadow', height: 14, heroDist: 38, glow: [0.9, 0.2, 0.1], glowR: 18 }),
};

export const ADDS = {};
