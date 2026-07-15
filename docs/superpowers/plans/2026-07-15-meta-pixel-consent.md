# Meta Pixel + Consent Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a binary cookie-consent banner and a consent-gated Meta Pixel (with a `Lead` conversion event) to all 10 pages of the M&S Strategy static site.

**Architecture:** One new shared vanilla-JS file, `assets/consent-pixel.js`, loaded via `<script defer>` from every page's `<head>`. It owns the consent cookie, the banner UI, and conditional loading of the standard Meta Pixel snippet. No build step, no new dependency, no GTM — matches the site's existing "static HTML, vanilla JS per page" pattern (see `handoff.md`).

**Tech Stack:** Vanilla JS (ES5-compatible, no transpiler in this repo), vanilla CSS injected at runtime, plain HTML.

## Global Constraints

- No build system exists in this repo — every file must run unmodified in a browser (no bundler, no npm scripts). Do not add `package.json` or any dependency.
- Consent cookie name: `ms_consent`, values `accepted` / `refused`, attributes `path=/; max-age=<180 days in seconds>; SameSite=Lax; Secure`.
- Banner has exactly 2 buttons: **Accepter** / **Refuser** — no "Personnaliser" (single cookie category today, see spec).
- `META_PIXEL_ID` starts as the literal placeholder string `'REPLACE_WITH_PIXEL_ID'`; the Pixel must never attempt to load while it holds that value.
- This repo has no automated test framework (verified: no `package.json`, no test directory). Verification steps in this plan are manual browser checks using a local static server, consistent with how the rest of the site is QA'd (see `handoff.md`, "Mobile QA" section). Do not introduce a JS test framework for this change — disproportionate for a single static-site script.
- Use `/usr/bin/python3` explicitly for any local server command (bare `python3` is broken on this machine per `handoff.md`).

---

### Task 1: Create `assets/consent-pixel.js`

**Files:**
- Create: `assets/consent-pixel.js`

**Interfaces:**
- Produces: `window.msTrackLead(source: string): void` — global function later tasks call from `openTallyForm()`. No-op if the Pixel hasn't loaded (consent not given, or `META_PIXEL_ID` still a placeholder).
- Produces: on `DOMContentLoaded` (or immediately if already loaded), either shows the consent banner, or silently loads the Pixel if `ms_consent=accepted` was already set on a prior visit.

- [ ] **Step 1: Write `assets/consent-pixel.js`**

