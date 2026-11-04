// Colour tokens and fonts for both views and the HUD. One dark, warm,
// fire-themed palette plus a colourblind-safe variant where hazards and
// feedback differ by luminance and pattern as well as hue.

const FONT = "'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

const base = {
  font: FONT,
  fontDisplay: FONT,

  // world
  bg: '#0d0806',
  sky0: '#241209',
  sky1: '#0d0806',
  fog: 'rgba(13,8,6,1)',
  floor: '#1c1310',
  floorEdge: 'rgba(255,190,140,0.10)',
  grid: 'rgba(255,190,140,0.07)',
  gridMajor: 'rgba(255,190,140,0.13)',
  wall: 'rgba(110,62,38,0.55)',
  wallFar: 'rgba(70,40,26,0.45)',
  wallTop: 'rgba(255,170,100,0.55)',
  wallStroke: 'rgba(130,78,48,0.9)',
  backWall: 'rgba(255,200,120,0.35)',
  label: 'rgba(243,230,216,0.45)',

  // entities
  boss: 'rgba(196,58,28,0.55)',
  bossSolid: 'rgba(150,40,20,0.75)',
  bossStroke: '#ff7a45',
  bossFront: '#ffe066',
  bossShadow: 'rgba(0,0,0,0.45)',
  bossGhost: 'rgba(255,211,110,0.75)',
  player: '#5ec8ff',
  playerStroke: '#e6f7ff',
  ghost: 'rgba(158,240,200,0.9)',
  raid: '#86a9ff',
  raidMelee: '#ffd36e',
  whelp: '#ff6b4a',
  whelpHeld: '#ffb37a',
  projectile: '#ffb347',

  // hazards
  hazardWarn: '#ff9a3c',
  hazardWarnFill: 'rgba(255,154,60,0.22)',
  hazardActive: '#ff3b1f',
  hazardActiveFill: 'rgba(255,59,31,0.55)',
  crackIdle: 'rgba(255,120,60,0.22)',
  crackIdleStroke: 'rgba(255,140,80,0.55)',

  // guidance
  ideal: '#7cffb2',
  idealFill: 'rgba(124,255,178,0.18)',
  path: 'rgba(124,255,178,0.85)',
  pathGlow: 'rgba(124,255,178,0.25)',
  idealBoss: '#ffd36e',
  route: 'rgba(255,211,110,0.7)',

  // cones
  coneBreath: 'rgba(255,120,40,0.35)',
  coneBreathStroke: 'rgba(255,160,80,0.8)',
  coneCleave: 'rgba(255,200,120,0.10)',
  coneCleaveStroke: 'rgba(255,200,120,0.35)',
  coneTail: 'rgba(200,120,255,0.10)',
  coneTailStroke: 'rgba(200,120,255,0.4)',
  buffetRing: 'rgba(160,220,255,0.7)',

  // hud
  text: '#f3e6d8',
  textDim: 'rgba(243,230,216,0.62)',
  textMuted: 'rgba(243,230,216,0.38)',
  panel: 'rgba(16,10,8,0.72)',
  panelEdge: 'rgba(255,190,140,0.14)',
  accent: '#ffb347',
  good: '#55e08a',
  warn: '#ffc34d',
  bad: '#ff4d4d',
  hp: '#d8452c',
  hpBg: 'rgba(255,255,255,0.08)',
  playerHp: '#5ec8ff',
  threatOk: '#55e08a',
  threatDanger: '#ff4d4d',
  threatBand: 'rgba(255,77,77,0.28)',
  castBar: '#ff9a3c',
  gcd: 'rgba(255,255,255,0.18)',
  cooldown: 'rgba(0,0,0,0.62)',
  iconBg: 'rgba(40,24,16,0.92)',
  iconEdge: 'rgba(255,190,140,0.28)',
  iconActive: '#7cffb2',
  vignetteBad: 'rgba(255,40,30,0.55)',
  vignetteHazard: 'rgba(255,140,40,0.55)',
  fear: 'rgba(120,80,160,0.35)',
  pause: 'rgba(8,5,4,0.6)',
  minimapBg: 'rgba(12,7,5,0.82)',
  lane: 'rgba(255,190,140,0.045)',
  laneHot: 'rgba(255,190,140,0.11)',
  laneLine: 'rgba(255,179,71,0.55)',
  note: 'rgba(243,230,216,0.9)',
};

// Colourblind-safe variant: blue for warnings (hatched), bright orange for
// active hazards (solid), white player, blue raid. Good/bad use blue/orange.
const colorblind = {
  ...base,
  hazardWarn: '#4da3ff',
  hazardWarnFill: 'rgba(77,163,255,0.22)',
  hazardActive: '#ffb000',
  hazardActiveFill: 'rgba(255,176,0,0.62)',
  crackIdle: 'rgba(77,163,255,0.16)',
  crackIdleStroke: 'rgba(77,163,255,0.5)',
  player: '#ffffff',
  playerStroke: '#ffffff',
  raid: '#4da3ff',
  raidMelee: '#b8d8ff',
  whelp: '#ffb000',
  whelpHeld: '#ffe08a',
  ideal: '#ffffff',
  idealFill: 'rgba(255,255,255,0.16)',
  path: 'rgba(255,255,255,0.85)',
  pathGlow: 'rgba(255,255,255,0.22)',
  good: '#4da3ff',
  warn: '#ffe08a',
  bad: '#ff8c00',
  threatOk: '#4da3ff',
  threatDanger: '#ff8c00',
  threatBand: 'rgba(255,140,0,0.3)',
  vignetteBad: 'rgba(255,140,0,0.55)',
  vignetteHazard: 'rgba(77,163,255,0.55)',
  coneBreath: 'rgba(255,176,0,0.35)',
  coneBreathStroke: 'rgba(255,200,80,0.85)',
  coneTail: 'rgba(77,163,255,0.12)',
  coneTailStroke: 'rgba(77,163,255,0.45)',
  iconActive: '#4da3ff',
};

export function getPalette(settings) {
  return settings && settings.colorblind ? colorblind : base;
}

/** Severity colour for a boss action id. */
export function actionColor(pal, id) {
  switch (id) {
    case 'flameBreath': case 'wingBuffet': case 'bellowingRoar': case 'deepBreath': case 'eruption': return pal.bad;
    case 'landing': case 'takeoff': return pal.accent;
    case 'whelpWave': return pal.warn;
    default: return pal.text;
  }
}

/** rgba() string from a hex colour and alpha. */
export function withAlpha(hex, a) {
  if (hex.startsWith('rgba')) return hex.replace(/[\d.]+\)$/, `${a})`);
  if (hex.startsWith('rgb(')) return hex.replace('rgb(', 'rgba(').replace(')', `,${a})`);
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
