// assets/ticker.js
// Bandeau défilant sticky : prix de gros gaz/élec (convertis en €/kWh
// depuis data/barometre-*.json, mêmes sources que assets/barometre.js)
// + informations M&S Strategy. Chargé dynamiquement pour ne jamais figer
// une valeur qui deviendrait fausse au fil des mises à jour du baromètre.
//
// Le défilement est piloté par une animation CSS (@keyframes ms-ticker-scroll,
// voir index.html) plutôt que par une boucle rAF par frame : le travail
// continu tourne sur le compositeur GPU au lieu du thread JS principal.
// Le ralentissement au survol/focus utilise Animation.playbackRate
// (Web Animations API) plutôt qu'un changement d'animation-duration : la
// position visuelle est préservée sans saut, contrairement à un changement
// direct de animation-duration en cours de lecture.

const STATIC_ITEMS = [
  'Négociation d’énergies depuis 2012',
  '8 216 professionnels accompagnés',
  'Étude gratuite · résultat sous 48h',
];

// Vitesses en px/s, identiques à l'ancienne implémentation JS (BASE_SPEED/HOVER_SPEED).
const BASE_SPEED = 44.2;
const HOVER_SPEED = 10;

function formatPriceEurPerKwh(avgPriceEurPerMWh) {
  return (avgPriceEurPerMWh / 1000)
    .toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function trendMarkup(current, previous) {
  if (typeof previous !== 'number') {
    return '<span class="trend-flat">—</span>';
  }
  if (current > previous) return '<span class="trend-up">▲</span>';
  if (current < previous) return '<span class="trend-down">▼</span>';
  return '<span class="trend-flat">—</span>';
}

function priceItemMarkup(label, series) {
  const latest = series.at(-1);
  const previous = series.length > 1 ? series.at(-2).avgPriceEurPerMWh : undefined;
  if (!latest) return null;
  return `<span class="label">${label}</span> ${formatPriceEurPerKwh(latest.avgPriceEurPerMWh)} €/kWh ${trendMarkup(latest.avgPriceEurPerMWh, previous)}`;
}

async function buildItems() {
  const items = [];
  try {
    const [electricite, gaz] = await Promise.all([
      fetch('/data/barometre-electricite.json').then((r) => r.json()),
      fetch('/data/barometre-gaz.json').then((r) => r.json()),
    ]);

    const elecItem = priceItemMarkup('Élec', electricite.monthly);
    if (elecItem) items.push(elecItem);

    const gazItem = priceItemMarkup('Gaz', gaz.quarterly);
    if (gazItem) items.push(gazItem);

    if (elecItem || gazItem) {
      items.push('<span class="fine">Prix de gros, HT — sources ENTSO-E / PEG</span>');
    }
  } catch (err) {
    console.error('Bandeau prix énergie : échec du chargement des données', err);
  }

  return items.concat(STATIC_ITEMS);
}

function startTicker(track, ticker) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    ticker.classList.add('reduced-motion');
    return;
  }

  // Le track contient le contenu dupliqué x2 (voir initTicker) : translater de
  // -50% ramène exactement au début de la seconde copie, donc la boucle
  // `infinite` ne laisse aucun saut visible en régime établi. Cette fonction
  // est aussi rappelée sur resize/fonts.ready — recalculer la durée change
  // l'animation CSS sous-jacente, donc on capture la position (et un éventuel
  // ralentissement au survol en cours) avant de la réappliquer, pour ne pas
  // faire sauter visuellement le bandeau à ce moment-là.
  function applyAnimation() {
    const halfWidth = track.scrollWidth / 2;
    if (halfWidth <= 0) return;
    const durationMs = (halfWidth / BASE_SPEED) * 1000;

    const prevAnim = track.getAnimations && track.getAnimations()[0];
    let progress = 0;
    let rate = 1;
    if (prevAnim && prevAnim.effect) {
      const prevDurationMs = prevAnim.effect.getTiming().duration;
      const currentTimeMs = typeof prevAnim.currentTime === 'number' ? prevAnim.currentTime : 0;
      if (prevDurationMs) progress = ((currentTimeMs % prevDurationMs) + prevDurationMs) % prevDurationMs / prevDurationMs;
      rate = prevAnim.playbackRate || 1;
    }

    track.style.animation = `ms-ticker-scroll ${(durationMs / 1000).toFixed(2)}s linear infinite`;

    const anim = track.getAnimations && track.getAnimations()[0];
    if (anim) {
      anim.currentTime = progress * durationMs;
      anim.playbackRate = rate;
    }
  }

  applyAnimation();
  window.addEventListener('resize', applyAnimation);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyAnimation);

  function setPlaybackRate(rate) {
    const anim = track.getAnimations && track.getAnimations()[0];
    if (anim) anim.playbackRate = rate;
  }

  const slowDown = () => setPlaybackRate(HOVER_SPEED / BASE_SPEED);
  const speedUp = () => setPlaybackRate(1);

  ticker.addEventListener('mouseenter', slowDown);
  ticker.addEventListener('mouseleave', speedUp);
  ticker.addEventListener('focusin', slowDown);
  ticker.addEventListener('focusout', speedUp);
}

async function initTicker() {
  const ticker = document.querySelector('.ticker');
  const track = document.getElementById('ms-ticker-track');
  if (!ticker || !track) return;

  const items = await buildItems();
  const markup = items.map((html) => `<span class="ticker-item">${html}</span>`).join('');
  track.innerHTML = markup + markup;

  startTicker(track, ticker);
}

initTicker();
