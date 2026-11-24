// Helpers purs de la couche analytics : ni DOM, ni PostHog, pour rester
// testables sous `node --test`. Le cablage vit dans src/analytics.js.

// Echappe les caracteres speciaux d'une regex — le nom de cookie est du code
// appelant, pas de la saisie utilisateur, mais autant ne pas construire une
// regex fragile.
function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Lit la valeur d'un cookie dans une chaine au format `document.cookie`.
 * Renvoie null si le cookie est absent.
 */
export function readCookie(cookieString, name) {
  const match = (cookieString || '').match(
    new RegExp('(?:^|; )' + escapeForRegExp(name) + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Libelle lisible d'un CTA : le texte du lien, debarrasse de ses fleches.
 */
export function ctaLabel(text) {
  return (text || '').replace(/[→➔]/g, '').trim();
}

/**
 * Charge Google Tag Manager (appelé seulement après consentement à la mesure
 * d'audience). Idempotent : dataLayer et gtm.js ne sont créés qu'une fois.
 */
export function loadGtm(win, doc, id) {
  if (win.dataLayer && win.dataLayer.some((e) => e.event === 'gtm.js')) return;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = doc.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=' + id;
  doc.head.appendChild(script);
}
