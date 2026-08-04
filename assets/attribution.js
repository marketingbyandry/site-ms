(function () {
  /* ════════════════════════════════════════
     Attribution des leads — capture la provenance au premier hit de la
     session et la restitue au moment où le prospect ouvre le formulaire
     Tally. Sans ça, une demande d'étude arrive dans le CRM sans qu'on
     sache si elle vient du SEO local, d'un article de blog ou d'une régie.

     Volontairement en sessionStorage et non en cookie : la donnée vit le
     temps de l'onglet, reste first-party, ne contient aucun identifiant
     de l'internaute, et n'est lue que si le prospect soumet lui-même le
     formulaire. Elle est donc rattachable au service expressément demandé
     (« obtenir une étude ») plutôt qu'à du suivi publicitaire — mais elle
     doit rester mentionnée dans la politique de confidentialité.
     ════════════════════════════════════════ */

  var KEY = 'ms_attr';

  // Paramètres de campagne des régies qu'on est susceptible d'utiliser.
  // Ajouter ici tout nouveau paramètre plutôt que de le traiter à part.
  var CAMPAIGN_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id'
  ];

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function readStored() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  // Le premier hit gagne : si le prospect arrive par un article de blog puis
  // navigue vers b2b.html, c'est l'article qui a produit le lead, pas la page
  // de conversion.
  function captureFirstTouch() {
    var stored = readStored();
    if (stored) return stored;

    var attr = {
      landing_page: location.origin + location.pathname,
      referrer: document.referrer || '(direct)',
      first_seen_at: new Date().toISOString()
    };

    try {
      var qs = new URLSearchParams(location.search);
      for (var i = 0; i < CAMPAIGN_PARAMS.length; i++) {
        var value = qs.get(CAMPAIGN_PARAMS[i]);
        if (value) attr[CAMPAIGN_PARAMS[i]] = value;
      }
    } catch (e) { /* URL exotique — on garde au moins landing page + referrer */ }

    try {
      sessionStorage.setItem(KEY, JSON.stringify(attr));
    } catch (e) { /* navigation privée / quota — l'attribution reste en mémoire */ }

    return attr;
  }

  var firstTouch = captureFirstTouch();

  /* Retourne les champs cachés à passer à Tally. Tout est converti en
     chaîne : Tally rejette silencieusement les valeurs non scalaires. */
  window.msAttribution = function () {
    var current = readStored() || firstTouch;
    var out = {};

    for (var key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        out[key] = String(current[key]);
      }
    }

    out.page_url = location.origin + location.pathname;
    out.variant = getCookie('ms_variant') || 'A';

    // Présent uniquement si le script de tracking HubSpot a été chargé après
    // consentement. Transmis tel quel, il permet à HubSpot de rattacher tout
    // l'historique de navigation anonyme au contact créé.
    var hutk = getCookie('hubspotutk');
    if (hutk) out.hutk = hutk;

    return out;
  };
})();
