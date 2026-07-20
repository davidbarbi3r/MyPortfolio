# PRD : refonte visuelle « Montegrappa » de davidbarbier.com

**Date** : 2026-07-10
**Statut** : validé
**Référence visuelle** : https://montegrappa-template.webflow.io/about

## 1. Objectif

Adapter le langage visuel du template Webflow Montegrappa (crème, sauge, typographie light, photos nature désaturées) à l'ensemble du site, en commençant par la page d'accueil, **sans toucher au contenu ni à quoi que ce soit qui porte le SEO**.

### Décisions validées

| Décision | Choix |
|---|---|
| Portée | Nouveau design system global (tokens, header, footer), home retravaillée en premier, pages internes héritent de la palette et seront reprises plus tard |
| Dark mode | Supprimé |
| Photos | Existant (Barbicaja, textures) + photos libres de droits de paysages corses, traitées en tons chauds désaturés |
| Contenu home | Tout garder, restyler. Aucune section supprimée, aucun texte modifié |
| Typographie | Switzer seule famille, poids 300 ajouté pour les titres. Clash Display retirée |

### Non-objectifs

- Refondre les pages internes (agence-seo-ajaccio, freelance-wordpress, EC, Limoges...) : elles héritent des tokens mais gardent leurs layouts pour l'instant.
- Réécrire des contenus, ajouter ou retirer des sections.
- Toucher aux redirections, au sitemap, aux métadonnées.

## 2. Invariants SEO (contrat de non-régression)

Ces éléments de `src/pages/index.astro` doivent être **strictement identiques** avant/après :

1. `metadata.title` et `metadata.description`.
2. Les 3 blocs JSON-LD : LocalBusiness + Person (`localBusinessSchema`), FAQPage (`faqStructuredData`), avec `REVIEWS` et `aggregateRatingSchema` importés de `~/utils/reviews`.
3. Le texte du H1 (« Création de site internet et référencement à Ajaccio ») et la hiérarchie H1 > H2 > H3 existante.
4. Tous les textes visibles : FAQ (`HOME_FAQ`), avis, services, tarifs, process, comparatif agence/freelance, bandeau EC.
5. Tous les liens internes et leurs ancres : `/#tarifs`, `/agence-seo-ajaccio/`, `/freelance-wordpress-ajaccio/`, `/maintenance-site-internet-ajaccio/`, `/agence-web-expert-comptable/` (+ ses 4 sous-pages), `/limoges/`, liens blog, lien fiche Google.
6. Les attributs `alt` existants. Les nouvelles images reçoivent des `alt` descriptifs en français (lieu réel nommé, pas de bourrage de mots-clés).
7. `id="tarifs"` et `id="faq"` (ancres de navigation).

Vérification : diff du HTML rendu (texte extrait) avant/après, contrôle des 3 JSON-LD dans la page buildée.

## 3. Design system

### 3.1 Palette (remplace emerald/amber dans `CustomStyles.astro`)

| Token | Valeur | Usage |
|---|---|---|
| `--mg-cream` | `#F2F0EB` | Fond de page principal |
| `--mg-sand` | `#E5E2D9` | Sections alternées |
| `--mg-sage` | `#8C9A84` | Badges pilule, boutons, surfaces accent |
| `--mg-sage-dark` | `#5F6B57` | Liens, textes accent (contraste AA sur crème) |
| `--mg-charcoal` | `#1D1D1B` | Footer, titres, texte fort |
| `--mg-text` | `#3B3B38` | Texte courant |
| `--mg-text-muted` | `#3B3B38` à 60 % | Texte secondaire |

Mapping AstroWind : `--aw-color-primary: var(--mg-sage-dark)`, `--aw-color-accent: var(--mg-sage)`, `--aw-color-bg-page: var(--mg-cream)`, textes sur `--mg-text`. Le bloc `.dark` est supprimé.

Règle de contraste : le sauge `#8C9A84` ne sert jamais pour du texte sur fond clair, uniquement en surface (badge, bouton avec texte blanc ou charbon selon la taille). Les liens et petits textes accent utilisent `--mg-sage-dark`.

### 3.2 Typographie

