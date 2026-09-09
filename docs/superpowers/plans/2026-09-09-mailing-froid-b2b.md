# Mailing froid B2B (PME/ETI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a mailing froid B2B channel — attribution tracking, guarded Brevo sending logic, and the email template — that complements the Waalaxy cold-outreach channel already in production, driving PME/ETI prospects to the existing "Transmettre ma facture" funnel.

**Architecture:** Three testable code units (camp-code attribution in `middleware.js`, pure guardrail/payload logic in `lib/brevo-cold-outreach.mjs`, a thin CLI script that shells out to the `composio` CLI for the actual Brevo/Google Sheets calls) plus one content deliverable (the HTML template) plus two documentation deliverables (attribution docs, operational runbook). The daily sourcing/enrichment/validation cycle itself is an **agent-run operational procedure**, not application code — it is specified precisely in the runbook (Task 6) rather than built as a deployed service, because company sourcing and site-scraping for email addresses require judgment (reading a page to confirm an email pattern) that isn't a deterministic function.

**Tech Stack:** Node.js (ESM, `node:test`), Vercel Edge Middleware (`@vercel/edge`), Composio CLI (`composio` binary — already installed and authenticated in this environment) for Brevo and Google Sheets access, `recherche-entreprises.api.gouv.fr` (free, no API key) for company sourcing.

## Global Constraints

- Daily send cap: **50**, enforced in code, never exceeded even if the approved batch is larger (spec).
- Sends within a batch are spaced by a delay (**3000ms** default, `SEND_DELAY_MS`) — never sent in a burst (spec: "pas d'envoi en rafale").
- Bounce/suppression safety: abort the day's sends entirely if blocked-contact rate for the day exceeds **5%** (spec).
- No nominative email is ever fabricated by guessing — only used when a pattern is confirmed by a visible example on the company's own public site (spec; enforced upstream in the runbook, not in this repo's code).
- Suppression list (Brevo `blockedContacts`) is checked at send time, not only at batch-build time (spec).
- Opt-out mechanism is "répondez STOP" (mailto convenience link included) — **not** Brevo's native `{{ unsubscribe }}` tag, whose behavior on a raw `htmlContent` transactional send (no Brevo template) is unconfirmed (spec).
- Sender identity: `prospection@mail.cabinetms.fr` / "M&S Strategy" (spec).
- Legal identity in every footer: M&S Strategy (nom commercial), SAS au capital de 50 000 €, SIREN 752 139 477, RCS Montpellier, 1366 Av. des Platanes, 34970 Lattes, France (verified live in `mentions-legales.html` and via Brevo `GET /v3/account`).
- The Brevo API key is never read, stored, or logged by this repo's code — all Brevo calls go through `composio proxy` using the already-linked Composio account (`composio link brevo`, status `ACTIVE`, confirmed in this session).
- 5 new `camp` codes: `mail-chr`, `mail-ind`, `mail-tert`, `mail-agri`, `mail-log` — reusing the sector split already established for the Waalaxy channel (`chr`/`ind`/`tert`, `content/cold-outreach-waalaxy/README.md`) plus the two sectors from the 2026-08-03 positioning work (`agri`/`log`), per user decision 2026-09-09.

---

### Task 1: Camp codes `mail-*` in `middleware.js`

**Files:**
- Modify: `middleware.js:64-70` (the `CAMPAIGNS` array)
- Test: `test/middleware-attribution.test.mjs`

**Interfaces:**
- Consumes: nothing new — reuses the existing `CAMPAIGNS` whitelist mechanism and `attributionRedirect()` already in `middleware.js`.
- Produces: `CAMPAIGNS` now includes `'mail-chr'`, `'mail-ind'`, `'mail-tert'`, `'mail-agri'`, `'mail-log'`, consumed by `lib/brevo-cold-outreach.mjs` (Task 2) when building the `LIEN_FORMULAIRE` merge value.

- [ ] **Step 1: Write the failing test**

Add to `test/middleware-attribution.test.mjs`, after the existing `'les 4 codes de campagne social sont acceptes par le middleware'` test (currently ending at line 177):

```javascript
test('les 5 codes de campagne mailing froid sont acceptes par le middleware', () => {
  const coldMailCodes = ['mail-chr', 'mail-ind', 'mail-tert', 'mail-agri', 'mail-log'];
  for (const code of coldMailCodes) {
    assert.ok(
      CAMPAIGNS.includes(code),
      `${code} doit figurer dans CAMPAIGNS`
    );
    const response = call(`https://cabinetms.fr/b2b.html?camp=${code}`);
    assert.equal(campCookie(response), code);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="mailing froid"`
Expected: FAIL — `mail-chr doit figurer dans CAMPAIGNS`

- [ ] **Step 3: Add the 5 codes to `CAMPAIGNS`**

In `middleware.js`, replace:

```javascript
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3',
  // Levier social B2B (docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md)
  'soc-li', 'soc-fb', 'soc-ig', 'soc-x'
];
```

with:

```javascript
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3',
  // Levier social B2B (docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md)
  'soc-li', 'soc-fb', 'soc-ig', 'soc-x',
  // Mailing froid B2B (docs/superpowers/specs/2026-09-09-mailing-froid-b2b-design.md)
  'mail-chr', 'mail-ind', 'mail-tert', 'mail-agri', 'mail-log'
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests pass (existing suite + the new test), no regression.

