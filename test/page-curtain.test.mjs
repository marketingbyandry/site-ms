import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const pages = [
  ...readdirSync('.').filter((f) => f.endsWith('.html')),
  ...readdirSync('templates').filter((f) => f.endsWith('.html')).map((f) => `templates/${f}`),
];

test('chaque page charge le rideau dans le <head> et porte son markup dans le <body>', () => {
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.match(head, /<link rel="stylesheet" href="\/assets\/page-curtain\.css">/, `${file} : CSS du rideau absente du <head>`);
    // Sans defer : le script doit poser .curtain-arrive avant le premier rendu.
    assert.match(head, /<script src="\/assets\/page-curtain\.js"><\/script>/, `${file} : script du rideau absent du <head> (ou différé)`);
    assert.equal(html.match(/class="page-curtain"/g)?.length, 1, `${file} : markup du rideau absent ou en double`);
  }
});

test('le rideau est bleu clair et disparaît en mouvement réduit', () => {
  const css = readFileSync('assets/page-curtain.css', 'utf8');
  assert.match(css, /\.page-curtain-half \{[^}]*background: #5ecfdc/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.page-curtain \{ display: none; \}/);
});

// Charge le script dans un faux navigateur, en mouvement réduit pour ne lier aucun écouteur.
function loadCurtainLink() {
  const window = { matchMedia: () => ({ matches: true }) };
  window.window = window;
  const sandbox = { window, matchMedia: window.matchMedia, document: { documentElement: { classList: { add() {}, remove() {} } } }, URL };
  vm.runInNewContext(readFileSync('assets/page-curtain.js', 'utf8'), sandbox);
  return window.msCurtainLink;
}

const here = new URL('https://cabinetms.fr/b2b.html');
const click = (href, extra = {}) => ({
  button: 0, defaultPrevented: false, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
  target: { closest: () => ({ getAttribute: () => href, target: extra.target || '', hasAttribute: (n) => n === 'download' && !!extra.download }) },
  ...extra.event,
});

test('le rideau ne passe que vers une autre page HTML du site', () => {
  const link = loadCurtainLink();
  assert.equal(link(click('/blog.html'), here).pathname, '/blog.html');
  assert.equal(link(click('/'), here).pathname, '/');
  assert.equal(link(click('#cta'), here), null, 'ancre de la même page');
  assert.equal(link(click('https://tally.so/r/x'), here), null, 'autre site');
  assert.equal(link(click('mailto:a@b.fr'), here), null, 'mail');
  assert.equal(link(click('/api/demo'), here), null, 'API');
  assert.equal(link(click('/assets/guide.pdf'), here), null, 'fichier');
  assert.equal(link(click('/blog.html', { target: '_blank' }), here), null, 'nouvel onglet');
  assert.equal(link(click('/blog.html', { download: true }), here), null, 'téléchargement');
  assert.equal(link(click('/blog.html', { event: { metaKey: true } }), here), null, 'cmd+clic');
});
