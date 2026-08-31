import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Verifie que la garde de consentement marketing (Pixel Meta : Lead,
// InitiateCheckout) lit bien le format JSON {analytics, marketing} que pose
// assets/cookie-consent.js, et non l'ancien format string accepted/refused.
// Cette regle a deja casse silencieusement le tracking Meta une fois — le
// format du cookie avait change sans que ces deux pages soient mises a jour,
// et aucun test existant ne l'a detecte (voir tally-onsubmit-wiring.test.mjs,
// qui verifie seulement le cablage, pas le comportement de la garde).
const FUNCTION_PATTERN = /function msMarketingConsent\(\) \{[\s\S]*?\n\}\n/;

function extractMsMarketingConsent(file) {
  const html = readFileSync(file, 'utf8');
  const match = html.match(FUNCTION_PATTERN);
  assert.ok(match, `msMarketingConsent() introuvable dans ${file}`);
  return match[0];
}

function msMarketingConsentFor(source, cookie) {
  const context = { document: { cookie } };
  vm.createContext(context);
  vm.runInContext(source + '\nmsMarketingConsent;', context);
  const fn = vm.runInContext('msMarketingConsent', context);
  return fn();
}

for (const file of ['b2b.html', 'b2c.html']) {
  const source = extractMsMarketingConsent(file);

  test(`${file}: aucun cookie ms_consent -> pas de consentement marketing`, () => {
    assert.equal(msMarketingConsentFor(source, ''), false);
  });

  test(`${file}: ancien format string (ms_consent=accepted) -> pas de consentement marketing`, () => {
    assert.equal(msMarketingConsentFor(source, 'ms_consent=accepted'), false);
  });

  test(`${file}: JSON avec marketing:true -> consentement marketing accorde`, () => {
    const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: false, marketing: true }));
    assert.equal(msMarketingConsentFor(source, cookie), true);
  });

  test(`${file}: JSON avec marketing:false -> pas de consentement marketing`, () => {
    const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: false }));
    assert.equal(msMarketingConsentFor(source, cookie), false);
  });

  test(`${file}: JSON malforme -> pas de crash, pas de consentement marketing`, () => {
    assert.equal(msMarketingConsentFor(source, 'ms_consent=%7Bnot-json'), false);
  });
}
