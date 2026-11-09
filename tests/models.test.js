// Every boss must sculpt into a sane, animatable mesh: no NaNs, a sensible size,
// bones within the skinning limit, and a pose that evaluates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeBossModel, makeAddModel } from '../src/render/gl/bosses.js';
import { Pose, STRIDE } from '../src/render/gl/model.js';
import { MAX_BONES } from '../src/render/gl/shaders.js';

const index = JSON.parse(readFileSync(new URL('../data/encounters/index.json', import.meta.url)));

function check(label, def) {
  const { built } = def;
  assert.ok(built.triangles > 40, `${label}: ${built.triangles} triangles`);
  assert.equal(built.verts.length % STRIDE, 0);
  for (const v of built.verts) assert.ok(Number.isFinite(v), `${label}: non-finite vertex`);
  for (const i of built.indices) assert.ok(i * STRIDE < built.verts.length, `${label}: index out of range`);
  assert.ok(built.bones.length <= MAX_BONES, `${label}: ${built.bones.length} bones`);
  const seen = new Set();
  built.bones.forEach((b, i) => { assert.ok(b.parent < i, `${label}: bone ${b.name} before its parent`); seen.add(b.name); });
  const pose = new Pose(built);
  const mem = {};
  for (const cast of [null, { id: 'x', kind: 'cone', frac: 0.5 }, { id: 'x', kind: 'aoe', frac: 0.9 }, { id: 'x', kind: 'knockback', frac: 0.3 }]) {
    def.animate?.(pose, { t: 1.7, dt: 1 / 60, mem, state: 'grounded', moving: !cast, cast, engaged: true });
    for (const v of pose.matrices) assert.ok(Number.isFinite(v), `${label}: non-finite bone`);
  }
  assert.ok(built.maxz > 0.5, `${label}: model has no height`);
}

for (const raid of index.raids) for (const boss of raid.bosses) {
  test(`${raid.id}/${boss.id} sculpts and animates`, () => {
    check(boss.id, makeBossModel(raid.id, boss.id));
    check(`${boss.id} adds`, makeAddModel(raid.id, boss.id));
  });
}
