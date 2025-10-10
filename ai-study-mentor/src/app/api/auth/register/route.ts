import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // Validera att alla fält finns
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Alla fält är obligatoriska",
          details: "Namn, e-post och lösenord måste fyllas i",
        },
        { status: 400 }
      );
    }

    // Validera namn (minst 2 tecken)
    if (name.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Namnet måste vara minst 2 tecken långt",
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

    // Validera lösenord (minst 6 tecken)
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Lösenordet måste vara minst 6 tecken långt",
        },
        { status: 400 }
      );
    }

    // Validera lösenordsstyrka (minst en siffra och en bokstav)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error: "Lösenordet måste innehålla minst en bokstav och en siffra",
        },
        { status: 400 }
      );
    }

    // Kolla om e-posten redan används
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "E-posten används redan",
          details: "Ett konto med denna e-postadress finns redan",
        },
        { status: 409 }
      );
    }

    // Hasha lösenordet
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Skapa ny användare
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Generera JWT token
    const token = generateToken((savedUser._id as string).toString());

    // Skapa response utan lösenord
    const userResponse = {
      id: savedUser._id as string,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };

    const response = NextResponse.json(
      {
        message: "Användarkonto skapat framgångsrikt",
        user: userResponse,
        token,
      },
      { status: 201 }
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
    console.error("Registreringsfel:", error);

    if (error instanceof Error) {
      // MongoDB duplicate key error
      if (error.message.includes("E11000")) {
        return NextResponse.json(
          {
            error: "E-posten används redan",
            details: "Ett konto med denna e-postadress finns redan",
          },
          { status: 409 }
        );
      }

      // Mongoose validation errors
      if (error.message.includes("validation failed")) {
        return NextResponse.json(
          {
            error: "Ogiltiga användaruppgifter",
            details: "Kontrollera att alla fält är korrekt ifyllda",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internt serverfel",
        details: "Något gick fel vid registreringen. Försök igen senare.",
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
      details: "Endast POST-förfrågningar accepteras för registrering",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Metod inte tillåten",
      details: "Endast POST-förfrågningar accepteras för registrering",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Metod inte tillåten",
      details: "Endast POST-förfrågningar accepteras för registrering",
    },
    { status: 405 }
  );
}
