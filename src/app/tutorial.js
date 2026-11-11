// The tutorial observes the live encounter. It never moves an entity, changes
// a phase, alters threat, or fires a boss ability. Skipping changes only the
// lesson panel; mechanics always come from the same simulation as a full run.
import { playerAtSpot, bossAtSpot } from '../core/expectations.js';

const ADVANCE_DELAY = 1.2;

export function createTutorial({ script, sim, settings, panel, audio = null, onExit = () => {} }) {
  const steps = script.tutorial.steps;
  let index = -1, step = null, stepStart = 0;
  let metricAtStart = 0, landed = false, doneAt = null, holdSince = null;
  let continuePressed = false, viewToggled = false, finished = false;
  const savedGhostAlpha = settings.ghostAlpha;
  const t = () => sim.state.t;

  function enter(i) {
    index = i; step = steps[i]; stepStart = t();
    doneAt = null; holdSince = null; continuePressed = false; landed = false;
    metricAtStart = step.done.metricUnchanged ? (sim.state.metrics[step.done.metricUnchanged] || 0) : 0;
    panel.show({
      title: step.title, text: step.text, index: index + 1, total: steps.length,
      showContinue: step.done.type === 'wait' || step.done.type === 'viewToggledOrWait',
      status: '',
      onContinue: () => { continuePressed = true; },
      onSkip: () => api.skip(),
      onExit: () => api.exit('user'),
    });
  }

  function isDone() {
    const d = step.done, s = sim.state;
    switch (d.type) {
      case 'viewToggledOrWait': return viewToggled || continuePressed || t() - stepStart >= (d.seconds || 5);
      case 'wait': return continuePressed || t() - stepStart >= (d.seconds || 5);
      case 'playerAtSpot': return playerAtSpot(s, script, d.spot);
      case 'bossAtSpot': {
        const positioned = s.world.boss.engaged && s.world.boss.target === 'player'
          && bossAtSpot(s, script, d.spot)
          && (!d.playerSpot || playerAtSpot(s, script, d.playerSpot));
        if (!positioned) { holdSince = null; return false; }
        if (holdSince == null) holdSince = t();
        return t() - holdSince >= (d.hold || 0);
      }
      case 'eventLanded':
      case 'expectation': return landed;
      // Stay with this phase until the encounter itself moves on.
      case 'phaseEnd':
      case 'victory': return false;
      default: return false;
    }
  }

  const api = {
    get index() { return index; },
    get step() { return step; },
    get finished() { return finished; },
    steps,
    start() {
      settings.ghostAlpha = Math.max(0.6, settings.ghostAlpha || 0);
      enter(0);
    },
    tick() {
      if (finished || !step) return;
      if (sim.state.ended) { api.exit(sim.state.result === 'victory' ? 'complete' : 'ended'); return; }
      // Don't leave the player reading about a ground mechanic during flight,
      // or waiting for another breath after Onyxia has already landed.
      if (step.phase !== sim.state.phase) {
        const next = steps.findIndex((lesson) => lesson.phase === sim.state.phase);
        if (next >= 0) enter(next);
      }
      if (doneAt == null && isDone()) {
        doneAt = t();
        if (audio) audio.play('ontime');
        panel.setStatus('Done');
      } else if (doneAt != null && t() - doneAt >= ADVANCE_DELAY) {
        if (steps[index + 1]?.phase === sim.state.phase) enter(index + 1);
      }
    },
    handleEvent(evt) {
      if (finished || !step) return;
      const d = step.done;
      if (d.type === 'eventLanded' && evt.type === 'action' && evt.id === d.event) {
        const metric = d.metricUnchanged ? (sim.state.metrics[d.metricUnchanged] || 0) : 0;
        if (metric <= metricAtStart) landed = true;
        else {
          panel.setStatus('The raid was hit. Face her toward the wall for the next cast.');
          metricAtStart = metric;
        }
      }
      if (d.type === 'expectation' && evt.type === 'expectation' && evt.id === d.id) {
        if (evt.status === 'ontime' || evt.status === 'late') landed = true;
        else panel.setStatus('Missed that one. Try again when the mechanic comes around.');
      }
      if (evt.type === 'hazardWarn' && evt.kind === 'lane') panel.setStatus('Deep Breath: check her position and move out of her flight path.');
      if (evt.type === 'threatLost') panel.setStatus('She turned! Get into melee range and build threat.');
      if (evt.type === 'threatWiped' && evt.target === 'player') panel.setStatus('That Fireball cleared your threat. Be ready to rebuild when she lands.');
    },
    viewToggled() { viewToggled = true; },
    skip() {
      if (finished) return;
      if (steps[index + 1]?.phase === sim.state.phase) enter(index + 1);
      else panel.setStatus('Keep fighting. The next lesson starts when the phase changes.');
    },
    exit(reason = 'user') {
      if (finished) return;
      finished = true;
      settings.ghostAlpha = savedGhostAlpha;
      panel.hide();
      onExit(reason);
    },
  };
  return api;
}
