# Levier social B2B — lancement

Contenu du premier cycle de test du levier social B2B décrit dans
[`docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md`](../../docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md).

- `brief-cycle-1.md` — briefs des 2 premières semaines de publication
  organique, un par plateforme et par créneau (à transférer dans le
  calendrier éditorial Notion du pipeline général avant production).
- `ads-checklist.md` — checklist de paramétrage des campagnes payantes
  LinkedIn Ads, Meta Ads et X Ads.

## Gisements de contenu référencés

Chaque brief cite l'un de ces 4 gisements (cf. spec, §1) plutôt que
d'inventer un angle ad hoc :

1. Piliers/clusters SEO (`docs/strategie-geo-seo/`)
2. Baromètre trimestriel des prix de l'énergie
3. Fournisseurs partenaires / preuve sociale
   (`docs/superpowers/specs/2026-08-13-fournisseurs-partenaires-design.md`)
4. Coulisses / expertise dirigeant

## Attention chiffres

Toute statistique relayée (économies moyennes, évolution de prix) doit
être sourcée ou nuancée — risque déjà identifié en §8 de
`docs/strategie-geo-seo/2026-07-22-strategie-geo-seo-ms-strategy.md`.
Ne jamais reprendre telle quelle une statistique non sourcée de la home.

## Validation par l'équipe com

Les textes rédigés du cycle 1 sont sur `approbation.html` (byandry.com),
protégée par mot de passe (logique : `lib/approbation.mjs`, garde dans
`middleware.js`). Chaque décision est enregistrée dans PostHog sous
l'événement `post_review` (propriétés `campaign`, `post`, `decision`,
`comment`, `reviewer`). Nécessite la variable Vercel
`POSTHOG_PROJECT_KEY` (clé publique du projet, la même que dans
`src/analytics.js`).
