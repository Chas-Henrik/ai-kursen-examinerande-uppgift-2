import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to login page if no token is found
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET!);
    // If token is valid, continue to the requested page
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/protected/:path*'], // Protect routes under /protected
};
