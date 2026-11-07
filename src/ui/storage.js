// localStorage persistence for settings, keybinds and run history. Every read
// is guarded so a blocked or missing storage falls back to defaults.

const PREFIX = 'onyxia.';
const KEYS = { settings: PREFIX + 'settings', binds: PREFIX + 'binds', history: PREFIX + 'history' };

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
export function saveSettings(settings) { return write(KEYS.settings, settings); }

export function loadBinds() { return read(KEYS.binds, null); }
export function saveBinds(binds) { return write(KEYS.binds, binds); }

export function loadHistory() {
  const h = read(KEYS.history, null);
  if (!h || !Array.isArray(h.runs)) return { runs: [], best: {} };
  return { runs: h.runs, best: h.best || {} };
}

/** Append a run (newest first, capped at 50) and update the best score per mode key. */
export function saveRun(run) {
  const h = loadHistory();
  h.runs.unshift(run);
  if (h.runs.length > 50) h.runs.length = 50;
  const key = run.modeKey || `${run.mode}:${run.name}`;
  if (h.best[key] == null || run.overall > h.best[key]) h.best[key] = run.overall;
  write(KEYS.history, h);
  return h;
}

export function clearHistory() { write(KEYS.history, { runs: [], best: {} }); }

export function resetAll() {
  const s = store();
  if (!s) return;
  try { for (const k of Object.values(KEYS)) s.removeItem(k); } catch { /* ignore */ }
}
