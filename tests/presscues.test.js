// Press cues: Taunt notes raised by events, grading windows, combos, the
// cue share of the score and the snapshot shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_DT } from '../src/core/sim.js';
import { snapshot } from '../src/core/snapshot.js';
import { computeScore } from '../src/core/scoring.js';
import { tallyCues, bestComboOf } from '../src/core/presscues.js';
import { script, makeSim, run, idle, perfectTank } from './helpers.js';

const press = (...ids) => () => ({ ...idle(), abilities: ids });
const beats = (events, status) => events.filter((e) => e.type === 'beat' && (!status || e.status === status));
const pendingFor = (sim, cue) => sim.state.cues.beats.find((b) => b.status === 'pending' && b.cue === cue);
const cueDef = (id) => script.cues.list.find((c) => c.id === id);
const perfect = script.cues.windows.perfect;

/** Put her on the raid at the wall: a threatLost event and a NOW note. */
function loseHer(sim) {
  const s = sim.state;
  s.threat.player = 100; s.threat.raid = 3000;
  return run(sim, FIXED_DT);
}

test('she turns on the raid: a NOW Taunt note appears; pressing inside the perfect window is perfect', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  const ev = loseHer(sim);
  assert.ok(ev.some((e) => e.type === 'threatLost'));
  const note = pendingFor(sim, 'tauntLost');
  assert.ok(note, 'a note exists');
  assert.equal(note.ability, 'taunt');
  assert.equal(note.early, 0);
  assert.equal(note.late, cueDef('tauntLost').late);
  assert.ok(Math.abs(note.at - sim.state.t) < 0.001, 'due now');

  run(sim, perfect - 0.1);
  const ev2 = run(sim, FIXED_DT, press('taunt'));
  const hit = beats(ev2)[0];
  assert.ok(hit);
  assert.equal(hit.status, 'perfect');
  assert.equal(hit.cue, 'tauntLost');
  assert.equal(hit.combo, 1);
  assert.equal(sim.state.cues.counts.perfect, 1);
  assert.equal(sim.state.world.boss.target, 'player');
});

test('a late Taunt inside the window is good; none at all is missed and breaks the combo', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  loseHer(sim);
  run(sim, 1.5);
  const ev = run(sim, FIXED_DT, press('taunt'));
  assert.equal(beats(ev)[0].status, 'good');
  assert.ok(beats(ev)[0].delta > 1.4);
  assert.equal(sim.state.cues.combo, 1);

  // Lose her again once the Taunt hold and cooldown have passed.
  run(sim, script.playerAbilities.taunt.cooldown + 0.5);
  const ev2 = loseHer(sim);
  assert.ok(ev2.some((e) => e.type === 'threatLost'));
  const ev3 = run(sim, cueDef('tauntLost').late + 0.2);
  const miss = beats(ev3, 'missed');
  assert.equal(miss.length, 1);
  assert.equal(miss[0].cue, 'tauntLost');
  assert.equal(sim.state.cues.combo, 0);
  assert.equal(sim.state.cues.bestCombo, 1);
  assert.equal(sim.state.cues.counts.missed, 1);
});

test('no note is raised when Taunt cannot be ready inside the window', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  run(sim, FIXED_DT, press('taunt'));                  // burn the cooldown
  run(sim, script.threat.tauntDuration + 0.1);          // let the hold expire
  loseHer(sim);
  assert.ok(sim.state.abilities.readyAt.taunt > sim.state.t + cueDef('tauntLost').late, 'still on cooldown past the window');
  assert.equal(pendingFor(sim, 'tauntLost'), undefined);
});

test('landing note: lands one second after touchdown with an early window; a slightly early press is good', () => {
  const sim = makeSim({ startPhase: 2, startOffset: -1, start: 'pickup', manual: true });
  const ev = run(sim, 1 + script.boss.landingDuration + 0.2, perfectTank());
  const landing = ev.find((e) => e.type === 'action' && e.id === 'landing');
  assert.ok(landing, 'she landed');
  const hit = beats(ev).find((b) => b.cue === 'tauntLanding');
  assert.ok(hit, 'the bot pressed on the landing note');
  assert.ok(['perfect', 'good'].includes(hit.status));
  const def = cueDef('tauntLanding');
  assert.equal(def.offset, 1);
  assert.ok(def.early > 0);
});

