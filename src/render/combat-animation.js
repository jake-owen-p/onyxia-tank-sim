// A successful command owns its animation clock. GCD changes and rejected
// commands never start swings; simulation timestamps also survive replay seeks.
export const PLAYER_ACTION_SECONDS = .8;

export function playerCombatAnimation(view) {
  const action=view.abilities?.lastUsed, age=action ? view.t-action.at : Infinity;
  const p=view.world.player;
  if (!action || age<0 || age>=PLAYER_ACTION_SECONDS || p.fearedUntil>view.t || p.stunnedUntil>view.t) return {};
  const caster=view.role==='ranged' || view.role==='healer';
  const attack=(action.kind==='attack' && !caster) || action.kind==='interrupt';
  return { attack, cast:!attack, actionProgress:age/PLAYER_ACTION_SECONDS };
}

export function bossCombatAnimation(view, script) {
  const boss=view.world.boss;
  if (boss.cast && !script.actions[boss.cast.id]?.offBoss) {
    return { cast:true, actionProgress:Math.max(0,Math.min(1,(view.t-boss.cast.start)/Math.max(.01,boss.cast.end-boss.cast.start))) };
  }
  const duration=Math.min(.85,(script.boss.meleeInterval || 2)*.7), age=Number.isFinite(boss.lastHit) ? view.t-boss.lastHit : Infinity;
  return age>=0 && age<duration ? { attack:true, actionProgress:age/duration } : {};
}
