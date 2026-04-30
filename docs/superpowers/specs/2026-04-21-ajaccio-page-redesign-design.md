# Ajaccio page redesign - layout variety + GSAP scroll treatment

**Date:** 2026-04-21
**Target file:** `src/pages/creation-site-internet-ajaccio.astro`
**Status:** design approved pending written review

## Goal

Make the page feel less like an AI-generated landing and more like a hand-crafted editorial piece, without losing conversion intent.

Two problems are being fixed together because they reinforce each other:

1. **Layout uniformity.** Three sections (03 "Ce qui est livré", 04 "Les freins", 05 "Avis clients") use the same card-in-a-grid pattern (icon circle + title + description, flex-equal heights). It reads as templated.
2. **Static feel.** The page has CSS `fadeInUp`/`float` loops but nothing scroll-driven. A restrained scroll treatment adds presence without tipping into agency-demo territory.

## Scope

In scope:
- Restructure sections **03**, **04**, **05** (HTML + CSS).
- Add a GSAP scroll treatment across the full page (the "Editorial" option - tint wash + parallax + entry triggers).
- Keep Tailwind classes as the primary styling layer; add scoped CSS in the existing `<style>` block for new primitives.

Out of scope:
- Hero, processus, tarifs, FAQ, formulaire sections stay structurally unchanged. They get scroll animations only.
- Copy changes.
- Any change to the structured data (JSON-LD), metadata, or form submission logic.
- Any swap of fonts, color palette, or dark-mode behaviour.

## Constraints

- Astro file with vanilla `<script>` blocks (no React, no `useGSAP`).
- GSAP 3.14.2 is already installed. `ScrollTrigger` is a free plugin bundled with `gsap` - import via `gsap/ScrollTrigger`.
- No smooth-scroll library (Lenis and similar are rejected).
- French-only page, no i18n changes.
- Progressive enhancement: if JS fails, everything must remain visible and legible. Initial hiding of scroll-triggered elements happens via `gsap.set()` inside JS, not via CSS `opacity: 0`.

## Design decisions

### Section 03 - Editorial numbered list (replaces 4+3 card grid)

**Structure:**
- Two columns on `lg:`: left column sticky, right column scrolls.
  - **Left (sticky, `lg:col-span-4`)**: section number `03` as large watermark (≈10rem, `white/8`), eyebrow "Ce qui est livré", H2 headline, a short one-line intro.
  - **Right (`lg:col-span-7`, offset by `lg:col-start-6`)**: vertical list of the 7 deliverables.
- On mobile: the left block becomes a normal header above the list (no sticky).

**Each list item:**
- Horizontal row: tiny icon (24px, no circle background) + two-digit index `01`–`07` in editorial display font + title (semibold) + description (one or two lines, muted color).
- Separator: a `1px` top border in `white/10`. No bottom border on the last item.
- Vertical rhythm: `py-8` per item on desktop, `py-6` on mobile.
- Alternating micro-offset: even-numbered items shift `16px` right (`md:pl-4`) to break strict alignment. Subtle, not gimmicky.

**GSAP:**
- Left column pinned via `ScrollTrigger.create({ pin: '.section-03-left', start: 'top 15%', end: 'bottom 85%' })` - desktop only.
- Each list row: `fromTo` triggered at `top 80%`, `opacity 0 → 1`, `x: -30 → 0`, `duration 0.6`, stagger across rows if multiple enter in the same frame.

