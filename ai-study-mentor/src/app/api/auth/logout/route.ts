import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ ok: true, message: 'Logged out successfully' }, { status: 200 });
    
    // Clear the authentication cookies
    response.cookies.set('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: new Date(0) });
    response.cookies.set('csrfToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: new Date(0) });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}