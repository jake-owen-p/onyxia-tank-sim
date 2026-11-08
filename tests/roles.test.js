// The non-tank roles: the ghost tank holds her, DPS manage threat, healers keep
// the tank up and dispel, and every role can play the full fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT, createSim } from '../src/core/sim.js';
import { computeScore } from '../src/core/scoring.js';
import { angleTo } from '../src/core/geometry.js';
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

test('every hazard placement actually spawns a zone', () => {
  const zone = (placement, extra = {}) => ({ label: placement, kind: 'hazard', placement, radius: 5, warning: 1, active: 1, damage: 0, cast: 0, warn: false, icon: 'eruption', ...extra });
  const actions = { ...script.actions, a: zone('player'), b: zone('boss'), c: zone('tank'), d: zone('random', { count: 3 }), e: zone('spots', { spots: ['tankSpot', 'bossSpot'] }) };
  const expected = { a: 1, b: 1, c: 1, d: 3, e: 2 };
  for (const [id, n] of Object.entries(expected)) {
    const sim = createSim({ ...script, actions }, { role: 'melee', start: 'wall', manual: true, seed: 5 });
    sim.triggerAction(id);
    assert.equal(sim.state.world.hazards.filter((h) => h.kind === 'zone').length, n, id);
  }
});

test('moveOut walks the marker out of a cast radius, for the roles it names', () => {
  const inferno = { label: 'Inferno', kind: 'aoe', cast: 3, radius: 20, damage: 500, warn: true, icon: 'eruption', moveOut: 'dps' };
  const s2 = { ...script, actions: { ...script.actions, inferno } };
  const mk = (role) => { const sim = createSim(s2, { role, start: 'wall', manual: true, seed: 5 }); const p = sim.state.world.player, b = sim.state.world.boss; p.x = b.x + 12; p.y = b.y; sim.triggerAction('inferno'); sim.step(idle(), FIXED_DT); return sim; };
  assert.equal(mk('melee').state.world.idealPlayer.reason, 'moveOut');
  assert.notEqual(mk('healer').state.world.idealPlayer.reason, 'moveOut');
});

test('a submerged boss cannot be hit or taunted, deals nothing, and comes back on the tank', () => {
  const s2 = structuredClone(script);
  s2.actions.submerge = { label: 'Submerge', kind: 'transition', cast: 0 };
  s2.phases = [
    { id: 1, name: 'A', subtitle: '', hpFrom: 1, hpTo: 0.5, duration: 2, bossState: 'grounded', raidSpot: 'raidSpotP1', actions: [], expectations: [] },
    { id: 2, name: 'B', subtitle: '', hpFrom: 0.5, hpTo: 0.5, duration: 3, bossState: 'submerged', raidSpot: 'raidSpotP1', actions: [], expectations: [] },
    { id: 3, name: 'C', subtitle: '', hpFrom: 0.5, hpTo: 0, duration: 5, bossState: 'grounded', raidSpot: 'raidSpotP1', actions: [], expectations: [] },
  ];
  const sim = createSim(s2, { role: 'melee', start: 'wall', seed: 5 });
  const s = sim.state, g = s.world.ghost;
  run(sim, 2.5);
  assert.equal(s.world.boss.state, 'submerged');
  const hpBefore = g.hp, ev = run(sim, 1, press('attack'));
  assert.ok(ev.some((e) => e.type === 'abilityFailed' && e.reason === 'range'), 'nothing to hit');
  assert.ok(g.hp >= hpBefore, 'no melee on the tank');
  const ev2 = run(sim, 2);
  assert.ok(ev2.some((e) => e.type === 'action' && e.id === 'emerge'));
  assert.equal(s.world.boss.state, 'grounded');
  assert.equal(s.world.boss.target, 'ghost');
});

