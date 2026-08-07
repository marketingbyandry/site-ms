import { test } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { SLUGS } from '../middleware.js';

const [SLUG] = SLUGS;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';

function call(url, cookie) {
  const headers = { 'user-agent': UA };
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

test('un slug inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.byandry.com/b2b.html?ref=slug-invente');
  assert.equal(
    refCookie(response),
    null,
    'sans whitelist, n_importe quel visiteur peut s_attribuer un dossier'
  );
});

test('first-touch : un ms_ref existant n_est pas ecrase', () => {
  const other = SLUGS[1] || 'autre';
  const response = call(
    `https://www.byandry.com/b2b.html?ref=${other}`,
    `ms_ref=${SLUG}`
  );
  assert.equal(
    refCookie(response),
    null,
    'le commercial qui a cree la demande doit garder le dossier'
  );
});

test('le lien court /c/<slug> redirige vers la landing avec le ref', () => {
  const response = call(`https://www.byandry.com/c/${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get('location'),
    `https://www.byandry.com/b2b.html?ref=${SLUG}`
  );
});

test('un lien court inconnu redirige sans attribuer', () => {
  const response = call('https://www.byandry.com/c/slug-invente');
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get('location'),
    'https://www.byandry.com/b2b.html'
  );
});

test('la page reste servie quand aucun ref n_est present', () => {
  const response = call('https://www.byandry.com/b2b.html');
  assert.equal(refCookie(response), null);
  assert.ok(response.headers.get('set-cookie').includes('ms_variant='));
});
