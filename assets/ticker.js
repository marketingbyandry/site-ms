// assets/ticker.js
// Bandeau défilant sticky : prix de gros gaz/élec (convertis en €/kWh
// depuis data/barometre-*.json, mêmes sources que assets/barometre.js)
// + informations M&S Strategy. Chargé dynamiquement pour ne jamais figer
// une valeur qui deviendrait fausse au fil des mises à jour du baromètre.

const STATIC_ITEMS = [
  'Négociation d’énergies depuis 2012',
  '7 180 professionnels accompagnés',
  'Étude gratuite · résultat sous 48h',
];

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
  return `<span class="label">${label}</span> ${formatPriceEurPerKwh(latest.avgPriceEurPerMWh)} €/kWh ${trendMarkup(latest.avgPriceEurPerMWh, previous)}`;
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

function makeBezier(x1, y1, x2, y2) {
  const a = (p1, p2) => 1 - 3 * p2 + 3 * p1;
  const b = (p1, p2) => 3 * p2 - 6 * p1;
  const c = (p1) => 3 * p1;
  const calcX = (t) => ((a(x1, x2) * t + b(x1, x2)) * t + c(x1)) * t;
  const calcY = (t) => ((a(y1, y2) * t + b(y1, y2)) * t + c(y1)) * t;
  const slopeX = (t) => 3 * a(x1, x2) * t * t + 2 * b(x1, x2) * t + c(x1);
  function tForX(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slopeX(t);
      if (s === 0) break;
      t -= (calcX(t) - x) / s;
    }
    return t;
  }
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calcY(tForX(x));
  };
}

function startTicker(track, ticker) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    ticker.classList.add('reduced-motion');
    return;
  }

  const easeOut = makeBezier(0.22, 1, 0.36, 1);
  const easeInOut = makeBezier(0.65, 0, 0.35, 1);

  const BASE_SPEED = 44.2;
  const HOVER_SPEED = 10;
  const TRANSITION_MS = 900;

  let currentSpeed = BASE_SPEED;
  let speedAtTransitionStart = BASE_SPEED;
  let targetSpeed = BASE_SPEED;
  let transitionStart = 0;
  let easingFn = easeOut;

  function setTarget(next, easing) {
    if (targetSpeed === next) return;
    speedAtTransitionStart = currentSpeed;
    targetSpeed = next;
    transitionStart = performance.now();
    easingFn = easing;
  }

  ticker.addEventListener('mouseenter', () => setTarget(HOVER_SPEED, easeOut));
  ticker.addEventListener('mouseleave', () => setTarget(BASE_SPEED, easeInOut));
  ticker.addEventListener('focusin', () => setTarget(HOVER_SPEED, easeOut));
  ticker.addEventListener('focusout', () => setTarget(BASE_SPEED, easeInOut));

  let halfWidth = 0;
  const measure = () => { halfWidth = track.scrollWidth / 2; };
  measure();
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  let position = 0;
  let lastFrame = performance.now();

  function tick(now) {
    const dt = Math.min(now - lastFrame, 50) / 1000;
    lastFrame = now;

    if (currentSpeed !== targetSpeed) {
      const p = TRANSITION_MS === 0 ? 1 : Math.min((now - transitionStart) / TRANSITION_MS, 1);
      const eased = easingFn(p);
      currentSpeed = speedAtTransitionStart + (targetSpeed - speedAtTransitionStart) * eased;
      if (p >= 1) currentSpeed = targetSpeed;
    }

    position -= currentSpeed * dt;
    if (halfWidth > 0 && position <= -halfWidth) position += halfWidth;
    track.style.transform = `translateX(${position.toFixed(2)}px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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
