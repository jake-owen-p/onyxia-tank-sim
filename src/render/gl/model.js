// Procedural model builder. Soft bodies are sculpted from blended round cones
// and ellipsoids and meshed with surface nets; hard parts (horns, armour,
// claws, wings) are added as explicit geometry. Every vertex is bound to up
// to two bones, so models animate. No WebGL here: output is plain arrays.

import { IDENT34, mul34 } from './math.js';

export const STRIDE = 13;   // pos3 normal3 color3 emissive1 bone2 weight1

const BIG = 1e6;
const srgb = (c) => (Array.isArray(c) ? c : [(parseInt(c.slice(1), 16) >> 16 & 255) / 255, (parseInt(c.slice(1), 16) >> 8 & 255) / 255, (parseInt(c.slice(1), 16) & 255) / 255]);
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); };
const smax = (a, b, k) => -smin(-a, -b, k);

function roundCone(a, b, r1, r2) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const R = Math.max(r1, r2);
  const box = [Math.min(a[0] - r1, b[0] - r2), Math.min(a[1] - r1, b[1] - r2), Math.min(a[2] - r1, b[2] - r2), Math.max(a[0] + r1, b[0] + r2), Math.max(a[1] + r1, b[1] + r2), Math.max(a[2] + r1, b[2] + r2)];
  if (l2 < 1e-6) return { box, R, f: (x, y, z) => Math.hypot(x - a[0], y - a[1], z - a[2]) - r1 };
  const rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const f = (x, y, z) => {
    const pax = x - a[0], pay = y - a[1], paz = z - a[2];
    const yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
    const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy;
    const x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * l2, z2 = zz * zz * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  };
  return { box, R, f };
}

function ellipsoid(c, r) {
  const box = [c[0] - r[0], c[1] - r[1], c[2] - r[2], c[0] + r[0], c[1] + r[1], c[2] + r[2]];
  const f = (x, y, z) => {
    const px = (x - c[0]) / r[0], py = (y - c[1]) / r[1], pz = (z - c[2]) / r[2];
    const k0 = Math.sqrt(px * px + py * py + pz * pz);
    if (k0 < 1e-5) return -Math.min(r[0], r[1], r[2]);
    const qx = px / r[0], qy = py / r[1], qz = pz / r[2];
    return k0 * (k0 - 1) / Math.sqrt(qx * qx + qy * qy + qz * qz);
  };
  return { box, R: Math.max(...r), f };
}

export class ModelBuilder {
  constructor() {
    this.bones = [];
    this.index = new Map();
    this.soft = [];
    this.cuts = [];
    this.v = [];          // hard geometry vertices
    this.i = [];
    this.mirrorPrefix = ['L', 'R'];
  }

  bone(name, parent, head) {
    const p = parent == null ? -1 : (typeof parent === 'string' ? this.index.get(parent) : parent);
    this.index.set(name, this.bones.length);
    this.bones.push({ name, parent: p, head: head.slice() });
    return this.bones.length - 1;
  }
  b(n) { if (typeof n === 'number') return n; const i = this.index.get(n); if (i === undefined) throw new Error(`no bone ${n}`); return i; }

  /** Soft primitive: a round cone from a (radius ra) to b (radius rb). */
  blob(bone, a, b, ra, rb, color, o = {}) {
    this.soft.push({ ...roundCone(a, b, ra, rb), bone: this.b(bone), color: srgb(color), em: o.em || 0, k: o.k ?? 0.35 });
    return this;
  }
  /** Soft primitive: an axis-aligned ellipsoid. */
  ell(bone, c, r, color, o = {}) {
    this.soft.push({ ...ellipsoid(c, r), bone: this.b(bone), color: srgb(color), em: o.em || 0, k: o.k ?? 0.35 });
    return this;
  }
  /** Removes material: a mouth, an eye socket, a wound. */
  cut(a, b, ra, rb, o = {}) {
    this.cuts.push({ ...roundCone(a, b, ra, rb), k: o.k ?? 0.15 });
    return this;
  }

