# A/B Test Homepage (M&S Strategy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split home page traffic 50/50 between the current design (variant A)
and a new sober black & white design (variant B), with PostHog tracking
tagged by variant so conversion can be compared.

**Architecture:** A Vercel Edge Middleware picks a variant per visitor (sticky
via cookie) and rewrites `/` to `/index-b.html` for variant B, leaving `/`
untouched for variant A — no redirect, no flash, same URL either way. Variant
B is a full copy of `index.html` with the color tokens and a small CSS
override block changed (same HTML structure/content, different skin). A
shared `assets/analytics.js` loads PostHog on both pages, tags every event
with the served variant, and captures a single delegated `cta_click` event
for every call-to-action on the page.

**Tech Stack:** Static HTML/CSS/vanilla JS (no build step, no framework —
matches the rest of `~/SITE MS`). Vercel Edge Middleware (`@vercel/edge`).
PostHog JS (EU cloud).

## Global Constraints

- No other page besides `index.html`/`index-b.html` is touched by this work.
- `index-b.html` must have exactly the same sections, order, and copy as
  `index.html` — only visual styling and the two additive JS effects
  (cursor orb, analytics) differ.
- `--teal:#1a7a8a` and `--green:#4cde80` (and their `-light`/`-glow`/`-dark`
  variants) keep their exact hex values in variant B — only the
  background/text/muted tokens change.
- No cookie-consent banner in this work (explicit decision, see spec).
- Search engines and known bots must always see variant A and must never
  index `/index-b.html` as a separate page (avoid duplicate-content SEO
  regression on an existing site that has invested in SEO metadata).
- This project has no automated test suite (static site, no build — see
  `handoff.md`). "Testing" in this plan means real verification: curl checks
  against headers/HTML, and manual browser checks (desktop + mobile),
  consistent with how the rest of the site has been verified so far.

---

### Task 1: Vercel Edge Middleware — A/B split

**Files:**
- Create: `package.json`
- Create: `middleware.js`

**Interfaces:**
- Produces: cookie `ms_variant` (value `A` or `B`) readable by client-side JS
  via `document.cookie` in Task 4.
- Produces: `/index-b.html` served transparently at `/` for variant B.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "site-ms",
  "private": true,
  "dependencies": {
    "@vercel/edge": "^1.1.2"
  }
}
```

- [ ] **Step 2: Create `middleware.js`**

```js
import { next, rewrite } from '@vercel/edge';

