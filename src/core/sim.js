// The simulation. Fixed-timestep, deterministic, no DOM. `createSim` returns an
// object with `state`, `step(cmd, dt)` and a few control methods used by the
// tutorial, drills and phase-skip. Everything observable is in `state`; events
// for audio/HUD are queued in `state.events` and drained by the host.

import { rad, dist, angleTo, inCone, angleDelta, lerp, clamp } from './geometry.js';
import { createRng } from './rng.js';
import { createThreat, tickThreat, applyTaunt, applyBuffet, applyAggroPull, resetThreat, selectTarget, threatRatio } from './threat.js';
import { createCues, planCues, onCueEvent, onCuePress, clearPendingCues } from './presscues.js';
import { createLane, createCracks, pulseCracks, updateHazards, hazardAt } from './hazards.js';
import { buildSchedule, dueActions, upcoming as scheduleUpcoming } from './scheduler.js';
import { createInstance, resolve } from './scoring.js';
import { runCheck, playerAtSpot, bossAtSpot, bossFacingRaid, nearWall } from './expectations.js';
import {
  createPlayer, updatePlayer, knockback, createBoss, updateBoss, beginTakeoff, beginLanding,
  createRaid, setRaidSpot, updateRaid, spawnWhelps, updateWhelps, pickupWhelps,
} from './entities.js';
import { idealPlayerPos, idealBossPos, createGhost, updateGhost } from './ideal.js';

export const FIXED_DT = 1 / 60;

