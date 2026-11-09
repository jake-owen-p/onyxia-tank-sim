// The look of each zone: painted surfaces, light, fog, what stands in the room.
// Colours follow screenshots of the real instances: Molten Core is near-black
// rock lit from below by lava; Naxxramas is violet brick; the Temple is hive
// flesh over orange sand; Zul'Gurub is green jungle light.

const CAVE_ONYXIA = {
  floor: { kind: 1, a: '#2b2428', b: '#463b3e', c: '#5e3a28', scale: 0.11 }, wall: { kind: 1, a: '#2a2223', b: '#46383a', c: '#120c0e', scale: 0.07 },
  bump: 2.0, ambUp: [0.20, 0.13, 0.20], ambDown: [0.16, 0.07, 0.05], key: [0.30, 0.42, 0.70], keyCol: [0.42, 0.34, 0.42], fog: [0.030, 0.012, 0.024], fogD: 0.0105,
  dome: true, glow: [1.4, 0.36, 0.06], glowB: [3.2, 1.1, 0.18], grade: [1.03, 0.98, 1.0], exposure: 1.2, domeGlow: 0.4,
  lights: 'torches', torchCol: [5.6, 2.3, 0.7], props: ['stalagmites', 'eggs'], ambient: 'embers', wallStyle: 'rock', wallMult: 2.2,
};

