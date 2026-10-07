# Evidence — Design Is audit, 2026-09-12

Source: `index.html` on `main` (HEAD `9e791a3`). All findings below are subagent reports, consolidated verbatim where possible. Orchestrator has not yet scored anything in this file.

Status: 5/5 subagents returned. Evidence gathering complete.

---

## Copy & Honesty Evidence

### 1. Every user-facing string
Full inventory by section (nav, hero, brand strip, SEO intro, "how to choose", market explainer, supplier partners, calculator CTA, values, about/entreprise, careers, FAQ, quote band, closing CTA, contact strip, footer) — see subagent transcript for the complete line-by-line catalogue (lines 20–1119). Key structural fact: the homepage runs ~15 distinct content sections between the sticky ticker and the footer.

### 2. Flagged inflations
- **"19% Économies moyennes"** (line 591) — no sample size, time window, or baseline cited anywhere on the page.
- **"100.000 clients accompagnés"** (lines 627, 916, 929-930) — unsourced, and **internally contradicted**: the 8 supplier cards' "propositions réalisées" sum to 8,177 (per the codebase's own TODO comment at line 743-745), two orders of magnitude below the headline claim.
- **"70M kWh négociés 2025"** (line 593) — unsourced aggregate.
- **"80+ collaborateurs / 8 agences"** (lines 628, 933-934, 937-938, 993) — repeated identically across sections, never linked to a verifiable roster/locations page.
- **"+5 à +7% par an" market increase** (line 696) — specific stat, zero citation.
- **"80% des dirigeants..."** (lines 697, 725, 735) — same unsourced statistic repeated three times as fact.
- **"100% indépendant"** (line 880) — absolute framing; the remuneration model is explained narratively elsewhere, but "100%" itself is asserted, not audited.
- **Supplier "propositions réalisées" / "contrats en cours de négociation" counts** (lines 756-855, labelled "aperçu") — confirmed via `assets/sup-stats.js`: these are a **hardcoded base number perturbed by a deterministic pseudo-random ±3% daily offset** (hash of date + key), purely client-side, not real data. "Aperçu" hints at imprecision but does not disclose the numbers are synthetic.
- **"L'indépendance réelle"** (lines 671-672) — implies competitors aren't "really" independent, no comparison data or named competitor.

### 3. Flagged dark patterns
**None found.** Specifically checked and cleared:
- Forced continuity/auto-renewal: the only "reconduction automatique" hit (line 731) describes the *visitor's existing third-party contract* risk, not an M&S mechanism.
- Hidden costs: fee model is disclosed in main body copy (642, 887, 919) and FAQ, not fine print.
- Fake scarcity/urgency: no countdown, no "places restantes" language found.
- Confirmshaming: no decline/dismiss copy exists on the page at all.

### 4. Flagged jargon / unclear labels
- **"Ressources"** (nav 567, footer 1089) → links to the blog; doesn't signal "blog/articles" to a first-time visitor. Suggest "Blog" or "Actualités".
- **"Rejoindre"** (nav 568) → ambiguous verb without object. Suggest "Carrières" or "Nous rejoindre".
- **"Perte en temps réel"** (CTA eyebrow, line 866) → implies a live dashboard that doesn't exist. Suggest "Vérifiez votre contrat" or "Diagnostic gratuit".
- **"aperçu"** tag on supplier stats (e.g. line 756) → doesn't communicate that the number is a daily-jittered approximation rather than live data.
- **"kWh négociés"** (line 593) → precise industry phrasing, unclear value to a first-time B2B visitor. Suggest "Volume d'énergie traité en 2025".

### 5. Label→behavior mismatches
**None found** on primary nav/CTA destinations — all 12 checked CTA/nav links route to a page whose `<title>` matches the label's implied topic. One structural note (not a text mismatch): the global-nav CTA "Étude gratuite" (line 571) always routes to `b2b.html#upload`, with no B2C-equivalent target, even when shown to a visitor in the B2C-styled hero panel. One fragility note: "Gérer les cookies" (footer 1119) calls `window.msOpenCookieBanner` guarded only by `&&` — if that deferred script hasn't loaded yet, the click silently does nothing.

