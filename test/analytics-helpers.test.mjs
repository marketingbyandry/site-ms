import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCookie, ctaLabel } from '../src/analytics-helpers.mjs';

test('readCookie lit un cookie en debut de chaine', () => {
  assert.equal(readCookie('ms_variant=B; ms_consent=accepted', 'ms_variant'), 'B');
});

test('readCookie lit un cookie en milieu de chaine', () => {
  assert.equal(readCookie('foo=1; ms_consent=accepted; bar=2', 'ms_consent'), 'accepted');
});

test('readCookie renvoie null quand le cookie est absent', () => {
  assert.equal(readCookie('foo=1; bar=2', 'ms_consent'), null);
});

test('readCookie ne confond pas un cookie avec un autre dont il est le suffixe', () => {
  assert.equal(readCookie('autre_ms_consent=refused', 'ms_consent'), null);
});

test('readCookie tolere une chaine vide', () => {
  assert.equal(readCookie('', 'ms_consent'), null);
});

test('readCookie decode la valeur', () => {
  assert.equal(readCookie('ms_consent=a%20b', 'ms_consent'), 'a b');
});

test('ctaLabel retire la fleche et les espaces autour', () => {
  assert.equal(ctaLabel('Combien ca me coute reellement →'), 'Combien ca me coute reellement');
});

test('ctaLabel laisse intact un libelle sans fleche', () => {
  assert.equal(ctaLabel('  Transmettre ma facture  '), 'Transmettre ma facture');
});

test('ctaLabel tolere une valeur vide', () => {
  assert.equal(ctaLabel(''), '');
});

import { loadGtm } from '../src/analytics-helpers.mjs';

test('loadGtm initialise dataLayer, pousse gtm.start et injecte gtm.js une seule fois', () => {
  const appended = [];
  const doc = {
    createElement: () => ({}),
    head: { appendChild: (el) => appended.push(el) }
  };
  const win = {};
  loadGtm(win, doc, 'GTM-TEST');
  loadGtm(win, doc, 'GTM-TEST');
  assert.equal(appended.length, 1);
  assert.equal(appended[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-TEST');
  assert.equal(appended[0].async, true);
  assert.equal(win.dataLayer[0].event, 'gtm.js');
  assert.equal(typeof win.dataLayer[0]['gtm.start'], 'number');
});
