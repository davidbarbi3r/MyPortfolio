import type { Pt } from '../types';
import { L } from '../types';
import { defineSlot } from './registry';
import { projectRing } from '../head/frame';
import { latitudeRing } from '../head/silhouette';

// Wrinkles are drawn once for the whole face rather than per side: they need
// several anchors at once, which is what FeatureEnv.frames / frameAt exist for.
// Forehead lines are latitude arcs on the head surface, so they curve with the
// skull instead of lying flat across it.

export function registerWrinkles(): void {
  defineSlot('wrinkles', {
    none: {
      weight: 5,
      layer: L.FACE_DETAIL,
      roll: () => ({}),
      draw: () => {},
    },

    forehead: {
      weight: 2,
      layer: L.FACE_DETAIL,
      tags: ['age'],
      roll: (rng) => ({
        lines: rng.int(2, 5),
        low: rng.float(0.4, 0.56),
        gap: rng.float(0.05, 0.1),
        span: rng.float(0.5, 0.85),
      }),
      draw: (ink, p, rng, env) => {
        const n = p.lines as number;
        const span = p.span as number;
        for (let i = 0; i < n; i++) {
          const phi = (p.low as number) + i * (p.gap as number);
          const arc = projectRing(env.view, latitudeRing(phi, 22, -span, span), 0.005);
          // Drop the segments that have curved round the far side of the head.
          const visible = arc.filter((_, k) => {
            const t = -span + ((2 * span) / 22) * k;
            return Math.cos(t - env.view.pose.yaw) > 0.12;
          });
          if (visible.length < 3) continue;
          ink.path(visible, 'detail', { smooth: 0.6, passes: 1, alpha: 0.55, gapChance: 0.2, bow: 0 });
        }
        void rng;
      },
    },

    crowsFeet: {
      weight: 1.8,
      layer: L.FACE_DETAIL,
      tags: ['age'],
      roll: (rng) => ({ count: rng.int(2, 4), len: rng.float(0.3, 0.7), spread: rng.float(0.3, 0.8) }),
      draw: (ink, p, rng, env) => {
        const n = p.count as number;
        const len = p.len as number;
        for (const name of ['eyeL', 'eyeR'] as const) {
          const sub = ink.sub(env.frameAt(name));
          if (sub.frame.visibility < 0.15) continue;
          for (let i = 0; i < n; i++) {
            const a = -(p.spread as number) + (i / Math.max(1, n - 1)) * (p.spread as number) * 2;
            ink.path([sub.p(1.05, a * 0.5), sub.p(1.05 + len, a * (0.9 + len * 0.4))], 'detail', {
              passes: 1,
              alpha: 0.5,
              taper: 0.9,
              overshoot: 2,
            });
          }
        }
        void rng;
      },
    },

    nasolabial: {
      weight: 1.5,
      layer: L.FACE_DETAIL,
      tags: ['age'],
      roll: (rng) => ({ depth: rng.float(0.3, 0.8), both: rng.bool(0.45) ? 1 : 0, side: rng.sign() }),
      draw: (ink, p, _rng, env) => {
        const nose = env.frameAt('noseTip');
        const mouth = env.frameAt('mouth');
        const noseCtx = ink.sub(nose);
        const mouthCtx = ink.sub(mouth);
        const d = p.depth as number;

        const sides: number[] = p.both ? [-1, 1] : [p.side as number];
        for (const s of sides) {
          const a: Pt = noseCtx.p(s * 0.55, 0.85);
          const b: Pt = mouthCtx.p(s * 1.0, 0.5);
          const mid: Pt = [(a[0] + b[0]) / 2 + s * 14 * d, (a[1] + b[1]) / 2];
          ink.path([a, mid, b], 'detail', { smooth: 1, passes: 1, alpha: 0.45 + d * 0.2, taper: 1, overshoot: 3 });
        }
      },
    },

    heavyLines: {
      weight: 0.8,
      layer: L.FACE_DETAIL,
      tags: ['age'],
      roll: (rng) => ({
        lines: rng.int(3, 6),
        low: rng.float(0.38, 0.5),
        gap: rng.float(0.06, 0.11),
        crows: rng.int(2, 4),
      }),
      draw: (ink, p, rng, env) => {
        // Forehead plus crow's feet plus a neck line — the full weathered set.
        const n = p.lines as number;
        for (let i = 0; i < n; i++) {
          const phi = (p.low as number) + i * (p.gap as number);
          const arc = projectRing(env.view, latitudeRing(phi, 20, -0.75, 0.75), 0.005);
          const visible = arc.filter((_, k) => Math.cos(-0.75 + (1.5 / 20) * k - env.view.pose.yaw) > 0.12);
          if (visible.length < 3) continue;
          ink.path(visible, 'detail', { smooth: 0.6, passes: 1, alpha: 0.6, gapChance: 0.18, bow: 0 });
        }
        for (const name of ['eyeL', 'eyeR'] as const) {
          const sub = ink.sub(env.frameAt(name));
          if (sub.frame.visibility < 0.15) continue;
          for (let i = 0; i < (p.crows as number); i++) {
            const a = -0.5 + (i / Math.max(1, (p.crows as number) - 1)) * 1;
            ink.path([sub.p(1.05, a * 0.5), sub.p(1.6, a)], 'detail', { passes: 1, alpha: 0.5, taper: 0.9 });
          }
        }
        void rng;
      },
    },
  });
}
