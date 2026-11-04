// Tutorial driver: walks script.tutorial.steps against a live session. Pure
// step logic lives here; the DOM panel is injected so this module can be
// exercised in node with a stub.

import { playerAtSpot, bossAtSpot } from '../core/expectations.js';

const READ_DELAY = 2;       // seconds before a step's trigger fires
const ADVANCE_DELAY = 1.2;  // seconds between a step completing and the next one
const RETRY_DELAY = 3;      // seconds before re-triggering a missed mechanic

/**
 * @param {object} p { script, sim, settings, panel, audio, onExit(reason) }
 *  panel: { show({title,text,index,total,showContinue,status,onContinue,onSkip,onExit}), setStatus(text), hide() }
 */
export function createTutorial({ script, sim, settings, panel, audio = null, onExit = () => {} }) {
  const steps = script.tutorial.steps;
  let index = -1;
  let step = null;
  let stepStart = 0;
  let metricAtStart = 0;
  let triggerAt = null;
  let landed = false;
  let doneAt = null;         // sim time when the step completed (advance after delay)
  let holdSince = null;
  let continuePressed = false;
  let viewToggled = false;
  let finished = false;
  let savedGhostAlpha = null;
  let retryAt = null;

  const t = () => sim.state.t;

  function applySetup(setup) {
    if (!setup) return;
    if (setup.bossPassive != null) sim.setBossPassive(setup.bossPassive);
    if (setup.phase != null && setup.phase !== sim.state.phase) sim.setPhase(setup.phase);
    if (setup.start) sim.teleport(setup.start);
    if (setup.ghost) {
      if (savedGhostAlpha == null) savedGhostAlpha = settings.ghostAlpha;
      settings.ghostAlpha = Math.max(0.6, settings.ghostAlpha || 0);
    }
  }

  function showPanel(status = '') {
    panel.show({
      title: step.title, text: step.text, index: index + 1, total: steps.length,
      showContinue: step.done.type === 'wait' || step.done.type === 'viewToggledOrWait',
      status,
      onContinue: () => { continuePressed = true; },
      onSkip: () => api.skip(),
      onExit: () => api.exit('user'),
    });
  }

  function enter(i) {
    index = i;
    step = steps[i];
    if (!step) { api.exit('complete'); return; }
    stepStart = t();
    doneAt = null; holdSince = null; continuePressed = false; landed = false; retryAt = null;
    metricAtStart = step.done.metricUnchanged ? (sim.state.metrics[step.done.metricUnchanged] || 0) : 0;
    applySetup(step.setup);
    triggerAt = step.trigger ? t() + READ_DELAY : null;
    showPanel();
  }

  function fireTrigger() {
    if (!step.trigger) return;
    const ok = sim.triggerAction(step.trigger);
    // The action may be refused (boss mid-transition); try again shortly.
    triggerAt = ok ? null : t() + 1;
  }

  function isDone() {
    const d = step.done;
    switch (d.type) {
      case 'viewToggledOrWait': return viewToggled || continuePressed || t() - stepStart >= (d.seconds || 5);
      case 'wait': return continuePressed || t() - stepStart >= (d.seconds || 5);
      case 'playerAtSpot': return playerAtSpot(sim.state, script, d.spot);
      case 'bossAtSpot': {
        if (bossAtSpot(sim.state, script, d.spot)) {
          if (holdSince == null) holdSince = t();
          return t() - holdSince >= (d.hold || 0);
        }
        holdSince = null;
        return false;
      }
      case 'eventLanded': return landed;
      case 'expectation': return landed;
      case 'debuffStacks': return ((sim.state.debuffs && sim.state.debuffs[d.debuff] || {}).stacks || 0) >= (d.stacks || 1);
      default: return true;
    }
  }

  const api = {
    get index() { return index; },
    get step() { return step; },
    get finished() { return finished; },
    steps,
    start() { enter(0); },
    /** Call once per sim tick batch (after steps). */
    tick() {
      if (finished || !step) return;
      const now = t();
      if (triggerAt != null && now >= triggerAt) fireTrigger();
      if (retryAt != null && now >= retryAt) { retryAt = null; sim.triggerAction(step.trigger); }
      if (doneAt == null) {
        if (isDone()) {
          doneAt = now;
          if (audio) audio.play('ontime');
          panel.setStatus('Done');
        }
      } else if (now - doneAt >= ADVANCE_DELAY) {
        enter(index + 1);
      }
    },
    /** Route core events here. */
    handleEvent(evt) {
      if (finished || !step) return;
      const d = step.done;
      if (d.type === 'eventLanded' && evt.type === 'action' && evt.id === d.event) {
        const m = d.metricUnchanged ? (sim.state.metrics[d.metricUnchanged] || 0) : 0;
        if (m <= metricAtStart) landed = true;
        else { panel.setStatus('The raid was hit. Hold her facing the wall and try again.'); retryAt = t() + RETRY_DELAY; metricAtStart = m; }
      }
      if (d.type === 'expectation' && evt.type === 'expectation' && evt.id === d.id) {
        if (evt.status === 'ontime' || evt.status === 'late') landed = true;
        else if (step.trigger) { panel.setStatus('Missed. Watch the warning and try again.'); retryAt = t() + RETRY_DELAY; }
      }
    },
    /** The host calls this when the user switches views. */
    viewToggled() { viewToggled = true; },
    skip() { if (!finished) { doneAt = null; enter(index + 1); } },
    exit(reason = 'user') {
      if (finished) return;
      finished = true;
      if (savedGhostAlpha != null) settings.ghostAlpha = savedGhostAlpha;
      panel.hide();
      onExit(reason);
    },
  };
  return api;
}