test('off-tank whelp note is satisfied by walking into the whelps (doneBy), no key needed', () => {
  const sim = makeSim({ role: 'offtank', startPhase: 2, start: 'pickup', manual: true });
  sim.triggerAction('whelpWave');
  const ev = run(sim, 14, perfectTank());
  const hit = beats(ev).find((b) => b.cue === 'tauntWhelps');
  assert.ok(hit, 'whelp note resolved');
  assert.notEqual(hit.status, 'missed');
  assert.ok(ev.some((e) => e.type === 'whelpPickup'));
});

test('main tank never sees the off-tank whelp note', () => {
  const sim = makeSim({ role: 'mt', startPhase: 2, start: 'pickup', manual: true });
  sim.triggerAction('whelpWave');
  run(sim, 1);
  assert.equal(pendingFor(sim, 'tauntWhelps'), undefined);
});

test('pending notes are dropped, not scored, on a phase skip', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  loseHer(sim);
  assert.ok(pendingFor(sim, 'tauntLost'));
  sim.setPhase(2);
  assert.equal(sim.state.cues.beats.filter((b) => b.status === 'pending').length, 0);
  assert.equal(sim.state.cues.log.length, 0);
});

test('tallies, best combo and the cue share of the score', () => {
  const log = [
    { phase: 1, status: 'perfect' }, { phase: 1, status: 'good' }, { phase: 1, status: 'missed' },
    { phase: 3, status: 'perfect' }, { phase: 3, status: 'perfect' },
  ];
  assert.deepEqual(tallyCues(log, 1), { perfect: 1, good: 1, missed: 1, total: 3 });
  assert.deepEqual(tallyCues(log), { perfect: 3, good: 1, missed: 1, total: 5 });
  assert.equal(bestComboOf(log), 2);
  const sc = computeScore(script, [], {}, [1, 3], 'mt', log);
  const w = script.grading.cueWeights, pts = script.grading.cuePoints;
  assert.equal(sc.phases[0].cues.points, Math.round(((w.perfect + w.good) / 3) * pts));
  assert.equal(sc.phases[1].cues.points, pts);
  assert.equal(sc.cues.bestCombo, 2);
  // A phase with no judged note keeps the full cue points.
  const none = computeScore(script, [], {}, [2], 'mt', log);
  assert.equal(none.phases[0].cues.points, pts);
  assert.equal(none.phases[0].total, 100);
});

test('missed Taunt notes rank in the top fixes with the cue tip', () => {
  const log = [
    { phase: 1, status: 'missed', cue: 'tauntLost', label: 'Taunt when she turns on the raid', tip: 'tip' },
    { phase: 1, status: 'missed', cue: 'tauntLost', label: 'Taunt when she turns on the raid', tip: 'tip' },
  ];
  const sc = computeScore(script, [], {}, [1], 'mt', log);
  const fix = sc.fixes.find((f) => f.kind === 'cue');
  assert.ok(fix);
  assert.equal(fix.count, 2);
  assert.equal(fix.detail, '2 missed');
});

test('snapshot carries the cue lane state and the jump height', () => {
  const sim = makeSim({ start: 'wall', manual: true });
  loseHer(sim);
  run(sim, FIXED_DT, () => ({ ...idle(), jump: true }));
  const snap = snapshot(sim.state);
  assert.ok(snap.cues);
  assert.equal(typeof snap.cues.combo, 'number');
  assert.ok(Array.isArray(snap.cues.beats));
  assert.ok(snap.cues.beats.some((b) => b.cue === 'tauntLost'));
  assert.ok(snap.world.player.z > 0);
  assert.equal(snap.abilities.buffs, undefined);
  assert.equal(snap.debuffs, undefined);
  JSON.stringify(snap);
});
