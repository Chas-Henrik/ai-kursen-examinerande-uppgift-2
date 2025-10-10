import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Testa databasanslutning
    await connectDB();
    console.log("✅ Databasanslutning etablerad");

    // Kontrollera om admin-användare redan finns
    const existingUser = await User.findOne({
      email: "admin@ai-study-mentor.se",
    });

    if (existingUser) {
      const userCount = await User.countDocuments();
      return NextResponse.json(
        {
          success: true,
          message: "Databas och admin-användare existerar redan!",
          details: {
            connectionStatus: "Ansluten till MongoDB Atlas",
            databaseName: "ai-study-mentor",
            adminUserExists: true,
            adminUserId: existingUser._id,
            createdAt: existingUser.createdAt,
            totalUsers: userCount,
            note: "Kolla MongoDB Atlas - databasen ska vara synlig nu!",
          },
        },
        { status: 200 }
      );
    }

    // Skapa permanent admin-användare för att säkerställa att databasen skapas
    const adminUser = new User({
      name: "Admin Användare",
      email: "admin@ai-study-mentor.se",
      password: "admin123456",
    });

    // Spara användaren (detta skapar databasen i Atlas)
    const savedUser = await adminUser.save();
    console.log("✅ Admin-användare skapad:", savedUser.email);

    // Hämta användaren för att verifiera
    const foundUser = await User.findById(savedUser._id);

    // Testa lösenordsjämförelse
    const passwordMatch = await foundUser?.comparePassword("admin123456");
    console.log("✅ Lösenordsverifiering:", passwordMatch);

    // Räkna totala användare
    const userCount = await User.countDocuments();

    return NextResponse.json(
      {
        success: true,
        message: "Databas skapad och admin-användare tillagd!",
        details: {
          connectionStatus: "Ansluten till MongoDB Atlas",
          databaseName: "ai-study-mentor",
          adminUserCreated: true,
          adminUserId: savedUser._id,
          adminEmail: savedUser.email,
          passwordValidation: passwordMatch,
          totalUsers: userCount,
          note: "Kolla nu i MongoDB Atlas - databasen 'ai-study-mentor' och collection 'users' ska finnas!",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Databastest misslyckades:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Databastest misslyckades",
        error: error instanceof Error ? error.message : "Okänt fel uppstod",
        details: {
          connectionStatus: "Misslyckades med att ansluta till MongoDB Atlas",
          suggestion: "Kontrollera MONGODB_URI i .env.local filen",
        },
      },
      { status: 500 }
    );
  }
}
