# Relevé SERP : alternative à Opéra Énergie

Date : 2026-10-10. Outil : Firecrawl `firecrawl_search` (source web, limit 5) pour les résultats organiques ; mots comptés par requête HTTP directe de chaque URL puis extraction du texte de la balise `<main>` (sinon page entière), séparation sur les espaces, hors script/style/nav/header/footer. Pas de géolocalisation forcée : résultats approximatifs. Les pages qui refusent la requête (403, 400) sont comptées 0 « non récupéré ».

## Requête principale : « alternative à Opéra Énergie »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.linkedin.com/company/op%C3%A9ra-energie | 2458 |
| 2 | https://opera-energie.com/ | 1084 |
| 3 | https://www.facebook.com/OperaEnergieFr/ | 0 (non récupéré, HTTP 400) |
| 4 | https://fr.trustpilot.com/review/opera-energie.com | 0 (non récupéré, HTTP 403) |
| 5 | https://www.umih.fr/partenaires-officiels/opera-energie.html | 170 |

Médiane : 170 mots (classement 0, 0, 170, 1084, 2458).

## « Opéra Énergie avis entreprise »

| rang | URL | mots |
|---|---|---|
| 1 | https://opera-energie.com/avis-clients/ | 348 |
| 2 | https://fr.trustpilot.com/review/opera-energie.com | 0 (non récupéré, HTTP 403) |
| 3 | https://www.glassdoor.fr/Pr%C3%A9sentation/Travailler-chez-Op%C3%A9ra-Energie-EI_IE2015173.16,29.htm | 0 (non récupéré, HTTP 403) |
| 4 | https://www.facebook.com/OperaEnergieFr/ | 0 (non récupéré, HTTP 400) |
| 5 | https://fr.indeed.com/cmp/Op%C3%A9ra-Energie/reviews | 0 (non récupéré, HTTP 403) |

Médiane : 0 mot (4 pages sur 5 non récupérées).

## Calcul

minWords = max(1200, round(0.8 x médiane de la requête principale)) = max(1200, round(0.8 x 170)) = max(1200, 136) = **1200**.

Robustesse : même en retenant la valeur la plus haute plausible pour les deux pages Trustpilot non récupérées (de l'ordre de 2 000 mots, ordre de grandeur de la page Selectra voisine : 2469), la médiane serait de 1084 et 0,8 x 1084 = 867, soit moins que 1200. Le plancher de 1200 s'applique dans tous les cas.

Observation : aucun des résultats n'est un contenu éditorial « alternative à Opéra Énergie » ; ce sont des pages de profil, d'avis ou la page d'accueil d'Opéra Énergie elle-même. Intention de recherche peu concurrencée.
