import type { InkFillOpts, Pt, StippleOpts, StrokeSpec } from '../types';
import type { Rng } from '../rng';
import { makeNoise2 } from '../noise';
import { boundsOf, centroid, dilate, pointInPoly, resampleByArcLength } from '../math/geom2';
import { strokePolyline } from './stroke';
import { blob } from './shapes';
import type { DrawSink } from './sink';

function closedNormal(pts: Pt[], i: number): Pt {
  const n = pts.length;
  const a = pts[(i - 1 + n) % n];
  const b = pts[(i + 1) % n];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  return [-dy / l, dx / l];
}

/**
 * A solid mass of ink — hair, heavy brows, a beard.
 *
 * The three things that stop this reading as a plain fill(): a boundary
 * displaced by seamless 2D noise at two scales, stray hairs escaping the
 * outline, and white reserves punched back out where the ink didn't take.
 * Without the reserves in particular it always looks like a vector shape.
 */
export function inkFill(sink: DrawSink, poly: Pt[], spec: StrokeSpec, rng: Rng, opts?: InkFillOpts): void {
  if (poly.length < 3) return;

  const ragged = opts?.ragged ?? 1;
  const color = opts?.color ?? spec.color;
  const alpha = opts?.alpha ?? 1;

  const c = centroid(poly);
  let meanR = 0;
  for (const p of poly) meanR += Math.hypot(p[0] - c[0], p[1] - c[1]);
  meanR /= poly.length;

  // Resample the loop so displacement has enough resolution to bite.
  const loop = resampleByArcLength([...poly, poly[0]], Math.max(1.5, meanR * 0.035));
  loop.pop();
  if (loop.length < 6) return;

  // Orient normals outward.
  const n0 = closedNormal(loop, 0);
  const orient = (loop[0][0] - c[0]) * n0[0] + (loop[0][1] - c[1]) * n0[1] < 0 ? -1 : 1;

  const nz = makeNoise2(rng.int(0, 2 ** 30));
  const bigAmp = meanR * 0.06 * ragged;
  const fineAmp = Math.max(0.6, meanR * 0.012) * ragged;

  const edge: Pt[] = loop.map((p, i) => {
    const a = (i / loop.length) * Math.PI * 2;
    // Sampled on a circle in noise space so the loop closes seamlessly.
    const d = nz(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 2) * bigAmp + nz(Math.cos(a) * 9, Math.sin(a) * 9, 2) * fineAmp;
    const [nx, ny] = closedNormal(loop, i);
    return [p[0] + nx * orient * d, p[1] + ny * orient * d];
  });

  sink.fillPolygon(edge, color, alpha);

  // Ink bleed: a dilated, very transparent second pass.
  if (opts?.bleed) {
    sink.fillPolygon(dilate(edge, 1 + opts.bleed * 0.12), color, alpha * 0.14);
  }

  // Stray hairs escaping the mass.
  const strays = opts?.strays ?? 0;
  for (let i = 0; i < strays; i++) {
    const k = rng.int(0, edge.length - 1);
    const [nx, ny] = closedNormal(loop, k);
    const len = meanR * rng.float(0.1, 0.34);
    const tip: Pt = [
      edge[k][0] + nx * orient * len + rng.gaussian(0, len * 0.25),
      edge[k][1] + ny * orient * len + rng.gaussian(0, len * 0.25),
    ];
    const mid: Pt = [
      (edge[k][0] + tip[0]) / 2 + rng.gaussian(0, len * 0.2),
      (edge[k][1] + tip[1]) / 2 + rng.gaussian(0, len * 0.2),
    ];
    strokePolyline(
      sink,
      [edge[k], mid, tip],
      { ...spec, color, taper: 1, taperBias: -0.9, passes: 1, gapChance: 0, overshoot: 0 },
      rng
    );
  }

  // White reserves — the ink didn't take everywhere.
  const holes = opts?.holes ?? 0;
  for (let i = 0; i < holes; i++) {
    const a = rng.float(0, Math.PI * 2);
    const r = meanR * rng.float(0.15, 0.6);
    const hc: Pt = [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
    if (!pointInPoly(edge, hc[0], hc[1])) continue;
    sink.erase(blob(hc, meanR * rng.float(0.05, 0.14), rng, rng.int(4, 8), 0.5));
  }
}

/** Grain dots inside a region. Radii vary — a constant dot size reads digital. */
export function stipple(sink: DrawSink, poly: Pt[], rng: Rng, opts?: StippleOpts): void {
  if (poly.length < 3) return;

  const density = opts?.density ?? 0.5;
  const baseR = opts?.radius ?? 1.1;
  const [x0, y0, x1, y1] = boundsOf(poly);
  const step = Math.max(2.2, 7 / Math.max(0.05, density));

  const xy: number[] = [];
  const rs: number[] = [];

  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const px = x + rng.float(-step * 0.55, step * 0.55);
      const py = y + rng.float(-step * 0.55, step * 0.55);
      if (!pointInPoly(poly, px, py)) continue;
      if (opts?.gradient && rng.next() > opts.gradient([px, py])) continue;
      xy.push(px, py);
      rs.push(Math.max(0.25, rng.gaussian(baseR, baseR * 0.4)));
    }
  }

  sink.dots(xy, rs, opts?.color ?? '#000', opts?.alpha ?? 0.7);
}
