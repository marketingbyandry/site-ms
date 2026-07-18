# Verdict — byandry.com homepage

**REDESIGN.** Total score is 7/30, far below the ≥20 threshold for REFINE, and two principles (#3 aesthetic, #8 thorough) scored 0 outright — the bones need to be rebuilt, not iterated on.

## Highest-leverage moves

1. **#3 Aesthetic / #10 As little as possible** — Replace the 46-value spacing scale and 31-value type scale (01-evidence.md B.1-B.2) with a systematized spacing grid and a modular type scale (5-7 steps). This single move also cuts the surface area for principle #10's duplicated-affordance problem, since inconsistent spacing is what lets near-duplicate card/stat patterns multiply unchecked.

2. **#6 Honest** — Source or remove the 9 flagged unsourced statistics and superlatives: "19% Économies moyennes" (line 384), "70M kWh négociés 2025" (386), "80% des dirigeants..." (491, 519, 529), "les meilleures offres" (403), "exclut structurellement tout favoritisme" (436, 466, 555). Every number on a broker's homepage should be attributable.

3. **#5 / #7 / #9 Unobtrusive / Long-lasting / Environmentally friendly** — Remove or gate behind `prefers-reduced-motion` the 6 auto-running decorative animation mechanisms (canvas particles, glint, line-reveal, pulse — lines 132, 137, 139, 834-839, 849-856, 908-913). This is a single evidence cluster (01-evidence.md D.4) driving three separate principle failures at once.

4. **#4 / #8 Understandable / Thorough** — Rebuild the FAQ accordion as real `<button>` elements with `aria-expanded` (currently `<div onclick>`, lines 667-692, not keyboard-reachable), add a `<main>` landmark (currently absent), add visible `:focus-visible` styling (currently absent site-wide), and gloss the 6 flagged jargon terms (line 376, 442, 442, 442, 386/492, 492).

5. **#2 / #10 Useful / As little as possible** — Consolidate the 11 stat-pairs, 9 numbered cards, and 8 eyebrow tags into fewer, higher-signal sections, and reduce the 7 CTA-style links that all point toward roughly "start a quote" down to one clear path per audience (B2B / B2C), so the primary task completes without wading through duplicated affordances.

## Anti-pattern check
- Not recommending REFINE out of sunk-cost bias — the codebase being a mature, live production site with real traffic does not change what the evidence shows.
- Not softening to REDESIGN-avoidance: total score (7/30) and two hard 0s make this unambiguous, not a single-screen ugliness call.
- Not recommending NEW: this is a live site with real, if flawed, content and IA decisions worth preserving (see handoff Preserve list) — REDESIGN, not a blank slate.
