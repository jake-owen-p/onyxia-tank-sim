// Small matrix helpers for the WebGL world. World space is the simulation's:
// x east, y north, z up, in yards. Matrices are column-major Float32Arrays.

export function perspective(fovy, aspect, near, far, out = new Float32Array(16)) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect; out[5] = f; out[10] = (far + near) * nf; out[11] = -1; out[14] = 2 * far * near * nf;
  return out;
}

export function lookAt(e, c, up, out = new Float32Array(16)) {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
  let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
  let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
  l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
  out[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
  out[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
  out[15] = 1;
  return out;
}

export function mul4(a, b, out = new Float32Array(16)) {
  for (let c = 0; c < 4; c++) {
    const x = b[c * 4], y = b[c * 4 + 1], z = b[c * 4 + 2], w = b[c * 4 + 3];
    out[c * 4] = a[0] * x + a[4] * y + a[8] * z + a[12] * w;
    out[c * 4 + 1] = a[1] * x + a[5] * y + a[9] * z + a[13] * w;
    out[c * 4 + 2] = a[2] * x + a[6] * y + a[10] * z + a[14] * w;
    out[c * 4 + 3] = a[3] * x + a[7] * y + a[11] * z + a[15] * w;
  }
  return out;
}

/** A model matrix: rotate about z by `heading`, uniform scale, then translate. */
export function placement(x, y, z, heading, s, out = new Float32Array(16)) {
  const c = Math.cos(heading) * s, n = Math.sin(heading) * s;
  out[0] = c; out[1] = n; out[2] = 0; out[3] = 0;
  out[4] = -n; out[5] = c; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = s; out[11] = 0;
  out[12] = x; out[13] = y; out[14] = z; out[15] = 1;
  return out;
}

// ---- 3x4 affine transforms stored as three rows [r00 r01 r02 tx, r10 ...].
export const IDENT34 = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]);

export function mul34(a, b, out, oi = 0) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3], b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7], b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
  out[oi] = a00 * b00 + a01 * b10 + a02 * b20;
  out[oi + 1] = a00 * b01 + a01 * b11 + a02 * b21;
  out[oi + 2] = a00 * b02 + a01 * b12 + a02 * b22;
  out[oi + 3] = a00 * b03 + a01 * b13 + a02 * b23 + a03;
  out[oi + 4] = a10 * b00 + a11 * b10 + a12 * b20;
  out[oi + 5] = a10 * b01 + a11 * b11 + a12 * b21;
  out[oi + 6] = a10 * b02 + a11 * b12 + a12 * b22;
  out[oi + 7] = a10 * b03 + a11 * b13 + a12 * b23 + a13;
  out[oi + 8] = a20 * b00 + a21 * b10 + a22 * b20;
  out[oi + 9] = a20 * b01 + a21 * b11 + a22 * b21;
  out[oi + 10] = a20 * b02 + a21 * b12 + a22 * b22;
  out[oi + 11] = a20 * b03 + a21 * b13 + a22 * b23 + a23;
  return out;
}

export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (a, b, v) => { const k = clamp01((v - a) / (b - a)); return k * k * (3 - 2 * k); };

/** sRGB hex ('#rrggbb') to a [0..1] triple, unchanged. */
export function hex(c) {
  if (Array.isArray(c)) return c;
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

/** Any CSS colour the palette uses ('#hex', '#hexaa', 'rgba(...)') to [r,g,b,a] in 0..1. */
export function cssColor(c) {
  if (!c) return [1, 1, 1, 1];
  if (c[0] === '#') {
    const s = c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
    const rgb = hex(s.slice(0, 7));
    return [...rgb, s.length >= 9 ? parseInt(s.slice(7, 9), 16) / 255 : 1];
  }
  const m = c.match(/[\d.]+/g);
  if (!m) return [1, 1, 1, 1];
  return [m[0] / 255, m[1] / 255, m[2] / 255, m[3] === undefined ? 1 : +m[3]];
}

/** Deterministic pseudo random in 0..1 for layout and paint decisions. */
export function hash(a, b = 0, c = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise in 3D, 0..1, for build-time displacement and painting. */
export function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const L = (a, b, k) => a + (b - a) * k;
  return L(
    L(L(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), L(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
    L(L(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), L(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
    w);
}
export function fbm(x, y, z, oct = 3) {
  let a = 0.5, s = 0, n = 0;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x, y, z); n += a; a *= 0.5; x *= 2.03; y *= 2.03; z *= 2.03; }
  return s / n;
}
