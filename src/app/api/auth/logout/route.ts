import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful.' },
      { status: 200 }
    );

    // Clear the token cookie by setting its expiration date to the past
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'An error occurred during logout.', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred during logout.' }, { status: 500 });
  }
}
