import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has auth cookies
  const hasAuthCookie = request.cookies.get('connect.sid');
  
  // Auth pages (login, register)
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Redirect authenticated users away from auth pages
  if (hasAuthCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect unauthenticated users to login for protected routes
  if (!hasAuthCookie && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};