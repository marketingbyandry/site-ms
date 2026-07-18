```
/make-plan Redesign the byandry.com marketing homepage (index.html). Current design failed audit at 7/30 with critical gaps in principles #3 (aesthetic, 0/3) and #8 (thorough, 0/3).

Verdict paragraph (quoted from 03-verdict.md):
> REDESIGN. Total score is 7/30, far below the ≥20 threshold for REFINE, and two principles (#3 aesthetic, #8 thorough) scored 0 outright — the bones need to be rebuilt, not iterated on.

Why redesign and not refine: total score (7/30) is far below the ≥20 REFINE threshold, and two principles (#3 aesthetic, #8 thorough) scored 0 outright — this isn't a case of good bones needing polish.

Preserve from current design:
- Teal/green brand palette tokens: --teal #1a7a8a, --teal-dark #0d4f5c, --teal-light #2bb5c8, --green #4cde80, plus cream/dark neutrals (index.html:12-25), and the logo (index.html:321).
- The B2B/B2C audience-split hero concept (index.html:373-406) — the underlying information-architecture decision to route professional vs. residential visitors differently is sound; only its current execution (dense spacing, unglossed jargon, decorative canvas) needs rebuilding.
- The FAQ content itself (index.html:665-695, six Q&A pairs on broker definition, pricing, timing, mid-contract intervention, coverage, broker-vs-comparator) — useful user-education copy; only the markup (div+onclick, no keyboard access) needs rebuilding.

Discard:
- Non-systematized spacing/type scale: 46 distinct spacing values and 31 distinct fixed font-sizes with no consistent step ratio (index.html:12-314, full stylesheet). Caused failure on principle #3 (aesthetic) and contributed to #10 (as little as possible).
- Auto-running decorative animation layer with no reduced-motion gate: 3 CSS keyframes (`cin` 135, `npulse` 140) + 3 JS requestAnimationFrame loops (`animateGlint` 834-839, `revealLine` 849-856, particle-canvas `loop` 908-913), all auto-start on load, zero `prefers-reduced-motion` handling anywhere in the file. Caused failure on principles #5 (unobtrusive), #7 (long-lasting), and #9 (environmentally friendly).
- Div+onclick FAQ accordion pattern (index.html:667-692) with no tabindex/aria-expanded/keyboard handling. Caused failure on principle #4 (understandable) and #8 (thorough).
- Unsourced statistic/superlative claims: "19% Économies moyennes" (384), "70M kWh négociés 2025" (386), "100k+ Foyers accompagnés" (421, 599), "80+ Collaborateurs·8 agences" (422, 603-608), "+5 à +7% par an" (490), "80% des dirigeants..." (491, 519, 529), "les meilleures offres" (403), "chiffre d'affaires en croissance constante" (586), "exclut structurellement tout favoritisme" (436, 466, 555). Caused failure on principle #6 (honest).

Top 3-5 moves from the audit (verbatim):
1. Aesthetic / As little as possible (#3, #10): Replace the 46-value spacing scale and 31-value type scale with a systematized spacing grid and a modular type scale (5-7 steps). Evidence: 01-evidence.md B.1-B.2 (index.html:12-314).
2. Honest (#6): Source or remove the 9 flagged unsourced statistics and superlatives. Evidence: 01-evidence.md C.2 (index.html:384, 386, 403, 421-422, 436, 466, 490-491, 519, 529, 555, 586, 599, 603-608).
3. Unobtrusive / Long-lasting / Environmentally friendly (#5, #7, #9): Remove or gate behind `prefers-reduced-motion` the 6 auto-running decorative animation mechanisms. Evidence: 01-evidence.md D.4 (index.html:132, 137, 139, 834-839, 849-856, 908-913).
4. Understandable / Thorough (#4, #8): Rebuild the FAQ accordion as real `<button>` elements with `aria-expanded`, add a `<main>` landmark (currently absent), add visible `:focus-visible` styling (currently absent site-wide), and gloss the 6 flagged jargon terms. Evidence: 01-evidence.md A/E (index.html:667-692 FAQ, no `<main>` found, no `:focus` rules found, jargon at lines 376, 442, 442, 442, 386/492, 492).
5. Useful / As little as possible (#2, #10): Consolidate the 11 stat-pairs, 9 numbered cards, and 8 eyebrow tags into fewer, higher-signal sections, and reduce the 7 CTA-style links down to one clear primary path per audience. Evidence: 01-evidence.md A.3.

Redesign principles in priority order:
1. Useful (#2) — the primary task (start a quote / understand the offer) should complete with minimal detours and no unlabeled custom controls; every interactive element should be a real, keyboard-reachable control.
2. Honest (#6) — every stat and superlative on the page should be sourced or removed; no copy should imply functionality (e.g. a live counter) that isn't actually present on that screen.
3. As little design as possible (#10) — cut duplicated affordances (repeated CTA links, repeated stat/card patterns) and decorative flourishes that don't serve the primary task.

Constraints carried over from the audit scope: French-language site, existing A/B test infrastructure (index-b.html variant) — confirm with the site owner whether the redesign replaces or becomes a new A/B arm; live production traffic, so no code changes without a review/rollout plan.

Deliverables for the plan:
- New information architecture (not derived from old) for the homepage, still supporting the B2B/B2C split decision from Preserve
- New primary flow (low-fi, labeled, compared side-by-side to current) showing how a visitor reaches "start a quote" with fewer duplicated CTAs
- States checklist (empty, loading, error, success, focus, disabled) — explicitly address focus and disabled even though this page has no form, since the FAQ control and CTAs need them
- Migration path for users currently on the old design (traffic continuity, SEO preservation given existing meta/description content)
- Cutover criteria (when is the old design retired) — coordinate with the existing A/B test setup (index-b.html) already live on this repo

Anti-patterns to guard against (specific to REDESIGN):
- Porting the old spacing/type values or the canvas/glint animation code under new visual styling
- Keeping both the old and new homepage behind a flag indefinitely
- Redesigning to chase a newer visual trend rather than the principles above (useful, honest, as little as possible)
- Treating the Preserve list as optional — the brand tokens, B2B/B2C split concept, and FAQ content must carry forward
```
