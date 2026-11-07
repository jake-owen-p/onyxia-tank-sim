// Entity updates: player, boss, ghost raid, ghost tank and adds. Each function
// mutates `state.world` for one fixed timestep and returns nothing (or a small
// flag object the sim turns into events). No DOM, no rendering concerns.

import {
  rad, dist, angleTo, turnToward, moveWithCollision, onFloor, offsetPoint, clamp, lerp, normAngle,
} from './geometry.js';

// ---------------------------------------------------------------- player

export function createPlayer(script, pos) {
  return {
    x: pos.x, y: pos.y, heading: rad(pos.heading ?? 90),
    hp: script.player.hp, maxHp: script.player.hp,
    fearedUntil: -Infinity, wanderTimer: 0,
    knock: null,            // { vx, vy, until }
    moving: false, backpedal: false, speed: 0,
    z: 0, vz: 0,            // jump height and vertical speed (yards, yards/s)
  };
}

/**
 * Apply movement commands. `cmd` = { forward, strafe, turn, mouseTurn, jump }.
 * turn: +1 turns left (counter-clockwise, heading increases). forward: +1 = ahead.
 * jump: true on the tick the key was pressed. Returns { jumped } for the event.
 */
export function updatePlayer(state, script, cmd, dt, rng) {
  const p = state.world.player;
  const cfg = script.player;
  const floors = script.arena.floor;
  let dx = 0, dy = 0;
  const flags = {};

  // Jump: a fixed arc (height h over duration T): v0 = 4h/T, g = 8h/T^2. Air control is full, like WoW.
  const J = cfg.jump || { height: 1.4, duration: 0.8 };
  if (cmd.jump && p.z <= 0 && p.fearedUntil <= state.t) { p.vz = (4 * J.height) / J.duration; p.z = 1e-6; flags.jumped = true; }
  if (p.z > 0) {
    p.z += p.vz * dt;
    p.vz -= ((8 * J.height) / (J.duration * J.duration)) * dt;
    if (p.z <= 0) { p.z = 0; p.vz = 0; }
  }

  if (p.fearedUntil > state.t) {
    // Feared: stumble around in random directions.
    p.wanderTimer -= dt;
    if (p.wanderTimer <= 0) {
      p.heading = normAngle(p.heading + rng.range(-1.6, 1.6));
      p.wanderTimer = rng.range(0.35, 0.8);
    }
    dx = Math.cos(p.heading) * cfg.fearSpeed * dt;
    dy = Math.sin(p.heading) * cfg.fearSpeed * dt;
    p.moving = true; p.backpedal = false;
  } else {
    p.heading = normAngle(p.heading + (cmd.turn || 0) * rad(cfg.turnRate) * dt + (cmd.mouseTurn || 0));
    const fwd = clamp(cmd.forward || 0, -1, 1);
    const str = clamp(cmd.strafe || 0, -1, 1);
    let vx = 0, vy = 0;
    if (fwd || str) {
      const c = Math.cos(p.heading), s = Math.sin(p.heading);
      // right-hand vector is heading - 90deg
      vx = c * fwd + s * str;
      vy = s * fwd - c * str;
      const l = Math.hypot(vx, vy) || 1;
      const speed = fwd < 0 && !str ? cfg.speed * 0.65 : cfg.speed; // backpedalling is slower, like WoW
      vx = (vx / l) * speed; vy = (vy / l) * speed;
    }
    dx = vx * dt; dy = vy * dt;
    p.moving = !!(fwd || str);
    p.backpedal = fwd < 0;
  }

  if (p.knock && state.t < p.knock.until) {
    const k = clamp((p.knock.until - state.t) / p.knock.duration, 0, 1); // ease out
    dx += p.knock.vx * k * dt;
    dy += p.knock.vy * k * dt;
  } else if (p.knock) {
    p.knock = null;
  }

  if (dx || dy) {
    const r = moveWithCollision(p.x, p.y, dx, dy, floors);
    p.x = r.x; p.y = r.y;
  }
  p.speed = Math.hypot(dx, dy) / (dt || 1);
  p.hp = Math.min(p.maxHp, p.hp + cfg.healPerSecond * dt);
  return flags;
}

/** Push the player directly away from (fx,fy) by `distance` yards over `duration` seconds starting at time t. */
export function knockback(player, fx, fy, distance, t, duration = 0.5) {
  const a = angleTo(fx, fy, player.x, player.y);
  // The ease-out factor k integrates to duration/2, so v * duration / 2 = distance.
  const v = (distance * 2) / duration;
  player.knock = { vx: Math.cos(a) * v, vy: Math.sin(a) * v, until: t + duration, duration };
  return a;
}

