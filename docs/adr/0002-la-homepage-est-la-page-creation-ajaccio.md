---
status: accepted
date: 2026-07-10
---

# La homepage est la page « création de site internet à Ajaccio »

`/creation-site-internet-ajaccio/` avait un `<title>` et un `<h1>` parfaitement alignés sur la requête, et se classait **position 49**. La homepage, dont le titre parlait d'« agence web », se classait **position 15** sur cette même requête. Sur les 90 jours précédents, la page dédiée a rapporté 4 clics, la homepage 29.

La cause est structurelle : sur une requête locale commerciale, Google classe des **entités**, et l'entité est incarnée par la racine du domaine, qui concentre tous les liens externes. Une page profonde sans backlinks ne rattrape pas ça, quel que soit son on-page. Les six concurrents qui nous battent sur cette requête classent tous leur homepage, aucun n'a de page dédiée.

Décision : le contenu utile de la page dédiée (tarifs, délai de 4 à 6 semaines, processus en 4 étapes, FAQ) a été **porté dans `index.astro`**, la page a été supprimée, et `/creation-site-internet-ajaccio/` redirige en 301 vers `/`. Les 16 liens internes qui la visaient ont été repointés vers la racine avant la suppression.

Le `<title>` de la homepage reprend **mot pour mot** le nom de la fiche Google Business Profile (`BUSINESS_NAME`), plus la ville. Voir [0007](0007-un-seul-nom-commercial-sans-ville.md).

## Ce qui a été délibérément écarté

Seuls trois blocs ont été portés, pas les 1 696 lignes de la page. La SERP montre que la profondeur de contenu ne décide rien ici : les gagnants font 421 à 1 088 mots. Ont été retenus les seuls éléments différenciants mesurés sur cette SERP : le **prix** (un seul concurrent sur six l'affiche), le **délai** (aucun ne l'annonce), et le **processus** (quatre sur six en ont un). Plus une FAQ, qu'aucun n'a.

La section « freins » et le bloc « votre site est sous WordPress ? » n'ont pas été portés : ils faisaient doublon avec le comparatif agence contre freelance déjà présent sur la homepage.

Supersède `docs/superpowers/plans/2026-04-21-ajaccio-page-redesign.md`, qui concernait la page supprimée.
