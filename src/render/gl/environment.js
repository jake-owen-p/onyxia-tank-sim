// Builds a room from the encounter's floor polygons and wall polylines, dressed
// according to the zone theme: rock or masonry walls, ceiling or sky, the
// surrounding lava, sand or jungle, and set dressing kept to the room's edges
// so nothing stands in the way of the fight.

import { ModelBuilder } from './model.js';
import { fbm, hash, hex } from './math.js';

export const ENV_STRIDE = 11; // pos3 nor3 uv2 col3

export function triangulate(pts) {
  // Ear clipping; polygons are simple and small.
  const n = pts.length, out = [];
  if (n < 3) return out;
  let area = 0;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const idx = Array.from({ length: n }, (_, i) => i);
  if (area < 0) idx.reverse();
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = n * n;
  while (idx.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const i0 = idx[(i + idx.length - 1) % idx.length], i1 = idx[i], i2 = idx[(i + 1) % idx.length];
      const a = pts[i0], b = pts[i1], c = pts[i2];
      if (cross(a, b, c) <= 1e-9) continue;
      let inside = false;
      for (const j of idx) {
        if (j === i0 || j === i1 || j === i2) continue;
        const p = pts[j];
        if (cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) { inside = true; break; }
      }
      if (inside) continue;
      out.push(i0, i1, i2);
      idx.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) out.push(idx[0], idx[1], idx[2]);
  return out;
}

function pointInPoly(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

class EnvMesh {
  constructor() { this.v = []; this.i = []; }
  vert(p, n, uv, c) { const id = this.v.length / ENV_STRIDE; this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1], c[0], c[1], c[2]); return id; }
  arrays() { return { verts: new Float32Array(this.v), indices: new Uint32Array(this.i) }; }
}

export function arenaInfo(script) {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const f of script.arena.floor) for (const [x, y] of f.poly) { minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); }
  return { minx, miny, maxx, maxy, cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, radius: Math.hypot(maxx - minx, maxy - miny) / 2 };
}

/** Every wall as sampled points with the normal facing into the room. */
export function wallSamples(script, spacing) {
  const out = [], floors = script.arena.floor.map((f) => f.poly), info = arenaInfo(script);
  const inside = (x, y) => floors.some((p) => pointInPoly([x, y], p));
  for (const w of script.arena.walls) {
    for (let i = 0; i < w.points.length - 1; i++) {
      const a = w.points[i], b = w.points[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 0.01) continue;
      const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
      const count = Math.max(1, Math.round(L / spacing));
      for (let k = 0; k < count; k++) {
        const f = (k + 0.5) / count, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        let s = inside(x + nx * 1.5, y + ny * 1.5) ? 1 : inside(x - nx * 1.5, y - ny * 1.5) ? -1 : 0;
        if (!s) s = (info.cx - x) * nx + (info.cy - y) * ny >= 0 ? 1 : -1;
        out.push({ x, y, nx: nx * s, ny: ny * s, along: i + f });
      }
    }
  }
  return out;
}

