---
status: accepted
date: 2026-07-10
---

# Les données Search Console sont gonflées par des robots ; Umami fait foi

Environ **75 % des impressions Search Console de ce site sont générées par des rank trackers**, pas par des humains. Mesuré le 2026-07-10 sur 180 jours : 51 469 impressions brutes, environ 13 500 humaines, 63 clics attribués par requête (mais plus de 150 réels quand on compte par page).

Le détecteur est la **part de mobile**. L'étalon humain est la requête de marque « david barbier », à 57 % de mobile. Une requête sous 15 % de mobile est presque certainement un tracker : « freelance wordpress biguglia » sortait en position 4,0 avec 0 % de mobile et 0 clic, et tout le cluster expert-comptable est à 10-12 %.

Décision : **piloter l'acquisition avec Umami**, qui voit le lead réel et son parcours d'entrée. La Search Console ne sert plus que d'indicateur de position, et **jamais sur des fenêtres de plus de 90 jours**.

## Conséquences

Quatre pièges vérifiés, chacun a produit une conclusion fausse avant d'être compris :

1. **Une impression en page 2 ou 3 n'est comptée que si l'utilisateur y navigue.** Les humains n'y vont jamais, les trackers récupèrent le top 100. Une « position 4 avec 0 clic » est un fantôme.
2. **Une position moyenne sur 180 ou 365 jours masque les changements de régime.** « refonte site comptable » affichait 2,9 sur 365 jours alors que le site avait disparu de la requête depuis un mois. Même piège sur les 61 % de clics Limoges de la homepage, et sur les 817 impressions des URLs `/en/`, toutes mortes depuis 90 jours.
3. **L'agrégat par requête cache environ 60 % des clics** (requêtes rares anonymisées). Toujours croiser avec la dimension `page`.
4. **Les données s'arrêtent à J-3.** Un lead d'avant-hier n'y figure pas.

Un client Search Console est installé hors dépôt : `~/.config/gsc/gsc.py` (venv dans `~/.config/gsc/venv`, clé de compte de service `sa.json`, propriété `sc-domain:davidbarbier.com`, accès `siteOwner` donc inspection d'URL disponible). Les fiches Google portent un `?utm_source=gbp&utm_campaign=ajaccio|limoges` pour séparer fiche et organique dans Umami.
