# Attribution des factures aux commerciaux

Chaque commercial diffuse ses propres liens. Le site retient le commercial
référent pendant 90 jours et le transmet à Tally au moment du dépôt de facture,
dans un champ caché `ref`.

## Les slugs

`ag`, `lg`, `mv`, `pm`, `zb`, `lf` — déclarés dans `SLUGS` (`middleware.js`).

**`ag` (Antoine) est aussi la valeur de repli** : une facture déposée sans avoir
suivi le lien d'un commercial lui est attribuée automatiquement. La colonne
`ref` de Tally n'est donc jamais vide et aucun dossier ne reste orphelin. `ag`
reste par ailleurs un slug normal, avec ses propres liens s'il en a l'usage.

Nuance à connaître pour la lecture des chiffres : ce repli s'applique **à Tally
seulement**. PostHog ne reçoit `ref` que lorsqu'un vrai cookie existe — sinon un
visiteur venu de Google organique compterait comme « prospecté par Antoine » et
fausserait la segmentation du tunnel.

## Ce qui est en place côté site

| Élément | Fichier | Rôle |
|---|---|---|
| Liste des commerciaux | `middleware.js` (`SLUGS`) | Whitelist : un `?ref=` absent de cette liste est ignoré |
| Dépôt du cookie | `middleware.js` | `Set-Cookie ms_ref`, 90 jours, first-touch |
| Lien court `/c/<slug>` | `middleware.js` | Redirige vers `/b2b.html?ref=<slug>` |
| Lecture du cookie | `assets/ref.js` | Expose `window.msRef`, avec repli sur `ag` |
| Transmission à Tally | `openTallyForm()` dans `b2b.html`, `b2c.html`, `ms-strategy-landing-2.html` | Ajoute `ref` aux `hiddenFields` |
| Segmentation analytics | `src/analytics.js` | `ref` en super-property PostHog |
| Mention RGPD | `politique-confidentialite.html` | Ligne `ms_ref` du tableau des cookies |

Le cookie est posé **côté serveur** et non en JavaScript : Safari plafonne à
7 jours tout cookie écrit par `document.cookie`, ce qui perdrait les dossiers
déposés plus de deux semaines après le mail du commercial.

## Ajouter ou retirer un commercial

1. Ajouter le slug dans `SLUGS`, dans `middleware.js`.
2. `npm test` (les suites couvrent la whitelist, le first-touch, le lien court
   et le repli par défaut).
3. Déployer. Ses liens sont immédiatement actifs :
   - `https://www.byandry.com/b2b.html?ref=<slug>&utm_source=commercial&utm_medium=affiliation&utm_campaign=<slug>`
   - `https://www.byandry.com/c/<slug>`

## À faire dans Tally (formulaire `kd15W1`)

Ces deux points ne sont pas dans le code, ils se règlent dans l'éditeur Tally.

1. **Champ caché `ref`** — taper `/hidden` dans l'éditeur, le nommer exactement
   `ref`. Sans lui, la valeur envoyée par le site est ignorée silencieusement.
2. **Champ visible « Code conseiller »**, optionnel — rattrape les dépôts que le
   cookie ne peut pas couvrir : mail ouvert sur mobile puis facture déposée sur
   l'ordinateur du bureau, navigation privée, cookies purgés, ou accès direct à
   `tally.so/r/kd15W1` sans passer par le site.

Les deux fonctionnent sur le plan gratuit de Tally.

## Limites connues

- L'attribution suit un navigateur, pas une personne : changement d'appareil =
  perte du cookie. C'est le rôle du champ « Code conseiller ».
- Règle first-touch : le premier commercial touché garde le dossier pendant
  90 jours, même si le prospect revient ensuite par le lien d'un autre.
- Les liens courts `/c/<slug>` atterrissent sur la landing B2B
  (`SHORT_LINK_TARGET` dans `middleware.js`).

## Suite éventuelle

- Remonter `ref` dans un Google Sheet via l'intégration Tally, ou vers HubSpot
  via webhook / Make — Tally n'a pas d'intégration HubSpot native.
- Envoi nominatif : `?ref=<slug>&lead=<id>` avec un second champ caché `lead`,
  pour savoir quel prospect a déposé même s'il utilise une autre adresse mail.
