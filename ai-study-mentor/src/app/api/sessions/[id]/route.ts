import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib';
import Session from "@/models/Session";
import Document from "@/models/Document";
import Question from "@/models/Question";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";

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

    // Delete Pinecone index
    if (session.pineconeIndexName) {
      // Count other sessions referencing the same Pinecone index
      const count = await Session.countDocuments({
        pineconeIndexName: session.pineconeIndexName,
        _id: { $ne: session._id }, // exclude current session
      });

      if (count === 0) {
        // No other sessions reference this Pinecone index → safe to delete
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const existingIndexes = await pinecone.listIndexes();
        if (existingIndexes.indexes?.some((index) => index.name === session.pineconeIndexName)) {
          await pinecone.deleteIndex(session.pineconeIndexName);
        }
      }
    }

    if (session.documentId) {
      // Count other sessions referencing the same document
      const count = await Session.countDocuments({
        documentId: session.documentId,
        _id: { $ne: session._id }, // exclude current session
      });

      if (count === 0) {
        // No other sessions reference this document → safe to delete
        await Document.findByIdAndDelete(session.documentId);
      }
    }
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
