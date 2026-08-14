import type { HeadShape, Pose, Pt } from '../types';
import { FACE_BOX } from '../types';
import { headRotation, mul3, type Mat3, type Vec3 } from '../math/vec';
import { maxRadius, surface } from './surface';

/**
 * Everything pose-dependent, bundled once per bake: rotation, camera, and the
 * projection from head space into canonical face space.
 */
export interface HeadView {
  head: HeadShape;
  pose: Pose;
  R: Mat3;
  /** Camera distance in model units, or Infinity for orthographic. */
  d: number;
  /** Model units -> canonical face units. */
  scale: number;
  cx: number;
  cy: number;
  /** Rotate then project a head-space point. */
  project(v: Vec3): Pt;
  /** Surface point at (theta, phi), projected. */
  at(theta: number, phi: number): Pt;
}

export const defaultPose = (): Pose => ({ yaw: 0, pitch: 0, roll: 0, camera: 8 });

/** Fraction of the canonical box a head's bounding radius maps to. */
export const HEAD_FIT = 0.34;

export function makeHeadView(
  head: HeadShape,
  pose: Pose,
  opts?: { scale?: number; scaleMul?: number; cx?: number; cy?: number }
): HeadView {
  const R = headRotation(pose.yaw, pose.pitch, pose.roll);
  const d = pose.camera === Infinity || !isFinite(pose.camera) ? Infinity : pose.camera * maxRadius(head);
  // Normalised by the head's own bounding radius, so rx/ry/rz stay pure
  // PROPORTION levers and cannot smuggle in size: a long skull is long, not
  // also bigger. Deliberate size variation goes through `scaleMul` instead,
  // which keeps it bounded and lets a sheet stay inside its cells.
  const scale = opts?.scale ?? ((FACE_BOX * HEAD_FIT) / maxRadius(head)) * (opts?.scaleMul ?? 1);
  const cx = opts?.cx ?? FACE_BOX * 0.5;
  // Sit the head slightly above centre — the neck and shoulders need the room.
  const cy = opts?.cy ?? FACE_BOX * 0.47;

  const project = (v: Vec3): Pt => {
    const r = mul3(R, v);
    // Weak perspective. Orthographic makes turned heads read as cardboard: both
    // eyes stay exactly the same size at any yaw. At d = 8R (about an 85mm
    // portrait lens) the near eye is ~12% larger at 30 degrees of yaw, which is
    // precisely the cue that sells volume — and free caricature.
    const k = d === Infinity ? 1 : d / (d - r[2]);
    return [cx + k * r[0] * scale, cy - k * r[1] * scale];
  };

  return {
    head,
    pose,
    R,
    d,
    scale,
    cx,
    cy,
    project,
    at: (theta, phi) => project(surface(head, theta, phi)),
  };
}
