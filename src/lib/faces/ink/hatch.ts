import type { HatchOpts, Pt, StrokeSpec } from '../types';
import type { Rng } from '../rng';
import { makeNoise1 } from '../noise';
import { boundsOf, centroid } from '../math/geom2';
import { strokePolyline } from './stroke';
import type { DrawSink } from './sink';

const rot = (p: Pt, c: Pt, ca: number, sa: number): Pt => {
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca];
};

/** Scanline intersections of a horizontal ray with a closed polygon. */
function scanline(poly: Pt[], y: number): number[] {
  const xs: number[] = [];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][1];
    const yj = poly[j][1];
    if (yi > y !== yj > y) {
      xs.push(poly[i][0] + ((y - yi) / (yj - yi)) * (poly[j][0] - poly[i][0]));
    }
  }
  return xs.sort((a, b) => a - b);
}

/**
 * Fill a polygon with hand-drawn hatching.
 *
 * The `warp` argument is what makes hatching carry volume rather than sit on
 * top of the drawing: lines are laid out flat, then bent along the head
 * surface. A cheek whose hatch follows the curvature reads as a sphere with no
 * other shading cue at all.
 */
export function hatch(
  sink: DrawSink,
  poly: Pt[],
  spec: StrokeSpec,
  rng: Rng,
  opts: HatchOpts,
  warp?: (p: Pt) => Pt
): void {
  if (poly.length < 3) return;

  const spacing = Math.max(1.2, opts.spacing ?? 5.5);
  const jitter = opts.jitter ?? 0.4;
  const overshoot = opts.overshoot ?? spacing * 0.3;
  const noise = makeNoise1(rng.int(0, 2 ** 30));

  const pass = (angle: number, gap: number): void => {
    const c = centroid(poly);
    const ca = Math.cos(-angle);
    const sa = Math.sin(-angle);
    const back = { ca: Math.cos(angle), sa: Math.sin(angle) };

    const rotated = poly.map((p) => rot(p, c, ca, sa));
    const [, y0, , y1] = boundsOf(rotated);

    let y = y0 + gap * rng.float(0.2, 0.9);
    let k = 0;
    while (y < y1) {
      const xs = scanline(rotated, y);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        let xa = xs[i];
        let xb = xs[i + 1];
        if (xb - xa < gap * 0.35) continue;
        // Hatching that stops exactly on the boundary reads as a clip path.
        xa -= overshoot * rng.float(0.3, 1.2);
        xb += overshoot * rng.float(0.3, 1.2);

        const steps = Math.max(2, Math.round((xb - xa) / 6));
        const seg: Pt[] = [];
        for (let t = 0; t <= steps; t++) {
          const p = rot([xa + ((xb - xa) * t) / steps, y], c, back.ca, back.sa);
          seg.push(warp ? warp(p) : p);
        }
        strokePolyline(sink, seg, spec, rng);
      }
      k++;
      y += gap * (1 + jitter * noise(k * 0.7, 2));
    }
  };

  pass(opts.angle, spacing);

  if (opts.cross) {
    // A different spacing on the crossing pass — identical spacing moires.
    pass(opts.crossAngle ?? opts.angle + Math.PI / 2.4, spacing * rng.float(1.25, 1.7));
  }
}
