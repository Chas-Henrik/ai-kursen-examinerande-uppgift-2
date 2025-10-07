import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Utloggning lyckades." });
  response.cookies.set("ai-study-mentor-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
