---
status: accepted
date: 2026-07-09
---

# Le sitemap ne porte pas de `lastmod`

`astro.config.mjs` contenait `lastmod: new Date()`. En production, les 36 URLs déclaraient donc toutes le même `lastmod`, l'heure du dernier build. Un article de février 2024, non touché depuis, affirmait avoir été modifié en même temps que la homepage.

Google traite le `lastmod` comme un indice de confiance. Quand il est manifestement faux, il cesse de le lire, et on perd le signal qui accélère le recrawl lors d'une vraie mise à jour.

Décision : **retirer la ligne.** Aucun `lastmod` vaut mieux qu'un `lastmod` menteur.

## Conséquence, et ce qu'il faudrait faire un jour

Google n'a plus aucun signal de fraîcheur sur ce site. Après une modification importante, il faut demander l'indexation à la main dans la Search Console (quota d'une dizaine d'URL par jour).

Le bon réglage serait un `lastmod` **par page**, dérivé de la date du dernier commit touchant son fichier source, via l'option `serialize` de `@astrojs/sitemap`. Une trentaine de lignes. Tant que ce n'est pas fait, **ne pas réintroduire `lastmod: new Date()`** : c'est un retour au mensonge.

Le filtre du sitemap exclut par ailleurs `/tag/`, `/category/`, la pagination (`/\d+\/?$/`) et `/en/`. Ces pages sont servies en `noindex` : un sitemap ne doit déclarer que des URLs indexables.
