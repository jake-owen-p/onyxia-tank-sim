// Expectation checks. The encounter script names a check by string; this
// registry maps the name to a predicate over the sim state. Keep each check
// tiny and side-effect free so the set can be ported to Lua one for one.

import { dist, distToPolyline, inCone, rad, angleDelta } from './geometry.js';
import { hazardAt } from './hazards.js';

/** Is the player within `nearWallDistance` of the back wall? */
export function nearWall(state, script) {
  const p = state.world.player;
  return distToPolyline(p.x, p.y, script.arena.backWall) <= script.arena.nearWallDistance;
}

/** Does the tank hold aggro with a clear lead (above the danger band)? */
export function threatLead(state, script) {
  const th = state.threat;
  if (state.world.boss.target !== 'player') return false;
  if (th.player <= 0) return false;
  return th.raid / (th.player * script.threat.pullMultiplier) < script.threat.dangerBand;
}

/** Is the boss attacking the player? */
export function hasAggro(state) {
  const b = state.world.boss;
  return b.state === 'grounded' && b.target === 'player';
}

/** Is the player outside every lane that is warning or active? */
export function outsideLane(state) {
  const p = state.world.player;
  return !hazardAt(state.world.hazards, p.x, p.y, 'lane', ['warning', 'active']);
}

/** Is she on the tank and not facing the raid (the state to restore after a fear)? */
export function facingAway(state, script) {
  return hasAggro(state) && !bossFacingRaid(state, script);
}

/** Are all live whelps aggroed onto the player (none heading for the raid)? */
export function whelpsPicked(state) {
  const ws = state.world.whelps;
  if (!ws.length) return false;
  return ws.every((w) => w.target === 'player');
}

/** Is the player within a named spot's tolerance? */
export function playerAtSpot(state, script, spotName) {
  const s = script.positions[spotName];
  const p = state.world.player;
  return dist(p.x, p.y, s.x, s.y) <= (s.tolerance ?? 4);
}

/** Is the boss grounded, within a spot's tolerance and facing within its heading tolerance? */
export function bossAtSpot(state, script, spotName) {
  const s = script.positions[spotName];
  const b = state.world.boss;
  if (b.state !== 'grounded') return false;
  if (dist(b.x, b.y, s.x, s.y) > (s.tolerance ?? 6)) return false;
  if (s.heading != null) {
    const d = Math.abs(angleDelta(b.heading, rad(s.heading)));
    if (d > rad(s.headingTolerance ?? 30)) return false;
  }
  return true;
}

/** Is the raid anchor inside the boss's breath cone (i.e. is she facing the raid)? */
export function bossFacingRaid(state, script) {
  const b = state.world.boss;
  const r = state.world.raid.anchor;
  const c = script.boss.cones.breath;
  return inCone(r.x, r.y, b.x, b.y, b.heading, rad(c.angle), c.range);
}

export const CHECKS = { nearWall, threatLead, hasAggro, outsideLane, facingAway, whelpsPicked };

/** Evaluate a named check. */
export function runCheck(name, state, script) {
  const fn = CHECKS[name];
  if (!fn) throw new Error(`Unknown expectation check: ${name}`);
  return fn(state, script);
}
