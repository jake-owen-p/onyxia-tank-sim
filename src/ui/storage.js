// localStorage persistence for settings, keybinds and run history. Every read
// is guarded so a blocked or missing storage falls back to defaults.

const PREFIX = 'onyxia.';
let accountId = null;
const listeners = new Set();
const key = name => accountId ? `raid.player.${accountId}.${name}` : PREFIX + name;
const KEYS = Object.defineProperties({}, Object.fromEntries(['settings', 'binds', 'history', 'tutorials', 'sync'].map(name => [name, { get: () => key(name) }])));

export const DEFAULT_SETTINGS = {
  view: 'pov',
  speed: 1,
  role: 'tank',
  encounter: 'onyxia/onyxia',
  warningLead: 5,
  cueLane: true,
  laneLead: 3,
  ghostAlpha: 0.6,
  hazardOpacity: 0.7,
  colorblind: false,
  minimap: true,
  mouseSensitivity: 0.0025,
  masterVolume: 0.8,
  muted: false,
  voiceCountdown: true,
  cueVolumes: {},
  phaseDurations: {},               // { [scriptId]: { [phaseId]: seconds } }
};

function isLocalDev() {
  try { const hn = typeof location !== 'undefined' ? location.hostname : ''; return hn === 'localhost' || hn === '127.0.0.1' || hn === ''; } catch { return false; }
}

function store() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}

function read(key, fallback) {
  const s = store();
  if (!s) return fallback;
  try { const v = s.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}

function write(key, value) {
  const s = store();
  if (!s) return false;
  try { s.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

export function loadSettings() {
  const stored = read(KEYS.settings, {});
  const out = { ...DEFAULT_SETTINGS, ...(stored || {}) };
  if (out.role === 'mt') out.role = 'tank';
  // Development is silent: on a local server the app starts muted regardless of the saved setting.
  if (isLocalDev()) out.muted = true;
  out.cueVolumes = { ...(stored && stored.cueVolumes ? stored.cueVolumes : {}) };
  const pd = stored && stored.phaseDurations ? stored.phaseDurations : {};
  // Older saves kept a flat { 1, 2, 3 } for Onyxia; nest it under its script id.
  out.phaseDurations = Object.keys(pd).some((k) => /^\d+$/.test(k)) ? { onyxia: { ...pd } } : { ...pd };
  return out;
}
export function saveSettings(settings) {
  if (JSON.stringify(read(KEYS.settings, null)) === JSON.stringify(settings)) return true;
  const ok = write(KEYS.settings, settings); changed('settings'); return ok;
}

export function loadBinds() { return read(KEYS.binds, null); }
export function saveBinds(binds) {
  if (JSON.stringify(read(KEYS.binds, null)) === JSON.stringify(binds)) return true;
  const ok = write(KEYS.binds, binds); changed('binds'); return ok;
}

export function loadHistory() {
  const h = read(KEYS.history, null);
  if (!h || !Array.isArray(h.runs)) return { runs: [], best: {} };
  return { runs: h.runs, best: h.best || {} };
}

/** Append a run (newest first, capped at 50) and update the best score per mode key. */
export function saveRun(run) {
  run.id ||= crypto.randomUUID();
  const h = loadHistory();
  h.runs.unshift(run);
  if (h.runs.length > 50) h.runs.length = 50;
  const key = run.modeKey || `${run.mode}:${run.name}`;
  if (h.best[key] == null || run.overall > h.best[key]) h.best[key] = run.overall;
  write(KEYS.history, h);
  changed('history', run);
  return h;
}

export function clearHistory() { write(KEYS.history, { runs: [], best: {} }); changed('clearHistory'); }

export function resetAll() {
  write(KEYS.settings, DEFAULT_SETTINGS); write(KEYS.binds, null);
  write(KEYS.history, { runs: [], best: {} }); write(KEYS.tutorials, []);
  changed('resetAll');
}

function changed(part, value) {
  const state = syncState();
  const extra = {};
  if (part === 'history') {
    extra.runIds = [...new Set([...(state.runIds || []), value.id])];
    const modeKey = value.modeKey || `${value.mode}:${value.name}`;
    extra.best = { ...state.best, [modeKey]: Math.max(state.best?.[modeKey] || 0, value.overall) };
  }
  if (part === 'tutorials') extra.tutorialIds = [...new Set([...(state.tutorialIds || []), value])];
  if (part === 'clearHistory' || part === 'resetAll') { extra.runIds = []; extra.best = {}; }
  if (part === 'resetAll') extra.tutorialIds = [];
  write(KEYS.sync, { ...state, ...extra, [part]: true, revision: state.revision + 1 });
  for (const listener of listeners) listener();
}
export function onStorageChange(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function syncState() { return { revision: 0, ...read(KEYS.sync, {}) }; }
export function currentStorageAccount() { return accountId; }
export function setStorageAccount(id) {
  accountId = null;
  const guest = { settings: read(KEYS.settings, null), binds: loadBinds(), history: loadHistory(), tutorials: loadTutorials() };
  accountId = id || null;
  if (accountId && read(KEYS.sync, null) == null) {
    for (const run of guest.history.runs) run.id ||= crypto.randomUUID();
    write(KEYS.settings, guest.settings); write(KEYS.binds, guest.binds); write(KEYS.history, guest.history); write(KEYS.tutorials, guest.tutorials);
    write(KEYS.sync, { revision: 1, inherited: true, history: true, tutorials: true, runIds: guest.history.runs.map(r => r.id), best: guest.history.best, tutorialIds: guest.tutorials });
  }
}
export function loadTutorials() { return read(KEYS.tutorials, []); }
export function saveTutorial(id) { write(KEYS.tutorials, [...new Set([...loadTutorials(), id])]); changed('tutorials', id); }

export function mergeCloud(cloud) {
  const pending = syncState(), local = loadHistory();
  const importGuest = !cloud.exists && pending.inherited;
  if (!pending.resetAll) {
    if (!pending.settings && !importGuest) write(KEYS.settings, cloud.settings || null);
    if (!pending.binds && !importGuest) write(KEYS.binds, cloud.binds || null);
    if (!pending.clearHistory) {
      const runs = new Map();
      for (const run of [...(cloud.history?.runs || []), ...local.runs.filter(r => pending.runIds?.includes(r.id))]) { run.id ||= crypto.randomUUID(); runs.set(run.id, run); }
      const best = { ...(cloud.history?.best || {}) };
      for (const [k,v] of Object.entries(pending.best || {})) best[k] = Math.max(best[k] || 0, v);
      write(KEYS.history, { runs: [...runs.values()].sort((a,b) => b.date-a.date).slice(0,50), best });
    }
    write(KEYS.tutorials, [...new Set([...(cloud.tutorials || []), ...(pending.tutorialIds || [])])]);
  }
  // Existing cloud preferences win over guest defaults on a new device.
  write(KEYS.sync, { ...pending, inherited: false, settings: pending.settings || (importGuest && !!read(KEYS.settings, null)), binds: pending.binds || (importGuest && !!loadBinds()) });
}

export function savePayload() {
  const state = syncState(), history = loadHistory();
  for (const run of history.runs) run.id ||= crypto.randomUUID();
  write(KEYS.history, history);
  return { ...(state.settings || state.resetAll ? { settings: loadSettings() } : {}),
    ...(state.binds && loadBinds() ? { binds: loadBinds() } : {}),
    runs: history.runs.filter(r => state.runIds?.includes(r.id)), best: state.best || {}, tutorials: state.tutorialIds || [] };
}
export function markSynced(revision) { if (syncState().revision === revision) write(KEYS.sync, { revision }); }
