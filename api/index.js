import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { database } from '../server/db.js';
import { requireUser, publicConfig, HttpError } from '../server/auth.js';
import { readPlayer, savePlayer, deleteHistory } from '../server/player.js';

let index;
async function encounter(raidId, bossId) {
  index ||= JSON.parse(await readFile(resolve('data/encounters/index.json'), 'utf8'));
  const raid = index.raids.find(r => r.id === raidId);
  const boss = raid?.bosses.find(b => b.id === bossId && b.status === 'ready');
  if (!boss) throw new HttpError(404, 'Encounter not found');
  return JSON.parse(await readFile(resolve('data/encounters', raidId === 'onyxia' ? boss.file : `${raidId}/${boss.file}`), 'utf8'));
}

async function jsonBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string' && req.body.length > 250000) throw new HttpError(413, 'Save is too large');
    try { return typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { throw new HttpError(400, 'Invalid JSON'); }
  }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 250000) throw new HttpError(413, 'Save is too large'); }
  try { return JSON.parse(body); } catch { throw new HttpError(400, 'Invalid JSON'); }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status, value) => { res.statusCode = status; res.end(JSON.stringify(value)); };
  try {
    const url = new URL(req.url, 'http://localhost');
    const route = (url.searchParams.get('route') || url.pathname.replace(/^\/api\/?/, '')).split('/').filter(Boolean);
    if (req.method === 'GET' && route[0] === 'config') return send(200, publicConfig());
    if (req.method === 'GET' && route[0] === 'encounters' && route.length === 3) {
      if (route[1] !== 'onyxia') await requireUser(req);
      return send(200, await encounter(route[1], route[2]));
    }
    if (route[0] !== 'player' || route.length !== 1) throw new HttpError(404, 'Not found');
    const user = await requireUser(req), db = database();
    if (req.method === 'GET') return send(200, await readPlayer(db, user.id));
    if (req.method === 'PUT') { await savePlayer(db, user.id, await jsonBody(req)); return send(200, { saved: true }); }
    if (req.method === 'DELETE') {
      if (url.searchParams.get('all') === 'true') await db.player.deleteMany({ where: { id: user.id } });
      else await deleteHistory(db, user.id);
      return send(200, { cleared: true });
    }
    throw new HttpError(405, 'Method not allowed');
  } catch (error) {
    if (!error.status) console.error('API request failed:', error.code || error.name);
    send(error.status || 503, { error: error.status ? error.message : 'Cloud saves are temporarily unavailable. Your progress is still saved on this device.' });
  }
}
