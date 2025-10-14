import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib';
import Session from "@/models/Session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await connectDB();

  // Check for authentication token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Verify JWT token and extract userId
  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
  }

  // Aggregate sessions to include document details
  const sessions = await Session.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "documents",
        localField: "documentId",
        foreignField: "_id",
        as: "document",
      },
    },
    { $unwind: "$document" },
    {
      $project: {
        _id: 1,
        documentId: 1,
        documentName: 1,
        pineconeNameSpace: 1,
        chatHistory: 1,
        createdAt: 1,
        questionId: 1,
        text: "$document.text",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return NextResponse.json({ ok: true, data: sessions });
}
