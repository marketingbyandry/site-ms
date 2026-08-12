# Suivi par campagne (`camp`) — spec

## Contexte

La séquence de démarchage à froid (9 emails, 3 segments × 3 relances,
`content/cold-outreach-waalaxy/`) doit pouvoir être comparée segment par
segment et email par email. Le mécanisme d'attribution commerciale existant
(`ms_ref`, `middleware.js`) sert un autre objectif — créditer le commercial
référent pour la commission — et ne doit pas être détourné pour ça : un lien
de campagne ne doit pas écraser le crédit commercial, et le crédit commercial
ne doit pas se substituer à la mesure de campagne.

Décision actée en amont (conversation du 2026-08-12) : `ref` et `camp`
cohabitent comme deux paramètres indépendants sur le même lien
(`?ref=ag&camp=chr-e1`), chacun avec son propre cookie et sa propre
sémantique.

## Base légale

Suivi par contact (pas seulement agrégé) au clic, sous **intérêt légitime**
(RGPD art. 6.1.f), à deux conditions déjà réunies :
1. Finalité strictement commerciale (prioriser les relances, mesurer la
   performance des segments) — jamais transmis à un tiers publicitaire, pas
   de profilage.
2. Opposition facile — le "répondez STOP" déjà présent en pied de chaque
   email couvre l'opt-out.

Hors périmètre, quel que soit ce montage : import de la liste de prospects
froids dans un outil publicitaire (Meta/LinkedIn/TikTok Custom/Matched
Audiences) — nécessite un consentement donné à la collecte, absent ici.

## Mécanisme

### `middleware.js`

- Nouvelle constante `CAMPAIGNS` : whitelist des 9 codes
  (`chr-e1`, `chr-e2`, `chr-e3`, `ind-e1`, `ind-e2`, `ind-e3`,
  `tert-e1`, `tert-e2`, `tert-e3`). Un `?camp=` hors liste est ignoré,
  même logique que `SLUGS` pour `ref`.
- Lu depuis `?camp=` sur les mêmes routes déjà surveillées pour `ref`
  (`matcher` inchangé — `camp` n'arrive que via query param sur des pages
  déjà couvertes, jamais via `/c/<slug>` qui reste réservé aux commerciaux).
- Cookie `ms_camp` : `Path=/; Max-Age=7776000 (90j); SameSite=Lax`. Même
  durée que `ms_ref` par cohérence, sans lien avec elle.
- **Dernier-touch** (à la différence de `ms_ref`, premier-touch) : un
  `?camp=` valide écrase toujours la valeur précédente. Pas de commission
  en jeu ici, donc pas de raison de figer le premier contact — on veut
  savoir quel email précis a ramené le lecteur la dernière fois.
- Retiré de l'URL affichée par la même redirection 302 que `ref` (déjà
  `Cache-Control: private, no-store`, déjà sans `Set-Cookie` pour les bots).
  Si `ref` et `camp` sont tous les deux présents, un seul redirect gère les
  deux.

### `src/analytics.js`

- `camp` ajouté aux `properties` enregistrées via `posthog.register()`,
  dans le même bloc que `ref` (donc déjà gaté au consentement — pas de
  changement de comportement du bandeau cookies).

### `assets/ref.js`

- Expose aussi `window.msCamp` (lecture seule du cookie `ms_camp`), sur le
  même principe que `window.msRef`. Pas de valeur de repli : `camp` est une
  donnée d'analyse optionnelle, pas un champ obligatoire côté Tally comme
  l'est `ref` pour la commission.

### `b2b.html`, `b2c.html`, `ms-strategy-landing-2.html`

- `openTallyForm()` : `hiddenFields` reçoit `camp: window.msCamp || ''` en
  plus de `ref`.
- **Action manuelle utilisateur requise, hors périmètre code** : créer le
  champ caché `camp` dans l'éditeur Tally, comme cela avait été fait pour
  `ref` (sans ce champ, la valeur est ignorée silencieusement par Tally —
  limite déjà documentée pour `source`/`message`).

### Conformité — documentation

- `politique-confidentialite.html` : nouvelle ligne dans le tableau des
  cookies pour `ms_camp` (finalité, durée 90 jours, base légale intérêt
  légitime), sur le modèle de la ligne `ms_ref` existante.
- `docs/attribution-commerciaux.md` : nouvelle section expliquant le
  mécanisme `camp`, sa différence de sémantique avec `ref` (dernier-touch
  vs premier-touch), et le renvoi vers la base légale ci-dessus.

## Tests

Mêmes fichiers/patterns que l'existant :
- `test/middleware-attribution.test.mjs` : cas `camp` ajoutés (whitelist,
  rejet d'une valeur inconnue, dernier-touch écrase la valeur précédente,
  cohabitation avec `ref` sur le même lien, absence de cookie pour les
  bots, nettoyage de l'URL).
- Nouveau test (ou extension de `test/ref-default.test.mjs`) pour
  `window.msCamp` exposé par `assets/ref.js`.

## Hors périmètre

- Tracking d'ouverture par pixel (dépend de l'outil d'envoi, pas encore
  choisi — la plupart des outils cold-email candidats le fournissent
  nativement).
- Dashboard de visualisation des tendances par segment (session future).
- Tout mécanisme de partage de la liste de prospects avec une plateforme
  publicitaire.
