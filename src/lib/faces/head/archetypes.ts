import type { HeadShape } from '../types';
import { baseHeadShape } from './surface';

// Named kinds of skull.
//
// The generator used to jitter one archetype with independent zero-mean
// gaussians, which is unimodal by construction: everything clusters near the
// mean and every head comes out the same oval. Picking a KIND first and then
// jittering around it is what produces a population instead of a blur.

export interface Archetype {
  name: string;
  label: string;
  weight: number;
  /** Mean gene vector. Anything omitted keeps the canonical value. */
  genes: Partial<HeadShape>;
}

export const ARCHETYPES: Record<string, Archetype> = {
  round: {
    name: 'round',
    label: 'Ronde',
    weight: 3,
    genes: { rx: 0.95, ry: 0.92, jawWidth: 0.14, chinTaper: 0.08, cheekFull: 0.22, squareness: 2.25 },
  },

  long: {
    name: 'long',
    label: 'Allongée',
    weight: 2.5,
    genes: { rx: 0.72, ry: 1.16, chinTaper: 0.24, chinLength: 0.13, cheekFull: -0.06, squareness: 1.9 },
  },

  square: {
    name: 'square',
    label: 'Carrée',
    weight: 2.5,
    // The one that most needs the superellipse: a genuinely blocky jaw and a
    // flat crown are impossible on an ellipsoid at any radii.
    genes: { rx: 0.93, ry: 1.0, jawWidth: 0.3, chinTaper: 0.0, templeFlat: 0.22, squareness: 2.75 },
  },

  pear: {
    name: 'pear',
    label: 'En poire',
    weight: 2,
    genes: { rx: 0.88, ry: 1.0, jawWidth: 0.38, craniumBulge: -0.18, chinTaper: 0.03, squareness: 2.45 },
  },

  invertedTriangle: {
    name: 'invertedTriangle',
    label: 'Triangle inversé',
    weight: 2,
    genes: {
      rx: 0.9,
      ry: 1.04,
      craniumBulge: 0.26,
      jawWidth: -0.16,
      chinTaper: 0.44,
      chinLength: 0.15,
      squareness: 1.7,
    },
  },

  egg: {
    name: 'egg',
    label: 'En œuf',
    weight: 2,
    genes: { rx: 0.79, ry: 1.1, craniumBulge: 0.22, chinTaper: 0.32, templeFlat: 0.02, squareness: 1.8 },
  },

  gaunt: {
    name: 'gaunt',
    label: 'Émaciée',
    weight: 1.5,
    genes: {
      rx: 0.69,
      ry: 1.13,
      cheekFull: -0.24,
      chinTaper: 0.3,
      chinLength: 0.2,
      templeFlat: 0.24,
      browRidge: 0.16,
      squareness: 2.0,
    },
  },

  bullet: {
    name: 'bullet',
    label: 'En obus',
    weight: 1.5,
    genes: { rx: 0.81, ry: 1.15, craniumBulge: 0.32, occiput: 0.2, chinTaper: 0.22, squareness: 2.3 },
  },
};

export const archetypeWeights = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const k of Object.keys(ARCHETYPES)) out[k] = ARCHETYPES[k].weight;
  return out;
};

/**
 * Mean gene vector to jitter around.
 *
 * The archetype is blended toward the canonical head by the style's
 * `exaggeration`, so a naturalistic preset gets half-strength archetypes rather
 * than the same extremes as a caricature one. Reusing the existing knob keeps
 * the styles honest without adding a second one.
 */
export function archetypeMeans(name: string, exaggeration: number): HeadShape {
  const base = baseHeadShape();
  const a = ARCHETYPES[name];
  if (!a) return base;

  const blend = Math.max(0, Math.min(1, 0.35 + 0.65 * exaggeration));
  const out = { ...base };
  for (const key of Object.keys(a.genes) as Array<keyof HeadShape>) {
    const target = a.genes[key];
    const from = base[key];
    if (typeof target !== 'number' || typeof from !== 'number') continue;
    out[key] = from + (target - from) * blend;
  }
  return out;
}
