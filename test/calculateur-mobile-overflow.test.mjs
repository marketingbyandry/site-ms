import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('ms-strategy-calculateur.html bloque le scroll horizontal mobile au niveau html (halo hero 600px)', () => {
  const html = readFileSync(new URL('../ms-strategy-calculateur.html', import.meta.url), 'utf8');
  assert.match(html, /html\s*\{[^}]*overflow-x:\s*hidden/);
});
