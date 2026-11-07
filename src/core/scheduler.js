// Boss action scheduler. Each phase lists actions with `first`, `every` and
// `jitter`. The scheduler keeps the next fire time for each and hands back the
// ones that are due. Random jitter comes from the sim's seeded RNG.

/** Build schedule entries for a list of phase action defs starting at `phaseStart`. */
export function buildSchedule(actionDefs, phaseStart, rng) {
  return actionDefs.map((a) => ({
    id: a.id,
    every: a.every,
    jitter: a.jitter || 0,
    nextAt: phaseStart + a.first + (a.jitter ? rng.range(0, a.jitter) : 0),
    fired: 0,
  }));
}

/** Pop and return all entries due at time t; reschedules them. */
export function dueActions(schedule, t, rng) {
  const due = [];
  for (const s of schedule) {
    if (t >= s.nextAt) {
      due.push(s.id);
      s.fired++;
      if (s.every == null) { s.nextAt = Infinity; continue; }   // one-shot
      const j = s.jitter ? rng.range(-s.jitter, s.jitter) : 0;
      s.nextAt = Math.max(t + 0.5, s.nextAt + s.every + j);
    }
  }
  return due;
}

/** Queue a one-shot firing of `id` at time `at` (follow-up actions such as the eruption after a roar). */
export function scheduleOnce(schedule, id, at) {
  schedule.push({ id, every: null, jitter: 0, nextAt: at, fired: 0, once: true });
}

/** Push an action's next fire time out by `seconds` (used while the boss is mid-cast). */
export function delayAction(schedule, id, t, seconds) {
  const s = schedule.find((e) => e.id === id);
  if (s && s.nextAt < t + seconds) s.nextAt = t + seconds;
}

/** Upcoming actions within `horizon` seconds, soonest first. */
export function upcoming(schedule, t, horizon) {
  return schedule
    .filter((s) => s.nextAt - t <= horizon && Number.isFinite(s.nextAt))
    .map((s) => ({ id: s.id, at: s.nextAt, in: s.nextAt - t }))
    .sort((a, b) => a.at - b.at);
}
