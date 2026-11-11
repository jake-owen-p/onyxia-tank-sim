import { validateSave } from './validation.js';

export async function readPlayer(db, playerId) {
  const player = await db.player.findUnique({ where: { id: playerId }, include: { runs: { orderBy: { playedAt: 'desc' }, take: 50 }, bests: true } });
  if (!player) return { exists: false, settings: null, binds: null, tutorials: [], history: { runs: [], best: {} } };
  return { exists: true, settings: player.settings, binds: player.keybinds, tutorials: player.tutorials,
    history: { runs: player.runs.map(r => r.details), best: Object.fromEntries(player.bests.map(b => [b.modeKey, b.score])) } };
}

export async function savePlayer(db, playerId, body) {
  const data = validateSave(body);
  await db.$transaction(async tx => {
    const update = { ...(data.settings ? { settings: data.settings } : {}), ...(data.binds ? { keybinds: data.binds } : {}) };
    const player = await tx.player.upsert({ where: { id: playerId }, create: { id: playerId, ...update }, update });
    if (data.tutorials.length) await tx.player.update({ where: { id: playerId }, data: { tutorials: [...new Set([...player.tutorials, ...data.tutorials])] } });
    for (const run of data.runs) {
      await tx.run.upsert({ where: { playerId_id: { playerId, id: run.id } }, create: { playerId, id: run.id, modeKey: run.modeKey, score: run.overall, playedAt: new Date(run.date), details: run }, update: {} });
      data.best[run.modeKey] = Math.max(data.best[run.modeKey] || 0, run.overall);
    }
    for (const [modeKey, value] of Object.entries(data.best)) {
      await tx.bestScore.upsert({ where: { playerId_modeKey: { playerId, modeKey } }, create: { playerId, modeKey, score: value }, update: {} });
      await tx.bestScore.updateMany({ where: { playerId, modeKey, score: { lt: value } }, data: { score: value } });
    }
    const old = await tx.run.findMany({ where: { playerId }, orderBy: { playedAt: 'desc' }, skip: 50, select: { id: true } });
    if (old.length) await tx.run.deleteMany({ where: { playerId, id: { in: old.map(r => r.id) } } });
  }, { timeout: 20000 });
}

export async function deleteHistory(db, playerId) {
  await db.$transaction([db.run.deleteMany({ where: { playerId } }), db.bestScore.deleteMany({ where: { playerId } })]);
}
