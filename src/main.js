// Boot: load the encounter index and the chosen encounter script, build the
// shared services (settings, keybinds, input, audio, renderer, overlay) and
// wire the menus to sessions. Switching encounter swaps the script, the
// renderer and the idle backdrop; everything else persists.

import { createSim } from './core/sim.js';
import { createRenderer } from './render/renderer.js';
import { createKeybinds } from './input/keybinds.js';
import { createInput } from './input/input.js';
import { createAudio } from './audio/cues.js';
import { loadSettings, saveSettings, loadBinds, saveBinds, loadHistory, saveRun, clearHistory, resetAll } from './ui/storage.js';
import { createOverlay, h, button } from './ui/overlay.js';
import { menuScreen, historyScreen, pauseScreen } from './ui/menu.js';
import { settingsScreen } from './ui/settings.js';
import { scorecardScreen, roleLabel } from './ui/scorecard.js';
import { replayScreen } from './ui/replay.js';
import { createTutorialPanel } from './ui/tutorialPanel.js';
import { buildScenario } from './app/modes.js';
import { createSession } from './app/session.js';
import { createTutorial } from './app/tutorial.js';

const INDEX_URL = './data/encounters/index.json';
const ENCOUNTER_DIR = './data/encounters/';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function loadIndex() {
  try { return await fetchJson(INDEX_URL); } catch (err) {
    // Chrome blocks fetch on file://. A sibling .js module is an optional escape hatch.
    try {
      const mod = await import('../data/encounters/index.js');
      if (mod && (mod.default || mod.index)) return mod.default || mod.index;
    } catch { /* fall through */ }
    throw err;
  }
}

async function loadScript(file) {
  try { return await fetchJson(ENCOUNTER_DIR + file); } catch (err) {
    try {
      const mod = await import('../data/encounters/' + file.replace(/\.json$/, '.js'));
      if (mod && (mod.default || mod.script)) return mod.default || mod.script;
    } catch { /* fall through */ }
    throw err;
  }
}

function showLoadError(root, err, what) {
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' },
    h('h2', { text: `Could not load ${what}` }),
    h('p', { text: `The browser refused to read it (${err.message}). Chrome blocks file:// reads; serve the folder instead:` }),
    h('pre', { text: 'cd <this folder>\npython3 -m http.server 8080\n# or: npx serve .\nthen open http://localhost:8080' }),
    h('p', { class: 'muted', text: 'Firefox and Safari open index.html directly.' }),
  )));
}

/** Find a boss entry: the saved one, else the first ready encounter in the index. */
function pickEncounter(index, encounterId) {
  const [raidId, bossId] = (encounterId || '').split('/');
  for (const r of index.raids) {
    if (r.id !== raidId) continue;
    const b = r.bosses.find((x) => x.id === bossId && x.status === 'ready');
    if (b) return { raid: r, boss: b };
  }
  for (const r of index.raids) { const b = r.bosses.find((x) => x.status === 'ready'); if (b) return { raid: r, boss: b }; }
  throw new Error('No ready encounter in the index');
}

async function boot() {
  const canvas = document.getElementById('stage');
  const uiRoot = document.getElementById('ui');
  let index;
  try { index = await loadIndex(); } catch (err) { showLoadError(uiRoot, err, 'the encounter list'); return; }

  // ---- shared services
  const settings = loadSettings();
  const keybinds = createKeybinds(loadBinds());
  keybinds.onChange((b) => saveBinds(b));
  const input = createInput(canvas, keybinds, settings);
  const audio = createAudio(settings);
  const overlay = createOverlay(uiRoot);
  const tutorialPanel = createTutorialPanel(uiRoot);
  const persist = () => saveSettings(settings);

  const unlock = () => { audio.unlock(); };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);

  // ---- the current encounter
  let script = null, renderer = null, current = { raid: null, boss: null };
  let idleSim = null;
  let session = null;
  let tutorial = null;
  let lastScenarioParams = null;
  let replayEl = null;
  let idleRaf = 0;

  async function loadEncounter(raidId, bossId) {
    const pick = pickEncounter(index, raidId && bossId ? `${raidId}/${bossId}` : settings.encounter);
    const file = pick.raid.id === 'onyxia' && pick.boss.file === 'onyxia.json' ? 'onyxia.json' : `${pick.raid.id}/${pick.boss.file}`;
    const s = await loadScript(file);
    s.raidInfo = s.raidInfo || { id: pick.raid.id, name: pick.raid.name, size: pick.raid.size };
    stopIdle();
    if (renderer) renderer.destroy();
    script = s;
    current = { raid: pick.raid.id, boss: pick.boss.id };
    settings.encounter = `${pick.raid.id}/${pick.boss.id}`;
    persist();
    audio.setScript(script);
    renderer = createRenderer(canvas, script);
    renderer.resize();
    idleSim = createSim(script, { manual: true, freezeHp: true, bossPassive: true, start: 'wall', seed: 3 });
  }

  // ---- idle backdrop: a passive sim rendered behind the menus
  let idleLast = performance.now();
  function idleFrame(now) {
    idleRaf = requestAnimationFrame(idleFrame);
    const dtReal = Math.min(0.1, (now - idleLast) / 1000 || 0);
    idleLast = now;
    renderer.frame({ view: idleSim.state, settings, now: now / 1000, dtReal, abilityKeys: keybinds.abilityKeys(), overlay: { paused: false, replay: null, dim: true, idle: true } });
  }
  function startIdle() { if (!idleRaf && renderer) { renderer.resize(); renderer.setView('topdown'); idleLast = performance.now(); idleRaf = requestAnimationFrame(idleFrame); } }
  function stopIdle() { if (idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = 0; } }
  window.addEventListener('resize', () => renderer && renderer.resize());

  // ---- screens
  function showMenu() {
    stopReplay();
    tutorialPanel.hide();
    startIdle();
    overlay.show('menu', {
      script, index, current, settings, history: loadHistory(),
      actions: {
        pick: async (raidId, bossId) => {
          if (raidId === current.raid && bossId === current.boss) { showMenu(); return; }
          try { await loadEncounter(raidId, bossId); } catch (err) { overlay.toast(`Could not load that encounter: ${err.message}`, 'bad', 3000); return; }
          showMenu();
        },
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
      roleLabel: roleLabel(script, sim.state.role), boss: script.name, raid: script.raidInfo ? script.raidInfo.name : '',
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

  try { await loadEncounter(); } catch (err) { showLoadError(uiRoot, err, 'the encounter script'); return; }
  showMenu();
}

boot().catch((err) => {
  console.error(err);
  const root = document.getElementById('ui');
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' }, h('h2', { text: 'Something went wrong' }), h('pre', { text: String(err && err.stack || err) }), button('Reload', () => location.reload(), { primary: true }))));
});
