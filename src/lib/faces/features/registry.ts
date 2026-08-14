import type { AnchorDef, AnchorName, FaceParams, FeatureParams, Frame, Pt, ResolvedStyle, SlotName } from '../types';
import type { Rng } from '../rng';
import type { HeadView } from '../head/pose';
import type { OutlineOpts } from '../head/silhouette';
import type { InkContext } from '../ink/ink-context';

/**
 * Everything a feature might need beyond its own frame: the head view (for
 * features that must hug the skull, like hair), the current silhouette, the
 * other resolved frames, and the surface warp field.
 */
export interface FeatureEnv {
  view: HeadView;
  silhouette: Pt[];
  face: FaceParams;
  frames: Partial<Record<AnchorName, Frame>>;
  /** Build a frame on demand, e.g. eye anchors at a rigid conform for glasses. */
  frameAt(name: AnchorName, over?: Partial<AnchorDef>): Frame;
  /** Outline of a region of the head, already scaled to the current LOD.
   *  Features must go through these rather than calling projectedOutline
   *  directly, or a 48-cell sheet pays full sampling cost per cell. */
  outline(opts: OutlineOpts): Pt[];
  /** Scalp outline above a (possibly wavy) hairline — the base of all hair. */
  cap(hairline: number | ((theta: number) => number), expand?: number): Pt[];
  warp: (p: Pt) => Pt;
  detail: number;
}

export type FeatureFn<P = FeatureParams> = (ink: InkContext, params: P, rng: Rng, env: FeatureEnv) => void;

export interface FeatureVariant<P = FeatureParams> {
  name: string;
  weight: number;
  layer: number;
  /** Overrides the anchor's own conform value. */
  conform?: number;
  /** Coherence hints — generation biases sibling slots from these. */
  tags?: string[];
  requires?: SlotName[];
  /**
   * Rolled at GENERATION time and stored in FaceParams as plain numbers.
   * Kept separate from draw() so a face is serialisable and can be re-drawn in
   * a different style without changing its anatomy.
   */
  roll(rng: Rng, style: ResolvedStyle): P;
  /** Runs at BAKE time. Uses rng only for stroke wobble, never for anatomy. */
  draw: FeatureFn<P>;
}

const slots = new Map<SlotName, Record<string, FeatureVariant>>();

// Intentionally not generic over the params type: each slot declares several
// variants with different param shapes, and a single inferred P would collapse
// them into an unusable union. Params are plain number/string records anyway,
// because they have to survive JSON round-tripping in FaceParams.
export function defineSlot(name: SlotName, variants: Record<string, Omit<FeatureVariant, 'name'>>): void {
  const filled: Record<string, FeatureVariant> = {};
  for (const key of Object.keys(variants)) {
    filled[key] = { name: key, ...variants[key] };
  }
  slots.set(name, { ...(slots.get(name) ?? {}), ...filled });
}

export const slotVariants = (name: SlotName): Record<string, FeatureVariant> => slots.get(name) ?? {};

export function getVariant(slot: SlotName, name: string): FeatureVariant | undefined {
  const all = slotVariants(slot);
  if (all[name]) return all[name];
  // A face generated before a variant was renamed or removed must still draw.
  // Fall back to the heaviest variant in the slot rather than dropping it.
  const keys = Object.keys(all);
  if (keys.length === 0) return undefined;
  return all[keys.reduce((best, k) => (all[k].weight > all[best].weight ? k : best), keys[0])];
}

/** Default weights from the variant declarations, overridden by the style. */
export function weightTable(
  slot: SlotName,
  style: ResolvedStyle,
  bias?: Record<string, number>
): Record<string, number> {
  const all = slotVariants(slot);
  const table: Record<string, number> = {};
  for (const k of Object.keys(all)) table[k] = all[k].weight;
  const styleWeights = style.weights?.[slot];
  if (styleWeights) {
    for (const k of Object.keys(styleWeights)) {
      if (table[k] !== undefined) table[k] = styleWeights[k];
    }
  }
  if (bias) {
    for (const k of Object.keys(bias)) {
      if (table[k] !== undefined) table[k] *= bias[k];
    }
  }
  return table;
}

export function pickVariant(slot: SlotName, rng: Rng, style: ResolvedStyle, bias?: Record<string, number>): string {
  const table = weightTable(slot, style, bias);
  const keys = Object.keys(table);
  if (keys.length === 0) return '';
  // Forked by slot name, so adding a slot never reshuffles the others.
  return rng.fork(`slot:${slot}`).weighted(table);
}

export const allSlots = (): SlotName[] => Array.from(slots.keys());
