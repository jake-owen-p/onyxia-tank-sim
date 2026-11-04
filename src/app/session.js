// A session runs one simulation: fixed-timestep loop with a speed multiplier,
// input polling, event routing to audio/hooks, replay recording and rendering.

import { createSim, FIXED_DT } from '../core/sim.js';
import { snapshot } from '../core/snapshot.js';
import { computeScore } from '../core/scoring.js';

const MAX_STEPS_PER_FRAME = 8;
const SNAPSHOT_EVERY_TICKS = 6; // 10 Hz at 60 Hz sim

/**
 * @param {object} p
 *  script, scenario (from buildScenario), settings, renderer, audio, input, keybinds,
 *  hooks: { onEnd(sim, score), onEvent(evt), onTick(view), onPause(paused), onPhaseSkip(n) }
 */
export function createSession({ script, scenario, settings, renderer, audio, input, keybinds, hooks = {} }) {
  const sim = createSim(script, scenario.simOptions);
  const snapshots = [];
  let raf = 0;
  let last = 0;
  let acc = 0;
  let paused = false;
  let running = false;
  let stopped = false;
  let pausedByBlur = false;

  const view = () => sim.state;

  function record() {
    if (sim.state.tick % SNAPSHOT_EVERY_TICKS === 0) snapshots.push(snapshot(sim.state));
  }

  function routeEvents() {
    for (const e of sim.drainEvents()) {
      if (audio) audio.handleEvent(e);
      if (hooks.onEvent) hooks.onEvent(e, sim);
    }
  }

  function handleOneShots() {
    if (input.consume('toggleView')) {
      settings.view = settings.view === 'pov' ? 'topdown' : 'pov';
      renderer.setView(settings.view);
      if (hooks.onViewToggle) hooks.onViewToggle(settings.view);
    }
    if (input.consume('pause')) { if (hooks.onPauseKey) hooks.onPauseKey(api); else api.togglePause('user'); }
    for (const n of [1, 2, 3]) {
      if (input.consume('phase' + n) && !paused && !scenario.simOptions.manual) {
        sim.setPhase(n);
        routeEvents();
        if (hooks.onPhaseSkip) hooks.onPhaseSkip(n);
      }
    }
    const w = input.wheel();
    if (w && renderer.getView() === 'pov') renderer.zoom(w);
  }

  function frame(now) {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const dtReal = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    handleOneShots();

    if (!paused && !sim.state.ended) {
      acc += dtReal * (settings.speed || 1);
      let steps = Math.floor(acc / FIXED_DT);
      if (steps > MAX_STEPS_PER_FRAME) { steps = MAX_STEPS_PER_FRAME; acc = steps * FIXED_DT; }
      if (steps > 0) {
        const cmd = input.poll();
        for (let i = 0; i < steps; i++) {
          sim.step(cmd, FIXED_DT);
          record();
          // one-shot parts of the command apply to the first step only
          cmd.mouseTurn = 0; cmd.abilities = [];
          if (sim.state.ended) break;
        }
        acc -= steps * FIXED_DT;
        routeEvents();
      }
      if (audio) audio.tick(sim.state, dtReal);
      if (hooks.onTick) hooks.onTick(sim.state, sim);
    }

    renderer.frame({
      view: view(), settings, now: now / 1000, dtReal,
      abilityKeys: keybinds.abilityKeys(),
      overlay: { paused, replay: null, dim: !!hooks.isDimmed && hooks.isDimmed() },
    });

    if (sim.state.ended && !stopped) finish();
  }

  function finish() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    api.detach();
    input.setEnabled(false);
    const score = computeScore(script, sim.state.expectations, sim.state.phaseMetrics, sim.state.phasesPlayed, sim.state.role, sim.state.cues.log);
    if (hooks.onEnd) hooks.onEnd(sim, score, api);
  }

  function onBlur() { if (running && !paused && !sim.state.ended) { pausedByBlur = true; api.pause('blur'); } }
  function onVisibility() { if (document.hidden) onBlur(); }
  function onResize() { renderer.resize(); }

  const api = {
    sim, snapshots, scenario,
    get paused() { return paused; },
    get ended() { return sim.state.ended; },
    start() {
      if (running) return;
      running = true;
      renderer.resize();
      renderer.setView(settings.view);
      input.setEnabled(true);
      if (audio) audio.reset();
      window.addEventListener('blur', onBlur);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('resize', onResize);
      last = performance.now();
      // Render the initial state once so the first frame is not black.
      routeEvents();
      raf = requestAnimationFrame(frame);
    },
    pause(reason = 'user') {
      if (paused || stopped) return;
      paused = true;
      input.setEnabled(false);
      if (hooks.onPause) hooks.onPause(true, reason);
    },
    resume() {
      if (!paused || stopped) return;
      paused = false; pausedByBlur = false;
      input.setEnabled(true);
      acc = 0;
      last = performance.now();
      if (hooks.onPause) hooks.onPause(false);
    },
    togglePause(reason) { if (paused) api.resume(); else api.pause(reason); },
    /** Stop without a scorecard (quit to menu). */
    stop(result = 'aborted') {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      input.setEnabled(false);
      if (!sim.state.ended) sim.end(result);
    },
    /** Final score (valid after end). */
    score() { return computeScore(script, sim.state.expectations, sim.state.phaseMetrics, sim.state.phasesPlayed, sim.state.role, sim.state.cues.log); },
    duration() { return sim.state.t; },
    detach() {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    },
  };
  return api;
}
