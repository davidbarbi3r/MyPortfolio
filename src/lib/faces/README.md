# Procedural face generator

Hand-drawn doodle faces, generated from a seed and rendered to canvas 2D. No
dependencies, no assets — every line is computed.

```ts
import { generateFace, bakeFace, paintFace, FaceCanvas } from '~/lib/faces';

// One-off
const face = generateFace('ajaccio-3');
const list = bakeFace(face, { pose: { yaw: 0.4, pitch: 0, roll: 0, camera: 8 }, style: 'encre' });
paintFace(canvas, list, { width: 400, height: 400 });

// Live, cursor-following
const fc = new FaceCanvas(canvas, { seed: 'ajaccio-3', style: 'encre', size: 380 });
fc.render();
onmousemove = (e) => fc.setPose({ yaw: nx * 0.85, pitch: -ny * 0.45 });
```

Demo: `/labs/visages/` (`src/components/faces/FaceSheet.astro`).

## The three-stage pipeline

    generateFace(seed)  -> FaceParams     plain JSON: anatomy only
    bakeFace(params)    -> FaceDrawList   geometry in a canonical 1000-unit box
    paintFace(canvas)   -> pixels

**Pose and style are deliberately NOT stored on the face.** That is what lets
the same face turn to follow a cursor without regenerating anatomy, be drawn in
three styles side by side, travel as a seed string, and be diffed as a
regression check (this repo has no test runner).

Because the draw list is authored in a fixed 1000-unit box, render size and DPI
never touch geometry: a 120px contact-sheet cell and a 4000px PNG export are
literally the same drawing.

## How it is put together

| Area          | Files       | Notes                                                                                                                                      |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Determinism   | `rng.ts`    | mulberry32 + FNV-1a. `fork(name)` re-hashes rather than consuming the parent, so adding a draw call never reshuffles existing faces.       |
| Head model    | `head/`     | Ellipsoid deformed by separable anisotropic profiles. Anchors live in spherical coordinates; feature extents are in _radians of head arc_. |
| Stroke engine | `ink/`      | Filled ribbons with a pressure profile — never `ctx.stroke()`. fBm wobble, multi-pass search strokes, overshoot, gaps.                     |
| Features      | `features/` | One file per slot, N named variants each. `roll()` at generation, `draw()` at bake.                                                        |
| Styles        | `style/`    | Stroke params, asymmetry budgets, variant weight tables, wash config. Palettes are separate and swap independently.                        |
| Pipeline      | `pipeline/` | Bake, paint, and `FaceCanvas` (coalesced re-bakes, boil mode).                                                                             |

### Why features sit on the form

Each anchor resolves to a `Frame`: a 2D position plus a tangent basis obtained
by differentiating **through the projection**. A variant draws in its own
`[-1,1]` space and gets correct rotation, foreshortening, limb fade and
painter-order depth for free.

`conform` (0..1) trades anatomical correctness for legibility: 1 paints the
feature onto the sphere, 0 makes it a rigid billboard at its intrinsic size.
Eyes sit around 0.75; glasses and ears are near 0.2, because they are rigid
objects, not decals.

## Adding a variant

```ts
defineSlot('eyes', {
  myEye: {
    weight: 2,
    layer: L.FACE,
    conform: 0.75,
    tags: ['cartoon'], // biases sibling slots
    roll: (rng) => ({ openness: rng.gaussian(0.6, 0.15) }),
    draw: (ink, p, rng, env) => {
      ink.path([ink.p(-1, 0), ink.p(0, -0.6), ink.p(1, 0.1)], 'feature', { smooth: 1 });
    },
  },
});
```

Author geometry in **local** coordinates only (`+x` outward, `+y` down) and map
it with `ink.p()`. Never offset in face space: a mirrored frame reverses
face-space normals and silently flips creases on one side of the head.

Register it in `features/index.ts`. Existing seeds are unaffected — that is the
point of the named RNG forks.

## Gotchas

- View transitions are global on this site, so any canvas work must init on
  `astro:page-load` and tear down on `astro:before-swap`.
- `bow` (freehand curvature on straight lines) scales with arc length and is
  gated on straightness — applied to a closed contour it bends the whole head.
- Hatching that stops exactly on a boundary reads as a clip path; overshoot is
  deliberate, but applying it at both the scanline and the stroke level makes
  spiky fringes.
- Outlines of head regions (`env.cap`, `env.outline`) are LOD-scaled by the
  bake. Call those rather than `projectedOutline` directly, or a 48-cell sheet
  pays full sampling cost per cell.
