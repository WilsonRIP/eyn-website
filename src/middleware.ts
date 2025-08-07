import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/src/lib/auth';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
];

// Define auth routes (redirect if already authenticated)
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Check if user is authenticated
  const isAuthenticated = !!session;

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth routes (redirect if already authenticated)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
