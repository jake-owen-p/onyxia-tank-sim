// Corner minimap for the POV view: a compact, north-up map of the whole arena
// drawn with the top-down module's world drawer.

import { mapTransform, drawMapWorld } from './topdown.js';
import { roundRect } from './shapes.js';

/** Returns the minimap box so other layers can avoid it. */
export function minimapBox(w, h) {
  const size = Math.round(Math.min(w, h) * 0.22);
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));
  const narrow = w < h;
  // Bottom-right normally; top-right (under the corner text) on portrait screens
  // where the timeline takes the full width.
  const x = w - size - u * 0.8;
  const y = narrow ? u * 2.2 : h - size - u * 0.9;
  return { x, y, w: size, h: size };
}

export function drawMinimap(ctx, view, script, settings, pal, w, h, now) {
  const box = minimapBox(w, h);
  const r = Math.max(6, box.w * 0.06);
  ctx.save();
  roundRect(ctx, box.x, box.y, box.w, box.h, r);
  ctx.fillStyle = pal.minimapBg;
  ctx.fill();
  const u = Math.max(12, Math.min(32, Math.min(w, h) / 45));
  ctx.strokeStyle = pal.panelEdge;
  ctx.lineWidth = Math.max(1, u / 16);
  ctx.stroke();
  roundRect(ctx, box.x, box.y, box.w, box.h, r);
  ctx.clip();
  const tr = mapTransform(script, box, box.w * 0.06);
  drawMapWorld(ctx, view, script, settings, pal, tr, now, { compact: true });
  // north tick
  ctx.font = `700 ${Math.max(9, box.w * 0.07)}px ${pal.font}`;
  ctx.fillStyle = pal.textMuted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('N', box.x + box.w / 2, box.y + 3);
  ctx.restore();
}
