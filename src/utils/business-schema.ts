/**
 * Nodes Schema.org "entité business" — réutilisés en @graph sur les pages
 * de service (LocalBusiness Ajaccio / Limoges, ProfessionalService EC).
 *
 * Ce sont des nœuds d'IDENTITÉ purs : NAP, coordonnées, `founder` → #person.
 * Ils NE portent PAS `aggregateRating`. Sur les pages de service, l'agrégat
 * est attaché au nœud `Service` correspondant (l'offre rendue), pas à
 * l'entité LocalBusiness/Organization.
 *
 * Pourquoi : un `aggregateRating` posé sur sa propre entité
 * LocalBusiness/Organization est considéré "self-serving" par Google →
 * ignoré et inéligible aux review rich results. On le rattache donc au
 * `Service`, qui réfère l'entité via `provider.@id`.
 *
 * (Note : les pages "hub" — home, /limoges/, pilier EC — conservent
 * délibérément leur rating sur le LocalBusiness inline, choix assumé.)
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
    streetAddress: '13 Boulevard Sampiero',
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
