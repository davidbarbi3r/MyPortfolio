---
publishDate: 2024-02-16T00:00:00Z
title: Pizza Carmes
excerpt: Refonte d'un site internet permettant la commande en ligne et le paiement des pizzas
image: '~/assets/images/pizza-carmes.png'
category: Portfolio
tags:
  - next.js
  - tailwind
  - typescript
  - resend
  - postgresql
  - cloudflare
metadata:
  canonical: https://www.davidbarbier.com/pizza-carmes
---

**Création de site e-commerce custom** 

### Nom du projet
Pizza Carmes [Pizza Carmes](https://pizza-limoges.fr)

### Date de réalisation
01/2024

### Rôle
Développeur et désigner du projet

### Commande / Objectifs
Pizza Carmes, c'est avant tout l'histoire de deux anciens salariés qui ont repris le fonds d'une célèbre enseigne de pizza. Ils ont fondés leur propre restaurant afin d'être totalement indépendants et de s'affranchir des contraintes d'un restaurant franchisé.

Afin d'améliorer leurs ventes et le parcours clients, ils m'ont contacté pour effectuer la refonte du site, tant au niveau design que des fonctionnalités :

- Possibilité de choisir des suppléments lors de la commande de pizza,
- Possibilité de choix de l'épaisseur de la pate dans les menus, 
- Création d'une interface administrateur intuitive pour modifier, ajouter, supprimer pizzas, menus, ingrédients etc...
- Gestion des ruptures de stocks par l'interface admin,
- Ajout de suggestions de vente avant paiement,
- Gestion dynamique des temps de livraison / retrait sur place ... 

Ces améliorations vont permettre de mieux gérer les services notamment en période de rush et également d'augmenter le panier moyen de commandes. 

Le site est entièrement conçu selon les bonnes pratiques de référencement naturel, de responsive design et d’optimisation des performances. 

### Technologies utilisées

#### Nextjs
Pour ce projet j'ai décidé d'utiliser le framework Javascript [Next.js](https://nextjs.org/), ce framework permet un développement agréable, un routing efficace et des options confortables coté rendu (soit statique, SSR ou CSR). 
  
  Il permet notamment d'obtenir de très bonnes performances des sites en terme de vitesse d'affichage.  
  Ce framework utilise la librairie React pour permettre le développement facile d'interfaces interactives et modernes pour l'utilisateur. 
  De plus Next permet d'avoir une application qui comprends le backend et le frontend, cela réduit des coûts de d'hébergement et facilite le développement avec un partage des types entre le frontend et le backend dans la même application.

#### Typescript
Lorsque un site que je développe comprends beaucoup de logique, de modèles de données comme Pizza Carmes j'apprécie que mon code soit typé, le confort apporté par l'autocomplétion et la détection des erreurs en amont permet un développement plus fluide et un code plus maintenable dans le temps.

#### Tailwind
Je trouve que tailwind permet de faire du CSS de façon rapide et efficace une fois accoutumé à la syntaxe. [TailwindCSS](https://tailwindcss.com/)

#### Resend
Un outil simple pour gérer les envois d'email aux clients et au gérant de la pizzeria à chaque commande. 
Les mails peuvent être développés en React ce qui assure la cohérence avec la stack globale de l'application. 

# Résultat et performances

Le site est en ligne et est disponible ici [Pizza Carmes](https://pizza-limoges.fr)

L'analyse avec PagesSpeedInsight montre de bonnes performances du site, tant en desktop qu'en mobile [Performance report](https://pagespeed.web.dev/analysis/https-pizza-limoges-fr/5qw2b2l7bt?form_factor=mobile)

<!-- ![lbg-perf.png](~/assets/images/lbg-perf.png) -->

Ça permettra à mon client de ne pas avoir à se soucier des performances du site pour son référencement SEO.

Le site a également été pensé pour avoir le plus faible impact écologique possible, tant pour la conception du site (requêtes limitées et cachées, utilisation du SSR, taille du DOM faible) que pour le choix d'hébergement, le site est hébergé avec CloudFlare qui sont engagés dans une démarche écoresponsable, leurs datacenters sont alimentés en énergies renouvelables ce qui limite d'autant plus l'impact environnemental du site.
[Rapport sur l'impact environnemental du site](https://www.websitecarbon.com/website/pizza-limoges-fr/)

## Et si c'était vous ?

N'hésitez pas à me contacter pour assurer la création de votre site vitrine éco-conçu et performant 
[Me Contacter](https://www.davidbarbier.com/contact)