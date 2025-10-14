import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
   const { pathname, origin } = request.nextUrl;
  // Skip middleware for public and auth routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfTokenHeader = request.headers.get('x-csrf-token');
    const csrfTokenCookie = request.cookies.get('csrfToken')?.value;

    if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    '/protected/:path*',
    '/api/:path*',
  ],
};
