// assets/analytics-loader.js
// Charge assets/analytics.js (bundle PostHog + Pixel Meta, ~80KB) au plus tôt
// pour un visiteur qui a déjà donné son consentement (cookie ms_consent),
// à la même position que l'ancien <script defer src="assets/analytics.js">
// statique — pour ne pas retarder par rapport à l'existant l'installation du
// listener cta_click (src/analytics.js) et de window.fbq (utilisé par
// openTallyForm() dans b2b.html/b2c.html, gardé par `if (window.fbq)`) : un
// clic rapide juste après le chargement de la page doit rester capturé.
//
// Sans consentement (cookie absent ou {analytics:false, marketing:false}),
// ce fichier ne fait rien — c'est ce cas (majoritaire : visiteurs sans
// décision prise, ou refus) qui porte le gain Lighthouse (bundle jamais
// téléchargé). assets/cookie-consent.js gère l'affichage du bandeau et
// réutilise window.__msLoadAnalyticsScript ci-dessous pour le cas où
// l'utilisateur vient d'accepter.
(function () {
  var ANALYTICS_SRC = 'assets/analytics.js';
  var state = 'idle'; // idle | loading | loaded
  var callbacks = [];

  function loadAnalyticsScript(onReady) {
    if (state === 'loaded') {
      onReady();
      return;
    }
    callbacks.push(onReady);
    if (state === 'loading') return;
    state = 'loading';
    var script = document.createElement('script');
    script.src = ANALYTICS_SRC;
    script.onload = function () {
      state = 'loaded';
      var ready = callbacks;
      callbacks = [];
      ready.forEach(function (cb) { cb(); });
    };
    script.onerror = function () {
      // Echec réseau : on repart à zéro plutôt que de rester bloqué en
      // 'loading' pour toujours (plus aucune tentative ne serait possible).
      state = 'idle';
      callbacks = [];
      script.remove();
    };
    document.head.appendChild(script);
  }

  window.__msLoadAnalyticsScript = loadAnalyticsScript;

  var match = document.cookie.match(/(?:^|; )ms_consent=([^;]*)/);
  if (!match) return;
  try {
    var consent = JSON.parse(decodeURIComponent(match[1]));
    if (
      typeof consent.analytics === 'boolean' &&
      typeof consent.marketing === 'boolean' &&
      (consent.analytics || consent.marketing)
    ) {
      loadAnalyticsScript(function () {
        if (window.msInitAnalytics) window.msInitAnalytics(consent);
      });
    }
  } catch (e) {
    // Cookie malformé (ancien format) : rien à charger, assets/cookie-consent.js
    // rouvrira le bandeau (voir sa propre logique de parsing, identique).
  }
})();