export function buildEnvironment(script, theme, seed = 1) {
  const info = arenaInfo(script);
  const H = script.arena.wallHeight || 10;
  const wallH = H * (theme.wallMult || 2);
  const floor = new EnvMesh(), walls = new EnvMesh(), dome = new EnvMesh();
  const W = [1, 1, 1];

  // ---- floor
  const fs = theme.floor.scale;
  for (const f of script.arena.floor) {
    const base = floor.v.length / ENV_STRIDE;
    for (const [x, y] of f.poly) floor.vert([x, y, 0], [0, 0, 1], [x * fs, y * fs], W);
    for (const t of triangulate(f.poly)) floor.i.push(base + t);
    // A skirt so the floor reads as a platform above lava or sand.
    const n = f.poly.length;
    for (let i = 0; i < n; i++) {
      const a = f.poly[i], b = f.poly[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, N = [dy / L, -dx / L, 0];
      const v0 = floor.vert([a[0], a[1], 0], N, [a[0] * fs, 0], [0.5, 0.5, 0.5]), v1 = floor.vert([b[0], b[1], 0], N, [b[0] * fs, 0], [0.5, 0.5, 0.5]);
      const v2 = floor.vert([b[0], b[1], -3], N, [b[0] * fs, 0.3], [0.1, 0.1, 0.1]), v3 = floor.vert([a[0], a[1], -3], N, [a[0] * fs, 0.3], [0.1, 0.1, 0.1]);
      floor.i.push(v0, v3, v2, v0, v2, v1, v0, v2, v3, v0, v1, v2);
    }
  }

  // ---- walls
  const ws = theme.wall.scale, rock = theme.wallStyle === 'rock';
  const floors = script.arena.floor.map((f) => f.poly);
  const inside = (x, y) => floors.some((p) => pointInPoly([x, y], p));
  const disp = (x, y, z) => [
    x + (fbm(x * 0.09, y * 0.09, z * 0.1 + 3, 3) - 0.5) * 7,
    y + (fbm(x * 0.09 + 11, y * 0.09, z * 0.1, 3) - 0.5) * 7,
    z,
  ];
  for (const w of script.arena.walls) {
    let run = 0;
    for (let i = 0; i < w.points.length - 1; i++) {
      const a = w.points[i], b = w.points[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 0.01) continue;
      const dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L;
      let nx = -dy, ny = dx;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (!inside(mx + nx * 1.5, my + ny * 1.5) && (inside(mx - nx * 1.5, my - ny * 1.5) || (info.cx - mx) * nx + (info.cy - my) * ny < 0)) { nx = -nx; ny = -ny; }
      const cols = rock ? Math.max(1, Math.ceil(L / 2.5)) : 1, rows = rock ? 6 : 1;
      const base = walls.v.length / ENV_STRIDE;
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          let x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, z = v * wallH;
          if (rock) {
            const lean = v * v * 3.5;
            const wet = Math.min(1, 1.5 * v + (r ? 0.3 : 0));   // pinned to the floor edge at the base
            const q = disp(x, y, z);
            x += (q[0] - x) * wet + nx * lean; y += (q[1] - y) * wet + ny * lean;
          }
          const shade = 0.42 + 0.58 * Math.min(1, 0.25 + v * 1.35);
          walls.vert([x, y, z], [nx, ny, 0.05], [(run + L * u) * ws, z * ws], [shade, shade, shade]);
        }
      }
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const p = base + r * (cols + 1) + c, q = p + 1, s = p + cols + 1, t = s + 1;
        // Faces wind toward the room.
        const cross = dx * ny - dy * nx;
        if (cross > 0) walls.i.push(p, q, t, p, t, s); else walls.i.push(p, t, q, p, s, t);
      }
      if (rock) smoothNormals(walls, base, rows, cols);
      if (!rock) {
        // Coping along the wall top, so masonry has thickness from above.
        const s = 0.75;
        const bt = walls.v.length / ENV_STRIDE;
        const c = walls.vert([a[0], a[1], wallH], [0, 0, 1], [run * ws, 0], [s, s, s]), d = walls.vert([b[0], b[1], wallH], [0, 0, 1], [(run + L) * ws, 0], [s, s, s]);
        const e = walls.vert([a[0] - nx * 3, a[1] - ny * 3, wallH], [0, 0, 1], [run * ws, 3 * ws], [s, s, s]), f = walls.vert([b[0] - nx * 3, b[1] - ny * 3, wallH], [0, 0, 1], [(run + L) * ws, 3 * ws], [s, s, s]);
        walls.i.push(c, e, f, c, f, d, c, f, e, c, d, f);
        void bt;
      }
      run += L;
    }
  }

  // ---- ceiling, or sky
  const R = info.radius * 1.5 + 30;
  const sky = theme.sky ? [hex(theme.sky[0]), hex(theme.sky[1])] : null;
  if (theme.dome || sky) {
    const rings = 14, segs = 36, base = 0;
    for (let r = 0; r <= rings; r++) {
      const v = r / rings, a = v * Math.PI * 0.5;
      for (let s = 0; s <= segs; s++) {
        const th = (s / segs) * Math.PI * 2, ca = Math.cos(th), sa = Math.sin(th);
        let rad = Math.cos(a) * (sky ? R * 3 : R), z = Math.sin(a) * (sky ? R * 1.5 : wallH * 3.1);
        let x = info.cx + ca * rad, y = info.cy + sa * rad;
        if (!sky) { const dp = (fbm(x * 0.05, y * 0.05, z * 0.04, 3) - 0.5) * 12 * Math.sin(a * 2 + 0.5); x += ca * dp; y += sa * dp; z += dp; }
        const col = sky ? [sky[1][0] + (sky[0][0] - sky[1][0]) * v, sky[1][1] + (sky[0][1] - sky[1][1]) * v, sky[1][2] + (sky[0][2] - sky[1][2]) * v] : [0.72, 0.72, 0.72];
        dome.vert([x, y, z], [-Math.cos(a) * ca, -Math.cos(a) * sa, -Math.sin(a)], [s * 0.45, r * 0.35], col);
      }
    }
    for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
      const p = base + r * (segs + 1) + s, q = p + 1, u = p + segs + 1, v = u + 1;
      dome.i.push(p, v, q, p, u, v);
    }
  }

  const props = dressRoom(script, theme, info, wallH, seed);
  return { floor: floor.arrays(), walls: walls.arrays(), dome: dome.arrays(), props: props.built, torches: props.torches, vents: props.vents, info, wallH, sky: !!sky };
}

