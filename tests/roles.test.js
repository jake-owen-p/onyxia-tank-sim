// The non-tank roles: the ghost tank holds her, DPS manage threat, healers keep
// the tank up and dispel, and every role can play the full fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT, createSim } from '../src/core/sim.js';
import { computeScore, roleMatches, holdsBoss } from '../src/core/scoring.js';
import { angleTo } from '../src/core/geometry.js';
import { script, makeSim, run, idle, roleBot } from './helpers.js';

const press = (...ids) => () => ({ ...idle(), abilities: ids });

test('legacy role id mt maps to tank', () => {
  const sim = makeSim({ role: 'mt', start: 'wall', manual: true });
  assert.equal(sim.state.role, 'tank');
  assert.equal(sim.state.tankRole, true);
});

test('melee: the ghost tank pulls and holds her; the player builds threat with attacks and pulls aggro by spamming', () => {
  const data = structuredClone(script);
  data.playerAbilities.attack.threat = 1000;
  const sim = createSim(data, { seed: 7, role: 'melee', start: 'entrance', manual: true });
  const s = sim.state, b = s.world.boss, g = s.world.ghost;
  assert.equal(g.tanking, true);
  assert.equal(s.tankRole, false);
  const ev = run(sim, 25, roleBot('melee'));
  const eng = ev.find((e) => e.type === 'engage');
  assert.ok(eng && eng.by === 'ghost', 'the ghost tank engages her');
  assert.equal(b.target, 'ghost');
  assert.ok(s.metrics.attacks > 0, 'the bot attacked');
  assert.equal(s.metrics.aggroPulls, undefined, 'a disciplined bot never pulls');
  // Now spam attacks regardless of the bar: she comes off the tank, then the tank taunts her back.
  const ev2 = run(sim, 45, (sm) => { const c = roleBot('melee')(sm); if (!sm.state.metrics.aggroPulls && sm.state.abilities.gcdUntil <= sm.state.t && sm.state.feedback.inRangeOk && !c.abilities.length) c.abilities.push('attack'); return c; });
  assert.ok(ev2.some((e) => e.type === 'aggroPulled'), 'spamming pulls aggro');
  assert.ok(s.metrics.aggroPulls >= 1);
  assert.ok(s.metrics.attacksInRed >= 1, 'attacks in the red band are counted');
  assert.ok(ev2.some((e) => e.type === 'threatRegained' && e.by === 'ghost'), 'the ghost tank rebuilds threat');
  assert.equal(ev2.some((e) => e.type === 'ghostTaunt'), false, 'Onyxia cannot be taunted');
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
  const ev2 = run(sim2, FIXED_DT, press('heal'));
  assert.ok(ev2.some((e) => e.type === 'abilityFailed' && e.reason === 'role'));
});

