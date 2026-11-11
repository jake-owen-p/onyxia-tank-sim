import { createClient } from '@supabase/supabase-js';
import { setStorageAccount, onStorageChange, syncState, mergeCloud, savePayload, markSynced } from '../ui/storage.js';

export function createAccount({ onChange = () => {}, onHydrate = () => {} } = {}) {
  let client = null, user = null, status = 'guest', error = '', recovery = new URLSearchParams(location.search).has('recovery');
  let generation = 0, hydrated = false, timer, syncing = false, starting = false;
  const emit = () => onChange(api.state);
  async function request(path, options = {}) {
    const { data } = client ? await client.auth.getSession() : { data: {} };
    const { accountId, ...fetchOptions } = options;
    if (accountId && data.session?.user.id !== accountId) throw new Error('Account changed before the save completed');
    const response = await fetch(`/api/${path}`, { signal: AbortSignal.timeout(25000), ...fetchOptions, headers: { 'Content-Type': 'application/json', ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}), ...options.headers } });
    const body = await response.json();
    if (!response.ok) { const e = new Error(body.error || 'Request failed'); e.status = response.status; throw e; }
    return body;
  }
  async function hydrate(epoch) {
    const cloud = await request('player', { accountId: user.id });
    if (epoch !== generation) return false;
    mergeCloud(cloud); hydrated = true; onHydrate(); return true;
  }
  async function sync() {
    if (!user || syncing) return;
    const epoch = generation;
    const owner = user.id;
    syncing = true; status = 'saving'; error = ''; emit();
    try {
      if (!hydrated && !await hydrate(epoch)) return;
      const pending = syncState(), payload = savePayload();
      if (pending.clearHistory || pending.resetAll) await request(`player${pending.resetAll ? '?all=true' : ''}`, { method: 'DELETE', accountId: owner });
      if (epoch !== generation) return;
      await request('player', { method: 'PUT', body: JSON.stringify(payload), accountId: owner });
      if (epoch !== generation) return;
      markSynced(pending.revision); status = 'saved';
      if (syncState().revision !== pending.revision) schedule();
    } catch (e) {
      if (epoch === generation) { status = 'offline'; error = e.message; }
    } finally { syncing = false; if (epoch === generation) emit(); else schedule(); }
  }
  function schedule() { clearTimeout(timer); if (user) timer = setTimeout(sync, 700); }
  async function activate(session) {
    const next = session?.user || null;
    if (next?.id === user?.id) return;
    generation++; clearTimeout(timer); hydrated = false; user = next;
    setStorageAccount(user?.id); onHydrate();
    status = user ? 'saving' : 'guest'; error = ''; emit();
    if (user) { if (syncing) { timer = setTimeout(sync, 800); } else await sync(); }
  }
  const api = {
    get state() { return { user, status, error, recovery, enabled: !!client }; },
    async init() {
      try {
        const config = await fetch('/api/config', { signal: AbortSignal.timeout(8000) }).then(r => r.json());
        if (!config.enabled) return;
        client = createClient(config.url, config.key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } });
        const { data } = await client.auth.getSession();
        await activate(data.session);
        client.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') { recovery = true; queueMicrotask(emit); }
          if (!starting) queueMicrotask(() => activate(session));
        });
        onStorageChange(schedule);
        window.addEventListener('online', sync);
        window.addEventListener('focus', () => { if (status === 'offline') sync(); });
      } catch (e) { error = 'Sign-in is temporarily unavailable. You can still play Onyxia.'; }
      emit();
    },
    async signIn(email, password) {
      if (!client) throw new Error('Sign-in is temporarily unavailable');
      starting = true;
      try { const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; await activate(data.session); }
      finally { starting = false; }
    },
    async signUp(email, password) {
      if (!client) throw new Error('Sign-in is temporarily unavailable');
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/' } });
      if (error) throw error;
      if (data.session) await activate(data.session);
      return !!data.session;
    },
    async resetPassword(email) {
      if (!client) throw new Error('Sign-in is temporarily unavailable');
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/?recovery=1' });
      if (error) throw error;
    },
    async updatePassword(password) { const { error } = await client.auth.updateUser({ password }); if (error) throw error; recovery = false; history.replaceState(null, '', '/'); emit(); },
    async signOut() { await sync(); const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error; await activate(null); },
    request,
    sync: async () => { if (!syncing) hydrated = false; await sync(); },
  };
  return api;
}
