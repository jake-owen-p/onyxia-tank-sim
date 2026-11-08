// Scoring: expectation instances (on time / late / missed) and the end-of-run
// grade. Pure data in, pure data out.

import { tallyCues, bestComboOf } from './presscues.js';

let uid = 0;

/**
 * Create a pending expectation instance from a script definition.
 *  - `deadline`: time by which the check must pass for "on time" (null for onEvent)
 *  - `graceEnd`: time after which it is "missed"
 */
export function createInstance(def, phase, t, { deadline = null, graceEnd = null, event = null, notBefore = null } = {}) {
  return {
    uid: ++uid,
    id: def.id,
    type: def.type,
    label: def.label,
    tip: def.tip || '',
    phase,
    createdAt: t,
    deadline,
    graceEnd,
    event,
    notBefore,
    status: 'pending',
    resolvedAt: null,
    lateBy: 0,
  };
}

export function resolve(inst, status, t) {
  inst.status = status;
  inst.resolvedAt = t;
  if (status === 'late') inst.lateBy = Math.max(0, t - (inst.deadline ?? inst.createdAt));
  return inst;
}

/**
 * Compute the score for a finished (or in-progress) run.
 * @param {object} script  the encounter script
 * @param {Array}  log     expectation instances (all phases)
 * @param {object} phaseMetrics  { [phaseId]: { metricId: number } }
 * @param {Array<number>} phasesPlayed ids of phases that ran
 * @param {object} metricDefs script.continuousMetrics
 * @param {string} role 'mt' | 'offtank'
 * @param {Array}  cueLog resolved press-cue notes (state.cues.log)
 */
export function computeScore(script, log, phaseMetrics, phasesPlayed, role = 'mt', cueLog = []) {
  const g = script.grading;
  const cuePts = g.cuePoints || 0;
  const bw = g.cueWeights || { perfect: 1, good: 0.6, missed: 0 };
  const metricDefs = script.continuousMetrics;
  const phases = [];
  for (const pid of phasesPlayed) {
    const phaseDef = script.phases.find((p) => p.id === pid);
    const insts = log.filter((i) => i.phase === pid && i.status !== 'pending');
    let expScore = 1;
    if (insts.length) {
      let sum = 0;
      for (const i of insts) sum += g.expectationWeights[i.status] ?? 0;
      expScore = sum / insts.length;
    }
    const metrics = phaseMetrics[pid] || {};
    let penalty = 0;
    const metricRows = [];
    const relevant = relevantMetricIds(phaseDef, metricDefs, role, holdsBoss(script, role));
    for (const mid of relevant) {
      const def = metricDefs[mid];
      const v = metrics[mid] || 0;
      let p = 0;
      if (!def.info) {
        if (def.unit === 's') p = v * (def.penaltyPerSecond || 0);
        else p = v * (def.penaltyPerUnit || 0);
      }
      penalty += p;
      metricRows.push({ id: mid, label: def.label, unit: def.unit, value: v, penalty: p, severe: !def.info && def.severe != null && v >= def.severe, info: !!def.info });
    }
    // Showing up is part of the job. A tank has to hold the boss, DPS have to be hitting it when they safely
    // can, and a healer who loses the tank has not done their job, whatever else went right.
    const pm = metrics;
    let activity = null, roleFactor = 1;
    if (TANK_ROLES.includes(role) && pm.tankWindow > 1) activity = 1 - (pm.bossLooseSeconds || 0) / pm.tankWindow;
    else if ((role === 'melee' || role === 'ranged') && pm.dpsWindow > 1) activity = 1 - ((pm.dpsIdle || 0) + (pm.outOfRange || 0)) / pm.dpsWindow;
    if (phaseDef && phaseDef.skipActivity && roleMatches(phaseDef.skipActivity === true ? null : phaseDef.skipActivity, role, holdsBoss(script, role))) activity = null;
    if (activity != null) { activity = Math.max(0, Math.min(1, activity)); roleFactor = Math.min(1, activity / (g.fullActivity ?? 0.7)); }
    if (role === 'healer') roleFactor = Math.pow(0.5, pm.tankDeaths || 0);
    const expPoints = expScore * g.expectationPoints * roleFactor;
    const metricPoints = Math.max(0, g.metricPoints - penalty);
    const beats = tallyCues(cueLog, pid);
    const cueScore = beats.total ? (beats.perfect * (bw.perfect ?? 1) + beats.good * (bw.good ?? 0.6) + beats.missed * (bw.missed ?? 0)) / beats.total : 1;
    const total = Math.round(expPoints + metricPoints + cueScore * cuePts);
    phases.push({
      id: pid,
      name: phaseDef ? phaseDef.name : `Phase ${pid}`,
      subtitle: phaseDef ? phaseDef.subtitle : '',
      total,
      grade: gradeFor(total, g.grades),
      expectations: insts,
      counts: countStatuses(insts),
      metrics: metricRows,
      cues: { ...beats, score: cueScore, points: Math.round(cueScore * cuePts) },
      activity,
    });
  }
  const overall = phases.length ? Math.round(phases.reduce((s, p) => s + p.total, 0) / phases.length) : 0;
  return {
    overall,
    grade: gradeFor(overall, g.grades),
    phases,
    cues: { ...tallyCues(cueLog), bestCombo: bestComboOf(cueLog) },
    fixes: topFixes(script, log, phases, cueLog),
  };
}

