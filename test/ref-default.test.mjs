import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SLUGS } from '../middleware.js';

const SOURCE = readFileSync('assets/ref.js', 'utf8');

// Execute assets/ref.js dans un contexte minimal (document + window) et
// renvoie la valeur exposee.
function msRefFor(cookie) {
  const context = { document: { cookie } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  return context.msRef;
}

test('sans cookie, le dossier revient a Antoine par defaut', () => {
  assert.equal(msRefFor(''), 'ag');
});

test('le repli par defaut est un slug reconnu par le middleware', () => {
  assert.ok(
    SLUGS.includes(msRefFor('')),
    'un repli absent de SLUGS produirait une attribution que le site refuse par ailleurs'
  );
});

test('le commercial du cookie prime sur le repli', () => {
  assert.equal(msRefFor('ms_ref=lg'), 'lg');
});

test('ms_ref est lu correctement au milieu d_autres cookies', () => {
  assert.equal(msRefFor('ms_variant=B; ms_ref=mv; ms_consent=accepted'), 'mv');
});

test('un cookie au nom proche n_est pas confondu avec ms_ref', () => {
  assert.equal(msRefFor('autre_ms_ref=zb'), 'ag');
});

function msCampFor(cookie) {
  const context = { document: { cookie } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  return context.msCamp;
}

test('sans cookie, aucune campagne n_est exposee', () => {
  assert.equal(msCampFor(''), null);
});

test('le code de campagne du cookie est expose', () => {
  assert.equal(msCampFor('ms_camp=chr-e1'), 'chr-e1');
});

test('ms_camp est lu correctement au milieu d_autres cookies', () => {
  assert.equal(msCampFor('ms_ref=ag; ms_camp=ind-e2; ms_consent=accepted'), 'ind-e2');
});
