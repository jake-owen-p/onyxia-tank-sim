// Boot: load the encounter script, build the shared services (settings,
// keybinds, input, audio, renderer, overlay) and wire the menus to sessions.

import { createSim } from './core/sim.js';
import { createRenderer } from './render/renderer.js';
import { createKeybinds } from './input/keybinds.js';
import { createInput } from './input/input.js';
import { createAudio } from './audio/cues.js';
import { loadSettings, saveSettings, loadBinds, saveBinds, loadHistory, saveRun, clearHistory, resetAll } from './ui/storage.js';
import { createOverlay, h, button } from './ui/overlay.js';
import { menuScreen, historyScreen, pauseScreen } from './ui/menu.js';
import { settingsScreen } from './ui/settings.js';
import { scorecardScreen } from './ui/scorecard.js';
import { replayScreen } from './ui/replay.js';
import { createTutorialPanel } from './ui/tutorialPanel.js';
import { buildScenario } from './app/modes.js';
import { createSession } from './app/session.js';
import { createTutorial } from './app/tutorial.js';

const SCRIPT_URL = './data/encounters/onyxia.json';

async function loadScript() {
  try {
    const res = await fetch(SCRIPT_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Chrome blocks fetch on file://. A sibling .js module is an optional escape hatch.
    try {
      const mod = await import('../data/encounters/onyxia.js');
      if (mod && (mod.default || mod.script)) return mod.default || mod.script;
    } catch { /* fall through */ }
    throw err;
  }
}

function showLoadError(root, err) {
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' },
    h('h2', { text: 'Could not load the encounter script' }),
    h('p', { text: `The browser refused to read ${SCRIPT_URL} (${err.message}). Chrome blocks file:// reads; serve the folder instead:` }),
    h('pre', { text: 'cd <this folder>\npython3 -m http.server 8080\n# or: npx serve .\nthen open http://localhost:8080' }),
    h('p', { class: 'muted', text: 'Firefox and Safari open index.html directly.' }),
  )));
}

