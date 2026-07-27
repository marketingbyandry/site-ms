# Baromètre M&S Strategy des prix de l'énergie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a free, self-updating electricity/gas price indicator ("Baromètre M&S Strategy") plus 7 retrospective articles, all driving traffic toward the existing Tally lead-capture form — per `docs/superpowers/specs/2026-07-27-barometre-energie-design.md`.

**Architecture:** A GitHub Actions monthly cron job fetches real day-ahead electricity prices from the ENTSO-E Transparency Platform API, computes a monthly average, and opens a PR updating a committed JSON data file (`data/barometre-electricite.json`). Gas prices are recorded manually into a second JSON file (`data/barometre-gaz.json`) following a documented quarterly checklist. A new static page (`barometre-energie.html`) reads both JSON files client-side via `fetch()` and renders the indicators plus a CTA to the existing Tally form. Seven retrospective blog articles (annual 2022–2025, quarterly T1–T3 2026) are authored from a shared template, each published at its real writing date (never backdated).

**Tech Stack:** Static HTML/CSS/vanilla JS (existing site stack), Node.js ESM scripts (no framework), GitHub Actions (cron + PR automation), `fast-xml-parser` (npm, CI-only dependency), Node's built-in `node:test` runner (no new test framework needed).

## Global Constraints

- No paywall, no email gate anywhere on the Baromètre — access stays 100% free (spec, "Capture de contact").
- No segmentation by region/sector/company size in this V1 — national figures only (spec, "Segmentation").
- CTA points to the existing Tally form on `b2b.html`/`b2c.html` ("Transmettre ma facture") — do not create a new form.
- Every retrospective article's `datePublished` (visible text and JSON-LD) must equal its actual authoring date. Never backdate. Each article must state in its own text which historical period it analyzes (spec, "Règle anti-antidatation").
- CSP in `vercel.json` already allows same-origin `connect-src 'self'` — client-side `fetch()` of `/data/*.json` needs no CSP change. Do not add ENTSO-E's domain to CSP: the API call happens in CI, never in the browser.

## Architecture Note — resolving an open point from the spec

The spec proposed "a Vercel serverless function + Vercel Cron" writing the JSON file. That doesn't work as described: Vercel's serverless functions run against an ephemeral, per-invocation filesystem — they cannot durably write back into the git-tracked static site. This plan resolves it with a **GitHub Actions scheduled workflow** instead: it runs `node scripts/update-barometre-electricite.mjs`, which calls the ENTSO-E API and updates the committed JSON file, then opens a PR (not an auto-merge) so a bad API response or parsing bug is caught by human review before the number goes live — consistent with how every other change in this project ships (draft PR, review, merge). This also gives the Baromètre a public git history of every update, which is itself a credibility/anti-antidating signal.

---

### Task 1: ENTSO-E fetch/parse library with tests

**Files:**
- Create: `lib/entsoe.mjs`
- Test: `test/entsoe.test.mjs`
- Test fixture: `test/fixtures/entsoe-day-ahead-sample.xml`

**Interfaces:**
- Produces: `parseDayAheadPrices(xmlText: string) => Array<{ start: Date, priceEurPerMWh: number }>` and `averagePriceEurPerMWh(prices: Array<{priceEurPerMWh: number}>) => number`, both consumed by Task 2's CLI script.

