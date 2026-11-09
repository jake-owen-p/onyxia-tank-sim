// Which model each boss uses, and how it is painted and animated.

import { buildDragon, animateDragon } from './models/dragon.js';
import { buildFigure, animateFigure } from './models/figures.js';
import * as M from './models/moltencore.js';
import { animateBiped } from './models/biped.js';
import * as Naxx from './models/naxxramas.js';
import * as AQ from './models/ahnqiraj.js';
import * as ZG from './models/zulgurub.js';
import * as BWL from './models/blackwing.js';

function animateStill(p, s) { p.reset(); p.o('body', 0, 0, 0.1 * Math.sin(s.t * 1.2)); p.evaluate(); }

const dragonMat = { noise: 0.5, scales: 0.55, cracks: 0, rim: 0.32, paintF: 0.35, scaleF: 1.9, gloss: 0.28, crackF: 0.5 };

const hideMat = { noise: 0.42, scales: 0, cracks: 0, rim: 0.24, paintF: 0.9, scaleF: 1, gloss: 0.3, crackF: 0.6 };
const fireMat = { noise: 0.5, scales: 0.0, cracks: 0.9, rim: 0.3, paintF: 0.55, scaleF: 1, gloss: 0.2, crackF: 0.45, crackColor: [3.2, 0.9, 0.14] };
const flamewaker = (o) => () => ({ built: M.buildFlamewaker(o), animate: animateBiped, mat: { ...hideMat, scales: 0.32, scaleF: 2.4 }, scale: o.scale ?? 1, mouth: 'mouth', school: 'fire', height: 13, heroDist: 22 });
const REGISTRY = {
  'molten-core/lucifron': flamewaker({ skin: '#3b3f46', belly: '#a89a7e', spine: '#2a2c34', scale: 0.92 }),
  'molten-core/gehennas': flamewaker({ skin: '#7a4e96', belly: '#d8a668', spine: '#35286a', scale: 0.92 }),
  'molten-core/shazzrah': flamewaker({ skin: '#2d4488', belly: '#9fb2c8', spine: '#1f2a60', weapon: 'staff', scale: 0.95 }),
  'molten-core/sulfuron-harbinger': flamewaker({ skin: '#9c2f1a', belly: '#e0b070', spine: '#4a1a10', weapon: 'hammer', scale: 1 }),
  'molten-core/majordomo-executus': flamewaker({ skin: '#a33222', belly: '#f0c070', spine: '#d8b050', weapon: 'staff', eye: '#6fe0ff', scale: 1.05 }),
  'molten-core/magmadar': () => ({ built: M.buildCoreHound({}), animate: M.animateHound, mat: { ...fireMat, cracks: 0.45 }, scale: 1.05, mouth: 'mouth', school: 'fire', height: 9, heroDist: 22, fx: M.houndFX, glow: [2.8, 1, 0.2], glowR: 26 }),
  'molten-core/garr': () => ({ built: M.buildGarr(), animate: animateStill, mat: { ...fireMat, cracks: 1.2, rim: 0.1, crackF: 0.8 }, scale: 1.12, mouth: 'mouth', school: 'fire', height: 6.5, heroDist: 19, glow: [2.2, 0.7, 0.15], glowR: 22 }),
  'molten-core/baron-geddon': () => ({ built: M.buildGeddon(), animate: M.animateFloat, mat: { noise: 0.4, scales: 0, cracks: 0.6, rim: 0.2, paintF: 0.6, scaleF: 1, gloss: 0, crackF: 0.55, crackColor: [3.6, 1.5, 0.2] }, scale: 1.05, mouth: 'mouth', school: 'fire', height: 11, heroDist: 26, fx: M.geddonFX, glow: [2.6, 1.2, 0.26], glowR: 42 }),
  'molten-core/golemagg': () => ({ built: M.buildGolemagg(), animate: animateBiped, mat: { ...fireMat, rim: 0.2 }, scale: 1.1, mouth: 'mouth', school: 'fire', height: 13, heroDist: 26 }),
  'molten-core/ragnaros': () => ({ built: M.buildRagnaros(), animate: M.animateRagnaros, mat: { noise: 0.5, scales: 0, cracks: 0.9, rim: 0.1, paintF: 0.4, scaleF: 1, gloss: 0, crackF: 0.3, crackColor: [2.2, 0.7, 0.1] }, scale: 1.05, mouth: 'mouth', school: 'fire', height: 25, heroDist: 34, portraitDist: 21, focusBone: 'neck', fx: M.ragnarosFX, glow: [3.6, 1.6, 0.4], glowR: 70 }),
  'onyxia/onyxia': () => ({
    built: buildDragon({ colors: { skin: '#2a2034', belly: '#4f3f5e', wing: '#2f1d48', wingBone: '#211826', spike: '#5a5064', horn: '#6d6470', eye: '#ffb02a' }, neck: 1, bulk: 1, horns: 0.95 }),
    animate: animateDragon, mat: dragonMat, scale: 1.0, mouth: 'mouth', school: 'fire', height: 12, focus: 'head', portraitDist: 8,
  }),
};

export function makeBossModel(raidId, bossId) {
  const key = `${raidId}/${bossId}`;
  const f = REGISTRY[key] || Naxx.BOSSES[key] || AQ.BOSSES[key] || ZG.BOSSES[key] || BWL.BOSSES[key];
  if (f) return f();
  // Not modelled yet: an oversized armoured figure.
  return { built: buildFigure({ family: 'plate', colors: { main: '#5a4a6a', trim: '#b89a4a', under: '#2f2640' }, weapon: 'two', cell: 0.05 }), animate: figureAdapter, mat: { noise: 0.4, scales: 0, cracks: 0, rim: 0.3, paintF: 2, scaleF: 1, gloss: 0.3, crackF: 1 }, scale: 3.6, mouth: 'head', school: 'physical', height: 8, focus: 'head', portraitDist: 3 };
}

function figureAdapter(p, s) {
  animateFigure(p, { t: s.t, moving: s.moving, phase: 0, attack: 0, cast: s.cast ? Math.min(1, s.cast.frac) : 0 });
}

const addCache = new Map();
const REGISTRY_ADDS = {};
/** Adds: small models chosen per boss. */
export function makeAddModel(raidId, bossId) {
  const custom = Naxx.ADDS[`${raidId}/${bossId}`] || AQ.ADDS[`${raidId}/${bossId}`] || ZG.ADDS[`${raidId}/${bossId}`] || BWL.ADDS[`${raidId}/${bossId}`] || REGISTRY_ADDS[`${raidId}/${bossId}`];
  if (custom) return custom();
  const key = 'whelp';
  if (!addCache.has(key)) addCache.set(key, { built: buildDragon({ cell: 0.3, colors: { skin: '#5a3a26', belly: '#c08a4a', wing: '#8a4a26', wingBone: '#4a2a1a', spike: '#c8a878', horn: '#c8a878', eye: '#ffd040' }, noMembrane: false }), animate: animateDragon, mat: { ...dragonMat, scales: 0.2 }, scale: 0.13 });
  void raidId; void bossId;
  return addCache.get(key);
}
