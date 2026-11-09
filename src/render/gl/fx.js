// Particles and spell effects. Everything is derived from the view object, so
// live play and replays look the same.

import { hash } from './math.js';

export const P_STRIDE = 10; // x y z size r g b a rot kind

export class Particles {
  constructor(max = 6000) {
    this.max = max; this.n = 0;
    this.d = new Float32Array(max * 16);
    this.out = new Float32Array(max * P_STRIDE);
  }
  // x y z vx vy vz size grow r g b a life age kind drag
  emit(x, y, z, vx, vy, vz, size, grow, r, g, b, a, life, kind = 0, drag = 0, grav = 0) {
    if (this.n >= this.max) return;
    const i = this.n++ * 16, D = this.d;
    D[i] = x; D[i + 1] = y; D[i + 2] = z; D[i + 3] = vx; D[i + 4] = vy; D[i + 5] = vz; D[i + 6] = size; D[i + 7] = grow;
    D[i + 8] = r; D[i + 9] = g; D[i + 10] = b; D[i + 11] = a; D[i + 12] = life; D[i + 13] = 0; D[i + 14] = kind; D[i + 15] = drag + grav * 1000;
  }
  clear() { this.n = 0; }
  step(dt) {
    const D = this.d; let w = 0;
    for (let r = 0; r < this.n; r++) {
      const i = r * 16;
      const age = D[i + 13] + dt;
      if (age >= D[i + 12]) continue;
      const j = w++ * 16;
      if (i !== j) for (let k = 0; k < 16; k++) D[j + k] = D[i + k];
      D[j + 13] = age;
      const dragGrav = D[j + 15], grav = Math.floor(dragGrav / 1000 + 1e-6) , drag = dragGrav - grav * 1000;
      const f = Math.max(0, 1 - drag * dt);
      D[j + 3] *= f; D[j + 4] *= f; D[j + 5] = D[j + 5] * f - grav * dt;
      D[j] += D[j + 3] * dt; D[j + 1] += D[j + 4] * dt; D[j + 2] += D[j + 5] * dt;
      D[j + 6] += D[j + 7] * dt;
    }
    this.n = w;
  }
  /** Fill the instance buffer; returns the count. */
  write() {
    const D = this.d, O = this.out;
    for (let r = 0; r < this.n; r++) {
      const i = r * 16, o = r * P_STRIDE, k = D[i + 13] / D[i + 12];
      const env = Math.min(1, k * 8) * (1 - k) * (1 - k);
      O[o] = D[i]; O[o + 1] = D[i + 1]; O[o + 2] = D[i + 2]; O[o + 3] = Math.max(0.01, D[i + 6]);
      O[o + 4] = D[i + 8] * env; O[o + 5] = D[i + 9] * env; O[o + 6] = D[i + 10] * env; O[o + 7] = D[i + 11] * env;
      O[o + 8] = (r * 2.399) % 6.283; O[o + 9] = D[i + 14];
    }
    return this.n;
  }
}

export const SCHOOLS = {
  fire: [7, 2.4, 0.45], frost: [1.3, 3.3, 7], poison: [1.3, 5.6, 0.9], shadow: [1.9, 0.6, 4.4], arcane: [3.4, 1.4, 7],
  storm: [2.2, 3.4, 8], holy: [6.5, 5.5, 2.2], physical: [2.2, 2.1, 2],
};

const RX = [
  [/frost|ice|chill|blizzard|cold|freez|snow/, 'frost'],
  [/poison|venom|acid|slime|plague|disease|toxic|mutat|spore|cloud|ooze|sting|wyvern/, 'poison'],
  [/shadow|void|dark|curse|fear|drain|death|soul|mark|wail|bellow|harvest|panic|roar|necro/, 'shadow'],
  [/arcane|mana|blink|magic|teleport|explosion|burst/, 'arcane'],
  [/lightning|shock|storm|static|thunder|polarity|chain|tesla/, 'storm'],
  [/holy|heal|renew|light/, 'holy'],
  [/fire|flame|lava|burn|magma|ember|ignite|conflag|erupt|breath|inferno|rain|hellfire|bomb/, 'fire'],
];
export function schoolOf(text, fallback = 'physical') {
  const s = (text || '').toLowerCase();
  for (const [r, n] of RX) if (r.test(s)) return n;
  return fallback;
}

