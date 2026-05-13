# Ajaccio page redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure sections 03 / 04 / 05 of `creation-site-internet-ajaccio.astro` to break the "grid of identical cards" pattern, and add a GSAP-driven scroll treatment (tint wash + parallax + entry triggers) across the full page.

**Architecture:** Single Astro file with vanilla `<script>` blocks (no React, no `useGSAP`). HTML/CSS changes happen in place, GSAP code lives in a new module `<script>` block at the bottom that imports `gsap` + `gsap/ScrollTrigger`. All motion wrapped in `gsap.matchMedia()` gates for reduced-motion and mobile. Initial element-hiding happens via `gsap.set()` so no-JS / reduced-motion users see content unhidden.

**Tech Stack:** Astro, Tailwind (v3 compatible classes in this project), GSAP 3.14.2 (already installed), ScrollTrigger (bundled with `gsap`).

**Spec:** [docs/superpowers/specs/2026-04-21-ajaccio-page-redesign-design.md](../specs/2026-04-21-ajaccio-page-redesign-design.md)

---

## File structure

Only one production file changes: `src/pages/creation-site-internet-ajaccio.astro`.

Edits inside that file, in order:
1. `<style>` block - add 6 new CSS rules (`.scroll-tint`, `.deliverable-row`, `.frein-block`, `.quote-mark-giant`, `.testimonial-strip`, `.testimonial-hero-mark`).
2. First child of the `<Layout>` slot - add `<div class="scroll-tint" aria-hidden="true"></div>`.
3. Section 03 (`dark-editorial` section with "Tout ce qu'il vous faut") - full HTML replacement.
4. Section 04 (`#freins` section) - full HTML replacement.
5. Section 05 (avis clients) - full HTML replacement.
6. Data-attribute hooks (`data-gsap="..."`, `data-parallax="..."`) added to hero elements, section headings, and the redesigned sections.
7. New `<script>` block at end of file - GSAP setup, matchMedia gates, entry triggers, parallax, tint-wash scrub.

No other files change. No new npm dependencies.

## Conventions for this plan

- Dev server is assumed running via `npm run dev` throughout. Restart only if a task explicitly says so.
- "Verify" steps are visual in a desktop browser (Chrome recommended for DevTools emulation). Each task includes exactly what to look for.
- Commit after each task using the exact commit message given.
- All file paths relative to repo root `/Users/davidbarbier/dev/MyPortfolio/`.
- For HTML replacements, locate sections by their surrounding HTML comment (e.g., `<!-- Section 03 : ... -->`) rather than line numbers, which shift.

---

## Task 1: Add CSS primitives and scroll-tint markup

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - `<style>` block (currently ends around `/* Hero signature mark */` rules) and add the tint div at the start of the `<Layout>` slot.

**Rationale:** Introduce the new visual primitives and the tint overlay element before touching the sections that use them. The tint overlay is transparent by default so the page looks unchanged after this task.

- [ ] **Step 1: Append new CSS rules to the `<style>` block**

In `src/pages/creation-site-internet-ajaccio.astro`, inside the existing `<style>` block, after the `.hero-mark` rules (around the end of the block, before `</style>`), append:

```css
/* Scroll tint overlay - color scrubs with scroll via GSAP */
.scroll-tint {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  background: var(--tint, transparent);
  mix-blend-mode: multiply;
  transition: background-color 0.05s linear;
}
.dark .scroll-tint {
  mix-blend-mode: screen;
}

/* Section 03 - editorial numbered list rows */
.deliverable-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  column-gap: 1.5rem;
  align-items: baseline;
  padding-block: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.deliverable-row:last-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
@media (min-width: 768px) {
  .deliverable-row:nth-child(even) {
    padding-inline-start: 1.25rem;
  }
}
.deliverable-row .deliverable-index {
  font-family: var(--aw-font-heading), system-ui, sans-serif;
  font-size: 2.25rem;
  font-weight: 600;
  line-height: 1;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}
.deliverable-row .deliverable-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(134, 239, 172);
  flex-shrink: 0;
  transform: translateY(0.25rem);
}

/* Section 04 - zig-zag block container */
.frein-block {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 2rem;
  position: relative;
}
.frein-block .frein-objection {
  grid-column: 1 / span 6;
  position: relative;
  padding-inline-start: 2.5rem;
}
.frein-block .frein-response {
  grid-column: 8 / span 5;
}
.frein-block--mirror .frein-objection {
  grid-column: 7 / span 6;
  padding-inline-start: 2.5rem;
  padding-inline-end: 0;
}
.frein-block--mirror .frein-response {
  grid-column: 1 / span 5;
  text-align: left;
}
@media (max-width: 1023px) {
  .frein-block,
  .frein-block--mirror {
    display: block;
  }
  .frein-block .frein-objection,
  .frein-block--mirror .frein-objection {
    padding-inline-start: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

/* Giant quote mark - used in section 04 objections and section 05 hero */
.quote-mark-giant {
  position: absolute;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  line-height: 0.8;
  pointer-events: none;
  user-select: none;
}
.quote-mark-giant.qm-amber {
  color: rgba(180, 83, 9, 0.22);
  font-size: 7rem;
  top: -1.5rem;
  left: 0;
}
.dark .quote-mark-giant.qm-amber {
  color: rgba(251, 191, 36, 0.22);
}
.quote-mark-giant.qm-emerald {
  color: rgba(21, 128, 61, 0.14);
  font-size: 10rem;
  top: -2rem;
  left: -1rem;
}
.dark .quote-mark-giant.qm-emerald {
  color: rgba(34, 197, 94, 0.18);
}

/* Section 05 - strip-style testimonial */
.testimonial-strip {
  border-inline-start: 2px solid rgba(21, 128, 61, 0.55);
  padding-inline-start: 1.25rem;
  padding-block: 0.5rem;
}
.dark .testimonial-strip {
  border-inline-start-color: rgba(34, 197, 94, 0.6);
}
```

