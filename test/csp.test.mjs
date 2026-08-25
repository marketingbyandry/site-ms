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
