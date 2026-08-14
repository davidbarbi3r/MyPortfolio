import type {
  AnchorDef,
  AnchorName,
  FaceParams,
  FeatureGroup,
  HeadShape,
  ResolvedStyle,
  SlotName,
  SlotState,
  WashPatch,
} from './types';
import { makeRng, type Rng } from './rng';
import { clamp } from './math/vec';
import { ANCHORS } from './head/anchors';
import { SQUARENESS_MAX, SQUARENESS_MIN } from './head/surface';
import { archetypeMeans, archetypeWeights } from './head/archetypes';
import { resolveStyle } from './style/resolve';
import { getVariant, pickVariant } from './features/registry';
import { PICK_ORDER, registerAllFeatures } from './features';

export interface GenerateOptions {
  /** Only used for weight tables and asymmetry budgets — NOT stored on the face. */
  style?: string | ResolvedStyle;
  /** Pin a slot to a specific variant (debugging, galleries). */
  force?: Partial<Record<SlotName, string>>;
}

/**
 * Cross-slot coherence. Tags accumulated from already-picked variants bias the
 * weights of later slots, so an old man gets wrinkles and a cartoon face gets
 * a cartoon mouth — without any feature function knowing about another.
 */
const TAG_BIAS: Record<string, Partial<Record<SlotName, Record<string, number>>>> = {
  age: {
    wrinkles: { none: 0.25, forehead: 2.5, crowsFeet: 2.5, nasolabial: 2, heavyLines: 2.5 },
    brows: { bushy: 2.2, sparse: 1.6, thinArc: 0.6 },
    facialHair: { none: 0.6, moustache: 1.8, fullBeard: 1.6 },
  },
  cartoon: {
    eyes: { cartoonBig: 2, dot: 1.6, almond: 0.6 },
    irises: { offsetPupil: 2.2, crossed: 1.8 },
    mouth: { openTeeth: 1.8, tongueOut: 2, line: 0.7 },
  },
  angry: {
    mouth: { frown: 2.4, grin: 0.4 },
    brows: { angry: 2.5, raised: 0.4 },
  },
  calm: {
    mouth: { line: 1.6, pursed: 1.5, openTeeth: 0.5 },
  },
};

function biasFor(slot: SlotName, tags: Record<string, number>): Record<string, number> | undefined {
  let out: Record<string, number> | undefined;
  for (const tag of Object.keys(tags)) {
    const table = TAG_BIAS[tag]?.[slot];
    if (!table) continue;
    out = out ?? {};
    for (const k of Object.keys(table)) out[k] = (out[k] ?? 1) * table[k];
  }
  return out;
}

function makeHead(rng: Rng, style: ResolvedStyle): { head: HeadShape; archetype: string } {
  const g = rng.fork('head');
  const ex = style.proportions.exaggeration;
  const budget = style.proportions.deformBudget;

  // The archetype pick runs on its OWN named fork. `gaussian` is Box-Muller
  // with a cached spare, so draws are consumed in pairs — slipping a non-
  // gaussian draw into the sequence below would flip the pairing parity of
  // every gene after it, not merely shift them.
  const archetype = g.fork('archetype').weighted(archetypeWeights());
  const b = archetypeMeans(archetype, ex);

  // Deformation coefficients are clamped so the projected outline stays
  // star-shaped about its centroid, which the silhouette algorithm relies on.
  const d = (mean: number, sd: number): number => clamp(g.gaussian(mean, sd * ex), -budget, budget);

  const head: HeadShape = {
    rx: b.rx * (1 + g.gaussian(0, 0.13 * ex)),
    ry: b.ry * (1 + g.gaussian(0, 0.11 * ex)),
    rz: b.rz * (1 + g.gaussian(0, 0.1 * ex)),
    jawWidth: d(b.jawWidth, 0.18),
    chinTaper: clamp(g.gaussian(b.chinTaper, 0.2 * ex), -0.05, Math.max(0.5, budget)),
    chinLength: clamp(g.gaussian(b.chinLength, 0.1 * ex), -0.02, 0.3),
    craniumBulge: d(b.craniumBulge, 0.16),
    cheekFull: d(b.cheekFull, 0.16),
    templeFlat: clamp(g.gaussian(b.templeFlat, 0.12 * ex), -0.05, 0.32),
    browRidge: d(b.browRidge, 0.12),
    occiput: d(b.occiput, 0.12),
    asymX: g.gaussian(0, 0.5 * ex * style.proportions.asymmetry.headTilt),
    // Appended LAST, so the twelve genes above keep their exact draw order.
    // Its own clamp: `d()` bounds symmetrically around zero, which is the wrong
    // shape of bound for an exponent centred on 2.
    squareness: clamp(g.gaussian(b.squareness ?? 2, 0.3 * ex), SQUARENESS_MIN, SQUARENESS_MAX),
  };

  return { head, archetype };
}

