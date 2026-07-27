import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseDayAheadPrices, averagePriceEurPerMWh } from '../lib/entsoe.mjs';

const DATA_PATH = new URL('../data/barometre-electricite.json', import.meta.url);
const FRANCE_EIC = '10YFR-RTE------C';

export function upsertMonthlyEntry(existingData, newEntry) {
  const monthly = existingData.monthly.filter((e) => e.period !== newEntry.period);
  monthly.push(newEntry);
  monthly.sort((a, b) => a.period.localeCompare(b.period));
  return { monthly };
}

export function formatEntsoeTimestamp(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}`;
}

export async function fetchMonthlyAverage(periodStart, periodEnd, token) {
  const url = `https://web-api.tp.entsoe.eu/api?securityToken=${token}` +
    `&documentType=A44&in_Domain=${FRANCE_EIC}&out_Domain=${FRANCE_EIC}` +
    `&periodStart=${formatEntsoeTimestamp(periodStart)}&periodEnd=${formatEntsoeTimestamp(periodEnd)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ENTSO-E request failed: ${response.status}`);
  }
  const xml = await response.text();
  return averagePriceEurPerMWh(parseDayAheadPrices(xml));
}

async function main() {
  const token = process.env.ENTSOE_API_TOKEN;
  if (!token) throw new Error('ENTSOE_API_TOKEN environment variable is required');

  const [startArg, endArg] = process.argv.slice(2);
  const now = new Date();
  const periodStart = startArg ? new Date(startArg) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const periodEnd = endArg ? new Date(endArg) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const period = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}`;

  const avgPriceEurPerMWh = await fetchMonthlyAverage(periodStart, periodEnd, token);

  const existingData = existsSync(DATA_PATH)
    ? JSON.parse(readFileSync(DATA_PATH, 'utf8'))
    : { monthly: [] };

  const updated = upsertMonthlyEntry(existingData, {
    period,
    avgPriceEurPerMWh,
    source: 'ENTSO-E Transparency Platform',
    fetchedAt: new Date().toISOString(),
  });

  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n');
  console.log(`Recorded ${period}: ${avgPriceEurPerMWh} EUR/MWh`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
