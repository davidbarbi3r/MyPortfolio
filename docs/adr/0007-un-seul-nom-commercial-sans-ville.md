---
status: accepted
date: 2026-07-10
---

# Un seul nom commercial, sans nom de ville : `David Barbier | Création de site internet et SEO`

L'entité portait **quatre noms différents** : la fiche Google d'Ajaccio disait « David Barbier », celle de Limoges « David Barbier | Référencement SEO et création web », et `business-schema.ts` déclarait deux autres variantes. Pire, la homepage et le fichier partagé définissaient tous deux l'`@id` `#localbusiness` avec des noms distincts : Google fusionne les nœuds par `@id` et recevait donc une entité qui s'appelait deux choses à la fois.

Décision : une constante unique, `BUSINESS_NAME` dans `src/utils/business-schema.ts`, propagée aux quatre nœuds `LocalBusiness`, aux deux fiches Google, au `<title>` de la homepage, et à terme aux citations (PagesJaunes, France Num, CCI Business, Infobel).

## Pourquoi pas de ville dans le nom

Ajouter un nom de ville au nom d'établissement est **explicitement interdit** par Google et constitue le premier motif de suspension de fiche. Google connaît déjà la ville, elle est dans l'adresse. Les concurrents le font (« Crimson Factory I création site internet et e-commerce à Limoges ») et ça marche, mais le risque est la perte des 20 avis.

Le descriptif « Création de site internet et SEO » est en revanche défendable, à une condition : que ce soit le nom commercial **réellement utilisé partout**, site, devis, signature, annuaires. À ce moment-là ce n'est plus du bourrage de mots-clés, c'est un nom commercial.

## Décisions annexes écartées, avec leurs raisons

- **« David Développe »**, la marque Instagram, ne figure pas dans le nom. Elle pèse **zéro impression** sur 180 jours. « david barbier » en pèse 921 et rapporte 30 des 48 clics attribués à la homepage. On ne troque pas le seul actif de marque existant contre une marque qui n'existe pas encore.
- **« IA »** ne figure pas non plus. Zéro impression sur 180 jours, dans toutes les orthographes.
- Le nœud `WebSite` porte « David Barbier » tout court : c'est le nom de site affiché sous l'URL en SERP, et Google veut un nom court, pas une phrase.

## Fiche Google : configuration cible

```
Principale   : Concepteur de sites Web        (15 000 + 10 000 impressions)
Secondaire 1 : Entreprise de logiciels        (le développement d'applications, 5 000 € la mission)
Secondaire 2 : Service de marketing Internet  (15 693 impressions SEO)
```

« Consultant informatique » a été remplacée : elle ne couvrait que 59 impressions et zéro clic, et attirait de l'assistance informatique générique.
