import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
