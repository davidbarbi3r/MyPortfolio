import type { AnchorName, DrawOp, FaceDrawList, FaceParams, Frame, Plate, Pose, Pt, ResolvedStyle } from '../types';
import { FACE_BOX, L } from '../types';
import { makeRng, type Rng } from './../rng';
import { boundsOf } from '../math/geom2';
import { resolveAnchor, ANCHORS } from '../head/anchors';
import { defaultPose, makeHeadView } from '../head/pose';
import { makeFrame, makeSurfaceWarp, projectRing } from '../head/frame';
import { projectedOutline, subArc, type OutlineOpts } from '../head/silhouette';
import { DrawSink } from '../ink/sink';
import { InkCtx } from '../ink/ink-context';
import { inkFill } from '../ink/fill';
import { resolveStyle } from '../style/resolve';
import { getVariant, type FeatureEnv } from '../features/registry';
import { DRAW_ORDER, SLOT_ANCHORS, registerAllFeatures } from '../features';

export interface BakeOptions {
  pose?: Pose;
  style?: string | ResolvedStyle;
  palette?: string;
  /** 0..1 level of detail, derived from the target render size. */
  detail?: number;
  /** Re-bake with a new tick to get the traditional-animation boil. Anatomy is
   *  unaffected because only the stroke streams depend on it. */
  tick?: number;
}

/** Below this, a feature has turned away far enough to be dropped entirely. */
const CULL = -0.12;

const ALL_ANCHORS = Object.keys(ANCHORS) as AnchorName[];

function pickColor(list: string[], idx: number): string {
  return list[((idx % list.length) + list.length) % list.length];
}