/**
 * Head size on the page, and feature sizes that are free to disagree with it.
 *
 * Runs on its own stream so it never perturbs the anchor jitter below. The
 * anti-correlation is the point: drawn independently, "big head, tiny eyes"
 * would only turn up by chance. Here it is a weighted choice, per group, so one
 * face can carry a big head with small eyes and a large mouth at once.
 */
function makeProportions(
  rng: Rng,
  style: ResolvedStyle
): { headScale: number; featureScale: Record<FeatureGroup, number> } {
  const p = rng.fork('proportions');
  const ex = style.proportions.exaggeration;

  const headScale = clamp(p.gaussian(1, 0.12 * ex), 0.82, 1.16);

  const group = (): number => {
    const opposed = p.bool(0.55);
    const bias = opposed ? -(headScale - 1) * 2.1 : 0;
    return clamp(1 + bias + p.gaussian(0, 0.2 * ex), 0.5, 1.85);
  };

  return {
    headScale,
    featureScale: { eyes: group(), brows: group(), nose: group(), mouth: group(), ears: group() },
  };
}

/** Which feature group scales each anchor. Anchors absent from this map (the
 *  cheeks, the hairline, the neck) keep their generated size. */
const GROUP_OF: Partial<Record<AnchorName, FeatureGroup>> = {
  eyeL: 'eyes',
  eyeR: 'eyes',
  browL: 'brows',
  browR: 'brows',
  noseTip: 'nose',
  mouth: 'mouth',
  earL: 'ears',
  earR: 'ears',
};

/**
 * Per-anchor jitter. The left and right members of a pair are perturbed
 * INDEPENDENTLY, which is where the caricature comes from: one eye ends up
 * large and high, the other small and low, exactly as in the reference sheets.
 */
function makeAnchors(
  rng: Rng,
  style: ResolvedStyle,
  featureScale: Record<FeatureGroup, number>
): Partial<Record<AnchorName, Partial<AnchorDef>>> {
  const a = rng.fork('anchors');
  const ex = style.proportions.exaggeration;
  const asym = style.proportions.asymmetry;
  const out: Partial<Record<AnchorName, Partial<AnchorDef>>> = {};

  const jitterPair = (names: AnchorName[], dTheta: number, dPhi: number, dSize: number): void => {
    for (const n of names) {
      const base = ANCHORS[n];
      out[n] = {
        theta: base.theta + a.gaussian(0, dTheta * ex),
        phi: base.phi + a.gaussian(0, dPhi * ex),
        arcT: Math.max(0.04, base.arcT * (1 + a.gaussian(0, dSize * ex))),
        arcP: Math.max(0.03, base.arcP * (1 + a.gaussian(0, dSize * ex))),
      };
    }
  };

  jitterPair(['eyeL', 'eyeR'], 0.09, asym.eyeHeight * 0.16, asym.eyeSize * 0.55);
  jitterPair(['browL', 'browR'], 0.08, asym.browTilt * 0.13, asym.browTilt * 0.4);
  jitterPair(['earL', 'earR'], 0.07, 0.1, 0.25);
  jitterPair(['cheekL', 'cheekR'], 0.06, 0.08, 0.2);

  const nose = ANCHORS.noseTip;
  out.noseTip = {
    theta: nose.theta + a.gaussian(0, asym.noseShift * 0.22),
    phi: nose.phi + a.gaussian(0, 0.1 * ex),
    arcT: nose.arcT * (1 + a.gaussian(0, 0.3 * ex)),
    arcP: nose.arcP * (1 + a.gaussian(0, 0.35 * ex)),
  };

  const mouth = ANCHORS.mouth;
  out.mouth = {
    theta: mouth.theta + a.gaussian(0, asym.mouthSkew * 0.16),
    phi: mouth.phi + a.gaussian(0, 0.11 * ex),
    arcT: mouth.arcT * (1 + a.gaussian(0, 0.28 * ex)),
    arcP: mouth.arcP * (1 + a.gaussian(0, 0.25 * ex)),
  };

  // Applied AFTER the forty draws above, from a stream that never touches them.
  for (const key of Object.keys(out) as AnchorName[]) {
    const group = GROUP_OF[key];
    const def = out[key];
    if (!group || !def) continue;
    const k = featureScale[group];
    if (def.arcT !== undefined) def.arcT = Math.max(0.03, def.arcT * k);
    if (def.arcP !== undefined) def.arcP = Math.max(0.025, def.arcP * k);
  }

  return out;
}

