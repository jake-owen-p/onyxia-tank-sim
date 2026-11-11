import { HttpError } from './auth.js';
import { DEFAULT_SETTINGS } from '../src/ui/storage.js';
import { DEFAULT_BINDS } from '../src/input/keybinds.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object = v => v && typeof v === 'object' && !Array.isArray(v);
const fail = () => { throw new HttpError(400, 'Invalid save data'); };
const short = (v, n = 200) => typeof v === 'string' && v.length <= n;
const score = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;

export function validateSave(body) {
  if (!object(body) || JSON.stringify(body).length > 250000) fail();
  const out = { runs: [], best: {}, tutorials: [] };
  if (body.settings !== undefined) {
    if (!object(body.settings)) fail();
    out.settings = {};
    for (const [key, value] of Object.entries(body.settings)) {
      if (!Object.hasOwn(DEFAULT_SETTINGS, key)) continue;
      const def = DEFAULT_SETTINGS[key];
      if (typeof def !== typeof value || (typeof value === 'number' && !Number.isFinite(value))) fail();
      if (typeof value === 'string' && value.length > 150) fail();
      if (typeof def === 'object' && !object(value)) fail();
      out.settings[key] = value;
    }
    if (out.settings.speed != null && (out.settings.speed < .25 || out.settings.speed > 1)) fail();
    if (out.settings.view != null && !['pov', 'topdown'].includes(out.settings.view)) fail();
  }
  if (body.binds !== undefined) {
    if (!object(body.binds)) fail();
    out.binds = {};
    for (const key of Object.keys(DEFAULT_BINDS)) if (body.binds[key]) {
      const v = body.binds[key];
      if (!Array.isArray(v) || v.length !== 2 || v.some(x => x !== null && (!short(x, 32) || !/^[A-Za-z0-9]+$/.test(x)))) fail();
      out.binds[key] = v;
    }
  }
  if (body.runs !== undefined) {
    if (!Array.isArray(body.runs) || body.runs.length > 50) fail();
    out.runs = body.runs.map(run => {
      if (!object(run) || !uuid.test(run.id) || !short(run.modeKey) || !run.modeKey || !score(run.overall) || !Number.isSafeInteger(run.date) || run.date < 0 || run.date > Date.now() + 86400000) fail();
      if (!['full', 'drill', 'tutorial'].includes(run.mode) || !['S','A','B','C','D','F'].includes(run.grade)) fail();
      if (!Array.isArray(run.fixes) || run.fixes.length > 30 || run.fixes.some(f => !short(f, 500))) fail();
      if (!Array.isArray(run.phases) || run.phases.length > 30 || run.phases.some(p => !object(p) || !score(p.total))) fail();
      const result = { id: run.id, date: run.date, mode: run.mode, modeKey: run.modeKey, overall: run.overall, grade: run.grade, fixes: run.fixes, phases: run.phases };
      for (const key of ['name','role','roleLabel','boss','raid','encounterId']) if (run[key] !== undefined) { if (!short(run[key])) fail(); result[key] = run[key]; }
      return result;
    });
  }
  if (body.best !== undefined) {
    if (!object(body.best) || Object.keys(body.best).length > 2500) fail();
    for (const [key, value] of Object.entries(body.best)) { if (!short(key) || !score(value)) fail(); out.best[key] = value; }
  }
  if (body.tutorials !== undefined) {
    if (!Array.isArray(body.tutorials) || body.tutorials.length > 1000 || body.tutorials.some(x => !short(x, 150))) fail();
    out.tutorials = [...new Set(body.tutorials)];
  }
  return out;
}
