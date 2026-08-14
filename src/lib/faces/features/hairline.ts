import type { Pt } from '../types';
import type { Rng } from '../rng';
import { normalAt, surface } from '../head/surface';
import type { HeadView } from '../head/pose';

// Hairline shapes, picked INDEPENDENTLY of the hair-mass variant so the two
// axes multiply instead of adding: inkCap x widowsPeak, scribbleMass x
// recedingM, and so on. Five hair variants used to share one cos^2 dip, which
// is why every fringe read the same.

export interface HairlineParams {
  /** Nominal latitude of the hairline. */
  base: number;
  /** How far it drops at the front. */
  fringe: number;
  /** -1..1 asymmetry. */
  lean: number;
  /** 0..1 zigzag. */
  ragged: number;
  /** 0..1 depth of a widow's peak. */
  peak: number;
  lobes: number;
}

/** What a notch generator needs to cut re-entrant detail out of a drawn mass. */
export interface CapGeometry {
  /** Project a head-surface point, optionally pushed out along its normal. */
  at(theta: number, phi: number, expand?: number): Pt;
  /** Whether a longitude is on the near side at the current pose. */
  visible(theta: number): boolean;
  /** Face units per model unit. */
  scale: number;
}

export interface HairlineProfile {
  name: string;
  label: string;
  weight: number;
  tags?: string[];
  /**
   * Latitude of the hairline at longitude theta.
   *
   * Must not be re-entrant. `env.cap` is a radial max about the cap centroid,
   * so a concavity — receding temples, an M-shape — is silently filled in. A
   * downward spike is fine (a spike is a maximum); a notch is not.
   */
  phi(theta: number, p: HairlineParams): number;
  /**
   * Re-entrant detail, cut back out of the mass afterwards. This is the same
   * trick `inkCap` already uses for its parting: fill first, erase second.
   * Returns face-space polygons.
   */
  notch?(p: HairlineParams, geo: CapGeometry): Pt[][];
}

/** How frontal a longitude is, 0..1. The building block of every profile. */
const front = (theta: number): number => Math.max(0, Math.cos(theta));

const ripple = (theta: number, p: HairlineParams): number =>
  Math.sin(theta * p.lobes + p.lean * 2.1) * 0.05 * (1 + p.ragged * 2.5) +
  Math.sin(theta * (p.lobes * 2.7 + 1.3)) * 0.035 * p.ragged;

/** Two quads biting into the mass at the temples, in head coordinates so they
 *  follow the skull when it turns. */
function templeNotches(p: HairlineParams, geo: CapGeometry, reach: number, width: number): Pt[][] {
  const out: Pt[][] = [];
  for (const s of [-1, 1]) {
    const inner = s * 0.42;
    const outer = s * (0.42 + width);
    if (!geo.visible(inner) && !geo.visible(outer)) continue;
    const lo = p.base - 0.05;
    out.push([
      geo.at(inner, lo, 0.02),
      geo.at(outer, lo - 0.04, 0.02),
      geo.at(outer, lo + reach, 0.02),
      geo.at(inner, lo + reach * 0.82, 0.02),
    ]);
  }
  return out;
}

