// North-up circular minimap. World symbols remain owned by drawMapWorld.
import { arenaBounds, mapTransform, drawMapWorld } from './topdown.js';
import {
  cached,
  circle,
  gradient,
  label,
  frame,
  C,
  TITLE_FONT,
  fit,
} from './ui/art.js';

export function minimapBox(w, h) {
  const mobile = w < 680,
    s = mobile ? 0.8 : Math.max(0.82, Math.min(1.5, w / 1440, h / 900));
  const size = (mobile ? 116 : 172) * s;
  return { x: w - size - 24 * s, y: 43 * s, w: size, h: size };
}
export function drawMinimap(ctx, view, script, settings, pal, w, h, now) {
  const box = minimapBox(w, h),
    { x, y, w: size } = box,
    cx = x + size / 2,
    cy = y + size / 2,
    r = size / 2;
  ctx.save();
  circle(ctx, cx, cy, r, '#161d1a');
  ctx.clip();
  // Inscribe the arena bounds in the circle so corner hazards and players
  // remain visible even in square rooms.
  const bounds = arenaBounds(script);
  const pad =
    (size -
      ((size - 14) * Math.max(bounds.w, bounds.h)) /
        Math.hypot(bounds.w, bounds.h)) /
    2;
  const tr = mapTransform(script, box, pad);
  drawMapWorld(ctx, view, script, settings, pal, tr, now, { compact: true });
  ctx.restore();
  cached(ctx, 'minimap-ring', x - 10, y - 10, size + 20, size + 20, (c) => {
    const rr = size / 2,
      cc = rr + 10;
    circle(c, cc, cc, rr + 5, null, '#080a0b', 10);
    circle(
      c,
      cc,
      cc,
      rr + 4,
      null,
      gradient(c, 0, 0, 0, size, [
        [0, '#cfcdba'],
        [0.25, '#6a706b'],
        [0.5, '#323939'],
        [0.8, '#9a9b87'],
        [1, '#393d3b'],
      ]),
      8,
    );
    circle(c, cc, cc, rr + 1, null, '#d1b56b', 1.5);
    circle(c, cc, cc, rr - 2, null, '#0c0f10', 2);
    circle(c, cc, cc, rr + 8, null, '#8b794c', 1);
    for (let i = 0; i < 32; i++) {
      const a = (i * Math.PI) / 16;
      c.strokeStyle = i % 4 === 0 ? '#d5c489' : '#1d2421';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(cc + Math.cos(a) * (rr + 2), cc + Math.sin(a) * (rr + 2));
      c.lineTo(cc + Math.cos(a) * (rr + 6), cc + Math.sin(a) * (rr + 6));
      c.stroke();
    }
  });
  const plateW = size + 22,
    plateY = y - 30;
  frame(ctx, cx - plateW / 2, plateY, plateW, 21);
  ctx.font = `400 11px ${TITLE_FONT}`;
  label(
    ctx,
    fit(ctx, script.arena.name, plateW - 14),
    cx,
    plateY + 10,
    11,
    C.light,
    'center',
    true,
  );
  label(ctx, 'N', cx, y - 1, 14, C.light, 'center', true);
  circle(ctx, x + size - 6, y + size - 7, 12, '#161d21', '#9c8e63', 2);
  label(ctx, '+', x + size - 6, y + size - 7, 17, C.light, 'center');
  label(
    ctx,
    `${Math.floor(view.t / 60)}:${String(Math.floor(view.t % 60)).padStart(2, '0')}`,
    cx,
    y + size + 17,
    11,
    C.text,
    'center',
  );
}
