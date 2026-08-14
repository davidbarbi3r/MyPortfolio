import type { Frame, Pt } from '../types';
import { L } from '../types';
import { defineSlot, type FeatureEnv } from './registry';

// Glasses are a RIGID OBJECT, not a decal, so they are drawn on eye frames
// rebuilt at a very low `conform`. At conform 1 the frame would bend around the
// cheek like a transfer; at 0.2 it stays a flat plane that yaws and rolls with
// the head, which is what a real pair does.

const LENS_CONFORM = 0.2;

const lensFrames = (env: FeatureEnv): [Frame, Frame] => [
  env.frameAt('eyeL', { conform: LENS_CONFORM }),
  env.frameAt('eyeR', { conform: LENS_CONFORM }),
];

export function registerGlasses(): void {
  defineSlot('glasses', {
    none: {
      weight: 6,
      layer: L.ACCESSORY,
      roll: () => ({}),
      draw: () => {},
    },

    round: {
      weight: 1.6,
      layer: L.ACCESSORY,
      roll: (rng) => ({ r: rng.float(0.85, 1.35), squash: rng.float(0.85, 1.1), heavy: rng.bool(0.4) ? 1 : 0 }),
      draw: (ink, p, _rng, env) => {
        const role = p.heavy ? 'outline' : 'feature';
        const r = p.r as number;
        const centres: Pt[] = [];

        for (const f of lensFrames(env)) {
          const sub = ink.sub(f);
          if (sub.frame.visibility < 0.06) continue;
          sub.oval(0, 0, r, r * (p.squash as number), 0, role, { loop: 0.18 });
          centres.push(sub.p(0, 0));
        }
        if (centres.length === 2) ink.path(centres, 'detail', { alpha: 0.85, bow: 0.05, overshoot: 0 });
      },
    },

    square: {
      weight: 1.2,
      layer: L.ACCESSORY,
      roll: (rng) => ({ w: rng.float(0.9, 1.4), h: rng.float(0.6, 1.0), heavy: rng.bool(0.6) ? 1 : 0 }),
      draw: (ink, p, _rng, env) => {
        const w = p.w as number;
        const h = p.h as number;
        const role = p.heavy ? 'outline' : 'feature';
        const centres: Pt[] = [];

        for (const f of lensFrames(env)) {
          const sub = ink.sub(f);
          if (sub.frame.visibility < 0.06) continue;
          sub.poly([sub.p(-w, -h), sub.p(w, -h * 0.9), sub.p(w * 0.95, h), sub.p(-w * 0.95, h * 0.95)], role);
          centres.push(sub.p(0, 0));
        }
        if (centres.length === 2) ink.path(centres, 'detail', { alpha: 0.85, overshoot: 0 });
      },
    },

    monocle: {
      weight: 0.7,
      layer: L.ACCESSORY,
      tags: ['cartoon'],
      roll: (rng) => ({ r: rng.float(0.95, 1.5), side: rng.sign(), cord: rng.bool(0.7) ? 1 : 0 }),
      draw: (ink, p, rng, env) => {
        const f = env.frameAt((p.side as number) < 0 ? 'eyeL' : 'eyeR', { conform: LENS_CONFORM });
        const sub = ink.sub(f);
        if (sub.frame.visibility < 0.06) return;

        const r = p.r as number;
        sub.oval(0, 0, r, r * 1.02, 0, 'outline', { loop: 0.22 });
        if (p.cord) {
          const a = sub.p(0, r);
          ink.path([a, [a[0] + rng.gaussian(0, 12), a[1] + 70], [a[0] + rng.gaussian(0, 20), a[1] + 150]], 'detail', {
            smooth: 1,
            passes: 1,
            alpha: 0.6,
            gapChance: 0.15,
          });
        }
      },
    },

    halfRim: {
      weight: 0.9,
      layer: L.ACCESSORY,
      roll: (rng) => ({ w: rng.float(0.9, 1.3), drop: rng.float(0.3, 0.7) }),
      draw: (ink, p, _rng, env) => {
        const w = p.w as number;
        const d = p.drop as number;
        const bar: Pt[] = [];

        for (const f of lensFrames(env)) {
          const sub = ink.sub(f);
          if (sub.frame.visibility < 0.06) continue;
          sub.path([sub.p(-w, -d * 0.5), sub.p(-w * 0.5, d), sub.p(w * 0.6, d * 0.85), sub.p(w, -d * 0.4)], 'feature', {
            smooth: 1,
          });
          bar.push(sub.p(-w, -d * 0.55), sub.p(w, -d * 0.45));
        }
        if (bar.length === 4) ink.path([bar[0], bar[1], bar[2], bar[3]], 'detail', { alpha: 0.85, overshoot: 4 });
      },
    },
  });
}
