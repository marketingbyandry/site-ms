import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upsertMonthlyEntry, formatEntsoeTimestamp } from '../scripts/update-barometre-electricite.mjs';

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

test('formatEntsoeTimestamp produces correct yyyyMMddHHmm format (2026-06-01T00:00Z)', () => {
  const date = new Date(Date.UTC(2026, 5, 1, 0, 0));
  assert.equal(formatEntsoeTimestamp(date), '202606010000');
});

test('formatEntsoeTimestamp produces correct yyyyMMddHHmm format (2026-06-01T14:05Z)', () => {
  const date = new Date(Date.UTC(2026, 5, 1, 14, 5));
  assert.equal(formatEntsoeTimestamp(date), '202606011405');
});
