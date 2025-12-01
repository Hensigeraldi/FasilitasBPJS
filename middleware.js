import { NextResponse } from 'next/server';

export function middleware(request) {
  const user = request.cookies.get('user');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                        request.nextUrl.pathname.startsWith('/api/auth');

  // If not logged in and trying to access protected route
  if (!user && !isLoginPage && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};