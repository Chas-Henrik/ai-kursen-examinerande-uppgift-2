import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib';
import Session from "@/models/Session";
import Document from "@/models/Document";
import Question from "@/models/Question";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";
import { toLowercaseAlphanumeric } from "@/lib/utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
  }

  try {
    const session = await Session.findById(id);

    if (!session) {
      return NextResponse.json({ ok: false, message: "Session not found" }, { status: 404 });
    }

    // Delete Pinecone index
    const indexName = toLowercaseAlphanumeric(userId);
    if (session.pineconeNameSpace) {
      // Count other sessions referencing the same Pinecone namespace
      const count = await Session.countDocuments({
        pineconeNameSpace: session.pineconeNameSpace,
        _id: { $ne: session._id }, // exclude current session
      });

      if (count === 0) {
        // No other sessions reference this Pinecone index → safe to delete
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        await pinecone.index(indexName).namespace(session.pineconeNameSpace).deleteAll();
        console.log(`Deleted Pinecone namespace: ${session.pineconeNameSpace}`);
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

    return NextResponse.json({ ok: true, message: "Session deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting session:", error.message);
      return NextResponse.json({ ok: false, message: "Error deleting session.", error: error.message }, { status: 500 });
    }
    console.error("Error deleting session:", error);
    return NextResponse.json({ ok: false, message:"Failed to delete session." }, { status: 500 });
  }
}
