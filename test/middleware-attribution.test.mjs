import { test } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { SLUGS } from '../middleware.js';

const [SLUG, OTHER_SLUG] = SLUGS;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function call(url, { cookie, userAgent = UA } = {}) {
  const headers = { 'user-agent': userAgent };
  if (cookie) headers.cookie = cookie;
  return middleware(new Request(url, { headers }));
}

// Recupere le cookie ms_ref pose par la reponse, ou null.
function refCookie(response) {
  const cookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
  const found = cookies.find((c) => c.startsWith('ms_ref='));
  return found ? found.split(';')[0].slice('ms_ref='.length) : null;
}

test('un slug connu dans ?ref est pose en cookie ms_ref', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.equal(refCookie(response), SLUG);
});

test('le slug disparait de l_URL apres attribution', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get('location'),
    'https://www.byandry.com/b2b.html',
    "tant que le slug reste dans l_URL, il peut etre indexe ou repartage"
  );
});

test('les parametres utm survivent au nettoyage du slug', () => {
  const response = call(
    `https://www.byandry.com/b2b.html?utm_source=commercial&ref=${SLUG}&utm_campaign=${SLUG}`
  );
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('utm_source'), 'commercial');
  assert.equal(location.searchParams.get('utm_campaign'), SLUG);
});

test('la redirection d_attribution n_est jamais mise en cache', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`);
  assert.match(
    response.headers.get('cache-control'),
    /no-store/,
    'un CDN resservirait le Set-Cookie a d_autres visiteurs'
  );
});

test('un slug inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.byandry.com/b2b.html?ref=slug-invente');
  assert.equal(
    refCookie(response),
    null,
    'sans whitelist, n_importe quel visiteur peut s_attribuer un dossier'
  );
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
});

test('first-touch : un ms_ref existant n_est pas ecrase', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${OTHER_SLUG}`, {
    cookie: `ms_ref=${SLUG}`
  });
  assert.equal(
    refCookie(response),
    null,
    'le commercial qui a cree la demande doit garder le dossier'
  );
});

test('un bot suit la redirection mais ne recoit aucune attribution', () => {
  const response = call(`https://www.byandry.com/b2b.html?ref=${SLUG}`, {
    userAgent: BOT_UA
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
});

test('le lien court /c/<slug> attribue et renvoie vers la landing propre', () => {
  const response = call(`https://www.byandry.com/c/${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), SLUG);
});

test('un lien court inconnu redirige sans attribuer', () => {
  const response = call('https://www.byandry.com/c/slug-invente');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
});

test('la page reste servie quand aucun ref n_est present', () => {
  const response = call('https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
  assert.ok(response.headers.get('set-cookie').includes('ms_variant='));
});
