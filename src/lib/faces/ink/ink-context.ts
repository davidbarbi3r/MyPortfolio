import type { Frame, HatchOpts, InkFillOpts, Pt, ResolvedStyle, StippleOpts, StrokeRole, StrokeSpec } from '../types';
import { L } from '../types';
import type { Rng } from '../rng';
import { applyFrame } from '../head/frame';
import { DrawSink } from './sink';
import { sketchPath, type PathOpts } from './shapes';
import { strokePolyline } from './stroke';
import { hatch as hatchFn } from './hatch';
import { inkFill, stipple as stippleFn } from './fill';

export interface InkOpts extends Partial<StrokeSpec>, PathOpts {}

export interface InkContext {
  readonly frame: Frame;
  readonly style: ResolvedStyle;
  readonly rng: Rng;
  /** Shared light direction for the whole face, in screen space. */
  readonly light: Pt;
  readonly detail: number;

  /** Map a point from local [-1,1] space into canonical face space. */
  p(x: number, y: number): Pt;

  /** All point-array methods below take FACE-space points, i.e. p() output. */
  path(pts: Pt[], role: StrokeRole, o?: InkOpts): void;
  poly(pts: Pt[], role: StrokeRole, o?: InkOpts): void;
  /** Local-space oval. Kept in local units because features think in them. */
  oval(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    role: StrokeRole,
    o?: InkOpts & { loop?: number; openness?: number }
  ): void;
  fill(pts: Pt[], o?: InkFillOpts): void;
  hatch(pts: Pt[], o: HatchOpts): void;
  stipple(pts: Pt[], o?: StippleOpts): void;
  erase(pts: Pt[]): void;

  ink(i?: number): string;
  layer(layer: number, z?: number): InkContext;
  sub(frame: Frame): InkContext;
  spec(role: StrokeRole, o?: Partial<StrokeSpec>): StrokeSpec;
}

export interface InkCtxInit {
  sink: DrawSink;
  frame: Frame;
  style: ResolvedStyle;
  rng: Rng;
  light: Pt;
  warp?: (p: Pt) => Pt;
  layer?: number;
  z?: number;
  detail?: number;
  inkIndex?: number;
}

export class InkCtx implements InkContext {
  readonly frame: Frame;
  readonly style: ResolvedStyle;
  readonly rng: Rng;
  readonly light: Pt;
  readonly detail: number;

  private sink: DrawSink;
  private warp?: (p: Pt) => Pt;
  private _layer: number;
  private _z: number;
  private inkIndex: number;
  private counter = 0;

  constructor(init: InkCtxInit) {
    this.sink = init.sink;
    this.frame = init.frame;
    this.style = init.style;
    this.rng = init.rng;
    this.light = init.light;
    this.warp = init.warp;
    this._layer = init.layer ?? L.FACE;
    this._z = init.z ?? init.frame.depth;
    this.detail = init.detail ?? 1;
    this.inkIndex = init.inkIndex ?? 0;
  }

  private clone(over: Partial<InkCtxInit>): InkCtx {
    return new InkCtx({
      sink: this.sink,
      frame: this.frame,
      style: this.style,
      rng: this.rng,
      light: this.light,
      warp: this.warp,
      layer: this._layer,
      z: this._z,
      detail: this.detail,
      inkIndex: this.inkIndex,
      ...over,
    });
  }

  /** A fresh noise stream per stroke — two strokes must never share an offset. */
  private strokeRng(): Rng {
    return this.rng.fork('s', this.counter++);
  }

  private target(): DrawSink {
    return this.sink.at(this._layer, this._z);
  }

  p(x: number, y: number): Pt {
    return applyFrame(this.frame, x, y);
  }

  ink(i = this.inkIndex): string {
    const inks = this.style.palette.inks;
    return inks[Math.min(inks.length - 1, Math.max(0, i))];
  }

