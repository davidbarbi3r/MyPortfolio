import { L } from '../types';
import { defineSlot } from './registry';
import { lp } from './util';

export function registerBrows(): void {
  defineSlot('brows', {
    thinArc: {
      weight: 2.5,
      layer: L.FACE,
      conform: 0.9,
      roll: (rng) => ({ lift: rng.float(0.4, 1.5), tilt: rng.gaussian(0, 0.35), bend: rng.float(0.3, 1.1) }),
      draw: (ink, p) => {
        const l = p.lift as number;
        const t = p.tilt as number;
        const b = p.bend as number;
        ink.path(
          lp(ink, [
            [-1, -l + t],
            [-0.2, -l - b],
            [0.6, -l - b * 0.6 - t],
            [1.05, -l + 0.2 - t],
          ]),
          'feature',
          { smooth: 1, overshoot: 12, taper: 0.85 }
        );
      },
    },

    thickSlab: {
      weight: 3,
      layer: L.FACE,
      conform: 0.9,
      roll: (rng) => ({
        lift: rng.float(0.5, 1.7),
        tilt: rng.gaussian(0, 0.4),
        thick: rng.float(0.3, 0.75),
        taperOut: rng.bool(0.7) ? 1 : 0,
      }),
      draw: (ink, p, rng) => {
        const l = p.lift as number;
        const t = p.tilt as number;
        const th = p.thick as number;
        const outer = p.taperOut ? 0.25 : 0.8;
        ink.fill(
          lp(ink, [
            [-1, -l + t],
            [-0.3, -l - th * 0.6],
            [0.5, -l - th * 0.4 - t],
            [1.05, -l + 0.15 - t],
            [1.0, -l + 0.15 - t + th * outer],
            [0.45, -l - th * 0.4 - t + th],
            [-0.3, -l - th * 0.6 + th * 1.15],
            [-1, -l + t + th * 0.8],
          ]),
          { ragged: 0.9, bleed: 0.4, strays: rng.int(1, 4) }
        );
      },
    },

    bushy: {
      weight: 2.5,
      layer: L.FACE,
      conform: 0.9,
      tags: ['age'],
      roll: (rng) => ({
        lift: rng.float(0.5, 1.5),
        tilt: rng.gaussian(0, 0.3),
        hairs: rng.int(9, 18),
        spread: rng.float(0.4, 0.9),
      }),
      draw: (ink, p, rng) => {
        const l = p.lift as number;
        const t = p.tilt as number;
        const n = p.hairs as number;
        const s = p.spread as number;
        for (let i = 0; i < n; i++) {
          const u = -1 + (i / (n - 1)) * 2.05;
          const base = -l - Math.cos(u * 0.8) * 0.3 + t * u * 0.5;
          const dir = rng.float(-0.5, 0.2);
          ink.path(
            lp(ink, [
              [u, base + s * 0.45],
              [u + dir * 0.25, base - s * rng.float(0.5, 1.1)],
            ]),
            'detail',
            { taper: 1, taperBias: -0.7, passes: 1, overshoot: 2, gapChance: 0 }
          );
        }
      },
    },

    raised: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.9,
      tags: ['surprised'],
      roll: (rng) => ({ lift: rng.float(1.4, 2.6), arch: rng.float(0.5, 1.2), thin: rng.bool(0.5) ? 1 : 0 }),
      draw: (ink, p) => {
        const l = p.lift as number;
        const a = p.arch as number;
        ink.path(
          lp(ink, [
            [-0.95, -l + a * 0.5],
            [-0.1, -l - a],
            [0.8, -l + a * 0.15],
          ]),
          p.thin ? 'detail' : 'feature',
          { smooth: 1, overshoot: 10 }
        );
      },
    },

    angry: {
      weight: 1.5,
      layer: L.FACE,
      conform: 0.9,
      tags: ['angry'],
      roll: (rng) => ({ lift: rng.float(0.3, 1.0), slant: rng.float(0.5, 1.2), thick: rng.float(0.25, 0.6) }),
      draw: (ink, p, rng) => {
        const l = p.lift as number;
        const s = p.slant as number;
        const th = p.thick as number;
        // Inner end low, outer end high — the eyebrow shape that reads as a scowl.
        ink.fill(
          lp(ink, [
            [-1, -l + s],
            [0.9, -l - s * 0.5],
            [0.95, -l - s * 0.5 + th],
            [-1, -l + s + th * 1.2],
          ]),
          { ragged: 0.9, strays: rng.int(0, 3) }
        );
      },
    },

    sparse: {
      weight: 1,
      layer: L.FACE,
      conform: 0.9,
      roll: (rng) => ({ lift: rng.float(0.6, 1.4), dashes: rng.int(3, 6) }),
      draw: (ink, p, rng) => {
        const l = p.lift as number;
        const n = p.dashes as number;
        for (let i = 0; i < n; i++) {
          const u = -0.9 + (i / (n - 1)) * 1.8;
          const y = -l - Math.cos(u) * 0.22;
          ink.path(
            lp(ink, [
              [u - 0.1, y + rng.float(-0.06, 0.06)],
              [u + 0.14, y - 0.12 * rng.float(0.4, 1.4)],
            ]),
            'detail',
            { passes: 1, taper: 0.9, overshoot: 1 }
          );
        }
      },
    },
  });
}