**Markup shape (for the plan, not final):**
```html
<section class="py-24 lg:py-32 dark-editorial grain-dark relative overflow-hidden">
  <!-- Ambient glows kept -->
  <div class="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
    <div class="section-03-left lg:col-span-4 lg:sticky lg:top-32 self-start">
      <!-- 03 watermark + eyebrow + H2 + intro -->
    </div>
    <ol class="lg:col-span-7 lg:col-start-6 divide-y divide-white/10" data-gsap="list-03">
      <li class="deliverable-row py-8 grid grid-cols-[auto_auto_1fr] gap-6 items-baseline">
        <svg class="w-6 h-6 ..."/>
        <span class="font-editorial text-4xl text-white/40">01</span>
        <div>
          <h3 class="font-editorial text-xl font-semibold text-white">Design sur-mesure</h3>
          <p class="font-body text-sm text-green-100/70 mt-2">Un site qui vous ressemble, pas un thème générique. Parfait sur mobile, tablette et ordinateur.</p>
        </div>
      </li>
      <!-- 06 more <li> -->
    </ol>
  </div>
</section>
```

### Section 04 - Zig-zag conversational (replaces twin cards)

**Structure:**
- Two stacked full-width blocks (no shared flex row, no cards).
- Each block is a 12-column grid; the content occupies different columns to create zig-zag.
- Block 1 (objection-left / response-right):
  - Left (`col-span-6`): objection as a large italic pull-quote, `font-editorial`, 3xl-4xl, with a giant `"` mark in amber at top-left (absolute, -translate-y-1/3, opacity 0.18).
  - Right (`col-span-5`, `col-start-8`): "Ma réponse →" eyebrow, body paragraph, then an inset green pill "Résultat : ..." (simpler than current green box - just an underlined label + text, no boxed container).
- Block 2 (objection-right / response-left): mirror of Block 1.
- Vertical spacing between the two blocks: `my-16` on desktop, `my-10` on mobile.
- Mobile: both blocks collapse to single-column, objection above response. No mirror.

**GSAP:**
- Giant quote marks: `scale 0.7 → 1`, `opacity 0 → 0.18`, trigger at `top 80%`, once.
- Objection text: fade + slight y-offset, stagger with quote.
- Response block: slides from the opposite edge (`x: 40 → 0` or `-40 → 0`), triggers 0.2s after the objection.

### Section 05 - Hero quote + strips (replaces 3×2 grid)

**Structure:**
- Three regions inside the section:

**Region A - Hero testimonial (top-left)**
- Takes `lg:col-span-8`.
- Giant `"` mark in emerald at top-left, watermark-style.
- Quote text in `font-editorial`, 3xl, italic, balanced text.
- Attribution inline below: avatar initial (larger, 48px), name bold, role muted.
- One testimonial here. Pick: **Matthias (Odacio Conseils)** - "David a réalisé mon site internet et je suis très satisfait du résultat. Il a été à l'écoute, réactif et professionnel tout au long du projet. Le suivi est sérieux et il reste disponible quand on a besoin. Vous pouvez lui faire confiance les yeux fermés !"

**Region B - Three strip quotes (right of hero)**
- `lg:col-span-4`, stacked vertically aligned to the top of region A.
- Each strip: 1–2 lines of essence (shortened quote or key sentence), avatar initial small (32px), name + role on one line below.
- No borders, no background - just a thin left accent bar (`2px solid emerald-500/60`) to tie them visually.
- Varied font sizes across the three: first strip slightly larger than the next two, to break uniformity.
- Candidates for this region: **Marion**, **Mathieu**, **Cédric** (shortened quotes).

**Region C - Two micro-verbatims (bottom, full width)**
- `mt-16`, two short one-liners side-by-side (`lg:grid-cols-2 gap-12`).
- Style: italic quote, then small caps label "- Prénom, Structure" after, epigraph style.
- Content: shortened quotes from **Véronique** and **Aaron**. Aaron's current quote is already short enough as-is; Véronique needs a one-sentence extract (e.g. "C'est un vrai plus de travailler avec un professionnel serein.").

**GSAP:**
- Hero quote mark: scale + opacity scrub on entry (`top 85%` trigger, once).
- Hero text: fade + y.
- Strips: stagger 0.12s entering from the right.
- Micro-verbatims: fade with a slightly longer delay so they land last visually.

### GSAP scroll treatment (Option A - Editorial)

