// Shared test helpers: script loading, a scripted "perfect tank" bot and a
// stepping loop that collects core events.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { dist, angleTo, angleDelta } from '../src/core/geometry.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export function loadScript() {
  return JSON.parse(fs.readFileSync(path.join(here, '..', 'data', 'encounters', 'onyxia.json'), 'utf8'));
}

export const script = loadScript();

export function makeSim(options = {}) {
  return createSim(script, { seed: 7, ...options });
}

/** Command that walks the player toward (tx,ty) and faces `face` (a point) or the travel direction. */
export function driveToward(sim, target, face = null) {
  const p = sim.state.world.player;
  const cmd = { forward: 0, strafe: 0, turn: 0, mouseTurn: 0, abilities: [] };
  const want = face ? angleTo(p.x, p.y, face.x, face.y) : angleTo(p.x, p.y, target.x, target.y);
  cmd.mouseTurn = Math.max(-0.2, Math.min(0.2, angleDelta(p.heading, want)));
  if (dist(p.x, p.y, target.x, target.y) > 0.8) {
    const rel = angleDelta(p.heading, angleTo(p.x, p.y, target.x, target.y));
    cmd.forward = Math.cos(rel);
    cmd.strafe = -Math.sin(rel);
  }
  return cmd;
}

/**
 * A scripted tank that follows the sim's own ideal position, taunts when she
 * is not on the player, sunders on cooldown and pre-empts Bellowing Roar.
 * Returns a command function with its own memory.
 */
export function perfectTank() {
  let lastSunder = -9, lastTaunt = -99;
  return (sim) => {
    const s = sim.state;
    const p = s.world.player, b = s.world.boss, ideal = s.world.idealPlayer;
    const close = dist(p.x, p.y, ideal.x, ideal.y) < 2;
    const face = b.state === 'grounded' && b.engaged && close ? b : null;
    const cmd = driveToward(sim, ideal, face);
    const inRange = b.state === 'grounded' && dist(p.x, p.y, b.x, b.y) - script.boss.radius <= 12;
    if (inRange && (b.target !== 'player' || !b.engaged) && s.t - lastTaunt > 10 && !b.passive) { cmd.abilities.push('taunt'); lastTaunt = s.t; }
    if (inRange && s.t - lastSunder > 1.5) { cmd.abilities.push('sunder'); lastSunder = s.t; }
    const roar = s.upcoming.find((u) => u.id === 'bellowingRoar');
    if (roar && roar.in < 0.25 && s.abilities.buffs.fearImmuneUntil < s.t) cmd.abilities.push('fearImmune');
    // Shield Block as the Flame Breath cast bar appears, Shield Wall when low.
    const cast = b.cast;
    if (cast && cast.id === 'flameBreath' && s.t - cast.start >= 0.5 && s.abilities.buffs.shieldBlockUntil < s.t && s.abilities.readyAt.shieldBlock <= s.t) cmd.abilities.push('shieldBlock');
    if (p.hp / p.maxHp < 0.35 && s.abilities.buffs.defensiveUntil < s.t && s.abilities.readyAt.defensive <= s.t) cmd.abilities.push('defensive');
    return cmd;
  };
}

export const idle = () => ({ forward: 0, strafe: 0, turn: 0, mouseTurn: 0, abilities: [] });

/** Step the sim for `seconds` using cmdFn(sim) each tick; returns all events emitted. */
export function run(sim, seconds, cmdFn = idle) {
  const events = [];
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps && !sim.state.ended; i++) {
    sim.step(cmdFn(sim), FIXED_DT);
    events.push(...sim.drainEvents());
  }
  return events;
}

export const expectations = (events, id) => events.filter((e) => e.type === 'expectation' && (!id || e.id === id));
export const actions = (events, id) => events.filter((e) => e.type === 'action' && (!id || e.id === id));
