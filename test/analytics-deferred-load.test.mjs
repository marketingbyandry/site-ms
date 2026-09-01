import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

// Regression: assets/analytics.js (bundle PostHog + Pixel Meta, ~80KB dont
// ~71KB jamais executes selon Lighthouse) etait charge statiquement et
// inconditionnellement sur chaque page via <script defer>, meme quand aucun
// consentement n'etait accorde. Le chargement pour un consentement deja
// accorde est desormais gere par assets/analytics-loader.js (voir
// test/analytics-loader.test.mjs) ; ce fichier couvre assets/cookie-consent.js,
// qui gere l'affichage du bandeau et le cas "l'utilisateur vient d'accepter".

test('aucune page HTML ne charge assets/analytics.js de facon statique', () => {
  const offenders = readdirSync('.')
    .filter((f) => f.endsWith('.html'))
    .filter((f) => /<script[^>]*src="assets\/analytics\.js"/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, [], `balise <script> statique encore presente dans:\n${offenders.join('\n')}`);
});

test('assets/cookie-consent.js delegue le chargement du bundle a window.__msLoadAnalyticsScript (assets/analytics-loader.js)', () => {
  const source = readFileSync('assets/cookie-consent.js', 'utf8');
  assert.match(source, /__msLoadAnalyticsScript/, "le point de delegation vers analytics-loader.js a disparu");
  assert.doesNotMatch(
    source,
    /createElement\(['"]script['"]\)/,
    "cookie-consent.js ne doit plus injecter lui-meme le <script> du bundle (delegue a analytics-loader.js)"
  );
});

// --- Environnement DOM minimal pour executer assets/cookie-consent.js tel quel ---

function makeElement(tag) {
  const listeners = {};
  return {
    tagName: tag,
    _children: [],
    innerHTML: '',
    id: '',
    setAttribute() {},
    remove() {},
    appendChild(el) { this._children.push(el); },
    addEventListener(evt, cb) { (listeners[evt] = listeners[evt] || []).push(cb); },
    dispatchClick() { (listeners.click || []).forEach((cb) => cb()); },
  };
}

function runCookieConsent({ cookie = '', readyState = 'complete', loadAnalyticsScript } = {}) {
  const source = readFileSync('assets/cookie-consent.js', 'utf8');
  const byId = {};
  const loadCalls = [];

  const documentObj = {
    cookie,
    readyState,
    createElement(tag) { return makeElement(tag); },
    getElementById(id) {
      if (!byId[id]) byId[id] = makeElement('button');
      return byId[id];
    },
    head: { appendChild() {} },
    body: { appendChild() {} },
    addEventListener() {},
  };

  // Simule assets/analytics-loader.js, deja execute avant cookie-consent.js
  // dans l'ordre reel du document (voir test/analytics-loader.test.mjs).
  const windowObj = {
    document: documentObj,
    __msLoadAnalyticsScript(onReady) {
      loadCalls.push(onReady);
      if (loadAnalyticsScript) loadAnalyticsScript(onReady);
    },
  };
  windowObj.addEventListener = function () {};

  const context = { window: windowObj, document: documentObj, setTimeout, console };
  vm.createContext(context);
  vm.runInContext(source, context);

  return { context, byId, loadCalls, windowObj };
}

test('consentement deja accorde : cookie-consent.js ne cree pas le bandeau et ne recharge pas le bundle lui-meme', () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: false }));
  const { byId, loadCalls } = runCookieConsent({ cookie });

  assert.equal(Object.keys(byId).length, 0, "le bandeau ne doit pas etre affiche si un consentement existe deja");
  assert.equal(loadCalls.length, 0, "le chargement pour un consentement existant est gere par analytics-loader.js, pas ici");
});

test("aucun consentement existant : le bandeau s'affiche et rien n'est charge avant une action de l'utilisateur", () => {
  const { byId, loadCalls } = runCookieConsent({ cookie: '' });
  assert.ok(byId['ms-cookie-accept'], 'le bouton Accepter doit avoir ete cable (bandeau affiche)');
  assert.equal(loadCalls.length, 0, "rien ne doit charger tant que l'utilisateur n'a rien choisi");
});

test('clic sur Accepter : le bundle est charge via window.__msLoadAnalyticsScript, et window.msInitAnalytics est appele une fois pret', () => {
  const { byId, loadCalls, windowObj } = runCookieConsent({ cookie: '' });

  let initCalledWith = null;
  windowObj.msInitAnalytics = (consent) => { initCalledWith = consent; };

  byId['ms-cookie-accept'].dispatchClick();

  assert.equal(loadCalls.length, 1, "le clic sur Accepter doit demander le chargement du bundle");
  loadCalls[0](); // simule le script charge (onReady declenche par analytics-loader.js)
  // Comparaison champ a champ : l'objet consent vient du contexte vm (autre
  // realm), assert.deepEqual (strict) le rejetterait pour prototype differant.
  assert.equal(initCalledWith.analytics, true);
  assert.equal(initCalledWith.marketing, true);
});

test('clic sur "tout refuser" : le bundle n\'est jamais demande', () => {
  const { byId, loadCalls } = runCookieConsent({ cookie: '' });
  byId['ms-cookie-reject'].dispatchClick();
  assert.equal(loadCalls.length, 0, 'un refus explicite ne doit jamais declencher le chargement du bundle');
});
