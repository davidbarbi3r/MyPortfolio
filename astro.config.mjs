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
  redirects: {
    '/call': '/contact',
    '/reserve-ton-appel': '/contact',
    '/en/call': '/en/contact',
    '/en/book-a-call': '/en/contact',
    '/book-a-call': '/contact',
    '/site-internet-eco-responsable': '/blog/site-internet-eco-responsable',
    '/en/site-internet-eco-responsable': '/blog/site-internet-eco-responsable',
    '/eco-friendly-website-creation': '/blog/site-internet-eco-responsable',
    '/creation-site-vitrine-expert-comptable': '/lbg-expertise-ec-marseille',
    '/creation-site-internet-limoges': '/limoges/wordpress',
    '/expert-referencement-limoges': '/limoges/consultant-seo',
    '/maintenance-site-web-limoges': '/limoges/maintenance-site-internet',
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: 'manual',
  },
  build: {
    format: SITE.trailingSlash ? "directory" : "file"
  },
  integrations: [tailwind({
    applyBaseStyles: false
  }), // Conditionally add i18n and sitemap based on I18N.isEnabled
  sitemap({
    filter: (page) => !page.includes('/tag/') && !page.includes('/en/'),
    lastmod: new Date(),
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
