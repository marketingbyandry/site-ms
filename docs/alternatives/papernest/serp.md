# Relevé SERP : alternative à Papernest

Date : 2026-10-14. Outil : Firecrawl `firecrawl_search` (source web, 5 premiers résultats organiques). Mots comptés par requête HTTP directe de chaque URL puis extraction du texte de la page (hors script/style), séparation sur les espaces ; pour les pages rendues en JavaScript ou refusant la requête, le comptage du texte rendu par Firecrawl (markdown de la zone principale, sans liens ni images) est utilisé quand il existe, sinon 0 « non récupéré ». Pas de géolocalisation forcée : résultats approximatifs.

## Requête : « alternative à Papernest »

| rang | URL | mots |
|---|---|---|
| 1 | https://www.g2.com/products/papernest/competitors/alternatives | 2409 (texte rendu Firecrawl ; requête HTTP directe : 0) |
| 2 | https://bouncewatch.com/alternatives/papernest | 93 (texte rendu Firecrawl) |
| 3 | https://getlatka.com/companies/papernest/competitors | 544 (texte rendu Firecrawl) |
| 4 | https://www.linkedin.com/company/papernest/ | 2094 (requête HTTP directe, page de profil d'entreprise, sans rapport avec une comparaison) |
| 5 | https://craft.co/papernest/competitors | 504 (texte rendu Firecrawl) |

Médiane : 544 mots (classement 93, 504, 544, 2094, 2409).

## Requête : « Papernest professionnel »

| rang | URL | mots |
|---|---|---|
| 1 | https://careers.papernest.com/ | 1421 (page de recrutement de Papernest) |
| 2 | https://www.instagram.com/we_are_papernest/ | 7 (page rendue en JavaScript) |
| 3 | https://www.papernest.com/devenir-partenaire/ | 406 (offre « papernest pro » pour les partenaires immobilier et banque) |
| 4 | https://www.linkedin.com/company/papernest/ | 2094 |
| 5 | https://partechpartners.com/companies/papernest | 28 (HTTP direct ; fiche d'investisseur) |

Médiane : 406 mots (classement 7, 28, 406, 1421, 2094).

## Calcul

On retient la valeur la plus exigeante des deux requêtes : minWords = max(1200, round(0.8 x 544)) = max(1200, 435) = **1200**. Sur « Papernest professionnel », la médiane (406) donnerait aussi le plancher de 1200.

Observation : aucun des résultats n'est un contenu éditorial « alternative à Papernest pour les professionnels ». Les résultats sont des fiches d'annuaires de concurrents (G2, GetLatka, Craft), le profil LinkedIn et le site carrière de Papernest, une fiche d'investisseur et l'offre « papernest pro » destinée aux partenaires immobilier et banque (qui n'est pas le service d'accompagnement des entreprises). La page professionnelle de Papernest (papernest.com/papernest-professionnels/) n'apparaît pas dans les cinq premiers résultats de ces deux requêtes. Intention de recherche très peu concurrencée.
