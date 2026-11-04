// Press cues: filler beats, predicted and armed cooldown beats, reactive beats,
// grading windows, Sunder Armor stacks and the rotation share of the score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT } from '../src/core/sim.js';
import { snapshot } from '../src/core/snapshot.js';
import { computeScore } from '../src/core/scoring.js';
import { tallyBeats, bestComboOf } from '../src/core/rotation.js';
import { script, makeSim, run, idle, perfectTank } from './helpers.js';

const press = (...ids) => () => ({ ...idle(), abilities: ids });
const beats = (events, status) => events.filter((e) => e.type === 'beat' && (!status || e.status === status));
const pendingFor = (sim, ability) => sim.state.rotation.beats.find((b) => b.status === 'pending' && b.ability === ability);
const windows = script.rotation.windows;

test('filler: a Sunder note is armed as soon as she is in range; pressing on it is perfect and stacks the debuff', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT);
  const beat = pendingFor(sim, 'sunder');
  assert.ok(beat, 'a Sunder beat exists at the wall');
  assert.equal(beat.armed, true);
  assert.equal(beat.filler, true);
  assert.ok(beat.at <= sim.state.t + 0.01, 'first filler is due now');

  let ev = run(sim, FIXED_DT, press('sunder'));
  const hit = beats(ev)[0];
  assert.ok(hit, 'a beat event fired');
  assert.equal(hit.status, 'perfect');
  assert.equal(hit.ability, 'sunder');
  assert.equal(hit.combo, 1);
  assert.equal(sim.state.debuffs.sunder.stacks, 1);

  const next = pendingFor(sim, 'sunder');
  assert.ok(next, 'the next filler note is queued');
  assert.ok(Math.abs(next.at - sim.state.abilities.gcdUntil) < 0.001, 'next filler lands when the global ends');

  // Pressing 0.4s before the global ends is "early": no resolution, no combo break.
  run(sim, script.gcd - 0.45);
  ev = run(sim, FIXED_DT, press('sunder'));
  assert.equal(beats(ev).length, 0);
  assert.ok(sim.state.rotation.lastEarly && sim.state.rotation.lastEarly.ability === 'sunder');
  assert.equal(sim.state.rotation.combo, 1);

  // Pressing just after the global ends is perfect; 0.6s after is good.
  run(sim, 0.5);
  ev = run(sim, FIXED_DT, press('sunder'));
  assert.equal(beats(ev)[0].status, 'perfect');
  run(sim, script.gcd + 0.6);
  ev = run(sim, FIXED_DT, press('sunder'));
  assert.equal(beats(ev)[0].status, 'good');
  assert.ok(beats(ev)[0].delta > windows.perfect);
  assert.equal(sim.state.rotation.combo, 3);
});

test('filler: ignoring the note misses it after its late window, breaks the combo and respawns a note', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT, press('sunder'));
  assert.equal(sim.state.rotation.combo, 1);
  const beat = pendingFor(sim, 'sunder');
  const ev = run(sim, (beat.at - sim.state.t) + script.rotation.filler.late + 0.1);
  const missed = beats(ev, 'missed');
  assert.equal(missed.length, 1);
  assert.equal(sim.state.rotation.combo, 0);
  assert.equal(sim.state.rotation.counts.missed, 1);
  const again = pendingFor(sim, 'sunder');
  assert.ok(again, 'another filler note follows a miss');
  assert.ok(again.at >= missed[0].t + script.rotation.filler.missRespawn - 0.02);
});

test('filler notes are dropped, not missed, when she cannot be hit', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT);
  assert.ok(pendingFor(sim, 'sunder'));
  sim.setPhase(2);               // she takes off
  run(sim, 5);
  assert.equal(pendingFor(sim, 'sunder'), undefined);
  assert.equal(sim.state.rotation.counts.missed, 0);
  assert.equal(sim.state.rotation.log.length, 0);
});

test('Sunder Armor stacks cap at maxStacks and fall off after debuffDuration', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const sunderDef = script.playerAbilities.sunder;
  for (let i = 0; i < 8; i++) { run(sim, FIXED_DT, press('sunder')); run(sim, script.gcd); }
  assert.equal(sim.state.debuffs.sunder.stacks, sunderDef.maxStacks);
  run(sim, sunderDef.debuffDuration + 0.1);
  assert.equal(sim.state.debuffs.sunder.stacks, 0, 'stacks expire without a refresh');
});

test('Flame Breath: the Shield Block note is predicted from the schedule, armed by the cast, and graded', () => {
  const sim = makeSim({ start: 'wall' });        // real phase 1 schedule
  run(sim, FIXED_DT);
  const predicted = pendingFor(sim, 'shieldBlock');
  assert.ok(predicted, 'a provisional note exists for the first breath');
  assert.equal(predicted.armed, false);
  const up = sim.state.upcoming.find((u) => u.id === 'flameBreath');
  assert.ok(Math.abs(predicted.at - (up.at + 0.5)) < 0.001, 'note sits half a second into the cast');

  const ev = run(sim, up.in + 0.05);
  assert.ok(ev.some((e) => e.type === 'cast' && e.id === 'flameBreath'));
  const armed = pendingFor(sim, 'shieldBlock');
  assert.equal(armed.armed, true);
  const castStart = ev.find((e) => e.type === 'cast' && e.id === 'flameBreath').t;
  assert.ok(Math.abs(armed.at - (castStart + 0.5)) < 0.02);

  run(sim, 0.5);
  const hit = beats(run(sim, FIXED_DT, press('shieldBlock')))[0];
  assert.equal(hit.status, 'perfect');
  assert.equal(hit.cue, 'blockBreath');
  assert.ok(sim.state.abilities.buffs.shieldBlockUntil > sim.state.t);
});