- [ ] **Step 0: Get real API access and verify the response shape before trusting any parser**

  The ENTSO-E Transparency Platform requires a free security token. Register at
  `https://transparency.entsoe.eu`, request API access (their site documents the
  process — it currently requires emailing their support to activate the "Web
  API" scope on your account once registered), then make one real request:

  ```bash
  curl "https://web-api.tp.entsoe.eu/api?securityToken=$ENTSOE_API_TOKEN&documentType=A44&in_Domain=10YFR-RTE------C&out_Domain=10YFR-RTE------C&periodStart=202607010000&periodEnd=202607020000" \
    -o test/fixtures/entsoe-day-ahead-sample.xml
  ```

  `10YFR-RTE------C` is ENTSO-E's EIC bidding-zone code for France and `A44` is
  their "Price Document" document type — cross-check both against ENTSO-E's
  published EIC code list and API user guide, since this plan is written
  without a live sample in hand. If the actual XML structure differs from
  Step 1's fixture below, **update the fixture and the parser to match the
  real response** before moving on — do not ship a parser validated only
  against a guessed structure.

- [ ] **Step 1: Write the failing test against the (possibly-corrected) fixture**

  If Step 0 confirms the structure below, use it as-is in
  `test/fixtures/entsoe-day-ahead-sample.xml`:

  ```xml
  <Publication_MarketDocument>
    <TimeSeries>
      <Period>
        <timeInterval>
          <start>2026-07-01T00:00Z</start>
          <end>2026-07-01T02:00Z</end>
        </timeInterval>
        <resolution>PT60M</resolution>
        <Point>
          <position>1</position>
          <price.amount>58.42</price.amount>
        </Point>
        <Point>
          <position>2</position>
          <price.amount>61.10</price.amount>
        </Point>
      </Period>
    </TimeSeries>
  </Publication_MarketDocument>
  ```

  ```javascript
  // test/entsoe.test.mjs
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { readFileSync } from 'node:fs';
  import { parseDayAheadPrices, averagePriceEurPerMWh } from '../lib/entsoe.mjs';

  test('parseDayAheadPrices extracts hourly points with computed timestamps', () => {
    const xml = readFileSync('test/fixtures/entsoe-day-ahead-sample.xml', 'utf8');
    const prices = parseDayAheadPrices(xml);
    assert.equal(prices.length, 2);
    assert.equal(prices[0].priceEurPerMWh, 58.42);
    assert.equal(prices[0].start.toISOString(), '2026-07-01T00:00:00.000Z');
    assert.equal(prices[1].start.toISOString(), '2026-07-01T01:00:00.000Z');
  });

  test('averagePriceEurPerMWh computes the mean', () => {
    const avg = averagePriceEurPerMWh([{ priceEurPerMWh: 58.42 }, { priceEurPerMWh: 61.10 }]);
    assert.equal(avg, 59.76);
  });
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `node --test test/entsoe.test.mjs`
  Expected: FAIL with `Cannot find module '../lib/entsoe.mjs'`

- [ ] **Step 3: Implement `lib/entsoe.mjs`**

  ```javascript
  // lib/entsoe.mjs
  import { XMLParser } from 'fast-xml-parser';

  const parser = new XMLParser({ ignoreAttributes: false });

  export function parseDayAheadPrices(xmlText) {
    const doc = parser.parse(xmlText);
    const timeSeries = doc.Publication_MarketDocument.TimeSeries;
    const series = Array.isArray(timeSeries) ? timeSeries : [timeSeries];
    const prices = [];

    for (const ts of series) {
      const periods = Array.isArray(ts.Period) ? ts.Period : [ts.Period];
      for (const period of periods) {
        const start = new Date(period.timeInterval.start);
        const resolutionMinutes = period.resolution === 'PT60M' ? 60 : 15;
        const points = Array.isArray(period.Point) ? period.Point : [period.Point];
        for (const point of points) {
          const position = Number(point.position);
          const offsetMs = (position - 1) * resolutionMinutes * 60 * 1000;
          prices.push({
            start: new Date(start.getTime() + offsetMs),
            priceEurPerMWh: Number(point['price.amount']),
          });
        }
      }
    }

    return prices.sort((a, b) => a.start - b.start);
  }

  export function averagePriceEurPerMWh(prices) {
    const sum = prices.reduce((acc, p) => acc + p.priceEurPerMWh, 0);
    return Math.round((sum / prices.length) * 100) / 100;
  }
  ```

- [ ] **Step 4: Run the test to verify it passes**

  Run: `node --test test/entsoe.test.mjs`
  Expected: PASS (2 tests)

- [ ] **Step 5: Add `fast-xml-parser` as a dependency and commit**

  ```bash
  npm install fast-xml-parser
  git add lib/entsoe.mjs test/entsoe.test.mjs test/fixtures/entsoe-day-ahead-sample.xml package.json package-lock.json
  git commit -m "feat: add ENTSO-E day-ahead price parser with tests"
  ```

---

### Task 2: CLI script to fetch and record the monthly electricity average

**Files:**
- Create: `scripts/update-barometre-electricite.mjs`
- Create: `data/barometre-electricite.json`
- Test: `test/update-barometre-electricite.test.mjs`

**Interfaces:**
- Consumes: `parseDayAheadPrices`, `averagePriceEurPerMWh` from `lib/entsoe.mjs` (Task 1).
- Produces: `data/barometre-electricite.json` with shape
  `{ "monthly": [ { "period": "2026-06", "avgPriceEurPerMWh": 59.76, "source": "ENTSO-E Transparency Platform", "fetchedAt": "2026-07-01T06:00:00.000Z" } ] }`,
  consumed by Task 5's page/JS and by Tasks 8–14's historical lookups.
- Produces: `upsertMonthlyEntry(existingData, newEntry) => updatedData`, unit-tested in isolation from network/fs.

- [ ] **Step 1: Write the failing test for the pure merge logic**

  ```javascript
  // test/update-barometre-electricite.test.mjs
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { upsertMonthlyEntry } from '../scripts/update-barometre-electricite.mjs';

  test('upsertMonthlyEntry inserts a new period', () => {
    const existing = { monthly: [{ period: '2026-05', avgPriceEurPerMWh: 55 }] };
    const updated = upsertMonthlyEntry(existing, { period: '2026-06', avgPriceEurPerMWh: 59.76 });
    assert.equal(updated.monthly.length, 2);
    assert.equal(updated.monthly[1].period, '2026-06');
  });

  test('upsertMonthlyEntry replaces an existing period instead of duplicating it', () => {
    const existing = { monthly: [{ period: '2026-06', avgPriceEurPerMWh: 59.76 }] };
    const updated = upsertMonthlyEntry(existing, { period: '2026-06', avgPriceEurPerMWh: 60.10 });
    assert.equal(updated.monthly.length, 1);
    assert.equal(updated.monthly[0].avgPriceEurPerMWh, 60.10);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `node --test test/update-barometre-electricite.test.mjs`
  Expected: FAIL with `Cannot find module '../scripts/update-barometre-electricite.mjs'`

- [ ] **Step 3: Implement the script**

  ```javascript
  // scripts/update-barometre-electricite.mjs
  import { readFileSync, writeFileSync, existsSync } from 'node:fs';
  import { parseDayAheadPrices, averagePriceEurPerMWh } from '../lib/entsoe.mjs';

  const DATA_PATH = new URL('../data/barometre-electricite.json', import.meta.url);
  const FRANCE_EIC = '10YFR-RTE------C';

  export function upsertMonthlyEntry(existingData, newEntry) {
    const monthly = existingData.monthly.filter((e) => e.period !== newEntry.period);
    monthly.push(newEntry);
    monthly.sort((a, b) => a.period.localeCompare(b.period));
    return { monthly };
  }

  function formatEntsoeTimestamp(date) {
    return date.toISOString().replace(/[-:]/g, '').slice(0, 12);
  }

  export async function fetchMonthlyAverage(periodStart, periodEnd, token) {
    const url = `https://web-api.tp.entsoe.eu/api?securityToken=${token}` +
      `&documentType=A44&in_Domain=${FRANCE_EIC}&out_Domain=${FRANCE_EIC}` +
      `&periodStart=${formatEntsoeTimestamp(periodStart)}&periodEnd=${formatEntsoeTimestamp(periodEnd)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ENTSO-E request failed: ${response.status}`);
    }
    const xml = await response.text();
    return averagePriceEurPerMWh(parseDayAheadPrices(xml));
  }

  async function main() {
    const token = process.env.ENTSOE_API_TOKEN;
    if (!token) throw new Error('ENTSOE_API_TOKEN environment variable is required');

    const [startArg, endArg] = process.argv.slice(2);
    const now = new Date();
    const periodStart = startArg ? new Date(startArg) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const periodEnd = endArg ? new Date(endArg) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const period = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}`;

    const avgPriceEurPerMWh = await fetchMonthlyAverage(periodStart, periodEnd, token);

    const existingData = existsSync(DATA_PATH)
      ? JSON.parse(readFileSync(DATA_PATH, 'utf8'))
      : { monthly: [] };

    const updated = upsertMonthlyEntry(existingData, {
      period,
      avgPriceEurPerMWh,
      source: 'ENTSO-E Transparency Platform',
      fetchedAt: new Date().toISOString(),
    });

    writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n');
    console.log(`Recorded ${period}: ${avgPriceEurPerMWh} EUR/MWh`);
  }

  if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => { console.error(err); process.exit(1); });
  }
  ```

