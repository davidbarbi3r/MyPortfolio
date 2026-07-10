# Calendrier éditorial — juin / juillet / août 2026

Cadence : 1 article par semaine, publication le jeudi.
Workflow : on rédige à l'avance avec `draft: true` dans le frontmatter, et le jour de publication on passe `draft: false` + commit + déploiement.

## Checklist de publication (à dérouler pour chaque article)

- [ ] `draft: false` dans le frontmatter
- [ ] Relecture : zéro tiret long, prix/dates à jour, liens internes valides
- [ ] Ajouter l'article dans `public/llms.txt` (section Articles de référence)
- [ ] Vérifier le rendu local (`npm run dev`) : image de couverture, sommaire, FAQ
- [ ] Commit + déploiement
- [ ] Post fiche Google (GBP) dans la foulée
- [ ] Post LinkedIn si l'article contient des données originales

## Planning

| Date | Article | Slug prévu | Mot-clé cible | Pilier | Statut |
|------|---------|-----------|---------------|--------|--------|
| ~~11 juin~~ | ~~Combien coûte un site internet en Corse ?~~ | `combien-coute-site-internet-corse` | prix site internet corse | Local BOFU | ✅ Publié |
| ~~11 juin~~ | ~~Aides à la création de site internet en Corse~~ | `aide-creation-site-internet-corse` | aide création site internet corse | Local BOFU | ✅ Publié |
| 18 juin | Devis de site internet : 14 points à vérifier avant de signer | `devis-site-internet-checklist` | devis site internet | Guide pratique | 🟢 Rédigé (draft) — avant publication : ajouter le lien entrant depuis l'article prix + **vérifier que lapothicoeur.fr répond bien en HTTPS** (bascule en cours, sinon lier le .com) |
| 25 juin | Votre entreprise apparaît-elle dans ChatGPT ? (étude requêtes locales) | `entreprise-visible-chatgpt-ia` | être visible sur chatgpt / IA | IA & visibilité | ⚪ À faire — **collecte des requêtes IA à faire semaine du 16 juin (David + Claude)** |
| 2 juillet | Combien de temps pour être visible sur Google ? La vraie réponse | `combien-temps-referencement-google` | combien de temps référencement | Guide pratique | ⚪ À faire |
| 9 juillet | Les cabinets comptables dans ChatGPT : qui est cité et pourquoi | `expert-comptable-chatgpt-visibilite` | expert-comptable IA / visibilité | EC × IA | ⚪ À faire — réutilise la méthodo du 25 juin |
| 16 juillet | AI Overviews de Google : ce que ça change pour une TPE | `ai-overviews-google-tpe` | ai overviews google | IA & visibilité | ⚪ À faire — article de référence à mettre à jour en continu (`updateDate`) |
| 23 juillet | Fiche Google suspendue : la procédure pour la récupérer | `fiche-google-suspendue-que-faire` | fiche google suspendue | Guide SOS | ⚪ À faire — maille vers /optimisation-fiche-google-ajaccio/ |
| 30 juillet | Étude de cas Endoajaccio : 5 nouveaux patients par jour | `endoajaccio-etude-de-cas` | site internet profession de santé | Preuve locale | ⚪ À faire — valider les chiffres avec le client avant rédaction |
| 6 août | Je crée des sites avec l'IA : ce qu'elle fait bien, ce qu'elle rate | `creer-site-internet-avec-ia` | créer site internet avec IA | IA & méta | ⚪ À faire |
| 13 août | Récupérer son site : domaine, hébergeur, prestataire injoignable | `recuperer-site-internet-domaine` | récupérer nom de domaine site | Guide SOS | ⚪ À faire — maille vers l'argumentaire location de site |
| 20 août | Combien coûte le site d'un cabinet d'expertise comptable ? | `prix-site-internet-expert-comptable` | prix site expert-comptable | EC BOFU | ⚪ À faire — décliné de l'article prix Corse, timing rentrée EC |
| 27 août | Le SEO est-il mort à cause de l'IA ? La réponse d'un consultant qui en vit | `seo-mort-ia` | le seo est-il mort | IA & opinion | ⚪ À faire — article de rentrée, ton tranché |

## Notes de production

- **25 juin et 9 juillet (études ChatGPT)** : nécessitent une collecte manuelle (interroger ChatGPT/Perplexity/Gemini sur 10-15 requêtes locales et EC, captures d'écran). Prévoir 1h, données = l'atout citation/backlink de ces articles.
- **Règles rédactionnelles** : pas de tirets longs, pas de listes de villes, pas de jargon technique gratuit, réponse directe extractible dans l'intro, FAQ en fin d'article, 1 lien interne entrant minimum depuis une page existante.
- **Août** : trafic B2B local plus faible, on y place les sujets evergreen/SOS qui vivent sur la durée. L'opinion "SEO mort ?" cale sur la rentrée.
- **Rappel GBP** : reprogrammer un rappel CRESCE fin juin ("dernières semaines pour candidater"), puis retirer après le 15 juillet.
