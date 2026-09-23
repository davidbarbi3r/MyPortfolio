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
          { text: 'Accompagnement SEO', href: '/referencement-seo-ajaccio/' },
          { text: 'Création de site internet', href: '/creation-site-internet-ajaccio/' },
          { text: 'Freelance WordPress', href: '/freelance-wordpress-ajaccio/' },
          { text: 'Maintenance de site', href: '/maintenance-site-internet-ajaccio/' },
        ],
      },
      {
        text: 'Experts-comptables',
        links: [
          { text: 'Partenaire EC', href: '/experts-comptables/' },
          { text: 'Création site EC', href: '/experts-comptables/creation-site-vitrine-ec/' },
          { text: 'Refonte site EC', href: '/experts-comptables/refonte-site-internet/' },
          { text: 'SEO Expert-Comptable', href: '/experts-comptables/consultant-seo-ec/' },
          { text: 'Développeur EC', href: '/experts-comptables/developpeur-specialise/' },
        ],
      },
      {
        text: 'Réalisations',
        href: '/realisations/',
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
      { text: 'Réalisations', href: '/realisations/' },
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