**1. Page tint wash (ambient color shift)**

- Add a fixed overlay `<div class="scroll-tint" aria-hidden="true"></div>` at the top of `<Layout>`'s slot content, with `position: fixed; inset: 0; pointer-events: none; z-index: 1;` and `background: var(--tint, transparent);`. Page content (sections) gets `position: relative; z-index: 2;` to sit above the tint layer - except we want the tint to be VISIBLE over content, so the layer is placed above content at `z-index: 50` with `pointer-events: none` and `mix-blend-mode: multiply` (this allows clicks/hovers to pass through and the tint to color the content beneath).
- A single `ScrollTrigger` with `scrub: true`, `trigger: document.body`, `start: 'top top'`, `end: 'bottom bottom'` animates the `--tint` custom property through waypoints. `--tint` holds an `rgba()` value; both hue and alpha scrub:
  - Hero (0–15%): `rgba(251, 240, 218, 0.10)` - warm cream
  - Pourquoi → Processus (15–40%): `rgba(180, 220, 195, 0.10)` - soft emerald
  - Dark editorial 03 (40–55%): `rgba(15, 46, 31, 0.04)` - near-transparent (alpha drops so the dark section stays clean; blend would muddy it)
  - Freins → Avis (55–80%): `rgba(245, 225, 200, 0.11)` - warmer cream with amber bias
  - Tarifs → FAQ → Formulaire (80–100%): `rgba(240, 230, 215, 0.08)` - neutral warm, low alpha
- Exact rgba values tuned visually during implementation; baseline principle: alpha 0.08–0.12 over cream/texture sections, alpha near 0 over the dark-editorial section to avoid muddy blending.
- With `mix-blend-mode: multiply`, the tint deepens/warms existing backgrounds without overwriting them. Tested fallback: if `mix-blend-mode` renders poorly on any browser, drop the blend mode and rely on low-alpha rgba alone (less visible, still pleasant).
- Structural section backgrounds (`texture-bg`, `dark-editorial`, `bg-gradient-to-b`) remain as-is.

**2. Parallax (desktop only)**

