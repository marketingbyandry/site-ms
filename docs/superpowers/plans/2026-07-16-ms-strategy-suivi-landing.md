# Pages de suivi personnalisées (A/C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two personalized post-contact landing pages (B2B, B2C), each split 50/50 between variant A ("anti-comparateur frontal", DARK theme) and variant C ("continuité relationnelle", LIGHT theme — new palette, designed in Task 3), plus a password-protected internal tool that generates the personalized links. Decision 2026-07-16: theme (noir/blanc) is tied to the editorial variant, not a separate random dimension — every page pair always ships one dark and one light version.

**Architecture:** Same pattern as the existing home A/B test (`middleware.js`), extended with its own cookie (`ms_suivi_variant`) and matcher for two new stable public URLs. The canonical file at each public URL IS variant C's content (mirrors how `index.html` is variant A's content today); the middleware rewrites to a `-a.html` file only when the cookie says A. A shared `assets/suivi-personalize.js` reads `?prenom=`/`?conseiller=` from the URL and toggles pre-written fallback text — same script, all 4 content files. `generateur-suivi.html` is a vanilla-JS link builder gated by Basic Auth in `middleware.js`, credentials from Vercel env vars (repo is public on GitHub).

**Tech Stack:** Static HTML/CSS/vanilla JS, no build step. Vercel Edge Middleware (`@vercel/edge`, already a dependency). PostHog JS (EU cloud, `assets/analytics.js` already exists). Reuses the exact CSS/markup vocabulary of `ms-strategy-landing-2.html` verbatim — zero new CSS classes needed for the shared skeleton.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-15-ms-strategy-suivi-landing-design.md` (read before starting — this plan implements it).
- No page outside this task's file list is modified.
- No competitor named in any visible copy (Opéra Énergie / Mon Courtier Énergie / Selectra) — describe the category only.
- No new statistic invented — every number used here already appears in `b2b.html`, `b2c.html`, `resultats.html`, or `ms-strategy-landing-2.html` (cited per-task below).
- Personalization must degrade safely: if `assets/suivi-personalize.js` fails to load, the page must still read correctly (generic fallback text is the default HTML state, not something JS adds).
- Basic Auth credentials (`SUIVI_TOOL_USER`/`SUIVI_TOOL_PASS`) are Vercel env vars, never hardcoded — `site-ms` is a **public** GitHub repo.
- This project has no automated test suite. "Testing" here means real verification: curl checks against a live Vercel preview, and manual browser checks — same convention as `docs/superpowers/plans/2026-07-15-ms-strategy-ab-test.md`.
- Two implementation details below are **assumptions from general Vercel/JS knowledge, not verified in this repo yet** — flagged inline, confirmed for real in Task 9: (1) `new URL(path, base)` drops the original query string unless preserved explicitly, (2) `process.env` and `btoa` are available in Vercel's Edge Runtime.

---

### Task 1: Extend `middleware.js` — suivi A/C split + Basic Auth

**Files:**
- Modify: `middleware.js` (currently 31 lines, home A/B split only)

**Interfaces:**
- Produces: cookie `ms_suivi_variant` (`A` or `C`) on `/ms-strategy-suivi-b2b.html` and `/ms-strategy-suivi-b2c.html`.
- Produces: `/ms-strategy-suivi-b2b-a.html` / `/ms-strategy-suivi-b2c-a.html` served transparently at the public URL when variant is `A`; canonical file (variant C) served otherwise.
- Produces: `401` response with `WWW-Authenticate: Basic` on `/generateur-suivi.html` unless a valid `Authorization` header is present.
- Consumes: `process.env.SUIVI_TOOL_USER`, `process.env.SUIVI_TOOL_PASS` (set later by the user in Vercel dashboard — Task 9).

- [ ] **Step 1: Replace `middleware.js` in full**

```js
import { next, rewrite } from '@vercel/edge';