### Known gaps (copy/honesty)
- Ticker content (line 552-554) is populated at runtime by `assets/ticker.js` — not catalogued (script not inspected).
- `assets/cookie-consent.js`, `assets/analytics-loader.js`, `assets/nav-mobile.js`, `assets/favicon-animate.js`, `assets/speed-insights.js` not opened.
- Off-page destination content spot-checked only via `<title>` tags, not full body copy, for b2b/b2c/comment-ca-marche/resultats/blog/barometre-energie/calculateur pages and the 30+ footer city pages.
- `tel:`/`mailto:` functionality not verified beyond href scheme matching visible label.

---

## Structural Evidence

### 1. Total interactive-element count
**63 total** (49 `<a>` + 14 `onclick`-bearing `<div>`; zero `<button>`/`<input>`/`<select>`/`<textarea>`; zero `tabindex`). Breakdown: nav 9, hero panels 2 CTA links (no real search input — **panel switching is hover-only via `mouseenter`/`mouseleave` JS at line 1131-1134, not a toggle/search control**), SEO-intro 1, market 1, suppliers 9 (8 onclick-divs + 1 link), calculateur CTA 1, about 1, careers 2, FAQ 6 onclick-divs, closing CTA 2, contact strip 3, footer 26 (nav 8 + villes 11 + contact 3 + bottom bar 4). One `role="marquee"` (informational only), no other ARIA roles.

### 2. Max nesting depth
Deepest: suppliers `.sup-item` chain, 6 nested div/section levels (746→751→752→753→755→756) before the innermost leaf `<span class="sup-val">`. Hero panel chain is 5 levels (577→581→583→590→591).

### 3. Repeated-pattern count
- **Pattern A — "ghost-numbered feature card"** reimplemented under 4 different class names for the same visual pattern (large low-opacity number + bold title + muted paragraph, bordered box, hover lift): `.hcard`×3 (669,674,679), `.vcard`×4 (884,889,894,899), `.cpillar`×3 (974,979,984), `.akpi`×4 (924,928,932,936) — 14 instances, 4 separate CSS implementations.
- **Pattern B — accordion toggle** duplicated as two near-identical component implementations: `.sup-item`×8 (752-843) and `.faq-item`×6 (1004-1029), with duplicate CSS backing (`.faq-arr`/`.sup-arr`, `.faq-a`/`.sup-a`, `.faq-item.open`/`.sup-item.open`).
- **Pattern C — eyebrow + serif headline** (`.stag`+`.sh2`) — 7 instances (636,664,692,866,879,912,961), one variant drops `.stag` (1045).
- **Pattern D — primary CTA button** (skew light-sweep hover + arrow) implemented as 3 separate classes for one pattern: `.pcta`×2 (596,610), `.cta-btn`×3 (870,1048,1049), `.ncta`×1 (571) — with near-duplicate hover-sweep CSS declared twice (`.pcta::before` line 184-185 vs `.cta-btn::before` line 360-361).
- **Pattern E — icon-circle contact item** ×3 (1061,1065,1069).
- **Pattern F — "copy + visual aside" two-column grid** (`1fr 1fr`, `gap:5rem`) declared as 4 separate CSS rules for the identical layout shape: `.seo-intro` (222), `.market-inner` (257), `.about-inner` (322), `.careers-top` (336).
- **Pattern G — literal duplicated contact info** (not templated): phone `0952926498` appears at lines 570,1063,1111; phone `0783070749` at 1067,1112; email `msstrategy@yahoo.com` at 970,995,1071,1092,1113.

