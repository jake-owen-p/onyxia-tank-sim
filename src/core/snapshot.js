// Replay snapshots: a compact, JSON-safe copy of everything the renderers and
// HUD read. Renderers must only touch fields that exist here so a snapshot can
// stand in for the live state during replay.

export function snapshot(state) {
  const w = state.world;
  return {
    t: state.t,
    phase: state.phase,
    phaseName: state.phaseDef ? state.phaseDef.name : '',
    phaseSubtitle: state.phaseDef ? state.phaseDef.subtitle : '',
    hp: state.hp,
    role: state.role,
    world: {
      player: { x: w.player.x, y: w.player.y, heading: w.player.heading, hp: w.player.hp, maxHp: w.player.maxHp, fearedUntil: w.player.fearedUntil, moving: w.player.moving, backpedal: w.player.backpedal },
      boss: { x: w.boss.x, y: w.boss.y, z: w.boss.z, heading: w.boss.heading, state: w.boss.state, target: w.boss.target, engaged: w.boss.engaged, cast: w.boss.cast ? { ...w.boss.cast } : null, lastHit: w.boss.lastHit },
      raid: { anchor: { ...w.raid.anchor }, dots: w.raid.dots.map((d) => ({ x: d.x, y: d.y, melee: d.melee })) },
      whelps: w.whelps.map((x) => ({ x: x.x, y: x.y, heading: x.heading, target: x.target, onRaid: x.onRaid })),
      hazards: w.hazards.map((h) => ({ uid: h.uid, id: h.id, kind: h.kind, label: h.label, poly: h.poly, state: h.state, warnAt: h.warnAt, activeAt: h.activeAt, endsAt: h.endsAt })),
      projectiles: w.projectiles.map((p) => ({ ...p })),
      ghost: { ...w.ghost },
      idealPlayer: { ...w.idealPlayer },
      idealBoss: w.idealBoss ? { ...w.idealBoss } : null,
      coneFlash: { ...w.coneFlash },
    },
    threat: { ...state.threat },
    abilities: {
      gcdUntil: state.abilities.gcdUntil,
      readyAt: { ...state.abilities.readyAt },
      buffs: { ...state.abilities.buffs },
    },
    debuffs: { sunder: { ...state.debuffs.sunder } },
    rotation: {
      combo: state.rotation.combo,
      bestCombo: state.rotation.bestCombo,
      counts: { ...state.rotation.counts },
      lastHit: state.rotation.lastHit ? { ...state.rotation.lastHit } : null,
      lastEarly: state.rotation.lastEarly ? { ...state.rotation.lastEarly } : null,
      beats: state.rotation.beats.map((b) => ({ ...b })),
    },
    upcoming: state.upcoming.map((u) => ({ ...u })),
    nextExpected: state.nextExpected ? { ...state.nextExpected } : null,
    feedback: { facingWrong: state.feedback.facingWrong, inHazard: state.feedback.inHazard, lastTick: state.feedback.lastTick ? { ...state.feedback.lastTick } : null, toast: state.feedback.toast ? { ...state.feedback.toast } : null },
    metrics: { ...state.metrics },
  };
}
