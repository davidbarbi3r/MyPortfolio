import { L } from '../types';
import { defineSlot } from './registry';
import { lp } from './util';

// Ears sit at theta = +/-1.45, so they are the first thing the limb fade and
// the hard cull act on. The far ear is moved to the BACK layer by the bake
// when its depth goes negative; below a small `facing` it is dropped entirely.

export function registerEars(): void {
  defineSlot('ears', {
    simpleC: {
      weight: 3,
      layer: L.FACE,
      conform: 0.2,
      roll: (rng) => ({ size: rng.float(0.7, 1.2), stickOut: rng.float(0.15, 0.6), inner: rng.bool(0.6) ? 1 : 0 }),
      draw: (ink, p) => {
        const s = p.size as number;
        const o = p.stickOut as number;
        ink.path(
          lp(ink, [
            [-0.7, -s * 0.9],
            [0.4 + o, -s * 0.6],
            [0.55 + o, s * 0.1],
            [0.2, s * 0.85],
            [-0.7, s * 0.72],
          ]),
          'feature',
          { smooth: 1, overshoot: 7 }
        );
        if (p.inner) {
          ink.path(
            lp(ink, [
              [0.05, -s * 0.4],
              [0.25 + o * 0.4, s * 0.05],
              [0.05, s * 0.45],
            ]),
            'detail',
            { smooth: 1, alpha: 0.6, passes: 1 }
          );
        }
      },
    },

    bigFlap: {
      weight: 2,
      layer: L.FACE,
      conform: 0.2,
      tags: ['cartoon'],
      roll: (rng) => ({ size: rng.float(0.95, 1.35), stickOut: rng.float(0.3, 0.75), lobe: rng.float(0.15, 0.45) }),
      draw: (ink, p) => {
        const s = p.size as number;
        const o = p.stickOut as number;
        const l = p.lobe as number;
        ink.path(
          lp(ink, [
            [-0.7, -s * 0.85],
            [0.5 + o, -s * 0.72],
            [0.72 + o, 0],
            [0.42 + o * 0.5, s * 0.7],
            [0.12, s * (0.85 + l)],
            [-0.7, s * 0.62],
          ]),
          'feature',
          { smooth: 1, overshoot: 8 }
        );
        ink.path(
          lp(ink, [
            [0.1, -s * 0.35],
            [0.4 + o * 0.35, s * 0.02],
            [0.12, s * 0.4],
          ]),
          'detail',
          { smooth: 1, alpha: 0.55, passes: 1 }
        );
      },
    },

    pointy: {
      weight: 1,
      layer: L.FACE,
      conform: 0.2,
      roll: (rng) => ({ size: rng.float(0.8, 1.3), tip: rng.float(0.3, 0.8) }),
      draw: (ink, p) => {
        const s = p.size as number;
        const t = p.tip as number;
        ink.path(
          lp(ink, [
            [-0.7, -s * 0.7],
            [0.35, -s * (0.9 + t)],
            [0.6, -s * 0.2],
            [0.2, s * 0.75],
            [-0.7, s * 0.62],
          ]),
          'feature',
          { smooth: 0.6, overshoot: 7 }
        );
      },
    },
  });
}