- [ ] **Step 5: Commit**

```bash
git add middleware.js test/middleware-attribution.test.mjs
git commit -m "feat: add mail-* camp codes for cold mail B2B channel"
```

---

### Task 2: `lib/brevo-cold-outreach.mjs` — pure guardrail and payload logic

**Files:**
- Create: `lib/brevo-cold-outreach.mjs`
- Test: `test/brevo-cold-outreach.test.mjs`

**Interfaces:**
- Consumes: nothing (pure functions, no I/O, no dependency on Task 1's `CAMPAIGNS` at import time — the camp code is passed in as `contact.segment` by the caller).
- Produces (consumed by Task 3):
  - `fillTemplate(template: string, data: Record<string,string>): string`
  - `buildColdEmailPayload(contact: {email, entreprise, type, destinataire?, segment}, opts: {template, subject, senderEmail, senderName}): {sender, to, subject, htmlContent}`
  - `enforceDailyCap(batch: Array, alreadySentToday: number, cap: number): Array`
  - `isBounceRateSafe(blockedToday: number, sentToday: number, thresholdPct: number): boolean`
  - `filterBlockedContacts(batch: Array<{email}>, blockedEmails: string[]): {toSend: Array, skipped: Array}`

- [ ] **Step 1: Write the failing tests**

Create `test/brevo-cold-outreach.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fillTemplate,
  buildColdEmailPayload,
  enforceDailyCap,
  isBounceRateSafe,
  filterBlockedContacts
} from '../lib/brevo-cold-outreach.mjs';

test('fillTemplate remplace tous les tokens connus', () => {
  const result = fillTemplate('{{SALUTATION}} {{ENTREPRISE}}', {
    SALUTATION: 'Bonjour Jean,',
    ENTREPRISE: 'Exemple SARL'
  });
  assert.equal(result, 'Bonjour Jean, Exemple SARL');
});

test('fillTemplate laisse un token inconnu tel quel', () => {
  const result = fillTemplate('{{INCONNU}}', {});
  assert.equal(result, '{{INCONNU}}');
});

test('buildColdEmailPayload utilise le prenom pour un contact nominatif', () => {
  const payload = buildColdEmailPayload(
    {
      email: 'j.dupont@exemple.fr',
      entreprise: 'Exemple SARL',
      type: 'nominatif',
      destinataire: 'Jean Dupont',
      segment: 'ind'
    },
    {
      template: '{{SALUTATION}}|{{ENTREPRISE}}|{{LIEN_FORMULAIRE}}',
      subject: 'Sujet',
      senderEmail: 'prospection@mail.cabinetms.fr',
      senderName: 'M&S Strategy'
    }
  );
  assert.equal(
    payload.htmlContent,
    'Bonjour Jean,|Exemple SARL|https://cabinetms.fr/b2b.html?camp=mail-ind'
  );
  assert.deepEqual(payload.to, [{ email: 'j.dupont@exemple.fr', name: 'Jean Dupont' }]);
});

test('buildColdEmailPayload utilise une salutation generique pour un contact generique', () => {
  const payload = buildColdEmailPayload(
    { email: 'contact@exemple.fr', entreprise: 'Exemple SARL', type: 'generique', segment: 'chr' },
    {
      template: '{{SALUTATION}}',
      subject: 'Sujet',
      senderEmail: 'prospection@mail.cabinetms.fr',
      senderName: 'M&S Strategy'
    }
  );
  assert.equal(payload.htmlContent, 'Bonjour,');
});

test('enforceDailyCap tronque au plafond restant', () => {
  const batch = [1, 2, 3, 4, 5];
  assert.deepEqual(enforceDailyCap(batch, 48, 50), [1, 2]);
});

test('enforceDailyCap renvoie un lot vide si le plafond est deja atteint', () => {
  assert.deepEqual(enforceDailyCap([1, 2, 3], 50, 50), []);
});

test('isBounceRateSafe est vrai sous le seuil', () => {
  assert.equal(isBounceRateSafe(2, 50, 5), true); // 4%
});

test('isBounceRateSafe est faux au-dessus du seuil', () => {
  assert.equal(isBounceRateSafe(3, 50, 5), false); // 6%
});

test('isBounceRateSafe est vrai si rien n_a encore ete envoye', () => {
  assert.equal(isBounceRateSafe(0, 0, 5), true);
});

test('filterBlockedContacts separe les contacts supprimes des autres, insensible a la casse', () => {
  const batch = [
    { email: 'a@exemple.fr' },
    { email: 'B@Exemple.fr' },
    { email: 'c@exemple.fr' }
  ];
  const { toSend, skipped } = filterBlockedContacts(batch, ['b@exemple.fr']);
  assert.deepEqual(toSend.map((c) => c.email), ['a@exemple.fr', 'c@exemple.fr']);
  assert.deepEqual(skipped.map((c) => c.email), ['B@Exemple.fr']);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --test-name-pattern="fillTemplate|buildColdEmailPayload|enforceDailyCap|isBounceRateSafe|filterBlockedContacts"`
Expected: FAIL with "Cannot find module '../lib/brevo-cold-outreach.mjs'"

- [ ] **Step 3: Write the implementation**

Create `lib/brevo-cold-outreach.mjs`:

```javascript
// Fonctions pures : construction du payload Brevo et garde-fous de volume/
// conformite pour le mailing froid B2B. Aucun appel reseau ici — les appels
// reels passent par `composio proxy` (voir scripts/send-cold-batch.mjs), qui
// porte seul la connaissance de comment joindre Brevo.

const TOKEN_PATTERN = /\{\{(\w+)\}\}/g;

// Remplace les tokens {{CLE}} d'un template HTML par les valeurs de `data`.
// Un token sans valeur correspondante est laisse tel quel : mieux vaut un
// token visible dans un envoi de test qu'un champ vide non detecte.
export function fillTemplate(template, data) {
  return template.replace(TOKEN_PATTERN, (match, key) => (
    Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match
  ));
}

// Construit le payload attendu par POST https://api.brevo.com/v3/smtp/email
// pour un contact du lot du jour.
export function buildColdEmailPayload(contact, { template, subject, senderEmail, senderName }) {
  const prenom = contact.type === 'nominatif' && contact.destinataire
    ? contact.destinataire.split(' ')[0]
    : null;

  const htmlContent = fillTemplate(template, {
    SALUTATION: prenom ? `Bonjour ${prenom},` : 'Bonjour,',
    ENTREPRISE: contact.entreprise,
    LIEN_FORMULAIRE: `https://cabinetms.fr/b2b.html?camp=mail-${contact.segment}`
  });

  return {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: contact.email, name: contact.destinataire || contact.entreprise }],
    subject,
    htmlContent
  };
}

