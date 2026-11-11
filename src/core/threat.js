// Threat model. Three threat pools: the player, the ghost raid, and the ghost
// tank (who holds the boss when the player is not a tank). All functions are
// pure over a plain { player, raid, ghost, tauntUntil, ghostTauntUntil } object.

export function createThreat(raidSize = 0) {
  return { player: 0, raid: 0, ghost: 0, raidMembers: Array(raidSize).fill(0), raidTarget: 0, tauntUntil: -Infinity, ghostTauntUntil: -Infinity, ghostTauntAt: null };
}

/** The displayed raid threat is its highest individual member, not their sum. */
function syncRaid(threat) {
  if (!threat.raidMembers?.length) return;
  threat.raidTarget = threat.raidMembers.reduce((top, value, i, all) => value > all[top] ? i : top, 0);
  threat.raid = threat.raidMembers[threat.raidTarget];
}

/** Seed a practice preset. Normal combat grows each member independently. */
export function setRaidThreat(threat, amount) {
  threat.raid = amount;
  threat.raidMembers?.forEach((_, i, all) => { all[i] = amount * (1 - 0.3 * i / all.length); });
  syncRaid(threat);
}

/** Fireball removes only its primary target's threat. */
export function wipeTargetThreat(threat, target, raidIndex = null) {
  return cutTargetThreat(threat, target, 1, raidIndex);
}

export function cutTargetThreat(threat, target, fraction, raidIndex = null) {
  if (target === 'raid' && raidIndex != null && threat.raidMembers?.length) {
    threat.raidMembers[raidIndex] *= 1 - fraction;
    syncRaid(threat);
  } else if (target === 'player' || target === 'ghost') threat[target] *= 1 - fraction;
}

/** Steady threat growth for one tick. */
export function tickThreat(threat, dt, cfg, raidActive, playerAttacking, ghostTanking = false) {
  if (raidActive) {
    if (threat.raidMembers?.length) {
      threat.raidMembers.forEach((value, i, all) => { all[i] = value + cfg.raidPerSecond * (1 - 0.3 * i / all.length) * dt; });
      syncRaid(threat);
    } else threat.raid += cfg.raidPerSecond * dt;
  }
  if (playerAttacking) threat.player += cfg.autoAttackPerSecond * dt;
  if (ghostTanking) threat.ghost += (cfg.ghostTankPerSecond || cfg.autoAttackPerSecond) * dt;
  return threat;
}

/** A DPS overtakes the tank: the raid pool jumps to `multiplier` x the tank's. */
export function applyAggroPull(threat, multiplier) {
  threat.raid = Math.max(threat.raid, threat.player * multiplier);
  if (threat.raidMembers?.length) threat.raidMembers[threat.raidTarget] = threat.raid;
  return threat;
}

/** A press of an attack or heal adds `amount` to the player's pool. */
export function applyPlayerThreat(threat, amount) {
  threat.player += amount;
  return threat;
}

/**
 * Taunt by the player: jump to the top of the table with a lead (`tauntLead` x
 * the top pool, plus `tauntBonus`) so a following Wing Buffet cut does not flip
 * her straight back, and force the target for `tauntDuration`.
 */
export function applyTaunt(threat, t, cfg) {
  const top = Math.max(threat.raid, threat.ghost);
  threat.player = Math.max(threat.player, top * (cfg.tauntLead || 1)) + (cfg.tauntBonus || 0);
  threat.tauntUntil = t + cfg.tauntDuration;
  return threat;
}

/** Taunt by the ghost tank (after the player pulled aggro). */
export function applyGhostTaunt(threat, t, cfg) {
  threat.ghost = Math.max(threat.ghost, threat.player * (cfg.tauntLead || 1)) + (cfg.tauntBonus || 0);
  threat.ghostTauntUntil = t + cfg.tauntDuration;
  threat.ghostTauntAt = null;
  return threat;
}

/** Wing Buffet removes a fraction of the tank's threat (whoever is tanking). */
export function applyBuffet(threat, cut, tankIsPlayer = true) {
  if (tankIsPlayer) threat.player *= 1 - cut; else threat.ghost *= 1 - cut;
  return threat;
}

export function resetThreat(threat) {
  threat.player = 0;
  threat.raid = 0;
  threat.ghost = 0;
  threat.raidMembers?.fill(0);
  threat.raidTarget = 0;
  threat.tauntUntil = -Infinity;
  threat.ghostTauntUntil = -Infinity;
  threat.ghostTauntAt = null;
  return threat;
}

/**
 * Decide who the boss attacks when the player is a tank: the raid pulls when it
 * exceeds player * pullMultiplier; the tank only regains without a taunt when
 * clearly above the raid (110%).
 */
export function selectTarget(threat, current, t, cfg) {
  if (threat.tauntUntil > t) return 'player';
  if (current === 'player' || current == null) {
    return threat.raid > threat.player * cfg.pullMultiplier && threat.raid > 0 ? 'raid' : 'player';
  }
  // current === 'raid'
  return threat.player > threat.raid * 1.1 ? 'player' : 'raid';
}

/**
 * Decide who the boss attacks when the ghost tank holds her: the player pulls
 * aggro by out-threating the ghost tank; the ghost taunts back after a delay.
 */
export function selectTargetGhostTanked(threat, current, t, cfg) {
  if (threat.raidMembers?.length) {
    const top = ['ghost', 'player', 'raid'].reduce((a, b) => threat[b] > threat[a] ? b : a);
    if (current == null) return top;
    return threat[top] > threat[current] * cfg.pullMultiplier ? top : current;
  }
  if (threat.ghostTauntUntil > t) return 'ghost';
  if (threat.tauntUntil > t) return 'player';
  if (current === 'ghost' || current == null) {
    return threat.player > threat.ghost * cfg.pullMultiplier && threat.player > 0 ? 'player' : 'ghost';
  }
  if (current === 'player') return threat.ghost > threat.player * 1.1 ? 'ghost' : 'player';
  return current;
}

/**
 * 0..1 fill for the threat bar. For a tank: how close the raid is to pulling.
 * For everyone else: how close the player is to pulling off the ghost tank.
 */
export function threatRatio(threat, cfg, tankIsPlayer = true) {
  if (tankIsPlayer) {
    if (threat.player <= 0) return threat.raid > 0 ? 1 : 0;
    return Math.min(1, threat.raid / (threat.player * cfg.pullMultiplier));
  }
  if (threat.ghost <= 0) return threat.player > 0 ? 1 : 0;
  return Math.min(1, threat.player / (threat.ghost * cfg.pullMultiplier));
}
