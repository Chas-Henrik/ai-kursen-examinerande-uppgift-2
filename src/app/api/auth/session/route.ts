import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }

    const decoded = jwt.verify(token, jwtSecret);

    return NextResponse.json({ user: decoded }, { status: 200 });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
  }
}