/** A closed ring in (theta, phi) space — the base shape of a colour patch. */
function sphericalBlob(
  rng: Rng,
  ct: number,
  cp: number,
  rt: number,
  rp: number,
  wobble: number,
  segments = 28
): Array<[number, number]> {
  const k1 = rng.float(1.5, 3.5);
  const k2 = rng.float(3.5, 6.5);
  const ph = rng.float(0, Math.PI * 2);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const w = 1 + wobble * (0.65 * Math.sin(a * k1 + ph) + 0.35 * Math.sin(a * k2 + ph * 1.7));
    out.push([ct + Math.cos(a) * rt * w, cp + Math.sin(a) * rp * w]);
  }
  return out;
}

/**
 * Colour patches are authored on the HEAD SURFACE, from the anchors — never
 * derived by flood-filling the linework. A patch whose shape is computed from
 * the lines is a filter; a patch drawn independently and then misregistered is
 * a print.
 */
function makePatches(rng: Rng, style: ResolvedStyle, colorIdx: FaceParams['colorIdx']): WashPatch[] {
  if (!style.wash.enabled) return [];
  const w = rng.fork('wash');
  const mismatch = style.wash.mismatch;
  const patches: WashPatch[] = [];

  patches.push({
    kind: 'skin',
    plate: 0,
    colorIdx: colorIdx.skin,
    ring: sphericalBlob(
      w,
      w.gaussian(0, 0.12),
      w.gaussian(-0.2, 0.1),
      1.15 * (1 + mismatch),
      0.9 * (1 + mismatch),
      style.wash.edgeRagged * 0.14
    ),
    expand: 0.01,
  });

  patches.push({
    kind: 'hair',
    plate: 1,
    colorIdx: colorIdx.hair,
    ring: sphericalBlob(
      w,
      w.gaussian(0, 0.14),
      w.gaussian(0.95, 0.1),
      1.15 * (1 + mismatch),
      0.42 * (1 + mismatch),
      style.wash.edgeRagged * 0.18
    ),
    expand: 0.05,
  });

  // The third plate misses on purpose about half the time — a wash that always
  // lands reads as a tint layer, not as a press with bad registration.
  if (style.wash.plates > 2 && w.bool(0.6)) {
    patches.push({
      kind: 'accent',
      plate: 2,
      colorIdx: colorIdx.accent,
      ring: sphericalBlob(
        w,
        w.gaussian(0, 0.5),
        w.gaussian(-0.5, 0.25),
        w.float(0.35, 0.8),
        w.float(0.25, 0.5),
        style.wash.edgeRagged * 0.25
      ),
      expand: 0.02,
    });
  }

  return patches;
}

export function generateFace(seed: string | number, opts?: GenerateOptions): FaceParams {
  registerAllFeatures();

  const seedStr = String(seed);
  const style = typeof opts?.style === 'object' ? opts.style : resolveStyle(opts?.style ?? 'encre');
  const rng = makeRng(seedStr);

  const slotRng = rng.fork('slots');
  const slots: Partial<Record<SlotName, SlotState>> = {};
  const tags: Record<string, number> = {};

  for (const slot of PICK_ORDER) {
    const forced = opts?.force?.[slot];
    const name = forced ?? pickVariant(slot, slotRng, style, biasFor(slot, tags));
    const variant = getVariant(slot, name);
    if (!variant) continue;
    slots[slot] = { variant: variant.name, p: variant.roll(slotRng.fork(`roll:${slot}`), style) };
    for (const t of variant.tags ?? []) tags[t] = (tags[t] ?? 0) + 1;
  }

  const c = rng.fork('colors');
  const colorIdx = { skin: c.int(0, 99), hair: c.int(0, 99), accent: c.int(0, 99), ink: c.int(0, 99) };

  // One shared light direction, biased to the upper left. Without a single
  // light every shaded feature is lit on its own and the face falls apart.
  const la = rng.fork('light').gaussian(-2.3, 0.45);

  const { head, archetype } = makeHead(rng, style);
  const { headScale, featureScale } = makeProportions(rng, style);

  return {
    v: 1,
    seed: seedStr,
    head,
    archetype,
    headScale,
    featureScale,
    anchors: makeAnchors(rng, style, featureScale),
    slots,
    colorIdx,
    patches: makePatches(rng, style, colorIdx),
    light: [Math.cos(la), Math.sin(la)],
    textureSeed: rng.fork('texture').int(0, 2 ** 30),
  };
}