export const HAIRLINE_PROFILES: Record<string, HairlineProfile> = {
  /** The original shape, kept so the look it produced remains reachable. */
  rounded: {
    name: 'rounded',
    label: 'Arrondie',
    weight: 3,
    phi: (t, p) => p.base - p.fringe * front(t) * front(t) + ripple(t, p),
  },

  /** Flat across the forehead, falling away only at the temples — a blunt cut. */
  blunt: {
    name: 'blunt',
    label: 'Droite',
    weight: 2.5,
    phi: (t, p) => {
      const a = Math.abs(t);
      // Hold the drop constant over the front, then release it.
      const hold = a < 0.85 ? 1 : Math.max(0, 1 - (a - 0.85) / 0.55);
      return p.base - p.fringe * hold + ripple(t, p) * 0.5;
    },
  },

  high: {
    name: 'high',
    label: 'Haute',
    weight: 1.6,
    phi: (t, p) => p.base + 0.14 - p.fringe * 0.3 * front(t) * front(t) + ripple(t, p),
  },

  low: {
    name: 'low',
    label: 'Basse',
    weight: 1.6,
    phi: (t, p) => p.base - 0.15 - p.fringe * 1.15 * front(t) * front(t) + ripple(t, p) * 0.7,
  },

  /** A narrow downward spike at the centre. Safe as a pure profile: a spike is
   *  a radial maximum, so the outline keeps it. */
  widowsPeak: {
    name: 'widowsPeak',
    label: 'Pointe de veuve',
    weight: 1.8,
    phi: (t, p) => {
      const spike = Math.exp(-(t * t) / (2 * 0.32 * 0.32)) * (0.1 + p.peak * 0.3);
      return p.base - p.fringe * 0.6 * front(t) * front(t) - spike + ripple(t, p) * 0.6;
    },
  },

  /** Receding temples. Genuinely concave, so the shape lives in the notch. */
  recedingM: {
    name: 'recedingM',
    label: 'Golfes dégarnis',
    weight: 1.6,
    tags: ['age'],
    phi: (t, p) => p.base + 0.06 - p.fringe * 0.45 * front(t) * front(t) + ripple(t, p) * 0.5,
    notch: (p, geo) => templeNotches(p, geo, 0.34 + p.peak * 0.22, 0.34),
  },

  /** Balding: high all round, with a broad bite out of the front. */
  receded: {
    name: 'receded',
    label: 'Dégarnie',
    weight: 1.2,
    tags: ['age'],
    phi: (t, p) => p.base + 0.24 - p.fringe * 0.2 * front(t) * front(t) + ripple(t, p) * 0.4,
    notch: (p, geo) => {
      const lo = p.base + 0.18;
      const reach = 0.42;
      const ring: Pt[] = [];
      for (let i = 0; i <= 10; i++) {
        const t = -0.9 + (1.8 * i) / 10;
        ring.push(geo.at(t, lo, 0.02));
      }
      for (let i = 10; i >= 0; i--) {
        const t = -0.9 + (1.8 * i) / 10;
        const d = Math.cos((t / 0.9) * (Math.PI / 2));
        ring.push(geo.at(t, lo + reach * (0.35 + 0.65 * d), 0.02));
      }
      return [ring];
    },
  },

  ragged: {
    name: 'ragged',
    label: 'Irrégulière',
    weight: 1.8,
    phi: (t, p) => p.base - p.fringe * front(t) * front(t) + ripple(t, p) * (1.6 + p.ragged * 2),
  },

  /** Generalises the asymmetric line that `sideSweep` used to define inline. */
  sideSwept: {
    name: 'sideSwept',
    label: 'Sur le côté',
    weight: 2,
    phi: (t, p) => {
      const s = p.lean >= 0 ? 1 : -1;
      const lean = 0.5 + 0.5 * Math.sin(t) * s;
      return p.base - p.fringe * front(t) * front(t) * (0.45 + lean) + ripple(t, p) * 0.6;
    },
  },
};

export const hairlineWeights = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const k of Object.keys(HAIRLINE_PROFILES)) out[k] = HAIRLINE_PROFILES[k].weight;
  return out;
};

/** Falls back rather than throwing: a face generated before this existed has
 *  no profile key at all. */
export const hairlineProfile = (name: string | undefined): HairlineProfile =>
  HAIRLINE_PROFILES[name ?? ''] ?? HAIRLINE_PROFILES.rounded;

/**
 * Extra params for a hair variant's `roll()`. Append the spread at the END of
 * the literal: each variant rolls on its own `roll:hair` fork, and appending
 * keeps every earlier param byte-identical.
 */
export function rollHairline(rng: Rng): Record<string, number | string> {
  const r = rng.fork('hairline');
  return {
    hlProfile: r.weighted(hairlineWeights()),
    hlLean: r.gaussian(0, 0.8),
    hlRagged: r.float(0, 1),
    hlPeak: r.float(0, 1),
  };
}

export function hairlineParamsFrom(p: Record<string, number | string>, lobes: number): HairlineParams {
  return {
    base: (p.base as number) ?? 0.72,
    fringe: (p.fringe as number) ?? 0.2,
    lean: (p.hlLean as number) ?? 0,
    ragged: (p.hlRagged as number) ?? 0,
    peak: (p.hlPeak as number) ?? 0,
    lobes,
  };
}

export function capGeometry(view: HeadView): CapGeometry {
  return {
    scale: view.scale,
    at: (theta, phi, expand = 0) => {
      const s = surface(view.head, theta, phi);
      if (expand === 0) return view.project(s);
      const n = normalAt(view.head, theta, phi);
      return view.project([s[0] + n[0] * expand, s[1] + n[1] * expand, s[2] + n[2] * expand]);
    },
    // Same near-side test the wrinkle features use.
    visible: (theta) => Math.cos(theta - view.pose.yaw) > 0.12,
  };
}
