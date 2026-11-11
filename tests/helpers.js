// Shared test helpers: script loading, a scripted "perfect tank" bot and a
// stepping loop that collects core events.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { dist, angleTo, angleDelta } from '../src/core/geometry.js';
import { killTarget } from '../src/core/ideal.js';

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
 * A scripted tank that follows the sim's own ideal position and Taunts the
 * moment she is not on the player (or to pull). Returns a command function
 * with its own memory.
 */
export function perfectTank() {
  let lastTaunt = -99;
  return (sim) => {
    const s = sim.state;
    const p = s.world.player, b = s.world.boss, ideal = s.world.idealPlayer;
    const close = dist(p.x, p.y, ideal.x, ideal.y) < 2;
    const face = b.state === 'grounded' && b.engaged && close ? b : null;
    const cmd = driveToward(sim, ideal, face);
    const inRange = b.state === 'grounded' && dist(p.x, p.y, b.x, b.y) - sim.script.boss.radius <= sim.script.playerAbilities.taunt.range;
    const ready = s.abilities.readyAt.taunt <= s.t && !s.debuffs.some((d) => d.on === 'player' && d.forbidAbilities);
    if (s.tankRole && inRange && ready && (sim.script.playerAbilities.taunt.kind === 'threat' || b.target !== 'player' || !b.engaged) && !b.passive && p.fearedUntil <= s.t) { cmd.abilities.push('taunt'); lastTaunt = s.t; }
    const castDef = b.cast && sim.script.actions[b.cast.id], kick = sim.script.playerAbilities.interrupt;
    if (castDef && castDef.interruptible && kick && s.abilities.list.includes('interrupt') && s.abilities.readyAt.interrupt <= s.t && p.fearedUntil <= s.t && p.stunnedUntil <= s.t && (castDef.offBoss || dist(p.x, p.y, b.x, b.y) - sim.script.boss.radius <= (kick.range ?? 8))) cmd.abilities.push('interrupt');
    if (s.abilities.list.includes('rage') && s.abilities.readyAt.rage <= s.t && (b.cast?.id === 'bellowingRoar' || p.fearedUntil > s.t)) cmd.abilities.unshift('rage');
    return cmd;
  };
}

/**
 * Scripted bots for the other roles. They follow the sim's ideal position for
 * their role and use their one or two buttons sensibly:
 *  - dps: attack on every global unless the HUD says hold, she is loose, or the raid is holding after the pull
 *  - healer: heal when the tank is under the low-health line, dispel whenever something is up
 */
export function roleBot(role) {
  if (role === 'tank' || role === 'offtank' || role === 'mt') return perfectTank();
  return (sim) => {
    const s = sim.state;
    const p = s.world.player, b = s.world.boss, g = s.world.ghost, ideal = s.world.idealPlayer;
    const close = dist(p.x, p.y, ideal.x, ideal.y) < 1.5;
    const add = (role === 'melee' || role === 'ranged') ? killTarget(s) : null;
    const face = add || (b.state === 'grounded' && b.engaged && close ? b : null);
    const cmd = driveToward(sim, ideal, face);
    const gcdReady = s.abilities.gcdUntil <= s.t;
    if (p.fearedUntil > s.t || s.debuffs.some((d) => d.on === 'player' && d.forbidAbilities)) return cmd;
    const castDef = b.cast && sim.script.actions[b.cast.id];
    const kick = sim.script.playerAbilities.interrupt;
    if (castDef && castDef.interruptible && kick && s.abilities.list.includes('interrupt') && s.abilities.readyAt.interrupt <= s.t && (castDef.offBoss || dist(p.x, p.y, b.x, b.y) - sim.script.boss.radius <= (kick.range ?? 8))) cmd.abilities.push('interrupt');
    if (!gcdReady) return cmd;
    const types = s.roleDef.dispels || (sim.script.playerAbilities.dispel || {}).dispels;
    if (s.abilities.list.includes('dispel') && s.debuffs.some((d) => d.dispel !== 'none' && (!types || types.includes(d.dispel)))) { cmd.abilities.push('dispel'); return cmd; }
    if (role === 'healer') {
      if (g.hp / g.maxHp < 0.8) cmd.abilities.push('heal');
      return cmd;
    }
    const live = b.state === 'grounded' && b.engaged && !b.passive;
    const holding = s.engagedAt != null && s.landedAt == null && s.t - s.engagedAt < sim.script.raid.holdAfterPull;
    if (add) { if (s.feedback.inRangeOk) cmd.abilities.push('attack'); }
    else if (b.state === 'airborne' && sim.script.boss.attackableInAir) { if (s.feedback.inRangeOk) cmd.abilities.push('attack'); }
    else if (live && b.target === 'ghost' && !s.feedback.holdAttack && !holding && s.feedback.inRangeOk) cmd.abilities.push('attack');
    return cmd;
  };
}

export const idle = () => ({ forward: 0, strafe: 0, turn: 0, mouseTurn: 0, abilities: [], jump: false });

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
