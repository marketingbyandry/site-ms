/* ════════════════════════════════════════
   APPROBATION DES POSTS (équipe com)

   approbation.html est réservée à l'équipe com : elle y valide les posts de
   la campagne sociale (Studio J1–J10) avant publication. Pas de compte à créer, un simple
   mot de passe partagé.

   Fonctionnement :
     1. /api/approbation-login reçoit le mot de passe, en dérive un jeton
        (sha256 du mot de passe salé) et le pose en cookie HttpOnly.
     2. middleware.js laisse passer approbation.html seulement si le cookie
        est valide, sinon il répond par le formulaire de mot de passe.
     3. /api/approbation-vote revérifie le cookie avant d'enregistrer un vote
        dans PostHog (événement `post_review`), où la routine le relit.

   Le dépôt ne contient que l'empreinte du jeton (ACCESS_HASH), jamais le mot
   de passe ni le jeton : connaître le code ne permet pas d'entrer. Pour
   changer le mot de passe, remplacer ACCESS_HASH par
   sha256(sha256('ms-approbation|' + nouveauMotDePasse)) en hexadécimal.
   ════════════════════════════════════════ */

export const COOKIE_NAME = 'ms_approb';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const ACCESS_HASH = '96911ba3b122400cff93d6597b83943fb6dc021bbd9c2e7580d1a650189ffaa3';

// Campagne et identifiants des posts (J1-LI, J1-FB…) : générés depuis la
// source du Studio par scripts/build-studio.mjs.
import { CAMPAIGN, POST_IDS } from './approbation-posts.mjs';

export { CAMPAIGN, POST_IDS };
export const DECISIONS = ['approuve', 'modifier', 'refuse'];

// Clé du projet PostHog (la même que dans src/analytics.js), lue dans la
// variable d'environnement Vercel POSTHOG_PROJECT_KEY.
const POSTHOG_CAPTURE_URL = 'https://eu.i.posthog.com/i/v0/e/';

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function tokenFromPassword(password) {
  return sha256Hex(`ms-approbation|${password}`);
}

export async function isValidToken(token, expectedHash = ACCESS_HASH) {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return false;
  return (await sha256Hex(token)) === expectedHash;
}

export function readCookie(cookieHeader, name = COOKIE_NAME) {
  const match = (cookieHeader || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

// Valide un vote envoyé par la page. Renvoie { ok, status, error } ou
// { ok, value } avec des champs nettoyés.
export function validateVote(body) {
  const { post, decision, comment = '', reviewer } = body || {};
  if (!POST_IDS.includes(post)) return { ok: false, status: 400, error: 'post inconnu' };
  if (!DECISIONS.includes(decision)) return { ok: false, status: 400, error: 'décision invalide' };
  if (typeof reviewer !== 'string' || !reviewer.trim() || reviewer.length > 60) {
    return { ok: false, status: 400, error: 'prénom requis' };
  }
  if (typeof comment !== 'string' || comment.length > 2000) {
    return { ok: false, status: 400, error: 'commentaire trop long' };
  }
  if (decision !== 'approuve' && !comment.trim()) {
    return { ok: false, status: 400, error: 'commentaire requis pour une modification ou un refus' };
  }
  return { ok: true, value: { post, decision, comment: comment.trim(), reviewer: reviewer.trim() } };
}

export function buildReviewEvent({ apiKey, post, decision, comment, reviewer, timestamp }) {
  return {
    api_key: apiKey,
    event: 'post_review',
    distinct_id: `com:${reviewer.toLowerCase()}`,
    timestamp,
    properties: {
      campaign: CAMPAIGN,
      post,
      decision,
      comment,
      reviewer,
      $process_person_profile: false
    }
  };
}

export { POSTHOG_CAPTURE_URL };
