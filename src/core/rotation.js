// Press cues: a rhythm-game lane of "press this now" beats. Beats come from
// three sources described in script.rotation:
//   - the filler (Sunder Armor on every global while she is grounded and in range)
//   - cast cues: predicted from the boss schedule, armed when the cast starts
//   - event / hpBelow cues: armed the moment the condition appears
// Every function is pure over `state.rotation` (plus reads of the rest of the
// state) and returns the beats it resolved so the host can emit events.

import { dist } from './geometry.js';

let uid = 0;

export function createRotation() {
  return {
    beats: [],                      // pending beats plus recently resolved ones (kept ~1.5s for the HUD)
    log: [],                        // every resolved beat, oldest first
    combo: 0,
    bestCombo: 0,
    counts: { perfect: 0, good: 0, missed: 0 },
    lastHit: null,                  // { t, ability, status, delta }
    lastEarly: null,                // { t, ability } pressed before the window
    nextFillerAt: null,             // earliest time the next filler beat may be due
    lastPress: {},                  // ability -> time of the last successful press
  };
}

const KEEP_RESOLVED = 1.5;

function cueDefs(script, role) {
  return (script.rotation && script.rotation.cues || []).filter((c) => !c.role || c.role === role);
}

function makeBeat(def, at, phase, t, armed, extra = {}) {
  return {
    uid: ++uid,
    cue: def.id,
    ability: def.ability,
    label: def.label,
    short: def.short || '',
    tip: def.tip || '',
    at,
    early: def.early ?? 0,
    late: def.late ?? 1,
    doneBy: def.doneBy || null,
    armed,
    filler: !!extra.filler,
    phase,
    createdAt: t,
    status: 'pending',
    hitAt: null,
    delta: 0,
    resolvedAt: null,
  };
}

const pending = (rot, pred) => rot.beats.filter((b) => b.status === 'pending' && pred(b));
const pendingFor = (rot, cueId) => rot.beats.find((b) => b.status === 'pending' && b.cue === cueId);

/** Can the ability be pressed by the end of this beat's window? */
function usableBy(state, ability, until) {
  const ready = state.abilities.readyAt[ability] ?? -Infinity;
  return ready <= until;
}

function fillerAllowed(state, script) {
  const f = script.rotation && script.rotation.filler;
  if (!f) return false;
  const b = state.world.boss, p = state.world.player;
  if (b.state !== 'grounded' || !b.engaged || b.passive) return false;
  if (p.fearedUntil > state.t) return false;
  const def = script.playerAbilities[f.ability];
  if (!def) return false;
  return dist(p.x, p.y, b.x, b.y) - script.boss.radius <= def.range;
}

function resolveBeat(rot, beat, status, t, delta = 0) {
  beat.status = status;
  beat.resolvedAt = t;
  beat.delta = delta;
  if (status === 'missed') rot.combo = 0;
  else { rot.combo++; rot.bestCombo = Math.max(rot.bestCombo, rot.combo); beat.hitAt = t; }
  rot.counts[status]++;
  rot.lastHit = { t, ability: beat.ability, status, delta, cue: beat.cue };
  rot.log.push(beat);
  return beat;
}

/**
 * Keep the beat list in step with the world. Call once per tick after the boss
 * and player have moved. Returns the beats resolved as missed this tick.
 */
export function planBeats(state, script, t) {
  const rot = state.rotation;
  const R = script.rotation;
  if (!R) return [];
  const resolved = [];
  const phase = state.phase;

  // Filler: one pending beat at a time while she can be hit.
  const f = R.filler;
  if (f) {
    const cur = pendingFor(rot, f.id);
    if (fillerAllowed(state, script)) {
      if (!cur) {
        const at = Math.max(t, state.abilities.gcdUntil, rot.nextFillerAt ?? t);
        rot.beats.push(makeBeat({ ...f, early: 0 }, at, phase, t, true, { filler: true }));
      }
    } else if (cur) {
      rot.beats.splice(rot.beats.indexOf(cur), 1); // dropped, not missed
    }
  }

  for (const c of cueDefs(script, state.role)) {
    if (c.on === 'cast') {
      const cur = pendingFor(rot, c.id);
      const up = state.upcoming.find((u) => u.id === c.action);
      if (cur && !cur.armed) {
        // predicted notes follow the schedule and vanish if the ability cannot be ready in time
        if (!up || !usableBy(state, c.ability, up.at + (c.offset || 0) + c.late)) rot.beats.splice(rot.beats.indexOf(cur), 1);
        else cur.at = up.at + (c.offset || 0);
      } else if (!cur && up && usableBy(state, c.ability, up.at + (c.offset || 0) + c.late)) {
        rot.beats.push(makeBeat(c, up.at + (c.offset || 0), phase, t, false));
      }
    } else if (c.on === 'hpBelow') {
      const cur = pendingFor(rot, c.id);
      const p = state.world.player, b = state.world.boss;
      const buffUntil = buffFor(state, c.ability);
      const live = b.state === 'grounded' && b.engaged && !b.passive;
      const need = live && p.hp / p.maxHp < c.hp && buffUntil <= t && usableBy(state, c.ability, t + c.late);
      if (need && !cur) rot.beats.push(makeBeat(c, t, phase, t, true));
      else if (!need && cur && p.hp / p.maxHp >= c.hp + 0.1) rot.beats.splice(rot.beats.indexOf(cur), 1);
    }
  }

  // Expire windows.
  for (const b of pending(rot, (x) => x.armed)) {
    if (t > b.at + b.late) {
      resolved.push(resolveBeat(rot, b, 'missed', t));
      if (b.filler && f) rot.nextFillerAt = t + (f.missRespawn ?? 1);
    }
  }

  // Forget resolved beats once the HUD has shown them.
  rot.beats = rot.beats.filter((b) => b.status === 'pending' || t - b.resolvedAt < KEEP_RESOLVED);
  return resolved;
}

