// Deterministic seeded RNG (mulberry32). Every random choice the simulation
// makes goes through this so a run can be reproduced from its seed.

export function createRng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    /** Uniform in [0,1). */
    next,
    /** Uniform in [lo,hi). */
    range: (lo, hi) => lo + (hi - lo) * next(),
    /** Integer in [0,n). */
    int: (n) => Math.floor(next() * n),
    /** Random element. */
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    /** Current seed state for snapshots. */
    get state() { return a; },
    set state(v) { a = v >>> 0; },
  };
}
