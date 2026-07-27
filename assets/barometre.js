// assets/barometre.js
async function loadBarometreData() {
  const [electricite, gaz] = await Promise.all([
    fetch('/data/barometre-electricite.json').then((r) => r.json()),
    fetch('/data/barometre-gaz.json').then((r) => r.json()),
  ]);

  const latestElec = electricite.monthly.at(-1);
  const latestGaz = gaz.quarterly.at(-1);

  const elecEl = document.getElementById('indicateur-electricite');
  if (latestElec && elecEl) {
    elecEl.textContent = `${latestElec.avgPriceEurPerMWh} EUR/MWh (moyenne ${latestElec.period}, source ENTSO-E)`;
  }

  const gazEl = document.getElementById('indicateur-gaz');
  if (latestGaz && gazEl) {
    gazEl.textContent = `${latestGaz.avgPriceEurPerMWh} EUR/MWh (moyenne ${latestGaz.period}, source ${latestGaz.source})`;
  }
}

loadBarometreData().catch((err) => console.error('Baromètre: échec du chargement des données', err));
