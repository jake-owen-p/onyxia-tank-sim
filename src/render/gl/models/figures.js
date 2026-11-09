// Player and raid members: small bipeds sculpted in the blocky proportions of
// the game's characters, with armour by class family and weapons by role.

import { ModelBuilder } from '../model.js';

const SKIN = { human: '#c9a07f', orc: '#5e7a3a', night: '#6f5a9a', undead: '#8a8f7a' };

function skeleton(m) {
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [0, 0, 1.0]);
  m.bone('spine', 'hips', [0, 0, 1.12]);
  m.bone('chest', 'spine', [0, 0, 1.38]);
  m.bone('head', 'chest', [0, 0, 1.72]);
  for (const [s, y] of [['L', 1], ['R', -1]]) {
    m.bone(`${s}arm`, 'chest', [0, y * 0.34, 1.58]);
    m.bone(`${s}fore`, `${s}arm`, [0, y * 0.40, 1.27]);
    m.bone(`${s}hand`, `${s}fore`, [0.07, y * 0.42, 1.02]);
    m.bone(`${s}leg`, 'hips', [0, y * 0.15, 0.98]);
    m.bone(`${s}shin`, `${s}leg`, [0.02, y * 0.17, 0.54]);
  }
  m.bone('cape', 'chest', [-0.15, 0, 1.6]);
}

/**
 * family: plate | mail | leather | cloth; weapon: sword|shield|two|staff|bow|dagger|none.
 * colours: { main, trim, under, skin, hair }.
 */
