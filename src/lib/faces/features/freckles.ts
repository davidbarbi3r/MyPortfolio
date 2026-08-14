import { L } from '../types';
import { defineSlot } from './registry';
import { localBlob } from './util';

export function registerFreckles(): void {
  defineSlot('freckles', {
    none: {
      weight: 4,
      layer: L.FACE_DETAIL,
      roll: () => ({}),
      draw: () => {},
    },

    sparse: {
      weight: 2,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ density: rng.float(0.25, 0.6), spread: rng.float(0.7, 1.2) }),
      draw: (ink, p, _rng, env) => {
        for (const name of ['cheekL', 'cheekR'] as const) {
          const sub = ink.sub(env.frameAt(name));
          if (sub.frame.visibility < 0.2) continue;
          const s = p.spread as number;
          sub.stipple([sub.p(-s, -s * 0.6), sub.p(s, -s * 0.5), sub.p(s * 0.9, s * 0.7), sub.p(-s * 0.85, s * 0.6)], {
            density: p.density as number,
            radius: 2.0,
            alpha: 0.6,
          });
        }
      },
    },

    dense: {
      weight: 1.2,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ density: rng.float(0.8, 1.6), spread: rng.float(0.9, 1.4), bridge: rng.bool(0.6) ? 1 : 0 }),
      draw: (ink, p, _rng, env) => {
        const s = p.spread as number;
        for (const name of ['cheekL', 'cheekR'] as const) {
          const sub = ink.sub(env.frameAt(name));
          if (sub.frame.visibility < 0.2) continue;
          sub.stipple([sub.p(-s, -s * 0.7), sub.p(s, -s * 0.6), sub.p(s * 0.9, s * 0.8), sub.p(-s * 0.85, s * 0.7)], {
            density: p.density as number,
            radius: 2.2,
            alpha: 0.7,
          });
        }
        if (p.bridge) {
          const sub = ink.sub(env.frameAt('noseRoot'));
          sub.stipple([sub.p(-1.4, -0.3), sub.p(1.4, -0.3), sub.p(1.3, 0.9), sub.p(-1.3, 0.9)], {
            density: (p.density as number) * 0.7,
            radius: 2,
            alpha: 0.6,
          });
        }
      },
    },

    blush: {
      weight: 1,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ size: rng.float(0.6, 1.1), lines: rng.int(3, 7) }),
      draw: (ink, p, rng, env) => {
        const size = p.size as number;
        for (const name of ['cheekL', 'cheekR'] as const) {
          const sub = ink.sub(env.frameAt(name));
          if (sub.frame.visibility < 0.2) continue;
          for (let i = 0; i < (p.lines as number); i++) {
            const y = -size * 0.3 + (i / Math.max(1, (p.lines as number) - 1)) * size * 0.6;
            sub.path([sub.p(-size * 0.6, y), sub.p(size * 0.6, y + rng.float(-0.1, 0.1))], 'detail', {
              passes: 1,
              alpha: 0.4,
              taper: 1,
              overshoot: 1,
              gapChance: 0,
            });
          }
        }
      },
    },

    mole: {
      weight: 0.8,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ side: rng.sign(), x: rng.float(-0.6, 0.6), y: rng.float(-0.5, 0.7), r: rng.float(0.05, 0.12) }),
      draw: (ink, p, rng, env) => {
        const sub = ink.sub(env.frameAt((p.side as number) < 0 ? 'cheekL' : 'cheekR'));
        if (sub.frame.visibility < 0.2) return;
        sub.fill(localBlob(sub, p.x as number, p.y as number, p.r as number, rng, 5, 0.4), { ragged: 0.7 });
      },
    },
  });
}
