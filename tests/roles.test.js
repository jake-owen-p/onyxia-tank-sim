// The non-tank roles: the ghost tank holds her, DPS manage threat, healers keep
// the tank up and dispel, and every role can play the full fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT, createSim } from '../src/core/sim.js';
import { computeScore } from '../src/core/scoring.js';
import { script, makeSim, run, idle, roleBot } from './helpers.js';

const press = (...ids) => () => ({ ...idle(), abilities: ids });

test('legacy role id mt maps to tank', () => {
  const sim = makeSim({ role: 'mt', start: 'wall', manual: true });
  assert.equal(sim.state.role, 'tank');
  assert.equal(sim.state.tankRole, true);
});

test('melee: the ghost tank pulls and holds her; the player builds threat with attacks and pulls aggro by spamming', () => {
  const sim = makeSim({ role: 'melee', start: 'entrance', manual: true });
  const s = sim.state, b = s.world.boss, g = s.world.ghost;
  assert.equal(g.tanking, true);
  assert.equal(s.tankRole, false);
  const ev = run(sim, 25, roleBot('melee'));
  const eng = ev.find((e) => e.type === 'engage');
  assert.ok(eng && eng.by === 'ghost', 'the ghost tank engages her');
  assert.equal(b.target, 'ghost');
  assert.ok(s.metrics.attacks > 5, 'the bot attacked');
  assert.equal(s.metrics.aggroPulls, undefined, 'a disciplined bot never pulls');
  // Now spam attacks regardless of the bar: she comes off the tank, then the tank taunts her back.
  const ev2 = run(sim, 45, (sm) => { const c = roleBot('melee')(sm); if (sm.state.abilities.gcdUntil <= sm.state.t && sm.state.feedback.inRangeOk && !c.abilities.length) c.abilities.push('attack'); return c; });
  assert.ok(ev2.some((e) => e.type === 'aggroPulled'), 'spamming pulls aggro');
  assert.ok(s.metrics.aggroPulls >= 1);
  assert.ok(s.metrics.attacksInRed >= 1, 'attacks in the red band are counted');
  assert.ok(ev2.some((e) => e.type === 'ghostTaunt'), 'the ghost tank taunts her back');
});

test('ranged: standing in her front is charged, standing with the raid is not', () => {
  const sim = makeSim({ role: 'ranged', start: 'wall', manual: true });
  const s = sim.state, p = s.world.player, b = s.world.boss;
  assert.equal(b.target, 'ghost');
  run(sim, 2, roleBot('ranged'));
  assert.equal(s.metrics.playerInFront, undefined);
  // step in front of her
  p.x = b.x + Math.cos(b.heading) * 20; p.y = b.y + Math.sin(b.heading) * 20;
  run(sim, 1);
  assert.ok(s.metrics.playerInFront > 0.5);
  assert.equal(s.feedback.inFront, true);
  sim.triggerAction('flameBreath');
  const ev = run(sim, 4);
  assert.ok(ev.some((e) => e.type === 'damage' && e.source === 'flameBreath'), 'the breath hit the player');
  assert.equal(s.metrics.breathsTaken, 1);
});

test('healer: Flame Breath hurts the tank, a heal fixes it, a low tank raises a HEAL note', () => {
  const sim = makeSim({ role: 'healer', start: 'wall', manual: true });
  const s = sim.state, g = s.world.ghost;
  assert.equal(g.hp, g.maxHp);
  g.hp = g.maxHp * 0.8;
  sim.triggerAction('flameBreath');
  const ev = run(sim, script.actions.flameBreath.cast + 0.2);
  assert.ok(g.hp < g.maxHp * 0.5, 'the breath took the tank under half');
  assert.ok(ev.some((e) => e.type === 'tankLow'));
  const note = s.cues.beats.find((b) => b.status === 'pending' && b.cue === 'healLow');
  assert.ok(note, 'a heal note is up');
  const ev2 = run(sim, FIXED_DT, press('heal'));
  const beat = ev2.find((e) => e.type === 'beat');
  assert.ok(beat && beat.cue === 'healLow');
  assert.ok(g.hp > g.maxHp * 0.5);
  assert.equal(s.metrics.heals, 1);
  // a heal on a full tank is wasted
  g.hp = g.maxHp;
  run(sim, 1.6);
  run(sim, FIXED_DT, press('heal'));
  assert.equal(s.metrics.overheals, 1);
});

