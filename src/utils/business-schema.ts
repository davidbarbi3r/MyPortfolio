/**
 * Nodes Schema.org "entité business" — réutilisés en @graph sur les pages
 * de service pour porter aggregateRating sur un type éligible Google
 * Rich Results (LocalBusiness / ProfessionalService).
 *
 * `Service` n'est PAS dans la liste éligible côté Google : attacher
 * aggregateRating à un Service génère l'erreur "Type d'objet non valide
 * pour le champ <parent_node>" dans Search Console. On attache donc
 * l'agrégat ici, et le Service réfère le node via `provider.@id`.
 *
 * Les `@id` sont alignés sur ceux déjà déclarés (home, /limoges/,
 * /agence-web-expert-comptable/) pour que Google fusionne en une seule
 * entité.
 */
import {
  aggregateRatingSchemaAjaccio,
  aggregateRatingSchemaLimoges,
  aggregateRatingSchemaGlobal,
} from './reviews';

export const LOCAL_BUSINESS_AJACCIO_ID = 'https://www.davidbarbier.com/#localbusiness';
export const LOCAL_BUSINESS_LIMOGES_ID = 'https://www.davidbarbier.com/limoges/#localbusiness';
export const PROFESSIONAL_SERVICE_EC_ID = 'https://www.davidbarbier.com/agence-web-expert-comptable/#service';

export const localBusinessAjaccioNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_AJACCIO_ID,
  name: 'David Barbier | Consultant SEO et site internet',
  image: 'https://www.davidbarbier.com/david-barbier-consultant-seo-ajaccio.jpg',
  url: 'https://www.davidbarbier.com/',
  telephone: '+33623565299',
  email: 'hello@davidbarbier.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '13 Boulevard Sampiero',
    addressLocality: 'Ajaccio',
    postalCode: '20000',
    addressRegion: 'Corse',
    addressCountry: 'FR',
  },
  priceRange: '€€',
  aggregateRating: aggregateRatingSchemaAjaccio,
};

export const localBusinessLimogesNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_LIMOGES_ID,
  name: 'David Barbier | Concepteur de sites web à Limoges',
  image: 'https://www.davidbarbier.com/david-barbier-consultant-seo-ajaccio.jpg',
  url: 'https://www.davidbarbier.com/limoges/',
  branchOf: { '@id': LOCAL_BUSINESS_AJACCIO_ID },
  telephone: '+33623565299',
  email: 'hello@davidbarbier.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '23 Rue de la Fonderie',
    addressLocality: 'Limoges',
    postalCode: '87000',
    addressCountry: 'FR',
  },
  priceRange: '€€',
  aggregateRating: aggregateRatingSchemaLimoges,
};

export const professionalServiceEcNode = {
  '@type': 'ProfessionalService',
  '@id': PROFESSIONAL_SERVICE_EC_ID,
  name: 'Agence web pour experts-comptables',
  url: 'https://www.davidbarbier.com/agence-web-expert-comptable/',
  description: "Agence web spécialisée pour cabinets d'expertise comptable.",
  areaServed: { '@type': 'Country', name: 'France' },
  aggregateRating: aggregateRatingSchemaGlobal,
};
