import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync('assets/sector-blocks.js', 'utf8');

// Execute assets/sector-blocks.js dans un contexte minimal (window seul : le
// fichier ne doit toucher au DOM d_aucune facon, c_est ce qui le rend
// testable ici et reutilisable ailleurs).
function load() {
  const context = {};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  return context.MSSectorBlocks;
}

test('chaque secteur connu trouve son bloc', () => {
  const { match } = load();
  assert.equal(match('Cimenterie').titre, 'Cimenterie');
  assert.equal(match('Blanchisserie industrielle').titre, 'Blanchisserie industrielle');
  assert.equal(match('Data center / HPC').titre, 'Data center');
  assert.equal(match('Logistique frigorifique').titre, 'Logistique frigorifique');
  assert.equal(match('Papeterie/pâte à papier').titre, 'Papeterie');
  assert.equal(match('Verrerie/flaconnage').titre, 'Verrerie industrielle');
});

test('le matching ignore la casse et les accents', () => {
  const { match } = load();
  assert.equal(match('PÂTE À PAPIER').titre, 'Papeterie');
  assert.equal(match('pate a papier').titre, 'Papeterie');
  assert.equal(match('DATACENTER').titre, 'Data center');
});

test('chaque bloc porte un argumentaire non vide', () => {
  const { match } = load();
  for (const secteur of ['Cimenterie', 'Blanchisserie', 'Data center', 'Frigorifique', 'Papeterie', 'Verrerie']) {
    const bloc = match(secteur);
    assert.ok(bloc && bloc.texte.length > 40, `bloc vide ou trop court pour ${secteur}`);
  }
});

test('un secteur inconnu ne produit aucune correspondance', () => {
  const { match } = load();
  assert.equal(match('Agriculture'), null);
  assert.equal(match('Restauration'), null);
});

test('un secteur absent ou vide ne produit aucune correspondance', () => {
  const { match } = load();
  assert.equal(match(''), null);
  assert.equal(match('   '), null);
  assert.equal(match(null), null);
  assert.equal(match(undefined), null);
});

test('le repli generique reprend le texte brut du secteur', () => {
  const { fallback } = load();
  const bloc = fallback('Hôtellerie de plein air');
  assert.ok(bloc.texte.includes('Hôtellerie de plein air'), 'le repli doit citer le secteur tel quel');
  assert.ok(bloc.titre.length > 0);
});

test('le repli ne se declenche pas sur un secteur vide', () => {
  const { fallback } = load();
  assert.equal(fallback(''), null);
  assert.equal(fallback(null), null);
});

test('le repli ne renvoie jamais de HTML a interpreter', () => {
  const { fallback } = load();
  const bloc = fallback('<img src=x onerror=alert(1)>');
  // La page injecte via textContent : le contenu reste du texte, la
  // bibliotheque ne doit surtout pas le pre-echapper ni le baliser.
  assert.ok(bloc.texte.includes('<img src=x onerror=alert(1)>'));
  assert.ok(!bloc.texte.includes('&lt;'), 'aucun echappement ici : c_est le role de textContent');
});

test('les textes affiches portent une vraie typographie francaise', () => {
  // Garde-fou : ces chaines sont lues par des prospects. Un « d_energie »
  // herite d_un brouillon ASCII ne doit jamais atteindre la page.
  const { match, fallback } = load();
  const affiches = ['Cimenterie', 'Blanchisserie', 'Data center', 'Frigorifique', 'Papeterie', 'Verrerie']
    .map((s) => match(s))
    .concat([fallback('Agriculture')]);

  for (const bloc of affiches) {
    for (const valeur of [bloc.titre, bloc.texte]) {
      assert.ok(!valeur.includes('_'), `apostrophe ASCII degradee dans : ${valeur.slice(0, 60)}`);
      assert.ok(!/\bd_/.test(valeur), `elision mal ecrite dans : ${valeur.slice(0, 60)}`);
    }
  }
});
