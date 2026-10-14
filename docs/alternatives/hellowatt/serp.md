# Relevé SERP : alternative à Hellowatt

Date : 2026-10-10. Outil : Firecrawl `firecrawl_search` (source web) pour les résultats organiques ; mots comptés par requête HTTP directe de chaque URL puis extraction du texte de la balise `<main>` (sinon page entière), séparation sur les espaces, hors script/style/nav/header/footer. Pas de géolocalisation forcée : résultats approximatifs. Les pages qui refusent la requête (403, 400) ou rendues en JavaScript sont comptées 0 « non récupéré ».

## Requête principale : « alternative à Hellowatt »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.hellowatt.fr/avis/concurrent | 1611 |
| 2 | https://www.cbinsights.com/company/hello-watt/alternatives-competitors | 973 |
| 3 | https://www.reddit.com/r/AskFrance/comments/1nzexeu/cest_quoi_vos_avis_sur_hello_watt/ | 0 (non récupéré, page rendue en JavaScript) |
| 4 | https://www.trustpilot.com/review/hellowatt.fr | 0 (non récupéré, HTTP 403) |
| 5 | https://lixee-box.fr/lixee-box-vs-hellowatt/ | 1606 |

Médiane : 973 mots (classement 0, 0, 973, 1606, 1611).

## « Hellowatt professionnel »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.hellowatt.fr/ | 3992 |
| 2 | https://www.zeliq.com/company/france/professional-services/environmental-services/hello-watt | 1381 |
| 3 | https://www.facebook.com/hellowatt/ | 0 (non récupéré, HTTP 400) |
| 4 | https://greentechinnovation.fr/2018/01/15/hello-watt-conseiller-nouveaux-services-reduire-consommation-energie/ | 570 |
| 5 | https://www.trustpilot.com/review/hellowatt.fr | 0 (non récupéré, HTTP 403) |

Médiane : 570 mots (classement 0, 0, 570, 1381, 3992).

## Calcul

minWords = max(1200, round(0.8 x médiane de la requête principale)) = max(1200, round(0.8 x 973)) = max(1200, 778) = **1200**.

Robustesse : même en retenant la valeur la plus haute plausible pour les deux pages non récupérées (de l'ordre de 2 000 mots chacune), la médiane serait de 1611 et 0,8 x 1611 = 1289 ; ce cas extrême est un majorant improbable (les deux pages sont des pages de forum et d'avis). Avec les valeurs mesurées, le plancher de 1200 s'applique. La page publiée vise plus de 1300 mots de contenu principal pour couvrir le majorant.

Observation : aucun des résultats n'est un contenu éditorial « alternative à Hellowatt pour les professionnels » ; ce sont des pages de profil, de comparaison produit (compteur Linky) ou de la marque elle-même. Le résultat n°1 est la page de Hello Watt sur ses propres concurrents (particuliers, rénovation). Intention de recherche peu concurrencée.