- [ ] **Step 4: Run test to verify it passes**

  Run: `node --test test/update-barometre-electricite.test.mjs`
  Expected: PASS (2 tests)

- [ ] **Step 5: Seed the data file with an empty structure and commit**

  ```bash
  echo '{ "monthly": [] }' > data/barometre-electricite.json
  git add scripts/update-barometre-electricite.mjs test/update-barometre-electricite.test.mjs data/barometre-electricite.json
  git commit -m "feat: add CLI script to fetch and record monthly electricity average"
  ```

---

### Task 3: Monthly GitHub Actions workflow (PR-gated, never auto-merged)

**Files:**
- Create: `.github/workflows/barometre-electricite-update.yml`

**Interfaces:**
- Consumes: `scripts/update-barometre-electricite.mjs` (Task 2), the `ENTSOE_API_TOKEN` GitHub Actions secret (manual prerequisite, see Step 0 below).
- Produces: a monthly PR touching `data/barometre-electricite.json`, reviewed and merged like any other change in this repo.

- [ ] **Step 0 (manual prerequisite, not automatable): add the secret**

  In the repo's GitHub settings → Secrets and variables → Actions, add
  `ENTSOE_API_TOKEN` with the token obtained in Task 1 Step 0. This can't be
  done from a script — it requires repo admin access in the GitHub UI.

