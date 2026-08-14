import type { AnchorDef, AnchorName } from '../types';

// Anchors are authored ONCE in head-local spherical coordinates and never in
// pixels. `arcT`/`arcP` are half-extents in RADIANS OF HEAD ARC, so a feature
// declares how much of the head it covers; foreshortening then falls out of
// the projection with no per-feature code.
//
// Naming note: L/R here mean SCREEN left/right at a frontal pose (theta < 0 is
// screen-left), not anatomical left/right. Anchor thetas are pose-independent,
// so mirroring stays stable however far the head turns.

export const ANCHORS: Record<AnchorName, AnchorDef> = {
  eyeL: { theta: -0.55, phi: 0.1, arcT: 0.26, arcP: 0.15, conform: 0.75 },
  eyeR: { theta: 0.55, phi: 0.1, arcT: 0.26, arcP: 0.15, conform: 0.75 },

  browL: { theta: -0.58, phi: 0.3, arcT: 0.32, arcP: 0.1, conform: 0.9 },
  browR: { theta: 0.58, phi: 0.3, arcT: 0.32, arcP: 0.1, conform: 0.9 },

  noseRoot: { theta: 0, phi: 0.14, arcT: 0.1, arcP: 0.1, conform: 1 },
  noseTip: { theta: 0, phi: -0.08, arcT: 0.22, arcP: 0.26, conform: 0.85 },

  mouth: { theta: 0, phi: -0.44, arcT: 0.34, arcP: 0.16, conform: 1 },

  earL: { theta: -1.34, phi: 0.02, arcT: 0.17, arcP: 0.21, conform: 0.2 },
  earR: { theta: 1.34, phi: 0.02, arcT: 0.17, arcP: 0.21, conform: 0.2 },

  cheekL: { theta: -0.72, phi: -0.2, arcT: 0.3, arcP: 0.28, conform: 1 },
  cheekR: { theta: 0.72, phi: -0.2, arcT: 0.3, arcP: 0.28, conform: 1 },

  foreheadL: { theta: -0.35, phi: 0.5, arcT: 0.4, arcP: 0.2, conform: 1 },
  foreheadR: { theta: 0.35, phi: 0.5, arcT: 0.4, arcP: 0.2, conform: 1 },

  hairline: { theta: 0, phi: 0.78, arcT: 1.2, arcP: 0.55, conform: 1 },
  chin: { theta: 0, phi: -1.05, arcT: 0.3, arcP: 0.2, conform: 1 },
  neck: { theta: 0, phi: -1.12, arcT: 0.62, arcP: 0.3, conform: 0.35 },
};

export function resolveAnchor(name: AnchorName, over?: Partial<AnchorDef>): AnchorDef {
  const base = ANCHORS[name];
  return over ? { ...base, ...over } : base;
}
