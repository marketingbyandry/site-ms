import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import middleware, { config } from '../middleware.js';

const PAGES = ['b2b.html', 'b2c.html'];

// 1. CTA « Étude gratuite » en un clic ---------------------------------------
for (const file of PAGES) {
  test(`${file} : chaque CTA « Étude gratuite » vers #upload ouvre Tally, avec repli href`, () => {
    const html = readFileSync(file, 'utf8');
    const ctas = [...html.matchAll(/<a\b[^>]*href="#upload"[^>]*>[^<]*Étude gratuite[^<]*<\/a>/g)].map((m) => m[0]);
    assert.ok(ctas.length >= 1);
    for (const cta of ctas) {
      assert.match(cta, /onclick="openTallyForm\('(b2b|b2c)'\); return false;"/, cta);
    }
  });

  test(`${file} : le texte de la section #upload ne renvoie plus à un formulaire « ci-contre »`, () => {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /Remplissez le formulaire ci-contre/);
    assert.match(html, /en 1 minute, sans engagement/);
  });
}

test("l'ouverture Tally garde la source de la page (b2b / b2c)", () => {
  for (const file of PAGES) {
    const src = file.slice(0, 3);
    const html = readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`class="ncta btn-aurora"[^>]*openTallyForm\\('${src}'\\)`));
  }
});

// 2. generate_lead --------------------------------------------------------------
function runOnTallySubmit(file, { marketing }) {
  const html = readFileSync(file, 'utf8');
  const start = Math.min(html.indexOf('function msMarketingConsent'), html.indexOf('var lastTallySource'));
  const end = html.indexOf('</script>', html.indexOf('function onTallySubmit'));
  const dataLayer = [];
  const win = { dataLayer, msCamp: 'chr-e1', location: { href: 'https://x/' }, crypto: undefined };
  const consent = encodeURIComponent(JSON.stringify({ analytics: true, marketing }));
  const ctx = {
    window: win, dataLayer, console, Tally: { openPopup() {} },
    document: { cookie: `ms_consent=${consent}` },
    localStorage: { getItem: () => null, removeItem() {} },
    fetch: () => Promise.resolve(), Date, Math
  };
  vm.createContext(ctx);
  vm.runInContext(html.slice(start, end), ctx);
  return { ctx, dataLayer, win };
}

for (const file of PAGES) {
  for (const marketing of [false, true]) {
    test(`${file} : onTallySubmit pousse un seul generate_lead sans donnée perso (marketing=${marketing})`, () => {
      const { ctx, dataLayer } = runOnTallySubmit(file, { marketing });
      ctx.openTallyForm(file.slice(0, 3));
      const payload = { fields: [{ type: 'INPUT_EMAIL', answer: { value: 'a@b.fr' } }, { type: 'INPUT_PHONE_NUMBER', answer: { value: '0600000000' } }] };
      ctx.onTallySubmit(payload);
      ctx.onTallySubmit(payload);
      const leads = dataLayer.filter((e) => e.event === 'generate_lead');
      assert.equal(leads.length, 1);
      assert.deepEqual(JSON.parse(JSON.stringify(leads[0])), { event: 'generate_lead', source: file.slice(0, 3), camp: 'chr-e1' });
    });
  }

  test(`${file} : sans dataLayer (pas de consentement GTM), onTallySubmit ne plante pas`, () => {
    const { ctx, win } = runOnTallySubmit(file, { marketing: false });
    delete win.dataLayer;
    assert.doesNotThrow(() => ctx.onTallySubmit({ fields: [] }));
    assert.equal(win.dataLayer, undefined);
  });
}

// 3. GTM uniquement après consentement ------------------------------------------
test('plus aucun snippet GTM en dur dans les pages ni les gabarits', () => {
  const files = [
    ...readdirSync('.').filter((f) => f.endsWith('.html')),
    ...readdirSync('templates').map((f) => `templates/${f}`),
    ...readdirSync('partials').map((f) => `partials/${f}`)
  ];
  const offenders = files.filter((f) => /googletagmanager\.com|GTM-THZKG49X/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, []);
});

test('GTM est chargé par src/analytics.js sous consentement analytics seulement', () => {
  const src = readFileSync('src/analytics.js', 'utf8');
  assert.match(src, /consent\.analytics && !gtmInitialised[\s\S]*loadGtm\(/);
});

test('le bandeau cookies cite Google Analytics (vue principale et préférences)', () => {
  const js = readFileSync('assets/cookie-consent.js', 'utf8');
  assert.match(js, /PostHog, Google Analytics, Meta/);
  assert.match(js, /PostHog et Google Analytics/);
});

// 4. Matcher middleware -----------------------------------------------------------
// Compile les motifs path-to-regexp utilisés ici (":nom(regex)", ":nom*").
function matches(pathname) {
  return config.matcher.some((p) => {
    const re = p
      .replace(/:[a-z]+\((.+?)\)/g, '($1)')
      .replace(/:[a-z]+\*/g, '.*');
    return new RegExp(`^${re}$`).test(pathname);
  });
}

test('le matcher couvre les pages SEO *.html à la racine', () => {
  assert.ok(matches('/prix-kwh-professionnel-2026.html'));
  assert.ok(matches('/b2b.html'));
  assert.ok(matches('/approbation.html'));
});

test('le matcher laisse passer assets, api, pagefind, sous-dossiers', () => {
  for (const p of ['/assets/analytics.js', '/api/capi-lead', '/pagefind/pagefind.js', '/assets/x.html', '/sitemap.xml']) {
    assert.equal(matches(p), false, p);
  }
});

test("camp sur une page SEO : cookie posé et URL nettoyée", () => {
  const res = middleware(new Request('https://cabinetms.fr/prix-kwh-professionnel-2026.html?camp=chr-e1&utm_source=x', { headers: { 'user-agent': 'Mozilla/5.0' } }));
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://cabinetms.fr/prix-kwh-professionnel-2026.html?utm_source=x');
  assert.match(res.headers.get('set-cookie'), /ms_camp=chr-e1/);
});
