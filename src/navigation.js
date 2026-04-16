import { getAsset } from './utils/permalinks';

export const getHeaderData = () => {
  return {
    links: [
      {
        text: 'Accueil',
        href: '/',
      },
      {
        text: 'À propos',
        href: '/a-propos/',
      },
      {
        text: 'Ajaccio',
        links: [
          { text: 'Consultant SEO à Ajaccio', href: '/consultant-seo-ajaccio/' },
          { text: 'Création site WordPress à Ajaccio', href: '/creation-site-internet-ajaccio/' },
          { text: 'Maintenance site à Ajaccio', href: '/maintenance-site-internet-ajaccio/' },
        ],
      },
      {
        text: 'Limoges',
        links: [
          { text: 'Consultant SEO à Limoges', href: '/limoges/consultant-seo/' },
          { text: 'Création site WordPress à Limoges', href: '/limoges/wordpress/' },
          { text: 'Maintenance site à Limoges', href: '/limoges/maintenance-site-internet/' },
        ],
      },
      {
        text: 'Experts-comptables',
        links: [
          { text: 'Agence Web EC', href: '/agence-web-expert-comptable/' },
          { text: 'Création site EC', href: '/agence-web-expert-comptable/creation-site-vitrine-ec/' },
          { text: 'Refonte site EC', href: '/agence-web-expert-comptable/refonte-site-internet/' },
          { text: 'SEO Expert-Comptable', href: '/agence-web-expert-comptable/consultant-seo-ec/' },
          { text: 'Développeur EC', href: '/agence-web-expert-comptable/developpeur-specialise/' },
        ],
      },
      {
        text: 'Blog',
        href: '/blog/',
      },
    ],
    actions: [{ type: 'button', text: 'Me contacter', href: '/contact/' }],
  };
};

export const getFooterData = () => {
  return {
    secondaryLinks: [
      { text: 'A propos', href: '/a-propos/' },
      { text: 'Blog', href: '/blog/' },
      { text: 'Mentions légales', href: '/terms/' },
    ],
    socialLinks: [
      { ariaLabel: 'Twitter', icon: 'tabler:brand-x', href: 'https://twitter.com/daviddeveloppe' },
      { ariaLabel: 'Linkedin', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/dbarbier/' },
      { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/daviddeveloppe/' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/daviddeveloppe' },
      { ariaLabel: 'Malt', icon: 'tabler:baguette', href: 'https://www.malt.fr/profile/davidbarbier' },
            { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/davidbarbi3r' },
    ],
    footNote: `
    🌱 Fait par moi-même avec amour · Tous droits réservés.`,
  };
};
