(function () {
  var COOKIE_NAME = 'ms_consent';
  var COOKIE_MAX_AGE_DAYS = 390; // 13 mois — plafond recommandé par la CNIL

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + maxAge + '; SameSite=Lax; Secure';
  }

  function injectStyles() {
    if (document.getElementById('ms-cookie-style')) return;
    var style = document.createElement('style');
    style.id = 'ms-cookie-style';
    style.textContent =
      '#ms-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#07131a;color:#f5f0e8;padding:1.3rem 5vw;display:flex;' +
      'flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.2rem;' +
      'font-family:"Satoshi",sans-serif;box-shadow:0 -4px 24px rgba(0,0,0,.3);' +
      'border-top:1px solid rgba(94,207,220,.18)}' +
      '#ms-cookie-banner p{margin:0;font-size:.85rem;line-height:1.6;max-width:640px;color:#8aacb4}' +
      '#ms-cookie-banner p a{color:#2bb5c8;text-decoration:underline}' +
      '#ms-cookie-actions{display:flex;gap:.7rem;flex-shrink:0}' +
      '#ms-cookie-actions button{font-family:"Satoshi",sans-serif;font-weight:700;font-size:.74rem;' +
      'letter-spacing:.06em;text-transform:uppercase;padding:.65rem 1.3rem;border-radius:2px;cursor:pointer;' +
      'border:1.5px solid #4cde80;background:transparent;color:#f5f0e8;transition:background .2s,color .2s}' +
      '#ms-cookie-actions button.accept{background:#4cde80;color:#07131a}' +
      '#ms-cookie-actions button:hover{opacity:.85}' +
      '@media(max-width:640px){#ms-cookie-banner{flex-direction:column;align-items:stretch;text-align:left}' +
      '#ms-cookie-actions{justify-content:flex-start}}';
    document.head.appendChild(style);
  }

  function hideBanner() {
    var el = document.getElementById('ms-cookie-banner');
    if (el) el.remove();
  }

  function showBanner() {
    hideBanner();
    injectStyles();
    var banner = document.createElement('div');
    banner.id = 'ms-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    banner.innerHTML =
      '<p>Nous utilisons des cookies de mesure d’audience (PostHog) pour comprendre l’usage du site. ' +
      'Ils ne sont déposés qu’avec votre accord. Voir notre ' +
      '<a href="politique-confidentialite.html">politique de confidentialité</a>.</p>' +
      '<div id="ms-cookie-actions">' +
      '<button type="button" class="reject" id="ms-cookie-reject">Refuser</button>' +
      '<button type="button" class="accept" id="ms-cookie-accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('ms-cookie-accept').addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE_DAYS);
      hideBanner();
      if (window.msInitAnalytics) window.msInitAnalytics();
    });

    document.getElementById('ms-cookie-reject').addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'refused', COOKIE_MAX_AGE_DAYS);
      hideBanner();
    });
  }

  // Exposé pour le lien "Gérer les cookies" du footer — permet de revenir
  // sur son choix aussi facilement qu'on l'a donné (exigence CNIL).
  window.msOpenCookieBanner = showBanner;

  if (!getCookie(COOKIE_NAME)) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
