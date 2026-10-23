import { next } from '@vercel/edge';
import { isValidToken, readCookie } from './lib/approbation.mjs';

export const config = {
  matcher: [
    '/',
    '/b2b.html',
    '/b2c.html',
    '/blog.html',
    '/comment-ca-marche.html',
    '/resultats.html',
    '/ms-strategy-landing-2.html',
    '/ms-strategy-calculateur.html',
    '/c/:slug*',
    '/approbation',
    '/approbation.html',
    '/approbation-media/:path*'
  ]
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

/* ════════════════════════════════════════
   ATTRIBUTION COMMERCIALE

   Un slug = un commercial. Chacun diffuse ses liens :
     https://cabinetms.fr/b2b.html?ref=<slug>   (mail, signature, LinkedIn)
     https://cabinetms.fr/c/<slug>              (carte de visite, QR code)

   Le slug entrant n'est retenu que s'il figure dans SLUGS : un ?ref= inventé
   ou recopié de travers est ignoré plutôt que stocké.

   Le cookie est posé ici, côté serveur, et non en JavaScript : Safari
   plafonne à 7 jours les cookies écrits par document.cookie, alors qu'un
   Set-Cookie first-party tient les 90 jours demandés.

   Règle d'attribution : premier commercial touché (first-touch). Le cookie
   n'est jamais écrasé tant qu'il est vivant, donc celui qui a créé la
   demande garde le dossier même si le prospect revient plus tard par un
   autre canal.
   ════════════════════════════════════════ */

// Un slug par commercial. `ag` (Antoine) y figure pour qu'il dispose lui aussi
// de liens tracables, mais c'est aussi la valeur de repli appliquee dans
// assets/ref.js : un dossier depose sans lien commercial lui revient.
export const SLUGS = ['ag', 'lg', 'mv', 'pm', 'zb', 'lf'];

/* ════════════════════════════════════════
   SUIVI DE CAMPAGNE (camp)

   Un code par email de la sequence de demarchage a froid (segment + numero),
   ex. chr-e1. Depuis le levier social B2B, `CAMPAIGNS` contient aussi des
   codes par plateforme sociale (soc-li, soc-fb, soc-ig, soc-x), poses par
   les liens de post organiques et les annonces payantes de chaque
   plateforme. Independant de `ref` : ne credite aucune commission, sert
   uniquement a mesurer quel email ou quelle plateforme ramene le plus de
   trafic par segment (PostHog, cf. src/analytics.js).

   Contrairement a `ref` (premier-touch, protege la commission du commercial
   qui a cree la demande), `camp` est dernier-touch : un nouveau `?camp=`
   valide ecrase toujours la valeur precedente, pour refleter le dernier
   email qui a fait revenir le prospect plutot que le tout premier.

   `camp` ne transite jamais par le lien court /c/<slug> : ce format est
   reserve aux commerciaux (carte de visite, QR code), pas aux campagnes
   email.
   ════════════════════════════════════════ */
export const CAMPAIGNS = [
  'chr-e1', 'chr-e2', 'chr-e3',
  'ind-e1', 'ind-e2', 'ind-e3',
  'tert-e1', 'tert-e2', 'tert-e3',
  // Levier social B2B (docs/superpowers/specs/2026-09-07-leviers-social-b2b-design.md)
  'soc-li', 'soc-fb', 'soc-ig', 'soc-x'
];

// Page d'atterrissage des liens courts /c/<slug>.
const SHORT_LINK_TARGET = '/b2b.html';

const REF_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours
const CAMP_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

/* Attribue slug et/ou camp puis renvoie vers une URL propre, sans trace de
   l'un ou l'autre dans l'URL affichee.

   L'attribution vit dans les cookies, jamais dans l'URL affichee. Consequences
   voulues :
   - un lien de commercial ou de campagne partage publiquement (post LinkedIn,
     annuaire) ne produit aucune page indexable : le crawler suit la
     redirection et ne voit que l'URL canonique, deja indexee ;
   - un prospect qui recopie l'URL de sa barre d'adresse pour l'envoyer a un
     collegue ne transmet ni le slug de son commercial ni le code de campagne ;
   - les parametres utm_* sont conserves, seuls `ref` et `camp` sont retires.

   Les bots ne recoivent jamais de cookie d'attribution : ils sont redirigés
   comme tout le monde, mais sans Set-Cookie. */
function attributionRedirect(target, { slug, camp, isBot, hasRef }) {
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      // Une redirection porteuse de Set-Cookie ne doit jamais etre mise en
      // cache : un CDN la resservirait a d'autres visiteurs, qui heriteraient
      // du commercial ou de la campagne d'un inconnu.
      'Cache-Control': 'private, no-store'
    }
  });

  if (isBot) {
    return response;
  }

  if (!hasRef && slug && SLUGS.includes(slug)) {
    response.headers.append(
      'Set-Cookie',
      `ms_ref=${slug}; Path=/; Max-Age=${REF_MAX_AGE}; SameSite=Lax`
    );
  }

  if (camp && CAMPAIGNS.includes(camp)) {
    response.headers.append(
      'Set-Cookie',
      `ms_camp=${camp}; Path=/; Max-Age=${CAMP_MAX_AGE}; SameSite=Lax`
    );
  }

  return response;
}