export const THEMES = {
  onyxia: CAVE_ONYXIA,
  'molten-core': {
    floor: { kind: 1, a: '#231a18', b: '#3c2b24', c: '#100a09', scale: 0.08 }, wall: { kind: 1, a: '#2c1b18', b: '#4a2b22', c: '#0d0706', scale: 0.06 },
    bump: 2.6, ambUp: [0.13, 0.055, 0.09], ambDown: [0.34, 0.10, 0.03], key: [0.2, 0.3, 0.8], keyCol: [0.26, 0.13, 0.11], fog: [0.075, 0.016, 0.012], fogD: 0.0088,
    dome: true, glow: [1.15, 0.2, 0.025], glowB: [2.3, 0.72, 0.09], grade: [1.06, 0.97, 0.95], exposure: 1.15,
    outer: 'lava', lights: 'lavaGlow', torchCol: [7, 2.4, 0.5], props: ['stalagmites', 'lavaVents'], ambient: 'embers', wallStyle: 'rock', wallMult: 2.4, domeGlow: 1.0,
  },
  'blackwing-lair': {
    floor: { kind: 5, a: '#39322f', b: '#5a4b40', c: '#8a6a35', scale: 0.075 }, wall: { kind: 2, a: '#3a2f2c', b: '#5a4640', c: '#6a4b2a', scale: 0.11 },
    bump: 1.7, ambUp: [0.30, 0.18, 0.15], ambDown: [0.18, 0.09, 0.06], key: [-0.35, 0.3, 0.72], keyCol: [0.75, 0.46, 0.28], fog: [0.075, 0.035, 0.02], fogD: 0.0072,
    dome: false, glow: [2.2, 0.55, 0.14], glowB: [5, 1.7, 0.3], grade: [1.05, 0.98, 0.95], exposure: 1.3,
    lights: 'torches', torchCol: [6, 2.8, 0.8], props: ['pillars', 'banners', 'braziers'], ambient: 'embers', wallStyle: 'block', wallMult: 2.1, banner: ['#6b1414', '#caa24a'],
  },
  'zul-gurub': {
    floor: { kind: 6, a: '#3c4a1f', b: '#61622b', c: '#5d4a2c', scale: 0.1 }, wall: { kind: 2, a: '#4c5a3c', b: '#71734f', c: '#2f4a1f', scale: 0.1 },
    bump: 1.5, ambUp: [0.46, 0.60, 0.36], ambDown: [0.15, 0.20, 0.08], key: [0.45, 0.2, 0.86], keyCol: [1.35, 1.2, 0.72], fog: [0.27, 0.40, 0.25], fogD: 0.0078,
    sky: ['#9fc98c', '#35663c'], dome: false, glow: [1.8, 0.8, 0.2], glowB: [4, 2, 0.5], grade: [1.0, 1.03, 0.95], exposure: 1.1,
    outer: 'jungle', lights: 'torches', torchCol: [4, 2.2, 0.8], props: ['trees', 'totems', 'braziers'], ambient: 'motes', wallStyle: 'block', wallMult: 1.6,
  },
  'ruins-of-ahnqiraj': {
    floor: { kind: 3, a: '#8f6a40', b: '#b58f5c', c: '#6a4a2c', scale: 0.05 }, wall: { kind: 2, a: '#8c6f4a', b: '#b89568', c: '#5a4a35', scale: 0.09 },
    bump: 1.2, ambUp: [0.62, 0.52, 0.50], ambDown: [0.40, 0.25, 0.14], key: [0.55, -0.3, 0.75], keyCol: [1.35, 1.12, 0.82], fog: [0.62, 0.42, 0.25], fogD: 0.0058,
    sky: ['#d9a26a', '#7a4c55'], dome: false, glow: [1.6, 0.9, 0.25], glowB: [3, 2, 0.6], grade: [1.04, 1.0, 0.92], exposure: 1.05,
    outer: 'sand', lights: 'none', props: ['ruins', 'obelisks'], ambient: 'sand', wallStyle: 'block', wallMult: 1.5,
  },
  'temple-of-ahnqiraj': {
    floor: { kind: 3, a: '#a06c34', b: '#c48d4c', c: '#6a4a2a', scale: 0.055 }, wall: { kind: 4, a: '#3c2150', b: '#6a3478', c: '#b86a3a', scale: 0.05 },
    bump: 2.4, ambUp: [0.36, 0.27, 0.44], ambDown: [0.32, 0.2, 0.12], key: [0.2, 0.4, 0.8], keyCol: [0.5, 0.42, 0.5], fog: [0.12, 0.05, 0.19], fogD: 0.0078,
    dome: true, glow: [1.5, 0.55, 1.9], glowB: [3.5, 1.5, 3], grade: [1.0, 0.96, 1.06], exposure: 1.3,
    lights: 'hive', torchCol: [3.6, 1.2, 4.2], props: ['hivePods', 'tentaclesWall'], ambient: 'spores', wallStyle: 'rock', wallMult: 2.3,
  },
  naxxramas: {
    floor: { kind: 5, a: '#3b3042', b: '#5a4b62', c: '#2f7a3a', scale: 0.08 }, wall: { kind: 2, a: '#3a2f55', b: '#5b4a7a', c: '#274a2f', scale: 0.12 },
    bump: 1.9, ambUp: [0.40, 0.31, 0.58], ambDown: [0.15, 0.17, 0.20], key: [-0.3, 0.45, 0.8], keyCol: [0.52, 0.48, 0.80], fog: [0.075, 0.05, 0.14], fogD: 0.0068,
    dome: false, glow: [0.5, 1.9, 0.5], glowB: [1.2, 4, 1.2], grade: [0.98, 0.99, 1.06], exposure: 1.3,
    lights: 'torches', torchCol: [1.5, 5.2, 1.7], props: ['pillars', 'iron', 'braziers'], ambient: 'motes', wallStyle: 'block', wallMult: 2.1, banner: ['#3a2a66', '#6fd08a'],
  },
};

