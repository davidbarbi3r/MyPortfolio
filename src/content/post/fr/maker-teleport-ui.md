---
publishDate: 2022-11-16T05:35:07.322Z
title: Maker teleport UI
excerpt: Interface utilisateur (UI) pour le Maker Teleport Bridge, l'objectif était de fournir une expérience utilisateur fluide pour faire passer les actifs d'une chain layer 2 (L2) au layer 1 (L1) en utilisant le TeleportSDK et des smart contracts. 
image: '~/assets/images/maker-teleport.jpg'
category: Portfolio
tags:
  - next.js
  - ether.js
  - typescript
  - blockchain
metadata:
  canonical: https://davidbarbier.com/maker-teleport-ui
---

## Objectifs du projet

J'ai conçu l'interface utilisateur (UI) pour le Maker Teleport Bridge en collaboration avec un développeur expérimenté en blockchain. Il m'a initié aux bibliothèques web3 pour interagir avec les contrats intelligents et offrir la meilleure expérience utilisateur possible.

Ce projet a été plaisant à mettre en œuvre car nous avons travaillé en équipe, en nous laissant le temps et l'espace pour implémenter de nouvelles fonctionnalités utiles au projet.

J'espère que ce projet sera officiellement utilisé et amélioré par Maker pour la future version officielle du Teleport Bridge.

## Fonctionnalités actuelles

Voici les fonctionnalités actuellement mises en œuvre dans ce projet d'interface utilisateur (UI) :
  - [X] Un utilisateur peut connecter son portefeuille de manière sécurisée,
  - [X] L'utilisateur peut voir la quantité de DAI détenue par chaîne,
  - [X] Peut échanger des jetons contre du DAI pour utiliser le pont sécurisé,
  - [X] Peut changer de chaîne actuelle,
  - [X] Peut faire passer des jetons de la couche 2 (L2) à la couche 1 (L1) (fonctionnalité alpha car le contrat intelligent de téléport est toujours en développement).

## Améliorations futures

Prochaines étapes pour ce projet :
   - [ ] Afficher l'étape à laquelle se trouve l'utilisateur lorsque le transfert se produit (initialisation du téléport, attente de l'attestation, appel aux oracles).
   - [ ] Ajouter des explications textuelles dans la fenêtre contextuelle du portefeuille pour l'utilisateur.
   - [ ] Ajouter des options avancées (to & data) pour les utilisateurs utilisant la fonction de relais.
   - [ ] Implémenter le fonctionnement lorsque l'utilisateur n'a pas suffisamment de DAI pour payer les frais de relais.

## Déploiement

Ce projet a été déployé de manière décentralisée. Nous avons utilisé Fleek pour l'héberger sur IPFS et ENS pour le nom de domaine. (La technique de déploiement n'est pas la meilleure pour fournir un site web rapide, cela prend beaucoup de temps pour s'afficher correctement)

## Liens

- [Projet Déployé décentralisé](http://teleportdai.eth.link)
- [Référentiel GitHub](https://github.com/davidbarbi3r/maker-teleport)
- [Documentation du SDK Teleport](https://makergrowth.github.io/teleport-sdk-docs/)