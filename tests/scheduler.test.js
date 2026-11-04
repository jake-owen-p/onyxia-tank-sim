import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSchedule, dueActions, delayAction, upcoming } from '../src/core/scheduler.js';
import { createRng } from '../src/core/rng.js';

const defs = [
  { id: 'a', first: 5, every: 10, jitter: 2 },
  { id: 'b', first: 1, every: 3, jitter: 0 },
];

test('buildSchedule: first fire times honour first + jitter', () => {
  const s = buildSchedule(defs, 100, createRng(3));
  const a = s.find((e) => e.id === 'a'), b = s.find((e) => e.id === 'b');
  assert.ok(a.nextAt >= 105 && a.nextAt < 107);
  assert.equal(b.nextAt, 101);
});

test('dueActions pops due entries and reschedules within every +- jitter', () => {
  const rng = createRng(5);
  const s = buildSchedule(defs, 0, rng);
  assert.deepEqual(dueActions(s, 0.5, rng), []);
  const due = dueActions(s, 1, rng);
  assert.deepEqual(due, ['b']);
  assert.equal(s.find((e) => e.id === 'b').nextAt, 4);
  const a = s.find((e) => e.id === 'a');
  const firstA = a.nextAt;
  const d2 = dueActions(s, 7, rng);
  assert.ok(d2.includes('a'));
  assert.ok(a.nextAt >= firstA + 8 && a.nextAt <= firstA + 12, 'every +- jitter');
  assert.equal(a.fired, 1);
});

test('delayAction only pushes an entry later, never earlier', () => {
  const rng = createRng(1);
  const s = buildSchedule(defs, 0, rng);
  delayAction(s, 'b', 0, 2.5);
  assert.equal(s.find((e) => e.id === 'b').nextAt, 2.5);
  delayAction(s, 'b', 0, 1);
  assert.equal(s.find((e) => e.id === 'b').nextAt, 2.5);
});

test('upcoming is sorted, within the horizon, with relative times', () => {
  const s = buildSchedule(defs, 0, createRng(9));
  const u = upcoming(s, 0, 4);
  assert.deepEqual(u.map((x) => x.id), ['b']);
  const all = upcoming(s, 0, 30);
  assert.deepEqual(all.map((x) => x.id), ['b', 'a']);
  assert.equal(all[0].in, all[0].at - 0);
});

test('same seed gives the same schedule and the same reschedules', () => {
  const r1 = createRng(42), r2 = createRng(42);
  const s1 = buildSchedule(defs, 0, r1), s2 = buildSchedule(defs, 0, r2);
  assert.deepEqual(s1, s2);
  for (let t = 0; t < 60; t += 0.5) { dueActions(s1, t, r1); dueActions(s2, t, r2); }
  assert.deepEqual(s1, s2);
});
