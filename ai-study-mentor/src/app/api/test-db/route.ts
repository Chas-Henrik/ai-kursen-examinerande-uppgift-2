import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "MongoDB connected!" });
  } catch (error) {
    console.error("Database connection failed", error);
    return NextResponse.json(
      { message: "Kunde inte ansluta till MongoDB" },
      { status: 500 },
    );
  }
}
