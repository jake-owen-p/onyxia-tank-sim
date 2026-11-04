// Integration tests for the simulation: phases, expectations, mechanics and determinism.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT } from '../src/core/sim.js';
import { snapshot } from '../src/core/snapshot.js';
import { polyCentroid, escapeLane, dist } from '../src/core/geometry.js';
import { script, makeSim, run, idle, perfectTank, driveToward, expectations, actions } from './helpers.js';

const P = script.positions;

test('phases advance on HP drain: takeoff, landing with threat reset, then victory', () => {
  const sim = makeSim({ start: 'wall', phaseDurations: { 1: 4, 2: 4, 3: 4 } });
  const s = sim.state;
  assert.equal(s.phase, 1);
  assert.equal(s.hp, 1);

  let ev = run(sim, 4.1);
  assert.equal(s.phase, 2);
  assert.ok(ev.some((e) => e.type === 'phase' && e.phase === 2));
  assert.equal(actions(ev, 'takeoff').length, 1);
  assert.ok(['takeoff', 'airborne'].includes(s.world.boss.state));
  assert.ok(Math.abs(s.hp - 0.65) < 0.02, 'HP follows the phase table');

  ev = run(sim, 4);
  assert.equal(s.phase, 3);
  assert.equal(s.world.boss.state, 'landing');
  ev = run(sim, script.boss.landingDuration + 0.1);
  const landed = actions(ev, 'landing');
  assert.equal(landed.length, 1);
  assert.equal(s.world.boss.state, 'grounded');
  assert.equal(s.world.boss.target, 'raid', 'she lands with her threat reset, on the raid');
  assert.ok(s.threat.player < 1, 'tank threat reset on landing');
  assert.ok(s.world.hazards.some((h) => h.kind === 'crack'));
  assert.ok(ev.some((e) => e.type === 'expectation' && e.id === 'pickup') || s.expectations.some((i) => i.id === 'pickup'), 'pickup window opened');

  ev = run(sim, 4);
  assert.equal(s.ended, true);
  assert.equal(s.result, 'victory');
  assert.equal(s.hp, 0);
  assert.ok(ev.some((e) => e.type === 'end' && e.result === 'victory'));
  assert.deepEqual(s.phasesPlayed, [1, 2, 3]);
});

test('pull: on time when the tank drags her to the wall, missed when the tank stands still', () => {
  const sim = makeSim({ start: 'entrance' });
  assert.equal(sim.state.world.boss.engaged, false);
  const ev = run(sim, 25, perfectTank());
  const engage = ev.find((e) => e.type === 'engage');
  assert.ok(engage, 'walking in and taunting engages her');
  const pull = expectations(ev, 'pull');
  assert.equal(pull.length, 1);
  assert.equal(pull[0].status, 'ontime');
  assert.ok(pull[0].t - engage.t <= script.phases[0].expectations[0].within);
  assert.equal(sim.state.world.boss.target, 'player');

  // Stand still after the pull: she never reaches the wall spot.
  const lazy = makeSim({ start: 'entrance' });
  let taunted = false;
  const ev2 = run(lazy, 32, (sm) => {
    const st = sm.state, b = st.world.boss, p = st.world.player;
    const inRange = dist(p.x, p.y, b.x, b.y) - script.boss.radius <= 12;
    if (!inRange) return driveToward(sm, st.world.idealPlayer);
    const cmd = idle();
    if (!taunted) { cmd.abilities.push('taunt'); taunted = true; }
    return cmd;
  });
  const e2 = ev2.find((e) => e.type === 'engage');
  assert.ok(e2);
  const pull2 = expectations(ev2, 'pull');
  assert.equal(pull2.length, 1);
  assert.equal(pull2[0].status, 'missed');
  const def = script.phases[0].expectations.find((e) => e.id === 'pull');
  assert.ok(Math.abs(pull2[0].t - (e2.t + def.within + def.grace)) < 0.05, 'missed exactly at the end of the grace window');
});

