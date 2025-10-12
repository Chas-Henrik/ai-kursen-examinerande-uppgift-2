import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import Document from "@/models/Document";
import Question from "@/models/Question";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const session = await Session.findById(id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await Document.findByIdAndDelete(session.documentId);
    if (session.questionId) {
      await Question.findByIdAndDelete(session.questionId);
    }
    await Session.findByIdAndDelete(id);

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Error deleting session" },
      { status: 500 },
    );
  }
}
