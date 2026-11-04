import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLane, createCracks, pulseCracks, updateHazards, hazardAt, hazardCountdown, pointInHazard } from '../src/core/hazards.js';
import { script } from './helpers.js';

const laneDef = script.deepBreathLanes[0];
const breath = script.actions.deepBreath;
const eruption = script.actions.eruption;

test('lane lifecycle: warning -> active -> removed', () => {
  const hz = [createLane(laneDef, breath, 0)];
  const h = hz[0];
  assert.equal(h.state, 'warning');
  assert.equal(h.activeAt, breath.warning);
  assert.equal(h.endsAt, breath.warning + breath.active);
  assert.equal(hazardCountdown(h, 1), breath.warning - 1);
  assert.deepEqual(updateHazards(hz, breath.warning - 0.01), []);
  const t1 = updateHazards(hz, breath.warning);
  assert.equal(t1.length, 1);
  assert.equal(t1[0].to, 'active');
  assert.equal(h.state, 'active');
  assert.equal(hazardCountdown(h, breath.warning + 1), breath.active - 1);
  const t2 = updateHazards(hz, h.endsAt);
  assert.equal(t2[0].to, 'ended');
  assert.equal(hz.length, 0, 'lanes are removed when they end');
});

test('cracks: idle -> warning -> active -> idle and they persist', () => {
  const hz = createCracks(script.eruptionCracks);
  assert.equal(hz.length, script.eruptionCracks.length);
  assert.ok(hz.every((h) => h.state === 'idle' && h.kind === 'crack'));
  assert.equal(hazardCountdown(hz[0], 0), null);
  pulseCracks(hz, eruption, 10);
  assert.ok(hz.every((h) => h.state === 'warning' && h.activeAt === 10 + eruption.warning));
  updateHazards(hz, 10 + eruption.warning);
  assert.ok(hz.every((h) => h.state === 'active'));
  const tr = updateHazards(hz, 10 + eruption.warning + eruption.active);
  assert.equal(tr.length, hz.length);
  assert.ok(hz.every((h) => h.state === 'idle'));
  assert.equal(hz.length, script.eruptionCracks.length, 'cracks stay on the floor between pulses');
});

test('hazardAt filters by kind and state', () => {
  const hz = [createLane(laneDef, breath, 0), ...createCracks(script.eruptionCracks)];
  const crack = hz[1];
  const c = crack.centroid;
  assert.ok(pointInHazard(crack, c.x, c.y));
  assert.equal(hazardAt(hz, c.x, c.y, 'crack').id, crack.id);
  assert.equal(hazardAt(hz, c.x, c.y, 'crack', ['active']), null, 'idle crack filtered out');
  assert.equal(hazardAt(hz, 0, 0, 'lane', ['warning', 'active']).kind, 'lane');
  assert.equal(hazardAt(hz, 40, 0, 'lane'), null);
  assert.equal(hazardAt(hz, 0, 0, null).kind, 'lane', 'kind null matches any');
});
