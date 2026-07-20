import { next } from '@vercel/edge';

export const config = {
  matcher: ['/', '/b2b.html', '/b2c.html', '/blog.html', '/comment-ca-marche.html', '/resultats.html']
};

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

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

  return response;
}
