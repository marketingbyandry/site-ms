import { next } from '@vercel/edge';

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
    '/c/:slug*'
  ]
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

/* ════════════════════════════════════════
   ATTRIBUTION COMMERCIALE

   Un slug = un commercial. Chacun diffuse ses liens :
     https://www.byandry.com/b2b.html?ref=<slug>   (mail, signature, LinkedIn)
     https://www.byandry.com/c/<slug>              (carte de visite, QR code)

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

// Page d'atterrissage des liens courts /c/<slug>.
const SHORT_LINK_TARGET = '/b2b.html';

const REF_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

export default function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Lien court /c/<slug> → redirection vers la landing avec le ref en query.
  // Redirection et non rewrite : les pages référencent leurs assets en
  // relatif (assets/analytics.js), qui casseraient sous /c/. Traité avant le
  // filtre bots pour que les aperçus de lien (LinkedIn, WhatsApp) aboutissent.
  const shortLink = url.pathname.match(/^\/c\/([^/]+)\/?$/);
  if (shortLink) {
    const slug = shortLink[1].toLowerCase();
    const target = new URL(SHORT_LINK_TARGET, url);
    if (SLUGS.includes(slug)) {
      target.searchParams.set('ref', slug);
    }
    return Response.redirect(target, 302);
  }

  // Bots always get variant A, never get the cookie — keeps SEO/crawling
  // consistent and avoids duplicate content across the whole site, not just
  // the home.
  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  const incomingRef = (url.searchParams.get('ref') || '').toLowerCase();
  const hasRef = /(?:^|;\s*)ms_ref=/.test(cookieHeader);

  if (!hasRef && SLUGS.includes(incomingRef)) {
    response.headers.append(
      'Set-Cookie',
      `ms_ref=${incomingRef}; Path=/; Max-Age=${REF_MAX_AGE}; SameSite=Lax`
    );
  }

  return response;
}