// Tronque le lot du jour au plafond restant (cap - dejaEnvoyesAujourdhui).
// Ne renvoie jamais plus que ce qui peut encore etre envoye aujourd'hui.
export function enforceDailyCap(batch, alreadySentToday, cap) {
  const remaining = Math.max(0, cap - alreadySentToday);
  return batch.slice(0, remaining);
}

// true si le taux de blocage/bounce du jour reste sous le seuil (defaut 5%).
// sentToday = 0 est considere sur (rien envoye, rien a mesurer).
export function isBounceRateSafe(blockedToday, sentToday, thresholdPct = 5) {
  if (sentToday === 0) return true;
  return (blockedToday / sentToday) * 100 <= thresholdPct;
}

// Retire du lot les contacts deja presents dans la liste de suppression
// Brevo (desinscrits, hard bounce, plaintes spam), comparaison insensible a
// la casse.
export function filterBlockedContacts(batch, blockedEmails) {
  const blocked = new Set(blockedEmails.map((e) => e.toLowerCase()));
  const toSend = [];
  const skipped = [];
  for (const contact of batch) {
    if (blocked.has(contact.email.toLowerCase())) {
      skipped.push(contact);
    } else {
      toSend.push(contact);
    }
  }
  return { toSend, skipped };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern="fillTemplate|buildColdEmailPayload|enforceDailyCap|isBounceRateSafe|filterBlockedContacts"`
Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/brevo-cold-outreach.mjs test/brevo-cold-outreach.test.mjs
git commit -m "feat: add pure guardrail/payload logic for cold mail B2B"
```

---

### Task 3: `scripts/send-cold-batch.mjs` — CLI wrapper calling Brevo through Composio

**Files:**
- Create: `scripts/send-cold-batch.mjs`
- Test: `test/send-cold-batch.test.mjs`

**Interfaces:**
- Consumes: `buildColdEmailPayload`, `enforceDailyCap`, `isBounceRateSafe`, `filterBlockedContacts` from `lib/brevo-cold-outreach.mjs` (Task 2); reads `content/cold-mail-b2b/template.html` (Task 4) at runtime via `TEMPLATE_PATH`.
- Produces: exports `runColdBatch({batch, template, alreadySentToday, execCli?, cap?, thresholdPct?, delayMs?, sleepFn?}): {sent: string[], skippedBlocked: string[], skippedCap: string[], aborted: boolean, reason?: string}`, `SENDER_EMAIL`, `SENDER_NAME`, `DAILY_CAP`, `BOUNCE_THRESHOLD_PCT`, `SEND_DELAY_MS` — consumed by the runbook (Task 6), which invokes this script's CLI entrypoint.

- [ ] **Step 1: Write the failing tests**

Create `test/send-cold-batch.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runColdBatch, SENDER_EMAIL, SENDER_NAME } from '../scripts/send-cold-batch.mjs';

const TEMPLATE = '{{SALUTATION}} {{ENTREPRISE}} {{LIEN_FORMULAIRE}}';

// Simule la CLI composio sans reseau : enregistre chaque appel, repond aux
// deux formes utilisees par le script (blockedContacts, envoi d'un email).
function makeExecCli({ blockedEmails = [] } = {}) {
  const calls = [];
  const execCli = (args) => {
    calls.push(args);
    if (args[0] === 'proxy' && args[1].includes('/blockedContacts')) {
      return { contacts: blockedEmails.map((email) => ({ email })) };
    }
    if (args[0] === 'proxy' && args[1] === 'https://api.brevo.com/v3/smtp/email') {
      return { messageId: 'test-message-id' };
    }
    throw new Error(`appel composio inattendu: ${args.join(' ')}`);
  };
  execCli.calls = calls;
  return execCli;
}

test('envoie tous les contacts du lot quand rien n_est bloque', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A SARL', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B SARL', type: 'generique', segment: 'chr' }
  ];
  const result = runColdBatch({ batch, template: TEMPLATE, alreadySentToday: 0, execCli, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr', 'b@exemple.fr']);
  assert.equal(result.aborted, false);
});

test('retire du lot un contact deja sur la liste de suppression Brevo', () => {
  const execCli = makeExecCli({ blockedEmails: ['b@exemple.fr'] });
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A SARL', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B SARL', type: 'generique', segment: 'chr' }
  ];
  const result = runColdBatch({ batch, template: TEMPLATE, alreadySentToday: 0, execCli, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr']);
  assert.deepEqual(result.skippedBlocked, ['b@exemple.fr']);
});

test('n_envoie jamais plus que le plafond restant', () => {
  const execCli = makeExecCli();
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B', type: 'generique', segment: 'ind' },
    { email: 'c@exemple.fr', entreprise: 'C', type: 'generique', segment: 'ind' }
  ];
  const result = runColdBatch({ batch, template: TEMPLATE, alreadySentToday: 0, execCli, cap: 2, sleepFn: () => {} });
  assert.deepEqual(result.sent, ['a@exemple.fr', 'b@exemple.fr']);
  assert.deepEqual(result.skippedCap, ['c@exemple.fr']);
});

test('abandonne sans rien envoyer si le taux de bounce du jour depasse le seuil', () => {
  const execCli = makeExecCli({ blockedEmails: ['x1@e.fr', 'x2@e.fr', 'x3@e.fr'] });
  const batch = [{ email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' }];
  // 3 bloques / 50 deja envoyes = 6% > seuil 5%
  const result = runColdBatch({ batch, template: TEMPLATE, alreadySentToday: 50, execCli, thresholdPct: 5 });
  assert.equal(result.aborted, true);
  assert.equal(result.reason, 'bounce_rate');
  assert.deepEqual(result.sent, []);
  const sendCalls = execCli.calls.filter((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  assert.equal(sendCalls.length, 0);
});

test('le payload envoye porte le bon expediteur et le bon lien de campagne', () => {
  const execCli = makeExecCli();
  const batch = [{
    email: 'a@exemple.fr',
    entreprise: 'A SARL',
    type: 'nominatif',
    destinataire: 'Jean Dupont',
    segment: 'tert'
  }];
  runColdBatch({
    batch,
    template: '{{SALUTATION}}{{LIEN_FORMULAIRE}}',
    alreadySentToday: 0,
    execCli,
    sleepFn: () => {}
  });
  const sendCall = execCli.calls.find((c) => c[1] === 'https://api.brevo.com/v3/smtp/email');
  const payload = JSON.parse(sendCall[sendCall.indexOf('-d') + 1]);
  assert.equal(payload.sender.email, SENDER_EMAIL);
  assert.equal(payload.sender.name, SENDER_NAME);
  assert.match(payload.htmlContent, /camp=mail-tert/);
});

test('espace les envois d_un delai entre chaque email du lot', () => {
  const execCli = makeExecCli();
  const sleeps = [];
  const batch = [
    { email: 'a@exemple.fr', entreprise: 'A', type: 'generique', segment: 'ind' },
    { email: 'b@exemple.fr', entreprise: 'B', type: 'generique', segment: 'ind' },
    { email: 'c@exemple.fr', entreprise: 'C', type: 'generique', segment: 'ind' }
  ];
  runColdBatch({
    batch,
    template: TEMPLATE,
    alreadySentToday: 0,
    execCli,
    delayMs: 3000,
    sleepFn: (ms) => sleeps.push(ms)
  });
  // Un delai apres chaque envoi sauf le dernier : 2 delais pour 3 envois.
  assert.deepEqual(sleeps, [3000, 3000]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --test-name-pattern="lot|plafond|bounce|expediteur"`
Expected: FAIL with "Cannot find module '../scripts/send-cold-batch.mjs'"

- [ ] **Step 3: Write the implementation**

Create `scripts/send-cold-batch.mjs`:

```javascript
#!/usr/bin/env node
// Envoie le lot du jour de mailing froid B2B via Brevo, a travers la CLI
// `composio` (le compte Brevo connecte porte la cle API — jamais lue ici).
//
// Usage : node scripts/send-cold-batch.mjs <batch.json> [alreadySentToday]
//
// batch.json : tableau de contacts deja domicilies, dedoublonnes et valides
// manuellement (voir docs/cold-mail-runbook.md) :
//   [{ "email": "...", "entreprise": "...", "type": "nominatif|generique",
//      "destinataire": "Jean Dupont", "segment": "chr|ind|tert|agri|log" }]
//
// Imprime sur stdout un resume JSON { sent, skippedBlocked, skippedCap,
// aborted, reason? } pour que l'operateur (ou l'agent qui a lance ce
// script) reporte le resultat dans le Google Sheet de suivi.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  buildColdEmailPayload,
  enforceDailyCap,
  isBounceRateSafe,
  filterBlockedContacts
} from '../lib/brevo-cold-outreach.mjs';

export const DAILY_CAP = 50;
export const BOUNCE_THRESHOLD_PCT = 5;
export const SEND_DELAY_MS = 3000;
export const SENDER_EMAIL = 'prospection@mail.cabinetms.fr';
export const SENDER_NAME = 'M&S Strategy';
export const SUBJECT = "Votre facture d'énergie, mise en concurrence gratuite";
export const TEMPLATE_PATH = new URL('../content/cold-mail-b2b/template.html', import.meta.url);

// Wrapper injectable autour de la CLI composio, pour rester testable sans
// reseau (voir test/send-cold-batch.test.mjs). Chaque appel renvoie le JSON
// parse de la sortie de la commande.
function defaultExecCli(args) {
  const output = execFileSync('composio', args, { encoding: 'utf8' });
  return JSON.parse(output);
}

// Pause synchrone bloquante — evite d'envoyer en rafale (garde-fou du
// design). Synchrone plutot qu'async pour rester simple a appeler dans une
// boucle for classique aux cotes de execFileSync, lui-meme synchrone.
function defaultSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Recupere les emails bloques aujourd'hui (desinscrits/bounce/spam) via la
// liste de suppression Brevo, a travers le compte connecte Composio.
function fetchBlockedToday(execCli) {
  const today = new Date().toISOString().slice(0, 10);
  const result = execCli([
    'proxy',
    `https://api.brevo.com/v3/smtp/blockedContacts?startDate=${today}&endDate=${today}`,
    '--toolkit', 'brevo',
    '-X', 'GET'
  ]);
  return (result.contacts || []).map((c) => c.email);
}