// ------------------------------------------------------------------ boss

export function createBoss(script, pos) {
  return {
    x: pos.x, y: pos.y, z: 0, heading: rad(pos.heading ?? 270),
    state: 'grounded',            // grounded | takeoff | airborne | landing
    target: null,                 // 'player' | 'raid' | 'ghost' | null
    engaged: false, passive: false,
    cast: null,                   // { id, label, start, end }
    hover: null,                  // { x, y } flight destination while airborne
    faceAlong: null,              // heading to hold while hovering at a lane start
    transition: null,             // { start, end, fromX, fromY, fromZ, toX, toY, toZ, toHeading }
    nextMelee: 0,
    lastHit: -Infinity,           // time of her last melee swing (render flash)
    landedAt: null,               // time she last touched down (settle window)
  };
}

/** The point the boss is attacking: the player, the ghost tank or the raid anchor. */
export function bossTargetPos(state) {
  const w = state.world, b = w.boss;
  if (b.target === 'raid') return w.raid.anchor;
  if (b.target === 'ghost') return w.ghost;
  return w.player;
}

/** Advance boss movement/flight. Returns { landed: true } the tick she touches down. */
export function updateBoss(state, script, dt) {
  const b = state.world.boss;
  const cfg = script.boss;
  const w = state.world;
  const flags = {};

  if (b.state === 'grounded') {
    if (!b.engaged || b.passive || b.cast) return flags;
    const tgt = bossTargetPos(state);
    const d = dist(b.x, b.y, tgt.x, tgt.y);
    const want = angleTo(b.x, b.y, tgt.x, tgt.y);
    b.heading = turnToward(b.heading, want, rad(cfg.turnRate) * dt);
    // She settles for a moment after landing (turns, but does not walk) so the tank has a window.
    const settling = b.landedAt != null && state.t - b.landedAt < (cfg.settleAfterLanding || 0);
    if (d > cfg.meleeRange && !settling && !cfg.stationary) {
      const step = Math.min(cfg.speed * dt, d - cfg.meleeRange);
      const nx = b.x + Math.cos(want) * step, ny = b.y + Math.sin(want) * step;
      if (onFloor(nx, ny, script.arena.floor)) { b.x = nx; b.y = ny; }
      else {
        // slide along whichever axis stays on the floor
        if (onFloor(nx, b.y, script.arena.floor)) b.x = nx;
        else if (onFloor(b.x, ny, script.arena.floor)) b.y = ny;
      }
    }
  } else if (b.state === 'takeoff' || b.state === 'landing') {
    const tr = b.transition;
    const k = clamp((state.t - tr.start) / (tr.end - tr.start), 0, 1);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease in-out
    b.x = lerp(tr.fromX, tr.toX, e);
    b.y = lerp(tr.fromY, tr.toY, e);
    b.z = lerp(tr.fromZ, tr.toZ, e);
    if (tr.toHeading != null) b.heading = turnToward(b.heading, tr.toHeading, rad(cfg.turnRate) * dt);
    if (k >= 1) {
      if (b.state === 'landing') { b.state = 'grounded'; b.z = 0; b.landedAt = state.t; flags.landed = true; }
      else { b.state = 'airborne'; b.hover = { x: b.x, y: b.y }; }
      b.transition = null;
    }
  } else if (b.state === 'airborne') {
    const h = b.hover;
    if (h) {
      const d = dist(b.x, b.y, h.x, h.y);
      const flySpeed = 16;
      if (d > 0.5) {
        const a = angleTo(b.x, b.y, h.x, h.y);
        const step = Math.min(flySpeed * dt, d);
        b.x += Math.cos(a) * step; b.y += Math.sin(a) * step;
        b.heading = turnToward(b.heading, a, rad(cfg.turnRate) * dt);
      } else if (b.faceAlong != null) {
        b.heading = turnToward(b.heading, b.faceAlong, rad(cfg.turnRate) * dt);
      } else {
        // idle hover: slowly face the raid
        const a = angleTo(b.x, b.y, w.raid.anchor.x, w.raid.anchor.y);
        b.heading = turnToward(b.heading, a, rad(cfg.turnRate * 0.3) * dt);
      }
    }
  }
  return flags;
}

