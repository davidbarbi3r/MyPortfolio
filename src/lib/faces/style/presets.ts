import type { StylePreset } from '../types';

/** Sheet 1: pure black and white, pen on paper, a page of searching studies. */
export const encre: StylePreset = {
  id: 'encre',
  label: 'Encre pure',
  extends: 'base',
  stroke: {
    base: { width: 6.2, wobble: 4.8, passes: 2, gapChance: 0.08, alpha: 0.94 },
    roles: {
      outline: { width: 9.6, passes: 2, wobble: 5.0, gapChance: 0.13 },
    },
  },
  paper: { grain: 0.055, blotches: 3, vignette: 0.12 },
  texture: { hatchSpacing: 11, hatchJitter: 0.45, crossHatchChance: 0.35, stippleDensity: 0.5, shadingAmount: 0.7 },
  proportions: {
    exaggeration: 0.78,
    asymmetry: { eyeSize: 0.5, eyeHeight: 0.32, browTilt: 0.5, noseShift: 0.35, mouthSkew: 0.4, headTilt: 0.3 },
    deformBudget: 0.3,
  },
  weights: {
    hair: { inkCap: 4, scribbleMass: 3, spikes: 2, curls: 1.5, bald: 1, sideSweep: 2 },
    freckles: { none: 3, sparse: 2, dense: 0.6, blush: 0 },
    glasses: { none: 6, round: 1.4, square: 1, monocle: 0.5, halfRim: 0.7 },
  },
  paletteId: 'noir-creme',
};

/** Sheet 2: the same linework with misregistered spot colour over it. */
export const serigraphie: StylePreset = {
  id: 'serigraphie',
  label: 'Sérigraphie décalée',
  extends: 'encre',
  stroke: {
    base: { width: 5.6, passes: 2, alpha: 0.9 },
    roles: { outline: { width: 8.4, passes: 2 } },
  },
  wash: {
    enabled: true,
    plates: 3,
    offset: 9,
    rotate: 0.009,
    alpha: 0.62,
    blend: 'multiply',
    edgeRagged: 0.85,
    dryPatches: 0.35,
    mismatch: 0.07,
  },
  paper: { grain: 0.045, grainScale: 1.2, blotches: 2, vignette: 0.08 },
  paletteId: 'risograph',
};

/** A technical pen: precise, thin, almost architectural. The one style where a
 *  constant line width is honest rather than a tell. */
export const traitFin: StylePreset = {
  id: 'trait-fin',
  label: 'Trait fin',
  extends: 'base',
  stroke: {
    base: {
      width: 2.4,
      taper: 0.18,
      taperBias: 0,
      wobble: 1.7,
      wobbleScale: 110,
      drift: 0.6,
      passes: 1,
      passOffset: 0.8,
      overshoot: 5,
      gapChance: 0.03,
      cornerPress: 0.1,
      bow: 0.004,
      alpha: 0.95,
      mode: 'stroke',
    },
    roles: {
      outline: { width: 3.2, passes: 2, overshoot: 10, wobble: 2.4 },
      detail: { width: 1.7, passes: 1, alpha: 0.7 },
      hatch: { width: 1.5, passes: 1, wobble: 1.1, alpha: 0.6 },
    },
  },
  texture: { hatchSpacing: 5.4, hatchJitter: 0.18, crossHatchChance: 0.65, stippleDensity: 1.4, shadingAmount: 1 },
  paper: { grain: 0.03, blotches: 1, vignette: 0.06 },
  proportions: {
    exaggeration: 0.3,
    asymmetry: { eyeSize: 0.18, eyeHeight: 0.12, browTilt: 0.2, noseShift: 0.14, mouthSkew: 0.15, headTilt: 0.12 },
    deformBudget: 0.16,
  },
  weights: {
    hair: { inkCap: 0.5, curls: 4, scribbleMass: 1, spikes: 1, sideSweep: 3, bald: 1 },
    freckles: { none: 2, sparse: 3, dense: 1.5, blush: 0 },
  },
  paletteId: 'noir-creme',
};

/** Fat, dirty, few strokes — a stick of charcoal, not a pen. */
export const fusain: StylePreset = {
  id: 'fusain',
  label: 'Fusain',
  extends: 'base',
  stroke: {
    base: {
      width: 13,
      taper: 0.38,
      taperBias: -0.25,
      wobble: 7.5,
      wobbleScale: 46,
      drift: 4,
      passes: 3,
      passOffset: 5,
      passAlphaFalloff: 0.5,
      overshoot: 22,
      gapChance: 0.22,
      cornerPress: 0.6,
      bow: 0.02,
      alpha: 0.62,
      mode: 'ribbon',
    },
    roles: {
      outline: { width: 19, passes: 3, wobble: 11, overshoot: 34, gapChance: 0.26, alpha: 0.7 },
      detail: { width: 7, passes: 1, alpha: 0.5 },
      hatch: { width: 8, passes: 1, wobble: 5, alpha: 0.3, overshoot: 16 },
    },
  },
  texture: { hatchSpacing: 19, hatchJitter: 0.6, crossHatchChance: 0.2, stippleDensity: 0.25, shadingAmount: 1.1 },
  paper: { grain: 0.09, grainScale: 1.6, blotches: 5, fibres: 220, vignette: 0.2 },
  proportions: {
    exaggeration: 0.95,
    asymmetry: { eyeSize: 0.6, eyeHeight: 0.4, browTilt: 0.6, noseShift: 0.45, mouthSkew: 0.5, headTilt: 0.36 },
    deformBudget: 0.34,
  },
  weights: {
    hair: { inkCap: 5, scribbleMass: 4, curls: 0.5, spikes: 1, bald: 1.5, sideSweep: 1 },
    glasses: { none: 8, round: 1, square: 0.6, monocle: 0.3, halfRim: 0.3 },
    freckles: { none: 5, sparse: 1, dense: 0.3, blush: 0 },
  },
  paletteId: 'sepia',
};

export const presets: Record<string, StylePreset> = {
  encre,
  serigraphie,
  'trait-fin': traitFin,
  fusain,
};
