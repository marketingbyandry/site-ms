# Dossier de preuves des pages alternatives

Ce dossier (`docs/`) est exclu du déploiement (`.vercelignore`) : il n'est jamais publié sur cabinetms.fr.

## Index

| Dossier | Collecte | Page appuyée | Prochaine revue |
|---|---|---|---|
| `selectra/` | 10/10/2026 | `alternative-selectra-professionnel.html` | 10/04/2027 |
| `opera-energie/` | 10/10/2026 | `alternative-opera-energie-professionnel.html` | 10/04/2027 |
| `hellowatt/` | 10/10/2026 | `alternative-hellowatt-professionnel.html` | 10/04/2027 |
| `kelwatt/` | 10/10/2026 | `alternative-kelwatt-professionnel.html` | 10/04/2027 |
| `papernest/` | 14/10/2026 | `alternative-papernest-professionnel.html` | 14/04/2027 |
| `hub/` | 10/10/2026 à 14/10/2026 (note d'avocat seule) | `alternatives-courtier-energie.html` | 10/04/2027 |

Prochaine revue = date de collecte + 6 mois.

## Procédure de revue

1. Recollecter les pages sources avec Firecrawl (captures pleine page, extraits texte).
2. Mettre à jour `faits.md`, les captures et les instantanés Wayback du dossier.
3. Mettre à jour la mention « vérifiées le » de la page ET le `dateModified` du JSON-LD.
4. Relancer `npm test` (et `npm run build:search` si le test d'index le demande).
5. Mettre à jour `note-avocat.md` (affirmations, numéros de ligne déplacés).

## Points à confirmer par Antoine

- « suivi du dossier jusqu'au prochain renouvellement » (utilisé sur les 5 pages).
- « interlocuteur unique pour l'ensemble du parc » (Selectra, Opéra).
- « cabinet de plus petite taille » (Opéra).
- « cœur de métier » (note Hellowatt).
