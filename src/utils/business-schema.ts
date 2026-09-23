/**
 * Nodes Schema.org "entité business" — réutilisés en @graph sur les pages
 * de service (LocalBusiness Ajaccio, ProfessionalService EC).
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
 * Règle : une page ne porte un `aggregateRating` que si les témoignages
 * correspondants sont VISIBLES dans son contenu. Les pages sans bloc avis
 * (pilier EC et ses enfants, maintenance Ajaccio) n'en portent donc pas.
 *
 * (Note : la homepage conserve délibérément son rating sur le LocalBusiness
 * inline, choix assumé malgré le caractère self-serving : elle affiche le
 * carousel de témoignages.)
 *
 * Les `@id` sont alignés sur ceux déjà déclarés (home,
 * /experts-comptables/) pour que Google fusionne en une seule
 * entité. Une seule adresse : Ajaccio.
 */
/**
 * Nom commercial unique (NAP). Doit être IDENTIQUE partout : les deux fiches
 * Google Business Profile, ce schema, le site, les devis, les annuaires.
 * Pas de nom de ville dedans : Google le déduit de l'adresse, et l'ajouter
 * est un motif de suspension de fiche.
 */
export const BUSINESS_NAME = 'David Barbier | Création de site internet et SEO';

export const LOCAL_BUSINESS_AJACCIO_ID = 'https://www.davidbarbier.com/#localbusiness';
export const PROFESSIONAL_SERVICE_EC_ID = 'https://www.davidbarbier.com/experts-comptables/#service';

export const localBusinessAjaccioNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_AJACCIO_ID,
  name: BUSINESS_NAME,
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

export const professionalServiceEcNode = {
  '@type': 'ProfessionalService',
  '@id': PROFESSIONAL_SERVICE_EC_ID,
  name: 'David Barbier, partenaire des experts-comptables',
  url: 'https://www.davidbarbier.com/experts-comptables/',
  description:
    "Partenaire des cabinets d'expertise comptable : création de site, refonte, SEO et maintenance. Ancien expert-comptable mémorialiste, un seul interlocuteur.",
  areaServed: { '@type': 'Country', name: 'France' },
  founder: { '@id': 'https://www.davidbarbier.com/#person' },
};
