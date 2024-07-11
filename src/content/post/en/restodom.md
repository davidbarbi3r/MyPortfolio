---
publishDate: 2024-07-07T00:00:00Z
title: Rest-o-dom
excerpt: Création d'un site internet avec accès client et systeme de commande de repas
image: '~/assets/images/restodom-hero.png'
category: Portfolio
tags:
  - next.js
  - tailwind
  - typescript
  - amazon SES
  - SQLite (Turso DB)
  - cloudflare
metadata:
  canonical: https://www.davidbarbier.com/restodom
---

**Création de site avec développement spécifique** 

### Nom du projet
Restodom [Restodom](https://restodom.fr)

### Date de réalisation
05/2024

### Rôle
Développeur et désigner du projet

### Commande / Objectifs
Restodom, c'est la création d'une nouvelle solution de portage de repas pour personnes agées à Bordeaux. L'objectif est de se différencier des concurrents par une approche centrée sur l'humain avant tout avec des prix doux pour le client. 

Après analyse des solutions concurrentes et afin d'avoir une expérience utilisateur la plus fluide possible j'ai développé les fonctionnalités suivantes :

- Création d'un site professionnel, épuré et axé sur la facilité et la clarté des informations,
- Création d'une interface administrateur intuitive mettre à jour les menus et les textes de certaines parties du site,
- Possibilité pour l'administrateur d'importer directement les excels fournis par la société partenaire de cuisine collective afin de mettre à jour les menus.
Tout le processus se passe sans aucun retraitement de la part de l'administrateur afin d'assurer un gain de temps maximal et éviter le risque d'erreurs de saisie. 
- Système de commande client intuitif et dynamique, les prix se mettent à jour de façon automatique en fonction des éléments du menu choisi. De plus il a été apporté un soin particulier à l'expérience utilisateur étant donné la population visée, les boutons ont été adaptés ainsi qu'un feedback par couleurs afin de visualiser facilement les choix effectués. 

Ces améliorations vont permettre de mieux gérer les services et d'avoir une expérience utilisateur plus fluide que celle des concurrents du secteur sur Bordeaux. 

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
Un outil simple pour gérer les envois d'email aux clients et au gérant à chaque commande. 
Les mails peuvent être développés en React ce qui assure la cohérence avec la stack globale de l'application. 

# Résultat et performances

Le site est en ligne et est disponible ici [Restodom](https://restodom.fr)

L'analyse avec PagesSpeedInsight montre de bonnes performances du site, tant en desktop qu'en mobile ![Restodom performance report](~/assets/images/restodom-perf.png)

Ça permettra à mon client de ne pas avoir à se soucier des performances du site pour son référencement SEO.

Le site a également été pensé pour avoir le plus faible impact écologique possible, tant pour la conception du site (requêtes limitées et cachées, utilisation du SSR, taille du DOM faible) que pour le choix d'hébergement, le site est hébergé avec CloudFlare qui sont engagés dans une démarche écoresponsable, leurs datacenters sont alimentés en énergies renouvelables ce qui limite d'autant plus l'impact environnemental du site.
[Rapport sur l'impact environnemental du site](https://www.websitecarbon.com/website/restodom-fr/)

## Et si c'était vous ?

N'hésitez pas à me contacter pour assurer la création de votre projet 
[Me Contacter](https://www.davidbarbier.com/contact)