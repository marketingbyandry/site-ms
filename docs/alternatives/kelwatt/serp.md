# Relevé SERP : alternative à Kelwatt

Date : 2026-10-10. Outil : Firecrawl `firecrawl_search` (source web) pour les résultats organiques ; mots comptés par requête HTTP directe de chaque URL puis extraction du texte de la balise `<main>` (sinon page entière), séparation sur les espaces, hors script/style/nav/header/footer. Pas de géolocalisation forcée : résultats approximatifs. Les pages qui refusent la requête (403) ou rendues en JavaScript sont comptées 0 « non récupéré ». Les deux requêtes demandées par le brief sont relevées.

## Requête : « alternative à Kelwatt »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.kelwatt.fr/comparateur/gaz | 18761 (page du comparateur de Kelwatt lui-même, comptage gonflé par les tableaux de tarifs) |
| 2 | https://fr.trustpilot.com/review/kelwatt.fr | 0 (non récupéré, HTTP 403) |
| 3 | https://www.greenit.fr/2008/07/11/kelwatt-fr-comparer-les-fournisseurs-d-electricite/ | 0 (non récupéré, HTTP 403) |
| 4 | https://www.instagram.com/p/Cyqif-0OkU7/ | 1 (page sans rapport avec l'énergie, rendue en JavaScript) |
| 5 | https://communiques.categorynet.com/energie/129216-le-comparateur-des-fournisseurs-delectricite-kelwa-ttfr-lance-sa-nouvelle-video-sur-internet/ | 0 (non récupéré, HTTP 403) |

Médiane : 0 mot (classement 0, 0, 0, 1, 18761).

## Requête : « Kelwatt professionnel »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.kelwatt.fr/ | 4882 |
| 2 | https://fr.trustpilot.com/review/kelwatt.fr | 0 (non récupéré, HTTP 403) |
| 3 | https://www.kelwatt.fr/comparateur | 3612 |
| 4 | https://www.greenit.fr/2008/07/11/kelwatt-fr-comparer-les-fournisseurs-d-electricite/ | 0 (non récupéré, HTTP 403) |
| 5 | https://www.hellowatt.fr/fournisseurs/totalenergies/professionnels | 1514 |

Médiane : 1514 mots (classement 0, 0, 1514, 3612, 4882).

## Calcul

On retient la valeur la plus exigeante des deux requêtes : minWords = max(1200, round(0.8 x 1514)) = max(1200, 1211) = **1211**. Sur la requête « alternative à Kelwatt », la médiane (0) donnerait le plancher de 1200.

Observation : aucun des résultats n'est un contenu éditorial « alternative à Kelwatt pour les professionnels ». Les résultats sont les pages de Kelwatt elle-même, une fiche d'avis, un article de 2008, un communiqué et la page pro d'un autre comparateur sur un fournisseur. Intention de recherche très peu concurrencée. Remarque de contexte relevée dans les résultats : la fiche Trustpilot de kelwatt.fr est titrée « Avis de Selectra », ce qui rejoint ce que dit le site de Kelwatt sur son éditeur (voir faits.md).