export function emitAmbient(P, kind, info, dt, cam) {
  const rate = { embers: 110, motes: 44, sand: 90, spores: 70, plague: 60, snow: 210 }[kind] || 0;
  let n = rate * dt; n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
  const R = 42;
  for (let i = 0; i < n; i++) {
    const x = cam[0] + (Math.random() - 0.5) * 2 * R, y = cam[1] + (Math.random() - 0.5) * 2 * R, z = Math.random() * 22;
    const r = Math.random();
    switch (kind) {
      case 'embers': P.emit(x, y, z * 0.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1.4 + r * 3, 0.035 + r * 0.05, -0.008, 5, 1.5, 0.26, 0, 2.5 + r * 3, 3); break;
      case 'motes': P.emit(x, y, z * 0.4, (Math.random() - 0.5), (Math.random() - 0.5), 0.3, 0.09, 0, 1.2, 3.4, 1, 0, 4 + r * 3, 0); break;
      case 'plague': P.emit(x, y, Math.random() * 3, 0, 0, 0.5 + r * 0.6, 1.2 + r * 1.6, 0.8, 0.12, 0.34, 0.08, 0.05, 3.2, 2); break;
      case 'sand': P.emit(x, y, Math.random() * 4, 6 + r * 3, 2.2, 0.1, 0.16 + r * 0.5, 0.4, 0.5, 0.36, 0.2, 0.12, 2.6, 2); break;
      case 'spores': P.emit(x, y, z * 0.5, (Math.random() - 0.5), (Math.random() - 0.5), 0.5, 0.12, 0, 3, 1, 4, 0, 4.5, 0); break;
      case 'snow': P.emit(x, y, z + 6, 0.9 + r, 0.5, -3.4 - r * 2.3, 0.08 + r * 0.08, 0, 1.3, 1.5, 1.8, 0.65, 4.5, 3); break;
      default: break;
    }
  }
}

export function emitFlame(P, x, y, z, size, col, dt, rate = 60) {
  let n = rate * dt; n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const r = Math.random(), a = Math.random() * 6.28, d = Math.random() * size * 0.42;
    const c = 0.28 + Math.random() * 0.26;
    P.emit(x + Math.cos(a) * d, y + Math.sin(a) * d, z, (Math.random() - 0.5) * size, (Math.random() - 0.5) * size, size * (2.6 + r * 2.2), size * (0.7 + r * 0.7), -size * 0.34, col[0] * c, col[1] * c, col[2] * c, 0, 0.45 + r * 0.4, 1);
  }
}

function polyBounds(poly) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of poly) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
function inPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }

/**
 * Per-frame spell visuals for the boss. ctx: { view, script, dt, now, scale, mouth:[x,y,z], hands, look, mem }.
 */
