import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDayAheadPrices, averagePriceEurPerMWh } from '../lib/entsoe.mjs';

test('parseDayAheadPrices extracts hourly points with computed timestamps', () => {
  const xml = readFileSync('test/fixtures/entsoe-day-ahead-sample.xml', 'utf8');
  const prices = parseDayAheadPrices(xml);
  assert.equal(prices.length, 2);
  assert.equal(prices[0].priceEurPerMWh, 58.42);
  assert.equal(prices[0].start.toISOString(), '2026-07-01T00:00:00.000Z');
  assert.equal(prices[1].start.toISOString(), '2026-07-01T01:00:00.000Z');
});

test('averagePriceEurPerMWh computes the mean', () => {
  const avg = averagePriceEurPerMWh([{ priceEurPerMWh: 58.42 }, { priceEurPerMWh: 61.10 }]);
  assert.equal(avg, 59.76);
});
