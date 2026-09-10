import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login, session check, and logout endpoints without verification
  if (pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const isValidSession = await verifySessionToken(sessionCookie);

  // Protect all /api/admin/* endpoints
  if (pathname.startsWith('/api/admin')) {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dario@jesusyouthpala';
    const authHeader = request.headers.get('x-admin-password') || request.headers.get('authorization')?.replace('Bearer ', '');
    const hasValidHeader = Boolean(authHeader && authHeader === adminPassword);

    if (!isValidSession && !hasValidHeader) {
      return NextResponse.json({ error: 'Unauthorized: Session expired or invalid' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // For /admin page requests, pass along session status in header
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const response = NextResponse.next();
    if (isValidSession) {
      response.headers.set('x-admin-authenticated', 'true');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

