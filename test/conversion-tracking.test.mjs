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
function runOnTallySubmit(file, { marketing, analytics = true }) {
  const html = readFileSync(file, 'utf8');
  const start = Math.min(html.indexOf('function msMarketingConsent'), html.indexOf('var lastTallySource'));
  const end = html.indexOf('</script>', html.indexOf('function onTallySubmit'));
  const dataLayer = [];
  const win = { dataLayer, msCamp: 'chr-e1', location: { href: 'https://x/' }, crypto: undefined };
  const consent = encodeURIComponent(JSON.stringify({ analytics, marketing }));
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

for (const file of PAGES) {
  test(`${file} : consentement analytics retiré (cookie analytics:false) => aucun generate_lead même si dataLayer existe`, () => {
    const { ctx, dataLayer } = runOnTallySubmit(file, { marketing: true, analytics: false });
    ctx.openTallyForm(file.slice(0, 3));
    ctx.onTallySubmit({ fields: [] });
    assert.equal(dataLayer.filter((e) => e.event === 'generate_lead').length, 0);
  });
}

// Retrait du consentement analytics : cookies _ga* effacés puis GTM arrêté (rechargement unique).
function runConsentBanner({ cookie, gtmLoaded }) {
  const writes = [];
  let reloads = 0;
  const handlers = {};
  const el = (id) => ({ addEventListener: (_, fn) => { handlers[id] = fn; }, checked: false, remove() {} });
  const doc = {
    readyState: 'complete',
    get cookie() { return cookie; },
    set cookie(v) { writes.push(v); },
    getElementById: (id) => (id === 'ms-cookie-banner' ? null : el(id)),
    createElement: () => ({ setAttribute() {}, set innerHTML(v) {} }),
    body: { appendChild() {} }, head: { appendChild() {} }
  };
  const win = { dataLayer: gtmLoaded ? [{ event: 'gtm.js' }] : undefined };
  const ctx = { window: win, document: doc, location: { hostname: 'www.cabinetms.fr', reload: () => { reloads++; } }, encodeURIComponent, decodeURIComponent, JSON, RegExp, Date };
  vm.createContext(ctx);
  vm.runInContext(readFileSync('assets/cookie-consent.js', 'utf8'), ctx);
  win.msOpenCookieBanner();
  return { writes, handlers, reloads: () => reloads };
}

test('refus après consentement : cookies _ga* expirés (hôte et parent), puis un seul rechargement', () => {
  const cookie = 'ms_consent=' + encodeURIComponent(JSON.stringify({ analytics: true, marketing: false })) + '; _ga=GA1.1.1; _ga_ABC123=x; autre=1';
  const { writes, handlers, reloads } = runConsentBanner({ cookie, gtmLoaded: true });
  handlers['ms-cookie-reject']();
  const gaWrites = writes.filter((w) => /^_ga/.test(w));
  for (const name of ['_ga', '_ga_ABC123']) {
    assert.ok(gaWrites.some((w) => w.startsWith(name + '=;') && /expires=Thu, 01 Jan 1970/.test(w) && !/domain=/.test(w)), name + ' hôte courant');
    assert.ok(gaWrites.some((w) => w.startsWith(name + '=;') && /domain=\.?www\.cabinetms\.fr/.test(w)), name + ' domaine');
    assert.ok(gaWrites.some((w) => w.startsWith(name + '=;') && /domain=\.?cabinetms\.fr/.test(w)), name + ' parent');
  }
  assert.ok(!writes.some((w) => /^autre=/.test(w)));
  assert.equal(reloads(), 1);
});

test("refus sans GTM chargé sur la page : cookies effacés, pas de rechargement", () => {
  const { handlers, reloads } = runConsentBanner({ cookie: '_ga=1', gtmLoaded: false });
  handlers['ms-cookie-reject']();
  assert.equal(reloads(), 0);
});

test("acceptation : aucun effacement ni rechargement", () => {
  const { writes, handlers, reloads } = runConsentBanner({ cookie: '_ga=1', gtmLoaded: true });
  handlers['ms-cookie-accept']();
  assert.ok(!writes.some((w) => /^_ga/.test(w)));
  assert.equal(reloads(), 0);
});

// Politique de confidentialité
test('la politique de confidentialité décrit Google Analytics 4 (cookies _ga, Google, transfert hors UE)', () => {
  const html = readFileSync('politique-confidentialite.html', 'utf8');
  assert.match(html, /Google Analytics 4/);
  assert.match(html, /<code>_ga<\/code>/);
  assert.match(html, /Google Ireland Limited/);
  assert.match(html, /hors (de l'Union européenne|UE)/);
});

// ms_variant : seulement les chemins historiques
test('une page SEO reçoit camp/ref mais pas ms_variant', () => {
  const res = middleware(new Request('https://cabinetms.fr/prix-kwh-professionnel-2026.html', { headers: { 'user-agent': 'Mozilla/5.0' } }));
  assert.ok(!(res.headers.get('set-cookie') || '').includes('ms_variant'));
});

test('une page historique reçoit toujours ms_variant', () => {
  const res = middleware(new Request('https://cabinetms.fr/b2b.html', { headers: { 'user-agent': 'Mozilla/5.0' } }));
  assert.match(res.headers.get('set-cookie') || '', /ms_variant=/);
});