- Hero blur blobs: two separate ScrollTriggers, differential `y` translation (`y: -80` and `y: -140` across the hero's scroll length), scrubbed.
- `.hero-mark` (large faded signature letter in hero): slow `y: -100` scrubbed over the hero scroll length.
- Decorative shapes in section 03 (the ambient glows): subtle `y: -60` scrubbed parallax while section 03 is on screen.
- All transforms only (`translate3d` under the hood) - no `top`/`margin`/`width` changes.

**3. Entry triggers (non-scrubbed, once)**

- Replace the below-fold `animate-fade-up` + `.delay-X` CSS classes with data-attribute hooks that GSAP picks up:
  - `data-gsap="fade-up"` → `y: 30, opacity: 0`, trigger at `top 80%`, `duration: 0.8`, ease `power2.out`.
  - `data-gsap="fade-up-stagger"` on a parent → children stagger `0.08`.
  - `data-gsap="slide-in-left"` (for section indices, big numbers) → `x: -40, opacity: 0`, `duration: 0.7`.
  - `data-gsap="scale-in"` (for hero quote mark, primary CTAs entering viewport) → `scale: 0.9, opacity: 0`, `duration: 0.6`.
- The hero's existing on-load `animate-fade-up` CSS classes remain - those fire before GSAP initializes and don't depend on scroll.

**4. Accessibility and performance**

- Wrap every ScrollTrigger and tween in `gsap.matchMedia()`:
  - `(prefers-reduced-motion: no-preference) and (min-width: 768px)` - full treatment.
  - `(prefers-reduced-motion: no-preference) and (max-width: 767px)` - entry triggers only (no parallax, no tint scrub). On mobile, the tint layer is set to a single static color.
  - `(prefers-reduced-motion: reduce)` - nothing runs; `gsap.set()` is not called; elements are visible as-is.
- Initial hiding: `gsap.set('[data-gsap="fade-up"]', { opacity: 0, y: 30 })` runs inside `matchMedia` so no-JS / reduced-motion users see content unhidden.
- `ScrollTrigger.config({ ignoreMobileResize: true })` to avoid re-init on iOS URL-bar show/hide.
- Use `will-change: transform` only on parallaxed elements, scoped narrowly.

### Technical integration

**File changes:**
- `src/pages/creation-site-internet-ajaccio.astro` - HTML restructure for sections 03/04/05, new CSS primitives in the existing `<style>` block, one new `<script>` block at the end of the file importing GSAP + ScrollTrigger.

**Script shape:**
```js
// Bottom of creation-site-internet-ajaccio.astro, inside a <script> (no is:inline)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
  // tint wash, parallax, entry triggers
});

mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
  // entry triggers only
});
```

**CSS additions (in existing `<style>` block):**
- `.scroll-tint` rules with `--tint` custom property default.
- `.deliverable-row` (for section 03 list items): grid layout, border-top, `.deliverable-row:nth-child(even) { padding-left: 1rem; }` for the offset.
- `.frein-block` with the 12-column grid + mirror modifier `.frein-block--mirror`.
- `.quote-mark-giant` for the oversized quote marks in section 04 and 05 hero.
- `.testimonial-strip` for section 05 right column items.

**Data attributes as animation hooks:**
- `data-gsap="fade-up"`, `data-gsap="fade-up-stagger"`, `data-gsap="slide-in-left"`, `data-gsap="scale-in"`.
- Decorative targets: `data-parallax="hero-blob"`, `data-parallax="hero-mark"`.

## Success criteria

- Sections 03, 04, 05 no longer match the "grid of identical cards" pattern. A reader should be able to identify the three sections as visually distinct from each other and from the rest of the page.
- Scroll the full page on desktop: tint shifts gradually, hero elements parallax, below-fold sections animate in once as they enter the viewport.
- With `prefers-reduced-motion: reduce`, nothing animates, all content is immediately visible and legible.
- With JS disabled, the page renders all content visible (no permanent `opacity: 0`).
- Mobile scroll is smooth (no parallax jank, no tint scrub - entry triggers only).
- No layout shift introduced by animations (CLS clean).
- LCP of the hero image/headline not regressed vs current.

## Risks and mitigations

- **Risk:** The sticky left column in section 03 can feel heavy if the right column is short. **Mitigation:** only activate the pin if the list is taller than the viewport; otherwise plain 2-column.
- **Risk:** Zig-zag section 04 can look broken on narrow-desktop (≈1024px). **Mitigation:** only apply zig-zag at `lg:` and up (≥1024px); below that, stack vertically single-column.
- **Risk:** Tint wash over existing section backgrounds can muddy the dark-editorial section. **Mitigation:** the tint layer uses `mix-blend-mode: soft-light` or stays under the section background (`z-index: 0` with section content at `z-index: 1`). Verify visually and tune opacity per section via the ScrollTrigger timeline.
- **Risk:** Existing CSS classes `animate-fade-up` + `.delay-X` on below-fold elements - if we remove the CSS `opacity: 0` from those classes, they'll be visible before GSAP kicks in. **Mitigation:** strip the delay classes from below-fold elements in favour of data attributes; keep `.animate-fade-up` only on hero elements that fire on-load.
- **Risk:** Content identified for section 05 requires picking 1 hero + 3 strips + 2 verbatims from the 6 existing testimonials - the role/content distribution matters. **Mitigation:** initial selection documented above; can be adjusted during implementation without changing structure.

## Explicit non-changes

- Page metadata (title, description) unchanged.
- Structured data (Service, FAQ, Breadcrumb) unchanged.
- Form submission logic unchanged.
- Color palette (emerald/amber) unchanged.
- Fonts unchanged.
- No new npm dependencies.