  // ---- hard geometry
  _vert(p, n, c, em, b0, b1 = b0, w = 1) {
    const idx = this.v.length / STRIDE;
    this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], em, b0, b1, w);
    return idx;
  }
  /** A flat triangle (both faces, so thin plates and wings read from either side). */
  tri(a, b, c, color, em, bones, doubleSided = false) {
    const col = srgb(color);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const [b0, b1, b2] = (bones.length === 3 ? bones : [bones[0], bones[0], bones[0]]).map((n) => this.b(n));
    const i0 = this._vert(a, [nx, ny, nz], col, em, b0), i1 = this._vert(b, [nx, ny, nz], col, em, b1), i2 = this._vert(c, [nx, ny, nz], col, em, b2);
    this.i.push(i0, i1, i2);
    if (doubleSided) {
      const j0 = this._vert(a, [-nx, -ny, -nz], col, em, b0), j1 = this._vert(c, [-nx, -ny, -nz], col, em, b2), j2 = this._vert(b, [-nx, -ny, -nz], col, em, b1);
      this.i.push(j0, j1, j2);
    }
    return this;
  }
  /**
   * A tapered tube through points. bones: one bone, or one per point. colors:
   * one colour, or one per point. Smooth shaded, so horns and tentacles read round.
   */
  tube(bones, pts, radii, colors, o = {}) {
    const sides = o.sides ?? 6, em = o.em || 0, n = pts.length;
    const col = (i) => srgb(Array.isArray(colors) && typeof colors[0] !== 'number' ? colors[i] : colors);
    const bn = (i) => this.b(Array.isArray(bones) ? bones[i] : bones);
    const R = (i) => (Array.isArray(radii) ? radii[i] : radii);
    // A stable frame along the path.
    const dir = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1;
      return [d[0] / l, d[1] / l, d[2] / l];
    });
    let ref = Math.abs(dir[0][2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    const rings = [];
    for (let i = 0; i < n; i++) {
      const d = dir[i];
      let u = [ref[1] * d[2] - ref[2] * d[1], ref[2] * d[0] - ref[0] * d[2], ref[0] * d[1] - ref[1] * d[0]];
      const ul = Math.hypot(...u) || 1; u = [u[0] / ul, u[1] / ul, u[2] / ul];
      const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
      ref = v;
      const ring = [];
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        const nrm = [u[0] * ca + v[0] * sa, u[1] * ca + v[1] * sa, u[2] * ca + v[2] * sa];
        const r = R(i), flat = o.flatten ?? 1;
        const p = [pts[i][0] + nrm[0] * r, pts[i][1] + nrm[1] * r, pts[i][2] + nrm[2] * r * flat];
        ring.push(this._vert(p, nrm, col(i), em, bn(i)));
      }
      rings.push(ring);
    }
    for (let i = 0; i < n - 1; i++) {
      for (let s = 0; s < sides; s++) {
        const a = rings[i][s], b = rings[i][(s + 1) % sides], c = rings[i + 1][(s + 1) % sides], d = rings[i + 1][s];
        this.i.push(a, b, c, a, c, d);
      }
    }
    return this;
  }
  /** A straight or curved spike. `bend` pushes the middle sideways for claws and horns. */
  spike(bone, base, tip, r, color, o = {}) {
    const mid = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2];
    if (o.bend) { mid[0] += o.bend[0]; mid[1] += o.bend[1]; mid[2] += o.bend[2]; }
    const pts = o.bend ? [base, mid, tip] : [base, tip];
    const radii = o.bend ? [r, r * 0.62, 0.005] : [r, 0.005];
    return this.tube(bone, pts, radii, o.tipColor ? (o.bend ? [color, color, o.tipColor] : [color, o.tipColor]) : color, { sides: o.sides ?? 5, em: o.em });
  }
  /** A faceted solid: a lathe through rings of [radius, height] about the axis a->b. */
  lathe(bone, a, b, rings, color, o = {}) {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const pts = rings.map(([, h]) => [a[0] + d[0] * h, a[1] + d[1] * h, a[2] + d[2] * h]);
    return this.tube(bone, pts, rings.map(([r]) => r), color, { sides: o.sides ?? 8, em: o.em, flatten: o.flatten });
  }
  /** An axis-aligned box, flat shaded, optionally sheared by `taper` at the +z face. */
  box(bone, c, size, color, o = {}) {
    const [sx, sy, sz] = size.map((v) => v / 2), [x, y, z] = c, t = o.taper ?? 1, em = o.em || 0, bn = [this.b(bone)];
    const P = (a, b, d) => [x + a * sx * (d > 0 ? t : 1), y + b * sy * (d > 0 ? t : 1), z + d * sz];
    const quad = (p0, p1, p2, p3) => { this.tri(p0, p1, p2, color, em, bn); this.tri(p0, p2, p3, color, em, bn); };
    quad(P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1));
    quad(P(-1, 1, -1), P(1, 1, -1), P(1, -1, -1), P(-1, -1, -1));
    quad(P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1));
    quad(P(1, 1, -1), P(-1, 1, -1), P(-1, 1, 1), P(1, 1, 1));
    quad(P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1));
    quad(P(-1, 1, -1), P(-1, -1, -1), P(-1, -1, 1), P(-1, 1, 1));
    return this;
  }
  /** An emissive or painted sphere (eyes, orbs, gems). */
  ball(bone, c, r, color, o = {}) {
    const rings = [];
    const n = o.rings ?? 6;
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; rings.push([Math.max(0.0005, Math.sin(a) * r), (1 - Math.cos(a)) / 2]); }
    return this.lathe(bone, [c[0], c[1], c[2] - r], [c[0], c[1], c[2] + r], rings, color, { sides: o.sides ?? 8, em: o.em });
  }
  /**
   * A membrane between two polylines of equal length, bones given per point.
   * `sag` pulls the outer edge in, which makes bat-wing scallops.
   */
  membrane(ptsA, ptsB, bonesA, bonesB, color, o = {}) {
    const n = ptsA.length, em = o.em || 0, col = srgb(color), steps = o.steps ?? 1;
    const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    for (let i = 0; i < n - 1; i++) {
      for (let s = 0; s < steps; s++) {
        const k0 = s / steps, k1 = (s + 1) / steps;
        const a0 = lerp3(ptsA[i], ptsB[i], k0), a1 = lerp3(ptsA[i], ptsB[i], k1), b0 = lerp3(ptsA[i + 1], ptsB[i + 1], k0), b1 = lerp3(ptsA[i + 1], ptsB[i + 1], k1);
        const bones = [k0 < 0.5 ? this.b(bonesA[i]) : this.b(bonesB[i]), k1 < 0.5 ? this.b(bonesA[i]) : this.b(bonesB[i]), k0 < 0.5 ? this.b(bonesA[i + 1]) : this.b(bonesB[i + 1]), k1 < 0.5 ? this.b(bonesA[i + 1]) : this.b(bonesB[i + 1])];
        const shade = 1 - (o.fade ?? 0.25) * (i / (n - 1));
        const c = [col[0] * shade, col[1] * shade, col[2] * shade];
        this.tri(a0, a1, b1, c, em, [bones[0], bones[1], bones[3]], true);
        this.tri(a0, b1, b0, c, em, [bones[0], bones[3], bones[2]], true);
      }
    }
    return this;
  }

  /** Mirror everything already added across y: a bilateral body from half a body. */
  mirrorBone(nameL) { return nameL.replace(/^L/, 'R'); }

  /** Sculpt and mesh. opts: cell (yards), smooth (passes), paint(v). */
  build(opts = {}) {
    const verts = [], idx = [];
    if (this.soft.length) meshSoft(this, opts, verts, idx);
    const base = verts.length / STRIDE;
    for (let i = 0; i < this.v.length; i++) verts.push(this.v[i]);
    for (let i = 0; i < this.i.length; i++) idx.push(this.i[i] + base);
    let minz = Infinity, maxz = -Infinity, maxr = 0;
    for (let i = 0; i < verts.length; i += STRIDE) {
      minz = Math.min(minz, verts[i + 2]); maxz = Math.max(maxz, verts[i + 2]);
      maxr = Math.max(maxr, Math.hypot(verts[i], verts[i + 1]));
    }
    return {
      verts: new Float32Array(verts), indices: new Uint32Array(idx), bones: this.bones.map((b) => ({ ...b })),
      boneIndex: Object.fromEntries(this.index), minz, maxz, maxr, triangles: idx.length / 3,
    };
  }
}

