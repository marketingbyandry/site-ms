import posthog from 'posthog-js';
import { readCookie, ctaLabel } from './analytics-helpers.mjs';

// RGPD/CNIL: PostHog capture des donnees de navigation (pages vues, clics,
// identifiant persistant) — ce n'est pas une "mesure d'audience strictement
// necessaire" au sens CNIL, donc rien n'est charge ni aucun cookie pose tant
// que l'utilisateur n'a pas donne son consentement via le bandeau cookies
// (voir assets/cookie-consent.js). Ne pas appeler initPostHog() ailleurs
// sans passer par ce mecanisme de consentement.

// Cle de projet PostHog : publique par nature, ce n'est pas un secret.
const POSTHOG_TOKEN = 'phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM';
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

// Selecteur des CTA suivis, aligne sur les classes utilisees dans les pages.
const CTA_SELECTOR = 'a.cta-btn, a.pcta, a.ncta';

let initialised = false;

function initPostHog() {
  if (initialised) return;
  initialised = true;

  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_API_HOST,
    capture_pageleave: true
  });

  // Variante du test A/B, tiree au sort et posee en cookie par middleware.js.
  const properties = { variant: readCookie(document.cookie, 'ms_variant') || 'A' };

  // Commercial referent, quand le visiteur vient d'un lien d'affiliation.
  // Permet de segmenter le tunnel visite -> clic CTA -> depot de facture par
  // commercial. Le cookie est pose cote edge (middleware.js), jamais ici.
  const ref = readCookie(document.cookie, 'ms_ref');
  if (ref) properties.ref = ref;

  // Code de campagne email (segment + numero), pose cote edge comme ms_ref
  // mais en dernier-touch : sert a comparer les segments/emails entre eux,
  // jamais a la commission.
  const camp = readCookie(document.cookie, 'ms_camp');
  if (camp) properties.camp = camp;

  posthog.register(properties);

  document.addEventListener('click', function (event) {
    const el = event.target.closest(CTA_SELECTOR);
    if (!el) return;
    posthog.capture('cta_click', {
      label: ctaLabel(el.textContent),
      href: el.getAttribute('href')
    });
  });
}

// Contrat avec assets/cookie-consent.js : appele a l'acceptation du bandeau.
window.msInitAnalytics = initPostHog;

if (readCookie(document.cookie, 'ms_consent') === 'accepted') {
  initPostHog();
}
