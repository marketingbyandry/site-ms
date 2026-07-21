# Site-wide day/night A/B test — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the M&S Strategy A/B test (currently homepage-only, `index.html` vs `index-b.html`) to 6 pages, with Version A staying the current dark design untouched and Version B becoming a sober, Grand Hôtel-Dieu-inspired light theme rendered from a single file per page.

**Architecture:** Each of the 6 pages gets an additive `:root[data-theme="light"]` CSS override block (the pattern already proven on `blog.html`'s earlier pilot) instead of a duplicated file. `middleware.js` assigns/persists the `ms_variant` cookie across all 6 pages (matcher expanded from `'/'` only); a small inline script at the top of `<body>` reads that cookie and sets `data-theme="light"` before first paint. `index-b.html` is deleted — its palette and "sober" interaction language are folded into `index.html`. `blog.html`'s existing manual localStorage toggle (button, icons, click handler) is removed entirely.

**Tech Stack:** Static HTML/CSS/vanilla JS, no build step, no shared CSS/JS files (each page is self-contained). Vercel Edge Middleware (`@vercel/edge`). PostHog via the existing `assets/analytics.js`.

## Global Constraints

- No build step, no test runner exists for this site — "tests" in this plan are manual/grep/`node -e` syntax checks, not automated test suites.
- Every page is self-contained: CSS and JS are duplicated per file by design. Do not extract shared files.
- Version A (dark theme, no `data-theme` attribute) must remain visually identical to today on all 6 pages. All new rules are scoped under `:root[data-theme="light"]` (or, in `blog.html`, are a straight revert of dead toggle-era code — never a change to unscoped/base rules).
- Do not touch `ms-blog-article-1.html`, `ms-blog-article-2.html`, `ms-strategy-calculateur.html`, `ms-strategy-landing-2.html` — explicitly out of scope per the spec.
- Light-theme palette (exact values, used identically on every page):
  ```css
  :root[data-theme="light"]{
    --dark:#faf8f5;
    --dark2:#EBEBEB;
    --cream:#0c2635;
    --muted:#6b6058;
    --muted2:#4a4a4a;
  }
  ```
- Bandeau override (identical `.nav`/`.qband`/`.cstrip`/`.sfooter`/`.fbot`/`.cic` selectors on every page — verified byte-identical across all 6 files):
  ```css
  :root[data-theme="light"] .nav,
  :root[data-theme="light"] .qband,
  :root[data-theme="light"] .cstrip,
  :root[data-theme="light"] .sfooter,
  :root[data-theme="light"] .fbot{
    background:#0c2635;
    --cream:#fff;
    --muted:rgba(255,255,255,.75);
    --muted2:rgba(255,255,255,.6);
    --teal-glow:#fff;
    --teal-light:#fff;
  }
  :root[data-theme="light"] .fbot{color:#fff}
  :root[data-theme="light"] .cstrip .cic{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4)}
  ```
- Nav-link/CTA hover override (identical on every page — the `.nlinks` list and `.ncta` button markup/CSS are byte-identical across all 6 files):
  ```css
  :root[data-theme="light"] .nlinks li:nth-child(odd) a:hover{color:var(--teal)}
  :root[data-theme="light"] .nlinks li:nth-child(even) a:hover{color:var(--green)}
  :root[data-theme="light"] .ncta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;box-shadow:none}
  ```
- CTA hover language: buttons grow slightly on hover (`transform:scale(1.05)`) instead of the icon-rotate treatment from the old `index-b.html` variant — the icon (`.ca`) keeps its existing slide-on-hover behavior (`transform:translateX(4px)`) unscoped/unchanged in both themes; only the outer button gets the new light-mode-specific scale treatment. Exact per-selector rules are given in each page's task since the CTA class used (`.pcta`, `.cta-btn`, `.usubmit`, `.ccb-btn`) differs by page.
- Anti-flash script (identical on every page, placed as the first thing inside `<body>`, before any visible markup):
  ```html
  <script>
  (function(){
    var m = document.cookie.match(/(?:^|;\s*)ms_variant=([AB])/);
    if(m && m[1] === 'B'){
      document.documentElement.setAttribute('data-theme','light');
    }
  })();
  </script>
  ```
- Analytics: `<script src="assets/analytics.js"></script>` added as the last `<script>` tag before `</body>` on every page that doesn't already have it (only `index.html` currently has it).

---

### Task 1: `middleware.js` — expand matcher, drop the file-rewrite

**Files:**
- Modify: `middleware.js` (whole file, 27 lines)

**Interfaces:**
- Produces: `ms_variant` cookie (`A`/`B`, `Path=/; Max-Age=2592000; SameSite=Lax`) present on every response for the 7 in-scope paths — consumed by every page's anti-flash script in Tasks 2, 4-8.

- [ ] **Step 1: Replace the file contents**

```js
import { next } from '@vercel/edge';

export const config = {
  matcher: ['/', '/b2b.html', '/b2c.html', '/blog.html', '/comment-ca-marche.html', '/resultats.html']
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bots always get variant A, never get the cookie — keeps SEO/crawling
  // consistent and avoids duplicate content across the whole site, not just
  // the home.
  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}
```

Note what changed from the current file: the `rewrite` import and the `index-b.html` rewrite branch are removed (no more file-swap — every page now renders its own light theme via CSS, per Task 2 onward). `next()` unconditionally builds the response so a `Set-Cookie` header can always be appended to it.

- [ ] **Step 2: Verify no syntax errors**

Run: `node -e "require('fs').readFileSync('middleware.js','utf8')" && node --check middleware.js`

`--check` will fail on the `import`/`export` syntax since this is an ES module evaluated by Vercel's edge runtime, not plain Node — instead just visually confirm the diff and run:

Run: `node -e "new Function(require('fs').readFileSync('middleware.js','utf8').replace(/^import.*$/m,'').replace(/^export const config.*$/m,'').replace('export default function','function'))"`

Expected: no output (no syntax error thrown).

- [ ] **Step 3: Commit**

```bash
git add middleware.js
git commit -m "Expand A/B middleware matcher to 6 pages, drop index-b.html rewrite"
```

---

### Task 2: `index.html` — fold in the light theme, retire the split-file variant

**Files:**
- Modify: `index.html` (936 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).
- Produces: none (leaf page).

- [ ] **Step 1: Insert the light-theme palette + bandeau + nav/CTA overrides**

In the `<style>` block, immediately after the closing `}` of the existing `:root{...}` (right before `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}` at line 26), insert:

```css
:root[data-theme="light"]{
  --dark:#faf8f5;
  --dark2:#EBEBEB;
  --cream:#0c2635;
  --muted:#6b6058;
  --muted2:#4a4a4a;
}
:root[data-theme="light"] .nav,
:root[data-theme="light"] .qband,
:root[data-theme="light"] .cstrip,
:root[data-theme="light"] .sfooter,
:root[data-theme="light"] .fbot{
  background:#0c2635;
  --cream:#fff;
  --muted:rgba(255,255,255,.75);
  --muted2:rgba(255,255,255,.6);
  --teal-glow:#fff;
  --teal-light:#fff;
}
:root[data-theme="light"] .fbot{color:#fff}
:root[data-theme="light"] .cstrip .cic{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4)}
:root[data-theme="light"] .nlinks li:nth-child(odd) a:hover{color:var(--teal)}
:root[data-theme="light"] .nlinks li:nth-child(even) a:hover{color:var(--green)}
:root[data-theme="light"] .ncta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;box-shadow:none}
```

- [ ] **Step 2: Insert the hero split-panel light treatment**

Still inside `<style>`, right after the block from Step 1, insert (ported from the now-retired `index-b.html`, ratio- and value-identical):

```css
:root[data-theme="light"] .cta-glow{display:none}
:root[data-theme="light"] .bgw{filter:grayscale(1);opacity:.55}
:root[data-theme="light"] .panel-b2b::before{background:linear-gradient(140deg,rgba(26,122,138,.10) 0%,rgba(250,249,246,0) 65%)}
:root[data-theme="light"] .hero.hl .panel-b2b::before{background:linear-gradient(140deg,rgba(26,122,138,.20) 0%,rgba(43,181,200,.05) 60%)}
:root[data-theme="light"] .panel-b2c::before{background:linear-gradient(220deg,rgba(76,222,128,.14) 0%,rgba(250,249,246,0) 65%)}
:root[data-theme="light"] .hero.hr .panel-b2c::before{background:linear-gradient(220deg,rgba(76,222,128,.22) 0%,rgba(26,122,138,.08) 42%,rgba(250,249,246,0) 70%)}
:root[data-theme="light"] .hero.hl .panel-b2b .sn{color:var(--teal);text-shadow:none}
:root[data-theme="light"] .hero.hr .panel-b2c .sn{color:var(--green);text-shadow:none}
:root[data-theme="light"] .hero.hl .panel-b2b .pcta{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
:root[data-theme="light"] .hero.hr .panel-b2c .pcta{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:translateY(-3px);box-shadow:none}
```

Note: the hero's `.pcta` buttons intentionally keep the translateY lift (not the new scale-on-hover from Step 3) — they sit inside a JS-driven `.hero.hl`/`.hero.hr` expanded-panel state, not a plain `:hover`, so a `:hover`-scoped scale rule would silently lose to this more specific, always-on-while-expanded rule. Leave them as ported.

- [ ] **Step 3: Insert the remaining component fixes + general CTA scale-on-hover**

Still inside `<style>`, right after Step 2's block, insert:

```css
:root[data-theme="light"] .def-box{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .timing-visual{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .akpi{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .careers-cta-band{background:linear-gradient(135deg,rgba(76,222,128,.06),rgba(26,122,138,.05))}
:root[data-theme="light"] .cta-btn:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
:root[data-theme="light"] .ccb-btn:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
```

(`.def-box`/`.timing-visual`/`.akpi`/`.careers-cta-band` use hardcoded `rgba(13,79,92,*)`/`rgba(10,26,31,*)` dark-navy washes rather than `var(--dark*)`, so the palette swap in Step 1 doesn't lighten them on its own — this replaces each with a light, low-opacity teal/green tint consistent with the sober theme.)

- [ ] **Step 4: Add the `#orb` cursor effect (light-theme only), ported from `index-b.html`**

In the `<style>` block, right after the `.reveal`/`.d1`/`.d2`/`.d3` rules near the end (after line 313), insert:

```css
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
:root[data-theme="light"] body.has-pointer #orb{opacity:1}
@media(prefers-reduced-motion:reduce){#orb{transition:none}}
```

The `:root[data-theme="light"]` prefix on the visibility rule (unlike `index-b.html`'s unscoped version) is what keeps this invisible on Version A — the div/JS will exist on every load, but only ever becomes visible when `data-theme="light"`.

- [ ] **Step 5: Add the anti-flash script and the `#orb` markup + JS**

Immediately after `<body>` (before the `<!-- NAV -->` comment, currently line 316-318), insert:

```html
<script>
(function(){
  var m = document.cookie.match(/(?:^|;\s*)ms_variant=([AB])/);
  if(m && m[1] === 'B'){
    document.documentElement.setAttribute('data-theme','light');
  }
})();
</script>
```

Then, right after the existing `</script>` that closes the scroll-reveal/FAQ script (currently line 933), and before the existing `<script src="assets/analytics.js"></script>` (currently line 934), insert:

```html
<div id="orb"></div>
<script>
(function(){
  var fine = window.matchMedia('(pointer: fine)').matches;
  if(!fine) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;
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

`<script src="assets/analytics.js"></script>` was already present on `index.html` — no change needed to it.

- [ ] **Step 6: Verify script syntax**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: `script 0 OK`, `script 1 OK`, `script 2 OK` (anti-flash, main scroll-reveal/FAQ, orb-tracking) with no thrown errors.

Run: `grep -c 'id="orb"' index.html` — expected `1`. Run: `grep -c 'data-theme="light"' index.html` — expected a positive count (palette + bandeau + hero + component rules, roughly 20+).

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "Fold index-b.html's light theme into index.html via data-theme override"
```

---

### Task 3: Retire `index-b.html`

**Files:**
- Delete: `index-b.html`

**Interfaces:**
- Consumes: none (Task 2 already ported everything this file provided).

- [ ] **Step 1: Confirm nothing else references the file**

Run: `grep -rl "index-b" --include="*.html" --include="*.js" --include="*.xml" --include="*.txt" .`

Expected: no output (the middleware rewrite was already removed in Task 1, and `index-b.html` was never in `sitemap.xml`).

- [ ] **Step 2: Delete the file**

```bash
git rm index-b.html
```

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove index-b.html — light theme now lives in index.html"
```

---

### Task 4: `b2b.html` — light theme

**Files:**
- Modify: `b2b.html` (422 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).

- [ ] **Step 1: Insert the shared palette/bandeau/nav overrides**

Immediately after the closing `}` of `:root{...}` (before `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}` at line 26), insert the identical block from the Global Constraints section (palette + bandeau + nav/ncta hover) — same literal CSS as Task 2 Step 1.

- [ ] **Step 2: Insert b2b-specific dark-wash fixes and CTA scale-on-hover**

Right after the block from Step 1, insert:

```css
:root[data-theme="light"] .def-box{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .how-band{background:rgba(26,122,138,.04)}
:root[data-theme="light"] .vals{background:rgba(26,122,138,.03)}
:root[data-theme="light"] .uform{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .pcta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
:root[data-theme="light"] .usubmit:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
```

- [ ] **Step 3: Add the anti-flash script and the analytics tag**

Immediately after `<body>` (before `<!-- NAV -->`, currently line 162-164), insert the anti-flash script (identical to Task 2 Step 5's first snippet).

Immediately before `</body>` (after the existing `<script async src="https://tally.so/widgets/embed.js"></script>`, currently line 420), insert:

```html
<script src="assets/analytics.js"></script>
```

- [ ] **Step 4: Verify**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('b2b.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: all scripts print `OK`, no thrown errors.

Run: `grep -c 'analytics.js' b2b.html` — expected `1`.

- [ ] **Step 5: Commit**

```bash
git add b2b.html
git commit -m "Add light theme + analytics to b2b.html"
```

---

### Task 5: `b2c.html` — light theme

**Files:**
- Modify: `b2c.html` (407 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).

- [ ] **Step 1: Insert the shared palette/bandeau/nav overrides**

Same literal block as Task 4 Step 1, inserted right after `:root{...}` closes (before line 26's `*,*::before,*::after{...}`).

- [ ] **Step 2: Insert b2c-specific dark-wash fixes and CTA scale-on-hover**

```css
:root[data-theme="light"] .def-box{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .how-band{background:rgba(26,122,138,.04)}
:root[data-theme="light"] .vals{background:rgba(26,122,138,.03)}
:root[data-theme="light"] .uform{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .pcta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
:root[data-theme="light"] .usubmit:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
```

- [ ] **Step 3: Add the anti-flash script and the analytics tag**

Immediately after `<body>` (before `<!-- NAV -->`, currently line 162-164), insert the anti-flash script.

Immediately before `</body>` (after the existing `<script async src="https://tally.so/widgets/embed.js"></script>`, currently line 405), insert:

```html
<script src="assets/analytics.js"></script>
```

- [ ] **Step 4: Verify**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('b2c.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: all scripts print `OK`.

Run: `grep -c 'analytics.js' b2c.html` — expected `1`.

- [ ] **Step 5: Commit**

```bash
git add b2c.html
git commit -m "Add light theme + analytics to b2c.html"
```

---

### Task 6: `comment-ca-marche.html` — light theme

**Files:**
- Modify: `comment-ca-marche.html` (314 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).

- [ ] **Step 1: Insert the shared palette/bandeau/nav overrides**

Same literal block as Task 4 Step 1, inserted right after `:root{...}` closes (before line 26's `*,*::before,*::after{...}`).

- [ ] **Step 2: Insert page-specific dark-wash fix and CTA scale-on-hover**

This page has `.def-box` but no `.how-band`, `.vals`, or `.uform`/`.usubmit`:

```css
:root[data-theme="light"] .def-box{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .pcta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
```

- [ ] **Step 3: Add the anti-flash script and the analytics tag**

Immediately after `<body>` (before `<!-- NAV -->`, currently line 125-127), insert the anti-flash script.

Immediately before `</body>` (after the existing FAQ-accordion `</script>`, currently line 312), insert:

```html
<script src="assets/analytics.js"></script>
```

- [ ] **Step 4: Verify**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('comment-ca-marche.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: all scripts print `OK`.

Run: `grep -c 'analytics.js' comment-ca-marche.html` — expected `1`.

- [ ] **Step 5: Commit**

```bash
git add comment-ca-marche.html
git commit -m "Add light theme + analytics to comment-ca-marche.html"
```

---

### Task 7: `resultats.html` — light theme

**Files:**
- Modify: `resultats.html` (334 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).

- [ ] **Step 1: Insert the shared palette/bandeau/nav overrides**

Same literal block as Task 4 Step 1, inserted right after `:root{...}` closes (before line 26's `*,*::before,*::after{...}`).

- [ ] **Step 2: Insert page-specific dark-wash fixes and CTA scale-on-hover**

This page has `.def-box`, `.vals`, and `.kpi-card` (the last uses the same hardcoded `rgba(13,79,92,.35)/rgba(10,26,31,.9)` gradient as `.def-box` elsewhere, so it needs the same fix), but no `.how-band`/`.uform`/`.usubmit`:

```css
:root[data-theme="light"] .def-box{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .vals{background:rgba(26,122,138,.03)}
:root[data-theme="light"] .kpi-card{background:rgba(26,122,138,.05)}
:root[data-theme="light"] .pcta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;transform:scale(1.05);box-shadow:none}
```

- [ ] **Step 3: Add the anti-flash script and the analytics tag**

Immediately after `<body>` (before `<!-- NAV -->`, currently line 137-139), insert the anti-flash script.

Immediately before `</body>` (after the existing FAQ-accordion `</script>`, currently line 333), insert:

```html
<script src="assets/analytics.js"></script>
```

- [ ] **Step 4: Verify**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('resultats.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: all scripts print `OK`.

Run: `grep -c 'analytics.js' resultats.html` — expected `1`.

- [ ] **Step 5: Commit**

```bash
git add resultats.html
git commit -m "Add light theme + analytics to resultats.html"
```

---

### Task 8: `blog.html` — revert the manual toggle pilot, apply the final pattern

**Files:**
- Modify: `blog.html` (283 lines)

**Interfaces:**
- Consumes: `ms_variant` cookie (Task 1).

- [ ] **Step 1: Revert the toggle-era CSS additions**

Replace the current `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;transition:background-color .6s cubic-bezier(.4,0,.2,1),color .6s cubic-bezier(.4,0,.2,1),border-color .6s cubic-bezier(.4,0,.2,1)}` (line 48) with:

```css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
```

Replace the current `.reveal{opacity:0;transform:translateY(25px);transition:opacity .65s ease,transform .65s ease,background-color .6s cubic-bezier(.4,0,.2,1),color .6s cubic-bezier(.4,0,.2,1),border-color .6s cubic-bezier(.4,0,.2,1)}` (line 118) with:

```css
.reveal{opacity:0;transform:translateY(25px);transition:opacity .65s ease,transform .65s ease}
```

Delete the entire `/* ─── THEME TOGGLE ───────────────────── */` block (lines 122-128):

```css
.theme-toggle{position:fixed;bottom:2rem;right:2rem;z-index:300;width:48px;height:48px;border-radius:50%;border:1.5px solid var(--green);background:var(--dark2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s,box-shadow .2s;color:var(--green)}
.theme-toggle:hover{background:var(--green);color:var(--dark);box-shadow:0 0 22px rgba(76,222,128,.38)}
.theme-toggle svg{width:20px;height:20px;pointer-events:none;display:block}
.theme-toggle .icon-sun{display:none}
:root[data-theme="light"] .theme-toggle .icon-moon{display:none}
:root[data-theme="light"] .theme-toggle .icon-sun{display:block}
```

- [ ] **Step 2: Replace the light-theme palette + bandeau block with the final version**

Replace the current lines 26-47:

```css
:root[data-theme="light"]{
  --dark:#faf9f6;
  --dark2:#f2f0ea;
  --cream:#141414;
  --muted:#5a5a58;
  --muted2:#3a3a38;
}
:root[data-theme="light"] .nav,
:root[data-theme="light"] .qband,
:root[data-theme="light"] .cstrip,
:root[data-theme="light"] .sfooter,
:root[data-theme="light"] .fbot{
  background:#4cde80;
  --cream:#fff;
  --muted:rgba(255,255,255,.75);
  --muted2:rgba(255,255,255,.6);
  --teal-glow:#fff;
  --teal-light:#fff;
  --green:#fff;
}
:root[data-theme="light"] .fbot{color:#fff}
:root[data-theme="light"] .cstrip .cic{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4)}
```

with:

```css
:root[data-theme="light"]{
  --dark:#faf8f5;
  --dark2:#EBEBEB;
  --cream:#0c2635;
  --muted:#6b6058;
  --muted2:#4a4a4a;
}
:root[data-theme="light"] .nav,
:root[data-theme="light"] .qband,
:root[data-theme="light"] .cstrip,
:root[data-theme="light"] .sfooter,
:root[data-theme="light"] .fbot{
  background:#0c2635;
  --cream:#fff;
  --muted:rgba(255,255,255,.75);
  --muted2:rgba(255,255,255,.6);
  --teal-glow:#fff;
  --teal-light:#fff;
}
:root[data-theme="light"] .fbot{color:#fff}
:root[data-theme="light"] .cstrip .cic{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4)}
:root[data-theme="light"] .nlinks li:nth-child(odd) a:hover{color:var(--teal)}
:root[data-theme="light"] .nlinks li:nth-child(even) a:hover{color:var(--green)}
:root[data-theme="light"] .ncta:hover{background:linear-gradient(100deg,var(--teal),var(--green));color:#fff;box-shadow:none}
:root[data-theme="light"] .res-card{background:rgba(26,122,138,.05)}
```

(dropped `--green:#fff` — no longer needed now that the bandeau background is dark navy instead of bright green, standard `--green` already reads fine against navy; added the shared nav-hover/ncta-hover rules that blog.html never had before; added a light-wash fix for `.res-card`, the one hardcoded-dark-wash component unique to this page.)

- [ ] **Step 3: Replace the anti-flash script**

Replace the current script right after `<body>` (lines 132-138):

```html
<script>
try{
  if(localStorage.getItem('ms_theme')==='light'){
    document.documentElement.setAttribute('data-theme','light');
  }
}catch(e){}
</script>
```

with:

```html
<script>
(function(){
  var m = document.cookie.match(/(?:^|;\s*)ms_variant=([AB])/);
  if(m && m[1] === 'B'){
    document.documentElement.setAttribute('data-theme','light');
  }
})();
</script>
```

- [ ] **Step 4: Remove the toggle button markup**

Delete lines 251-254:

```html
<button type="button" class="theme-toggle" id="theme-toggle" aria-label="Basculer entre mode sombre et mode clair">
  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
</button>
```

- [ ] **Step 5: Remove the toggle click-handler JS and add the analytics tag**

Replace the closing script block (currently lines 256-281):

```html
<script>
const obs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

(function(){
  var btn = document.getElementById('theme-toggle');
  var mem = null;
  function setStored(v){
    try{ localStorage.setItem('ms_theme', v); }catch(e){ mem = v; }
  }
  btn.addEventListener('click', function(){
    var toLight = document.documentElement.getAttribute('data-theme') !== 'light';
    if(toLight){
      document.documentElement.setAttribute('data-theme','light');
      setStored('light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      setStored('dark');
    }
  });
})();
</script>
```

with:

```html
<script>
const obs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
</script>
<script src="assets/analytics.js"></script>
```

- [ ] **Step 6: Verify**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('blog.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => { new Function(s); console.log('script', i, 'OK'); });
"
```

Expected: all scripts print `OK` (should be exactly 2 now: anti-flash, scroll-reveal).

Run: `grep -c 'theme-toggle\|ms_theme\|localStorage' blog.html` — expected `0` (all toggle-era references gone).

Run: `grep -c 'analytics.js' blog.html` — expected `1`.

- [ ] **Step 7: Commit**

```bash
git add blog.html
git commit -m "Replace blog.html's manual theme toggle with server-driven A/B assignment"
```

---

### Task 9: Manual verification across all 6 pages

**Files:** none (verification only)

- [ ] **Step 1: Confirm variant B renders correctly on every in-scope page**

For each of `index.html`, `b2b.html`, `b2c.html`, `blog.html`, `comment-ca-marche.html`, `resultats.html`:

```bash
curl -s -H "Cookie: ms_variant=B" "https://<preview-url>/<page>" | grep -o 'data-theme="light"' | head -1
```

This confirms the middleware sets the cookie and the anti-flash script logic is present — full visual confirmation still requires opening each page in a real browser with devtools set to `document.cookie = "ms_variant=B"` before reload, per the spec's section 5 (palette, bandeaux, nav-hover, CTA scale-on-hover, no flash on load).

- [ ] **Step 2: Confirm variant A is visually unchanged**

Open each of the 6 pages with no cookie / `ms_variant=A` forced, and confirm they look identical to the pre-change site (no `data-theme` attribute set, only additive rules exist so nothing should differ).

- [ ] **Step 3: Confirm cookie persistence across pages**

In a real browser, visit `index.html`, note the assigned variant (devtools → Application → Cookies → `ms_variant`), then navigate to 2-3 of the other in-scope pages and confirm the same variant/cookie value persists.

- [ ] **Step 4: Confirm bots always get variant A**

```bash
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1)" -D - "https://<preview-url>/blog.html" -o /dev/null | grep -i set-cookie
```

Expected: no `Set-Cookie: ms_variant=...` header (bots are excluded by `BOT_UA` and never receive the cookie).

- [ ] **Step 5: Confirm PostHog events fire on all 6 pages**

In PostHog's live event view, load each of the 6 pages (with `assets/analytics.js` now present on all of them) and confirm a `$pageview` with the correct `variant` property appears, and that clicking a CTA fires `cta_click`.