- [ ] **Step 1: Write the workflow file**

  ```yaml
  # .github/workflows/barometre-electricite-update.yml
  name: Update Baromètre électricité

  on:
    schedule:
      - cron: '0 6 1 * *'
    workflow_dispatch: {}

  jobs:
    update:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
        - run: npm ci
        - run: node scripts/update-barometre-electricite.mjs
          env:
            ENTSOE_API_TOKEN: ${{ secrets.ENTSOE_API_TOKEN }}
        - uses: peter-evans/create-pull-request@v6
          with:
            commit-message: 'chore: update Baromètre électricité data'
            title: 'Baromètre électricité — mise à jour mensuelle automatique'
            branch: barometre-electricite-auto-update
            body: |
              Mise à jour automatique de `data/barometre-electricite.json` via
              `scripts/update-barometre-electricite.mjs` (source ENTSO-E
              Transparency Platform). À relire avant merge : un chiffre
              aberrant indiquerait un problème côté API ou parsing.
  ```

- [ ] **Step 2: Verify the workflow parses correctly**

  Run: `gh workflow list` (after pushing this branch) and confirm
  "Update Baromètre électricité" appears, or use a YAML linter locally:
  `npx yaml-lint .github/workflows/barometre-electricite-update.yml`
  Expected: no syntax errors reported.

