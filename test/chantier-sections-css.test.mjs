// test/chantier-sections-css.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = () => readFileSync('assets/chantier-sections.css', 'utf8');

test('chantier-sections.css définit les tokens de mapping gabarit → site', () => {
  const source = css();
  assert.match(source, /--line:\s*rgba\(43,181,200,\.28\)/);
  assert.match(source, /--surface:\s*#0e2b34/);
  assert.match(source, /--surface-2:\s*#123640/);
  assert.match(source, /--ok:\s*var\(--green\)/);
  assert.match(source, /--bad:\s*#e05555/);
});

test('chantier-sections.css fournit des tokens de surface dédiés au thème clair (pas de dégradé sombre hors-thème)', () => {
  const source = css();
  const lightRoot = source.match(/:root\[data-theme="light"\]\{[^}]*\}/);
  assert.ok(lightRoot, ':root[data-theme="light"] doit redéfinir --line/--surface/--surface-2');
  assert.match(lightRoot[0], /--surface:\s*rgba\(26,122,138,/);
  assert.match(lightRoot[0], /--surface-2:\s*rgba\(26,122,138,/);
});

test('chantier-sections.css marque .case-card et .compare d\'un accent cyan→vert plutôt que d\'un simple aplat', () => {
  const source = css();
  assert.match(source, /\.case-card::before\{[^}]*linear-gradient\(90deg,var\(--teal-light\),var\(--green\)\)/);
  assert.match(source, /\.compare::before\{[^}]*linear-gradient\(90deg,var\(--teal-light\),var\(--green\)\)/);
});

test('chantier-sections.css définit les classes de la Section 6 (photo system, déjà shippé PR #76)', () => {
  const source = css();
  assert.match(source, /\.photo-section\{/);
  assert.match(source, /\.photo-system-grid\{/);
  assert.match(source, /\.flip-card\{/);
  assert.match(source, /\.flip-card-inner\{/);
  assert.match(source, /\.flip-card-front,\.flip-card-back\{/);
  assert.match(source, /\.flip-card-back\{/);
  assert.match(source, /\.flip-hint\{/);
  assert.match(source, /\.photo-ph\{/);
  assert.match(source, /\.photo-ph \.tag\{/);
  assert.match(source, /\.photo-ph \.dot-grid\{/);
  assert.match(source, /\.rule-note\{/);
  assert.match(source, /:root\[data-theme="light"\] \.flip-card-back\{/);
});

test('chantier-sections.css définit les variantes photo autonomes (vignette blog, bannière article)', () => {
  const source = css();
  assert.match(source, /\.blog-thumb\{[^}]*position:\s*relative/);
  assert.match(source, /\.article-banner\{[^}]*position:\s*relative/);
});

test('chantier-sections.css définit les classes des sections 2, 3, 4, 5 et 7', () => {
  const source = css();
  assert.match(source, /\.mirror-row\{/);
  assert.match(source, /\.cases-grid-3\{/);
  assert.match(source, /\.case-card\{/);
  assert.match(source, /\.compare\{/);
  assert.match(source, /\.compare-row\{/);
  assert.match(source, /\.mark\.ok\{/);
  assert.match(source, /\.mark\.bad\{/);
  assert.match(source, /\.console-standalone\{/);
  assert.match(source, /\.console-panel\{/);
  assert.match(source, /\.btn-aurora\{/);
  assert.match(source, /\.btn-aurora:hover::after\{/);
});

test('chantier-sections.css respecte prefers-reduced-motion sur ses animations', () => {
  const source = css();
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
});