test('Wing Buffet: the wall stops the knockback, threat is cut, wall and rebuild expectations resolve', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state, p = s.world.player;
  s.threat.player = 6000; s.threat.raid = 4500;   // the 35% cut drops the tank under the raid
  const before = { x: p.x, y: p.y };
  assert.ok(sim.triggerAction('wingBuffet'));
  assert.equal(s.world.boss.cast.id, 'wingBuffet');
  const ev = run(sim, 2);
  assert.equal(actions(ev, 'wingBuffet').length, 1);
  assert.ok(ev.some((e) => e.type === 'knockback' && e.offWall === false));
  // The tank spot sits 4 yards off the wall, so a 22-yard knockback is clipped to under 4.
  assert.ok(dist(before.x, before.y, p.x, p.y) < 4.5, 'the wall clips the knockback');
  assert.ok(dist(p.x, p.y, 0, 54) < 0.5, 'pinned against the back wall');
  const cut = 6000 * (1 - script.threat.buffetCut);
  assert.ok(s.threat.player >= cut - 1 && s.threat.player < cut + 150, `threat cut to ~${cut}, got ${s.threat.player}`);
  assert.equal(expectations(ev, 'wall')[0].status, 'ontime');
  assert.equal(s.metrics.buffetsOffWall, undefined);
  // The cut puts the raid above the tank: she turns, and the rebuild stays pending until we Taunt her back.
  assert.ok(ev.some((e) => e.type === 'threatLost'));
  assert.equal(s.world.boss.target, 'raid');
  assert.equal(expectations(ev, 'rebuild').length, 0);
  const ev2 = run(sim, 1, (sm) => ({ ...idle(), abilities: sm.state.abilities.readyAt.taunt <= sm.state.t ? ['taunt'] : [] }));
  const rebuild = expectations(ev2, 'rebuild');
  assert.equal(rebuild.length, 1);
  assert.equal(rebuild[0].status, 'ontime');
  assert.equal(s.world.boss.target, 'player');
  assert.ok(s.threat.player >= 4500 * script.threat.tauntLead, 'Taunt puts the tank clear of the raid');
});

test('Wing Buffet flush against the wall barely moves the tank', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const p = sim.state.world.player;
  p.y = 53.5;
  sim.triggerAction('wingBuffet');
  run(sim, 2);
  assert.ok(p.y - 53.5 < 1);
});

test('Wing Buffet away from the wall: full knockback, wall expectation missed, rebuild missed without a Taunt', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state, p = s.world.player, b = s.world.boss;
  b.x = 0; b.y = 20; p.x = 0; p.y = 30;
  s.threat.player = 6000; s.threat.raid = 4500;   // the cut drops the tank under the raid and she turns
  sim.triggerAction('wingBuffet');
  const ev = run(sim, 2);
  assert.ok(ev.some((e) => e.type === 'knockback' && e.offWall === true));
  assert.ok(p.y - 30 > 5, 'pushed well away from her');
  assert.equal(expectations(ev, 'wall')[0].status, 'missed');
  assert.equal(s.metrics.buffetsOffWall, 1);
  const def = script.phases[0].expectations.find((e) => e.id === 'rebuild');
  const ev2 = run(sim, def.within + def.grace + 1);
  const rebuild = expectations(ev2, 'rebuild');
  assert.equal(rebuild.length, 1);
  assert.equal(rebuild[0].status, 'missed');
});

test('Bellowing Roar fears the tank; the recovery expectation waits for the fear to end', () => {
  const sim = makeSim({ startPhase: 3, start: 'wall', manual: true });
  const s = sim.state, p = s.world.player;
  assert.equal(s.phase, 3);
  sim.triggerAction('bellowingRoar');
  const ev = run(sim, script.actions.bellowingRoar.cast + 0.2);
  assert.ok(ev.some((e) => e.type === 'feared'));
  assert.ok(p.fearedUntil > s.t);
  const def = script.phases[2].expectations.find((e) => e.id === 'roar');
  const inst = s.expectations.find((i) => i.id === 'roar');
  assert.ok(inst && inst.status === 'pending', 'created at the roar, still pending');
  assert.ok(inst.notBefore > s.t, 'not judged until the fear has run its course');
  assert.equal(expectations(run(sim, def.notBefore - 0.5), 'roar').length, 0, 'nothing resolves before notBefore');
  // The perfect tank walks back between her and the raid: on time or late, never missed.
  const ev2 = run(sim, def.within + def.grace + 1, perfectTank());
  const roar = expectations(ev2, 'roar');
  assert.equal(roar.length, 1);
  assert.notEqual(roar[0].status, 'missed');
  assert.equal(s.metrics.fearsTaken, undefined, 'fears are not a scored metric any more');
});

