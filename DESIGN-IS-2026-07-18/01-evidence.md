# Evidence — byandry.com homepage (index.html, commit 7d06e1a, live at www.byandry.com)

## A. Structural Evidence

1. **Total interactive elements: 34** — 28 `<a>` (nav 320,324-329,331; hero CTAs 389,404; various 544,633,658,712-713,727,731,735,749-755,760-762), 6 `onclick` div "buttons" (FAQ items 667,672,677,682,687,692). Zero native `<button>`/`<input>`/`<select>`/`<textarea>`/`role="button"` anywhere on the page.
2. **Max nesting depth: 6 levels** — e.g. `.hero`(335) → `.panel-b2b`(373) → `.pc`(375) → `.pstats`(383) → `.si`(384) → `.sn`(384, leaf). Same depth repeats in the About/KPI block (578-609).
3. **Repeated patterns**: numbered card grid ×9 (`.hcard`/`.vcard`/`.cpillar`), CTA-with-arrow ×5 + 2 plain CTA links, stat-pair (big number + caption) ×11, icon-circle+text row ×3, FAQ item ×6, eyebrow tag ×8.
4. **Dead tokens**: `--teal-mid` (line 15) and `--muted2` (line 24) defined in `:root`, zero references elsewhere in the file. 0 dead JS functions/vars — all are called, including `faq()` (928) via inline `onclick`.

## B. Visual Evidence (INFERRED — static source read, no rendered screenshot/computed styles)

1. **Spacing scale**: 46 distinct px values (1.6–112px) plus two viewport-relative paddings (5vw, 6vw) — dense/near-continuous, no evidence of an intentional stepped grid (e.g. 8pt).
2. **Type scale**: 31 distinct fixed font-sizes (9.28–288px, the 288px being a decorative quote-mark glyph at line 237) plus 7 fluid `clamp()` ranges for headings. No consistent step ratio.
3. **Color count: 16 distinct base colors** — 12 declared custom properties (teal family ×5, green family ×2, dark family ×2, cream, muted family ×2) + 4 literal-only colors (`#0a2330`, `#fff`, `#050e13`, `#e05555`). `--teal-mid` and `--muted2` are declared but never consumed via `var()` (confirms Structural finding #4).
4. **Lowest contrast**: body text 16.57:1 (strong). But `.fbot` footer copyright text `rgba(138,172,180,.35)` on `#050e13` ≈ **1.94:1** — the worst pairing found, far below WCAG AA. `.bey` eyebrow label (opacity .6) ≈4.16:1, just under AA's 4.5:1 floor for normal text.
5. **States checklist**: focus/loading/error/success/empty/disabled — **all six MISSING** from CSS and JS. Note: page has no `<form>`, so error/loading/success may legitimately belong to downstream pages (b2b.html, calculateur), but focus and disabled states are absent even for the elements that do exist here (CTAs, FAQ toggles).

## C. Copy & Honesty Evidence

1. Full string inventory taken across all 11 sections (nav, hero B2B/B2C, brand strip, SEO intro, "bien choisir", market explainer, calculator CTA, values, about, careers, FAQ, closing CTA/footer) — see subagent transcript for full file:line list.
2. **Flagged inflations (9)**: unsourced stats — "19% Économies moyennes"(384), "70M kWh négociés 2025"(386), "100k+ Foyers accompagnés"(421,599), "80+ Collaborateurs·8 agences"(422,603-608), "+5 à +7% par an"(490), "80% des dirigeants..."(491,519,529), "les meilleures offres"(403, superlative w/ no comparison basis), "chiffre d'affaires en croissance constante"(586), "exclut structurellement tout favoritisme"(436,466,555, repeated absolute claim, no third-party verification).
3. **Flagged dark pattern (1, borderline)**: "Perte en temps réel" / "Combien votre inaction vous coûte-t-elle, à la seconde ?" (540-541) — anxiety/urgency framing implying a live ticking-loss counter on this page; it only links out to a separate calculator (544). No countdown timers, pre-checked boxes, or confirmshaming found elsewhere.
4. **Flagged jargon (6)**: "TPE·PME·ETI"(376), "clauses d'indexation"(442,566), "puissance souscrite"(442), "heures creuses/pleines"(442), mixed unexplained units kWh/MWh/GWh(386,492), "groupements d'achat"(492).
5. **Label→behavior mismatches**: none found — all inspected hrefs match their labels' stated destinations.

## D. Weight & Friction Evidence

1. **Initial JS bytes**: inline script 5,485B + `analytics.js` 2,498B + PostHog `array.js` (unconditionally injected by `posthog.init()`, no consent/interaction gate) 227,666B = **≈230 KiB total**, of which only ~8KB is visible directly in the HTML.
2. **Network requests, primary view**: 7 countable via curl (HTML doc, favicon **404** — no `<link rel="icon">` present, 2 font-provider CSS requests, logo image, analytics.js, PostHog array.js) + an estimated 3-6 more for font files and the PostHog pageview beacon (not curl-verifiable).
3. **TTI, ESTIMATED**: base HTML transfer 0.503s (measured) + JS parse/exec ≈0.236s (235,649B ÷ ~1MB/s mobile heuristic) ≈ **0.74s lower bound** — excludes font-CSS round-trips and the PostHog beacon, so real-world TTI is higher.
4. **Idle-screen animations: 6 auto-running mechanisms** — 3 CSS (`cin` entry, `scrl` entry, `sn2` infinite pulse) + 3 JS rAF loops (`animateGlint`, `revealLine`, particle-canvas `loop`, all auto-started via `setTimeout`/direct call, not hover-gated). No `prefers-reduced-motion` handling found in any evidence pass.
5. **Notifications/modals on load**: 0 popups/modals/cookie-banners/chat-widgets. 5 static `.tbadge` labels inside a pricing table (not notification-type UI).

## E. Accessibility Evidence

1. **Contrast**: most primary text pairs pass comfortably (body 16.57:1, nav 7.74:1, buttons 5.01–10.80:1). Three pairs **FAIL AA**: `.bey` eyebrow ≈4.19:1, `.qs` quote caption ≈3.52:1, `.fbot` footer copyright ≈1.95:1 (all INFERRED via opacity-blend approximation, all involve `opacity`/`rgba` reduced-opacity text).
2. **Focus order**: logical top-to-bottom source order for all `<a>` elements; the 6 FAQ items are **excluded from Tab order entirely** (plain `<div onclick>`, no `tabindex`).
3. **Keyboard reachability**: every primary CTA is a real `<a href>` (reachable). The FAQ accordion — the page's one piece of custom interactive UI — is **not keyboard-operable** (div+onclick, no tabindex/onkeydown/role="button").
4. **ARIA landmarks**: only 2 — `<nav>`(319) and `<footer>`(741). **No `<main>` landmark** wraps primary content; 11 `<section>` elements are unlabeled.
5. **Skip-link**: not found.

## Known gaps across all evidence
- No real browser/headless rendering was available in this environment; Visual and Accessibility contrast figures are hand-computed from source hex values (INFERRED), not measured against actual rendered pixels.
- Font-file and analytics-beacon request counts are estimates, not exhaustive curl-verified enumerations.
- Downstream pages (b2b.html, calculateur, etc.) were out of scope per 00-scope.md; error/loading/success state absence is scored only against what belongs on this page.