export const config = { matcher: '/' };

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bots always get variant A, never get the cookie, never see B rewritten
  // at "/" — keeps SEO/crawling consistent and avoids duplicate content.
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
```

- [ ] **Step 3: Commit**

```bash
git add package.json middleware.js
git commit -m "Add Vercel Edge Middleware for homepage A/B split"
```

*(This can't be verified locally without a live Vercel deployment — Edge
Middleware only runs on Vercel's edge network. Verification happens in
Task 7 against the pushed branch's preview deployment.)*

---

### Task 2: `index-b.html` base — copy, SEO safety, light theme tokens

**Files:**
- Create: `index-b.html` (copy of `index.html`)
- Modify: `robots.txt`

**Interfaces:**
- Consumes: nothing (static copy).
- Produces: `index-b.html` with light-theme `:root` tokens, ready for the
  override block added in Task 3.

- [ ] **Step 1: Copy the file**

```bash
cp index.html index-b.html
```

- [ ] **Step 2: Add `noindex` to `index-b.html`'s `<head>`**

Find this line near the top of `index-b.html`:

```html
<meta name="keywords" content="courtier énergie, courtage énergie professionnels, comparer offres énergie, négocier contrat gaz électricité, courtier indépendant énergie, réduire facture énergie entreprise">
```

Add immediately after it:

```html
<meta name="robots" content="noindex, nofollow">
```

- [ ] **Step 3: Disallow `index-b.html` in `robots.txt`**

Read the current `robots.txt` first (`cat robots.txt`), then add this line
to it (keep all existing content):

```
Disallow: /index-b.html
```

- [ ] **Step 4: Swap the `:root` tokens in `index-b.html` for the light/sober theme**

In `index-b.html` only, find:

```css
:root{
  --teal:#1a7a8a;
  --teal-dark:#0d4f5c;
  --teal-mid:#156a78;
  --teal-light:#2bb5c8;
  --teal-glow:#5ecfdc;
  --green:#4cde80;
  --green-glow:#7aeea4;
  --dark:#07131a;
  --dark2:#0a1f28;
  --cream:#f5f0e8;
  --muted:#8aacb4;
  --muted2:#5a8a96;
}
```

Replace with (teal/green values untouched, only the background/text/muted
tokens flip to a light, sober palette — every rule in the stylesheet that
reads `var(--dark)`/`var(--cream)`/`var(--muted*)` inherits this
automatically):

```css
:root{
  --teal:#1a7a8a;
  --teal-dark:#0d4f5c;
  --teal-mid:#156a78;
  --teal-light:#2bb5c8;
  --teal-glow:#5ecfdc;
  --green:#4cde80;
  --green-glow:#7aeea4;
  --dark:#faf9f6;
  --dark2:#f2f0ea;
  --cream:#141414;
  --muted:#5a5a58;
  --muted2:#3a3a38;
}
```

- [ ] **Step 5: Fix the nav bar's hardcoded dark background**

The nav bar doesn't use a token for its background (it's a literal dark
rgba, independent of `--dark`). Find, in `index-b.html`:

```css
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 5vw;background:rgba(7,19,26,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(26,122,138,.18)}
```

Replace with:

```css
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 5vw;background:rgba(250,249,246,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(26,122,138,.18)}
```

- [ ] **Step 6: Verify in a browser (informal, before Task 3 polish)**

Open `index-b.html` directly as a local file in a browser. Expect: light
background, dark text, teal/green accents still visible on stats/CTAs, nav
bar legible. Some glow effects and hover colors will still look like the
dark-theme version — that's expected, Task 3 fixes those.

- [ ] **Step 7: Commit**

```bash
git add index-b.html robots.txt
git commit -m "Add index-b.html base with light/sober theme tokens"
```

---

### Task 3: `index-b.html` polish — remove glows, add hover micro-interactions, cursor orb

**Files:**
- Modify: `index-b.html`

**Interfaces:**
- Consumes: `.ca` span already present in every CTA's markup (e.g.
  `<a href="b2b.html" class="pcta">Obtenir mon étude gratuite <span class="ca">→</span></a>`)
  — no HTML changes needed for the arrow rotation, only CSS.
- Produces: final variant-B visual (validated against the Artifact preview
  approved by the user).

- [ ] **Step 1: Remove the two hardcoded glow blobs**

`index-b.html` has two `<div class="cta-glow" style="background:radial-gradient(...)">`
elements (in the calculator CTA band and the closing CTA band). Sober theme
doesn't use them. Add this rule to the stylesheet (see Step 5 for where the
whole override block goes) rather than editing each inline style:

```css
.cta-glow{display:none}
```

- [ ] **Step 2: Remove glow shadows on hero CTAs and CTA band buttons**

Find, in `index-b.html`:

```css
.hero.hl .panel-b2b .pcta{background:var(--teal-light);color:var(--dark);transform:translateY(-3px);box-shadow:0 14px 36px rgba(43,181,200,.5),0 0 70px rgba(43,181,200,.18)}
```

Replace with:

```css
.hero.hl .panel-b2b .pcta{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
```

Find:

```css
.hero.hr .panel-b2c .pcta{background:var(--green-glow);color:var(--dark);transform:translateY(-3px);box-shadow:0 14px 36px rgba(76,222,128,.5),0 0 70px rgba(76,222,128,.18)}
```

Replace with:

```css
.hero.hr .panel-b2c .pcta{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
```

Find:

```css
.cta-btn.ct-teal:hover{background:var(--teal-light);color:var(--dark);transform:translateY(-3px);box-shadow:0 14px 36px rgba(43,181,200,.42)}
```

Replace with:

```css
.cta-btn.ct-teal:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
```

Find:

```css
.cta-btn.ct-green:hover{background:var(--green-glow);transform:translateY(-3px);box-shadow:0 14px 36px rgba(76,222,128,.42)}
```

Replace with:

```css
.cta-btn.ct-green:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
```

- [ ] **Step 3: Remove the text-shadow glow on hero stat numbers**

Find:

```css
.hero.hl .panel-b2b .sn{color:var(--teal-glow);text-shadow:0 0 24px rgba(94,207,220,.55)}
```

Replace with:

```css
.hero.hl .panel-b2b .sn{color:var(--teal-glow);text-shadow:none}
```

Find:

```css
.hero.hr .panel-b2c .sn{color:var(--green-glow);text-shadow:0 0 24px rgba(76,222,128,.55)}
```

Replace with:

```css
.hero.hr .panel-b2c .sn{color:var(--green-glow);text-shadow:none}
```

- [ ] **Step 4: Add arrow-rotation to the existing `.ca` transition**

Find:

```css
.ca{display:inline-block;transition:transform .26s}
.pcta:hover .ca{transform:translateX(4px)}
```

Replace with:

```css
.ca{display:inline-block;transition:transform .3s cubic-bezier(.4,0,.2,1)}
.pcta:hover .ca{transform:rotate(45deg)}
```

Find:

```css
.cta-btn .ca{display:inline-block;transition:transform .26s}
.cta-btn:hover .ca{transform:translateX(4px)}
```

Replace with:

```css
.cta-btn .ca{display:inline-block;transition:transform .3s cubic-bezier(.4,0,.2,1)}
.cta-btn:hover .ca{transform:rotate(45deg)}
```

- [ ] **Step 5: Append the remaining overrides (nav hover, watermark desaturation, cursor orb) as one block just before `</style>`**

```css
/* ── VARIANT B: sober overrides ── */
.bgw{filter:grayscale(1);opacity:.55}
.nlinks li:nth-child(odd) a:hover{color:var(--teal)}
.nlinks li:nth-child(even) a:hover{color:var(--green)}
.ncta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;box-shadow:none}

#orb{
  position:fixed;
  top:0;left:0;
  width:380px;height:380px;
  margin-left:-190px;margin-top:-190px;
  border-radius:50%;
  background:radial-gradient(circle at 35% 35%, rgba(43,181,200,.28), rgba(76,222,128,.20) 55%, transparent 72%);
  filter:blur(64px);
  pointer-events:none;
  z-index:1;
  opacity:0;
  transition:opacity .5s ease;
  will-change:transform;
}
body.has-pointer #orb{opacity:1}
@media(prefers-reduced-motion:reduce){#orb{transition:none}}
```

- [ ] **Step 6: Add the orb element and its script just before `</body>`**

```html
<div id="orb"></div>
<script>
(function(){
  var fine = window.matchMedia('(pointer: fine)').matches;
  if(!fine) return;
  document.body.classList.add('has-pointer');
  var orb = document.getElementById('orb');
  var tx = window.innerWidth/2, ty = window.innerHeight/2;
  var x = tx, y = ty;
  window.addEventListener('mousemove', function(e){ tx = e.clientX; ty = e.clientY; });
  function tick(){
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    orb.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    requestAnimationFrame(tick);
  }
  tick();
})();
</script>
```

- [ ] **Step 7: Verify in a browser**

Open `index-b.html` locally. Expect: no colored glow blobs, hero/CTA
buttons show a teal→green gradient with no box-shadow on hover, arrows
rotate 45° on hover instead of sliding, nav links turn teal/green on hover,
a soft blue-green blurred circle follows the mouse (desktop only — resize
the window narrow or use responsive device mode to confirm it doesn't
appear/interfere on mobile viewport widths).

- [ ] **Step 8: Commit**

```bash
git add index-b.html
git commit -m "Polish variant B: remove glows, add hover micro-interactions and cursor orb"
```

---

### Task 4: PostHog tracking (`assets/analytics.js`)

**Files:**
- Create: `assets/analytics.js`
- Modify: `index.html:` (add script tag before `</body>`)
- Modify: `index-b.html:` (add script tag before `</body>`)

**Interfaces:**
- Consumes: cookie `ms_variant` set by `middleware.js` (Task 1).
- Produces: PostHog event `cta_click` with properties `{ label, href }`,
  registered on every event via `posthog.register({variant})`.

- [ ] **Step 1: Create `assets/analytics.js`**

```js
(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  var variant = getCookie('ms_variant') || 'A';

  // Standard PostHog JS snippet — installed as shown by PostHog's own
  // "Install PostHog" onboarding page for this project. Before shipping,
  // re-copy the snippet from https://<your-instance>/project/settings
  // (Project Settings → Install PostHog) and diff it against the block
  // below — PostHog occasionally revises this loader, and using a stale
  // copy risks silently failing to load.
  !function(t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
      function g(t, e) {
        var o = e.split(".");
        2 == o.length && (t = t[o[0]], e = o[1]);
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) };
      }
      (p = t.createElement("script")).type = "text/javascript";
      p.crossOrigin = "anonymous";
      p.async = !0;
      p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
      (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
      var u = e;
      for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [],
        u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e },
        u.people.toString = function () { return u.toString(1) + ".people (stub)" },
        o = "init capture register register_once unregister identify alias reset getFeatureFlag isFeatureEnabled onFeatureFlags getSurveys canRenderSurvey opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing".split(" "),
        n = 0; n < o.length; n++) g(u, o[n]);
      e._i.push([i, s, a]);
    }, e.__SV = 1);
  }(document, window.posthog || []);

  posthog.init('phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM', {
    api_host: 'https://eu.i.posthog.com',
    capture_pageleave: true
  });

  posthog.register({ variant: variant });

  function ctaLabel(el) {
    return (el.textContent || '').replace(/[→➔→]/g, '').trim();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('a.cta-btn, a.pcta, a.ncta');
    if (!el) return;
    posthog.capture('cta_click', {
      label: ctaLabel(el),
      href: el.getAttribute('href')
    });
  });
})();
```

- [ ] **Step 2: Wire it into `index.html`**

Find the closing tag near the end of `index.html`:

```html
</body>
</html>
```

Replace with:

```html
<script src="assets/analytics.js"></script>
</body>
</html>
```

- [ ] **Step 3: Wire it into `index-b.html`**

Same edit as Step 2, applied to `index-b.html`.

- [ ] **Step 4: Confirm the PostHog host region matches the key**

The Project API Key (`phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM`) is
already wired into the snippet above with `api_host: 'https://eu.i.posthog.com'`
per the spec's EU recommendation. Before Task 6's verification, confirm in
the PostHog project (Project Settings → General → "Project ID") that the
project actually lives on the EU cloud — if it's US cloud instead, change
`api_host` to `https://us.i.posthog.com` before deploying, otherwise events
will silently fail to send (wrong region endpoint).