test('healer: a dispellable debuff on the raid raises a DISPEL note and counts seconds until dispelled', () => {
  const bossWithCurse = {
    ...script,
    roles: { ...script.roles, healer: { ...script.roles.healer, abilities: ['heal', 'dispel'] } },
    actions: { ...script.actions, curse: { kind: 'debuff', label: 'Curse of Doom', dispel: 'curse', duration: 12, tickDamage: 100, target: 'random', count: 5, cast: 0, warn: false, icon: 'roar' } },
  };
  const sim = createSim(bossWithCurse, { role: 'healer', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  assert.ok(sim.triggerAction('curse'));
  const ev = run(sim, 0.5);
  assert.ok(ev.some((e) => e.type === 'debuffApplied' && e.dispel === 'curse'));
  assert.equal(s.debuffs.length, 1);
  assert.ok(s.cues.beats.some((b) => b.status === 'pending' && b.cue === 'dispelIt'));
  assert.ok(s.metrics.debuffSeconds > 0.3);
  const ev2 = run(sim, FIXED_DT, press('dispel'));
  assert.ok(ev2.some((e) => e.type === 'dispelled'));
  assert.equal(s.debuffs.length, 0);
  assert.equal(s.metrics.dispels, 1);
  // nothing left: a second press fails
  run(sim, 1.6);
  const ev3 = run(sim, FIXED_DT, press('dispel'));
  assert.ok(ev3.some((e) => e.type === 'abilityFailed' && e.reason === 'nothing'));
});

test('abilities outside the role are refused', () => {
  const sim = makeSim({ role: 'melee', start: 'wall', manual: true });
  const ev = run(sim, FIXED_DT, press('taunt'));
  assert.ok(ev.some((e) => e.type === 'abilityFailed' && e.reason === 'role'));
  const sim2 = makeSim({ role: 'tank', start: 'wall', manual: true });
  const ev2 = run(sim2, FIXED_DT, press('attack'));
  assert.ok(ev2.some((e) => e.type === 'abilityFailed' && e.reason === 'role'));
});

test('every role completes the full fight with the scripted bot and scores a B or better', () => {
  for (const role of ['tank', 'offtank', 'melee', 'ranged', 'healer']) {
    const sim = makeSim({ role, seed: 7, phaseDurations: { 1: 60, 2: 50, 3: 70 } });
    run(sim, 200, roleBot(role));
    assert.equal(sim.state.result, 'victory', role);
    const s = sim.state;
    const sc = computeScore(script, s.expectations, s.phaseMetrics, s.phasesPlayed, s.role, s.cues.log);
    assert.ok(sc.overall >= 72, `${role} scored ${sc.overall}: ${sc.fixes.map((f) => f.title + (f.detail ? ' (' + f.detail + ')' : '')).join(' | ')}`);
    assert.equal(s.metrics.deaths, undefined, `${role} died`);
    assert.equal(s.metrics.tankDeaths, undefined, `${role}: the tank died`);
  }
});

test('carried bomb: follows the player, marks where to run, and only counts against you if it goes off in the raid', () => {
  const bomb = { label: 'Living Bomb', kind: 'hazard', placement: 'player', carried: true, radius: 12, warning: 8, active: 0.5, damage: 1000, raidMetric: 'bombsOnRaid', cast: 0, warn: false, icon: 'eruption' };
  const s2 = { ...script, actions: { ...script.actions, bomb }, continuousMetrics: { ...script.continuousMetrics, bombsOnRaid: { label: 'Bombs in the raid', unit: 'count', penaltyPerUnit: 10 } } };
  // Stay put in the raid: it goes off on top of them.
  const stay = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const p = stay.state.world.player, a = stay.state.world.raid.anchor;
  p.x = a.x; p.y = a.y;
  stay.triggerAction('bomb');
  const z = stay.state.world.hazards.find((h) => h.carried);
  assert.ok(z, 'the zone exists');
  stay.step(idle(), FIXED_DT);
  assert.equal(stay.state.world.idealPlayer.reason, 'runOut');
  p.x += 2;
  stay.step(idle(), FIXED_DT);
  assert.ok(Math.abs(z.centroid.x - p.x) < 0.01, 'the zone follows the player');
  run(stay, 8.2);
  assert.equal(stay.state.metrics.bombsOnRaid, 1);
  // Follow the marker: clear of the raid, no penalty, still takes the hit.
  const go = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  go.triggerAction('bomb');
  run(go, 8.6, roleBot('ranged'));
  assert.equal(go.state.metrics.bombsOnRaid, undefined);
});

test('radial knockback catches you behind her; aoe playerMetric counts a hit inside the radius only', () => {
  const s2 = { ...script, actions: { ...script.actions,
    wrath: { label: 'Wrath', kind: 'knockback', radial: true, knockback: 20, knockbackRange: 25, cast: 0, damage: 1000, warn: false, icon: 'buffet', playerMetric: 'wrathHits' },
    nova: { label: 'Nova', kind: 'aoe', radius: 20, damage: 500, cast: 0, warn: false, icon: 'eruption', playerMetric: 'novaHits' },
  }, continuousMetrics: { ...script.continuousMetrics, wrathHits: { label: 'w', unit: 'count', penaltyPerUnit: 1 }, novaHits: { label: 'n', unit: 'count', penaltyPerUnit: 1 } } };
  const sim = createSim(s2, { role: 'melee', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player, b = s.world.boss;
  p.x = b.x; p.y = b.y - script.boss.radius - 5;     // directly behind her
  sim.triggerAction('wrath');
  assert.equal(s.metrics.wrathHits, 1);
  sim.triggerAction('nova');
  assert.equal(s.metrics.novaHits, 1);
  p.x = 0; p.y = -60;                                 // far away
  sim.triggerAction('nova');
  assert.equal(s.metrics.novaHits, 1, 'out of the radius is safe');
});

test('playerChance decides how often a random effect lands on you', () => {
  const s2 = { ...script, actions: { ...script.actions, curse: { kind: 'debuff', label: 'C', dispel: 'none', duration: 1, target: 'random', playerChance: 1, cast: 0, warn: false, icon: 'roar' }, never: { kind: 'debuff', label: 'N', dispel: 'none', duration: 1, target: 'random', playerChance: 0, cast: 0, warn: false, icon: 'roar' } } };
  const sim = createSim(s2, { role: 'melee', start: 'wall', manual: true, seed: 5 });
  sim.triggerAction('curse');
  assert.equal(sim.state.debuffs[0].on, 'player');
  sim.triggerAction('never');
  assert.equal(sim.state.debuffs[1].on, 'raid');
});
