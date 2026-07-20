# Refonte Montegrappa : page hub agence-web-expert-comptable

> **Amendement (2026-07-17, après revue de David) :** les sections 02 et 05 ci-dessous sont remplacées. Les offres utilisent `ServicesShowcase` (le même accordéon à photos que la home, prop `id` ajouté pour l'ancre `#offres`) ; `OfferCard` est supprimé. Les articles utilisent `widgets/CardSlider.astro` (slider horizontal Montegrappa, extrait du carousel avis de la home qui l'utilise désormais aussi). Sections renumérotées : 01 parcours, 02 différenciation, 03 cas client, 04 contact, 05 FAQ (offres et articles portent les en-têtes à badge de la home, sans numéro).

**Objectif :** aligner `src/pages/agence-web-expert-comptable/index.astro` sur le design system Montegrappa (crème/sauge/charbon, Switzer light) en réutilisant les composants créés pour la home, sans toucher aux titres ni aux textes, à l'exception des deux suppressions validées ci-dessous.

**Référence :** design system dans `docs/superpowers/specs/2026-07-10-montegrappa-homepage-redesign-design.md` (palette §3.1, invariants §2). Composants disponibles : `SectionHeader`, `CheckList`, `ArrowLink`, `ArrowRight`, `FaqItems`, `PillBadge`, `StatBig`, `MontegrappaFx`, classes `.btn`, `.btn-primary`, `.btn-cream`.

## Décisions validées par David (2026-07-17)

- Titres et textes **intégralement conservés**, y compris les mentions « Astro » (validé explicitement : on les garde).
- **Deux suppressions autorisées**, section 03 uniquement : les tuiles « 100% code sur mesure » et « Ancien EC mémorialiste » (doublons stricts du hero et de la section 01). Aucune autre suppression de texte.
- Chaque section est remplacée par le composant indiqué dans le mapping ci-dessous (validé).

## Invariants SEO (contrat de vérification)

- `title` et `description` du frontmatter inchangés.
- H1 inchangé au caractère près : « Agence Web / pour Experts-Comptables » (2 spans).
- Les 3 JSON-LD (ProfessionalService, FAQPage, BreadcrumbList) strictement identiques.
- Ancres `id="offres"` (ciblée par le CTA hero) et `id="faq"` conservées.
- Tous les liens internes conservés : 4 offres, `/lbg-expertise-ec-marseille/`, les 7 liens articles, `/blog/`, les liens maintenance et SEO dans les réponses FAQ.
- Formulaire Formspree intact : action, noms de champs (`name`, `email`, `cabinet`, `textarea`, `disclaimer`), champ hidden `source`, checkbox RGPD.
- `LeadMagnetForm` conservé tel quel en fin de page.
- Vérification : diff du texte rendu avant/après (méthode Task 0/11 du plan home). Seuls écarts admis : les titres et descriptions des 2 tuiles supprimées.

## Composants : extensions et création

### 1. `SectionHeader` : nouveau prop `number?: string` (extension)

Rend, au-dessus du kicker, le numéro de section en « gros chiffre fin » (traitement du process de la home) :

```astro
{number && (
  <span class="block text-5xl md:text-6xl font-light text-sage-dark leading-none tracking-tight mb-4" aria-hidden="true">
    {number}
  </span>
)}
```

Prop optionnel : les usages home restent inchangés. Réutilisable sur les autres pages du silo qui ont la même numérotation 01-07.

### 2. `FaqItems` : réponses HTML (extension)

Les réponses de la FAQ EC contiennent plusieurs paragraphes et des liens `<a>`. Le rendu de la réponse passe de `{item.a}` à un conteneur `set:html` :

```astro
<div class="mt-4 text-sm md:text-base text-muted leading-relaxed max-w-3xl space-y-3" set:html={item.a} />
```

