import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

// Regression (relecture PR #59) : charger assets/analytics.js apres le
// 'load' + requestIdleCallback (jusqu'a 2s) pour un visiteur deja consentant
// ouvrait une fenetre ou un clic CTA rapide etait perdu (le listener
// cta_click, src/analytics.js, n'existait pas encore). assets/analytics-loader.js
// verifie le consentement et charge le bundle des son execution, a la meme
// position dans le document que l'ancien <script defer src="assets/
// analytics.js"> statique — donc sans latence supplementaire par rapport a
// l'existant.

test('les 11 pages qui chargeaient assets/analytics.js chargent maintenant assets/analytics-loader.js avant assets/cookie-consent.js', () => {
  const pages = readdirSync('.')
    .filter((f) => f.endsWith('.html'))
    .filter((f) => readFileSync(f, 'utf8').includes('cookie-consent.js'));

  assert.ok(pages.length >= 11, `attendu au moins 11 pages avec cookie-consent.js, trouve ${pages.length}`);

  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    const loaderIdx = html.indexOf('analytics-loader.js');
    const consentIdx = html.indexOf('cookie-consent.js');
    assert.ok(loaderIdx !== -1, `analytics-loader.js absent de ${file}`);
    assert.ok(loaderIdx < consentIdx, `analytics-loader.js doit etre charge avant cookie-consent.js dans ${file}`);
  }
});

// --- Environnement DOM minimal pour executer assets/analytics-loader.js tel quel ---

function makeScriptElement() {
  return {
    tagName: 'script',
    remove() {},
    dispatchError() { if (this.onerror) this.onerror(); },
    dispatchLoad() { if (this.onload) this.onload(); },
  };
}

function runLoader({ cookie = '' } = {}) {
  const source = readFileSync('assets/analytics-loader.js', 'utf8');
  const createdScripts = [];

  const documentObj = {
    cookie,
    createElement(tag) {
      const el = makeScriptElement();
      if (tag === 'script') createdScripts.push(el);
      return el;
    },
    head: { appendChild() {} },
  };

  const windowObj = { document: documentObj };
  const context = { window: windowObj, document: documentObj, console };
  vm.createContext(context);
  vm.runInContext(source, context);

  return { context, createdScripts, windowObj };
}

test("consentement accorde (analytics:true) : le bundle est cree immediatement, des l'execution du script", () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: false }));
  const { createdScripts } = runLoader({ cookie });
  assert.equal(createdScripts.length, 1, 'le bundle doit etre injecte de facon synchrone');
  assert.equal(createdScripts[0].src, 'assets/analytics.js');
});

test('consentement refuse partout (analytics:false, marketing:false) : rien ne charge', () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: false, marketing: false }));
  const { createdScripts } = runLoader({ cookie });
  assert.equal(createdScripts.length, 0);
});

test('aucun cookie ms_consent : rien ne charge', () => {
  const { createdScripts } = runLoader({ cookie: '' });
  assert.equal(createdScripts.length, 0);
});

test('cookie ms_consent malforme (ancien format) : rien ne charge, pas de crash', () => {
  const { createdScripts } = runLoader({ cookie: 'ms_consent=accepted' });
  assert.equal(createdScripts.length, 0);
});

test('window.__msLoadAnalyticsScript est toujours expose, meme sans consentement (reutilise par cookie-consent.js)', () => {
  const { windowObj } = runLoader({ cookie: '' });
  assert.equal(typeof windowObj.__msLoadAnalyticsScript, 'function');
});

test('window.__msLoadAnalyticsScript appelle onReady une fois le script charge', () => {
  const { createdScripts, windowObj } = runLoader({ cookie: '' });
  let ready = false;
  windowObj.__msLoadAnalyticsScript(() => { ready = true; });
  assert.equal(createdScripts.length, 1);
  assert.equal(ready, false, "pas encore pret avant l'evenement load");
  createdScripts[0].dispatchLoad();
  assert.equal(ready, true);
});

test('script.onerror : une nouvelle tentative de chargement reste possible ensuite', () => {
  const { createdScripts, windowObj } = runLoader({ cookie: '' });
  windowObj.__msLoadAnalyticsScript(() => {});
  assert.equal(createdScripts.length, 1);
  createdScripts[0].dispatchError();

  windowObj.__msLoadAnalyticsScript(() => {});
  assert.equal(createdScripts.length, 2, 'une seconde tentative doit etre possible apres un echec reseau');
});
