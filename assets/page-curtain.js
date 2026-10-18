/* Rideau de transition entre pages (voir assets/page-curtain.css).
   Chargé sans defer dans le <head> : il doit poser .curtain-arrive avant le premier rendu.
   Relais en deux temps : au clic, le rideau se ferme, on note « rideau » dans sessionStorage,
   puis on navigue ; sur la page d'arrivée, la page démarre rideau fermé et s'ouvre. */
(function () {
  var KEY = 'ms-curtain';
  // Fermeture : 0,15 s de délai + 0,36 s de fermeture.
  var CLOSE_MS = 510;
  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Le lien cliqué, s'il mène à une autre page HTML du site et doit passer par le rideau ; sinon null. */
  function curtainLink(e, here) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
    var url = new URL(a.getAttribute('href'), here.href);
    if (url.origin !== here.origin || url.pathname === here.pathname) return null;
    // Seulement les pages : ni l'API, ni les fichiers (PDF, images…).
    if (url.pathname.indexOf('/api/') === 0) return null;
    var last = url.pathname.split('/').pop();
    if (last.indexOf('.') !== -1 && !/\.html$/.test(last)) return null;
    return url;
  }
  window.msCurtainLink = curtainLink;

  if (reduced) return;

  var arriving = false;
  try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (err) { /* stockage bloqué : pas de rideau à l'arrivée */ }
  if (arriving) {
    root.classList.add('curtain-arrive');
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('curtain-arrive'); }); });
    });
  }

  // Retour arrière depuis le cache du navigateur : la page revient rideau fermé, on la rouvre.
  addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('curtain-closing'); });

  document.addEventListener('click', function (e) {
    var url = curtainLink(e, location);
    if (!url) return;
    e.preventDefault();
    root.classList.add('curtain-closing');
    try { sessionStorage.setItem(KEY, '1'); } catch (err) { /* l'arrivée se fera sans rideau */ }
    setTimeout(function () { location.assign(url.href); }, CLOSE_MS);
  });
})();
