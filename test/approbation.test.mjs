import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import middleware from '../middleware.js';
import loginHandler from '../api/approbation-login.js';
import voteHandler from '../api/approbation-vote.js';
import { loadStudio, postIds, postsModule, studioBlock } from '../scripts/build-studio.mjs';
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
  await voteHandler({ method: 'POST', headers: {}, body: { post: 'J1-LI', decision: 'approuve', reviewer: 'Julie' } }, res);
  assert.equal(res.statusCode, 401);
});

test('validateVote exige un post connu, une décision valide, un prénom, et un commentaire hors approbation', () => {
  assert.equal(validateVote({ post: 'J1-LI', decision: 'approuve', reviewer: 'Julie' }).ok, true);
  assert.equal(validateVote({ post: 'Z9', decision: 'approuve', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'J1-LI', decision: 'peut-etre', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'J1-LI', decision: 'approuve', reviewer: ' ' }).ok, false);
  assert.equal(validateVote({ post: 'J1-LI', decision: 'refuse', reviewer: 'Julie' }).ok, false);
  assert.equal(validateVote({ post: 'J1-LI', decision: 'modifier', reviewer: 'Julie', comment: 'Raccourcir' }).ok, true);
});

test('le vote part dans PostHog comme événement post_review sans profil personne', () => {
  const event = buildReviewEvent({ apiKey: 'k', post: 'J2-FB', decision: 'modifier', comment: 'c', reviewer: 'Julie', timestamp: 't' });
  assert.equal(event.event, 'post_review');
  assert.equal(event.distinct_id, 'com:julie');
  assert.equal(event.properties.post, 'J2-FB');
  assert.equal(event.properties.$process_person_profile, false);
});

test('approbation.html et les identifiants de l’API sont à jour avec la source du Studio', () => {
  const studio = loadStudio();
  const html = readFileSync('approbation.html', 'utf8');
  assert.ok(html.includes(studioBlock(studio)), 'approbation.html désynchronisé : lancer npm run build:studio');
  assert.equal(readFileSync('lib/approbation-posts.mjs', 'utf8'), postsModule(studio), 'lancer npm run build:studio');
  assert.deepEqual(POST_IDS, postIds(studio));
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(readFileSync('sitemap.xml', 'utf8'), /approbation/);
});

test('chaque jour du Studio a ses 4 réseaux et ses médias existent', () => {
  for (const jour of loadStudio().jours) {
    for (const net of ['LinkedIn', 'Facebook', 'Instagram', 'X']) {
      assert.match(jour.post, new RegExp(`^## ${net} \\(`, 'm'), `J${jour.jour} : section ${net} absente du post`);
      const v = jour.visuels[net];
      assert.ok(v, `J${jour.jour} : visuel ${net} absent de studio.json`);
      const files = [v.file, ...(v.slides || []).filter((s) => s.k === 'photo').map((s) => s.src)].filter(Boolean);
      for (const f of files) assert.ok(existsSync(`approbation-media/${f}`), `média manquant : approbation-media/${f}`);
    }
  }
});

test('les médias du Studio ne sont servis qu’avec la session', async () => {
  const res = await middleware(new Request('https://www.byandry.com/approbation-media/videos/J2_reconduction-tacite_9x16.mp4'));
  assert.equal(res.status, 401);
  assert.match(res.headers.get('cache-control'), /no-store/);
  assert.match(readFileSync('robots.txt', 'utf8'), /Disallow: \/approbation-media\//);
});
