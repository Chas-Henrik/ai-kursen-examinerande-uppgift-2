import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

type JwtPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export async function GET() {
  try {
    const token = (await cookies()).get("ai-study-mentor-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Ingen åtkomst. Logga in först." },
        { status: 401 },
      );
    }

    const decoded = verifyToken<JwtPayload>(token);

    return NextResponse.json(
      {
        message: "Du har tillgång till den skyddade resursen.",
        userId: decoded.userId,
        email: decoded.email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Protected route access failed", error);
    return NextResponse.json(
      { message: "Din session är inte giltig längre." },
      { status: 401 },
    );
  }
}
