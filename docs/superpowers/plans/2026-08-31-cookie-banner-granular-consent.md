# Cookie Banner Granular Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the binary accept/refuse cookie banner with three actions — a prominent "Accepter", a prominent "Gérer" that opens a per-category preference panel (mesure d'audience / publicité), and a "tout refuser" text link embedded in the informational paragraph at minimal (body-text) size, still fully clickable in the same banner.

**Architecture:** `assets/cookie-consent.js` owns the banner UI and stores consent as a JSON object (`{analytics, marketing}`) in the `ms_consent` cookie instead of the string `accepted`/`refused`. `src/analytics.js` splits its single `initAnalytics()` into independently-gated `initPostHog()` / `initMetaPixel()` calls, each idempotent, driven by the consent object. `assets/analytics.js` is the committed esbuild output of `src/analytics.js` — must be rebuilt via `npm run build:analytics` after every source change (`test/analytics-build.test.mjs` fails the build if they diverge). `politique-confidentialite.html` copy is updated to describe the three-choice banner and per-category consent.

**Tech Stack:** Vanilla JS (no framework, no bundler for the banner itself), esbuild for `assets/analytics.js`, `node --test` for the existing suite.

## Post-plan addendum (found in review, fixed before delivery)

The plan's `git grep ms_consent` scope check was skipped, and the review that followed this plan (`quality-reviewer`) caught a real regression missed as a result: `b2b.html` (`openTallyForm`, `onTallySubmit`) and `b2c.html` (`onTallySubmit`) each gated Meta Pixel conversion events (`InitiateCheckout`, `Lead`) behind a regex string-match on the old cookie format (`ms_consent=accepted`), which the new JSON format never matches — silently killing all Meta conversion tracking regardless of consent given. Fixed by adding a shared `msMarketingConsent()` helper to each file (reads the JSON cookie, checks `.marketing === true`, treats a missing/malformed/old-format cookie as no consent) and a regression suite `test/marketing-consent-gate.test.mjs` (10 tests, covering old-format, new-format true/false, missing cookie, malformed JSON) so this class of bug fails `npm test` next time the cookie contract changes.

## Global Constraints

- No new dependencies.
- The "refuser" control must remain inside `#ms-cookie-banner` (never a separate hidden control outside the banner) and must never be smaller than the surrounding paragraph text (CNIL requires refusal to be no harder than acceptance — shrinking it below body size crosses into a sanctioned dark pattern).
- Consent must default to *unchecked/off* for both categories the first time the preference panel is shown — no pre-ticked boxes.
- `window.msInitAnalytics` must stay idempotent per category: calling it twice, or first with `{analytics:false,marketing:false}` and later with `{analytics:true,marketing:false}`, must init PostHog exactly once and never init Meta.
- Existing visitors with the old `ms_consent=accepted`/`refused` string cookie must be treated as "no consent yet" (banner reshown once) — the old value doesn't parse as the new JSON shape, which naturally achieves this; do not add special-case migration code for it.
- Run `npm test` and `npm run build:analytics` before committing; `test/analytics-build.test.mjs` must pass.

---

### Task 1: Rewrite the cookie banner UI and consent storage

**Files:**
- Modify: `assets/cookie-consent.js` (full rewrite of `showBanner`, storage helpers, styles)

**Interfaces:**
- Produces: `window.msOpenCookieBanner()` (unchanged signature, still reopens the banner — used by the footer "Gérer les cookies" link on every page).
- Produces: calls `window.msInitAnalytics({ analytics: boolean, marketing: boolean })` whenever consent is saved (accept all, reject all, or save from the preference panel) and once on load if a valid consent cookie already exists.
- Consumes: nothing from other tasks.

- [x] **Step 1: Replace `assets/cookie-consent.js` with the version below**