test('Bellowing Roar: a tank who never comes back misses the recovery', () => {
  const sim = makeSim({ startPhase: 3, start: 'wall', manual: true });
  const s = sim.state, p = s.world.player;
  sim.triggerAction('bellowingRoar');
  run(sim, script.actions.bellowingRoar.cast + script.player.fearDuration + 0.2);
  const anchor = s.world.raid.anchor, b = s.world.boss;
  b.x = anchor.x; b.y = anchor.y + 16; b.heading = -Math.PI / 2;  // she chased the feared tank down to the raid...
  p.x = anchor.x; p.y = anchor.y - 6;   // ...who now stands behind it, so she faces straight into them
  const def = script.phases[2].expectations.find((e) => e.id === 'roar');
  const ev = run(sim, def.within + def.grace + 1);
  const roar = expectations(ev, 'roar');
  assert.equal(roar.length, 1);
  assert.equal(roar[0].status, 'missed');
});

test('aggro pull: the raid overtakes, she turns, a Taunt inside the window is on time', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state, b = s.world.boss;
  assert.ok(sim.triggerAction('aggroPull'));
  const ev = run(sim, 0.5);
  assert.ok(ev.some((e) => e.type === 'action' && e.id === 'aggroPull'));
  assert.ok(ev.some((e) => e.type === 'threatLost'), 'she turns on the next threat tick');
  assert.equal(b.target, 'raid');
  assert.equal(expectations(ev, 'retaunt').length, 0, 'still pending');
  sim.step({ ...idle(), abilities: ['taunt'] }, FIXED_DT);
  const ev2 = sim.drainEvents();
  assert.equal(b.target, 'player');
  const re = expectations(ev2, 'retaunt');
  assert.equal(re.length, 1);
  assert.equal(re[0].status, 'ontime');
  // Not fired while she is already on the raid or held by a Taunt.
  assert.equal(sim.triggerAction('aggroPull'), false, 'held by the fresh Taunt');
});

test('aggro pull with no Taunt: she stays on the raid and the expectation is missed', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  sim.triggerAction('aggroPull');
  const def = script.phases[0].expectations.find((e) => e.id === 'retaunt');
  const ev = run(sim, def.within + def.grace + 1);
  const re = expectations(ev, 'retaunt');
  assert.equal(re.length, 1);
  assert.equal(re[0].status, 'missed');
  assert.equal(sim.state.world.boss.target, 'raid');
});

test('jump: Space lifts the tank on a fixed arc, lands on time, and is refused while feared', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state, p = s.world.player;
  const J = script.player.jump;
  const ev = run(sim, FIXED_DT, () => ({ ...idle(), jump: true }));
  assert.ok(ev.some((e) => e.type === 'jump'));
  assert.ok(p.z > 0 && p.vz > 0);
  let peak = 0;
  run(sim, J.duration / 2, () => { peak = Math.max(peak, p.z); return idle(); });
  assert.ok(Math.abs(peak - J.height) < 0.1, `peak ${peak} ~ ${J.height}`);
  run(sim, J.duration / 2 + 0.1);
  assert.equal(p.z, 0);
  assert.equal(p.vz, 0);
  // holding the key does not double-jump mid-air
  const ev2 = run(sim, 0.3, () => ({ ...idle(), jump: true }));
  assert.equal(ev2.filter((e) => e.type === 'jump').length, 1);
  // feared: no jump
  run(sim, J.duration + 0.1);
  p.fearedUntil = s.t + 2;
  const ev3 = run(sim, FIXED_DT, () => ({ ...idle(), jump: true }));
  assert.ok(!ev3.some((e) => e.type === 'jump'));
  assert.equal(p.z, 0);
});

