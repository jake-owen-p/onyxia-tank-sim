// Pure 2D geometry helpers. World units are yards; angles are radians,
// 0 = +x (east), PI/2 = +y (north). Nothing here touches the DOM.

export const TAU = Math.PI * 2;

export const rad = (deg) => (deg * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

/** Normalise an angle into (-PI, PI]. */
export function normAngle(a) {
  a = a % TAU;
  if (a > Math.PI) a -= TAU;
  if (a <= -Math.PI) a += TAU;
  return a;
}

/** Signed shortest rotation from angle a to angle b. */
export function angleDelta(a, b) {
  return normAngle(b - a);
}

/** Rotate `a` toward `b` by at most `maxStep` radians. */
export function turnToward(a, b, maxStep) {
  const d = angleDelta(a, b);
  if (Math.abs(d) <= maxStep) return normAngle(b);
  return normAngle(a + Math.sign(d) * maxStep);
}

export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Ray-casting point-in-polygon. `poly` is [[x,y], ...]. */
export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersects = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Is point (px,py) inside a cone with apex (ox,oy), centre direction `heading`,
 * total opening angle `angle` (radians) and length `range`?
 * The apex itself counts as inside.
 */
export function inCone(px, py, ox, oy, heading, angle, range) {
  const dx = px - ox, dy = py - oy;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (d < 1e-6) return true;
  const a = Math.abs(angleDelta(heading, Math.atan2(dy, dx)));
  return a <= angle / 2;
}

/** Distance from point to segment ab. */
export function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const l2 = abx * abx + aby * aby;
  let t = l2 === 0 ? 0 : ((px - ax) * abx + (py - ay) * aby) / l2;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

/** Distance from point to a polyline [[x,y], ...]. */
export function distToPolyline(px, py, pts) {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const d = distToSegment(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    if (d < best) best = d;
  }
  return best;
}

/** Distance from point to the boundary of a closed polygon. */
export function distToPolyEdge(px, py, poly) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const d = distToSegment(px, py, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
    if (d < best) best = d;
  }
  return best;
}

/** Area centroid of a polygon. */
export function polyCentroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return { x: x / poly.length, y: y / poly.length };
}

/** Axis-aligned-free rectangle from a->b with the given total width, as a polygon. */
export function laneRect(from, to, width) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (width / 2), ny = (dx / l) * (width / 2);
  return [
    [from[0] + nx, from[1] + ny],
    [to[0] + nx, to[1] + ny],
    [to[0] - nx, to[1] - ny],
    [from[0] - nx, from[1] - ny],
  ];
}

/**
 * Nearest point outside a lane for a point at (px,py). The lane runs from->to with
 * total `width`; `margin` is extra clearance. If the point is already outside by
 * more than `margin` it is returned unchanged.
 */
export function escapeLane(px, py, from, to, width, margin = 3) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l;        // along the lane
  const nx = -uy, ny = ux;               // perpendicular
  const rx = px - from[0], ry = py - from[1];
  const side = rx * nx + ry * ny;        // signed perpendicular offset
  const need = width / 2 + margin;
  if (Math.abs(side) >= need) return { x: px, y: py, moved: false };
  const s = side >= 0 ? 1 : -1;
  const shift = need * s - side;
  return { x: px + nx * shift, y: py + ny * shift, moved: true };
}

/** Is a point on any floor polygon? */
export function onFloor(x, y, floors) {
  for (const f of floors) if (pointInPoly(x, y, f.poly)) return true;
  return false;
}

/**
 * Move from (x,y) by (dx,dy) staying on the floor. Slides along walls by trying
 * the full move, then each axis alone. Returns the new position.
 */
export function moveWithCollision(x, y, dx, dy, floors) {
  if (onFloor(x + dx, y + dy, floors)) return { x: x + dx, y: y + dy, blocked: false };
  if (onFloor(x + dx, y, floors)) return { x: x + dx, y, blocked: true };
  if (onFloor(x, y + dy, floors)) return { x, y: y + dy, blocked: true };
  return { x, y, blocked: true };
}

/** Random point offset helpers used by raid/whelp placement. */
export function offsetPoint(x, y, heading, forward, right) {
  const c = Math.cos(heading), s = Math.sin(heading);
  return { x: x + c * forward + s * right, y: y + s * forward - c * right };
}

/** Polygon approximation of a circle (for hazard zones), n points. */
export function circlePoints(x, y, r, n = 20) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return pts;
}

/** Nearest point outside a circle of radius r (+margin) for a point at (px,py). */
export function escapeCircle(px, py, cx, cy, r, margin = 3) {
  const d = Math.hypot(px - cx, py - cy);
  const need = r + margin;
  if (d >= need) return { x: px, y: py, moved: false };
  const a = d < 1e-6 ? 0 : Math.atan2(py - cy, px - cx);
  return { x: cx + Math.cos(a) * need, y: cy + Math.sin(a) * need, moved: true };
}
