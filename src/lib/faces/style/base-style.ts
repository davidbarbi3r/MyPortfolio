import type { FaceStyle, StrokeSpec } from '../types';

// All lengths are in CANONICAL FACE UNITS (the 1000-unit box). The head spans
// roughly 660 of them, so a 6-unit line is about 1% of the head width — the
// ratio a pen drawing actually has.

export const baseStroke: StrokeSpec = {
  width: 6.2,
  taper: 0.7,
  taperBias: 0.2,
  wobble: 4.5,
  wobbleScale: 55,
  drift: 2.2,
  passes: 2,
  passOffset: 2.6,
  passAlphaFalloff: 0.72,
  overshoot: 12,
  gapChance: 0.07,
  cornerPress: 0.35,
  bow: 0.012,
  alpha: 0.94,
  color: '#1d1d1b',
  mode: 'ribbon',
};

export const baseStyle: FaceStyle = {
  id: 'base',
  label: 'Base',

  stroke: {
    base: baseStroke,
    roles: {
      outline: {
        width: 9.2,
        passes: 2,
        passOffset: 1.8,
        overshoot: 16,
        wobble: 4.6,
        wobbleScale: 95,
        gapChance: 0.12,
        bow: 0,
      },
      feature: {},
      detail: { width: 4.0, passes: 1, alpha: 0.72, taper: 0.9, overshoot: 7 },
      hatch: {
        width: 2.6,
        passes: 1,
        taper: 0.5,
        wobble: 2.2,
        wobbleScale: 40,
        overshoot: 2.5,
        alpha: 0.55,
        bow: 0,
        gapChance: 0.04,
      },
      accent: { width: 5.0, passes: 2, alpha: 0.85 },
    },
  },

  paper: { grain: 0.055, grainScale: 1, blotches: 3, fibres: 160, vignette: 0.12 },

  texture: {
    hatchSpacing: 11,
    hatchJitter: 0.45,
    crossHatchChance: 0.35,
    stippleDensity: 0.5,
    shadingAmount: 0.7,
  },

  wash: {
    enabled: false,
    plates: 0,
    offset: 0,
    rotate: 0,
    alpha: 0.85,
    blend: 'multiply',
    edgeRagged: 0.8,
    dryPatches: 0.3,
    mismatch: 0.06,
  },

  proportions: {
    exaggeration: 0.7,
    asymmetry: { eyeSize: 0.4, eyeHeight: 0.28, browTilt: 0.45, noseShift: 0.3, mouthSkew: 0.35, headTilt: 0.25 },
    deformBudget: 0.45,
  },

  weights: {},

  paletteId: 'noir-creme',
};
