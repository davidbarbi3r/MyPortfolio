import type { DrawOp, FaceDrawList } from '../types';
import { FACE_BOX } from '../types';
import { makeRng } from '../rng';

export interface PaintOptions {
  width: number;
  height: number;
  /** Capped at 2 by default: 48 cells x 3 offscreen surfaces at dpr 3 will
   *  exhaust GPU memory on a phone. Raise it for PNG export. */
  maxDpr?: number;
  /** Draw paper and grain. Off when compositing into a bigger sheet. */
  background?: boolean;
}

type AnyCanvas = HTMLCanvasElement;

function makeCanvas(w: number, h: number): AnyCanvas {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Scratch surfaces are pooled by purpose so a 48-cell sheet does not allocate
// 150 canvases. They are only ever used within one synchronous paint.
const pool = new Map<string, AnyCanvas>();

function scratch(key: string, w: number, h: number): AnyCanvas {
  const iw = Math.max(1, Math.round(w));
  const ih = Math.max(1, Math.round(h));
  let c = pool.get(key);
  if (!c || c.width !== iw || c.height !== ih) {
    c = makeCanvas(iw, ih);
    pool.set(key, c);
  } else {
    const cx = c.getContext('2d');
    if (cx) cx.clearRect(0, 0, iw, ih);
  }
  return c;
}

// One grain tile per session. Per-face variation comes from offsetting the
// pattern, not from regenerating noise — regenerating a full-canvas ImageData
// per face (as FilmGrain.astro does per frame) is unaffordable at 48 faces.
let grainTile: AnyCanvas | null = null;

function getGrainTile(): AnyCanvas {
  if (grainTile) return grainTile;
  const size = 256;
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const img = ctx.createImageData(size, size);
  const rng = makeRng('grain-tile');
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rng.next() * 2 - 1) * 127;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

function drawOps(ctx: CanvasRenderingContext2D, ops: DrawOp[]): void {
  for (const op of ops) {
    if (op.k === 'poly' || op.k === 'erase') {
      const pts = op.pts;
      if (pts.length < 6) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      if (op.k === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.globalAlpha = op.alpha;
        ctx.fillStyle = op.color;
        ctx.fill();
      }
    } else if (op.k === 'line') {
      const pts = op.pts;
      if (pts.length < 4) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.globalAlpha = op.alpha;
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else {
      ctx.globalAlpha = op.alpha;
      ctx.fillStyle = op.color;
      for (let i = 0; i < op.r.length; i++) {
        ctx.beginPath();
        ctx.arc(op.xy[i * 2], op.xy[i * 2 + 1], op.r[i], 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}

export function paintFace(canvas: HTMLCanvasElement, dl: FaceDrawList, opts: PaintOptions): void {
  const { width: w, height: h } = opts;
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, opts.maxDpr ?? 2);
  const dw = Math.round(w * dpr);
  const dh = Math.round(h * dpr);

  if (canvas.width !== dw || canvas.height !== dh) {
    canvas.width = dw;
    canvas.height = dh;
  }
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Canonical face space -> device pixels. Because the draw list is authored in
  // a fixed 1000-unit box, neither DPI nor render size ever touches geometry:
  // a 120px contact-sheet cell and a 4000px export are the same drawing.
  const k = (dpr * Math.min(w, h)) / FACE_BOX;
  const ox = (dpr * w - k * FACE_BOX) / 2;
  const oy = (dpr * h - k * FACE_BOX) / 2;
  const setBase = (): void => ctx.setTransform(k, 0, 0, k, ox, oy);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, dw, dh);

  const rng = makeRng(dl.paper.seed, '/paint');
  const background = opts.background !== false;

  if (background) {
    ctx.fillStyle = dl.paper.color;
    ctx.fillRect(0, 0, dw, dh);

    setBase();
    for (let i = 0; i < dl.paper.blotches; i++) {
      const bx = rng.float(0, FACE_BOX);
      const by = rng.float(0, FACE_BOX);
      const br = rng.float(FACE_BOX * 0.15, FACE_BOX * 0.5);
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, 'rgba(90,80,60,0.035)');
      g.addColorStop(1, 'rgba(90,80,60,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    if (dl.paperOps.length) drawOps(ctx, dl.paperOps);
  }

  // --- Ink layer, offscreen -------------------------------------------------
  // Offscreen because `erase` ops use destination-out: drawn straight onto the
  // visible canvas they would punch through the paper as well.
  const inkCanvas = scratch('ink', dw, dh);
  const ictx = inkCanvas.getContext('2d');
  if (!ictx) return;
  ictx.setTransform(k, 0, 0, k, ox, oy);
  drawOps(ictx, dl.ops);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(inkCanvas, 0, 0);

  // --- Colour plates --------------------------------------------------------
  // Each plate is composited ONCE, in multiply. Compositing patch by patch
  // would double-darken every overlap — an artefact that does not exist in
  // screenprinting, where one plate lays down one film of ink.
  if (dl.plates.length) {
    const dcx = 0.5 * FACE_BOX * k + ox;
    const dcy = 0.5 * FACE_BOX * k + oy;

    for (let i = 0; i < dl.plates.length; i++) {
      const plate = dl.plates[i];
      if (!plate.ops.length) continue;
      const pc = scratch(`plate${i}`, dw, dh);
      const pctx = pc.getContext('2d');
      if (!pctx) continue;
      pctx.setTransform(k, 0, 0, k, ox, oy);
      drawOps(pctx, plate.ops);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = dl.wash.blend;
      ctx.globalAlpha = dl.wash.alpha;
      ctx.translate(dcx + plate.dx * k, dcy + plate.dy * k);
      // A fraction of a degree is what separates a real registration error
      // from a CSS translate.
      ctx.rotate(plate.rot);
      ctx.translate(-dcx, -dcy);
      ctx.drawImage(pc, 0, 0);
      ctx.restore();
    }
  }

  // --- Grain and vignette ---------------------------------------------------
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  if (background && dl.paper.grain > 0) {
    const pattern = ctx.createPattern(getGrainTile(), 'repeat');
    if (pattern) {
      const s = dl.paper.grainScale * dpr;
      // Offset per face, or all 48 cells share one visibly aligned grain.
      if (typeof DOMMatrix !== 'undefined') {
        pattern.setTransform(new DOMMatrix().translate(rng.float(0, 256), rng.float(0, 256)).scale(s, s));
      }
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = dl.paper.grain;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, dw, dh);
      ctx.restore();
    }
  }

  if (background && dl.paper.vignette > 0) {
    const g = ctx.createRadialGradient(
      dw / 2,
      dh / 2,
      Math.min(dw, dh) * 0.32,
      dw / 2,
      dh / 2,
      Math.max(dw, dh) * 0.72
    );
    g.addColorStop(0, 'rgba(60,50,40,0)');
    g.addColorStop(1, `rgba(60,50,40,${dl.paper.vignette})`);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, dw, dh);
    ctx.restore();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
