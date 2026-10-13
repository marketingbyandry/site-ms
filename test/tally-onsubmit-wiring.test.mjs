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

test('ms-strategy-landing-2.html cable Tally.openPopup sur onTallySubmit', () => {
  const html = readFileSync('ms-strategy-landing-2.html', 'utf8');
  assert.match(html, ONSUBMIT_PATTERN, 'onSubmit a disparu de Tally.openPopup dans ms-strategy-landing-2.html');
});

test('b2c.html cable Tally.openPopup sur onTallySubmit', () => {
  const html = readFileSync('b2c.html', 'utf8');
  assert.match(html, ONSUBMIT_PATTERN, 'onSubmit a disparu de Tally.openPopup dans b2c.html');
});

// Tally redirige vers merci-facture.html juste apres l'envoi : un evenement
// PostHog en file d'attente est perdu avec la page (reproduit le 10/10/2026,
// aucun lead_submitted n'etait jamais remonte). L'envoi doit etre immediat.
const BEACON_PATTERN = /capture\('lead_submitted',[^)]*\},\s*\{\s*send_instantly:\s*true,\s*transport:\s*'sendBeacon'\s*\}\)/;

for (const file of ['b2b.html', 'b2c.html', 'ms-strategy-landing-2.html']) {
  test(`${file} envoie lead_submitted immediatement (avant la redirection Tally)`, () => {
    const html = readFileSync(file, 'utf8');
    assert.match(html, BEACON_PATTERN, `lead_submitted doit utiliser send_instantly + sendBeacon dans ${file}`);
  });
}