```javascript
(function () {
  var COOKIE_NAME = 'ms_consent';
  var COOKIE_MAX_AGE_DAYS = 390; // 13 mois — plafond recommandé par la CNIL

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + maxAge + '; SameSite=Lax; Secure';
  }

  // Cookie stocké en JSON `{analytics, marketing}` — un ancien cookie au
  // format `accepted`/`refused` ne parse pas et retombe naturellement sur
  // null (= pas encore de consentement), ce qui rouvre le bandeau une fois
  // pour les visiteurs existants. C'est le comportement voulu : l'ancien
  // consentement groupait deux finalités distinctes sans les distinguer.
  function getConsent() {
    var raw = getCookie(COOKIE_NAME);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function setConsent(analytics, marketing) {
    var consent = { analytics: analytics, marketing: marketing };
    setCookie(COOKIE_NAME, JSON.stringify(consent), COOKIE_MAX_AGE_DAYS);
    if (window.msInitAnalytics) window.msInitAnalytics(consent);
  }

  function injectStyles() {
    if (document.getElementById('ms-cookie-style')) return;
    var style = document.createElement('style');
    style.id = 'ms-cookie-style';
    style.textContent =
      '#ms-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#07131a;color:#f5f0e8;padding:1.3rem 5vw;display:flex;' +
      'flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.2rem;' +
      'font-family:"Satoshi",sans-serif;box-shadow:0 -4px 24px rgba(0,0,0,.3);' +
      'border-top:1px solid rgba(94,207,220,.18)}' +
      '#ms-cookie-banner p{margin:0;font-size:.85rem;line-height:1.6;max-width:640px;color:#8aacb4}' +
      '#ms-cookie-banner p a{color:#2bb5c8;text-decoration:underline}' +
      '.ms-cookie-textlink{font:inherit;font-size:.85rem;color:#8aacb4;text-decoration:underline;' +
      'background:none;border:0;padding:0;cursor:pointer}' +
      '.ms-cookie-textlink:hover{color:#f5f0e8}' +
      '#ms-cookie-actions{display:flex;gap:.7rem;flex-shrink:0}' +
      '#ms-cookie-actions button{font-family:"Satoshi",sans-serif;font-weight:700;font-size:.74rem;' +
      'letter-spacing:.06em;text-transform:uppercase;padding:.65rem 1.3rem;border-radius:2px;cursor:pointer;' +
      'border:1.5px solid #4cde80;background:transparent;color:#f5f0e8;transition:background .2s,color .2s}' +
      '#ms-cookie-actions button.accept{background:#4cde80;color:#07131a}' +
      '#ms-cookie-actions button:hover{opacity:.85}' +
      '#ms-cookie-prefs-intro{margin:0 0 .7rem;font-size:.85rem;line-height:1.6;color:#8aacb4}' +
      '.ms-cookie-row{display:flex;align-items:flex-start;gap:.6rem;margin:0 0 .6rem;font-size:.85rem;' +
      'line-height:1.5;color:#f5f0e8;cursor:pointer}' +
      '.ms-cookie-row input{margin-top:.2rem;flex-shrink:0;accent-color:#4cde80}' +
      '@media(max-width:640px){#ms-cookie-banner{flex-direction:column;align-items:stretch;text-align:left}' +
      '#ms-cookie-actions{justify-content:flex-start}}';
    document.head.appendChild(style);
  }

  function hideBanner() {
    var el = document.getElementById('ms-cookie-banner');
    if (el) el.remove();
  }

  function bindMainView(banner) {
    banner.innerHTML =
      '<p>Nous utilisons des cookies de mesure d’audience et de suivi publicitaire (PostHog, Meta) ' +
      'pour comprendre l’usage du site et mesurer nos campagnes. Ils ne sont déposés qu’avec votre accord. Voir notre ' +
      '<a href="politique-confidentialite.html">politique de confidentialité</a> ou ' +
      '<button type="button" class="ms-cookie-textlink" id="ms-cookie-reject">tout refuser</button>.</p>' +
      '<div id="ms-cookie-actions">' +
      '<button type="button" class="manage" id="ms-cookie-manage">Gérer</button>' +
      '<button type="button" class="accept" id="ms-cookie-accept">Accepter</button>' +
      '</div>';

    document.getElementById('ms-cookie-accept').addEventListener('click', function () {
      setConsent(true, true);
      hideBanner();
    });
    document.getElementById('ms-cookie-reject').addEventListener('click', function () {
      setConsent(false, false);
      hideBanner();
    });
    document.getElementById('ms-cookie-manage').addEventListener('click', function () {
      bindPreferencesView(banner);
    });
  }

  function bindPreferencesView(banner) {
    var current = getConsent() || { analytics: false, marketing: false };
    banner.innerHTML =
      '<div>' +
      '<p id="ms-cookie-prefs-intro">Choisissez les cookies que vous acceptez. Les cookies techniques, ' +
      'nécessaires au fonctionnement du site, sont toujours actifs. Voir notre ' +
      '<a href="politique-confidentialite.html">politique de confidentialité</a>.</p>' +
      '<label class="ms-cookie-row"><input type="checkbox" id="ms-cookie-cat-analytics"' +
      (current.analytics ? ' checked' : '') + '><span><strong>Mesure d’audience</strong> — PostHog, pour comprendre ' +
      'l’usage du site.</span></label>' +
      '<label class="ms-cookie-row"><input type="checkbox" id="ms-cookie-cat-marketing"' +
      (current.marketing ? ' checked' : '') + '><span><strong>Publicité</strong> — Pixel Meta, pour mesurer nos ' +
      'campagnes Facebook/Instagram.</span></label>' +
      '</div>' +
      '<div id="ms-cookie-actions">' +
      '<button type="button" class="manage" id="ms-cookie-save">Enregistrer mes choix</button>' +
      '<button type="button" class="accept" id="ms-cookie-accept-all">Tout accepter</button>' +
      '</div>';

    document.getElementById('ms-cookie-save').addEventListener('click', function () {
      var analytics = document.getElementById('ms-cookie-cat-analytics').checked;
      var marketing = document.getElementById('ms-cookie-cat-marketing').checked;
      setConsent(analytics, marketing);
      hideBanner();
    });
    document.getElementById('ms-cookie-accept-all').addEventListener('click', function () {
      setConsent(true, true);
      hideBanner();
    });
  }

  function showBanner() {
    hideBanner();
    injectStyles();
    var banner = document.createElement('div');
    banner.id = 'ms-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    document.body.appendChild(banner);
    bindMainView(banner);
  }

  // Exposé pour le lien "Gérer les cookies" du footer — permet de revenir
  // sur son choix aussi facilement qu'on l'a donné (exigence CNIL).
  window.msOpenCookieBanner = showBanner;

  var existing = getConsent();
  if (existing) {
    if (window.msInitAnalytics) window.msInitAnalytics(existing);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
```

