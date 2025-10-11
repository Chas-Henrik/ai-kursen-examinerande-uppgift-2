import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "MongoDB connected!" });
  } catch {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}
