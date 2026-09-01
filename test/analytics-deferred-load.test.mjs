import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

// Regression: assets/analytics.js (bundle PostHog + Pixel Meta, ~80KB dont
// ~71KB jamais executes selon Lighthouse) etait charge statiquement et
// inconditionnellement sur chaque page via <script defer>, meme quand aucun
// consentement n'etait accorde. Il doit desormais etre injecte dynamiquement
// par assets/cookie-consent.js, seulement quand un consentement (existant ou
// tout juste donne) le rend utile.

test('aucune page HTML ne charge assets/analytics.js de facon statique', () => {
  const offenders = readdirSync('.')
    .filter((f) => f.endsWith('.html'))
    .filter((f) => /<script[^>]*src="assets\/analytics\.js"/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, [], `balise <script> statique encore presente dans:\n${offenders.join('\n')}`);
});

test('assets/cookie-consent.js contient toujours le point de chargement dynamique du bundle', () => {
  const source = readFileSync('assets/cookie-consent.js', 'utf8');
  assert.match(source, /createElement\(['"]script['"]\)/, "le bundle n'est plus jamais injecte dynamiquement");
  assert.match(source, /assets\/analytics\.js/, "le chemin du bundle a disparu de cookie-consent.js");
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

function runCookieConsent({ cookie = '', readyState = 'complete', requestIdleCallback } = {}) {
  const source = readFileSync('assets/cookie-consent.js', 'utf8');
  const createdScripts = [];
  const byId = {};

  const documentObj = {
    cookie,
    readyState,
    createElement(tag) {
      const el = makeElement(tag);
      if (tag === 'script') createdScripts.push(el);
      return el;
    },
    getElementById(id) {
      if (!byId[id]) byId[id] = makeElement('button');
      return byId[id];
    },
    head: { appendChild(el) { if (el.tagName === 'script' && el.onload) { /* chargement simule manuellement dans le test */ } } },
    body: { appendChild() {} },
    addEventListener() {},
  };

  const windowObj = { document: documentObj };
  if (requestIdleCallback) windowObj.requestIdleCallback = requestIdleCallback;
  windowObj.addEventListener = function () {}; // pas de 'load' a simuler dans ces tests (readyState déjà 'complete')
  windowObj.setTimeout = setTimeout;

  const context = { window: windowObj, document: documentObj, setTimeout, console };
  vm.createContext(context);
  vm.runInContext(source, context);

  return { context, createdScripts, byId };
}

test("consentement deja accorde (analytics:true) : le bundle est charge de facon differee, pas immediate", () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: false }));
  let idleCallback = null;
  const { createdScripts } = runCookieConsent({
    cookie,
    requestIdleCallback: (fn) => { idleCallback = fn; },
  });

  assert.equal(createdScripts.length, 0, "le bundle ne doit pas etre injecte de facon synchrone/immediate");
  assert.ok(idleCallback, 'requestIdleCallback doit avoir ete programme pour charger le bundle au repos');

  idleCallback();
  assert.equal(createdScripts.length, 1, 'le bundle doit etre injecte une fois le callback idle execute');
  assert.equal(createdScripts[0].src, 'assets/analytics.js');
});

test('consentement refuse partout (analytics:false, marketing:false) : le bundle ne charge jamais', () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: false, marketing: false }));
  let idleCalled = false;
  const { createdScripts } = runCookieConsent({
    cookie,
    requestIdleCallback: () => { idleCalled = true; },
  });

  assert.equal(createdScripts.length, 0, 'aucun script ne doit etre cree sans consentement accorde');
  assert.equal(idleCalled, false, "pas de chargement differe programme si rien n'est accorde");
});

test("aucun consentement existant : le bandeau s'affiche et le bundle n'est pas charge avant une action de l'utilisateur", () => {
  const { createdScripts, byId } = runCookieConsent({ cookie: '' });
  assert.equal(createdScripts.length, 0, "le bundle ne doit pas se charger tant que l'utilisateur n'a rien choisi");
  assert.ok(byId['ms-cookie-accept'], 'le bouton Accepter doit avoir ete cable (bandeau affiche)');
});

test("clic sur Accepter : le bundle est charge immediatement (pas de delai idle)", () => {
  let idleScheduled = false;
  const { createdScripts, byId } = runCookieConsent({
    cookie: '',
    requestIdleCallback: () => { idleScheduled = true; },
  });

  byId['ms-cookie-accept'].dispatchClick();

  assert.equal(createdScripts.length, 1, "le clic sur Accepter doit injecter le bundle");
  assert.equal(createdScripts[0].src, 'assets/analytics.js');
  assert.equal(idleScheduled, false, "l'acceptation explicite ne doit pas passer par le chemin differe au repos");
});

test('clic sur "tout refuser" : le bundle ne se charge jamais', () => {
  const { createdScripts, byId } = runCookieConsent({ cookie: '' });
  byId['ms-cookie-reject'].dispatchClick();
  assert.equal(createdScripts.length, 0, 'un refus explicite ne doit jamais declencher le chargement du bundle');
});
