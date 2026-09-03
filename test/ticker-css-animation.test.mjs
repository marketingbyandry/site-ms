import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Regression: le ticker tournait via une boucle requestAnimationFrame continue
// (~1.2s de CPU mesuré sur mobile). Le défilement doit maintenant reposer sur
// une animation CSS (transform, GPU), sans boucle JS par frame.

test("ticker.js ne contient plus de boucle requestAnimationFrame continue", () => {
  const source = readFileSync('assets/ticker.js', 'utf8');
  assert.doesNotMatch(source, /requestAnimationFrame/, 'la boucle rAF par frame doit disparaitre au profit du CSS');
});

test('ticker.js pilote le ralentissement au survol via Animation.playbackRate (pas de saut de position)', () => {
  const source = readFileSync('assets/ticker.js', 'utf8');
  assert.match(source, /getAnimations/, "doit recuperer l'animation CSS via getAnimations()");
  assert.match(source, /\.playbackRate\s*=/, 'doit ajuster playbackRate plutot que re-declencher animation-duration en boucle');
});

test('ticker.js respecte toujours prefers-reduced-motion (pas de style.animation applique)', () => {
  const source = readFileSync('assets/ticker.js', 'utf8');
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /reduced-motion/);
});

test("index.html declare le keyframe CSS ms-ticker-scroll consomme par ticker.js", () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /@keyframes\s+ms-ticker-scroll/, 'le keyframe CSS du ticker est absent');
  assert.match(html, /translateX\(-50%\)/, 'le keyframe doit boucler sur -50% pour matcher le contenu duplique x2');
});

// --- Environnement DOM minimal pour executer assets/ticker.js tel quel ---

function makeFakeTrack(initialScrollWidth) {
  const listeners = {};
  let currentAnim = null;
  const styleObj = {};
  Object.defineProperty(styleObj, 'animation', {
    set(value) {
      const match = /([\d.]+)s/.exec(value);
      const durationMs = match ? parseFloat(match[1]) * 1000 : 0;
      currentAnim = { currentTime: 0, playbackRate: 1, effect: { getTiming: () => ({ duration: durationMs }) } };
    },
    get() { return ''; },
  });
  return {
    scrollWidth: initialScrollWidth,
    innerHTML: '',
    children: [],
    style: styleObj,
    getAnimations() { return currentAnim ? [currentAnim] : []; },
    addEventListener(evt, cb) { (listeners[evt] = listeners[evt] || []).push(cb); },
    _dispatch(evt) { (listeners[evt] || []).forEach((cb) => cb()); },
  };
}

async function runTicker({ trackWidth = 2000 } = {}) {
  const source = readFileSync('assets/ticker.js', 'utf8');
  const track = makeFakeTrack(trackWidth);
  const ticker = { addEventListener() {} };
  const resizeListeners = [];

  const documentObj = {
    querySelector: (sel) => (sel === '.ticker' ? ticker : null),
    getElementById: (id) => (id === 'ms-ticker-track' ? track : null),
  };
  const windowObj = {
    matchMedia: () => ({ matches: false }),
    addEventListener: (evt, cb) => { if (evt === 'resize') resizeListeners.push(cb); },
  };
  const fetchFn = () => Promise.reject(new Error('pas de reseau dans ce test'));

  const context = {
    window: windowObj,
    document: documentObj,
    fetch: fetchFn,
    console: { error() {} },
  };
  vm.createContext(context);
  vm.runInContext(source, context);

  // buildItems() catch le fetch rejete puis retombe sur STATIC_ITEMS ; laisser
  // les microtasks en attente se resoudre avant de manipuler le resize.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  return { track, triggerResize: () => resizeListeners.forEach((cb) => cb()) };
}

// Regression (relecture PR #59) : recalculer la duree de l'animation CSS sur
// resize/fonts.ready remplacait toute l'animation, ce qui la faisait repartir
// de 0% — saut visuel du bandeau. La position (fraction de la boucle deja
// parcourue) doit maintenant etre reportee sur la nouvelle animation.
test('ticker.js conserve la position visuelle du defilement quand la duree est recalculee (resize)', async () => {
  const { track, triggerResize } = await runTicker({ trackWidth: 2000 });

  const firstAnim = track.getAnimations()[0];
  assert.ok(firstAnim, "l'animation CSS doit avoir ete appliquee au demarrage");
  const firstDuration = firstAnim.effect.getTiming().duration;
  firstAnim.currentTime = firstDuration * 0.4; // 40% de la boucle deja parcourue

  track.scrollWidth = 3000; // simule un changement de largeur de contenu
  triggerResize();

  const secondAnim = track.getAnimations()[0];
  const secondDuration = secondAnim.effect.getTiming().duration;
  const progress = secondAnim.currentTime / secondDuration;
  // Tolerance large : la duree affichee est arrondie a 2 decimales (toFixed)
  // avant d'etre reparsee par ce mock, ce qui introduit un ecart de l'ordre
  // du millieme sans rapport avec le bug corrige ici (qui produirait un saut
  // bien plus grand, ex. retour a 0%).
  assert.ok(
    Math.abs(progress - 0.4) < 0.01,
    `la progression doit rester ~40% apres recalcul (obtenu ${(progress * 100).toFixed(2)}%)`
  );
});