- [ ] **Step 5: Commit**

```bash
git add assets/analytics.js index.html index-b.html
git commit -m "Add PostHog tracking shared across variant A and B"
```

---

### Task 5: PostHog setup guide

**Files:**
- Create: `docs/posthog-setup.md`

- [ ] **Step 1: Write the guide**

```markdown
# Configurer PostHog pour le test A/B de la home

## 1. Créer le compte

1. Aller sur https://posthog.com, "Get started for free".
2. Au moment de choisir la région, sélectionner **EU** (cohérent avec la
   démarche RGPD du site — les données restent hébergées en Europe).
3. Créer un projet (ex. "M&S Strategy — site").

## 2. Récupérer la clé

1. Dans le projet, aller dans **Project Settings → Install PostHog**.
2. Copier la **Project API Key** (commence par `phc_...`).
3. Transmettre cette clé pour qu'elle soit intégrée dans
   `assets/analytics.js` (elle est publique par nature, pas un secret).

## 3. Vérifier que le tracking fonctionne

1. Une fois le code déployé (push sur `main`, Vercel redéploie
   automatiquement), ouvrir le site en navigation privée.
2. Dans PostHog, aller dans **Activity** (menu de gauche) — les évènements
   `$pageview` puis `cta_click` (au clic sur un bouton) doivent apparaître
   en quelques secondes.

## 4. Créer les Insights de comparaison A/B

Tous les Insights ci-dessous se créent dans **Product Analytics → Insights
→ New Insight**, puis en ajoutant un **Breakdown** sur la propriété
`variant`.

1. **Trafic par variante** — Insight de type "Trends", évènement
   `$pageview`, breakdown par `variant`. Montre combien de visiteurs ont vu
   A vs B (doit être ~50/50 si le split fonctionne).
2. **Temps passé par variante** — Insight "Trends", évènement `$pageleave`,
   agrégation "Average" sur la propriété `$prev_pageview_duration`,
   breakdown par `variant`.
3. **Clics CTA par variante** — Insight "Trends", évènement `cta_click`,
   breakdown par `variant`, et un second breakdown (ou un filtre) sur la
   propriété `label` pour voir quel bouton précis performe le mieux. C'est
   l'Insight le plus important : il mesure la conversion, pas juste le
   trafic.
4. **Heatmap des clics** — menu **Toolbar** ou l'app mobile PostHog propose
   une vue heatmap par URL ; utile pour une comparaison visuelle rapide
   entre A et B.

Épingler ces 3-4 Insights à un **Dashboard** dédié ("Home A/B test") pour
les retrouver facilement.
```

