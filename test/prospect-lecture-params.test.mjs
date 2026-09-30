import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

/* Execute le script de lecture des parametres de prospect.html (celui place en
   tete, avant GTM) dans un contexte simule : on verifie ce qu_il expose et ce
   qu_il laisse dans l_URL, sans navigateur.

   Ce script est inline dans la page — on l_extrait donc du HTML, pour que le
   test porte sur le code reellement servi et pas sur une copie. */
const HTML = readFileSync('prospect.html', 'utf8');

function extraireScriptDeLecture() {
  const debut = HTML.indexOf('LECTURE DES PARAMÈTRES');
  const ouverture = HTML.indexOf('<script>', debut);
  const fermeture = HTML.indexOf('</script>', ouverture);
  assert.ok(debut !== -1 && ouverture !== -1 && fermeture !== -1, 'script de lecture introuvable');
  return HTML.slice(ouverture + '<script>'.length, fermeture);
}

const SOURCE = extraireScriptDeLecture();

// Joue le script sur une query string donnee et renvoie ce qu_il expose, plus
// l_URL finalement affichee.
function lire(queryString) {
  const href = 'https://cabinetms.fr/prospect.html' + queryString;
  let urlAffichee = href;

  const context = {
    URL,
    URLSearchParams,
    location: { href, search: queryString },
    history: {
      replaceState(_state, _titre, nouvelleUrl) {
        urlAffichee = nouvelleUrl;
      }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(SOURCE, context);

  return { perso: context.msProspect, nom: context.msProspectNom, urlAffichee };
}

test('les trois parametres sont exposes', () => {
  const { perso } = lire('?nom=Lavandys&secteur=Blanchisserie&accroche=Vos%20tunnels%20tournent');
  // Champ par champ : l_objet nait dans le contexte vm, son prototype n_est
  // pas celui de ce realm et deepEqual s_en formaliserait.
  assert.equal(perso.nom, 'Lavandys');
  assert.equal(perso.secteur, 'Blanchisserie');
  assert.equal(perso.accroche, 'Vos tunnels tournent');
});

test('le nom est expose separement pour le champ cache Tally', () => {
  assert.equal(lire('?nom=Lavandys').nom, 'Lavandys');
  assert.equal(lire('').nom, null, 'sans nom, openTallyForm ne doit rien transmettre');
});

test('les parametres de personnalisation quittent l_URL affichee', () => {
  // Le nom d_une entreprise demarchee ne doit rester ni dans la barre
  // d_adresse, ni dans l_URL lue par GTM/PostHog, ni dans un repartage.
  const { urlAffichee } = lire('?nom=Lavandys&secteur=Blanchisserie&accroche=Test');
  const params = new URL(urlAffichee).searchParams;
  assert.equal(params.get('nom'), null);
  assert.equal(params.get('secteur'), null);
  assert.equal(params.get('accroche'), null);
});

test('les utm_ survivent au nettoyage', () => {
  const { urlAffichee } = lire('?nom=Lavandys&utm_source=mail&utm_campaign=chr');
  const params = new URL(urlAffichee).searchParams;
  assert.equal(params.get('utm_source'), 'mail');
  assert.equal(params.get('utm_campaign'), 'chr');
});

test('sans parametre, l_URL n_est pas reecrite', () => {
  const { urlAffichee, perso } = lire('');
  assert.equal(urlAffichee, 'https://cabinetms.fr/prospect.html');
  assert.equal(perso.nom, '');
  assert.equal(perso.secteur, '');
  assert.equal(perso.accroche, '');
});

test('les caracteres bidirectionnels et invisibles sont retires', () => {
  // U+202E inverse l_ordre d_affichage de tout ce qui suit ; U+200B et U+FEFF
  // sont invisibles et faussent les comparaisons.
  const { perso } = lire('?nom=Cimalp%E2%80%AEtset&secteur=Blanchi%E2%80%8Bsserie&accroche=%EF%BB%BFTest');
  assert.equal(perso.nom, 'Cimalptset');
  assert.equal(perso.secteur, 'Blanchisserie');
  assert.equal(perso.accroche, 'Test');
});

test('une valeur trop longue est coupee sur une limite de mot', () => {
  const secteur = 'Traitement et revetement des metaux ; usinage mecanique generale et decolletage de precision';
  const { perso } = lire('?secteur=' + encodeURIComponent(secteur));
  assert.ok(perso.secteur.length <= 81, 'la coupe doit respecter le plafond');
  assert.ok(perso.secteur.endsWith('…'), 'une valeur coupee doit le signaler');
  assert.ok(!perso.secteur.includes('decolletag…'), 'aucun mot ne doit etre coupe en deux');
});

test('une parenthese ouverte par la coupe est refermee', () => {
  // Le repli generique affiche le secteur entre parentheses : une parenthese
  // ouverte laissee par la troncature desequilibrerait la phrase.
  const secteur = 'Traitement et revetement des metaux ; usinage (mecanique generale, decolletage, emboutissage)';
  const { perso } = lire('?secteur=' + encodeURIComponent(secteur));
  const ouvrantes = perso.secteur.split('(').length - 1;
  const fermantes = perso.secteur.split(')').length - 1;
  assert.equal(ouvrantes, fermantes, `parentheses desequilibrees : ${perso.secteur}`);
});

test('les espaces multiples sont normalises', () => {
  const { perso } = lire('?nom=Lavandys%20%20%20SAS');
  assert.equal(perso.nom, 'Lavandys SAS');
});

test('un saut de ligne devient une espace, pas une soudure', () => {
  // Une raison sociale venue d_une cellule CSV multiligne contient un \\n :
  // le retirer comme un caractere invisible collerait les mots entre eux.
  assert.equal(lire('?nom=Soci%C3%A9t%C3%A9%20A%0AB').perso.nom, 'Société A B');
  assert.equal(lire('?nom=Soci%C3%A9t%C3%A9%09SAS').perso.nom, 'Société SAS');
});

test('le nom transmis a Tally n_est jamais tronque', () => {
  // La coupe a 80 caracteres sert la mise en page ; le commercial, lui, a
  // besoin de la raison sociale entiere dans les reponses Tally.
  const long = 'Compagnie Generale des Etablissements Metallurgiques et Papetiers de la Region Rhone-Alpes';
  const { perso, nom } = lire('?nom=' + encodeURIComponent(long));
  assert.ok(perso.nom.endsWith('…'), 'l_affichage doit rester tronque');
  assert.equal(nom, long, 'la valeur transmise a Tally doit etre complete');
});

test('une valeur sans espace ne se reduit jamais a une ellipse seule', () => {
  // Cas degenere : parenthese en tete et aucun espace exploitable.
  const { perso } = lire('?secteur=' + encodeURIComponent('(' + 'a'.repeat(120)));
  assert.notEqual(perso.secteur, '…');
  assert.ok(perso.secteur.length > 10);
});
