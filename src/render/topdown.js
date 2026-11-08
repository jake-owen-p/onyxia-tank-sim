// Top-down "placement" view: a clean map of the lair with the correct tank
// spot, the correct boss position/facing as dotted ghost outlines, hazards with
// countdowns, and a glowing path from the player to where they should be.
// `drawMapWorld` is shared with the POV minimap.

import { rad, dist, polyCentroid } from '../core/geometry.js';
import {
  drawBossFlat, drawFigureFlat, drawWhelpFlat, tracePoly, conePoly, drawArrow,
} from './shapes.js';
import { withAlpha } from './palette.js';

const boundsCache = new WeakMap();

/** Arena bounds from the floor polygons (cached per script). */
export function arenaBounds(script) {
  let b = boundsCache.get(script);
  if (b) return b;
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const f of script.arena.floor) for (const [x, y] of f.poly) {
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
  }
  b = { minx, miny, maxx, maxy, w: maxx - minx, h: maxy - miny };
  boundsCache.set(script, b);
  return b;
}

/**
 * Fit the arena into a box. Returns { s, cx, cy, toScreen }: screen = (cx + s*x, cy - s*y).
 * `box` = { x, y, w, h } in pixels. North (+y) is up.
 */
export function mapTransform(script, box, pad = 0) {
  const b = arenaBounds(script);
  const s = Math.min((box.w - pad * 2) / b.w, (box.h - pad * 2) / b.h);
  const cx = box.x + box.w / 2 - s * (b.minx + b.maxx) / 2;
  const cy = box.y + box.h / 2 + s * (b.miny + b.maxy) / 2;
  return { s, cx, cy, toScreen: (x, y) => ({ x: cx + s * x, y: cy - s * y }) };
}

/** Full-screen top-down frame. Leaves breathing room for the HUD blocks. */
export function drawTopDown(ctx, view, script, settings, pal, w, h, now) {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));
  const box = { x: u * 2, y: u * 5.5, w: w - u * 4, h: h - u * 13 };
  const tr = mapTransform(script, box, u);
  drawMapWorld(ctx, view, script, settings, pal, tr, now, { compact: false });
}

