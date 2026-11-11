import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { access, readdir } from 'node:fs/promises';
import handler from '../api/index.js';
import { validateSave } from '../server/validation.js';
import { setStorageAccount, saveSettings, loadSettings, saveBinds, loadBinds, saveRun, loadHistory, mergeCloud, savePayload, syncState, markSynced, clearHistory, resetAll, saveTutorial, loadTutorials } from '../src/ui/storage.js';

const run = (overrides = {}) => ({ id: randomUUID(), date: Date.now(), mode: 'full', modeKey: 'onyxia:full:tank', name: 'Full fight', role: 'tank', overall: 83, grade: 'B', phases: [{ id: 1, total: 83, grade: 'B' }], fixes: [], ...overrides });
const empty = { exists: false, history: { runs: [], best: {} }, tutorials: [] };
function storage() {
  const items = new Map();
  globalThis.localStorage = { getItem: k => items.get(String(k)) ?? null, setItem: (k,v) => items.set(String(k),v), removeItem: k => items.delete(String(k)) };
  setStorageAccount(null);
}

test('guest progress imports once; account data never leaks into another account or guest', () => {
  storage(); const guestRun = run(); saveRun(guestRun);
  setStorageAccount('alice'); mergeCloud(empty); saveRun(run({ name: 'Alice only' })); saveSettings({ ...loadSettings(), warningLead: 7 });
  setStorageAccount('bob'); mergeCloud(empty);
  assert.equal(loadHistory().runs.length, 1); assert.equal(loadHistory().runs[0].id, guestRun.id); assert.equal(loadSettings().warningLead, 5);
  setStorageAccount('alice'); assert.equal(loadHistory().runs.length, 2); assert.equal(loadSettings().warningLead, 7);
  setStorageAccount(null); assert.equal(loadHistory().runs.length, 1); assert.equal(loadSettings().warningLead, 5);
});

test('cloud merge preserves best scores, deduplicates retries, and honours offline edits', () => {
  storage(); setStorageAccount('alice'); const local = run(); saveRun(local);
  saveSettings({ ...loadSettings(), warningLead: 8 });
  mergeCloud({ exists: true, settings: { warningLead: 3 }, history: { runs: [local, run({ overall: 92 })], best: { [local.modeKey]: 92 } }, tutorials: ['onyxia:tank'] });
  assert.equal(loadHistory().runs.length, 2); assert.equal(loadHistory().best[local.modeKey], 92);
  assert.equal(loadSettings().warningLead, 8); assert.deepEqual(loadTutorials(), ['onyxia:tank']);
  const revision = syncState().revision; saveRun(run()); markSynced(revision);
  assert.equal(syncState().history, true, 'an old request cannot clear newer pending progress');
});

test('new-device guest defaults do not overwrite existing cloud preferences', () => {
  storage(); saveSettings({ ...loadSettings(), warningLead: 3 }); setStorageAccount('alice');
  mergeCloud({ ...empty, exists: true, settings: { warningLead: 7 } });
  assert.equal(loadSettings().warningLead, 7); assert.equal(savePayload().settings, undefined);
});

test('pending clear/reset survives rehydration without resurrecting deleted history', () => {
  storage(); setStorageAccount('alice'); saveRun(run()); saveTutorial('onyxia:tank'); clearHistory();
  const cloud = { exists: true, settings: { warningLead: 8 }, history: { runs: [run()], best: { old: 100 } }, tutorials: ['onyxia:tank'] };
  mergeCloud(cloud); assert.deepEqual(loadHistory(), { runs: [], best: {} }); assert.equal(syncState().clearHistory, true);
  resetAll(); mergeCloud(cloud); assert.deepEqual(loadTutorials(), []); assert.equal(loadSettings().warningLead, 5); assert.equal(syncState().resetAll, true);
});

test('another device’s clear is respected while newly completed offline runs survive', () => {
  storage(); setStorageAccount('alice'); saveRun(run()); saveTutorial('old:tank'); markSynced(syncState().revision);
  const fresh = run({ modeKey: 'new:full:tank' }); saveRun(fresh);
  mergeCloud({ ...empty, exists: true });
  assert.equal(loadHistory().runs.length, 1); assert.equal(loadHistory().runs[0].id, fresh.id);
  assert.deepEqual(Object.keys(loadHistory().best), [fresh.modeKey]); assert.deepEqual(loadTutorials(), []);
  assert.equal(savePayload().runs.length, 1);
});

test('a reset on another device clears cached preferences without erasing pending offline edits', () => {
  storage(); setStorageAccount('alice'); mergeCloud(empty);
  saveSettings({ ...loadSettings(), warningLead: 9 }); saveBinds({ attack: ['Digit9', null] }); markSynced(syncState().revision);
  mergeCloud({ ...empty, exists: true, settings: { warningLead: 5 }, binds: null });
  assert.equal(loadSettings().warningLead, 5); assert.equal(loadBinds(), null);
  saveSettings({ ...loadSettings(), warningLead: 7 });
  mergeCloud(empty); assert.equal(loadSettings().warningLead, 7);
  markSynced(syncState().revision); mergeCloud(empty);
  assert.equal(loadSettings().warningLead, 5); assert.equal(savePayload().settings, undefined);
});

test('save validation rejects malformed, oversized and invalid scores before database writes', () => {
  assert.equal(validateSave({ runs: [run()] }).runs.length, 1);
  for (const body of [{ runs: [run({ overall: Infinity })] }, { runs: [run({ id: '../alice' })] }, { runs: [run({ date: -1 })] }, { best: { key: 101 } }, { binds: { forward: ['<script>',null] } }, { settings: { speed: 99 } }, { settings: { cueVolumes: 'wrong' } }, { padding: 'x'.repeat(250001) }]) assert.throws(() => validateSave(body), e => e.status === 400);
});

test('API requires a verified identity for protected encounters and every player operation', async t => {
  const server = createServer(handler); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close()); const base = `http://127.0.0.1:${server.address().port}`;
  for (const method of ['GET','PUT','DELETE']) {
    const response = await fetch(base + '/api/player', { method }); assert.equal(response.status, 401);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
  assert.equal((await fetch(base + '/api/encounters/molten-core/lucifron')).status, 401);
  const publicBoss = await fetch(base + '/api/encounters/onyxia/onyxia'); assert.equal(publicBoss.status, 200); assert.equal((await publicBoss.json()).name, 'Onyxia');
  assert.equal((await fetch(base + '/api/encounters/onyxia/no-such-boss')).status, 404);
});

test('public build contains Onyxia and no protected encounter scripts', async () => {
  await access('dist/data/encounters/onyxia.json');
  assert.deepEqual((await readdir('dist/data/encounters')).sort(), ['index.json', 'onyxia.json']);
});
