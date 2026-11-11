// Boot: load the encounter index and the chosen encounter script, build the
// shared services (settings, keybinds, input, audio, renderer, overlay) and
// wire the menus to sessions. Switching encounter swaps the script, the
// renderer and the idle backdrop; everything else persists.

import { createSim } from './core/sim.js';
import { createRenderer } from './render/renderer.js';
import { createKeybinds } from './input/keybinds.js';
import { createInput } from './input/input.js';
import { createAudio } from './audio/cues.js';
import { loadSettings, saveSettings, loadBinds, saveBinds, loadHistory, saveRun, clearHistory, resetAll, loadTutorials, saveTutorial } from './ui/storage.js';
import { createOverlay, h, button } from './ui/overlay.js';
import { menuScreen, historyScreen, pauseScreen } from './ui/menu.js';
import { settingsScreen } from './ui/settings.js';
import { scorecardScreen, roleLabel } from './ui/scorecard.js';
import { replayScreen } from './ui/replay.js';
import { createTutorialPanel } from './ui/tutorialPanel.js';
import { buildScenario } from './app/modes.js';
import { createSession } from './app/session.js';
import { createTutorial } from './app/tutorial.js';
import { createAccount } from './app/account.js';
import { accountScreen } from './ui/account.js';
import { landingScreen, playUrl } from './ui/landing.js';

const INDEX_URL = './data/encounters/index.json';

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

