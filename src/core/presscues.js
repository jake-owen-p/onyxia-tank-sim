// Press cues: a rhythm-game lane of "press this now" notes. Every note comes
// from an event the boss or the raid produced (she turned on the raid, she
// landed, a whelp wave spawned) and names the ability to press, the moment it
// is due, and the early/late window that still counts. Pure over
// `state.cues` plus reads of the rest of the state; each function returns the
// notes it resolved so the host can emit events.

export function createCues() {
  return {
    beats: [],                      // pending notes plus recently resolved ones (kept ~1.5s for the HUD)
    log: [],                        // every resolved note, oldest first
    combo: 0,
    bestCombo: 0,
    counts: { perfect: 0, good: 0, missed: 0 },
    lastHit: null,                  // { t, ability, status, delta, cue }
    lastEarly: null,                // { t, ability } pressed before the window
  };
}

const KEEP_RESOLVED = 1.5;

import { roleMatches } from './scoring.js';

const cueDefs = (script, role) => ((script.cues && script.cues.list) || []).filter((c) => roleMatches(c.role, role));
const perfectWindow = (script) => (script.cues && script.cues.windows && script.cues.windows.perfect) ?? 0.3;

function makeBeat(def, at, phase, t) {
  return {
    uid: ++makeBeat.uid,
    cue: def.id,
    ability: def.ability,
    label: def.label,
    short: def.short || '',
    tip: def.tip || '',
    at,
    early: def.early ?? 0,
    late: def.late ?? 1,
    doneBy: def.doneBy || null,
    phase,
    createdAt: t,
    status: 'pending',
    hitAt: null,
    delta: 0,
    resolvedAt: null,
  };
}
makeBeat.uid = 0;

const pending = (cues, pred) => cues.beats.filter((b) => b.status === 'pending' && pred(b));
const pendingFor = (cues, cueId) => cues.beats.find((b) => b.status === 'pending' && b.cue === cueId);

/** Can the ability be pressed by the end of this note's window? */
function usableBy(state, ability, until) {
  return (state.abilities.readyAt[ability] ?? -Infinity) <= until;
}

function resolveBeat(cues, beat, status, t, delta = 0) {
  beat.status = status;
  beat.resolvedAt = t;
  beat.delta = delta;
  if (status === 'missed') cues.combo = 0;
  else { cues.combo++; cues.bestCombo = Math.max(cues.bestCombo, cues.combo); beat.hitAt = t; }
  cues.counts[status]++;
  cues.lastHit = { t, ability: beat.ability, status, delta, cue: beat.cue };
  cues.log.push(beat);
  return beat;
}

/**
 * Expire notes whose window has closed and forget resolved ones the HUD has
 * shown. Call once per tick. Returns the notes resolved as missed.
 */
export function planCues(state, t) {
  const cues = state.cues;
  const resolved = [];
  for (const b of pending(cues, () => true)) {
    if (t > b.at + b.late) resolved.push(resolveBeat(cues, b, 'missed', t));
  }
  cues.beats = cues.beats.filter((b) => b.status === 'pending' || t - b.resolvedAt < KEEP_RESOLVED);
  return resolved;
}

/**
 * A core event happened: create the notes that react to it, and resolve any
 * pending note whose `doneBy` names this event (the job was done without the
 * key, e.g. whelps picked up by walking into them). Returns the notes resolved.
 */
export function onCueEvent(state, script, eventType, t) {
  const cues = state.cues;
  const resolved = [];
  const perfect = perfectWindow(script);
  for (const b of pending(cues, (x) => x.doneBy === eventType)) {
    if (t > b.at + b.late) continue;
    const delta = t - b.at;
    resolved.push(resolveBeat(cues, b, delta <= perfect ? 'perfect' : 'good', t, delta));
  }
  for (const c of cueDefs(script, state.role)) {
    if (c.on !== 'event' || c.event !== eventType) continue;
    if (pendingFor(cues, c.id)) continue;
    const at = t + (c.offset || 0);
    if (!usableBy(state, c.ability, at + c.late)) continue;   // on cooldown for the whole window: no note to miss
    cues.beats.push(makeBeat(c, at, state.phase, t));
  }
  return resolved;
}

/**
 * The player pressed an ability. `result` is 'ok' or the failure reason from
 * useAbility. Returns the resolved note (perfect/good) or null.
 */
export function onCuePress(state, script, ability, t, result) {
  const cues = state.cues;
  const perfect = perfectWindow(script);
  const candidates = pending(cues, (b) => b.ability === ability).sort((a, b) => Math.abs(a.at - t) - Math.abs(b.at - t));
  const beat = candidates[0];
  if (!beat) return null;
  if (result === 'ok') {
    if (t >= beat.at - beat.early && t <= beat.at + beat.late) {
      const delta = t - beat.at;
      // A note with no early window is "press now": anything inside the perfect window after it lands is perfect.
      const status = Math.abs(delta) <= perfect ? 'perfect' : 'good';
      return resolveBeat(cues, beat, status, t, delta);
    }
    return null;
  }
  if ((result === 'gcd' || result === 'cooldown') && beat.at - t > 0 && beat.at - t <= 0.6) {
    cues.lastEarly = { t, ability };
  }
  return null;
}

/** Drop pending notes (run ended, phase skipped). Nothing is scored. */
export function clearPendingCues(state) {
  state.cues.beats = state.cues.beats.filter((b) => b.status !== 'pending');
}

/** Per-phase tallies from a resolved-note log (all phases when phaseId is null). */
export function tallyCues(log, phaseId = null) {
  const c = { perfect: 0, good: 0, missed: 0, total: 0 };
  for (const b of log) {
    if (phaseId != null && b.phase !== phaseId) continue;
    if (c[b.status] != null) c[b.status]++;
    c.total++;
  }
  return c;
}

/** Longest run of non-missed notes in a log. */
export function bestComboOf(log) {
  let best = 0, cur = 0;
  for (const b of log) {
    if (b.status === 'missed') cur = 0; else { cur++; if (cur > best) best = cur; }
  }
  return best;
}
