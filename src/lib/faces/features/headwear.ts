import type { Pt } from '../types';
import { L } from '../types';
import { defineSlot } from './registry';
import { centroid } from '../math/geom2';

// Headwear is built from the skull like hair. The band variant in particular
// is just two caps at different latitudes: fill the lower one, punch out the
// upper one. It is all over the reference sheets.

export function registerHeadwear(): void {
  defineSlot('headwear', {
    none: {
      weight: 6.5,
      layer: L.ACCESSORY,
      roll: () => ({}),
      draw: () => {},
    },

    headband: {
      weight: 1.8,
      layer: L.ACCESSORY,
      roll: (rng) => ({ low: rng.float(0.46, 0.7), thick: rng.float(0.1, 0.2), solid: rng.bool(0.6) ? 1 : 0 }),
      draw: (ink, p, rng, env) => {
        const low = p.low as number;
        const high = low + (p.thick as number);
        const outer = env.cap(() => low, 0.02);
        const inner = env.cap(() => high, 0.02);
        if (outer.length < 6) return;

        if (p.solid) {
          ink.fill(outer, { ragged: 0.85, bleed: 0.1, color: ink.style.palette.accents[0] });
          if (inner.length > 6) ink.erase(inner);
        } else {
          ink.poly(outer, 'feature', { smooth: 0.4 });
          if (inner.length > 6) ink.poly(inner, 'feature', { smooth: 0.4 });
          ink.hatch(outer, { angle: 0.15, spacing: ink.style.texture.hatchSpacing * 1.1, jitter: 0.3, alpha: 0.65 });
        }
        void rng;
      },
    },

    beanie: {
      weight: 1.5,
      layer: L.ACCESSORY,
      roll: (rng) => ({
        low: rng.float(0.35, 0.6),
        volume: rng.float(0.05, 0.18),
        brim: rng.float(0.08, 0.2),
        knit: rng.bool(0.6) ? 1 : 0,
      }),
      draw: (ink, p, rng, env) => {
        const low = p.low as number;
        const cap = env.cap(() => low + (p.brim as number), p.volume as number);
        const brim = env.cap(() => low, (p.volume as number) * 0.55);
        if (cap.length < 6) return;

        // Brim first so the crown overlaps it.
        if (brim.length > 6) {
          ink.poly(brim, 'feature', { smooth: 0.4 });
          ink.hatch(brim, {
            angle: 1.5,
            spacing: ink.style.texture.hatchSpacing * 0.9,
            jitter: 0.25,
            alpha: 0.6,
            warp: true,
          });
        }
        ink.poly(cap, 'outline', { smooth: 0.5, gapChance: 0.18 });
        if (p.knit) {
          ink.hatch(cap, {
            angle: 1.5,
            spacing: ink.style.texture.hatchSpacing * 1.5,
            jitter: 0.35,
            alpha: 0.45,
            warp: true,
          });
        } else {
          ink.stipple(cap, { density: 0.6, alpha: 0.3 });
        }
        void rng;
      },
    },

    cap: {
      weight: 1.2,
      layer: L.ACCESSORY,
      roll: (rng) => ({
        low: rng.float(0.4, 0.62),
        volume: rng.float(0.03, 0.12),
        peak: rng.float(0.35, 0.8),
        side: rng.sign(),
      }),
      draw: (ink, p, rng, env) => {
        const crown = env.cap(() => p.low as number, p.volume as number);
        if (crown.length < 6) return;
        ink.fill(crown, { ragged: 0.8, bleed: 0.1, holes: rng.int(0, 2), color: ink.style.palette.hairs[0] });

        // A peak jutting forward off the front of the band.
        const c = centroid(crown);
        let lowest: Pt = crown[0];
        for (const q of crown) if (q[1] > lowest[1]) lowest = q;
        const s = p.side as number;
        const len = env.view.scale * (p.peak as number);
        const peak: Pt[] = [
          [c[0] - env.view.scale * 0.36, lowest[1] - env.view.scale * 0.04],
          [c[0] - env.view.scale * 0.2 + s * len * 0.5, lowest[1] + len * 0.42],
          [c[0] + env.view.scale * 0.24 + s * len * 0.55, lowest[1] + len * 0.36],
          [c[0] + env.view.scale * 0.36, lowest[1] - env.view.scale * 0.06],
        ];
        ink.fill(peak, { ragged: 0.7, color: ink.style.palette.hairs[0] });
      },
    },

    flatCap: {
      weight: 1,
      layer: L.ACCESSORY,
      tags: ['age'],
      roll: (rng) => ({ low: rng.float(0.38, 0.58), volume: rng.float(0.08, 0.22), side: rng.sign() }),
      draw: (ink, p, _rng, env) => {
        const s = p.side as number;
        // Squashed sideways so the crown flops over one ear.
        const crown = env.cap((t) => (p.low as number) - 0.06 * Math.sin(t) * s, p.volume as number);
        if (crown.length < 6) return;
        ink.poly(crown, 'outline', { smooth: 0.5, gapChance: 0.15 });
        ink.hatch(crown, {
          angle: 0.5 + s * 0.4,
          spacing: ink.style.texture.hatchSpacing * 1.05,
          jitter: 0.3,
          alpha: 0.55,
          warp: true,
        });

        const c = centroid(crown);
        let lowest: Pt = crown[0];
        for (const q of crown) if (q[1] > lowest[1]) lowest = q;
        ink.path(
          [
            [c[0] - env.view.scale * 0.4, lowest[1] - env.view.scale * 0.02],
            [c[0], lowest[1] + env.view.scale * 0.1],
            [c[0] + env.view.scale * 0.4, lowest[1] - env.view.scale * 0.04],
          ],
          'feature',
          { smooth: 1 }
        );
      },
    },
  });
}