async function boot() {
  const canvas = document.getElementById('stage');
  const uiRoot = document.getElementById('ui');
  let script;
  try { script = await loadScript(); } catch (err) { showLoadError(uiRoot, err); return; }

  // ---- shared services
  const settings = loadSettings();
  const keybinds = createKeybinds(loadBinds());
  keybinds.onChange((b) => saveBinds(b));
  const input = createInput(canvas, keybinds, settings);
  const audio = createAudio(settings);
  const renderer = createRenderer(canvas, script);
  const overlay = createOverlay(uiRoot);
  const tutorialPanel = createTutorialPanel(uiRoot);
  const persist = () => saveSettings(settings);

  const unlock = () => { audio.unlock(); };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);

  let session = null;
  let tutorial = null;
  let lastScenarioParams = null;
  let replayEl = null;
  let idleRaf = 0;

  // ---- idle backdrop: a passive sim rendered behind the menus
  const idleSim = createSim(script, { manual: true, freezeHp: true, bossPassive: true, start: 'wall', seed: 3 });
  let idleLast = performance.now();
  function idleFrame(now) {
    idleRaf = requestAnimationFrame(idleFrame);
    const dtReal = Math.min(0.1, (now - idleLast) / 1000 || 0);
    idleLast = now;
    renderer.frame({ view: idleSim.state, settings, now: now / 1000, dtReal, abilityKeys: keybinds.abilityKeys(), overlay: { paused: false, replay: null, dim: true, idle: true } });
  }
  function startIdle() { if (!idleRaf) { renderer.resize(); renderer.setView('topdown'); idleLast = performance.now(); idleRaf = requestAnimationFrame(idleFrame); } }
  function stopIdle() { if (idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = 0; } }
  window.addEventListener('resize', () => renderer.resize());

  // ---- screens
  function showMenu() {
    stopReplay();
    tutorialPanel.hide();
    startIdle();
    overlay.show('menu', {
      script, settings, history: loadHistory(),
      actions: {
        tutorial: () => startRun({ mode: 'tutorial' }),
        drill: (id) => startRun({ mode: 'drill', drillId: id }),
        full: () => startRun({ mode: 'full' }),
        settings: () => showSettings(showMenu),
        history: () => overlay.show('history', { history: loadHistory(), onBack: showMenu, onClear: () => { clearHistory(); showMenu(); } }),
        settingsChanged: persist,
      },
    });
  }

  function showSettings(onBack) {
    overlay.show('settings', {
      settings, keybinds, input, audio, script,
      onBack: () => { persist(); if (session) renderer.setView(settings.view); onBack(); },
      onChange: persist,
      onResetHistory: () => { clearHistory(); overlay.toast('History cleared'); },
      onResetAll: () => { resetAll(); location.reload(); },
    });
  }

  function startRun(params) {
    stopReplay();
    endSession();
    stopIdle();
    overlay.hide();
    lastScenarioParams = params;
    const scenario = buildScenario({ ...params, settings, script });
    renderer.setView(settings.view);

    session = createSession({
      script, scenario, settings, renderer, audio, input, keybinds,
      hooks: {
        onEnd: (sim, score, s) => onRunEnd(sim, score, s, scenario),
        onEvent: (evt) => { if (tutorial) tutorial.handleEvent(evt); },
        onTick: () => { if (tutorial) tutorial.tick(); },
        onViewToggle: () => { if (tutorial) tutorial.viewToggled(); },
        onPause: (paused) => { if (paused) showPause(); else if (overlay.current === 'pause') overlay.hide(); },
        onPauseKey: (s) => {
          if (overlay.current === 'settings') { persist(); showPause(); return; }
          s.togglePause('user');
        },
        onPhaseSkip: (n) => overlay.toast(`Skipped to Phase ${n}`),
        isDimmed: () => overlay.current != null,
      },
    });

    if (params.mode === 'tutorial') {
      tutorial = createTutorial({
        script, sim: session.sim, settings, panel: tutorialPanel, audio,
        onExit: (reason) => {
          tutorial = null;
          endSession();
          showMenu();
          overlay.toast(reason === 'complete' ? 'Tutorial complete. Try a drill next.' : 'Tutorial closed', 'info', 2500);
        },
      });
      session.start();
      tutorial.start();
    } else {
      session.start();
    }
  }

  function showPause() {
    overlay.show('pause', {
      settings,
      onResume: () => session && session.resume(),
      onRestart: () => startRun(lastScenarioParams),
      onSettings: () => showSettings(showPause),
      onQuit: () => { endSession(); showMenu(); },
      onSpeed: persist,
    });
  }

  function endSession() {
    if (tutorial) { const t = tutorial; tutorial = null; t.exit('user'); }
    if (session) { session.stop('aborted'); session.detach(); session = null; }
    tutorialPanel.hide();
  }

  function onRunEnd(sim, score, s, scenario) {
    s.detach();
    const history = loadHistory();
    const prevBest = history.best[scenario.modeKey];
    const run = {
      date: Date.now(), mode: scenario.mode, name: scenario.name, modeKey: scenario.modeKey, role: sim.state.role,
      overall: score.overall, grade: score.grade,
      phases: score.phases.map((p) => ({ id: p.id, total: p.total, grade: p.grade })),
      fixes: score.fixes.map((f) => f.title),
    };
    saveRun(run);
    const isNewBest = prevBest == null || score.overall > prevBest;
    showScorecard({ score, scenario, sim, best: prevBest, isNewBest, snapshots: s.snapshots });
  }

  function showScorecard(p) {
    stopReplay();
    overlay.show('scorecard', {
      ...p,
      onAgain: () => startRun(lastScenarioParams),
      onReplay: () => showReplay(p),
      onMenu: () => { endSession(); showMenu(); },
    });
  }

  function showReplay(p) {
    overlay.hide();
    stopIdle();
    replayEl = replayScreen({
      snapshots: p.snapshots, expectations: p.sim.state.expectations, renderer, settings, keybinds,
      onBack: () => { stopReplay(); showScorecard(p); },
    });
    uiRoot.appendChild(replayEl);
    requestAnimationFrame(() => { const b = replayEl && replayEl.querySelector('button[autofocus]'); if (b) b.focus(); });
  }
  function stopReplay() { if (replayEl) { replayEl.stop(); replayEl.remove(); replayEl = null; } }

  // ---- register screens and go
  overlay.register('menu', menuScreen);
  overlay.register('history', historyScreen);
  overlay.register('settings', settingsScreen);
  overlay.register('pause', pauseScreen);
  overlay.register('scorecard', scorecardScreen);

  // Enter on the scorecard / menu is handled by focused buttons; Esc on non-session screens goes back to the menu.
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (session && !session.ended) return; // a live session owns Esc (pause / resume)
    if (overlay.current && overlay.current !== 'menu') { e.preventDefault(); persist(); endSession(); showMenu(); }
  });

  renderer.resize();
  showMenu();
}

boot().catch((err) => {
  console.error(err);
  const root = document.getElementById('ui');
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' }, h('h2', { text: 'Something went wrong' }), h('pre', { text: String(err && err.stack || err) }), button('Reload', () => location.reload(), { primary: true }))));
});