### 4. Dead-prop / unused-import count
- Empty ruleset `.seo-right{}` (line 231) — no matching element in the body.
- Dead CSS variant `.cta-btn.ct-outline` (368-369, plus light-theme override at 85) — never applied in markup (only `ct-teal`/`ct-green` are used).
- Dead custom property `--teal-mid` (line 33) — defined, never consumed via `var()` anywhere in the stylesheet.
- Dead/unreferenced IDs: `id="cta-calculateur"` (863) and `id="cta-final"` (1042) — nothing links or scripts to either.
- 6 orphaned asset files on disk not referenced by this page's `<script src>`: `hero-search.js`, `hero-glow.js`, `ticker-pro.js`, `barometre.js`, `analytics.js`, `ref.js` — **`hero-search.js`/`hero-glow.js` in particular suggest an abandoned search/glow hero variant that isn't wired into the current hero.**

### Known gaps (structural)
- Did not open `sup-stats.js`, `nav-mobile.js`, `analytics-loader.js`, `favicon-animate.js`, `speed-insights.js`, `nav-mobile.css`, `cookie-consent.js` — classes/IDs consumed only by those files could theoretically be mis-flagged as dead above (only `ticker.js` was opened to confirm dynamic class usage).
- Did not verify whether the 6 orphaned asset files are used by sibling pages (b2b.html etc.) — only confirmed unreferenced by index.html itself.
- Nesting-depth comparison covered the visually-deepest sections, not an exhaustive per-section count of all ~25 sections.

## Visual Evidence

### 1. Spacing scale
**52 distinct spacing values** found across the stylesheet (converted to px @16px root). Only **~11 of 52 land on a clean 8px-multiple grid** (8,16,24,32,40,48,56,64,80,96,112px) — the rest are odd fractional-rem values a hundredth apart (.22, .26, .28, .45, .52, .55, .62, .65, .78, .85, .86rem…), consistent with each component being hand-tuned rather than pulled from a shared scale. **No `--space-*` custom property exists anywhere in `:root`.**

### 2. Type scale
**37 static font-size values + 7 fluid `clamp()` expressions = 44 unique declarations.** Body/caption sizes cluster between .55rem and 1.05rem with a new bespoke value on nearly every component (.58, .62, .63, .64, .65, .7, .72, .74, .76, .78, .8, .81, .82, .85, .86, .87, .88, .89, .9, .91, .92, .93, .95, .96, .97, .98rem — differences as small as ~0.16px). **No `--font-size-*` tokens exist.** Headings use 7 different `clamp()` fluid ranges instead of a shared modular scale.

