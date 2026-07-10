---
status: accepted
date: 2026-07-10
---

# Les redirections vivent dans `public/_redirects`, jamais dans Cloudflare

Le site est servi par **Cloudflare Pages**. Deux Redirect Rules existaient dans le tableau de bord Cloudflare. Elles s'exécutent à l'edge, **avant** que la requête n'atteigne `_redirects`, et masquaient donc silencieusement les règles du dépôt :

```
/referencement-seo-ajaccio/  -> /consultant-seo-ajaccio/        -> /agence-seo-ajaccio/
/creation-site-internet/     -> /creation-site-internet-ajaccio/ -> /
```

Chacune pointait vers une URL elle-même redirigée, créant deux sauts au lieu d'un. Le bug était invisible depuis le dépôt : le fichier `_redirects` était correct, la production ne l'appliquait pas. La deuxième règle s'appelait « Duplicate of redirection referencement-seo-ajaccio to consultant-seo-ajaccio », un copier-coller dont seule la source avait été changée.

Décision : les deux règles Cloudflare ont été supprimées. **Toutes les redirections vivent dans `public/_redirects`**, versionné, lisible, diffable, déployé avec le reste. Ne jamais en recréer dans le tableau de bord.

## Comment détecter une récidive

Une Redirect Rule Cloudflare en « Wildcard pattern » matche l'URI complète. Ajouter un paramètre la fait échouer, et la requête retombe alors sur l'origine :

```bash
curl -sI https://www.davidbarbier.com/une-url/         # ce que sert l'edge
curl -sI "https://www.davidbarbier.com/une-url/?cb=9"  # ce que sert _redirects
```

Une divergence entre les deux `Location:` signale une règle Cloudflare masquante. Ce test ne détecte que les règles qui masquent une règle locale ; une règle portant sur une URL absente de `_redirects` reste invisible.

## Décisions annexes sur Cloudflare

- **Cache Rules : aucune.** La règle « Cache Everything » reste désactivée. Le HTML est déjà servi depuis l'edge par Pages (`cf-cache-status: DYNAMIC`, `max-age=0, must-revalidate`). La mettre en cache CDN ne gagnerait presque rien et servirait du HTML périmé après chaque déploiement.
- **`netlify.toml` est mort.** Le site n'est pas hébergé par Netlify. Ses six directives ne sont jamais appliquées. Ne pas l'éditer en croyant changer quelque chose.
- Le cache est piloté par `public/_headers` : `/_astro/*` et `/fonts/*` en `max-age=31536000, immutable`. Les noms de police ne sont pas versionnés : **renommer le fichier** si on remplace une police.
