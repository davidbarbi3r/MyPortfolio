import { getAsset } from './utils/permalinks';

export const getHeaderData = () => {
  return {
    links: [
      {
        text: 'Accueil',
        href: '/',
      },
      {
        text: 'A propos',
        href: '/a-propos',
      },
      {
        text: 'Blog',
        href: '/blog',
      },
      {
        text: 'Portfolio',
        href: '/category/portfolio',
      },
    ],
    actions: [{ type: 'button', text: 'Contact', href: '/contact' }],
  };
};

export const getFooterData = () => {
  return {
    secondaryLinks: [
      { text: 'A propos', href: '/a-propos' },
      { text: 'Contact', href: '/contact' },
      { text: 'Blog', href: '/blog' },
      { text: 'Mentions légales', href: '/terms' },
    ],
    socialLinks: [
      { ariaLabel: 'Twitter', icon: 'tabler:brand-x', href: 'https://twitter.com/daviddeveloppe' },
      { ariaLabel: 'Linkedin', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/dbarbier/' },
      { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/daviddeveloppe/' },
      { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/daviddeveloppe' },
      { ariaLabel: 'Malt', icon: 'tabler:baguette', href: 'https://www.malt.fr/profile/davidbarbier' },
      { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
      { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/davidbarbi3r' },
    ],
    footNote: `
    🌱 Fait avec amour par <a class="text-emerald-700 hover:underline dark:text-emerald-200" href="https://www.davidbarbier.com"> David</a> · All rights reserved.`,
  };
};