Insert these rules at the end of the existing `<style>` block, immediately before the existing closing `</style>` tag. Do not add a second `</style>`.

- [ ] **Step 2: Add the scroll-tint overlay inside `<Layout>`**

Find the opening `<Layout metadata={metadata}>` line. Immediately after the closing `</Fragment>` that ends the `slot="head"` block, and before the `<style>` block, insert:

```html
  <div class="scroll-tint" aria-hidden="true"></div>
```

Locate precisely: the line immediately before `<style>` at the top of the Layout slot. The file structure at that point reads:

```
  <Fragment slot="head">
    ...json-ld scripts...
  </Fragment>

  <style>
    ...
```

Result:

```
  <Fragment slot="head">
    ...json-ld scripts...
  </Fragment>

  <div class="scroll-tint" aria-hidden="true"></div>

  <style>
    ...
```

- [ ] **Step 3: Start dev server and verify**

Run: `npm run dev`
Open: `http://localhost:4321/creation-site-internet-ajaccio`
Expected: page looks identical to before (tint has `background: transparent` default, new CSS rules don't match any existing element yet). No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): add CSS primitives and scroll-tint layer"
```

---

## Task 2: Redesign section 03 - editorial numbered list

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - replace the entire `<!-- Section 03 ... -->` block (the `<section class="py-24 lg:py-32 dark-editorial grain-dark relative overflow-hidden">` with its contents).

**Rationale:** Replace the 4+3 card grid with a two-column editorial layout: sticky left column (title + section number), scrollable right column (numbered list of 7 deliverables). Each row uses `.deliverable-row` CSS class defined in Task 1.

- [ ] **Step 1: Replace the entire section 03 block**

Find the existing section starting with the comment `<!-- Section 03 : Ce qui est inclus ... -->` (or simply by its classes `dark-editorial grain-dark`). It spans from that `<section>` opening to its matching `</section>` (roughly 110 lines in the original file, containing the 4-column `<div class="mt-20 grid ...">` and the 3-column `<div class="mt-8 grid ...">`).

Replace the entire section (from `<!-- Section 03` comment through `</section>`) with:

```html
  <!-- Section 03 : Ce qui est livré - editorial numbered list -->
  <section class="py-24 lg:py-32 dark-editorial grain-dark relative overflow-hidden" data-gsap-section="03">
    <div class="absolute inset-0 opacity-[0.04] pointer-events-none">
      <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgb(134, 239, 172)" stroke-width="0.3"/>
        </pattern>
        <rect width="100" height="100" fill="url(#grid)"/>
      </svg>
    </div>
    <!-- Ambient glow accents (parallax targets) -->
    <div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" data-parallax="section-03-glow" data-parallax-speed="-60"></div>
    <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-400/8 blur-[100px] pointer-events-none" data-parallax="section-03-glow" data-parallax-speed="-40"></div>

    <div class="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">

      <div class="section-03-left lg:col-span-4 lg:sticky lg:top-32 self-start">
        <span class="font-editorial text-6xl sm:text-7xl font-bold text-white/10 leading-none" data-gsap="slide-in-left">03</span>
        <p class="eyebrow eyebrow-on-dark mt-4" data-gsap="fade-up">Ce qui est livré</p>
        <h2 class="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 leading-[1.1]" data-gsap="fade-up">
          Tout ce qu'il vous faut, rien d'inutile.
        </h2>
        <p class="font-body text-base text-green-100/70 mt-6 leading-relaxed max-w-sm" data-gsap="fade-up">
          Sept livrables concrets, sans surcouche inutile. Chaque ligne a sa raison d'être.
        </p>
      </div>

      <ol class="lg:col-span-7 lg:col-start-6 list-none m-0 p-0" data-gsap="list-03-stagger">

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span class="deliverable-index">01</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Design sur-mesure</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Un site qui vous ressemble, pas un thème générique. Parfait sur mobile, tablette et ordinateur.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <span class="deliverable-index">02</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Textes modifiables</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Un mini back-office pour changer vos textes, vos photos, publier un article - depuis n'importe quel navigateur.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span class="deliverable-index">03</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Rapidité d'affichage</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Vos pages se chargent en moins de 2 secondes. Ni vos visiteurs ni Google n'aiment attendre.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span class="deliverable-index">04</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">SEO local optimisé</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Structure propre, balises, plan de site. La base technique pour bien ressortir sur Google quand on vous cherche.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"/>
          </svg>
          <span class="deliverable-index">05</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Nom de domaine + hébergement</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Je m'occupe de tout : choix du nom de domaine, configuration de l'hébergement, certificat de sécurité.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span class="deliverable-index">06</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Formation à l'usage du site</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Une session de formation en visio + des tutos vidéo que vous pouvez regarder quand vous voulez.</p>
          </div>
        </li>

        <li class="deliverable-row">
          <svg class="deliverable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="deliverable-index">07</span>
          <div>
            <h3 class="font-editorial text-xl font-semibold text-white">Statistiques de visites</h3>
            <p class="font-body text-sm text-green-100/70 mt-2 leading-relaxed">Vous voyez d'où viennent vos visiteurs, ce qu'ils cherchent, ce qui marche. Sans dashboard à 12 onglets.</p>
          </div>
        </li>

      </ol>

    </div>
  </section>
```

- [ ] **Step 2: Verify in dev server**

Reload: `http://localhost:4321/creation-site-internet-ajaccio`
Expected:
- Section 03 now shows a two-column layout on desktop (≥1024px): left sticky header ("03" watermark + eyebrow + H2 + intro), right vertical list of 7 numbered items separated by thin top borders.
- Items 02, 04, 06 (even rows) are slightly indented right (~20px).
- On mobile (narrow viewport), left column stacks above a single-column list.
- All 7 items readable, no broken SVG icons.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): redesign section 03 as editorial numbered list"
```

---

## Task 3: Redesign section 04 - zig-zag conversational

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - replace the entire `<!-- Section 04 : Les 2 freins ... -->` block (the `<section id="freins" ...>`).

**Rationale:** Replace the twin cards with two full-width asymmetric blocks. Block 1: objection left (6 cols) / response right (5 cols, offset). Block 2: mirror. No cards. Mobile stacks single-column.

- [ ] **Step 1: Replace the entire section 04 block**

Find the existing `<section id="freins" ...>` block and replace entire `<section>…</section>` with:

```html
  <!-- Section 04 : Les 2 freins habituels - zig-zag conversational -->
  <section id="freins" class="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 scroll-mt-20">
    <div class="mx-auto max-w-6xl px-6 lg:px-8">

      <div class="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
        <span class="styled-number" data-gsap="slide-in-left">04</span>
        <p class="eyebrow mt-4" data-gsap="fade-up">Les deux vraies questions</p>
        <h2 class="font-editorial text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mt-3 leading-[1.1]" data-gsap="fade-up">
          "Oui, mais un site sur-mesure, ça coûte cher et c'est bloqué."
        </h2>
        <p class="font-body text-xl text-gray-600 dark:text-gray-300 mt-6 leading-relaxed" data-gsap="fade-up">
          C'était vrai il y a 5 ans. Voici pourquoi ça ne l'est plus.
        </p>
      </div>

      <!-- Block 1 : objection left / response right -->
      <div class="frein-block mb-20 lg:mb-28">
        <div class="frein-objection">
          <span class="quote-mark-giant qm-amber" aria-hidden="true" data-gsap="scale-in">"</span>
          <blockquote class="font-editorial text-2xl sm:text-3xl lg:text-4xl italic text-gray-900 dark:text-white leading-[1.2]" data-gsap="fade-up">
            Un site sur-mesure, c'est 8 000 à 15 000€.
          </blockquote>
          <p class="font-body text-xs font-medium uppercase tracking-[0.18em] text-red-600/80 dark:text-red-400/80 mt-4" data-gsap="fade-up">L'objection</p>
        </div>
        <div class="frein-response" data-gsap="slide-in-right">
          <p class="eyebrow mt-2">Ma réponse</p>
          <p class="font-body text-gray-700 dark:text-gray-200 leading-relaxed mt-3 text-lg">
            Vrai, quand une agence facture 3 commerciaux, 2 chefs de projet, 1 graphiste et 1 développeur pour un site vitrine. Moi, je suis seul en face de vous, et l'IA m'assiste sur les tâches répétitives - écriture de code, génération de variantes, tests.
          </p>
          <p class="font-body text-gray-900 dark:text-white leading-relaxed mt-6 text-lg">
            <span class="font-editorial font-semibold text-green-700 dark:text-green-400">Résultat →</span>
            La même qualité sur-mesure, <strong>à partir de 2 000€ HT</strong>. Vous payez un développeur, pas une structure.
          </p>
        </div>
      </div>

      <!-- Block 2 : mirror - response left / objection right -->
      <div class="frein-block frein-block--mirror">
        <div class="frein-objection">
          <span class="quote-mark-giant qm-amber" aria-hidden="true" data-gsap="scale-in">"</span>
          <blockquote class="font-editorial text-2xl sm:text-3xl lg:text-4xl italic text-gray-900 dark:text-white leading-[1.2]" data-gsap="fade-up">
            Je vais devoir payer à chaque virgule à changer.
          </blockquote>
          <p class="font-body text-xs font-medium uppercase tracking-[0.18em] text-red-600/80 dark:text-red-400/80 mt-4" data-gsap="fade-up">L'objection</p>
        </div>
        <div class="frein-response" data-gsap="slide-in-left">
          <p class="eyebrow mt-2">Ma réponse</p>
          <p class="font-body text-gray-700 dark:text-gray-200 leading-relaxed mt-3 text-lg">
            Mauvaise surprise habituelle : un site sur-mesure livré comme un bloc figé, et dès qu'il faut changer un horaire ou une photo, il faut payer. Chez moi, non - votre site est livré avec un mini back-office pour modifier textes, images et pages depuis un navigateur.
          </p>
          <p class="font-body text-gray-900 dark:text-white leading-relaxed mt-6 text-lg">
            <span class="font-editorial font-semibold text-green-700 dark:text-green-400">Résultat →</span>
            Vous êtes <strong>totalement autonome sur le contenu</strong>. Formation incluse, tutos vidéo fournis. Besoin d'aide ponctuelle ? Je suis là à 60€/h.
          </p>
        </div>
      </div>

      <div class="mt-20 text-center" data-gsap="fade-up">
        <a
          href="#formulaire"
          class="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-body font-semibold text-lg shadow-lg shadow-green-700/25 hover:shadow-xl hover:shadow-green-700/30 transition-all duration-300"
        >
          Discuter de votre projet
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>

    </div>
  </section>
