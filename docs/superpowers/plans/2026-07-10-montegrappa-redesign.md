# Refonte Montegrappa : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer le design system Montegrappa (crème/sauge/charbon, Switzer light, layouts aérés) au site, home d'abord, sans aucune régression SEO.

**Architecture:** Tokens CSS globaux d'abord (toutes les pages héritent), puis composants réutilisables, puis chrome partagé (header/footer), puis les 14 sections de la home en place dans `src/pages/index.astro`. Spec : `docs/superpowers/specs/2026-07-10-montegrappa-homepage-redesign-design.md`.

**Tech Stack:** Astro 5, Tailwind 3 (`darkMode: 'class'`), GSAP 3.14 (+ ScrollTrigger), fonts Switzer locales, bun.

## Global Constraints

- **JAMAIS de `git commit`** : l'utilisateur gère ses commits lui-même (règle CLAUDE.md globale). Les étapes "commit" classiques sont remplacées par des points de vérification.
- **Invariants SEO (§2 du spec)** : title/description, 3 blocs JSON-LD, texte du H1, hiérarchie de headings, tous les textes visibles, tous les liens internes et ancres (`/#tarifs`, `id="tarifs"`, `id="faq"`), attributs `alt` existants. Aucune modification de contenu.
- **Ne PAS retirer `darkMode: 'class'`** de `tailwind.config.cjs` : sans lui la variante `dark:` repasse en stratégie `media` et réactive un dark mode cassé sur les pages internes. On supprime seulement tout ce qui pose la classe `.dark`.
- Pas de tirets longs dans tout texte ajouté (règle utilisateur).
- Pas de nouveau package npm : GSAP est déjà là.
- Téléchargements (font 300, photos Unsplash) : demander confirmation à l'utilisateur avant (fichier, source, taille), tâches 1b et 10.
- Après chaque tâche : `bun run build` doit passer.

## Palette de référence (spec §3.1)

```css
--mg-cream: #F2F0EB;    /* fond page */
--mg-sand: #E5E2D9;     /* sections alternées */
--mg-sage: #8C9A84;     /* surfaces accent (badges, boutons) */
--mg-sage-dark: #5F6B57;/* liens, texte accent (AA sur crème) */
--mg-charcoal: #1D1D1B; /* footer, titres */
--mg-text: #3B3B38;
```

Règle : `--mg-sage` jamais en couleur de texte sur fond clair ; les textes accent utilisent `--mg-sage-dark`.

---

### Task 0: Baseline SEO (référence avant travaux)

**Files:** aucun fichier source ; produit `scratchpad/baseline-home.txt`.

- [ ] **Step 1: Build de référence**

Run: `cd /Users/davidbarbier/dev/MyPortfolio && bun run build`
Expected: succès. Localiser le HTML : `find .vercel dist -name 'index.html' -path '*static*' 2>/dev/null | head -3` (adapter vercel : sortie sous `.vercel/output/static/`).

- [ ] **Step 2: Extraire le texte visible et les JSON-LD de la home**

```bash
python3 - <<'EOF'
import re, html, json, pathlib
src = pathlib.Path('.vercel/output/static/index.html').read_text()  # ajuster le chemin trouvé au step 1
schemas = re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', src, re.S)
body = re.sub(r'<script.*?</script>|<style.*?</style>', '', src, flags=re.S)
text = html.unescape(re.sub(r'<[^>]+>', '\n', body))
text = '\n'.join(l.strip() for l in text.splitlines() if l.strip())
out = pathlib.Path('<SCRATCHPAD>/baseline-home.txt')
out.write_text(text + '\n===SCHEMAS===\n' + '\n'.join(schemas))
print('schemas:', len(schemas), '| lines:', len(text.splitlines()))
EOF
```
Expected: `schemas: 3` minimum (WebSite + LocalBusiness graph + FAQPage) et plusieurs centaines de lignes. Ce fichier sert de référence au diff final (Task 11).

### Task 1: Tokens, fonts, suppression du dark mode