function smoothNormals(mesh, base, rows, cols) {
  const at = (r, c) => base + r * (cols + 1) + c;
  const P = (r, c) => { const i = at(r, c) * ENV_STRIDE; return [mesh.v[i], mesh.v[i + 1], mesh.v[i + 2]]; };
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    const a = P(Math.max(0, r - 1), c), b = P(Math.min(rows, r + 1), c), d = P(r, Math.max(0, c - 1)), e = P(r, Math.min(cols, c + 1));
    const ux = e[0] - d[0], uy = e[1] - d[1], uz = e[2] - d[2], vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const i = at(r, c) * ENV_STRIDE;
    if (nx * mesh.v[i + 3] + ny * mesh.v[i + 4] < 0) { nx = -nx; ny = -ny; nz = -nz; }
    mesh.v[i + 3] = nx; mesh.v[i + 4] = ny; mesh.v[i + 5] = nz;
  }
}

// ---- set dressing
function dressRoom(script, theme, info, wallH, seed) {
  const m = new ModelBuilder();
  m.bone('root', null, [0, 0, 0]);
  const torches = [], vents = [];
  const pr = new Set(theme.props || []);
  const hasFloor = script.arena.floor.map((f) => f.poly);
  const inFloor = (x, y) => hasFloor.some((p) => pointInPoly([x, y], p));
  const H = wallH;
  const col = theme.wall;

  const scatter = (spacing, fn) => wallSamples(script, spacing).forEach((s, i) => fn(s, i, (k) => hash(s.x, s.y, k + seed)));

  if (pr.has('pillars')) scatter(13, (s, i) => {
    const x = s.x - s.nx * -1.6, y = s.y - s.ny * -1.6;
    m.lathe('root', [x, y, 0], [x, y, H * 0.86], [[2.3, 0], [2.1, 0.03], [1.5, 0.08], [1.3, 0.5], [1.5, 0.9], [2.2, 0.97], [2.3, 1]], col.b, { sides: 8 });
    m.box('root', [x, y, H * 0.42], [3.2, 3.2, 0.5], col.a, {});
    m.box('root', [x, y, H * 0.87], [5, 5, 0.8], col.a, {});
    if (theme.banner && i % 2 === 0) {
      const fx = x + s.nx * 1.6, fy = y + s.ny * 1.6, tx = s.ny, ty = -s.nx, top = H * 0.8;
      m.tri([fx - tx * 1.25, fy - ty * 1.25, top], [fx + tx * 1.25, fy + ty * 1.25, top], [fx + tx * 1.25, fy + ty * 1.25, top - 7], theme.banner[0], 0, [0], true);
      m.tri([fx - tx * 1.25, fy - ty * 1.25, top], [fx + tx * 1.25, fy + ty * 1.25, top - 7], [fx, fy, top - 9], theme.banner[0], 0, [0], true);
      m.tri([fx - tx * 1.25, fy - ty * 1.25, top], [fx, fy, top - 9], [fx - tx * 1.25, fy - ty * 1.25, top - 7], theme.banner[0], 0, [0], true);
      m.box('root', [fx + s.nx * 0.05, fy + s.ny * 0.05, top + 0.1], [Math.abs(ty) * 2.9 + 0.2, Math.abs(tx) * 2.9 + 0.2, 0.28], theme.banner[1], {});
    }
  });
  if (pr.has('braziers') || theme.lights === 'torches') scatter(theme.lights === 'torches' ? 15 : 22, (s, i, r) => {
    const x = s.x + s.nx * 3.2, y = s.y + s.ny * 3.2;
    m.lathe('root', [x, y, 0], [x, y, 3.1], [[0.72, 0], [0.5, 0.08], [0.22, 0.22], [0.2, 0.75], [0.75, 0.9], [0.95, 1]], '#2d2a2c', { sides: 7 });
    m.ball('root', [x, y, 3.1], 0.72, theme.torchCol ? [Math.min(1, theme.torchCol[0] / 7), Math.min(1, theme.torchCol[1] / 7), Math.min(1, theme.torchCol[2] / 7)] : '#ff8030', { em: 1.1, sides: 7, rings: 3 });
    torches.push({ x, y, z: 3.6, color: theme.torchCol || [5, 2, 0.6], radius: 22 });
  });
  if (theme.lights === 'lavaGlow') scatter(20, (s) => torches.push({ x: s.x + s.nx * 2, y: s.y + s.ny * 2, z: 1.4, color: theme.torchCol, radius: 26 }));
  if (theme.lights === 'hive') scatter(18, (s) => torches.push({ x: s.x + s.nx * 3, y: s.y + s.ny * 3, z: 4, color: theme.torchCol, radius: 22 }));

  if (pr.has('stalagmites')) scatter(5.5, (s, i, r) => {
    if (r(1) < 0.25) return;
    const inset = -1 + r(2) * 5, x = s.x + s.nx * inset, y = s.y + s.ny * inset, h = 2.5 + r(3) * r(3) * 11, w = 0.8 + r(4) * 1.4;
    m.lathe('root', [x, y, -0.2], [x, y, h], [[w, 0], [w * 0.55, 0.3], [w * 0.28, 0.65], [0.02, 1]], r(5) > 0.5 ? col.a : col.b, { sides: 6 });
  });
  if (pr.has('eggs')) scatter(9, (s, i, r) => {
    if (r(1) < 0.3) return;
    const cnt = 1 + Math.floor(r(2) * 3);
    for (let k = 0; k < cnt; k++) {
      const x = s.x + s.nx * (2 + r(3 + k) * 3.5) + s.ny * (r(7 + k) - 0.5) * 3, y = s.y + s.ny * (2 + r(3 + k) * 3.5) - s.nx * (r(7 + k) - 0.5) * 3, h = 1 + r(11 + k) * 0.5;
      m.lathe('root', [x, y, 0], [x, y, h * 1.75], [[0.2, 0], [0.56 * h, 0.16], [0.7 * h, 0.42], [0.52 * h, 0.76], [0.02, 1]], k % 2 ? '#3a2f33' : '#4b3a3a', { sides: 8 });
    }
  });
  if (pr.has('lavaVents')) scatter(17, (s, i, r) => {
    const x = s.x + s.nx * (1 + r(1) * 3), y = s.y + s.ny * (1 + r(1) * 3);
    m.lathe('root', [x, y, 0], [x, y, 1.8], [[2.1, 0], [1.5, 0.5], [0.72, 1]], col.a, { sides: 7 });
    m.ball('root', [x, y, 1.75], 0.62, '#ffb040', { em: 1.5, sides: 6, rings: 3 });
    vents.push({ x, y, z: 1.9 });
  });
  if (pr.has('webs')) scatter(9, (s, i, r) => {
    const x = s.x + s.nx * 0.5, y = s.y + s.ny * 0.5, tx = s.ny, ty = -s.nx, w = 7 + r(1) * 7, top = H * (0.35 + r(2) * 0.55);
    for (let a = 0; a < 7; a++) {
      const k0 = a / 7, k1 = (a + 1) / 7, ex0 = -w * 0.5 + w * k0, ex1 = -w * 0.5 + w * k1;
      const c = a % 2 ? '#a9a0d8' : '#8780b4';
      m.tri([x + tx * ex0 * 0.2 + s.nx * 3, y + ty * ex0 * 0.2 + s.ny * 3, top * 0.34], [x + tx * ex0, y + ty * ex0, top], [x + tx * ex1, y + ty * ex1, top], c, 0.05, [0], true);
    }
  });
  if (pr.has('iron')) scatter(19, (s, i, r) => {
    const x = s.x + s.nx * 5.5, y = s.y + s.ny * 5.5;
    for (const a of [0, 1.05, 2.1, 3.14, 4.2, 5.25]) m.tube('root', [[x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, 0], [x + Math.cos(a) * 1.1, y + Math.sin(a) * 1.1, 1.8], [x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, 3.4]], 0.07, '#26252c', { sides: 3 });
    m.lathe('root', [x, y, 3.4], [x, y, 3.8], [[1.15, 0], [0.5, 0.6], [0.05, 1]], '#26252c', { sides: 6 });
  });
  if (pr.has('coils')) {
    const pts = script.positions, spots = Object.values(pts).filter((p) => p && p.x !== undefined);
    const xs = spots.map((p) => p.x), span = Math.max(...xs) - Math.min(...xs);
    for (const sx of [-1, 1]) {
      const x = info.cx + sx * Math.min(span / 2 + 5, info.radius * 0.8), y = info.cy + info.radius * 0.28;
      m.lathe('root', [x, y, 0], [x, y, 9], [[1.8, 0], [1.1, 0.1], [0.6, 0.3], [0.6, 0.8], [1.3, 0.92], [0.35, 1]], '#3a3e4c', { sides: 8 });
      for (let k = 1; k <= 5; k++) m.lathe('root', [x, y, k * 1.3], [x, y, k * 1.3 + 0.25], [[1.05, 0], [1.05, 1]], '#c49a4a', { sides: 10, em: 0.08 });
      m.ball('root', [x, y, 9.3], 0.7, sx > 0 ? '#ff5050' : '#5098ff', { em: 3.4, sides: 8 });
      torches.push({ x, y, z: 9.5, color: sx > 0 ? [7, 1.8, 1.2] : [1.4, 3, 8], radius: 30 });
    }
  }
  if (pr.has('iceSpires')) scatter(5.5, (s, i, r) => {
    if (r(1) < 0.3) return;
    const inset = -0.5 + r(2) * 4, x = s.x + s.nx * inset, y = s.y + s.ny * inset, h = 3 + r(3) * r(3) * 16, w = 0.9 + r(4) * 1.4;
    m.lathe('root', [x, y, -0.2], [x + (r(5) - 0.5) * 1.5, y + (r(6) - 0.5) * 1.5, h], [[w, 0], [w * 0.74, 0.6], [0.02, 1]], r(7) > 0.5 ? '#b8e4f6' : '#6fb0dc', { sides: 5, em: 0.07 });
  });
  if (pr.has('hivePods')) scatter(8, (s, i, r) => {
    if (r(1) < 0.3) return;
    const x = s.x + s.nx * (1 + r(2) * 4), y = s.y + s.ny * (1 + r(2) * 4), h = 1.8 + r(3) * 2.6;
    m.lathe('root', [x, y, 0], [x, y, h * 1.6], [[0.8 * h, 0], [0.9 * h, 0.22], [0.55 * h, 0.72], [0.1, 1]], r(4) > 0.5 ? '#a0603a' : '#7a3c5c', { sides: 7 });
    m.ball('root', [x, y, h * 1.58], 0.26 * h, '#e070ff', { em: 1.3, sides: 6, rings: 3 });
  });
  if (pr.has('tentaclesWall')) scatter(14, (s, i, r) => {
    const x = s.x - s.nx * 1, y = s.y - s.ny * 1, h = H * (0.5 + r(1) * 0.6);
    const seg = [];
    for (let k = 0; k <= 6; k++) { const a = k / 6; seg.push([x + s.nx * (Math.sin(a * 3.1) * 4.2 + a * 3) + s.ny * Math.sin(a * 5 + i) * 1.8, y + s.ny * (Math.sin(a * 3.1) * 4.2 + a * 3) - s.nx * Math.sin(a * 5 + i) * 1.8, a * h]); }
    m.tube('root', seg, seg.map((_, k) => 1.8 * (1 - k / 7)), [ '#5a2c6a', '#5a2c6a', '#7a3c7a', '#7a3c7a', '#8a4a80', '#8a4a80', '#a0587a' ], { sides: 7 });
  });
  if (pr.has('trees')) {
    for (let k = 0; k < 46; k++) {
      const a = hash(k, 3, seed) * Math.PI * 2, d = info.radius * (1.02 + hash(k, 4, seed) * 1.15) + 7, x = info.cx + Math.cos(a) * d, y = info.cy + Math.sin(a) * d;
      if (inFloor(x, y)) continue;
      const h = 16 + hash(k, 5, seed) * 22, w = 1.3 + hash(k, 6, seed) * 1.7;
      m.lathe('root', [x, y, -0.5], [x + (hash(k, 7) - 0.5) * 5, y + (hash(k, 8) - 0.5) * 5, h], [[w * 2, 0], [w, 0.08], [w * 0.72, 0.7], [w * 0.35, 1]], '#4a3a24', { sides: 7 });
      for (let c = 0; c < 4; c++) {
        const ta = c * 1.57 + k, r = 7 + hash(k, c + 9) * 6, cx = x + Math.cos(ta) * r * 0.6, cy = y + Math.sin(ta) * r * 0.6, cz = h + hash(k, c + 13) * 5 - 1.5;
        m.lathe('root', [cx, cy, cz - r * 0.45], [cx, cy, cz + r * 0.6], [[r * 0.18, 0], [r, 0.25], [r * 0.82, 0.55], [r * 0.3, 0.92], [0.05, 1]], hash(k, c + 21) > 0.5 ? '#3c6b24' : '#2d5a26', { sides: 8 });
      }
    }
  }
  if (pr.has('totems')) scatter(16, (s, i, r) => {
    const x = s.x + s.nx * 3.8, y = s.y + s.ny * 3.8, h = 3.6 + r(1) * 3.2, wood = r(2) > 0.5 ? '#7a5a34' : '#6a4a2c';
    m.lathe('root', [x, y, 0], [x, y, h], [[0.8, 0], [0.62, 0.3], [0.84, 0.42], [0.6, 0.76], [0.74, 0.9], [0.5, 1]], wood, { sides: 7 });
    m.ball('root', [x + s.nx * 0.62, y + s.ny * 0.62, h * 0.86], 0.14, '#50ff60', { em: 1.8, sides: 5, rings: 3 });
    m.spike('root', [x, y, h], [x, y, h + 1.6], 0.5, '#e8d9b8', { sides: 5 });
  });
  if (pr.has('ruins')) {
    scatter(14, (s, i, r) => {
      const x = s.x - s.nx * 2 + s.ny * (r(2) - 0.5) * 5, y = s.y - s.ny * 2 - s.nx * (r(2) - 0.5) * 5, h = 5 + r(1) * 12;
      m.box('root', [x, y, h / 2 - 0.2], [3 + r(3) * 3, 3 + r(4) * 3, h], r(5) > 0.5 ? col.b : col.a, { taper: 0.88 });
    });
  }
  if (pr.has('obelisks')) scatter(30, (s, i, r) => {
    const x = s.x + s.nx * 3.8, y = s.y + s.ny * 3.8, h = 10 + r(1) * 8;
    m.box('root', [x, y, h / 2], [2.4, 2.4, h], col.b, { taper: 0.45 });
    m.ball('root', [x, y, h + 0.45], 0.55, '#7ed0ff', { em: 2.2, sides: 6 });
  });
  const built = m.v.length ? m.build({}) : null;
  return { built, torches, vents };
}
