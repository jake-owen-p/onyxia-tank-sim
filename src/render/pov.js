// POV "facing" view: a third-person over-the-shoulder camera behind the tank,
// drawn with a plain perspective projection on Canvas 2D. Floor, walls, hazards,
// the boss as a raised translucent silhouette, raid, whelps, the ghost tank and
// a glowing floor path to where the player should stand.

import { rad, dist } from '../core/geometry.js';
import { project, projectPoly, projectSegment, depthOf, sortByDepth, horizonY } from './projection.js';
import { bossFootprint, localToWorld, traceScreenPoly, conePoly, circlePoly, whelpPoly } from './shapes.js';
import { withAlpha } from './palette.js';
import { spotTolerance } from './topdown.js';

const FAR = 130;              // fade-out distance for world detail
const GRID = 5;
const GRID_REACH = 90;

const geomCache = new WeakMap();
const gridBuckets = [[[], [], [], []], [[], [], [], []]];

/** Precompute wall quads and floor polys for a script. */
function geometry(script) {
  let g = geomCache.get(script);
  if (g) return g;
  const H = script.arena.wallHeight;
  const walls = [];
  for (const wall of script.arena.walls) {
    const pts = wall.points;
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      walls.push({
        quad: [[x1, y1, 0], [x2, y2, 0], [x2, y2, H], [x1, y1, H]],
        top: [[x1, y1, H], [x2, y2, H]],
        mx: (x1 + x2) / 2, my: (y1 + y2) / 2,
      });
    }
  }
  const floors = script.arena.floor.map((f) => f.poly.map(([x, y]) => [x, y, 0]));
  g = { walls, floors, H };
  geomCache.set(script, g);
  return g;
}

/** Fill + stroke a projected floor polygon. */
function floorPoly(ctx, cam, pts, w, h, fill, stroke, lineWidth) {
  const sp = projectPoly(cam, pts, w, h);
  if (sp.length < 3) return false;
  ctx.beginPath();
  traceScreenPoly(ctx, sp);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
  return true;
}

function strokeSeg(ctx, cam, a, b, w, h) {
  const s = projectSegment(cam, a[0], a[1], a[2] || 0, b[0], b[1], b[2] || 0, w, h);
  if (!s) return;
  ctx.moveTo(s[0].x, s[0].y);
  ctx.lineTo(s[1].x, s[1].y);
}

/** Distance fade factor for a depth. */
const fade = (depth) => Math.max(0, Math.min(1, 1 - (depth - 25) / FAR));

