/**
 * Nodes Schema.org "entité business" — réutilisés en @graph sur les pages
 * de service (LocalBusiness Ajaccio / Limoges, ProfessionalService EC).
 *
 * Ce sont des nœuds d'IDENTITÉ purs : NAP, coordonnées, `founder` → #person.
 * Ils NE portent PAS `aggregateRating`. Sur les pages de service, l'agrégat
 * est attaché au nœud d'offre, typé `["Product", "Service"]`.
 *
 * Pourquoi ce double type :
 * - `aggregateRating` sur un `Service` SEUL est rejeté par Google :
 *   "Type d'objet non valide pour le champ <parent_node>" (Service n'est
 *   PAS dans la liste des types éligibles aux review snippets).
 * - `aggregateRating` sur l'entité LocalBusiness/Organization est valide
 *   côté type, mais considéré "self-serving" (avis sur sa propre entité) →
 *   ignoré par Google.
 * - `Product` EST éligible ET échappe à la règle self-serving (un avis sur
 *   un produit est autorisé). D'où le nœud multi-type : `Product` porte le
 *   rating, `Service` garde la sémantique métier (provider, areaServed...).
 *
 * (Note : les pages "hub" — home, /limoges/, pilier EC — conservent
 * délibérément leur rating sur le LocalBusiness/ProfessionalService inline,
 * choix assumé malgré le caractère self-serving.)
 *
 * Les `@id` sont alignés sur ceux déjà déclarés (home, /limoges/,
 * /agence-web-expert-comptable/) pour que Google fusionne en une seule
 * entité.
 */
export const LOCAL_BUSINESS_AJACCIO_ID = 'https://www.davidbarbier.com/#localbusiness';
export const LOCAL_BUSINESS_LIMOGES_ID = 'https://www.davidbarbier.com/limoges/#localbusiness';
export const PROFESSIONAL_SERVICE_EC_ID = 'https://www.davidbarbier.com/agence-web-expert-comptable/#service';

export const localBusinessAjaccioNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_AJACCIO_ID,
  name: 'David Barbier | Consultant SEO et site internet',
  image: 'https://www.davidbarbier.com/david-barbier-consultant-seo-ajaccio.jpg',
  url: 'https://www.davidbarbier.com/',
  founder: { '@id': 'https://www.davidbarbier.com/#person' },
  telephone: '+33623565299',
  email: 'hello@davidbarbier.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '13 Bd Sampiero',
    addressLocality: 'Ajaccio',
    postalCode: '20000',
    addressRegion: 'Corse',
    addressCountry: 'FR',
  },
  priceRange: '€€',
};

export const localBusinessLimogesNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_LIMOGES_ID,
  name: 'David Barbier | Concepteur de sites web à Limoges',
  image: 'https://www.davidbarbier.com/david-barbier-consultant-seo-ajaccio.jpg',
  url: 'https://www.davidbarbier.com/limoges/',
  branchOf: { '@id': LOCAL_BUSINESS_AJACCIO_ID },
  founder: { '@id': 'https://www.davidbarbier.com/#person' },
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
};

export const professionalServiceEcNode = {
  '@type': 'ProfessionalService',
  '@id': PROFESSIONAL_SERVICE_EC_ID,
  name: 'Agence web pour experts-comptables',
  url: 'https://www.davidbarbier.com/agence-web-expert-comptable/',
  description: "Agence web spécialisée pour cabinets d'expertise comptable.",
  areaServed: { '@type': 'Country', name: 'France' },
  founder: { '@id': 'https://www.davidbarbier.com/#person' },
};
