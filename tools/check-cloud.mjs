// Optional integration check against an explicitly configured test environment.
// Creates two temporary auth accounts; never sends email or touches real saves.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local', quiet: true });
if (!process.env.SUPABASE_TEST_ADMIN_KEY) throw new Error('Set SUPABASE_TEST_ADMIN_KEY for the integration check');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8081';
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(url, process.env.SUPABASE_TEST_ADMIN_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const users = [];
const call = async (path, token, method = 'GET', body) => {
  const r = await fetch(base + '/api/' + path, { method, headers: { 'Content-Type': 'application/json', ...(process.env.TEST_PROTECTION_BYPASS ? { 'x-vercel-protection-bypass': process.env.TEST_PROTECTION_BYPASS } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json() };
};
try {
  for (let i = 0; i < 2; i++) {
    const email = `raid-rehearsal-qa-${randomUUID()}@example.com`, password = `Qa!${randomUUID()}Aa9`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(created.error); users.push({ id: created.data.user.id });
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const login = await client.auth.signInWithPassword({ email, password }); assert.ifError(login.error);
    users[i].token = login.data.session.access_token;
  }
  const [alice, bob] = users;
  assert.equal((await call('encounters/molten-core/lucifron')).status, 401);
  assert.equal((await call('encounters/molten-core/lucifron', alice.token)).status, 200);
  const run = { id: randomUUID(), date: Date.now(), mode: 'full', modeKey: 'onyxia:full:tank', name: 'Integration test', overall: 88, grade: 'A', phases: [{ id: 1, total: 88, grade: 'A' }], fixes: [] };
  const payload = { settings: { warningLead: 7 }, binds: { attack: ['Digit2',null] }, runs: [run], tutorials: ['onyxia:tank'] };
  let response = await call('player', alice.token, 'PUT', payload); assert.equal(response.status, 200, JSON.stringify(response.body));
  response = await call('player', alice.token, 'PUT', payload); assert.equal(response.status, 200);
  const saved = await call('player', alice.token); assert.equal(saved.body.history.runs.length, 1); assert.equal(saved.body.settings.warningLead, 7); assert.equal(saved.body.history.best[run.modeKey], 88);
  const other = await call('player', bob.token); assert.equal(other.body.exists, false); assert.equal(other.body.history.runs.length, 0);
  assert.equal((await call('player', alice.token, 'PUT', { runs: [{ ...run, overall: 999 }] })).status, 400);
  const rest = await fetch(`${url}/rest/v1/Run?select=*`, { headers: { apikey: key, Authorization: `Bearer ${alice.token}` } });
  assert.ok([401,403].includes(rest.status), 'Direct browser database access must be denied');
  assert.equal((await call('player', bob.token, 'DELETE')).status, 200);
  assert.equal((await call('player', alice.token)).body.history.runs.length, 1, 'Bob cannot delete Alice’s runs');
  assert.equal((await call('player', alice.token, 'DELETE')).status, 200);
  assert.deepEqual((await call('player', alice.token)).body.history, { runs: [], best: {} });
  console.log('PASS: real Supabase login, protected raids, Prisma saves, idempotent retries, player isolation, validation, RLS, and scoped deletion.');
} finally {
  for (const user of users) { const { error } = await admin.auth.admin.deleteUser(user.id); if (error) console.error('Could not remove temporary QA account', user.id, error.message); }
}
