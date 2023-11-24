---
ublishDate: 2023-06-06T00:00:00Z
title: Matchings
excerpt: Une application fullstack sur mesure pour permettre à un groupement de sociétés de gérer leurs stocks de pneus 
image: '~/assets/images/robert-laursoo-WHPOFFzY9gU-unsplash.jpg'
category: Portfolio
tags:
  - react
  - materialUI
  - express.js
  - firebase
  - open-api
metadata:
  canonical: https://www.davidbarbier.com/matchings
---

** Développement spécifique **

Ce projet a été un véritable challenge technique lors de sa réalisation, j'ai pu travailler en équipe avec un autre développeur expérimenté qui validait mon travail ce qui m'a permit de bien progresser et surtout d'être sur de livrer un travail fonctionnel et de qualité au client. 

## Objectifs du projet

Ce projet a été commandé par un groupement de sociétés de leasing afin de gérer leur stock de pneus, ça peut paraitre enfantin mais finalement avec une flotte de plus de 10 000 véhicules le bon suivi du parc de pneumatique permet à l'entreprise de réaliser des économies substentielles. 

L'application devait donc permettre de: 
- lire des fichiers excel (leur ancienne méthode de gestion) et les traiter afin d'importer les pneus en base de données,
- avoir la possibilité de modifier, supprimer des entrées pour certains types d'utilisateurs (système de rôles),
- avoir la capacité de faire des requêtes d'échange de pneus pour les conducteurs, l'application lance un process de validation hierarchique et effectue le transfert de même que la demande à l'api du transporteur,
- envoyer à une API tierce des formats de commande de pneus spécifiques afin d'obtenir une optimisation de prix en lots (api développée par une équipe data)

## Les choix technologiques

Concernant le frontend, il a été utilisé React avec Typescript et Material UI, ces technologies étaient parfaitement adaptées pour le développement de l'application et ont permis de la rendre attrayante et avec une bonne UX sans y passer trop de temps. L'application avait également pour contrainte d'être traduite ce que nous avons réalisé avec I18n.

Pour le backend une API REST en ExpressJS avec Typescript à été réalisée avec un Swagger afin que d'éventuelles parties prenantes puissent se greffer au projet par la suite. 

Concernant la base de données il a été utilisé Firebase (NoSQL) afin de pouvoir itérer rapidement sur les modèles de données au besoin. De plus firebase propose tout un système de gestion d'authentification et assure la scalabilité du service si le nombre d'utilisateurs viendrait à augmenter fortement.

## Améliorations futures

L'application a été livrée au stade de MVP totalement fonctionnel ce qui a permis à l'entreprise de nouer des partenariats et de lever des fonds. 
D'autres développements seront éventuellement nécessaires lors de la vie de cette application en fonction des retours réels des utilisateurs. 
Il n'est pour l'instant pas prévu d'améliorations.  

## Déploiement

Le projet a été déployé à chaque PR en version de test afin de s'assurer du bon fonctionnement global de l'application par le client. Lorsque les validations ont été realisées elles sont passées en version de production.
Les services de Google Cloud ont été utilisés pour ce projet. 

## Liens

Étant donné la nature interne de cette application je ne peux pas fournir de liens pertinents. 