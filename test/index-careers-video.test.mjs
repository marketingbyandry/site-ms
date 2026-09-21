// test/index-careers-video.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = () => readFileSync('index.html', 'utf8');

function careersSlice(source) {
  const start = source.indexOf('<section class="careers" id="careers">');
  const end = source.indexOf('<!-- FAQ SEO -->');
  return source.slice(start, end);
}

test('index.html insère la vidéo de recrutement entre le texte "Ambitieux, déterminé" et les piliers', () => {
  const source = html();
  const section = careersSlice(source);
  const topIdx = section.indexOf('<div class="careers-top">');
  const videoIdx = section.indexOf('<div class="careers-video');
  const pillarsIdx = section.indexOf('<div class="careers-pillars">');
  assert.ok(topIdx > -1 && videoIdx > topIdx, 'la vidéo doit venir après le texte careers-top');
  assert.ok(pillarsIdx > videoIdx, 'les piliers doivent venir après la vidéo');
});

test('index.html joue la vraie vidéo de recrutement (contrôles natifs, poster, source mp4)', () => {
  const source = html();
  const section = careersSlice(source);
  assert.match(section, /<video controls preload="metadata" poster="assets\/careers-video-poster\.webp" playsinline>/);
  assert.match(section, /<source src="assets\/careers-video\.mp4" type="video\/mp4">/);
});

test('les assets vidéo de recrutement existent', () => {
  assert.ok(existsSync('assets/careers-video.mp4'), "l'asset careers-video.mp4 doit exister");
  assert.ok(existsSync('assets/careers-video-poster.webp'), "l'asset careers-video-poster.webp doit exister");
});