test('Flame Breath: no Shield Block press is a missed note once the window closes', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT);
  assert.equal(sim.triggerAction('flameBreath'), true);
  const cue = script.rotation.cues.find((c) => c.id === 'blockBreath');
  const ev = run(sim, cue.offset + cue.late + 0.1);
  const missed = beats(ev, 'missed').filter((b) => b.cue === 'blockBreath');
  assert.equal(missed.length, 1);
  assert.ok(Math.abs(missed[0].t - (sim.state.t)) < 0.2, 'missed the moment the window closed');
});

test('threat lost: a Taunt note appears at once; Taunting inside the window counts', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT);
  sim.state.threat.raid = sim.state.threat.player * 5;     // the raid rips her
  const ev = run(sim, FIXED_DT);
  assert.ok(ev.some((e) => e.type === 'threatLost'));
  const note = pendingFor(sim, 'taunt');
  assert.ok(note && note.cue === 'tauntLost');
  assert.equal(note.early, 0);
  run(sim, 0.2);
  const hit = beats(run(sim, FIXED_DT, press('taunt')))[0];
  assert.equal(hit.status, 'perfect');
  assert.equal(sim.state.world.boss.target, 'player');
});

test('Bellowing Roar: the Berserker Rage note is armed with the cast and must land before the cast ends', () => {
  const sim = makeSim({ start: 'wall', startPhase: 3, manual: true });
  run(sim, FIXED_DT);
  sim.triggerAction('bellowingRoar');
  run(sim, FIXED_DT);
  const note = pendingFor(sim, 'fearImmune');
  assert.ok(note && note.cue === 'rageRoar' && note.armed);
  const cue = script.rotation.cues.find((c) => c.id === 'rageRoar');
  assert.ok(note.at + cue.late <= note.at + script.actions.bellowingRoar.cast, 'window closes before the fear lands');
  const hit = beats(run(sim, FIXED_DT, press('fearImmune')))[0];
  assert.equal(hit.status, 'perfect');
  const ev = run(sim, 2);
  assert.ok(ev.some((e) => e.type === 'fearResisted'));
});

test('the perfect tank bot keeps a combo through a full phase 1 and scores the rotation points', () => {
  const sim = makeSim({ start: 'wall', phaseDurations: { 1: 40, 2: 10, 3: 10 } });
  const ev = run(sim, 40, perfectTank());
  const all = beats(ev);
  assert.ok(all.length >= 20, `many notes were judged (${all.length})`);
  assert.equal(beats(ev, 'missed').length, 0, 'the bot misses nothing');
  const tally = tallyBeats(sim.state.rotation.log, 1);
  assert.equal(tally.missed, 0);
  assert.ok(tally.perfect >= tally.good);
  assert.equal(bestComboOf(sim.state.rotation.log), all.length);
  const score = computeScore(script, sim.state.expectations, sim.state.phaseMetrics, [1], 'mt', sim.state.rotation.log);
  assert.equal(score.phases[0].rotation.total, tally.total);
  assert.ok(score.phases[0].rotation.points >= script.grading.rotationPoints * 0.9);
  assert.equal(score.rotation.bestCombo, all.length);
});

test('computeScore: missed notes cost rotation points and surface as fixes', () => {
  const mk = (cue, status, filler = false) => ({ cue, ability: 'sunder', label: `L:${cue}`, tip: 'tip', filler, phase: 1, status, delta: 0 });
  const log = [mk('sunder', 'perfect', true), mk('sunder', 'missed', true), mk('blockBreath', 'missed'), mk('blockBreath', 'good')];
  const r = computeScore(script, [], { 1: {} }, [1], 'mt', log);
  const g = script.grading;
  const expected = Math.round(g.expectationPoints + g.metricPoints + g.rotationPoints * (1 + 0.6) / 4);
  assert.equal(r.overall, expected);
  assert.equal(r.phases[0].rotation.missed, 2);
  const fix = r.fixes.find((f) => f.kind === 'rotation');
  assert.ok(fix, 'a rotation fix is listed');
  assert.equal(fix.title, 'L:blockBreath', 'a missed cooldown outranks a dropped filler global');
  assert.equal(fix.detail, '1 missed');
  const none = computeScore(script, [], { 1: {} }, [1], 'mt', []);
  assert.equal(none.overall, 100, 'no notes judged means full rotation points');
});

test('snapshots carry the lane and debuffs and stay JSON-safe', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT, press('sunder'));
  const sn = snapshot(sim.state);
  assert.equal(sn.debuffs.sunder.stacks, 1);
  assert.ok(sn.rotation.beats.length >= 1);
  assert.equal(sn.rotation.combo, 1);
  const back = JSON.parse(JSON.stringify(sn));
  assert.equal(back.rotation.lastHit.status, 'perfect');
});
