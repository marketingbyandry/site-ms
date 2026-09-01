import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Regression: le favicon animé consommait ~2.7s de CPU sur mobile (canvas.toDataURL()
// en boucle toutes les 120ms). Il doit rester statique (mais present) hors desktop
// avec souris, comme assets/hero-glow.js (meme convention hover/pointer).
test("favicon-animate.js bail out sur les appareils sans souris fine (mobile/tactile)", () => {
  const source = readFileSync('assets/favicon-animate.js', 'utf8');
  assert.match(
    source,
    /!\s*window\.matchMedia\(["']\(hover: hover\) and \(pointer: fine\)["']\)\.matches\)\s*return;/,
    "le garde hover/pointer (meme convention que hero-glow.js) est absent ou pas negue"
  );
});
