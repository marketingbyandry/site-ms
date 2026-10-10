# Relevé SERP : alternative à Selectra

Date : 2026-10-10. Outil : Firecrawl `firecrawl_search` (source web, limit 5), puis contenu principal en markdown (`onlyMainContent`), mots comptés par séparation sur les espaces. Pas de géolocalisation forcée : résultats approximatifs.

## Requête principale : « alternative à Selectra »

| rang | URL | mots |
|---|---|---|
| 1 | https://selectra.com/ | 1013 |
| 2 | https://www.trustpilot.com/review/selectra.info?page=4 | 1638 |
| 3 | https://github.com/cirykpopeye/selectra | 1162 |
| 4 | https://sr03.toolzpad.com/website/selectra.info/competitors/ | 1056 |
| 5 | https://en.selectra.info/ | 1001 |

Médiane : 1056 mots.

## « Selectra professionnel »

| rang | URL | mots |
|---|---|---|
| 1 | https://vitalscientific.com/selectra-pros-usa/ | 1137 |
| 2 | https://www.selectscience.net/video/the-selectra-pro-m-series-from-elitech-1538 | 434 |
| 3 | https://selectra.com/careers | 1198 |
| 4 | https://www.youtube.com/watch?v=Y0cy5gTLC-4 | 507 |
| 5 | https://www.elitechgroup.com/documentation/wp-content/uploads/sites/30/2022/12/Selectra_ProS_Leaflet_08_WEB_144dpi_Nov2023.pdf | 747 |

Médiane : 747 mots. Intention brouillée par les analyseurs de laboratoire « Selectra ProS ».

## « Selectra avis entreprise »

| rang | URL | mots |
|---|---|---|
| 1 | https://fr.indeed.com/cmp/Selectra-9a59b07e/reviews?ftopic=paybenefits | 1595 |
| 2 | https://www.glassdoor.fr/Avis/Selectra-Avis-E1135909.htm | 975 |
| 3 | https://fr.trustpilot.com/review/selectra.info | 2469 |
| 4 | https://www.facebook.com/groups/les.frenchy.a.madrid/posts/7401782023264388/ | 0 (contenu non récupéré) |
| 5 | https://leblogimmobilier.org/2026/08/11/selectra-avis/ | 1707 |

Médiane : 1595 mots (le 0 non récupéré est inclus).

## Calcul

minWords = max(1200, round(0.8 x médiane de la requête principale)) = max(1200, round(0.8 x 1056)) = max(1200, 845) = **1200**.

Observation : aucun des 5 résultats de la requête principale n'est un contenu éditorial « alternative à Selectra » ; le plancher de 1200 mots s'applique par défaut.