- [x] **Step 2: Manual smoke check in a browser**

Open any page (e.g. `index.html`) via a local static server (`npx serve .` or similar), confirm:
- First visit shows "Accepter" and "Gérer" as filled/outlined buttons, "tout refuser" as an inline underlined text link inside the paragraph, all inside the same `#ms-cookie-banner`.
- Clicking "Gérer" swaps to the two-checkbox panel, both unchecked by default, with "Enregistrer mes choix" and "Tout accepter".
- Clicking "tout refuser", "Accepter", or "Enregistrer mes choix" closes the banner and sets a `ms_consent` cookie (check via devtools) shaped like `{"analytics":true,"marketing":false}`.
- Reloading the page does not reshow the banner once a choice is stored.
- Footer "Gérer les cookies" link reopens the banner on the main view.

- [x] **Step 3: Commit**

```bash
git add assets/cookie-consent.js
git commit -m "feat(cookies): granular per-category consent with subtler refuse control"
```

---

### Task 2: Split analytics init by consent category and rebuild the bundle

**Files:**
- Modify: `src/analytics.js:23,81-94`
- Regenerate: `assets/analytics.js` (via `npm run build:analytics` — do not hand-edit)

**Interfaces:**
- Consumes: `window.msInitAnalytics({ analytics: boolean, marketing: boolean })` call contract produced by Task 1.
- Produces: `window.msInitAnalytics` (same global name, new parameter shape — `test/analytics-build.test.mjs` only checks the string `msInitAnalytics` is present in the bundle, so the signature change doesn't break it).

- [x] **Step 1: Replace the init-tracking and bootstrap section of `src/analytics.js`**

Replace lines 23 and 81-94 (the `let initialised = false;` declaration and the `initAnalytics`/bootstrap block at the bottom) with:

```javascript
let postHogInitialised = false;
let metaPixelInitialised = false;
```

and, replacing the old `initAnalytics`/bootstrap block:

```javascript
function initAnalytics(consent) {
  consent = consent || {};
  if (consent.analytics && !postHogInitialised) {
    postHogInitialised = true;
    initPostHog();
  }
  if (consent.marketing && !metaPixelInitialised) {
    metaPixelInitialised = true;
    initMetaPixel();
  }
}

// Contrat avec assets/cookie-consent.js : appele avec {analytics, marketing}
// a chaque changement de consentement (acceptation, refus, ou sauvegarde des
// preferences), et une fois au chargement si un consentement valide existe
// deja. Idempotent par categorie : un rappel avec la meme categorie a true
// ne reinitialise rien.
window.msInitAnalytics = initAnalytics;
```

Leave `initPostHog()` and `initMetaPixel()` (lines 25-79) unchanged — only their caller changes.

- [x] **Step 2: Rebuild the committed bundle**

Run: `npm run build:analytics`
Expected: exits 0, `assets/analytics.js` is rewritten.

- [x] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including `test/analytics-build.test.mjs` (verifies `assets/analytics.js` matches a fresh build of `src/analytics.js`) and `test/analytics-helpers.test.mjs`.

- [x] **Step 4: Commit**

```bash
git add src/analytics.js assets/analytics.js
git commit -m "feat(analytics): gate PostHog and Meta Pixel independently by consent category"
```

---

### Task 3: Update the privacy policy copy to describe the three-choice banner

**Files:**
- Modify: `politique-confidentialite.html:150-159`

**Interfaces:**
- Consumes: nothing (copy-only change).
- Produces: nothing consumed by other tasks.

- [x] **Step 1: Update the `ms_consent` cookie table row (around line 152)**

Find:
```html
      <tr><td><code>ms_consent</code></td><td>Mémorise votre choix (accepté/refusé) pour ne pas réafficher le bandeau à chaque page</td><td>13 mois</td><td>Cookie technique, nécessaire au fonctionnement du bandeau lui-même</td></tr>
```

Replace with:
```html
      <tr><td><code>ms_consent</code></td><td>Mémorise votre choix par catégorie (mesure d'audience, publicité) pour ne pas réafficher le bandeau à chaque page</td><td>13 mois</td><td>Cookie technique, nécessaire au fonctionnement du bandeau lui-même</td></tr>
```

- [x] **Step 2: Update the consent explanation paragraph (around lines 156-159)**

Find:
```html
      Un bandeau vous permet d'accepter ou de refuser les cookies de mesure d'audience (PostHog) avant tout dépôt : tant que vous
      n'avez pas cliqué sur « Accepter », aucun cookie PostHog n'est posé et aucune donnée de navigation ne lui est transmise.
      Vous pouvez revenir sur votre choix à tout moment via le lien <strong>« Gérer les cookies »</strong> présent en bas de chaque page.
```

Replace with:
```html
      Un bandeau vous permet d'accepter, de refuser, ou de choisir séparément les cookies de mesure d'audience (PostHog) et de
      publicité (Pixel Meta) via « Gérer » : tant que vous n'avez pas donné votre accord pour une catégorie, aucun cookie de
      cette catégorie n'est posé et aucune donnée ne lui est transmise.
      Vous pouvez revenir sur votre choix à tout moment via le lien <strong>« Gérer les cookies »</strong> présent en bas de chaque page.
```

- [x] **Step 3: Commit**

```bash
git add politique-confidentialite.html
git commit -m "docs(privacy): describe per-category cookie consent"
```
