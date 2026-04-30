/**
 * Témoignages clients + aggregateRating (schema.org)
 * Source unique de vérité — utilisée dans tous les schemas Service / LocalBusiness
 *
 * ⚠️ MAINTENANCE : quand tu reçois un nouvel avis Google, mets à jour :
 *   1. `REVIEWS` si tu veux afficher le témoignage sur le site
 *   2. `AGGREGATE_RATING.reviewCount` avec le total Google Business
 */

export interface Review {
  author: string;
  company: string;
  rating: number;
  text: string;
}

/**
 * Témoignages visibles sur le site (carousel home, page /limoges/, etc.)
 */
export const REVIEWS: Review[] = [
  {
    author: 'Matthias',
    company: 'Odacio Conseils',
    rating: 5,
    text: "David a réalisé mon site internet et je suis très satisfait du résultat. Il a été à l'écoute, réactif et professionnel tout au long du projet. Il a su comprendre mes attentes et proposer des solutions adaptées. Le suivi est sérieux et il reste disponible quand on a besoin. Vous pouvez lui faire confiance les yeux fermés !",
  },
  {
    author: 'Véronique',
    company: 'La voie des sens',
    rating: 5,
    text: "David m'a apporté un état des lieux très clair et précis quant à la façon d'améliorer le référencement et la performance. David a apporté aussi du calme, de la douceur et une bonne compréhension globale de mes besoins pour le site. C'est un vrai plus pour moi que de travailler avec un professionnel serein.",
  },
  {
    author: 'Marta',
    company: 'Ekia Advisory',
    rating: 5,
    text: "David m'a accompagné dans la création de mon site internet pour mon cabinet d'expertise-comptable Ekia Advisory. Il est très professionnel, à l'écoute et s'adapte aux attentes du client ! Je recommande vivement !",
  },
  {
    author: 'Cédric',
    company: 'Restodom',
    rating: 5,
    text: "Je remercie David pour son travail de qualité dans la conception et la réalisation du site internet REST'Ô DOM. Son écoute, et son professionnalisme ont permis la bonne exécution du site. La collaboration se poursuit à l'heure actuelle, car il est SEO également me permettant ainsi de gagner grandement en visibilité grâce à ses compétences.",
  },
  {
    author: 'Aaron',
    company: 'Action Conseils',
    rating: 5,
    text: 'Véritable professionnel, réactif, compétent et sympathique ! Je recommande fortement.',
  },
];

/**
 * Avis Google par fiche GBP réelle.
 * → Mettre à jour quand tu reçois un nouvel avis sur l'une ou l'autre fiche.
 *
 * Important : chaque page utilise l'agrégat correspondant à sa localisation
 * pour cohérence avec la fiche GBP affichée par Google (évite l'effet déceptif
 * quand le prospect clique sur le review snippet).
 */
export const GBP_AJACCIO_REVIEWS = 16;
export const GBP_LIMOGES_REVIEWS = 4;
export const GBP_TOTAL_REVIEWS = GBP_AJACCIO_REVIEWS + GBP_LIMOGES_REVIEWS;

const buildAggregateRating = (count: number) => ({
  '@type': 'AggregateRating' as const,
  ratingValue: '5',
  reviewCount: String(count),
  bestRating: '5',
  worstRating: '1',
});

/**
 * Schema.org AggregateRating — 3 variantes selon le contexte de la page :
 *
 * - Ajaccio : pour pages géo Ajaccio (home, consultant-seo-ajaccio, etc.)
 * - Limoges : pour pages géo Limoges (/limoges/*)
 * - Global  : pour pages verticales sans géo spécifique (experts-comptables)
 *
 * Utilisation :
 *   import { aggregateRatingSchemaAjaccio } from '~/utils/reviews';
 *   const serviceSchema = { ..., "aggregateRating": aggregateRatingSchemaAjaccio };
 */
export const aggregateRatingSchemaAjaccio = buildAggregateRating(GBP_AJACCIO_REVIEWS);
export const aggregateRatingSchemaLimoges = buildAggregateRating(GBP_LIMOGES_REVIEWS);
export const aggregateRatingSchemaGlobal = buildAggregateRating(GBP_TOTAL_REVIEWS);

/**
 * Alias par défaut : pointe vers Ajaccio (location principale).
 * Gardé pour les pages existantes. Pour les nouvelles pages, préférer
 * l'import explicite (aggregateRatingSchemaAjaccio, ...Limoges, ...Global).
 */
export const aggregateRatingSchema = aggregateRatingSchemaAjaccio;

/**
 * Legacy — conservé pour compat arrière éventuelle.
 */
export const AGGREGATE_RATING = {
  ratingValue: '5',
  reviewCount: String(GBP_AJACCIO_REVIEWS),
  bestRating: '5',
  worstRating: '1',
} as const;

/**
 * Array prêt à être injecté dans un schema.org Review (sur les pages qui listent les témoignages).
 */
export const reviewsSchema = REVIEWS.map((r) => ({
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: r.author,
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: r.rating.toString(),
    bestRating: '5',
    worstRating: '1',
  },
  reviewBody: r.text,
}));