function meshSoft(mb, opts, verts, idx) {
  const cell = opts.cell ?? 0.14;
  const margin = cell * 4;
  let x0 = BIG, y0 = BIG, z0 = BIG, x1 = -BIG, y1 = -BIG, z1 = -BIG;
  for (const s of mb.soft) {
    x0 = Math.min(x0, s.box[0]); y0 = Math.min(y0, s.box[1]); z0 = Math.min(z0, s.box[2]);
    x1 = Math.max(x1, s.box[3]); y1 = Math.max(y1, s.box[4]); z1 = Math.max(z1, s.box[5]);
  }
  x0 -= margin; y0 -= margin; z0 -= margin; x1 += margin; y1 += margin; z1 += margin;
  const nx = Math.ceil((x1 - x0) / cell) + 1, ny = Math.ceil((y1 - y0) / cell) + 1, nz = Math.ceil((z1 - z0) / cell) + 1;
  const n = nx * ny * nz;
  const F = new Float32Array(n).fill(BIG);
  const I = (i, j, k) => i + nx * (j + ny * k);
  const range = (lo, hi, o, c) => [Math.max(0, Math.floor((lo - o) / cell)), Math.min(c - 1, Math.ceil((hi - o) / cell))];

  const apply = (s, op, pad) => {
    const [ia, ib] = range(s.box[0] - pad, s.box[3] + pad, x0, nx), [ja, jb] = range(s.box[1] - pad, s.box[4] + pad, y0, ny), [ka, kb] = range(s.box[2] - pad, s.box[5] + pad, z0, nz);
    for (let k = ka; k <= kb; k++) for (let j = ja; j <= jb; j++) for (let i = ia; i <= ib; i++) {
      const id = I(i, j, k);
      F[id] = op(F[id], s.f(x0 + i * cell, y0 + j * cell, z0 + k * cell), s.k);
    }
  };
  for (const s of mb.soft) apply(s, smin, s.k + margin);
  for (const s of mb.cuts) apply(s, (a, d, k) => smax(a, -d, k), s.k + margin);

  // Surface nets.
  const cellIndex = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const C = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k);
  const P = [];
  const CORNERS = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const val = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const v = F[I(i + CORNERS[c][0], j + CORNERS[c][1], k + CORNERS[c][2])]; val[c] = v; if (v < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of EDGES) {
      if ((val[a] < 0) === (val[b] < 0)) continue;
      const t = val[a] / (val[a] - val[b]);
      sx += CORNERS[a][0] + (CORNERS[b][0] - CORNERS[a][0]) * t;
      sy += CORNERS[a][1] + (CORNERS[b][1] - CORNERS[a][1]) * t;
      sz += CORNERS[a][2] + (CORNERS[b][2] - CORNERS[a][2]) * t;
      cnt++;
    }
    cellIndex[C(i, j, k)] = P.length / 3;
    P.push(x0 + (i + sx / cnt) * cell, y0 + (j + sy / cnt) * cell, z0 + (k + sz / cnt) * cell);
  }
  const quads = [];
  const q = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) quads.push(a, d, c, b); else quads.push(a, b, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = F[I(i, j, k)] < 0;
    if (s0 !== (F[I(i + 1, j, k)] < 0)) q(cellIndex[C(i, j - 1, k - 1)], cellIndex[C(i, j, k - 1)], cellIndex[C(i, j, k)], cellIndex[C(i, j - 1, k)], !s0);
    if (s0 !== (F[I(i, j + 1, k)] < 0)) q(cellIndex[C(i - 1, j, k - 1)], cellIndex[C(i - 1, j, k)], cellIndex[C(i, j, k)], cellIndex[C(i, j, k - 1)], !s0);
    if (s0 !== (F[I(i, j, k + 1)] < 0)) q(cellIndex[C(i - 1, j - 1, k)], cellIndex[C(i, j - 1, k)], cellIndex[C(i, j, k)], cellIndex[C(i - 1, j, k)], !s0);
  }

  const nv = P.length / 3;
  // Light Laplacian smoothing to remove the voxel stair-step.
  const smoothPasses = opts.smooth ?? 1;
  for (let pass = 0; pass < smoothPasses; pass++) {
    const sum = new Float32Array(nv * 3), cnt = new Uint16Array(nv);
    for (let i = 0; i < quads.length; i += 4) {
      for (let c = 0; c < 4; c++) {
        const a = quads[i + c], b = quads[i + (c + 1) % 4];
        sum[a * 3] += P[b * 3]; sum[a * 3 + 1] += P[b * 3 + 1]; sum[a * 3 + 2] += P[b * 3 + 2]; cnt[a]++;
      }
    }
    for (let v = 0; v < nv; v++) if (cnt[v]) for (let a = 0; a < 3; a++) P[v * 3 + a] = P[v * 3 + a] * 0.5 + 0.5 * sum[v * 3 + a] / cnt[v];
  }

  // Area-weighted normals.
  const N = new Float32Array(nv * 3);
  const tris = [];
  for (let i = 0; i < quads.length; i += 4) tris.push(quads[i], quads[i + 1], quads[i + 2], quads[i], quads[i + 2], quads[i + 3]);
  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i] * 3, b = tris[i + 1] * 3, c = tris[i + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx2 = uy * vz - uz * vy, ny2 = uz * vx - ux * vz, nz2 = ux * vy - uy * vx;
    for (const t of [a, b, c]) { N[t] += nx2; N[t + 1] += ny2; N[t + 2] += nz2; }
  }

  // Sample the field for baked occlusion.
  const fieldAt = (x, y, z) => {
    const fx = (x - x0) / cell, fy = (y - y0) / cell, fz = (z - z0) / cell;
    const i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz);
    if (i < 0 || j < 0 || k < 0 || i >= nx - 1 || j >= ny - 1 || k >= nz - 1) return BIG;
    const u = fx - i, v = fy - j, w = fz - k;
    const g = (a, b, c) => Math.min(F[I(i + a, j + b, k + c)], cell * 12);
    return (((g(0, 0, 0) * (1 - u) + g(1, 0, 0) * u) * (1 - v) + (g(0, 1, 0) * (1 - u) + g(1, 1, 0) * u) * v) * (1 - w)
      + ((g(0, 0, 1) * (1 - u) + g(1, 0, 1) * u) * (1 - v) + (g(0, 1, 1) * (1 - u) + g(1, 1, 1) * u) * v) * w);
  };

  const paint = opts.paint;
  const aoReach = opts.aoReach ?? 0.9;
  const aoAmount = opts.ao ?? 1;
  const nb = mb.bones.length;
  const boneW = new Float32Array(nb);
  const out = { x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0, color: [0, 0, 0], em: 0, bone: -1 };
  for (let v = 0; v < nv; v++) {
    const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let nn = Math.hypot(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]) || 1;
    const ax = N[v * 3] / nn, ay = N[v * 3 + 1] / nn, az = N[v * 3 + 2] / nn;
    boneW.fill(0);
    let r = 0, g = 0, b = 0, em = 0, tw = 0, nearest = null, nd = BIG;
    for (const s of mb.soft) {
      const pad = s.k + cell * 3;
      if (x < s.box[0] - pad || x > s.box[3] + pad || y < s.box[1] - pad || y > s.box[4] + pad || z < s.box[2] - pad || z > s.box[5] + pad) continue;
      const d = s.f(x, y, z);
      if (d < nd) { nd = d; nearest = s; }
      const fall = s.k + 0.08 * s.R + cell * 1.5;
      const wt = Math.max(0, 1 - Math.max(0, d) / fall);
      if (wt <= 0) continue;
      const w2 = wt * wt * wt;
      r += s.color[0] * w2; g += s.color[1] * w2; b += s.color[2] * w2; em += s.em * w2; tw += w2;
      boneW[s.bone] += w2;
    }
    if (!nearest) for (const s of mb.soft) { const d = s.f(x, y, z); if (d < nd) { nd = d; nearest = s; } }
    if (tw <= 0) { r = nearest.color[0]; g = nearest.color[1]; b = nearest.color[2]; em = nearest.em; tw = 1; boneW[nearest.bone] = 1; }
    r /= tw; g /= tw; b /= tw; em /= tw;
    let b0 = 0, b1 = 0, w0 = 0, w1 = 0;
    for (let i = 0; i < nb; i++) { const w = boneW[i]; if (w > w0) { w1 = w0; b1 = b0; w0 = w; b0 = i; } else if (w > w1) { w1 = w; b1 = i; } }
    if (w1 <= 0) b1 = b0;
    const weight = w0 / (w0 + w1 || 1);
    // Painted occlusion: crevices go dark the way a hand-painted texture has them.
    let occ = 0;
    for (const [dist, wgt] of [[0.18, 0.5], [0.45, 0.32], [1, 0.18]]) {
      const reach = dist * aoReach;
      const f = fieldAt(x + ax * reach, y + ay * reach, z + az * reach);
      occ += wgt * Math.max(0, Math.min(1, 1 - f / reach));
    }
    const shade = Math.max(0.28, 1 - occ * 0.95 * aoAmount);
    out.x = x; out.y = y; out.z = z; out.nx = ax; out.ny = ay; out.nz = az; out.color[0] = r; out.color[1] = g; out.color[2] = b; out.em = em; out.bone = b0;
    if (paint) paint(out);
    verts.push(x, y, z, ax, ay, az, out.color[0] * shade, out.color[1] * shade, out.color[2] * shade, out.em, b0, b1, weight);
  }
  for (const t of tris) idx.push(t);
}