test('Deep Breath lane: standing in it burns, standing outside is on time', () => {
  const sim = makeSim({ startPhase: 2, start: 'pickup', manual: true });
  const s = sim.state, p = s.world.player;
  assert.equal(s.world.boss.state, 'airborne');
  assert.ok(sim.triggerAction('deepBreath'));
  const lane = s.world.hazards.find((h) => h.kind === 'lane');
  assert.ok(lane && lane.state === 'warning');
  const c = polyCentroid(lane.poly);
  p.x = c.x; p.y = c.y;
  const hpBefore = p.hp;
  const ev = run(sim, script.actions.deepBreath.warning + 0.5);
  assert.ok(ev.some((e) => e.type === 'hazardActive' && e.kind === 'lane'));
  assert.ok(ev.some((e) => e.type === 'damage' && e.source === 'deepBreath'));
  assert.ok(p.hp < hpBefore);
  assert.ok(s.metrics.playerInLane > 0);
  const ev2 = run(sim, 3);
  const laneExp = expectations([...ev, ...ev2], 'lane');
  assert.equal(laneExp.length, 1);
  assert.equal(laneExp[0].status, 'missed');
  assert.ok(!s.world.hazards.some((h) => h.kind === 'lane'), 'lane gone after it burns out');

  const sim2 = makeSim({ startPhase: 2, start: 'pickup', manual: true });
  sim2.triggerAction('deepBreath');
  const lane2 = sim2.state.world.hazards.find((h) => h.kind === 'lane');
  const out = escapeLane(sim2.state.world.player.x, sim2.state.world.player.y, lane2.from, lane2.to, lane2.width, 10);
  sim2.state.world.player.x = out.x; sim2.state.world.player.y = out.y;
  const evB = run(sim2, script.actions.deepBreath.warning + 1);
  assert.equal(expectations(evB, 'lane')[0].status, 'ontime');
  assert.equal(sim2.state.metrics.playerInLane, undefined);
});

test('the ideal position steps out of a lane that covers the pickup spot', () => {
  const sim = makeSim({ startPhase: 2, start: 'pickup', manual: true });
  const s = sim.state;
  // force a north-south lane so it covers the pickup spot
  let tries = 0;
  while (tries++ < 20) {
    sim.triggerAction('deepBreath');
    const lane = s.world.hazards.find((h) => h.kind === 'lane');
    if (lane && lane.from[0] === 0) break;
    s.world.hazards = s.world.hazards.filter((h) => h.kind !== 'lane');
    run(sim, 0.1);
  }
  run(sim, 0.1);
  assert.equal(s.world.idealPlayer.reason, 'dodgeLane');
  assert.ok(Math.abs(s.world.idealPlayer.x) >= script.actions.deepBreath.laneWidth / 2);
  assert.ok(s.upcoming.some((u) => u.id === 'deepBreath' && u.hazard === true), 'the lane countdown is announced');
});

test('eruption cracks exist only in phase 3 and pulse on an Eruption', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const cracks = () => sim.state.world.hazards.filter((h) => h.kind === 'crack');
  assert.equal(cracks().length, 0);
  sim.setPhase(3);
  assert.equal(cracks().length, script.eruptionCracks.length);
  sim.triggerAction('eruption');
  assert.ok(cracks().every((h) => h.state === 'warning'));
  run(sim, script.actions.eruption.warning + 0.1);
  assert.ok(cracks().every((h) => h.state === 'active'));
  sim.setPhase(2);
  assert.equal(cracks().length, 0);
});

test('standing on a crack is counted and an active crack hurts once per pulse', () => {
  const sim = makeSim({ startPhase: 3, start: 'wall', manual: true });
  const s = sim.state, p = s.world.player;
  const crack = s.world.hazards.find((h) => h.kind === 'crack');
  p.x = crack.centroid.x; p.y = crack.centroid.y;
  run(sim, 1);
  assert.ok(s.metrics.playerInCrack > 0.9 && s.metrics.playerInCrack < 1.1);
  assert.equal(s.feedback.inHazard, true);
  sim.triggerAction('eruption');
  const ev = run(sim, script.actions.eruption.warning + script.actions.eruption.active + 0.5);
  assert.equal(ev.filter((e) => e.type === 'damage' && e.source === 'eruption').length, 1);
});