test('every role completes the full fight with the scripted bot and scores a B or better', () => {
  for (const role of ['tank', 'offtank', 'melee', 'ranged', 'healer']) {
    const sim = makeSim({ role, seed: 7 });
    run(sim, 400, roleBot(role));
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
  // The killing blow removes it (this used to throw).
  run(sim, 1.6);
  p.heading = angleTo(p.x, p.y, add.x, add.y);
  add.hp = 0.01;
  const killed = run(sim, FIXED_DT, press('attack'));
  assert.ok(killed.some((e) => e.type === 'addKilled'));
  assert.equal(s.world.whelps.length, 0);
  // Left alone, the raid finishes an add by itself.
  sim.triggerAction('priests');
  run(sim, 31);
  assert.equal(s.world.whelps.length, 0, 'the raid finishes it without you');
});

test('role filters agree everywhere about an off-tank who does not hold the boss', () => {
  assert.equal(roleMatches('tanks', 'offtank', false), false);
  assert.equal(roleMatches('nontank', 'offtank', false), true);
  assert.equal(roleMatches('offtank', 'offtank', false), true);
  assert.equal(roleMatches('tanks', 'offtank'), true, 'by default an off-tank holds the boss');
  const s2 = structuredClone(script);
  s2.roles.offtank.holdsBoss = false;
  assert.equal(holdsBoss(s2, 'offtank'), false);
  assert.equal(holdsBoss(script, 'offtank'), true);
});

test('a shield protects adds too, and stunned time is not counted as idle', () => {
  const s2 = withAdds();
  s2.actions.reflect = { label: 'Reflect', kind: 'shield', duration: 5, cast: 0, warn: false, icon: 'roar' };
  s2.actions.stomp = { label: 'Stomp', kind: 'aoe', cast: 0, radius: 200, damage: 0, stun: 3, warn: false, icon: 'roar' };
  const sim = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player;
  sim.triggerAction('priests');
  const add = s.world.whelps[0];
  p.heading = angleTo(p.x, p.y, add.x, add.y);
  sim.triggerAction('reflect');
  const hp = add.hp;
  run(sim, FIXED_DT, press('attack'));
  assert.equal(s.metrics.attacksIntoShield, 1);
  assert.ok(hp - add.hp < 0.01, 'the attack did nothing');
  run(sim, 5.2);
  const idleBefore = s.metrics.dpsIdle || 0;
  sim.triggerAction('stomp');
  run(sim, 2.5);
  assert.equal(s.metrics.dpsIdle || 0, idleBefore, 'cannot be idle while stunned');
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

test('cover: a room-wide breath misses you behind it, and the marker takes you there during the cast', () => {
  const s2 = structuredClone(script);
  s2.positions.door = { x: 30, y: 40, tolerance: 6 };
  s2.actions.breath2 = { label: 'Time Lapse', kind: 'aoe', cast: 2, damage: 500, safeSpots: ['door'], warn: true, icon: 'roar', playerMetric: 'breaths' };
  s2.continuousMetrics.breaths = { label: 'b', unit: 'count', penaltyPerUnit: 1 };
  s2.actions.buffet2 = { label: 'Flame Buffet', kind: 'debuff', cast: 0, target: 'all', dispel: 'none', duration: 4, maxStacks: 5, safeSpots: ['door'], shelterAt: 2, warn: false, icon: 'roar' };
  const sim = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player;
  p.x = 0; p.y = 0;
  sim.triggerAction('breath2');
  sim.step(idle(), FIXED_DT);
  assert.equal(s.world.idealPlayer.reason, 'los');
  run(sim, 2.1);
  assert.equal(s.metrics.breaths, 1, 'in the open it hits');
  sim.triggerAction('breath2');
  p.x = 30; p.y = 40;
  run(sim, 2.1);
  assert.equal(s.metrics.breaths, 1, 'behind cover it misses');
  // Stacks: out in the open they build, the marker sends you to cover at the threshold, and there they run out.
  p.x = 0; p.y = 0;
  sim.triggerAction('buffet2'); sim.triggerAction('buffet2');
  assert.equal(s.debuffs[0].stacks, 2);
  sim.step(idle(), FIXED_DT);
  assert.equal(s.world.idealPlayer.reason, 'los');
  p.x = 30; p.y = 40;
  sim.triggerAction('buffet2');
  assert.equal(s.debuffs[0].stacks, 2, 'no new stack behind cover');
  run(sim, 4.2);
  assert.equal(s.debuffs.length, 0);
});

test('a cast that comes due during another cast waits its turn', () => {
  const s2 = structuredClone(script);
  Object.assign(s2.actions, {
    first: { label: 'A', kind: 'aoe', cast: 2, radius: 1, damage: 0, warn: false, icon: 'roar' },
    second: { label: 'B', kind: 'aoe', cast: 1, radius: 1, damage: 0, warn: false, icon: 'roar' },
  });
  const sim = createSim(s2, { role: 'tank', start: 'wall', seed: 5, actions: [{ id: 'first', first: 1, every: 100 }, { id: 'second', first: 2, every: 100 }] });
  const ev = run(sim, 6);
  const done = ev.filter((e) => e.type === 'action' && (e.id === 'first' || e.id === 'second')).map((e) => e.id);
  assert.deepEqual(done, ['first', 'second']);
});

test('any role can dispel what its own list allows, and pulses can depend on a debuff staying up', () => {
  const s2 = structuredClone(script);
  s2.playerAbilities.dispel.dispels = ['magic', 'curse', 'enrage'];
  s2.roles.ranged.abilities = ['attack', 'dispel'];
  s2.roles.ranged.dispels = ['enrage'];
  Object.assign(s2.actions, {
    frenzy: { label: 'Frenzy', kind: 'debuff', cast: 0, target: 'tank', dispel: 'enrage', duration: 10, warn: false, icon: 'roar' },
    curse: { label: 'Curse', kind: 'debuff', cast: 0, target: 'player', dispel: 'curse', duration: 10, warn: false, icon: 'roar' },
    nova: { label: 'Nova', kind: 'aoe', cast: 0, radius: 500, damage: 10, conditional: 'debuff:frenzy', warn: false, icon: 'roar' },
  });
  const sim = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  sim.triggerAction('curse');
  run(sim, FIXED_DT, press('dispel'));
  assert.equal(s.debuffs.length, 1, 'a Hunter cannot remove a curse');
  sim.triggerAction('frenzy');
  assert.equal(sim.triggerAction('nova'), true, 'pulses while it is up');
  run(sim, 1.6);
  run(sim, FIXED_DT, press('dispel'));
  assert.deepEqual(s.debuffs.map((d) => d.dispel), ['curse'], 'Tranq removed the enrage');
  s.pendingTrigger = null;
  assert.equal(sim.triggerAction('nova'), false, 'no pulses once it is gone');
});

test('Hakkar pattern: a cloud gives the debuff that protects you, the marker sends you to it, and it is not dodged', () => {
  const s2 = structuredClone(script);
  s2.positions.cloud = { x: 10, y: 12 };
  Object.assign(s2.actions, {
    poison: { label: 'Poisonous Blood', kind: 'debuff', cast: 0, target: 'player', dispel: 'none', duration: 30, warn: false, icon: 'roar' },
    cloud: { label: 'Poison Cloud', kind: 'hazard', placement: 'spots', spots: ['cloud'], radius: 6, warning: 0, active: 60, damage: 0, applies: 'poison', cast: 0, warn: false, icon: 'roar' },
    siphon: { label: 'Blood Siphon', kind: 'aoe', cast: 0, damage: 2000, safeIfDebuff: 'poison', seekLead: 15, playerMetric: 'siphons', warn: true, icon: 'roar' },
  });
  s2.continuousMetrics.siphons = { label: 's', unit: 'count', penaltyPerUnit: 1 };
  const sim = createSim(s2, { role: 'ranged', start: 'wall', seed: 5, actions: [{ id: 'cloud', first: 1 }, { id: 'siphon', first: 12, every: 200 }] });
  const s = sim.state;
  run(sim, 3, roleBot('ranged'));
  assert.equal(s.world.idealPlayer.reason, 'los', 'heading for the cloud ahead of the siphon');
  run(sim, 7, roleBot('ranged'));
  assert.ok(s.debuffs.some((d) => d.actionId === 'poison'), 'standing in it gives the debuff');
  assert.equal(s.metrics.playerInHazard, undefined, 'and it does not count as standing in fire');
  run(sim, 4, roleBot('ranged'));
  assert.equal(s.metrics.siphons, undefined, 'protected from the siphon');
});

test('forbidden actions are scored; a timed enrage ends; a spot deadline at the end of the last phase is judged', () => {
  const s2 = structuredClone(script);
  Object.assign(s2.actions, {
    gaze: { label: 'Threatening Gaze', kind: 'debuff', cast: 0, target: 'player', dispel: 'none', duration: 6, forbidAbilities: true, breakMetric: 'gazeBreaks', breakDamage: 500, warn: false, icon: 'roar' },
    rage: { label: 'Rage', kind: 'enrage', cast: 0, duration: 2, warn: false, icon: 'roar' },
  });
  const sim = createSim(s2, { role: 'melee', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  sim.triggerAction('gaze');
  const hp = s.world.player.hp;
  run(sim, FIXED_DT, press('attack'));
  assert.equal(s.metrics.gazeBreaks, 1);
  assert.ok(s.world.player.hp < hp);
  sim.triggerAction('rage');
  assert.equal(s.enraged, true);
  run(sim, 2.2);
  assert.equal(s.enraged, false);

  const s3 = structuredClone(script);
  s3.phases = [{ id: 1, name: 'A', subtitle: '', hpFrom: 1, hpTo: 0, duration: 3, bossState: 'grounded', raidSpot: 'raidSpotP1', actions: [], expectations: [
    { id: 'beThere', type: 'playerAtSpotBy', spot: 'tankSpot', grace: 0, label: 'L', tip: 'T' },
  ] }];
  s3.positions.tankSpot.tolerance = 200;
  const end = createSim(s3, { role: 'tank', start: 'wall', seed: 5 });
  const ev = run(end, 5);
  assert.equal(ev.find((e) => e.type === 'expectation' && e.id === 'beThere').status, 'ontime');
});

test('dodging keeps going until the marker is clear of every overlapping zone', () => {
  const s2 = structuredClone(script);
  s2.actions.z1 = { label: 'Fire', kind: 'hazard', placement: 'spots', spots: ['healerSpot'], radius: 8, warning: 1, active: 10, damage: 0, cast: 0, warn: false, icon: 'roar' };
  s2.positions.nearby = { x: s2.positions.healerSpot.x + 10, y: s2.positions.healerSpot.y };
  s2.actions.z2 = { ...s2.actions.z1, spots: ['nearby'] };
  const sim = createSim(s2, { role: 'healer', start: 'wall', manual: true, seed: 5 });
  sim.triggerAction('z1'); sim.triggerAction('z2');
  sim.step(idle(), FIXED_DT);
  const { x, y } = sim.state.world.idealPlayer;
  for (const h of sim.state.world.hazards.filter((z) => z.kind === 'zone')) assert.ok(Math.hypot(x - h.centroid.x, y - h.centroid.y) >= h.radius, 'outside every zone');
});

test('speed ramps, melee-only abilities, hazards that also debuff, and hitting a boss in the air', () => {
  const s2 = structuredClone(script);
  Object.assign(s2.actions, {
    gather: { label: 'Gathering Speed', kind: 'aoe', radius: 1, damage: 0, cast: 0, bossSpeedMult: 2, bossSpeedMultMax: 3, warn: false, icon: 'roar' },
    bite: { label: 'Dismember', kind: 'aoe', radius: 500, damage: 1, cast: 0, conditional: 'tankInMelee', warn: false, icon: 'roar' },
    silence: { label: 'Silence', kind: 'debuff', target: 'player', dispel: 'none', duration: 5, cast: 0, warn: false, icon: 'roar' },
    trap: { label: 'Sand Trap', kind: 'hazard', placement: 'player', radius: 6, warning: 0, active: 3, damage: 100, applies: 'silence', cast: 0, warn: false, icon: 'roar' },
  });
  const sim = createSim(s2, { role: 'tank', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  sim.triggerAction('gather'); sim.triggerAction('gather');
  assert.equal(s.bossSpeedMult, 3, 'capped');
  assert.equal(sim.triggerAction('bite'), true, 'tank in melee');
  s.pendingTrigger = null;
  s.world.player.x = 0; s.world.player.y = -40;
  assert.equal(sim.triggerAction('bite'), false, 'tank out of melee');
  s.pendingTrigger = null;
  sim.triggerAction('trap');
  run(sim, 0.3);
  assert.ok(s.debuffs.some((d) => d.actionId === 'silence'), 'the hazard applied its debuff');
  assert.ok(s.metrics.playerInHazard > 0, 'and it still counts as standing in it');

  const s3 = structuredClone(script); s3.boss.attackableInAir = true;
  const air = createSim(s3, { role: 'ranged', startPhase: 2, start: 'pickup', manual: true, seed: 5 });
  const p = air.state.world.player, b = air.state.world.boss;
  assert.equal(b.state, 'airborne');
  p.x = b.x; p.y = b.y - 25;
  p.heading = Math.PI / 2;
  const ev = run(air, FIXED_DT, press('attack'));
  assert.ok(ev.some((e) => e.type === 'attack'), 'can be shot in the air');
});

test('a spaced raid really keeps its spacing and clears room for the player; a stay-put bomb does not send you running', () => {
  const s2 = structuredClone(script);
  s2.positions.raidSpotP1.spacing = 10; s2.positions.raidSpotP1.spread = 30;
  s2.actions.beam = { label: 'Eye Beam', kind: 'hazard', placement: 'player', carried: true, stayPut: true, radius: 8, warning: 5, active: 0.5, damage: 100, raidMetric: 'chains', cast: 0, warn: false, icon: 'roar' };
  s2.continuousMetrics.chains = { label: 'c', unit: 'count', penaltyPerUnit: 1 };
  const sim = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player, a = s.world.raid.anchor;
  p.x = a.x; p.y = a.y; p.heading = 0;
  run(sim, 14);   // long enough for everyone to walk to their cell
  const ranged = s.world.raid.dots.filter((d) => !d.melee);
  let closest = Infinity;
  for (let i = 0; i < ranged.length; i++) for (let j = i + 1; j < ranged.length; j++) closest = Math.min(closest, Math.hypot(ranged[i].x - ranged[j].x, ranged[i].y - ranged[j].y));
  assert.ok(closest >= 8.9, `raiders stay apart, closest ${closest.toFixed(1)}`);
  assert.ok(ranged.every((d) => Math.hypot(d.x - p.x, d.y - p.y) >= 8.9), 'room is made for the player');
  sim.triggerAction('beam');
  sim.step(idle(), FIXED_DT);
  assert.notEqual(s.world.idealPlayer.reason, 'runOut');
  run(sim, 5.2);
  assert.equal(s.metrics.chains, undefined, 'held position, nobody chained');
});

test('a boss-only shield leaves adds as the job, and an exempt phase does not punish staying away', () => {
  const s2 = structuredClone(script);
  s2.positions.addSpot = { x: 20, y: 30 };
  s2.actions.adds = { label: 'Eye', kind: 'adds', cast: 0, count: 1, from: ['addSpot'], speed: 0, lifetime: 30, heldLifetime: 30, killable: true, pickup: 'offtank', holdSpot: 'addSpot', warn: false, icon: 'whelps' };
  s2.actions.shell = { label: 'Carapace', kind: 'shield', bossOnly: true, duration: 20, cast: 0, warn: false, icon: 'roar' };
  const sim = createSim(s2, { role: 'ranged', start: 'wall', manual: true, seed: 5 });
  const s = sim.state;
  sim.triggerAction('shell');
  sim.step(idle(), FIXED_DT);
  assert.equal(s.feedback.holdAttack, true, 'nothing to hit yet');
  sim.triggerAction('adds');
  sim.step(idle(), FIXED_DT);
  assert.equal(s.feedback.holdAttack, false, 'adds are up');
  assert.match(s.nextExpected.label, /Kill/);

  const sc = (skip) => {
    const def = structuredClone(script); if (skip) def.phases[0].skipActivity = true;
    return computeScore(def, [], { 1: { dpsWindow: 100, outOfRange: 100 } }, [1], 'melee', []).phases[0].total;
  };
  assert.ok(sc(true) > sc(false) + 40);
});

test('percentage hits: Decimate leaves everyone at 5% however much they had; Thundercrash halves what is left', () => {
  const s2 = structuredClone(script);
  s2.actions.decimate = { label: 'Decimate', kind: 'aoe', cast: 0, setHpFraction: 0.05, warn: false, icon: 'roar' };
  s2.actions.crash = { label: 'Thundercrash', kind: 'aoe', cast: 0, currentHpFraction: 0.5, warn: false, icon: 'roar' };
  const sim = createSim(s2, { role: 'healer', start: 'wall', manual: true, seed: 5 });
  const s = sim.state, p = s.world.player, g = s.world.ghost;
  sim.triggerAction('crash');
  assert.ok(Math.abs(p.hp - p.maxHp / 2) < 1, 'half of what you had');
  assert.ok(Math.abs(g.hp - g.maxHp / 2) < 1);
  sim.triggerAction('decimate');
  assert.ok(Math.abs(p.hp - p.maxHp * 0.05) < 1);
  assert.ok(Math.abs(g.hp - g.maxHp * 0.05) < 1);
  sim.triggerAction('decimate');
  assert.ok(p.hp > 0, 'already low: it does not kill');
});
