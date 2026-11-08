// Expectation checks. The encounter script names a check by string; this
// registry maps the name to a predicate over the sim state. Keep each check
// tiny and side-effect free so the set can be ported to Lua one for one.

import { dist, distToPolyline, inCone, rad, angleDelta } from './geometry.js';
import { hazardAt } from './hazards.js';

/** Is the player within `nearWallDistance` of the back wall? */
export function nearWall(state, script) {
  const p = state.world.player;
  if (!script.arena.backWall) return true;
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

/** Is the boss on the tank (the player in a tank role, the ghost tank otherwise)? */
export function onTank(state) {
  const b = state.world.boss;
  return b.state === 'grounded' && b.target === (state.tankRole ? 'player' : 'ghost');
}

/** Is the player outside every lane that is warning or active? */
export function outsideLane(state) {
  const p = state.world.player;
  return !hazardAt(state.world.hazards, p.x, p.y, 'lane', ['warning', 'active']);
}

/** Is the player outside every telegraphed or active hazard of any kind? */
export function outsideHazard(state) {
  const p = state.world.player;
  return !hazardAt(state.world.hazards, p.x, p.y, null, ['warning', 'active']);
}

/** Is she on the tank and not facing the raid (the state to restore after a fear)? */
export function facingAway(state, script) {
  return hasAggro(state) && !bossFacingRaid(state, script);
}

/** Are all the player's adds aggroed onto them (none heading for the raid)? Adds another group is handling do not count. */
export function whelpsPicked(state) {
  const ws = state.world.whelps.filter((w) => w.target !== 'ghost');
  if (!ws.length) return false;
  return ws.every((w) => w.target === 'player');
}

/** Is the player within attack range of the boss for their role? */
export function inRange(state, script) {
  const p = state.world.player, b = state.world.boss;
  const r = attackRange(state, script);
  return dist(p.x, p.y, b.x, b.y) - script.boss.radius <= r;
}

export function attackRange(state, script) {
  const roleDef = script.roles && script.roles[state.role];
  if (roleDef && roleDef.attackRange != null) return roleDef.attackRange;
  return state.role === 'melee' ? 5 : state.role === 'healer' ? 40 : 30;
}

/** Is the player clear of every frontal cone of the boss? */
export function notInFront(state, script) {
  const p = state.world.player, b = state.world.boss;
  if (b.state !== 'grounded') return true;
  for (const c of Object.values(script.boss.cones || {})) {
    if (c.facing === 'back') continue;
    if (inCone(p.x, p.y, b.x, b.y, b.heading, rad(c.angle), c.range)) return false;
  }
  return true;
}

/** No dispellable debuff is outstanding on anyone. */
export function noDispellable(state) {
  return !state.debuffs.some((d) => d.dispel && d.dispel !== 'none');
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

/** Is the raid anchor inside the boss's main frontal cone (i.e. is she facing the raid)? */
export function bossFacingRaid(state, script) {
  const b = state.world.boss;
  const r = state.world.raid.anchor;
  const cones = script.boss.cones || {};
  const c = cones[script.boss.facingCone || 'breath'] || Object.values(cones).find((x) => x.facing !== 'back');
  if (!c) return false;
  return inCone(r.x, r.y, b.x, b.y, b.heading, rad(c.angle), c.range);
}

export const CHECKS = { nearWall, threatLead, hasAggro, onTank, outsideLane, outsideHazard, facingAway, whelpsPicked, inRange, notInFront, noDispellable };

/** Evaluate a named check. */
export function runCheck(name, state, script) {
  const fn = CHECKS[name];
  if (!fn) throw new Error(`Unknown expectation check: ${name}`);
  return fn(state, script);
}
