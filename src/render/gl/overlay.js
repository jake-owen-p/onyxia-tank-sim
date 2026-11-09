// Text and bars that float over the 3D world: hazard countdowns, add health,
// name plates and the map view's labels.

import { project } from '../projection.js';
import { arenaBounds } from '../topdown.js';

const withAlpha = (c, a) => {
  if (c[0] === '#' && c.length >= 7) { const n = parseInt(c.slice(1, 7), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
  return c;
};

function outlined(ctx, text, x, y, fill, width) {
  ctx.lineWidth = width; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

export function drawWorldOverlay(ctx, view, script, settings, pal, cam, w, h, now, mode, bossTop = null) {
  const wd = view.world, t = view.t, boss = wd.boss;
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';

  // Map labels.
  if (mode === 'map' && script.arena.labels) {
    const B = arenaBounds(script), ccx = (B.minx + B.maxx) / 2, ccy = (B.miny + B.maxy) / 2;
    ctx.font = `600 ${Math.max(10, u * 0.72)}px ${pal.font}`;
    for (const l of script.arena.labels) {
      const a = Math.atan2(l.at[1] - ccy, l.at[0] - ccx);
      const s = project(cam, l.at[0] + Math.cos(a) * 4, l.at[1] + Math.sin(a) * 4, 0, w, h);
      if (s) outlined(ctx, l.text.toUpperCase(), s.x, s.y, withAlpha(pal.text, 0.72), 3);
    }
  }

  // Hazard countdowns.
  for (const hz of wd.hazards) {
    if (hz.state !== 'warning') continue;
    if (mode === 'map' && hz.kind !== 'lane' && hz.poly.length > 40) continue;
    let cx = 0, cy = 0;
    for (const [x, y] of hz.poly) { cx += x; cy += y; }
    cx /= hz.poly.length; cy /= hz.poly.length;
    const left = Math.max(0, hz.activeAt - t);
    const s = project(cam, cx, cy, mode === 'map' ? 0 : 1.5, w, h);
    if (!s) continue;
    const px = Math.max(13, Math.min(u * 3, s.scale * (mode === 'map' ? 2.2 : 3)));
    ctx.font = `800 ${px}px ${pal.fontDisplay}`;
    outlined(ctx, `${Math.ceil(left)}`, s.x, s.y, pal.hazardWarn, Math.max(3, px * 0.14));
  }

  // Adds: health and who you are hitting.
  for (const wh of wd.whelps) {
    if (!wh.killable) continue;
    const s = project(cam, wh.x, wh.y, 2.4, w, h);
    if (!s) continue;
    const bw = Math.max(26, s.scale * 2.6), by = s.y;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(s.x - bw / 2 - 1, by - 1, bw + 2, 6);
    ctx.fillStyle = wh.priority ? pal.bad : pal.good; ctx.fillRect(s.x - bw / 2, by, bw * Math.max(0, wh.hp), 4);
    if (view.feedback && view.feedback.target && view.feedback.target.add === wh.uid) { ctx.strokeStyle = pal.accent; ctx.lineWidth = 2; ctx.strokeRect(s.x - bw / 2 - 3, by - 3, bw + 6, 10); }
  }

  // Boss states and the name over its head.
  const tag = boss.state === 'submerged' ? 'SUBMERGED' : boss.state === 'airborne' ? 'AIRBORNE' : null;
  const s = project(cam, boss.x, boss.y, (bossTop ?? (boss.z || 0) + script.boss.radius * 1.5) + 1.5, w, h);
  if (s && s.y > u * 2) {
    const px = Math.max(12, Math.min(u, s.scale * 1.6));
    ctx.font = `700 ${px}px ${pal.fontDisplay}`;
    if (tag) outlined(ctx, tag, s.x, s.y, pal.bossStroke, 3);
    else if (mode === 'pov') outlined(ctx, script.name, s.x, s.y, '#ff4a3a', 3);
  }

  const g = wd.ghost;
  if (g && g.tanking && mode === 'pov') {
    const gs = project(cam, g.x, g.y, 3, w, h);
    if (gs) { ctx.font = `600 ${Math.max(11, u * 0.62)}px ${pal.font}`; outlined(ctx, 'Tank', gs.x, gs.y, '#7fc4ff', 3); }
  }
  ctx.restore();
  void now;
}