test('whelps: off-tank waves target the raid and are picked up by proximity; MT waves go to the ghost off-tank', () => {
  const ot = makeSim({ role: 'offtank', startPhase: 2, start: 'pickup', manual: true });
  ot.triggerAction('whelpWave');
  const ws = ot.state.world.whelps;
  assert.equal(ws.length, script.actions.whelpWave.perCave * 2);
  assert.ok(ws.every((w) => w.target === 'raid'));
  // walk the player onto one whelp
  const w0 = ws[0];
  ot.state.world.player.x = w0.x; ot.state.world.player.y = w0.y;
  const ev = run(ot, 0.1);
  assert.ok(ev.some((e) => e.type === 'whelpPickup'));
  assert.equal(w0.target, 'player');
  assert.ok(ws.some((w) => w.target === 'raid'), 'the other cave is still loose');
  assert.ok(ot.state.expectations.some((i) => i.id === 'whelps' && i.status === 'pending'));
  assert.equal(ot.state.world.idealPlayer.reason, 'whelps');

  const mt = makeSim({ role: 'mt', startPhase: 2, start: 'pickup', manual: true });
  mt.triggerAction('whelpWave');
  assert.ok(mt.state.world.whelps.every((w) => w.target === 'ghost'));
  run(mt, 0.1);
  assert.ok(!mt.state.expectations.some((i) => i.id === 'whelps'), 'whelp expectations are off-tank only');
});

test('whelps that reach the raid accrue whelpsOnRaid for the off-tank', () => {
  const ot = makeSim({ role: 'offtank', startPhase: 2, start: 'pickup', manual: true });
  ot.triggerAction('whelpWave');
  ot.state.world.player.x = 0; ot.state.world.player.y = 50; // out of the way
  run(ot, 25);
  assert.ok(ot.state.world.whelps.some((w) => w.onRaid));
  assert.ok(ot.state.metrics.whelpsOnRaid > 0);
});

test('Taunt: one press per cooldown, range failures, and passive threat while in melee', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state;
  sim.step({ ...idle(), abilities: ['taunt', 'taunt'] }, FIXED_DT);
  const ev = sim.drainEvents();
  assert.equal(ev.filter((e) => e.type === 'abilityUsed' && e.id === 'taunt').length, 1);
  assert.ok(ev.some((e) => e.type === 'abilityFailed' && e.reason === 'cooldown'));
  assert.ok(Math.abs(s.threat.player - (Math.max(6000, 3000 * script.threat.tauntLead) + script.threat.tauntBonus + script.threat.autoAttackPerSecond * FIXED_DT)) < 1e-6);
  // standing in melee range builds threat on its own
  const before = s.threat.player;
  run(sim, 1);
  assert.ok(Math.abs(s.threat.player - before - script.threat.autoAttackPerSecond) < 1, 'about autoAttackPerSecond per second');
  // out of range (once the cooldown has cleared)
  run(sim, script.playerAbilities.taunt.cooldown);
  s.world.player.x = 0; s.world.player.y = -40;
  sim.step({ ...idle(), abilities: ['taunt'] }, FIXED_DT);
  assert.ok(sim.drainEvents().some((e) => e.type === 'abilityFailed' && e.reason === 'range'));
  assert.equal(s.feedback.toast.text, 'Out of range');
});

test('losing threat turns her on the raid and Taunt brings her back', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const s = sim.state, b = s.world.boss;
  s.threat.player = 100; s.threat.raid = 3000;
  const ev = run(sim, 0.5);
  assert.ok(ev.some((e) => e.type === 'threatLost'));
  assert.equal(b.target, 'raid');
  assert.equal(s.metrics.threatLostCount, 1);
  assert.equal(s.nextExpected.label, 'Taunt. She is on the raid');
  // she walks toward the raid
  const yBefore = b.y;
  run(sim, 1);
  assert.ok(b.y < yBefore);
  sim.step({ ...idle(), abilities: ['taunt'] }, FIXED_DT);
  const ev2 = sim.drainEvents();
  assert.ok(ev2.some((e) => e.type === 'threatRegained' && e.by === 'taunt'));
  assert.equal(b.target, 'player');
  assert.ok(s.threat.player > s.threat.raid);
});

test('drill option `duration` ends the run with drillComplete', () => {
  const sim = makeSim({ start: 'wall', manual: true, duration: 3 });
  const ev = run(sim, 4);
  assert.equal(sim.state.ended, true);
  assert.equal(sim.state.result, 'drillComplete');
  assert.ok(ev.some((e) => e.type === 'end' && e.result === 'drillComplete'));
  assert.ok(sim.state.t <= 3 + FIXED_DT);
});

