import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Verifie que Tally.openPopup() est bien cable sur onTallySubmit dans les
// pages qui chargent le Pixel Meta (b2b.html, b2c.html) — sans ce callback,
// la Conversions API ne recoit plus aucun event "Lead" au depot de facture.
const ONSUBMIT_PATTERN = /Tally\.openPopup\('kd15W1',\s*\{[^}]*onSubmit:\s*onTallySubmit/;

test('b2b.html cable Tally.openPopup sur onTallySubmit', () => {
  const html = readFileSync('b2b.html', 'utf8');
  assert.match(html, ONSUBMIT_PATTERN, 'onSubmit a disparu de Tally.openPopup dans b2b.html');
});

test('b2c.html cable Tally.openPopup sur onTallySubmit', () => {
  const html = readFileSync('b2c.html', 'utf8');
  assert.match(html, ONSUBMIT_PATTERN, 'onSubmit a disparu de Tally.openPopup dans b2c.html');
});
