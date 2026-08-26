# Activer la Conversions API Meta

Le code est en place (`api/capi-lead.js`, `lib/capi.mjs`, `onTallySubmit()`
dans `b2b.html`/`b2c.html`) mais reste inactif tant que le token d'accès
n'est pas configuré : `api/capi-lead.js` répond 204 sans rien envoyer à Meta
si `META_CAPI_ACCESS_TOKEN` est absent.

## 1. Générer le token

1. Aller dans **Meta Business Manager → Events Manager**.
2. Sélectionner le pixel `1381584920727587`.
3. Onglet **Paramètres → Conversions API → Générer un token d'accès**
   (token système, propre au pixel, sans expiration).
4. Copier le token.

## 2. Configurer Vercel

1. Dans le projet Vercel, **Settings → Environment Variables**.
2. Ajouter `META_CAPI_ACCESS_TOKEN` (Production + Preview) avec le token
   copié à l'étape précédente.
3. Redéployer (la variable n'est lue qu'au démarrage de la fonction).

## 3. Vérifier avant mise en prod

1. Dans Events Manager, onglet **Test des évènements**, copier le code de
   test affiché (ex. `TEST12345`).
2. L'ajouter comme variable d'environnement `META_CAPI_TEST_EVENT_CODE`
   (Preview uniquement) et redéployer une preview.
3. Déposer une facture test (bandeau cookies accepté) sur cette preview.
   L'évènement `Lead` doit apparaître dans **Test des évènements** en
   quelques secondes, avec le hash de l'email affiché comme "correspondance
   avancée".
4. Une fois validé, retirer `META_CAPI_TEST_EVENT_CODE` (ou ne pas la
   définir en Production) : sa présence dévie les évènements vers l'outil de
   test au lieu de les compter dans les campagnes réelles.

## Ce qui est envoyé

Un seul évènement standard, `Lead`, déclenché au dépôt réel de la facture
(callback `onSubmit` de Tally — pas au clic sur le bouton, qui n'ouvre que le
formulaire) :

- email et téléphone saisis dans Tally, hachés en SHA-256 avant l'envoi
  (jamais en clair) ;
- `_fbp`/`_fbc` (cookies posés par le Pixel navigateur) et l'IP/user-agent du
  visiteur, pour l'appariement Meta ;
- un `event_id` partagé avec l'appel `fbq('track', 'Lead', ...)` côté
  navigateur, pour que Meta déduplique au lieu de compter la conversion deux
  fois.

Rien n'est envoyé si le visiteur n'a pas accepté le bandeau cookies (même
règle que le Pixel et PostHog).
