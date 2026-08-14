import type { DrawOp, Pt } from '../types';
import { L } from '../types';
import { pack } from '../math/geom2';

/**
 * The stroke engine never touches a CanvasRenderingContext2D. It writes flat
 * geometry into a DrawList in canonical 1000x1000 face space.
 *
 * Consequences, all of them wanted:
 *  - render size and devicePixelRatio never touch geometry, so a 120px contact
 *    sheet cell and a 4000px PNG export are literally the same drawing;
 *  - only seed, pose and style invalidate a bake;
 *  - the list is trivially serialisable (SVG export) and bakeable in a worker.
 */
export class DrawSink {
  ops: DrawOp[] = [];
  layer: number = L.FACE;
  z = 0;

  at(layer: number, z = 0): this {
    this.layer = layer;
    this.z = z;
    return this;
  }

  fillPolygon(pts: Pt[], color: string, alpha: number): void {
    if (pts.length < 3 || alpha <= 0.002) return;
    this.ops.push({ k: 'poly', layer: this.layer, z: this.z, pts: pack(pts), color, alpha });
  }

  strokePath(pts: Pt[], w: number, color: string, alpha: number): void {
    if (pts.length < 2 || alpha <= 0.002 || w <= 0) return;
    this.ops.push({ k: 'line', layer: this.layer, z: this.z, pts: pack(pts), w, color, alpha });
  }

  dots(xy: number[], r: number[], color: string, alpha: number): void {
    if (r.length === 0 || alpha <= 0.002) return;
    this.ops.push({ k: 'dots', layer: this.layer, z: this.z, xy, r, color, alpha });
  }

  erase(pts: Pt[]): void {
    if (pts.length < 3) return;
    this.ops.push({ k: 'erase', layer: this.layer, z: this.z, pts: pack(pts) });
  }

  /** Painter order: layer dominates, depth breaks ties inside a layer. */
  sorted(): DrawOp[] {
    return this.ops.slice().sort((a, b) => a.layer - b.layer || a.z - b.z);
  }
}
