// assets/ticker-pro.js
// Bandeau défilant sticky pour b2b.html : reprend la structure/le style du
// bandeau prix de assets/ticker.js (page d'accueil), avec un contenu
// différent orienté avantages professionnels (commission standardisée,
// transparence), sans dépendance aux données de prix de gros.

const STATIC_ITEMS = [
  'Commission standardisée, identique quel que soit le fournisseur retenu',
  'Aucune commission cachée : notre rémunération est fixée en amont, jamais négociée offre par offre',
  'Étude gratuite · résultat sous 24h',
];

// Vitesse en px/s, identique à assets/ticker.js.
const BASE_SPEED = 44.2;
const HOVER_SPEED = 10;

function startTicker(track, ticker) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    ticker.classList.add('reduced-motion');
    return;
  }

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

function initTicker() {
  const ticker = document.querySelector('.ticker');
  const track = document.getElementById('ms-ticker-track');
  if (!ticker || !track) return;

  const markup = STATIC_ITEMS.map((text) => `<span class="ticker-item">${text}</span>`).join('');
  track.innerHTML = markup + markup;

  startTicker(track, ticker);
}

initTicker();
