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
| Nettoyage de l'URL | `middleware.js` | Le slug est retiré de l'URL par une 302 juste après attribution |
| Lien court `/c/<slug>` | `middleware.js` | Redirige vers `/b2b.html`, slug déjà en cookie |
| Lecture du cookie | `assets/ref.js` | Expose `window.msRef`, avec repli sur `ag` |
| Transmission à Tally | `openTallyForm()` dans `b2b.html`, `b2c.html`, `ms-strategy-landing-2.html` | Ajoute `ref` aux `hiddenFields` |
| Segmentation analytics | `src/analytics.js` | `ref` en super-property PostHog |
| Mention RGPD | `politique-confidentialite.html` | Ligne `ms_ref` du tableau des cookies |

Équivalents pour `camp` (voir [Suivi de campagne (camp)](#suivi-de-campagne-camp) plus bas) :

| Élément | Fichier | Rôle |
|---|---|---|
| Liste des campagnes | `middleware.js` (`CAMPAIGNS`) | Whitelist : un `?camp=` absent de cette liste est ignoré |
| Dépôt du cookie | `middleware.js` | `Set-Cookie ms_camp`, 90 jours, dernier-touch |
| Lecture du cookie | `assets/ref.js` | Expose `window.msCamp`, pas de repli par défaut |
| Transmission à Tally | `openTallyForm()` dans `b2b.html`, `b2c.html`, `ms-strategy-landing-2.html` | Ajoute `camp` aux `hiddenFields` |
| Segmentation analytics | `src/analytics.js` | `camp` en super-property PostHog, désenregistrée si le cookie est absent |
| Mention RGPD | `politique-confidentialite.html` | Ligne `ms_camp` du tableau des cookies |

Le cookie est posé **côté serveur** et non en JavaScript : Safari plafonne à
7 jours tout cookie écrit par `document.cookie`, ce qui perdrait les dossiers
déposés plus de deux semaines après le mail du commercial.

## Ajouter ou retirer un commercial

1. Ajouter le slug dans `SLUGS`, dans `middleware.js`.
2. `npm test` (les suites couvrent la whitelist, le first-touch, le lien court
   et le repli par défaut).
3. Déployer. Ses liens sont immédiatement actifs :
   - `https://www.cabinetms.fr/b2b.html?ref=<slug>&utm_source=commercial&utm_medium=affiliation&utm_campaign=<slug>`
   - `https://www.cabinetms.fr/c/<slug>`

## À faire dans Tally (formulaire `kd15W1`)

Ces points ne sont pas dans le code, ils se règlent dans l'éditeur Tally.

1. **Champ caché `ref`** — taper `/hidden` dans l'éditeur, le nommer exactement
   `ref`. Sans lui, la valeur envoyée par le site est ignorée silencieusement.
2. **Champ caché `camp`** — même procédure que `ref`, le nommer exactement
   `camp`. Sans lui, la valeur envoyée par `openTallyForm()` est ignorée
   silencieusement.
3. **Champ visible « Code conseiller »**, optionnel — rattrape les dépôts que le
   cookie ne peut pas couvrir : mail ouvert sur mobile puis facture déposée sur
   l'ordinateur du bureau, navigation privée, cookies purgés, ou accès direct à
   `tally.so/r/kd15W1` sans passer par le site.

Les trois fonctionnent sur le plan gratuit de Tally.

## Pourquoi le slug ne peut pas se retrouver dans Google ou ChatGPT

L'attribution vit dans le cookie, jamais dans l'URL affichée. Dès qu'un `?ref=`
est reçu, le middleware pose le cookie puis renvoie une 302 vers la même URL
sans le paramètre (les `utm_*` sont conservés). Conséquences :

- **Une URL avec slug ne rend aucune page.** Un crawler qui suit un lien de
  commercial partagé publiquement — post LinkedIn, annuaire, forum — atterrit
  sur l'URL canonique déjà indexée. Il n'y a pas de contenu à indexer sous le
  paramètre, donc pas de page dupliquée et pas de résultat parasite.
- **Les bots ne reçoivent jamais de cookie d'attribution.** Ils suivent la
  redirection comme tout le monde, sans `Set-Cookie`.
- **Un prospect ne peut pas repartager le slug par accident** : l'URL de sa
  barre d'adresse ne le contient plus quand la page s'affiche.
- La redirection est marquée `Cache-Control: private, no-store` — sans ça, un
  CDN pourrait resservir un `Set-Cookie` et attribuer un visiteur au commercial
  d'un autre.
- `sitemap.xml` ne contient aucune URL avec slug, et `b2b.html`/`b2c.html`
  portent déjà leur `<link rel="canonical">`.

Le risque restant n'est pas technique mais organisationnel : si un commercial
poste son lien en public, le trafic qu'il attire lui sera attribué. C'est le
comportement attendu du dispositif, pas une fuite — mais il vaut mieux que les
commerciaux le sachent.

## Limites connues

- L'attribution suit un navigateur, pas une personne : changement d'appareil =
  perte du cookie. C'est le rôle du champ « Code conseiller ».
- Règle first-touch : le premier commercial touché garde le dossier pendant
  90 jours, même si le prospect revient ensuite par le lien d'un autre.
- Les liens courts `/c/<slug>` atterrissent sur la landing B2B
  (`SHORT_LINK_TARGET` dans `middleware.js`).
- `ms-strategy-landing-2.html` n'a pas de `<link rel="canonical">`, contrairement
  à `b2b.html` et `b2c.html`. Sans effet sur l'attribution — le slug n'atteint
  jamais le HTML — mais à corriger si cette landing doit être indexée.

## Suivi de campagne (camp)

Indépendant du mécanisme d'attribution commerciale ci-dessus : `?camp=<code>`
(ex. `chr-e1` pour le premier email du segment hôtellerie-restauration) est
posé en cookie `ms_camp` par `middleware.js`, sur le même modèle que `ms_ref`
— sauf sur trois points :

- **Whitelist séparée** (`CAMPAIGNS` dans `middleware.js`, un code par
  segment/email de la séquence de démarchage à froid,
  `content/cold-outreach-waalaxy/`).
- **Dernier-touch, pas premier-touch** : un nouveau `?camp=` valide écrase
  toujours la valeur précédente. Il n'y a pas de commission à protéger ici —
  au contraire, on veut savoir quel email précis a fait revenir le prospect
  la dernière fois, pour comparer les segments et les emails entre eux.
- **Base légale distincte** : intérêt légitime (RGPD art. 6.1.f), finalité
  strictement commerciale (prioriser les relances, mesurer la performance
  des campagnes), jamais transmis à un tiers publicitaire. L'opt-out déjà
  présent en pied de chaque email de la séquence (« répondez STOP ») couvre
  l'opposition.

`ref` et `camp` cohabitent sur le même lien
(`?ref=ag&camp=chr-e1`) et sont retirés ensemble de l'URL affichée par la
même redirection 302 — les protections déjà en place pour `ref` (pas de
cookie pour les bots, `Cache-Control: private, no-store`, aucune page
indexable sous le paramètre) s'appliquent identiquement à `camp`, mais
seulement sur les routes couvertes par le `matcher` de `middleware.js`
(`/`, `/b2b.html`, `/b2c.html`, `/blog.html`, `/comment-ca-marche.html`,
`/resultats.html`, `/ms-strategy-landing-2.html`,
`/ms-strategy-calculateur.html`, `/c/:slug*`). Sur une page hors matcher
(ex. les articles du baromètre, `/mentions-legales.html`, `/cgv.html`), un
`?camp=` ne pose aucun cookie et l'URL n'est pas nettoyée — sans effet
pratique aujourd'hui puisque les liens des emails de prospection pointent
tous vers `b2b.html`, qui est bien dans le matcher.

`camp` alimente une super-property PostHog (`src/analytics.js`) et, une fois
le champ caché correspondant créé dans l'éditeur Tally (voir
[« À faire dans Tally »](#à-faire-dans-tally-formulaire-kd15w1) plus haut),
la colonne `camp` des soumissions — pour relier un dépôt de facture à
l'email précis qui l'a déclenché.

**Hors périmètre, quel que soit ce montage** : importer la liste de
prospects dans un outil publicitaire (Meta/LinkedIn/TikTok Custom/Matched
Audiences). Ça nécessite un consentement donné au moment de la collecte,
qu'un prospect jamais contacté n'a par définition pas donné — aucun mécanisme
côté site ne peut le fournir a posteriori.

## Suite éventuelle

- Remonter `ref` dans un Google Sheet via l'intégration Tally, ou vers HubSpot
  via webhook / Make — Tally n'a pas d'intégration HubSpot native.
- Envoi nominatif : `?ref=<slug>&lead=<id>` avec un second champ caché `lead`,
  pour savoir quel prospect a déposé même s'il utilise une autre adresse mail.
