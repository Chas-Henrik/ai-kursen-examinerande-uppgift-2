import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validera att alla fält finns
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "E-post och lösenord krävs",
          details: "Både e-post och lösenord måste fyllas i",
        },
        { status: 400 }
      );
    }

    // Validera e-post format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Ogiltig e-postadress",
          details: "Ange en giltig e-postadress",
        },
        { status: 400 }
      );
    }

    // Hitta användare med e-post (inkludera lösenord för jämförelse)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json(
        {
          error: "Felaktiga inloggningsuppgifter",
          details: "Ingen användare hittades med denna e-postadress",
        },
        { status: 401 }
      );
    }

    // Jämför lösenord
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Felaktiga inloggningsuppgifter",
          details: "Lösenordet är fel",
        },
        { status: 401 }
      );
    }

    // Uppdatera senaste inloggning (optional)
    user.lastLoginAt = new Date();
    await user.save();

    // Generera JWT token
    const token = generateToken((user._id as string).toString());

    // Skapa response utan lösenord
    const userResponse = {
      id: user._id as string,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    const response = NextResponse.json(
      {
        message: "Inloggning framgångsrik",
        user: userResponse,
        token,
      },
      { status: 200 }
    );

    // Sätt token som httpOnly cookie för säkerhet
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 dagar i sekunder
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Inloggningsfel:", error);

    if (error instanceof Error) {
      // JWT generation errors
      if (error.message.includes("JWT")) {
        return NextResponse.json(
          {
            error: "Autentiseringsfel",
            details: "Kunde inte skapa säkerhetstoken",
          },
          { status: 500 }
        );
      }

      // Database connection errors
      if (error.message.includes("connection")) {
        return NextResponse.json(
          {
            error: "Databasfel",
            details: "Kunde inte ansluta till databasen",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internt serverfel",
        details: "Något gick fel vid inloggningen. Försök igen senare.",
      },
      { status: 500 }
    );
  }
}

// Blockera andra HTTP-metoder
export async function GET() {
  return NextResponse.json(
    {
      error: "Metod inte tillåten",
      details: "Endast POST-förfrågningar accepteras för inloggning",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Metod inte tillåten",
      details: "Endast POST-förfrågningar accepteras för inloggning",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Metod inte tillåten",
      details: "Endast POST-förfrågningar accepteras för inloggning",
    },
    { status: 405 }
  );
}