### 3. Distinct color count
**≈26 distinct final colors.** Confirmed dead token: **`--teal-mid:#156a78` (line 33) is defined but never referenced anywhere else in the file.** Tokens are frequently re-literalized as hand-typed hex/rgba duplicates instead of `var()` (e.g. `#2bb5c8`, `#5ecfdc`, `#4cde80`, `#8aacb4`, `#fff`, `#0c2635` all appear both as token values and as separate hardcoded literals). Five near-duplicate, numerically-distinct "near-blacks" exist with no single source of truth: `#050e13`, `#061117`, `#0a1c25`, `rgb(10,26,31)`, `rgb(10,35,48)` — none equal to `--dark`(#07131a) or `--dark2`(#0a1f28).

### 4. Contrast (corroborates Accessibility evidence)
Lowest ratio confirmed: **`.fbot` legal-line text `rgba(138,172,180,.35)` on `#050e13` (dark theme, line 318) = 1.95:1, fails WCAG AA** even at the large-text threshold. Light theme's override (`.fbot{color:#fff}`, line 64) fixes this specific case. Body/muted text pairings otherwise pass comfortably in both themes (5:1–16.6:1).

### 5. States present checklist
**All six states are missing:**
- Empty state: not found.
- Loading state: not found (an internal JS loader state machine in `analytics-loader.js` is not a rendered UI state).
- Error state: not found — **the document has zero `<form>`/`<input>`/`<select>`/`<textarea>` elements at all**, so there's structurally nowhere for one to exist.
- Success state: not found.
- **`:focus` / `:focus-visible`: not found anywhere** — grepped `index.html` and every file under `assets/*.css`, zero matches. Every interactive element defines `:hover` (nav links, CTAs, cards) but **none define a keyboard-focus style.**
- `:disabled`: not found — no native form controls exist to disable.

### Known gaps (visual)
- No live render — all contrast/spacing/type values computed by hand from source, not measured against rendered pixels (font antialiasing, gamma, actual delivered webfont metrics not accounted for).
- `data-theme="light"` is set via a JS A/B-test cookie check (lines 543-548, variant `ms_variant=B`) — which theme real visitors actually see, and in what proportion, could not be confirmed statically.
- Mobile/responsive `@media` breakpoints (7 found) change several spacing/font values at different widths; the scale-consistency analysis covers the full declared set but doesn't simulate an actual viewport.

## Weight & Friction Evidence

### 1. Initial JS bytes
Inline executing JS: 3,951 B (GTM bootstrap, theme-cookie check, particles/reveal/FAQ logic). Local external JS (all `defer`): 23,451 B across 7 files (analytics-loader, favicon-animate, ticker, nav-mobile, speed-insights, cookie-consent, sup-stats). **Combined local JS ≈27.4 KB.** `assets/analytics.js` (245 KB!) is gated behind an existing consent cookie and NOT loaded for a first-time visitor. Third-party (GTM, Google SWG publisher.js, Vercel speed-insights) not locally measurable.

### 2. Network request count
**~30 distinct requests** on first visit: document + 2 third-party scripts + 7 local deferred JS + 3 render-blocking stylesheets (Google Fonts, **api.fontshare.com for Satoshi**, local nav-mobile.css) + nav logo + 8 supplier logo images + 2 favicon-related fetches + 2 JSON data fetches (ticker) + 1 conditional favicon-tiger-mask image — plus an unknown number of downstream webfont file requests from the two remote font stylesheets.

### 3. Time-to-interactive (ESTIMATED, no live browser)
Basis: 3 render-blocking head resources, 30KB parse-blocking inline `<style>`, ~23KB deferred JS, ~310KB of non-lazy images (none of the 9 `<img>` tags carry `loading="lazy"` — confirmed by grep) including one supplier logo at 90KB alone (PICOTY.png.png). **Central estimate ≈2,500ms TTI**, full `window.load` plausibly 2,500-4,000ms depending on font/GTM download time.

### 4. Animation count on idle screen
**3 CSS `@keyframes`**: `ms-ticker-scroll` (infinite marquee, line 99), `cin` (one-shot hero entrance, line 196), `npulse` (infinite pulsing scroll-cue dot, line 201). **2 JS loops running forever from load**: a `requestAnimationFrame` particle system on the hero canvas (55 particles, line 1179-1190, never stops) and a `setInterval(tick,120ms)` that repaints the browser-tab favicon indefinitely (`assets/favicon-animate.js:50`, gated on hover-capable pointer + no reduced-motion, but still runs continuously once started). `prefers-reduced-motion` is NOT checked for the particle loop or the ticker scroll — only the favicon pulse respects it.

### 5. Notifications/badges/modals on initial load
**1**: the cookie-consent banner, auto-shown via `DOMContentLoaded` for any visitor without a prior `ms_consent` cookie (`assets/cookie-consent.js:154-179`) — i.e., shown to essentially every first-time visitor. No other popups/badges found.

### Known gaps (weight/friction)
- TTI is a byte/request-count estimate, not a measurement — no real network latency, compression ratio, or CPU throttling data.
- Third-party byte sizes (GTM, Google SWG, remote font files, Vercel speed-insights) unmeasurable locally.
- Byte figures are uncompressed on-disk sizes, not bytes-over-the-wire (gzip/brotli not accounted for).

## Accessibility Evidence

### 1. WCAG contrast — key results (full table in subagent transcript)
Most body/muted text pairings PASS comfortably (body 16.57:1 dark / 14.74:1 light; muted 7.73:1 dark / 5.76:1 light). Three real **FAILs** found:
- **Footer fine print** `.fbot{color:rgba(138,172,180,.35)}` on `#050e13` (line 318) → **1.95:1 FAIL** in dark theme (light theme override fixes it to 15.62:1).
- **`.ilink`/`.ct-outline` teal text** (`color:var(--teal-light)`, e.g. lines 654,696,749,368) is only overridden inside a scoped selector list (nav/ticker/qband/cstrip/sfooter/fbot, lines 51-64) — outside that scope, in the **light theme**, `--teal-light` stays `#2bb5c8` and renders on the light body bg `#faf8f5` at **2.32:1 FAIL**.
- **Green solid CTA button text** (`.ccb-btn`/`.cta-btn.ct-green`, `color:var(--dark)` on `background:var(--green)`, lines 348/366) — in dark theme this is `#07131a` on `#4cde80` = 10.80:1 PASS, but in **light theme `--dark` resolves to `#faf8f5`** (line 45), so the same rule renders **near-white text on bright green at 1.64:1 — a severe FAIL**, effectively unreadable button copy.
Also flagged: decorative background numerals (`.hcn`/`.vn`) at 1.15:1 — non-critical, decorative glyph not body copy.

### 2. Focus order
No `tabindex` anywhere in the file — source order is tab order, confirmed as: nav (9) → hero CTAs (2) → inline links (3) → suppliers link (1) → calculateur CTA (1) → careers (2) → closing CTA (2) → contact strip (3) → footer (26). Full ordered list in subagent transcript. **The 8 supplier accordions and 6 FAQ accordions are absent from tab order entirely** (no `<a>`/`<button>`/`[tabindex]`). The mobile hamburger button is injected by `assets/nav-mobile.js` at runtime (not in static source) and would land right after the logo link.

### 3. Keyboard reachability
14 of ~16 primary-action patterns are native `<a>`/`<button>` and fully keyboard-operable. **Two patterns are not**: the 8 `.sup-item` supplier accordions (line 752 etc.) and the 6 `.faq-item` FAQ accordions (line 1004 etc.) are plain `<div onclick="...">` with no `tabindex`, no `role="button"`, and — confirmed by grepping the whole file plus referenced JS — **no keydown/keyup handler exists for either pattern**. Their revealed content (supplier negotiation details, FAQ answers) is completely unreachable by keyboard.

### 4. ARIA landmarks
`<nav>`: 1 (line 558). `<footer>`: 1 (line 1077). **`<header>`: 0. `<main>`: 0 — missing entirely.** No `role="banner"/"navigation"/"main"/"contentinfo"` anywhere. Only one `aria-label` in the whole file (the ticker's `role="marquee"`, line 552) — none of the ~11 `<section>` elements have `aria-label`/`aria-labelledby`. The footer-bottom bar (`.fbot`, line 1116) sits as a sibling after `</footer>` (line 1075), so it's structurally outside the footer landmark. The `sr-only` `<h1>` (line 576) sits outside any landmark and is not the first focusable element.

### 5. Skip-link
**Not found.** Searched "skip", "aller au contenu", `#main`/`#content` targets, visually-hidden first-link pattern — no match anywhere in index.html or its linked CSS/JS.

### Known gaps (accessibility)
- All contrast/DOM-order conclusions computed from static source, no live browser to confirm rendered values.
- Several backgrounds are stacked semi-transparent gradients (hero panel overlays, section tints) — flattened-color contrast estimates for those are INFERRED/approximate.
- `assets/nav-mobile.css` sets `.nav-burger{order:5}` in a mobile media query — a CSS `order` on a focusable flex item, which could visually reposition it without changing tab order; actual mismatch unverified without a browser.
- Runtime-injected third-party content (Google Tag Manager, `swg/js/v1/publisher.js`, the `google-add-preferred-source-btn` div) may add focusable elements not present in static source — out of scope for this pass.
- `ticker.js`/`sup-stats.js`-generated DOM (ticker items, supplier stat spans) not inspected for additional focusable elements or live-region behavior.