- [ ] **Step 2: Commit**

```bash
git add docs/posthog-setup.md
git commit -m "Add PostHog setup guide for the A/B test"
```

---

### Task 6: Push and verify on a real Vercel preview

**Files:** none (verification only)

- [ ] **Step 1: Push the branch**

```bash
git push -u origin HEAD
```

- [ ] **Step 2: Open a PR and get the Vercel preview URL**

```bash
gh pr create --draft --title "A/B test homepage: variant B (sobre N&B) + tracking PostHog" --body "Voir docs/superpowers/specs/2026-07-15-ms-strategy-ab-test-design.md pour le détail. Nécessite une clé PostHog pour activer le tracking (voir docs/posthog-setup.md)."
```

Wait for the Vercel bot comment on the PR with the preview URL (usually
appears within ~1 minute).

- [ ] **Step 3: Verify the cookie and rewrite behavior with curl**

```bash
curl -sD - -o /dev/null "<preview-url>/" | grep -i "set-cookie"
```

Expected: a `Set-Cookie: ms_variant=A` or `ms_variant=B` header.

```bash
curl -s -H "Cookie: ms_variant=B" "<preview-url>/" | grep -o "VARIANT B: sober overrides" | head -1
```

Expected: the string is found — confirms `/` served `index-b.html`'s
content when the cookie says `B`.