- **Famille unique** : Switzer. Ajouter `public/fonts/switzer-300.woff2` (téléchargé depuis fontshare, même source que les fichiers existants) et sa `@font-face`.
- **Titres** : Switzer 300, `letter-spacing` légèrement négatif. H1 `clamp(2.8rem, 6vw, 5.5rem)`, H2 `clamp(2rem, 4vw, 3.5rem)`. Le sélecteur global `h1..h6 { Clash Display 500 !important }` de `CustomStyles.astro` est remplacé par Switzer 300.
- **Micro-labels** : 11-12 px, uppercase, `tracking [0.2em]`, dans les badges pilule.
- **Chiffres** (stats, prix, numéros d'étapes) : Switzer 300 en très grande taille.
- Clash Display : `@font-face` et fichiers woff2 retirés, `--aw-font-serif`/`--aw-font-heading` pointent sur Switzer.

### 3.3 Composants créés (dans `src/components/ui/` ou `widgets/`)

| Composant | Description |
|---|---|
| `PillBadge.astro` | Pilule sauge, label uppercase micro. Props : `text`, variante (sauge plein / hairline) |
| `StatBig.astro` | Hairline au-dessus, chiffre énorme en 300, label en dessous. Props : `value`, `label` |
| `NumberedAccordion.astro` | Liste 01-0N avec hairlines, item ouvert affiche la description. `<details>/<summary>` natifs (accessibles, indexables) |
| `ImageStrip.astro` | Bande horizontale d'images arrondies, léger défilement au scroll (GSAP), débordement `overflow-hidden` |

Vocabulaire transversal : hairlines `border-black/10`, coins arrondis `rounded-xl` (12 px), sections `py-24 md:py-32` (plus aérées qu'actuellement).

### 3.4 Dark mode : suppression

- `darkMode: 'class'` retiré de `tailwind.config.cjs`, bloc `.dark` retiré de `CustomStyles.astro`.
- Toggle thème retiré du header ; script d'initialisation du thème (localStorage/`prefers-color-scheme`) retiré du layout.
- Les classes `dark:` restantes dans les pages internes deviennent inertes : nettoyage opportuniste lors des futures refontes, pas dans ce chantier (sauf sur les fichiers déjà retravaillés : home, header, footer, widgets touchés).

## 4. Header et footer (toutes pages)

### Header
- Fond crème (ou crème translucide + blur au scroll), hairline en bas.
- Logo à gauche, nav au centre-gauche, bouton pilule sauge « Réserver un appel » (lien `tel:` existant) à droite.
- Bandeau annonce fin au-dessus, fond sand, texte micro uppercase : « Devis sous 48 h · Sites livrés en 4 à 6 semaines ». Statique, pas de JS.

### Footer
- Fond charbon `#1D1D1B`, textes crème.
- Contenu actuel conservé (colonnes de navigation, coordonnées, mentions légales, réseaux sociaux).
- Wordmark géant « DAVID BARBIER » en Switzer 300, pleine largeur en bas, couleur crème à faible opacité.
- Pas de bloc newsletter (le template en a un, le site n'a pas de newsletter : on ne l'ajoute pas).

## 5. Home : traitement section par section

L'ordre des sections est inchangé. Contenus, liens et balisage sémantique identiques (voir §2).

1. **Hero** : badge pilule centré (« Freelance · Ancien auditeur EC »), H1 énorme centré en 300, sous-titre, CTA pilule sauge. En dessous, `ImageStrip` : Barbicaja + 3-4 paysages corses + textures existantes. L'actuel `Hero2` (photo à droite) est remplacé sur la home.
2. **Bande stats** : les 3 stats du hero actuel (+50 clients, +5 ans, 5/5 Google) déplacées dans une bande dédiée sous la strip, en `StatBig` décalés verticalement comme le template.
3. **Logos clients** : `LogoMarquee` conservé tel quel, fond crème, logos légèrement désaturés.
4. **Services** (`Features2`) : cartes image plein cadre, label service en haut de l'image, description + liste + prix sous hairline en bas. Prix en chiffres fins. Tous les CTA et liens EC conservés.
5. **Bandeau EC** : bande pleine largeur sauge (remplace l'emerald), texte et CTA identiques, bouton crème.
6. **Agence vs freelance** : carte crème (agence classique) vs carte sauge (solo + collectif), listes ✕/✓ conservées, ✓ en sage-dark, ✕ en charbon atténué (plus de rouge/vert vifs).
7. **Avis Google** : layout testimonials du template : badge pilule, H2 aligné à gauche, flèches de navigation à droite, carousel conservé (même JS), cartes avec guillemets, alternance crème/sauge. Lien fiche Google conservé.
8. **Projets** : grille asymétrique + `ProjectsFlip` conservés. Browser frames et screenshots inchangés, chrome recoloré (fonds sand, hairlines), métriques résultats en chiffres fins sage-dark.
9. **Process 4 étapes** : `NumberedAccordion` 01-04, signature du template. Les 4 textes actuels inchangés, premier item ouvert par défaut (contenu visible sans interaction, bon pour l'indexation même si `<details>` est crawlé).
10. **Tarifs** : deux cartes hairline sur fond sand, prix énormes en 300, listes ✓ conservées, carte sur-mesure marquée par une bordure sauge. `id="tarifs"` conservé.
11. **FAQ** : accordéons `<details>` conservés, restylés en hairlines empilées (plus de cartes bordées), signe +/× à droite. `id="faq"` et balisage FAQPage identiques.
12. **Blog** (`BlogLatestPosts`) : cartes épurées, hairlines, images arrondies.
13. **Maps** : iframe conservée, encadrée en `rounded-xl` sur fond sand avec marges (plus de pleine largeur brute).
14. **CTA final** : section plein écran sur paysage corse désaturé (remplace le dégradé emerald) : « Prêt à démarrer ? » en énorme blanc 300, colonnes de coordonnées en bas à gauche (téléphone, 13 Bd Sampiero Ajaccio, email), carte translucide à droite « Discutons de votre projet » avec le CTA email. Phrase et lien Limoges conservés.

## 6. Animations (GSAP 3.14 déjà en dépendance)

- **Révélation mot-à-mot** des H1/H2 au scroll (opacité par mot, comme le template) : petit composant/script partagé `TextReveal`, ScrollTrigger.
- **Fade-up** léger des cartes et stats à l'entrée dans le viewport.
- `ImageStrip` : léger déplacement horizontal lié au scroll.
- `HeroAnimations` et `ProjectsFlip` existants : adaptés aux nouveaux sélecteurs/couleurs, comportement conservé.
- Tout est désactivé sous `prefers-reduced-motion: reduce`.
- Le texte est présent dans le HTML initial et seulement animé en opacité : aucun impact indexation. Éviter tout `visibility:hidden` initial côté CSS (anti-flash géré en JS pour que le texte reste visible sans JS).

## 7. Performance et vérification

Budget : la refonte doit être neutre ou positive sur le poids de page.
- Fonts : 3 fichiers Switzer (300/400/500) contre 4 actuels (2 Switzer + 2 Clash), léger gain.
- CSS : suppression du dark mode sur les fichiers touchés.
- Nouvelles photos : AVIF/WebP via `astro:assets`, `loading="lazy"` hors hero, dimensions fixées (zéro CLS sur la strip).

Checklist de fin de chantier :
1. `bun run build` sans erreur.
2. Diff du texte rendu de la home avant/après : identique.
3. Les 3 JSON-LD présents et valides (test Rich Results ou parsing manuel).
4. Lighthouse local : performance et SEO au niveau d'avant (ou mieux), CLS < 0.1.
5. Passe visuelle desktop + mobile sur la home, header/footer vérifiés sur 2-3 pages internes (héritage de palette sans casse).
6. Navigation clavier sur accordéons et carousel, contrastes AA sur les nouveaux couples couleur.

## 8. Découpage en phases (pour le plan d'implémentation)

1. **Tokens + fonts** : `CustomStyles.astro`, `tailwind.config.cjs`, ajout switzer-300, retrait Clash Display et dark mode.
2. **Composants** : `PillBadge`, `StatBig`, `NumberedAccordion`, `ImageStrip`, `TextReveal`.
3. **Header + footer**.
4. **Home sections 1-5** (hero, stats, logos, services, bandeau EC).
5. **Home sections 6-10** (comparatif, avis, projets, process, tarifs).
6. **Home sections 11-14** (FAQ, blog, maps, CTA final) + photos corses.
7. **Vérification** (checklist §7).

Chaque phase est shippable indépendamment (le site reste cohérent entre les phases grâce aux tokens posés en premier).
