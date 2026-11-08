// "Where should I be?" Computes the ideal position for the player's role, the
// ideal tank position (which the ghost tank follows), and the ideal boss
// position/facing. Both renderers use these for the glowing path and outlines.

import { rad, dist, angleTo, escapeLane, escapeCircle, onFloor, pointInPoly } from './geometry.js';
import { bossAtSpot } from './expectations.js';
import { roleMatches } from './scoring.js';

export const TANK_ROLES = ['tank', 'offtank'];
export const isTankRole = (role) => TANK_ROLES.includes(role);

/** Name of the spot a phase assigns to `key` (tank, boss, pickup, melee, ranged, healer, raid). */
export function spotName(state, script, key, fallback = null) {
  const def = state.phaseDef;
  const name = (def && def.spots && def.spots[key]) || fallback;
  return name && script.positions[name] ? name : null;
}

function spot(state, script, key, fallback) {
  const name = spotName(state, script, key, fallback);
  return name ? script.positions[name] : null;
}

/** Keep a point out of every telegraphed or active hazard. Moving out of one can land in another, so it repeats until clear. */
export function dodgeHazards(x, y, state, reason) {
  for (let pass = 0; pass < 4; pass++) {
    const r = dodgeOnce(x, y, state, reason);
    const settled = r.x === x && r.y === y;
    x = r.x; y = r.y; reason = r.reason;
    if (settled) break;
  }
  return { x, y, reason };
}

function dodgeOnce(x, y, state, reason) {
  const w = state.world;
  for (const h of w.hazards) {
    if (h.carried || h.applies) continue;                                  // you cannot step out of the bomb you are carrying
    if (h.state === 'idle' && h.kind !== 'crack') continue;   // idle cracks are still not a place to stand
    if (h.kind === 'lane') {
      const e = escapeLane(x, y, h.from, h.to, h.width, 4);
      if (e.moved) {
        // The lane has two edges. Take whichever exit is the shorter walk for the player.
        const shift = Math.hypot(e.x - x, e.y - y) || 1;
        const across = h.width + 8;   // edge to edge, plus the 4 yd margin on each side
        const other = { x: e.x - ((e.x - x) / shift) * across, y: e.y - ((e.y - y) / shift) * across };
        const d1 = dist(w.player.x, w.player.y, e.x, e.y), d2 = dist(w.player.x, w.player.y, other.x, other.y);
        const pick = d2 < d1 ? other : e;
        x = pick.x; y = pick.y; reason = 'dodgeLane';
      }
    } else if (h.kind === 'zone') {
      const c = h.centroid, r = h.radius || 6;
      const e = escapeCircle(x, y, c.x, c.y, r, 2.5);
      if (e.moved) { x = e.x; y = e.y; reason = 'dodgeZone'; }
    } else if (h.kind === 'crack' && pointInPoly(x, y, h.poly)) {
      const c = h.centroid;
      const r = Math.max(...h.poly.map(([px, py]) => dist(px, py, c.x, c.y)));
      const e = escapeCircle(x, y, c.x, c.y, r, 1.5);
      x = e.x; y = e.y; reason = h.state === 'idle' ? reason : 'dodgeZone';
    }
  }
  return { x, y, reason };
}

/**
 * Ideal position for the tank (the player in a tank role, the ghost tank otherwise).
 * reason: 'approach' | 'tankSpot' | 'pickupSpot' | 'dodgeLane' | 'dodgeZone' | 'whelps' | 'holdWhelps' | 'wait'
 */
