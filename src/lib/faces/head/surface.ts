import type { HeadShape } from '../types';
import { bump, cross, dot, normalize, scale3, smoothstep, sub, type Vec3 } from '../math/vec';

// The head is an ellipsoid deformed by SEPARABLE ANISOTROPIC PROFILES.
//
// A single scalar radial deformation D(theta, phi) would be simpler, but it
// displaces points along their own radius and therefore couples width, depth
// and height: you could not widen a jaw without also lengthening the nose.
// Three independent profiles (width by latitude, azimuth flattening, depth)
// give orthogonal control in eight readable numbers.
//
// Convention: theta = longitude in [-PI, PI], 0 faces the camera.
//             phi   = latitude in [-PI/2, PI/2], positive is up.
//             Right-handed, +z toward the viewer, +y up.

/** Width by latitude: jaw flare, chin taper, cranium dome. */
function widthProfile(h: HeadShape, phi: number): number {
  let w = 1;
  w += h.jawWidth * bump(phi, -0.45, 0.3);
  w -= h.chinTaper * smoothstep(-0.55, -1.3, phi);
  w += h.craniumBulge * bump(phi, 0.72, 0.34);
  return w;
}

/** Azimuth: flatten the temples so the skull is not a body of revolution. */
function azimuthProfile(h: HeadShape, theta: number): number {
  return 1 - h.templeFlat * bump(Math.abs(theta), Math.PI / 2, 0.45);
}

/** Depth: brow ridge forward, occiput back. */
function depthProfile(h: HeadShape, theta: number, phi: number): number {
  let d = 1;
  d += h.browRidge * bump(phi, 0.28, 0.18) * Math.max(0, Math.cos(theta));
  d += h.occiput * bump(Math.abs(theta), Math.PI, 0.7);
  return d;
}

export function surface(h: HeadShape, theta: number, phi: number): Vec3 {
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);

  const w = widthProfile(h, phi) * azimuthProfile(h, theta);
  const d = depthProfile(h, theta, phi);
  // Local cheek swell — a bump in both coordinates, not a profile.
  const cheek = h.cheekFull * bump(phi, -0.15, 0.22) * bump(Math.abs(theta), 0.65, 0.35);

  const x = h.rx * (w + cheek * 0.6) * cp * Math.sin(theta) + h.asymX * phi * h.rx * 0.06;
  const below = Math.max(0, -sp);
  const y = h.ry * (sp - h.chinLength * below * below);
  const z = h.rz * (d + cheek) * cp * Math.cos(theta);

  return [x, y, z];
}

const DH = 1e-3;

/**
 * Outward normal by central differences.
 *
 * Deliberately numerical rather than analytic: the profiles above will be
 * tweaked constantly while tuning the look, and hand-maintained analytic
 * derivatives are a guaranteed source of a silent bug that breaks every
 * tangent basis at once. Two extra surface() evaluations per anchor is
 * nothing at ~16 anchors per face.
 */
export function normalAt(h: HeadShape, theta: number, phi: number): Vec3 {
  const dT = sub(surface(h, theta + DH, phi), surface(h, theta - DH, phi));
  const dP = sub(surface(h, theta, phi + DH), surface(h, theta, phi - DH));
  let n = normalize(cross(dT, dP));
  // Force outward: for a star-shaped body the normal agrees with the radius.
  if (dot(n, surface(h, theta, phi)) < 0) n = scale3(n, -1);
  return n;
}

const radiusCache = new WeakMap<HeadShape, number>();

/** Conservative bounding radius, sampled once and cached per shape object. */
export function maxRadius(h: HeadShape): number {
  const hit = radiusCache.get(h);
  if (hit !== undefined) return hit;

  let max = 0;
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j <= 16; j++) {
      const t = (i / 24) * Math.PI * 2 - Math.PI;
      const p = (j / 16) * Math.PI - Math.PI / 2;
      const v = surface(h, t, p);
      const r = Math.hypot(v[0], v[1], v[2]);
      if (r > max) max = r;
    }
  }
  radiusCache.set(h, max);
  return max;
}

/** Canonical, unexaggerated head. Generation perturbs these. */
export function baseHeadShape(): HeadShape {
  return {
    rx: 0.86,
    ry: 1.0,
    rz: 0.9,
    jawWidth: 0.06,
    chinTaper: 0.18,
    chinLength: 0.05,
    craniumBulge: 0.05,
    cheekFull: 0.05,
    templeFlat: 0.08,
    browRidge: 0.05,
    occiput: 0.06,
    asymX: 0,
  };
}