- Les réponses EC deviennent des chaînes HTML (`"<p>…</p><p>…</p>"`) avec textes et liens identiques ; les liens passent en `text-sage-dark hover:text-charcoal underline underline-offset-2`.
- La FAQ home (chaînes brutes sans balise) reste rendue à l'identique par le même composant.
- Contenu maîtrisé (constantes du repo), pas de contenu utilisateur : `set:html` sans risque.

### 3. `OfferCard.astro` (nouveau, `src/components/ui/`)

Carte d'offre pour les hubs de silo. Interface :

```ts
export interface Props {
  title: string;
  description: string;
  href: string;
  linkText?: string;   // défaut : « Découvrir l'offre »
  class?: string;
}
// slot par défaut : l'icône SVG
```

Rendu : carte `rounded-xl border border-black/10 bg-cream p-8`, icône dans une pastille `bg-sage/15 text-sage-dark rounded-xl w-14 h-14` (les SVG actuels sont conservés, passés en slot), `h3` charcoal (Switzer light hérité), description `text-muted`, lien via `ArrowLink`. Pas de barre dégradée, pas d'ombre colorée, hover `hover:border-sage/50 transition-colors`.

## Mapping section par section (validé)

### Hero

- Structure 2 colonnes conservée. Fond `bg-cream`, suppression des 2 blobs flottants animés et des 2 cadres rotés autour de la photo.
- Badge étoile → `PillBadge text="EC Mémorialiste reconverti Développeur Web"` (l'icône étoile disparaît, le texte reste).
- H1 : mêmes 2 spans ; ligne 1 `text-charcoal`, ligne 2 `text-sage-dark`, tailles `clamp` cohérentes avec la home, poids light hérité.
- Sous-titre : `text-muted`, les `<strong>` passent en `text-charcoal font-medium`, le span vert final en `text-sage-dark`.
- 3 stats (100% / EC / 4) → `StatBig` ×3, labels identiques.
- CTA « Discutons de votre projet » → `btn btn-primary gap-2` + `ArrowRight` (le shimmer disparaît). CTA « Découvrir mes offres » (ancre `#offres`) → `ArrowLink`.
- Photo : `rounded-xl`, sans grayscale ni overlay. Carte flottante conservée : `bg-cream/95 backdrop-blur-sm rounded-xl`, pastille icône `bg-sage`.

### 01 Mon parcours

- Layout sticky 4/8 conservé. Colonne gauche → `SectionHeader number="01" kicker="Mon parcours" align="left"` avec le H2 en slot (texte identique). Le `decorative-line` disparaît.
- Prose : `text-muted`, `<strong>` → `text-charcoal font-medium`.
- Citation : guillemet décoratif `text-sage font-serif` (pattern cartes avis home), texte `text-charcoal font-light italic`, sans `quote-mark` CSS.
- 3 cartes : `rounded-xl border border-black/10 bg-cream p-6`, icônes `text-sage-dark` dans pastille `bg-sage/15` (suppression `icon-circle`). Textes identiques, y compris « Sites codés avec Astro, pas de template générique ».

### 02 Offres (`id="offres"`)

- En-tête → `SectionHeader number="02" kicker="Solutions dédiées EC"` centré, sous-titre identique (« Sites 100% codés sur mesure avec Astro… » conservé).
- 4 cartes → `OfferCard` ×4, mêmes SVG en slot, titres/descriptions/href identiques.

### 03 Ce qui me différencie

- Fond dégradé green-900 + motif grille → section `bg-sand`, texte standard (plus de blanc sur vert foncé).
- En-tête → `SectionHeader number="03" kicker="Ce qui me différencie"` centré.
- 2 grandes tuiles (Interlocuteur unique, Réseau de spécialistes) : `bg-sage text-white rounded-xl p-8`, icônes `bg-white/20 text-white` (écho de la carte comparatif home). Textes descriptifs `text-white/90`.
- Petites tuiles : cartes `bg-cream border border-black/10 rounded-xl p-6`, icônes `text-sage-dark`, titres charcoal, descriptions `text-muted`.
- **Suppression validée** des tuiles « 100% code sur mesure » et « Ancien EC mémorialiste » (état d'origine : 2 grandes + 8 petites). Reste 8 tuiles : 2 grandes + 6 petites (Pas d'abonnement coûteux, Pro mais pas ennuyeux, Prêt à évoluer, Fluide et rapide, Réactivité, Transparence), les 6 petites regroupées en une seule grille `md:grid-cols-2 lg:grid-cols-3` sous les 2 grandes.

### 04 Cas client LBG

- En-tête → `SectionHeader number="04" kicker="Réalisation"` centré.
- Carte : `bg-cream border border-black/10 rounded-xl` (l'ombre 2xl disparaît). Image conservée, overlay vert → `bg-charcoal/30`. Badge PageSpeed conservé : `bg-cream/95` + point `bg-sage animate-pulse`.
- Badge « Cabinet d'expertise comptable » → `PillBadge variant="outline"`.
- Liste ✓ → `CheckList` (3 items identiques).
- Lien étude de cas → `ArrowLink`.
- Témoignage : guillemet sage, blockquote `text-charcoal font-light italic`, avatar « LB » → `bg-sage text-white`.

### 05 Articles utiles

- En-tête → `SectionHeader number="05" kicker="Ressources" align="left"` + `ArrowLink « Voir tous les articles »` à droite (flex conservé).
- 7 cartes : `bg-white/60 border border-black/10 rounded-xl` (pattern cartes avis home), catégories uppercase → `text-sage-dark` (SEO/Blog) et `text-muted` (Portfolio), titres charcoal, liens « Lire » → `inline-flex text-sage-dark` + `ArrowRight` (hover `gap` conservé).

### 06 Contact

- Colonne gauche → `SectionHeader number="06" kicker="Prêt ?" align="left"`, liste des 3 points conservée, pastilles icônes unifiées `bg-sage/15 text-sage-dark` (l'ambre disparaît).
- Colonne droite : carte `bg-cream border border-black/10 rounded-xl` (ombre 2xl supprimée). Avatar : ring `ring-sage/30`.
- Champs : `bg-white/70 border border-black/10 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent`, labels `text-default`. Checkbox : `text-sage-dark focus:ring-sage`.
- Bouton submit shimmer → `btn btn-primary w-full gap-2` + `ArrowRight`.

### 07 FAQ (`id="faq"`)

- En-tête → `SectionHeader number="07" kicker="FAQ"` centré.
- Les 6 `<details>` → `FaqItems` (étendu HTML), réponses converties en chaînes HTML avec textes et liens strictement identiques. Style cartes sand identique à la home.

### LeadMagnetForm

Conservé tel quel, aucun changement.

## Nettoyage transverse

- Suppression du bloc `<style>` complet (~220 lignes : shimmer, glow, decorative-line, styled-number, texture-bg, badge-premium, quote-mark, animations CSS et delays).
- Suppression de toutes les classes `dark:` de la page.
- Animations : `data-fade-up` sur les cartes et blocs principaux + `<MontegrappaFx />` en fin de page (respecte `prefers-reduced-motion`). Les classes `animate-fade-up delay-*` disparaissent.
- Imports : ajouter les composants UI ; `HeroImage` (DSCF7551-3.jpg) reste.

## Vérification finale

1. `bun run build` passe.
2. Diff texte rendu avant/après (script Task 0 du plan home) : seuls écarts admis, les 2 tuiles supprimées.
3. Les 3 JSON-LD identiques octet pour octet.
4. `id="offres"` et `id="faq"` présents, CTA hero scrolle vers les offres.
5. Contrôle visuel desktop + mobile 375px, navigation clavier FAQ, `prefers-reduced-motion`.
6. Aucun commit : David gère ses commits.
