import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThreat, tickThreat, applyAggroPull, applyTaunt, applyBuffet, resetThreat, selectTarget, threatRatio } from '../src/core/threat.js';
import { script } from './helpers.js';

const cfg = {
  raidPerSecond: script.raid.threatPerSecond,
  autoAttackPerSecond: script.threat.autoAttackPerSecond,
  tauntBonus: script.threat.tauntBonus,
  tauntLead: script.threat.tauntLead,
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

test('applyAggroPull lifts the raid above the tank, applyBuffet cuts by the fraction, resetThreat zeroes', () => {
  const t = createThreat();
  t.player = 1000; t.raid = 400;
  applyAggroPull(t, 1.15);
  assert.equal(t.raid, 1150);
  applyAggroPull(t, 1.05);
  assert.equal(t.raid, 1150, 'never lowers the raid');
  applyBuffet(t, 0.35);
  assert.ok(Math.abs(t.player - 650) < 1e-9);
  resetThreat(t);
  assert.deepEqual([t.player, t.raid], [0, 0]);
});

test('passive threat outpaces the raid, so a tank in melee range keeps her without a button', () => {
  assert.ok(script.threat.autoAttackPerSecond > script.raid.threatPerSecond * script.threat.pullMultiplier);
});

test('applyTaunt matches the table and forces the target for tauntDuration', () => {
  const t = createThreat();
  t.raid = 1000; t.player = 100;
  applyTaunt(t, 10, cfg);
  assert.equal(t.player, 1000, 'Taunt must not award an artificial threat lead');
  assert.equal(t.tauntUntil, 10 + cfg.tauntDuration);
  // Even if the raid overtakes during the taunt, the target stays on the player.
  t.raid = 5000;
  assert.equal(selectTarget(t, 'player', 11, cfg), 'player');
  assert.equal(selectTarget(t, 'player', 10 + cfg.tauntDuration + 0.01, cfg), 'raid');
});

test('selectTarget hysteresis: raid pulls above player * pullMultiplier, tank regains above 110%', () => {
  const t = createThreat();
  const pull = cfg.pullMultiplier;
  t.player = 1000; t.raid = 1000 * pull - 1;
  assert.equal(selectTarget(t, 'player', 0, cfg), 'player');
  t.raid = 1000 * pull + 1;
  assert.equal(selectTarget(t, 'player', 0, cfg), 'raid');
  // now the raid holds her; 105% of the raid is not enough to take her back
  t.player = t.raid * 1.05;
  assert.equal(selectTarget(t, 'raid', 0, cfg), 'raid');
  t.player = t.raid * 1.1 + 1;
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
  t.player = 1000; t.raid = 500 * cfg.pullMultiplier;
  assert.ok(Math.abs(threatRatio(t, cfg) - 0.5) < 1e-9);
  t.raid = 1000 * cfg.pullMultiplier * 0.9;
  assert.ok(threatRatio(t, cfg) > script.threat.dangerBand, 'inside the danger band');
  t.raid = 2000;
  assert.equal(threatRatio(t, cfg), 1, 'clamped');
});
