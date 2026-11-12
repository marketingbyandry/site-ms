# Scope — Design Is audit, 2026-09-12

**Audited surface:** `index.html` at repo root, `main` branch HEAD `9e791a3` (1215 lines) — the SITE MS homepage as currently live/mergeable, including the just-merged PR #71 hero search bar for B2B/B2C. This is the pre-PR#76 state: the "Notre terrain" photo-system section (flip cards) built on branch `photo-system-section` is NOT yet merged and is explicitly out of scope for this pass (it has its own open review thread and hasn't been through this audit process yet).

**Not audited (explicitly out of scope):** b2b.html, b2c.html, blog.html, barometre-energie.html, comment-ca-marche.html, and other secondary pages — this pass is homepage-only. PR #76's unmerged section is out of scope.

**Primary user:** Two segments the homepage must serve simultaneously — a B2B decision-maker (energy manager / ops at a company evaluating an energy consulting partner) and a B2C individual (homeowner/renter looking to cut their energy bill). The homepage is the shared entry point before the visitor self-selects into `/b2b` or `/b2c`.

**Primary task:** Understand what M&S Strategy does, believe it's credible, and self-select into the right track (pro vs. particulier) or reach "Rejoindre M&S Strategy" — in the fewest steps, without misreading who the site is for.

**Constraints:**
- Brand: existing dark teal/cream token system (`--teal`, `--teal-dark`, `--teal-light`, `--cream`, `--dark`), both dark (default) and light theme supported via `:root[data-theme]`.
- Stack: static HTML/CSS/vanilla JS, no framework, no build step.
- Prior audit exists at `DESIGN-IS-2026-07-18/` — this pass re-scores the *current* state, not a diff against that one; findings there are not assumed still valid.
- No live dev server / Playwright unavailable in this environment (Darwin 21.6/Monterey — chromium/webkit unsupported on mac12) → Visual and Accessibility evidence are gathered from source (CSS/tokens/markup), not from live screenshots. Facts inferred this way are marked **INFERRED**.

**Reference designs / competitors:** none supplied by the user for this pass.
