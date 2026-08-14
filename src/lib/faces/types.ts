import type { Pt } from './math/geom2';
import type { Mat2x3 } from './math/vec';
import type { Expression } from './expression';

export type { Pt, Mat2x3 };
export type { Expression };

// ---------------------------------------------------------------------------
// Head
// ---------------------------------------------------------------------------

/**
 * Head shape genes. These drive separable anisotropic profiles rather than a
 * single scalar radial deformation: a scalar radius couples width, depth and
 * height, so you could not widen a jaw without also lengthening the nose.
 */
export interface HeadShape {
  rx: number;
  ry: number;
  rz: number;
  jawWidth: number;
  chinTaper: number;
  chinLength: number;
  craniumBulge: number;
  cheekFull: number;
  templeFlat: number;
  browRidge: number;
  occiput: number;
  asymX: number;
  /**
   * Superellipse exponent for the horizontal cross-section. 2 is an exact
   * ellipse (the original model); above it the skull squares off into a blocky
   * jaw and a flat crown, below it pinches toward a diamond.
   *
   * Optional so a hand-built HeadShape still works — `surface()` defaults it to
   * 2 rather than producing silent NaN coordinates.
   */
  squareness?: number;
}

export interface Pose {
  /** Radians. Positive turns the head toward its own left. */
  yaw: number;
  /** Positive raises the chin. */
  pitch: number;
  /** Positive is clockwise on screen. */
  roll: number;
  /** Camera distance in multiples of the head radius. Infinity = orthographic. */
  camera: number;
}

export type AnchorName =
  | 'eyeL'
  | 'eyeR'
  | 'browL'
  | 'browR'
  | 'noseRoot'
  | 'noseTip'
  | 'mouth'
  | 'earL'
  | 'earR'
  | 'cheekL'
  | 'cheekR'
  | 'hairline'
  | 'chin'
  | 'neck'
  | 'foreheadL'
  | 'foreheadR';

export interface AnchorDef {
  /** Longitude, radians. 0 faces the camera. */
  theta: number;
  /** Latitude, radians. Positive is up. */
  phi: number;
  /** Half-extent of the feature, in RADIANS OF HEAD ARC — not pixels. */
  arcT: number;
  arcP: number;
  /** 1 = painted on the sphere, 0 = rigid fronto-parallel billboard. */
  conform: number;
}

/**
 * A resolved drawing frame for one anchor at one pose. A feature function draws
 * in local [-1,1] space and knows nothing about pose, scale or head shape.
 */
export interface Frame {
  x: number;
  y: number;
  /** local [-1,1]^2 -> canonical face space */
  m: Mat2x3;
  /** Mean face-space units per local unit. Drives stroke width. */
  scale: number;
  /** Rotated z, for painter ordering. */
  depth: number;
  /** normal . toCamera, in [-1, 1]. */
  facing: number;
  /** 0..1 limb fade derived from `facing`. */
  visibility: number;
  /** Projected outward normal, screen space. */
  nx: number;
  ny: number;
  mirrored: boolean;
}

// ---------------------------------------------------------------------------
// Ink
// ---------------------------------------------------------------------------

export type StrokeRole = 'outline' | 'feature' | 'detail' | 'hatch' | 'accent';

export interface StrokeSpec {
  /** Max width, canonical face-space units. */
  width: number;
  /** 0 = uniform, 1 = strongly spindled. */
  taper: number;
  /** -1 heavy entry, +1 heavy exit. */
  taperBias: number;
  /** Normal displacement amplitude. */
  wobble: number;
  /** fBm wavelength along arc length. */
  wobbleScale: number;
  /** Tangential displacement — speed variation. */
  drift: number;
  /** Overlapping searching strokes, 1..4. */
  passes: number;
  /** Rigid offset between passes. Rigid, not re-noised — that is the difference
   *  between "a hand searching" and "one blurry line". */
  passOffset: number;
  passAlphaFalloff: number;
  /** Extension past the ends, applied before wobble. */
  overshoot: number;
  /** Probability of a break per segment. */
  gapChance: number;
  /** Extra width through direction changes — a hand slows in a turn. */
  cornerPress: number;
  /** Systematic bow on long "straight" lines, as a fraction of length. */
  bow: number;
  alpha: number;
  color: string;
  /** 'ribbon' builds a filled outline with varying width; 'stroke' uses the
   *  constant-width canvas stroke (only honest for a technical-pen style). */
  mode: 'ribbon' | 'stroke';
}

