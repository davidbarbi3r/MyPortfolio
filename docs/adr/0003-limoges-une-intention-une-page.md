---
status: accepted
date: 2026-07-10
---

# À Limoges, `/limoges/` est la page création, et il n'y a pas de page enfant

Même raisonnement qu'en [0002](0002-la-homepage-est-la-page-creation-ajaccio.md), transposé : `/limoges/` porte l'entité locale (fiche Google, adresse rue de la Fonderie), donc c'est **elle** qui doit viser « création de site internet à Limoges ». Elle captait déjà 1 303 impressions humaines (30 à 37 % de mobile) sur cette famille de requêtes, en position 28.

Créer un `/limoges/creation-site-internet/` aurait reproduit exactement l'erreur d'Ajaccio : une page profonde sans autorité, battue par son propre parent. Les trois concurrents qui dominent Limoges (Crimson Factory, Julien Laroche, Carole Labrugnas) n'ont aucun enfant, leur page d'entité s'intitule « Création de site internet à Limoges ».

Décision : `/limoges/` a été retitrée, et **`/limoges/wordpress/` a été supprimée** puis redirigée vers elle.

## Pourquoi tuer la page WordPress

Elle ne possédait rien. Sur 90 jours : 882 impressions, **zéro clic**. Elle se battait contre `/limoges/` sur la création (position 40 contre 28) et contre `/limoges/maintenance-site-internet/` sur la maintenance (position 30 contre 8). Sa seule requête propre, « wordpress consultant limoges », valait 36 impressions. Elle affichait par ailleurs 0,66 de similarité de vocabulaire avec `/freelance-wordpress-ajaccio/`, le pire score du site, le motif classique de la page satellite géographique.

## L'état visé, à maintenir

```
/limoges/                            -> création      (title sans « SEO »)
/limoges/consultant-seo/             -> SEO           (position 3,7 sur « consultant seo limoges »)
/limoges/maintenance-site-internet/  -> maintenance   (position 7,8 sur « maintenance wordpress limoges »)
```

Une intention, une page. « SEO » est délibérément absent du `<title>` de `/limoges/`, pour ne pas concurrencer `/limoges/consultant-seo/`.

La similarité de vocabulaire entre `/` et `/limoges/` est de **0,29**, soit le bruit de fond de la navigation et du pied de page. Deux pages sans rapport donnent le même chiffre. Si une modification future la fait monter, c'est un signal de page satellite : `/limoges/` doit garder son angle propre, l'installation en Corse assumée et le travail à distance.
