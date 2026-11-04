// "Where should I be?" Computes the ideal player position, the ideal boss
// position/facing, and drives the ghost tank that walks the correct route.
// Used by both renderers for the glowing path, dotted outlines and ghost figure.

import { rad, dist, angleTo, turnToward, normAngle, escapeLane } from './geometry.js';
import { bossAtSpot } from './expectations.js';

/**
 * Ideal player position for the current state.
 * @returns {{x:number,y:number,reason:string}}
 * reason: 'approach' | 'tankSpot' | 'pickupSpot' | 'dodgeLane' | 'wait'
 */
export function idealPlayerPos(state, script) {
  const w = state.world;
  const b = w.boss;
  const P = script.positions;
  const phaseDef = state.phaseDef;

  if (!phaseDef) return { x: w.player.x, y: w.player.y, reason: 'wait' };

  if (b.state === 'airborne' || b.state === 'takeoff' || b.state === 'landing') {
    // Phase 2: stand on the pickup spot unless a Deep Breath lane covers it.
    let x = P.pickupSpot.x, y = P.pickupSpot.y, reason = 'pickupSpot';
    if (state.role === 'offtank' && b.state !== 'landing') {
      // Off-tank: intercept loose whelps, then hold the pack on the off-tank spot.
      let nearest = null, nd = Infinity;
      let held = 0;
      for (const wh of w.whelps) {
        if (wh.target === 'raid') { const d = dist(w.player.x, w.player.y, wh.x, wh.y); if (d < nd) { nd = d; nearest = wh; } }
        else if (wh.target === 'player') held++;
      }
      if (nearest) { x = nearest.x; y = nearest.y; reason = 'whelps'; }
      else if (held) { x = P.offtankWhelpSpot.x; y = P.offtankWhelpSpot.y; reason = 'holdWhelps'; }
    }
    for (const h of w.hazards) {
      if (h.kind !== 'lane' || h.state === 'idle') continue;
      const e = escapeLane(x, y, h.from, h.to, h.width, 4);
      if (e.moved) {
        // Pick the side the player is already on so the dodge is a short sidestep.
        const alt = escapeLane(x, y, h.from, h.to, h.width, 4);
        const mirror = { x: 2 * x - alt.x, y: 2 * y - alt.y };
        const d1 = dist(w.player.x, w.player.y, alt.x, alt.y);
        const d2 = dist(w.player.x, w.player.y, mirror.x, mirror.y);
        const pick = d2 < d1 ? mirror : alt;
        x = pick.x; y = pick.y; reason = 'dodgeLane';
      }
    }
    return { x, y, reason };
  }

  // Grounded phases.
  if (b.passive) return { x: P.tankSpot.x, y: P.tankSpot.y, reason: 'tankSpot' };
  if (!b.engaged || b.target !== 'player') {
    // Go and take her: a point at taunt range on the near side of the boss.
    const range = Math.min(script.playerAbilities.taunt.range, script.boss.meleeRange) - 1;
    const a = angleTo(b.x, b.y, w.player.x, w.player.y);
    return { x: b.x + Math.cos(a) * range, y: b.y + Math.sin(a) * range, reason: 'approach' };
  }
  return { x: P.tankSpot.x, y: P.tankSpot.y, reason: 'tankSpot' };
}

/** Ideal boss position and facing, or null when it does not apply (airborne). */
export function idealBossPos(state, script) {
  const b = state.world.boss;
  if (b.state !== 'grounded' || !state.phaseDef) return null;
  const s = script.positions.bossSpot;
  return { x: s.x, y: s.y, heading: rad(s.heading), satisfied: bossAtSpot(state, script, 'bossSpot') };
}

export function createGhost(script, pos) {
  return { x: pos.x, y: pos.y, heading: rad(pos.heading ?? 90), moving: false, backpedal: false };
}

/**
 * Move the ghost tank toward the ideal spot at its own pace so it leads the
 * player. It faces the boss when standing or dragging, and its travel
 * direction while walking to a spot before the pull.
 */
export function updateGhost(state, script, dt) {
  const g = state.world.ghost;
  const b = state.world.boss;
  const cfg = script.ghostTank;
  const ideal = state.world.idealPlayer;
  const d = dist(g.x, g.y, ideal.x, ideal.y);
  let faceTarget;
  if (d > 0.3) {
    const a = angleTo(g.x, g.y, ideal.x, ideal.y);
    const step = Math.min(cfg.speed * dt, d);
    g.x += Math.cos(a) * step; g.y += Math.sin(a) * step;
    g.moving = true;
    const dragging = b.state === 'grounded' && b.engaged && b.target === 'player';
    g.backpedal = dragging;
    faceTarget = dragging ? angleTo(g.x, g.y, b.x, b.y) : a;
  } else {
    g.moving = false; g.backpedal = false;
    if (b.state === 'grounded') faceTarget = angleTo(g.x, g.y, b.x, b.y);
    else { const l = script.positions.landSpot; faceTarget = angleTo(g.x, g.y, l.x, l.y); }
  }
  g.heading = turnToward(g.heading, normAngle(faceTarget), rad(cfg.turnRate) * dt);
}
