import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Hämta användare från JWT token
    const payload = getAuthenticatedUser(request);
    
    // Hämta användardata från databas (utan lösenord)
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({
        error: 'Användaren hittades inte',
        details: 'Kontot kanske har tagits bort'
      }, { status: 404 });
    }

    // Returnera användardata
    const userResponse = {
      id: user._id as string,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    return NextResponse.json({
      message: 'Användare hämtad framgångsrikt',
      user: userResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Fel vid hämtning av användarinfo:', error);
    
    if (error instanceof Error) {
      // JWT errors (token expired, invalid, etc.)
      if (error.message.includes('token') || error.message.includes('autentisering')) {
        return NextResponse.json({
          error: 'Ogiltig session',
          details: error.message
        }, { status: 401 });
      }

      // Database errors
      if (error.message.includes('connection')) {
        return NextResponse.json({
          error: 'Databasfel',
          details: 'Kunde inte ansluta till databasen'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      error: 'Internt serverfel',
      details: 'Kunde inte hämta användarinformation'
    }, { status: 500 });
  }
}

// Blockera andra HTTP-metoder
export async function POST() {
  return NextResponse.json({
    error: 'Metod inte tillåten',
    details: 'Endast GET-förfrågningar accepteras för användarinfo'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    error: 'Metod inte tillåten',
    details: 'Endast GET-förfrågningar accepteras för användarinfo'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Metod inte tillåten',
    details: 'Endast GET-förfrågningar accepteras för användarinfo'
  }, { status: 405 });
}