```

- [ ] **Step 2: Verify in dev server**

Reload the page and scroll to section 04.
Expected:
- On desktop (≥1024px): block 1 shows the italic objection on the LEFT with a large amber `"` mark, response on the RIGHT offset down and right. Block 2 is mirrored (objection right, response left).
- No card containers - just text flowing with generous whitespace.
- On mobile: both blocks stack single-column, objection above response.
- CTA button "Discuter de votre projet" still renders and the shimmer animation on hover still works.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): redesign section 04 with zig-zag conversational layout"
```

---

## Task 4: Redesign section 05 - hero quote + strips + verbatims

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - replace the entire `<!-- Section 05 : Avis clients -->` block.

**Rationale:** Replace the 3×2 grid of identical testimonial cards with a hierarchical wall: 1 hero testimonial (Matthias, large), 3 strip-style (Marion, Mathieu, Cédric), 2 micro-verbatims (Véronique, Aaron).

- [ ] **Step 1: Replace the entire section 05 block**

Find the existing `<!-- Section 05 : Avis clients -->` block and replace entire `<section>…</section>` with:

```html
  <!-- Section 05 : Avis clients - hero quote + strips + verbatims -->
  <section class="py-24 lg:py-32 texture-bg">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">

      <div class="max-w-3xl mb-16 lg:mb-20">
        <span class="styled-number" data-gsap="slide-in-left">05</span>
        <p class="eyebrow mt-4" data-gsap="fade-up">Ce que disent mes clients</p>
        <h2 class="font-editorial text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mt-3 leading-[1.1]" data-gsap="fade-up">
          Des entrepreneurs qui m'ont fait confiance.
        </h2>
      </div>

      <!-- Region A + B : hero quote (left) + strips (right) -->
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        <!-- Hero testimonial : Matthias -->
        <figure class="lg:col-span-8 relative" data-gsap="fade-up">
          <span class="quote-mark-giant qm-emerald" aria-hidden="true" data-gsap="scale-in">"</span>
          <blockquote class="font-editorial text-2xl sm:text-3xl lg:text-4xl italic text-gray-900 dark:text-white leading-[1.25] text-balance pt-6">
            David a réalisé mon site internet et je suis très satisfait du résultat. Il a été à l'écoute, réactif et professionnel tout au long du projet. Le suivi est sérieux et il reste disponible quand on a besoin. Vous pouvez lui faire confiance les yeux fermés.
          </blockquote>
          <figcaption class="mt-8 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center justify-center font-editorial font-semibold text-lg">
              M
            </div>
            <div>
              <div class="font-editorial font-semibold text-gray-900 dark:text-white text-lg">Matthias</div>
              <div class="font-body text-sm text-gray-500 dark:text-gray-400">Odacio Conseils</div>
            </div>
          </figcaption>
        </figure>

        <!-- Three strip testimonials : Marion, Mathieu, Cédric -->
        <div class="lg:col-span-4 space-y-8" data-gsap="strip-stagger">

          <figure class="testimonial-strip">
            <blockquote class="font-body text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "David est d'une incroyable patience, pleinement acteur de la mise en lumière de mon travail. Grand professionnalisme, je recommande vivement."
            </blockquote>
            <figcaption class="mt-3 flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center justify-center font-editorial text-sm font-semibold">M</div>
              <div class="font-body text-sm">
                <span class="font-editorial font-semibold text-gray-900 dark:text-white">Marion</span>
                <span class="text-gray-500 dark:text-gray-400"> - Fondatrice, Gaomata</span>
              </div>
            </figcaption>
          </figure>

          <figure class="testimonial-strip">
            <blockquote class="font-body text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "Très à l'écoute dans la co-construction de mon site internet. Son professionnalisme et son expertise ont permis de créer un site personnalisé et conforme à mes attentes."
            </blockquote>
            <figcaption class="mt-3 flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center justify-center font-editorial text-sm font-semibold">M</div>
              <div class="font-body text-sm">
                <span class="font-editorial font-semibold text-gray-900 dark:text-white">Mathieu</span>
                <span class="text-gray-500 dark:text-gray-400"> - Accompagnateur d'entreprise</span>
              </div>
            </figcaption>
          </figure>

          <figure class="testimonial-strip">
            <blockquote class="font-body text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "Travail de qualité dans la conception et la réalisation du site. Son écoute et son professionnalisme ont permis la bonne exécution."
            </blockquote>
            <figcaption class="mt-3 flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center justify-center font-editorial text-sm font-semibold">C</div>
              <div class="font-body text-sm">
                <span class="font-editorial font-semibold text-gray-900 dark:text-white">Cédric</span>
                <span class="text-gray-500 dark:text-gray-400"> - Fondateur, Rest'ô Dom</span>
              </div>
            </figcaption>
          </figure>

        </div>
      </div>

      <!-- Region C : two micro-verbatims, bottom full-width -->
      <div class="mt-20 lg:mt-28 grid lg:grid-cols-2 gap-12 pt-12 border-t border-gray-200 dark:border-gray-800" data-gsap="verbatim-stagger">

        <figure>
          <blockquote class="font-editorial text-xl italic text-gray-800 dark:text-gray-100 leading-snug">
            "C'est un vrai plus de travailler avec un professionnel serein."
          </blockquote>
          <figcaption class="mt-4 font-body text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            - Véronique, La voie des sens
          </figcaption>
        </figure>

        <figure>
          <blockquote class="font-editorial text-xl italic text-gray-800 dark:text-gray-100 leading-snug">
            "Véritable professionnel, réactif, compétent et sympathique. Je recommande fortement."
          </blockquote>
          <figcaption class="mt-4 font-body text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            - Aaron, Action Conseils
          </figcaption>
        </figure>

      </div>

    </div>
  </section>
