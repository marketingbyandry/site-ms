import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upsertMonthlyEntry } from '../scripts/update-barometre-electricite.mjs';

test('upsertMonthlyEntry inserts a new period', () => {
  const existing = { monthly: [{ period: '2026-05', avgPriceEurPerMWh: 55 }] };
  const updated = upsertMonthlyEntry(existing, { period: '2026-06', avgPriceEurPerMWh: 59.76 });
  assert.equal(updated.monthly.length, 2);
  assert.equal(updated.monthly[1].period, '2026-06');
});

test('upsertMonthlyEntry replaces an existing period instead of duplicating it', () => {
  const existing = { monthly: [{ period: '2026-06', avgPriceEurPerMWh: 59.76 }] };
  const updated = upsertMonthlyEntry(existing, { period: '2026-06', avgPriceEurPerMWh: 60.10 });
  assert.equal(updated.monthly.length, 1);
  assert.equal(updated.monthly[0].avgPriceEurPerMWh, 60.10);
});