function sendOne(execCli, payload) {
  return execCli([
    'proxy',
    'https://api.brevo.com/v3/smtp/email',
    '--toolkit', 'brevo',
    '-X', 'POST',
    '-d', JSON.stringify(payload)
  ]);
}

// Coeur testable : etant donne un lot deja valide, decide qui recoit un
// email et l'envoie. `execCli` est injecte pour les tests (pas d'appel
// reseau reel dans test/send-cold-batch.test.mjs).
export function runColdBatch({
  batch,
  template,
  alreadySentToday,
  execCli = defaultExecCli,
  cap = DAILY_CAP,
  thresholdPct = BOUNCE_THRESHOLD_PCT,
  delayMs = SEND_DELAY_MS,
  sleepFn = defaultSleep
}) {
  const blockedToday = fetchBlockedToday(execCli);

  if (!isBounceRateSafe(blockedToday.length, alreadySentToday, thresholdPct)) {
    return { sent: [], skippedBlocked: [], skippedCap: [], aborted: true, reason: 'bounce_rate' };
  }

  const { toSend, skipped: skippedBlocked } = filterBlockedContacts(batch, blockedToday);
  const capped = enforceDailyCap(toSend, alreadySentToday, cap);
  const skippedCap = toSend.slice(capped.length);

  const sent = [];
  capped.forEach((contact, index) => {
    const payload = buildColdEmailPayload(contact, {
      template,
      subject: SUBJECT,
      senderEmail: SENDER_EMAIL,
      senderName: SENDER_NAME
    });
    sendOne(execCli, payload);
    sent.push(contact.email);
    // Pas de delai apres le dernier envoi : rien a espacer derriere.
    if (index < capped.length - 1) {
      sleepFn(delayMs);
    }
  });

  return {
    sent,
    skippedBlocked: skippedBlocked.map((c) => c.email),
    skippedCap: skippedCap.map((c) => c.email),
    aborted: false
  };
}

