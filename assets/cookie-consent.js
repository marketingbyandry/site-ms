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

  // Cookie stocké en JSON `{analytics, marketing}` — un ancien cookie au
  // format `accepted`/`refused` ne parse pas et retombe naturellement sur
  // null (= pas encore de consentement), ce qui rouvre le bandeau une fois
  // pour les visiteurs existants. C'est le comportement voulu : l'ancien
  // consentement groupait deux finalités distinctes sans les distinguer.
  function getConsent() {
    var raw = getCookie(COOKIE_NAME);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  // assets/analytics.js (bundle PostHog + Pixel Meta, ~80KB) n'est plus chargé
  // statiquement sur chaque page : il ne sert à rien tant qu'aucun consentement
  // n'est accordé, donc on ne l'injecte que quand il devient utile — soit un
  // consentement existant à charger (au repos, après le chargement de la
  // page), soit un consentement que l'utilisateur vient de donner via ce
  // bandeau. `window.msInitAnalytics` (exposé par assets/analytics.js une fois
  // chargé) reste le seul point de contact, inchangé pour cookie-consent.js.
  var ANALYTICS_SRC = 'assets/analytics.js';
  var analyticsScriptState = 'idle'; // idle | loading | loaded
  var analyticsReadyCallbacks = [];

  function loadAnalyticsScript(onReady) {
    if (analyticsScriptState === 'loaded') {
      onReady();
      return;
    }
    analyticsReadyCallbacks.push(onReady);
    if (analyticsScriptState === 'loading') return;
    analyticsScriptState = 'loading';
    var script = document.createElement('script');
    script.src = ANALYTICS_SRC;
    script.onload = function () {
      analyticsScriptState = 'loaded';
      var callbacks = analyticsReadyCallbacks;
      analyticsReadyCallbacks = [];
      callbacks.forEach(function (cb) { cb(); });
    };
    document.head.appendChild(script);
  }

  function runWhenIdle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 0);
  }

  // Consentement déjà accordé (visiteur qui revient) : charge le bundle après
  // le chargement de la page plutôt qu'en bloquant le rendu initial.
  function loadAnalyticsAtRest(consent) {
    function start() {
      loadAnalyticsScript(function () {
        if (window.msInitAnalytics) window.msInitAnalytics(consent);
      });
    }
    if (document.readyState === 'complete') runWhenIdle(start);
    else window.addEventListener('load', function () { runWhenIdle(start); });
  }

  function setConsent(analytics, marketing) {
    var consent = { analytics: analytics, marketing: marketing };
    setCookie(COOKIE_NAME, JSON.stringify(consent), COOKIE_MAX_AGE_DAYS);
    if (analytics || marketing) {
      // Acceptation explicite juste maintenant : on charge tout de suite (le
      // rendu initial est déjà loin derrière, pas de raison de temporiser).
      loadAnalyticsScript(function () {
        if (window.msInitAnalytics) window.msInitAnalytics(consent);
      });
    } else if (window.msInitAnalytics) {
      // Rien à activer, mais si le bundle était déjà chargé (consentement
      // précédent), on relaie quand même l'info par cohérence.
      window.msInitAnalytics(consent);
    }
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
      '.ms-cookie-textlink{font:inherit;font-size:.85rem;color:#8aacb4;text-decoration:underline;' +
      'background:none;border:0;padding:0;cursor:pointer}' +
      '.ms-cookie-textlink:hover{color:#f5f0e8}' +
      '#ms-cookie-actions{display:flex;gap:.7rem;flex-shrink:0}' +
      '#ms-cookie-actions button{font-family:"Satoshi",sans-serif;font-weight:700;font-size:.74rem;' +
      'letter-spacing:.06em;text-transform:uppercase;padding:.65rem 1.3rem;border-radius:2px;cursor:pointer;' +
      'border:1.5px solid #4cde80;background:transparent;color:#f5f0e8;transition:background .2s,color .2s}' +
      '#ms-cookie-actions button.accept{background:#4cde80;color:#07131a}' +
      '#ms-cookie-actions button:hover{opacity:.85}' +
      '#ms-cookie-prefs-intro{margin:0 0 .7rem;font-size:.85rem;line-height:1.6;color:#8aacb4}' +
      '.ms-cookie-row{display:flex;align-items:flex-start;gap:.6rem;margin:0 0 .6rem;font-size:.85rem;' +
      'line-height:1.5;color:#f5f0e8;cursor:pointer}' +
      '.ms-cookie-row input{margin-top:.2rem;flex-shrink:0;accent-color:#4cde80}' +
      '@media(max-width:640px){#ms-cookie-banner{flex-direction:column;align-items:stretch;text-align:left}' +
      '#ms-cookie-actions{justify-content:flex-start}}';
    document.head.appendChild(style);
  }

  function hideBanner() {
    var el = document.getElementById('ms-cookie-banner');
    if (el) el.remove();
  }

  function bindMainView(banner) {
    banner.innerHTML =
      '<p>Nous utilisons des cookies de mesure d’audience et de suivi publicitaire (PostHog, Meta) ' +
      'pour comprendre l’usage du site et mesurer nos campagnes. Ils ne sont déposés qu’avec votre accord. Voir notre ' +
      '<a href="politique-confidentialite.html">politique de confidentialité</a> ou ' +
      '<button type="button" class="ms-cookie-textlink" id="ms-cookie-reject">tout refuser</button>.</p>' +
      '<div id="ms-cookie-actions">' +
      '<button type="button" class="manage" id="ms-cookie-manage">Gérer</button>' +
      '<button type="button" class="accept" id="ms-cookie-accept">Accepter</button>' +
      '</div>';

    document.getElementById('ms-cookie-accept').addEventListener('click', function () {
      setConsent(true, true);
      hideBanner();
    });
    document.getElementById('ms-cookie-reject').addEventListener('click', function () {
      setConsent(false, false);
      hideBanner();
    });
    document.getElementById('ms-cookie-manage').addEventListener('click', function () {
      bindPreferencesView(banner);
    });
  }

  function bindPreferencesView(banner) {
    var current = getConsent() || { analytics: false, marketing: false };
    banner.innerHTML =
      '<div>' +
      '<p id="ms-cookie-prefs-intro">Choisissez les cookies que vous acceptez. Les cookies techniques, ' +
      'nécessaires au fonctionnement du site, sont toujours actifs. Voir notre ' +
      '<a href="politique-confidentialite.html">politique de confidentialité</a>.</p>' +
      '<label class="ms-cookie-row"><input type="checkbox" id="ms-cookie-cat-analytics"' +
      (current.analytics ? ' checked' : '') + '><span><strong>Mesure d’audience</strong> — PostHog, pour comprendre ' +
      'l’usage du site.</span></label>' +
      '<label class="ms-cookie-row"><input type="checkbox" id="ms-cookie-cat-marketing"' +
      (current.marketing ? ' checked' : '') + '><span><strong>Publicité</strong> — Pixel Meta, pour mesurer nos ' +
      'campagnes Facebook/Instagram.</span></label>' +
      '</div>' +
      '<div id="ms-cookie-actions">' +
      '<button type="button" class="manage" id="ms-cookie-save">Enregistrer mes choix</button>' +
      '<button type="button" class="accept" id="ms-cookie-accept-all">Tout accepter</button>' +
      '</div>';

    document.getElementById('ms-cookie-save').addEventListener('click', function () {
      var analytics = document.getElementById('ms-cookie-cat-analytics').checked;
      var marketing = document.getElementById('ms-cookie-cat-marketing').checked;
      setConsent(analytics, marketing);
      hideBanner();
    });
    document.getElementById('ms-cookie-accept-all').addEventListener('click', function () {
      setConsent(true, true);
      hideBanner();
    });
  }

  function showBanner() {
    hideBanner();
    injectStyles();
    var banner = document.createElement('div');
    banner.id = 'ms-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    document.body.appendChild(banner);
    bindMainView(banner);
  }

  // Exposé pour le lien "Gérer les cookies" du footer — permet de revenir
  // sur son choix aussi facilement qu'on l'a donné (exigence CNIL).
  window.msOpenCookieBanner = showBanner;

  var existing = getConsent();
  if (existing) {
    // Rien à charger si tout est refusé : le bundle ne ferait rien de toute
    // façon (voir initAnalytics côté src/analytics.js).
    if (existing.analytics || existing.marketing) loadAnalyticsAtRest(existing);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
