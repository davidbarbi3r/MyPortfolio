// Value noise + fBm.
//
// Stroke wobble MUST come from smooth noise along arc length, not from
// per-point white noise. White noise reads as digital fuzz — a barbed-wire
// edge. Three octaves of value noise reads as a hand searching for the line:
// a slow drift, a medium hesitation, and a fine paper-grain tremor.

export type Noise1 = (x: number, octaves?: number, lacunarity?: number, gain?: number) => number;
export type Noise2 = (x: number, y: number, octaves?: number) => number;

function lattice(i: number, seed: number): number {
  let x = Math.imul(i ^ seed, 0x27d4eb2d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  return ((x >>> 0) / 4294967296) * 2 - 1;
}

/** 1D fBm in [-1, 1]. */
export function makeNoise1(seed: number): Noise1 {
  const value = (x: number): number => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lattice(i, seed) * (1 - u) + lattice(i + 1, seed) * u;
  };

  return (x, octaves = 3, lacunarity = 2.1, gain = 0.5) => {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * value(x * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return norm > 0 ? sum / norm : 0;
  };
}

/** 2D fBm in [-1, 1]. Used for paper blotches and ink-fill edge decay. */
export function makeNoise2(seed: number): Noise2 {
  const h = (i: number, j: number): number => lattice(i + Math.imul(j, 0x9e3779b1), seed);

  const value = (x: number, y: number): number => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = h(i, j) * (1 - ux) + h(i + 1, j) * ux;
    const b = h(i, j + 1) * (1 - ux) + h(i + 1, j + 1) * ux;
    return a * (1 - uy) + b * uy;
  };

  return (x, y, octaves = 3) => {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * value(x * freq, y * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return norm > 0 ? sum / norm : 0;
  };
}