export const config = {
  matcher: [
    '/',
    '/ms-strategy-suivi-b2b.html',
    '/ms-strategy-suivi-b2c.html',
    '/generateur-suivi.html',
  ],
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

function homeSplit(request) {
  const userAgent = request.headers.get('user-agent') || '';

  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = variant === 'B'
    ? rewrite(new URL('/index-b.html', request.url))
    : next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}

function suiviSplit(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bots always get variant C (the canonical file), never a cookie —
  // avoids polluting PostHog with email-security link scanners that
  // pre-fetch prospect links before the human opens them.
  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_suivi_variant=(A|C)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'C');

  let response;
  if (variant === 'A') {
    // Mutate pathname on a URL already parsed from the full request URL,
    // so `?prenom=&conseiller=` (parsed into url.search) survive the
    // rewrite — constructing `new URL('/foo-a.html', request.url)` from a
    // bare path instead would drop the original query string.
    const url = new URL(request.url);
    url.pathname = url.pathname.replace('.html', '-a.html');
    response = rewrite(url);
  } else {
    response = next();
  }

  response.headers.append(
    'Set-Cookie',
    `ms_suivi_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}

function requireBasicAuth(request) {
  const expectedUser = process.env.SUIVI_TOOL_USER;
  const expectedPass = process.env.SUIVI_TOOL_PASS;
  const auth = request.headers.get('authorization') || '';

  if (expectedUser && expectedPass && auth === 'Basic ' + btoa(expectedUser + ':' + expectedPass)) {
    return next();
  }

  return new Response('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Outil interne"' },
  });
}

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/generateur-suivi.html') {
    return requireBasicAuth(request);
  }
  if (pathname === '/ms-strategy-suivi-b2b.html' || pathname === '/ms-strategy-suivi-b2c.html') {
    return suiviSplit(request);
  }
  return homeSplit(request);
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.js
git commit -m "Extend middleware with suivi A/C split and Basic Auth for generateur-suivi"
```

*(Can't be verified locally — Edge Middleware only runs on Vercel's edge network. Verified in Task 9 against the pushed branch's preview.)*

---

### Task 2: Shared personalization script — `assets/suivi-personalize.js`

**Files:**
- Create: `assets/suivi-personalize.js`

**Interfaces:**
- Consumes: cookie `ms_suivi_variant` (Task 1), `window.posthog` (already loaded by `assets/analytics.js`, included first in every content page).
- Consumes DOM convention (used identically by all 4 content files, Tasks 3–6):
  - `.js-prenom-line[hidden]` + inner `.js-prenom` span — shown/filled when `?prenom=` present.
  - `.js-generic-line` — the always-present default, hidden when prenom is present.
  - `.js-conseiller-line[hidden]` + inner `.js-conseiller` span — shown/filled when `?conseiller=` present.
  - `.js-generic-conseiller-line` — the always-present default, hidden when conseiller is present.
- Produces: PostHog super-property `{ suivi_variant: 'A'|'C' }`.

- [ ] **Step 1: Create the file**

```js
(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  var params = new URLSearchParams(window.location.search);
  var prenom = params.get('prenom');
  var conseiller = params.get('conseiller');

  if (prenom) {
    document.querySelectorAll('.js-prenom').forEach(function (el) { el.textContent = prenom; });
    document.querySelectorAll('.js-prenom-line').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('.js-generic-line').forEach(function (el) { el.hidden = true; });
  }

  if (conseiller) {
    document.querySelectorAll('.js-conseiller').forEach(function (el) { el.textContent = conseiller; });
    document.querySelectorAll('.js-conseiller-line').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('.js-generic-conseiller-line').forEach(function (el) { el.hidden = true; });
  }

  if (window.posthog) {
    posthog.register({ suivi_variant: getCookie('ms_suivi_variant') || 'C' });
  }
})();
```

- [ ] **Step 2: Commit**

```bash
git add assets/suivi-personalize.js
git commit -m "Add shared personalization script for suivi landing pages"
```

*(Verified in Task 9 with real `?prenom=&conseiller=` URLs against the preview.)*

---

### Task 3: `ms-strategy-suivi-b2b.html` (variant C — canonical file, LIGHT theme)

**Files:**
- Create: `ms-strategy-suivi-b2b.html`

**Interfaces:**
- Consumes: `assets/analytics.js` (existing), `assets/suivi-personalize.js` (Task 2), Tally form `kd15W1` (existing, used site-wide).
- CSS/markup: same selectors/structure as `ms-strategy-landing-2.html` (`:root` tokens through `.sticky-cta`) — zero new classes. **Colors differ: this is the LIGHT theme** (variant C = "continuité relationnelle" = blanc; variant A, Task 4, stays on the original DARK theme = noir — per user decision 2026-07-16, one theme per variant, tied to the editorial split, not a separate random dimension).
- Light theme design (derived by re-reading every rule in the original dark stylesheet, not a blind token swap): only 3 places actually needed a value change — (1) the two body-level tokens `--dark` (bg) / `--cream` (text) swap meaning (white bg / near-navy text), (2) `--green-accent`, `--teal-bright`, `--teal-light` are deepened because they're used as literal TEXT color in several rules (`.section-tag`, `.footer-details a`, `.hero-eyebrow`, `.market-card-title`, `.proof-num`, `.saving-amount`, hero-title `em`) and the original light-cyan/bright-green values were tuned for legibility on near-black, not on white, (3) two literal (non-variable) `rgba(10,26,31,...)` hardcodes — the `nav` background and the `.form-section` gradient's dark end — get light equivalents, because a leftover near-black translucent bar/gradient would show up as a dark smear on an otherwise white page. Every other rule (all the low-alpha decorative rgba washes/borders/glows) is left untouched: those are semi-transparent overlays that adapt correctly when composited over white instead of near-black. **Logo fix**: `assets/ms-strategy-logo.png` is a light cream/grey monochrome mark (confirmed by viewing the file) made for a dark background — invisible on white as-is, so `.nav-logo img`/`.footer-logo img` get `filter: invert(1)` in this theme only, which turns it into a dark, legible mark.

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>M&S Strategy — Suite à notre échange</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,301,400,401,500,501,700,701,900,901&display=swap" rel="stylesheet">
<style>
  :root {
    /* LIGHT theme (variant C) — see Task 3 rationale. Variant A (Task 4)
       reuses the original dark values unchanged. */
    --teal-deep: #0d4f5c;
    --teal-mid: #1a7a8a;
    --teal-bright: #0b6b78;
    --teal-light: #0d5866;
    --green-accent: #15803d;
    --cream: #14232a;
    --dark: #ffffff;
    --text-muted: #5c7680;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Satoshi', sans-serif; background: var(--dark); color: var(--cream); overflow-x: hidden; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 5vw; backdrop-filter: blur(16px); background: rgba(255,255,255,.8); border-bottom: 1px solid rgba(43,181,200,.15); }
  .nav-logo { display: flex; align-items: center; }
  .nav-logo img { height: 28px; width: auto; display: block; filter: invert(1); }
  .nav-cta { background: var(--green-accent); color: var(--dark); font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: .82rem; letter-spacing: .06em; padding: .6rem 1.4rem; border: none; border-radius: 2px; cursor: pointer; text-transform: uppercase; transition: transform .15s, box-shadow .15s; text-decoration: none; }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(76,222,128,.3); }
  .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 8rem 5vw 5rem; overflow: hidden; }
  .hero-bg-circle { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
  .hero-bg-circle.c1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(26,122,138,.35) 0%, transparent 70%); top: -100px; right: -150px; animation: drift 12s ease-in-out infinite alternate; }
  .hero-bg-circle.c2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(76,222,128,.1) 0%, transparent 70%); bottom: 50px; left: -80px; animation: drift 16s ease-in-out infinite alternate-reverse; }
  @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 20px) scale(1.05); } }
  .hero-eyebrow { font-family: 'Satoshi', sans-serif; font-size: .75rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--teal-light); margin-bottom: 1.5rem; opacity: 0; animation: fadeUp .6s .1s forwards; }
  .hero-title { font-family: 'Instrument Serif', serif; font-size: clamp(2.6rem, 6vw, 5rem); font-weight: 400; line-height: 1.06; max-width: 820px; opacity: 0; animation: fadeUp .7s .2s forwards; }
  .hero-title em { font-style: italic; font-weight: 400; color: var(--green-accent); font-family: 'Instrument Serif', serif; }
  .hero-sub { margin-top: 1.8rem; font-size: 1.1rem; font-weight: 300; color: var(--text-muted); max-width: 520px; line-height: 1.65; opacity: 0; animation: fadeUp .7s .35s forwards; }
  .hero-conseiller { margin-top: 1rem; font-size: .92rem; color: var(--text-muted); max-width: 520px; line-height: 1.6; opacity: 0; animation: fadeUp .7s .45s forwards; }
  .hero-proof { display: flex; gap: 2.5rem; flex-wrap: wrap; margin-top: 2.5rem; opacity: 0; animation: fadeUp .7s .5s forwards; }
  .proof-item { display: flex; flex-direction: column; gap: .2rem; }
  .proof-num { font-family: 'Satoshi', sans-serif; font-size: 2rem; font-weight: 800; color: var(--green-accent); line-height: 1; }
  .proof-label { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); }
  .hero-cta-row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; margin-top: 3rem; opacity: 0; animation: fadeUp .7s .65s forwards; }
  .btn-primary { background: var(--green-accent); color: var(--dark); font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 1rem; padding: 1rem 2.4rem; border: none; border-radius: 2px; cursor: pointer; text-decoration: none; display: inline-block; transition: transform .15s, box-shadow .2s; letter-spacing: .02em; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(76,222,128,.35); }
  .hero-free-label { font-size: .82rem; color: var(--text-muted); display: flex; align-items: center; gap: .4rem; }
  .hero-free-label::before { content: '✓'; color: var(--green-accent); font-weight: 700; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  section { position: relative; z-index: 1; }
  .section-tag { display: inline-block; font-family: 'Satoshi', sans-serif; font-size: .68rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--teal-bright); background: rgba(43,181,200,.1); border: 1px solid rgba(43,181,200,.25); padding: .3rem .8rem; border-radius: 2px; margin-bottom: 1.2rem; }
  .section-title { font-family: 'Instrument Serif', serif; font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 400; line-height: 1.1; }
  .problem-section { padding: 7rem 5vw; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  @media (max-width: 768px) { .problem-section { grid-template-columns: 1fr; gap: 3rem; } }
  .problem-copy p { margin-top: 1.5rem; color: var(--text-muted); line-height: 1.75; font-size: 1.02rem; }
  .problem-copy strong { color: var(--cream); }
  .market-card { background: linear-gradient(135deg, rgba(13,79,92,.5), rgba(26,122,138,.2)); border: 1px solid rgba(43,181,200,.2); border-radius: 4px; padding: 2rem; }
  .market-card-title { font-family: 'Satoshi', sans-serif; font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--teal-light); margin-bottom: 1.5rem; }
  .factors-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
  .factors-list li { display: flex; align-items: flex-start; gap: .8rem; font-size: .95rem; color: var(--cream); line-height: 1.5; }
  .factors-list li::before { content: '→'; color: var(--green-accent); font-weight: 700; flex-shrink: 0; margin-top: .1rem; }
  .market-warning { margin-top: 1.5rem; padding: 1rem 1.2rem; background: rgba(76,222,128,.07); border-left: 3px solid var(--green-accent); border-radius: 0 2px 2px 0; font-size: .88rem; color: var(--text-muted); }
  .market-warning strong { color: var(--green-accent); }
  .proof-section { padding: 7rem 5vw; background: linear-gradient(180deg, transparent, rgba(13,79,92,.1), transparent); }
  .proof-header { max-width: 500px; margin-bottom: 4rem; }
  .savings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
  .saving-card { border: 1px solid rgba(43,181,200,.15); border-radius: 4px; padding: 1.8rem; background: rgba(13,79,92,.15); transition: border-color .2s, transform .2s; }
  .saving-card:hover { border-color: rgba(76,222,128,.3); transform: translateY(-3px); }
  .saving-amount { font-family: 'Satoshi', sans-serif; font-size: 2.2rem; font-weight: 800; color: var(--green-accent); line-height: 1; }
  .saving-period { font-size: .78rem; color: var(--text-muted); font-weight: 300; margin-bottom: .8rem; display: block; }
  .saving-desc { font-size: .88rem; color: var(--text-muted); line-height: 1.55; }
  .steps-section { padding: 7rem 5vw; }
  .steps-header { max-width: 500px; margin-bottom: 4rem; }
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; background: rgba(43,181,200,.1); border: 1px solid rgba(43,181,200,.12); border-radius: 4px; overflow: hidden; }
  .step-card { background: var(--dark); padding: 2rem 1.8rem; position: relative; transition: background .2s; }
  .step-card:hover { background: rgba(13,79,92,.4); }
  .step-num { font-family: 'Satoshi', sans-serif; font-size: 3.5rem; font-weight: 800; color: rgba(43,181,200,.12); line-height: 1; margin-bottom: .8rem; }
  .step-title { font-family: 'Satoshi', sans-serif; font-size: .95rem; font-weight: 700; color: var(--cream); margin-bottom: .7rem; }
  .step-body { font-size: .88rem; color: var(--text-muted); line-height: 1.65; }
  .form-section { padding: 8rem 5vw; background: linear-gradient(135deg, rgba(234,246,248,.7), #ffffff); position: relative; overflow: hidden; }
  .form-container { max-width: 660px; margin: 0 auto; position: relative; z-index: 1; }
  .form-header { margin-bottom: 3rem; }
  .form-header p { margin-top: 1.2rem; color: var(--text-muted); line-height: 1.7; font-size: 1rem; }
  .form-card { background: rgba(13,79,92,.2); border: 1px solid rgba(43,181,200,.2); border-radius: 6px; padding: 2.5rem; }
  .form-trust { display: flex; align-items: flex-start; gap: .7rem; font-size: .88rem; color: var(--text-muted); line-height: 1.6; padding: 1rem 1.1rem; background: rgba(76,222,128,.06); border: 1px solid rgba(76,222,128,.18); border-radius: 3px; }
  .form-trust strong { color: var(--cream); }
  .form-submit { width: 100%; background: var(--green-accent); color: var(--dark); font-family: 'Satoshi', sans-serif; font-weight: 800; font-size: 1rem; padding: 1.1rem; border: none; border-radius: 3px; cursor: pointer; letter-spacing: .04em; transition: transform .15s, box-shadow .2s; margin-top: 1.5rem; }
  .form-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(76,222,128,.3); }
  .form-reassurance { margin-top: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
  .reassurance-item { font-size: .75rem; color: var(--text-muted); display: flex; align-items: center; gap: .35rem; }
  .reassurance-item::before { content: '✓'; color: var(--green-accent); font-weight: 700; }
  footer { padding: 3rem 5vw; border-top: 1px solid rgba(43,181,200,.1); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; }
  .footer-logo img { height: 24px; width: auto; display: block; filter: invert(1); }
  .footer-details { font-size: .8rem; color: var(--text-muted); line-height: 1.7; }
  .footer-details a { color: var(--teal-bright); text-decoration: none; }
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity .65s ease, transform .65s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  .sticky-cta { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; background: var(--dark); border-top: 1px solid rgba(43,181,200,.15); padding: 1rem 5vw; }
  @media (max-width: 640px) { .sticky-cta { display: block; } }
  .sticky-cta a { display: block; background: var(--green-accent); color: var(--dark); font-family: 'Satoshi', sans-serif; font-weight: 800; font-size: .95rem; text-align: center; padding: .9rem; border-radius: 3px; text-decoration: none; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo"><img src="assets/ms-strategy-logo.png" alt="M&S Strategy"></div>
  <a href="#upload" class="nav-cta">Envoyer ma facture →</a>
</nav>

<section class="hero">
  <div class="hero-bg-circle c1"></div>
  <div class="hero-bg-circle c2"></div>
  <p class="hero-eyebrow">
    <span class="js-prenom-line" hidden>Bonjour <span class="js-prenom"></span>, suite à notre échange</span>
    <span class="js-generic-line">Suite à notre échange</span>
  </p>
  <h1 class="hero-title">Un seul document. <em>On s'occupe du reste.</em></h1>
  <p class="hero-sub">Il ne reste qu'une étape : nous transmettre votre facture actuelle. Nous l'analysons et revenons vers vous sous 48h avec un chiffrage précis pour votre entreprise.</p>
  <p class="hero-conseiller">
    <span class="js-conseiller-line" hidden><span class="js-conseiller"></span> vous a présenté cette démarche — cette page reprend l'essentiel.</span>
    <span class="js-generic-conseiller-line">Notre équipe vous a présenté cette démarche — cette page reprend l'essentiel.</span>
  </p>
  <div class="hero-proof">
    <div class="proof-item"><span class="proof-num">19%</span><span class="proof-label">Économies moyennes</span></div>
    <div class="proof-item"><span class="proof-num">48h</span><span class="proof-label">Délai de réponse</span></div>
    <div class="proof-item"><span class="proof-num">70M</span><span class="proof-label">kWh négociés en 2025</span></div>
  </div>
  <div class="hero-cta-row">
    <a href="#upload" class="btn-primary">Envoyer ma facture</a>
    <span class="hero-free-label">Analyse gratuite · Sans engagement · Réponse sous 48h</span>
  </div>
</section>

<section class="problem-section reveal">
  <div class="problem-copy">
    <span class="section-tag">Pourquoi votre facture, pas un simulateur</span>
    <h2 class="section-title">Un comparateur vous fait <em style="color:var(--green-accent);font-style:italic">deviner</em> votre consommation. Nous, on la lit.</h2>
    <p>La plupart des outils en ligne vous demandent d'estimer votre puissance souscrite, votre répartition heures pleines/creuses, votre volume annuel. Ce sont des approximations — et une approximation ne négocie rien.</p>
    <p>Votre facture, elle, contient tout : le TURPE, les clauses d'indexation, la vraie structure de votre contrat actuel. C'est ce document-là qu'on analyse — pas une estimation.</p>
  </div>
  <div class="market-card">
    <p class="market-card-title">Ce qu'un formulaire standard vous demande de déclarer</p>
    <ul class="factors-list">
      <li>Une puissance souscrite approximative</li>
      <li>Une répartition heures pleines/creuses estimée</li>
      <li>Un volume de consommation annuel arrondi</li>
    </ul>
    <div class="market-warning"><strong>Nous, on saute cette étape.</strong> Votre facture réelle contient déjà ces informations — avec la précision qu'une estimation n'aura jamais.</div>
  </div>
</section>

<section class="proof-section reveal">
  <div class="proof-header">
    <span class="section-tag">En toute transparence</span>
    <h2 class="section-title">Une méthode <em style="color:var(--green-accent);font-style:italic">reproductible</em>, pas un argument marketing.</h2>
  </div>
  <div class="savings-grid">
    <div class="saving-card"><div class="saving-amount">2012</div><span class="saving-period">Indépendant depuis</span><p class="saving-desc">Cabinet de courtage en énergie indépendant, avant même l'arrivée de la plupart des acteurs du marché actuel.</p></div>
    <div class="saving-card"><div class="saving-amount">0€</div><span class="saving-period">Facturé au client</span><p class="saving-desc">Rémunération exclusivement par commission fournisseur — jamais par vous, que vous signiez ou non à l'issue de l'étude.</p></div>
    <div class="saving-card"><div class="saving-amount">80+</div><span class="saving-period">Collaborateurs</span><p class="saving-desc">Répartis dans 8 agences en France — une structure qui traite des dossiers tous les jours, pas un service ponctuel.</p></div>
    <div class="saving-card"><div class="saving-amount">48h</div><span class="saving-period">Premier retour</span><p class="saving-desc">Le temps qu'il nous faut pour analyser votre facture et revenir vers vous avec un chiffrage précis.</p></div>
  </div>
</section>

<section class="steps-section reveal">
  <div class="steps-header">
    <span class="section-tag">Comment ça marche</span>
    <h2 class="section-title">De l'analyse à la signature, en 4 étapes.</h2>
  </div>
  <div class="steps-grid">
    <div class="step-card"><div class="step-num">01</div><div class="step-title">Analyse gratuite</div><p class="step-body">Envoyez-nous votre dernière facture. Nous identifions vos leviers d'optimisation et votre fenêtre de négociation idéale.</p></div>
    <div class="step-card"><div class="step-num">02</div><div class="step-title">Appel d'offres</div><p class="step-body">Nous consultons simultanément l'ensemble des fournisseurs pertinents pour votre profil — pas seulement 3 ou 4 acteurs.</p></div>
    <div class="step-card"><div class="step-num">03</div><div class="step-title">Comparatif</div><p class="step-body">Vous recevez un tableau comparatif clair : prix, conditions, clauses d'indexation. Vous gardez la décision finale.</p></div>
    <div class="step-card"><div class="step-num">04</div><div class="step-title">Suivi dans la durée</div><p class="step-body">Une fois signé, nous suivons votre dossier et vous alertons avant votre prochaine échéance de renouvellement.</p></div>
  </div>
</section>

<section class="form-section" id="upload">
  <div class="form-container">
    <div class="form-header reveal">
      <span class="section-tag">Dernière étape</span>
      <h2 class="section-title">Envoyez votre facture. <em style="color:var(--green-accent);font-style:italic">On fait le reste.</em></h2>
      <p>Réponse sous 48h, avec un chiffrage qui part de votre vraie situation — pas d'une estimation.
      <span class="js-conseiller-line" hidden> Vous avez déjà fait le plus dur en échangeant avec <span class="js-conseiller"></span> — il ne reste que l'envoi du document.</span></p>
    </div>
    <div class="form-card reveal">
      <div class="form-trust">🔒 <span><strong>Transmission chiffrée et confidentielle.</strong> Votre facture et vos coordonnées sont reçues sur un espace privé, consulté uniquement par notre équipe — jamais partagées ni publiées.</span></div>
      <button type="button" class="form-submit" onclick="openTallyForm('suivi-b2b-c')">Transmettre ma facture en toute sécurité →</button>
      <div class="form-reassurance">
        <span class="reassurance-item">Gratuit & sans engagement</span>
        <span class="reassurance-item">Réponse sous 48h</span>
        <span class="reassurance-item">Données confidentielles</span>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo"><img src="assets/ms-strategy-logo.png" alt="M&S Strategy"></div>
  <div class="footer-details">
    <a href="mailto:msstrategy@yahoo.com">msstrategy@yahoo.com</a> ·
    Tél : 09 52 92 64 98 · Commercial : 07 83 07 07 49<br>
    1366 Av. des Platanes, 34000 Lattes · SIREN 752 139 477
  </div>
</footer>

<div class="sticky-cta">
  <a href="#upload">Envoyer ma facture — sans engagement</a>
</div>

<script src="assets/analytics.js"></script>
<script src="assets/suivi-personalize.js"></script>
<script>
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  reveals.forEach(r => obs.observe(r));

  function openTallyForm(source) {
    if (window.posthog) posthog.capture('cta_click', { label: 'Transmettre ma facture en toute sécurité', href: '#upload' });
    Tally.openPopup('kd15W1', { layout: 'modal', width: 700, hiddenFields: { source } });
  }
</script>
<script async src="https://tally.so/widgets/embed.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add ms-strategy-suivi-b2b.html
git commit -m "Add ms-strategy-suivi-b2b.html (variant C)"
```

---

### Task 4: `ms-strategy-suivi-b2b-a.html` (variant A — DARK theme)

**Files:**
- Create: `ms-strategy-suivi-b2b-a.html`

**Interfaces:** same markup/selectors as Task 3.

**Theme note — read before starting**: Task 3's `<style>` block is the LIGHT theme (variant C only). This file is variant A, which stays on the ORIGINAL DARK theme. Do **not** copy Task 3's `<style>` block. Instead, use this dark `:root` block plus the three rules below it, and keep every other CSS rule identical to Task 3's (all the untouched decorative rgba rules are shared verbatim between both themes):

```css
  :root {
    --teal-deep: #0d4f5c;
    --teal-mid: #1a7a8a;
    --teal-bright: #2bb5c8;
    --teal-light: #5ecfdc;
    --green-accent: #4cde80;
    --cream: #f5f0e8;
    --dark: #0a1a1f;
    --text-muted: #8aacb4;
  }
```
```css
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 5vw; backdrop-filter: blur(16px); background: rgba(10,26,31,.75); border-bottom: 1px solid rgba(43,181,200,.12); }
  .nav-logo { display: flex; align-items: center; }
  .nav-logo img { height: 28px; width: auto; display: block; }
```
```css
  .form-section { padding: 8rem 5vw; background: linear-gradient(135deg, rgba(13,79,92,.25), rgba(10,26,31,1)); position: relative; overflow: hidden; }
```
```css
  .footer-logo img { height: 24px; width: auto; display: block; }
```
(i.e. the four blocks Task 3 changed from the original dark stylesheet — revert exactly those four, keep everything else from Task 3's file as-is.)

Then, starting from Task 3's file (with the dark CSS above substituted back in), apply these content replacements:

`<title>` and hero copy — replace:
```html
<title>M&S Strategy — Suite à notre échange</title>
```
with the same title (unchanged), and replace the `<h1 class="hero-title">`/`<p class="hero-sub">` block:
```html
  <h1 class="hero-title">Un algorithme ne connaît pas votre contrat. <em>Une personne, oui.</em></h1>
  <p class="hero-sub">Les comparateurs en ligne vous font déclarer une consommation approximative dans un formulaire générique. Nous, on veut votre vraie facture — celle qui contient tout ce qu'un algorithme ne voit jamais.</p>
```

Replace the `.problem-section` block:
```html
<section class="problem-section reveal">
  <div class="problem-copy">
    <span class="section-tag">Ce qu'un algorithme ne voit pas</span>
    <h2 class="section-title">Le contraste n'est pas dans le discours. <em style="color:var(--green-accent);font-style:italic">Il est dans le document.</em></h2>
    <p>Un formulaire en ligne s'arrête à ce que vous êtes prêt à taper : une estimation de consommation, une puissance approximative. Il ne voit ni vos clauses d'indexation, ni votre historique, ni la vraie structure tarifaire de votre contrat.</p>
    <p>Votre facture, elle, ne ment pas et ne s'arrondit pas. C'est pour ça qu'on vous la demande directement, plutôt que de vous faire remplir un profil type.</p>
  </div>
  <div class="market-card">
    <p class="market-card-title">Ce qu'un formulaire standard vous demande de déclarer</p>
    <ul class="factors-list">
      <li>Une puissance souscrite approximative</li>
      <li>Une répartition heures pleines/creuses estimée</li>
      <li>Un volume de consommation annuel arrondi</li>
    </ul>
    <div class="market-warning"><strong>On part du document, pas de la mémoire.</strong> C'est la différence entre un chiffrage précis et une estimation qui rassure sans engager à rien.</div>
  </div>
</section>
```

Replace the Tally `source` in the form button:
```html
<button type="button" class="form-submit" onclick="openTallyForm('suivi-b2b-a')">Transmettre ma facture en toute sécurité →</button>
```

Everything else (nav, hero-proof stats, hero-conseiller block, proof-section credibility cards, steps-section, footer, scripts) is **byte-identical** to Task 3.

- [ ] **Step 2: Commit**

```bash
git add ms-strategy-suivi-b2b-a.html
git commit -m "Add ms-strategy-suivi-b2b-a.html (variant A)"
```

---

### Task 5: `ms-strategy-suivi-b2c.html` (variant C — canonical file)

**Files:**
- Create: `ms-strategy-suivi-b2c.html`

**Interfaces:** identical pattern to Task 3, B2C audience.

- [ ] **Step 1: Copy Task 3's full file, then change these pieces**

`<title>`:
```html
<title>M&S Strategy — Suite à notre échange</title>
```
(unchanged)

Hero:
```html
  <h1 class="hero-title">Votre facture augmente. <em>On vous dit pourquoi — et quoi faire.</em></h1>
  <p class="hero-sub">Il ne reste qu'une étape : nous transmettre votre facture actuelle. Nous l'analysons et revenons vers vous sous 48h avec des offres claires, adaptées à votre foyer.</p>
```

hero-proof stats (B2C figures, from `b2c.html`'s own hero):
```html
  <div class="hero-proof">
    <div class="proof-item"><span class="proof-num">100k+</span><span class="proof-label">Foyers accompagnés / an</span></div>
    <div class="proof-item"><span class="proof-num">48h</span><span class="proof-label">Délai de réponse</span></div>
    <div class="proof-item"><span class="proof-num">2012</span><span class="proof-label">En activité depuis</span></div>
  </div>
```

`.problem-section` (preuve n°1, B2C):
```html
<section class="problem-section reveal">
  <div class="problem-copy">
    <span class="section-tag">Pourquoi votre facture, pas un simulateur</span>
    <h2 class="section-title">Un comparateur vous fait <em style="color:var(--green-accent);font-style:italic">deviner</em> votre logement. Nous, on lit votre facture.</h2>
    <p>La plupart des simulateurs en ligne vous demandent d'estimer votre consommation annuelle, votre type de chauffage, la surface de votre logement. Ce sont des moyennes — et une moyenne ne ressemble jamais tout à fait à votre vraie situation.</p>
    <p>Votre facture, elle, contient votre consommation réelle, votre option tarifaire actuelle, votre vraie date d'échéance. C'est ce document-là qu'on regarde — pas une estimation qui vous ressemble à peu près.</p>
  </div>
  <div class="market-card">
    <p class="market-card-title">Ce qu'un simulateur standard vous demande de déclarer</p>
    <ul class="factors-list">
      <li>Une consommation annuelle estimée</li>
      <li>Un type de logement générique</li>
      <li>Une surface habitable arrondie</li>
    </ul>
    <div class="market-warning"><strong>Nous, on saute cette étape.</strong> Votre facture contient déjà ces informations — avec la précision qu'une estimation n'aura jamais.</div>
  </div>
</section>
```

Steps section (B2C triptyque, from `b2c.html`):
```html
<section class="steps-section reveal">
  <div class="steps-header">
    <span class="section-tag">Comment ça marche</span>
    <h2 class="section-title">De l'analyse à la signature, en 4 étapes.</h2>
  </div>
  <div class="steps-grid">
    <div class="step-card"><div class="step-num">01</div><div class="step-title">Analyse gratuite</div><p class="step-body">Envoyez-nous votre dernière facture. Nous identifions vos leviers d'économie en quelques minutes.</p></div>
    <div class="step-card"><div class="step-num">02</div><div class="step-title">Mise en concurrence</div><p class="step-body">Nous comparons les offres de l'ensemble des fournisseurs actifs sur le marché résidentiel.</p></div>
    <div class="step-card"><div class="step-num">03</div><div class="step-title">Recommandation</div><p class="step-body">Vous recevez une proposition claire, chiffrée, sans jargon. Vous gardez la décision finale.</p></div>
    <div class="step-card"><div class="step-num">04</div><div class="step-title">Suivi dans la durée</div><p class="step-body">Une fois votre contrat signé, nous vous alertons avant votre prochaine échéance de renouvellement.</p></div>
  </div>
</section>
```

Tally source:
```html
<button type="button" class="form-submit" onclick="openTallyForm('suivi-b2c-c')">Transmettre ma facture en toute sécurité →</button>
```

The `.proof-section` credibility block (2012 / 0€ / 80+ / 48h) is **byte-identical** to Task 3 — same facts apply to both audiences. Nav, hero-eyebrow, hero-conseiller, footer, scripts also byte-identical.

- [ ] **Step 2: Commit**

```bash
git add ms-strategy-suivi-b2c.html
git commit -m "Add ms-strategy-suivi-b2c.html (variant C)"
```

---

### Task 6: `ms-strategy-suivi-b2c-a.html` (variant A — DARK theme)

**Files:**
- Create: `ms-strategy-suivi-b2c-a.html`

**Theme note**: same as Task 4 — Task 5's `<style>` block is LIGHT (variant C only). Revert the same four blocks (`:root`, `nav`+`.nav-logo img`, `.form-section`, `.footer-logo img`) to the dark values given in full in Task 4, keep everything else from Task 5's file as-is.

- [ ] **Step 1: Copy Task 5's file (with the dark CSS from Task 4 substituted back in), then change these pieces**

Hero:
```html
  <h1 class="hero-title">Un simulateur ne connaît pas votre logement. <em>Une personne, oui.</em></h1>
  <p class="hero-sub">Les comparateurs en ligne vous font déclarer une consommation estimée, un type de logement générique. Nous, on regarde votre vraie facture — avec ce qu'elle dit vraiment de votre situation.</p>
```

`.problem-section`:
```html
<section class="problem-section reveal">
  <div class="problem-copy">
    <span class="section-tag">Ce qu'un simulateur ne voit pas</span>
    <h2 class="section-title">Le contraste n'est pas dans le discours. <em style="color:var(--green-accent);font-style:italic">Il est dans le document.</em></h2>
    <p>Un simulateur en ligne s'arrête à ce que vous êtes prêt à cocher : un type de logement, une estimation de consommation. Il ne voit ni votre historique, ni votre option tarifaire actuelle, ni la vraie date d'échéance de votre contrat.</p>
    <p>Votre facture, elle, ne s'arrondit pas. C'est pour ça qu'on vous la demande directement, plutôt que de vous faire remplir un profil type.</p>
  </div>
  <div class="market-card">
    <p class="market-card-title">Ce qu'un simulateur standard vous demande de déclarer</p>
    <ul class="factors-list">
      <li>Une consommation annuelle estimée</li>
      <li>Un type de logement générique</li>
      <li>Une surface habitable arrondie</li>
    </ul>
    <div class="market-warning"><strong>On part du document, pas d'une moyenne.</strong> C'est la différence entre une offre qui vous correspond vraiment et une estimation qui ressemble à tout le monde.</div>
  </div>
</section>
```

Tally source:
```html
<button type="button" class="form-submit" onclick="openTallyForm('suivi-b2c-a')">Transmettre ma facture en toute sécurité →</button>
```

Everything else byte-identical to Task 5 (hero-proof stats, proof-section, steps-section, footer, scripts).

- [ ] **Step 2: Commit**

```bash
git add ms-strategy-suivi-b2c-a.html
git commit -m "Add ms-strategy-suivi-b2c-a.html (variant A)"
```

---

### Task 7: `generateur-suivi.html` — internal link generator

**Files:**
- Create: `generateur-suivi.html`

**Interfaces:**
- Consumes: nothing (pure client-side string building).
- Produces: a copy-pasteable URL pointing at `ms-strategy-suivi-b2b.html` or `ms-strategy-suivi-b2c.html` (never the `-a.html` variant directly — the middleware from Task 1 decides the variant).

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>Générateur de lien — usage interne</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #0a1a1f; color: #f5f0e8; max-width: 480px; margin: 4rem auto; padding: 0 1.5rem; }
  h1 { font-size: 1.3rem; margin-bottom: 1.5rem; }
  label { display: block; font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: #8aacb4; margin: 1rem 0 .3rem; }
  select, input { width: 100%; padding: .6rem .7rem; background: #0d2029; border: 1px solid #2bb5c8; border-radius: 3px; color: #f5f0e8; font-size: .95rem; }
  button { margin-top: 1.5rem; width: 100%; padding: .8rem; background: #4cde80; color: #0a1a1f; border: none; border-radius: 3px; font-weight: 700; cursor: pointer; }
  #result { margin-top: 1.5rem; padding: 1rem; background: #0d2029; border-radius: 3px; word-break: break-all; font-size: .85rem; display: none; }
</style>
</head>
<body>
<h1>Générateur de lien de suivi</h1>

<label for="page">Page cible</label>
<select id="page">
  <option value="ms-strategy-suivi-b2b.html">B2B</option>
  <option value="ms-strategy-suivi-b2c.html">B2C</option>
</select>

<label for="prenom">Prénom du prospect</label>
<input type="text" id="prenom" placeholder="Julien">

<label for="conseiller">Votre prénom (conseiller)</label>
<input type="text" id="conseiller" placeholder="Marie">

<button type="button" onclick="generate()">Générer le lien</button>

<div id="result"></div>

<script>
function generate() {
  var page = document.getElementById('page').value;
  var prenom = document.getElementById('prenom').value.trim();
  var conseiller = document.getElementById('conseiller').value.trim();

  var params = [];
  if (prenom) params.push('prenom=' + encodeURIComponent(prenom));
  if (conseiller) params.push('conseiller=' + encodeURIComponent(conseiller));

  var url = window.location.origin + '/' + page + (params.length ? '?' + params.join('&') : '');

  var result = document.getElementById('result');
  result.style.display = 'block';
  result.innerHTML = '<div style="margin-bottom:.6rem">' + url + '</div><button type="button" onclick="copyLink(this)">Copier le lien</button>';
  result.dataset.url = url;
}

function copyLink(btn) {
  var url = document.getElementById('result').dataset.url;
  navigator.clipboard.writeText(url).then(function () {
    btn.textContent = 'Copié !';
    setTimeout(function () { btn.textContent = 'Copier le lien'; }, 1500);
  });
}
</script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add generateur-suivi.html
git commit -m "Add internal link generator for suivi landing pages"
```

---

### Task 8: `robots.txt` — exclude the new paths

**Files:**
- Modify: `robots.txt`

- [ ] **Step 1: Add disallow lines**

Current content:
```
User-agent: *
Allow: /
Disallow: /index-b.html

Sitemap: https://www.byandry.com/sitemap.xml
```

New content:
```
User-agent: *
Allow: /
Disallow: /index-b.html
Disallow: /ms-strategy-suivi-b2b.html
Disallow: /ms-strategy-suivi-b2b-a.html
Disallow: /ms-strategy-suivi-b2c.html
Disallow: /ms-strategy-suivi-b2c-a.html
Disallow: /generateur-suivi.html

Sitemap: https://www.byandry.com/sitemap.xml
```

- [ ] **Step 2: Commit**

```bash
git add robots.txt
git commit -m "Exclude suivi landing pages and link generator from robots.txt"
```

---

### Task 9: Push, set env vars, verify on a real Vercel preview

**Files:** none (verification only)

- [ ] **Step 1: Push and open a draft PR**

```bash
git push -u origin HEAD
gh pr create --draft --title "Pages de suivi personnalisées B2B/B2C (test A/C)" --body "Voir docs/superpowers/specs/2026-07-15-ms-strategy-suivi-landing-design.md. Nécessite SUIVI_TOOL_USER/SUIVI_TOOL_PASS en variables d'environnement Vercel avant que generateur-suivi.html soit utilisable."
```

- [ ] **Step 2: Ask the user to set the Basic Auth env vars**

In Vercel dashboard → Project Settings → Environment Variables, add `SUIVI_TOOL_USER` and `SUIVI_TOOL_PASS` (any values the user chooses) on the Preview environment at minimum. Without these, `generateur-suivi.html` returns 401 for everyone — safe default, but unusable until set.

- [ ] **Step 3: Verify the A/C split and query-string preservation with curl**

```bash
curl -sD - -o /dev/null "<preview-url>/ms-strategy-suivi-b2b.html" | grep -i "set-cookie"
```
Expected: `Set-Cookie: ms_suivi_variant=A` or `=C`.

```bash
curl -s -H "Cookie: ms_suivi_variant=A" "<preview-url>/ms-strategy-suivi-b2b.html?prenom=Julien&conseiller=Marie" | grep -o "Un algorithme ne connaît pas votre contrat"
```
Expected: string found (confirms rewrite to `-a.html` happened).

```bash
curl -s -H "Cookie: ms_suivi_variant=A" "<preview-url>/ms-strategy-suivi-b2b.html?prenom=Julien&conseiller=Marie" -v 2>&1 | grep -i "location\|< HTTP"
```
Manually confirm the response body still contains the query-driven content path (this is the flagged assumption from Task 1 — if it silently dropped `prenom`/`conseiller`, `assets/suivi-personalize.js` would have nothing to read; verify by loading the URL in a real browser and confirming "Bonjour Julien" appears, not the generic fallback).

```bash
curl -s -H "Cookie: ms_suivi_variant=C" "<preview-url>/ms-strategy-suivi-b2b.html" | grep -o "Un seul document"
```
Expected: string found (variant C = canonical file, no rewrite).

```bash
curl -sD - -o /dev/null -A "Googlebot/2.1" "<preview-url>/ms-strategy-suivi-b2b.html" | grep -i "set-cookie"
```
Expected: no `Set-Cookie` header for the bot user-agent.

- [ ] **Step 4: Verify Basic Auth on the generator**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "<preview-url>/generateur-suivi.html"
```
Expected: `401` before env vars are set, or if credentials are wrong.

```bash
curl -s -o /dev/null -w "%{http_code}\n" -u "<user>:<pass>" "<preview-url>/generateur-suivi.html"
```
Expected: `200` once env vars are set and correct credentials are passed.

- [ ] **Step 5: Manual browser check**

Open `<preview-url>/ms-strategy-suivi-b2b.html?prenom=Julien&conseiller=Marie` in a real browser: confirm "Bonjour Julien" and "Marie vous a présenté..." render, no console errors, CTA button opens the Tally popup, and the reinforcement line near the final CTA ("Vous avez déjà fait le plus dur...") shows Marie's name. Repeat once without query params to confirm the generic fallback text reads naturally. Repeat for the B2C page.

Also confirm the **light/dark theme pairing** on both pages: cookie `ms_suivi_variant=C` → white background, dark legible text, logo visible (dark, not invisible-on-white); cookie `ms_suivi_variant=A` → original dark theme, logo visible (light-on-dark, as before). Check both in light and dark OS/browser mode if easy, since this is independent of the page's own theme.

- [ ] **Step 6: Confirm PostHog events**

Click the "Transmettre ma facture" button on the preview, then check PostHog Activity for a `cta_click` event carrying `suivi_variant: 'A'` or `'C'`.

- [ ] **Step 7: Update `handoff.md`**

Add an entry noting: suivi pages live on the branch, env vars needed for the generator, PostHog variant property name (`suivi_variant`, distinct from the home's `variant`).

```bash
git add handoff.md
git commit -m "Update handoff notes for suivi landing pages"
git push
```

- [ ] **Step 8: Mark the PR ready**

Only once the user confirms env vars are set and the manual checks above pass:

```bash
gh pr ready
```
