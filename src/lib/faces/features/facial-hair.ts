import type { Pt } from '../types';
import { L } from '../types';
import { defineSlot } from './registry';
import { lp } from './util';

// Beards, like hair, are built from the head surface rather than a flat frame:
// a beard is the scalp problem upside down. Moustaches are small enough to live
// in the mouth frame.

export function registerFacialHair(): void {
  defineSlot('facialHair', {
    none: {
      weight: 5,
      layer: L.FACE_DETAIL,
      roll: () => ({}),
      draw: () => {},
    },

    moustache: {
      weight: 2,
      layer: L.FACE_DETAIL,
      conform: 1,
      tags: ['age'],
      roll: (rng) => ({
        width: rng.float(0.7, 1.35),
        droop: rng.float(0.1, 0.7),
        thick: rng.float(0.2, 0.5),
        split: rng.bool(0.5) ? 1 : 0,
      }),
      draw: (ink, p, rng) => {
        const w = p.width as number;
        const d = p.droop as number;
        const t = p.thick as number;
        const shape: Array<[number, number]> = [
          [-w, -0.55 + d * 0.5],
          [-w * 0.4, -0.85],
          [0, -0.7 - (p.split ? 0.18 : 0)],
          [w * 0.4, -0.85],
          [w, -0.6 + d * 0.55],
          [w * 0.75, -0.6 + d * 0.55 + t],
          [0, -0.55 + t * 1.2],
          [-w * 0.75, -0.55 + d * 0.5 + t],
        ];
        ink.fill(lp(ink, shape), { ragged: 1, bleed: 0.2, strays: rng.int(3, 9), color: ink.style.palette.hairs[0] });
      },
    },

    stubble: {
      weight: 2,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ density: rng.float(0.4, 1.0), reach: rng.float(-0.95, -0.6) }),
      draw: (ink, p, rng, env) => {
        const region = env.outline({ phiMin: -Math.PI / 2, phiMax: p.reach as number });
        if (region.length < 6) return;
        ink.stipple(region, {
          density: (p.density as number) * 1.5,
          radius: 1.8,
          alpha: 0.55,
          color: ink.style.palette.hairs[0],
        });
        void rng;
      },
    },

    goatee: {
      weight: 1.5,
      layer: L.FACE_DETAIL,
      conform: 1,
      roll: (rng) => ({ width: rng.float(0.35, 0.7), length: rng.float(0.9, 2.0), moustache: rng.bool(0.6) ? 1 : 0 }),
      draw: (ink, p, rng) => {
        const w = p.width as number;
        const l = p.length as number;
        ink.fill(
          lp(ink, [
            [-w, 0.85],
            [w, 0.85],
            [w * 0.8, 0.85 + l * 0.6],
            [0, 0.85 + l],
            [-w * 0.8, 0.85 + l * 0.55],
          ]),
          { ragged: 1, bleed: 0.2, strays: rng.int(2, 7), color: ink.style.palette.hairs[0] }
        );
        if (p.moustache) {
          ink.fill(
            lp(ink, [
              [-w * 1.6, -0.5],
              [0, -0.78],
              [w * 1.6, -0.52],
              [w * 1.2, -0.28],
              [0, -0.45],
              [-w * 1.2, -0.26],
            ]),
            { ragged: 1, strays: rng.int(1, 5), color: ink.style.palette.hairs[0] }
          );
        }
      },
    },

    fullBeard: {
      weight: 1.5,
      layer: L.FACE_DETAIL,
      tags: ['age'],
      roll: (rng) => ({
        reach: rng.float(-0.85, -0.5),
        volume: rng.float(0.02, 0.09),
        scribble: rng.bool(0.45) ? 1 : 0,
        strays: rng.int(4, 14),
      }),
      draw: (ink, p, rng, env) => {
        // The beard is the scalp cap inverted: everything below a latitude.
        const region = env.outline({
          phiMin: -Math.PI / 2,
          phiMax: p.reach as number,
          expand: p.volume as number,
        });
        if (region.length < 6) return;

        if (p.scribble) {
          ink.poly(region, 'feature', { smooth: 0.5, gapChance: 0.3, alpha: 0.8 });
          ink.hatch(region, {
            angle: 1.25,
            spacing: ink.style.texture.hatchSpacing * 1.15,
            jitter: 0.6,
            cross: rng.bool(0.5),
            alpha: 0.8,
            role: 'feature',
          });
        } else {
          ink.fill(region, {
            ragged: 1,
            bleed: 0.16,
            holes: rng.int(1, 3),
            strays: p.strays as number,
            color: ink.style.palette.hairs[0],
          });
        }
      },
    },

    chinStrap: {
      weight: 1,
      layer: L.FACE_DETAIL,
      roll: (rng) => ({ reach: rng.float(-0.75, -0.45), thick: rng.float(0.06, 0.16) }),
      draw: (ink, p, rng, env) => {
        const outer = env.outline({ phiMin: -Math.PI / 2, phiMax: p.reach as number, expand: 0.02 });
        const inner = env.outline({
          phiMin: -Math.PI / 2,
          phiMax: (p.reach as number) - (p.thick as number) * 2.2,
        });
        if (outer.length < 6) return;
        ink.fill(outer, { ragged: 1, strays: rng.int(2, 6), color: ink.style.palette.hairs[0] });
        if (inner.length > 6) ink.erase(inner as Pt[]);
      },
    },
  });
}