function showLoadError(root, err, what) {
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' },
    h('h2', { text: `Could not load ${what}` }),
    h('p', { text: `The encounter could not be loaded (${err.message}). Reload to try again. For local development, start the game and API together:` }),
    h('pre', { text: 'npm install\nnpm run dev\nthen open http://127.0.0.1:8081' }),
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
  let ready = false, loadingEncounter = 0, menuAccountId = null;
  let pendingEncounter = null;
  const account = createAccount({
    onHydrate: () => { Object.assign(settings, loadSettings()); keybinds.load(loadBinds()); },
    onChange: async state => {
      if (!ready) return;
      if (!state.user && current.raid !== 'onyxia') {
        endSession(); stopReplay(); await loadEncounter('onyxia', 'onyxia', { remember: false });
        if (location.pathname === '/') showLanding(); else showMenu();
      } else if (state.recovery && state.user) showAccount(true);
      else {
        const el = document.querySelector('[data-sync-status]');
        if (el) el.textContent = syncLabel(state);
        if (overlay.current === 'menu' && menuAccountId !== (state.user?.id || null)) showMenu();
      }
    },
  });
  function syncLabel(state = account.state) {
    if (!state.user) return 'Playing as a guest. Sign in for the other raids and saved runs.';
    return state.status === 'saved' ? 'Saved to your account' : state.status === 'offline' ? 'Saved on this device. We’ll retry the account save when you reconnect.' : 'Saving…';
  }
  function setPage(path, replace = false) {
    if (location.pathname + location.search !== path) window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
    const title = { '/': 'Practice WoW Classic Encounters', '/play': 'Encounter Journal', '/account': 'Your Account', '/history': 'Run History', '/settings': 'Settings' }[location.pathname] || 'Practice WoW Classic Encounters';
    document.title = `Raid Rehearsal — ${title}`;
  }
  function showAccount(recovery = false, signup = false) {
    const back = !overlay.current || overlay.current === 'landing' ? showLanding : showMenu;
    // Keep a locked encounter's URL so Back returns to the page that linked it.
    if (!pendingEncounter) setPage('/account' + (signup ? '?mode=signup' : ''));
    overlay.show('account', { account, recovery, signup, reason: pendingEncounter ? 'Sign in to play this raid. Your runs will be saved to your account.' : '', onBack: () => { pendingEncounter = null; back(); },
      onSuccess: async () => {
        const pick = pendingEncounter; pendingEncounter = null;
        if (pick) { try { await loadEncounter(...pick); } catch (err) { overlay.toast(err.message, 'bad'); } }
        showMenu();
      } });
  }

  async function loadEncounter(raidId, bossId, { remember = true } = {}) {
    let pick = pickEncounter(index, raidId && bossId ? `${raidId}/${bossId}` : settings.encounter);
    if (!account.state.user && pick.raid.id !== 'onyxia') pick = pickEncounter(index, 'onyxia/onyxia');
    const sequence = ++loadingEncounter;
    const s = pick.raid.id === 'onyxia' ? await fetchJson('./data/encounters/onyxia.json') : await account.request(`encounters/${pick.raid.id}/${pick.boss.id}`);
    if (sequence !== loadingEncounter || (pick.raid.id !== 'onyxia' && !account.state.user)) return;
    s.raidInfo = s.raidInfo || { id: pick.raid.id, name: pick.raid.name, size: pick.raid.size };
    stopIdle();
    if (renderer) renderer.destroy();
    script = s;
    current = { raid: pick.raid.id, boss: pick.boss.id };
    if (remember) { settings.encounter = `${pick.raid.id}/${pick.boss.id}`; persist(); }
    audio.setScript(script);
    renderer = createRenderer(canvas, script, { onAbility: id => input.pressAbility(id) });
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
  async function showLanding() {
    endSession(); stopReplay(); tutorialPanel.hide();
    pendingEncounter = null;
    setPage('/');
    if (current.raid !== 'onyxia') await loadEncounter('onyxia', 'onyxia', { remember: false });
    startIdle();
    overlay.show('landing', { index, account: account.state, history: loadHistory() });
  }
  async function enterEncounter(raidId, bossId) {
    if (raidId !== 'onyxia' && !account.state.user) {
      pendingEncounter = [raidId, bossId]; setPage(playUrl(raidId, bossId)); showAccount(); return;
    }
    pendingEncounter = null;
    try { if (raidId !== current.raid || bossId !== current.boss) await loadEncounter(raidId, bossId); }
    catch (err) { overlay.toast(`Could not load that encounter: ${err.message}`, 'bad', 3000); return; }
    showMenu();
  }
  function showHistory(onBack = showMenu) {
    setPage('/history');
    overlay.show('history', { history: loadHistory(), onBack, onClear: () => { clearHistory(); showHistory(onBack); } });
  }
  function showMenu() {
    stopReplay();
    tutorialPanel.hide();
    startIdle();
    if (settings.encounter !== `${current.raid}/${current.boss}`) { settings.encounter = `${current.raid}/${current.boss}`; persist(); }
    setPage(playUrl(current.raid, current.boss), location.pathname === '/play');
    menuAccountId = account.state.user?.id || null;
    overlay.show('menu', {
      script, index, current, settings, history: loadHistory(), account: account.state, syncLabel: syncLabel(), tutorials: loadTutorials(),
      actions: {
        pick: enterEncounter,
        tutorial: () => startRun({ mode: 'tutorial' }),
        drill: (id) => startRun({ mode: 'drill', drillId: id }),
        full: () => startRun({ mode: 'full' }),
        settings: () => showSettings(showMenu),
        history: () => showHistory(),
        home: showLanding,
        settingsChanged: persist,
        signIn: () => showAccount(),
        signOut: async () => { try { await account.signOut(); if (current.raid === 'onyxia') showMenu(); } catch (err) { overlay.toast(err.message, 'bad'); } },
        sync: () => account.sync(),
      },
    });
  }

  function showSettings(onBack) {
    if (!session || session.ended) setPage('/settings');
    overlay.show('settings', {
      settings, keybinds, input, audio, script,
      onBack: () => { persist(); if (session) renderer.setView(settings.view); onBack(); },
      onChange: persist,
      onResetHistory: () => { clearHistory(); overlay.toast('Run history cleared'); },
      onResetAll: () => { resetAll(); location.reload(); },
    });
  }

  function startRun(params) {
    if (current.raid !== 'onyxia' && !account.state.user) { pendingEncounter = [current.raid, current.boss]; showAccount(); return; }
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
          if (reason === 'complete') saveTutorial(`${script.id}:${settings.role}`);
          tutorial = null;
          endSession();
          showMenu();
          overlay.toast(reason === 'complete' ? 'Tutorial complete. Choose a drill or try the full fight.' : 'Tutorial closed', 'info', 2500);
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
      settings, allowPhaseSkip: session?.scenario.mode !== 'tutorial',
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
      encounterId: `${current.raid}/${current.boss}`,
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
  overlay.register('account', accountScreen);
  overlay.register('landing', landingScreen);

  async function renderRoute() {
    endSession(); stopReplay(); tutorialPanel.hide(); startIdle();
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/play') {
      const pick = pickEncounter(index, params.has('raid') ? `${params.get('raid')}/${params.get('boss')}` : settings.encounter);
      await enterEncounter(pick.raid.id, pick.boss.id);
    } else if (location.pathname === '/account') showAccount(account.state.recovery && !!account.state.user, params.get('mode') === 'signup');
    else if (location.pathname === '/history') showHistory(showLanding);
    else if (location.pathname === '/settings') showSettings(showLanding);
    else await showLanding();
  }
  window.addEventListener('popstate', () => {
    if (location.pathname === '/' && overlay.current === 'landing') return;
    renderRoute().catch(err => overlay.toast(err.message, 'bad'));
  });
  uiRoot.addEventListener('click', e => {
    const anchor = e.target.closest('a[data-route]');
    if (!anchor || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); const url = new URL(anchor.href); setPage(url.pathname + url.search);
    renderRoute().catch(err => overlay.toast(err.message, 'bad'));
  });

  // Enter on the scorecard / menu is handled by focused buttons; Esc on non-session screens goes back to the menu.
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (session && !session.ended) return; // a live session owns Esc (pause / resume)
    if (overlay.current && !['menu','landing','account'].includes(overlay.current)) { e.preventDefault(); persist(); endSession(); showMenu(); }
  });

  await account.init();
  try { await loadEncounter('onyxia', 'onyxia', { remember: false }); } catch (err) { showLoadError(uiRoot, err, 'the encounter script'); return; }
  ready = true;
  if (account.state.recovery && account.state.user) { startIdle(); showAccount(true); }
  else await renderRoute();
}

boot().catch((err) => {
  console.error(err);
  const root = document.getElementById('ui');
  root.appendChild(h('div', { class: 'screen' }, h('div', { class: 'panel' }, h('h2', { text: 'Something went wrong' }), h('pre', { text: String(err && err.stack || err) }), button('Reload', () => location.reload(), { primary: true }))));
});
