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
   ex. chr-e1. Independant de `ref` : ne credite aucune commission, sert
   uniquement a mesurer quel email ramene le plus de trafic par segment
   (PostHog, cf. src/analytics.js).

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
  'tert-e1', 'tert-e2', 'tert-e3'
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

export default function middleware(request) {
  const url = new URL(request.url);
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
