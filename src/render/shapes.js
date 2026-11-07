// Shared drawing primitives: the boss silhouette as polygons (used flat in the
// top-down view and projected in POV), small figures, and the ability/action
// icon glyphs. All boss/figure geometry is defined in local coordinates
// [forward, left] in yards and transformed by the caller.

/** Points of an ellipse in local coords, centred at (cx, cl). */
function ellipse(cx, cl, rf, rl, n = 18) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rf, cl + Math.sin(a) * rl]);
  }
  return pts;
}

const footprintCache = new Map();

/**
 * Boss footprint polygons for a body radius R. Local coords: +x forward, +y left.
 * Each part carries a nominal height band used by the POV renderer.
 */
export function bossFootprint(R) {
  if (footprintCache.has(R)) return footprintCache.get(R);
  const parts = {
    body: { poly: ellipse(0, 0, R * 0.95, R * 0.62), z0: 0, z1: R * 0.6 },
    neck: { poly: [[R * 0.7, R * 0.22], [R * 1.35, R * 0.12], [R * 1.35, -R * 0.12], [R * 0.7, -R * 0.22]], z0: R * 0.35, z1: R * 0.7 },
    head: { poly: [[R * 1.3, R * 0.22], [R * 1.72, R * 0.1], [R * 1.85, 0], [R * 1.72, -R * 0.1], [R * 1.3, -R * 0.22]], z0: R * 0.5, z1: R * 0.75 },
    wingL: { poly: [[R * 0.45, R * 0.45], [-R * 0.2, R * 1.75], [-R * 0.95, R * 1.55], [-R * 0.55, R * 0.5]], z0: R * 0.45, z1: R * 0.6 },
    wingR: { poly: [[R * 0.45, -R * 0.45], [-R * 0.2, -R * 1.75], [-R * 0.95, -R * 1.55], [-R * 0.55, -R * 0.5]], z0: R * 0.45, z1: R * 0.6 },
    tail: { poly: [[-R * 0.8, R * 0.18], [-R * 1.5, R * 0.3], [-R * 2.1, R * 0.05], [-R * 2.4, -R * 0.25], [-R * 2.05, -R * 0.12], [-R * 1.5, -R * 0.02], [-R * 0.8, -R * 0.18]], z0: R * 0.12, z1: R * 0.3 },
    // Front marker: a bright chevron just ahead of the snout.
    // Kept small: it sits above the tank's head in POV, so anything bigger fills the frame.
    marker: { poly: [[R * 1.78, R * 0.11], [R * 1.98, 0], [R * 1.78, -R * 0.11], [R * 1.84, 0]], z0: R * 0.55, z1: R * 0.55 },
  };
  footprintCache.set(R, parts);
  return parts;
}

/** Local [forward, left] -> world [x, y] for an entity at (x, y) facing `heading`. */
export function localToWorld(p, x, y, heading) {
  const c = Math.cos(heading), s = Math.sin(heading);
  return [x + c * p[0] - s * p[1], y + s * p[0] + c * p[1]];
}

