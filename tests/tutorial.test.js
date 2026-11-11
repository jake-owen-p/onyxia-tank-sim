import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSim, FIXED_DT } from '../src/core/sim.js';
import { buildScenario } from '../src/app/modes.js';
import { createTutorial } from '../src/app/tutorial.js';
import { playerAtSpot } from '../src/core/expectations.js';
import { script, driveToward } from './helpers.js';

test('tutorial pull: Onyxia engages and follows while the tank walks to the back wall', () => {
  const settings = { role: 'tank', ghostAlpha: 0 };
  const scenario = buildScenario({ mode: 'tutorial', settings, script, seed: 7 });
  const sim = createSim(script, scenario.simOptions);
  const tutorial = createTutorial({ script, sim, settings, panel: { show() {}, setStatus() {}, hide() {} } });
  tutorial.start();
  const startY = sim.state.world.boss.y;
  const events = [];
  for (let i = 0; i < 30 / FIXED_DT && !playerAtSpot(sim.state, script, 'tankSpot'); i++) {
    sim.step(driveToward(sim, script.positions.tankSpot), FIXED_DT);
    for (const event of sim.drainEvents()) {
      events.push(event);
      tutorial.handleEvent(event);
    }
    tutorial.tick();
  }
  assert.ok(playerAtSpot(sim.state, script, 'tankSpot'), 'the player reached the back wall');
  assert.ok(events.some((event) => event.type === 'engage'), 'walking past Onyxia must pull her during the tutorial');
  assert.equal(sim.state.world.boss.target, 'player');
  assert.ok(sim.state.world.boss.y > startY + 10, 'Onyxia must follow the tank toward the wall');
});

function harness(seed, phaseDurations) {
  const settings = { role: 'tank', ghostAlpha: 0.2, phaseDurations: { onyxia: phaseDurations } };
  const sim = createSim(script, buildScenario({ mode: 'tutorial', settings, script, seed }).simOptions);
  let exitReason;
  const tutorial = createTutorial({ script, sim, settings, panel: { show() {}, setStatus() {}, hide() {} }, onExit(reason) { exitReason = reason; } });
  tutorial.start();
  return { sim, tutorial, settings, exitReason: () => exitReason };
}

// UIDs are renderer identities allocated globally; mechanics must match even
// when two simulations run side by side in the same process.
const comparable = (value) => JSON.parse(JSON.stringify(value, (key, v) => key === 'uid' ? undefined : v));

test('tutorial and full fight produce the same encounter through all phases under identical inputs', async () => {
  const { perfectTank } = await import('./helpers.js');
  for (const seed of [7, 29, 83]) {
    const h = harness(seed);
    const full = createSim(script, buildScenario({ mode: 'full', settings: h.settings, script, seed }).simOptions);
    const bot = perfectTank();
    const seen = new Set();
    for (let i = 0; i < 400 / FIXED_DT && !full.state.ended; i++) {
      const command = bot(full);
      full.step(command, FIXED_DT); h.sim.step(command, FIXED_DT);
      const expected = full.drainEvents(), actual = h.sim.drainEvents();
      assert.deepEqual(comparable(actual), comparable(expected), `events differ at tick ${i}, seed ${seed}`);
      for (const event of actual) h.tutorial.handleEvent(event);
      h.tutorial.tick();
      seen.add(h.tutorial.step.phase);
      if (i % 60 === 0) assert.deepEqual(comparable(h.sim.state), comparable(full.state), `state differs at tick ${i}, seed ${seed}`);
    }
    assert.equal(full.state.result, 'victory');
    assert.deepEqual([...seen], [1, 2, 3]);
    assert.equal(h.exitReason(), 'complete');
    assert.equal(h.settings.ghostAlpha, 0.2, 'guidance preference restored');
  }
});

test('skipping lessons never teleports, starts a phase, triggers an attack or marks the fight complete', () => {
  const h = harness(7);
  const before = comparable(h.sim.state);
  for (let i = 0; i < 30; i++) h.tutorial.skip();
  assert.deepEqual(comparable(h.sim.state), before);
  assert.equal(h.tutorial.step.phase, 1);
  assert.equal(h.tutorial.finished, false);
  h.tutorial.exit();
  assert.equal(h.exitReason(), 'user');
  assert.equal(h.settings.ghostAlpha, 0.2);
});

test('a fast phase change replaces stale lessons without changing the encounter', () => {
  const h = harness(7, { 1: 1, 2: 1, 3: 1 });
  h.sim.teleport('wall'); // test fixture only; the tutorial never calls this
  for (let i = 0; i < 4 / FIXED_DT; i++) {
    h.sim.step({}, FIXED_DT);
    for (const e of h.sim.drainEvents()) h.tutorial.handleEvent(e);
    h.tutorial.tick();
    if (!h.sim.state.ended) assert.equal(h.tutorial.step.phase, h.sim.state.phase);
  }
  assert.equal(h.exitReason(), 'complete');
});
