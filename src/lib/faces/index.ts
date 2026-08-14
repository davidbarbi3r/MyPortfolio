// Procedural hand-drawn face generator.
//
// Public surface. The system splits GENERATION from RENDERING:
//
//   generateFace(seed)  -> FaceParams   plain JSON, no pose, no style, no colour
//   bakeFace(params)    -> FaceDrawList geometry in a canonical 1000-unit box
//   paintFace(canvas)   -> pixels
//
// The split is the point. The same face re-renders at any angle, size, style
// or palette; a face travels as a seed string; pose can change every frame
// without regenerating anatomy; and FaceParams can be diffed as a regression
// check without a test runner.

import type { FaceDrawList, FaceParams, Pose, ResolvedStyle } from './types';
import { generateFace, type GenerateOptions } from './generate';
import { bakeFace, type BakeOptions } from './pipeline/bake';
import { paintFace, type PaintOptions } from './pipeline/paint';

export { generateFace, bakeFace, paintFace };
export type { GenerateOptions, BakeOptions, PaintOptions };

export { FaceCanvas, type FaceCanvasOptions } from './pipeline/face-canvas';
export { defaultPose, makeHeadView, HEAD_FIT } from './head/pose';
export { ARCHETYPES, archetypeWeights, archetypeMeans } from './head/archetypes';
export { HAIRLINE_PROFILES, hairlineWeights, hairlineProfile } from './features/hairline';
export { resolveStyle, blendStyles, listStyles, presets, palettes, paletteOf } from './style/resolve';
export { makeRng, hash32 } from './rng';
export { registerAllFeatures, slotVariants, allSlots, SLOT_ANCHORS } from './features';
export { FACE_BOX, L } from './types';

export type {
  FaceParams,
  FaceDrawList,
  Pose,
  ResolvedStyle,
  Palette,
  SlotName,
  AnchorName,
  HeadShape,
  StrokeSpec,
  FaceStyle,
  StylePreset,
  FeatureGroup,
} from './types';

/** Generate nothing, bake and paint in one call. Returns the draw list so a
 *  caller can cache it and repaint at another size without re-baking. */
export function renderFace(
  canvas: HTMLCanvasElement,
  face: FaceParams,
  opts: BakeOptions & PaintOptions
): FaceDrawList {
  const list = bakeFace(face, opts);
  paintFace(canvas, list, opts);
  return list;
}

export interface ExportOptions {
  size?: number;
  pose?: Pose;
  style?: string | ResolvedStyle;
  palette?: string;
  type?: string;
  quality?: number;
}

/** High-resolution PNG of a single face. Re-baked at full detail — the export
 *  should not inherit a contact sheet's reduced LOD. */
export function exportFacePng(face: FaceParams, opts: ExportOptions = {}): Promise<Blob> {
  const size = opts.size ?? 2000;
  const canvas = document.createElement('canvas');
  const list = bakeFace(face, { pose: opts.pose, style: opts.style, palette: opts.palette, detail: 1 });
  paintFace(canvas, list, { width: size, height: size, maxDpr: 1 });
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), opts.type ?? 'image/png', opts.quality);
  });
}

export interface SheetExportOptions extends ExportOptions {
  seeds: string[];
  columns?: number;
  cell?: number;
  gap?: number;
}

/** Compose a contact sheet into one PNG, like the reference plates. */
export function exportSheetPng(opts: SheetExportOptions): Promise<Blob> {
  const { seeds } = opts;
  const columns = opts.columns ?? 6;
  const cell = opts.cell ?? 400;
  const gap = opts.gap ?? 0;
  const rows = Math.ceil(seeds.length / columns);

  const sheet = document.createElement('canvas');
  sheet.width = columns * cell + gap * (columns + 1);
  sheet.height = rows * cell + gap * (rows + 1);
  const ctx = sheet.getContext('2d');
  if (!ctx) return Promise.reject(new Error('no 2d context'));

  const scratch = document.createElement('canvas');

  seeds.forEach((seed, i) => {
    const face = generateFace(seed, { style: opts.style });
    const list = bakeFace(face, { pose: opts.pose, style: opts.style, palette: opts.palette, detail: 1 });
    // First cell paints the paper across the whole sheet, so the background is
    // one continuous sheet rather than a grid of tiles.
    if (i === 0) {
      ctx.fillStyle = list.paper.color;
      ctx.fillRect(0, 0, sheet.width, sheet.height);
    }
    paintFace(scratch, list, { width: cell, height: cell, maxDpr: 1, background: false });
    const col = i % columns;
    const row = Math.floor(i / columns);
    ctx.drawImage(scratch, gap + col * (cell + gap), gap + row * (cell + gap));
  });

  return new Promise((resolve, reject) => {
    sheet.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), opts.type ?? 'image/png', opts.quality);
  });
}

/** Deterministic seed for cell `i` of a sheet. Growing `count` never disturbs
 *  the faces already on the page. */
export const sheetSeed = (base: string, i: number): string => `${base}-${i}`;

export { generateFace as default };
