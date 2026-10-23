import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware from '../middleware.js';
import loginHandler from '../api/approbation-login.js';
import voteHandler from '../api/approbation-vote.js';
import {
  POST_IDS,
  buildReviewEvent,
  isValidToken,
  readCookie,
  sessionCookie,
  sha256Hex,
  tokenFromPassword,
  validateVote
} from '../lib/approbation.mjs';

function fakeRes() {
  const res = { statusCode: 0, headers: {}, body: undefined };
  res.status = (code) => { res.statusCode = code; return res; };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.json = (b) => { res.body = b; return res; };
  res.end = () => res;
  return res;
}

test('le jeton dérivé du bon mot de passe est accepté, un autre est refusé', async () => {
  const token = await tokenFromPassword('code-de-test');
  const expected = await sha256Hex(token);
  assert.equal(await isValidToken(token, expected), true);
  assert.equal(await isValidToken(await tokenFromPassword('autre'), expected), false);
  assert.equal(await isValidToken('pas-un-jeton', expected), false);
  assert.equal(await isValidToken(null), false);
});

test('le cookie de session est HttpOnly, Secure et relu correctement', async () => {
  const token = await tokenFromPassword('x');
  const cookie = sessionCookie(token);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.equal(readCookie(`a=1; ${cookie.split(';')[0]}; b=2`), token);
});

test('sans cookie, approbation.html renvoie le formulaire de mot de passe, pas la page', async () => {
  const res = await middleware(new Request('https://www.byandry.com/approbation.html'));
  assert.equal(res.status, 401);
  const html = await res.text();
  assert.match(html, /action="\/api\/approbation-login"/);
  assert.doesNotMatch(html, /Mot de passe incorrect/);
  assert.match(res.headers.get('cache-control'), /no-store/);
});

test('un cookie forgé ne donne pas accès, ?erreur affiche le message', async () => {
  const res = await middleware(new Request('https://www.byandry.com/approbation.html?erreur=1', {
    headers: { cookie: `ms_approb=${'a'.repeat(64)}` }
  }));
  assert.equal(res.status, 401);
  assert.match(await res.text(), /Mot de passe incorrect/);
});

test('un mauvais mot de passe renvoie au formulaire sans poser de cookie', async () => {
  const res = fakeRes();
  await loginHandler({ method: 'POST', body: { password: 'mauvais' } }, res);
  assert.equal(res.statusCode, 303);
  assert.equal(res.headers.location, '/approbation.html?erreur=1');
  assert.equal(res.headers['set-cookie'], undefined);
});

test('un vote sans session est refusé', async () => {
  const res = fakeRes();
  await voteHandler({ method: 'POST', headers: {}, body: { post: 'L1', decision: 'approuve', reviewer: 'Julie' } }, res);
  assert.equal(res.statusCode, 401);
});

test('validateVote exige un post connu, une décision valide, un prénom, et un commentaire hors approbation', () => {
  assert.equal(validateVote({ post: 'L1', decision: 'approuve', reviewer: 'Julie' }).ok, true);
  assert.equal(validateVote({ post: 'Z9', decision: 'approuve', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'L1', decision: 'peut-etre', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'L1', decision: 'approuve', reviewer: ' ' }).ok, false);
  assert.equal(validateVote({ post: 'L1', decision: 'refuse', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'L1', decision: 'modifier', reviewer: 'Julie', comment: 'Raccourcir' }).ok, true);
});

test('le vote part dans PostHog comme événement post_review sans profil personne', () => {
  const event = buildReviewEvent({ apiKey: 'k', post: 'L2', decision: 'modifier', comment: 'c', reviewer: 'Julie', timestamp: 't' });
  assert.equal(event.event, 'post_review');
  assert.equal(event.distinct_id, 'com:julie');
  assert.equal(event.properties.post, 'L2');
  assert.equal(event.properties.$process_person_profile, false);
});

test('la page liste exactement les posts attendus par l’API, et reste hors index', () => {
  const html = readFileSync('approbation.html', 'utf8');
  const ids = [...html.matchAll(/\{ id: '([A-Z]\d)'/g)].map((m) => m[1]);
  assert.deepEqual(ids, POST_IDS);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(readFileSync('sitemap.xml', 'utf8'), /approbation/);
});
