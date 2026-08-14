import type { Pt, StrokeSpec } from '../types';
import type { Rng } from '../rng';
import { catmullRom } from '../math/geom2';
import { strokePolyline } from './stroke';
import type { DrawSink } from './sink';

export interface PathOpts {
  closed?: boolean;
  /** Catmull-Rom subdivisions per span. 0 keeps the polyline as authored. */
  smooth?: number;
}

export function sketchPath(sink: DrawSink, pts: Pt[], s: StrokeSpec, rng: Rng, opts?: PathOpts): void {
  if (pts.length < 2) return;
  let path = pts;
  const smooth = opts?.smooth ?? 0;
  if (smooth > 0 && pts.length >= 3) path = catmullRom(pts, Math.max(2, Math.round(smooth * 8)), opts?.closed);
  if (opts?.closed && path.length > 2) path = [...path, path[0]];
  strokePolyline(sink, path, s, rng);
}

export function sketchLine(sink: DrawSink, a: Pt, b: Pt, s: StrokeSpec, rng: Rng): void {
  strokePolyline(sink, [a, b], s, rng);
}

export interface EllipseOpts {
  /** Radians of arc left out — an unclosed circle. */
  openness?: number;
  /** Radians drawn PAST 2*PI. The circling gesture of a sketch; never 0 for ink. */
  loop?: number;
}

export function sketchEllipse(
  sink: DrawSink,
  c: Pt,
  rx: number,
  ry: number,
  rot: number,
  s: StrokeSpec,
  rng: Rng,
  opts?: EllipseOpts
): void {
  const loop = opts?.loop ?? 0;
  const open = opts?.openness ?? 0;
  const span = Math.PI * 2 + loop - open;
  if (span <= 0.2) return;

  const start = rng.float(0, Math.PI * 2);
  const segs = Math.max(14, Math.round((span * Math.max(Math.abs(rx), Math.abs(ry))) / 2.5));
  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  const pts: Pt[] = new Array(segs + 1);

  for (let i = 0; i <= segs; i++) {
    const a = start + (span * i) / segs;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    pts[i] = [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca];
  }
  strokePolyline(sink, pts, s, rng);
}

export function sketchPoly(sink: DrawSink, pts: Pt[], s: StrokeSpec, rng: Rng): void {
  sketchPath(sink, pts, s, rng, { closed: true });
}

/** An irregular closed blob — nostrils, pupils, ink spots. */
export function blob(c: Pt, r: number, rng: Rng, lobes = 7, wobble = 0.28): Pt[] {
  const out: Pt[] = [];
  const phase = rng.float(0, Math.PI * 2);
  const n = Math.max(8, lobes * 3);
  const k1 = rng.float(0.6, 1.4);
  const k2 = rng.float(1.6, 2.8);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr =
      r * (1 + wobble * 0.6 * Math.sin(a * k1 * lobes + phase) + wobble * 0.4 * Math.sin(a * k2 + phase * 1.7));
    out.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * rng.float(0.97, 1.03)]);
  }
  return out;
}

/** Build a closed polygon from an upper and a lower open curve. */
export function closeBetween(upper: Pt[], lower: Pt[]): Pt[] {
  return [...upper, ...lower.slice().reverse()];
}
