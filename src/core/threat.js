// Threat model. Two threat pools: the tank (player) and the ghost raid. The
// tank's threat builds on its own while in melee range; Taunt is the only button.
// All functions are pure and operate on a plain { player, raid, tauntUntil } object.

export function createThreat() {
  return { player: 0, raid: 0, tauntUntil: -Infinity };
}

/** Steady threat growth for one tick. `playerAttacking` is true while in melee range. */
export function tickThreat(threat, dt, cfg, raidActive, playerAttacking) {
  if (raidActive) threat.raid += cfg.raidPerSecond * dt;
  if (playerAttacking) threat.player += cfg.autoAttackPerSecond * dt;
  return threat;
}

/** A DPS overtakes the tank: the raid pool jumps to `multiplier` x the tank's. */
export function applyAggroPull(threat, multiplier) {
  threat.raid = Math.max(threat.raid, threat.player * multiplier);
  return threat;
}

/**
 * Taunt: jump to the top of the table with a lead (`tauntLead` x the raid, plus
 * `tauntBonus`) so a following Wing Buffet cut does not flip her straight back,
 * and force the target for `tauntDuration`.
 */
export function applyTaunt(threat, t, cfg) {
  threat.player = Math.max(threat.player, threat.raid * (cfg.tauntLead || 1)) + (cfg.tauntBonus || 0);
  threat.tauntUntil = t + cfg.tauntDuration;
  return threat;
}

/** Wing Buffet removes a fraction of the tank's threat. */
export function applyBuffet(threat, cut) {
  threat.player *= 1 - cut;
  return threat;
}

export function resetThreat(threat) {
  threat.player = 0;
  threat.raid = 0;
  threat.tauntUntil = -Infinity;
  return threat;
}

/**
 * Decide who the boss attacks. Uses hysteresis like the real game: the raid
 * pulls when it exceeds player * pullMultiplier; the tank only regains without a
 * taunt when clearly above the raid (110%).
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
 * 0..1 fill for the threat bar: how close the raid is to pulling. 1 means the raid
 * is at or above the pull threshold. The HUD paints `dangerBand`..1 red.
 */
export function threatRatio(threat, cfg) {
  if (threat.player <= 0) return threat.raid > 0 ? 1 : 0;
  return Math.min(1, threat.raid / (threat.player * cfg.pullMultiplier));
}
