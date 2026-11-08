// Floor hazards: Deep Breath lanes and Eruption cracks. A hazard is a polygon
// with a lifecycle: 'warning' (telegraphed), 'active' (hurts), then removed or
// back to 'idle' (cracks persist as idle polygons between pulses).

import { laneRect, pointInPoly, polyCentroid } from './geometry.js';

let uid = 0;

/** Create a Deep Breath lane in its warning state. */
export function createLane(laneDef, actionDef, t) {
  return {
    uid: ++uid,
    id: laneDef.id,
    kind: 'lane',
    label: actionDef.label,
    poly: laneRect(laneDef.from, laneDef.to, actionDef.laneWidth),
    from: laneDef.from,
    to: laneDef.to,
    width: actionDef.laneWidth,
    state: 'warning',
    warnAt: t,
    activeAt: t + actionDef.warning,
    endsAt: t + actionDef.warning + actionDef.active,
    damage: actionDef.damage,
    hitPlayer: false,
  };
}

/** A circular (or polygon) zone in its warning state: a void zone, fire patch, meteor landing. */
export function createZone(poly, actionDef, t, label = null, extra = {}) {
  return {
    uid: ++uid,
    id: extra.id || `zone${uid}`,
    kind: 'zone',
    label: label || actionDef.label,
    poly,
    centroid: polyCentroid(poly),
    radius: extra.radius || null,
    state: 'warning',
    warnAt: t,
    activeAt: t + (actionDef.warning || 0),
    endsAt: t + (actionDef.warning || 0) + (actionDef.active || 5),
    damage: actionDef.damage || 0,
    tick: !!actionDef.tick,          // damage every second inside instead of once
    carried: false,                  // follows the player until it goes off (Living Bomb and friends)
    nextTickAt: 0,
    hitPlayer: false,
  };
}

/** Persistent crack polygons for phase 3, idle until an Eruption pulses them. */
export function createCracks(crackPolys, label = 'Eruption') {
  return crackPolys.map((poly, i) => ({
    uid: ++uid,
    id: `crack${i}`,
    kind: 'crack',
    label,
    poly,
    centroid: polyCentroid(poly),
    state: 'idle',
    warnAt: Infinity,
    activeAt: Infinity,
    endsAt: Infinity,
    hitPlayer: false,
  }));
}

/** Put every crack into its warning state for an Eruption pulse. */
export function pulseCracks(hazards, actionDef, t) {
  for (const h of hazards) {
    if (h.kind !== 'crack') continue;
    h.state = 'warning';
    h.warnAt = t;
    h.activeAt = t + actionDef.warning;
    h.endsAt = t + actionDef.warning + actionDef.active;
    h.damage = actionDef.damage;
    h.hitPlayer = false;
  }
}

/**
 * Advance hazard states. Returns the list of transitions that happened this tick
 * so the sim can emit events: [{ hazard, to: 'active' | 'ended' }].
 */
export function updateHazards(hazards, t) {
  const transitions = [];
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    if (h.state === 'warning' && t >= h.activeAt) {
      h.state = 'active';
      transitions.push({ hazard: h, to: 'active' });
    }
    if (h.state === 'active' && t >= h.endsAt) {
      if (h.kind === 'crack') {
        h.state = 'idle';
        h.warnAt = h.activeAt = h.endsAt = Infinity;
      } else {
        hazards.splice(i, 1);
      }
      transitions.push({ hazard: h, to: 'ended' });
    }
  }
  return transitions;
}

export function pointInHazard(h, x, y) {
  return pointInPoly(x, y, h.poly);
}

/** First hazard of `kind` (any state unless `states` given) containing the point. */
export function hazardAt(hazards, x, y, kind, states = null) {
  for (const h of hazards) {
    if (kind && h.kind !== kind) continue;
    if (states && !states.includes(h.state)) continue;
    if (pointInPoly(x, y, h.poly)) return h;
  }
  return null;
}

/** Seconds until a hazard changes state (for countdown labels). */
export function hazardCountdown(h, t) {
  if (h.state === 'warning') return Math.max(0, h.activeAt - t);
  if (h.state === 'active') return Math.max(0, h.endsAt - t);
  return null;
}
