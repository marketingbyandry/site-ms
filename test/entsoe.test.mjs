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

test('parseDayAheadPrices handles single Point (exercises Point array fallback)', () => {
  const xml = `<Publication_MarketDocument>
    <TimeSeries>
      <Period>
        <timeInterval>
          <start>2026-07-01T00:00Z</start>
          <end>2026-07-01T01:00Z</end>
        </timeInterval>
        <resolution>PT60M</resolution>
        <Point>
          <position>1</position>
          <price.amount>50.00</price.amount>
        </Point>
      </Period>
    </TimeSeries>
  </Publication_MarketDocument>`;
  const prices = parseDayAheadPrices(xml);
  assert.equal(prices.length, 1);
  assert.equal(prices[0].priceEurPerMWh, 50.00);
  assert.equal(prices[0].start.toISOString(), '2026-07-01T00:00:00.000Z');
});

test('parseDayAheadPrices handles multiple TimeSeries and aggregates into sorted flat array', () => {
  const xml = `<Publication_MarketDocument>
    <TimeSeries>
      <Period>
        <timeInterval>
          <start>2026-07-01T00:00Z</start>
          <end>2026-07-01T01:00Z</end>
        </timeInterval>
        <resolution>PT60M</resolution>
        <Point>
          <position>1</position>
          <price.amount>100.00</price.amount>
        </Point>
      </Period>
    </TimeSeries>
    <TimeSeries>
      <Period>
        <timeInterval>
          <start>2026-07-01T01:00Z</start>
          <end>2026-07-01T02:00Z</end>
        </timeInterval>
        <resolution>PT60M</resolution>
        <Point>
          <position>1</position>
          <price.amount>200.00</price.amount>
        </Point>
      </Period>
    </TimeSeries>
  </Publication_MarketDocument>`;
  const prices = parseDayAheadPrices(xml);
  assert.equal(prices.length, 2);
  assert.equal(prices[0].priceEurPerMWh, 100.00);
  assert.equal(prices[0].start.toISOString(), '2026-07-01T00:00:00.000Z');
  assert.equal(prices[1].priceEurPerMWh, 200.00);
  assert.equal(prices[1].start.toISOString(), '2026-07-01T01:00:00.000Z');
});