- [ ] **Step 3: Trigger a manual run to validate end-to-end (requires Step 0 done first)**

  Run: `gh workflow run barometre-electricite-update.yml`
  Expected: a PR appears within a few minutes titled "Baromètre électricité —
  mise à jour mensuelle automatique". Inspect the diff before merging —
  do not merge if the price value looks implausible (e.g., 0, negative
  outside known negative-price events, or absurdly large).

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/barometre-electricite-update.yml
  git commit -m "feat: automate monthly ENTSO-E electricity data update via PR"
  ```

---

### Task 4: Gas price data file and manual update checklist

**Files:**
- Create: `data/barometre-gaz.json`
- Create: `docs/barometre-energie/mise-a-jour-gaz.md`

**Interfaces:**
- Produces: `data/barometre-gaz.json` with shape
  `{ "quarterly": [ { "period": "2026-Q2", "avgPriceEurPerMWh": <real value>, "source": "Powernext (TRF) / CRE", "sourceUrl": "<real URL used>", "recordedAt": "<ISO date recorded>" } ] }`,
  consumed by Task 5's page/JS and Tasks 8–14.

- [ ] **Step 1: Write the checklist doc**

  ```markdown
  # Mise à jour trimestrielle — Baromètre gaz

  Chaque trimestre, avant de publier la synthèse éditoriale (voir
  `docs/superpowers/specs/2026-07-27-barometre-energie-design.md`) :

  1. Aller sur le site de Powernext (prix spot gaz TRF, moyenne du
     trimestre écoulé) ou l'Observatoire des marchés de la CRE
     (cre.fr) si Powernext ne publie pas de moyenne trimestrielle
     directement exploitable.
  2. Noter le prix moyen en EUR/MWh, l'URL exacte consultée, et la
     date du jour de consultation.
  3. Ajouter une entrée dans `data/barometre-gaz.json` (voir le
     schéma dans ce fichier) — ne jamais écraser une entrée
     existante, seulement en ajouter une nouvelle par trimestre.
  4. Faire relire la nouvelle entrée par `quality-reviewer` avant de
     merger (même logique de revue que pour les mises à jour
     électricité automatiques).
  ```

- [ ] **Step 2: Seed the data file**

  Look up the real Powernext/CRE gas price for the most recently completed
  quarter following the checklist above, then write:

  ```json
  {
    "quarterly": []
  }
  ```

  (Left empty here — the first real entry is added as part of Task 10's
  research, since it needs the actual sourced number for that period, not
  a value invented at planning time.)

- [ ] **Step 3: Commit**

  ```bash
  git add data/barometre-gaz.json docs/barometre-energie/mise-a-jour-gaz.md
  git commit -m "docs: add gas price data file and quarterly update checklist"
  ```

---

### Task 5: `barometre-energie.html` page and rendering script

**Files:**
- Create: `barometre-energie.html` (copy of `comment-ca-marche.html` as base, per this site's existing convention for new pages)
- Create: `assets/barometre.js`

**Interfaces:**
- Consumes: `data/barometre-electricite.json` (Task 2), `data/barometre-gaz.json` (Task 4), fetched client-side via same-origin `fetch()`.
- Produces: the page linked from Task 6's footer/sitemap and from every retrospective article (Tasks 8–14).

- [ ] **Step 1: Create the page from the existing template**

  ```bash
  cp comment-ca-marche.html barometre-energie.html
  ```

  Edit `barometre-energie.html`: replace the `<title>`, meta description,
  and body content with:
  - An `<h1>` : "Baromètre M&S Strategy des prix de l'énergie pour les entreprises"
  - Two indicator blocks with `id="indicateur-electricite"` and
    `id="indicateur-gaz"` (populated by JS, Step 2)
  - A "Méthodologie" section citing ENTSO-E (electricity) and Powernext/CRE
    (gas) by name, with a link to each
  - A CTA button linking to `b2b.html#transmettre-facture` (or the exact
    existing anchor/section id used by the Tally embed — verify the exact
    id in `b2b.html` before wiring the link, since the plan should not
    invent an anchor that doesn't exist)
  - A list of links to the 7 retrospective articles (Tasks 8–14) — these
    will 404 until those tasks run, same as the city-page precedent in
    `docs/superpowers/plans/2026-07-21-footer-villes-seo.md` Task 1.
  - `<script src="assets/barometre.js" defer></script>` before `</body>`

- [ ] **Step 2: Write `assets/barometre.js`**

  ```javascript
  // assets/barometre.js
  async function loadBarometreData() {
    const [electricite, gaz] = await Promise.all([
      fetch('/data/barometre-electricite.json').then((r) => r.json()),
      fetch('/data/barometre-gaz.json').then((r) => r.json()),
    ]);

    const latestElec = electricite.monthly.at(-1);
    const latestGaz = gaz.quarterly.at(-1);

    const elecEl = document.getElementById('indicateur-electricite');
    if (latestElec && elecEl) {
      elecEl.textContent = `${latestElec.avgPriceEurPerMWh} EUR/MWh (moyenne ${latestElec.period}, source ENTSO-E)`;
    }

    const gazEl = document.getElementById('indicateur-gaz');
    if (latestGaz && gazEl) {
      gazEl.textContent = `${latestGaz.avgPriceEurPerMWh} EUR/MWh (moyenne ${latestGaz.period}, source ${latestGaz.source})`;
    }
  }

  loadBarometreData().catch((err) => console.error('Baromètre: échec du chargement des données', err));
  ```

- [ ] **Step 3: Verify manually in a browser**

  Run: `npx serve .` (or any static server) from the repo root, open
  `http://localhost:3000/barometre-energie.html`.
  Expected: no console errors; both indicator elements show "—" or blank
  gracefully if the JSON files are still empty (`{"monthly": []}` /
  `{"quarterly": []}` from Tasks 2 and 4) rather than throwing.
  If they throw on empty arrays, add a guard (`if (latestElec) { ... }` —
  already present above) before proceeding.