**Files:**
- Modify: `src/components/CustomStyles.astro` (réécriture complète)
- Modify: `tailwind.config.cjs` (couleurs mg-*)
- Modify: `src/assets/styles/tailwind.css` (`.btn`, `.btn-primary`, `#header.scroll`)
- Modify: `src/config.yaml` (UI theme → `light:only` si clé présente)
- Modify: `src/layouts/PageLayout.astro` (retirer `showToggleTheme`)
- Modify: `src/components/widgets/Header.astro` (retirer import/usage `ToggleTheme` s'il y en a un ; sinon rien)
- Modify: `src/layouts/Layout.astro` (CTA flottant emerald → sauge)
- Delete: `public/fonts/clash-display-400.woff2`, `public/fonts/clash-display-500.woff2` (après vérif qu'aucune autre page ne référence Clash Display en dur : `grep -ri "clash" src/`)

**Interfaces (produit pour toutes les tâches suivantes):** classes Tailwind `bg-cream`, `bg-sand`, `bg-sage`, `text-sage-dark`, `bg-charcoal`, `text-charcoal`, variables `--mg-*`. Titres h1-h6 en Switzer 300 par défaut.

- [ ] **Step 1: Nouveau `CustomStyles.astro`**

```astro
---
---

<style is:inline is:global>
  /* Switzer - famille unique (300 titres, 400 texte, 500 emphase) */
  @font-face {
    font-family: 'Switzer';
    src: url('/fonts/switzer-300.woff2') format('woff2');
    font-weight: 300;
    font-display: swap;
    font-style: normal;
  }
  @font-face {
    font-family: 'Switzer';
    src: url('/fonts/switzer-400.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
    font-style: normal;
  }
  @font-face {
    font-family: 'Switzer';
    src: url('/fonts/switzer-500.woff2') format('woff2');
    font-weight: 500;
    font-display: swap;
    font-style: normal;
  }

  :root {
    --mg-cream: #F2F0EB;
    --mg-sand: #E5E2D9;
    --mg-sage: #8C9A84;
    --mg-sage-dark: #5F6B57;
    --mg-charcoal: #1D1D1B;
    --mg-text: #3B3B38;

    --aw-font-sans: 'Switzer';
    --aw-font-serif: 'Switzer';
    --aw-font-heading: 'Switzer';

    --aw-color-primary: var(--mg-sage-dark);
    --aw-color-secondary: var(--mg-charcoal);
    --aw-color-accent: var(--mg-sage);
    --aw-color-accent-light: var(--mg-sand);

    --aw-color-text-heading: var(--mg-charcoal);
    --aw-color-text-default: var(--mg-text);
    --aw-color-text-muted: rgb(59 59 56 / 62%);
    --aw-color-bg-page: var(--mg-cream);

    /* conservé : des classes bg-dark subsistent sur les pages internes */
    --aw-color-bg-page-dark: var(--mg-charcoal);
  }

  h1, h2, h3, h4, h5, h6,
  .font-heading {
    font-family: var(--aw-font-heading), system-ui, sans-serif !important;
    font-weight: 300 !important;
    letter-spacing: -0.02em;
  }

  h1 *, h2 *, h3 *, h4 * {
    font-family: inherit !important;
    font-weight: inherit !important;
  }
</style>
```

Le bloc `.dark { ... }` disparaît. Si la font 300 n'est pas encore téléchargée (Task 1b), le navigateur retombe sur la 400 : acceptable en transitoire.

- [ ] **Step 2: Couleurs dans `tailwind.config.cjs`**

Ajouter dans `theme.extend.colors` (en conservant l'existant) :

```js
cream: 'var(--mg-cream)',
sand: 'var(--mg-sand)',
sage: 'var(--mg-sage)',
'sage-dark': 'var(--mg-sage-dark)',
charcoal: 'var(--mg-charcoal)',
```

`darkMode: 'class'` reste tel quel (contrainte globale).

- [ ] **Step 3: Boutons et header scroll dans `tailwind.css`**

```css
.btn {
  @apply inline-flex items-center justify-center rounded-full border border-black/15 bg-transparent font-medium text-center text-base text-page leading-snug transition py-3.5 px-6 md:px-8 ease-in duration-200 focus:ring-sage focus:ring-2 focus:ring-offset-2 hover:border-black/40;
}

.btn-primary {
  @apply font-medium bg-sage text-white border-sage hover:bg-sage-dark hover:border-sage-dark hover:text-white;
}
```

`#header.scroll > div:first-child` : remplacer `md:bg-white/90` par `md:bg-cream/90` (garder le backdrop-blur), remplacer la box-shadow par `box-shadow: none; border-bottom: 1px solid rgb(0 0 0 / 8%);`. Supprimer le bloc `.dark #header.scroll ...`.

- [ ] **Step 4: Neutraliser le dark mode à la source**

- `src/config.yaml` : si une clé `ui.theme` existe, la passer à `'light:only'` (ainsi `ApplyColorMode` ne pose jamais `.dark`, même avec un vieux `localStorage.theme = 'dark'`).
- `PageLayout.astro` : `<Header {...headerData} isSticky showRssFeed />` (retirer `showToggleTheme`).
- Vérifier `Header.astro` : la prop `showToggleTheme` peut rester dans l'interface, mais aucun `<ToggleTheme />` ne doit être rendu (l'actuel n'en rend déjà pas : import mort à retirer).

- [ ] **Step 5: CTA flottant dans `Layout.astro`**

Remplacer les deux occurrences `bg-emerald-700 hover:bg-emerald-600` par `bg-sage hover:bg-sage-dark`.

- [ ] **Step 6: Vérifier**

Run: `bun run build`
Expected: succès. Puis `bun run dev` et contrôle visuel rapide : fond crème partout, boutons sauge, plus aucun basculement sombre (tester avec DevTools en `prefers-color-scheme: dark`).

### Task 1b: Télécharger Switzer 300 (permission utilisateur requise)

**Files:** Create: `public/fonts/switzer-300.woff2`

- [ ] **Step 1:** Demander confirmation à l'utilisateur : fichier `switzer-300.woff2` (~16 Ko) depuis Fontshare (api.fontshare.com, licence ITF gratuite, même source que les 400/500 existants).
- [ ] **Step 2:** Après accord : `curl -L 'https://api.fontshare.com/v2/css?f[]=switzer@300' -H 'User-Agent: Mozilla/5.0'` pour obtenir l'URL du woff2, puis `curl -o public/fonts/switzer-300.woff2 '<url>'`. Vérifier : `file public/fonts/switzer-300.woff2` → "Web Open Font Format".

### Task 2: Composants réutilisables

**Files:**
- Create: `src/components/ui/PillBadge.astro`
- Create: `src/components/ui/StatBig.astro`
- Create: `src/components/ui/NumberedAccordion.astro`
- Create: `src/components/widgets/ImageStrip.astro`
- Create: `src/components/animations/MontegrappaFx.astro`

**Interfaces (produit):**
- `PillBadge`: props `{ text: string; variant?: 'solid' | 'outline'; class?: string }`
- `StatBig`: props `{ value: string; label: string; class?: string }`
- `NumberedAccordion`: props `{ items: Array<{ title: string; description: string }> }`
- `ImageStrip`: props `{ images: Array<{ src: ImageMetadata; alt: string }> }`
- `MontegrappaFx`: aucun prop ; anime `[data-text-reveal]` (révélation mot à mot, texte brut uniquement), `[data-fade-up]` (fondu montant), `[data-image-strip-track]` (dérive horizontale au scroll)

- [ ] **Step 1: `PillBadge.astro`**

```astro
---
export interface Props {
  text: string;
  variant?: 'solid' | 'outline';
  class?: string;
}
const { text, variant = 'solid', class: className = '' } = Astro.props;
---

<span
  class:list={[
    'inline-flex items-center rounded px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em]',
    variant === 'solid' ? 'bg-sage text-white' : 'border border-black/15 text-muted',
    className,
  ]}
>
  {text}
</span>
```

- [ ] **Step 2: `StatBig.astro`**

```astro
---
export interface Props {
  value: string;
  label: string;
  class?: string;
}
const { value, label, class: className = '' } = Astro.props;
---

<div class:list={['border-t border-black/10 pt-6', className]} data-fade-up>
  <p class="text-5xl md:text-7xl font-light text-charcoal leading-none tracking-tight">{value}</p>
  <p class="mt-2 text-sm text-muted uppercase tracking-wide">{label}</p>
</div>
```

- [ ] **Step 3: `NumberedAccordion.astro`**

```astro
---
export interface Props {
  items: Array<{ title: string; description: string }>;
}
const { items } = Astro.props;
---

<div class="border-y border-black/10 divide-y divide-black/10">
  {
    items.map((item, i) => (
      <details class="group py-6" open={i === 0}>
        <summary class="flex cursor-pointer list-none items-center gap-6 marker:content-none [&::-webkit-details-marker]:hidden">
          <span class="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded bg-sage/20 text-xs font-medium tracking-widest text-sage-dark transition-colors group-open:bg-sage group-open:text-white">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 class="text-2xl md:text-3xl text-charcoal">{item.title}</h3>
        </summary>
        <p class="mt-4 max-w-2xl pl-[4.5rem] text-muted leading-relaxed">{item.description}</p>
      </details>
    ))
  }
</div>
```

- [ ] **Step 4: `ImageStrip.astro`**

```astro
---
import { Image } from 'astro:assets';

export interface Props {
  images: Array<{ src: ImageMetadata; alt: string }>;
}
const { images } = Astro.props;
---

<div class="overflow-hidden" data-image-strip>
  <div class="flex gap-4 md:gap-6 will-change-transform" data-image-strip-track>
    {
      images.map(({ src, alt }, i) => (
        <Image
          src={src}
          alt={alt}
          widths={[400, 800]}
          class="h-56 md:h-80 w-64 md:w-96 flex-none rounded-xl object-cover"
          loading={i < 3 ? 'eager' : 'lazy'}
        />
      ))
    }
  </div>
</div>
```

Largeur et hauteur fixes sur chaque image : zéro CLS (spec §7).

- [ ] **Step 5: `MontegrappaFx.astro`**

```astro
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    // Révélation mot à mot : UNIQUEMENT sur des éléments à texte brut
    // (les titres contenant des <span> colorés utilisent data-fade-up)
    document.querySelectorAll<HTMLElement>('[data-text-reveal]').forEach((el) => {
      if (el.dataset.mgSplit) return;
      el.dataset.mgSplit = 'true';
      const words = (el.textContent ?? '').trim().split(/\s+/);
      el.innerHTML = words.map((w) => `<span class="mg-word inline-block">${w}</span>`).join(' ');
      gsap.fromTo(
        el.querySelectorAll('.mg-word'),
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', scrub: true },
        }
      );
    });

    document.querySelectorAll('[data-fade-up]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        }
      );
    });

    document.querySelectorAll('[data-image-strip-track]').forEach((track) => {
      gsap.to(track, {
        x: -120,
        ease: 'none',
        scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });
  }

  document.addEventListener('astro:page-load', init);
</script>
```

Texte présent dans le HTML initial, animé en opacité seulement : sans JS tout reste lisible (spec §6).

- [ ] **Step 6: Vérifier**

Run: `bun run build`
Expected: succès (les composants ne sont pas encore consommés, on vérifie juste la compilation).

### Task 3: Header + bandeau annonce

**Files:**
- Modify: `src/components/widgets/Header.astro`

- [ ] **Step 1:** Ajouter au-dessus du `<header>` (dans le même fichier, avant l'élément header) un bandeau statique :

```astro
<div class="bg-sand text-center py-1.5 px-4 text-[11px] uppercase tracking-[0.2em] text-muted">
  Devis sous 48 h · Sites livrés en 4 à 6 semaines
</div>
```

- [ ] **Step 2:** Nettoyage des classes : `border-gray-50/0` → `border-black/5` ; retirer l'import mort `ToggleTheme` ; dans le dropdown-menu remplacer `md:bg-white/90` par `md:bg-cream/95` et retirer `dark:md:bg-dark` ; remplacer `md:hover:bg-gray-100` par `md:hover:bg-sand` et retirer les `dark:*` du fichier. Le bouton action garde `.btn-primary` (devenu sauge via Task 1).
- [ ] **Step 3:** Vérifier : `bun run dev`, header crème avec bandeau sand, dropdowns lisibles, bouton « Me contacter » sauge, version mobile OK (ToggleMenu).

### Task 4: Footer charbon + wordmark

**Files:**
- Modify: `src/components/widgets/Footer.astro`

- [ ] **Step 1:** Restyler sans toucher au contenu ni aux liens :
  - `<footer>` : `relative bg-charcoal text-[#EDEBE4] not-prose` (plus de bordure grise, plus de `dark:`) ; supprimer le div overlay `bg-white dark:bg-dark`.
  - Titres de colonnes (« Ajaccio », « Limoges », « Experts-comptables ») : les envelopper dans `<p class="text-[11px] uppercase tracking-[0.2em] text-[#EDEBE4]/50 mb-3">`.
  - Liens : `text-[#EDEBE4]/70 hover:text-white transition` (retirer text-muted/dark:*).
  - Icônes sociales : `text-[#EDEBE4]/60 hover:text-white`, retirer les hovers gris.
  - Bloc coordonnées : `text-[#EDEBE4]/70`.
- [ ] **Step 2:** Wordmark géant avant la fermeture du conteneur :

```astro
<p aria-hidden="true" class="select-none pointer-events-none font-light leading-none tracking-tight text-[#EDEBE4]/15 text-[13vw] whitespace-nowrap overflow-hidden pt-8 pb-4">
  DAVID BARBIER
</p>
```

`aria-hidden` : purement décoratif, le nom est déjà dans le contenu du footer.

- [ ] **Step 3:** Vérifier visuellement sur `/` et `/agence-seo-ajaccio/` (héritage sans casse), mobile inclus (le `text-[13vw]` tient sur une ligne).

### Task 5: Home : hero, bande stats, image strip, logos

**Files:**
- Modify: `src/pages/index.astro` (lignes ~247-305 : Hero2 + LogoMarquee)
- Modify: `src/components/animations/HeroAnimations.astro` (adapter les sélecteurs si besoin)

- [ ] **Step 1:** Remplacer le bloc `<Hero2 ...>...</Hero2>` par une section directe dans `index.astro` :

```astro
<section class="relative bg-cream pt-16 md:pt-24 pb-12 overflow-hidden">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
    <div class="mb-8" data-fade-up><PillBadge text="Freelance · Ancien auditeur EC" /></div>
    <h1 class="text-charcoal text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.05]">
      Création de site internet et référencement à Ajaccio
    </h1>
    <p class="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
      Sites internet sur-mesure pour TPE et experts-comptables. Je commence par comprendre votre métier, votre histoire, vos valeurs pour les retranscrire au mieux.
    </p>
    <div class="mt-10">
      <a href="tel:+33623565299" class="btn-primary btn">
        {t('portfolio.bookCall')}
      </a>
    </div>
  </div>
  <div class="mt-16">
    <ImageStrip
      images={[
        { src: HeroImage, alt: "Plage de Barbicaja sur la route des Sanguinaires, près d'Ajaccio en Corse" },
        { src: ServiceCreation, alt: "Texture abstraite d'ondulations pour le service de création de site web" },
        { src: ServiceSeo, alt: 'Texture de lumière à travers le feuillage pour le service SEO' },
        { src: ServiceDev, alt: 'Texture de bois pour le service de développement sur-mesure' },
        { src: ServiceMaintenance, alt: 'Texture de roche et mousse pour le service de maintenance' },
      ]}
    />
  </div>
</section>
```

H1 et sous-titre : texte strictement identique à l'actuel. Imports à ajouter en frontmatter : `PillBadge`, `StatBig`, `NumberedAccordion`, `ImageStrip`, `MontegrappaFx` ; l'import `Hero2` devient inutile et se retire (les images Service* restent importées).

- [ ] **Step 2:** Bande stats sous le hero (remplace le slot content de Hero2) :

```astro
<section class="bg-cream py-14 md:py-20">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
    <StatBig value="+50" label="clients accompagnés" />
    <StatBig value="+5" label="ans d'expérience" class="sm:mt-10" />
    <StatBig value="5/5" label="étoiles sur Google" class="sm:mt-20" />
  </div>
</section>
```

Décalages verticaux `sm:mt-*` : effet escalier du template. Ajouter `<MontegrappaFx />` en fin de page (une seule fois).

- [ ] **Step 3:** `HeroAnimations.astro` ciblait probablement `[data-hero-stat]` : lire le fichier ; si ses sélecteurs ne matchent plus, retirer le composant de la home (les stats sont désormais animées par `data-fade-up`) plutôt que de le laisser mort.
- [ ] **Step 4:** LogoMarquee : dans `LogoMarquee.astro`, fond → `bg-cream`, ajouter `opacity-70` + `grayscale` sur les logos si pas déjà le cas (lire le fichier d'abord ; ne pas toucher à la mécanique du défilement).
- [ ] **Step 5:** Vérifier : dev server, hero centré typo light, strip défile légèrement au scroll, stats en escalier, H1 inchangé au caractère près (`grep "Création de site internet et référencement à Ajaccio" src/pages/index.astro`).

### Task 6: Home : services, bandeau EC, comparatif

**Files:**
- Modify: `src/components/widgets/Features2.astro` (lire d'abord ; utilisé aussi ailleurs : `grep -rl "Features2" src/pages` et vérifier l'impact)
- Modify: `src/pages/index.astro` (sections bandeau EC ~l.397-423 et comparatif ~l.425-472)

- [ ] **Step 1:** `Features2.astro` : remplacer le style carte actuel par : image plein cadre en haut (`rounded-xl`, ratio fixe), label du service par-dessus l'image en haut à gauche (petit, uppercase, blanc), corps sous hairline `border-t border-black/10` avec description, liste, prix en `text-4xl font-light text-charcoal`, CTA en lien `text-sage-dark`. Conserver TOUS les props existants (callToAction, callToAction2, ecLink, price, servicesItems) et leur rendu : seuls les classes/agencement changent. Retirer les classes `dark:` du fichier. Si d'autres pages consomment Features2, vérifier leur rendu après coup (elles héritent du nouveau style, acceptable selon spec §1).
- [ ] **Step 2:** Bandeau EC (`index.astro`) : `bg-emerald-800 dark:bg-emerald-900` → `bg-sage` ; le bouton `bg-white text-green-800 hover:bg-green-50` → `bg-cream text-charcoal hover:bg-white` ; pastille icône `bg-amber-500/20`/`text-amber-400` → `bg-white/20`/`text-white` ; `text-green-100` → `text-white/80`. Texte et lien inchangés.
- [ ] **Step 3:** Comparatif agence/freelance : section `bg-gradient-to-b from-amber-50/50...` → `bg-sand` ; carte agence : `bg-cream border border-black/10` ; carte solo : `bg-sage text-white border-0` avec textes `text-white/90`, label `text-white/70` ; ✓ → `text-white`, ✕ → `text-charcoal/40` ; label kicker (`text-gray-400` + point ambre) → `text-muted` + point `bg-sage` (sur la carte crème) ; le `text-emerald-700` du H2 span → `text-sage-dark` ; lien bas `text-emerald-700` → `text-sage-dark`. Retirer tous les `dark:` de ces deux sections.
- [ ] **Step 4:** Vérifier : build + visuel. Contraste : texte blanc sur `#8C9A84` valide AA en gras/grande taille ; les petits textes de la carte sauge passent en `text-white` pur si `white/90` échoue au contrôle (vérifier avec un contrast checker : ratio minimal 4.5:1).

### Task 7: Home : avis, projets, process

**Files:**
- Modify: `src/pages/index.astro` (avis ~l.474-585, projets ~l.587-724, process ~l.726-758)

- [ ] **Step 1:** Avis Google : layout du template : dans l'en-tête de section, passer badge + H2 alignés à gauche dans un flex avec les flèches prev/next à droite (mêmes boutons, `bg-charcoal hover:bg-sage` à la place d'emerald). Blockquote : `text-2xl md:text-3xl font-light` (au lieu de font-bold). Avatar `from-amber-600 to-amber-400` → `bg-sage`. Section `bg-gray-50 dark:bg-slate-800` → `bg-cream`. Kicker point ambre → sauge. Lien Google `text-emerald-700` → `text-sage-dark`. JS du carousel intouché.
- [ ] **Step 2:** Projets : conserver grille + Flip. Recolorer : cartes `bg-gray-50 dark:bg-slate-800` → `bg-sand/60` ; browser frames `bg-gray-100` → `bg-sand` ; badge Featured ambre → `bg-sage/20 text-sage-dark` ; badges tech gris inchangés en logique mais `bg-sand text-muted` ; métriques `text-green-700 dark:text-green-400` → `text-sage-dark` et `font-light` ; liens « Voir le site » → `text-sage-dark` ; H2 span `text-emerald-700` → `text-sage-dark` ; CTA bas `bg-emerald-700 hover:bg-emerald-600` → `bg-sage hover:bg-sage-dark`. Retirer les `dark:` de la section. Vérifier ensuite `ProjectsFlip.astro` : si des couleurs emerald y sont codées en dur, les aligner.
- [ ] **Step 3:** Process 4 étapes : remplacer le `<ol>` de cartes par `NumberedAccordion` :

```astro
<NumberedAccordion
  items={[
    { title: 'On se rencontre, on cadre', description: "Un appel pour comprendre votre métier, vos clients et ce que le site doit vous rapporter." },
    { title: 'Vous voyez à quoi ça ressemble', description: 'Une maquette validée avant que la moindre ligne ne soit écrite. Allers-retours illimités.' },
    { title: 'Le site prend vie', description: 'Vous suivez la construction sur une adresse en ligne, et vous commentez au fur et à mesure.' },
    { title: 'Mise en ligne et formation', description: "Une heure en visio, des tutos vidéo, et vous repartez autonome sur vos contenus." },
  ]}
/>
```

ATTENTION sémantique : les titres d'étapes passent de `<h3>` dans des cartes à `<h3>` dans l'accordéon (NumberedAccordion les rend en h3) : hiérarchie inchangée. Textes strictement identiques (copiés de l'existant). En-tête de section : kicker → sauge, H2 span emerald → `text-sage-dark`.
- [ ] **Step 4:** Vérifier : build + visuel + navigation clavier de l'accordéon (Tab + Entrée ouvre/ferme), premier item ouvert par défaut.

### Task 8: Home : tarifs, FAQ, blog, maps

**Files:**
- Modify: `src/pages/index.astro` (tarifs ~l.760-806, FAQ ~l.808-833, maps ~l.842-856)
- Modify: `src/components/widgets/BlogLatestPosts.astro` + le composant de grille qu'il utilise (lire d'abord)

- [ ] **Step 1:** Tarifs : section gradient ambre → `bg-sand` ; carte sur-mesure `border-2 border-emerald-500 bg-emerald-50` → `border border-sage bg-cream` ; carte maintenance `border-gray-200 bg-white` → `border-black/10 bg-cream` ; prix `text-4xl font-bold` → `text-5xl md:text-6xl font-light text-charcoal` ; ✓ emerald → `text-sage-dark` ; labels uppercase → `text-sage-dark` (carte 1) et `text-muted` (carte 2) ; lien maintenance → `text-sage-dark`. `id="tarifs"` et tous les textes/liens conservés. Retirer les `dark:`.
- [ ] **Step 2:** FAQ : remplacer les cartes `rounded-2xl border` par des items hairline empilés : conteneur `divide-y divide-black/10 border-y border-black/10`, chaque `<details>` en `py-5` sans bordure propre, `+` → `text-sage-dark`. `id="faq"`, `HOME_FAQ`, `<details>/<summary>` et balisage FAQPage inchangés.
- [ ] **Step 3:** Blog : dans `BlogLatestPosts.astro` (et sa grille), épurer : images `rounded-xl`, titres `font-light text-charcoal`, retrait des `dark:` du chemin utilisé par la home uniquement. Ne pas modifier les composants du blog interne (`[blog]/`) au-delà de ce que la home consomme.
- [ ] **Step 4:** Maps : envelopper l'iframe : section `bg-sand py-16` > conteneur `max-w-6xl mx-auto px-4 sm:px-6` > div `rounded-xl overflow-hidden h-[400px] relative`. Iframe et title inchangés.
- [ ] **Step 5:** Vérifier : build + visuel + `grep -c 'id="tarifs"\|id="faq"' src/pages/index.astro` → 2.

### Task 9: Home : CTA final plein écran

**Files:**
- Modify: `src/pages/index.astro` (CTA ~l.857-870)

- [ ] **Step 1:** Remplacer la section gradient emerald par une section plein écran sur image (Barbicaja en attendant les photos corses de Task 10) :

```astro
<section class="relative min-h-[80vh] flex flex-col justify-between overflow-hidden">
  <Image src={HeroImage} alt="" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
  <div class="absolute inset-0 bg-charcoal/45" aria-hidden="true"></div>
  <div class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 w-full">
    <h2 class="text-white text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.05] max-w-3xl">Prêt à démarrer ?</h2>
    <p class="mt-4 text-lg text-white/85 max-w-xl">Contactez-moi pour une consultation gratuite.</p>
  </div>
  <div class="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20 w-full grid md:grid-cols-2 gap-10 items-end">
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 text-white">
      <div>
        <p class="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Téléphone</p>
        <a href="tel:+33623565299" class="text-lg hover:underline">06 23 56 52 99</a>
      </div>
      <div>
        <p class="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Adresse</p>
        <p class="text-lg">13 Bd Sampiero<br />20000 Ajaccio</p>
      </div>
      <div>
        <p class="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Email</p>
        <a href="mailto:hello@davidbarbier.com" class="text-lg hover:underline">hello@davidbarbier.com</a>
      </div>
    </div>
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white max-w-md md:justify-self-end">
      <p class="text-2xl mb-6">Discutons de votre projet</p>
      <a href="mailto:hello@davidbarbier.com" class="btn bg-cream text-charcoal border-cream hover:bg-white hover:border-white">Envoyer un email</a>
      <p class="mt-6 text-sm text-white/70">
        Basé à Ajaccio, j'accompagne aussi des clients à <a href="/limoges/" class="underline underline-offset-2 hover:text-white transition-colors">Limoges</a> et partout en France.
      </p>
    </div>
  </div>
</section>
```

Le H2 « Prêt à démarrer ? », le texte consultation, le CTA email et la phrase Limoges avec son lien : identiques à l'existant. L'image de fond a `alt=""` (décorative, Barbicaja est déjà décrite dans le hero).
- [ ] **Step 2:** Vérifier : contraste du texte blanc sur l'overlay `charcoal/45` (zones claires de la photo incluses), rendu mobile (colonnes empilées).

### Task 10: Photos corses (permission utilisateur requise)

**Files:**
- Create: `src/assets/images/corse-*.jpg` (3-4 fichiers)
- Modify: `src/pages/index.astro` (ImageStrip + CTA final)

- [ ] **Step 1:** Proposer à l'utilisateur 3-4 photos Unsplash (licence Unsplash, gratuite) : maquis/golfe d'Ajaccio, montagne corse, mer. Donner URL, auteur, poids. Attendre son accord (alternative : il fournit ses propres photos).
- [ ] **Step 2:** Après accord : télécharger en ~1600px de large, nommer `corse-golfe-ajaccio.jpg` etc., alt descriptifs en français nommant le lieu réel. Remplacer 2-3 textures de l'ImageStrip et l'image du CTA final si une photo s'y prête mieux que Barbicaja.
- [ ] **Step 3:** `bun run build` : vérifier le poids des images optimisées générées.

### Task 11: Vérification finale (checklist spec §7)

**Files:** aucun.

- [ ] **Step 1:** `bun run build` : succès.
- [ ] **Step 2:** Re-extraire le texte + schemas (même script que Task 0, sortie `scratchpad/after-home.txt`), puis `diff scratchpad/baseline-home.txt scratchpad/after-home.txt`. Écarts admis UNIQUEMENT : texte du bandeau annonce header, labels du CTA final (« Téléphone », « Adresse », « Email »), wordmark footer, disparition d'éventuels labels du template Hero2. Tout autre écart = régression à corriger.
- [ ] **Step 3:** Vérifier les 3 JSON-LD dans le HTML buildé : `python3 -c "..."` (parse + `json.loads` de chaque bloc, vérifier `@type` LocalBusiness, FAQPage, WebSite présents).
- [ ] **Step 4:** Passe visuelle complète au navigateur (dev server) : home desktop + mobile (DevTools 375px), header/footer sur `/a-propos/`, `/agence-seo-ajaccio/`, un article de blog. Vérifier qu'aucune page interne n'est cassée par les nouveaux tokens.
- [ ] **Step 5:** Accessibilité : navigation clavier (accordéons process + FAQ, carousel avis), `prefers-reduced-motion` (animations coupées), contrastes des nouveaux couples (blanc/sauge, sage-dark/crème, blanc/charcoal-overlay).
- [ ] **Step 6:** Signaler à l'utilisateur : refonte terminée, fichiers modifiés listés, prêt pour SES commits (aucun commit fait par l'agent).
