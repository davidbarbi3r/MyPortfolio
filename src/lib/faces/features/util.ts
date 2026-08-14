import type { Pt } from '../types';
import type { Rng } from '../rng';
import type { InkContext } from '../ink/ink-context';
import { blob } from '../ink/shapes';

/** Map a list of local [-1,1] points into face space. */
export const lp = (ink: InkContext, pts: Array<[number, number]>): Pt[] => pts.map(([x, y]) => ink.p(x, y));

/** An irregular closed blob authored in local space, so it foreshortens. */
export function localBlob(ink: InkContext, x: number, y: number, r: number, rng: Rng, lobes = 7, wobble = 0.28): Pt[] {
  return blob([x, y], r, rng, lobes, wobble).map(([lx, ly]) => ink.p(lx, ly));
}

/** Local-space arc as a point list, in face space. */
export function localArc(
  ink: InkContext,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps = 14
): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    out.push(ink.p(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry));
  }
  return out;
}

/** Angle of the shared light direction, for contact shadows. */
export const lightAngle = (ink: InkContext): number => Math.atan2(ink.light[1], ink.light[0]);

/**
 * A contact shadow just under a form. These are what tie separate strokes into
 * one lit object — without a single shared light every feature floats on its
 * own.
 */
export function shadeUnder(ink: InkContext, region: Pt[], amount: number, spacing?: number): void {
  if (amount <= 0.02 || region.length < 3) return;
  ink.hatch(region, {
    angle: lightAngle(ink) + 0.35,
    spacing,
    alpha: 0.42 * amount * ink.style.texture.shadingAmount,
    role: 'hatch',
  });
}

/** Convert a local radius to canonical face units. */
export const faceUnits = (ink: InkContext, localR: number): number => localR * ink.frame.scale;

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
