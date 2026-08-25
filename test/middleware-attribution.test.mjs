import { test } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { SLUGS, CAMPAIGNS } from '../middleware.js';

const [SLUG, OTHER_SLUG] = SLUGS;
const [CAMP, OTHER_CAMP] = CAMPAIGNS;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function call(url, { cookie, userAgent = UA } = {}) {
  const headers = { 'user-agent': userAgent };
  if (cookie) headers.cookie = cookie;
  return middleware(new Request(url, { headers }));
}

function setCookies(response) {
  return response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
}

// Recupere le cookie ms_ref pose par la reponse, ou null.
function refCookie(response) {
  const found = setCookies(response).find((c) => c.startsWith('ms_ref='));
  return found ? found.split(';')[0].slice('ms_ref='.length) : null;
}

// Recupere le cookie ms_camp pose par la reponse, ou null.
function campCookie(response) {
  const found = setCookies(response).find((c) => c.startsWith('ms_camp='));
  return found ? found.split(';')[0].slice('ms_camp='.length) : null;
}

test('un slug connu dans ?ref est pose en cookie ms_ref', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${SLUG}`);
  assert.equal(refCookie(response), SLUG);
});

test('le slug disparait de l_URL apres attribution', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get('location'),
    'https://www.cabinetms.fr/b2b.html',
    "tant que le slug reste dans l_URL, il peut etre indexe ou repartage"
  );
});

test('les parametres utm survivent au nettoyage du slug', () => {
  const response = call(
    `https://www.cabinetms.fr/b2b.html?utm_source=commercial&ref=${SLUG}&utm_campaign=${SLUG}`
  );
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('utm_source'), 'commercial');
  assert.equal(location.searchParams.get('utm_campaign'), SLUG);
});

test('la redirection d_attribution n_est jamais mise en cache', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${SLUG}`);
  assert.match(
    response.headers.get('cache-control'),
    /no-store/,
    'un CDN resservirait le Set-Cookie a d_autres visiteurs'
  );
});

test('un slug inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.cabinetms.fr/b2b.html?ref=slug-invente');
  assert.equal(
    refCookie(response),
    null,
    'sans whitelist, n_importe quel visiteur peut s_attribuer un dossier'
  );
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
});

test('first-touch : un ms_ref existant n_est pas ecrase', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${OTHER_SLUG}`, {
    cookie: `ms_ref=${SLUG}`
  });
  assert.equal(
    refCookie(response),
    null,
    'le commercial qui a cree la demande doit garder le dossier'
  );
});

test('un bot suit la redirection mais ne recoit aucune attribution', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${SLUG}`, {
    userAgent: BOT_UA
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
  assert.equal(refCookie(response), null);
});

test('le lien court /c/<slug> attribue et renvoie vers la landing propre', () => {
  const response = call(`https://www.cabinetms.fr/c/${SLUG}`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
  assert.equal(refCookie(response), SLUG);
});

test('un lien court inconnu redirige sans attribuer', () => {
  const response = call('https://www.cabinetms.fr/c/slug-invente');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
  assert.equal(refCookie(response), null);
});

test('la page reste servie quand aucun ref n_est present', () => {
  const response = call('https://www.cabinetms.fr/b2b.html');
  assert.equal(refCookie(response), null);
  assert.ok(response.headers.get('set-cookie').includes('ms_variant='));
});

test('un code de campagne connu dans ?camp est pose en cookie ms_camp', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?camp=${CAMP}`);
  assert.equal(campCookie(response), CAMP);
});

test('camp disparait de l_URL apres attribution', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?camp=${CAMP}`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
});

test('un code de campagne inconnu est ignore plutot que stocke', () => {
  const response = call('https://www.cabinetms.fr/b2b.html?camp=campagne-inventee');
  assert.equal(campCookie(response), null);
  assert.equal(response.headers.get('location'), 'https://www.cabinetms.fr/b2b.html');
});

test('dernier-touch : un nouveau camp ecrase un ms_camp existant', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?camp=${OTHER_CAMP}`, {
    cookie: `ms_camp=${CAMP}`
  });
  assert.equal(
    campCookie(response),
    OTHER_CAMP,
    'contrairement a ref, camp doit refleter le dernier email qui a ramene le prospect'
  );
});

test('ref et camp cohabitent sur le meme lien', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?ref=${SLUG}&camp=${CAMP}`);
  assert.equal(refCookie(response), SLUG);
  assert.equal(campCookie(response), CAMP);
  const location = new URL(response.headers.get('location'));
  assert.equal(location.searchParams.get('ref'), null);
  assert.equal(location.searchParams.get('camp'), null);
});

test('un bot ne recoit aucun cookie camp', () => {
  const response = call(`https://www.cabinetms.fr/b2b.html?camp=${CAMP}`, {
    userAgent: BOT_UA
  });
  assert.equal(campCookie(response), null);
});

test('camp n_est jamais pose via le lien court /c/<slug>', () => {
  const response = call(`https://www.cabinetms.fr/c/${SLUG}`);
  assert.equal(campCookie(response), null);
});