function main() {
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error('Usage: node scripts/send-cold-batch.mjs <batch.json> [alreadySentToday]');
    process.exit(1);
  }
  const alreadySentToday = Number(process.argv[3] || 0);
  const batch = JSON.parse(readFileSync(batchPath, 'utf8'));
  const template = readFileSync(TEMPLATE_PATH, 'utf8');

  const result = runColdBatch({ batch, template, alreadySentToday });
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern="lot|plafond|bounce|expediteur|espace"`
Expected: PASS (6 tests)

- [ ] **Step 5: Run full suite to check for regressions**

Run: `npm test`
Expected: all tests pass (existing suite + Tasks 1-3 additions).

- [ ] **Step 6: Commit**

```bash
git add scripts/send-cold-batch.mjs test/send-cold-batch.test.mjs
git commit -m "feat: add send-cold-batch script calling Brevo via composio proxy"
```

---

### Task 4: Email template (content)

**Files:**
- Create: `content/cold-mail-b2b/template.html`

**Interfaces:**
- Consumes: nothing (static HTML file with `{{SALUTATION}}`, `{{ENTREPRISE}}`, `{{LIEN_FORMULAIRE}}` tokens).
- Produces: read at runtime by `scripts/send-cold-batch.mjs` (Task 3) via `TEMPLATE_PATH`; tokens must match exactly the keys `fillTemplate()` fills in `buildColdEmailPayload()` (Task 2) — `SALUTATION`, `ENTREPRISE`, `LIEN_FORMULAIRE`.

- [ ] **Step 1: Write the template**

Create `content/cold-mail-b2b/template.html`:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ENTREPRISE}} — votre facture d'énergie</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;">
<tr><td>

<p style="margin:0 0 16px;font-size:15px;line-height:1.5;">{{SALUTATION}}</p>

<p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
Chez M&amp;S Strategy, cabinet de courtage en énergie indépendant, nous mettons
en concurrence gratuitement les offres gaz et électricité des entreprises
comme {{ENTREPRISE}} — sans engagement, sans coupure de service.
</p>

<p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
Transmettez-nous votre dernière facture&nbsp;: nous vous disons sous 24 à
48h s'il existe une offre plus avantageuse pour {{ENTREPRISE}}.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background:#0a5c4a;border-radius:6px;">
<a href="{{LIEN_FORMULAIRE}}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">Transmettre ma facture</a>
</td></tr>
</table>

<p style="margin:0 0 24px;font-size:15px;line-height:1.5;">
Cordialement,<br>
L'équipe M&amp;S Strategy
</p>

<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;">

<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#666666;">
M&amp;S Strategy (nom commercial), SAS au capital de 50&nbsp;000&nbsp;€, SIREN
752 139 477, RCS Montpellier — 1366 Av. des Platanes, 34970 Lattes, France.
Cabinet de courtage en énergie indépendant.
</p>

<p style="margin:0;font-size:12px;line-height:1.5;color:#666666;">
Vous recevez cet email car l'activité de {{ENTREPRISE}} est concernée par la
gestion de ses contrats d'énergie professionnels. Pour ne plus recevoir nos
emails, répondez STOP à ce message ou
<a href="mailto:prospection@mail.cabinetms.fr?subject=STOP" style="color:#666666;">cliquez ici</a>.
</p>

</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

- [ ] **Step 2: Verify the three tokens are present exactly once each in the right places**

Run: `grep -o '{{[A-Z_]*}}' "content/cold-mail-b2b/template.html" | sort | uniq -c`
Expected:
```
   1 {{ENTREPRISE}}
   1 {{ENTREPRISE}}
   1 {{LIEN_FORMULAIRE}}
   1 {{SALUTATION}}
