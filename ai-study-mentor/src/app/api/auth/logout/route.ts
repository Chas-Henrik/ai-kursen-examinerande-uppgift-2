import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Kontrollera om användaren har en token (optional - logout kan ske även utan giltig token)
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({
        message: 'Användaren är redan utloggad',
        details: 'Ingen aktiv session hittades'
      }, { status: 200 });
    }

    // Skapa response
    const response = NextResponse.json({
      message: 'Utloggning framgångsrik',
      details: 'Du har loggats ut från ditt konto'
    }, { status: 200 });

    // Ta bort auth-token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Omedelbar förfallotid
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Utloggningsfel:', error);
    
    // Även vid fel ska vi ta bort cookien för säkerhets skull
    const response = NextResponse.json({
      message: 'Utloggning genomförd',
      details: 'Säkerhetstokens har rensats'
    }, { status: 200 });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}

// GET endpoint för utloggning (för enklare testning via webbläsare)
export async function GET() {
  try {
    const response = NextResponse.json({
      message: 'Utloggning framgångsrik via GET',
      details: 'Du har loggats ut från ditt konto'
    }, { status: 200 });

    // Ta bort auth-token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Utloggningsfel (GET):', error);
    
    const response = NextResponse.json({
      error: 'Utloggningsfel',
      details: 'Något gick fel vid utloggningen'
    }, { status: 500 });

    // Ta bort cookien ändå
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}

// Blockera andra HTTP-metoder
export async function PUT() {
  return NextResponse.json({
    error: 'Metod inte tillåten',
    details: 'Endast POST och GET-förfrågningar accepteras för utloggning'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Metod inte tillåten',
    details: 'Endast POST och GET-förfrågningar accepteras för utloggning'
  }, { status: 405 });
}