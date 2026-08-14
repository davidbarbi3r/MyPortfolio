// 2D polyline helpers. Everything downstream of the head model works on flat
// point arrays in canonical face space (1000 x 1000).

export type Pt = [number, number];

export const dist = (a: Pt, b: Pt): number => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export function totalLength(pts: Pt[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]);
  return s;
}

/** Even spacing along arc length. Keeps the first and last point exactly. */
export function resampleByArcLength(pts: Pt[], step: number): Pt[] {
  if (pts.length < 2) return pts.slice();
  const s = Math.max(step, 0.05);
  const out: Pt[] = [pts[0]];
  // Distance walked since the last emitted point, carried across segment boundaries.
  let acc = 0;

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = dist(a, b);
    if (seg < 1e-9) continue;
    let pos = 0;
    while (acc + (seg - pos) >= s) {
      pos += s - acc;
      out.push(lerpPt(a, b, pos / seg));
      acc = 0;
    }
    acc += seg - pos;
  }

  const last = pts[pts.length - 1];
  if (dist(out[out.length - 1], last) > s * 0.35) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

/** Unit tangent at index, using neighbours where available. */
export function tangentAtIndex(pts: Pt[], i: number): Pt {
  const a = pts[Math.max(0, i - 1)];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
}

/** Left-hand normal at index. */
export function normalAtIndex(pts: Pt[], i: number): Pt {
  const [tx, ty] = tangentAtIndex(pts, i);
  return [-ty, tx];
}

/** Signed curvature proxy at index — used to thicken a stroke through turns. */
export function curvatureAtIndex(pts: Pt[], i: number): number {
  if (i <= 0 || i >= pts.length - 1) return 0;
  const a = pts[i - 1];
  const b = pts[i];
  const c = pts[i + 1];
  const v1x = b[0] - a[0];
  const v1y = b[1] - a[1];
  const v2x = c[0] - b[0];
  const v2y = c[1] - b[1];
  const l1 = Math.hypot(v1x, v1y) || 1;
  const l2 = Math.hypot(v2x, v2y) || 1;
  const cosA = (v1x * v2x + v1y * v2y) / (l1 * l2);
  return 1 - Math.max(-1, Math.min(1, cosA));
}

/**
 * Extend both ends along their terminal direction. Called BEFORE wobble is applied
 * so the overshoot inherits the same noise — otherwise it reads as a straight tail.
 */
export function extendEnds(pts: Pt[], head: number, tail = head): Pt[] {
  if (pts.length < 2) return pts.slice();
  const out = pts.slice();
  if (head > 0) {
    const [tx, ty] = tangentAtIndex(out, 0);
    out.unshift([out[0][0] - tx * head, out[0][1] - ty * head]);
  }
  if (tail > 0) {
    const n = out.length - 1;
    const [tx, ty] = tangentAtIndex(out, n);
    out.push([out[n][0] + tx * tail, out[n][1] + ty * tail]);
  }
  return out;
}

/** Catmull-Rom through the control points. `subdiv` segments per span. */
export function catmullRom(pts: Pt[], subdiv = 8, closed = false): Pt[] {
  if (pts.length < 3) return pts.slice();
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const out: Pt[] = [];

  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2];
    for (let j = 0; j < subdiv; j++) {
      const t = j / subdiv;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}

export function pointInPoly(poly: Pt[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function boundsOf(pts: Pt[]): [number, number, number, number] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    if (p[0] < x0) x0 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[0] > x1) x1 = p[0];
    if (p[1] > y1) y1 = p[1];
  }
  return [x0, y0, x1, y1];
}

export function centroid(pts: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / pts.length, sy / pts.length];
}

/**
 * Push points along their local normal. `from`/`to` restrict the effect to a
 * sub-range so an offset line can be shorter than its parent (eyelid creases).
 */
export function offsetAlongNormal(pts: Pt[], d: number, from = 0, to = 1): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const t = i / (pts.length - 1);
    if (t < from || t > to) continue;
    const [nx, ny] = normalAtIndex(pts, i);
    out.push([pts[i][0] + nx * d, pts[i][1] + ny * d]);
  }
  return out.length >= 2 ? out : pts.slice();
}

/** Scale a closed polygon about its centroid. */
export function dilate(poly: Pt[], k: number): Pt[] {
  const [cx, cy] = centroid(poly);
  return poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as Pt);
}

/** Box blur over a circular array — smooths silhouette radius bins. */
export function smoothCircular(arr: Float64Array, radius: number): void {
  const n = arr.length;
  const src = Float64Array.from(arr);
  for (let i = 0; i < n; i++) {
    let s = 0;
    let c = 0;
    for (let k = -radius; k <= radius; k++) {
      s += src[(i + k + n * 4) % n];
      c++;
    }
    arr[i] = s / c;
  }
}

/** Point at normalized position along a polyline (by index, not arc length). */
export function pointOnPath(pts: Pt[], u: number): Pt {
  const f = Math.max(0, Math.min(1, u)) * (pts.length - 1);
  const i = Math.floor(f);
  const j = Math.min(pts.length - 1, i + 1);
  return lerpPt(pts[i], pts[j], f - i);
}

/** Point offset from a polyline at normalized position `u`, along the normal. */
export function pointOffPath(pts: Pt[], u: number, d: number): Pt {
  const f = Math.max(0, Math.min(1, u)) * (pts.length - 1);
  const i = Math.round(f);
  const p = pointOnPath(pts, u);
  const [nx, ny] = normalAtIndex(pts, i);
  return [p[0] + nx * d, p[1] + ny * d];
}

/** Flatten a Pt[] into the packed number[] used by DrawOps. */
export function pack(pts: Pt[]): number[] {
  const out = new Array(pts.length * 2);
  for (let i = 0; i < pts.length; i++) {
    out[i * 2] = pts[i][0];
    out[i * 2 + 1] = pts[i][1];
  }
  return out;
}
