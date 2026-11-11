import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { applyTaunt, applyGhostTaunt, createThreat } from '../src/core/threat.js';
import { run } from './helpers.js';

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../data/encounters/${path}.json`, import.meta.url)));
const index = read('index');
const encounters = index.raids.flatMap((r) => r.bosses.map((b) => read(`${r.id === 'onyxia' ? '' : r.id + '/'}${b.file.slice(0, -5)}`)));
const fixture = (path, role = 'tank') => {
  const script = read(path);
  script.player.healPerSecond = 0;
  script.ghostTank.healPerSecond = 0;
  script.ghostTank.healPerSecondWithPlayerHealer = 0;
  script.boss.meleeDamage = 0;
  return createSim(script, { role, start: 'wall', manual: true, freezeHp: true, seed: 7 });
};

test('every ground-start encounter waits for a real pull, even while instructions are being read', () => {
  const pulled = [];
  for (const script of encounters.filter((s) => s.phases[0].bossState === 'grounded')) {
    const sim = createSim(script, { seed: 7 });
    // Some entrances are within body-pull range. Put the player at the
    // furthest floor point from the boss to isolate the automatic deadline.
    const b = sim.state.world.boss;
    const points = script.arena.floor.flatMap((floor) => floor.poly);
    const point = points.sort((a, c) => Math.hypot(c[0] - b.x, c[1] - b.y) - Math.hypot(a[0] - b.x, a[1] - b.y))[0];
    sim.state.world.player.x = point[0]; sim.state.world.player.y = point[1];
    run(sim, 25);
    if (b.engaged || sim.state.hp !== script.phases[0].hpFrom) pulled.push(script.id);
  }
  assert.deepEqual(pulled, []);
});

test('normal encounter schedules never manufacture a DPS aggro pull', () => {
  const fakePulls = encounters.flatMap((s) => s.phases.flatMap((p) => p.actions.filter((a) => s.actions[a.id].kind === 'aggroPull').map(() => s.id)));
  assert.deepEqual([...new Set(fakePulls)], []);
});

test('a threat-building button never matches the top table or forces a target', () => {
  const ids = ['razorgore', 'vaelastrasz', 'broodlord-lashlayer', 'nefarian', 'viscidus', 'sapphiron', 'kelthuzad'];
  for (const original of encounters.filter((s) => ids.includes(s.id))) {
    const script = structuredClone(original);
    const sim = createSim(script, { start: 'wall', startPhase: script.phases.find((p) => p.bossState === 'grounded').id, manual: true, freezeHp: true });
    const s = sim.state, b = s.world.boss;
    s.world.player.x = b.x; s.world.player.y = b.y;
    s.threat.player = 100; s.threat.raid = 100000; b.target = 'raid';
    sim.step({ abilities: ['taunt'] });
    assert.equal(b.target, 'raid', script.id);
    assert.ok(s.threat.player < 10000, script.id);
    assert.ok(s.threat.tauntUntil <= s.t, script.id);
  }
});

test('Taunt matches highest threat without creating a permanent bonus, including a ghost tank taunt', () => {
  const cfg = { tauntDuration: 3, tauntLead: 1.6, tauntBonus: 200 };
  const t = createThreat();
  t.player = 100; t.raid = 1000; t.ghost = 800;
  applyTaunt(t, 5, cfg);
  assert.equal(t.player, 1000);
  t.raid = 2000;
  applyGhostTaunt(t, 6, cfg);
  assert.equal(t.ghost, 2000);
  assert.equal(t.ghostTauntUntil, 9);
});

test('Lucifron: Doom deals its damage when it expires, and dispelling prevents it', () => {
  const sim = fixture('molten-core/lucifron', 'healer');
  sim.triggerAction('impendingDoom');
  run(sim, 9.8);
  assert.equal(sim.state.world.player.hp, sim.state.world.player.maxHp);
  run(sim, 0.3);
  assert.equal(sim.state.world.player.hp, sim.state.world.player.maxHp - 2000);
  const removed = fixture('molten-core/lucifron', 'healer');
  removed.triggerAction('impendingDoom');
  run(removed, 9);
  removed.step({ abilities: ['dispel'] });
  run(removed, 2);
  assert.equal(removed.state.world.player.hp, removed.state.world.player.maxHp);
});

test('Garr: Magma Shackles actually slows movement, and dispelling restores it', () => {
  const normal = fixture('molten-core/garr', 'healer');
  const slowed = fixture('molten-core/garr', 'healer');
  slowed.triggerAction('magmaShackles');
  const x = normal.state.world.player.x;
  normal.state.world.player.heading = 0; slowed.state.world.player.heading = 0;
  run(normal, 0.5, () => ({ forward: 1 }));
  run(slowed, 0.5, () => ({ forward: 1 }));
  assert.ok(Math.abs((slowed.state.world.player.x - x) / (normal.state.world.player.x - x) - 0.4) < 0.01);
  slowed.step({ abilities: ['dispel'] });
  const before = slowed.state.world.player.x;
  run(slowed, 0.5, () => ({ forward: 1 }));
  assert.ok(Math.abs(slowed.state.world.player.x - before - slowed.script.player.speed * 0.5) < 0.01);
});

test('Gluth: Decimate changes the existing zombies to 5% and sends them at his current position', () => {
  const sim = fixture('naxxramas/gluth', 'offtank');
  sim.triggerAction('zombieA'); sim.triggerAction('zombieB');
  const before = sim.state.world.whelps.map((a) => a.uid);
  sim.triggerAction('decimate');
  assert.deepEqual(sim.state.world.whelps.map((a) => a.uid), before);
  assert.ok(sim.state.world.whelps.every((a) => a.hp === 0.05 && a.target === 'boss'));
  const zombie = sim.state.world.whelps[0], b = sim.state.world.boss;
  b.x = 0; b.y = 0;
  zombie.x = 20; zombie.y = 0;
  run(sim, 0.3);
  assert.ok(zombie.x < 20 && Math.abs(zombie.y) < 0.01);
  assert.deepEqual(sim.state.world.whelps.map((a) => a.uid), before, 'no replacement wave');
});

test('Gluth: reaching the boss consumes a zombie and restores 5% boss health', () => {
  const sim = fixture('naxxramas/gluth');
  sim.state.hp = 0.5;
  sim.triggerAction('zombieA');
  const zombie = sim.state.world.whelps[0], boss = sim.state.world.boss;
  zombie.x = boss.x; zombie.y = boss.y;
  sim.step();
  assert.equal(sim.state.world.whelps.length, 0);
  assert.ok(Math.abs(sim.state.hp - 0.55) < 0.001);
  assert.ok(sim.drainEvents().some((e) => e.type === 'addConsumed'));
});

test('Gluth: consumed health survives the next tick and delays the phase deadline', () => {
  const script = read('naxxramas/gluth');
  const sim = createSim(script, { start: 'wall', manual: true, seed: 7 });
  run(sim, 20);
  const s = sim.state, end = s.phaseEnd, before = s.hp;
  sim.triggerAction('zombieA');
  Object.assign(s.world.whelps[0], { x: s.world.boss.x, y: s.world.boss.y });
  sim.step();
  assert.ok(s.hp > before + 0.049);
  assert.ok(s.phaseEnd > end, 'the original kill deadline must move with the healing');
  sim.step();
  assert.ok(s.hp > before + 0.049, 'the damage clock must not erase restored health');
});

test('Hakkar: a Son leaves its cloud where it dies; a marker alone never protects from Siphon', () => {
  const sim = fixture('zul-gurub/hakkar', 'ranged');
  sim.triggerAction('sonOfHakkar');
  const son = sim.state.world.whelps[0];
  son.x = 15; son.y = 10; son.hp = 0.01;
  Object.assign(sim.state.world.player, { x: 16, y: 10, heading: Math.PI });
  sim.step({ abilities: ['attack'] });
  const cloud = sim.state.world.hazards.find((h) => h.applies === 'poisonousBlood');
  assert.ok(cloud, 'killing the Son creates the cloud');
  assert.ok(Math.hypot(cloud.centroid.x - 15, cloud.centroid.y - 10) < 0.01);
  assert.equal(sim.state.world.whelps.length, 0);
  run(sim, 0.5);
  assert.ok(sim.state.debuffs.some((d) => d.actionId === 'poisonousBlood' && d.on === 'player'));

  const empty = fixture('zul-gurub/hakkar', 'ranged');
  Object.assign(empty.state.world.player, empty.script.positions.cloudSpot);
  empty.triggerAction('siphonPoison');
  run(empty, 8.1);
  assert.equal(empty.state.metrics.siphonUnpoisoned, 1, 'an empty nominal cloud spot gives no immunity');
  assert.ok(empty.script.phases.every((p) => !p.actions.some((a) => a.id === 'poisonCloud')), 'clouds are not scheduled independently of Son deaths');
});

test('Sapphiron: Frost Aura cannot damage an iceblocked player', () => {
  const sim = fixture('naxxramas/sapphiron');
  sim.state.debuffs.push({ on: 'player', actionId: 'iceboltYou', until: 20 });
  sim.triggerAction('frostAura');
  assert.equal(sim.state.world.player.hp, sim.state.world.player.maxHp);
  sim.state.debuffs = [];
  sim.triggerAction('frostAura');
  assert.ok(sim.state.world.player.hp < sim.state.world.player.maxHp);
});

test('Magmadar: Tranq removes a boss Frenzy without needing a cast, ending its faster swings and breaths', () => {
  const sim = fixture('molten-core/magmadar', 'ranged');
  sim.triggerAction('frenzy');
  const buff = sim.state.debuffs.find((d) => d.actionId === 'frenzy');
  assert.equal(buff.on, 'boss');
  assert.equal(buff.meleeSpeedMult, 2.5);
  assert.equal(sim.state.world.boss.cast, null, 'Frenzy is a buff, not an interruptible cast');
  sim.step({ abilities: ['interrupt'] });
  assert.ok(!sim.state.debuffs.some((d) => d.actionId === 'frenzy'));
  const events = run(sim, 9);
  assert.ok(!events.some((e) => e.type === 'action' && e.id === 'lavaBreath'), 'removed Frenzy cannot trigger breaths');
});

test('Magmadar: leaving Frenzy up produces breaths and expires naturally', () => {
  const sim = fixture('molten-core/magmadar', 'ranged');
  sim.triggerAction('frenzy');
  const events = run(sim, 9);
  assert.equal(events.filter((e) => e.type === 'action' && e.id === 'lavaBreath').length, 2);
  assert.ok(!sim.state.debuffs.some((d) => d.actionId === 'frenzy'));
});

test('a ghost tank can regain a taunt-immune boss from the raid through earned threat', () => {
  const sim = fixture('naxxramas/sapphiron', 'healer');
  const s = sim.state;
  s.world.boss.target = 'raid';
  s.threat.raid = 1000; s.threat.ghost = 2000;
  sim.step();
  assert.equal(s.world.boss.target, 'ghost');
  assert.ok(!sim.drainEvents().some((e) => e.type === 'ghostTaunt'));
});

test('all 62 encounters declare their review scope and remaining limits', () => {
  assert.equal(encounters.length, 62);
  for (const script of encounters) {
    assert.equal(script.fidelity.status, 'partial', script.id);
    assert.match(script.fidelity.reviewed, /^\d{4}-\d\d-\d\d$/);
    assert.ok(script.fidelity.limitations.some((s) => s.length > 30), script.id);
  }
});

test('Warrior Taunt requires melee range instead of working from 16–20 yards', () => {
  for (const script of encounters) {
    const a = script.playerAbilities.taunt;
    if (a?.kind === 'taunt' && a.label === 'Taunt') assert.equal(a.range, 5, script.id);
  }
  const sim = fixture('molten-core/lucifron');
  const b = sim.state.world.boss;
  sim.state.world.player.x = b.x + sim.script.boss.radius + 10;
  sim.state.world.player.y = b.y;
  sim.step({ abilities: ['taunt'] });
  assert.ok(sim.drainEvents().some((e) => e.type === 'abilityFailed' && e.reason === 'range'));
});
