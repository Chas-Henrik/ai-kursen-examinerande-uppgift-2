import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib';
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
  }

  try {
    const questions = await Question.findById(id);

    if (!questions) {
      return NextResponse.json(
        { ok: false, message: "Questions not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: questions });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
