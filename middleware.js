import { next, rewrite } from '@vercel/edge';

export const config = {
  matcher: [
    '/',
    '/ms-strategy-suivi-b2b.html',
    '/ms-strategy-suivi-b2c.html',
    '/generateur-suivi.html',
  ],
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

function homeSplit(request) {
  const userAgent = request.headers.get('user-agent') || '';

  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_variant=(A|B)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'B');

  const response = variant === 'B'
    ? rewrite(new URL('/index-b.html', request.url))
    : next();

  response.headers.append(
    'Set-Cookie',
    `ms_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}

function suiviSplit(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bots always get variant C (the canonical file), never a cookie —
  // avoids polluting PostHog with email-security link scanners that
  // pre-fetch prospect links before the human opens them.
  if (BOT_UA.test(userAgent)) {
    return next();
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)ms_suivi_variant=(A|C)/);
  const variant = cookieMatch ? cookieMatch[1] : (Math.random() < 0.5 ? 'A' : 'C');

  let response;
  if (variant === 'A') {
    // Mutate pathname on a URL already parsed from the full request URL,
    // so `?prenom=&conseiller=` (parsed into url.search) survive the
    // rewrite — constructing `new URL('/foo-a.html', request.url)` from a
    // bare path instead would drop the original query string.
    const url = new URL(request.url);
    url.pathname = url.pathname.replace('.html', '-a.html');
    response = rewrite(url);
  } else {
    response = next();
  }

  response.headers.append(
    'Set-Cookie',
    `ms_suivi_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return response;
}

function requireBasicAuth(request) {
  const expectedUser = process.env.SUIVI_TOOL_USER;
  const expectedPass = process.env.SUIVI_TOOL_PASS;
  const auth = request.headers.get('authorization') || '';

  if (expectedUser && expectedPass && auth === 'Basic ' + btoa(expectedUser + ':' + expectedPass)) {
    return next();
  }

  return new Response('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Outil interne"' },
  });
}

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/generateur-suivi.html') {
    return requireBasicAuth(request);
  }
  if (pathname === '/ms-strategy-suivi-b2b.html' || pathname === '/ms-strategy-suivi-b2c.html') {
    return suiviSplit(request);
  }
  return homeSplit(request);
}
