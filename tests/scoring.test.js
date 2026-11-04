import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInstance, resolve, computeScore, gradeFor, countStatuses, topFixes, formatMetric } from '../src/core/scoring.js';
import { script } from './helpers.js';

const p1 = script.phases[0];
const def = (id) => p1.expectations.find((e) => e.id === id);

test('createInstance/resolve record lateness against the deadline', () => {
  const inst = createInstance(def('pull'), 1, 0, { deadline: 10, graceEnd: 16 });
  assert.equal(inst.status, 'pending');
  resolve(inst, 'late', 12);
  assert.equal(inst.status, 'late');
  assert.equal(inst.resolvedAt, 12);
  assert.ok(Math.abs(inst.lateBy - 2) < 1e-9);
  const onEvent = createInstance(def('wall'), 1, 30, { deadline: 30, graceEnd: 30 });
  resolve(onEvent, 'ontime', 30);
  assert.equal(onEvent.lateBy, 0);
  resolve(createInstance(def('wall'), 1, 5, {}), 'late', 7);
});

test('gradeFor uses the band table', () => {
  const g = script.grading.grades;
  assert.equal(gradeFor(100, g), 'S');
  assert.equal(gradeFor(95, g), 'S');
  assert.equal(gradeFor(94, g), 'A');
  assert.equal(gradeFor(72, g), 'B');
  assert.equal(gradeFor(71, g), 'C');
  assert.equal(gradeFor(40, g), 'D');
  assert.equal(gradeFor(0, g), 'F');
});

function finished(id, status, t = 10, lateBy = 0) {
  const i = createInstance(def(id), 1, 0, { deadline: t, graceEnd: t + 5 });
  i.status = status; i.resolvedAt = t + lateBy; i.lateBy = lateBy;
  return i;
}

test('computeScore: weights and points per phase', () => {
  const perfect = computeScore(script, [finished('pull', 'ontime'), finished('wall', 'ontime')], { 1: {} }, [1]);
  assert.equal(perfect.overall, 100);
  assert.equal(perfect.grade, 'S');
  assert.equal(perfect.phases.length, 1);
  assert.deepEqual(perfect.phases[0].counts, { ontime: 2, late: 0, missed: 0 });

  const half = computeScore(script, [finished('pull', 'ontime'), finished('wall', 'missed')], { 1: {} }, [1]);
  assert.equal(half.overall, 75, '0.5 * 50 expectation points + 30 metric points + 20 rotation points (no beats judged)');
  assert.equal(half.grade, 'B');

  const late = computeScore(script, [finished('pull', 'late', 10, 3)], { 1: {} }, [1]);
  assert.equal(late.overall, 75, 'late is worth half');

  const noExp = computeScore(script, [], { 1: {} }, [1]);
  assert.equal(noExp.overall, 100, 'no expectations judged means full expectation points');
});

test('computeScore: metric penalties cap at the metric points and flag severe', () => {
  const r = computeScore(script, [finished('pull', 'ontime')], { 1: { bossFacingRaid: 20 } }, [1]);
  assert.equal(r.overall, 70, '20s * 3/s = 60 penalty, floored at 0 metric points');
  const row = r.phases[0].metrics.find((m) => m.id === 'bossFacingRaid');
  assert.equal(row.severe, true);
  assert.equal(row.penalty, 60);
  const mild = computeScore(script, [], { 1: { bossFacingRaid: 1 } }, [1]);
  assert.equal(mild.overall, 97);
  assert.equal(mild.phases[0].metrics.find((m) => m.id === 'bossFacingRaid').severe, false);
});

test('computeScore averages the phases played and skips role-gated metrics', () => {
  const r = computeScore(script, [finished('pull', 'ontime')], { 1: {}, 2: { whelpsOnRaid: 30 } }, [1, 2], 'mt');
  assert.equal(r.overall, 100, 'whelpsOnRaid is an off-tank metric');
  const ot = computeScore(script, [], { 1: {}, 2: { whelpsOnRaid: 30 } }, [1, 2], 'offtank');
  assert.equal(ot.overall, Math.round((100 + 70) / 2), '30s of whelps on the raid wipes the 30 metric points');
});

test('topFixes: missed outranks late, severe metrics compete on the same scale', () => {
  const log = [finished('wall', 'late', 10, 1), finished('pull', 'missed')];
  const r = computeScore(script, log, { 1: {} }, [1]);
  assert.equal(r.fixes[0].title, def('pull').label);
  assert.equal(r.fixes[0].kind, 'missed');
  assert.equal(r.fixes[1].kind, 'late');
  assert.ok(r.fixes[0].tip.length > 0, 'tips come from the script');

  const bad = computeScore(script, log, { 1: { bossFacingRaid: 20 } }, [1]);
  assert.equal(bad.fixes[0].kind, 'metric', 'a 60 point facing penalty beats a single miss');
  assert.equal(bad.fixes[0].title, def('facing').label);
  assert.ok(bad.fixes.length <= 3);

  const repeated = computeScore(script, [finished('wall', 'missed'), finished('wall', 'missed')], { 1: {} }, [1]);
  assert.equal(repeated.fixes[0].count, 2);
  assert.equal(repeated.fixes[0].detail, '2 times');
});

test('countStatuses and formatMetric', () => {
  assert.deepEqual(countStatuses([finished('pull', 'ontime'), finished('pull', 'late'), finished('pull', 'late')]), { ontime: 1, late: 2, missed: 0 });
  assert.equal(formatMetric({ unit: 's', value: 2.345 }), '2.3s');
  assert.equal(formatMetric({ unit: 'count', value: 3 }), '3');
  assert.equal(topFixes(script, [], []).length, 0);
});
