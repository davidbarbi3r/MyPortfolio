import type { FeatureParams, SlotName } from './types';
import type { Rng } from './rng';
import { clamp } from './math/vec';

// A face reads as having an inner life when its features AGREE. "Worried" is
// not a brow shape: it is raised brows AND a small tense mouth AND wide eyes
// AND a gaze off to one side. Rolling each slot independently — which is what
// the generator did — can only ever produce assemblies, and assemblies read as
// blank however many variants they draw from.
//
// So: one shared emotional state per face, rolled once, which then modulates
// every feature's parameters and biases every variant pick.

export interface Expression {
  name: string;
  /** -1 sour .. +1 pleased. */
  valence: number;
  /** 0 sleepy .. 1 startled. */
  arousal: number;
  /** -1 lowered .. +1 raised. */
  browRaise: number;
  /** +1 inner ends up (worried) .. -1 inner ends down (angry). */
  browTilt: number;
  /** 0 shut .. ~1.4 popping. */
  eyeOpen: number;
  /** Shared gaze in screen space, -1..1. One direction for both eyes: two
   *  independent gazes read as a squint, never as looking at something. */
  gaze: [number, number];
  /** -1 frown .. +1 smile. */
  mouthCurve: number;
  /** 0 shut .. 1 wide. */
  mouthOpen: number;
  /** 0..1 how far the two halves of the face are allowed to disagree. */
  skew: number;
}

type Mood = Omit<Expression, 'gaze' | 'name'> & { weight: number };

const MOODS: Record<string, Mood> = {
  deadpan: {
    weight: 2.5,
    valence: 0,
    arousal: 0.2,
    browRaise: 0,
    browTilt: 0,
    eyeOpen: 0.55,
    mouthCurve: 0,
    mouthOpen: 0.08,
    skew: 0.35,
  },
  smug: {
    weight: 2,
    valence: 0.5,
    arousal: 0.3,
    browRaise: 0.3,
    browTilt: -0.25,
    eyeOpen: 0.35,
    mouthCurve: 0.55,
    mouthOpen: 0.05,
    skew: 0.85,
  },
  worried: {
    weight: 2,
    valence: -0.4,
    arousal: 0.6,
    browRaise: 0.5,
    browTilt: 0.7,
    eyeOpen: 0.8,
    mouthCurve: -0.4,
    mouthOpen: 0.15,
    skew: 0.45,
  },
  startled: {
    weight: 1.6,
    valence: -0.1,
    arousal: 1,
    browRaise: 0.9,
    browTilt: 0.25,
    eyeOpen: 1.3,
    mouthCurve: -0.1,
    mouthOpen: 0.7,
    skew: 0.35,
  },
  sly: {
    weight: 1.8,
    valence: 0.3,
    arousal: 0.4,
    browRaise: -0.1,
    browTilt: -0.35,
    eyeOpen: 0.3,
    mouthCurve: 0.35,
    mouthOpen: 0,
    skew: 0.95,
  },
  gormless: {
    weight: 1.8,
    valence: 0.1,
    arousal: 0.15,
    browRaise: 0.35,
    browTilt: 0.1,
    eyeOpen: 0.9,
    mouthCurve: 0.05,
    mouthOpen: 0.45,
    skew: 0.65,
  },
  pleased: {
    weight: 1.8,
    valence: 0.8,
    arousal: 0.5,
    browRaise: 0.3,
    browTilt: 0.15,
    eyeOpen: 0.6,
    mouthCurve: 0.8,
    mouthOpen: 0.3,
    skew: 0.35,
  },
  sour: {
    weight: 1.6,
    valence: -0.7,
    arousal: 0.4,
    browRaise: -0.4,
    browTilt: -0.6,
    eyeOpen: 0.45,
    mouthCurve: -0.7,
    mouthOpen: 0.05,
    skew: 0.45,
  },
  sleepy: {
    weight: 1.2,
    valence: 0,
    arousal: 0,
    browRaise: -0.2,
    browTilt: 0.2,
    eyeOpen: 0.12,
    mouthCurve: -0.1,
    mouthOpen: 0.12,
    skew: 0.55,
  },
  manic: {
    weight: 1.2,
    valence: 0.4,
    arousal: 1,
    browRaise: 0.7,
    browTilt: -0.3,
    eyeOpen: 1.4,
    mouthCurve: 0.6,
    mouthOpen: 0.8,
    skew: 1,
  },
};

export const moodWeights = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const k of Object.keys(MOODS)) out[k] = MOODS[k].weight;
  return out;
};

export function rollExpression(rng: Rng, exaggeration: number): Expression {
  const r = rng.fork('expression');
  const name = r.weighted(moodWeights());
  const m = MOODS[name];
  const k = 0.35 + 0.65 * exaggeration;
  const j = (v: number, sd: number): number => v * k + r.gaussian(0, sd * exaggeration);

  // Looking somewhere specific is most of what makes a drawn face feel awake,
  // so the gaze is biased away from dead centre rather than around it.
  const ga = r.float(0, Math.PI * 2);
  const gm = Math.abs(r.gaussian(0.45, 0.3)) * (0.4 + 0.6 * exaggeration);

  return {
    name,
    valence: clamp(j(m.valence, 0.25), -1, 1),
    arousal: clamp(j(m.arousal, 0.2), 0, 1.2),
    browRaise: clamp(j(m.browRaise, 0.3), -1, 1.2),
    browTilt: clamp(j(m.browTilt, 0.3), -1, 1),
    eyeOpen: clamp(m.eyeOpen * k + r.gaussian(0, 0.22 * exaggeration), 0.05, 1.5),
    gaze: [clamp(Math.cos(ga) * gm, -1, 1), clamp(Math.sin(ga) * gm * 0.7, -1, 1)],
    mouthCurve: clamp(j(m.mouthCurve, 0.28), -1, 1),
    mouthOpen: clamp(m.mouthOpen * k + Math.abs(r.gaussian(0, 0.18 * exaggeration)), 0, 1),
    skew: clamp(m.skew * (0.5 + 0.5 * exaggeration) + r.gaussian(0, 0.2), 0, 1.2),
  };
}