/** Boss rooms that differ from their raid's default. */
const OVERRIDES = {
  'molten-core/ragnaros': { outer: 'lava', exposure: 1.05, fogD: 0.0055 },
  'blackwing-lair/razorgore': { props: ['pillars', 'eggs', 'braziers'] },
  'zul-gurub/gahzranka': { outer: 'water', glow: [0.05, 0.25, 0.3], glowB: [0.15, 0.55, 0.6] },
  'temple-of-ahnqiraj/cthun': { outer: 'pit', fog: [0.05, 0.03, 0.14], ambUp: [0.28, 0.2, 0.55], ambDown: [0.1, 0.05, 0.16], props: ['tentaclesWall', 'hivePods'] },
  'temple-of-ahnqiraj/ouro': { floor: { kind: 3, a: '#a06c34', b: '#c48d4c', c: '#6a4a2a', scale: 0.05 } },
  'naxxramas/heigan': { floor: { kind: 5, a: '#2f3a30', b: '#4a5a44', c: '#3b8a3f', scale: 0.08 }, fog: [0.05, 0.10, 0.06], ambient: 'plague', torchCol: [1.2, 5.5, 1.2] },
  'naxxramas/loatheb': { floor: { kind: 5, a: '#2f3a30', b: '#4a5a44', c: '#3b8a3f', scale: 0.08 }, fog: [0.05, 0.10, 0.06], ambient: 'plague' },
  'naxxramas/noth': { fog: [0.05, 0.08, 0.07], ambient: 'plague' },
  'naxxramas/maexxna': { props: ['pillars', 'webs'], fog: [0.09, 0.06, 0.16] },
  'naxxramas/anubrekhan': { props: ['pillars', 'webs'] },
  'naxxramas/faerlina': { props: ['pillars', 'webs', 'braziers'] },
  'naxxramas/patchwerk': { floor: { kind: 5, a: '#34353c', b: '#4e505a', c: '#3b8a3f', scale: 0.08 }, ambUp: [0.36, 0.40, 0.46] },
  'naxxramas/grobbulus': { outer: 'slime', floor: { kind: 5, a: '#34353c', b: '#4e505a', c: '#3b8a3f', scale: 0.08 }, ambient: 'plague' },
  'naxxramas/gluth': { outer: 'slime', floor: { kind: 5, a: '#34353c', b: '#4e505a', c: '#3b8a3f', scale: 0.08 } },
  'naxxramas/thaddius': { props: ['pillars', 'coils'], torchCol: [1.4, 3.6, 6.5], fog: [0.04, 0.06, 0.14] },
  'naxxramas/razuvious': { torchCol: [1.8, 3.2, 6.0], ambUp: [0.34, 0.40, 0.62] },
  'naxxramas/gothik': { torchCol: [1.8, 3.2, 6.0], ambUp: [0.34, 0.40, 0.62] },
  'naxxramas/four-horsemen': { torchCol: [1.8, 3.2, 6.0], ambUp: [0.34, 0.40, 0.62] },
  'naxxramas/sapphiron': {
    floor: { kind: 1, a: '#54789a', b: '#86b4cc', c: '#2c4c75', scale: 0.09 }, wall: { kind: 1, a: '#2c5580', b: '#5288b0', c: '#143058', scale: 0.08 },
    ambUp: [0.20, 0.30, 0.46], ambDown: [0.10, 0.17, 0.28], keyCol: [0.34, 0.44, 0.62], fog: [0.05, 0.13, 0.24], fogD: 0.0078, torchCol: [0.5, 1.6, 3.4], wallStyle: 'rock', wallMult: 2.5, dome: true, glow: [0.3, 0.8, 1.5], glowB: [0.6, 1.5, 2.6], lights: 'hive', props: ['iceSpires'], ambient: 'snow', exposure: 1.0, grade: [0.96, 1.0, 1.06],
  },
  'naxxramas/kelthuzad': {
    floor: { kind: 5, a: '#2d3a55', b: '#44597c', c: '#6fb8e0', scale: 0.08 }, fog: [0.05, 0.10, 0.22], ambUp: [0.30, 0.42, 0.72], ambDown: [0.1, 0.14, 0.26], torchCol: [1.0, 2.8, 6.5], ambient: 'snow', props: ['pillars', 'iron', 'iceSpires'],
  },
};

export function themeFor(raidId, bossId) {
  const base = THEMES[raidId] || CAVE_ONYXIA;
  return { ...base, ...(OVERRIDES[`${raidId}/${bossId}`] || {}) };
}
