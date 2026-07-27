import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false });

export function parseDayAheadPrices(xmlText) {
  const doc = parser.parse(xmlText);
  const timeSeries = doc.Publication_MarketDocument.TimeSeries;
  const series = Array.isArray(timeSeries) ? timeSeries : [timeSeries];
  const prices = [];

  for (const ts of series) {
    const periods = Array.isArray(ts.Period) ? ts.Period : [ts.Period];
    for (const period of periods) {
      const start = new Date(period.timeInterval.start);
      const resolutionMinutes = period.resolution === 'PT60M' ? 60 : 15;
      const points = Array.isArray(period.Point) ? period.Point : [period.Point];
      for (const point of points) {
        const position = Number(point.position);
        const offsetMs = (position - 1) * resolutionMinutes * 60 * 1000;
        prices.push({
          start: new Date(start.getTime() + offsetMs),
          priceEurPerMWh: Number(point['price.amount']),
        });
      }
    }
  }

  return prices.sort((a, b) => a.start - b.start);
}

export function averagePriceEurPerMWh(prices) {
  const sum = prices.reduce((acc, p) => acc + p.priceEurPerMWh, 0);
  return Math.round((sum / prices.length) * 100) / 100;
}
