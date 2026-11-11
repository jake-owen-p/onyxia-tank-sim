import { createClient } from '@supabase/supabase-js';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function publicConfig() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return { enabled: !!(url && key), url: url || '', key: key || '' };
}

export async function requireUser(req) {
  const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
  if (!token) throw new HttpError(401, 'Sign in to continue');
  const { enabled, url, key } = publicConfig();
  if (!enabled) throw new HttpError(503, 'Sign-in is temporarily unavailable');
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) throw new HttpError(401, 'Your session has expired. Sign in again.');
  return data.user;
}
