import { L } from '../types';
import { defineSlot } from './registry';
import { lp, shadeUnder } from './util';

export function registerMouth(): void {
  defineSlot('mouth', {
    line: {
      weight: 3,
      layer: L.FACE,
      conform: 1,
      roll: (rng) => ({
        curve: rng.gaussian(0.12, 0.28),
        skew: rng.gaussian(0, 0.22),
        width: rng.float(0.6, 1.05),
        corners: rng.bool(0.55) ? 1 : 0,
        lowerLip: rng.bool(0.45) ? rng.float(0.2, 0.5) : 0,
      }),
      draw: (ink, p) => {
        const w = p.width as number;
        const c = p.curve as number;
        const k = p.skew as number;
        const mouth = lp(ink, [
          [-w, -k],
          [-w * 0.35, c - k * 0.4],
          [w * 0.4, c * 0.8 + k * 0.4],
          [w, k * 0.6],
        ]);
        ink.path(mouth, 'feature', { smooth: 1, overshoot: 10, taperBias: 0.2 });

        if (p.corners) {
          ink.path(
            lp(ink, [
              [-w, -k],
              [-w * 1.16, -k - 0.28],
            ]),
            'detail',
            { taper: 1, passes: 1, overshoot: 0 }
          );
          ink.path(
            lp(ink, [
              [w, k * 0.6],
              [w * 1.16, k * 0.6 - 0.26],
            ]),
            'detail',
            { taper: 1, passes: 1, overshoot: 0 }
          );
        }

        if ((p.lowerLip as number) > 0) {
          const d = p.lowerLip as number;
          ink.path(
            lp(ink, [
              [-w * 0.55, c + 0.35],
              [0, c + 0.35 + d],
              [w * 0.6, c + 0.3 + d * 0.7],
            ]),
            'detail',
            { smooth: 1, alpha: 0.7, passes: 1 }
          );
        }
      },
    },

    smirk: {
      weight: 2,
      layer: L.FACE,
      conform: 1,
      roll: (rng) => ({ side: rng.sign(), lift: rng.float(0.3, 0.8), width: rng.float(0.55, 1.0) }),
      draw: (ink, p) => {
        const s = p.side as number;
        const l = p.lift as number;
        const w = p.width as number;
        ink.path(
          lp(ink, [
            [-s * w, l * 0.45],
            [0, l * 0.1],
            [s * w * 0.8, -l * 0.5],
            [s * w * 1.1, -l * 0.9],
          ]),
          'feature',
          { smooth: 1, overshoot: 11 }
        );
      },
    },

    openTeeth: {
      weight: 1.8,
      layer: L.FACE,
      conform: 1,
      tags: ['cartoon'],
      roll: (rng) => ({
        width: rng.float(0.55, 1.0),
        height: rng.float(0.35, 0.85),
        teeth: rng.int(0, 6),
        dark: rng.bool(0.55) ? 1 : 0,
      }),
      draw: (ink, p, rng) => {
        const w = p.width as number;
        const h = p.height as number;
        const ring = lp(ink, [
          [-w, -h * 0.15],
          [-w * 0.5, -h * 0.55],
          [w * 0.5, -h * 0.5],
          [w, -h * 0.05],
          [w * 0.55, h * 0.8],
          [-w * 0.5, h * 0.85],
        ]);
        if (p.dark) ink.fill(ring, { ragged: 0.8, bleed: 0.25 });
        ink.poly(ring, 'feature', { smooth: 1 });

        const n = p.teeth as number;
        for (let i = 0; i < n; i++) {
          const u = -w * 0.8 + (i / Math.max(1, n - 1)) * w * 1.6;
          ink.path(
            lp(ink, [
              [u, -h * 0.45],
              [u + rng.float(-0.04, 0.04), h * 0.2],
            ]),
            'detail',
            { passes: 1, alpha: 0.85, color: p.dark ? ink.style.palette.paper : undefined, overshoot: 1 }
          );
        }
      },
    },

    frown: {
      weight: 1.5,
      layer: L.FACE,
      conform: 1,
      tags: ['angry'],
      roll: (rng) => ({ depth: rng.float(0.3, 0.8), width: rng.float(0.5, 0.95), chinCrease: rng.bool(0.4) ? 1 : 0 }),
      draw: (ink, p) => {
        const d = p.depth as number;
        const w = p.width as number;
        ink.path(
          lp(ink, [
            [-w, -d * 0.7],
            [0, d * 0.35],
            [w, -d * 0.6],
          ]),
          'feature',
          { smooth: 1, overshoot: 10 }
        );
        if (p.chinCrease) {
          ink.path(
            lp(ink, [
              [-w * 0.35, d * 1.5],
              [w * 0.3, d * 1.45],
            ]),
            'detail',
            { passes: 1, alpha: 0.5 }
          );
        }
      },
    },

    pursed: {
      weight: 1.5,
      layer: L.FACE,
      conform: 1,
      roll: (rng) => ({ r: rng.float(0.16, 0.38), squash: rng.float(0.6, 1.2), lines: rng.int(0, 4) }),
      draw: (ink, p, rng) => {
        const r = p.r as number;
        ink.oval(0, 0, r, r * (p.squash as number), 0, 'feature', { loop: 0.25 });
        const n = p.lines as number;
        for (let i = 0; i < n; i++) {
          const a = rng.float(0, Math.PI * 2);
          ink.path(
            lp(ink, [
              [Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2],
              [Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1],
            ]),
            'detail',
            { taper: 1, passes: 1, alpha: 0.55, overshoot: 0 }
          );
        }
      },
    },

    grin: {
      weight: 2,
      layer: L.FACE,
      conform: 1,
      roll: (rng) => ({ width: rng.float(0.8, 1.25), lift: rng.float(0.3, 0.75), teeth: rng.bool(0.5) ? 1 : 0 }),
      draw: (ink, p, rng) => {
        const w = p.width as number;
        const l = p.lift as number;
        const line = lp(ink, [
          [-w, -l * 0.8],
          [-w * 0.4, l * 0.4],
          [w * 0.45, l * 0.35],
          [w, -l * 0.9],
        ]);
        ink.path(line, 'feature', { smooth: 1, overshoot: 12 });
        if (p.teeth) {
          for (let i = 0; i < 5; i++) {
            const u = -w * 0.6 + (i / 4) * w * 1.2;
            ink.path(
              lp(ink, [
                [u, -l * 0.05],
                [u + rng.float(-0.03, 0.03), l * 0.4],
              ]),
              'detail',
              {
                passes: 1,
                alpha: 0.55,
                overshoot: 0,
              }
            );
          }
        }
        shadeUnder(
          ink,
          lp(ink, [
            [-w * 0.7, l * 0.5],
            [w * 0.7, l * 0.45],
            [w * 0.4, l * 1.3],
            [-w * 0.45, l * 1.35],
          ]),
          0.4
        );
      },
    },

    tongueOut: {
      weight: 0.8,
      layer: L.FACE,
      conform: 1,
      tags: ['cartoon'],
      roll: (rng) => ({ width: rng.float(0.5, 0.85), drop: rng.float(0.5, 1.0) }),
      draw: (ink, p) => {
        const w = p.width as number;
        const d = p.drop as number;
        ink.path(
          lp(ink, [
            [-w, 0],
            [0, 0.2],
            [w, -0.05],
          ]),
          'feature',
          { smooth: 1, overshoot: 9 }
        );
        ink.poly(
          lp(ink, [
            [-w * 0.35, 0.15],
            [w * 0.3, 0.15],
            [w * 0.28, d],
            [-w * 0.3, d * 0.95],
          ]),
          'feature',
          { smooth: 1 }
        );
      },
    },
  });
}
