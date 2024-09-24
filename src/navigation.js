import { getLocalizedPermalink, getAsset } from './utils/permalinks';
import { useTranslations } from '~/i18n/translator';

export const getHeaderData = (locale) => {
  const { t } = useTranslations(locale);
  return {
    links: [
      {
        text: t('header.home'),
        href: getLocalizedPermalink(locale, '/'),
      },
      // {
      //   text: t('header.about'),
      //   href: getLocalizedPermalink(locale, '/about'),
      // },
      // {
      //   text: t('header.services'),
      //   href: getLocalizedPermalink(locale, '/services'),
      // },
      {
        text: t('header.blog'),
        href: getLocalizedPermalink(locale, '/category/blog'),
      },
      {
        text: t('header.portfolio'),
        href: getLocalizedPermalink(locale, '/category/portfolio'),
      }
    ],
    actions: [{ type: 'button', text: t('header.contact'), href: getLocalizedPermalink(locale, '/contact') }],
  };
};

export const getFooterData = (locale) => {
  const { t } = useTranslations(locale);
  
  return {
    text: t('footer.text'),
    secondaryLinks: [
      // { text: t('footer.about'), href: getLocalizedPermalink(locale, '/about') },
      // { text: t('footer.services'), href: getLocalizedPermalink(locale, '/services') },
      { text: t('footer.contact'), href: getLocalizedPermalink(locale, '/contact') },
      { text: t('footer.blog'), href: getLocalizedPermalink(locale, '/category/blog')},
      { text: t('footer.legal'), href: getLocalizedPermalink(locale, '/terms')},
    ],
    socialLinks: [
      { ariaLabel: 'Twitter', icon: 'tabler:brand-x', href: 'https://twitter.com/gnark_eth' },
      { ariaLabel: 'Linkedin', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/dbarbier/' },
      { ariaLabel: 'Malt', icon: 'tabler:baguette', href: 'https://www.malt.fr/profile/davidbarbier' },
      { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
      { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/davidbarbi3r' },
    ],
    footNote: `
    🌱 Made by <a class="text-emerald-700 hover:underline dark:text-emerald-200" href="https://www.davidbarbier.com"> David</a> · All rights reserved.`,
  };
};
