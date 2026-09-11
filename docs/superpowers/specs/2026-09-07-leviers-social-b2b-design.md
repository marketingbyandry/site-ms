# Leviers sociaux pour l'acquisition B2B — design

Date : 2026-09-07

## Contexte

M&S Strategy dispose déjà de pages entreprise sur LinkedIn, Facebook,
Instagram et X, mais peu actives. En parallèle, un pipeline éditorial
général est en cours de cadrage (`Pipeline Éditorial M&S`, artifact du
7 septembre 2026) : calendrier Notion, génération texte/visuel, revue
humaine par lot, publication via **Typefully** (LinkedIn/X/Threads) et
**Buffer** (Instagram/TikTok/Facebook — connecté et authentifié dans cette
session, aucun channel encore relié).

Le site dispose aussi d'un système d'attribution déjà en production pour
le cold outreach (`docs/attribution-commerciaux.md`) : un cookie `ms_camp`
posé par `middleware.js`, qui trace jusqu'au dépôt de facture Tally quel
email précis (`chr-e1`, `ind-e2`…) a généré un lead. Ce mécanisme est
directement réutilisable pour le social.

**Hors périmètre** : ce document ne redécide pas la mécanique du pipeline
éditorial (cron, outils de génération visuelle, calendrier Notion) ni la
stratégie SEO/GEO organique (`docs/strategie-geo-seo/`), déjà actées
ailleurs. Il porte uniquement sur *quels leviers sociaux actionner pour
l'acquisition de nouveaux clients B2B*, et comment les mesurer.

## Objectif

Générer des leads B2B qualifiés (dépôts de facture Tally, formulaire
`kd15W1`) attribuables au social, sur LinkedIn / X / Facebook / Instagram,
en organique et en payant — pas seulement des métriques d'engagement.

## Périmètre décidé lors du cadrage

- **Cible** : acquisition de nouveaux prospects B2B (pas de réactivation
  de contacts déjà touchés par le cold outreach Waalaxy).
- **Canaux** : uniquement social (Facebook, Instagram, LinkedIn, X) —
  le SEO/GEO organique reste hors périmètre, déjà couvert ailleurs.
- **Approche** : moteur de contenu unique diffusé en parallèle sur les 4
  plateformes dès le lancement (pas de priorisation a priori type
  "LinkedIn d'abord") — les pages existantes sont mortes, les réactiver
  toutes évite l'impression d'abandon, et la donnée tranche la priorité
  après une période de test.
- **Payant** : inclus (LinkedIn Ads, Meta Ads ; X Ads en option mineure).

## 1. Le moteur de contenu

Plutôt que d'écrire du contenu ad hoc par plateforme, chaque brief du
calendrier éditorial référence l'un de ces 4 gisements déjà produits ou en
cours de production ailleurs dans le projet :

1. **Piliers/clusters SEO** (`docs/strategie-geo-seo/`) — guide courtier,
   renégociation, groupement d'achat, etc. → extraits en posts/threads
   answer-first.
