import { L } from '../types';
import { defineSlot } from './registry';
import { localBlob, lp, shadeUnder } from './util';

// The nose anchor is central (theta = 0), so `mirrored` is false and local +x
// is screen-right at a frontal pose. Most variants draw only ONE side of the
// nose, which is what a pen drawing actually does.

export function registerNose(): void {
  defineSlot('nose', {
    hook: {
      weight: 2.5,
      layer: L.FACE,
      conform: 0.85,
      roll: (rng) => ({
        side: rng.sign(),
        hookDepth: rng.float(0.25, 0.75),
        tipDrop: rng.gaussian(0.15, 0.12),
        nostrilStyle: rng.weighted({ none: 1, dot: 3, comma: 3, wing: 2 }),
        lean: rng.gaussian(0, 0.18),
      }),
      draw: (ink, p, rng) => {
        const s = p.side as number;
        const h = p.hookDepth as number;
        const drop = p.tipDrop as number;
        const lean = p.lean as number;

        const spine = lp(ink, [
          [s * 0.12 + lean, -1],
          [s * (0.05 + h * 0.25) + lean, -0.25],
          [s * (0.35 + h * 0.5) + lean, 0.35],
          [s * 0.18 + lean, 0.72 + drop],
          [-s * 0.28 + lean, 0.66 + drop],
        ]);
        ink.path(spine, 'feature', { smooth: 1, overshoot: 9, taper: 0.85, taperBias: 0.5 });

        if (p.nostrilStyle === 'comma') {
          ink.path(
            lp(ink, [
              [-s * 0.42 + lean, 0.6 + drop],
              [-s * 0.62 + lean, 0.78 + drop],
              [-s * 0.4 + lean, 0.88 + drop],
            ]),
            'detail',
            { smooth: 1, taper: 1 }
          );
        } else if (p.nostrilStyle === 'dot') {
          ink.fill(localBlob(ink, -s * 0.5 + lean, 0.75 + drop, 0.11, rng, 5, 0.4), { ragged: 0.8 });
          ink.fill(localBlob(ink, s * 0.42 + lean, 0.78 + drop, 0.09, rng, 5, 0.4), { ragged: 0.8 });
        } else if (p.nostrilStyle === 'wing') {
          ink.path(
            lp(ink, [
              [s * 0.2 + lean, 0.72 + drop],
              [s * 0.55 + lean, 0.9 + drop],
              [s * 0.25 + lean, 1.02 + drop],
            ]),
            'detail',
            { smooth: 1 }
          );
        }

        shadeUnder(
          ink,
          lp(ink, [
            [-s * 0.4 + lean, 0.75 + drop],
            [s * 0.35 + lean, 0.8 + drop],
            [s * 0.1 + lean, 1.15 + drop],
            [-s * 0.3 + lean, 1.05 + drop],
          ]),
          0.6
        );
      },
    },

    buttonDot: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.8,
      roll: (rng) => ({ r: rng.float(0.14, 0.28), drop: rng.float(0.2, 0.6), pair: rng.bool(0.5) ? 1 : 0 }),
      draw: (ink, p, rng) => {
        const r = p.r as number;
        const d = p.drop as number;
        if (p.pair) {
          ink.fill(localBlob(ink, -0.22, d, r, rng, 5, 0.35), { ragged: 0.8 });
          ink.fill(localBlob(ink, 0.24, d + 0.04, r * 0.9, rng, 5, 0.35), { ragged: 0.8 });
        } else {
          ink.fill(localBlob(ink, 0, d, r * 1.2, rng, 6, 0.32), { ragged: 0.8, bleed: 0.3 });
        }
      },
    },

    longStraight: {
      weight: 2,
      layer: L.FACE,
      conform: 0.85,
      roll: (rng) => ({
        side: rng.sign(),
        length: rng.float(0.8, 1.5),
        lean: rng.gaussian(0, 0.2),
        bulb: rng.float(0.1, 0.35),
      }),
      draw: (ink, p) => {
        const s = p.side as number;
        const len = p.length as number;
        const lean = p.lean as number;
        const b = p.bulb as number;
        ink.path(
          lp(ink, [
            [s * 0.1 + lean, -1],
            [s * 0.06 + lean, len * 0.3],
            [s * (0.06 + b) + lean, len * 0.75],
            [lean - s * b * 0.7, len * 0.85],
          ]),
          'feature',
          { smooth: 1, overshoot: 8, taperBias: 0.4 }
        );
        ink.path(
          lp(ink, [
            [lean - s * 0.34, len * 0.72],
            [lean - s * 0.46, len * 0.9],
          ]),
          'detail',
          { taper: 1, passes: 1 }
        );
      },
    },

    wideFlat: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.85,
      roll: (rng) => ({ width: rng.float(0.5, 0.95), drop: rng.float(0.4, 0.8), nostrils: rng.bool(0.8) ? 1 : 0 }),
      draw: (ink, p, rng) => {
        const w = p.width as number;
        const d = p.drop as number;
        ink.path(
          lp(ink, [
            [-w, d - 0.3],
            [-w * 0.7, d + 0.2],
            [0, d + 0.34],
            [w * 0.7, d + 0.18],
            [w, d - 0.34],
          ]),
          'feature',
          { smooth: 1, overshoot: 6 }
        );
        if (p.nostrils) {
          ink.fill(localBlob(ink, -w * 0.55, d + 0.1, 0.1, rng, 5, 0.4), { ragged: 0.8 });
          ink.fill(localBlob(ink, w * 0.55, d + 0.08, 0.1, rng, 5, 0.4), { ragged: 0.8 });
        }
      },
    },

    // At strong yaw the silhouette algorithm cannot represent a nose in profile
    // (see head/silhouette.ts). This variant is drawn to cross the contour
    // deliberately — a stroke that stays politely inside its outline is exactly
    // what makes a face look pasted together.
    profileBeak: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.9,
      roll: (rng) => ({
        side: rng.sign(),
        jut: rng.float(0.6, 1.35),
        hook: rng.float(-0.2, 0.6),
        drop: rng.float(0.1, 0.4),
      }),
      draw: (ink, p) => {
        const s = p.side as number;
        const j = p.jut as number;
        const h = p.hook as number;
        const d = p.drop as number;
        ink.path(
          lp(ink, [
            [s * 0.15, -1.1],
            [s * (0.3 + j * 0.35), -0.1],
            [s * (0.35 + j * 0.7), 0.45 + d],
            [s * (0.1 + h * 0.4), 0.85 + d],
            [-s * 0.35, 0.7 + d],
          ]),
          'feature',
          { smooth: 1, overshoot: 11, taperBias: 0.3 }
        );
      },
    },
  });
}
