(function () {
  'use strict';

  var META_PIXEL_ID = 'REPLACE_WITH_PIXEL_ID';
  var CONSENT_COOKIE = 'ms_consent';
  var CONSENT_MAX_AGE_DAYS = 180;
  var STICKY_CTA_SELECTOR = '.sticky-cta';

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match.pop()) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + maxAge + '; SameSite=Lax; Secure';
  }

  function clearCookie(name) {
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax; Secure';
  }

  function loadPixel() {
    if (!META_PIXEL_ID || META_PIXEL_ID === 'REPLACE_WITH_PIXEL_ID') {
      console.warn('[consent-pixel] META_PIXEL_ID not set — Meta Pixel will not load.');
      return;
    }
    if (window.fbq) return;

    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  window.msTrackLead = function (source) {
    if (!window.fbq) return;
    window.fbq('track', 'Lead', { content_name: source });
  };

  function injectBannerStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#ms-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#14251f;color:#f5f1e8;padding:20px 24px;display:flex;' +
      'flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;' +
      'font-family:inherit;box-shadow:0 -4px 24px rgba(0,0,0,.25);}' +
      '#ms-consent-banner p{margin:0;font-size:14px;line-height:1.5;max-width:640px;}' +
      '#ms-consent-banner .ms-consent-actions{display:flex;gap:12px;flex-shrink:0;}' +
      '#ms-consent-banner button{cursor:pointer;border:none;border-radius:999px;' +
      'padding:10px 20px;font-size:14px;font-weight:600;}' +
      '#ms-consent-accept{background:#2f6b52;color:#fff;}' +
      '#ms-consent-refuse{background:transparent;color:#f5f1e8;border:1px solid rgba(245,241,232,.4)!important;}' +
      '#ms-consent-manage{position:fixed;left:16px;bottom:16px;z-index:9998;' +
      'background:#14251f;color:#f5f1e8;border:1px solid rgba(245,241,232,.3);' +
      'border-radius:999px;padding:8px 14px;font-size:12px;font-family:inherit;' +
      'cursor:pointer;opacity:.85;}';
    document.head.appendChild(style);
  }

  function offsetStickyCta(px) {
    var sticky = document.querySelector(STICKY_CTA_SELECTOR);
    if (!sticky) return;
    sticky.style.transition = 'bottom .2s ease';
    sticky.style.bottom = px + 'px';
  }

  function showManageLink() {
    if (document.getElementById('ms-consent-manage')) return;
    var manage = document.createElement('button');
    manage.id = 'ms-consent-manage';
    manage.type = 'button';
    manage.textContent = 'Gérer les cookies';
    manage.addEventListener('click', function () {
      manage.parentNode.removeChild(manage);
      clearCookie(CONSENT_COOKIE);
      showBanner();
    });
    document.body.appendChild(manage);
  }

  function showBanner() {
    injectBannerStyles();
    var banner = document.createElement('div');
    banner.id = 'ms-consent-banner';
    banner.innerHTML =
      '<p>Ce site utilise des cookies pour mesurer l’audience et personnaliser les publicités. Vous pouvez accepter ou refuser ce suivi.</p>' +
      '<div class="ms-consent-actions">' +
      '<button id="ms-consent-refuse" type="button">Refuser</button>' +
      '<button id="ms-consent-accept" type="button">Accepter</button>' +
      '</div>';
    document.body.appendChild(banner);
    offsetStickyCta(banner.offsetHeight);

    document.getElementById('ms-consent-accept').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'accepted', CONSENT_MAX_AGE_DAYS);
      banner.parentNode.removeChild(banner);
      offsetStickyCta(0);
      loadPixel();
      showManageLink();
    });
    document.getElementById('ms-consent-refuse').addEventListener('click', function () {
      setCookie(CONSENT_COOKIE, 'refused', CONSENT_MAX_AGE_DAYS);
      banner.parentNode.removeChild(banner);
      offsetStickyCta(0);
      showManageLink();
    });
  }

  function init() {
    var consent = getCookie(CONSENT_COOKIE);
    if (consent === 'accepted') {
      loadPixel();
      showManageLink();
    } else if (consent === 'refused') {
      showManageLink();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
