// Four-legged winged dragons. Proportions come from screenshots of the game's
// dragon models: thick chest, long S-curve neck, wedge head with swept horns,
// spined tail, five-fingered bat wings.

import { ModelBuilder } from '../model.js';

const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const toRGB = (c) => (Array.isArray(c) ? c : [(parseInt(c.slice(1), 16) >> 16 & 255) / 255, (parseInt(c.slice(1), 16) >> 8 & 255) / 255, (parseInt(c.slice(1), 16) & 255) / 255]);

export function buildDragon(o = {}) {
  const c = { skin: '#2c2233', belly: '#5a4664', wing: '#3d2a55', wingBone: '#2a2030', spike: '#6a6074', horn: '#7a6f78', eye: '#ffb02a', mouth: '#a02418', claw: '#c9c0b4', ...o.colors };
  const bulk = o.bulk ?? 1, neckK = o.neck ?? 1, spanK = o.wingspan ?? 1, tailK = o.tail ?? 1, hornK = o.horns ?? 1, skeletal = !!o.skeletal;
  const R = (v) => v * (skeletal ? 0.5 : bulk);
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  m.bone('hips', 'root', [-3, 0, 4.4]);
  m.bone('chest', 'hips', [1.5, 0, 5]);
  const neckPts = [[3.8, 0, 6.5], [5.1 * neckK, 0, 8.3], [6.6 * neckK, 0, 9.5], [8.1 * neckK, 0, 10.1]];
  m.bone('neck1', 'chest', neckPts[0]); m.bone('neck2', 'neck1', neckPts[1]); m.bone('neck3', 'neck2', neckPts[2]);
  const hx = neckPts[3][0], hz = neckPts[3][2];
  m.bone('head', 'neck3', [hx, 0, hz]);
  m.bone('jaw', 'head', [hx + 0.5, 0, hz - 0.55]);
  m.bone('mouth', 'head', [hx + 3.9, 0, hz - 0.4]);
  const tailPts = [[-5.4, 0, 4.1], [-8 * tailK, 0, 3.3], [-10.8 * tailK, 0, 2.6], [-13.6 * tailK, 0, 2], [-16.4 * tailK, 0, 1.5], [-19.5 * tailK, 0, 1.1]];
  tailPts.forEach((p, i) => m.bone(`tail${i}`, i ? `tail${i - 1}` : 'hips', p));

  // Body: chest barrel, belly, haunches.
  m.ell('chest', [1.2, 0, 5.0], [R(4.3), R(3.5), R(3.2)], c.skin, { k: 0.9 });
  m.ell('hips', [-1.8, 0, 4.7], [R(4), R(3), R(2.7)], c.skin, { k: 0.9 });
  m.ell('hips', [-4.1, 0, 4.4], [R(2.9), R(2.5), R(2.3)], c.skin, { k: 0.8 });
  // Neck.
  m.blob('chest', [2.4, 0, 5.4], neckPts[0], R(2.6), R(2), c.skin, { k: 0.9 });
  m.blob('neck1', neckPts[0], neckPts[1], R(1.95), R(1.5), c.skin, { k: 0.4 });
  m.blob('neck2', neckPts[1], neckPts[2], R(1.5), R(1.18), c.skin, { k: 0.3 });
  m.blob('neck3', neckPts[2], neckPts[3], R(1.18), R(1.05), c.skin, { k: 0.25 });
  // Head: skull, wedge snout, brow, and a separate jaw so the mouth can open.
  const hw = o.headWidth ?? 1;
  m.ell('head', [hx + 0.5, 0, hz + 0.1], [1.55, 1.1 * hw, 0.95], c.skin, { k: 0.3 });
  m.blob('head', [hx + 1.1, 0, hz - 0.06], [hx + 3.6, 0, hz - 0.28], 0.86 * hw, 0.5 * hw, c.skin, { k: 0.25 });
  for (const y of [1, -1]) {
    m.ell('head', [hx + 1.15, y * 0.72 * hw, hz + 0.56], [0.86, 0.3, 0.28], c.skin, { k: 0.14 });        // brow ridge
    m.ell('head', [hx + 3.15, y * 0.28, hz + 0.08], [0.4, 0.18, 0.2], c.skin, { k: 0.12 });              // nostril bump
    m.ball('head', [hx + 1.65, y * 0.86 * hw, hz + 0.32], 0.19, c.eye, { em: 2.6 });
    m.ball('head', [hx + 3.45, y * 0.2, hz + 0.2], 0.07, c.mouth, { em: 1.5, sides: 5, rings: 3 });
    // Teeth, upper row.
    for (let i = 0; i < 5; i++) {
      const tx = hx + 1.8 + i * 0.42, w = 0.6 - i * 0.05;
      m.spike('head', [tx, y * w * hw, hz - 0.55 + i * -0.04], [tx + 0.1, y * w * hw, hz - 1.02 - i * 0.02], 0.09, c.claw, { sides: 3 });
    }
    // Horns: two pairs swept back.
    m.tube('head', [[hx - 0.4, y * 0.72 * hw, hz + 0.62], [hx - 2.6 * hornK, y * 1.15 * hw, hz + 1.7 * hornK], [hx - 5.2 * hornK, y * 1.45 * hw, hz + 3.1 * hornK]], [0.34, 0.2, 0.02], [c.horn, c.horn, c.spike], { sides: 6 });
    m.tube('head', [[hx - 0.5, y * 1.0 * hw, hz + 0.05], [hx - 2.5 * hornK, y * 1.75 * hw, hz + 0.7 * hornK], [hx - 4 * hornK, y * 2.1 * hw, hz + 0.3 * hornK]], [0.26, 0.15, 0.02], [c.horn, c.horn, c.spike], { sides: 5 });
    // Jaw edge spikes.
    m.spike('jaw', [hx + 0.2, y * 0.95 * hw, hz - 0.72], [hx - 1.4, y * 1.5 * hw, hz - 0.5], 0.17, c.spike, { sides: 4 });
  }
  // The jaw.
  m.blob('jaw', [hx + 0.4, 0, hz - 0.75], [hx + 3.3, 0, hz - 1.05], 0.6 * hw, 0.3 * hw, c.skin, { k: 0.12 });
  m.ell('jaw', [hx + 1.7, 0, hz - 0.72], [1.3, 0.38 * hw, 0.14], c.mouth, { k: 0.04, em: 0.25 });
  for (const y of [1, -1]) for (let i = 0; i < 4; i++) {
    const tx = hx + 1.7 + i * 0.42, w = 0.46 - i * 0.05;
    m.spike('jaw', [tx, y * w * hw, hz - 0.72 - i * 0.04], [tx + 0.06, y * w * hw, hz - 0.28], 0.075, c.claw, { sides: 3 });
  }
  // Tail, tapering to a spade.
  const tr = [1.55, 1.16, 0.86, 0.6, 0.38, 0.2];
  tailPts.forEach((p, i) => {
    const prev = i ? tailPts[i - 1] : [-3.9, 0, 4.2];
    m.blob(`tail${i}`, prev, p, R(i ? tr[i - 1] : 1.75), R(tr[i]), c.skin, { k: 0.22 });
  });
  const tip = tailPts[5];
  for (const y of [1, -1]) m.tri([tip[0] + 1.1, y * 0.05, tip[2]], [tip[0] - 1.7, y * 1.15, tip[2]], [tip[0] - 2.9, y * 0.05, tip[2] + 0.1], c.spike, 0, ['tail5'], true);
  // Dorsal spines.
  const spinePath = [[neckPts[2], 'neck2', 0.45], [neckPts[1], 'neck1', 0.56], [[4.4, 0, 7.2], 'neck1', 0.62], [neckPts[0], 'chest', 0.78], [[1.9, 0, 7.15], 'chest', 0.96], [[0.1, 0, 7.05], 'chest', 1.1], [[-1.6, 0, 6.62], 'hips', 1.06], [[-3.2, 0, 6.15], 'hips', 0.96], [[-4.9, 0, 5.72], 'tail0', 0.8]];
  tailPts.slice(1, 5).forEach((p, i) => spinePath.push([[p[0], 0, p[2] + tr[i + 1] * bulk * 0.88], `tail${i + 1}`, 0.64 - i * 0.12]));
  for (const [p, b, s] of spinePath) {
    const lift = 1.2 * (o.spines ?? 1) * s;
    m.spike(b, [p[0] + 0.3, 0, p[2] - 0.15], [p[0] - lift * 0.8, 0, p[2] + lift * 1.15], 0.3 * s + 0.08, c.spike, { sides: 4 });
  }

  // Legs, each mirrored.
  for (const [s, y] of [['L', 1], ['R', -1]]) {
    const sh = [2.4, y * 2.5, 4.5], el = [1.6, y * 3.6, 2.5], wr = [3, y * 3.3, 0.95], ft = [4.3, y * 3.3, 0.42];
    m.bone(`${s}fu`, 'chest', sh); m.bone(`${s}fl`, `${s}fu`, el); m.bone(`${s}ff`, `${s}fl`, wr);
    m.ell(`${s}fu`, [2.2, y * 2.6, 4.0], [R(1.9), R(1.3), R(2.3)], c.skin, { k: 0.6 });
    m.blob(`${s}fu`, sh, el, R(1.5), R(1.1), c.skin, { k: 0.4 });
    m.blob(`${s}fl`, el, wr, R(1.1), R(0.76), c.skin, { k: 0.25 });
    m.blob(`${s}ff`, wr, ft, R(0.82), R(0.76), c.skin, { k: 0.14 });
    const hp = [-3.2, y * 2.3, 3.9], kn = [-1.5, y * 3.6, 2.5], an = [-3.7, y * 3.4, 1.05], bt = [-2.5, y * 3.45, 0.42];
    m.bone(`${s}bu`, 'hips', hp); m.bone(`${s}bl`, `${s}bu`, kn); m.bone(`${s}bf`, `${s}bl`, an);
    m.ell(`${s}bu`, [-2.8, y * 2.7, 3.7], [R(2.5), R(1.5), R(2.6)], c.skin, { k: 0.65 });
    m.blob(`${s}bu`, hp, kn, R(1.75), R(1.25), c.skin, { k: 0.4 });
    m.blob(`${s}bl`, kn, an, R(1.25), R(0.8), c.skin, { k: 0.25 });
    m.blob(`${s}bf`, an, bt, R(0.85), R(0.8), c.skin, { k: 0.14 });
    for (let i = -1; i <= 1; i++) {
      m.spike(`${s}ff`, [ft[0] + 0.5, ft[1] + i * 0.42, 0.38], [ft[0] + 1.75, ft[1] + i * 0.6, 0.02], 0.2, c.claw, { sides: 4, bend: [0.05, 0, 0.28] });
      m.spike(`${s}bf`, [bt[0] + 0.5, bt[1] + i * 0.42, 0.38], [bt[0] + 1.75, bt[1] + i * 0.6, 0.02], 0.2, c.claw, { sides: 4, bend: [0.05, 0, 0.28] });
    }
    // Wing: arm, forearm and a hand of long fingers with a membrane between.
    const S = [1.7, y * 2.0, 7.0], E = [-0.5, y * 8.6 * spanK, 11.5], W = [-3.2, y * 15 * spanK, 10.4];
    m.bone(`${s}w1`, 'chest', S); m.bone(`${s}w2`, `${s}w1`, E); m.bone(`${s}w3`, `${s}w2`, W);
    const tips = [[-7.5, y * 28 * spanK, 9.2], [-14, y * 25.5 * spanK, 6.8], [-17.8, y * 18 * spanK, 5.2], [-15.8, y * 9.2 * spanK, 4.5]];
    tips.forEach((_, i) => m.bone(`${s}f${i}`, `${s}w3`, W));
    const boneC = c.wingBone, thick = skeletal ? 0.34 : 0.5;
    m.tube([`${s}w1`, `${s}w1`], [S, E], [thick * 1.5, thick], boneC, { sides: 6 });
    m.tube([`${s}w2`, `${s}w2`], [E, W], [thick, thick * 0.72], boneC, { sides: 6 });
    m.spike(`${s}w2`, E, [E[0] + 1.8, E[1] + y * 0.2, E[2] + 3.2], 0.4, c.spike, { sides: 4 });
    m.spike(`${s}w3`, W, [W[0] + 2.8, W[1] + y * 1.2, W[2] + 2.3], 0.34, c.claw, { sides: 4 });
    tips.forEach((t, i) => m.tube(`${s}f${i}`, [W, [(W[0] + t[0]) / 2, (W[1] + t[1]) / 2, (W[2] + t[2]) / 2 + 0.7], t], [0.32, 0.2, 0.03], boneC, { sides: 5 }));
    if (!o.noMembrane) {
      const steps = 5;
      const pathTo = (t, i) => Array.from({ length: steps + 1 }, (_, k) => { const a = k / steps; return [W[0] + (t[0] - W[0]) * a, W[1] + (t[1] - W[1]) * a, W[2] + (t[2] - W[2]) * a + Math.sin(a * Math.PI) * 0.7]; });
      const col = o.tattered ? mix(toRGB(c.wing), [0, 0, 0], 0.15) : toRGB(c.wing);
      for (let i = 0; i < tips.length - 1; i++) {
        const a = pathTo(tips[i], i), b = pathTo(tips[i + 1], i + 1);
        // Scallop: the outer point between two fingers is pulled in.
        const bones = Array(steps + 1).fill(`${s}f${i}`), bones2 = Array(steps + 1).fill(`${s}f${i + 1}`);
        const end = steps - 1;
        const mid = a.slice(0, end + 1), midB = b.slice(0, end + 1);
        m.membrane(mid, midB, bones.slice(0, end + 1), bones2.slice(0, end + 1), col, { steps: 3, fade: 0.16 });
        const A = a[end], B = b[end], ta = a[steps], tb = b[steps], cn = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
        m.tri(A, ta, cn, col, 0, [`${s}f${i}`, `${s}f${i}`, `${s}f${i}`], true);
        m.tri(B, cn, tb, col, 0, [`${s}f${i + 1}`, `${s}f${i + 1}`, `${s}f${i + 1}`], true);
      }
      // Panel from the last finger back to the flank.
      const last = pathTo(tips[3], 3);
      const flank = Array.from({ length: steps + 1 }, (_, k) => { const a = k / steps; return [S[0] + (-5.4 - S[0]) * a, S[1] + (y * 2.1 - S[1]) * a, S[2] + (5.8 - S[2]) * a]; });
      const armEdge = Array.from({ length: steps + 1 }, (_, k) => { const a = k / steps; const p = k <= steps / 2 ? mix(S, E, a * 2) : mix(E, W, a * 2 - 1); return p; });
      m.membrane(armEdge, last.map((p) => p), Array(steps + 1).fill(`${s}w2`).map((b, k) => (k <= steps / 2 ? `${s}w1` : b)), Array(steps + 1).fill(`${s}f3`), col, { steps: 3, fade: 0.1 });
      m.membrane(flank, armEdge, Array(steps + 1).fill('chest'), Array(steps + 1).fill(`${s}w2`).map((b, k) => (k <= steps / 2 ? `${s}w1` : b)), col, { steps: 3, fade: 0.08 });
    }
  }
  if (skeletal) {
    // Ribs over a hollow chest.
    for (let i = 0; i < 7; i++) {
      const x = 3 - i * 1.1;
      for (const y of [1, -1]) m.tube('chest', [[x, 0, 6.5 - i * 0.1], [x - 0.3, y * 2.2, 5.2], [x - 0.6, y * 1.9, 3.2], [x - 0.8, 0, 2.6]], [0.2, 0.17, 0.13, 0.1], c.spike, { sides: 4 });
    }
  }
  const belly = toRGB(c.belly);
  const skin = toRGB(c.skin);
  const built = m.build({
    cell: o.cell ?? 0.17, smooth: 1, ao: 1, aoReach: 1.4,
    paint(v) {
      // Lighter banded belly and throat, as the dragon models have.
      const under = Math.max(0, Math.min(1, (-v.nz + 0.1) * 2.2));
      if (under > 0 && v.x > -10) {
        const band = 0.72 + 0.28 * Math.sin(v.x * 2.6);
        const col = mix(v.color, belly, under * band);
        v.color[0] = col[0]; v.color[1] = col[1]; v.color[2] = col[2];
      }
      if (o.dorsal) {
        const top = Math.max(0, Math.min(1, (v.nz - 0.55) * 2.5)), d = toRGB(o.dorsal);
        v.color[0] += (d[0] - v.color[0]) * top * 0.75; v.color[1] += (d[1] - v.color[1]) * top * 0.75; v.color[2] += (d[2] - v.color[2]) * top * 0.75;
      }
      void skin;
    },
  });
  return built;
}