- [ ] **Step 4: Commit**

  ```bash
  git add barometre-energie.html assets/barometre.js
  git commit -m "feat: add Baromètre énergie page"
  ```

---

### Task 6: Site-wide navigation and sitemap integration

**Files:**
- Modify: every page's footer (same 9 pages touched in
  `docs/superpowers/plans/2026-07-21-footer-villes-seo.md` Task 1)
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: `barometre-energie.html` (Task 5) and the 7 retrospective article
  filenames (Tasks 8–14, defined by Task 7's naming convention below).

- [ ] **Step 1: Add a footer link**

  In each page's footer, add a link to `barometre-energie.html` inside the
  existing "Ressources" or equivalent column (follow whatever column
  currently holds `plan-du-site.html` per the footer-villes-seo precedent —
  inspect the live footer markup before editing, don't guess the exact
  class names).

- [ ] **Step 2: Add all 8 new URLs to `sitemap.xml`**

  Add `<url>` entries for `barometre-energie.html` and the 7 retrospective
  articles (Tasks 8–14), each with a `<lastmod>` equal to its real commit
  date, matching the pattern already used for the city pages.

- [ ] **Step 3: Validate the sitemap**

  Run: `xmllint --noout sitemap.xml`
  Expected: no output (valid XML).

- [ ] **Step 4: Commit**

  ```bash
  git add sitemap.xml <modified footer files>
  git commit -m "feat: link Baromètre énergie from footer and sitemap"
  ```

---

### Task 7: Shared retrospective article template

**Files:**
- Create: `templates/barometre-article-template.html`

**Interfaces:**
- Produces: the base every Task 8–14 article is copied (`cp`) from, establishing
  filename convention `ms-blog-barometre-{period}.html` (e.g.
  `ms-blog-barometre-2022.html`, `ms-blog-barometre-2026-t1.html`).

- [ ] **Step 1: Create the template from the existing blog article pattern**

  ```bash
  cp ms-blog-article-1.html templates/barometre-article-template.html
  ```

  Edit it to include, as literal placeholder markup to be filled per article
  (not left as vague prose — each Task 8–14 replaces these exact elements):
  - `<title>` and meta description
  - JSON-LD `Article` block with `datePublished` — **must be set to the
    real authoring date of that specific article, never the analyzed
    period**
  - Body sections in this fixed order: "Période analysée" (states the
    exact period + the real writing date explicitly, e.g. "Bilan T1 2026 —
    rédigé en juillet 2026"), "Prix moyen électricité" (value + source +
    link to `barometre-energie.html`), "Prix moyen gaz" (same), "Contexte
    du marché" (prose analysis — see each task's specific angle), CTA
    button linking to `b2b.html` (same anchor as Task 5)

- [ ] **Step 2: Commit**

  ```bash
  git add templates/barometre-article-template.html
  git commit -m "feat: add shared template for Baromètre retrospective articles"
  ```

---

### Task 8: Retrospective annuelle 2022

**Files:**
- Create: `ms-blog-barometre-2022.html` (`cp templates/barometre-article-template.html ms-blog-barometre-2022.html`)

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7). Needs the
  real 2022 annual average electricity price (query via
  `node scripts/update-barometre-electricite.mjs 2022-01-01 2023-01-01`,
  Task 2's script, run manually for this historical range — do not write
  this value into `data/barometre-electricite.json`'s monthly series,
  just use the computed average in the article's prose and cite it as an
  annual figure) and the real 2022 gas price (Task 4's checklist, applied
  retroactively to 2022 sources).

- [ ] **Step 1: Fetch the real 2022 electricity average**

  Run: `ENTSOE_API_TOKEN=... node scripts/update-barometre-electricite.mjs 2022-01-01 2023-01-01`
  (temporarily point `DATA_PATH` at a scratch file if you don't want this
  annual figure mixed into the monthly series — the monthly series is for
  the live indicator, not for annual retrospectives)
  Expected: a real EUR/MWh average printed to stdout.

- [ ] **Step 2: Look up the real 2022 gas price** per `docs/barometre-energie/mise-a-jour-gaz.md`, for the full year 2022.

