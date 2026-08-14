import type { AnchorDef, Frame, Mat2x3, Pt } from '../types';
import { dot, len3, lerpMat2x3, mul3, normalize, smoothstep, sub, type Vec3 } from '../math/vec';
import { normalAt, surface } from './surface';
import { makeHeadView, type HeadView } from './pose';

const H = 1e-3;

/**
 * Build the local drawing frame for one anchor.
 *
 * The critical detail is that the derivatives are taken THROUGH THE PROJECTION
 * (finite differences on projected points), not in 3D and then projected.
 * Differentiating in 3D first discards the perspective foreshortening term and
 * makes features drift off the form near the limb.
 */
export function makeFrame(view: HeadView, def: AnchorDef, opts?: { conform?: number; mirror?: boolean }): Frame {
  const { theta, phi, arcT, arcP } = def;
  const conform = opts?.conform ?? def.conform;
  const mirror = opts?.mirror ?? theta < 0;

  const o = view.at(theta, phi);
  const a = view.at(theta + H, phi);
  const b = view.at(theta, phi + H);

  // d(screen)/d(theta) and d(screen)/d(phi), scaled to the feature's arc extent.
  const ux = ((a[0] - o[0]) / H) * arcT;
  const uy = ((a[1] - o[1]) / H) * arcT;
  const vx = ((b[0] - o[0]) / H) * arcP;
  const vy = ((b[1] - o[1]) / H) * arcP;

  // Local +x follows +theta, local +y follows -phi (screen y grows downward).
  let m: Mat2x3 = [ux, uy, -vx, -vy, o[0], o[1]];

  // `conform` is the artistic escape hatch. At 1 a feature is painted onto the
  // sphere — correct, but sometimes "too correct" for caricature. At 0 it is a
  // rigid billboard aligned to the head's own axes: right for glasses, which
  // are a rigid object, not a decal.
  if (conform < 1) {
    // The billboard uses the feature's INTRINSIC size on the head surface, not
    // its projected size. Using the projected size would collapse any anchor
    // sitting near the limb: an ear at theta = 1.45 has an almost zero
    // d(screen)/d(theta) head-on, so it would flatten into a vertical splinter
    // instead of sticking out of the side of the head the way a real ear does.
    const dT3 = sub(surface(view.head, theta + H, phi), surface(view.head, theta - H, phi));
    const dP3 = sub(surface(view.head, theta, phi + H), surface(view.head, theta, phi - H));
    const uLen = (len3(dT3) / (2 * H)) * arcT * view.scale;
    const vLen = (len3(dP3) / (2 * H)) * arcP * view.scale;
    const ax = mul3(view.R, [1, 0, 0]);
    const ay = mul3(view.R, [0, 1, 0]);
    // Head axes as screen directions (screen y is flipped).
    let dux = ax[0];
    let duy = -ax[1];
    let dvx = -ay[0];
    let dvy = ay[1];
    const l1 = Math.hypot(dux, duy);
    const l2 = Math.hypot(dvx, dvy);
    // Degenerate when an axis points straight at the camera — keep the true
    // basis rather than dividing by zero.
    if (l1 > 1e-5 && l2 > 1e-5) {
      dux = (dux / l1) * uLen;
      duy = (duy / l1) * uLen;
      dvx = (dvx / l2) * vLen;
      dvy = (dvy / l2) * vLen;
      const flat: Mat2x3 = [dux, duy, dvx, dvy, o[0], o[1]];
      m = lerpMat2x3(flat, m, conform);
    }
  }

  // Local +x always points toward the outside of the face, whichever way the
  // head is turned, so a variant can be written once and mirrored.
  if (mirror) {
    m = [-m[0], -m[1], m[2], m[3], m[4], m[5]];
  }

  const n3 = mul3(view.R, normalAt(view.head, theta, phi));
  const p3 = mul3(view.R, surface(view.head, theta, phi));
  const toCam: Vec3 = view.d === Infinity ? [0, 0, 1] : normalize(sub([0, 0, view.d], p3));
  const facing = dot(n3, toCam);

  return {
    x: o[0],
    y: o[1],
    m,
    scale: (Math.hypot(ux, uy) + Math.hypot(vx, vy)) / 2,
    depth: p3[2],
    facing,
    // A narrow ramp right at the limb. A wider one dimmed anything anchored on
    // the side of the head — an ear seen head-on is at facing ~0.12 and must
    // still be drawn at full strength.
    visibility: smoothstep(-0.02, 0.18, facing),
    nx: n3[0],
    ny: -n3[1],
    mirrored: mirror,
  };
}

/** Apply a frame to a point in local [-1,1] space. */
export function applyFrame(f: Frame, x: number, y: number): Pt {
  return [f.m[0] * x + f.m[2] * y + f.m[4], f.m[1] * x + f.m[3] * y + f.m[5]];
}

/** Project a ring of [theta, phi] pairs, pushed out along the surface normal. */
export function projectRing(view: HeadView, ring: Array<[number, number]>, expand = 0): Pt[] {
  return ring.map(([t, p]) => {
    const s = surface(view.head, t, p);
    if (expand === 0) return view.project(s);
    const n = normalAt(view.head, t, p);
    return view.project([s[0] + n[0] * expand, s[1] + n[1] * expand, s[2] + n[2] * expand]);
  });
}

/**
 * A displacement field that bends flat 2D geometry along the head surface.
 *
 * Hatching generated flat and then warped through this is the single strongest
 * cue that a feature sits ON a volume: a cheek whose hatch lines follow the
 * curvature reads as a sphere instantly.
 *
 * Implemented as the DIFFERENCE between the actual projection and a frontal
 * reference projection, so it is exactly the identity at a frontal pose and
 * bends progressively as the head turns — no drift to correct for.
 */
export function makeSurfaceWarp(view: HeadView): (p: Pt) => Pt {
  const front = makeHeadView(
    view.head,
    { yaw: 0, pitch: 0, roll: 0, camera: view.pose.camera },
    {
      scale: view.scale,
      cx: view.cx,
      cy: view.cy,
    }
  );

  const rx = view.head.rx * view.scale;
  const ry = view.head.ry * view.scale;

  // Match the cross-section the surface actually uses. With a squared head an
  // elliptical inverse saturates `u` at +/-1 over a wide band near the sides,
  // flattening the warp field exactly where cheek hatching needs it.
  const n = view.head.squareness ?? 2;
  const ring = (phi: number): number =>
    n === 2 ? Math.cos(phi) : Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(Math.sin(phi))), n)), 1 / n);

  return (p: Pt): Pt => {
    // Invert the frontal mapping to get approximate spherical coords.
    const v = (view.cy - p[1]) / ry;
    const phi = Math.asin(Math.max(-1, Math.min(1, v)));
    const cp = ring(phi);
    if (cp < 1e-3) return p;
    const u = (p[0] - view.cx) / (rx * cp);
    const theta = Math.asin(Math.max(-1, Math.min(1, u)));

    const s = surface(view.head, theta, phi);
    const actual = view.project(s);
    const ref = front.project(s);
    return [p[0] + (actual[0] - ref[0]), p[1] + (actual[1] - ref[1])];
  };
}
