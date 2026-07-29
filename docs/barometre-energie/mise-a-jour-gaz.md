# Mise à jour trimestrielle — Baromètre gaz

Chaque trimestre, avant de publier la synthèse éditoriale (voir
`docs/superpowers/specs/2026-07-27-barometre-energie-design.md`) :

1. Chercher une **moyenne trimestrielle réalisée de l'index PEG
   Month-Ahead (M+1)** — pas un prix spot, pas un tarif retail — dans
   les [rapports de surveillance des marchés de gros publiés par la
   CRE](https://www.cre.fr/) (`cre.fr`), qui restent la référence
   officielle. Ces rapports ont un délai de publication : pour un
   trimestre qui vient de se terminer, le rapport correspondant n'est
   généralement pas encore sorti.
2. **Si une moyenne trimestrielle réalisée existe** (rapport CRE
   disponible, ou autre source officielle équivalente) : noter le
   prix moyen en EUR/MWh, l'URL exacte consultée, et la date du jour
   de consultation. Ajouter une entrée standard dans
   `data/barometre-gaz.json` (champs `period`, `avgPriceEurPerMWh`,
   `source`, `sourceUrl`, `recordedAt`).
3. **Si aucune moyenne trimestrielle réalisée n'est disponible**
   (cas rencontré sur 2 des 3 premiers trimestres tentés — T1 et T2
   2026), ne jamais combler le trou avec une estimation ou un prix
   retail/forward présenté comme s'il s'agissait d'une moyenne de
   période. Deux options, selon ce qui est trouvable :
   - **Une clôture ponctuelle existe et est vérifiable** (ex. un
     relevé de presse spécialisée — Selectra notamment — citant la
     clôture d'un contrat PEG Month-Ahead à une date précise) :
     ajouter quand même une entrée dans `data/barometre-gaz.json`,
     mais marquée `"partial": true` avec un champ `"note"` explicitant
     qu'il s'agit d'une valeur observée à une date donnée et non
     d'une moyenne trimestrielle. Voir l'entrée `2026-Q3` dans
     `data/barometre-gaz.json` comme exemple concret de ce schéma.
   - **Rien de vérifiable n'est trouvable** (cas T1 et T2 2026) :
     ne pas créer d'entrée dans `data/barometre-gaz.json` pour ce
     trimestre. À la place, signaler l'absence de donnée directement
     dans la prose de l'article correspondant (voir
     `ms-blog-barometre-2026-t1.html` et `ms-blog-barometre-2026-t2.html`
     pour le ton à reprendre : le prix gaz y est explicitement décrit
     comme "en attente d'une source fiable", sans chiffre inventé).
4. Faire relire la nouvelle entrée (ou l'absence d'entrée, avec sa
   justification) par `quality-reviewer` avant de merger — même
   logique de revue que pour les mises à jour électricité
   automatiques.

## Schéma `data/barometre-gaz.json`

```json
{
  "quarterly": [
    {
      "period": "2026-Q3",
      "avgPriceEurPerMWh": 63.90,
      "source": "Selectra (reporting clôture PEG Month-Ahead)",
      "sourceUrl": "https://selectra.info/energie/actualites/prix-gaz/2026-07-25",
      "recordedAt": "2026-07-28T15:33:30.000Z",
      "partial": true,
      "note": "Dernière valeur observée à date de rédaction : 63,90 €/MWh, clôture du contrat PEG Month-Ahead (livraison août 2026) au 24 juillet 2026 — et non une moyenne trimestrielle, le T3 2026 étant encore en cours."
    }
  ]
}
```

`partial` et `note` sont optionnels : ils n'apparaissent que sur une
entrée "snapshot" (cas 3 ci-dessus). Une entrée standard (cas 2) ne
les inclut pas.

## Si un troisième trimestre consécutif manque de source fiable

T1 et T2 2026 ont tous les deux manqué de moyenne trimestrielle
réalisée publiquement disponible — 2 trimestres sur les 3 tentés à ce
jour. Si un **troisième** trimestre consécutif se retrouve dans le
même cas, c'est le signal qu'il faut revoir le processus de sourcing
lui-même plutôt que de continuer à appliquer ce contournement au
coup par coup : envisager une source secondaire stable (ex. un
fournisseur de données de marché avec accès API, ou un partenariat
avec un courtier gaz disposant de relevés PEG internes), et documenter
le changement dans ce fichier.