- [ ] **Step 3: Write the article**, filling the template with the real
  figures from Steps 1–2 and a "Contexte du marché" analysis covering:
  the invasion of Ukraine's impact on European gas supply, the resulting
  electricity/gas price spike, and the ARENH mechanism's role in
  cushioning French retail prices that year. `datePublished` = today's
  real date.

- [ ] **Step 4: Verify no antedating**

  Confirm the visible text and JSON-LD `datePublished` both show today's
  real date, and the body explicitly states "analyse de l'année 2022".

- [ ] **Step 5: Commit**

  ```bash
  git add ms-blog-barometre-2022.html
  git commit -m "content: add Baromètre 2022 annual retrospective"
  ```

---

### Task 9: Retrospective annuelle 2023

**Files:**
- Create: `ms-blog-barometre-2023.html`

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  2023 electricity average (`update-barometre-electricite.mjs 2023-01-01 2024-01-01`)
  and the real 2023 gas price (Task 4's checklist).

- [ ] **Step 1: Fetch the real 2023 electricity average and look up the real 2023 gas price** (same method as Task 8, Steps 1–2).
- [ ] **Step 2: Write the article** — "Contexte du marché" angle: the
  progressive decline from 2022's peak as European gas storage
  normalized. `datePublished` = today's real date.
- [ ] **Step 3: Verify no antedating** (same check as Task 8, Step 4).
- [ ] **Step 4: Commit**

  ```bash
  git add ms-blog-barometre-2023.html
  git commit -m "content: add Baromètre 2023 annual retrospective"
  ```

---

### Task 10: Retrospective annuelle 2024

**Files:**
- Create: `ms-blog-barometre-2024.html`

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  2024 electricity average (`update-barometre-electricite.mjs 2024-01-01 2025-01-01`)
  and the real 2024 gas price.

- [ ] **Step 1: Fetch the real 2024 electricity average and look up the real 2024 gas price.**
- [ ] **Step 2: Write the article** — "Contexte du marché" angle:
  stabilization versus 2023, comparison against pre-crisis (pre-2022)
  levels. `datePublished` = today's real date.
- [ ] **Step 3: Verify no antedating.**
- [ ] **Step 4: Commit**

  ```bash
  git add ms-blog-barometre-2024.html
  git commit -m "content: add Baromètre 2024 annual retrospective"
  ```

---

### Task 11: Retrospective annuelle 2025

**Files:**
- Create: `ms-blog-barometre-2025.html`

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  2025 electricity average (`update-barometre-electricite.mjs 2025-01-01 2026-01-01`)
  and the real 2025 gas price.

- [ ] **Step 1: Fetch the real 2025 electricity average and look up the real 2025 gas price.**
- [ ] **Step 2: Write the article** — "Contexte du marché" angle: most
  recent full year, direct lead-in to the 2026 quarterly cadence started
  in Tasks 12–14. `datePublished` = today's real date.
- [ ] **Step 3: Verify no antedating.**
- [ ] **Step 4: Commit**

  ```bash
  git add ms-blog-barometre-2025.html
  git commit -m "content: add Baromètre 2025 annual retrospective"
  ```

---

### Task 12: Retrospective trimestrielle T1 2026

**Files:**
- Create: `ms-blog-barometre-2026-t1.html`

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  T1 2026 electricity average (`update-barometre-electricite.mjs 2026-01-01 2026-04-01`),
  the real T1 2026 gas price (**this is also the first real entry written
  into `data/barometre-gaz.json`**, Task 4).

- [ ] **Step 1: Fetch the real T1 2026 electricity average.**
- [ ] **Step 2: Look up the real T1 2026 gas price and add it as the first entry in `data/barometre-gaz.json`** (per Task 4's checklist).
- [ ] **Step 3: Write the article** — first entry in the quarterly cadence;
  "Contexte du marché" angle: transition from annual retrospectives to
  the ongoing quarterly rhythm. `datePublished` = today's real date.
- [ ] **Step 4: Verify no antedating.**
- [ ] **Step 5: Commit**

  ```bash
  git add ms-blog-barometre-2026-t1.html data/barometre-gaz.json
  git commit -m "content: add Baromètre T1 2026 quarterly retrospective"
  ```

---

### Task 13: Retrospective trimestrielle T2 2026

**Files:**
- Create: `ms-blog-barometre-2026-t2.html`
- Modify: `data/barometre-gaz.json` (add T2 2026 entry)

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  T2 2026 electricity average (`update-barometre-electricite.mjs 2026-04-01 2026-07-01`),
  the real T2 2026 gas price.

- [ ] **Step 1: Fetch the real T2 2026 electricity average.**
- [ ] **Step 2: Look up the real T2 2026 gas price and add it to `data/barometre-gaz.json`.**
- [ ] **Step 3: Write the article** — "Contexte du marché" angle: trend
  versus T1 2026. `datePublished` = today's real date.
- [ ] **Step 4: Verify no antedating.**
- [ ] **Step 5: Commit**

  ```bash
  git add ms-blog-barometre-2026-t2.html data/barometre-gaz.json
  git commit -m "content: add Baromètre T2 2026 quarterly retrospective"
  ```

---

### Task 14: Retrospective trimestrielle T3 2026 (partial quarter at publication time)

**Files:**
- Create: `ms-blog-barometre-2026-t3.html`
- Modify: `data/barometre-gaz.json` (add T3 2026 entry)

**Interfaces:**
- Consumes: `templates/barometre-article-template.html` (Task 7), the real
  T3 2026 electricity average computed **only over the days elapsed so
  far** (`update-barometre-electricite.mjs 2026-07-01 <today's date>`),
  the real T3 2026 gas price available at publication time.

- [ ] **Step 1: Fetch the real T3 2026 electricity average for the elapsed portion of the quarter, and explicitly label it as partial in the article** (e.g. "moyenne du 1er juillet au [date], trimestre encore en cours").
- [ ] **Step 2: Look up the most recent available T3 2026 gas price and add it to `data/barometre-gaz.json`, noting in the article if it only covers part of the quarter.**
- [ ] **Step 3: Write the article**, clearly marked as a partial/in-progress
  quarter, with a note that a final T3 figure will follow once the
  quarter closes (handled by the normal quarterly cadence going forward,
  outside this plan's scope). `datePublished` = today's real date.
- [ ] **Step 4: Verify no antedating and verify the "partial quarter" caveat is visible in the rendered page, not just in source.**
- [ ] **Step 5: Commit**

  ```bash
  git add ms-blog-barometre-2026-t3.html data/barometre-gaz.json
  git commit -m "content: add Baromètre T3 2026 quarterly retrospective (partial)"
  ```

---

## Self-Review

**Spec coverage:**
- Sources (ENTSO-E electricity + Powernext/CRE gas): Tasks 1, 4, 8–14. ✓
- Automated electricity pipeline: Tasks 1–3 (revised from Vercel Cron to GitHub Actions — documented above with rationale). ✓
- Manual gas process: Task 4. ✓
- Dedicated page: Task 5. ✓
- Free access + CTA to existing Tally form: Task 5 Step 1. ✓
- National-only segmentation: no task adds region/sector breakdown — implicitly satisfied by omission, consistent with spec's explicit exclusion. ✓
- Footer/sitemap integration: Task 6. ✓
- Quarterly + annual backfill, never antedated: Tasks 7–14, each with an explicit anti-antedating verification step. ✓
- Governance (dev-builder for Tasks 1–7, content-builder for Tasks 8–14, quality-reviewer before each publish): reflected in task authorship, not a separate task — the execution phase (subagent-driven-development) is where this gets assigned per task.
- Metrics of success (backlinks, LLM citations, CTA clicks, organic traffic): not implementation tasks — these are post-launch measurement, out of this plan's scope by nature (nothing to build).

**Placeholder scan:** No "TBD"/"fill in details" left in code. The only
values deferred to execution time are real external market prices, which
by definition cannot be authored in a plan without fabricating data — each
such step names the exact source and exact command/lookup to run instead
of inventing a number.

**Type consistency:** `parseDayAheadPrices`/`averagePriceEurPerMWh` (Task 1)
are consumed with matching names in Task 2. `upsertMonthlyEntry` (Task 2) is
used only within Task 2, no drift. Data file shapes (`monthly`/`quarterly`
keys, field names `avgPriceEurPerMWh`, `period`, `source`) are consistent
across Tasks 2, 4, 5, and 8–14.

**Scope check:** This plan covers one cohesive subsystem (the Baromètre)
across a technical track (Tasks 1–7) and a content track (Tasks 8–14, all
depending on the technical track's data-fetching capability). Not split
further, since every task here serves the single approved spec.