export interface HatchOpts {
  angle: number;
  spacing?: number;
  jitter?: number;
  overshoot?: number;
  alpha?: number;
  /** Second crossing pass. Uses a deliberately different spacing to avoid moire. */
  cross?: boolean;
  crossAngle?: number;
  /** Bend the hatch lines along the head surface. This is the single strongest
   *  cue that a feature sits ON a volume rather than on top of it. */
  warp?: boolean;
  role?: StrokeRole;
}

export interface InkFillOpts {
  /** Edge raggedness, 0..1. */
  ragged?: number;
  /** Dilated translucent second fill — ink bleed. */
  bleed?: number;
  /** White reserves: without them a black mass reads as a plain fill(). */
  holes?: number;
  /** Short tapered hairs escaping the boundary. */
  strays?: number;
  color?: string;
  alpha?: number;
  layer?: number;
}

export interface StippleOpts {
  density?: number;
  radius?: number;
  alpha?: number;
  color?: string;
  /** 0..1 weight per point, for graded texture. */
  gradient?: (p: Pt) => number;
}

// ---------------------------------------------------------------------------
// Draw list — baked geometry in canonical 1000 x 1000 face space
// ---------------------------------------------------------------------------

export const L = {
  WASH: 0,
  BACK: 10,
  HEAD_FILL: 20,
  SILHOUETTE: 30,
  SHADING: 40,
  FACE: 50,
  FACE_DETAIL: 60,
  /** Partial second contour pass, drawn OVER the features so outlines
   *  interlock with them instead of sitting under a clean stack. */
  SILHOUETTE_2: 65,
  HAIR_FRONT: 70,
  ACCESSORY: 80,
  GRAIN: 90,
} as const;

export type DrawOp =
  | { k: 'poly'; layer: number; z: number; pts: number[]; color: string; alpha: number }
  | { k: 'line'; layer: number; z: number; pts: number[]; w: number; color: string; alpha: number }
  | { k: 'dots'; layer: number; z: number; xy: number[]; r: number[]; color: string; alpha: number }
  | { k: 'erase'; layer: number; z: number; pts: number[] };

export interface Plate {
  color: string;
  /** Rigid misregistration offset in canonical units. */
  dx: number;
  dy: number;
  rot: number;
  ops: DrawOp[];
}

export const FACE_BOX = 1000;

/** Enough paper/wash description that painting needs no access to the style. */
export interface DrawListPaper {
  color: string;
  grain: number;
  grainScale: number;
  blotches: number;
  vignette: number;
  seed: number;
}

export interface FaceDrawList {
  v: 1;
  box: typeof FACE_BOX;
  ops: DrawOp[];
  plates: Plate[];
  paperOps: DrawOp[];
  paper: DrawListPaper;
  wash: { alpha: number; blend: GlobalCompositeOperation };
  bounds: [number, number, number, number];
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export type SlotName =
  | 'eyes'
  | 'irises'
  | 'brows'
  | 'nose'
  | 'mouth'
  | 'ears'
  | 'hair'
  | 'facialHair'
  | 'glasses'
  | 'headwear'
  | 'wrinkles'
  | 'freckles'
  | 'neck';

export type FeatureParams = Record<string, number | string>;

export interface SlotState {
  variant: string;
  p: FeatureParams;
  /** Params for the second anchor of a paired slot. Mismatched eyes are all
   *  over the reference sheets, and one shared param set cannot produce them. */
  pR?: FeatureParams;
  /** A genuinely different variant on the right — one round eye, one slit. */
  variantR?: string;
}

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

export interface Palette {
  id: string;
  label: string;
  paper: string;
  /** Line inks. Index 0 is the primary. */
  inks: string[];
  skins: string[];
  hairs: string[];
  accents: string[];
}

export interface FaceStyle {
  id: string;
  label: string;
  extends?: string;