test('drill definitions build runnable sims', () => {
  for (const d of script.drills) {
    const sim = makeSim({ startPhase: d.startPhase, startOffset: d.startOffset || 0, start: d.start, actions: d.actions, duration: d.duration });
    const ev = run(sim, d.duration + 1, perfectTank());
    assert.equal(sim.state.result, 'drillComplete', d.id);
    assert.ok(ev.filter((e) => e.type === 'action').length > 0, `${d.id} fired actions`);
  }
});

test('manual mode schedules nothing and triggerAction respects prerequisites', () => {
  const sim = makeSim({ start: 'wall', manual: true, freezeHp: true });
  const ev = run(sim, 30);
  assert.equal(sim.state.schedule.length, 0);
  assert.equal(actions(ev).length, 0);
  assert.equal(sim.state.hp, 1, 'freezeHp holds the phase');
  assert.deepEqual(sim.state.upcoming, []);
  assert.equal(sim.triggerAction('deepBreath'), false, 'airborne-only');
  assert.equal(sim.triggerAction('cleave'), true);
  assert.equal(sim.drainEvents().filter((e) => e.type === 'action' && e.id === 'cleave').length, 1);
  assert.equal(sim.triggerAction('nope'), false);
});

test('tutorial scenario: passive boss ignores the player until woken', () => {
  const sim = makeSim({ manual: true, freezeHp: true, bossPassive: true, start: 'entrance' });
  const s = sim.state;
  s.world.player.x = P.bossStart.x; s.world.player.y = P.bossStart.y - script.boss.meleeRange;
  run(sim, 1);
  assert.equal(s.world.boss.engaged, false);
  assert.equal(s.world.idealPlayer.reason, 'tankSpot');
  sim.setBossPassive(false);
  assert.equal(s.world.boss.engaged, true, 'in range when woken: engages at once');
});

test('phase skip via setPhase: 1 -> 2 takes off, 2 -> 3 lands, phase-scoped pending expectations are dropped', () => {
  const sim = makeSim({ start: 'entrance' });
  run(sim, 1);
  sim.setPhase(2);
  assert.equal(sim.state.phase, 2);
  assert.equal(sim.state.world.boss.state, 'takeoff');
  run(sim, script.boss.takeoffDuration + 0.2);
  assert.equal(sim.state.world.boss.state, 'airborne');
  assert.ok(!sim.state.expectations.some((i) => i.status === 'pending' && i.phase === 1));
  sim.setPhase(3);
  assert.equal(sim.state.world.boss.state, 'landing');
  const ev = run(sim, script.boss.landingDuration + 0.2);
  assert.equal(actions(ev, 'landing').length, 1);
});

test('upcoming lists warn-able events with lead times, and landing when the phase is about to end', () => {
  const sim = makeSim({ start: 'wall' });
  run(sim, 1);
  const u = sim.state.upcoming;
  assert.ok(u.length > 0);
  for (let i = 1; i < u.length; i++) assert.ok(u[i].at >= u[i - 1].at, 'sorted');
  assert.ok(u.every((x) => x.in <= 30.01 && Math.abs(x.at - sim.state.t - x.in) < 1e-6));
  assert.ok(u.some((x) => x.id === 'flameBreath' && x.warn === true));
  assert.ok(!u.some((x) => x.id === 'tailSweep'), 'conditional actions are never announced');

  const late = makeSim({ startPhase: 2, startOffset: -6, start: 'pickup' });
  run(late, 0.1);
  const landing = late.state.upcoming.find((x) => x.id === 'landing');
  assert.ok(landing && landing.phase === true);
  assert.ok(Math.abs(landing.in - (6 - 0.1 + script.boss.landingDuration)) < 0.1);
});