export function buildFigure({ family = 'plate', weapon = 'none', colors, cape = null, cell = 0.05, helm = true }) {
  const m = new ModelBuilder();
  skeleton(m);
  const c = { main: '#7a7f8c', trim: '#c6a24a', under: '#3a3030', skin: SKIN.human, hair: '#4a3020', ...colors };
  const bulk = family === 'plate' ? 1.22 : family === 'mail' ? 1.1 : family === 'leather' ? 1 : 0.94;
  // Torso, big-shouldered as Warcraft characters are.
  m.ell('chest', [0, 0, 1.46], [0.2 * bulk, 0.32 * bulk, 0.26], c.main, { k: 0.08 });
  m.ell('spine', [0, 0, 1.2], [0.17 * bulk, 0.25 * bulk, 0.2], c.under, { k: 0.08 });
  m.ell('hips', [0, 0, 1.02], [0.17, 0.25, 0.16], family === 'cloth' ? c.main : c.under, { k: 0.08 });
  // Head.
  m.ell('head', [0.02, 0, 1.86], [0.15, 0.13, 0.17], c.skin, { k: 0.04 });
  if (family === 'cloth' || !helm) m.ell('head', [-0.03, 0, 1.92], [0.15, 0.145, 0.15], c.hair, { k: 0.04 });
  for (const [s, y] of [['L', 1], ['R', -1]]) {
    m.blob(`${s}arm`, [0, y * 0.36, 1.56], [0, y * 0.41, 1.28], 0.095 * bulk, 0.08 * bulk, c.main, { k: 0.05 });
    m.blob(`${s}fore`, [0, y * 0.41, 1.26], [0.06, y * 0.43, 1.03], 0.08 * bulk, 0.06, family === 'cloth' ? c.main : c.under, { k: 0.04 });
    m.ell(`${s}hand`, [0.08, y * 0.43, 0.97], [0.06, 0.05, 0.075], family === 'plate' ? c.main : c.skin, { k: 0.02 });
    m.blob(`${s}leg`, [0, y * 0.15, 0.96], [0.02, y * 0.17, 0.56], 0.125 * bulk, 0.09 * bulk, family === 'cloth' ? c.main : c.under, { k: 0.05 });
    m.blob(`${s}shin`, [0.02, y * 0.17, 0.54], [0, y * 0.17, 0.12], 0.09 * bulk, 0.08 * bulk, family === 'plate' ? c.main : c.under, { k: 0.04 });
    m.ell(`${s}shin`, [0.08, y * 0.17, 0.06], [0.17, 0.085, 0.07], family === 'cloth' ? c.under : c.main, { k: 0.03 });
    if (family === 'plate' || family === 'mail') {
      // Pauldrons are the Warcraft silhouette.
      const r = family === 'plate' ? 0.2 : 0.15;
      m.ell('chest', [0, y * 0.4, 1.6], [r, r, r * 0.8], c.trim, { k: 0.03 });
      if (family === 'plate') m.spike('chest', [0, y * 0.46, 1.72], [-0.02, y * 0.56, 1.98], 0.05, c.trim);
    }
  }
  if (family === 'cloth') {
    // A long robe skirt.
    m.lathe('hips', [0, 0, 0.06], [0, 0, 1.02], [[0.36, 0], [0.32, 0.25], [0.26, 0.6], [0.2, 1]], c.main, { sides: 9 });
    m.box('hips', [0.19, 0, 0.5], [0.03, 0.14, 0.9], c.trim, {});
  }
  m.box('hips', [0, 0, 1.04], [0.32, 0.5 * bulk, 0.07], c.trim, {});
  if (helm && family !== 'cloth') {
    m.lathe('head', [0, 0, 1.8], [0, 0, 2.08], [[0.18, 0], [0.17, 0.45], [0.1, 0.9], [0.005, 1]], c.main, { sides: 8 });
    m.box('head', [0.13, 0, 1.87], [0.06, 0.2, 0.05], c.trim, {});
  }
  if (cape) {
    m.membrane([[-0.2, 0.2, 1.62], [-0.27, 0.17, 1.12], [-0.32, 0.14, 0.55]], [[-0.2, -0.2, 1.62], [-0.27, -0.17, 1.12], [-0.32, -0.14, 0.55]], ['cape', 'cape', 'cape'], ['cape', 'cape', 'cape'], cape, { fade: 0.35 });
  }
  // Weapons sit in the hands.
  const blade = '#d6dee8', grip = '#5a4028', gold = '#d0a848';
  if (weapon === 'sword' || weapon === 'shield' || weapon === 'two' || weapon === 'dagger') {
    const len = weapon === 'two' ? 1.25 : weapon === 'dagger' ? 0.5 : 0.85;
    m.box('Rhand', [0.1, -0.43, 0.97], [0.05, 0.05, 0.22], grip, {});
    m.box('Rhand', [0.1, -0.43, 1.08], [0.05, 0.26, 0.05], gold, {});
    m.tube('Rhand', [[0.1, -0.43, 1.1], [0.1, -0.43, 1.1 + len * 0.85], [0.1, -0.43, 1.1 + len]], [0.055, 0.05, 0.005], blade, { sides: 4, flatten: 1 });
  }
  if (weapon === 'dagger') m.tube('Lhand', [[0.1, 0.43, 1.0], [0.1, 0.43, 1.42]], [0.05, 0.005], blade, { sides: 4 });
  if (weapon === 'shield') {
    m.lathe('Lfore', [0.16, 0.5, 1.15], [0.28, 0.54, 1.15], [[0.34, 0], [0.32, 0.5], [0.1, 1]], c.trim, { sides: 7 });
    m.ball('Lfore', [0.27, 0.54, 1.15], 0.07, gold, { em: 0.12 });
  }
  if (weapon === 'staff') {
    m.tube('Rhand', [[0.1, -0.43, 0.2], [0.1, -0.43, 2.05]], [0.035, 0.03], grip, { sides: 5 });
    m.ball('Rhand', [0.1, -0.43, 2.14], 0.09, c.trim, { em: 1.6 });
  }
  if (weapon === 'bow') {
    m.tube('Lhand', [[0.16, 0.43, 0.42], [0.3, 0.43, 0.97], [0.16, 0.43, 1.54]], [0.018, 0.04, 0.018], '#6a4a26', { sides: 4 });
    m.tube('Lhand', [[0.16, 0.43, 0.42], [0.16, 0.43, 1.54]], 0.005, '#d8d8c8', { sides: 3 });
  }
  return m.build({ cell, smooth: 1, ao: 0.8, aoReach: 0.35 });
}

