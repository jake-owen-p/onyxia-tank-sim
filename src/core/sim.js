// The simulation. Fixed-timestep, deterministic, no DOM. `createSim` returns an
// object with `state`, `step(cmd, dt)` and a few control methods used by the
// tutorial, drills and phase-skip. Everything observable is in `state`; events
// for audio/HUD are queued in `state.events` and drained by the host.
//
// Roles: 'tank' and 'offtank' hold the boss themselves. 'melee', 'ranged' and
// 'healer' play beside a ghost tank who holds her; their game is positioning,
// threat discipline, dispels and keeping the tank alive.
//
// Boss actions are data: `script.actions[id].kind` picks the resolution below
// (cone, knockback, fear, aoe, hazard, adds, aggroPull, threatWipe, debuff,
// enrage, targetSwitch). Nothing in here is specific to one boss.

import { rad, dist, angleTo, inCone, angleDelta, lerp, clamp, circlePoints } from './geometry.js';
import { createRng } from './rng.js';
import {
  createThreat, tickThreat, applyTaunt, applyGhostTaunt, applyBuffet, applyAggroPull, applyPlayerThreat,
  resetThreat, selectTarget, selectTargetGhostTanked, threatRatio,
} from './threat.js';
import { createCues, planCues, onCueEvent, onCuePress, clearPendingCues } from './presscues.js';
import { createLane, createZone, createCracks, pulseCracks, updateHazards, hazardAt } from './hazards.js';
import { buildSchedule, dueActions, scheduleOnce, upcoming as scheduleUpcoming } from './scheduler.js';
import { createInstance, resolve } from './scoring.js';
import { runCheck, playerAtSpot, bossAtSpot, bossFacingRaid, nearWall, attackRange } from './expectations.js';
import {
  createPlayer, updatePlayer, knockback, createBoss, updateBoss, beginTakeoff, beginLanding, bossTargetPos,
  createRaid, setRaidSpot, updateRaid, spawnAdds, updateWhelps, pickupWhelps, createGhost, updateGhost,
} from './entities.js';
import { idealPlayerPos, idealTankPos, idealBossPos, isTankRole, spotName } from './ideal.js';

export const FIXED_DT = 1 / 60;

const DEFAULTS = {
  role: 'tank',           // 'tank' | 'offtank' | 'melee' | 'ranged' | 'healer'
  seed: 1,
  startPhase: 1,          // phase id to begin in
  startOffset: 0,         // seconds relative to that phase's end when negative, start when positive
  start: 'entrance',      // position preset: 'entrance' | 'wall' | 'pickup'
  actions: null,          // override action list applied to every phase (drills)
  bossPassive: false,     // boss ignores everyone (tutorial)
  manual: false,          // no automatic schedule (tutorial drives actions)
  duration: null,         // end the run after this many seconds (drills)
  phaseDurations: null,   // { [phaseId]: seconds } overrides
  freezeHp: false,        // hold HP so phases never advance on their own (tutorial)
};

const LEGACY_ROLE = { mt: 'tank' };

