import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pointInPoly, inCone, angleDelta, turnToward, normAngle, laneRect, escapeLane,
  moveWithCollision, onFloor, rad, distToSegment, distToPolyline,
} from '../src/core/geometry.js';
import { script } from './helpers.js';

const square = [[0, 0], [10, 0], [10, 10], [0, 10]];
const chamber = script.arena.floor.find((f) => f.id === 'chamber').poly;

test('pointInPoly: inside, outside, and the lair chamber', () => {
  assert.equal(pointInPoly(5, 5, square), true);
  assert.equal(pointInPoly(11, 5, square), false);
  assert.equal(pointInPoly(-1, 5, square), false);
  assert.equal(pointInPoly(0, 0, chamber), true);
  assert.equal(pointInPoly(0, 60, chamber), false);
  assert.equal(pointInPoly(0, -70, chamber), false); // the ramp is a separate floor polygon
});

test('inCone: apex counts, range and edge angles', () => {
  const half = rad(60) / 2;
  assert.equal(inCone(0, 0, 0, 0, 0, rad(60), 10), true, 'apex');
  assert.equal(inCone(5, 0, 0, 0, 0, rad(60), 10), true, 'straight ahead');
  assert.equal(inCone(10.1, 0, 0, 0, 0, rad(60), 10), false, 'past range');
  // 29 degrees off centre is inside a 60 degree cone, 31 is outside
  const a1 = rad(29), a2 = rad(31);
  assert.equal(inCone(Math.cos(a1) * 5, Math.sin(a1) * 5, 0, 0, 0, rad(60), 10), true);
  assert.equal(inCone(Math.cos(a2) * 5, Math.sin(a2) * 5, 0, 0, 0, rad(60), 10), false);
  // heading wraps: cone facing west (PI) sees a point at -x
  assert.equal(inCone(-5, 0, 0, 0, Math.PI, rad(60), 10), true);
  assert.equal(inCone(5, 0, 0, 0, Math.PI, rad(60), 10), false);
  void half;
});

test('angleDelta and turnToward wrap around +-PI', () => {
  assert.ok(Math.abs(angleDelta(3, -3) - (2 * Math.PI - 6)) < 1e-9, 'shortest way across the seam is positive');
  assert.ok(Math.abs(angleDelta(-3, 3) + (2 * Math.PI - 6)) < 1e-9);
  assert.ok(Math.abs(normAngle(Math.PI * 3) - Math.PI) < 1e-9);
  assert.ok(Math.abs(turnToward(3.0, -3.0, 0.1) - 3.1) < 1e-9, 'turns the short way, across the seam');
  const stepped = turnToward(3.1, -3.0, 0.1);
  assert.ok(Math.abs(stepped - (3.2 - 2 * Math.PI)) < 1e-9, 'crosses the seam and is normalised');
  assert.ok(Math.abs(turnToward(3.1, -3.1, 0.1) + 3.1) < 1e-9, 'snaps across the seam when within maxStep');
  assert.equal(turnToward(0, 0.05, 0.1), 0.05, 'snaps when within maxStep');
  assert.ok(Math.abs(turnToward(0, 1, 0.1) - 0.1) < 1e-9, 'limited by maxStep');
});

test('laneRect builds a 4-point rectangle of the right width', () => {
  const r = laneRect([0, 50], [0, -47], 22);
  assert.equal(r.length, 4);
  assert.ok(Math.abs(Math.hypot(r[0][0] - r[3][0], r[0][1] - r[3][1]) - 22) < 1e-9);
  assert.ok(pointInPoly(0, 0, r));
  assert.ok(pointInPoly(10.9, 0, r));
  assert.ok(!pointInPoly(11.1, 0, r));
});

test('escapeLane moves a point sideways out of a lane and leaves clear points alone', () => {
  const from = [0, 50], to = [0, -47];
  const e = escapeLane(0, 19, from, to, 22, 3);
  assert.equal(e.moved, true);
  assert.ok(Math.abs(Math.abs(e.x) - 14) < 1e-9, 'half width plus margin');
  assert.equal(e.y, 19, 'no movement along the lane');
  const clear = escapeLane(20, 19, from, to, 22, 3);
  assert.equal(clear.moved, false);
  assert.equal(clear.x, 20);
});

test('moveWithCollision slides along the back wall instead of stopping dead', () => {
  const floors = script.arena.floor;
  assert.ok(onFloor(0, 53, floors));
  const r = moveWithCollision(0, 53, 1, 3, floors);
  assert.equal(r.blocked, true);
  assert.equal(r.x, 1, 'x component kept');
  assert.equal(r.y, 53, 'y component dropped');
  const free = moveWithCollision(0, 0, 1, 1, floors);
  assert.deepEqual([free.x, free.y, free.blocked], [1, 1, false]);
  const stuck = moveWithCollision(0, 53.9, 0, 1, floors);
  assert.deepEqual([stuck.x, stuck.y], [0, 53.9]);
});

test('distToSegment / distToPolyline', () => {
  assert.equal(distToSegment(5, 3, 0, 0, 10, 0), 3);
  assert.equal(distToSegment(-4, 0, 0, 0, 10, 0), 4, 'clamped to endpoint');
  assert.ok(Math.abs(distToPolyline(0, 50, script.arena.backWall) - 4) < 0.01, 'tank spot is ~4 yards off the back wall');
});