const DEFAULTS = {
  role: 'mt',             // 'mt' | 'offtank'
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

export function createSim(script, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const rng = createRng(opts.seed);

  const state = {
    t: 0, tick: 0, seed: opts.seed, rng,
    role: opts.role,
    ended: false, result: null, endedAt: null,
    phase: null, phaseIndex: -1, phaseDef: null, phaseName: '', phaseSubtitle: '', phaseStart: 0, phaseEnd: 0, hp: 1,
    phasesPlayed: [],
    world: {
      player: createPlayer(script, script.positions.playerStart),
      boss: createBoss(script, script.positions.bossStart),
      raid: createRaid(script, rng, script.positions.raidWait),
      whelps: [],
      hazards: [],
      projectiles: [],
      ghost: createGhost(script, script.positions.playerStart),
      idealPlayer: { x: 0, y: 0, reason: 'wait' },
      idealBoss: null,
      coneFlash: { breath: -Infinity, cleave: -Infinity, tail: -Infinity, buffet: -Infinity },
    },
    threat: createThreat(),
    abilities: {
      gcdUntil: -Infinity,
      readyAt: Object.fromEntries(Object.keys(script.playerAbilities).map((k) => [k, -Infinity])),
    },
    cues: createCues(),                                      // press cues (see presscues.js)
    schedule: [],
    upcoming: [],
    expectations: [],      // every instance, all phases (the scoring log)
    metrics: {},
    phaseMetrics: {},
    feedback: { facingWrong: false, inHazard: false, lastTick: null, toast: null },
    nextExpected: null,
    events: [],
    landedAt: null,
    engagedAt: null,
    lastTurnAt: null,       // last time she turned from the tank onto the raid
    lastRegainAt: null,     // last time she came back onto the tank
    duration: opts.duration,
    pendingTrigger: null,   // { id, until } action requested while the boss was mid-transition
  };

  const threatCfg = {
    raidPerSecond: script.raid.threatPerSecond,
    autoAttackPerSecond: script.threat.autoAttackPerSecond,
    tauntBonus: script.threat.tauntBonus,
    tauntLead: script.threat.tauntLead,
    tauntDuration: script.threat.tauntDuration,
    pullMultiplier: script.threat.pullMultiplier,
  };

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
    (state.phaseDef ? state.phaseDef.expectations : []).filter((e) => !e.role || e.role === state.role);

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
    if (b.engaged || def.bossState === 'airborne') setRaidSpot(w.raid, script.positions[def.raidSpot]);

    // Boss state transitions.
    if (def.bossState === 'airborne' && (b.state === 'grounded')) {
      beginTakeoff(state, script);
      emit('action', { id: 'takeoff', label: script.actions.takeoff.label });
      b.engaged = true;
    } else if (def.bossState === 'grounded' && (b.state === 'airborne' || b.state === 'takeoff')) {
      beginLanding(state, script);
      b.engaged = true;
      b.target = 'raid';
    }

    // Cracks live only in phase 3.
    w.hazards = w.hazards.filter((h) => h.kind !== 'crack');
    if (def.bossState === 'grounded') { w.hazards = w.hazards.filter((h) => h.kind !== 'lane'); b.hover = null; b.faceAlong = null; }
    if (def.id === 3) w.hazards.push(...createCracks(script.eruptionCracks));

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

  /** An action event happened: create onEvent / afterEvent instances. */
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

  function engage() {
    const b = state.world.boss;
    if (b.engaged) return;
    b.engaged = true;
    b.target = 'player';
    state.threat.player = Math.max(state.threat.player, 10);
    state.engagedAt = state.t;
    setRaidSpot(state.world.raid, script.positions[state.phaseDef.raidSpot]);
    emit('engage');
    spawnExpectationsFor('engage', state.phase);
  }

  function anyoneBehind() {
    const b = state.world.boss, c = script.boss.cones.tail, back = b.heading + Math.PI;
    const p = state.world.player;
    if (inCone(p.x, p.y, b.x, b.y, back, rad(c.angle), c.range)) return true;
    for (const d of state.world.raid.dots) if (inCone(d.x, d.y, b.x, b.y, back, rad(c.angle), c.range)) return true;
    return false;
  }

  /** Try to start a boss action. Returns true if it started (or resolved). */
  function startAction(id, force = false) {
    const def = script.actions[id];
    const b = state.world.boss;
    if (!def) return false;
    if (def.requires === 'grounded' && (b.state !== 'grounded' || (!b.engaged && !force) || b.passive)) return false;
    if (def.requires === 'airborne' && b.state !== 'airborne') return false;
    if (id === 'deepBreath' && !opts.freezeHp && state.phaseEnd - state.t < def.warning + def.active + 2) return false;
    if (def.conditional === 'behind' && !anyoneBehind()) return false;
    if (def.conditional === 'onPlayer' && (b.target !== 'player' || state.threat.tauntUntil > state.t)) return false;
    if (def.cast > 0) {
      if (b.cast) return false;
      b.cast = { id, label: def.label, icon: def.icon, start: state.t, end: state.t + def.cast };
      emit('cast', { id, label: def.label, castTime: def.cast });
      return true;
    }
    resolveAction(id);
    return true;
  }

  /** Who is inside a cone. Melee dots are skipped for cleave/tail: their flank
   *  positioning is the raid's job, not the tank's. */
  function coneHits(coneId, headingOffset = 0) {
    const b = state.world.boss, c = script.boss.cones[coneId];
    const p = state.world.player;
    const h = b.heading + headingOffset;
    const player = inCone(p.x, p.y, b.x, b.y, h, rad(c.angle), c.range);
    const includeMelee = coneId === 'breath';
    let raid = 0;
    for (const d of state.world.raid.dots) {
      if (d.melee && !includeMelee) continue;
      if (inCone(d.x, d.y, b.x, b.y, h, rad(c.angle), c.range)) raid++;
    }
    return { player, raid };
  }

  function resolveAction(id) {
    const def = script.actions[id];
    const w = state.world, b = w.boss, p = w.player;
    switch (id) {
      case 'flameBreath': {
        const hit = coneHits('breath');
        w.coneFlash.breath = state.t;
        if (hit.player) damagePlayer(def.damage, id);
        if (hit.raid) { addMetric('raidBreathHits', 1); toast('Flame Breath hit the raid', 'bad'); }
        break;
      }
      case 'cleave': {
        const hit = coneHits('cleave');
        w.coneFlash.cleave = state.t;
        if (hit.player) damagePlayer(def.damage, id);
        if (hit.raid && !raidHitsExcused()) addMetric('raidCleaveHits', 1);
        break;
      }
      case 'tailSweep': {
        const hit = coneHits('tail', Math.PI);
        w.coneFlash.tail = state.t;
        if (hit.player) { damagePlayer(def.damage, id); knockback(p, b.x, b.y, def.knockback, state.t); emit('knockback', { source: id }); }
        if (hit.raid && !raidHitsExcused()) addMetric('raidTailHits', 1);
        break;
      }
      case 'wingBuffet': {
        w.coneFlash.buffet = state.t;
        const d = bossRangeTo(p.x, p.y);
        const front = Math.abs(angleDelta(b.heading, angleTo(b.x, b.y, p.x, p.y))) <= Math.PI / 2;
        if (d <= def.knockbackRange && front) {
          const offWall = !nearWall(state, script);
          knockback(p, b.x, b.y, def.knockback, state.t);
          applyBuffet(state.threat, script.threat.buffetCut);
          if (offWall) { addMetric('buffetsOffWall', 1); toast('Buffeted away from the wall', 'bad'); }
          emit('knockback', { source: id, offWall });
        }
        break;
      }
      case 'fireball': {
        const dots = w.raid.dots;
        const target = rng.next() < 0.12 ? p : rng.pick(dots);
        w.projectiles.push({ x0: b.x, y0: b.y, z0: b.z, tx: target.x, ty: target.y, t0: state.t, t1: state.t + def.travel, splash: def.splash });
        break;
      }
      case 'deepBreath': {
        const lane = rng.pick(script.deepBreathLanes);
        const h = createLane(lane, def, state.t);
        w.hazards.push(h);
        b.hover = { x: lane.from[0], y: lane.from[1] };
        b.faceAlong = angleTo(lane.from[0], lane.from[1], lane.to[0], lane.to[1]);
        emit('hazardWarn', { kind: 'lane', id: lane.id, label: def.label, in: def.warning });
        return; // the 'action' event fires when the lane goes active
      }
      case 'whelpWave': spawnWhelps(state, script, def); break;
      case 'bellowingRoar': {
        p.fearedUntil = state.t + script.player.fearDuration;
        p.wanderTimer = 0;
        emit('feared', { duration: script.player.fearDuration });
        toast('Feared', 'bad');
        break;
      }
      case 'aggroPull': {
        // A DPS overtakes the tank on the threat table; she turns on the next threat tick.
        applyAggroPull(state.threat, def.threatMultiplier || 1.15);
        toast('A DPS pulled aggro', 'warn');
        break;
      }
      case 'eruption': {
        pulseCracks(w.hazards, def, state.t);
        emit('hazardWarn', { kind: 'crack', label: def.label, in: def.warning });
        break;
      }
      default: break;
    }
    emit('action', { id, label: def.label });
    onActionEvent(id);
    spawnExpectationsFor(id, state.phase);
    for (const beat of onCueEvent(state, script, id, state.t)) emitBeat(beat);
  }

  function onLanded() {
    const b = state.world.boss;
    state.landedAt = state.t;
    if (script.threat.resetOnLanding) { resetThreat(state.threat); state.threat.raid = script.threat.landingRaidThreat || 0; }   // healers and DPS are already on her table
    b.target = 'raid';
    b.engaged = true;
    emit('action', { id: 'landing', label: script.actions.landing.label });
    onActionEvent('landing');
    for (const beat of onCueEvent(state, script, 'landing', state.t)) emitBeat(beat);
    spawnExpectationsFor('landing', state.phase);
  }

  // ------------------------------------------------------------ player abilities

  function useAbility(id) {
    const def = script.playerAbilities[id];
    if (!def) return;
    const A = state.abilities, p = state.world.player, b = state.world.boss;
    const fail = (reason, text) => {
      emit('abilityFailed', { id, reason });
      if (text) toast(text, 'warn');
      onCuePress(state, script, id, state.t, reason);
    };
    if (p.fearedUntil > state.t) return fail('feared', 'Feared');
    if (A.readyAt[id] > state.t) return fail('cooldown');
    if (def.gcd && A.gcdUntil > state.t) return fail('gcd');

    switch (id) {
      case 'taunt': {
        if (b.state === 'grounded' && !b.passive && playerInBossRange(def.range)) {
          engage();
          applyTaunt(state.threat, state.t, threatCfg);
          if (b.target !== 'player') { b.target = 'player'; state.lastRegainAt = state.t; emit('threatRegained', { by: 'taunt' }); }
        } else if (state.role === 'offtank' && pickupWhelps(state, script, def.range) > 0) {
          onWhelpPickup();
        } else return fail('range', b.state === 'grounded' ? 'Out of range' : 'She is in the air');
        break;
      }
      default: break;
    }
    A.readyAt[id] = state.t + def.cooldown;
    if (def.gcd) A.gcdUntil = state.t + script.gcd;
    emit('abilityUsed', { id, label: def.label });
    const beat = onCuePress(state, script, id, state.t, 'ok');
    if (beat) emitBeat(beat);
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
      if (!def || def.conditional) continue;
      list.push({ id: u.id, label: def.label, icon: def.icon, at: u.at, in: u.in, warn: !!def.warn, cue: def.cue });
    }
    for (const h of state.world.hazards) {
      if (h.state !== 'warning') continue;
      const id = h.kind === 'lane' ? 'deepBreath' : 'eruption';
      const def = script.actions[id];
      if (!list.some((x) => x.id === id)) list.push({ id, label: def.label, icon: def.icon, at: h.activeAt, in: h.activeAt - state.t, warn: true, cue: def.cue, hazard: true });
    }
    const next = script.phases[state.phaseIndex + 1];
    if (next && !opts.freezeHp && !opts.duration) {
      const id = next.bossState === 'airborne' ? 'takeoff' : 'landing';
      const at = state.phaseEnd + (id === 'landing' ? script.boss.landingDuration : 0);
      if (at - state.t <= horizon) list.push({ id, label: script.actions[id].label, icon: script.actions[id].icon, at, in: at - state.t, warn: true, cue: script.actions[id].cue, phase: true });
    } else if (opts.duration && state.phaseDef && state.phaseDef.bossState === 'airborne' && next) {
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
    // Urgent corrections first, then a near deadline, then hints, then far deadlines.
    if (fb.facingWrong) { state.nextExpected = { label: 'Turn her away from the raid', kind: 'fix' }; return; }
    if (ideal.reason === 'dodgeLane') { state.nextExpected = { label: 'Step out of the lane', kind: 'fix' }; return; }
    if (fb.inHazard) { state.nextExpected = { label: 'Get off the crack', kind: 'fix' }; return; }
    if (b.state === 'grounded' && b.engaged && !b.passive && b.target !== 'player') { state.nextExpected = { label: 'Taunt. She is on the raid', kind: 'fix' }; return; }
    if (ideal.reason === 'whelps') { state.nextExpected = { label: 'Pick up the whelps', kind: 'fix' }; return; }
    if (soon) { state.nextExpected = expectation; return; }
    if (ideal.reason === 'approach') { state.nextExpected = { label: 'Taunt her and pull to the wall', kind: 'hint' }; return; }
    if (state.world.idealBoss && !state.world.idealBoss.satisfied && b.engaged) { state.nextExpected = { label: 'Move her onto the wall spot, facing the wall', kind: 'fix' }; return; }
    if (ideal.reason === 'holdWhelps') { state.nextExpected = { label: 'Hold the whelps away from the raid', kind: 'hold' }; return; }
    if (expectation) { state.nextExpected = expectation; return; }
    const nextWarn = state.upcoming.find((u) => u.warn);
    if (nextWarn) { state.nextExpected = { label: `Hold position. ${nextWarn.label} in ${Math.ceil(nextWarn.in)}s`, kind: 'hold' }; return; }
    state.nextExpected = { label: 'Hold position', kind: 'hold' };
  }

  // ------------------------------------------------------------ main step

  function step(cmd = {}, dt = FIXED_DT) {
    if (state.ended) return;
    state.t += dt;
    state.tick++;
    const w = state.world, b = w.boss, p = w.player;

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

    // Proximity engage: walking into melee range wakes her up.
    if (!b.engaged && !b.passive && b.state === 'grounded' && playerInBossRange(script.boss.meleeRange + 1)) engage();

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
    const live = b.state === 'grounded' && b.engaged && !b.passive;
    const attacking = live && playerInBossRange(script.boss.meleeRange + 1) && p.fearedUntil <= state.t;
    // The raid holds its damage for a few seconds after the pull (not after a landing).
    const raidHolding = state.engagedAt != null && state.landedAt == null && state.t - state.engagedAt < script.raid.holdAfterPull;
    tickThreat(state.threat, dt, threatCfg, live && !raidHolding, attacking);
    if (live) {
      const prev = b.target;
      b.target = selectTarget(state.threat, b.target, state.t, threatCfg);
      if (prev === 'player' && b.target === 'raid') { addMetric('threatLostCount', 1); state.lastTurnAt = state.t; emit('threatLost'); toast('She turned on the raid. Taunt!', 'bad'); for (const beat of onCueEvent(state, script, 'threatLost', state.t)) emitBeat(beat); }
      else if (prev === 'raid' && b.target === 'player') { state.lastRegainAt = state.t; emit('threatRegained', { by: 'threat' }); }
      if (b.target === 'player' && state.landedAt != null && state.metrics.pickupTime == null && state.phase === 3) {
        setMetric('pickupTime', state.t - state.landedAt);
      }
      // Melee swings.
      if (state.t >= b.nextMelee && !b.cast) {
        if (b.target === 'player' && playerInBossRange(script.boss.meleeRange + 1)) { damagePlayer(script.boss.meleeDamage, 'melee'); b.lastHit = state.t; b.nextMelee = state.t + script.boss.meleeInterval; }
        else if (b.target === 'raid' && dist(b.x, b.y, w.raid.anchor.x, w.raid.anchor.y) <= script.boss.meleeRange + 6) { b.lastHit = state.t; b.nextMelee = state.t + script.boss.meleeInterval; }
      }
    }

    // Raid, whelps, projectiles.
    updateRaid(state, script, dt);
    if (state.role === 'offtank' && p.fearedUntil <= state.t) {
      if (pickupWhelps(state, script, script.actions.whelpWave.aggroRange) > 0) onWhelpPickup();
    }
    const wf = updateWhelps(state, script, dt);
    if (wf.onRaid && state.role === 'offtank') addMetric('whelpsOnRaid', dt);
    for (let i = w.projectiles.length - 1; i >= 0; i--) if (state.t > w.projectiles[i].t1 + 0.7) w.projectiles.splice(i, 1);

    // Hazards.
    for (const tr of updateHazards(w.hazards, state.t)) {
      const h = tr.hazard;
      if (tr.to === 'active') {
        emit('hazardActive', { kind: h.kind, label: h.label });
        if (h.kind === 'lane') { emit('action', { id: 'deepBreath', label: h.label }); onActionEvent('deepBreath'); }
      } else if (tr.to === 'ended' && h.kind === 'lane') {
        b.hover = { ...script.positions.hoverIdle };
        b.faceAlong = null;
      }
    }
    let inHazard = false;
    for (const h of w.hazards) {
      const inside = hazardAt([h], p.x, p.y);
      if (!inside) continue;
      if (h.kind === 'lane' && h.state === 'active') {
        addMetric('playerInLane', dt);
        inHazard = true;
        if (!h.hitPlayer) { h.hitPlayer = true; damagePlayer(h.damage, 'deepBreath'); }
      } else if (h.kind === 'crack') {
        addMetric('playerInCrack', dt);
        inHazard = true;
        if (h.state === 'active' && !h.hitPlayer) { h.hitPlayer = true; damagePlayer(h.damage, 'eruption'); }
      }
    }
    state.feedback.inHazard = inHazard;

    // Continuous metrics.
    if (live) {
      // Facing is not held against the tank during the pull and the landing pickup window:
      // she is expected to be facing the wrong way until the tank has her.
      const facing = bossFacingRaid(state, script);
      state.feedback.facingWrong = facing;
      if (facing && !raidHitsExcused()) addMetric('bossFacingRaid', dt);
      const c = script.boss.cones.tail;
      if (inCone(p.x, p.y, b.x, b.y, b.heading + Math.PI, rad(c.angle), c.range)) addMetric('playerInTail', dt);
    } else state.feedback.facingWrong = false;

    // Expectations, ideal positions, ghost, HUD data.
    updateExpectations();
    w.idealPlayer = idealPlayerPos(state, script);
    w.idealBoss = idealBossPos(state, script);
    updateGhost(state, script, dt);
    buildUpcoming();
    buildNextExpected();

    // Press cues whose window closed.
    for (const beat of planCues(state, state.t)) emitBeat(beat);

    if (opts.duration != null && state.t >= opts.duration) end('drillComplete');
  }

  // ------------------------------------------------------------ control API

  /** Reset positions to a named preset. */
  function teleport(preset) {
    const P = script.positions, w = state.world, b = w.boss;
    w.whelps = []; w.projectiles = [];
    w.hazards = w.hazards.filter((h) => h.kind === 'crack');
    w.player.knock = null; w.player.fearedUntil = -Infinity; w.player.hp = w.player.maxHp; w.player.z = 0; w.player.vz = 0;
    if (preset === 'wall') {
      Object.assign(w.player, { x: P.tankSpot.x, y: P.tankSpot.y, heading: rad(270) });
      Object.assign(b, { x: P.bossSpot.x, y: P.bossSpot.y, z: 0, heading: rad(P.bossSpot.heading), state: 'grounded', engaged: true, target: 'player', cast: null, transition: null });
      state.threat.player = 6000; state.threat.raid = 3000;
      state.engagedAt = state.t;
      setRaidSpot(w.raid, P[state.phaseDef ? state.phaseDef.raidSpot : 'raidSpotP1']);
      w.raid.anchor = { ...w.raid.anchorTarget };
      for (const d of w.raid.dots) { d.x = w.raid.anchor.x + d.ox * w.raid.spread; d.y = w.raid.anchor.y + d.oy * w.raid.spread; }
    } else if (preset === 'pickup') {
      Object.assign(w.player, { x: P.pickupSpot.x, y: P.pickupSpot.y, heading: rad(270) });
      Object.assign(b, { x: P.hoverIdle.x, y: P.hoverIdle.y, z: script.hoverHeight, heading: rad(270), state: 'airborne', engaged: true, target: null, cast: null, transition: null, hover: { x: P.hoverIdle.x, y: P.hoverIdle.y } });
      resetThreat(state.threat);
      setRaidSpot(w.raid, P.raidSpotP2);
      w.raid.anchor = { ...w.raid.anchorTarget };
      for (const d of w.raid.dots) { d.x = w.raid.anchor.x + d.ox * w.raid.spread; d.y = w.raid.anchor.y + d.oy * w.raid.spread; }
    } else {
      Object.assign(w.player, { x: P.playerStart.x, y: P.playerStart.y, heading: rad(P.playerStart.heading) });
      Object.assign(b, { x: P.bossStart.x, y: P.bossStart.y, z: 0, heading: rad(P.bossStart.heading), state: 'grounded', engaged: false, target: null, cast: null, transition: null });
      resetThreat(state.threat);
      setRaidSpot(w.raid, P.raidWait);
      w.raid.anchor = { ...w.raid.anchorTarget };
      for (const d of w.raid.dots) { d.x = w.raid.anchor.x + d.ox * w.raid.spread; d.y = w.raid.anchor.y + d.oy * w.raid.spread; }
    }
    Object.assign(w.ghost, { x: w.player.x, y: w.player.y, heading: w.player.heading });
    w.idealPlayer = idealPlayerPos(state, script);
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
      // A passive boss that is woken up near the player engages immediately.
      if (playerInBossRange(script.boss.meleeRange + 1)) engage();
    }
  }

  function drainEvents() { const e = state.events; state.events = []; return e; }

  // ------------------------------------------------------------ init
  state.world.boss.passive = !!opts.bossPassive;
  const startIdx = Math.max(0, script.phases.findIndex((p) => p.id === opts.startPhase));
  const startDef = script.phases[startIdx];
  const elapsed = opts.startOffset < 0 ? Math.max(0, phaseDuration(startDef) + opts.startOffset) : opts.startOffset;
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
    threatRatio: () => threatRatio(state.threat, threatCfg),
  };
}