export function idealTankPos(state, script, who = 'player') {
  const w = state.world;
  const b = w.boss;
  const me = who === 'ghost' ? w.ghost : w.player;
  const phaseDef = state.phaseDef;
  if (!phaseDef) return { x: me.x, y: me.y, reason: 'wait' };

  if (b.state === 'airborne' || b.state === 'takeoff' || b.state === 'landing') {
    const ps = spot(state, script, 'pickup', 'pickupSpot') || spot(state, script, 'tank', 'tankSpot');
    let x = ps.x, y = ps.y, reason = 'pickupSpot';
    if (who === 'player' && state.role === 'offtank' && b.state !== 'landing') {
      // Off-tank: intercept loose adds, then hold the pack on the off-tank spot.
      let nearest = null, nd = Infinity, held = 0;
      for (const wh of w.whelps) {
        if (wh.target === 'raid') { const d = dist(me.x, me.y, wh.x, wh.y); if (d < nd) { nd = d; nearest = wh; } }
        else if (wh.target === 'player') held++;
      }
      const hold = script.positions.offtankWhelpSpot;
      if (nearest) { x = nearest.x; y = nearest.y; reason = 'whelps'; }
      else if (held && hold) { x = hold.x; y = hold.y; reason = 'holdWhelps'; }
    }
    return dodgeHazards(x, y, state, reason);
  }

  const ts = spot(state, script, 'tank', 'tankSpot');
  if (b.passive || b.state === 'submerged') return dodgeHazards(ts.x, ts.y, state, 'tankSpot');
  const mine = who === 'player' ? 'player' : 'ghost';
  if (!b.engaged || b.target !== mine) {
    // Go and take her: a point at taunt range on the near side of the boss.
    const range = Math.min((script.playerAbilities.taunt || { range: 16 }).range, script.boss.meleeRange) - 1;
    const a = angleTo(b.x, b.y, me.x, me.y);
    if (who === 'ghost') me.viaSpot = false;
    return { x: b.x + Math.cos(a) * range, y: b.y + Math.sin(a) * range, reason: 'approach' };
  }
  if (who === 'ghost') {
    // The ghost tank drags her through the boss spot and on to the tank spot, so she parks on the
    // spot facing the tank instead of stopping wherever she caught up with it.
    const bs = spot(state, script, 'boss', 'bossSpot');
    if (bs && !me.viaSpot) {
      if (dist(me.x, me.y, bs.x, bs.y) > 2.5 && dist(b.x, b.y, bs.x, bs.y) > 4) return dodgeHazards(bs.x, bs.y, state, 'tankSpot');
      me.viaSpot = true;
    }
  }
  return dodgeHazards(ts.x, ts.y, state, 'tankSpot');
}

/** The add the DPS should be on right now: the nearest kill-first add, or any killable add while the boss cannot be hit. */
export function killTarget(state) {
  const w = state.world, p = w.player, b = w.boss;
  const bossUp = b.state === 'grounded' && b.engaged && !b.passive;
  const pool = w.whelps.filter((a) => a.priority || (a.killable && !bossUp));
  let best = null, bd = Infinity;
  for (const a of pool) { const d = dist(p.x, p.y, a.x, a.y); if (d < bd) { bd = d; best = a; } }
  return best;
}

/** A melee position: behind or beside the boss, clear of any rear cone. */
function meleePos(state, script) {
  const b = state.world.boss;
  const p = state.world.player;
  const fixed = spot(state, script, 'melee', 'meleeSpot');
  if (fixed) return { x: fixed.x, y: fixed.y, reason: 'meleeSpot' };
  const cones = script.boss.cones || {};
  const hasTail = Object.values(cones).some((c) => c.facing === 'back');
  // Flank angle: straight behind unless she has a tail, then 110 degrees off her nose on the player's side.
  const side = Math.sin(angleTo(b.x, b.y, p.x, p.y) - b.heading) >= 0 ? 1 : -1;
  const off = hasTail ? rad(97) * side : Math.PI;
  const r = script.boss.radius + 2.5;
  let x = b.x + Math.cos(b.heading + off) * r, y = b.y + Math.sin(b.heading + off) * r;
  if (!onFloor(x, y, script.arena.floor)) { x = b.x + Math.cos(b.heading + Math.PI / 2 * side) * r; y = b.y + Math.sin(b.heading + Math.PI / 2 * side) * r; }
  return { x, y, reason: 'meleeSpot' };
}