/** Text in world space without the y-flip. `px` is the pixel size. */
function worldText(ctx, tr, str, x, y, px, color, font, align = 'center') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 / tr.s, -1 / tr.s);
  ctx.font = `600 ${px}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

/** Diagonal hatching clipped to a polygon (world space). */
function hatchPoly(ctx, poly, color, spacing, lineWidth) {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const [x, y] of poly) { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  ctx.save();
  ctx.beginPath();
  tracePoly(ctx, poly);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  const span = (maxx - minx) + (maxy - miny);
  for (let d = -span; d <= span; d += spacing) {
    ctx.moveTo(minx + d, miny);
    ctx.lineTo(minx + d + (maxy - miny), maxy);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw the whole world in map space. The ctx is left untouched on return.
 * `opts.compact` drops labels and grid detail for the minimap.
 */
export function drawMapWorld(ctx, view, script, settings, pal, tr, now, opts = {}) {
  const compact = !!opts.compact;
  const w = view.world;
  const t = view.t;
  const s = tr.s;
  const lw = (px) => px / s;                        // line width in world units for N pixels
  const B = arenaBounds(script);
  const R = script.boss.radius;
  const hazAlpha = settings.hazardOpacity ?? 0.7;

  ctx.save();
  ctx.translate(tr.cx, tr.cy);
  ctx.scale(s, -s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- floor
  ctx.fillStyle = pal.floor;
  for (const f of script.arena.floor) { ctx.beginPath(); tracePoly(ctx, f.poly); ctx.fill(); }

  // --- grid (clipped to the floor)
  ctx.save();
  ctx.beginPath();
  for (const f of script.arena.floor) tracePoly(ctx, f.poly);
  ctx.clip();
  const step = compact ? 20 : 10;
  ctx.lineWidth = lw(1);
  for (let x = Math.ceil(B.minx / step) * step; x <= B.maxx; x += step) {
    ctx.strokeStyle = x === 0 ? pal.gridMajor : pal.grid;
    ctx.beginPath(); ctx.moveTo(x, B.miny); ctx.lineTo(x, B.maxy); ctx.stroke();
  }
  for (let y = Math.ceil(B.miny / step) * step; y <= B.maxy; y += step) {
    ctx.strokeStyle = y === 0 ? pal.gridMajor : pal.grid;
    ctx.beginPath(); ctx.moveTo(B.minx, y); ctx.lineTo(B.maxx, y); ctx.stroke();
  }
  ctx.restore();

  // --- walls
  ctx.strokeStyle = pal.wallStroke;
  ctx.lineWidth = lw(compact ? 1.5 : 2.5);
  for (const wall of script.arena.walls) {
    ctx.beginPath();
    ctx.moveTo(wall.points[0][0], wall.points[0][1]);
    for (let i = 1; i < wall.points.length; i++) ctx.lineTo(wall.points[i][0], wall.points[i][1]);
    ctx.stroke();
  }
  // back wall highlight
  ctx.strokeStyle = pal.backWall;
  ctx.lineWidth = lw(compact ? 3 : 5);
  const bw = script.arena.backWall;
  if (bw && bw.length) {
    ctx.beginPath();
    ctx.moveTo(bw[0][0], bw[0][1]);
    for (let i = 1; i < bw.length; i++) ctx.lineTo(bw[i][0], bw[i][1]);
    ctx.stroke();
  }

  // --- labels
  if (!compact && script.arena.labels) {
    // Push labels ~6 yards outward from the chamber centre so they sit off the
    // floor and clear of the ideal-boss outline.
    const ccx = (B.minx + B.maxx) / 2, ccy = (B.miny + B.maxy) / 2;
    for (const l of script.arena.labels) {
      const a = Math.atan2(l.at[1] - ccy, l.at[0] - ccx);
      worldText(ctx, tr, l.text.toUpperCase(), l.at[0] + Math.cos(a) * 6, l.at[1] + Math.sin(a) * 6, Math.max(9, s * 2.6), pal.textMuted, pal.font);
    }
  }

  // --- hazards
  for (const hz of w.hazards) {
    if (hz.kind === 'crack' && hz.state === 'idle') {
      ctx.fillStyle = withAlpha(pal.crackIdle, 0.22 * hazAlpha + 0.05);
      ctx.beginPath(); tracePoly(ctx, hz.poly); ctx.fill();
      ctx.strokeStyle = pal.crackIdleStroke; ctx.lineWidth = lw(1); ctx.stroke();
      continue;
    }
    if (hz.state === 'warning') {
      const left = Math.max(0, hz.activeAt - t);
      const urgency = 1 - Math.min(1, left / Math.max(0.5, hz.activeAt - hz.warnAt));
      ctx.globalAlpha = hazAlpha;
      ctx.fillStyle = pal.hazardWarnFill;
      ctx.beginPath(); tracePoly(ctx, hz.poly); ctx.fill();
      hatchPoly(ctx, hz.poly, withAlpha(pal.hazardWarn, 0.35 + urgency * 0.4), hz.kind === 'lane' ? 4 : 2, lw(1.5));
      ctx.strokeStyle = pal.hazardWarn; ctx.lineWidth = lw(2);
      ctx.setLineDash([lw(8), lw(6)]);
      ctx.beginPath(); tracePoly(ctx, hz.poly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      if (hz.kind === 'lane' || !compact) {
        const c = polyCentroid(hz.poly);
        const px = compact ? Math.max(9, s * 6) : Math.max(14, s * 8);
        worldText(ctx, tr, `${Math.ceil(left)}`, c.x, c.y, px, pal.hazardWarn, pal.fontDisplay);
      }
    } else if (hz.state === 'active') {
      const pulse = 0.75 + 0.25 * Math.sin(now * 14);
      ctx.globalAlpha = hazAlpha * pulse;
      ctx.fillStyle = pal.hazardActiveFill;
      ctx.beginPath(); tracePoly(ctx, hz.poly); ctx.fill();
      ctx.strokeStyle = pal.hazardActive; ctx.lineWidth = lw(2.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // --- ideal spot + glowing path
  const ideal = w.idealPlayer;
  const p = w.player;
  const spotTol = spotTolerance(script, ideal.reason);
  if (ideal && ideal.reason !== 'wait') {
    const pulse = 0.5 + 0.5 * Math.sin(now * 3);
    // tolerance ring, dotted
    ctx.strokeStyle = withAlpha(pal.ideal, 0.55);
    ctx.lineWidth = lw(1.5);
    ctx.setLineDash([lw(5), lw(5)]);
    ctx.beginPath(); ctx.arc(ideal.x, ideal.y, spotTol, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // glowing core
    ctx.fillStyle = pal.idealFill;
    ctx.beginPath(); ctx.arc(ideal.x, ideal.y, spotTol * (0.55 + pulse * 0.2), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.ideal;
    ctx.beginPath(); ctx.arc(ideal.x, ideal.y, lw(3), 0, Math.PI * 2); ctx.fill();
    const d = dist(p.x, p.y, ideal.x, ideal.y);
    if (d > 2) {
      ctx.strokeStyle = pal.pathGlow; ctx.lineWidth = lw(10);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ideal.x, ideal.y); ctx.stroke();
      ctx.strokeStyle = pal.path; ctx.lineWidth = lw(2.5);
      ctx.setLineDash([lw(10), lw(8)]);
      ctx.lineDashOffset = -now * lw(40);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ideal.x, ideal.y); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
  }

  // --- ideal boss (dotted ghost) + arrow + drag route
  const ib = w.idealBoss;
  const boss = w.boss;
  if (ib) {
    const a = ib.satisfied ? 0.35 : 0.8;
    drawBossFlat(ctx, ib.x, ib.y, ib.heading, R, { shape: script.boss.shape, stroke: withAlpha(pal.idealBoss, a), front: withAlpha(pal.idealBoss, a), dashed: true, lineWidth: lw(2), fill: ib.satisfied ? null : withAlpha(pal.idealBoss, 0.06) });
    if (!ib.satisfied && dist(boss.x, boss.y, ib.x, ib.y) > 3) {
      ctx.setLineDash([lw(6), lw(6)]);
      ctx.strokeStyle = pal.route; ctx.lineWidth = lw(2);
      ctx.beginPath(); ctx.moveTo(boss.x, boss.y); ctx.lineTo(ib.x, ib.y); ctx.stroke();
      ctx.setLineDash([]);
      drawArrow(ctx, boss.x, boss.y, ib.x, ib.y, lw(14), pal.idealBoss, lw(3));
    }
  }

  // --- cones (every cone the boss has; the one being cast fills in as the cast bar runs)
  const grounded = boss.state === 'grounded';
  const cones = script.boss.cones || {};
  if (grounded && boss.engaged) {
    const cast = boss.cast;
    const castDef = cast && script.actions[cast.id];
    for (const [name, c] of Object.entries(cones)) {
      const flash = Math.max(0, 1 - (t - (w.coneFlash[name] ?? -Infinity)) / (c.style === 'breath' ? 0.6 : 0.4));
      const heading = boss.heading + (c.facing === 'back' ? Math.PI : 0);
      const style = c.style || (c.facing === 'back' ? 'tail' : name === 'breath' ? 'breath' : 'cleave');
      const casting = castDef && castDef.cone === name;
      if (style === 'breath' && !casting && !flash) continue;   // big frontal breaths only show while telegraphed
      const poly = conePoly(boss.x, boss.y, heading, rad(c.angle), c.range);
      ctx.lineWidth = lw(style === 'breath' ? 2 : 1.2);
      if (casting) {
        const prog = Math.min(1, (t - cast.start) / (cast.end - cast.start));
        ctx.fillStyle = withAlpha(pal.hazardActive, 0.12 + 0.4 * prog);
        ctx.strokeStyle = withAlpha(pal.coneBreathStroke, 0.5 + 0.5 * prog);
      } else if (style === 'breath') {
        ctx.fillStyle = withAlpha(pal.hazardActive, 0.5 * flash);
        ctx.strokeStyle = withAlpha(pal.coneBreathStroke, flash);
      } else if (style === 'tail') {
        ctx.fillStyle = flash ? withAlpha(pal.hazardActive, 0.12 + 0.33 * flash) : pal.coneTail;
        ctx.strokeStyle = pal.coneTailStroke;
      } else {
        ctx.fillStyle = flash ? withAlpha(pal.hazardActive, 0.12 + 0.33 * flash) : pal.coneCleave;
        ctx.strokeStyle = pal.coneCleaveStroke;
      }
      ctx.beginPath(); tracePoly(ctx, poly); ctx.fill(); ctx.stroke();
    }
    const kb = Object.values(script.actions).find((a) => a.kind === 'knockback');
    const buffetFlash = Math.max(0, 1 - (t - (w.coneFlash.knockback ?? w.coneFlash.buffet ?? -Infinity)) / 0.7);
    if (buffetFlash && kb) {
      ctx.strokeStyle = withAlpha(pal.buffetRing, buffetFlash);
      ctx.lineWidth = lw(3);
      ctx.beginPath(); ctx.arc(boss.x, boss.y, R + (1 - buffetFlash) * kb.knockbackRange, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // --- raid
  for (const d of w.raid.dots) {
    ctx.fillStyle = d.melee ? pal.raidMelee : pal.raid;
    ctx.beginPath(); ctx.arc(d.x, d.y, compact ? 0.9 : 0.75, 0, Math.PI * 2); ctx.fill();
  }

  // --- whelps
  for (const wh of w.whelps) {
    const color = wh.onRaid ? pal.hazardActive : wh.target === 'player' ? pal.whelpHeld : pal.whelp;
    drawWhelpFlat(ctx, wh.x, wh.y, wh.heading, color, compact ? 1.6 : 1.3);
    if (wh.killable && !compact) {
      ctx.fillStyle = withAlpha(pal.text, 0.25); ctx.fillRect(wh.x - 1.4, wh.y + 1.7, 2.8, 0.35);
      ctx.fillStyle = wh.priority ? pal.bad : pal.good; ctx.fillRect(wh.x - 1.4, wh.y + 1.7, 2.8 * Math.max(0, wh.hp), 0.35);
      if (view.feedback && view.feedback.target && view.feedback.target.add === wh.uid) { ctx.strokeStyle = pal.accent; ctx.lineWidth = lw(2); ctx.beginPath(); ctx.arc(wh.x, wh.y, 2.2, 0, Math.PI * 2); ctx.stroke(); }
    }
  }

  // --- boss
  const airborne = boss.state !== 'grounded';
  if (boss.state === 'submerged') {
    drawBossFlat(ctx, boss.x, boss.y, boss.heading, R, { shape: script.boss.shape, stroke: withAlpha(pal.bossStroke, 0.35), dashed: true, lineWidth: lw(1.5) });
    if (!compact) worldText(ctx, tr, 'SUBMERGED', boss.x, boss.y - R * 1.6, Math.max(10, s * 3), pal.bossStroke, pal.fontDisplay);
  } else if (airborne) {
    const lift = (boss.z || 0) / Math.max(1, script.hoverHeight || 1);
    drawBossFlat(ctx, boss.x + lift * 2, boss.y - lift * 2, boss.heading, R, { shape: script.boss.shape, fill: pal.bossShadow, alpha: 0.6 * lift + 0.2 });
    drawBossFlat(ctx, boss.x, boss.y, boss.heading, R * (1 + 0.18 * lift), { shape: script.boss.shape, fill: withAlpha(pal.boss, 0.3), stroke: pal.bossStroke, front: pal.bossFront, dashed: true, lineWidth: lw(2) });
    if (!compact && boss.state === 'airborne') worldText(ctx, tr, 'AIRBORNE', boss.x, boss.y - R * 2.2, Math.max(10, s * 3), pal.bossStroke, pal.fontDisplay);
  } else {
    const hit = Math.max(0, 1 - (t - boss.lastHit) / 0.25);
    drawBossFlat(ctx, boss.x, boss.y, boss.heading, R, { shape: script.boss.shape, fill: hit ? withAlpha(pal.bossStroke, 0.45) : pal.boss, stroke: pal.bossStroke, front: pal.bossFront, lineWidth: lw(2) });
    if ((boss.target === 'raid' || (boss.target === 'player' && view.tankRole === false)) && boss.engaged) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 10);
      ctx.strokeStyle = withAlpha(pal.bad, 0.4 + pulse * 0.5); ctx.lineWidth = lw(3);
      ctx.beginPath(); ctx.arc(boss.x, boss.y, R * 1.2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // --- projectiles
  for (const pr of w.projectiles) {
    if (t < pr.t1) {
      const k = Math.max(0, (t - pr.t0) / (pr.t1 - pr.t0));
      const x = pr.x0 + (pr.tx - pr.x0) * k, y = pr.y0 + (pr.ty - pr.y0) * k;
      ctx.fillStyle = pal.projectile;
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
    } else {
      const k = Math.min(1, (t - pr.t1) / 0.6);
      ctx.strokeStyle = withAlpha(pal.projectile, 1 - k); ctx.lineWidth = lw(2);
      ctx.beginPath(); ctx.arc(pr.tx, pr.ty, pr.splash * k, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // --- ghost tank: a dashed guide in the tank roles, the raid's solid tank otherwise
  const ga = settings.ghostAlpha ?? 0.6;
  if (w.ghost && w.ghost.tanking) {
    drawFigureFlat(ctx, w.ghost.x, w.ghost.y, w.ghost.heading, { fill: withAlpha(pal.ghost, 0.7), stroke: pal.ghost, alpha: 1, dashed: false, lineWidth: lw(1.5), radius: compact ? 1.5 : 1.1, shield: pal.ghost });
  } else if (ga > 0.01 && w.ghost) {
    drawFigureFlat(ctx, w.ghost.x, w.ghost.y, w.ghost.heading, { fill: withAlpha(pal.ghost, 0.25), stroke: pal.ghost, alpha: ga, dashed: true, lineWidth: lw(1.5), radius: compact ? 1.5 : 1.1, shield: pal.ghost });
  }

  // --- player
  const feared = p.fearedUntil > t;
  const jitter = feared ? Math.sin(now * 40) * 0.3 : 0;
  const z = p.z || 0;
  if (z > 0) {
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 1.3, 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  drawFigureFlat(ctx, p.x + jitter, p.y + z * 0.5, p.heading, { fill: pal.player, stroke: pal.playerStroke, lineWidth: lw(1.5), radius: (compact ? 1.6 : 1.2) * (1 + z * 0.2), shield: pal.playerStroke });

  ctx.restore();
}

export function spotTolerance(script, reason) {
  const P = script.positions;
  if (reason === 'tankSpot') return (P.tankSpot && P.tankSpot.tolerance) ?? 4;
  if (reason === 'pickupSpot' || reason === 'dodgeLane' || reason === 'dodgeZone') return (P.pickupSpot && P.pickupSpot.tolerance) ?? 6;
  if (P[reason] && P[reason].tolerance != null) return P[reason].tolerance;
  if (reason === 'meleeSpot') return 3;
  if (reason === 'rangedSpot' || reason === 'healerSpot' || reason === 'raidSpot') return 8;
  return 3;
}