/* ════════════════════════════════════════
   PAGE D'APPROBATION (équipe com)

   approbation.html n'est servie qu'avec un cookie de session valide (voir
   lib/approbation.mjs). Sans lui, on répond par un formulaire de mot de
   passe à la place de la page : son contenu ne quitte jamais le serveur.
   Ses photos et vidéos (approbation-media/) suivent la même règle, avec un
   simple 401 à la place du formulaire.
   ════════════════════════════════════════ */

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow'
};

function loginPage(hasError) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="assets/favicon.ico" sizes="any">
<title>Accès équipe com · M&amp;S Strategy</title>
<style>
:root { color-scheme: dark; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 20px; box-sizing: border-box;
  background: #07131a; color: #f5f0e8; font: 400 16px/1.5 system-ui, -apple-system, sans-serif; }
form { width: 100%; max-width: 380px; display: grid; gap: 14px; padding: 32px 28px; border-radius: 16px;
  background: #0e2a33; border: 1px solid rgba(94, 207, 220, .16); }
h1 { margin: 0; font: 400 1.9rem/1.1 Georgia, serif; }
p { margin: 0; color: #8aacb4; font-size: .95rem; }
label { font-weight: 600; font-size: .9rem; }
input { font: inherit; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(94, 207, 220, .3);
  background: #07131a; color: inherit; }
input:focus { outline: 2px solid #2bb5c8; outline-offset: 1px; }
button { font: 700 1rem/1 system-ui, sans-serif; padding: 14px; border: 0; border-radius: 10px;
  background: #2bb5c8; color: #07131a; cursor: pointer; }
.error { color: #ff9b8a; }
</style>
</head>
<body>
<form method="post" action="/api/approbation-login">
  <h1>Validation des posts</h1>
  <p>Espace réservé à l'équipe communication de M&amp;S Strategy.</p>
  ${hasError ? '<p class="error" role="alert">Mot de passe incorrect, réessayez.</p>' : ''}
  <label for="password">Mot de passe</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
  <button type="submit">Accéder</button>
</form>
</body>
</html>`;
}

export async function approbationGate(request) {
  const url = new URL(request.url);
  const token = readCookie(request.headers.get('cookie'));
  const isMedia = url.pathname.startsWith('/approbation-media/');
  if (await isValidToken(token)) {
    return next({ headers: PRIVATE_HEADERS });
  }
  if (isMedia) {
    return new Response('Accès réservé', { status: 401, headers: PRIVATE_HEADERS });
  }
  return new Response(loginPage(url.searchParams.has('erreur')), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...PRIVATE_HEADERS }
  });
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === '/approbation' || url.pathname === '/approbation.html' || url.pathname.startsWith('/approbation-media/')) {
    return approbationGate(request);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_UA.test(userAgent);
  const cookieHeader = request.headers.get('cookie') || '';
  const hasRef = /(?:^|;\s*)ms_ref=/.test(cookieHeader);

  // Lien court /c/<slug> → landing, sans passer par une URL intermediaire
  // portant le slug. Redirection et non rewrite : les pages referencent leurs
  // assets en relatif (assets/analytics.js), qui casseraient sous /c/. Traite
  // avant le filtre bots pour que les apercus de lien (LinkedIn, WhatsApp)
  // aboutissent sur une vraie page.
  const shortLink = url.pathname.match(/^\/c\/([^/]+)\/?$/);
  if (shortLink) {
    const target = new URL(SHORT_LINK_TARGET, url);
    return attributionRedirect(target, {
      slug: shortLink[1].toLowerCase(),
      camp: null,
      isBot,
      hasRef
    });
  }

  // ?ref=<slug> et/ou ?camp=<code> → on attribue, puis on nettoie l'URL.
  if (url.searchParams.has('ref') || url.searchParams.has('camp')) {
    const slug = url.searchParams.has('ref')
      ? (url.searchParams.get('ref') || '').toLowerCase()
      : null;
    const camp = url.searchParams.has('camp')
      ? (url.searchParams.get('camp') || '').toLowerCase()
      : null;
    const target = new URL(url);
    target.searchParams.delete('ref');
    target.searchParams.delete('camp');
    return attributionRedirect(target, { slug, camp, isBot, hasRef });
  }

  // Bots always get variant A, never get the cookie — keeps SEO/crawling
  // consistent and avoids duplicate content across the whole site, not just
  // the home.
  if (isBot) {
    return next();
  }

  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}