  stroke: {
    base: StrokeSpec;
    roles: Partial<Record<StrokeRole, Partial<StrokeSpec>>>;
  };

  paper: {
    grain: number;
    grainScale: number;
    blotches: number;
    fibres: number;
    vignette: number;
  };

  texture: {
    hatchSpacing: number;
    hatchJitter: number;
    crossHatchChance: number;
    stippleDensity: number;
    shadingAmount: number;
  };

  wash: {
    enabled: boolean;
    plates: number;
    /** Misregistration amplitude, canonical units. */
    offset: number;
    rotate: number;
    alpha: number;
    blend: GlobalCompositeOperation;
    edgeRagged: number;
    dryPatches: number;
    /** Deliberate shape divergence between patch and linework. */
    mismatch: number;
  };

  proportions: {
    /** 0 = anatomical, 1 = hard caricature. */
    exaggeration: number;
    asymmetry: {
      eyeSize: number;
      eyeHeight: number;
      browTilt: number;
      noseShift: number;
      mouthSkew: number;
      headTilt: number;
    };
    /** Bounds the head deformation coefficients so the silhouette stays star-shaped. */
    deformBudget: number;
  };

  weights: Partial<Record<SlotName, Record<string, number>>>;

  paletteId: string;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type StylePreset = DeepPartial<FaceStyle> & { id: string; label: string; extends?: string };

export interface ResolvedStyle extends Omit<FaceStyle, 'stroke' | 'paletteId'> {
  /** Roles are flattened to complete specs once per bake — feature functions
   *  call ink.path() hundreds of times and must not re-merge on every call. */
  roles: Record<StrokeRole, StrokeSpec>;
  palette: Palette;
}

// ---------------------------------------------------------------------------
// Face
// ---------------------------------------------------------------------------

export interface WashPatch {
  kind: 'skin' | 'hair' | 'accent';
  plate: number;
  colorIdx: number;
  /** Ring of [theta, phi] on the head surface — so the patch follows the pose. */
  ring: Array<[number, number]>;
  /** Push outward along the surface normal. */
  expand: number;
}

/**
 * A generated face. Pure JSON, versioned, no functions, no colours — only
 * palette indices. Neither pose nor style live here, deliberately:
 *  - pose is excluded so the same face can turn without regenerating anatomy;
 *  - style is excluded so the same face can be drawn in three styles side by
 *    side, which is the clearest demonstration that the system is real.
 */
/** Feature groups whose size varies independently of the head's. */
export type FeatureGroup = 'eyes' | 'brows' | 'nose' | 'mouth' | 'ears';

export interface FaceParams {
  v: 1;
  seed: string;
  head: HeadShape;
  /** Which skull archetype the genes were jittered around. Informational. */
  archetype: string;
  /** Multiplies the projection scale, so heads differ in size on the page. */
  headScale: number;
  /** The shared mood every feature is modulated by. */
  expression: Expression;
  /** A resting head attitude baked into the face, composed with the requested
   *  pose. Without it a sheet is a grid of mugshots. */
  tilt: { yaw: number; pitch: number; roll: number };
  /** Per-group size multipliers, deliberately independent of `headScale` —
   *  a big head with small eyes is a caricature device, not an accident. */
  featureScale: Record<FeatureGroup, number>;
  anchors: Partial<Record<AnchorName, Partial<AnchorDef>>>;
  slots: Partial<Record<SlotName, SlotState>>;
  colorIdx: { skin: number; hair: number; accent: number; ink: number };
  patches: WashPatch[];
  /** Global light direction in screen space — a single shared light is what
   *  stops each shaded feature from floating independently. */
  light: [number, number];
  textureSeed: number;
}
