import { L } from '../types';
import { defineSlot } from './registry';
import { localBlob } from './util';

// Irises share the eye anchors. The slot is rolled once and drawn twice, so
// gaze is automatically consistent across both eyes; variants that need to
// know which side they are on read `ink.frame.mirrored`.

export function registerIrises(): void {
  defineSlot('irises', {
    dotPupil: {
      weight: 3,
      layer: L.FACE_DETAIL,
      conform: 0.7,
      roll: (rng) => ({ r: rng.float(0.16, 0.3), gazeX: rng.gaussian(0, 0.22), gazeY: rng.gaussian(0, 0.16) }),
      draw: (ink, p, rng) => {
        ink.fill(localBlob(ink, p.gazeX as number, p.gazeY as number, p.r as number, rng, 6, 0.3), {
          ragged: 0.7,
          bleed: 0.25,
        });
      },
    },

    ringIris: {
      weight: 2.5,
      layer: L.FACE_DETAIL,
      conform: 0.7,
      roll: (rng) => ({
        r: rng.float(0.3, 0.48),
        pupil: rng.float(0.32, 0.6),
        gazeX: rng.gaussian(0, 0.2),
        gazeY: rng.gaussian(0, 0.14),
      }),
      draw: (ink, p, rng) => {
        const x = p.gazeX as number;
        const y = p.gazeY as number;
        const r = p.r as number;
        ink.oval(x, y, r, r, 0, 'detail', { loop: 0.24 });
        ink.fill(localBlob(ink, x, y, r * (p.pupil as number), rng, 5, 0.3), { ragged: 0.6 });
      },
    },

    // The lopsided stare in half the reference faces: one pupil jammed into a
    // corner while the other sits centred.
    offsetPupil: {
      weight: 2,
      layer: L.FACE_DETAIL,
      conform: 0.7,
      tags: ['cartoon'],
      roll: (rng) => ({ r: rng.float(0.18, 0.32), push: rng.float(0.3, 0.62), angle: rng.float(0, Math.PI * 2) }),
      draw: (ink, p, rng) => {
        const a = p.angle as number;
        const d = p.push as number;
        ink.fill(localBlob(ink, Math.cos(a) * d, Math.sin(a) * d * 0.7, p.r as number, rng, 6, 0.3), { ragged: 0.7 });
      },
    },

    blank: {
      weight: 2,
      layer: L.FACE_DETAIL,
      roll: () => ({}),
      draw: () => {
        /* an empty eye is a legitimate choice, and common in the references */
      },
    },

    crossed: {
      weight: 0.6,
      layer: L.FACE_DETAIL,
      conform: 0.7,
      tags: ['cartoon'],
      roll: (rng) => ({ r: rng.float(0.17, 0.28), push: rng.float(0.35, 0.6) }),
      draw: (ink, p, rng) => {
        // Both pupils toward the nose: local -x is the inner side on either eye.
        ink.fill(localBlob(ink, -(p.push as number), 0.05, p.r as number, rng, 5, 0.3), { ragged: 0.7 });
      },
    },
  });
}