  spec(role: StrokeRole, o?: Partial<StrokeSpec>): StrokeSpec {
    const base = this.style.roles[role];
    const s: StrokeSpec = o ? { ...base, ...o } : { ...base };
    if (!o || o.color === undefined) s.color = this.ink();

    // Limb fade: a stroke that disappears by LOSING SEARCHING PASSES reads as
    // drawn; one that disappears by fading alpha reads as a CSS transition.
    const vis = this.frame.visibility;
    if (vis < 0.999) {
      s.passes = Math.max(1, Math.round(s.passes * vis));
      s.width *= 0.6 + 0.4 * vis;
      if (vis < 0.35) s.alpha *= 0.5 + 0.5 * (vis / 0.35);
    }

    // Level of detail: below ~200px a cell cannot resolve extra passes, and 48
    // of them cannot afford to compute them either.
    if (this.detail < 0.7) {
      s.passes = Math.max(1, s.passes - 1);
      s.width *= 1.06;
    }
    return s;
  }

  path(pts: Pt[], role: StrokeRole, o?: InkOpts): void {
    if (pts.length < 2) return;
    // Split the path options off the stroke overrides so `closed`/`smooth`
    // never leak into a StrokeSpec.
    const { closed, smooth, ...strokeOver } = o ?? {};
    sketchPath(this.target(), pts, this.spec(role, strokeOver), this.strokeRng(), { closed, smooth });
  }

  poly(pts: Pt[], role: StrokeRole, o?: InkOpts): void {
    this.path(pts, role, { ...o, closed: true });
  }

  oval(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    role: StrokeRole,
    o?: InkOpts & { loop?: number; openness?: number }
  ): void {
    const rng = this.strokeRng();
    const { loop: loopOpt, openness, closed: _c, smooth: _s, ...strokeOver } = o ?? {};
    // Never ctx.ellipse(): a sketched circle overshoots past 2*PI.
    const loop = loopOpt ?? rng.float(0.06, 0.3);
    const open = openness ?? 0;
    const span = Math.PI * 2 + loop - open;
    if (span <= 0.2) return;

    const start = rng.float(0, Math.PI * 2);
    // Estimate face-space size to pick a sane segment count.
    const approx = Math.max(Math.abs(rx), Math.abs(ry)) * this.frame.scale;
    const segs = Math.max(14, Math.min(120, Math.round((span * approx) / 2.5)));
    const ca = Math.cos(rot);
    const sa = Math.sin(rot);

    const pts: Pt[] = new Array(segs + 1);
    for (let i = 0; i <= segs; i++) {
      const a = start + (span * i) / segs;
      const lx = Math.cos(a) * rx;
      const ly = Math.sin(a) * ry;
      // Build in LOCAL space, then map — so the oval inherits foreshortening.
      pts[i] = this.p(x + lx * ca - ly * sa, y + lx * sa + ly * ca);
    }
    strokePolyline(this.target(), pts, this.spec(role, strokeOver), rng);
  }

  fill(pts: Pt[], o?: InkFillOpts): void {
    const sink = this.sink.at(o?.layer ?? this._layer, this._z);
    inkFill(sink, pts, this.spec('feature'), this.strokeRng(), { color: this.ink(), ...o });
  }

  hatch(pts: Pt[], o: HatchOpts): void {
    const st = this.style.texture;
    const rng = this.strokeRng();
    const cross = o.cross ?? (this.detail >= 0.7 && rng.bool(st.crossHatchChance));
    const spec = this.spec(o.role ?? 'hatch', o.alpha !== undefined ? { alpha: o.alpha } : undefined);
    hatchFn(
      this.sink.at(this._layer, this._z),
      pts,
      spec,
      rng,
      {
        ...o,
        spacing: (o.spacing ?? st.hatchSpacing) / Math.max(0.5, this.detail),
        jitter: o.jitter ?? st.hatchJitter,
        cross,
      },
      o.warp === false ? undefined : this.warp
    );
  }

  stipple(pts: Pt[], o?: StippleOpts): void {
    if (this.detail < 0.7) return;
    stippleFn(this.sink.at(this._layer, this._z), pts, this.strokeRng(), {
      color: this.ink(),
      density: this.style.texture.stippleDensity,
      ...o,
    });
  }

  erase(pts: Pt[]): void {
    this.target().erase(pts);
  }

  layer(layer: number, z?: number): InkContext {
    return this.clone({ layer, z: z ?? this._z });
  }

  sub(frame: Frame): InkContext {
    return this.clone({ frame, z: frame.depth });
  }
}
