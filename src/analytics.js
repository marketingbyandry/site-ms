import posthog from 'posthog-js';
import { readCookie, ctaLabel } from './analytics-helpers.mjs';

// RGPD/CNIL: PostHog et le Pixel Meta capturent tous deux des donnees de
// navigation (pages vues, clics, identifiant persistant) — ce n'est pas une
// "mesure d'audience strictement necessaire" au sens CNIL, donc rien n'est
// charge ni aucun cookie pose tant que l'utilisateur n'a pas donne son
// consentement via le bandeau cookies (voir assets/cookie-consent.js). Ne
// pas appeler initAnalytics() ailleurs sans passer par ce mecanisme de
// consentement.

// Cle de projet PostHog : publique par nature, ce n'est pas un secret.
const POSTHOG_TOKEN = 'phc_uHyRKSZT97w56hxk2ZaF2q8ahPyLPY9uznkY7v5hnnBM';
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

// Identifiant du Pixel Meta : public par nature (visible dans le code source
// de toute page qui le charge), pas un secret.
const META_PIXEL_ID = '1381584920727587';

// Selecteur des CTA suivis, aligne sur les classes utilisees dans les pages.
const CTA_SELECTOR = 'a.cta-btn, a.pcta, a.ncta';

let postHogInitialised = false;
let metaPixelInitialised = false;

function initPostHog() {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_API_HOST,
    capture_pageleave: true,
    // Seuls init/register/unregister/capture sont utilises ici (voir
    // handoff.md) : on coupe explicitement les autres sous-systemes pour
    // eviter le travail (et l'appel reseau /flags) qu'ils declenchent au
    // chargement alors que rien ne les exploite cote produit.
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    advanced_disable_feature_flags: true
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
  //
  // `ref` reste enregistre meme apres expiration du cookie (first-touch : on
  // veut garder trace du commercial a l'origine du dossier). `camp` doit au
  // contraire disparaitre des qu'il n'y a plus de cookie ms_camp, sinon un
  // visiteur revenu des mois plus tard en organique continuerait de trainer
  // le code de la derniere campagne email — a l'oppose du dernier-touch visee.
  const camp = readCookie(document.cookie, 'ms_camp');
  if (camp) properties.camp = camp;
  else posthog.unregister('camp');

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

function initMetaPixel() {
  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function initAnalytics(consent) {
  consent = consent || {};
  if (consent.analytics && !postHogInitialised) {
    postHogInitialised = true;
    initPostHog();
  }
  if (consent.marketing && !metaPixelInitialised) {
    metaPixelInitialised = true;
    initMetaPixel();
  }
}

// Contrat avec assets/cookie-consent.js : appele avec {analytics, marketing}
// a chaque changement de consentement (acceptation, refus, ou sauvegarde des
// preferences), et une fois au chargement si un consentement valide existe
// deja. Idempotent par categorie : un rappel avec la meme categorie a true
// ne reinitialise rien.
window.msInitAnalytics = initAnalytics;