export function beginTakeoff(state, script) {
  const b = state.world.boss;
  const hover = script.positions.hoverIdle;
  b.cast = null;
  b.state = 'takeoff';
  b.transition = {
    start: state.t, end: state.t + script.boss.takeoffDuration,
    fromX: b.x, fromY: b.y, fromZ: 0,
    toX: hover.x, toY: hover.y, toZ: script.hoverHeight,
    toHeading: null,
  };
}

export function beginLanding(state, script) {
  const b = state.world.boss;
  const land = script.positions.landSpot;
  b.cast = null;
  b.hover = null; b.faceAlong = null;
  b.state = 'landing';
  b.transition = {
    start: state.t, end: state.t + script.boss.landingDuration,
    fromX: b.x, fromY: b.y, fromZ: b.z,
    toX: land.x, toY: land.y, toZ: 0,
    toHeading: rad(land.heading),
  };
}

// ------------------------------------------------------------------ raid

export function createRaid(script, rng, anchorSpot) {
  const dots = [];
  for (let i = 0; i < script.raid.size; i++) {
    const melee = i < script.raid.melee;
    // Fixed random offsets in a unit disc, scaled per phase by `spread`.
    const a = rng.range(0, Math.PI * 2), r = Math.sqrt(rng.next());
    dots.push({
      x: anchorSpot.x, y: anchorSpot.y,
      ox: Math.cos(a) * r, oy: Math.sin(a) * r,
      melee, side: i % 2 ? -1 : 1, slot: (Math.floor(i / 2) - 2) * 1.6,
      tx: anchorSpot.x, ty: anchorSpot.y,
    });
  }
  return {
    anchor: { x: anchorSpot.x, y: anchorSpot.y },
    anchorTarget: { x: anchorSpot.x, y: anchorSpot.y },
    spread: anchorSpot.spread || 10,
    dots,
  };
}

export function setRaidSpot(raid, spot) {
  raid.anchorTarget = { x: spot.x, y: spot.y };
  raid.spread = spot.spread || 10;
}

export function updateRaid(state, script, dt) {
  const r = state.world.raid;
  const b = state.world.boss;
  const speed = 7.5;
  // anchor eases toward its target
  const da = dist(r.anchor.x, r.anchor.y, r.anchorTarget.x, r.anchorTarget.y);
  if (da > 0.1) {
    const a = angleTo(r.anchor.x, r.anchor.y, r.anchorTarget.x, r.anchorTarget.y);
    const step = Math.min(speed * dt, da);
    r.anchor.x += Math.cos(a) * step; r.anchor.y += Math.sin(a) * step;
  }
  const meleeOnBoss = b.state === 'grounded' && b.engaged && !b.passive;
  for (const d of r.dots) {
    if (d.melee && meleeOnBoss) {
      const p = offsetPoint(b.x, b.y, b.heading, d.slot, d.side * script.raid.meleeFlankDistance);
      d.tx = p.x; d.ty = p.y;
    } else {
      const s = d.melee ? r.spread * 0.6 : r.spread;
      d.tx = r.anchor.x + d.ox * s; d.ty = r.anchor.y + d.oy * s;
    }
    const dd = dist(d.x, d.y, d.tx, d.ty);
    if (dd > 0.05) {
      const a = angleTo(d.x, d.y, d.tx, d.ty);
      const step = Math.min(speed * dt, dd);
      d.x += Math.cos(a) * step; d.y += Math.sin(a) * step;
    }
  }
}

// ------------------------------------------------------------ ghost tank

/**
 * The ghost tank. In the tank roles it is a translucent guide that walks the
 * correct route ahead of the player. In every other role it is the raid's
 * actual tank: it holds the boss, takes her hits and has a health pool the
 * healer keeps up.
 */
export function createGhost(script, pos) {
  const hp = (script.ghostTank && script.ghostTank.hp) || script.player.hp;
  return { x: pos.x, y: pos.y, heading: rad(pos.heading ?? 90), moving: false, backpedal: false, hp, maxHp: hp, tanking: false };
}

/**
 * Move the ghost toward `ideal` at its own pace. It faces the boss when
 * standing or dragging, and its travel direction while walking to a spot
 * before the pull.
 */