function buffFor(state, ability) {
  const b = state.abilities.buffs;
  if (ability === 'shieldBlock') return b.shieldBlockUntil;
  if (ability === 'defensive') return b.defensiveUntil;
  if (ability === 'fearImmune') return b.fearImmuneUntil;
  return -Infinity;
}

/**
 * A boss cast started: arm the predicted beat (or create one if it was not
 * predicted). A buff pressed ahead of the note that still covers the window is
 * credited as a pre-empt: good, or perfect if it was inside the perfect window.
 * Returns the beats resolved this way.
 */
export function onCastStarted(state, script, actionId, t) {
  const rot = state.rotation;
  const perfect = (script.rotation.windows && script.rotation.windows.perfect) ?? 0.3;
  const resolved = [];
  for (const c of cueDefs(script, state.role)) {
    if (c.on !== 'cast' || c.action !== actionId) continue;
    const at = t + (c.offset || 0);
    let cur = pendingFor(rot, c.id);
    const covered = buffFor(state, c.ability) >= at + c.late;
    if (cur) { cur.armed = true; cur.at = at; }
    else if (covered || usableBy(state, c.ability, at + c.late)) { cur = makeBeat(c, at, state.phase, t, true); rot.beats.push(cur); }
    else continue;   // on cooldown for the whole window: no note to miss
    if (covered) {
      const pressedAt = rot.lastPress[c.ability] ?? t;
      const delta = pressedAt - at;
      resolved.push(resolveBeat(rot, cur, Math.abs(delta) <= perfect ? 'perfect' : 'good', t, delta));
    }
  }
  return resolved;
}

/**
 * A core event happened: create the beats that react to it, and resolve any
 * pending beat whose `doneBy` names this event (the job was done without the key,
 * e.g. whelps picked up by walking into them). Returns the beats resolved.
 */
export function onRotationEvent(state, script, eventType, t) {
  const rot = state.rotation;
  const resolved = [];
  const perfect = (script.rotation && script.rotation.windows && script.rotation.windows.perfect) ?? 0.3;
  for (const b of pending(rot, (x) => x.doneBy === eventType)) {
    const delta = t - b.at;
    if (t > b.at + b.late) continue;
    resolved.push(resolveBeat(rot, b, delta <= perfect ? 'perfect' : 'good', t, delta));
  }
  for (const c of cueDefs(script, state.role)) {
    if (c.on !== 'event' || c.event !== eventType) continue;
    if (pendingFor(rot, c.id)) continue;
    const at = t + (c.offset || 0);
    if (!usableBy(state, c.ability, at + c.late)) continue;
    rot.beats.push(makeBeat(c, at, state.phase, t, true));
  }
  return resolved;
}

/**
 * The player pressed an ability. `result` is 'ok' or the failure reason from
 * useAbility. Returns the resolved beat (perfect/good) or null.
 */
export function onAbilityPress(state, script, ability, t, result) {
  const rot = state.rotation;
  const R = script.rotation;
  if (!R) return null;
  const perfect = (R.windows && R.windows.perfect) ?? 0.3;
  if (result === 'ok') rot.lastPress[ability] = t;
  const candidates = pending(rot, (b) => b.ability === ability && (b.armed || t >= b.at - b.early)).sort((a, b) => Math.abs(a.at - t) - Math.abs(b.at - t));
  const beat = candidates[0];
  if (!beat) return null;
  if (result === 'ok') {
    if (t >= beat.at - beat.early && t <= beat.at + beat.late) {
      const delta = t - beat.at;
      const status = Math.abs(delta) <= perfect || (beat.early === 0 && delta <= perfect) ? 'perfect' : 'good';
      const out = resolveBeat(rot, beat, status, t, delta);
      if (beat.filler) rot.nextFillerAt = null;
      return out;
    }
    return null;
  }
  if ((result === 'gcd' || result === 'cooldown') && beat.at - t > 0 && beat.at - t <= 0.6) {
    rot.lastEarly = { t, ability };
  }
  return null;
}

/** Drop pending beats (run ended, phase skipped). Nothing is scored. */
export function clearPending(state) {
  const rot = state.rotation;
  rot.beats = rot.beats.filter((b) => b.status !== 'pending');
  rot.nextFillerAt = null;
}

/** Per-phase rotation tallies from a resolved-beat log. */
export function tallyBeats(log, phaseId = null) {
  const c = { perfect: 0, good: 0, missed: 0, total: 0 };
  for (const b of log) {
    if (phaseId != null && b.phase !== phaseId) continue;
    if (c[b.status] != null) c[b.status]++;
    c.total++;
  }
  return c;
}

/** Longest run of non-missed beats in a log. */
export function bestComboOf(log) {
  let best = 0, cur = 0;
  for (const b of log) {
    if (b.status === 'missed') cur = 0; else { cur++; if (cur > best) best = cur; }
  }
  return best;
}