export function stepBossFX(P, ctx) {
  const { view, script, dt, now, mouth, look, mem } = ctx;
  const wd = view.world, boss = wd.boss, t = view.t;
  const cast = boss.cast, def = cast && script.actions[cast.id];
  const school = def ? schoolOf(`${cast.id} ${def.label}`, look.school || 'physical') : look.school || 'physical';
  const col = SCHOOLS[school];

  // Gathering energy at the mouth or hands during a cast.
  if (cast && def) {
    const k = Math.min(1, (t - cast.start) / Math.max(0.05, cast.end - cast.start));
    const n = Math.ceil(90 * dt * (0.5 + k));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, b = Math.random() * 3.14, r = (2.2 + k * 2) * (ctx.scale || 1);
      const dx = Math.cos(a) * Math.sin(b), dy = Math.sin(a) * Math.sin(b), dz = Math.cos(b);
      P.emit(mouth[0] + dx * r, mouth[1] + dy * r, mouth[2] + dz * r, -dx * r * 2.1, -dy * r * 2.1, -dz * r * 2.1, 0.32 + k * 0.45, 0, col[0], col[1], col[2], 0, 0.42, 0);
    }
  }

  // Frontal cones: a stream as the cast lands and for a moment after.
  for (const [name, c] of Object.entries(script.boss.cones || {})) {
    const style = c.style || (c.facing === 'back' ? 'tail' : name === 'breath' ? 'breath' : 'cleave');
    const since = t - (wd.coneFlash[name] ?? -Infinity);
    const heading = boss.heading + (c.facing === 'back' ? Math.PI : 0);
    const half = (c.angle * Math.PI) / 360;
    if (style === 'breath' && since >= 0 && since < 0.9) {
      const school2 = schoolOf(`${name} ${c.label || ''}`, school);
      const col2 = SCHOOLS[school2 === 'physical' ? 'fire' : school2];
      const n = Math.ceil(420 * dt);
      for (let i = 0; i < n; i++) {
        const a = heading + (Math.random() - 0.5) * 2 * half, sp = c.range * (0.85 + Math.random() * 0.75), s = 1.1 + Math.random() * 2.2;
        const wob = 0.65 + Math.random() * 0.5;
        P.emit(mouth[0], mouth[1], mouth[2], Math.cos(a) * sp, Math.sin(a) * sp, -mouth[2] * 1.2, s, c.range * 0.14, col2[0] * wob, col2[1] * wob, col2[2] * wob, 0, 0.78, 1, 0.4);
      }
    } else if (style !== 'breath' && since >= 0 && since < 0.18) {
      const n = Math.ceil(240 * dt);
      for (let i = 0; i < n; i++) {
        const a = heading + (Math.random() - 0.5) * 2 * half, d = c.range * (0.4 + Math.random() * 0.6);
        P.emit(boss.x + Math.cos(a) * d, boss.y + Math.sin(a) * d, 0.8 + Math.random() * 2.5, Math.cos(a + 1.57) * 9, Math.sin(a + 1.57) * 9, 0, 0.5, 0.8, 2.2, 2.0, 1.7, 0, 0.3, 3);
      }
    }
  }

  // Knockback: a ring of dust thrown outward.
  const sinceKB = t - (wd.coneFlash.knockback ?? wd.coneFlash.buffet ?? -Infinity);
  if (sinceKB >= 0 && sinceKB < dt * 2 + 0.02 && mem.kbFlash !== wd.coneFlash.knockback) {
    mem.kbFlash = wd.coneFlash.knockback;
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * 6.28, sp = 22 + Math.random() * 16;
      P.emit(boss.x + Math.cos(a) * 3, boss.y + Math.sin(a) * 3, 0.5 + Math.random() * 1.4, Math.cos(a) * sp, Math.sin(a) * sp, 2 + Math.random() * 3, 1.6, 3.5, 0.34, 0.26, 0.2, 0.3, 0.8, 2, 1.6);
    }
  }

  // Area bursts when a cast completes.
  if (mem.prevCast && !cast) {
    const pd = script.actions[mem.prevCast];
    if (pd && (pd.kind === 'aoe' || pd.kind === 'fear' || pd.kind === 'hazard' || pd.kind === 'enrage')) {
      const c2 = SCHOOLS[schoolOf(`${mem.prevCast} ${pd.label}`, look.school || 'shadow')];
      const R = pd.radius && pd.radius < 40 ? pd.radius : 34;
      for (let i = 0; i < 260; i++) {
        const a = (i / 260) * 6.28, sp = R * (1.3 + Math.random() * 0.8);
        P.emit(boss.x + Math.cos(a) * 3, boss.y + Math.sin(a) * 3, 1 + Math.random() * 2.5, Math.cos(a) * sp, Math.sin(a) * sp, Math.random() * 2, 1.1, 1.8, c2[0], c2[1], c2[2], 0, 0.72, 1, 0.8);
      }
    }
  }
  mem.prevCast = cast ? cast.id : null;

  // Ground hazards.
  for (const hz of wd.hazards) {
    if (hz.state !== 'active') continue;
    const [a, b, c, d] = polyBounds(hz.poly);
    const area = Math.max(4, (c - a) * (d - b));
    const hzSchool = hz.applies ? 'holy' : schoolOf(`${hz.id} ${hz.label}`, look.school || 'fire');
    const hc = SCHOOLS[hzSchool];
    let n = Math.min(90, area * 2.4 * dt * 8);
    n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const x = a + Math.random() * (c - a), y = b + Math.random() * (d - b);
      if (!inPoly(x, y, hz.poly)) continue;
      const r = Math.random();
      if (hzSchool === 'poison' || hzSchool === 'shadow') P.emit(x, y, 0.2, 0, 0, 1 + r, 1.5 + r * 1.8, 1.2, hc[0] * 0.24, hc[1] * 0.24, hc[2] * 0.24, 0.1, 1.5, 2);
      else P.emit(x, y, 0.15, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 4 + r * 7, 1 + r * 1.5, -0.7, hc[0] * (0.6 + r * 0.5), hc[1] * (0.6 + r * 0.5), hc[2] * (0.6 + r * 0.5), 0, 0.6 + r * 0.4, 1);
    }
  }

  // Projectiles.
  for (const pr of wd.projectiles) {
    if (t >= pr.t1) {
      if (t < pr.t1 + dt * 2) for (let i = 0; i < 90; i++) {
        const a = Math.random() * 6.28, sp = (pr.splash || 6) * (1 + Math.random());
        P.emit(pr.tx, pr.ty, 0.8, Math.cos(a) * sp, Math.sin(a) * sp, Math.random() * 8, 1.2, 1.4, col[0], col[1], col[2], 0, 0.55, 1, 1.5);
      }
      continue;
    }
    const k = Math.max(0, (t - pr.t0) / (pr.t1 - pr.t0));
    const x = pr.x0 + (pr.tx - pr.x0) * k, y = pr.y0 + (pr.ty - pr.y0) * k, z = (pr.z0 || 0) * (1 - k) + 1;
    const pc = SCHOOLS[look.projectile || 'fire'];
    P.emit(x, y, z, 0, 0, 0, 1.8, -1, pc[0] * 1.4, pc[1] * 1.4, pc[2] * 1.4, 0, 0.11, 0);
    for (let i = 0; i < 2; i++) P.emit(x, y, z, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, Math.random() * 2, 0.9, -0.6, pc[0], pc[1], pc[2], 0, 0.46, 1);
  }
  void now; void hash;
}
