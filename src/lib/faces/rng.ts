// Deterministic RNG for face generation.
//
// The important design decision here is `fork`: a child stream is derived by
// re-hashing (rootSeed, nameChain) rather than by consuming the parent stream.
//
// If children consumed the parent, adding a single draw inside one feature
// function would shift every subsequent draw, and every previously generated
// face would change. A contact sheet you liked today would be destroyed by the
// next commit. With name-derived forks, each sub-stream is independent of call
// order, call count and the presence of its siblings.
//
// The contract that must stay stable is therefore the CHAIN OF NAMES, not the
// order of calls. Renaming a namespace reseeds everything under it.

export type Rng = {
  readonly seed: number;
  next(): number;
  float(min: number, max: number): number;
  int(min: number, max: number): number;
  bool(p?: number): boolean;
  sign(): -1 | 1;
  pick<T>(arr: readonly T[]): T;
  weighted<T extends string>(table: Record<T, number>): T;
  gaussian(mean?: number, sd?: number): number;
  jitter(v: number, amount: number): number;
  shuffle<T>(arr: T[]): T[];
  fork(namespace: string, index?: number): Rng;
};

/** FNV-1a, 32 bit. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const toSeed = (s: string | number): number => (typeof s === 'number' ? s >>> 0 : hash32(s));

export function makeRng(seed: string | number, path = ''): Rng {
  const root = toSeed(seed);
  let state = (root ^ hash32(path)) >>> 0;

  // mulberry32
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Box-Muller spare, cached per instance and never shared with forks.
  let spare: number | null = null;

  const rng: Rng = {
    seed: root,
    next,
    float: (min, max) => min + next() * (max - min),
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    bool: (p = 0.5) => next() < p,
    sign: () => (next() < 0.5 ? -1 : 1),
    pick: (arr) => arr[Math.floor(next() * arr.length)],

    weighted: <T extends string>(table: Record<T, number>): T => {
      // Keys are sorted so the literal declaration order in a style file cannot
      // silently change which variant a seed resolves to.
      const keys = (Object.keys(table) as T[]).sort();
      let total = 0;
      for (const k of keys) total += Math.max(0, table[k]);
      if (total <= 0) return keys[0];
      let r = next() * total;
      for (const k of keys) {
        r -= Math.max(0, table[k]);
        if (r <= 0) return k;
      }
      return keys[keys.length - 1];
    },

    gaussian: (mean = 0, sd = 1) => {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return mean + sd * v;
      }
      let u = 0;
      let v = 0;
      let s = 0;
      do {
        u = next() * 2 - 1;
        v = next() * 2 - 1;
        s = u * u + v * v;
      } while (s >= 1 || s === 0);
      const m = Math.sqrt((-2 * Math.log(s)) / s);
      spare = v * m;
      return mean + sd * u * m;
    },

    jitter: (v, amount) => v * (1 + (next() * 2 - 1) * amount),

    shuffle: <T>(arr: T[]): T[] => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },

    fork: (ns, index) => makeRng(root, `${path}/${ns}${index === undefined ? '' : `#${index}`}`),
  };

  return rng;
}
