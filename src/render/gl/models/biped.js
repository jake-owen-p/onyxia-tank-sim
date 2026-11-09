// Humanoid bosses. One skeleton with options for build, robes, armour and head,
// so a lich, an abomination and a troll priest are the same machinery.

import { ModelBuilder } from '../model.js';

export const SIDES = [['L', 1], ['R', -1]];
const ang = (a) => [Math.cos(a), Math.sin(a)];

/**
 * The standing skeleton. Measures in yards: hip, chest, neck and shoulder
 * heights, shoulder half-width, arm and leg length.
 */
export function bipedRig(m, o) {
  const H = { hip: 4, chest: 6.4, neck: 8, sw: 2.6, armU: 2.4, armL: 2.2, hipW: 1.1, ...o };
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [0, 0, H.hip]);
  m.bone('spine', 'hips', [0, 0, (H.hip + H.chest) / 2]);
  m.bone('chest', 'spine', [0, 0, H.chest]);
  m.bone('neck', 'chest', [H.lean || 0, 0, H.neck]);
  m.bone('head', 'neck', [H.lean || 0, 0, H.neck + (H.headUp ?? 0.4)]);
  m.bone('jaw', 'head', [(H.lean || 0) + 0.3, 0, H.neck + (H.headUp ?? 0.4)]);
  m.bone('mouth', 'head', [(H.lean || 0) + 1, 0, H.neck + 1]);
  for (const [s, y] of SIDES) {
    const shoulder = [0, y * H.sw, H.neck - (H.shoulderDrop ?? 0.6)];
    const elbow = [H.elbowF ?? -0.1, y * (H.sw + (H.armOut ?? 0.5)), shoulder[2] - H.armU];
    const wrist = [(H.elbowF ?? -0.1) + (H.wristF ?? 0.5), y * (H.sw + (H.armOut ?? 0.5) * 1.2), elbow[2] - H.armL];
    m.bone(`${s}up`, 'chest', shoulder);
    m.bone(`${s}lo`, `${s}up`, elbow);
    m.bone(`${s}hand`, `${s}lo`, wrist);
    const hipP = [0, y * H.hipW, H.hip - 0.1];
    const knee = [0.18, y * (H.hipW + 0.1), H.hip * 0.52];
    m.bone(`${s}th`, 'hips', hipP);
    m.bone(`${s}sh`, `${s}th`, knee);
  }
  return H;
}

/** Walk, idle and the casting gestures all humanoid bosses share. */
export function animateBiped(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const walk = ease('walk', s.moving ? 1 : 0, 7);
  const cast = s.cast, k = cast ? cast.frac : 0;
  const swing = ease('swing', cast && (cast.kind === 'cone' || cast.kind === 'knockback') ? 1 : 0, 9);
  const raise = ease('raise', cast && cast.kind !== 'cone' && cast.kind !== 'knockback' ? 1 : 0, 6);
  const br = Math.sin(t * 1.4) * 0.03;
  p.r('chest', 0, br, 0).r('head', 0, 0.02 * Math.sin(t * 0.8), 0.05 * Math.sin(t * 0.5));
  p.r('Lup', 0.12, br, 0).r('Rup', -0.12, br, 0).r('Llo', 0, -0.25, 0).r('Rlo', 0, -0.25, 0);
  if (walk > 0.01) {
    const w = t * 6.4, a = Math.sin(w) * walk, b = Math.cos(w) * walk;
    p.r('Lth', 0, -a * 0.6, 0).r('Rth', 0, a * 0.6, 0).r('Lsh', 0, Math.max(0, -b) * 0.9, 0).r('Rsh', 0, Math.max(0, b) * 0.9, 0);
    p.r('Lup', 0, a * 0.42, 0).r('Rup', 0, -a * 0.42, 0).r('spine', 0, 0.06 * walk, Math.sin(w) * 0.06 * walk);
    p.o('hips', 0, 0, Math.abs(b) * 0.16);
  }
  if (swing > 0.01) {
    const up = k < 0.68 ? k / 0.68 : 1, down = k > 0.68 ? (k - 0.68) / 0.32 : 0, v = swing * (up - down * 1.4);
    p.r('Rup', 0, -2.4 * v, -0.3 * v).r('Rlo', 0, -0.45 * v, 0).r('chest', 0, 0.2 * v, -0.42 * v + 0.6 * down * swing);
  }
  if (raise > 0.01) {
    const a = raise * (0.8 + 0.2 * Math.sin(t * 6));
    p.r('Lup', 0.4 * a, -2.3 * a, 0).r('Rup', -0.4 * a, -2.3 * a, 0).r('Llo', 0, -0.3 * a, 0).r('Rlo', 0, -0.3 * a, 0).r('head', 0, -0.18 * a, 0).r('chest', 0, -0.12 * a, 0);
  }
  p.evaluate();
}

/** Curved horn from a base point: dir is [x, y, z] of the tip, relative. */
export function horn(m, bone, base, tip, r, col, bend = [0, 0, 0], colTip) {
  m.spike(bone, base, [base[0] + tip[0], base[1] + tip[1], base[2] + tip[2]], r, col, { bend, sides: 6, tipColor: colTip });
}

export function makeBuilder() { return new ModelBuilder(); }
export { ang };
