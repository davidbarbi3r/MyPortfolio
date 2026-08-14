import type { Pt, StrokeSpec } from '../types';
import type { Rng } from '../rng';
import { makeNoise1 } from '../noise';
import {
  curvatureAtIndex,
  extendEnds,
  normalAtIndex,
  resampleByArcLength,
  tangentAtIndex,
  totalLength,
} from '../math/geom2';
import type { DrawSink } from './sink';

/**
 * Build the outline of a variable-width stroke.
 *
 * Strokes are FILLED RIBBONS, not ctx.stroke(). A constant line width is the
 * number one tell of vector art; a real pen varies its width with pressure and
 * speed, and the only way to get that is to construct the stroke's contour.
 */
export function ribbon(pts: Pt[], widths: number[]): Pt[] {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [nx, ny] = normalAtIndex(pts, i);
    const h = Math.max(0.05, widths[i]) / 2;
    left.push([pts[i][0] + nx * h, pts[i][1] + ny * h]);
    right.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
  }
  right.reverse();
  return left.concat(right);
}

interface Segment {
  pts: Pt[];
  widths: number[];
}

/**
 * Break a stroke into pieces. Gaps are forbidden in the first and last 15%:
 * a missing middle reads as drawing, a missing end reads as a bug.
 */
function splitOnGaps(pts: Pt[], widths: number[], chance: number, rng: Rng): Segment[] {
  const n = pts.length;
  if (chance <= 0 || n < 12) return [{ pts, widths }];

  // Normalise to an expected gap count per stroke rather than per point.
  const pPoint = (chance * 10) / n;
  const segs: Segment[] = [];
  let cur: Segment = { pts: [], widths: [] };

  let i = 0;
  while (i < n) {
    const t = i / (n - 1);
    if (t > 0.15 && t < 0.85 && cur.pts.length > 2 && rng.next() < pPoint) {
      segs.push(cur);
      cur = { pts: [], widths: [] };
      i += rng.int(1, 3);
      continue;
    }
    cur.pts.push(pts[i]);
    cur.widths.push(widths[i]);
    i++;
  }
  if (cur.pts.length > 1) segs.push(cur);
  return segs.filter((s) => s.pts.length > 1);
}

export function strokePolyline(sink: DrawSink, input: Pt[], s: StrokeSpec, rng: Rng): void {
  if (input.length < 2) return;

  const noiseN = makeNoise1(rng.int(0, 2 ** 30));
  const noiseT = makeNoise1(rng.int(0, 2 ** 30));
  const noiseW = makeNoise1(rng.int(0, 2 ** 30));

  // Each stroke gets its own wobble wavelength — reusing one across a drawing
  // is what makes procedural line work look mechanically uniform.
  const wobbleScale = Math.max(4, s.wobbleScale * rng.float(0.7, 1.4));
  const passes = Math.max(1, Math.round(s.passes));
  // The darkest pass is drawn at random, not always the first.
  const darkPass = rng.int(0, passes - 1);

  const step = Math.max(1.1, s.width * 0.9);

  for (let p = 0; p < passes; p++) {
    const amp = s.wobble * (1 + p * 0.45);
    const offX = rng.gaussian(0, s.passOffset);
    const offY = rng.gaussian(0, s.passOffset);
    // Decorrelate the passes without re-noising them independently: the offset
    // above is rigid, which is the difference between "a hand searching for the
    // line" and "one blurry line".
    const phase = p * 137.5;

    let path = resampleByArcLength(input, step);
    if (path.length < 2) continue;

    const len = totalLength(path);

    // A long "straight" line drawn freehand always bows slightly — but only a
    // straight one. Gated on straightness because the displacement scales with
    // arc length: applied to the closed head contour (~1800 units) it bent the
    // whole silhouette by tens of units and read as a second, offset outline.
    const straightness =
      len > 0 ? Math.hypot(path[path.length - 1][0] - path[0][0], path[path.length - 1][1] - path[0][1]) / len : 0;
    if (s.bow > 0 && len > 30 && straightness > 0.72) {
      const bowAmp = s.bow * len * rng.gaussian(0, 1);
      const normals = path.map((_, i) => normalAtIndex(path, i));
      path = path.map((q, i) => {
        const t = i / (path.length - 1);
        const k = Math.sin(Math.PI * t) * bowAmp;
        return [q[0] + normals[i][0] * k, q[1] + normals[i][1] * k] as Pt;
      });
    }

    // Overshoot BEFORE the wobble, so the extension inherits the same noise.
    // Asymmetric: a hand overshoots one end, not both equally.
    if (s.overshoot > 0) {
      path = extendEnds(path, s.overshoot * rng.float(0.15, 1.3), s.overshoot * rng.float(0.15, 1.3));
    }

    const n = path.length;
    const out: Pt[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const [nx, ny] = normalAtIndex(path, i);
      const [tx, ty] = tangentAtIndex(path, i);
      const u = (t * len) / wobbleScale + phase;
      const dn = noiseN(u, 3) * amp;
      const dt = noiseT(u * 0.6, 2) * s.drift;
      out[i] = [path[i][0] + nx * dn + tx * dt + offX, path[i][1] + ny * dn + ty * dt + offY];
    }

    const alpha = p === darkPass ? s.alpha : s.alpha * s.passAlphaFalloff;

    if (s.mode === 'stroke') {
      sink.strokePath(out, s.width, s.color, alpha);
      continue;
    }

    const widths: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      // Spindle: full width in the middle, vanishing at the ends.
      const spindle = Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, t))), 0.55 * s.taper + 0.001);
      const bias = 1 + s.taperBias * (t - 0.5) * 0.8;
      const grain = 1 + noiseW(t * 4 + phase, 2) * 0.22;
      // A hand slows through a turn and the line fattens there.
      const corner = 1 + s.cornerPress * curvatureAtIndex(path, i);
      widths[i] = Math.max(0.15, s.width * (1 - s.taper + s.taper * spindle) * bias * grain * corner);
    }

    for (const seg of splitOnGaps(out, widths, s.gapChance, rng)) {
      sink.fillPolygon(ribbon(seg.pts, seg.widths), s.color, alpha);
    }
  }
}