/** Trace a polygon path from an array of [x, y] points (any space). */
export function tracePoly(ctx, pts) {
  if (!pts.length) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

/** Trace a polygon path from an array of {x, y} screen points. */
export function traceScreenPoly(ctx, pts) {
  if (!pts.length) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

/**
 * Draw the boss silhouette flat (top-down) in world units. The ctx must already
 * be in world space (yards). `opts`: fill, stroke, front, lineWidth, dashed, alpha.
 */
export function drawBossFlat(ctx, x, y, heading, R, opts) {
  const parts = bossFootprint(R);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.globalAlpha *= opts.alpha ?? 1;
  ctx.lineWidth = opts.lineWidth ?? 0.4;
  ctx.lineJoin = 'round';
  if (opts.dashed) ctx.setLineDash([1.2, 0.9]);
  const order = ['tail', 'wingL', 'wingR', 'body', 'neck', 'head'];
  for (const k of order) {
    ctx.beginPath();
    tracePoly(ctx, parts[k].poly);
    if (opts.fill) { ctx.fillStyle = opts.fill; ctx.fill(); }
    if (opts.stroke) { ctx.strokeStyle = opts.stroke; ctx.stroke(); }
  }
  ctx.setLineDash([]);
  // Unmistakable front marker.
  ctx.beginPath();
  tracePoly(ctx, parts.marker.poly);
  ctx.fillStyle = opts.front || '#ffe066';
  ctx.fill();
  ctx.restore();
}

/** A small tank figure seen from above: disc + facing wedge. World units. */
export function drawFigureFlat(ctx, x, y, heading, opts) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.globalAlpha *= opts.alpha ?? 1;
  const r = opts.radius ?? 1.1;
  if (opts.dashed) ctx.setLineDash([0.5, 0.4]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = opts.fill;
  ctx.fill();
  if (opts.stroke) { ctx.lineWidth = opts.lineWidth ?? 0.25; ctx.strokeStyle = opts.stroke; ctx.stroke(); }
  ctx.setLineDash([]);
  // facing wedge
  ctx.beginPath();
  ctx.moveTo(r * 0.2, 0);
  ctx.lineTo(r * 2.1, 0);
  ctx.lineTo(r * 1.2, r * 0.55);
  ctx.moveTo(r * 2.1, 0);
  ctx.lineTo(r * 1.2, -r * 0.55);
  ctx.lineWidth = opts.lineWidth ?? 0.25;
  ctx.strokeStyle = opts.stroke || opts.fill;
  ctx.stroke();
  // shield on the left arm (a tank)
  if (opts.shield) {
    ctx.beginPath();
    ctx.arc(0, r * 1.05, r * 0.45, Math.PI * 0.2, Math.PI * 0.8);
    ctx.strokeStyle = opts.shield;
    ctx.stroke();
  }
  ctx.restore();
}

/** Whelp: a small triangle pointing along heading. World units. */
export function drawWhelpFlat(ctx, x, y, heading, color, size = 1.3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.7, size * 0.7);
  ctx.lineTo(-size * 0.7, -size * 0.7);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Local polygon for the whelp (for projection). */
export function whelpPoly(size = 1.3) {
  return [[size, 0], [-size * 0.7, size * 0.7], [-size * 0.7, -size * 0.7]];
}

/** Cone fan polygon in world coords: apex (x,y), centre `heading`, total `angle`, `range`. */
export function conePoly(x, y, heading, angle, range, n = 14) {
  const pts = [[x, y]];
  for (let i = 0; i <= n; i++) {
    const a = heading - angle / 2 + (angle * i) / n;
    pts.push([x + Math.cos(a) * range, y + Math.sin(a) * range]);
  }
  return pts;
}

/** Circle polygon in world coords. */
export function circlePoly(x, y, r, n = 20) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return pts;
}

/** Rounded rectangle path (screen space). */
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

// ------------------------------------------------------------------ icons

/**
 * Draw a glyph for an ability/action id centred at (x, y) with the given size
 * (the glyph fits a size x size box). Two colours: `color` (main) and `accent`.
 */
export function drawIcon(ctx, id, x, y, size, color, accent = color) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  switch (id) {
    case 'taunt': { // shout: a mouth with sound arcs
      ctx.beginPath(); ctx.arc(-s * 0.3, 0, s * 0.35, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s * 0.3, 0, s * 0.65, -0.6, 0.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s * 0.3, 0, s * 0.95, -0.5, 0.5); ctx.stroke();
      break;
    }
    case 'attack': { // sword
      ctx.beginPath(); ctx.moveTo(-s * 0.75, s * 0.75); ctx.lineTo(s * 0.45, -s * 0.45); ctx.stroke();
      ctx.lineWidth = Math.max(2, size * 0.14);
      ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.75); ctx.lineTo(s * 0.75, -s * 0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.55, s * 0.3); ctx.lineTo(-s * 0.3, s * 0.55); ctx.stroke();
      break;
    }
    case 'heal': { // bold cross with a glow
      ctx.lineWidth = Math.max(2.5, size * 0.22); ctx.strokeStyle = accent;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.8); ctx.lineTo(0, s * 0.8); ctx.moveTo(-s * 0.8, 0); ctx.lineTo(s * 0.8, 0); ctx.stroke();
      break;
    }
    case 'dispel': { // sparkle: four-point star and two dots
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(s * 0.22, -s * 0.22); ctx.lineTo(s * 0.9, 0); ctx.lineTo(s * 0.22, s * 0.22); ctx.lineTo(0, s * 0.9); ctx.lineTo(-s * 0.22, s * 0.22); ctx.lineTo(-s * 0.9, 0); ctx.lineTo(-s * 0.22, -s * 0.22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.65, -s * 0.65, s * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-s * 0.65, s * 0.6, s * 0.1, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'interrupt': { // lightning bolt
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.9); ctx.lineTo(-s * 0.6, s * 0.1); ctx.lineTo(0, s * 0.1); ctx.lineTo(-s * 0.2, s * 0.9); ctx.lineTo(s * 0.6, -s * 0.15); ctx.lineTo(0, -s * 0.15); ctx.closePath(); ctx.fill();
      break;
    }
    case 'aggro': { // exclamation: someone pulled aggro
      ctx.lineWidth = Math.max(2, size * 0.16);
      ctx.beginPath(); ctx.moveTo(0, -s * 0.85); ctx.lineTo(0, s * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, s * 0.72, Math.max(1.5, size * 0.09), 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'breath': { // flame cone
      ctx.beginPath(); ctx.moveTo(-s * 0.8, 0); ctx.lineTo(s * 0.8, -s * 0.8); ctx.quadraticCurveTo(s * 0.2, 0, s * 0.8, s * 0.8); ctx.closePath();
      ctx.fillStyle = accent; ctx.fill();
      ctx.beginPath(); ctx.arc(-s * 0.8, 0, s * 0.28, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cleave': { // axe swing arc
      ctx.beginPath(); ctx.arc(-s * 0.2, s * 0.2, s * 0.9, -Math.PI * 0.85, -Math.PI * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.2, s * 0.2); ctx.lineTo(s * 0.5, -s * 0.5); ctx.stroke();
      break;
    }
    case 'buffet': { // wing with motion lines
      ctx.beginPath(); ctx.moveTo(-s * 0.9, s * 0.3); ctx.quadraticCurveTo(-s * 0.2, -s * 0.9, s * 0.9, -s * 0.5);
      ctx.quadraticCurveTo(s * 0.3, -s * 0.1, s * 0.5, s * 0.6); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.beginPath(); ctx.moveTo(-s * 0.9, s * 0.75); ctx.lineTo(-s * 0.3, s * 0.75); ctx.moveTo(-s * 0.6, s * 0.95); ctx.lineTo(0, s * 0.95); ctx.stroke();
      break;
    }
    case 'tail': { // curling tail
      ctx.beginPath(); ctx.moveTo(-s * 0.9, s * 0.7); ctx.quadraticCurveTo(-s * 0.2, -s * 0.9, s * 0.5, -s * 0.2);
      ctx.quadraticCurveTo(s * 0.9, 0.1 * s, s * 0.5, s * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * 0.5, s * 0.5); ctx.lineTo(s * 0.95, s * 0.75); ctx.lineTo(s * 0.35, s * 0.9); ctx.closePath(); ctx.fill();
      break;
    }
    case 'fireball': { // comet
      ctx.beginPath(); ctx.arc(s * 0.3, s * 0.3, s * 0.4, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.0, s * 0.0); ctx.lineTo(-s * 0.9, -s * 0.9); ctx.moveTo(s * 0.35, -s * 0.2); ctx.lineTo(-s * 0.4, -s * 0.95); ctx.stroke();
      break;
    }
    case 'deepbreath': { // lane with flames
      ctx.strokeRect(-s * 0.9, -s * 0.35, s * 1.8, s * 0.7);
      ctx.fillStyle = accent;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * s * 0.55 - s * 0.2, s * 0.3); ctx.lineTo(i * s * 0.55, -s * 0.25); ctx.lineTo(i * s * 0.55 + s * 0.2, s * 0.3); ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'whelps': { // three small triangles
      ctx.fillStyle = accent;
      for (const [dx, dy] of [[-0.55, 0.3], [0.55, 0.3], [0, -0.45]]) {
        ctx.beginPath(); ctx.moveTo(dx * s, dy * s - s * 0.4); ctx.lineTo(dx * s + s * 0.35, dy * s + s * 0.3); ctx.lineTo(dx * s - s * 0.35, dy * s + s * 0.3); ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'roar': { // concentric arcs from a point
      ctx.beginPath(); ctx.arc(0, s * 0.3, s * 0.2, 0, Math.PI * 2); ctx.fill();
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(0, s * 0.3, s * 0.3 * i + s * 0.05, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); }
      break;
    }
    case 'eruption': { // jagged crack
      ctx.strokeStyle = accent;
      ctx.beginPath(); ctx.moveTo(-s * 0.8, s * 0.8); ctx.lineTo(-s * 0.3, s * 0.1); ctx.lineTo(-s * 0.5, -s * 0.2); ctx.lineTo(s * 0.1, -s * 0.3); ctx.lineTo(s * 0.0, -s * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.1); ctx.lineTo(s * 0.4, s * 0.4); ctx.lineTo(s * 0.85, s * 0.2); ctx.stroke();
      break;
    }
    case 'landing': { // arrow down to a line
      ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.35); ctx.moveTo(-s * 0.45, -s * 0.1); ctx.lineTo(0, s * 0.35); ctx.lineTo(s * 0.45, -s * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.8, s * 0.75); ctx.lineTo(s * 0.8, s * 0.75); ctx.stroke();
      break;
    }
    case 'takeoff': { // arrow up from a line
      ctx.beginPath(); ctx.moveTo(0, s * 0.35); ctx.lineTo(0, -s * 0.9); ctx.moveTo(-s * 0.45, -s * 0.45); ctx.lineTo(0, -s * 0.9); ctx.lineTo(s * 0.45, -s * 0.45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * 0.8, s * 0.75); ctx.lineTo(s * 0.8, s * 0.75); ctx.stroke();
      break;
    }
    default: {
      ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

/** Small feedback glyphs for the HUD. */
export function drawTick(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.02);
  ctx.lineTo(x - size * 0.12, y + size * 0.38);
  ctx.lineTo(x + size * 0.5, y - size * 0.4);
  ctx.stroke();
  ctx.restore();
}

export function drawCross(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.4); ctx.lineTo(x + size * 0.4, y + size * 0.4);
  ctx.moveTo(x + size * 0.4, y - size * 0.4); ctx.lineTo(x - size * 0.4, y + size * 0.4);
  ctx.stroke();
  ctx.restore();
}

/** Arrow from (ax,ay) to (bx,by) in the current space; `head` is the head size. */
export function drawArrow(ctx, ax, ay, bx, by, head, color, lineWidth) {
  const a = Math.atan2(by - ay, bx - ax);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx - Math.cos(a) * head * 0.8, by - Math.sin(a) * head * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx - Math.cos(a - 0.5) * head, by - Math.sin(a - 0.5) * head);
  ctx.lineTo(bx - Math.cos(a + 0.5) * head, by - Math.sin(a + 0.5) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
