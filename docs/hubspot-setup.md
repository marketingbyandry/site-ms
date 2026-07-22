# Brancher HubSpot sur le site

Le site n'a aucun formulaire HTML : les leads passent par un popup Tally
(formulaire `kd15W1`), par mail et par téléphone. Le branchement HubSpot suit
donc ce chemin :

```
Page (n'importe laquelle)
  └─ assets/attribution.js  capture utm / gclid / landing page / referrer
                            au premier hit, en sessionStorage
Bouton « Transmettre ma facture »
  └─ openTallyForm()        injecte l'attribution en champs cachés Tally
Soumission Tally
  └─ webhook signé  ──────► /api/tally-hubspot  ──────► API Forms HubSpot
                            (vérifie la signature,       contact + timeline
                             traduit les champs)          + workflows
```

Deux choix structurants, faits volontairement :

- **On garde Tally**, on ne le remplace pas par un formulaire HubSpot embarqué.
  Le popup actuel gère l'upload de facture, s'intègre au design et n'ajoute
  aucun script tiers lourd. Un formulaire HubSpot embarqué imposerait un
  script externe, une modification de la CSP et un consentement préalable.
- **On passe par l'API Forms** (`api.hsforms.com`) et non par l'API CRM.
  Elle est non authentifiée — donc aucun token à stocker côté site — elle
  fonctionne sur HubSpot Free, et elle accepte le `hutk`, ce que l'API CRM ne
  fait pas. La liaison se fait de serveur à serveur : **aucune modification de
  la CSP n'est nécessaire.**

## 1. Côté HubSpot

Avant de créer le portail : **choisir l'hébergement UE (`app-eu1.hubspot.com`)**.
Ce choix se fait à la création et n'est pas modifiable ensuite ; un portail US
ajoute un transfert hors UE à documenter dans la politique de confidentialité.

1. Créer un formulaire HubSpot (Marketing → Formulaires). Il ne sera jamais
   affiché : il sert uniquement de cible d'API. Relever son **GUID** dans l'URL
   de l'éditeur.
2. Relever le **Portal ID** (Settings → Account Defaults).
3. Créer les propriétés de contact personnalisées suivantes (type « ligne de
   texte à une ligne »), sinon HubSpot rejette la soumission :

   | Propriété | Contenu |
   |---|---|
   | `ms_source` | `b2b`, `b2c` ou `landing-2` — quel bloc a converti |
   | `ms_utm_source` / `ms_utm_medium` / `ms_utm_campaign` | campagne d'origine |
   | `ms_utm_term` / `ms_utm_content` | déclinaison de campagne |
   | `ms_gclid` / `ms_msclkid` | identifiants de clic payant |
   | `ms_landing_page` | première page vue de la session |
   | `ms_referrer` | site référent (ou `(direct)`) |
   | `ms_page_url` | page depuis laquelle le formulaire a été ouvert |
   | `ms_ab_variant` | variante A/B servie (cookie `ms_variant`) |
   | `ms_siret` | SIRET si le formulaire le demande |
   | `ms_tally_submission_url` | PDF de la soumission Tally |

   Ajouter aussi ces propriétés au formulaire HubSpot lui-même. Les champs
   standards (`email`, `firstname`, `lastname`, `phone`, `company`, `zip`,
   `city`, `message`) existent déjà.

## 2. Côté Tally

1. Dans le formulaire `kd15W1`, déclarer les **champs cachés** portant
   exactement ces noms : `source`, `utm_source`, `utm_medium`, `utm_campaign`,
   `utm_term`, `utm_content`, `gclid`, `msclkid`, `landing_page`, `referrer`,
   `page_url`, `variant`, `hutk`, `message`.
   Tally ignore silencieusement tout champ caché non déclaré — c'est la cause
   n°1 d'attribution vide.
2. Integrations → Webhooks → URL : `https://www.byandry.com/api/tally-hubspot`
3. Activer le **signing secret** et le copier.

## 3. Côté Vercel

Settings → Environment Variables (Production + Preview) :

| Variable | Valeur |
|---|---|
| `TALLY_SIGNING_SECRET` | le secret de l'étape 2.3 |
| `HUBSPOT_PORTAL_ID` | Portal ID HubSpot |
| `HUBSPOT_FORM_GUID` | GUID du formulaire cible |
| `HUBSPOT_REGION` | `eu1` si le portail est hébergé dans l'UE |

Tant que ces variables sont absentes, l'endpoint répond `503` et ne traite
rien : il est inerte par défaut, pas ouvert.

## 4. Avant la mise en service

- [ ] Ajouter HubSpot à la liste des sous-traitants dans
      `politique-confidentialite.html` (finalité : gestion de la relation
      client ; base légale : intérêt légitime / exécution du contrat ;
      localisation : UE si portail `eu1`).
- [ ] Y mentionner le stockage de session `ms_attr` (provenance de la visite,
      durée : la session, aucun identifiant personnel).
- [ ] Soumettre un lead de test et vérifier que le contact arrive avec
      `ms_utm_source` et `ms_landing_page` renseignés.

## Ce que ce branchement ne couvre pas

Les leads arrivant par `mailto:msstrategy@yahoo.com` et par téléphone
(09 52 92 64 98) restent hors HubSpot. Ils représentent une part réelle du
volume. Deux compléments possibles, dans l'ordre de rentabilité :

1. Connecter la boîte mail à HubSpot (Conversations → Inbox) pour que les
   demandes par mail créent un contact automatiquement.
2. Mettre en place un call tracking à numéro dynamique pour attribuer les
   appels à leur source — sans ça, le canal qui produit probablement le plus
   de contrats reste invisible dans le CRM.

## Étape ultérieure : le cookie `hubspotutk`

Le pont ci-dessus rattache un lead à sa campagne, mais pas à son historique de
navigation. Pour cela il faut charger le script de tracking HubSpot
(`js-eu1.hs-scripts.com/<portalId>.js`), qui dépose le cookie `hubspotutk`.
Ce cookie exige un consentement préalable et impose :

- de refondre `assets/cookie-consent.js` en registre à catégories
  (nécessaires / mesure d'audience / marketing) — le mécanisme actuel
  `window.msInitAnalytics` ne gère qu'un seul outil et une seule finalité ;
- d'ajouter `js-eu1.hs-scripts.com` et `track-eu1.hubspot.com` à la CSP dans
  `vercel.json`.

`assets/attribution.js` transmet déjà le `hutk` s'il existe : le jour où ce
script est chargé, la liaison se fait sans autre modification.
