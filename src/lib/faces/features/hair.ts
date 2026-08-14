import type { Pt } from '../types';
import { L } from '../types';
import { defineSlot, type FeatureEnv } from './registry';
import { centroid, pointInPoly, resampleByArcLength } from '../math/geom2';
import type { InkContext } from '../ink/ink-context';
import {
  capGeometry,
  hairlineParamsFrom,
  hairlineProfile,
  rollHairline,
  type HairlineParams,
  type HairlineProfile,
} from './hairline';

// Hair is the one slot that does not live in a feature frame: it must hug the
// skull, so it is built from the head surface directly via capOutline(), which
// returns the projected outline of the scalp above a (wavy) hairline. That is
// why it reads as a mass sitting ON the head at any angle instead of a shape
// pasted over the top of the drawing.

/** Resolve the rolled hairline profile into what a variant needs. The shape is
 *  picked independently of the mass, so the two axes multiply. */
function hairlineOf(p: Record<string, number | string>, lobes: number, force?: string) {
  const profile = hairlineProfile(force ?? (p.hlProfile as string | undefined));
  const hp = hairlineParamsFrom(p, lobes);
  return { profile, hp, phi: (t: number): number => profile.phi(t, hp) };
}

/**
 * Cut the profile's re-entrant detail back out of a mass that is already drawn.
 *
 * `env.cap` is a radial max about the cap centroid, so a concave hairline —
 * receding temples, a bald patch — is silently filled in and simply vanishes.
 * Erasing afterwards is the only way to get one, and it is the same trick
 * `inkCap` already uses for its parting.
 */
function cutHairline(ink: InkContext, profile: HairlineProfile, hp: HairlineParams, env: FeatureEnv): void {
  if (!profile.notch) return;
  for (const poly of profile.notch(hp, capGeometry(env.view))) {
    if (poly.length >= 3) ink.erase(poly);
  }
}

function outwardNormals(poly: Pt[]): Pt[] {
  const c = centroid(poly);
  return poly.map((p) => {
    const dx = p[0] - c[0];
    const dy = p[1] - c[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l] as Pt;
  });
}

