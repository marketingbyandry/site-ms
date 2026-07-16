(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  var params = new URLSearchParams(window.location.search);
  var prenom = params.get('prenom');
  var conseiller = params.get('conseiller');

  if (prenom) {
    document.querySelectorAll('.js-prenom').forEach(function (el) { el.textContent = prenom; });
    document.querySelectorAll('.js-prenom-line').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('.js-generic-line').forEach(function (el) { el.hidden = true; });
  }

  if (conseiller) {
    document.querySelectorAll('.js-conseiller').forEach(function (el) { el.textContent = conseiller; });
    document.querySelectorAll('.js-conseiller-line').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('.js-generic-conseiller-line').forEach(function (el) { el.hidden = true; });
  }

  if (window.posthog) {
    posthog.register({ suivi_variant: getCookie('ms_suivi_variant') || 'C' });
  }
})();
