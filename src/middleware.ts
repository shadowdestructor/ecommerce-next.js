import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Check if user is trying to access admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'ADMIN' && token.role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check if user is trying to access protected routes
  const protectedRoutes = ['/profile', '/orders', '/favorites', '/checkout'];
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/profile/:path*', 
    '/orders/:path*', 
    '/favorites/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]
};