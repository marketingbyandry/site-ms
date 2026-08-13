import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Verifie le cablage window.msCamp -> hiddenFields.camp dans openTallyForm(),
// sur les trois pages qui embarquent ce formulaire. Une coquille (ex.
// window.mscamp) ne serait pas repere par un simple lint/build et passerait
// inapercue jusqu'a un depot Tally sans code de campagne.
const CAMP_FIELD_PATTERN = /if\s*\(window\.msCamp\)\s*hiddenFields\.camp\s*=\s*window\.msCamp;/;

test('b2b.html cable window.msCamp sur hiddenFields.camp', () => {
  const html = readFileSync('b2b.html', 'utf8');
  assert.match(
    html,
    CAMP_FIELD_PATTERN,
    "openTallyForm() dans b2b.html ne transmet plus le code de campagne a Tally"
  );
});

test('b2c.html cable window.msCamp sur hiddenFields.camp', () => {
  const html = readFileSync('b2c.html', 'utf8');
  assert.match(
    html,
    CAMP_FIELD_PATTERN,
    "openTallyForm() dans b2c.html ne transmet plus le code de campagne a Tally"
  );
});

test('ms-strategy-landing-2.html cable window.msCamp sur hiddenFields.camp', () => {
  const html = readFileSync('ms-strategy-landing-2.html', 'utf8');
  assert.match(
    html,
    CAMP_FIELD_PATTERN,
    "openTallyForm() dans ms-strategy-landing-2.html ne transmet plus le code de campagne a Tally"
  );
});
