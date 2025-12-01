import { NextResponse } from 'next/server';

const PASSWORDS = {
  'Salman123!!!': true
};

export function middleware(request) {
  // If trying to access the password page, allow it
  if (request.nextUrl.pathname === '/auth') {
    return NextResponse.next();
  }

  // Check if password and expiration cookies exist
  const password = request.cookies.get('site_password')?.value;
  const expiresAt = request.cookies.get('site_expires')?.value;
  
  // If both exist and password is valid
  if (password && PASSWORDS[password] && expiresAt) {
    const expirationTime = parseInt(expiresAt, 10);
    const currentTime = Date.now();
    
    // If not expired, allow access
    if (currentTime < expirationTime) {
      return NextResponse.next();
    }
  }
  
  // Otherwise, redirect to password page
  const response = NextResponse.redirect(new URL('/auth', request.url));
  
  // Clear expired cookies
  response.cookies.delete('site_password');
  response.cookies.delete('site_expires');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