export function createSim(script, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  opts.role = LEGACY_ROLE[opts.role] || opts.role;
  const rng = createRng(opts.seed);
  const roleDef = (script.roles && script.roles[opts.role]) || { abilities: Object.keys(script.playerAbilities) };
  const tankRole = isTankRole(opts.role);
  const P = script.positions;

  const state = {
    t: 0, tick: 0, seed: opts.seed, rng,
    role: opts.role, roleDef, tankRole,
    ended: false, result: null, endedAt: null,
    phase: null, phaseIndex: -1, phaseDef: null, phaseName: '', phaseSubtitle: '', phaseStart: 0, phaseEnd: 0, hp: 1,
    phasesPlayed: [],
    world: {
      player: createPlayer(script, P.playerStart),
      boss: createBoss(script, P.bossStart),
      raid: createRaid(script, rng, P.raidWait || P.raidSpotP1 || P.playerStart),
      whelps: [],
      hazards: [],
      projectiles: [],
      ghost: createGhost(script, P.playerStart),
      idealPlayer: { x: 0, y: 0, reason: 'wait' },
      idealTank: { x: 0, y: 0, reason: 'wait' },
      idealBoss: null,
      coneFlash: Object.fromEntries(Object.keys(script.boss.cones || {}).map((k) => [k, -Infinity]).concat([['knockback', -Infinity]])),
    },
    threat: createThreat(),
    abilities: {
      gcdUntil: -Infinity,
      readyAt: Object.fromEntries(Object.keys(script.playerAbilities).map((k) => [k, -Infinity])),
      list: (roleDef.abilities || []).filter((id) => script.playerAbilities[id]),
    },
    debuffs: [],           // outstanding debuffs: { uid, name, dispel, on:'player'|'ghost'|'raid', appliedAt, until, tickDamage, nextTickAt, actionId }
    cues: createCues(),
    schedule: [],
    upcoming: [],
    expectations: [],      // every instance, all phases (the scoring log)
    metrics: {},
    phaseMetrics: {},
    feedback: { facingWrong: false, inHazard: false, inFront: false, holdAttack: false, lastTick: null, toast: null },
    nextExpected: null,
    events: [],
    landedAt: null,
    engagedAt: null,
    lastTurnAt: null,       // last time she turned from the tank onto the raid
    lastRegainAt: null,     // last time she came back onto the tank
    duration: opts.duration,
    pendingTrigger: null,   // { id, until } action requested while the boss was mid-transition
    enraged: false,
    tankLowSince: null,
  };
  state.world.ghost.tanking = !tankRole;

  const threatCfg = {
    raidPerSecond: script.raid.threatPerSecond,
    autoAttackPerSecond: script.threat.autoAttackPerSecond,
    ghostTankPerSecond: script.threat.ghostTankPerSecond || script.threat.autoAttackPerSecond,
    tauntBonus: script.threat.tauntBonus,
    tauntLead: script.threat.tauntLead,
    tauntDuration: script.threat.tauntDuration,
    pullMultiplier: script.threat.pullMultiplier,
  };
  const ghostTauntDelay = script.threat.ghostTauntDelay ?? 2.5;

  let uid = 0;

  // ------------------------------------------------------------ helpers

  const emit = (type, data = {}) => { state.events.push({ t: state.t, type, ...data }); };

  const addMetric = (id, v) => {
    state.metrics[id] = (state.metrics[id] || 0) + v;
    const pm = state.phaseMetrics[state.phase] || (state.phaseMetrics[state.phase] = {});
    pm[id] = (pm[id] || 0) + v;
  };
  const setMetric = (id, v) => {
    state.metrics[id] = v;
    const pm = state.phaseMetrics[state.phase] || (state.phaseMetrics[state.phase] = {});
    pm[id] = v;
  };

  const bossRangeTo = (x, y) => dist(x, y, state.world.boss.x, state.world.boss.y) - script.boss.radius;
  const playerInBossRange = (range) => bossRangeTo(state.world.player.x, state.world.player.y) <= range;
  const ghostInBossRange = (range) => bossRangeTo(state.world.ghost.x, state.world.ghost.y) <= range;
  const tankTarget = () => (tankRole ? 'player' : 'ghost');
  const bossLive = () => { const b = state.world.boss; return b.state === 'grounded' && b.engaged && !b.passive; };

  function damagePlayer(amount, source) {
    const p = state.world.player;
    p.hp -= amount;
    emit('damage', { amount, source });
    if (p.hp <= 0) {
      p.hp = p.maxHp;
      addMetric('deaths', 1);
      emit('death', { source });
      toast('You died', 'bad');
    }
  }

  function damageGhost(amount, source) {
    const g = state.world.ghost;
    if (!g.tanking) return;
    g.hp -= amount;
    if (g.hp <= 0) {
      g.hp = g.maxHp;
      addMetric('tankDeaths', 1);
      emit('tankDeath', { source });
      toast('The tank died', 'bad');
    }
  }

  function toast(text, kind = 'info') { state.feedback.toast = { t: state.t, text, kind }; }

  /** True for `threat.turnGrace` seconds after a scripted turn onto the raid and after she comes back:
   *  while she swings round, facing, cleaves and tail sweeps on the raid are the fight's doing, not the tank's. */
  function turnSettling() {
    const g = script.threat.turnGrace || 0;
    return (state.lastTurnAt != null && state.t - state.lastTurnAt < g) || (state.lastRegainAt != null && state.t - state.lastRegainAt < g);
  }
  /** Facing, cleaves and tail sweeps on the raid are not charged while she is being pulled through
   *  them, while she settles after a landing, or while she swings round on a scripted turn. */
  function raidHitsExcused() {
    const afterPull = state.engagedAt != null && state.landedAt == null && state.t - state.engagedAt < script.raid.holdAfterPull;
    const afterLanding = state.landedAt != null && state.t - state.landedAt < script.boss.pickupGrace;
    return afterPull || afterLanding || turnSettling();
  }

  const activeExpectationDefs = () =>
    (state.phaseDef ? state.phaseDef.expectations : []).filter((e) => roleMatches(e.role));

  function roleMatches(roleSpec) {
    if (!roleSpec) return true;
    const list = Array.isArray(roleSpec) ? roleSpec : [roleSpec];
    return list.map((r) => LEGACY_ROLE[r] || r).some((r) => r === state.role || (r === 'tanks' && tankRole) || (r === 'dps' && (state.role === 'melee' || state.role === 'ranged')) || (r === 'nontank' && !tankRole));
  }

  // ------------------------------------------------------------ phases

  function phaseDuration(def) {
    return (opts.phaseDurations && opts.phaseDurations[def.id]) || def.duration;
  }

  /** Enter phase by index with `elapsed` seconds already spent in it. */
  function enterPhase(index, elapsed = 0) {
    const def = script.phases[index];
    if (!def) { end('victory'); return; }
    const w = state.world, b = w.boss;
    // Event windows of the old phase that straddle the transition cannot be judged fairly (she is taking off
    // or landing): drop them unscored. Spot deadlines (playerAtSpotBy, bossAtSpot) keep running.
    state.expectations = state.expectations.filter((i) => i.status !== 'pending' || i.phase === def.id || (i.type !== 'afterEvent' && i.type !== 'onEvent'));
    state.phaseIndex = index;
    state.phase = def.id;
    state.phaseDef = def;
    state.phaseName = def.name;
    state.phaseSubtitle = def.subtitle;
    state.phaseStart = state.t - elapsed;
    state.phaseEnd = state.phaseStart + phaseDuration(def);
    state.hp = lerp(def.hpFrom, def.hpTo, clamp(elapsed / phaseDuration(def), 0, 1));
    if (!state.phasesPlayed.includes(def.id)) state.phasesPlayed.push(def.id);
    state.phaseMetrics[def.id] = state.phaseMetrics[def.id] || {};

    const actionDefs = opts.manual ? [] : (opts.actions || def.actions);
    state.schedule = buildSchedule(actionDefs, state.t, rng);

    // Raid moves to its phase position (unless still waiting for the pull).
    if ((b.engaged || def.bossState === 'airborne') && P[def.raidSpot]) setRaidSpot(w.raid, P[def.raidSpot]);

    // Boss state transitions.
    if (def.bossState === 'airborne' && (b.state === 'grounded')) {
      beginTakeoff(state, script);
      emit('action', { id: 'takeoff', label: (script.actions.takeoff || {}).label || 'Takeoff' });
      b.engaged = true;
    } else if ((def.bossState || 'grounded') === 'grounded' && (b.state === 'airborne' || b.state === 'takeoff')) {
      beginLanding(state, script);
      b.engaged = true;
      b.target = 'raid';
    }

    // Persistent hazards live only in the phases that list them.
    w.hazards = w.hazards.filter((h) => h.kind !== 'crack');
    if ((def.bossState || 'grounded') === 'grounded') { w.hazards = w.hazards.filter((h) => h.kind !== 'lane'); b.hover = null; b.faceAlong = null; }
    for (const key of def.persistentHazards || []) {
      const a = script.actions[key];
      if (a && a.polys && script[a.polys]) w.hazards.push(...createCracks(script[a.polys], a.label));
    }

    // Phase-start expectations.
    for (const e of activeExpectationDefs()) {
      if (e.type === 'bossAtSpot' && (e.from == null || e.from === 'phaseStart')) {
        state.expectations.push(createInstance(e, def.id, state.t, { deadline: state.phaseStart + e.within, graceEnd: state.phaseStart + e.within + (e.grace || 0) }));
      } else if (e.type === 'playerAtSpotBy') {
        const deadline = state.phaseEnd;
        state.expectations.push(createInstance(e, def.id, state.t, { deadline, graceEnd: deadline + (e.grace || 0) }));
      }
    }
    emit('phase', { phase: def.id, name: def.name, subtitle: def.subtitle });
  }

  function spawnExpectationsFor(trigger, phaseId) {
    for (const e of activeExpectationDefs()) {
      if (e.type === 'bossAtSpot' && e.from === trigger) {
        state.expectations.push(createInstance(e, phaseId, state.t, { deadline: state.t + e.within, graceEnd: state.t + e.within + (e.grace || 0) }));
      }
    }
  }

  function end(result) {
    if (state.ended) return;
    state.ended = true;
    state.result = result;
    state.endedAt = state.t;
    // Anything still pending past its deadline is missed; a window the run ended inside is dropped, not scored.
    for (const i of state.expectations) {
      if (i.status !== 'pending') continue;
      if (i.deadline == null || state.t > i.deadline) resolveInstance(i, 'missed');
    }
    state.expectations = state.expectations.filter((i) => i.status !== 'pending');
    clearPendingCues(state);
    emit('end', { result });
  }

  // ------------------------------------------------------------ expectations

  function resolveInstance(inst, status) {
    resolve(inst, status, state.t);
    state.feedback.lastTick = { t: state.t, status, label: inst.label, lateBy: inst.lateBy };
    emit('expectation', { id: inst.id, status, label: inst.label, lateBy: inst.lateBy, phase: inst.phase });
  }

  /** A core event happened: create onEvent / afterEvent instances. */
  function onActionEvent(id) {
    for (const e of activeExpectationDefs()) {
      if (e.event !== id) continue;
      if (e.type === 'onEvent') {
        if (state.world.player.fearedUntil > state.t) continue;   // feared: the position is not yours to choose
        const inst = createInstance(e, state.phase, state.t, { deadline: state.t, graceEnd: state.t + (e.grace || 0), event: id });
        state.expectations.push(inst);
        if (runCheck(e.check, state, script)) resolveInstance(inst, 'ontime');
        else if (!e.grace) resolveInstance(inst, 'missed');
      } else if (e.type === 'afterEvent') {
        state.expectations.push(createInstance(e, state.phase, state.t, { deadline: state.t + e.within, graceEnd: state.t + e.within + (e.grace || 0), event: id, notBefore: e.notBefore ? state.t + e.notBefore : null }));
      }
    }
  }

  function updateExpectations() {
    const t = state.t;
    for (const inst of state.expectations) {
      if (inst.status !== 'pending') continue;
      const def = findDef(inst);
      if (!def) continue;
      let pass = false;
      switch (inst.type) {
        case 'bossAtSpot': pass = bossAtSpot(state, script, def.spot); break;
        case 'playerAtSpotBy':
          if (t < inst.deadline) continue;
          pass = playerAtSpot(state, script, def.spot); break;
        case 'onEvent':
        case 'afterEvent':
          if (inst.notBefore != null && t < inst.notBefore) continue;
          pass = runCheck(def.check, state, script); break;
        default: continue;
      }
      // A check evaluated on the first tick at or after its deadline still counts as on time.
      if (pass) resolveInstance(inst, t <= inst.deadline + 0.05 ? 'ontime' : 'late');
      else if (t > inst.graceEnd) resolveInstance(inst, 'missed');
    }
  }

  function findDef(inst) {
    const p = script.phases.find((x) => x.id === inst.phase);
    return p && p.expectations.find((e) => e.id === inst.id);
  }

  // ------------------------------------------------------------ boss actions

  function engage(by = tankTarget()) {
    const b = state.world.boss;
    if (b.engaged) return;
    b.engaged = true;
    b.target = by;
    if (by === 'player') state.threat.player = Math.max(state.threat.player, 10);
    else state.threat.ghost = Math.max(state.threat.ghost, 10);
    state.engagedAt = state.t;
    if (state.phaseDef && P[state.phaseDef.raidSpot]) setRaidSpot(state.world.raid, P[state.phaseDef.raidSpot]);
    emit('engage', { by });
    spawnExpectationsFor('engage', state.phase);
    if (!tankRole && by === 'player') { addMetric('earlyPulls', 1); toast('You pulled her before the tank', 'bad'); state.threat.ghostTauntAt = state.t + ghostTauntDelay; }
  }

  function anyoneBehind() {
    const b = state.world.boss, back = b.heading + Math.PI;
    const tail = Object.values(script.boss.cones || {}).find((c) => c.facing === 'back');
    if (!tail) return false;
    const p = state.world.player, g = state.world.ghost;
    if (inCone(p.x, p.y, b.x, b.y, back, rad(tail.angle), tail.range)) return true;
    if (g.tanking && inCone(g.x, g.y, b.x, b.y, back, rad(tail.angle), tail.range)) return true;
    for (const d of state.world.raid.dots) if (inCone(d.x, d.y, b.x, b.y, back, rad(tail.angle), tail.range)) return true;
    return false;
  }

  /** Try to start a boss action. Returns true if it started (or resolved). */
  function startAction(id, force = false) {
    const def = script.actions[id];
    const b = state.world.boss;
    if (!def) return false;
    const requires = def.requires || 'grounded';
    if (requires === 'grounded' && (b.state !== 'grounded' || (!b.engaged && !force) || b.passive)) return false;
    if (requires === 'airborne' && b.state !== 'airborne') return false;
    if (def.kind === 'hazard' && def.placement === 'lanes' && !opts.freezeHp && state.phaseEnd - state.t < (def.warning || 0) + (def.active || 0) + 2) return false;
    if (def.conditional === 'behind' && !anyoneBehind()) return false;
    if (def.conditional === 'onPlayer' && (b.target !== tankTarget() || state.threat.tauntUntil > state.t || state.threat.ghostTauntUntil > state.t)) return false;
    if (def.cast > 0) {
      if (b.cast) return false;
      b.cast = { id, label: def.label, icon: def.icon, start: state.t, end: state.t + def.cast };
      emit('cast', { id, label: def.label, castTime: def.cast });
      return true;
    }
    resolveAction(id);
    return true;
  }

  /** Who is inside a cone. Melee raid dots are skipped unless the action says `hitsMelee`. */
  function coneHits(coneId, hitsMelee) {
    const b = state.world.boss, c = script.boss.cones[coneId];
    const p = state.world.player, g = state.world.ghost;
    const h = b.heading + (c.facing === 'back' ? Math.PI : 0);
    const player = inCone(p.x, p.y, b.x, b.y, h, rad(c.angle), c.range);
    const ghost = g.tanking && inCone(g.x, g.y, b.x, b.y, h, rad(c.angle), c.range);
    let raid = 0;
    for (const d of state.world.raid.dots) {
      if (d.melee && !hitsMelee) continue;
      if (inCone(d.x, d.y, b.x, b.y, h, rad(c.angle), c.range)) raid++;
    }
    return { player, ghost, raid };
  }

  function pickRandomVictim(def) {
    // Is the player one of the `count` random victims out of the raid?
    const n = def.count || 1;
    const pool = script.raid.size + 1;
    return rng.next() < Math.min(1, n / pool);
  }

  function resolveAction(id) {
    const def = script.actions[id];
    const w = state.world, b = w.boss, p = w.player;
    const kind = def.kind;
    switch (kind) {
      case 'cone': {
        const hit = coneHits(def.cone, !!def.hitsMelee);
        w.coneFlash[def.cone] = state.t;
        if (hit.player) {
          damagePlayer(def.damage || 0, id);
          if (def.knockback) { knockback(p, b.x, b.y, def.knockback, state.t); emit('knockback', { source: id }); }
          if (!tankRole && def.playerMetric) addMetric(def.playerMetric, 1);
        }
        if (hit.ghost) damageGhost(def.damage || 0, id);
        if (hit.raid && def.raidMetric && !raidHitsExcused()) { addMetric(def.raidMetric, 1); if (def.raidToast) toast(def.raidToast, 'bad'); }
        break;
      }
      case 'knockback': {
        w.coneFlash.knockback = state.t;
        const d = bossRangeTo(p.x, p.y);
        const front = Math.abs(angleDelta(b.heading, angleTo(b.x, b.y, p.x, p.y))) <= Math.PI / 2;
        if (d <= def.knockbackRange && front) {
          const offWall = tankRole && script.arena.backWall && !nearWall(state, script);
          knockback(p, b.x, b.y, def.knockback, state.t);
          if (tankRole) applyBuffet(state.threat, def.threatCut || 0, true);
          if (offWall && def.wallMetric) { addMetric(def.wallMetric, 1); toast('Knocked away from the wall', 'bad'); }
          emit('knockback', { source: id, offWall: !!offWall });
        }
        if (!tankRole && b.target === 'ghost') applyBuffet(state.threat, def.threatCut || 0, false);
        break;
      }
      case 'fear': {
        const who = def.targets || 'all';
        const me = who === 'all' || (who === 'tank' && tankRole) || (who === 'random' && pickRandomVictim(def));
        if (me) {
          p.fearedUntil = state.t + (def.duration || script.player.fearDuration);
          p.wanderTimer = 0;
          emit('feared', { duration: def.duration || script.player.fearDuration });
          toast('Feared', 'bad');
        }
        break;
      }
      case 'aoe': {
        const inRadius = !def.radius || bossRangeTo(p.x, p.y) <= def.radius;
        if (inRadius) damagePlayer(def.damage || 0, id);
        if (def.tankDamage || !def.radius || ghostInBossRange(def.radius)) damageGhost(def.tankDamage ?? def.damage ?? 0, id);
        emit('raidDamage', { id, label: def.label, amount: def.damage || 0 });
        break;
      }
      case 'hazard': {
        placeHazard(def, id);
        if (def.placement === 'lanes') return;   // the 'action' event fires when the lane goes active
        break;
      }
      case 'adds': spawnAdds(state, script, def); break;
      case 'aggroPull': {
        if (tankRole) {
          // A DPS overtakes the tank on the threat table; she turns on the next threat tick.
          applyAggroPull(state.threat, def.threatMultiplier || 1.15);
        } else if (b.target === 'ghost') {
          b.target = 'raid';
          state.threat.ghostTauntAt = state.t + (def.duration || 3);
          emit('threatLost', { by: 'raid' });
        }
        toast('A DPS pulled aggro', 'warn');
        break;
      }
      case 'targetSwitch': {
        // She goes for someone else for a moment; the tank has to take her back.
        if (b.target === tankTarget()) {
          b.target = 'raid';
          if (tankRole) { state.threat.raid = Math.max(state.threat.raid, state.threat.player * 1.2); addMetric('threatLostCount', 1); state.lastTurnAt = state.t; emit('threatLost', { by: id }); for (const beat of onCueEvent(state, script, 'threatLost', state.t)) emitBeat(beat); }
          else { state.threat.ghostTauntAt = state.t + (def.duration || 3); emit('threatLost', { by: id }); }
          toast(def.toast || `${def.label}: she switched targets`, 'bad');
        }
        break;
      }
      case 'threatWipe': {
        resetThreat(state.threat);
        state.threat.raid = script.threat.landingRaidThreat || 0;
        b.target = 'raid';
        if (!tankRole) state.threat.ghostTauntAt = state.t + ghostTauntDelay;
        else { addMetric('threatLostCount', 1); state.lastTurnAt = state.t; emit('threatLost', { by: id }); for (const beat of onCueEvent(state, script, 'threatLost', state.t)) emitBeat(beat); }
        toast(def.toast || `${def.label}: threat wiped`, 'bad');
        break;
      }
      case 'debuff': applyDebuff(def, id); break;
      case 'enrage': {
        state.enraged = true;
        toast(def.toast || `${def.label}!`, 'bad');
        break;
      }
      case 'projectile': {
        const dots = w.raid.dots;
        const target = rng.next() < (def.playerChance ?? 0.12) ? p : rng.pick(dots);
        w.projectiles.push({ x0: b.x, y0: b.y, z0: b.z, tx: target.x, ty: target.y, t0: state.t, t1: state.t + (def.travel || 1), splash: def.splash || 5, damage: def.damage || 0, hit: false });
        break;
      }
      default: break;
    }
    emit('action', { id, label: def.label });
    onActionEvent(id);
    spawnExpectationsFor(id, state.phase);
    for (const beat of onCueEvent(state, script, id, state.t)) emitBeat(beat);
    for (const f of def.follow || []) scheduleOnce(state.schedule, f.id, state.t + (f.delay || 0));
  }

  function placeHazard(def, id) {
    const w = state.world, b = w.boss, p = w.player;
    const placement = def.placement || 'player';
    if (placement === 'lanes') {
      const lanes = script[def.lanes || 'deepBreathLanes'] || [];
      if (!lanes.length) return;
      const lane = rng.pick(lanes);
      const h = createLane(lane, def, state.t);
      h.source = id;
      w.hazards.push(h);
      if (def.hoverAtStart !== false) { b.hover = { x: lane.from[0], y: lane.from[1] }; b.faceAlong = angleTo(lane.from[0], lane.from[1], lane.to[0], lane.to[1]); }
      emit('hazardWarn', { kind: 'lane', id: lane.id, label: def.label, in: def.warning });
      return;
    }
    if (placement === 'polys') {
      pulseCracks(w.hazards, def, state.t);
      for (const h of w.hazards) if (h.kind === 'crack') h.source = id;
      emit('hazardWarn', { kind: 'crack', label: def.label, in: def.warning });
      return;
    }
    const r = def.radius || 6;
    const centres = [];
    if (placement === 'player') centres.push({ x: p.x, y: p.y, onPlayer: true });
    else if (placement === 'boss') centres.push({ x: b.x, y: b.y });
    else if (placement === 'spots') for (const name of def.spots || []) if (P[name]) centres.push({ x: P[name].x, y: P[name].y });
    else if (placement === 'random') {
      const n = def.count || 1;
      for (let i = 0; i < n; i++) {
        if (pickRandomVictim({ count: 1 })) centres.push({ x: p.x, y: p.y, onPlayer: true });
        else { const d = rng.pick(w.raid.dots); centres.push({ x: d.x, y: d.y }); }
      }
    } else if (placement === 'tank') { const g = w.ghost.tanking ? w.ghost : p; centres.push({ x: g.x, y: g.y, onPlayer: !w.ghost.tanking }); }
    for (const c of centres) {
      const z = createZone(circlePoints(c.x, c.y, r, 20), def, state.t, def.label, { radius: r, id: `${id}:${++uid}` });
      z.source = id;
      w.hazards.push(z);
    }
    emit('hazardWarn', { kind: 'zone', label: def.label, in: def.warning || 0, onPlayer: centres.some((c) => c.onPlayer) });
  }

  function applyDebuff(def, id) {
    const tgt = def.target || 'random';
    let on;
    if (tgt === 'tank') on = tankRole ? 'player' : 'ghost';
    else if (tgt === 'player') on = 'player';
    else if (tgt === 'all') on = 'player';
    else on = pickRandomVictim(def) ? 'player' : 'raid';
    const d = {
      uid: ++uid, name: def.label, dispel: def.dispel || 'none', on,
      appliedAt: state.t, until: state.t + (def.duration || 10),
      tickDamage: def.tickDamage || 0, nextTickAt: state.t + 1, actionId: id, tip: def.tip || '',
    };
    state.debuffs.push(d);
    emit('debuffApplied', { uid: d.uid, name: d.name, dispel: d.dispel, on, duration: def.duration || 10 });
    if (d.dispel !== 'none') for (const beat of onCueEvent(state, script, 'debuffApplied', state.t)) emitBeat(beat);
    if (on === 'player') toast(`${def.label} on you`, d.dispel !== 'none' ? 'warn' : 'bad');
    if (def.fear && on === 'player') { state.world.player.fearedUntil = state.t + (def.fear); emit('feared', { duration: def.fear }); }
  }

  function updateDebuffs(dt) {
    for (let i = state.debuffs.length - 1; i >= 0; i--) {
      const d = state.debuffs[i];
      if (state.t >= d.until) { state.debuffs.splice(i, 1); emit('debuffExpired', { uid: d.uid, name: d.name, on: d.on }); continue; }
      if (d.tickDamage && state.t >= d.nextTickAt) {
        d.nextTickAt += 1;
        if (d.on === 'player') damagePlayer(d.tickDamage, d.actionId);
        else if (d.on === 'ghost') damageGhost(d.tickDamage, d.actionId);
      }
      if (d.dispel !== 'none' && state.role === 'healer') addMetric('debuffSeconds', dt);
    }
  }

  function onLanded() {
    const b = state.world.boss;
    state.landedAt = state.t;
    if (script.threat.resetOnLanding) { resetThreat(state.threat); state.threat.raid = script.threat.landingRaidThreat || 0; }   // healers and DPS are already on her table
    b.target = 'raid';
    b.engaged = true;
    if (!tankRole) state.threat.ghostTauntAt = state.t + (script.threat.ghostPickupDelay ?? 1.5);
    emit('action', { id: 'landing', label: (script.actions.landing || {}).label || 'Landing' });
    onActionEvent('landing');
    for (const beat of onCueEvent(state, script, 'landing', state.t)) emitBeat(beat);
    spawnExpectationsFor('landing', state.phase);
  }

  // ------------------------------------------------------------ player abilities

  function useAbility(id) {
    const def = script.playerAbilities[id];
    if (!def) return;
    const A = state.abilities, p = state.world.player, b = state.world.boss, g = state.world.ghost;
    const fail = (reason, text) => {
      emit('abilityFailed', { id, reason });
      if (text) toast(text, 'warn');
      onCuePress(state, script, id, state.t, reason);
    };
    if (!A.list.includes(id)) return fail('role');
    if (p.fearedUntil > state.t) return fail('feared', 'Feared');
    if (A.readyAt[id] > state.t) return fail('cooldown');
    if (def.gcd && A.gcdUntil > state.t) return fail('gcd');
    const kind = def.kind || id;

    switch (kind) {
      case 'taunt': {
        if (b.state === 'grounded' && !b.passive && playerInBossRange(def.range)) {
          engage('player');
          applyTaunt(state.threat, state.t, threatCfg);
          if (b.target !== 'player') { b.target = 'player'; state.lastRegainAt = state.t; emit('threatRegained', { by: 'taunt' }); }
        } else if (pickupWhelps(state, script, def.range) > 0) {
          onWhelpPickup();
        } else return fail('range', b.state === 'grounded' ? 'Out of range' : 'She is in the air');
        break;
      }
      case 'attack': {
        const range = def.range ?? attackRange(state, script);
        if (b.state !== 'grounded' || !b.engaged || b.passive) return fail('range', b.state === 'grounded' ? 'Nothing to hit yet' : 'She is in the air');
        if (!playerInBossRange(range)) return fail('range', 'Out of range');
        applyPlayerThreat(state.threat, def.threat || 0);
        addMetric('attacks', 1);
        if (state.feedback.holdAttack) { addMetric('attacksInRed', 1); toast('Hold! You are about to pull aggro', 'bad'); }
        else if (holdAfterPull()) { addMetric('earlyAttacks', 1); toast('Wait for the tank to build threat', 'warn'); }
        emit('attack', { id });
        break;
      }
      case 'heal': {
        const range = def.range ?? 40;
        if (!g.tanking) return fail('range', 'No one to heal');
        if (dist(p.x, p.y, g.x, g.y) > range) return fail('range', 'Tank out of range');
        const before = g.hp;
        g.hp = Math.min(g.maxHp, g.hp + (def.amount || 1500));
        applyPlayerThreat(state.threat, def.threat || 0);
        addMetric('heals', 1);
        if (g.maxHp - before < (def.amount || 1500) * 0.25) addMetric('overheals', 1);
        emit('heal', { id, amount: g.hp - before });
        break;
      }
      case 'dispel': {
        const types = def.dispels || null;
        const idx = state.debuffs.findIndex((d) => d.dispel !== 'none' && (!types || types.includes(d.dispel)));
        if (idx < 0) return fail('nothing', 'Nothing to dispel');
        const d = state.debuffs.splice(idx, 1)[0];
        applyPlayerThreat(state.threat, def.threat || 0);
        addMetric('dispels', 1);
        emit('dispelled', { uid: d.uid, name: d.name, on: d.on, after: state.t - d.appliedAt });
        for (const beat of onCueEvent(state, script, 'dispelled', state.t)) emitBeat(beat);
        break;
      }
      case 'interrupt': {
        if (!b.cast || !script.actions[b.cast.id] || !script.actions[b.cast.id].interruptible) return fail('nothing', 'Nothing to interrupt');
        if (!playerInBossRange(def.range ?? 8)) return fail('range', 'Out of range');
        const cid = b.cast.id;
        b.cast = null;
        addMetric('interrupts', 1);
        emit('interrupted', { id: cid });
        for (const beat of onCueEvent(state, script, 'interrupted', state.t)) emitBeat(beat);
        break;
      }
      default: break;
    }
    A.readyAt[id] = state.t + (def.cooldown || 0);
    if (def.gcd) A.gcdUntil = state.t + script.gcd;
    emit('abilityUsed', { id, label: def.label });
    const beat = onCuePress(state, script, id, state.t, 'ok');
    if (beat) emitBeat(beat);
  }

  function holdAfterPull() {
    return state.engagedAt != null && state.landedAt == null && state.t - state.engagedAt < script.raid.holdAfterPull;
  }

  function onWhelpPickup() {
    emit('whelpPickup');
    for (const beat of onCueEvent(state, script, 'whelpPickup', state.t)) emitBeat(beat);
  }

  function emitBeat(beat) {
    emit('beat', { ability: beat.ability, status: beat.status, delta: beat.delta, cue: beat.cue, label: beat.label, combo: state.cues.combo });
  }

  // ------------------------------------------------------------ derived HUD state

  function buildUpcoming() {
    const list = [];
    const horizon = 30;
    for (const u of scheduleUpcoming(state.schedule, state.t, horizon)) {
      const def = script.actions[u.id];
      if (!def || def.conditional || def.hidden) continue;
      list.push({ id: u.id, label: def.label, icon: def.icon, at: u.at, in: u.in, warn: !!def.warn, cue: def.cue });
    }
    for (const h of state.world.hazards) {
      if (h.state !== 'warning') continue;
      const id = h.kind === 'lane' ? 'deepBreath' : h.kind === 'crack' ? 'eruption' : (h.id || '').split(':')[0];
      const def = script.actions[id] || { label: h.label, icon: 'eruption', cue: null };
      if (!list.some((x) => x.id === id)) list.push({ id, label: def.label, icon: def.icon, at: h.activeAt, in: h.activeAt - state.t, warn: true, cue: def.cue, hazard: true });
    }
    const next = script.phases[state.phaseIndex + 1];
    if (next && !opts.freezeHp && !opts.duration) {
      const id = next.bossState === 'airborne' ? 'takeoff' : state.phaseDef.bossState === 'airborne' ? 'landing' : null;
      if (id && script.actions[id]) {
        const at = state.phaseEnd + (id === 'landing' ? script.boss.landingDuration : 0);
        if (at - state.t <= horizon) list.push({ id, label: script.actions[id].label, icon: script.actions[id].icon, at, in: at - state.t, warn: true, cue: script.actions[id].cue, phase: true });
      }
    } else if (opts.duration && state.phaseDef && state.phaseDef.bossState === 'airborne' && next && script.actions.landing) {
      const at = state.phaseEnd + script.boss.landingDuration;
      if (at - state.t <= horizon) list.push({ id: 'landing', label: script.actions.landing.label, icon: 'landing', at, in: at - state.t, warn: true, cue: 'landing', phase: true });
    }
    list.sort((a, b) => a.at - b.at);
    state.upcoming = list;
  }

  function buildNextExpected() {
    const b = state.world.boss;
    const ideal = state.world.idealPlayer;
    const fb = state.feedback;
    let best = null;
    for (const i of state.expectations) {
      if (i.status !== 'pending' || i.type === 'onEvent') continue;
      if (!best || (i.deadline ?? Infinity) < (best.deadline ?? Infinity)) best = i;
    }
    const expectation = best ? { label: best.label, deadline: best.deadline, kind: 'expectation', id: best.id } : null;
    const soon = expectation && expectation.deadline != null && expectation.deadline - state.t <= 20;
    const set = (label, kind) => { state.nextExpected = { label, kind }; };
    // Urgent corrections first, then a near deadline, then hints, then far deadlines.
    if (ideal.reason === 'dodgeLane') return set('Step out of the lane', 'fix');
    if (ideal.reason === 'dodgeZone' || fb.inHazard) return set(fb.inHazard ? 'Get out of it' : 'Move away from the hazard', 'fix');
    if (tankRole) {
      if (fb.facingWrong) return set('Turn her away from the raid', 'fix');
      if (bossLive() && b.target !== 'player') return set('Taunt. She is on the raid', 'fix');
      if (ideal.reason === 'whelps') return set('Pick up the adds', 'fix');
      if (soon) { state.nextExpected = expectation; return; }
      if (ideal.reason === 'approach') return set('Taunt her and pull to the wall', 'hint');
      if (state.world.idealBoss && !state.world.idealBoss.satisfied && b.engaged) return set('Move her onto the boss spot, facing away', 'fix');
      if (ideal.reason === 'holdWhelps') return set('Hold the adds away from the raid', 'hold');
    } else {
      if (bossLive() && b.target === 'player') return set('She is on you. Stop and let the tank take her', 'fix');
      if (fb.inFront) return set('Get out of her front', 'fix');
      const dsp = state.role === 'healer' && state.debuffs.find((d) => d.dispel !== 'none');
      if (dsp) return set(`Dispel ${dsp.name}`, 'fix');
      if (state.role === 'healer' && state.world.ghost.hp / state.world.ghost.maxHp < (script.ghostTank.lowHp ?? 0.5)) return set('Heal the tank', 'fix');
      if (fb.holdAttack) return set('Hold your attacks: you are about to pull', 'fix');
      if (soon) { state.nextExpected = expectation; return; }
      if (holdAfterPull() && bossLive()) return set('Wait: let the tank build threat', 'hold');
      if ((state.role === 'melee' || state.role === 'ranged') && bossLive() && !fb.inRangeOk) return set('Get in range and attack', 'hint');
    }
    if (expectation) { state.nextExpected = expectation; return; }
    const nextWarn = state.upcoming.find((u) => u.warn);
    if (nextWarn) return set(`Hold position. ${nextWarn.label} in ${Math.ceil(nextWarn.in)}s`, 'hold');
    set('Hold position', 'hold');
  }

  // ------------------------------------------------------------ main step

  function step(cmd = {}, dt = FIXED_DT) {
    if (state.ended) return;
    state.t += dt;
    state.tick++;
    const w = state.world, b = w.boss, p = w.player, g = w.ghost;

    // Phase clock and HP drain.
    if (!opts.freezeHp && state.phaseDef) {
      const def = state.phaseDef;
      const k = clamp((state.t - state.phaseStart) / phaseDuration(def), 0, 1);
      state.hp = lerp(def.hpFrom, def.hpTo, k);
      if (state.t >= state.phaseEnd) {
        if (state.phaseIndex + 1 < script.phases.length) enterPhase(state.phaseIndex + 1, state.t - state.phaseEnd);
        else { state.hp = 0; end('victory'); return; }
      }
    }

    // Player.
    if (cmd.abilities) for (const id of cmd.abilities) useAbility(id);
    if (updatePlayer(state, script, cmd, dt, rng).jumped) emit('jump');

    // Proximity engage: walking into melee range wakes her up (the ghost tank does the walking in non-tank roles).
    if (!b.engaged && !b.passive && b.state === 'grounded') {
      if (!tankRole && ghostInBossRange(script.boss.meleeRange + 1)) engage('ghost');
      else if (playerInBossRange(script.boss.meleeRange + 1)) engage('player');
    }

    // Boss casting and schedule.
    if (b.cast && state.t >= b.cast.end) { const id = b.cast.id; b.cast = null; resolveAction(id); }
    for (const id of dueActions(state.schedule, state.t, rng)) startAction(id);

    const flags = updateBoss(state, script, dt);
    if (flags.landed) onLanded();
    if (state.pendingTrigger) {
      // A tutorial/drill trigger issued during takeoff or landing fires once she is ready.
      if (startAction(state.pendingTrigger.id, true) || state.t > state.pendingTrigger.until) state.pendingTrigger = null;
    }

    // Threat and targeting.
    const live = bossLive();
    const attacking = live && tankRole && playerInBossRange(script.boss.meleeRange + 1) && p.fearedUntil <= state.t;
    const ghostTanking = live && !tankRole && ghostInBossRange(script.boss.meleeRange + 1);
    // The raid holds its damage for a few seconds after the pull (not after a landing).
    const raidHolding = holdAfterPull();
    tickThreat(state.threat, dt, threatCfg, live && tankRole && !raidHolding, attacking, ghostTanking);
    if (live) {
      const prev = b.target;
      if (tankRole) {
        b.target = selectTarget(state.threat, b.target, state.t, threatCfg);
        if (prev === 'player' && b.target === 'raid') { addMetric('threatLostCount', 1); state.lastTurnAt = state.t; emit('threatLost'); toast('She turned on the raid. Taunt!', 'bad'); for (const beat of onCueEvent(state, script, 'threatLost', state.t)) emitBeat(beat); }
        else if (prev === 'raid' && b.target === 'player') { state.lastRegainAt = state.t; emit('threatRegained', { by: 'threat' }); }
      } else {
        // The ghost tank taunts back after a delay whenever she is off it.
        if (b.target !== 'ghost' && state.threat.ghostTauntAt == null) state.threat.ghostTauntAt = state.t + ghostTauntDelay;
        if (state.threat.ghostTauntAt != null && state.t >= state.threat.ghostTauntAt && ghostInBossRange(script.boss.meleeRange + 3)) {
          applyGhostTaunt(state.threat, state.t, threatCfg);
          b.target = 'ghost';
          emit('ghostTaunt');
        } else if (b.target !== 'raid') {
          b.target = selectTargetGhostTanked(state.threat, b.target, state.t, threatCfg);
        }
        if (prev !== 'player' && b.target === 'player') { addMetric('aggroPulls', 1); emit('aggroPulled'); toast('You pulled aggro!', 'bad'); state.threat.ghostTauntAt = state.t + ghostTauntDelay; }
        if (prev === 'player' && b.target === 'ghost') emit('threatRegained', { by: 'ghost' });
        if (b.target === 'ghost') state.threat.ghostTauntAt = null;
      }
      if (b.target === tankTarget() && state.landedAt != null && state.metrics.pickupTime == null) setMetric('pickupTime', state.t - state.landedAt);
      // Melee swings.
      if (state.t >= b.nextMelee && !b.cast) {
        const dmg = script.boss.meleeDamage * (state.enraged ? (script.boss.enrageMultiplier || 1.5) : 1);
        if (b.target === 'player' && playerInBossRange(script.boss.meleeRange + 1)) { damagePlayer(dmg, 'melee'); b.lastHit = state.t; b.nextMelee = state.t + script.boss.meleeInterval; }
        else if (b.target === 'ghost' && ghostInBossRange(script.boss.meleeRange + 1)) { damageGhost(dmg, 'melee'); b.lastHit = state.t; b.nextMelee = state.t + script.boss.meleeInterval; }
        else if (b.target === 'raid' && dist(b.x, b.y, w.raid.anchor.x, w.raid.anchor.y) <= script.boss.meleeRange + 6) { b.lastHit = state.t; b.nextMelee = state.t + script.boss.meleeInterval; }
      }
    }

    // Raid, adds, projectiles, debuffs.
    updateRaid(state, script, dt);
    if (state.role === 'offtank' && p.fearedUntil <= state.t) {
      const addDef = Object.values(script.actions).find((a) => a.kind === 'adds');
      if (addDef && pickupWhelps(state, script, addDef.aggroRange || 10) > 0) onWhelpPickup();
    }
    const wf = updateWhelps(state, script, dt);
    if (wf.onRaid && state.role === 'offtank') addMetric('whelpsOnRaid', dt);
    for (let i = w.projectiles.length - 1; i >= 0; i--) {
      const pr = w.projectiles[i];
      if (!pr.hit && state.t >= pr.t1) { pr.hit = true; if (pr.damage && dist(p.x, p.y, pr.tx, pr.ty) <= pr.splash) damagePlayer(pr.damage, 'projectile'); }
      if (state.t > pr.t1 + 0.7) w.projectiles.splice(i, 1);
    }
    updateDebuffs(dt);

    // Hazards.
    for (const tr of updateHazards(w.hazards, state.t)) {
      const h = tr.hazard;
      if (tr.to === 'active') {
        emit('hazardActive', { kind: h.kind, label: h.label });
        if (h.kind === 'lane') { emit('action', { id: 'deepBreath', label: h.label }); onActionEvent('deepBreath'); }
      } else if (tr.to === 'ended' && h.kind === 'lane') {
        if (P.hoverIdle) b.hover = { ...P.hoverIdle };
        b.faceAlong = null;
      }
    }
    let inHazard = false;
    for (const h of w.hazards) {
      if (h.state !== 'active' && h.kind !== 'crack') continue;
      const inside = hazardAt([h], p.x, p.y);
      if (!inside) continue;
      if (h.kind === 'crack') {
        addMetric('playerInCrack', dt);
        inHazard = true;
        if (h.state === 'active' && !h.hitPlayer) { h.hitPlayer = true; damagePlayer(h.damage, h.source || 'eruption'); }
      } else {
        addMetric('playerInHazard', dt);
        inHazard = true;
        if (h.tick) { if (state.t >= h.nextTickAt) { h.nextTickAt = state.t + 1; damagePlayer(h.damage, h.source || h.kind); } }
        else if (!h.hitPlayer) { h.hitPlayer = true; damagePlayer(h.damage, h.source || h.kind); }
      }
    }
    state.feedback.inHazard = inHazard;

    // Continuous metrics.
    if (live) {
      const facing = bossFacingRaid(state, script);
      state.feedback.facingWrong = tankRole && facing;
      if (tankRole && facing && !raidHitsExcused()) addMetric('bossFacingRaid', dt);
      const tail = Object.values(script.boss.cones || {}).find((c) => c.facing === 'back');
      if (tail && inCone(p.x, p.y, b.x, b.y, b.heading + Math.PI, rad(tail.angle), tail.range)) addMetric('playerInTail', dt);
      if (!tankRole) {
        const front = Object.values(script.boss.cones || {}).some((c) => c.facing !== 'back' && inCone(p.x, p.y, b.x, b.y, b.heading, rad(c.angle), c.range));
        state.feedback.inFront = front && b.target !== 'player';
        if (state.feedback.inFront) addMetric('playerInFront', dt);
        const ratio = threatRatio(state.threat, threatCfg, false);
        state.feedback.holdAttack = b.target === 'ghost' && ratio >= (script.threat.dangerBand ?? 0.8);
        if (state.role === 'melee' || state.role === 'ranged') {
          const inR = playerInBossRange(attackRange(state, script));
          state.feedback.inRangeOk = inR;
          if (!inR && p.fearedUntil <= state.t) addMetric('outOfRange', dt);
          const attackReady = (state.abilities.readyAt.attack ?? -Infinity) <= state.t && state.abilities.gcdUntil <= state.t;
          if (inR && attackReady && !state.feedback.holdAttack && !raidHolding && b.target === 'ghost' && p.fearedUntil <= state.t) addMetric('dpsIdle', dt);
        }
      }
    } else { state.feedback.facingWrong = false; state.feedback.inFront = false; state.feedback.holdAttack = false; }

    // Tank health for the healer.
    if (g.tanking) {
      const low = g.hp / g.maxHp < (script.ghostTank.lowHp ?? 0.5);
      if (low && state.tankLowSince == null) { state.tankLowSince = state.t; emit('tankLow', { hp: g.hp / g.maxHp }); for (const beat of onCueEvent(state, script, 'tankLow', state.t)) emitBeat(beat); }
      else if (!low) state.tankLowSince = null;
      if (low && state.role === 'healer') addMetric('tankLowSeconds', dt);
    }

    // Expectations, ideal positions, ghost, HUD data.
    updateExpectations();
    w.idealPlayer = idealPlayerPos(state, script);
    w.idealTank = tankRole ? w.idealPlayer : idealTankPos(state, script, 'ghost');
    w.idealBoss = idealBossPos(state, script);
    updateGhost(state, script, dt, w.idealTank);
    buildUpcoming();
    buildNextExpected();

    // Press cues whose window closed.
    for (const beat of planCues(state, state.t)) emitBeat(beat);

    if (opts.duration != null && state.t >= opts.duration) end('drillComplete');
  }

  // ------------------------------------------------------------ control API

  function placeRaid(spotName) {
    const w = state.world;
    if (!P[spotName]) return;
    setRaidSpot(w.raid, P[spotName]);
    w.raid.anchor = { ...w.raid.anchorTarget };
    for (const d of w.raid.dots) { d.x = w.raid.anchor.x + d.ox * w.raid.spread; d.y = w.raid.anchor.y + d.oy * w.raid.spread; }
  }

  /** Where the player's role stands for the current phase (for presets). */
  function roleSpot() {
    const r = state.role;
    const key = r === 'healer' ? 'healer' : r === 'melee' ? 'melee' : r === 'ranged' ? 'ranged' : 'tank';
    const name = spotName(state, script, key, key + 'Spot') || (state.phaseDef && state.phaseDef.raidSpot) || 'tankSpot';
    return P[name] || P.tankSpot;
  }

  /** Reset positions to a named preset. */
  function teleport(preset) {
    const w = state.world, b = w.boss, g = w.ghost;
    w.whelps = []; w.projectiles = []; state.debuffs = [];
    w.hazards = w.hazards.filter((h) => h.kind === 'crack');
    w.player.knock = null; w.player.fearedUntil = -Infinity; w.player.hp = w.player.maxHp; w.player.z = 0; w.player.vz = 0;
    g.hp = g.maxHp;
    if (preset === 'wall') {
      const ts = P.tankSpot, bs = P.bossSpot;
      Object.assign(b, { x: bs.x, y: bs.y, z: 0, heading: rad(bs.heading), state: 'grounded', engaged: true, target: tankTarget(), cast: null, transition: null });
      if (tankRole) { Object.assign(w.player, { x: ts.x, y: ts.y, heading: rad(270) }); state.threat.player = 6000; state.threat.raid = 3000; }
      else { Object.assign(g, { x: ts.x, y: ts.y, heading: rad(270) }); state.threat.ghost = 6000; state.threat.player = 0; state.threat.raid = 0; }
      state.engagedAt = state.t - script.raid.holdAfterPull;   // already tanking: the raid is not holding any more
      placeRaid(state.phaseDef ? state.phaseDef.raidSpot : 'raidSpotP1');
      if (!tankRole) {
        const s = roleSpot();
        Object.assign(w.player, { x: s.x, y: s.y, heading: rad(90) });
        if (state.role === 'melee') { const ip = idealPlayerPos(state, script); Object.assign(w.player, { x: ip.x, y: ip.y, heading: angleTo(ip.x, ip.y, b.x, b.y) }); }
      }
    } else if (preset === 'pickup') {
      const ps = P.pickupSpot || P.tankSpot;
      const hover = P.hoverIdle || ps;
      Object.assign(b, { x: hover.x, y: hover.y, z: script.hoverHeight || 0, heading: rad(270), state: 'airborne', engaged: true, target: null, cast: null, transition: null, hover: { x: hover.x, y: hover.y } });
      resetThreat(state.threat);
      Object.assign(g, { x: ps.x, y: ps.y, heading: rad(270) });
      placeRaid('raidSpotP2');
      if (tankRole) Object.assign(w.player, { x: ps.x, y: ps.y, heading: rad(270) });
      else { const s = roleSpot(); Object.assign(w.player, { x: s.x, y: s.y, heading: rad(90) }); }
    } else {
      const ps = P.playerStart;
      Object.assign(w.player, { x: ps.x, y: ps.y, heading: rad(ps.heading) });
      Object.assign(g, { x: ps.x + (tankRole ? 0 : 2), y: ps.y, heading: rad(ps.heading) });
      Object.assign(b, { x: P.bossStart.x, y: P.bossStart.y, z: 0, heading: rad(P.bossStart.heading), state: 'grounded', engaged: false, target: null, cast: null, transition: null });
      resetThreat(state.threat);
      placeRaid(P.raidWait ? 'raidWait' : (state.phaseDef ? state.phaseDef.raidSpot : 'raidSpotP1'));
    }
    if (tankRole) Object.assign(g, { x: w.player.x, y: w.player.y, heading: w.player.heading });
    w.idealPlayer = idealPlayerPos(state, script);
    w.idealTank = tankRole ? w.idealPlayer : idealTankPos(state, script, 'ghost');
    w.idealBoss = idealBossPos(state, script);
  }

  /** Jump to a phase (phase skip, tutorial). `elapsed` seconds already spent in it. */
  function setPhase(phaseId, elapsed = 0) {
    const idx = script.phases.findIndex((p) => p.id === phaseId);
    if (idx < 0) return;
    // Pending phase-scoped expectations of the old phase are dropped, not failed.
    state.expectations = state.expectations.filter((i) => i.status !== 'pending');
    clearPendingCues(state);
    enterPhase(idx, elapsed);
    buildUpcoming();
  }

  function setBossPassive(v) {
    state.world.boss.passive = !!v;
    if (!v && state.world.boss.state === 'grounded') {
      // A passive boss that is woken up near the tank engages immediately.
      if (!tankRole && ghostInBossRange(script.boss.meleeRange + 1)) engage('ghost');
      else if (playerInBossRange(script.boss.meleeRange + 1)) engage('player');
    }
  }

  function drainEvents() { const e = state.events; state.events = []; return e; }

  // ------------------------------------------------------------ init
  state.world.boss.passive = !!opts.bossPassive;
  const startIdx = Math.max(0, script.phases.findIndex((p) => p.id === opts.startPhase));
  const startDef = script.phases[startIdx];
  const elapsed = opts.startOffset < 0 ? Math.max(0, phaseDuration(startDef) + opts.startOffset) : opts.startOffset;
  state.phaseDef = startDef; state.phase = startDef.id;
  teleport(opts.start);
  enterPhase(startIdx, elapsed);
  if (opts.start === 'wall') spawnExpectationsFor('engage', state.phase);
  buildUpcoming();
  buildNextExpected();

  return {
    state, script, options: opts,
    step, drainEvents, teleport, setPhase, setBossPassive,
    triggerAction: (id) => {
      if (startAction(id, true)) return true;
      state.pendingTrigger = { id, until: state.t + 12 };
      return false;
    },
    end,
    threatRatio: () => threatRatio(state.threat, threatCfg, tankRole),
  };
}
