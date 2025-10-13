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
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const questions = await Question.findById(id);

    if (!questions) {
      return NextResponse.json(
        { error: "Questions not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Error fetching questions" },
      { status: 500 },
    );
  }
}