/**
 * Bias the variant picks so the shape of a feature agrees with the mood too —
 * a startled face should reach for a wide-eye variant, not merely open the one
 * it happened to roll.
 */
export function expressionBias(slot: SlotName, e: Expression): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  const put = (t: Record<string, number>): void => {
    for (const k of Object.keys(t)) out[k] = (out[k] ?? 1) * t[k];
  };

  if (slot === 'eyes') {
    if (e.eyeOpen > 0.85) put({ cartoonBig: 2.2, wideStare: 2.2, round: 1.5, squint: 0.2, closedArc: 0.1 });
    if (e.eyeOpen < 0.3) put({ squint: 2.8, closedArc: 2.2, dot: 1.4, cartoonBig: 0.2, wideStare: 0.2 });
  } else if (slot === 'brows') {
    if (e.browRaise > 0.45) put({ raised: 2.6, thinArc: 1.3, angry: 0.3 });
    if (e.browTilt < -0.3) put({ angry: 2.8, thickSlab: 1.4, raised: 0.2 });
    if (e.browTilt > 0.4) put({ thinArc: 1.8, sparse: 1.4, angry: 0.2 });
  } else if (slot === 'mouth') {
    if (e.mouthOpen > 0.4) put({ openTeeth: 2.5, grin: 1.8, tongueOut: 1.6, line: 0.4, pursed: 0.3 });
    if (e.mouthCurve > 0.4) put({ grin: 2.2, smirk: 1.8, frown: 0.15 });
    if (e.mouthCurve < -0.35) put({ frown: 2.6, pursed: 1.4, grin: 0.15, tongueOut: 0.3 });
  } else if (slot === 'irises') {
    if (Math.hypot(e.gaze[0], e.gaze[1]) > 0.45) put({ offsetPupil: 2.6, dotPupil: 1.3, blank: 0.35 });
    if (e.eyeOpen < 0.3) put({ blank: 2, ringIris: 0.4 });
  }

  return Object.keys(out).length ? out : undefined;
}

/**
 * Fold the mood into a variant's already-rolled parameters.
 *
 * Done at GENERATION time rather than in draw(): the params are what get stored
 * on FaceParams, so a face stays self-contained and no feature function has to
 * learn about expressions. The parameter names below are the ones the variants
 * actually declare — anything a slot does not have is simply skipped.
 */
export function applyExpression(slot: SlotName, p: FeatureParams, e: Expression, side: -1 | 1 = 1): FeatureParams {
  const q: FeatureParams = { ...p };
  const num = (k: string): number | undefined => (typeof q[k] === 'number' ? (q[k] as number) : undefined);
  const add = (k: string, d: number): void => {
    const v = num(k);
    if (v !== undefined) q[k] = v + d;
  };
  const mul = (k: string, f: number): void => {
    const v = num(k);
    if (v !== undefined) q[k] = v * f;
  };

  if (slot === 'eyes') {
    const open = 0.35 + e.eyeOpen;
    mul('openness', open);
    mul('r', 0.6 + e.eyeOpen * 0.7);
    // A squint's `gap` is its aperture, so it moves with eyeOpen too.
    mul('gap', 0.4 + e.eyeOpen);
    // Lids drop as arousal falls.
    add('lidHeavy', (1 - e.arousal) * 0.3);
    add('lid', (1 - e.arousal) * 0.2);
  } else if (slot === 'brows') {
    // Larger `lift` draws the brow higher (variants use -lift as the y offset).
    add('lift', e.browRaise * 0.55);
    // In local space +x is outward, and a positive `tilt` drops the INNER end,
    // which is the angry direction — so a worried browTilt subtracts.
    add('tilt', -e.browTilt * 0.45);
    add('slant', -e.browTilt * 0.4);
    add('arch', e.browRaise * 0.25);
  } else if (slot === 'mouth') {
    // +y is down, so a positive `curve` sags the middle: a smile subtracts.
    add('curve', -e.mouthCurve * 0.4);
    add('lift', e.mouthCurve * 0.35);
    add('depth', -e.mouthCurve * 0.3);
    mul('height', 0.4 + e.mouthOpen * 1.4);
    mul('r', 0.5 + e.mouthOpen * 1.2);
    add('skew', e.skew * 0.12 * side);
  } else if (slot === 'irises') {
    const [gx, gy] = e.gaze;
    if (num('gazeX') !== undefined) q.gazeX = gx * 0.55;
    if (num('gazeY') !== undefined) q.gazeY = gy * 0.4;
    if (num('push') !== undefined) q.push = clamp(Math.hypot(gx, gy) * 0.75, 0.15, 0.7);
    if (num('angle') !== undefined) q.angle = Math.atan2(gy * 0.7, gx);
    mul('r', 0.75 + e.arousal * 0.4);
  }

  return q;
}