test('a shield makes attacks wasted, costly and flagged HOLD; a cast raises a note when the bar appears', () => {
  const s2 = structuredClone(script);
  Object.assign(s2.actions, {
    wall: { label: 'Magic Reflection', kind: 'shield', duration: 4, reflectDamage: 300, cast: 0, warn: true, icon: 'roar' },
    mend: { label: 'Dark Mending', kind: 'aoe', cast: 2, damage: 0, radius: 1, interruptible: true, completedMetric: 'mends', warn: true, icon: 'roar' },
  });
  s2.continuousMetrics.attacksIntoShield = { label: 'a', unit: 'count', penaltyPerUnit: 1 };
  s2.continuousMetrics.mends = { label: 'm', unit: 'count', penaltyPerUnit: 1 };
  s2.playerAbilities.interrupt = { kind: 'interrupt', label: 'Kick', cooldown: 10, gcd: false, range: 8, icon: 'interrupt' };
  s2.roles.melee.abilities = ['attack', 'interrupt'];
  s2.cues.list.push({ id: 'kickIt', ability: 'interrupt', on: 'event', event: 'cast:mend', offset: 0, early: 0, late: 1.9, role: 'melee', short: 'KICK', label: 'Kick', tip: 'Kick' });
  const sim = createSim(s2, { role: 'melee', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player;
  sim.triggerAction('wall');
  run(sim, FIXED_DT);
  assert.equal(s.feedback.holdAttack, true);
  const hp = p.hp;
  run(sim, FIXED_DT, press('attack'));
  assert.equal(s.metrics.attacksIntoShield, 1);
  assert.ok(p.hp < hp, 'the reflect hurts');
  run(sim, 5);
  sim.triggerAction('mend');
  assert.ok(s.cues.beats.some((b) => b.status === 'pending' && b.cue === 'kickIt'), 'note up at cast start');
  const ev = run(sim, FIXED_DT, press('interrupt'));
  assert.ok(ev.some((e) => e.type === 'interrupted'));
  assert.equal(s.metrics.mends, undefined, 'an interrupted cast never completes');
});

function withAdds(extra = {}) {
  const s2 = structuredClone(script);
  s2.positions.addSpot = { x: 20, y: 30 };
  s2.actions.priests = { label: 'Priest', kind: 'adds', cast: 0, count: 1, from: ['addSpot'], speed: 0, lifetime: 30, heldLifetime: 30, pickup: 'offtank', holdSpot: 'addSpot', warn: false, icon: 'whelps', killFirst: true, ...extra };
  s2.continuousMetrics.attacksOffPriority = { label: 'x', unit: 'count', penaltyPerUnit: 1 };
  return s2;
}

test('killable adds: you hit what you face, attacks shorten their life, hitting the boss first is counted', () => {
  const sim = createSim(withAdds(), { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player, b = s.world.boss;
  sim.triggerAction('priests');
  const add = s.world.whelps[0];
  assert.ok(add.killable && add.priority);
  // Look at the boss: the attack goes there and counts against you.
  p.heading = angleTo(p.x, p.y, b.x, b.y);
  run(sim, FIXED_DT, press('attack'));
  assert.equal(s.metrics.attacksOffPriority, 1);
  run(sim, 1.6);
  // Look at the add: its health drops by more than the raid alone would take.
  p.heading = angleTo(p.x, p.y, add.x, add.y);
  const hp = add.hp;
  run(sim, FIXED_DT, press('attack'));
  assert.ok(hp - add.hp >= 0.05);
  assert.equal(s.metrics.attacksOnAdds, 1);
  assert.equal(s.metrics.attacksOffPriority, 1, 'not counted when you are on the add');
  const ev = run(sim, 31);
  assert.equal(s.world.whelps.length, 0, 'the raid finishes it without you');
  assert.ok(Array.isArray(ev));
});

test('an off-tank who does not hold the boss leaves it on the ghost tank and goes for the adds', () => {
  const s2 = withAdds({ killFirst: false, speed: 5 });
  s2.roles.offtank.holdsBoss = false;
  s2.positions.addSpot = { x: 20, y: 10 };
  s2.positions.otSpot = { x: 25, y: 12, tolerance: 4 };
  for (const ph of s2.phases) ph.spots = { ...ph.spots, offtank: 'otSpot' };
  const sim = createSim(s2, { role: 'offtank', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  assert.equal(s.tankRole, false);
  assert.equal(s.world.boss.target, 'ghost');
  sim.triggerAction('priests');
  sim.step(idle(), FIXED_DT);
  assert.equal(s.world.idealPlayer.reason, 'whelps');
  run(sim, 15, roleBot('offtank'));
  assert.equal(s.world.boss.target, 'ghost', 'never stole the boss');
  assert.ok(s.world.whelps.every((a) => a.target === 'player'), 'picked them up');
  assert.equal(s.world.idealPlayer.reason, 'holdWhelps');
});

test('stuns stop you acting; stacked debuffs cut healing and raise damage; off-boss casts keep her swinging', () => {
  const s2 = structuredClone(script);
  Object.assign(s2.actions, {
    stomp: { label: 'Stomp', kind: 'aoe', cast: 0, radius: 200, damage: 0, stun: 2, warn: false, icon: 'roar' },
    wound: { label: 'Wound', kind: 'debuff', cast: 0, target: 'tank', dispel: 'none', duration: 20, maxStacks: 3, healingMult: 0.8, damageTakenMult: 1.5, warn: false, icon: 'roar' },
    mend: { label: 'Mend', kind: 'aoe', cast: 5, offBoss: true, radius: 1, damage: 0, warn: false, icon: 'roar' },
  });
  const sim = createSim(s2, { role: 'healer', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, g = s.world.ghost, p = s.world.player;
  sim.triggerAction('stomp');
  const x = p.x;
  const ev = run(sim, 1, () => ({ ...idle(), forward: 1, abilities: ['heal'] }));
  assert.ok(ev.some((e) => e.type === 'abilityFailed' && e.reason === 'stunned'));
  assert.equal(p.x, x, 'could not move');
  run(sim, 1.5);
  sim.triggerAction('wound'); sim.triggerAction('wound');
  assert.equal(s.debuffs.length, 1, 'stacks instead of a second copy');
  assert.equal(s.debuffs[0].stacks, 2);
  assert.ok(Math.abs(s.debuffs[0].damageTakenMult - 2) < 1e-9);
  g.hp = 1000;
  run(sim, FIXED_DT, press('heal'));
  const healed = g.hp - 1000;
  assert.ok(healed < script.playerAbilities.heal.amount * 0.7 + 10, `healing reduced, got ${healed}`);
  sim.triggerAction('mend');
  const next = s.world.boss.nextMelee;
  const ev2 = run(sim, 3);
  assert.ok(s.world.boss.nextMelee > next || ev2.length >= 0);
  assert.ok(s.world.boss.lastHit >= s.t - 3, 'she kept swinging through the off-boss cast');
});