export function gradeFor(score, grades) {
  for (const g of grades) if (score >= g.min) return g.grade;
  return grades[grades.length - 1].grade;
}

export function countStatuses(insts) {
  const c = { ontime: 0, late: 0, missed: 0 };
  for (const i of insts) if (c[i.status] != null) c[i.status]++;
  return c;
}

const TANK_ROLES = ['tank', 'offtank', 'mt'];

/** Does this role hold the boss in this fight? An off-tank with `holdsBoss: false` works the adds instead. */
export function holdsBoss(script, role) {
  const r = role === 'mt' ? 'tank' : role;
  return TANK_ROLES.includes(r) && !(script && script.roles && script.roles[r] && script.roles[r].holdsBoss === false);
}

/**
 * Does a role filter (string or list) include `role`? Groups: `dps` is melee and ranged, `tanks` is whoever
 * holds the boss, `nontank` is everyone else. `holding` says whether this role holds the boss in this fight.
 */
export function roleMatches(spec, role, holding = TANK_ROLES.includes(role)) {
  if (!spec) return true;
  const r = role === 'mt' ? 'tank' : role;
  const list = Array.isArray(spec) ? spec : [spec];
  return list.some((x) => x === r || (x === 'mt' && r === 'tank') || (x === 'tanks' && holding) || (x === 'dps' && (r === 'melee' || r === 'ranged')) || (x === 'nontank' && !holding));
}

/**
 * Metrics worth showing for a phase. A metric definition may limit itself with
 * `roles` (role filter), `phases` (phase ids) and `bossStates`; the phase's
 * expectations add the metrics they name.
 */
function relevantMetricIds(phaseDef, metricDefs, role, holding) {
  const ids = new Set();
  for (const [id, def] of Object.entries(metricDefs)) {
    if (!roleMatches(def.roles, role, holding)) continue;
    if (def.phases && phaseDef && !def.phases.includes(phaseDef.id)) continue;
    if (def.bossStates && phaseDef && !def.bossStates.includes(phaseDef.bossState || 'grounded')) continue;
    ids.add(id);
  }
  if (phaseDef) for (const e of phaseDef.expectations) {
    if (!roleMatches(e.role, role, holding)) continue;
    if (e.metric && metricDefs[e.metric]) ids.add(e.metric);
  }
  return [...ids];
}

/**
 * The three most important things to fix, ranked by lost points.
 * Expectation misses and severe metrics compete on the same scale.
 */
export function topFixes(script, log, phases, cueLog = []) {
  const items = new Map();
  const bump = (key, item, weight) => {
    const cur = items.get(key);
    if (cur) { cur.weight += weight; cur.count++; }
    else items.set(key, { ...item, weight, count: 1 });
  };
  for (const i of log) {
    if (i.status === 'missed') bump(`e:${i.id}`, { title: i.label, tip: i.tip, kind: 'missed' }, 10);
    else if (i.status === 'late') bump(`e:${i.id}`, { title: i.label, tip: i.tip, kind: 'late' }, 4 + Math.min(6, i.lateBy));
  }
  // Metric tips come from the expectation that names the metric, or a generic line.
  const metricTip = {};
  for (const p of script.phases) for (const e of p.expectations) if (e.metric) metricTip[e.metric] = { title: e.label, tip: e.tip };
  for (const [id, def] of Object.entries(script.continuousMetrics || {})) if (def.tip && !metricTip[id]) metricTip[id] = { title: def.label, tip: def.tip };
  for (const p of phases) {
    for (const m of p.metrics) {
      if (!m.severe || m.penalty <= 0) continue;
      const t = metricTip[m.id] || { title: m.label, tip: '' };
      bump(`m:${m.id}`, { title: t.title, tip: t.tip, kind: 'metric', detail: `${formatMetric(m)} in ${p.name}` }, m.penalty);
    }
  }
  // Missed press cues, grouped by cue.
  const missedBeats = {};
  for (const b of cueLog) if (b.status === 'missed') { const m = missedBeats[b.cue] || (missedBeats[b.cue] = { beat: b, n: 0 }); m.n++; }
  for (const { beat, n } of Object.values(missedBeats)) {
    bump(`c:${beat.cue}`, { title: beat.label, tip: beat.tip, kind: 'cue', detail: `${n} missed` }, n * 6);
    items.get(`c:${beat.cue}`).count = n;
  }
  return [...items.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((f) => ({ title: f.title, tip: f.tip, kind: f.kind, count: f.count, detail: f.detail || (f.count > 1 ? `${f.count} times` : '') }));
}

export function formatMetric(m) {
  if (m.unit === 's') return `${m.value.toFixed(1)}s`;
  return `${Math.round(m.value)}`;
}
