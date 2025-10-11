import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const sessions = await Session.aggregate([
    { $match: { userId } },
    {
      $addFields: {
        documentObjectId: { $toObjectId: "$documentId" },
      },
    },
    {
      $lookup: {
        from: "documents",
        localField: "documentObjectId",
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
        chatHistory: 1,
        createdAt: 1,
        questionId: 1,
        text: "$document.text",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return NextResponse.json({ sessions });
}