```
(Note: `{{ENTREPRISE}}` legitimately appears twice in the body copy — `title` and the paragraph — both are filled by the same value, this is expected.)

- [ ] **Step 3: Commit**

```bash
git add content/cold-mail-b2b/template.html
git commit -m "content: add cold mail B2B email template with CNIL footer"
```

---

### Task 5: Document the new camp codes in `docs/attribution-commerciaux.md`

**Files:**
- Modify: `docs/attribution-commerciaux.md` (the "Suivi de campagne (camp)" section, after the "Depuis le levier social B2B..." paragraph, currently ending around line 136)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by code — pure documentation, read by future sessions per this project's convention (every camp-code family added so far — `chr/ind/tert`, `soc-*` — is documented here).

- [ ] **Step 1: Add the paragraph**

In `docs/attribution-commerciaux.md`, immediately after the paragraph ending `Même mécanique dernier-touch que les codes *-e<n> du cold outreach.` (the one documenting `soc-li`/`soc-fb`/`soc-ig`/`soc-x`), insert:

```markdown
Depuis le mailing froid B2B
([spec](superpowers/specs/2026-09-09-mailing-froid-b2b-design.md)),
`CAMPAIGNS` contient aussi 5 codes préfixés `mail-` — `mail-chr`, `mail-ind`,
`mail-tert` (mêmes segments que le cold outreach Waalaxy ci-dessus) et
`mail-agri`, `mail-log` (secteurs agriculture/logistique du positionnement
"cabinet d'expertise énergie" du 2026-08-03). Même mécanique dernier-touch.
Contrairement au cold outreach Waalaxy et au levier social, ce canal envoie
depuis `prospection@mail.cabinetms.fr` via Brevo (compte connecté à
Composio, jamais de clé API dans ce repo) — opt-out par réponse "STOP",
identique au mécanisme déjà en place pour la séquence Waalaxy.
```

- [ ] **Step 2: Commit**

```bash
git add docs/attribution-commerciaux.md
git commit -m "docs: document the mail-* camp codes for cold mail B2B"
```

---

### Task 6: Operational runbook for the daily sourcing/enrichment/validation cycle

**Files:**
- Create: `docs/cold-mail-runbook.md`

**Interfaces:**
- Consumes: `scripts/send-cold-batch.mjs` (Task 3, invoked as `node scripts/send-cold-batch.mjs <batch.json> <alreadySentToday>`); the Google Sheet created per Step 1 below.
- Produces: nothing consumed by code — this is the precise, no-placeholder procedure the daily scheduled session (`/schedule`) follows. It is documentation, not TDD-able code, because company sourcing and site-scraping require reading judgment.

- [ ] **Step 1: Create the tracking Google Sheet**

One-time setup (not repeated daily). Run:

```bash
composio execute "GOOGLESHEETS_CREATE_GOOGLE_SHEET1" -d '{"title":"Mailing froid B2B — suivi"}'
```

Capture the returned `spreadsheetId`. Write it into `docs/cold-mail-runbook.md` (Step 3 below) once known — until then leave the placeholder `<SPREADSHEET_ID>` in the doc and note in the commit message that it must be filled in after this one-time step runs.

Then set the header row (columns match `docs/superpowers/specs/2026-09-09-mailing-froid-b2b-design.md`'s "Dédoublonnage & suivi" section):

```bash
composio execute "GOOGLESHEETS_VALUES_UPDATE" -d '{
  "spreadsheet_id": "<SPREADSHEET_ID>",
  "range": "A1:H1",
  "value_input_option": "RAW",
  "values": [["entreprise","siren","segment","email","type","confiance","statut","date_envoi"]]
}'
```

- [ ] **Step 2: Write the runbook**

Create `docs/cold-mail-runbook.md`:

```markdown
# Runbook — mailing froid B2B (cycle quotidien)

