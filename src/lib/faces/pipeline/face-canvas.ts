import type { FaceDrawList, FaceParams, Pose, ResolvedStyle } from '../types';
import { generateFace } from '../generate';
import { bakeFace } from './bake';
import { paintFace } from './paint';
import { defaultPose } from '../head/pose';

export interface FaceCanvasOptions {
  seed: string;
  style?: string | ResolvedStyle;
  palette?: string;
  size?: number;
  pose?: Partial<Pose>;
  maxDpr?: number;
  /** Explicit LOD; otherwise derived from `size`. */
  detail?: number;
}

/**
 * Drives one canvas: keeps the generated face, re-bakes only when seed, pose or
 * style actually change, and coalesces repaints into a single animation frame.
 *
 * The split matters most for the live pose: generation runs once, and following
 * the cursor is a re-bake of geometry plus a repaint — never a regeneration of
 * the anatomy.
 */
export class FaceCanvas {
  readonly canvas: HTMLCanvasElement;

  private opts: Required<Pick<FaceCanvasOptions, 'seed' | 'size' | 'maxDpr'>> & FaceCanvasOptions;
  private pose: Pose;
  private face: FaceParams;
  private list: FaceDrawList | null = null;

  private dirtyFace = false;
  private dirtyBake = true;
  private frame = 0;
  private boilTimer = 0;
  private tick = 0;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, opts: FaceCanvasOptions) {
    this.canvas = canvas;
    this.opts = { size: 260, maxDpr: 2, ...opts };
    this.pose = { ...defaultPose(), ...opts.pose };
    this.face = generateFace(this.opts.seed, { style: this.opts.style });
  }

  get drawList(): FaceDrawList | null {
    return this.list;
  }

  get params(): FaceParams {
    return this.face;
  }

  get currentPose(): Pose {
    return { ...this.pose };
  }

  /** LOD from render size: below ~200px extra passes cannot be resolved. */
  private detail(): number {
    if (this.opts.detail !== undefined) return this.opts.detail;
    return Math.max(0.45, Math.min(1, this.opts.size / 260));
  }

  setSeed(seed: string): this {
    if (seed === this.opts.seed) return this;
    this.opts.seed = seed;
    this.dirtyFace = true;
    return this.invalidate();
  }

  setStyle(style: string | ResolvedStyle): this {
    this.opts.style = style;
    // The style feeds variant weights, so the face itself must be re-rolled.
    this.dirtyFace = true;
    return this.invalidate();
  }

  setPalette(palette: string | undefined): this {
    this.opts.palette = palette;
    return this.invalidate();
  }

  setSize(size: number): this {
    if (size === this.opts.size) return this;
    this.opts.size = size;
    return this.invalidate();
  }

  setPose(pose: Partial<Pose>): this {
    const next = { ...this.pose, ...pose };
    if (
      next.yaw === this.pose.yaw &&
      next.pitch === this.pose.pitch &&
      next.roll === this.pose.roll &&
      next.camera === this.pose.camera
    ) {
      return this;
    }
    this.pose = next;
    return this.invalidate();
  }

  private invalidate(): this {
    this.dirtyBake = true;
    return this.schedule();
  }

  /** Coalesce every change made this turn into one frame of work. */
  schedule(): this {
    if (this.destroyed || this.frame) return this;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.render();
    });
    return this;
  }

  render(): void {
    if (this.destroyed) return;
    if (this.dirtyFace) {
      this.face = generateFace(this.opts.seed, { style: this.opts.style });
      this.dirtyFace = false;
      this.dirtyBake = true;
    }
    if (this.dirtyBake || !this.list) {
      this.list = bakeFace(this.face, {
        pose: this.pose,
        style: this.opts.style,
        palette: this.opts.palette,
        detail: this.detail(),
        tick: this.tick,
      });
      this.dirtyBake = false;
    }
    paintFace(this.canvas, this.list, {
      width: this.opts.size,
      height: this.opts.size,
      maxDpr: this.opts.maxDpr,
    });
  }

  /**
   * Traditional-animation boil. Deliberately slow: hand-drawn animation boils
   * at 8-12 frames per second, and that is exactly what makes it read as drawn
   * rather than as a glitch.
   */
  startBoil(fps = 8): this {
    this.stopBoil();
    this.boilTimer = window.setInterval(() => {
      this.tick++;
      this.dirtyBake = true;
      this.schedule();
    }, 1000 / fps);
    return this;
  }

  stopBoil(): this {
    if (this.boilTimer) window.clearInterval(this.boilTimer);
    this.boilTimer = 0;
    return this;
  }

  destroy(): void {
    this.destroyed = true;
    this.stopBoil();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}
