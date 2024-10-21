import { getAsset } from './utils/permalinks';
import { useTranslations } from '~/i18n/translator';
import { getRelativeLocaleUrl } from 'astro:i18n';

export const getHeaderData = (locale) => {
  const { t } = useTranslations(locale);
  return {
    links: [
      {
        text: t('header.home'),
        href: getRelativeLocaleUrl(locale, '/'),
      },
      // {
      //   text: t('header.about'),
      //   href: getRelativeLocaleUrl(locale, '/about'),
      // },
      // {
      //   text: t('header.services'),
      //   href: getRelativeLocaleUrl(locale, '/services'),
      // },
      {
        text: t('header.blog'),
        href: getRelativeLocaleUrl(locale, '/blog'),
      },
      {
        text: t('header.portfolio'),
        href: getRelativeLocaleUrl(locale, '/category/portfolio'),
      },
    ],
    actions: [{ type: 'button', text: t('header.contact'), href: getRelativeLocaleUrl(locale, '/contact') }],
  };
};

export const getFooterData = (locale) => {
  const { t } = useTranslations(locale);
  
  return {
    text: t('footer.text'),
    secondaryLinks: [
      // { text: t('footer.about'), href: getRelativeLocaleUrl(locale, '/about') },
      // { text: t('footer.services'), href: getRelativeLocaleUrl(locale, '/services') },
      { text: t('footer.contact'), href: getRelativeLocaleUrl(locale, '/contact') },
      { text: t('footer.blog'), href: getRelativeLocaleUrl(locale, '/blog')},
      { text: t('footer.legal'), href: getRelativeLocaleUrl(locale, '/terms')},
    ],
    socialLinks: [
      { ariaLabel: 'Twitter', icon: 'tabler:brand-x', href: 'https://twitter.com/gnark_eth' },
      { ariaLabel: 'Linkedin', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/dbarbier/' },
      { ariaLabel: 'Malt', icon: 'tabler:baguette', href: 'https://www.malt.fr/profile/davidbarbier' },
      { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
      { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/davidbarbi3r' },
    ],
    footNote: `
    🌱 Fait avec amour par <a class="text-emerald-700 hover:underline dark:text-emerald-200" href="https://www.davidbarbier.com"> David</a> · All rights reserved.`,
  };
};