/** Per-frame pose: local euler rotations and offsets per bone, plus world skinning output. */
export class Pose {
  constructor(built) {
    this.built = built;
    const n = built.bones.length;
    this.rot = new Float32Array(n * 3);
    this.off = new Float32Array(n * 3);
    this.scale = new Float32Array(n).fill(1);
    this.matrices = new Float32Array(n * 12);
    this.world = new Array(n).fill(null).map(() => IDENT34());
    this.head = built.bones.map((b) => b.head);
    this._tmp = IDENT34();
    this._local = IDENT34();
  }
  reset() { this.rot.fill(0); this.off.fill(0); this.scale.fill(1); return this; }
  idx(n) { const i = this.built.boneIndex[n]; return i === undefined ? -1 : i; }
  /** Add a rotation (radians) about the bone's own pivot: x roll, y pitch, z yaw. */
  r(n, x = 0, y = 0, z = 0) { const i = this.idx(n); if (i >= 0) { this.rot[i * 3] += x; this.rot[i * 3 + 1] += y; this.rot[i * 3 + 2] += z; } return this; }
  o(n, x = 0, y = 0, z = 0) { const i = this.idx(n); if (i >= 0) { this.off[i * 3] += x; this.off[i * 3 + 1] += y; this.off[i * 3 + 2] += z; } return this; }
  s(n, v) { const i = this.idx(n); if (i >= 0) this.scale[i] = v; return this; }