```javascript
(function () {
  'use strict';

  var META_PIXEL_ID = 'REPLACE_WITH_PIXEL_ID';
  var CONSENT_COOKIE = 'ms_consent';
  var CONSENT_MAX_AGE_DAYS = 180;

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match.pop()) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + maxAge + '; SameSite=Lax; Secure';
  }

  function loadPixel() {
    if (!META_PIXEL_ID || META_PIXEL_ID === 'REPLACE_WITH_PIXEL_ID') {
      console.warn('[consent-pixel] META_PIXEL_ID not set — Meta Pixel will not load.');
      return;
    }
    if (window.fbq) return;

    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  window.msTrackLead = function (source) {
    if (!window.fbq) return;
    window.fbq('track', 'Lead', { content_name: source });
  };

  function injectBannerStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#ms-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#14251f;color:#f5f1e8;padding:20px 24px;display:flex;' +
      'flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;' +
      'font-family:inherit;box-shadow:0 -4px 24px rgba(0,0,0,.25);}' +
      '#ms-consent-banner p{margin:0;font-size:14px;line-height:1.5;max-width:640px;}' +
      '#ms-consent-banner .ms-consent-actions{display:flex;gap:12px;flex-shrink:0;}' +
      '#ms-consent-banner button{cursor:pointer;border:none;border-radius:999px;' +
      'padding:10px 20px;font-size:14px;font-weight:600;}' +
      '#ms-consent-accept{background:#2f6b52;color:#fff;}' +
      '#ms-consent-refuse{background:transparent;color:#f5f1e8;border:1px solid rgba(245,241,232,.4)!important;}';
    document.head.appendChild(style);
  }

  function showBanner() {
    injectBannerStyles();
    var banner = document.createElement('div');
    banner.id = 'ms-consent-banner';
    banner.innerHTML =
      '<p>Ce site utilise des cookies pour mesurer l’audience et personnaliser les publicités. Vous pouvez accepter ou refuser ce suivi.</p>' +
      '<div class="ms-consent-actions">' +
      '<button id="ms-consent-refuse" type="button">Refuser</button>' +
      '<button id="ms-consent-accept" type="button">Accepter</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('ms-consent-accept').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'accepted', CONSENT_MAX_AGE_DAYS);
      banner.parentNode.removeChild(banner);
      loadPixel();
    });
    document.getElementById('ms-consent-refuse').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'refused', CONSENT_MAX_AGE_DAYS);
      banner.parentNode.removeChild(banner);
    });
  }

  function init() {
    var consent = getCookie(CONSENT_COOKIE);
    if (consent === 'accepted') {
      loadPixel();
    } else if (consent !== 'refused') {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Syntax-check the file with Node**

Run: `node --check assets/consent-pixel.js`
Expected: no output, exit code 0 (Node is only used here as a free JS parser — the file itself never runs under Node).

- [ ] **Step 3: Commit**

```bash
git add assets/consent-pixel.js
git commit -m "Add consent-gated Meta Pixel script"
```

---

### Task 2: Load `consent-pixel.js` on all 10 pages

**Files:**
- Modify: `index.html:3-4`
- Modify: `b2b.html:3-4`
- Modify: `b2c.html:3-4`
- Modify: `blog.html:3-4`
- Modify: `comment-ca-marche.html:3-4`
- Modify: `resultats.html:3-4`
- Modify: `ms-blog-article-1.html:3-4`
- Modify: `ms-blog-article-2.html:3-4`
- Modify: `ms-strategy-calculateur.html:3-4`
- Modify: `ms-strategy-landing-2.html:3-4`

**Interfaces:**
- Consumes: nothing (script is self-initializing via `DOMContentLoaded`, see Task 1).

Every one of the 10 files starts with the identical two lines:
```html
<head>
<meta charset="UTF-8">
```
(confirmed identical across all 10 files). Insert the script tag between them.

- [ ] **Step 1: Edit each of the 10 files**

For each file in `index.html`, `b2b.html`, `b2c.html`, `blog.html`, `comment-ca-marche.html`, `resultats.html`, `ms-blog-article-1.html`, `ms-blog-article-2.html`, `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html`, replace:

```html
<head>
<meta charset="UTF-8">
```

with:

```html
<head>
<script src="assets/consent-pixel.js" defer></script>
<meta charset="UTF-8">
```

- [ ] **Step 2: Verify all 10 files were updated**

Run: `grep -L 'assets/consent-pixel.js' index.html b2b.html b2c.html blog.html comment-ca-marche.html resultats.html ms-blog-article-1.html ms-blog-article-2.html ms-strategy-calculateur.html ms-strategy-landing-2.html`
Expected: no output (empty = every file matched, `-L` lists files that do NOT contain the string).

- [ ] **Step 3: Commit**

```bash
git add index.html b2b.html b2c.html blog.html comment-ca-marche.html resultats.html ms-blog-article-1.html ms-blog-article-2.html ms-strategy-calculateur.html ms-strategy-landing-2.html
git commit -m "Load consent-pixel.js on all pages"
```

---

### Task 3: Fire the `Lead` event from the 3 Tally entry points

**Files:**
- Modify: `b2b.html:406-418`
- Modify: `b2c.html:401-403`
- Modify: `ms-strategy-landing-2.html:870-872`

**Interfaces:**
- Consumes: `window.msTrackLead(source: string): void` from Task 1.

- [ ] **Step 1: Edit `b2b.html`**

Replace (lines 406-418):

```javascript
function openTallyForm(source) {
  const hiddenFields = { source };
  try {
    const raw = localStorage.getItem('msLeadContext');
    if (raw) {
      const ctx = JSON.parse(raw);
      const isFresh = ctx.ts && (Date.now() - ctx.ts) < 30 * 60 * 1000; // 30 min
      if (isFresh && ctx.message) hiddenFields.message = ctx.message;
      localStorage.removeItem('msLeadContext');
    }
  } catch (e) { /* localStorage unavailable — form still opens without pre-fill */ }
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
}
```

with:

```javascript
function openTallyForm(source) {
  const hiddenFields = { source };
  try {
    const raw = localStorage.getItem('msLeadContext');
    if (raw) {
      const ctx = JSON.parse(raw);
      const isFresh = ctx.ts && (Date.now() - ctx.ts) < 30 * 60 * 1000; // 30 min
      if (isFresh && ctx.message) hiddenFields.message = ctx.message;
      localStorage.removeItem('msLeadContext');
    }
  } catch (e) { /* localStorage unavailable — form still opens without pre-fill */ }
  if (window.msTrackLead) window.msTrackLead(source);
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields });
}
```

- [ ] **Step 2: Edit `b2c.html`**

Replace (lines 401-403):

```javascript
function openTallyForm(source) {
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields: { source } });
}
```

with:

```javascript
function openTallyForm(source) {
  if (window.msTrackLead) window.msTrackLead(source);
  Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields: { source } });
}
```

- [ ] **Step 3: Edit `ms-strategy-landing-2.html`**

Replace (lines 870-872):

```javascript
  function openTallyForm(source) {
    Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields: { source } });
  }
