# Campagne de communication — Plan d'implémentation (volet code)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer la partie codable de la campagne de communication M&S Strategy : finir et fiabiliser le Pixel Meta déjà codé, créer le pipeline HubSpot "Dossier facture" par API, brancher le webhook Tally→HubSpot, et générer les 9 templates HTML email à partir du copywriting déjà validé.

**Architecture:** Site statique existant (HTML/CSS/JS, hébergé Vercel) + une fonction serverless Node (`api/tally-webhook.js`) qui relaie les soumissions Tally vers l'API HubSpot + deux scripts Node ponctuels (création du pipeline, génération des templates email) exécutés une fois en local.

**Tech Stack:** HTML/CSS/JS vanilla, Vercel Edge Middleware (existant) + Vercel Serverless Function (Node, nouveau), Node.js ESM, Vitest (nouveau, pour la logique pure ajoutée), API REST HubSpot v3.

## Global Constraints

- Aucune statistique ou chiffre inventé dans les emails ou le code — les variables `{{levier_1}}`, `{{economie_estimee}}`, `{{gain_realise}}`, `{{offre_parrainage}}` restent des placeholders texte, jamais remplies par une valeur générée.
- Conseiller nommé dans toutes les communications : **Antoine Gaussin**.
- Coordonnées de contact : `09 52 92 64 98`, `msstrategy@yahoo.com`.
- Formulaire Tally existant : id `kd15W1`, champ caché `source` (valeurs vues dans le code : `b2b`, `b2c`, `landing-2`).
- Fichier source du copywriting (ne pas modifier son contenu texte) : `docs/content/2026-07-campagne-communication-emails.md`.
- Secrets dans `.env` (déjà gitignored via `.gitignore` créé dans ce worktree) — jamais commités, jamais affichés en clair dans les logs/commandes.
- `package.json` passe à `"type": "module"` (nécessaire pour les nouveaux scripts ESM) — n'affecte pas `middleware.js` (Edge Middleware gère l'ESM indépendamment de ce champ).
- Couleurs de marque (extraites de `index.html:12-25`) : `--dark:#07131a`, `--cream:#f5f0e8`, `--teal:#1a7a8a`, `--green:#4cde80`, `--muted:#8aacb4`.
- Hypothèse à vérifier lors de l'exécution (je n'ai pas accès à l'éditeur du formulaire Tally `kd15W1`) : les champs du formulaire ont des libellés contenant "email", "prénom", "entreprise"/"société", "téléphone" — le webhook (Task 4) cherche les champs par sous-chaîne de libellé, pas par clé exacte, justement pour rester robuste à cette incertitude ; si les vrais libellés diffèrent, ajuster la liste dans `extractContact()`.

## Décomposition retenue