  /** Recompute world transforms into the skinning array. Bones must be listed parent first. */
  evaluate() {
    const L = this._local, T = this._tmp, B = this.built.bones;
    for (let i = 0; i < B.length; i++) {
      const rx = this.rot[i * 3], ry = this.rot[i * 3 + 1], rz = this.rot[i * 3 + 2];
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz), s = this.scale[i];
      // R = Rz * Ry * Rx
      const r00 = cz * cy * s, r01 = (cz * sy * sx - sz * cx) * s, r02 = (cz * sy * cx + sz * sx) * s;
      const r10 = sz * cy * s, r11 = (sz * sy * sx + cz * cx) * s, r12 = (sz * sy * cx - cz * sx) * s;
      const r20 = -sy * s, r21 = cy * sx * s, r22 = cy * cx * s;
      const [hx, hy, hz] = this.head[i];
      L[0] = r00; L[1] = r01; L[2] = r02; L[3] = hx + this.off[i * 3] - (r00 * hx + r01 * hy + r02 * hz);
      L[4] = r10; L[5] = r11; L[6] = r12; L[7] = hy + this.off[i * 3 + 1] - (r10 * hx + r11 * hy + r12 * hz);
      L[8] = r20; L[9] = r21; L[10] = r22; L[11] = hz + this.off[i * 3 + 2] - (r20 * hx + r21 * hy + r22 * hz);
      const w = this.world[i];
      if (B[i].parent >= 0) { mul34(this.world[B[i].parent], L, T); w.set(T); } else w.set(L);
      this.matrices.set(w, i * 12);
    }
    return this.matrices;
  }
  /** A bone's pivot in model space after the last evaluate, for attaching effects. */
  bonePos(n, out = [0, 0, 0]) {
    const i = this.idx(n);
    if (i < 0) { out[0] = 0; out[1] = 0; out[2] = 0; return out; }
    const w = this.world[i], [x, y, z] = this.head[i];
    out[0] = w[0] * x + w[1] * y + w[2] * z + w[3];
    out[1] = w[4] * x + w[5] * y + w[6] * z + w[7];
    out[2] = w[8] * x + w[9] * y + w[10] * z + w[11];
    return out;
  }
}