/** Idle, walk, cast, buffet, flight and landing behaviour shared by every dragon. */
export function animateDragon(p, s) {
  p.reset();
  const m = s.mem, t = s.t;
  const flying = s.state === 'airborne' || s.state === 'takeoff' || s.state === 'landing';
  const ease = (key, target, rate) => { m[key] = (m[key] ?? target) + (target - (m[key] ?? target)) * Math.min(1, s.dt * rate); return m[key]; };
  const fly = ease('fly', flying ? 1 : 0, 2.6);
  const walk = ease('walk', s.moving ? 1 : 0, 6);
  const cast = s.cast;
  const kind = cast ? cast.kind : null;
  const reach = ease('breath', cast && (kind === 'cone' || kind === 'projectile') ? 1 : 0, 7);
  const roar = ease('roar', cast && (kind === 'fear' || kind === 'aoe' || kind === 'hazard' || kind === 'adds') ? 1 : 0, 6);
  const flare = ease('flare', cast && kind === 'knockback' ? 1 : 0, 7);
  const k = cast ? Math.min(1, cast.frac) : 0;
  const breathe = Math.sin(t * 1.3);

  // Ground stance: wings folded up against the back.
  const fold = 1 - Math.max(fly, flare);
  for (const [n, sg] of [['L', 1], ['R', -1]]) {
    // Raised and half-open, the way the game's dragons stand.
    p.r(`${n}w1`, sg * (0.62 * fold + 0.18 * flare), 0.2 * fold, sg * 0.42 * fold);
    p.r(`${n}w2`, sg * -0.12 * fold, -0.04 * fold, sg * 0.4 * fold);
    p.r(`${n}w3`, 0, 0, sg * 0.08 * fold);
  }
  // Breath and idle in the neck.
  p.r('neck1', 0, -0.16 + 0.03 * breathe, 0.04 * Math.sin(t * 0.7));
  p.r('neck2', 0, 0.1, 0.05 * Math.sin(t * 0.7 + 1));
  p.r('neck3', 0, 0.14 + 0.02 * breathe, 0.05 * Math.sin(t * 0.7 + 2));
  p.r('head', 0, 0.2, 0.05 * Math.sin(t * 0.5));
  p.s('chest', 1 + 0.012 * breathe);
  for (let i = 0; i < 6; i++) p.r(`tail${i}`, 0, 0.02 * Math.sin(t * 0.9 + i), 0.08 * Math.sin(t * 0.8 + i * 0.7) * (1 + i * 0.2));

  // Walking.
  if (walk > 0.01) {
    const w = t * 5.2;
    const a = Math.sin(w) * walk * 0.5, b = Math.cos(w) * walk * 0.5;
    p.r('Lfu', 0, -a, 0).r('Rbu', 0, -a * 0.8, 0).r('Rfu', 0, a, 0).r('Lbu', 0, a * 0.8, 0);
    p.r('Lfl', 0, Math.max(0, b) * 0.8, 0).r('Rbl', 0, Math.max(0, b) * 0.8, 0).r('Rfl', 0, Math.max(0, -b) * 0.8, 0).r('Lbl', 0, Math.max(0, -b) * 0.8, 0);
    p.r('chest', 0, 0, Math.sin(w) * 0.05 * walk).o('hips', 0, 0, Math.abs(a) * 0.3);
    for (let i = 0; i < 6; i++) p.r(`tail${i}`, 0, 0, Math.sin(w * 0.5 + i * 0.8) * 0.05 * walk);
  }

  // Flight: wings spread and beating, legs tucked, body pitched.
  if (fly > 0.01) {
    const beatRate = s.state === 'airborne' ? 4.4 : 7;
    const beat = Math.sin(t * beatRate);
    for (const [n, sg] of [['L', 1], ['R', -1]]) {
      p.r(`${n}w1`, sg * fly * (0.1 + beat * 0.55), 0.06 * fly, 0);
      p.r(`${n}w2`, sg * fly * (-0.12 - beat * 0.22), 0, 0);
      p.r(`${n}w3`, sg * fly * (0.1 - beat * 0.28), 0, 0);
    }
    p.r('Lfu', 0, 0.9 * fly, 0).r('Rfu', 0, 0.9 * fly, 0).r('Lbu', 0, 1.1 * fly, 0).r('Rbu', 0, 1.1 * fly, 0);
    p.r('Lfl', 0, -0.8 * fly, 0).r('Rfl', 0, -0.8 * fly, 0).r('Lbl', 0, -1.4 * fly, 0).r('Rbl', 0, -1.4 * fly, 0);
    p.r('root', 0, -0.14 * fly, 0);
    p.r('neck1', 0, 0.22 * fly, 0).r('neck2', 0, 0.16 * fly, 0);
    p.o('root', 0, 0, beat * 0.3 * fly);
  }

  // Frontal breath: rear back, then the head snaps forward with the mouth open.
  if (reach > 0.01) {
    const w = k < 0.72 ? k / 0.72 : 1;
    const snap = k > 0.72 ? (k - 0.72) / 0.28 : 0;
    p.r('neck1', 0, reach * (-0.5 * w + 0.72 * snap), 0).r('neck2', 0, reach * (-0.2 * w + 0.32 * snap), 0).r('neck3', 0, reach * (0.18 * w), 0);
    p.r('head', 0, reach * (0.22 * snap - 0.05 * w), 0);
    p.r('jaw', 0, reach * (0.14 + 0.58 * snap + 0.06 * Math.sin(t * 22) * snap), 0);
  }
  // Roar: head up and thrown back.
  if (roar > 0.01) {
    p.r('neck1', 0, -0.42 * roar, 0).r('neck2', 0, -0.2 * roar, 0).r('head', 0, -0.32 * roar, 0);
    p.r('jaw', 0, 0.62 * roar + 0.05 * Math.sin(t * 28) * roar, 0);
  }
  // Wing buffet: wings snap open and forward.
  if (flare > 0.01) {
    const w = Math.sin(Math.min(1, k * 1.05) * Math.PI);
    for (const [n, sg] of [['L', 1], ['R', -1]]) p.r(`${n}w1`, sg * flare * (0.42 * w), -0.5 * flare, -sg * 0.32 * flare);
    p.r('chest', 0, -0.18 * flare, 0);
  }
  p.evaluate();
}

export function dragonOptions() { return {}; }
