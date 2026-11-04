// Perspective projection for the POV renderer. This is the only module that
// knows how world (x east, y north, z up) becomes screen pixels, so the POV
// view can be swapped for a real game camera later without touching anything
// else. Pure maths: no Canvas, no DOM.

import { angleDelta, normAngle, clamp } from '../core/geometry.js';

const NEAR = 0.5;

/** A chase camera. Yaw/pitch are derived from position and look-at. */
export function createCamera() {
  return {
    x: 0, y: -20, z: 8,
    lookX: 0, lookY: 0, lookZ: 1.5,
    yaw: Math.PI / 2,           // smoothed facing the camera sits behind
    pitch: -0.32,
    fov: (60 * Math.PI) / 180,  // vertical field of view
    distance: 14,               // zoom: 6..40 yards behind the player
    near: NEAR,
    basis: null,                // cached orthonormal basis, rebuilt by updateBasis
    initialised: false,
  };
}

export const ZOOM_MIN = 6;
export const ZOOM_MAX = 40;

/**
 * Third-person over-the-shoulder camera, WoW default style: behind and above
 * the player, yaw eases toward the player's heading, looking at a point just
 * above the player's head.
 */
export function updateChaseCamera(cam, player, { distance = cam.distance, dtReal = 1 / 60 } = {}) {
  cam.distance = clamp(distance, ZOOM_MIN, ZOOM_MAX);
  const target = player.heading;
  if (!cam.initialised) { cam.yaw = target; cam.initialised = true; }
  else {
    // Exponential ease: fast enough to feel attached, slow enough to be smooth.
    const k = 1 - Math.exp(-dtReal * 9);
    cam.yaw = normAngle(cam.yaw + angleDelta(cam.yaw, target) * k);
  }
  const d = cam.distance;
  const height = 1.6 + d * 0.42;
  cam.lookX = player.x; cam.lookY = player.y; cam.lookZ = 1.6 + d * 0.04;
  cam.x = player.x - Math.cos(cam.yaw) * d;
  cam.y = player.y - Math.sin(cam.yaw) * d;
  cam.z = height;
  updateBasis(cam);
  return cam;
}

/** Rebuild the camera basis vectors (forward, right, up) from position and look-at. */
export function updateBasis(cam) {
  let fx = cam.lookX - cam.x, fy = cam.lookY - cam.y, fz = cam.lookZ - cam.z;
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;
  // right = forward x worldUp(0,0,1)
  let rx = fy * 1 - fz * 0, ry = fz * 0 - fx * 1, rz = 0;
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl; ry /= rl; rz /= rl;
  // up = right x forward
  const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  cam.basis = { fx, fy, fz, rx, ry, rz, ux, uy, uz };
  cam.pitch = Math.asin(fz);
  return cam;
}

/** World point -> camera space [right, up, depth]. */
export function toCamera(cam, wx, wy, wz, out = [0, 0, 0]) {
  const b = cam.basis || updateBasis(cam).basis;
  const dx = wx - cam.x, dy = wy - cam.y, dz = wz - cam.z;
  out[0] = dx * b.rx + dy * b.ry + dz * b.rz;
  out[1] = dx * b.ux + dy * b.uy + dz * b.uz;
  out[2] = dx * b.fx + dy * b.fy + dz * b.fz;
  return out;
}

export function focalLength(cam, h) {
  return (h / 2) / Math.tan(cam.fov / 2);
}

/** Camera-space point -> screen. Caller guarantees depth >= near. */
export function camToScreen(cam, cx, cy, cz, w, h) {
  const f = focalLength(cam, h);
  const s = f / cz;
  return { x: w / 2 + cx * s, y: h / 2 - cy * s, depth: cz, scale: s };
}

/**
 * Project a world point. Returns { x, y, depth, scale } where `scale` is
 * pixels per yard at that depth, or null when the point is behind the near plane.
 */
export function project(cam, wx, wy, wz, w, h) {
  const c = toCamera(cam, wx, wy, wz);
  if (c[2] < cam.near) return null;
  return camToScreen(cam, c[0], c[1], c[2], w, h);
}

/**
 * Project a polygon of world points [[x,y,z], ...] (z optional, default 0).
 * Clips against the near plane in camera space first (Sutherland-Hodgman), so
 * floor polygons that extend under the camera still draw. Returns screen points
 * [{x,y,depth}] or [] when nothing is in front of the camera.
 */
export function projectPoly(cam, pts, w, h) {
  const n = pts.length;
  if (n < 3) return [];
  const camPts = new Array(n);
  let allFront = true, anyFront = false;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const c = toCamera(cam, p[0], p[1], p[2] || 0, [0, 0, 0]);
    camPts[i] = c;
    if (c[2] < cam.near) allFront = false; else anyFront = true;
  }
  if (!anyFront) return [];
  const clipped = allFront ? camPts : clipNear(camPts, cam.near);
  if (clipped.length < 3) return [];
  const out = new Array(clipped.length);
  for (let i = 0; i < clipped.length; i++) {
    const c = clipped[i];
    out[i] = camToScreen(cam, c[0], c[1], c[2], w, h);
  }
  return out;
}

/** Project a world segment, clipping it to the near plane. Returns [a, b] or null. */
export function projectSegment(cam, ax, ay, az, bx, by, bz, w, h) {
  const a = toCamera(cam, ax, ay, az, [0, 0, 0]);
  const b = toCamera(cam, bx, by, bz, [0, 0, 0]);
  const near = cam.near;
  if (a[2] < near && b[2] < near) return null;
  if (a[2] < near || b[2] < near) {
    const t = (near - a[2]) / (b[2] - a[2]);
    const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near];
    if (a[2] < near) { a[0] = m[0]; a[1] = m[1]; a[2] = m[2]; }
    else { b[0] = m[0]; b[1] = m[1]; b[2] = m[2]; }
  }
  return [camToScreen(cam, a[0], a[1], a[2], w, h), camToScreen(cam, b[0], b[1], b[2], w, h)];
}

/** Sutherland-Hodgman clip of a camera-space polygon against depth >= near. */
export function clipNear(pts, near) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const cur = pts[i], prev = pts[(i + n - 1) % n];
    const curIn = cur[2] >= near, prevIn = prev[2] >= near;
    if (curIn) {
      if (!prevIn) out.push(intersectNear(prev, cur, near));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersectNear(prev, cur, near));
    }
  }
  return out;
}

function intersectNear(a, b, near) {
  const t = (near - a[2]) / (b[2] - a[2]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near];
}

/** Depth of a world point (distance along the camera's forward axis). */
export function depthOf(cam, wx, wy, wz = 0) {
  const b = cam.basis || updateBasis(cam).basis;
  return (wx - cam.x) * b.fx + (wy - cam.y) * b.fy + (wz - cam.z) * b.fz;
}

/** Sort drawables far-to-near (painter's algorithm). Items need a `depth` field. */
export function sortByDepth(items) {
  return items.sort((a, b) => b.depth - a.depth);
}

/** Screen y of the horizon: where the ground plane vanishes. */
export function horizonY(cam, w, h) {
  const b = cam.basis || updateBasis(cam).basis;
  // Direction straight ahead on the ground plane.
  const gx = b.fx, gy = b.fy;
  const gl = Math.hypot(gx, gy) || 1;
  const p = project(cam, cam.x + (gx / gl) * 10000, cam.y + (gy / gl) * 10000, cam.z, w, h);
  return p ? p.y : h * 0.4;
}
