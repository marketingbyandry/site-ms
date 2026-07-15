(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  var variant = getCookie('ms_variant') || 'A';

  // Standard PostHog JS snippet — installed as shown by PostHog's own
  // "Install PostHog" onboarding page for this project. Before shipping,
  // re-copy the snippet from https://<your-instance>/project/settings
  // (Project Settings → Install PostHog) and diff it against the block
  // below — PostHog occasionally revises this loader, and using a stale
  // copy risks silently failing to load.
  !function(t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) {
      function g(t, e) {
        var o = e.split(".");
        2 == o.length && (t = t[o[0]], e = o[1]);
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) };
      }
      (p = t.createElement("script")).type = "text/javascript";
      p.crossOrigin = "anonymous";
      p.async = !0;
      p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
      (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
      var u = e;
      for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [],
        u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e },
        u.people.toString = function () { return u.toString(1) + ".people (stub)" },
        o = "init capture register register_once unregister identify alias reset getFeatureFlag isFeatureEnabled onFeatureFlags getSurveys canRenderSurvey opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing".split(" "),
        n = 0; n < o.length; n++) g(u, o[n]);
      e._i.push([i, s, a]);
    }, e.__SV = 1);
  }(document, window.posthog || []);

  posthog.init('phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM', {
    api_host: 'https://eu.i.posthog.com',
    capture_pageleave: true
  });

  posthog.register({ variant: variant });

  function ctaLabel(el) {
    return (el.textContent || '').replace(/[→➔→]/g, '').trim();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('a.cta-btn, a.pcta, a.ncta');
    if (!el) return;
    posthog.capture('cta_click', {
      label: ctaLabel(el),
      href: el.getAttribute('href')
    });
  });
})();
