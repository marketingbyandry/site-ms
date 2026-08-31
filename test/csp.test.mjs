import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Parse le header CSP de vercel.json en { directive: [valeurs] }.
function cspDirectives() {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const header = config.headers
    .flatMap((rule) => rule.headers)
    .find((h) => h.key === 'Content-Security-Policy');
  assert.ok(header, 'aucun header Content-Security-Policy dans vercel.json');

  return Object.fromEntries(
    header.value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...values] = part.split(/\s+/);
        return [name, values];
      })
  );
}

test('script-src autorise le CDN qui sert la librairie PostHog', () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://eu-assets.i.posthog.com'),
    "sans ce host, array.js est bloque par le CSP et posthog ne s'initialise jamais"
  );
});

test("connect-src autorise l'ingestion des events PostHog", () => {
  assert.ok(
    cspDirectives()['connect-src'].includes('https://eu.i.posthog.com'),
    'sans ce host, les events captures ne peuvent pas etre envoyes'
  );
});

test('script-src autorise le CDN qui sert fbevents.js (Pixel Meta)', () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://connect.facebook.net'),
    "sans ce host, fbevents.js est bloque par le CSP et le Pixel Meta ne s'initialise jamais"
  );
});

test("connect-src autorise l'envoi des events du Pixel Meta", () => {
  assert.ok(
    cspDirectives()['connect-src'].includes('https://www.facebook.com'),
    'sans ce host, les events fbq() ne peuvent pas etre envoyes'
  );
});

test("script-src autorise l'overlay de l'outil de configuration Meta (iwl.js)", () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://www.facebook.com'),
    "sans ce host, l'Event Setup Tool de Meta (selection d'elements cliquables) ne peut pas s'afficher"
  );
});

test('frame-src autorise le repli iframe de fbevents.js', () => {
  assert.ok(
    cspDirectives()['frame-src'].includes('https://www.facebook.com'),
    "sans ce host, le repli iframe du Pixel Meta est bloque quand la methode d'envoi normale echoue"
  );
});

test('form-action autorise le repli formulaire de fbevents.js', () => {
  assert.ok(
    cspDirectives()['form-action'].includes('https://www.facebook.com'),
    "sans ce host, le repli formulaire du Pixel Meta vers facebook.com/tr est bloque"
  );
});

test('script-src autorise le chargeur Google Tag Manager', () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://www.googletagmanager.com'),
    "sans ce host, gtm.js est bloque par le CSP et le conteneur GTM ne s'execute jamais"
  );
});

test("script-src autorise l'UI du mode Apercu/Debug de Tag Manager", () => {
  assert.ok(
    cspDirectives()['script-src'].includes('https://tagmanager.google.com'),
    'sans ce host, Tag Assistant ne peut pas se connecter au site en mode Apercu'
  );
});

test("connect-src autorise l'ingestion des events GA4 relayes par GTM", () => {
  assert.ok(
    cspDirectives()['connect-src'].includes('https://www.googletagmanager.com') &&
      cspDirectives()['connect-src'].includes('https://*.google-analytics.com') &&
      cspDirectives()['connect-src'].includes('https://*.analytics.google.com'),
    'sans ces hosts, les hits GA4 envoyes via GTM sont bloques par le CSP'
  );
});

test('frame-src autorise le repli iframe noscript de GTM', () => {
  assert.ok(
    cspDirectives()['frame-src'].includes('https://www.googletagmanager.com'),
    'sans ce host, le fallback <noscript><iframe> de GTM est bloque'
  );
});