```bash
curl -s -H "Cookie: ms_variant=A" "<preview-url>/" | grep -o "VARIANT B: sober overrides" | head -1
```

Expected: no output — confirms `/` served the original `index.html` when
the cookie says `A`.

```bash
curl -sD - -o /dev/null -A "Googlebot/2.1" "<preview-url>/" | grep -i "set-cookie"
```

Expected: no `Set-Cookie` header for the bot user-agent, and re-running the
content check above with that user-agent should always return variant A's
content regardless of any cookie sent.

- [ ] **Step 4: Manual browser check — desktop**

Open `<preview-url>/` in a real browser, reload a few times / clear cookies
to see both variants. For variant B specifically: confirm assets load
(logo, fonts), the cursor orb follows the mouse, nav/CTA hover colors and
arrow rotation work, no console errors.

- [ ] **Step 5: Manual browser check — mobile**

Using responsive device mode (or a real phone), confirm variant B renders
without overflow, and that the cursor orb does **not** appear (no
`mousemove` on touch — check `body` never gets `.has-pointer`).

- [ ] **Step 6: Confirm PostHog events (only once the API key from Task 4 Step 4 is live)**

Click a CTA on the preview, then check PostHog **Activity** for a
`cta_click` event with the correct `variant` and `label` properties.

- [ ] **Step 7: Update `handoff.md`**

Add a short entry under a new "A/B test homepage" heading noting: middleware
live, variant B shipped, PostHog key status (wired or still pending from
user), and a pointer to `docs/posthog-setup.md` for reading results.

```bash
git add handoff.md
git commit -m "Update handoff notes for homepage A/B test"
```

- [ ] **Step 8: Push final commits and mark the PR ready**

```bash
git push
gh pr ready
```

(Only run `gh pr ready` once the user has confirmed the PostHog key is
wired in and results are readable — otherwise leave it in draft and note
what's still pending.)