```

with:

```javascript
  function openTallyForm(source) {
    if (window.msTrackLead) window.msTrackLead(source);
    Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields: { source } });
  }
```

- [ ] **Step 4: Verify all 3 files were updated**

Run: `grep -c 'msTrackLead' b2b.html b2c.html ms-strategy-landing-2.html`
Expected: `b2b.html:1`, `b2c.html:1`, `ms-strategy-landing-2.html:1`

- [ ] **Step 5: Commit**

```bash
git add b2b.html b2c.html ms-strategy-landing-2.html
git commit -m "Fire Meta Pixel Lead event on Tally form open"
```

---

### Task 4: Manual browser verification

**Files:** none (verification only, no code changes).

- [ ] **Step 1: Start a local static server**

Run: `/usr/bin/python3 -m http.server 8000`
Expected: `Serving HTTP on :: port 8000 ...` with no errors. Leave running in the background for the remaining steps.

- [ ] **Step 2: Verify the banner appears with no prior consent**

In a browser, open DevTools → Application → Cookies and delete any `ms_consent` cookie for `localhost:8000`. Navigate to `http://localhost:8000/index.html`.
Expected: the bottom banner appears with the exact text "Ce site utilise des cookies pour mesurer l'audience et personnaliser les publicités. Vous pouvez accepter ou refuser ce suivi." and two buttons, "Refuser" and "Accepter". No console errors.

- [ ] **Step 3: Verify "Refuser" behavior**

Click "Refuser".
Expected: banner disappears; DevTools → Application → Cookies shows `ms_consent=refused`; `window.fbq` is `undefined` in the console; reloading the page does not re-show the banner.

- [ ] **Step 4: Verify "Accepter" behavior**

Delete the `ms_consent` cookie again, reload, click "Accepter".
Expected: banner disappears; cookie `ms_consent=accepted` is set; console shows the warning `[consent-pixel] META_PIXEL_ID not set — Meta Pixel will not load.` (expected — placeholder ID still in place); reloading the page does not re-show the banner and does not re-log the warning-triggering path incorrectly (it should still log the same warning once per page load, since the Pixel still won't load without a real ID).

- [ ] **Step 5: Verify the `Lead` hook fires without crashing before a real Pixel ID exists**

With `ms_consent=accepted` set, navigate to `http://localhost:8000/b2b.html`, open the Tally popup (trigger whichever button calls `openTallyForm(...)`), and check the console.
Expected: no JavaScript errors. `window.msTrackLead` exists and executes silently (it's a no-op since `window.fbq` is undefined without a real Pixel ID).

- [ ] **Step 6: Stop the local server**

Stop the `http.server` process (Ctrl-C in its terminal, or kill the background job).

No commit for this task — it produces no file changes.

---

## After a real Pixel ID is obtained (follow-up, not part of this plan)

Once the user creates the Pixel in Meta Business Suite / Ads Manager and has a real Pixel ID:
1. **Fix the blog-article floating CTA occlusion.** `.floating-cta` on `ms-blog-article-1.html` and `ms-blog-article-2.html` (bottom-right, revealed on scroll) can be rendered behind the consent banner for first-time visitors who scroll past 400px — same occlusion class as the (already-fixed) landing-page sticky CTA, just not previously covered since `offsetStickyCta()` only targets `.sticky-cta`. Low priority (blog isn't an ad landing destination) but worth closing before broader traffic.
2. **Fix consent revocation mid-session.** Currently, if a visitor accepts (loading `fbq`/`fbevents.js`), then uses "Gérer les cookies" → "Refuser" without reloading, `window.fbq` stays defined and `msTrackLead()` keeps firing `Lead` events for the rest of that page's life — `ms_consent=refused` is set correctly, but nothing tears down the already-loaded Pixel. This is dormant today because `META_PIXEL_ID` is a placeholder so `fbq` never loads in the first place, but it becomes a real over-collection bug the moment a live ID is set. Fix before going live: e.g. reload the page on the Refuse path when `window.fbq` already exists, or call Meta's `fbq('consent', 'revoke')` API if adopting Meta's Limited Data Use / consent mode.
3. Replace `'REPLACE_WITH_PIXEL_ID'` in `assets/consent-pixel.js` with the real ID (single-line edit).
4. Commit: `git commit -am "Set live Meta Pixel ID"`.
5. Re-run Task 4's manual verification with the Meta Pixel Helper Chrome extension installed, confirming `PageView` and `Lead` events actually reach Meta, and re-verify the consent-revocation fix from step 2 mid-session.