export function drawPOV(ctx, view, script, settings, pal, cam, w, h, now) {
  const wd = view.world;
  const t = view.t;
  const p = wd.player;
  const boss = wd.boss;
  const R = script.boss.radius;
  const G = geometry(script);
  const hazAlpha = settings.hazardOpacity ?? 0.7;
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));

  // --- sky and fog
  const hy = Math.max(0, Math.min(h, horizonY(cam, w, h)));
  const sky = ctx.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, pal.sky0);
  sky.addColorStop(1, pal.sky1);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- floor polygons (the lair) with a faint edge
  for (const f of G.floors) floorPoly(ctx, cam, f, w, h, pal.floor, pal.floorEdge, 1);

  // --- floor grid, chunked so it can fade with distance. Chunks are batched
  // into a few alpha buckets so the whole grid costs ~8 strokes per frame.
  ctx.lineWidth = 1;
  const gx0 = Math.floor((p.x - GRID_REACH) / GRID) * GRID, gx1 = p.x + GRID_REACH;
  const gy0 = Math.floor((p.y - GRID_REACH) / GRID) * GRID, gy1 = p.y + GRID_REACH;
  const CH = 15;
  const BUCKETS = 4;
  const buckets = gridBuckets; // reused arrays: [major][bucket] -> list of segments
  for (let m = 0; m < 2; m++) for (let b = 0; b < BUCKETS; b++) buckets[m][b].length = 0;
  const push = (ax, ay, bx, by) => {
    const d = depthOf(cam, (ax + bx) / 2, (ay + by) / 2, 0);
    if (d < 0) return;
    const a = fade(d);
    if (a <= 0.08) return;
    const major = (Math.abs(ax - bx) < 1e-6 ? Math.abs(ax % 20) : Math.abs(ay % 20)) < 1e-6 ? 1 : 0;
    const bi = Math.min(BUCKETS - 1, Math.floor(a * BUCKETS));
    buckets[major][bi].push(ax, ay, bx, by);
  };
  for (let x = gx0; x <= gx1; x += GRID) for (let y = gy0; y < gy1; y += CH) push(x, y, x, Math.min(y + CH, gy1));
  for (let y = gy0; y <= gy1; y += GRID) for (let x = gx0; x < gx1; x += CH) push(x, y, Math.min(x + CH, gx1), y);
  for (let m = 0; m < 2; m++) {
    ctx.strokeStyle = m ? pal.gridMajor : pal.grid;
    for (let b = 0; b < BUCKETS; b++) {
      const segs = buckets[m][b];
      if (!segs.length) continue;
      ctx.globalAlpha = (b + 0.5) / BUCKETS;
      ctx.beginPath();
      for (let i = 0; i < segs.length; i += 4) strokeSeg(ctx, cam, [segs[i], segs[i + 1], 0], [segs[i + 2], segs[i + 3], 0], w, h);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // --- hazards on the floor
  for (const hz of wd.hazards) {
    const poly3 = hz.poly.map(([x, y]) => [x, y, 0.02]);
    if (hz.kind === 'crack' && hz.state === 'idle') {
      floorPoly(ctx, cam, poly3, w, h, withAlpha(pal.crackIdle, 0.22 * hazAlpha + 0.05), pal.crackIdleStroke, 1);
      continue;
    }
    if (hz.state === 'warning') {
      const left = Math.max(0, hz.activeAt - t);
      const urgency = 1 - Math.min(1, left / Math.max(0.5, hz.activeAt - hz.warnAt));
      ctx.globalAlpha = hazAlpha;
      const sp = projectPoly(cam, poly3, w, h);
      if (sp.length >= 3) {
        ctx.beginPath(); traceScreenPoly(ctx, sp);
        ctx.fillStyle = pal.hazardWarnFill; ctx.fill();
        // hatching in screen space, clipped to the projected polygon
        ctx.save(); ctx.clip();
        ctx.strokeStyle = withAlpha(pal.hazardWarn, 0.3 + 0.4 * urgency);
        ctx.lineWidth = 1.5;
        let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
        for (const q of sp) { if (q.x < minx) minx = q.x; if (q.x > maxx) maxx = q.x; if (q.y < miny) miny = q.y; if (q.y > maxy) maxy = q.y; }
        const spacing = Math.max(8, u * 0.7);
        ctx.beginPath();
        for (let d = -(maxy - miny); d <= maxx - minx; d += spacing) { ctx.moveTo(minx + d, miny); ctx.lineTo(minx + d + (maxy - miny), maxy); }
        ctx.stroke();
        ctx.restore();
        ctx.beginPath(); traceScreenPoly(ctx, sp);
        ctx.strokeStyle = pal.hazardWarn; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
      // countdown floating above the centroid
      let cx = 0, cy = 0;
      for (const [x, y] of hz.poly) { cx += x; cy += y; }
      cx /= hz.poly.length; cy /= hz.poly.length;
      const cp = project(cam, cx, cy, 1.5, w, h);
      if (cp) {
        const px = Math.max(12, Math.min(u * 4, cp.scale * 3));
        ctx.font = `700 ${px}px ${pal.fontDisplay}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = pal.hazardWarn;
        ctx.fillText(`${Math.ceil(left)}`, cp.x, cp.y);
      }
    } else if (hz.state === 'active') {
      const pulse = 0.75 + 0.25 * Math.sin(now * 14);
      ctx.globalAlpha = hazAlpha * pulse;
      floorPoly(ctx, cam, poly3, w, h, hz.applies ? withAlpha(pal.good, 0.28) : pal.hazardActiveFill, hz.applies ? pal.good : pal.hazardActive, 2.5);
      // low flame wall along the edge: a second polygon raised slightly, translucent
      ctx.globalAlpha = hazAlpha * 0.35;
      floorPoly(ctx, cam, hz.poly.map(([x, y]) => [x, y, 2.5]), w, h, withAlpha(hz.applies ? pal.good : pal.hazardActive, 0.35), null);
      ctx.globalAlpha = 1;
    }
  }

  // --- cones on the floor (grounded, engaged)
  const cones = script.boss.cones || {};
  const grounded = boss.state === 'grounded';
  if (grounded && boss.engaged) {
    const cast = boss.cast;
    const castDef = cast && script.actions[cast.id];
    for (const [name, c] of Object.entries(cones)) {
      const style = c.style || (c.facing === 'back' ? 'tail' : name === 'breath' ? 'breath' : 'cleave');
      const flash = Math.max(0, 1 - (t - (wd.coneFlash[name] ?? -Infinity)) / (style === 'breath' ? 0.6 : 0.4));
      const heading = boss.heading + (c.facing === 'back' ? Math.PI : 0);
      const casting = castDef && castDef.cone === name;
      if (style === 'breath' && !casting && !flash) continue;
      const poly = conePoly(boss.x, boss.y, heading, rad(c.angle), c.range).map(([x, y]) => [x, y, style === 'breath' ? 0.04 : 0.03]);
      if (casting) {
        const prog = Math.min(1, (t - cast.start) / (cast.end - cast.start));
        floorPoly(ctx, cam, poly, w, h, withAlpha(pal.hazardActive, 0.12 + 0.4 * prog), withAlpha(pal.coneBreathStroke, 0.5 + 0.5 * prog), 2);
      } else if (style === 'breath') {
        floorPoly(ctx, cam, poly, w, h, withAlpha(pal.hazardActive, 0.5 * flash), withAlpha(pal.coneBreathStroke, flash), 2);
      } else if (style === 'tail') {
        floorPoly(ctx, cam, poly, w, h, flash ? withAlpha(pal.hazardActive, 0.12 + 0.33 * flash) : withAlpha(pal.coneTail, 0.06), pal.coneTailStroke, 1);
      } else {
        floorPoly(ctx, cam, poly, w, h, flash ? withAlpha(pal.hazardActive, 0.12 + 0.33 * flash) : withAlpha(pal.coneCleave, 0.06), pal.coneCleaveStroke, 1);
      }
    }
    const kb = Object.values(script.actions).find((a) => a.kind === 'knockback');
    const buffetFlash = Math.max(0, 1 - (t - (wd.coneFlash.knockback ?? -Infinity)) / 0.7);
    if (buffetFlash && kb) {
      floorPoly(ctx, cam, circlePoly(boss.x, boss.y, R + (1 - buffetFlash) * kb.knockbackRange, 28).map(([x, y]) => [x, y, 0.05]), w, h,
        null, withAlpha(pal.buffetRing, buffetFlash), 3);
    }
  }

  // --- facing beam on the floor: a thin 6-yard line and a small chevron ahead of the snout
  if (boss.engaged || grounded) {
    const bz = boss.z || 0;
    const c = Math.cos(boss.heading), sn = Math.sin(boss.heading);
    const bx = boss.x + c * R * 2.0, by = boss.y + sn * R * 2.0;
    const ex = bx + c * 6, ey = by + sn * 6;
    ctx.strokeStyle = withAlpha(pal.bossFront, 0.85); ctx.lineWidth = 2;
    ctx.beginPath(); strokeSeg(ctx, cam, [bx, by, 0.05], [ex, ey, 0.05], w, h); ctx.stroke();
    const chev = [[ex, ey, 0.05], [ex - c * 1.4 - sn * 0.9, ey - sn * 1.4 + c * 0.9, 0.05], [ex - c * 1.4 + sn * 0.9, ey - sn * 1.4 - c * 0.9, 0.05]];
    floorPoly(ctx, cam, chev, w, h, pal.bossFront, null);
    if (bz > 0.5) drawBossParts(ctx, cam, boss.x, boss.y, boss.heading, R, 0, w, h, pal, { shadow: true, shape: script.boss.shape });
  }

  // --- ideal boss outline + drag route
  const ib = wd.idealBoss;
  if (ib) {
    const a = ib.satisfied ? 0.3 : 0.75;
    ctx.setLineDash([8, 6]);
    drawBossParts(ctx, cam, ib.x, ib.y, ib.heading, R, 0, w, h, pal, { outline: withAlpha(pal.idealBoss, a), flat: true, shape: script.boss.shape });
    ctx.setLineDash([]);
    if (!ib.satisfied && dist(boss.x, boss.y, ib.x, ib.y) > 3) {
      ctx.strokeStyle = pal.route; ctx.lineWidth = 2; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -now * 40;
      ctx.beginPath(); strokeSeg(ctx, cam, [boss.x, boss.y, 0.1], [ib.x, ib.y, 0.1], w, h); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      // arrow head at the ideal spot, drawn flat on the floor
      const ang = Math.atan2(ib.y - boss.y, ib.x - boss.x);
      const head = [[ib.x, ib.y, 0.1], [ib.x - Math.cos(ang - 0.45) * 3, ib.y - Math.sin(ang - 0.45) * 3, 0.1], [ib.x - Math.cos(ang + 0.45) * 3, ib.y - Math.sin(ang + 0.45) * 3, 0.1]];
      floorPoly(ctx, cam, head, w, h, withAlpha(pal.idealBoss, 0.7), null);
    }
  }

  // --- glowing path to the ideal player spot
  const ideal = wd.idealPlayer;
  if (ideal && ideal.reason !== 'wait') {
    const tol = spotTolerance(script, ideal.reason);
    const pulse = 0.5 + 0.5 * Math.sin(now * 3);
    floorPoly(ctx, cam, circlePoly(ideal.x, ideal.y, tol, 24).map(([x, y]) => [x, y, 0.06]), w, h, pal.idealFill, withAlpha(pal.ideal, 0.6), 1.5);
    floorPoly(ctx, cam, circlePoly(ideal.x, ideal.y, tol * (0.35 + pulse * 0.25), 20).map(([x, y]) => [x, y, 0.07]), w, h, withAlpha(pal.ideal, 0.25 + pulse * 0.2), null);
    const d = dist(p.x, p.y, ideal.x, ideal.y);
    if (d > 2) {
      // chunked segments so the glow can fade with distance
      const n = Math.max(2, Math.ceil(d / 4));
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass ? pal.path : pal.pathGlow;
        ctx.lineWidth = pass ? 3 : 12;
        if (pass) { ctx.setLineDash([14, 10]); ctx.lineDashOffset = -now * 60; }
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const k0 = i / n, k1 = (i + 1) / n;
          strokeSeg(ctx, cam, [p.x + (ideal.x - p.x) * k0, p.y + (ideal.y - p.y) * k0, 0.08], [p.x + (ideal.x - p.x) * k1, p.y + (ideal.y - p.y) * k1, 0.08], w, h);
        }
        ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
    }
  }

  // --- depth-sorted drawables: walls, boss, raid, whelps, ghost, player, projectiles
  const items = [];
  for (const wall of G.walls) {
    const d = depthOf(cam, wall.mx, wall.my, G.H / 2);
    if (d < -5 || d > FAR + 40) continue;
    items.push({ depth: d, kind: 'wall', wall });
  }
  items.push({ depth: depthOf(cam, boss.x, boss.y, boss.z || 0), kind: 'boss' });
  for (const dot of wd.raid.dots) {
    const d = depthOf(cam, dot.x, dot.y, 0.9);
    if (d > 0) items.push({ depth: d, kind: 'raid', dot });
  }
  for (const wh of wd.whelps) {
    const d = depthOf(cam, wh.x, wh.y, 0);
    if (d > 0) items.push({ depth: d, kind: 'whelp', wh });
  }
  if (((settings.ghostAlpha ?? 0.6) > 0.01 || wd.ghost.tanking) && wd.ghost) items.push({ depth: depthOf(cam, wd.ghost.x, wd.ghost.y, 1), kind: 'ghost' });
  items.push({ depth: depthOf(cam, p.x, p.y, 1), kind: 'player' });
  for (const pr of wd.projectiles) {
    const k = Math.max(0, Math.min(1, (t - pr.t0) / (pr.t1 - pr.t0)));
    const x = pr.x0 + (pr.tx - pr.x0) * k, y = pr.y0 + (pr.ty - pr.y0) * k, z = (pr.z0 || 0) * (1 - k) + 1;
    items.push({ depth: depthOf(cam, x, y, z), kind: 'proj', pr, x, y, z, k });
  }
  sortByDepth(items);

  for (const it of items) {
    switch (it.kind) {
      case 'wall': drawWall(ctx, cam, it.wall, it.depth, w, h, pal); break;
      case 'boss': {
        // Inside her hitbox the silhouette would wall off the scene, so fade it as the camera gets close.
        const b = view.world.boss;
        const dc = Math.hypot(cam.x - b.x, cam.y - b.y);
        const near = Math.max(0.35, Math.min(1, (dc - script.boss.radius * 1.2) / (script.boss.radius * 1.4)));
        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = prevAlpha * near;
        drawBoss(ctx, cam, view, script, pal, w, h, now);
        ctx.globalAlpha = prevAlpha;
        break;
      }
      case 'raid': {
        if (it.depth < cam.near) break;
        const foot = project(cam, it.dot.x, it.dot.y, 0.05, w, h);
        const top = project(cam, it.dot.x, it.dot.y, 1.4, w, h);
        if (!foot || !top) break;
        // Fade out as they come close to the camera so they never block the view.
        const near = Math.max(0, Math.min(1, (it.depth - 2) / 4));
        ctx.globalAlpha = (0.25 + 0.75 * near) * Math.max(0.15, fade(it.depth));
        const color = it.dot.melee ? pal.raidMelee : pal.raid;
        const r = Math.min(u * 2.2, Math.max(1.5, top.scale * 0.45));
        ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, Math.min(u * 0.5, top.scale * 0.22));
        ctx.beginPath(); ctx.moveTo(foot.x, foot.y); ctx.lineTo(top.x, top.y); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(top.x, top.y - r, r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case 'whelp': {
        const wh = it.wh;
        const color = wh.onRaid ? pal.hazardActive : wh.target === 'player' ? pal.whelpHeld : pal.whelp;
        const poly = whelpPoly(1.4).map((q) => { const [x, y] = localToWorld(q, wh.x, wh.y, wh.heading); return [x, y, 0.3]; });
        ctx.globalAlpha = Math.max(0.2, fade(it.depth));
        floorPoly(ctx, cam, poly, w, h, color, null);
        const top = project(cam, wh.x, wh.y, 1.3, w, h);
        const base = project(cam, wh.x, wh.y, 0.3, w, h);
        if (top && base) {
          ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, base.scale * 0.5); ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke();
          if (wh.killable) {
            const bw = Math.max(18, top.scale * 2.6), by = top.y - Math.max(6, top.scale * 0.5);
            ctx.fillStyle = withAlpha(pal.text, 0.3); ctx.fillRect(top.x - bw / 2, by, bw, 3);
            ctx.fillStyle = wh.priority ? pal.bad : pal.good; ctx.fillRect(top.x - bw / 2, by, bw * Math.max(0, wh.hp), 3);
            if (view.feedback && view.feedback.target && view.feedback.target.add === wh.uid) { ctx.strokeStyle = pal.accent; ctx.lineWidth = 2; ctx.strokeRect(top.x - bw / 2 - 2, by - 2, bw + 4, 7); }
          }
        }
        ctx.globalAlpha = 1;
        break;
      }
      case 'ghost': drawFigure(ctx, cam, wd.ghost.x, wd.ghost.y, wd.ghost.heading, w, h, pal.ghost, wd.ghost.tanking ? 1 : (settings.ghostAlpha ?? 0.6), !wd.ghost.tanking, now); break;
      case 'player': drawFigure(ctx, cam, p.x, p.y, p.heading, w, h, pal.player, 1, false, now, p.fearedUntil > t, pal.playerStroke, p.z || 0); break;
      case 'proj': {
        const pr = it.pr;
        if (t < pr.t1) {
          const sp = project(cam, it.x, it.y, it.z, w, h);
          if (sp) {
            const r = Math.max(2, sp.scale * 0.8);
            const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 2.2);
            g.addColorStop(0, withAlpha(pal.projectile, 0.9)); g.addColorStop(1, withAlpha(pal.projectile, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sp.x, sp.y, r * 2.2, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          const k = Math.min(1, (t - pr.t1) / 0.6);
          floorPoly(ctx, cam, circlePoly(pr.tx, pr.ty, pr.splash * k, 16).map(([x, y]) => [x, y, 0.1]), w, h, withAlpha(pal.projectile, 0.15 * (1 - k)), withAlpha(pal.projectile, 1 - k), 2);
        }
        break;
      }
      default: break;
    }
  }

  // --- fog at the far horizon band for depth
  const fogH = Math.max(0, h * 0.05);
  const fog = ctx.createLinearGradient(0, hy - fogH, 0, hy + fogH);
  fog.addColorStop(0, withAlpha(pal.sky1, 0.0));
  fog.addColorStop(0.5, withAlpha(pal.sky1, 0.55));
  fog.addColorStop(1, withAlpha(pal.sky1, 0.0));
  ctx.fillStyle = fog;
  ctx.fillRect(0, hy - fogH, w, fogH * 2);
}

/** Any boss that is not a dragon: a tapered wireframe body with shoulders, a head and an unmistakable front. */
function drawStandingBoss(ctx, cam, view, script, pal, w, h, now) {
  const boss = view.world.boss, t = view.t;
  const R = script.boss.radius;
  const hit = Math.max(0, 1 - (t - boss.lastHit) / 0.25);
  const stroke = hit ? pal.bossFront : pal.bossStroke;
  const parts = bossFootprint(R, 'standing');
  const toW = (q, z) => { const [wx, wy] = localToWorld(q, boss.x, boss.y, boss.heading); return [wx, wy, z]; };
  const H = Math.max(6, R * 1.9);
  // Floor footprint: the part that must always read.
  for (const k of ['wingL', 'wingR', 'body', 'head', 'tail']) floorPoly(ctx, cam, parts[k].poly.map((q) => toW(q, 0.05)), w, h, withAlpha(pal.boss, 0.14), withAlpha(stroke, 0.85), 2);
  // Body: stacked rings, widest at the shoulders.
  const rings = [[0, 0.55], [0.32, 0.68], [0.68, 0.92], [0.82, 0.62]];
  const ring = (k, n = 10) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [boss.x + Math.cos(a) * R * rings[k][1], boss.y + Math.sin(a) * R * rings[k][1], H * rings[k][0]]; });
  for (let k = 0; k + 1 < rings.length; k++) {
    const a = ring(k), b = ring(k + 1);
    ctx.strokeStyle = withAlpha(stroke, 0.55); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < a.length; i++) strokeSeg(ctx, cam, a[i], b[i], w, h);
    ctx.stroke();
    floorPoly(ctx, cam, b, w, h, withAlpha(pal.boss, 0.16), withAlpha(stroke, 0.85), 1.5);
  }
  // Head above the shoulders, pushed slightly forward.
  const head = project(cam, boss.x + Math.cos(boss.heading) * R * 0.3, boss.y + Math.sin(boss.heading) * R * 0.3, H * 0.97, w, h);
  if (head) { ctx.fillStyle = withAlpha(pal.bossSolid, 0.75); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(head.x, head.y, Math.max(4, head.scale * R * 0.3), 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // Front: a chevron on the floor and the label above it.
  floorPoly(ctx, cam, parts.marker.poly.map((q) => toW(q, 0.08)), w, h, pal.bossFront, null);
  const lbl = toW([R * 1.1, 0], H * 1.25);
  const label = project(cam, lbl[0], lbl[1], lbl[2], w, h);
  if (label) {
    const px = Math.max(10, Math.min(26, label.scale * 2));
    ctx.font = `700 ${px}px ${pal.fontDisplay}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = pal.bossFront;
    ctx.fillText('FRONT', label.x, label.y);
  }
  if (boss.target === 'raid' && boss.engaged) {
    const pulse = 0.5 + 0.5 * Math.sin(now * 10);
    floorPoly(ctx, cam, circlePoly(boss.x, boss.y, R * 1.25, 28).map(([x, y]) => [x, y, 0.06]), w, h, null, withAlpha(pal.bad, 0.4 + pulse * 0.5), 3);
  }
}

/** A translucent wall quad with a brighter top edge. */
function drawWall(ctx, cam, wall, depth, w, h, pal) {
  const sp = projectPoly(cam, wall.quad, w, h);
  if (sp.length < 3) return;
  const a = Math.max(0.12, fade(depth) * 0.9 + 0.1);
  ctx.globalAlpha = a;
  ctx.beginPath(); traceScreenPoly(ctx, sp);
  ctx.fillStyle = depth > 60 ? pal.wallFar : pal.wall; ctx.fill();
  ctx.strokeStyle = pal.wallStroke; ctx.lineWidth = 1; ctx.stroke();
  const top = projectSegment(cam, wall.top[0][0], wall.top[0][1], wall.top[0][2], wall.top[1][0], wall.top[1][1], wall.top[1][2], w, h);
  if (top) { ctx.strokeStyle = pal.wallTop; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(top[0].x, top[0].y); ctx.lineTo(top[1].x, top[1].y); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

/**
 * Boss silhouette parts raised above the floor. Each part is a polygon at a
 * height band; parts are depth-sorted among themselves and joined to the
 * footprint with vertical edges so she reads as a solid shape.
 * opts: shadow (flat dark footprint), outline (stroke colour, flat dashed ghost), flat.
 */
function drawBossParts(ctx, cam, x, y, heading, R, z, w, h, pal, opts = {}) {
  const parts = bossFootprint(R, opts.shape);
  const order = ['tail', 'wingL', 'wingR', 'body', 'neck', 'head'];
  if (opts.shadow) {
    ctx.fillStyle = pal.bossShadow;
    for (const k of order) floorPoly(ctx, cam, parts[k].poly.map((q) => { const [wx, wy] = localToWorld(q, x, y, heading); return [wx, wy, 0.02]; }), w, h, pal.bossShadow, null);
    return;
  }
  if (opts.flat) {
    ctx.lineWidth = 2;
    for (const k of order) floorPoly(ctx, cam, parts[k].poly.map((q) => { const [wx, wy] = localToWorld(q, x, y, heading); return [wx, wy, 0.1]; }), w, h, opts.fill || null, opts.outline, 2);
    const m = parts.marker.poly.map((q) => { const [wx, wy] = localToWorld(q, x, y, heading); return [wx, wy, 0.1]; });
    floorPoly(ctx, cam, m, w, h, opts.outline, null);
    return;
  }
}

function drawBoss(ctx, cam, view, script, pal, w, h, now) {
  const boss = view.world.boss;
  const R = script.boss.radius;
  if (boss.state === 'submerged') {
    drawBossParts(ctx, cam, boss.x, boss.y, boss.heading, R, 0, w, h, pal, { flat: true, outline: withAlpha(pal.bossStroke, 0.35), shape: script.boss.shape });
    return;
  }
  if (script.boss.shape !== 'dragon') { drawStandingBoss(ctx, cam, view, script, pal, w, h, now); return; }
  const t = view.t;
  const z = boss.z || 0;
  const parts = bossFootprint(R);
  const hit = Math.max(0, 1 - (t - boss.lastHit) / 0.25);
  const airborne = boss.state !== 'grounded';
  const lift = airborne ? Math.sin(now * 2.2) * 0.8 : 0;   // gentle hover bob
  const base = z + lift;
  const stroke = hit ? pal.bossFront : pal.bossStroke;
  const toW = (q, zz) => { const [wx, wy] = localToWorld(q, boss.x, boss.y, boss.heading); return [wx, wy, zz]; };
  const order = ['tail', 'wingL', 'wingR', 'body', 'neck', 'head'];
  const centroidDepth = (poly, zz) => {
    let cx = 0, cy = 0;
    for (const q of poly) { cx += q[0]; cy += q[1]; }
    const [wx, wy] = localToWorld([cx / poly.length, cy / poly.length], boss.x, boss.y, boss.heading);
    return depthOf(cam, wx, wy, zz);
  };

  // Heights (yards): a low flat body slab, wings as thin planes at mid height,
  // the head on a raised wedge in front, the tail along the floor behind.
  const BODY_H = 3.5, WING_Z = 2.4, NECK_Z0 = 2.5, HEAD_Z = 5;

  // 1. Footprint outline on the floor: the part that must always read.
  if (!airborne) {
    for (const k of order) floorPoly(ctx, cam, parts[k].poly.map((q) => toW(q, 0.05)), w, h, withAlpha(pal.boss, 0.14), withAlpha(stroke, 0.85), 2);
    floorPoly(ctx, cam, circlePoly(boss.x, boss.y, R, 28).map(([x, y]) => [x, y, 0.04]), w, h, null, withAlpha(pal.bossStroke, 0.3), 1);
  }

  // 2. Raised parts, painter-sorted.
  const items = [
    { depth: centroidDepth(parts.tail.poly, base + 0.4), k: 'tail' },
    { depth: centroidDepth(parts.wingL.poly, base + WING_Z), k: 'wingL' },
    { depth: centroidDepth(parts.wingR.poly, base + WING_Z), k: 'wingR' },
    { depth: centroidDepth(parts.body.poly, base + BODY_H / 2), k: 'body' },
    { depth: centroidDepth(parts.neck.poly, base + NECK_Z0 + 1), k: 'neck' },
    { depth: centroidDepth(parts.head.poly, base + HEAD_Z), k: 'head' },
  ];
  sortByDepth(items);
  for (const it of items) {
    switch (it.k) {
      case 'tail': {
        // Tapered line just above the floor.
        const spine = [[-R * 0.8, 0], [-R * 1.5, R * 0.14], [-R * 2.1, R * 0.02], [-R * 2.4, -R * 0.25]];
        ctx.strokeStyle = withAlpha(stroke, 0.8);
        for (let i = 0; i + 1 < spine.length; i++) {
          const a = toW(spine[i], base + 0.5 - i * 0.1), b = toW(spine[i + 1], base + 0.4 - i * 0.1);
          const sg = projectSegment(cam, a[0], a[1], a[2], b[0], b[1], b[2], w, h);
          if (!sg) continue;
          ctx.lineWidth = Math.max(1.5, sg[0].scale * (1.5 - i * 0.4));
          ctx.beginPath(); ctx.moveTo(sg[0].x, sg[0].y); ctx.lineTo(sg[1].x, sg[1].y); ctx.stroke();
        }
        break;
      }
      case 'wingL':
      case 'wingR':
        floorPoly(ctx, cam, parts[it.k].poly.map((q) => toW(q, base + WING_Z)), w, h, withAlpha(pal.boss, 0.18), withAlpha(stroke, 0.7), 1.5);
        break;
      case 'body': {
        // Low slab: 8 very faint side faces with stronger edges, flat top.
        const n = 8;
        const bottom = [], top = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const q = [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.62];
          bottom.push(toW(q, base + 0.1)); top.push(toW(q, base + BODY_H));
        }
        const sides = [];
        for (let i = 0; i < n; i++) {
          const a = bottom[i], b = bottom[(i + 1) % n], c = top[(i + 1) % n], d = top[i];
          sides.push({ depth: depthOf(cam, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, base + BODY_H / 2), quad: [a, b, c, d] });
        }
        sortByDepth(sides);
        for (const sd of sides) floorPoly(ctx, cam, sd.quad, w, h, withAlpha(pal.bossSolid, 0.08), withAlpha(stroke, 0.55), 1.2);
        floorPoly(ctx, cam, top, w, h, withAlpha(pal.boss, 0.22), withAlpha(stroke, 0.9), 2);
        break;
      }
      case 'neck': {
        // Wedge rising from the body to head height.
        const np = parts.neck.poly;
        const top = [toW(np[0], base + NECK_Z0 + 1), toW(np[1], base + HEAD_Z), toW(np[2], base + HEAD_Z), toW(np[3], base + NECK_Z0 + 1)];
        floorPoly(ctx, cam, top, w, h, withAlpha(pal.boss, 0.3), withAlpha(stroke, 0.9), 1.5);
        ctx.strokeStyle = withAlpha(stroke, 0.5); ctx.lineWidth = 1;
        ctx.beginPath();
        strokeSeg(ctx, cam, toW(np[1], base + 0.1), top[1], w, h);
        strokeSeg(ctx, cam, toW(np[2], base + 0.1), top[2], w, h);
        ctx.stroke();
        break;
      }
      case 'head': {
        const top = parts.head.poly.map((q) => toW(q, base + HEAD_Z));
        const bot = parts.head.poly.map((q) => toW(q, base + HEAD_Z - 1.6));
        floorPoly(ctx, cam, bot, w, h, withAlpha(pal.boss, 0.2), withAlpha(stroke, 0.6), 1);
        ctx.strokeStyle = withAlpha(stroke, 0.6); ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < top.length; i++) strokeSeg(ctx, cam, bot[i], top[i], w, h);
        ctx.stroke();
        floorPoly(ctx, cam, top, w, h, withAlpha(pal.bossSolid, 0.45), stroke, 2);
        // Unmistakable front: bright chevron on the snout plus a label above it.
        floorPoly(ctx, cam, parts.marker.poly.map((q) => toW(q, base + HEAD_Z + 0.3)), w, h, pal.bossFront, null);
        const lbl = toW([R * 2.1, 0], base + HEAD_Z + 1.6);
        const label = project(cam, lbl[0], lbl[1], lbl[2], w, h);
        if (label) {
          const px = Math.max(10, Math.min(26, label.scale * 2));
          ctx.font = `700 ${px}px ${pal.fontDisplay}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ctx.fillStyle = pal.bossFront;
          ctx.fillText('FRONT', label.x, label.y);
        }
        break;
      }
      default: break;
    }
  }
  // Target ring when she is on the raid.
  if (boss.target === 'raid' && boss.engaged && !airborne) {
    const pulse = 0.5 + 0.5 * Math.sin(now * 10);
    floorPoly(ctx, cam, circlePoly(boss.x, boss.y, R * 1.25, 28).map(([x, y]) => [x, y, 0.06]), w, h, null, withAlpha(pal.bad, 0.4 + pulse * 0.5), 3);
  }
}

/** A small standing figure: capsule body + head + shield, drawn from projected points. */
function drawFigure(ctx, cam, x, y, heading, w, h, color, alpha, dashed, now, feared = false, stroke = color, z = 0) {
  const base = project(cam, x, y, 0.05 + z, w, h);
  const top = project(cam, x, y, 1.75 + z, w, h);
  const head = project(cam, x, y, 2.05 + z, w, h);
  const shadow = z > 0 ? project(cam, x, y, 0.05, w, h) : base;
  if (!base || !top || !head || !shadow) return;
  const jitter = feared ? Math.sin(now * 40) * base.scale * 0.15 : 0;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (dashed) ctx.setLineDash([6, 4]);
  // ground ring (stays on the floor while the figure is in the air)
  ctx.strokeStyle = withAlpha(color, 0.6); ctx.lineWidth = Math.max(1, shadow.scale * 0.1);
  ctx.beginPath(); ctx.ellipse(shadow.x, shadow.y, Math.max(2, shadow.scale * 1.1), Math.max(1, shadow.scale * 0.45), 0, 0, Math.PI * 2); ctx.stroke();
  // body capsule
  ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(3, base.scale * 0.75); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(base.x + jitter, base.y - base.scale * 0.2); ctx.lineTo(top.x + jitter, top.y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(head.x + jitter, head.y, Math.max(2, base.scale * 0.32), 0, Math.PI * 2); ctx.fill();
  // facing: a small chevron on the floor 1.6 yd ahead plus a thin, faint 4 yd line
  const c = Math.cos(heading), sn = Math.sin(heading);
  const tip = project(cam, x + c * 1.6, y + sn * 1.6, 0.05, w, h);
  const al = project(cam, x + c * 1.0 - sn * 0.5, y + sn * 1.0 + c * 0.5, 0.05, w, h);
  const ar = project(cam, x + c * 1.0 + sn * 0.5, y + sn * 1.0 - c * 0.5, 0.05, w, h);
  ctx.setLineDash([]);
  if (tip && al && ar) {
    ctx.strokeStyle = withAlpha(color, 0.9); ctx.lineWidth = Math.max(1.5, base.scale * 0.12);
    ctx.beginPath(); ctx.moveTo(al.x, al.y); ctx.lineTo(tip.x, tip.y); ctx.lineTo(ar.x, ar.y); ctx.stroke();
  }
  const l0 = project(cam, x + c * 0.9, y + sn * 0.9, 0.05, w, h);
  const l1 = project(cam, x + c * 4.0, y + sn * 4.0, 0.05, w, h);
  if (l0 && l1) {
    ctx.strokeStyle = withAlpha(color, 0.35); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(l0.x, l0.y); ctx.lineTo(l1.x, l1.y); ctx.stroke();
  }
  // shield on the left arm
  const sx = x + Math.cos(heading + Math.PI / 2) * 0.7, sy = y + Math.sin(heading + Math.PI / 2) * 0.7;
  const s0 = project(cam, sx, sy, 0.7 + z, w, h), s1 = project(cam, sx, sy, 1.5 + z, w, h);
  if (s0 && s1) { ctx.strokeStyle = withAlpha(stroke, 0.9); ctx.lineWidth = Math.max(2, base.scale * 0.35); ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke(); }
  ctx.restore();
}
