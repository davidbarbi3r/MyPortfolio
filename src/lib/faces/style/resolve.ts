import type { FaceStyle, ResolvedStyle, StrokeRole, StrokeSpec, StylePreset } from '../types';
import { baseStyle } from './base-style';
import { presets } from './presets';
import { paletteOf } from './palettes';

const ROLES: StrokeRole[] = ['outline', 'feature', 'detail', 'hatch', 'accent'];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Local deep merge: arrays are replaced, objects merged. `lodash.merge` is a
 *  project dependency but only server-side — not worth shipping to the client. */
function deepMerge<T>(target: T, source: unknown): T {
  if (!isPlainObject(source)) return source === undefined ? target : (source as T);
  const out: Record<string, unknown> = isPlainObject(target) ? { ...(target as Record<string, unknown>) } : {};
  for (const k of Object.keys(source)) {
    const sv = source[k];
    if (sv === undefined) continue;
    out[k] = isPlainObject(sv) ? deepMerge(out[k], sv) : sv;
  }
  return out as T;
}

const styleCache = new Map<string, ResolvedStyle>();

/**
 * Merge the inheritance chain and flatten the stroke roles.
 *
 * Roles are flattened here, once per bake, on purpose: a feature function calls
 * ink.path(pts, 'feature') hundreds of times, and re-merging base + role +
 * overrides on each call would allocate three objects per stroke.
 */
export function resolveStyle(
  id: string,
  overrides?: Partial<FaceStyle> | StylePreset,
  paletteId?: string
): ResolvedStyle {
  const key = overrides ? '' : `${id}|${paletteId ?? ''}`;
  if (key) {
    const hit = styleCache.get(key);
    if (hit) return hit;
  }

  // Walk up the `extends` chain, root first.
  const chain: StylePreset[] = [];
  let cur: StylePreset | undefined = presets[id];
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    chain.unshift(cur);
    cur = cur.extends && cur.extends !== 'base' ? presets[cur.extends] : undefined;
  }

  let merged = baseStyle as FaceStyle;
  for (const link of chain) merged = deepMerge(merged, link);
  if (overrides) merged = deepMerge(merged, overrides);

  const roles = {} as Record<StrokeRole, StrokeSpec>;
  for (const r of ROLES) {
    roles[r] = { ...merged.stroke.base, ...(merged.stroke.roles?.[r] ?? {}) };
  }

  const resolved: ResolvedStyle = {
    id: merged.id,
    label: merged.label,
    extends: merged.extends,
    roles,
    paper: merged.paper,
    texture: merged.texture,
    wash: merged.wash,
    proportions: merged.proportions,
    weights: merged.weights,
    palette: paletteOf(paletteId ?? merged.paletteId),
  };

  if (key) styleCache.set(key, resolved);
  return resolved;
}

function blendValue(a: unknown, b: unknown, t: number): unknown {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (isPlainObject(a) && isPlainObject(b)) {
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const av = a[k];
      const bv = b[k];
      // A weight table key missing on one side counts as zero, so variants fade
      // in and out across a blend rather than popping.
      if (typeof av === 'number' || typeof bv === 'number') {
        out[k] = blendValue(typeof av === 'number' ? av : 0, typeof bv === 'number' ? bv : 0, t);
      } else {
        out[k] = blendValue(av === undefined ? bv : av, bv === undefined ? av : bv, t);
      }
    }
    return out;
  }
  // Discrete fields (mode, blend, colours) switch at the halfway point.
  return t < 0.5 ? a : b;
}

/**
 * Interpolate two resolved styles.
 *
 * The interesting part is that variant weight tables are numbers, so blending
 * `encre` toward `trait-fin` across a contact sheet makes ink-blob hair grow
 * progressively rare and outlined curls progressively common — a style
 * gradient across the grid, which is the single most convincing demo of the
 * system.
 */
export function blendStyles(a: ResolvedStyle, b: ResolvedStyle, t: number): ResolvedStyle {
  const k = Math.max(0, Math.min(1, t));
  const out = blendValue(a, b, k) as ResolvedStyle;
  out.id = `${a.id}~${b.id}@${k.toFixed(2)}`;
  out.palette = k < 0.5 ? a.palette : b.palette;
  return out;
}

export const listStyles = (): Array<{ id: string; label: string }> =>
  Object.values(presets).map((s) => ({ id: s.id, label: s.label }));

export { presets, paletteOf };
export { palettes } from './palettes';
