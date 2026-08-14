import { L } from '../types';
import { defineSlot } from './registry';
import { localBlob, lp, shadeUnder } from './util';

// Local space for every feature: +x points OUTWARD (toward the temple), +y
// points DOWN. Geometry is authored in local coordinates only — never offset
// in face space — because a mirrored frame reverses face-space normals and
// would silently flip creases and lashes on one side of the head.

export function registerEyes(): void {
  defineSlot('eyes', {
    almond: {
      weight: 3,
      layer: L.FACE,
      conform: 0.75,
      roll: (rng) => ({
        openness: Math.max(0.18, Math.min(1.4, rng.gaussian(0.62, 0.16))),
        lidHeavy: rng.float(0, 0.5),
        tilt: rng.gaussian(0, 0.14),
        innerDrop: rng.float(-0.1, 0.25),
        lashes: rng.bool(0.35) ? rng.int(2, 5) : 0,
        lowerLid: rng.bool(0.6) ? rng.float(0.2, 0.6) : 0,
      }),
      draw: (ink, p, rng) => {
        const o = p.openness as number;
        const t = p.tilt as number;

        const upper = lp(ink, [
          [-1, 0.08 + (p.innerDrop as number) * 0.3],
          [-0.55, -0.45 * o],
          [0.05, -0.62 * o + t],
          [0.62, -0.34 * o + t],
          [1, 0.12 + t],
        ]);
        ink.path(upper, 'feature', { smooth: 1, overshoot: 11, taperBias: 0.35 });

        const lower = lp(ink, [
          [-0.92, 0.1],
          [-0.2, 0.44 * o],
          [0.6, 0.3 * o],
          [0.95, 0.05],
        ]);
        ink.path(lower, 'detail', { smooth: 1, gapChance: 0.22, alpha: 0.75 });

        if ((p.lidHeavy as number) > 0.2) {
          const d = 0.22 + (p.lidHeavy as number) * 0.26;
          ink.path(
            lp(ink, [
              [-0.68, -0.34 * o - d * 0.7],
              [0, -0.62 * o - d + t],
              [0.72, -0.3 * o - d * 0.75 + t],
            ]),
            'detail',
            { smooth: 1, alpha: 0.6, passes: 1 }
          );
        }

        for (let i = 0; i < (p.lashes as number); i++) {
          const u = -0.5 + (i / Math.max(1, (p.lashes as number) - 1)) * 1.3;
          const base = -0.5 * o * Math.cos(u * 0.9) + t * (u + 1) * 0.4;
          ink.path(
            lp(ink, [
              [u, base],
              [u + 0.14, base - 0.42 * rng.float(0.7, 1.35)],
            ]),
            'detail',
            { taper: 1, taperBias: -0.9, passes: 1, overshoot: 0, gapChance: 0 }
          );
        }

        if ((p.lowerLid as number) > 0) {
          shadeUnder(
            ink,
            lp(ink, [
              [-0.8, 0.16],
              [0.2, 0.5 * o],
              [0.85, 0.34 * o],
              [0.8, 0.72],
              [-0.7, 0.5],
            ]),
            p.lowerLid as number
          );
        }
      },
    },

    round: {
      weight: 2.5,
      layer: L.FACE,
      conform: 0.75,
      roll: (rng) => ({
        r: rng.float(0.55, 0.95),
        squash: rng.float(0.78, 1.15),
        lidCut: rng.bool(0.45) ? rng.float(0.15, 0.5) : 0,
      }),
      draw: (ink, p) => {
        const r = p.r as number;
        ink.oval(0, 0, r, r * (p.squash as number), 0, 'feature', { loop: 0.2 });
        if ((p.lidCut as number) > 0) {
          const c = p.lidCut as number;
          ink.path(
            lp(ink, [
              [-r * 1.15, -r * (0.9 - c)],
              [0, -r * (1.05 - c)],
              [r * 1.15, -r * (0.85 - c)],
            ]),
            'detail',
            { smooth: 1, alpha: 0.8 }
          );
        }
      },
    },

    // The blank pinhead eye that shows up all over the reference sheets.
    dot: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.6,
      roll: (rng) => ({ r: rng.float(0.14, 0.3), drop: rng.gaussian(0, 0.12) }),
      draw: (ink, p, rng) => {
        ink.fill(localBlob(ink, 0, p.drop as number, p.r as number, rng, 5, 0.34), { ragged: 0.8, bleed: 0.3 });
      },
    },

    squint: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.8,
      roll: (rng) => ({ gap: rng.float(0.1, 0.26), tilt: rng.gaussian(0, 0.18), bag: rng.bool(0.5) ? 1 : 0 }),
      draw: (ink, p) => {
        const g = p.gap as number;
        const t = p.tilt as number;
        ink.path(
          lp(ink, [
            [-1, -g + t * -0.5],
            [0, -g * 1.5 + t],
            [1, -g * 0.6 + t * 1.4],
          ]),
          'feature',
          { smooth: 1, overshoot: 13 }
        );
        ink.path(
          lp(ink, [
            [-0.95, g * 0.9],
            [0.1, g * 1.4],
            [0.95, g * 0.7],
          ]),
          'feature',
          { smooth: 1, gapChance: 0.18 }
        );
        if (p.bag) {
          ink.path(
            lp(ink, [
              [-0.7, g * 2.4],
              [0.2, g * 3.1],
              [0.85, g * 2.2],
            ]),
            'detail',
            { smooth: 1, alpha: 0.55, passes: 1 }
          );
        }
      },
    },

    closedArc: {
      weight: 1,
      layer: L.FACE,
      conform: 0.85,
      tags: ['calm'],
      roll: (rng) => ({ depth: rng.float(0.25, 0.6), flip: rng.bool(0.3) ? 1 : 0, lashes: rng.int(0, 3) }),
      draw: (ink, p, rng) => {
        const d = (p.depth as number) * (p.flip ? -1 : 1);
        const arc = lp(ink, [
          [-1, 0],
          [0, d],
          [1, -0.05],
        ]);
        ink.path(arc, 'feature', { smooth: 1, overshoot: 14 });
        for (let i = 0; i < (p.lashes as number); i++) {
          const u = -0.4 + i * 0.45;
          ink.path(
            lp(ink, [
              [u, d * 0.85],
              [u + 0.1, d * 0.85 + 0.3 * rng.float(0.8, 1.3)],
            ]),
            'detail',
            { taper: 1, passes: 1, overshoot: 0 }
          );
        }
      },
    },

    // Deliberately oversized. Paired with a small opposite eye by the asymmetry
    // budget, this is most of what makes the reference sheets read as caricature.
    cartoonBig: {
      weight: 2,
      layer: L.FACE,
      conform: 0.65,
      tags: ['cartoon'],
      roll: (rng) => ({ r: rng.float(0.95, 1.5), squash: rng.float(0.85, 1.2), heavy: rng.bool(0.5) ? 1 : 0 }),
      draw: (ink, p) => {
        const r = p.r as number;
        ink.oval(0, 0, r, r * (p.squash as number), 0, p.heavy ? 'outline' : 'feature', { loop: 0.28 });
      },
    },

    wideStare: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.7,
      roll: (rng) => ({ r: rng.float(0.7, 1.1), lid: rng.float(0.2, 0.6) }),
      draw: (ink, p) => {
        const r = p.r as number;
        ink.oval(0, 0, r, r * 1.05, 0, 'feature', { loop: 0.22 });
        ink.path(
          lp(ink, [
            [-r * 1.3, -r * (p.lid as number)],
            [0, -r * ((p.lid as number) + 0.25)],
            [r * 1.3, -r * (p.lid as number) * 0.8],
          ]),
          'detail',
          { smooth: 1, alpha: 0.8 }
        );
      },
    },
  });
}
