import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/me'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/favicon'))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get('icam_auth')?.value;
  if (!token || !verifyToken(token)) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For page routes, redirect to login
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/image|favicon.ico).*)'],
};
