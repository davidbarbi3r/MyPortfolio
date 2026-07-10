# Décisions d'architecture

Une décision par fichier. Ne sont consignées que celles qui sont **difficiles à revenir en arrière**, **surprenantes sans contexte**, et **issues d'un vrai arbitrage**.

| # | Décision |
|---|---|
| [0001](0001-gsc-est-gonflee-par-les-robots.md) | Les données Search Console sont gonflées par des robots ; Umami fait foi |
| [0002](0002-la-homepage-est-la-page-creation-ajaccio.md) | La homepage est la page « création de site internet à Ajaccio » |
| [0003](0003-limoges-une-intention-une-page.md) | À Limoges, `/limoges/` est la page création, et il n'y a pas de page enfant |
| [0004](0004-aggregaterating-seulement-si-avis-visibles.md) | Un `aggregateRating` n'est posé que si les témoignages sont visibles |
| [0005](0005-les-redirections-vivent-dans-_redirects.md) | Les redirections vivent dans `public/_redirects`, jamais dans Cloudflare |
| [0006](0006-pas-de-lastmod-dans-le-sitemap.md) | Le sitemap ne porte pas de `lastmod` |
| [0007](0007-un-seul-nom-commercial-sans-ville.md) | Un seul nom commercial, sans nom de ville |
| [0008](0008-expert-comptable-un-canal-pas-un-marche-seo.md) | L'expert-comptable est un canal de recommandation, pas un marché SEO |

---

## Où on en est, au 2026-07-10

### Ce qui a été déployé cette semaine

**Structure.** La homepage absorbe la page création d'Ajaccio et gagne les tarifs, le délai, le processus et une FAQ. `/limoges/` devient la page création de Limoges. `/limoges/wordpress/` et `/creation-site-internet-ajaccio/` sont supprimées et redirigées. Le site passe de 37 à 35 pages, le sitemap de 36 à 30 URLs.

**Balisage.** Un seul nom d'entité dans tout le HTML. Les étoiles reviennent sur la page création expert-comptable, adossées à deux témoignages de cabinets réellement visibles. La page maintenance de Limoges reçoit son premier JSON-LD (elle était la seule page de service sans aucun balisage). Un prix fixe de 1 200 € y contredisait un affichage « à partir de 2 000 € » : corrigé en `minPrice`.

**Titres.** Quatre pages retitrées, avec le prix dedans quand il est un avantage concurrentiel : la homepage, `/limoges/`, `/limoges/maintenance-site-internet/` (« dès 30 € / mois », contre 50 et 55 € chez les concurrents de la page 1), et `creation-site-vitrine-ec` (« dès 2 000 € HT »).

**Infrastructure.** Deux Redirect Rules Cloudflare supprimées, elles créaient des chaînes invisibles depuis le dépôt. Les 22 redirections exactes pointent chacune vers une cible unique, en un saut, vers un 200. Les polices passent de 4 heures à un an de cache. Aucun lien interne ne pointe vers une URL redirigée ou absente.

**Fiche Google.** Renommée, catégorie secondaire « Consultant informatique » remplacée par « Entreprise de logiciels », service « Télémarketing » supprimé.

### Ce qu'il ne faut pas faire

**Ne rien toucher jusqu'au 2026-07-25.** Fiche renommée, catégories changées, deux pages fusionnées, deux URLs supprimées, quatre titres réécrits, deux règles Cloudflare nettoyées : le tout en trois jours. Un cinquième changement rendrait toute attribution impossible.

### Les six positions à relire, et rien d'autre

Ni les impressions ni la position moyenne, toutes deux polluées par les robots (voir [0001](0001-gsc-est-gonflee-par-les-robots.md)). Uniquement ces requêtes, sur une fenêtre de 90 jours, plus les leads dans Umami :

```
creation site internet ajaccio           (homepage, était en position 15)
creation site internet limoges           (/limoges/, était en position 28)
maintenance wordpress limoges            (position 7,8, 5e en direct dans la SERP)
agence digitale expert comptable         (hub EC, position 29)
creation site internet expert comptable  (creation-site-vitrine-ec, position 34)
david barbier                            (marque, position 7,1 ; on ne possède pas son propre nom)
```

### Chantiers ouverts

1. **Renouveler le domaine.** `davidbarbier.com` expire le **2026-07-25**.
2. **Vérifier la citation de Franck** (Val de Vienne Moto) sur `/limoges/` : reprise d'un avis Google tronqué par Maps.
3. **Ajouter l'avis de Laëtitia Bolvin** aux témoignages de cabinets (`TODO` dans `src/utils/reviews.ts`).
4. **Écrire la page-coin** « le site internet d'un cabinet d'expertise comptable qui s'installe ». Trente recherches mensuelles, concurrence nulle, intention maximale. C'est aussi l'atterrissage des posts LinkedIn.
5. **L'étude chiffrée** sur les cinquante sites de cabinets comptables les mieux classés de France. Un après-midi de code, et le seul moteur d'autorité disponible. Cible de citation : Compta Online, qui ranke déjà en page 1.
6. **Collecter des avis Google.** À Ajaccio, 20 avis en 5/5 et pourtant absent du pack local : voir plus bas. À Limoges, 4 avis contre 78 pour Crimson Factory, le pack est hors de portée cette année.
7. **`lastmod` par page** dérivé de git (voir [0006](0006-pas-de-lastmod-dans-le-sitemap.md)).
8. **Aligner les citations** (PagesJaunes, France Num, CCI Business, Infobel) sur `BUSINESS_NAME`.

### Le diagnostic de fond

Le site n'est pas invisible, il est en page 2. Position moyenne 19,5 en juin, contre 41,3 un an plus tôt. Aucune pénalité, aucun problème d'indexation, aucun problème technique.

**Le blocage est l'autorité**, et il est le même partout : en organique (position 29 sur les requêtes EC) comme dans le pack local d'Ajaccio (dixième, alors que deux établissements sans le moindre avis passent devant). Google calcule la notoriété locale à partir de ce qu'il sait du site ailleurs sur le web. Le local et l'organique ne sont donc pas deux problèmes, c'est le même.

Aucune optimisation on-page ne le résoudra. Des liens, si.
