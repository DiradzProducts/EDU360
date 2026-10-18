import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected portal routes that require an authenticated session
const PROTECTED_ROUTES = ['/student', '/teacher', '/admin', '/parent'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current route is a protected portal route
  const isProtected = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Retrieve institutional session cookie
  const sessionCookie = request.cookies.get('edu360_session')?.value;

  // If no active session cookie exists, redirect immediately to login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Determine portal role from path
  const targetPortal = PROTECTED_ROUTES.find(r => pathname === r || pathname.startsWith(`${r}/`))?.replace('/', '');

  // Role validation: if session role does not match the target portal, redirect to their rightful portal
  if (targetPortal && sessionCookie !== targetPortal) {
    // Redirect to the user's rightful portal
    const authorizedUrl = new URL(`/${sessionCookie}`, request.url);
    return NextResponse.redirect(authorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/parent/:path*'
  ],
};
