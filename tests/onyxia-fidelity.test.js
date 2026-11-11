import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { script, makeSim, run, idle } from './helpers.js';

const press = (...abilities) => ({ ...idle(), abilities });

test('Onyxia: threat burst adds a fixed amount and cannot taunt across a large deficit', () => {
  const sim = makeSim({ start: 'wall', manual: true, freezeHp: true });
  const s = sim.state;
  s.threat.player = 100;
  // The wall preset starts with raid members ahead of the player.
  run(sim, FIXED_DT);
  assert.equal(s.world.boss.target, 'raid');
  const before = s.threat.player;
  sim.step(press('taunt'), FIXED_DT);
  assert.equal(s.world.boss.target, 'raid', 'a threat ability must not force this taunt-immune boss to switch');
  assert.ok(Math.abs(s.threat.player - before - script.playerAbilities.taunt.threat - script.threat.autoAttackPerSecond * FIXED_DT) < 0.01);
  assert.ok(s.threat.tauntUntil <= s.t, 'no forced-target duration');
});

test('Onyxia: Fireball follows its primary target and wipes only that target, not splash victims', () => {
  const data = structuredClone(script);
  data.actions.fireball.playerChance = 1;
  const sim = createSim(data, { seed: 7, startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
  const s = sim.state;
  s.threat.player = 2000; s.threat.ghost = 1000;
  sim.triggerAction('fireball');
  run(sim, data.actions.fireball.cast + 0.1);
  s.world.player.x += 20;
  run(sim, data.actions.fireball.travel + 0.1);
  assert.equal(s.threat.player, 0, 'the primary target loses threat even after moving during flight');
  assert.equal(s.threat.ghost, 1000, 'another target retains threat');
  assert.ok(s.world.player.hp < s.world.player.maxHp, 'a targeted Fireball cannot be sidestepped like a ground zone');
});

test('Onyxia: landing retains threat left after the air phase', () => {
  const sim = makeSim({ startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
  sim.state.threat.player = 6000;
  sim.setPhase(3);
  run(sim, script.boss.landingDuration + 0.1);
  assert.equal(sim.state.world.boss.target, 'player');
  assert.ok(sim.state.threat.player >= 6000, 'landing itself must not erase tank threat');
});

test('Onyxia: takeoff begins with a grounded walk toward the entrance', () => {
  const sim = makeSim({ start: 'wall', manual: true, freezeHp: true });
  const b = sim.state.world.boss, before = b.y;
  sim.setPhase(2);
  run(sim, 1);
  assert.equal(b.z, 0, 'she stays on the ground while crossing the room');
  assert.ok(b.y < before, 'she walks toward the entrance');
  assert.ok(b.y > script.positions.hoverIdle.y, 'she does not teleport to the takeoff point');
});

test('Onyxia: Deep Breath warns from its start position, then flies across the room', () => {
  const sim = makeSim({ startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
  sim.triggerAction('deepBreath');
  let lane;
  for (let i = 0; i < 15 / FIXED_DT; i++) {
    lane = sim.state.world.hazards.find((h) => h.kind === 'lane');
    if (lane) break;
    sim.step(idle(), FIXED_DT);
  }
  assert.ok(lane, 'a warning starts once she reaches the edge');
  const b = sim.state.world.boss;
  assert.ok(Math.hypot(b.x - lane.from[0], b.y - lane.from[1]) < 0.6, 'the warning must match her visible position');
  run(sim, script.actions.deepBreath.warning + script.actions.deepBreath.active / 2);
  assert.ok(Math.hypot(b.x - lane.from[0], b.y - lane.from[1]) > 20, 'she flies along the breath path');
  assert.ok(Math.hypot(b.x - (lane.from[0] + lane.to[0]) / 2, b.y - (lane.from[1] + lane.to[1]) / 2) < 2, 'halfway through the sweep she is near its midpoint');
});

test('Onyxia: Fireball wiping one raider preserves everyone else, including a player caught in splash', () => {
  const data = structuredClone(script);
  data.actions.fireball.playerChance = 0;
  const sim = createSim(data, { seed: 7, startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
  const s = sim.state;
  s.threat.player = 2000;
  s.threat.raidMembers.fill(1000);
  s.threat.raid = 1000;
  sim.triggerAction('fireball');
  run(sim, data.actions.fireball.cast + 0.05);
  const projectile = s.world.projectiles[0];
  assert.ok(projectile, 'Fireball completed its cast');
  const target = s.world.raid.dots[projectile.raidIndex];
  const other = (projectile.raidIndex + 1) % s.threat.raidMembers.length;
  const before = s.threat.raidMembers[other];
  Object.assign(s.world.player, { x: target.x, y: target.y });
  const events = run(sim, data.actions.fireball.travel + 0.1);
  assert.equal(s.threat.player, 2000, 'splash damage must not erase player threat');
  assert.ok(s.threat.raidMembers[projectile.raidIndex] < 20, 'only the primary raider starts rebuilding from zero');
  assert.ok(s.threat.raidMembers[other] >= before, 'another raider retains their accumulated threat');
  assert.ok(s.threat.raid > 1000, 'the remaining raid is still on the threat table');
  assert.ok(events.some((e) => e.type === 'damage' && e.source === 'fireball'), 'the player was caught in splash');
});

test('Onyxia: Berserker Rage prevents fear, expires, and breaks an active fear when ready', () => {
  const sim = makeSim({ startPhase: 3, start: 'wall', manual: true, freezeHp: true });
  sim.triggerAction('bellowingRoar');
  sim.step(press('rage'), FIXED_DT);
  let events = run(sim, 2);
  assert.ok(events.some((e) => e.type === 'fearResisted'));
  assert.ok(sim.state.world.player.fearedUntil <= sim.state.t);
  run(sim, 9);
  sim.triggerAction('bellowingRoar');
  events = run(sim, 2);
  assert.ok(events.some((e) => e.type === 'feared'), 'immunity has expired');
  sim.step(press('rage'), FIXED_DT);
  assert.ok(sim.drainEvents().some((e) => e.type === 'abilityFailed' && e.reason === 'cooldown'));
  run(sim, 18);
  sim.triggerAction('bellowingRoar');
  run(sim, 2);
  assert.ok(sim.state.world.player.fearedUntil > sim.state.t);
  sim.step(press('rage'), FIXED_DT);
  assert.ok(sim.state.world.player.fearedUntil <= sim.state.t, 'Berserker Rage can be used while feared');
});

test('Onyxia: reading at the entrance does not pull the boss or advance HP', () => {
  const sim = makeSim({ start: 'entrance' });
  const events = run(sim, 40);
  assert.equal(sim.state.world.boss.engaged, false);
  assert.equal(sim.state.hp, 1);
  assert.equal(events.some((e) => e.type === 'engage'), false);
});

test('Onyxia: a real taunt remains immune even if a caller assigns that ability', () => {
  const data = structuredClone(script);
  data.playerAbilities.taunt.kind = 'taunt';
  const sim = createSim(data, { seed: 7, start: 'wall', manual: true });
  sim.step(press('taunt'), FIXED_DT);
  assert.ok(sim.drainEvents().some((e) => e.type === 'abilityFailed' && e.reason === 'immune'));
  assert.equal(sim.state.threat.tauntUntil, -Infinity);
});

test('Onyxia: a scheduled Deep Breath waits for a Fireball cast instead of disappearing', () => {
  const sim = makeSim({ startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
  sim.triggerAction('fireball');
  sim.state.schedule.push({ id: 'deepBreath', nextAt: 0.1, every: null, jitter: 0, fired: 0 });
  const events = run(sim, 20);
  assert.ok(events.some((e) => e.type === 'hazardWarn' && e.kind === 'lane'));
  assert.ok(events.some((e) => e.type === 'action' && e.id === 'deepBreath'));
});

test('Onyxia: ranged attacks work in the air, melee attacks do not', () => {
  for (const role of ['ranged', 'tank', 'melee']) {
    const sim = makeSim({ role, startPhase: 2, start: 'pickup', manual: true, freezeHp: true });
    const b = sim.state.world.boss;
    Object.assign(sim.state.world.player, { x: b.x + 10, y: b.y });
    sim.step(press('attack'), FIXED_DT);
    const events = sim.drainEvents();
    assert.equal(events.some((e) => e.type === 'attack'), role === 'ranged', role);
  }
});

test('Onyxia: Knock Away cuts the current raider victim without cutting the tank or another raider', () => {
  const sim = makeSim({ start: 'wall', manual: true, freezeHp: true });
  const s = sim.state, b = s.world.boss;
  s.threat.player = 10; b.target = 'raid';
  const target = s.threat.raidTarget, other = (target + 1) % s.threat.raidMembers.length;
  const before = s.threat.raidMembers[target], untouched = s.threat.raidMembers[other];
  Object.assign(s.world.raid.dots[target], { x: b.x, y: b.y + 10 });
  sim.triggerAction('knockAway');
  assert.equal(s.threat.raidMembers[target], before * 0.75);
  assert.equal(s.threat.raidMembers[other], untouched);
  assert.equal(s.threat.player, 10);
});
