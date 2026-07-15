import { next, rewrite } from '@vercel/edge';

export const config = { matcher: '/' };

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|linkedinbot|preview/i;

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Bots always get variant A, never get the cookie, never see B rewritten
  // at "/" — keeps SEO/crawling consistent and avoids duplicate content.
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
