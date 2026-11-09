// Everything the fight paints on the floor: telegraphs, cones, the path to your
// spot. Built fresh each frame in one stream and drawn with depth testing so
// bodies stand in front of it.

import { triangulate } from './environment.js';

const STRIDE = 10; // pos3 rgba data3
export class DecalStream {
  constructor(maxVerts = 90000) { this.d = new Float32Array(maxVerts * STRIDE); this.n = 0; this.max = maxVerts; }
  reset() { this.n = 0; }
  v(x, y, z, c, a, u, w, mode) {
    if (this.n >= this.max) return;
    const i = this.n++ * STRIDE, D = this.d;
    D[i] = x; D[i + 1] = y; D[i + 2] = z; D[i + 3] = c[0]; D[i + 4] = c[1]; D[i + 5] = c[2]; D[i + 6] = a; D[i + 7] = u; D[i + 8] = w; D[i + 9] = mode;
  }
  fill(poly, z, c, a, mode = 0) {
    const tr = triangulate(poly);
    for (const i of tr) { const p = poly[i]; this.v(p[0], p[1], z, c, a, 0, 0, mode); }
  }
  /** A glow along the inside of a closed polygon: width in yards. */
  rim(poly, z, c, a, width) {
    let cx = 0, cy = 0; for (const p of poly) { cx += p[0]; cy += p[1]; } cx /= poly.length; cy /= poly.length;
    const inner = poly.map(([x, y]) => { const dx = cx - x, dy = cy - y, L = Math.hypot(dx, dy) || 1, s = Math.min(width, L * 0.8); return [x + dx / L * s, y + dy / L * s]; });
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length, a0 = poly[i], a1 = poly[j], b0 = inner[i], b1 = inner[j];
      this.v(a0[0], a0[1], z, c, a, 0, 1, 4); this.v(a1[0], a1[1], z, c, a, 0, 1, 4); this.v(b1[0], b1[1], z, c, a, 0, 0, 4);
      this.v(a0[0], a0[1], z, c, a, 0, 1, 4); this.v(b1[0], b1[1], z, c, a, 0, 0, 4); this.v(b0[0], b0[1], z, c, a, 0, 0, 4);
    }
  }
  /** A straight glowing or dashed line on the floor. dash: yards per dash cycle (0 = solid). */
  line(ax, ay, bx, by, z, width, c, a, dash = 0, scroll = 0) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); if (L < 0.01) return;
    const nx = -dy / L * width / 2, ny = dx / L * width / 2, mode = dash ? 5 : 1;
    const u0 = dash ? -scroll : 0, u1 = dash ? L / dash - scroll : 0;
    this.v(ax + nx, ay + ny, z, c, a, u0, 1, mode); this.v(bx + nx, by + ny, z, c, a, u1, 1, mode); this.v(bx - nx, by - ny, z, c, a, u1, -1, mode);
    this.v(ax + nx, ay + ny, z, c, a, u0, 1, mode); this.v(bx - nx, by - ny, z, c, a, u1, -1, mode); this.v(ax - nx, ay - ny, z, c, a, u0, -1, mode);
  }
  /** A closed outline. */
  ring(poly, z, width, c, a, dash = 0, scroll = 0) { for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; this.line(p[0], p[1], q[0], q[1], z, width, c, a, dash, scroll); } }
}
export const DECAL_STRIDE = STRIDE;