export function registerHair(): void {
  defineSlot('hair', {
    inkCap: {
      weight: 3.5,
      layer: L.HAIR_FRONT,
      roll: (rng) => ({
        base: rng.float(0.62, 0.9),
        fringe: rng.float(-0.05, 0.3),
        volume: rng.float(0.03, 0.12),
        lobes: rng.int(3, 8),
        partSide: rng.sign(),
        partDepth: rng.float(0, 0.7),
        strays: rng.int(3, 11),
        holes: rng.int(1, 3),
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        const { profile, hp, phi } = hairlineOf(p, p.lobes as number);
        const cap = env.cap(phi, p.volume as number);
        if (cap.length < 6) return;

        // Lobed bulge so the mass is not a smooth dome.
        const norms = outwardNormals(cap);
        const amp = (p.volume as number) * env.view.scale * 0.45;
        const lobes = p.lobes as number;
        const bulged: Pt[] = cap.map((q, i) => {
          const u = i / cap.length;
          const lobe = Math.sin(u * Math.PI * 2 * lobes + (p.partSide as number) * 1.7);
          const k = amp * (0.35 + 0.65 * lobe);
          return [q[0] + norms[i][0] * k, q[1] + norms[i][1] * k];
        });

        ink.fill(bulged, {
          ragged: 1,
          bleed: 0.14,
          holes: p.holes as number,
          strays: p.strays as number,
          color: ink.style.palette.hairs[0],
        });

        // The part is a NOTCH cut back out of the mass, not a white line drawn
        // on top of it.
        if ((p.partDepth as number) > 0.25) {
          const c = centroid(bulged);
          const s = p.partSide as number;
          const d = p.partDepth as number;
          const r = Math.hypot(bulged[0][0] - c[0], bulged[0][1] - c[1]) || 60;
          ink.erase([
            [c[0] + s * r * 0.06, c[1] + r * 0.1],
            [c[0] + s * r * (0.08 + 0.06 * d), c[1] - r * 0.62],
            [c[0] + s * r * (0.17 + 0.1 * d), c[1] - r * 0.66],
            [c[0] + s * r * 0.2, c[1] + r * 0.12],
          ]);
        }

        cutHairline(ink, profile, hp, env);
      },
    },

    scribbleMass: {
      weight: 3,
      layer: L.HAIR_FRONT,
      roll: (rng) => ({
        base: rng.float(0.62, 0.88),
        fringe: rng.float(-0.05, 0.28),
        volume: rng.float(0.04, 0.13),
        lobes: rng.int(3, 7),
        angle: rng.float(-0.7, 0.7),
        density: rng.float(0.5, 1.0),
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        const { profile, hp, phi } = hairlineOf(p, p.lobes as number);
        const cap = env.cap(phi, p.volume as number);
        if (cap.length < 6) return;

        ink.poly(cap, 'feature', { smooth: 0.5, gapChance: 0.3, alpha: 0.8 });
        ink.hatch(cap, {
          angle: p.angle as number,
          spacing: ink.style.texture.hatchSpacing * (1.15 / Math.max(0.5, p.density as number)),
          jitter: 0.55,
          cross: rng.bool(0.6),
          alpha: 0.85,
          role: 'feature',
        });
        cutHairline(ink, profile, hp, env);
      },
    },

    spikes: {
      weight: 2,
      layer: L.HAIR_FRONT,
      roll: (rng) => ({
        base: rng.float(0.62, 0.88),
        fringe: rng.float(0, 0.22),
        count: rng.int(18, 34),
        len: rng.float(0.05, 0.14),
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        const { profile, hp, phi } = hairlineOf(p, 4);
        const cap = env.cap(phi, 0.02);
        if (cap.length < 6) return;

        const norms = outwardNormals(cap);
        const c = centroid(cap);
        const n = p.count as number;
        const spikeLen = (p.len as number) * env.view.scale;

        ink.poly(cap, 'feature', { smooth: 0.4, gapChance: 0.35, alpha: 0.75 });

        for (let i = 0; i < n; i++) {
          const k = Math.floor((i / n) * cap.length);
          // Only spike upward/outward, never down into the face.
          if (cap[k][1] > c[1] + 10) continue;
          const l = spikeLen * rng.float(0.5, 1.4);
          const skew = rng.float(-0.4, 0.4);
          ink.path(
            [
              cap[k],
              [cap[k][0] + norms[k][0] * l + skew * l * 0.6, cap[k][1] + norms[k][1] * l - Math.abs(skew) * l * 0.2],
            ],
            'feature',
            { taper: 1, taperBias: -0.85, passes: 1, overshoot: 0, gapChance: 0 }
          );
        }

        cutHairline(ink, profile, hp, env);
      },
    },

    curls: {
      weight: 2,
      layer: L.HAIR_FRONT,
      roll: (rng) => ({
        base: rng.float(0.6, 0.86),
        fringe: rng.float(0, 0.25),
        volume: rng.float(0.04, 0.13),
        count: rng.int(10, 24),
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        const { profile, hp, phi } = hairlineOf(p, 5);
        const cap = env.cap(phi, p.volume as number);
        if (cap.length < 6) return;

        const ring = resampleByArcLength([...cap, cap[0]], 26);
        const c = centroid(cap);
        const r = (env.view.scale * (p.volume as number) + 14) * 0.85;

        // Curls along the boundary...
        for (const q of ring) {
          if (q[1] > c[1] + 20) continue;
          const rr = r * rng.float(0.6, 1.35);
          const pts: Pt[] = [];
          const turns = rng.float(1.1, 1.9);
          const steps = 16;
          const start = rng.float(0, Math.PI * 2);
          for (let i = 0; i <= steps; i++) {
            const a = start + (i / steps) * Math.PI * 2 * turns;
            const rad = rr * (0.35 + 0.65 * (i / steps));
            pts.push([q[0] + Math.cos(a) * rad, q[1] + Math.sin(a) * rad * 0.85]);
          }
          ink.path(pts, 'detail', { passes: 1, alpha: 0.85, overshoot: 2, gapChance: 0 });
        }

        // ...and a few inside the mass so it is not a hollow wreath.
        const inner = p.count as number;
        for (let i = 0; i < inner; i++) {
          const a = rng.float(0, Math.PI * 2);
          const d = rng.float(0, 0.75);
          const q: Pt = [
            c[0] + Math.cos(a) * d * (env.view.scale * 0.55),
            c[1] + Math.sin(a) * d * (env.view.scale * 0.4) - env.view.scale * 0.12,
          ];
          if (!pointInPoly(cap, q[0], q[1])) continue;
          const rr = r * rng.float(0.3, 0.7);
          const pts: Pt[] = [];
          for (let s = 0; s <= 12; s++) {
            const aa = (s / 12) * Math.PI * 2 * 1.3;
            pts.push([q[0] + Math.cos(aa) * rr, q[1] + Math.sin(aa) * rr * 0.8]);
          }
          ink.path(pts, 'detail', { passes: 1, alpha: 0.7, overshoot: 1, gapChance: 0 });
        }

        cutHairline(ink, profile, hp, env);
      },
    },

    sideSweep: {
      weight: 2,
      layer: L.HAIR_FRONT,
      roll: (rng) => ({
        base: rng.float(0.58, 0.82),
        fringe: rng.float(0.12, 0.36),
        volume: rng.float(0.04, 0.12),
        side: rng.sign(),
        strands: rng.int(10, 24),
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        const s = p.side as number;
        // The asymmetric line this used to define inline is now the shared
        // `sideSwept` profile; the mass carries the sweep either way.
        const { profile, hp, phi } = hairlineOf(p, 5);
        const cap = env.cap(phi, p.volume as number);
        if (cap.length < 6) return;

        ink.fill(cap, {
          ragged: 1,
          bleed: 0.12,
          holes: rng.int(0, 2),
          strays: rng.int(2, 7),
          color: ink.style.palette.hairs[0],
        });

        // Combed strands read through the mass as reserves.
        const c = centroid(cap);
        const n = p.strands as number;
        for (let i = 0; i < n; i++) {
          const u = i / n;
          const y = c[1] - env.view.scale * (0.05 + u * 0.42);
          ink.path(
            [
              [c[0] - s * env.view.scale * 0.5, y + rng.float(-6, 6)],
              [c[0] + s * env.view.scale * 0.45, y - env.view.scale * 0.06 + rng.float(-6, 6)],
            ],
            'detail',
            { passes: 1, alpha: 0.4, color: ink.style.palette.paper, overshoot: 0, gapChance: 0.2 }
          );
        }

        cutHairline(ink, profile, hp, env);
      },
    },

    bald: {
      weight: 1.2,
      layer: L.HAIR_FRONT,
      tags: ['age'],
      roll: (rng) => ({
        tufts: rng.int(0, 9),
        shine: rng.bool(0.6) ? 1 : 0,
        ring: rng.bool(0.5) ? 1 : 0,
        ...rollHairline(rng),
      }),
      draw: (ink, p, rng, env) => {
        if (p.ring) {
          // A monk's fringe: a very high, very thin cap.
          const cap = env.cap(() => 0.28, 0.01);
          const inner = env.cap(() => 0.62, 0.0);
          if (cap.length > 6 && inner.length > 6) {
            ink.hatch(cap, { angle: 0.3, spacing: ink.style.texture.hatchSpacing * 0.5, jitter: 0.6, alpha: 0.5 });
            ink.poly(inner, 'detail', { smooth: 0.4, alpha: 0.4, gapChance: 0.4 });
          }
        }
        const { profile, hp, phi } = hairlineOf(p, 4, 'receded');
        const cap = env.cap(phi, 0.01);
        if (cap.length < 6) return;
        const norms = outwardNormals(cap);
        const c = centroid(cap);
        for (let i = 0; i < (p.tufts as number); i++) {
          const k = rng.int(0, cap.length - 1);
          if (cap[k][1] > c[1]) continue;
          const l = env.view.scale * rng.float(0.04, 0.13);
          ink.path(
            [cap[k], [cap[k][0] + norms[k][0] * l + rng.gaussian(0, l * 0.4), cap[k][1] + norms[k][1] * l]],
            'detail',
            {
              taper: 1,
              taperBias: -0.9,
              passes: 1,
              overshoot: 0,
              gapChance: 0,
            }
          );
        }
        if (p.shine) {
          ink.stipple(cap, {
            density: 0.35,
            alpha: 0.28,
            gradient: (q) => Math.max(0, 1 - Math.hypot(q[0] - c[0], q[1] - c[1]) / (env.view.scale * 0.5)),
          });
        }

        cutHairline(ink, profile, hp, env);
      },
    },
  });
}