2. **Baromètre trimestriel** (prix de l'énergie) — l'actif le plus
   "citable" du projet → décliné en visuels-chiffres et carrousels.
3. **Fournisseurs partenaires + preuve sociale**
   (`docs/superpowers/specs/2026-08-13-fournisseurs-partenaires-design.md`)
   — contrats signés, indépendance vis-à-vis des fournisseurs → posts de
   réassurance.
4. **Coulisses / expertise dirigeant** — angle "pourquoi c'est gratuit",
   cas clients anonymisés → format plus humain, vidéo courte.

Ce référencement à une source garde le moteur "unique" même si le rendu
final est natif par plateforme (cf. §2).

## 2. Déclinaison par plateforme & cadence

| Plateforme | Outil | Format natif pour ce gisement | Cadence de test |
|---|---|---|---|
| LinkedIn | Typefully | Post texte answer-first (piliers/clusters) + carrousel PDF Baromètre | 3×/semaine |
| X/Twitter | Typefully | Threads courts, angle "chiffre + prise de position" — sert l'objectif GEO (citation presse/LLM) plus que la conversion directe | 2×/semaine |
| Facebook | Buffer | Partage des piliers en post local, ciblage dirigeants de TPE dans les bassins déjà visés en SEO (pages villes) | 3×/semaine |
| Instagram | Buffer | Visuels-chiffres (Baromètre), reels courts "coulisses" | 2×/semaine |

LinkedIn et Facebook portent la charge de conversion (CTA vers le site) ;
X et Instagram jouent un rôle de notoriété/preuve. Les 4 restent alimentées
en parallèle dès le lancement — aucune n'est mise en sommeil au départ.

Cette déclinaison s'insère directement dans les étapes déjà définies du
pipeline éditorial (brief Notion → revue humaine par lot → publication
Typefully/Buffer) : pas de nouvelle mécanique à construire, seulement le
calendrier à remplir avec ces briefs pendant la période de test.

## 3. Volet payant

Budget réparti à parts égales au lancement, cohérent avec l'absence de
priorisation a priori :

- **LinkedIn Campaign Manager** : ciblage taille d'entreprise + secteur +
  intitulé de poste (dirigeant, DAF, office manager) — le ciblage B2B le
  plus précis des 4 canaux.
- **Meta Ads (Facebook/Instagram)** : ciblage local sur les bassins
  économiques déjà visés en SEO (pages villes) ; lookalike à partir des
  leads Tally existants une fois un volume suffisant atteint.
- **X Ads** : optionnel, faible enveloppe — rôle GEO/citation plutôt que
  conversion, donc non prioritaire en payant.

## 4. Attribution & mesure

Réutilisation du système `camp` déjà en production
(`middleware.js` : `CAMPAIGNS`, cookie `ms_camp`, dernier-touch, RGPD
art. 6.1.f) plutôt qu'un nouveau mécanisme :

- Nouveaux codes dédiés au social, ex. `soc-li`, `soc-fb`, `soc-ig`,
  `soc-x`, ajoutés à la whitelist `CAMPAIGNS`.
- Chaque lien de post/campagne pointant vers `b2b.html` porte son code
  (`?camp=soc-li`).
- Chaque dépôt de facture Tally hérite du code du post qui l'a généré —
  visibilité plateforme par plateforme sur le nombre de **leads réels**
  produits, pas seulement les clics ou l'engagement.
- Aucun changement à la mécanique `ref`/attribution commerciale : `camp`
  et `ref` cohabitent déjà sur le même lien sans conflit (cf.
  `docs/attribution-commerciaux.md`).

**Jalon de décision** : 8 à 12 semaines de diffusion parallèle, puis revue
du coût par lead par plateforme (payant) et du volume de leads attribués
par `camp` (organique) → réallocation du budget et de la cadence vers ce
qui convertit réellement, pas vers ce qui engage le plus.

## 5. Gouvernance

- Production des briefs/contenus : `content-builder`.
- Ajout des codes `camp` social dans `middleware.js` (`CAMPAIGNS`) :
  `dev-builder`, en worktree + PR, avec les tests existants
  (`npm test` couvre la whitelist `CAMPAIGNS`).
- Relecture avant publication : `quality-reviewer`.
- Suivi de projet : mise à jour de la note Obsidian
  `Agents HQ/Projets/MS Strategy.md` à chaque changement d'étape.

## Non-objectifs

- Redéfinir la mécanique du pipeline éditorial général (cron, génération
  visuelle, calendrier Notion) — déjà cadrée séparément.
- Réactivation de prospects déjà touchés par le cold outreach Waalaxy
  (hors périmètre décidé, cf. §"Périmètre décidé").
- Contenu ou stratégie SEO/GEO organique — déjà couvert par
  `docs/strategie-geo-seo/`.
- TikTok — hors périmètre de cette exploration (limitée à Facebook,
  Instagram, LinkedIn, X), même si Buffer le couvre techniquement.

## Tests / vérification

- `npm test` doit continuer à passer après l'ajout des codes `soc-*` à
  `CAMPAIGNS` dans `middleware.js` (couverture existante de la whitelist).
- Vérification manuelle : un lien `?camp=soc-li&ref=ag` pose bien le
  cookie `ms_camp=soc-li` et remonte dans un dépôt de facture Tally test.
- Suivi hebdomadaire des KPI par plateforme (cf. pipeline éditorial
  général, tableau "Suivi KPI par plateforme et audience") complété par
  le suivi mensuel du coût par lead et du volume `camp` social.
