import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThreat, tickThreat, applySunder, applyTaunt, applyBuffet, resetThreat, selectTarget, threatRatio } from '../src/core/threat.js';
import { script } from './helpers.js';

const cfg = {
  raidPerSecond: script.raid.threatPerSecond,
  autoAttackPerSecond: script.threat.autoAttackPerSecond,
  tauntBonus: script.threat.tauntBonus,
  tauntDuration: script.threat.tauntDuration,
  pullMultiplier: script.threat.pullMultiplier,
};

test('tickThreat grows raid and tank threat only when active', () => {
  const t = createThreat();
  tickThreat(t, 1, cfg, true, true);
  assert.equal(t.raid, cfg.raidPerSecond);
  assert.equal(t.player, cfg.autoAttackPerSecond);
  tickThreat(t, 1, cfg, false, false);
  assert.equal(t.raid, cfg.raidPerSecond);
  assert.equal(t.player, cfg.autoAttackPerSecond);
});

test('applySunder adds, applyBuffet cuts by the fraction, resetThreat zeroes', () => {
  const t = createThreat();
  applySunder(t, script.threat.sunder);
  assert.equal(t.player, script.threat.sunder);
  applyBuffet(t, 0.35);
  assert.ok(Math.abs(t.player - script.threat.sunder * 0.65) < 1e-9);
  resetThreat(t);
  assert.deepEqual([t.player, t.raid], [0, 0]);
});

test('applyTaunt tops the table and forces the target for tauntDuration', () => {
  const t = createThreat();
  t.raid = 1000; t.player = 100;
  applyTaunt(t, 10, cfg);
  assert.equal(t.player, 1000 + cfg.tauntBonus);
  assert.equal(t.tauntUntil, 10 + cfg.tauntDuration);
  // Even if the raid overtakes during the taunt, the target stays on the player.
  t.raid = 5000;
  assert.equal(selectTarget(t, 'player', 11, cfg), 'player');
  assert.equal(selectTarget(t, 'player', 10 + cfg.tauntDuration + 0.01, cfg), 'raid');
});

test('selectTarget hysteresis: raid pulls above player * pullMultiplier, tank regains above 110%', () => {
  const t = createThreat();
  t.player = 1000; t.raid = 999;
  assert.equal(selectTarget(t, 'player', 0, cfg), 'player');
  t.raid = 1001;
  assert.equal(selectTarget(t, 'player', 0, cfg), 'raid');
  // now the raid holds her; 105% is not enough to take her back
  t.player = 1050;
  assert.equal(selectTarget(t, 'raid', 0, cfg), 'raid');
  t.player = 1102;
  assert.equal(selectTarget(t, 'raid', 0, cfg), 'player');
  // nobody has threat yet: stays on the player (initial pull)
  const fresh = createThreat();
  assert.equal(selectTarget(fresh, null, 0, cfg), 'player');
});

test('threatRatio feeds the bar and the danger band', () => {
  const t = createThreat();
  assert.equal(threatRatio(t, cfg), 0, 'nothing on the table');
  t.raid = 10;
  assert.equal(threatRatio(t, cfg), 1, 'raid has threat, tank has none');
  t.player = 1000; t.raid = 500;
  assert.equal(threatRatio(t, cfg), 0.5);
  t.raid = 850;
  assert.ok(threatRatio(t, cfg) > script.threat.dangerBand, 'inside the danger band');
  t.raid = 2000;
  assert.equal(threatRatio(t, cfg), 1, 'clamped');
});