```

- [ ] **Step 2: Verify in dev server**

Reload the page and scroll to section 05.
Expected:
- Heading + eyebrow now left-aligned (no longer centered).
- Hero testimonial (Matthias) occupies roughly 2/3 width on desktop, with a very large emerald `"` watermark behind the top-left of the quote. Large italic editorial typography.
- Right column: 3 strip testimonials (Marion, Mathieu, Cédric) each with a thin left emerald accent bar and no card container.
- Below: horizontal divider, then 2 verbatim quotes side-by-side (Véronique, Aaron), small caps attribution.
- On mobile: hero stacks, then strips stack below, then verbatims stack (or 2-col still works on tablet+).
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): redesign section 05 with hero quote + strips + verbatims"
```

---

## Task 5: Add data-gsap attributes to hero and other sections

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - add `data-gsap` / `data-parallax` attributes to existing elements in hero, section 01 (pourquoi), section 02 (processus), bandeau, tarifs, faq, formulaire, and any other below-fold section that should animate on scroll.

**Rationale:** Annotations drive the GSAP triggers set up in Task 6. Sections 03/04/05 already received annotations in Tasks 2-4.

- [ ] **Step 1: Annotate the hero section**

In the hero `<section class="relative min-h-[90dvh] flex items-center overflow-hidden texture-bg grain">` block, make these additions:

1. On the two `.absolute ... animate-float` decorative blobs (the large emerald/green circles with `blur-[100px]`), add `data-parallax="hero-blob"` and a `data-parallax-speed` attribute (`-80` for the top-right blob, `-140` for the bottom-left):

```html
<div class="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-emerald-100/60 to-green-100/30 dark:from-emerald-900/25 dark:to-green-900/10 rounded-full blur-[100px] animate-float" data-parallax="hero-blob" data-parallax-speed="-80"></div>
<div class="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-amber-100/30 to-emerald-100/20 dark:from-amber-900/15 dark:to-emerald-900/8 rounded-full blur-[100px]" style="animation: float 9s ease-in-out infinite reverse;" data-parallax="hero-blob" data-parallax-speed="-140"></div>
```

2. If the hero contains a `.hero-mark` element (search the hero block for class `hero-mark`), add `data-parallax="hero-mark"` and `data-parallax-speed="-100"` to it. If no such element is rendered in this page (the CSS class is defined but may not be used), skip this sub-step.

- [ ] **Step 2: Annotate below-fold section headings**

For each of these sections (section 01 "pourquoi", section 02 "processus", bandeau "allers-retours", section 06 tarifs, section "faq", section "formulaire"), find the top heading block containing the `<span class="styled-number">` and `<h2>`, and add:

- On the `<span class="styled-number">` element: `data-gsap="slide-in-left"`
- On the `<p class="eyebrow">` element (if present): `data-gsap="fade-up"`
- On the `<h2>` element: `data-gsap="fade-up"`
- On the lead `<p class="font-body text-xl ...">` under the H2 (if present): `data-gsap="fade-up"`

Example for section 01 (locate by `<!-- Section 01 : Pourquoi un site qui tient la route -->`):

```html
<span class="styled-number" data-gsap="slide-in-left">01</span>
...
<p class="eyebrow mt-4" data-gsap="fade-up">Le contexte</p>
<h2 class="... decorative-line" data-gsap="fade-up">
  Vos prospects regardent votre site avant de vous appeler.
