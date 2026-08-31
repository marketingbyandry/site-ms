import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Verifie que openTallyForm() dans b2b.html declenche bien InitiateCheckout
// avant d'ouvrir le popup Tally — c'est le signal d'intention utilise pour
// l'audience de retargeting "formulaire ouvert, pas encore soumis".
// b2c.html n'est pas couvert : le B2C est mis de cote pour l'instant.
test("b2b.html declenche fbq InitiateCheckout dans openTallyForm", () => {
  const html = readFileSync('b2b.html', 'utf8');
  assert.match(
    html,
    /fbq\('track',\s*'InitiateCheckout'\)/,
    "InitiateCheckout a disparu de openTallyForm() dans b2b.html"
  );
});
