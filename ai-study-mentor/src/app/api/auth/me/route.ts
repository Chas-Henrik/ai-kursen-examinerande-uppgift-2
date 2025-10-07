import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

type JwtPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export async function GET() {
  try {
    const token = cookies().get("ai-study-mentor-token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken<JwtPayload>(token);

    await connectToDatabase();

    const user = await User.findById(decoded.userId).select("name email");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Auth me failed", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
