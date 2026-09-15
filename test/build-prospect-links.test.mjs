import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, buildLinks } from '../scripts/build-prospect-links.mjs';

const OPTIONS = {
  base: 'https://cabinetms.fr/prospect.html',
  nomCol: 'Entreprise',
  secteurCol: 'Secteur/Activité'
};

test('les champs entre guillemets contenant une virgule restent entiers', () => {
  const rows = parseCsv('Entreprise,Adresse\nLavandys,"50 Avenue Louis Luc, 94600 Choisy-le-Roi"\n');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Adresse, '50 Avenue Louis Luc, 94600 Choisy-le-Roi');
});

test('les guillemets doubles sont restitues', () => {
  const rows = parseCsv('Entreprise\n"Societe ""Le Pre"""\n');
  assert.equal(rows[0].Entreprise, 'Societe "Le Pre"');
});

test('les lignes vides sont ignorees', () => {
  const rows = parseCsv('Entreprise\nLavandys\n\n');
  assert.equal(rows.length, 1);
});

test('chaque ligne produit une URL avec nom et secteur encodes', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,Blanchisserie industrielle\n');
  const [link] = buildLinks(rows, OPTIONS);
  const url = new URL(link.url);
  assert.equal(url.pathname, '/prospect.html');
  assert.equal(url.searchParams.get('nom'), 'Lavandys');
  assert.equal(url.searchParams.get('secteur'), 'Blanchisserie industrielle');
  assert.equal(url.searchParams.get('camp'), null);
});

test('les accents et esperluettes sont encodes sans casser le lien', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nPapèterie Léger & Fils,Papeterie/pâte à papier\n');
  const [link] = buildLinks(rows, OPTIONS);
  assert.ok(!link.url.includes(' '), 'aucune espace brute dans une URL destinee a un email');
  const url = new URL(link.url);
  assert.equal(url.searchParams.get('nom'), 'Papèterie Léger & Fils');
  assert.equal(url.searchParams.get('secteur'), 'Papeterie/pâte à papier');
});

test('le code de campagne est ajoute quand il est fourni', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,Blanchisserie\n');
  const [link] = buildLinks(rows, { ...OPTIONS, camp: 'ind-e1' });
  assert.equal(new URL(link.url).searchParams.get('camp'), 'ind-e1');
});

test('une ligne sans nom d_entreprise est ignoree', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\n,Blanchisserie\nLavandys,Blanchisserie\n');
  assert.equal(buildLinks(rows, OPTIONS).length, 1);
});

test('un secteur absent ne met pas de parametre vide dans l_URL', () => {
  const rows = parseCsv('Entreprise,Secteur/Activité\nLavandys,\n');
  const [link] = buildLinks(rows, OPTIONS);
  assert.equal(new URL(link.url).searchParams.has('secteur'), false);
});
