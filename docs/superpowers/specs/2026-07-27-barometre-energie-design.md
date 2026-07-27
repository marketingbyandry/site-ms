# Baromètre M&S Strategy des prix de l'énergie pro — design

## Contexte

Le business actuel de M&S Strategy (courtage en négociation de contrats d'électricité/gaz pour TPE/PME/ETI) est plafonné mécaniquement : chaque client mobilise du temps humain 1:1. Ce document cadre un **nouveau produit distinct**, pensé pour être scalable et servir de **tunnel d'entrée** vers l'offre de courtage existante — pas un revenu indépendant.

Le chantier avait déjà été identifié le 2026-07-22 dans la stratégie GEO+SEO (`docs/strategie-geo-seo/2026-07-22-strategie-geo-seo-ms-strategy.md`, Pilier D et §8) comme *« l'investissement au plus fort ROI »*, mais explicitement laissé de côté : *« nécessite une source de données [...] à cadrer dans une session dédiée »*. Ce document lève ce point.

## Objectif

Créer le **Baromètre M&S Strategy des prix de l'énergie pour les entreprises** : un indicateur de prix (électricité + gaz) gratuit, accessible sans friction, qui :
- attire des backlinks presse (donnée propriétaire citable) ;
- devient une source citable par les LLM (pilier GEO) ;
- génère du premier contact commercial via un CTA vers le tunnel de conversion existant (formulaire Tally "Transmettre ma facture").

Ce n'est **pas** un produit payant, ni un accès gaté par email : la capture de contact se fait par un CTA éditorial, pas par une barrière d'accès.

## Sources de données

| Énergie | Source | Nature | Fréquence |
|---|---|---|---|
| Électricité | [ENTSO-E Transparency Platform](https://transparency.entsoe.eu) | API gratuite, officielle (mandat réglementaire européen), prix day-ahead France | Automatisée |
| Gaz | Powernext (prix spot TRF) / CRE (Observatoire des marchés) | Pas d'API gratuite documentée — saisie manuelle | Manuelle, trimestrielle |

**Pourquoi ce choix** : ENTSO-E est la source la plus robuste techniquement (API structurée, données quasi temps réel, officielle) pour l'électricité, ce qui permet d'automatiser l'indicateur vivant sans effort récurrent. Le gaz n'a pas d'équivalent API gratuit connu ; on accepte une mise à jour manuelle trimestrielle, alignée sur la cadence de la synthèse éditoriale.

## Architecture

### Page dédiée
- Nouvelle page statique `barometre-energie.html` (convention de nommage cohérente avec le reste du site : `courtier-energie-{ville}.html`, `ms-blog-article-N.html`).
- Affiche : indicateur électricité (vivant), indicateur gaz (mis à jour trimestriellement), méthodologie et sources citées (renforce E-E-A-T), liens vers les synthèses trimestrielles.
- JSON-LD `Dataset`/`Article` selon pertinence, cohérent avec les quick wins GEO+SEO déjà en place (JSON-LD `Organization`/`FAQPage`/`Article`, `llms.txt`, `robots.txt` ouvert aux crawlers IA).

### Pipeline électricité (automatisé)
- Nouvelle fonction serverless Vercel (sur le modèle de `api/tally-hubspot.mjs`), déclenchée par Vercel Cron.
- Interroge l'API ENTSO-E, calcule un prix moyen day-ahead France sur la période écoulée.
- Écrit le résultat dans un fichier de données (JSON) lu par la page — pas de rebuild du site à chaque cycle.
- Fréquence proposée : mensuelle (suffisant pour un usage humain ; à confirmer en plan d'implémentation si une fréquence différente s'avère plus pertinente techniquement).

### Données gaz (manuel)
- Fichier de configuration (JSON ou constante) mis à jour manuellement, à la cadence trimestrielle, en même temps que la synthèse éditoriale.
- Processus documenté (checklist) pour éviter l'oubli/la dérive de mise à jour — à formaliser en plan.

### Synthèses éditoriales trimestrielles
- Nouveaux articles, même gabarit que `ms-blog-article-*.html`.
- Contenu par synthèse : chiffres électricité + gaz du trimestre, analyse de tendance, mise en perspective avec l'actualité du marché, CTA vers le formulaire Tally existant.
- **Backfill au lancement** :
  - 4 rétrospectives **annuelles** : 2022 (crise énergétique), 2023, 2024, 2025.
  - Rétrospectives **trimestrielles** depuis le début de 2026 : T1, T2, T3 2026.
  - Soit ~7 articles à produire avant la bascule en rythme trimestriel courant.
- **Règle anti-antidatation** (décision explicite) : chaque synthèse rétrospective est publiée à sa **date réelle de rédaction**, jamais antidatée dans les métadonnées (`datePublished` JSON-LD inclus). Le texte de l'article indique clairement la période analysée (ex. « Bilan T1 2026 — rédigé en juillet 2026 »). Antidater une métadonnée de publication est explicitement écarté : Google traite cela comme du date spamming, et une incohérence détectée (Wayback Machine, sitemap `lastmod`, premier crawl indexé) détruirait la crédibilité que le Baromètre cherche justement à construire (pilier E-E-A-T de la stratégie GEO+SEO).

## Capture de contact

- Accès 100% libre à la page et aux synthèses — aucune barrière email.
- CTA éditorial (« Comparez ce prix à votre facture ») pointant vers le formulaire Tally existant « Transmettre ma facture » (`b2b.html` / `b2c.html`) — réutilise le tunnel de conversion déjà en place, aucun nouveau formulaire à créer.

## Segmentation

**National uniquement en V1** — pas de découpage par région/ville ni par secteur d'activité au lancement. Choix délibéré pour limiter la charge de mise en place (ENTSO-E ne segmente pas nativement par région française ; une segmentation sectorielle nécessiterait une source supplémentaire, ex. données de contrats négociés en interne, anonymisées). Point à réévaluer après lancement, notamment le lien possible avec les 10 pages villes déjà existantes (`courtier-energie-{ville}.html`).

## Gouvernance (pipeline agents)

- `dev-builder` : pipeline technique (fonction Vercel, cron, page, fichiers de données).
- `content-builder` : rédaction des synthèses éditoriales (backfill + rythme courant).
- `quality-reviewer` : relecture avant chaque publication (technique et éditoriale).
- Suivi : mise à jour de la note Obsidian `Agents HQ/Projets/MS Strategy.md` à chaque changement d'étape.

## Risques identifiés et mitigations

- **Source gaz manuelle** : risque d'oubli/dérive de la mise à jour trimestrielle → processus documenté (checklist) à définir en plan.
- **Antidatation** : exclue par décision explicite (cf. ci-dessus) — à vérifier lors de la relecture de chaque synthèse rétrospective.
- **Absence de segmentation V1** : risque de paraître générique face à des concurrents qui segmenteraient par secteur/région — accepté comme compromis de lancement, à réévaluer.
- **Cohérence avec les statistiques non sourcées de la home** (« 19 % d'économies moyennes ») : point déjà signalé en attente ailleurs (stratégie GEO+SEO §8), sans dépendance directe avec ce chantier, mais bonne occasion de le retrancher en parallèle.

## Métriques de succès

- Backlinks obtenus depuis la presse économique/énergie.
- Citations par les LLM (suivi via l'outil de visibilité GEO déjà évoqué dans la stratégie — Profound/Otterly, décision d'achat non tranchée).
- Clics sur le CTA vers le formulaire Tally (taux de clic depuis la page Baromètre et les synthèses).
- Trafic organique de la page et des articles de synthèse.

## Hors périmètre (explicitement exclu de cette V1)

- Segmentation par région/ville/secteur/taille d'entreprise.
- Accès gaté par email ou tout autre paywall.
- Fonctionnalité d'alerte prix personnalisée (piste évoquée en amont du cadrage, mise de côté pour un cadrage ultérieur distinct).
- Choix définitif d'outil de suivi de visibilité LLM (Profound/Otterly) — décision d'achat restée ouverte dans la stratégie GEO+SEO.
