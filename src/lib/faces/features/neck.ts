import { L } from '../types';
import { defineSlot } from './registry';
import { lp } from './util';

// The neck anchor sits low (phi = -1.35) at a low conform, so it behaves like
// a slab hanging off the jaw rather than a decal wrapped round the chin.
// It draws BELOW the head fill so the jaw contour stays on top.

export function registerNeck(): void {
  defineSlot('neck', {
    thin: {
      weight: 2.5,
      layer: L.BACK,
      conform: 0.4,
      roll: (rng) => ({ width: rng.float(0.35, 0.6), length: rng.float(0.2, 0.5), lean: rng.gaussian(0, 0.1) }),
      draw: (ink, p) => {
        const w = p.width as number;
        const l = p.length as number;
        const k = p.lean as number;
        ink.path(
          lp(ink, [
            [-w, -0.4],
            [-w + k, l],
          ]),
          'feature',
          { overshoot: 8 }
        );
        ink.path(
          lp(ink, [
            [w, -0.4],
            [w + k, l],
          ]),
          'feature',
          { overshoot: 8 }
        );
      },
    },

    thick: {
      weight: 2,
      layer: L.BACK,
      conform: 0.4,
      roll: (rng) => ({ width: rng.float(0.6, 0.95), length: rng.float(0.18, 0.45), flare: rng.float(0, 0.25) }),
      draw: (ink, p) => {
        const w = p.width as number;
        const l = p.length as number;
        const f = p.flare as number;
        ink.path(
          lp(ink, [
            [-w, -0.4],
            [-w - f, l],
          ]),
          'feature',
          { overshoot: 8 }
        );
        ink.path(
          lp(ink, [
            [w, -0.4],
            [w + f, l],
          ]),
          'feature',
          { overshoot: 8 }
        );
      },
    },

    // Several reference faces are just a head on a stick — no neck reading at
    // all, or a single stub. Both are kept as real options.
    stub: {
      weight: 1.5,
      layer: L.BACK,
      conform: 0.4,
      roll: (rng) => ({ width: rng.float(0.3, 0.6), length: rng.float(0.15, 0.4) }),
      draw: (ink, p) => {
        const w = p.width as number;
        const l = p.length as number;
        ink.fill(
          lp(ink, [
            [-w, -0.3],
            [w, -0.3],
            [w * 0.85, l],
            [-w * 0.85, l],
          ]),
          { ragged: 0.7, bleed: 0.2 }
        );
      },
    },

    collar: {
      weight: 1.5,
      layer: L.BACK,
      conform: 0.4,
      roll: (rng) => ({ width: rng.float(0.45, 0.8), length: rng.float(0.22, 0.45), spread: rng.float(0.3, 0.7) }),
      draw: (ink, p) => {
        const w = p.width as number;
        const l = p.length as number;
        const s = p.spread as number;
        ink.path(
          lp(ink, [
            [-w, -0.4],
            [-w, l * 0.5],
          ]),
          'feature',
          { overshoot: 6 }
        );
        ink.path(
          lp(ink, [
            [w, -0.4],
            [w, l * 0.5],
          ]),
          'feature',
          { overshoot: 6 }
        );
        ink.path(
          lp(ink, [
            [-w, l * 0.35],
            [-w - s, l * 1.1],
            [-w * 0.2, l * 0.9],
          ]),
          'feature',
          { smooth: 0.6 }
        );
        ink.path(
          lp(ink, [
            [w, l * 0.35],
            [w + s, l * 1.05],
            [w * 0.2, l * 0.9],
          ]),
          'feature',
          { smooth: 0.6 }
        );
      },
    },

    none: {
      weight: 3,
      layer: L.BACK,
      roll: () => ({}),
      draw: () => {},
    },
  });
}