export function updateGhost(state, script, dt, ideal) {
  const g = state.world.ghost;
  const b = state.world.boss;
  const cfg = script.ghostTank;
  const d = dist(g.x, g.y, ideal.x, ideal.y);
  let faceTarget;
  const holding = b.state === 'grounded' && b.engaged && (b.target === 'ghost' || (b.target === 'player' && !g.tanking));
  if (d > 0.3) {
    const a = angleTo(g.x, g.y, ideal.x, ideal.y);
    const step = Math.min(cfg.speed * dt, d);
    const r = moveWithCollision(g.x, g.y, Math.cos(a) * step, Math.sin(a) * step, script.arena.floor);
    g.x = r.x; g.y = r.y;
    g.moving = true;
    g.backpedal = holding;
    faceTarget = holding ? angleTo(g.x, g.y, b.x, b.y) : a;
  } else {
    g.moving = false; g.backpedal = false;
    if (b.state === 'grounded') faceTarget = angleTo(g.x, g.y, b.x, b.y);
    else { const l = script.positions.landSpot || b; faceTarget = angleTo(g.x, g.y, l.x, l.y); }
  }
  g.heading = turnToward(g.heading, normAngle(faceTarget), rad(cfg.turnRate) * dt);
  if (g.tanking) {
    const heal = state.role === 'healer' ? (cfg.healPerSecondWithPlayerHealer ?? cfg.healPerSecond ?? 0) : (cfg.healPerSecond ?? script.player.healPerSecond);
    g.hp = Math.min(g.maxHp, g.hp + heal * dt);
  }
}

// ---------------------------------------------------------------- adds

let addUid = 0;

/**
 * Spawn one wave of adds from the named spots. `pickup` says which role takes
 * them: the player when their role matches, otherwise the ghost off-tank.
 */
export function spawnAdds(state, script, actionDef) {
  const rng = state.rng;
  const spots = (actionDef.from || []).map((name) => script.positions[name]).filter(Boolean);
  const playerPicks = state.role === (actionDef.pickup || 'offtank');
  for (const c of spots) {
    for (let i = 0; i < (actionDef.count || actionDef.perCave || 1); i++) {
      state.world.whelps.push({
        uid: ++addUid,
        x: c.x + rng.range(-3, 3), y: c.y + rng.range(-3, 3),
        heading: 0,
        target: playerPicks ? 'raid' : 'ghost',
        speed: actionDef.speed || 6,
        spawnedAt: state.t,
        lifetime: actionDef.lifetime || 28,
        diesAt: state.t + (playerPicks ? (actionDef.heldLifetime || 70) : (actionDef.lifetime || 28)),
        holdSpot: actionDef.holdSpot || 'ghostOfftankSpot',
        onRaid: false,
      });
    }
  }
}

/** Move adds toward their targets. Returns { onRaid: boolean } for metrics. */
export function updateWhelps(state, script, dt) {
  const w = state.world;
  const ws = w.whelps;
  let onRaid = false;
  for (let i = ws.length - 1; i >= 0; i--) {
    const wh = ws[i];
    if (state.t >= wh.diesAt) { ws.splice(i, 1); continue; }
    let tx, ty, stop;
    if (wh.target === 'player') { tx = w.player.x; ty = w.player.y; stop = 2.5 + (wh.uid % 3) * 0.6; }
    else if (wh.target === 'ghost') { const g = script.positions[wh.holdSpot] || w.ghost; tx = g.x + (wh.uid % 5) - 2; ty = g.y + (wh.uid % 3) - 1; stop = 1; }
    else {
      // head for the nearest raid dot
      let best = null, bd = Infinity;
      for (const d of w.raid.dots) { const dd = dist(wh.x, wh.y, d.x, d.y); if (dd < bd) { bd = dd; best = d; } }
      tx = best ? best.x : w.raid.anchor.x; ty = best ? best.y : w.raid.anchor.y; stop = 1.5;
    }
    const d = dist(wh.x, wh.y, tx, ty);
    if (d > stop) {
      const a = angleTo(wh.x, wh.y, tx, ty);
      wh.heading = a;
      const step = Math.min(wh.speed * dt, d - stop);
      wh.x += Math.cos(a) * step; wh.y += Math.sin(a) * step;
    }
    wh.onRaid = false;
    for (const dot of w.raid.dots) {
      if (dist(wh.x, wh.y, dot.x, dot.y) <= script.raid.whelpContactRange) { wh.onRaid = true; onRaid = true; break; }
    }
  }
  return { onRaid };
}

/** Loose adds within `range` of the player switch to the player and die on their normal timer. Returns how many did. */
export function pickupWhelps(state, script, range) {
  const p = state.world.player;
  let n = 0;
  for (const wh of state.world.whelps) {
    if (wh.target === 'raid' && dist(wh.x, wh.y, p.x, p.y) <= range) {
      wh.target = 'player';
      wh.diesAt = Math.min(wh.diesAt, state.t + wh.lifetime);
      n++;
    }
  }
  return n;
}
