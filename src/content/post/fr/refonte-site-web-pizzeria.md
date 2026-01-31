---
publishDate: 2024-02-16T00:00:00Z
title: Refonte site internet Pizzeria
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
  canonical: https://www.davidbarbier.com/refonte-site-web-pizzeria
---

## Explication de la refonte et des besoins du client
Le site internet de la pizzeria était fonctionnel mais avec un design vieillissant et des fonctionnalités limitées.
Le client souhaitait une refonte complète du site pour améliorer l'expérience utilisateur et augmenter les ventes en ligne.

Pizza Carmes, c'est avant tout l'histoire de deux anciens salariés qui ont repris le fonds d'une célèbre enseigne de pizza. Ils ont fondés leur propre restaurant afin d'être totalement indépendants et de s'affranchir des contraintes d'un restaurant franchisé.

Afin d'améliorer leurs ventes et le parcours clients, ils m'ont contacté pour effectuer la refonte du site, tant au niveau design que des fonctionnalités :

- Possibilité de choisir des suppléments lors de la commande de pizza,
- Possibilité de choix de l'épaisseur de la pate dans les menus, 
- Création d'une interface administrateur intuitive pour modifier, ajouter, supprimer pizzas, menus, ingrédients etc...
- Gestion des ruptures de stocks par l'interface admin,
- Ajout de suggestions de vente avant paiement,
- Gestion dynamique des temps de livraison / retrait sur place ... 

Ces améliorations vont permettre de mieux gérer les services notamment en période de rush et également d'augmenter le panier moyen de commandes. 

## Les principaux défis sur cette refonte

### L'expérience utilisateur: UX/UI
Le passage au nouveau site doit être intuitif pour les clients habitués à l'ancien site, il est donc important de conserver les fonctionnalités existantes et de les améliorer.

### La cohérence du design
Le design doit aussi être dans la continuité de l'ancien site pour ne pas dérouter les clients et conserver l'identité visuelle de la pizzeria et l'image de marque.

### La gestion des commandes
Le client souhaitant conserver le système de notification des commandes passées par email, le principal défi des email est le fait d'avoir un système réactif et être sur que les emails arrivent à la pizzeria.

### Le SEO existant
Le site existant avait un bon référencement naturel, il est donc important de conserver les bonnes pratiques SEO pour ne pas perdre en visibilité sur les moteurs de recherche.

## Technologies utilisées pour le nouveau site
L'ancien site internet était développé en PHP, j'ai décidé de refaire le site en utilisant les technologies suivantes (que je maitrise mieux) :
- J'ai décidé d'utiliser le framework Javascript [Next.js](https://nextjs.org/), ce framework permet un développement agréable, un routing efficace et des options confortables coté rendu (soit statique, SSR ou CSR).
  Il permet notamment d'obtenir de très bonnes performances des sites en terme de vitesse d'affichage.  
  Ce framework utilise la librairie React pour permettre le développement facile d'interfaces interactives et modernes pour l'utilisateur.
  De plus Next permet d'avoir une application qui comprends le backend et le frontend, cela réduit des coûts de d'hébergement et facilite le développement avec un partage des types entre le frontend et le backend dans la même application.
- Amazon pour les emails et notifications,
- Aiven pour la base de données PostgreSQL cloud,

## Résultat et performances

Le site est en ligne et est disponible ici <a href="https://pizza-limoges.fr" rel="nofollow" target="_blank">Pizza Carmes</a>

L'analyse avec PagesSpeedInsight montre de bonnes performances du site, tant en desktop qu'en mobile [Performance report](https://pagespeed.web.dev/analysis/https-pizza-limoges-fr/5qw2b2l7bt?form_factor=mobile)

<!-- ![lbg-perf.png](~/assets/images/lbg-perf.png) -->

Ça permettra à mon client de ne pas avoir à se soucier des performances du site pour son référencement SEO.

Le site a également été pensé pour avoir le plus faible impact écologique possible, tant pour la conception du site (requêtes limitées et cachées, utilisation du SSR, taille du DOM faible) que pour le choix d'hébergement, le site est hébergé avec CloudFlare qui sont engagés dans une démarche écoresponsable, leurs datacenters sont alimentés en énergies renouvelables ce qui limite d'autant plus l'impact environnemental du site.
[Rapport sur l'impact environnemental du site](https://www.websitecarbon.com/website/pizza-limoges-fr/)

## Et si c'était vous ?

N'hésitez pas à me contacter pour assurer la création de votre site vitrine éco-conçu et performant 
[Me Contacter](https://www.davidbarbier.com/contact)