Procédure suivie par la session planifiée (`/schedule`) pour un cycle. Cf.
`docs/superpowers/specs/2026-09-09-mailing-froid-b2b-design.md` pour le
design complet ; ce document décrit uniquement le déroulé opérationnel.

Google Sheet de suivi : `<SPREADSHEET_ID>` (créé via l'étape 1 de
`docs/superpowers/plans/2026-09-09-mailing-froid-b2b.md`, Task 6).

## 1. Sourcing (un des 5 segments, en rotation)

Segments et sections NAF associées :

| Segment | Libellé | Section(s) NAF |
|---|---|---|
| `chr` | Hôtellerie-restauration | I |
| `ind` | Industrie / production | C |
| `tert` | Tertiaire (écoles, associations, santé/EHPAD) | P, Q, S |
| `agri` | Agriculture | A |
| `log` | Logistique | H |

Appel (exemple pour `ind`, PME/ETI 10 à 999 salariés) :

```bash
curl -s "https://recherche-entreprises.api.gouv.fr/search?section_activite_principale=C&tranche_effectif_salarie=11,12,21,22,31,32,41&per_page=25&page=1"
```

Pas de clé API requise (service public gratuit, confirmé en session le
2026-09-09). Tourner sur les pages suivantes (`page=2`, etc.) et les 5
segments au fil des cycles plutôt que de tout épuiser en un jour.