test('snapshot has the contract fields and is JSON-serialisable', () => {
  const sim = makeSim({ start: 'entrance' });
  run(sim, 3, perfectTank());
  const snap = snapshot(sim.state);
  for (const k of ['t', 'phase', 'phaseName', 'phaseSubtitle', 'hp', 'role', 'world', 'threat', 'abilities', 'upcoming', 'nextExpected', 'feedback', 'metrics']) assert.ok(k in snap, k);
  for (const k of ['player', 'boss', 'raid', 'whelps', 'hazards', 'projectiles', 'ghost', 'idealPlayer', 'idealBoss', 'coneFlash']) assert.ok(k in snap.world, `world.${k}`);
  assert.deepEqual(Object.keys(snap.world.player).sort(), ['backpedal', 'fearedUntil', 'heading', 'hp', 'maxHp', 'moving', 'x', 'y', 'z']);
  assert.equal(snap.world.raid.dots.length, script.raid.size);
  const json = JSON.stringify(snap);
  const back = JSON.parse(json);
  assert.equal(back.world.player.x, sim.state.world.player.x);
  // live state exposes the same phase labels as the snapshot
  assert.equal(sim.state.phaseName, snap.phaseName);
  // mutating the snapshot does not touch the live state
  snap.world.player.x = 999;
  assert.notEqual(sim.state.world.player.x, 999);
});

test('determinism: same seed and same commands give identical states after 30 s', () => {
  const a = makeSim({ seed: 99, start: 'entrance', phaseDurations: { 1: 20, 2: 20, 3: 20 } });
  const b = makeSim({ seed: 99, start: 'entrance', phaseDurations: { 1: 20, 2: 20, 3: 20 } });
  const evA = run(a, 30, perfectTank());
  const evB = run(b, 30, perfectTank());
  const pick = (s) => ({ p: [s.world.player.x, s.world.player.y, s.world.player.heading], b: [s.world.boss.x, s.world.boss.y, s.world.boss.heading, s.world.boss.state], th: [s.threat.player, s.threat.raid], phase: s.phase, hz: s.world.hazards.map((h) => h.id) });
  assert.deepEqual(pick(a.state), pick(b.state));
  assert.deepEqual(evA.map((e) => e.type + (e.id || '')), evB.map((e) => e.type + (e.id || '')));
  const c = makeSim({ seed: 100, start: 'entrance', phaseDurations: { 1: 20, 2: 20, 3: 20 } });
  run(c, 30, perfectTank());
  assert.notDeepEqual(pick(a.state).hz.concat(a.state.schedule.map((x) => x.nextAt)), pick(c.state).hz.concat(c.state.schedule.map((x) => x.nextAt)), 'a different seed changes the schedule');
});

test('a perfect tank scores well on the full fight', () => {
  const sim = makeSim({ seed: 7, phaseDurations: { 1: 60, 2: 50, 3: 70 } });
  const ev = run(sim, 200, perfectTank());
  assert.equal(sim.state.result, 'victory');
  const exps = expectations(ev);
  assert.ok(exps.length >= 10);
  assert.ok(!exps.some((e) => e.status === 'missed'), `missed: ${exps.filter((e) => e.status === 'missed').map((e) => e.id)}`);
  assert.equal(sim.state.metrics.fearsTaken, undefined);
  assert.equal(sim.state.metrics.deaths, undefined);
});

test('after landing she settles for boss.settleAfterLanding before walking at the raid, and facing is not charged during the pickup grace', () => {
  const sim = makeSim({ startPhase: 2, startOffset: -1, start: 'pickup' });
  const s = sim.state;
  run(sim, 1 + script.boss.landingDuration + 0.2, idle);
  assert.equal(s.world.boss.state, 'grounded');
  assert.ok(s.threat.raid >= script.threat.landingRaidThreat && s.threat.raid < script.threat.landingRaidThreat + 20, 'the raid is already on her table when she lands');
  s.world.player.y = 32;   // out of melee range: no passive threat, so she stays on the raid
  const landedY = s.world.boss.y;
  run(sim, script.boss.settleAfterLanding - 0.4, idle);
  assert.ok(Math.abs(s.world.boss.y - landedY) < 0.5, 'she holds position while settling');
  assert.equal(s.phaseMetrics[3].bossFacingRaid ?? 0, 0, 'facing is free during the pickup grace');
  run(sim, 3, idle);
  assert.ok(s.world.boss.y < landedY - 3, 'then she walks toward the raid');
  assert.ok((s.phaseMetrics[3].bossFacingRaid ?? 0) > 0, 'facing is charged once the grace has passed');
});