/** Run, idle, swing and cast loops. state: { t, moving, phase, attack (0..1), cast (0..1), feared, jump } */
export function animateFigure(p, s) {
  p.reset();
  const t = s.t + (s.phase || 0);
  if (s.moving) {
    const w = t * 11, a = Math.sin(w), b = Math.cos(w);
    p.r('Lleg', 0, -a * 0.8, 0).r('Rleg', 0, a * 0.8, 0);
    p.r('Lshin', 0, Math.max(0, -b) * 1.15, 0).r('Rshin', 0, Math.max(0, b) * 1.15, 0);
    p.r('Larm', 0, a * 0.7, 0).r('Rarm', 0, -a * 0.7, 0);
    p.r('Lfore', 0, -0.5, 0).r('Rfore', 0, -0.5, 0);
    p.r('spine', 0, 0.14, Math.sin(w) * 0.08);
    p.o('hips', 0, 0, Math.abs(b) * 0.05);
    p.r('cape', 0, -0.5 - 0.12 * Math.abs(a), 0);
  } else {
    const br = Math.sin(t * 1.7) * 0.022;
    p.r('chest', 0, br, 0).r('Larm', 0.06, br, 0).r('Rarm', -0.06, br, 0);
    p.r('Lfore', 0, -0.25, 0).r('Rfore', 0, -0.25, 0);
    p.r('cape', 0, br * 2, 0);
  }
  if (s.attack > 0) {
    const k = Math.sin(s.attack * Math.PI);
    p.r('Rarm', 0, -2.1 * k, -0.3 * k).r('Rfore', 0, -0.5 * k, 0).r('chest', 0, 0.12 * k, -0.35 * k);
  }
  if (s.cast > 0) {
    const k = Math.min(1, s.cast * 3);
    p.r('Rarm', 0, -2.4 * k, 0.2 * k).r('Larm', 0, -2.4 * k, -0.2 * k).r('Rfore', 0, -0.4 * k, 0).r('Lfore', 0, -0.4 * k, 0);
    p.r('head', 0, -0.15 * k, 0);
  }
  if (s.feared) p.r('Larm', 0, -2.6, 0).r('Rarm', 0, -2.6, 0);
  if (s.jump > 0) p.r('Lleg', 0, -0.7, 0).r('Rleg', 0, 0.2, 0).r('Lshin', 0, 1.2, 0).r('Rshin', 0, 0.7, 0);
  p.evaluate();
}

export const RAID_LOOKS = [
  { family: 'plate', colors: { main: '#8b6b3e', trim: '#b8b0a0', under: '#463426' }, weapon: 'two' },        // warrior
  { family: 'plate', colors: { main: '#d6a8c8', trim: '#ecd28a', under: '#6a4a68' }, weapon: 'sword', cape: '#d68ab0' }, // paladin
  { family: 'leather', colors: { main: '#c9b24a', trim: '#6a5a24', under: '#3c3420', hair: '#222' }, weapon: 'dagger', melee: true }, // rogue
  { family: 'leather', colors: { main: '#c86f2c', trim: '#6a3a1a', under: '#3a2a18', hair: '#2a4a1a' }, weapon: 'staff', melee: true },   // druid
  { family: 'mail', colors: { main: '#7f9a4a', trim: '#c8c47a', under: '#3f4a26' }, weapon: 'bow' },          // hunter
  { family: 'mail', colors: { main: '#2f6fc0', trim: '#d0d8e8', under: '#20355a' }, weapon: 'staff' },        // shaman
  { family: 'cloth', colors: { main: '#58b6e0', trim: '#e6f4ff', under: '#2a4a70', hair: '#d8c070' }, weapon: 'staff', cape: null }, // mage
  { family: 'cloth', colors: { main: '#e6e0d0', trim: '#c8a44a', under: '#807868', hair: '#6a4020' }, weapon: 'staff' }, // priest
  { family: 'cloth', colors: { main: '#7a4fb0', trim: '#c2a0f0', under: '#2c1c44', hair: '#201018' }, weapon: 'staff' }, // warlock
];

export function playerLook(role) {
  switch (role) {
    case 'mt': case 'tank': return { family: 'plate', colors: { main: '#6c7f9c', trim: '#d2ad52', under: '#39465c' }, weapon: 'shield', cape: '#2a4a8c' };
    case 'offtank': return { family: 'plate', colors: { main: '#8a5a44', trim: '#d2ad52', under: '#4a3226' }, weapon: 'shield', cape: '#7a2a24' };
    case 'melee': return { family: 'leather', colors: { main: '#b8862e', trim: '#d8d0b8', under: '#42301c', hair: '#201818' }, weapon: 'dagger', cape: '#30303a' };
    case 'ranged': return { family: 'cloth', colors: { main: '#3f74c8', trim: '#e6e0f8', under: '#22345c', hair: '#d0b070' }, weapon: 'staff', cape: null };
    case 'healer': return { family: 'cloth', colors: { main: '#e6dcbe', trim: '#d2ad52', under: '#6a6250', hair: '#6a4426' }, weapon: 'staff', cape: '#c8b880' };
    default: return { family: 'plate', colors: {}, weapon: 'sword' };
  }
}
