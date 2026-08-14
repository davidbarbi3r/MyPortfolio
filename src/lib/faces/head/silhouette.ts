import type { Pt } from '../types';
import { smoothCircular } from '../math/geom2';
import { normalAt, surface } from './surface';
import type { HeadView } from './pose';

export interface OutlineOpts {
  /** Lower latitude bound, or a function of theta (a wavy hairline). */
  phiMin?: number | ((theta: number) => number);
  phiMax?: number;
  /** Push the surface out along its normal before projecting — hair volume. */
  expand?: number | ((theta: number, phi: number) => number);
  samples?: number;
  nTheta?: number;
  nPhi?: number;
}

/**
 * Projected outline of a region of the head, as a closed polyline.
 *
 * The exact silhouette of a deformed surface is the locus where
 * normal . toCamera = 0. That is solvable but heavy. Instead we take the
 * screen-space radial maximum of a dense sample, which is exact for any region
 * that is STAR-SHAPED about its projected centroid — true here because the
 * deformation profiles are bounded (see `deformBudget`) and poses are limited
 * to the range a portrait actually uses.
 *
 * Known limit: a nose in strong profile does not appear in the outline. Past
 * about 1.0 rad of yaw the nose variant draws a profile stroke crossing the
 * contour explicitly instead.
 */
export function projectedOutline(view: HeadView, opts: OutlineOpts = {}): Pt[] {
  const samples = opts.samples ?? 128;
  const NT = opts.nTheta ?? 72;
  const NP = opts.nPhi ?? 40;
  const phiMax = opts.phiMax ?? Math.PI / 2;
  const phiMinFn = typeof opts.phiMin === 'function' ? opts.phiMin : () => (opts.phiMin as number) ?? -Math.PI / 2;
  const expandFn = typeof opts.expand === 'function' ? opts.expand : () => (opts.expand as number) ?? 0;

  const rad = new Float64Array(samples);
  const pts: Pt[] = [];
  let sx = 0;
  let sy = 0;

  for (let i = 0; i < NT; i++) {
    const t = (i / NT) * Math.PI * 2 - Math.PI;
    const lo = phiMinFn(t);
    if (lo >= phiMax) continue;
    for (let j = 0; j <= NP; j++) {
      const p = lo + ((phiMax - lo) * j) / NP;
      const e = expandFn(t, p);
      let s = surface(view.head, t, p);
      if (e !== 0) {
        const n = normalAt(view.head, t, p);
        s = [s[0] + n[0] * e, s[1] + n[1] * e, s[2] + n[2] * e];
      }
      const q = view.project(s);
      pts.push(q);
      sx += q[0];
      sy += q[1];
    }
  }

  if (pts.length < 8) return [];

  const cx = sx / pts.length;
  const cy = sy / pts.length;

  for (const q of pts) {
    const a = Math.atan2(q[1] - cy, q[0] - cx);
    let k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * samples) % samples;
    if (k < 0) k += samples;
    const r = Math.hypot(q[0] - cx, q[1] - cy);
    if (r > rad[k]) rad[k] = r;
  }

  // Fill empty angular bins from their nearest non-empty neighbours.
  for (let i = 0; i < samples; i++) {
    if (rad[i] > 0) continue;
    let prev = 0;
    let next = 0;
    for (let k = 1; k < samples; k++) {
      const v = rad[(i - k + samples) % samples];
      if (v > 0) {
        prev = v;
        break;
      }
    }
    for (let k = 1; k < samples; k++) {
      const v = rad[(i + k) % samples];
      if (v > 0) {
        next = v;
        break;
      }
    }
    rad[i] = prev && next ? (prev + next) / 2 : Math.max(prev, next);
  }

  smoothCircular(rad, 2);

  const out: Pt[] = new Array(samples);
  for (let k = 0; k < samples; k++) {
    const a = ((k + 0.5) / samples) * Math.PI * 2 - Math.PI;
    out[k] = [cx + rad[k] * Math.cos(a), cy + rad[k] * Math.sin(a)];
  }
  return out;
}

export const silhouette = (view: HeadView, samples = 128): Pt[] => projectedOutline(view, { samples });

/** Outline of the scalp above a (possibly wavy) hairline — the base of all hair. */
export const capOutline = (
  view: HeadView,
  hairline: number | ((theta: number) => number),
  expand = 0,
  samples = 96
): Pt[] => projectedOutline(view, { phiMin: hairline, expand, samples, nTheta: 64, nPhi: 22 });

export function silhouetteCentre(sil: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of sil) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / sil.length, sy / sil.length];
}

/**
 * Extract a contiguous sub-arc of a closed outline, by normalized position.
 * Used for the partial second contour pass drawn over the features.
 */
export function subArc(sil: Pt[], from: number, to: number): Pt[] {
  const n = sil.length;
  const a = Math.round(from * n);
  const count = Math.max(2, Math.round((to - from) * n));
  const out: Pt[] = [];
  for (let i = 0; i <= count; i++) out.push(sil[(((a + i) % n) + n) % n]);
  return out;
}

/** A ring of [theta, phi] at constant latitude. */
export function latitudeRing(phi: number, segments = 48, fromT = -Math.PI, toT = Math.PI): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) out.push([fromT + ((toT - fromT) * i) / segments, phi]);
  return out;
}