Pour chaque résultat, retenir : `nom_complet`, `siren`, le premier élément
de `dirigeants` (`nom`, `prenoms`, `qualite`) si présent, l'adresse du
`siege`.

## 2. Enrichissement (site + cascade email)

Pour chaque entreprise retenue à l'étape 1 :

1. Chercher son site officiel (recherche web — nom + ville + "site officiel").
   Aucun candidat fiable → passer à l'entreprise suivante (pas d'email
   générique deviné sans site confirmé).
2. Lire la page contact / mentions légales / équipe du site trouvé.
3. **Cascade** (jamais de pure supposition) :
   - Un email nominatif est **visible** sur la page (ex. une signature,
     un annuaire équipe) et son format est clair → si le nom du dirigeant
     Pappers/gouv.fr correspond à quelqu'un de l'entreprise, appliquer le
     même format à son nom → `type: "nominatif"`, `destinataire` = nom
     complet du dirigeant.
   - Sinon, une adresse de rôle est visible (`contact@`, `direction@`,
     `commercial@`) → `type: "generique"`, pas de `destinataire`.
   - Ni l'un ni l'autre → exclure l'entreprise de ce cycle.

## 3. Dédoublonnage

Avant d'ajouter une ligne, lire les lignes existantes du Sheet
(`composio execute "GOOGLESHEETS_VALUES_GET" -d '{"spreadsheet_id":"<SPREADSHEET_ID>","range":"D:D"}'`)
et exclure tout email déjà présent, quel que soit son statut.

## 4. Écriture du lot du jour

Ajouter les nouvelles lignes avec `statut: "à valider"` et `date_envoi`
vide :

```bash
composio execute "GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND" -d '{
  "spreadsheet_id": "<SPREADSHEET_ID>",
  "range": "A:H",
  "value_input_option": "RAW",
  "values": [["Exemple SARL","123456789","ind","contact@exemple.fr","generique","haute","à valider",""]]
}'
```

Objectif : 30 à 50 lignes prêtes à valider par cycle (le plafond d'envoi
réel de 50/jour est de toute façon appliqué par `scripts/send-cold-batch.mjs`,
donc un lot légèrement plus grand n'est pas un problème — le surplus attend
le lendemain).

## 5. Validation manuelle

Le lot du jour est présenté à l'utilisateur (lien vers le Sheet, ou liste
des lignes `à valider` dans le message de fin de cycle). Aucun envoi tant
que l'utilisateur n'a pas répondu. Sur validation :

1. Relire le Sheet, filtrer les lignes `statut = "validé"`.
2. Construire `batch.json` à partir de ces lignes exactement dans le format
   attendu par `runColdBatch()` :

```json
[
  {"email": "contact@exemple.fr", "entreprise": "Exemple SARL", "type": "generique", "segment": "ind"}
]
```

(`destinataire` ajouté seulement si `type` = `"nominatif"`.)

## 6. Envoi

```bash
node scripts/send-cold-batch.mjs batch.json <alreadySentToday>
```

`<alreadySentToday>` = nombre de lignes du Sheet dont `date_envoi` = date du
jour, avant cet appel (0 en début de journée).

Le script imprime un JSON `{sent, skippedBlocked, skippedCap, aborted,
reason?}`. Si `aborted: true` (`reason: "bounce_rate"`), **ne pas relancer
dans la journée** — signaler à l'utilisateur et attendre une revue manuelle
avant le cycle suivant (garde-fou du design).

## 7. Mise à jour du Sheet

Pour chaque email dans `sent`, mettre à jour sa ligne : `statut = "envoyé"`,
`date_envoi` = date du jour. Pour chaque email dans `skippedBlocked`,
`statut = "supprimé (Brevo)"`. Pour chaque email dans `skippedCap`,
`statut` reste `"validé"` (repris au cycle suivant).

## 8. Suivi des réponses STOP

À vérifier à chaque cycle (boîte `prospection@mail.cabinetms.fr`) : toute
réponse contenant "STOP" (texte ou objet, cf. le lien `mailto:` du
template) → ajouter l'adresse à la liste de suppression Brevo
(`composio execute "BREVO_DELETE_CONTACT" -d '{"identifier":"<email>"}'`)
et marquer la ligne correspondante du Sheet `statut = "désinscrit"`.
```

- [ ] **Step 3: Run the one-time setup from Step 1, fill in the real `<SPREADSHEET_ID>` in the runbook**

Execute the two `composio execute` commands from Step 1. Replace every `<SPREADSHEET_ID>` placeholder in `docs/cold-mail-runbook.md` with the real value returned.

- [ ] **Step 4: Commit**

```bash
git add docs/cold-mail-runbook.md
git commit -m "docs: add daily operational runbook for cold mail B2B"
```
