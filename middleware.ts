import createMiddleware from 'next-intl/middleware';
import {routing} from '@/lib/i18n/routing';

// Use next-intl middleware for locale handling on routes with locale prefix
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  // Match all paths except API routes, Next.js internals, and static files
  matcher: ['/((?!api|_next|.*\\..*).*)']
};


