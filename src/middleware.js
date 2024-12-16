// src/middleware.js
import { defineMiddleware } from "astro:middleware";

// Map des URLs français vers anglais
const urlMappings = {
  'reserve-ton-appel': 'book-a-call',
  'site-internet-eco-responsable': 'eco-friendly-website-creation',
  'call': 'book-a-call',     // Pour gérer l'ancienne URL
};

const systemPaths = ['_image', '_astro'];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = new URL(ctx.request.url);

  // Ignorer complètement les chemins système
  if (systemPaths.some(path => url.pathname.startsWith(`/${path}`))) {
    return next();
  }

  const pathSegments = url.pathname.split('/').filter(Boolean);
  const hasExtension = url.pathname.includes('.');

  // Ajouter un trailing slash seulement pour les routes de pages
  if (!url.pathname.endsWith('/') && !hasExtension) {
    return new Response('', {
      status: 301,
      headers: { Location: `${url.pathname}/` }
    });
  }

  // Cas 1: Si l'URL commence par /en/
  if (pathSegments[0] === 'en') {
    const path = pathSegments[1];

    if (urlMappings[path]) {
      return new Response('', {
        status: 301,
        headers: { Location: `/en/${urlMappings[path]}/` }
      });
    }

    const frenchPath = Object.entries(urlMappings).find(([, en]) => en === path)?.[0];
    if (frenchPath) {
      return next();
    }
  }
  // Cas 2: URL sans préfixe (français par défaut)
  else if (pathSegments.length > 0) {
    const path = pathSegments[0];

    const isEnglishPath = Object.values(urlMappings).includes(path);
    if (isEnglishPath) {
      const frenchPath = Object.entries(urlMappings).find(([, en]) => en === path)?.[0];
      return new Response('', {
        status: 301,
        headers: { Location: `/${frenchPath}/` }
      });
    }

    if (path === 'call') {
      return new Response('', {
        status: 301,
        headers: { Location: '/reserve-ton-appel/' }
      });
    }
  }

  return next();
});