export function bakeFace(face: FaceParams, opts?: BakeOptions): FaceDrawList {
  registerAllFeatures();

  const style =
    typeof opts?.style === 'object' ? opts.style : resolveStyle(opts?.style ?? 'encre', undefined, opts?.palette);
  const pose = opts?.pose ?? defaultPose();
  const detail = opts?.detail ?? 1;
  const tick = opts?.tick ?? 0;

  const view = makeHeadView(face.head, pose);

  // Outline sampling dominates bake cost (every sample is a surface evaluation
  // plus a projection), so it scales with LOD. This is what keeps a live,
  // cursor-following pose inside a frame budget and a 48-cell sheet affordable.
  const lod = <T>(full: T, low: T): T => (detail < 0.7 ? low : full);
  const outline = (o: OutlineOpts): Pt[] =>
    projectedOutline(view, {
      samples: lod(128, 80),
      nTheta: lod(72, 44),
      nPhi: lod(40, 22),
      ...o,
    });
  const cap = (hairline: number | ((theta: number) => number), expand = 0): Pt[] =>
    outline({ phiMin: hairline, expand, samples: lod(96, 64), nTheta: lod(64, 40), nPhi: lod(22, 14) });

  const sil = outline({});
  const warp = makeSurfaceWarp(view);
  const bakeRng = makeRng(face.seed, `/bake#${tick}`);

  // resolveAnchor folds the per-face jitter and any override (including
  // `conform`) into a complete AnchorDef, so makeFrame needs no extra opts.
  const frameAt = (name: AnchorName, over?: Partial<Parameters<typeof makeFrame>[1]>): Frame =>
    makeFrame(view, resolveAnchor(name, { ...face.anchors[name], ...over }));

  const frames: Partial<Record<AnchorName, Frame>> = {};
  for (const name of ALL_ANCHORS) frames[name] = frameAt(name);

  const sink = new DrawSink();
  const inkColor = pickColor(style.palette.inks, face.colorIdx.ink);

  // The head fill is opaque paper, so BACK-layer items (far ear, neck) are
  // hidden behind the skull. It sits inside the ink layer, and the colour
  // plates are composited over the whole thing at paint time.
  sink.at(L.HEAD_FILL, 0).fillPolygon(sil, style.palette.paper, 1);

  // A root frame for anything authored directly in face space.
  const rootFrame: Frame = {
    x: view.cx,
    y: view.cy,
    m: [view.scale, 0, 0, view.scale, view.cx, view.cy],
    scale: view.scale,
    depth: 0,
    facing: 1,
    visibility: 1,
    nx: 0,
    ny: 0,
    mirrored: false,
  };

  const env: FeatureEnv = {
    view,
    silhouette: sil,
    face,
    frames,
    frameAt,
    outline,
    cap,
    warp,
    detail,
  };

  const makeInk = (frame: Frame, layer: number, rng: Rng): InkCtx =>
    new InkCtx({
      sink,
      frame,
      style,
      rng,
      light: face.light,
      warp,
      layer,
      z: frame.depth,
      detail,
      inkIndex: face.colorIdx.ink,
    });

  // --- Head contour -------------------------------------------------------
  const silRng = bakeRng.fork('silhouette');
  const silInk = makeInk(rootFrame, L.SILHOUETTE, silRng);
  silInk.path(sil, 'outline', { closed: true, color: inkColor });

  // --- Features -----------------------------------------------------------
  for (const slot of DRAW_ORDER) {
    const state = face.slots[slot];
    if (!state) continue;
    const variant = getVariant(slot, state.variant);
    if (!variant) continue;

    const anchors = SLOT_ANCHORS[slot];
    for (let i = 0; i < anchors.length; i++) {
      const name = anchors[i];
      const frame =
        variant.conform !== undefined ? frameAt(name, { conform: variant.conform }) : (frames[name] as Frame);
      if (frame.facing <= CULL) continue;

      // Anything whose anchor has swung behind the head goes under the fill.
      let layer = variant.layer;
      if (layer === L.FACE && frame.depth < 0) layer = L.BACK;

      const rng = bakeRng.fork(slot, i);
      variant.draw(makeInk(frame, layer, rng), state.p, rng, env);
    }
  }

  // --- Second contour pass ------------------------------------------------
  // Redrawing part of the outline OVER the features makes the contours
  // interlock with them. Without it the drawing reads as a clean stack of
  // shapes, which is the fastest way to look pasted together.
  const passInk = makeInk(rootFrame, L.SILHOUETTE_2, bakeRng.fork('silhouette2'));
  const arcs = silRng.int(2, 4);
  for (let i = 0; i < arcs; i++) {
    const from = silRng.float(0, 1);
    const span = silRng.float(0.08, 0.2);
    passInk.path(subArc(sil, from, from + span), 'outline', {
      color: inkColor,
      passes: 1,
      alpha: 0.75,
      gapChance: 0.25,
    });
  }

  // --- Paper fibres -------------------------------------------------------
  const paperSink = new DrawSink().at(L.GRAIN, 0);
  const fibreRng = makeRng(face.textureSeed, '/fibres');
  const fibres = detail < 0.7 ? Math.round(style.paper.fibres * 0.25) : style.paper.fibres;
  for (let i = 0; i < fibres; i++) {
    const x = fibreRng.float(0, FACE_BOX);
    const y = fibreRng.float(0, FACE_BOX);
    const a = fibreRng.float(0, Math.PI * 2);
    const l = fibreRng.float(4, 26);
    paperSink.strokePath(
      [
        [x, y],
        [x + Math.cos(a) * l, y + Math.sin(a) * l],
      ],
      fibreRng.float(0.5, 1.4),
      inkColor,
      fibreRng.float(0.02, 0.07)
    );
  }

  // --- Colour plates ------------------------------------------------------
  const plates: Plate[] = [];
  if (style.wash.enabled && face.patches.length > 0) {
    const groups = new Map<number, typeof face.patches>();
    for (const patch of face.patches) {
      const list = groups.get(patch.plate) ?? [];
      list.push(patch);
      groups.set(patch.plate, list);
    }

    for (const [idx, group] of Array.from(groups.entries()).sort((a, b) => a[0] - b[0])) {
      const prng = bakeRng.fork('plate', idx);
      const first = group[0];
      const source =
        first.kind === 'skin'
          ? style.palette.skins
          : first.kind === 'hair'
            ? style.palette.hairs
            : style.palette.accents;
      const color = pickColor(source, first.colorIdx);

      const psink = new DrawSink().at(L.WASH, idx);
      for (const patch of group) {
        const poly = projectRing(view, patch.ring, patch.expand);
        if (poly.length < 4) continue;
        inkFill(psink, poly, { ...style.roles.feature, color }, prng, {
          ragged: style.wash.edgeRagged,
          // Ink that didn't take, inside the patch.
          holes: prng.bool(style.wash.dryPatches) ? prng.int(1, 3) : 0,
          color,
          alpha: 1,
        });
      }

      // Rigid misregistration: the WHOLE plate shifts, plus a fraction of a
      // degree of rotation. Offsetting each patch separately would tear at the
      // overlaps and read as noise rather than as a press out of register.
      const a = prng.float(0, Math.PI * 2);
      const amp = style.wash.offset * prng.float(0.45, 1.55);
      plates.push({
        color,
        dx: Math.cos(a) * amp,
        dy: Math.sin(a) * amp,
        rot: prng.gaussian(0, style.wash.rotate),
        ops: psink.sorted(),
      });
    }
  }

  const ops: DrawOp[] = sink.sorted();
  const [x0, y0, x1, y1] = boundsOf(sil);

  return {
    v: 1,
    box: FACE_BOX,
    ops,
    plates,
    paperOps: paperSink.sorted(),
    paper: {
      color: style.palette.paper,
      grain: style.paper.grain,
      grainScale: style.paper.grainScale,
      blotches: style.paper.blotches,
      vignette: style.paper.vignette,
      seed: face.textureSeed,
    },
    wash: { alpha: style.wash.alpha, blend: style.wash.blend },
    bounds: [x0, y0, x1, y1],
  };
}