/** Ideal position for the player's own role. */
export function idealPlayerPos(state, script) {
  const w = state.world, b = w.boss;
  if (!state.phaseDef) return { x: w.player.x, y: w.player.y, reason: 'wait' };
  const bomb = w.hazards.find((h) => h.carried && h.state === 'warning');
  if (bomb) return { x: bomb.runTo.x, y: bomb.runTo.y, reason: 'runOut' };
  const castDef = b.cast && script.actions[b.cast.id];
  // Cover: for a cast you can hide from, or when a stacking debuff has reached the point where you drop it.
  const heavy = state.debuffs.find((d) => d.on === 'player' && d.shelterAt && d.stacks >= d.shelterAt && d.safeSpots);
  const hideFrom = (castDef && castDef.safeSpots && roleMatches(castDef.safeRoles, state.role, state.tankRole)) ? castDef.safeSpots : heavy ? heavy.safeSpots : null;
  if (hideFrom) {
    let best = null, bd = Infinity;
    for (const n of hideFrom) { const s = script.positions[n]; if (!s) continue; const d = dist(w.player.x, w.player.y, s.x, s.y); if (d < bd) { bd = d; best = s; } }
    if (best) return { x: best.x, y: best.y, reason: 'los' };
  }
  // Something coming that a debuff protects you from: go and get it from its cloud.
  for (const u of state.upcoming) {
    const def = script.actions[u.id];
    if (!def || !def.safeIfDebuff || u.in > (def.seekLead ?? 12)) continue;
    if (state.debuffs.some((d) => d.on === 'player' && d.actionId === def.safeIfDebuff)) continue;
    let best = null, bd = Infinity;
    for (const h of w.hazards) { if (h.applies !== def.safeIfDebuff || h.state !== 'active') continue; const d = dist(w.player.x, w.player.y, h.centroid.x, h.centroid.y); if (d < bd) { bd = d; best = h; } }
    if (best) return { x: best.centroid.x, y: best.centroid.y, reason: 'los' };
  }
  // A telegraphed pulse around the boss: walk out of its radius for the cast.
  if (castDef && castDef.moveOut && castDef.radius && roleMatches(castDef.moveOut === true ? null : castDef.moveOut, state.role, state.tankRole)) {
    const need = script.boss.radius + castDef.radius + 3;
    const p = w.player;
    if (dist(p.x, p.y, b.x, b.y) < need) {
      for (const a of [angleTo(b.x, b.y, p.x, p.y), angleTo(b.x, b.y, w.raid.anchor.x, w.raid.anchor.y)]) {
        const x = b.x + Math.cos(a) * need, y = b.y + Math.sin(a) * need;
        if (onFloor(x, y, script.arena.floor)) return { x, y, reason: 'moveOut' };
      }
    }
  }
  if (state.tankRole) return idealTankPos(state, script, 'player');
  const raid = script.positions[state.phaseDef.raidSpot];
  if (state.role === 'offtank') {
    // Someone else has the boss: this job is the adds, then holding them on the assigned spot.
    let nearest = null, nd = Infinity, held = 0;
    for (const a of w.whelps) {
      if (a.target === 'raid') { const d = dist(w.player.x, w.player.y, a.x, a.y); if (d < nd) { nd = d; nearest = a; } }
      else if (a.target === 'player') held++;
    }
    if (nearest) return dodgeHazards(nearest.x, nearest.y, state, 'whelps');
    const s = spot(state, script, 'offtank', 'offtankSpot') || raid;
    return dodgeHazards(s.x, s.y, state, held ? 'holdWhelps' : 'raidSpot');
  }
  if (state.role === 'melee') {
    const add = killTarget(state);
    if (add) return dodgeHazards(add.x, add.y, state, 'killAdd');
    if (b.state === 'grounded' && b.engaged && !b.passive) return dodgeHazards(meleePos(state, script).x, meleePos(state, script).y, state, 'meleeSpot');
    const s = spot(state, script, 'melee', 'meleeSpot') || raid;
    return dodgeHazards(s.x, s.y, state, 'raidSpot');
  }
  const key = state.role === 'healer' ? 'healer' : 'ranged';
  const s = spot(state, script, key, key + 'Spot') || raid;
  return dodgeHazards(s.x, s.y, state, key + 'Spot');
}

/** Ideal boss position and facing, or null when it does not apply (airborne). */
export function idealBossPos(state, script) {
  const b = state.world.boss;
  if (b.state !== 'grounded' || !state.phaseDef) return null;
  const name = spotName(state, script, 'boss', 'bossSpot');
  if (!name) return null;
  const s = script.positions[name];
  return { x: s.x, y: s.y, heading: rad(s.heading ?? 90), satisfied: bossAtSpot(state, script, name) };
}
