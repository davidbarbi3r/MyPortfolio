import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
// import compress from 'astro-compress';
import icon from 'astro-icon';
import tasks from "./src/utils/tasks";
import { readingTimeRemarkPlugin } from './src/utils/frontmatter.mjs';
import { ANALYTICS, SITE } from './src/utils/config.ts';
import react from '@astrojs/react';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const whenExternalScripts = (items = []) => ANALYTICS.vendors.googleAnalytics.id && ANALYTICS.vendors.googleAnalytics.partytown ? Array.isArray(items) ? items.map(item => item()) : [items()] : [];

// https://astro.build/config
export default defineConfig({
  site: SITE.site,
  base: SITE.base,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: 'manual',
  },
  // 301 des anciennes URLs à plat vers les enfants des hubs.
  // En site statique, Astro n'émet pas le statut HTTP (page meta refresh).
  // build.redirects est donc coupé, et les mêmes cibles sont des 301
  // dans public/_redirects, le fichier que Cloudflare Pages applique.
  redirects: {
    '/site-vitrine-ajaccio/': { status: 301, destination: '/creation-site-internet-ajaccio/site-vitrine/' },
    '/site-one-page-ajaccio/': { status: 301, destination: '/creation-site-internet-ajaccio/one-page/' },
    '/creation-boutique-en-ligne-ajaccio/': { status: 301, destination: '/creation-site-internet-ajaccio/boutique/' },
    '/refonte-site-internet-ajaccio/': { status: 301, destination: '/creation-site-internet-ajaccio/refonte/' },
    '/audit-seo-ajaccio/': { status: 301, destination: '/referencement-seo-ajaccio/audit/' },
    '/audit-seo-gratuit-ajaccio/': { status: 301, destination: '/referencement-seo-ajaccio/audit-gratuit/' },
    '/optimisation-fiche-google-ajaccio/': { status: 301, destination: '/referencement-seo-ajaccio/fiche-google/' },
  },
  build: {
    format: SITE.trailingSlash ? "directory" : "file",
    redirects: false,
  },
  integrations: [tailwind({
    applyBaseStyles: false
  }), // Conditionally add i18n and sitemap based on I18N.isEnabled
  sitemap({
    // Ne déclarer que des URLs indexables : les pages de catégorie et la
    // pagination sont servies en noindex (cf. src/config.yaml).
    filter: (page) =>
      !page.includes('/tag/') &&
      !page.includes('/category/') &&
      !/\/\d+\/?$/.test(page) &&
      !page.includes('/en/') &&
      !page.includes('/limoges') &&
      !page.includes('/matchings') &&
      !page.includes('/maker-teleport-ui'),
    // Pas de `lastmod: new Date()` : ça datait les 36 URLs à l'heure du build,
    // y compris celles inchangées depuis des mois. Un lastmod systématiquement
    // faux finit ignoré par Google. Mieux vaut aucun lastmod qu'un faux.
  }), mdx(), icon({
    include: {
      tabler: ['*'],
      'flat-color-icons': ['template', 'gallery', 'approval', 'document', 'advertising', 'currency-exchange', 'voice-presentation', 'business-contact', 'database']
    }
  }), ...whenExternalScripts(() => partytown({
    config: {
      forward: ['dataLayer.push']
    }
  })), // compress({
  //   CSS: true,
  //   HTML: {
  //     removeAttributeQuotes: false
  //   },
  //   Image: false,
  //   JavaScript: true,
  //   SVG: true,
  //   Logger: 1
  // })
  tasks(), react()],
  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin]
  },
  vite: {
    worker: {
      format: 'es',
      plugins: [],
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src')
      }
    }
  }
});