</h2>
```

Do the same pattern for sections 02, 06, FAQ, formulaire.

- [ ] **Step 3: Annotate section 01 card grid for staggered entry**

In section 01, find the `<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">` container (the 4 "Vous sortez sur Google" / "Vous inspirez confiance" / etc. cards). Add `data-gsap="fade-up-stagger"` on that container:

```html
<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12" data-gsap="fade-up-stagger">
```

- [ ] **Step 4: Annotate section 02 processus items for staggered entry**

In section 02, find the `<dl class="grid grid-cols-1 overflow-hidden gap-6 sm:grid-cols-2 mt-12 lg:grid-cols-3">` container. Add `data-gsap="fade-up-stagger"`:

```html
<dl class="grid grid-cols-1 overflow-hidden gap-6 sm:grid-cols-2 mt-12 lg:grid-cols-3" data-gsap="fade-up-stagger">
```

- [ ] **Step 5: Verify in dev server**

Reload the page.
Expected: page looks identical to before this task (data attributes are inert without JS). No console errors. Inspect a couple of elements in DevTools to confirm the attributes are on them.

- [ ] **Step 6: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): add data-gsap hooks for scroll animations"
```

---

## Task 6: GSAP setup + entry triggers

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - add a new `<script>` module block at the end of the file (after the closing `</Layout>` is NOT valid - place it immediately before `</Layout>` if the file uses Layout as wrapper, OR at the top of the file after the frontmatter if siblings work better. In this Astro file, place it immediately before the closing `</Layout>` tag).

**Rationale:** Bootstrap GSAP, register ScrollTrigger, set up matchMedia responsive gates, and implement the 4 entry trigger patterns (`fade-up`, `fade-up-stagger`, `slide-in-left`, `slide-in-right`, `scale-in`) plus the two specialized staggers (`list-03-stagger`, `strip-stagger`, `verbatim-stagger`).

- [ ] **Step 1: Add the GSAP script block**

At the end of `src/pages/creation-site-internet-ajaccio.astro`, immediately before the closing `</Layout>` tag, insert this new `<script>` block (note: NO `is:inline` so Astro bundles the ESM imports):

```html
  <script>
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    // Desktop with motion allowed
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
      // --- Initial hides (JS-only, progressive enhancement) ---
      gsap.set('[data-gsap="fade-up"]', { opacity: 0, y: 30 });
      gsap.set('[data-gsap="slide-in-left"]', { opacity: 0, x: -40 });
      gsap.set('[data-gsap="slide-in-right"]', { opacity: 0, x: 40 });
      gsap.set('[data-gsap="scale-in"]', { opacity: 0, scale: 0.85 });
      gsap.set('[data-gsap="fade-up-stagger"] > *', { opacity: 0, y: 30 });
      gsap.set('[data-gsap="list-03-stagger"] > li', { opacity: 0, x: -30 });
      gsap.set('[data-gsap="strip-stagger"] > *', { opacity: 0, x: 30 });
      gsap.set('[data-gsap="verbatim-stagger"] > *', { opacity: 0, y: 20 });

      // --- Individual entry triggers ---
      document.querySelectorAll('[data-gsap="fade-up"]').forEach((el) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="slide-in-left"]').forEach((el) => {
        gsap.to(el, {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="slide-in-right"]').forEach((el) => {
        gsap.to(el, {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="scale-in"]').forEach((el) => {
        gsap.to(el, {
          opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // --- Stagger containers ---
      document.querySelectorAll('[data-gsap="fade-up-stagger"]').forEach((parent) => {
        gsap.to(parent.children, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="list-03-stagger"]').forEach((parent) => {
        gsap.to(parent.querySelectorAll(':scope > li'), {
          opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: parent, start: 'top 75%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="strip-stagger"]').forEach((parent) => {
        gsap.to(parent.children, {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
        });
      });

      document.querySelectorAll('[data-gsap="verbatim-stagger"]').forEach((parent) => {
        gsap.to(parent.children, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.2,
          scrollTrigger: { trigger: parent, start: 'top 85%', once: true },
        });
      });
    });

    // Mobile with motion allowed - entry triggers only, no parallax, no tint scrub
    mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
      gsap.set('[data-gsap="fade-up"]', { opacity: 0, y: 20 });
      gsap.set('[data-gsap="slide-in-left"]', { opacity: 0, x: -20 });
      gsap.set('[data-gsap="slide-in-right"]', { opacity: 0, x: 20 });
      gsap.set('[data-gsap="scale-in"]', { opacity: 0, scale: 0.9 });
      gsap.set('[data-gsap="fade-up-stagger"] > *', { opacity: 0, y: 20 });
      gsap.set('[data-gsap="list-03-stagger"] > li', { opacity: 0, y: 20 });
      gsap.set('[data-gsap="strip-stagger"] > *', { opacity: 0, y: 20 });
      gsap.set('[data-gsap="verbatim-stagger"] > *', { opacity: 0, y: 20 });

      const selectors = [
        { sel: '[data-gsap="fade-up"]', to: { opacity: 1, y: 0 } },
        { sel: '[data-gsap="slide-in-left"]', to: { opacity: 1, x: 0 } },
        { sel: '[data-gsap="slide-in-right"]', to: { opacity: 1, x: 0 } },
        { sel: '[data-gsap="scale-in"]', to: { opacity: 1, scale: 1 } },
      ];
      selectors.forEach(({ sel, to }) => {
        document.querySelectorAll(sel).forEach((el) => {
          gsap.to(el, {
            ...to, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
      });

      ['fade-up-stagger', 'list-03-stagger', 'strip-stagger', 'verbatim-stagger'].forEach((name) => {
        const parents = document.querySelectorAll(`[data-gsap="${name}"]`);
        parents.forEach((parent) => {
          const children = name === 'list-03-stagger'
            ? parent.querySelectorAll(':scope > li')
            : parent.children;
          gsap.to(children, {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07,
            scrollTrigger: { trigger: parent, start: 'top 90%', once: true },
          });
        });
      });
    });
  </script>
```

- [ ] **Step 2: Verify in dev server**

Hard-reload the page (Cmd+Shift+R on Mac) to ensure the new script bundles.
Expected:
- Sections below the fold are initially invisible.
- As you scroll down, each section's heading (eyebrow + H2) fades up, the `styled-number` slides in from the left.
- Section 01's 4 info cards stagger in with 0.08s delay.
- Section 02's processus steps stagger in.
- Section 03's 7 list items stagger in from the left.
- Section 04's italic objection and large amber `"` scale in; response block slides in from the appropriate side.
- Section 05's hero quote fades up with its emerald `"` scaling in; the 3 strips stagger in from the right; the 2 verbatims fade up at the bottom.
- On reduced-motion (DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`): nothing animates, everything is immediately visible.
- On mobile viewport (DevTools device toolbar, ≤767px): animations still fire on entry but no parallax yet (parallax is Task 7).
- Check console: no import errors, no "ScrollTrigger not registered" warnings.

- [ ] **Step 3: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): add GSAP scroll entry triggers with matchMedia gates"
```

---

## Task 7: GSAP parallax (desktop only)

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - extend the desktop `mm.add(...)` block in the GSAP `<script>` added in Task 6.

**Rationale:** Add subtle scroll-linked Y translation to decorative elements: the two hero blobs and the two section-03 ambient glows. Each element moves at a different rate based on its `data-parallax-speed` attribute (px traveled across its parent scroll range).

- [ ] **Step 1: Add parallax code inside the desktop matchMedia block**

Inside the existing `mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => { ... })` in the script, append the following at the end of its body (still inside the arrow function):

```js
      // --- Parallax (hero blobs, section 03 glows) ---
      document.querySelectorAll('[data-parallax="hero-blob"]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '-80');
        const heroSection = el.closest('section');
        if (!heroSection) return;
        gsap.to(el, {
          y: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      document.querySelectorAll('[data-parallax="hero-mark"]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '-100');
        const heroSection = el.closest('section');
        if (!heroSection) return;
        gsap.to(el, {
          y: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      document.querySelectorAll('[data-parallax="section-03-glow"]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '-50');
        const section = el.closest('section');
        if (!section) return;
        gsap.to(el, {
          y: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
```

- [ ] **Step 2: Verify in dev server**

Hard-reload (Cmd+Shift+R).
Expected on desktop (≥768px width):
- Scroll slowly through the hero: the two blurred blobs drift upward at different rates, creating a depth effect.
- Scroll through section 03: the two ambient emerald glows drift slowly in opposite directions.
- The animation feels smooth - no jitter, no layout shift, CTA button position unchanged.
- On reduced-motion: no parallax (desktop matchMedia block doesn't run).
- On mobile: no parallax (handled by the separate mobile matchMedia block with no parallax code).

- [ ] **Step 3: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): add scroll-linked parallax on hero + section 03 glows"
```

---

## Task 8: GSAP tint wash scrub

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - extend the desktop `mm.add(...)` block further to add the tint wash scrub; also add a small mobile override to set a single static tint color (no scrub).

**Rationale:** The `.scroll-tint` overlay added in Task 1 has `background: var(--tint, transparent)`. A scrubbed timeline morphs the `--tint` custom property as the user scrolls the full document, creating an ambient color shift across sections.

- [ ] **Step 1: Add tint scrub to desktop matchMedia block**

Inside the desktop `mm.add(...)` arrow function body, after the parallax code, append:

```js
      // --- Scroll tint wash : ambient color morph across the page ---
      const tintEl = document.querySelector('.scroll-tint');
      if (tintEl) {
        // Color waypoints as rgba strings. Alpha drops near-zero over the
        // dark-editorial section (section 03) to avoid muddy blending.
        const tintTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
        tintTimeline
          .fromTo(tintEl,
            { '--tint': 'rgba(251, 240, 218, 0.10)' },
            { '--tint': 'rgba(180, 220, 195, 0.10)', duration: 1, ease: 'none' })
          .to(tintEl, { '--tint': 'rgba(15, 46, 31, 0.04)', duration: 0.8, ease: 'none' })
          .to(tintEl, { '--tint': 'rgba(245, 225, 200, 0.11)', duration: 1, ease: 'none' })
          .to(tintEl, { '--tint': 'rgba(240, 230, 215, 0.08)', duration: 0.8, ease: 'none' });
      }
```

- [ ] **Step 2: Add static tint to mobile matchMedia block**

Inside the mobile `mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => { ... })` block, at the top of the function body, add:

```js
      // On mobile, a single static tint - no scrubbing
      const tintElMobile = document.querySelector('.scroll-tint');
      if (tintElMobile) {
        tintElMobile.style.setProperty('--tint', 'rgba(251, 240, 218, 0.08)');
      }
```

- [ ] **Step 3: Verify in dev server**

Hard-reload on desktop.
Expected:
- Scroll slowly from top to bottom of the page. The ambient tint should shift:
  - Hero/top: warm cream wash
  - Around section 02/processus: softens to a slight emerald
  - Through section 03 (dark): tint nearly invisible (no muddy overlay)
  - Sections 04-05: warm cream/amber bias
  - Bottom (FAQ/formulaire): neutral warm
- The shift is subtle - the effect should be noticeable but never muddy or saturated.
- On reduced-motion: no shift (tint stays at default transparent since no scrub runs; the default CSS `background: var(--tint, transparent)` keeps it invisible).
- On mobile: single static warm tint, no shifts as you scroll.
- No visual flicker, no layout shift.
- Check the header/nav at the top: it should still be crisp and not washed out (nav is `z-40`, tint is `z-30`, nav sits above the tint).

- [ ] **Step 4: Commit**

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "feat(ajaccio): add ambient scroll-linked tint wash"
```

---

## Task 9: Accessibility + mobile + no-JS verification

**Files:**
- No code changes unless a defect is found.

**Rationale:** Verify the three critical fallback paths before declaring done: `prefers-reduced-motion: reduce`, mobile viewport behavior, and JavaScript disabled.

- [ ] **Step 1: Verify reduced-motion**

Open Chrome DevTools → three-dots menu → More tools → Rendering → scroll to "Emulate CSS media feature `prefers-reduced-motion`" → set to `reduce`. Hard-reload the page.

Expected:
- All content visible immediately (hero, sections 01-06, FAQ, formulaire). Nothing hidden at `opacity: 0`.
- No animations fire on scroll.
- The `.scroll-tint` overlay stays at `background: transparent` (CSS default, since no `--tint` variable is set).
- The hero's CSS `animate-float` on blobs still runs (that's a CSS keyframe, independent of JS). If you want that frozen too on reduced-motion, we can add a media-query override later - not in scope for this plan.

If any below-fold element is invisible, the `gsap.set` calls are running outside the matchMedia gate. Fix: verify all `gsap.set` calls are inside a matchMedia block.

- [ ] **Step 2: Verify mobile viewport**

DevTools → device toolbar (Cmd+Shift+M) → select an iPhone preset (≤767px width). Reload.

Expected:
- Layout collapses: section 03 shows single-column list, section 04 stacks (objection above response), section 05 stacks.
- Scrolling still triggers entry animations on headings, cards, list items, etc. Animations are shorter/smaller (y: 20 not 30).
- No parallax on hero blobs (they stay still relative to scroll).
- Tint wash stays static (single warm tone).
- No console errors.
- No horizontal scroll bar.

- [ ] **Step 3: Verify no-JS fallback**

DevTools → Command palette (Cmd+Shift+P) → "Disable JavaScript" → reload.

Expected:
- All content renders fully. Every section visible. No elements stuck at `opacity: 0`.
- Form doesn't submit via fetch (the existing form `<script>` is also gated by JS). That is expected and pre-existing - not caused by this change.
- No crashes, no blank sections.

Re-enable JavaScript before continuing.

- [ ] **Step 4: Verify build succeeds**

Stop `npm run dev` if running. Run:

```bash
npm run build
```

Expected: build completes without errors. GSAP imports bundle cleanly into the page's JS chunk.

If the build fails on the GSAP imports, check that the `<script>` block uses plain `<script>` (not `is:inline`). `is:inline` would skip bundling and break the ESM imports.

- [ ] **Step 5: Commit any fixes**

If any defect was found and fixed in this task, commit with:

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "fix(ajaccio): <short description of fix>"
```

If no defects, skip the commit.

---

## Task 10: Final pass - cleanup and visual polish

**Files:**
- Modify: `src/pages/creation-site-internet-ajaccio.astro` - only if cleanup needed.

**Rationale:** Remove any dead code left from the old section layouts. Tune values that felt off during verification.

- [ ] **Step 1: Audit for dead CSS**

Search the `<style>` block for CSS rules that no longer match anything after the redesigns:

- `.frein-card` and `.frein-card::before` / `.frein-card.solved::before` - the old card frame. **Delete these rules.** They were only used in the old section 04 twin cards.
- `.quote-mark` (the old section 01 quote style) - keep. Still used on the section 01 blockquote.
- `.card-subtle`, `.spotlight`, `.styled-number`, `.eyebrow`, all hero/layout classes - keep. Used elsewhere.

Use Grep to confirm before deleting:

```bash
# These should return NO matches (apart from the CSS definition itself)
```

Run Grep for `frein-card` in the file. If the only hits are inside the `<style>` block, delete the rules.

- [ ] **Step 2: Tune visual values (optional)**

On desktop, walk the full page once more. If any value feels off:

- Tint too strong → reduce alpha in Task 8's rgba values by 0.02.
- Tint too subtle → increase alpha by 0.02.
- Section 03 sticky column scrolls off too fast or overlaps → adjust `lg:top-32` to `lg:top-40` in the section-03-left div.
- Zig-zag in section 04 too offset → adjust `grid-column` values in `.frein-block--mirror .frein-response` (currently `1 / span 5`).
- Strip column in section 05 feels too crammed → change `space-y-8` to `space-y-10`.

Apply any tuning edits.

- [ ] **Step 3: Final build + commit**

```bash
npm run build
```

Expected: build completes without errors.

Commit cleanup (if any):

```bash
git add src/pages/creation-site-internet-ajaccio.astro
git commit -m "chore(ajaccio): remove dead CSS, tune visual values"
```

- [ ] **Step 4: Summary check**

Confirm all of the following are true:

- [ ] Sections 03, 04, 05 no longer use the identical-card grid pattern.
- [ ] Below-fold elements fade/slide in once on scroll, desktop only.
- [ ] Parallax runs on hero blobs and section-03 glows, desktop only.
- [ ] Tint overlay shifts color smoothly as you scroll, desktop only.
- [ ] Reduced-motion users see all content immediately with no animations.
- [ ] Mobile users see compact entry animations, no parallax, no scrub.
- [ ] JavaScript disabled: all content visible, page legible.
- [ ] `npm run build` passes.
- [ ] JSON-LD structured data, metadata, and form behavior unchanged.

If any of these is false, return to the relevant task and fix.

---

## Self-review notes

- Spec coverage: each spec section has a task. §Section 03 → Task 2. §Section 04 → Task 3. §Section 05 → Task 4. §GSAP tint wash → Task 8. §Parallax → Task 7. §Entry triggers → Task 6. §Accessibility + matchMedia → Task 6/7/8 (gates) + Task 9 (verification). §Technical integration → Task 1 (CSS + tint markup), Task 5 (data hooks), Task 6 (script block).
- Placeholder scan: no "TBD", "TODO", or vague steps found. Every step has exact code or exact commands.
- Type/selector consistency: data-attribute names consistent between markup tasks (2-5) and script task (6). Verified: `data-gsap="fade-up"`, `"slide-in-left"`, `"slide-in-right"`, `"scale-in"`, `"fade-up-stagger"`, `"list-03-stagger"`, `"strip-stagger"`, `"verbatim-stagger"`, plus `data-parallax="hero-blob"`, `"hero-mark"`, `"section-03-glow"`. CSS class names consistent: `.scroll-tint`, `.deliverable-row`, `.deliverable-index`, `.deliverable-icon`, `.frein-block`, `.frein-block--mirror`, `.frein-objection`, `.frein-response`, `.quote-mark-giant`, `.qm-amber`, `.qm-emerald`, `.testimonial-strip`.
- One risk worth flagging for the executor: the header in this project uses `z-40` (see `src/components/widgets/Header.astro:61`). The `.scroll-tint` overlay uses `z-30`, keeping the header above the tint. If the executor sees the header getting darkened by the multiply blend, they should drop the tint's z-index lower or verify the header's stacking context.