Ce plan couvre uniquement le code (3 chantiers indépendants : Pixel, intégration HubSpot, templates email — chacun testable seul). Les actions qui dépendent de comptes/paiements externes (créer le compte HubSpot lui-même, acheter le domaine d'envoi dédié, créer les boîtes mail, lancer la campagne Meta Ads, souscrire à Instantly.ai/Smartlead) ne sont pas des tâches de code et ne rentrent pas dans le format TDD de ce document — elles restent à faire manuellement par l'utilisateur, en dehors de ce plan.

---

### Task 1: Corriger les deux bugs connus du Pixel Meta + bandeau de consentement

**Branche :** `worktree-meta-pixel-consent` (existe déjà sur `origin`, pas la branche de ce worktree). Travailler dessus via `git worktree add ../pixel-fix worktree-meta-pixel-consent` (ou `EnterWorktree` avec `path`) avant de commencer.

**Files:**
- Modify: `assets/consent-pixel.js`

**Interfaces:**
- Produces: aucune nouvelle fonction publique — corrige le comportement de `offsetStickyCta(px)` et `showManageLink()` (déjà internes au fichier) et du handler du bouton `#ms-consent-refuse`.

- [ ] **Step 1: Démarrer un serveur local pour tester manuellement**

Run: `python3 -m http.server 8000` (depuis la racine du worktree `pixel-fix`)
Expected: `Serving HTTP on :: port 8000 ...`, laisser tourner en arrière-plan.

- [ ] **Step 2: Reproduire le bug d'occlusion du CTA flottant sur un article de blog**

Dans un navigateur, DevTools → Application → Cookies → supprimer `ms_consent` pour `localhost:8000`. Ouvrir `http://localhost:8000/ms-blog-article-1.html`, scroller au-delà de 400px pour faire apparaître le CTA flottant (bouton en bas à droite), puis observer : le bandeau de consentement (bas de page) recouvre le CTA flottant.
Expected (bug actuel) : le CTA flottant reste visuellement caché sous le bandeau — `offsetStickyCta()` ne le décale pas car il ne cible que `.sticky-cta`.

- [ ] **Step 3: Corriger `offsetStickyCta` pour gérer `.sticky-cta` et `.floating-cta`, en respectant la position par défaut de chacun**

Dans `assets/consent-pixel.js`, remplacer :

```js
  var STICKY_CTA_SELECTOR = '.sticky-cta';
```

par :

```js
  var OFFSET_SELECTORS = ['.sticky-cta', '.floating-cta'];
```

Puis remplacer la fonction `offsetStickyCta` :

```js
  function offsetStickyCta(px) {
    var sticky = document.querySelector(STICKY_CTA_SELECTOR);
    if (!sticky) return;
    sticky.style.transition = 'bottom .2s ease';
    sticky.style.bottom = px + 'px';
  }
```

par :

```js
  function offsetStickyCta(px) {
    OFFSET_SELECTORS.forEach(function (selector) {
      var el = document.querySelector(selector);
      if (!el) return;
      el.style.transition = 'bottom .2s ease';
      if (px > 0) {
        var natural = parseFloat(window.getComputedStyle(el).bottom) || 0;
        el.style.bottom = (natural + px) + 'px';
      } else {
        el.style.bottom = '';
      }
    });
  }
```

Note : `.sticky-cta` a un `bottom: 0` par défaut en CSS, donc `offsetStickyCta(0)` remettait déjà la bonne valeur pour lui. `.floating-cta` a `bottom: 2rem` (ou `1rem` en mobile) par défaut — l'ancienne logique aurait cassé sa position en la remettant à `0px` en dur. La nouvelle version lit la position naturelle via `getComputedStyle` avant de l'offsetter, et restaure l'inline style vide (`''`) plutôt qu'un `0px` en dur, pour laisser le CSS reprendre la main.

Puis mettre à jour `showManageLink` pour positionner le bouton "Gérer les cookies" au-dessus du CTA effectivement visible (sticky ou flottant) :

```js
  function showManageLink() {
    if (document.getElementById('ms-consent-manage')) return;
    injectBannerStyles();
    var manage = document.createElement('button');
    manage.id = 'ms-consent-manage';
    manage.type = 'button';
    manage.textContent = 'Gérer les cookies';
    manage.addEventListener('click', function () {
      manage.parentNode.removeChild(manage);
      clearCookie(CONSENT_COOKIE);
      showBanner();
    });
    document.body.appendChild(manage);

    var offsetBottom = 16;
    OFFSET_SELECTORS.forEach(function (selector) {
      var el = document.querySelector(selector);
      if (el && el.offsetHeight > 0) {
        offsetBottom = Math.max(offsetBottom, el.offsetHeight + 16);
      }
    });
    manage.style.bottom = offsetBottom + 'px';
  }
```

- [ ] **Step 4: Vérifier manuellement que le CTA flottant n'est plus occlus**

Recharger `http://localhost:8000/ms-blog-article-1.html` avec le cookie `ms_consent` supprimé, scroller au-delà de 400px.
Expected : le bandeau de consentement apparaît, le CTA flottant reste visible et se décale au-dessus du bandeau (pas caché dessous). Cliquer "Accepter" ou "Refuser" : le bandeau disparaît, le CTA flottant reprend sa position par défaut (`2rem` du bas sur desktop), pas collé à `0px`.

- [ ] **Step 5: Reproduire le bug de révocation du consentement mi-session**

Ce bug ne peut être observé qu'avec un vrai Pixel ID chargé — pour le vérifier maintenant sans en avoir un, modifier temporairement en local (ne pas commiter) `var META_PIXEL_ID = 'REPLACE_WITH_PIXEL_ID';` en `var META_PIXEL_ID = '000000000000000';` (faux ID à 15 chiffres, suffisant pour déclencher le chargement du script `fbq`). Recharger la page avec le cookie supprimé, cliquer "Accepter" → vérifier dans la console que `window.fbq` est défini. Cliquer sur "Gérer les cookies" (bouton en bas à gauche) puis "Refuser" dans le bandeau qui réapparaît.
Expected (bug actuel) : le cookie passe à `refused`, mais `window.fbq` reste défini dans la console — `msTrackLead()` continuerait donc à envoyer des événements `Lead` malgré le refus.

- [ ] **Step 6: Corriger le handler de refus pour recharger la page si le Pixel était déjà chargé**

Dans `assets/consent-pixel.js`, dans `showBanner()`, remplacer :

```js
    document.getElementById('ms-consent-refuse').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'refused', CONSENT_MAX_AGE_DAYS);
      banner.parentNode.removeChild(banner);
      offsetStickyCta(0);
      showManageLink();
    });
```

par :

```js
    document.getElementById('ms-consent-refuse').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'refused', CONSENT_MAX_AGE_DAYS);
      if (window.fbq) {
        window.location.reload();
        return;
      }
      banner.parentNode.removeChild(banner);
      offsetStickyCta(0);
      showManageLink();
    });
```

`init()` relit le cookie au chargement de la page et n'appelle `loadPixel()` que si `consent === 'accepted'` — un rechargement avec `ms_consent=refused` déjà posé garantit donc que `fbq` ne se recharge pas.

- [ ] **Step 7: Vérifier manuellement la correction**

Répéter le Step 5 (avec le faux ID toujours en place localement) : "Accepter" → `window.fbq` défini → "Gérer les cookies" → "Refuser".
Expected : la page se recharge ; après rechargement, `window.fbq` est `undefined` dans la console, le cookie `ms_consent=refused` est toujours posé, le bandeau ne réapparaît pas.

- [ ] **Step 8: Retirer le faux ID de test et arrêter le serveur local**

Remettre `var META_PIXEL_ID = 'REPLACE_WITH_PIXEL_ID';` (ne pas commiter le faux ID). Arrêter `python3 -m http.server 8000` (Ctrl-C).

- [ ] **Step 9: Commit**

```bash
git add assets/consent-pixel.js
git commit -m "Fix floating-cta occlusion and mid-session consent revocation"
```

---

### Task 2: Configurer le vrai Pixel ID et préparer la fusion vers `main`

**Prérequis manuel :** l'utilisateur doit avoir créé un Pixel dans Meta Events Manager (Meta Business Suite → Sources de données → Pixels → Créer un pixel) et en récupérer l'ID numérique (15-16 chiffres).

**Files:**
- Modify: `assets/consent-pixel.js` (même worktree/branche que Task 1)

- [ ] **Step 1: Remplacer le placeholder par le vrai Pixel ID**

Dans `assets/consent-pixel.js`, remplacer :

```js
  var META_PIXEL_ID = 'REPLACE_WITH_PIXEL_ID';
```

par (avec le vrai ID fourni par l'utilisateur, entre guillemets, sans espace) :

```js
  var META_PIXEL_ID = '<ID_NUMÉRIQUE_RÉEL>';
```

- [ ] **Step 2: Vérifier avec l'extension Meta Pixel Helper**

Avec l'extension Chrome "Meta Pixel Helper" installée, recharger une page du site en local (`python3 -m http.server 8000`) avec `ms_consent` supprimé, cliquer "Accepter".
Expected : l'extension affiche un Pixel actif avec l'ID configuré, événement `PageView` détecté. Ouvrir le formulaire Tally sur `b2b.html` (bouton "Transmettre ma facture") : l'extension détecte un événement `Lead`.

- [ ] **Step 3: Commit**

```bash
git add assets/consent-pixel.js
git commit -m "Set live Meta Pixel ID"
```

- [ ] **Step 4: Fusion vers `main` (action manuelle, hors format TDD)**

Ouvrir une PR de `worktree-meta-pixel-consent` vers `main` (`gh pr create --draft`), la faire relire, puis merger — décision de l'utilisateur sur le moment (pas automatisé par ce plan).

---

### Task 3: Créer le pipeline HubSpot "Dossier facture" (8 étapes) par API

**Files:**
- Create: `scripts/create-hubspot-pipeline.mjs`

**Interfaces:**
- Produces: un pipeline HubSpot nommé "Dossier facture" avec 8 étapes. Les IDs d'étapes générés par HubSpot (imprévisibles avant exécution) doivent être reportés dans `.env` sous `HUBSPOT_PIPELINE_ID` et `HUBSPOT_STAGE_FACTURE_RECUE_ID` — consommés par Task 4.

- [ ] **Step 1: Vérifier que le token a le scope d'écriture nécessaire**

Run (depuis la racine du worktree, `.env` doit contenir `HUBSPOT_API_TOKEN`) :
```bash
node --env-file=.env -e "
fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
  headers: { Authorization: 'Bearer ' + process.env.HUBSPOT_API_TOKEN }
}).then(r => console.log(r.status))
"
```
Expected: `200`. Si `403`, retourner dans HubSpot → Paramètres → Applications privées → cocher le scope `crm.objects.deals.write` (et `crm.schemas.deals.write` si listé séparément) → Enregistrer, avant de continuer.

- [ ] **Step 2: Écrire le script de création du pipeline**

Créer `scripts/create-hubspot-pipeline.mjs` :

```js
const STAGES = [
  { label: 'Prospection froide', isClosed: false, probability: '0.05' },
  { label: 'Répondu / intéressé', isClosed: false, probability: '0.1' },
  { label: 'Facture reçue', isClosed: false, probability: '0.2' },
  { label: 'Analyse en cours', isClosed: false, probability: '0.35' },
  { label: 'Proposition envoyée', isClosed: false, probability: '0.5' },
  { label: 'En attente de décision', isClosed: false, probability: '0.6' },
  { label: 'Contrat signé', isClosed: false, probability: '0.9' },
  { label: 'Activé / Client', isClosed: true, probability: '1.0' },
];

async function main() {
  const token = process.env.HUBSPOT_API_TOKEN;
  if (!token) throw new Error('HUBSPOT_API_TOKEN manquant (lancer avec node --env-file=.env)');

  const body = {
    label: 'Dossier facture',
    displayOrder: 1,
    stages: STAGES.map((s, i) => ({
      label: s.label,
      displayOrder: i,
      metadata: { isClosed: String(s.isClosed), probability: s.probability },
    })),
  };

  const res = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Erreur HubSpot:', res.status, JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('Pipeline créé, id:', data.id);
  console.log('Étapes:');
  data.stages.forEach((s) => console.log(`  ${s.id}  →  ${s.label}`));
  const factureRecue = data.stages.find((s) => s.label === 'Facture reçue');
  console.log('\nÀ ajouter dans .env :');
  console.log(`HUBSPOT_PIPELINE_ID=${data.id}`);
  console.log(`HUBSPOT_STAGE_FACTURE_RECUE_ID=${factureRecue.id}`);
}

main();
```

- [ ] **Step 3: Exécuter le script et vérifier la sortie**

Run: `node --env-file=.env scripts/create-hubspot-pipeline.mjs`
Expected: `Pipeline créé, id: <un id>` suivi de la liste des 8 étapes dans l'ordre, puis les deux lignes `HUBSPOT_PIPELINE_ID=...` / `HUBSPOT_STAGE_FACTURE_RECUE_ID=...`.

- [ ] **Step 4: Reporter les IDs dans `.env`**

Ajouter les deux lignes affichées à la fin du fichier `.env` (ne pas les commiter — `.env` est déjà gitignored).

- [ ] **Step 5: Vérifier via l'API que le pipeline existe bien**

Run:
```bash
node --env-file=.env -e "
fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
  headers: { Authorization: 'Bearer ' + process.env.HUBSPOT_API_TOKEN }
}).then(r => r.json()).then(d => console.log(d.results.map(p => p.label)))
"
```
Expected: la liste imprimée contient `'Dossier facture'` en plus de `'Sales Pipeline'`.

- [ ] **Step 6: Commit**

```bash
git add scripts/create-hubspot-pipeline.mjs
git commit -m "Add script to create the HubSpot 'Dossier facture' pipeline"
```

---

### Task 4: Webhook Tally → HubSpot (création contact + deal à la réception d'une facture)

**Files:**
- Create: `api/tally-webhook.js`
- Test: `api/tally-webhook.test.js`
- Modify: `package.json` (ajouter `"type": "module"`, `vitest` en devDependency, script `test`)

**Interfaces:**
- Consumes: `HUBSPOT_API_TOKEN`, `HUBSPOT_PIPELINE_ID`, `HUBSPOT_STAGE_FACTURE_RECUE_ID` (produits par Task 3, dans `.env` / variables d'environnement Vercel en production).
- Produces: endpoint HTTP `POST /api/tally-webhook`, fonction exportée `extractContact(fields)` réutilisable/testable isolément.

- [ ] **Step 1: Passer le projet en ESM et ajouter Vitest**

Modifier `package.json` :

```json
{
  "name": "site-ms",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@vercel/edge": "^1.1.2"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

Run: `npm install`
Expected: `vitest` installé sans erreur, `node_modules/` créé.

- [ ] **Step 2: Écrire le test de `extractContact` (échoue d'abord car la fonction n'existe pas)**

Créer `api/tally-webhook.test.js` :

```js
import { describe, it, expect } from 'vitest';
import { extractContact } from './tally-webhook.js';

describe('extractContact', () => {
  it('extrait email, prénom, entreprise et téléphone par libellé de champ', () => {
    const fields = [
      { label: 'Prénom', value: 'Claire' },
      { label: 'Email professionnel', value: 'claire@exemple.fr' },
      { label: 'Nom de l’entreprise', value: 'Exemple SARL' },
      { label: 'Téléphone', value: '0600000000' },
    ];
    expect(extractContact(fields)).toEqual({
      email: 'claire@exemple.fr',
      firstname: 'Claire',
      company: 'Exemple SARL',
      phone: '0600000000',
    });
  });

  it('renvoie des chaînes vides pour les champs absents', () => {
    expect(extractContact([])).toEqual({
      email: '', firstname: '', company: '', phone: '',
    });
  });

  it('ignore la casse du libellé', () => {
    const fields = [{ label: 'EMAIL', value: 'a@b.fr' }];
    expect(extractContact(fields).email).toBe('a@b.fr');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `api/tally-webhook.js` n'existe pas encore.

- [ ] **Step 4: Implémenter `api/tally-webhook.js`**

```js
export function extractContact(fields) {
  const getByLabel = (substrings) => {
    const match = fields.find((f) =>
      substrings.some((s) => (f.label || '').toLowerCase().includes(s))
    );
    return match ? String(match.value ?? '').trim() : '';
  };

  return {
    email: getByLabel(['email', 'e-mail']),
    firstname: getByLabel(['prénom', 'prenom']),
    company: getByLabel(['entreprise', 'société', 'societe']),
    phone: getByLabel(['téléphone', 'telephone']),
  };
}

async function upsertContact(token, contact) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [
        {
          idProperty: 'email',
          id: contact.email,
          properties: {
            email: contact.email,
            firstname: contact.firstname,
            company: contact.company,
            phone: contact.phone,
          },
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`HubSpot contact error ${res.status}: ${JSON.stringify(data)}`);
  return data.results[0].id;
}

async function createDeal(token, { pipelineId, stageId, contactId, contact }) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        dealname: `${contact.company || contact.email} — facture reçue`,
        pipeline: pipelineId,
        dealstage: stageId,
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`HubSpot deal error ${res.status}: ${JSON.stringify(data)}`);
  return data.id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.HUBSPOT_API_TOKEN;
  const pipelineId = process.env.HUBSPOT_PIPELINE_ID;
  const stageId = process.env.HUBSPOT_STAGE_FACTURE_RECUE_ID;

  if (!token || !pipelineId || !stageId) {
    res.status(500).json({ error: 'Missing HubSpot configuration' });
    return;
  }

  const fields = req.body?.data?.fields || [];
  const contact = extractContact(fields);

  if (!contact.email) {
    res.status(400).json({ error: 'No email field found in Tally payload' });
    return;
  }

  try {
    const contactId = await upsertContact(token, contact);
    await createDeal(token, { pipelineId, stageId, contactId, contact });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[tally-webhook] HubSpot error', err);
    res.status(502).json({ error: 'HubSpot upstream error' });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 6: Configurer le webhook côté Tally (action manuelle)**

Dans Tally → formulaire `kd15W1` → Intégrations → Webhooks → ajouter l'URL `https://www.byandry.com/api/tally-webhook` (une fois déployé sur Vercel). Vérifier dans les paramètres Vercel du projet que `HUBSPOT_API_TOKEN`, `HUBSPOT_PIPELINE_ID`, `HUBSPOT_STAGE_FACTURE_RECUE_ID` sont bien définis en variables d'environnement (Production).

- [ ] **Step 7: Test de bout en bout après déploiement (manuel)**

Soumettre une facture test via le formulaire Tally sur la preview Vercel. Vérifier dans HubSpot qu'un contact et un deal apparaissent dans le pipeline "Dossier facture", étape "Facture reçue", sous 1-2 minutes.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json api/tally-webhook.js api/tally-webhook.test.js
git commit -m "Add Tally to HubSpot webhook with tests"
```

---

### Task 5: Générer les 9 templates HTML email à partir du copywriting

**Files:**
- Create: `scripts/lib/parse-email-copy.mjs`
- Create: `scripts/lib/parse-email-copy.test.mjs`
- Create: `scripts/lib/render-email-html.mjs`
- Create: `scripts/lib/render-email-html.test.mjs`
- Create: `scripts/build-email-templates.mjs`
- Create (généré par le script, pas à la main) : `emails/post-facture-01-accuse-reception.html` … `emails/post-facture-06-demande-avis-parrainage.html`, `emails/cold-outbound-01-premier-contact.html` … `emails/cold-outbound-03-breakup.html`

**Interfaces:**
- Consumes: `docs/content/2026-07-campagne-communication-emails.md` (contenu texte, ne pas modifier).
- Produces: 9 fichiers HTML statiques dans `emails/`, prêts à être copiés dans l'éditeur de template HubSpot (les `{{variable}}` restent littérales — à remapper vers la syntaxe de personnalisation HubSpot `{{ contact.xxx }}` manuellement dans leur éditeur, étape non automatisable depuis ce script).

- [ ] **Step 1: Écrire le test du parseur de copy (échoue d'abord)**

Créer `scripts/lib/parse-email-copy.test.mjs` :

```js
import { describe, it, expect } from 'vitest';
import { parseEmailCopy } from './parse-email-copy.mjs';

const FIXTURE = `### 1. Test email

**Objet :** Sujet de test

Bonjour {{prenom}},

Ceci est un paragraphe.

---

### 2. Deuxième email

**Objet :** Autre sujet

Corps du deuxième email.

---
`;

describe('parseEmailCopy', () => {
  it('extrait id, titre, sujet et corps pour chaque bloc', () => {
    const result = parseEmailCopy(FIXTURE);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      title: 'Test email',
      subject: 'Sujet de test',
      bodyText: 'Bonjour {{prenom}},\n\nCeci est un paragraphe.',
    });
    expect(result[1].id).toBe(2);
    expect(result[1].subject).toBe('Autre sujet');
    expect(result[1].bodyText).toBe('Corps du deuxième email.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- parse-email-copy`
Expected: FAIL — `parse-email-copy.mjs` n'existe pas.

- [ ] **Step 3: Implémenter `parse-email-copy.mjs`**

```js
export function parseEmailCopy(markdown) {
  const blocks = markdown.split(/(?:^|\n)### /).filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split('\n');
    const titleLine = lines[0].trim();
    const idMatch = titleLine.match(/^(\d+)\.\s*(.+)$/);
    const rest = lines.slice(1).join('\n');
    const withoutTrailer = rest.split(/\n---/)[0];
    const subjectMatch = withoutTrailer.match(/\*\*Objet\s*:\*\*\s*(.+)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const bodyText = withoutTrailer
      .replace(/\*\*Objet\s*:\*\*.+\n?/, '')
      .trim();

    return {
      id: idMatch ? Number(idMatch[1]) : null,
      title: idMatch ? idMatch[2] : titleLine,
      subject,
      bodyText,
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- parse-email-copy`
Expected: PASS.

- [ ] **Step 5: Écrire le test du rendu HTML (échoue d'abord)**

Créer `scripts/lib/render-email-html.test.mjs` :

```js
import { describe, it, expect } from 'vitest';
import { renderEmailHtml } from './render-email-html.mjs';

describe('renderEmailHtml', () => {
  it('inclut le sujet dans la balise title', () => {
    const html = renderEmailHtml({ subject: 'Sujet de test', bodyText: 'Bonjour.' });
    expect(html).toContain('<title>Sujet de test</title>');
  });

  it('met chaque paragraphe (séparé par une ligne vide) dans son propre <p>', () => {
    const html = renderEmailHtml({ subject: 'S', bodyText: 'Premier paragraphe.\n\nSecond paragraphe.' });
    expect((html.match(/<p /g) || []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('Premier paragraphe.');
    expect(html).toContain('Second paragraphe.');
  });

  it("n'affiche la mention de désinscription que pour la variante cold-outbound", () => {
    const cold = renderEmailHtml({ subject: 'S', bodyText: 'B.', variant: 'cold-outbound' });
    const postFacture = renderEmailHtml({ subject: 'S', bodyText: 'B.', variant: 'post-facture' });
    expect(cold).toContain('lien_desinscription');
    expect(postFacture).not.toContain('lien_desinscription');
  });

  it('échappe les caractères spéciaux HTML dans le sujet', () => {
    const html = renderEmailHtml({ subject: 'A & B < C', bodyText: 'B.' });
    expect(html).toContain('<title>A &amp; B &lt; C</title>');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- render-email-html`
Expected: FAIL — `render-email-html.mjs` n'existe pas.

- [ ] **Step 7: Implémenter `render-email-html.mjs`**

```js
const BRAND = {
  dark: '#07131a',
  cream: '#f5f0e8',
  green: '#4cde80',
  muted: '#8aacb4',
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderEmailHtml({ subject, bodyText, variant = 'post-facture' }) {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.dark};">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const footer = variant === 'cold-outbound'
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">Vous recevez cet email dans le cadre d'une démarche de prospection B2B fondée sur l'intérêt légitime, en lien avec votre fonction professionnelle. Pour ne plus recevoir nos messages, répondez "STOP" à cet email ou cliquez ici : {{lien_desinscription}}.</p>`
    : `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">M&amp;S Strategy — 09 52 92 64 98 — msstrategy@yahoo.com</p>`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background:${BRAND.dark};padding:20px 32px;">
<span style="font-family:Arial,sans-serif;font-weight:800;font-size:16px;color:${BRAND.cream};">M&amp;S Strategy</span>
</td></tr>
<tr><td style="padding:32px;font-family:Arial,sans-serif;">
${paragraphs}
${footer}
</td></tr>
<tr><td style="background:${BRAND.dark};height:4px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- render-email-html`
Expected: PASS.

- [ ] **Step 9: Écrire le script de génération**

Créer `scripts/build-email-templates.mjs` :

```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseEmailCopy } from './lib/parse-email-copy.mjs';
import { renderEmailHtml } from './lib/render-email-html.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COPY_PATH = path.join(ROOT, 'docs/content/2026-07-campagne-communication-emails.md');
const OUT_DIR = path.join(ROOT, 'emails');

const POST_FACTURE_SLUGS = [
  'accuse-reception', 'resultat-analyse', 'relance-j3',
  'confirmation-signature', 'bienvenue-activation', 'demande-avis-parrainage',
];
const COLD_OUTBOUND_SLUGS = ['premier-contact', 'relance', 'breakup'];

function main() {
  const markdown = readFileSync(COPY_PATH, 'utf8');
  const emails = parseEmailCopy(markdown).filter((e) => e.id !== null);
  mkdirSync(OUT_DIR, { recursive: true });

  emails.forEach((email) => {
    const isColdOutbound = email.id >= 7;
    const slugList = isColdOutbound ? COLD_OUTBOUND_SLUGS : POST_FACTURE_SLUGS;
    const slugIndex = isColdOutbound ? email.id - 7 : email.id - 1;
    const slug = slugList[slugIndex];
    const prefix = isColdOutbound ? 'cold-outbound' : 'post-facture';
    const num = String(isColdOutbound ? email.id - 6 : email.id).padStart(2, '0');
    const filename = `${prefix}-${num}-${slug}.html`;

    const html = renderEmailHtml({
      subject: email.subject,
      bodyText: email.bodyText,
      variant: isColdOutbound ? 'cold-outbound' : 'post-facture',
    });

    writeFileSync(path.join(OUT_DIR, filename), html, 'utf8');
    console.log('Écrit :', filename);
  });

  console.log(`${emails.length} templates générés dans ${OUT_DIR}`);
}

main();
```

- [ ] **Step 10: Exécuter le script**

Run: `node scripts/build-email-templates.mjs`
Expected: 9 lignes `Écrit : ...` puis `9 templates générés dans .../emails`.

- [ ] **Step 11: Vérifier le nombre de fichiers et un échantillon de contenu**

Run: `ls emails/ | wc -l`
Expected: `9`

Run: `grep -o '<title>[^<]*</title>' emails/post-facture-01-accuse-reception.html`
Expected: `<title>Nous avons bien reçu votre facture, {{prenom}}</title>` (doit correspondre exactement au sujet de l'email 1 dans `docs/content/2026-07-campagne-communication-emails.md`).

Run: `grep -c "lien_desinscription" emails/cold-outbound-01-premier-contact.html emails/post-facture-01-accuse-reception.html`
Expected: le fichier cold-outbound contient la mention, le fichier post-facture non (`grep -c` retourne 0 pour ce dernier).

- [ ] **Step 12: Commit**

```bash
git add scripts/lib/parse-email-copy.mjs scripts/lib/parse-email-copy.test.mjs scripts/lib/render-email-html.mjs scripts/lib/render-email-html.test.mjs scripts/build-email-templates.mjs emails/
git commit -m "Generate 9 branded HTML email templates from the campaign copywriting"
```

---

## Self-Review

**Couverture de la spec** (`docs/superpowers/specs/2026-07-19-campagne-communication-design.md`) :
- Section C (parcours post-facture, pipeline 6 étapes) → Task 3 (pipeline, avec les 2 étapes amont de la section D fusionnées dedans) + Task 5 (6 templates HTML).
- Section D (cold outbound — infra domaine/boîtes/warmup) → hors code, listée dans "Décomposition retenue" comme action manuelle ; la partie codable (3 emails, intégration pipeline) est couverte par Task 3 + Task 5.
- Section F (dépendances techniques) → items 1-2 = Task 1/2, item 3 = Task 3/4, items 4-6 = actions manuelles hors plan.
- Pixel/consentement (contexte) → Task 1 + Task 2.

**Incohérence résolue pendant l'écriture du plan** : la spec décrivait "Prospection froide" comme une étape en amont d'un pipeline "Dossier facture" séparé, ce qui est ambigu dans le modèle de données HubSpot (un deal appartient à un seul pipeline). Task 3 résout ça en un seul pipeline à 8 étapes (les 2 étapes amont + les 6 étapes post-facture) — cohérent avec l'intention de la spec ("un seul point de convergence"), documenté explicitement ici plutôt que laissé implicite.

**Placeholders** : aucun — toutes les valeurs incertaines (ID Pixel réel, libellés exacts des champs Tally, IDs d'étapes générés par HubSpot) sont documentées comme telles avec une étape concrète pour les obtenir/vérifier, pas laissées vagues.
