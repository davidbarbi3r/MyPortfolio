---
status: accepted
date: 2026-07-10
---

# Un `aggregateRating` n'est posé que si les témoignages sont visibles sur la page

Quatre pages déclaraient une note de 5/5 sans afficher le moindre avis dans leur contenu. Les règles Google sur les extraits d'avis exigent que le balisage corresponde à du contenu **visible sur cette page précise**. Un rating orphelin est du review snippet spam, et c'est ce qui déclenche une action manuelle.

Décision : **pas d'`aggregateRating` sans bloc d'avis rendu dans le HTML.** Le rating a été retiré de `/agence-web-expert-comptable/`, `developpeur-specialise` et `maintenance-site-internet-ajaccio`. Sur `creation-site-vitrine-ec`, il a été rétabli **après** avoir ajouté une section `#avis` affichant les témoignages des cabinets, accompagnée des nœuds `Review` correspondants. La page maintenance de Limoges n'en a pas, faute de témoignage.

La règle est encodée en commentaire dans `src/utils/business-schema.ts` et `src/utils/reviews.ts`.

## Le double typage `["Product", "Service"]`

Les nœuds d'offre sont typés à la fois `Product` et `Service`. La raison est documentée dans `business-schema.ts` : un `aggregateRating` sur un `Service` seul est rejeté par Google, et sur un `LocalBusiness` il est ignoré comme « self-serving ». `Product` est éligible et échappe à cette règle.

**C'est un contournement assumé, et il fonctionne** : Google affiche bien les étoiles `5,0 (20)` dans la SERP. Ce n'est pas pour autant conforme à l'esprit des règles. C'est précisément pour cette raison que la contrainte ci-dessus (pas de rating sans avis visible) n'est pas négociable : elle est la seule chose qui rende l'ensemble défendable.

Les compteurs d'avis vivent dans `src/utils/reviews.ts` (`GBP_AJACCIO_REVIEWS`, `GBP_LIMOGES_REVIEWS`). Ils étaient périmés (16 déclarés contre 20 réels). **Les resynchroniser avec Google Maps à chaque nouvel avis.**
