import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatSession } from "@/models/ChatSession";

interface SessionData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await getAuthenticatedUser(request);
    } catch {
      return NextResponse.json(
        { error: "Autentisering krävs" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: Record<string, unknown> = { userId: user.userId };

    if (search.trim()) {
      searchQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { "messages.content": { $regex: search, $options: "i" } },
      ];
    }

    // Get sessions with pagination
    const sessions = await ChatSession.find(searchQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id title createdAt updatedAt messages")
      .exec();

    const totalSessions = await ChatSession.countDocuments(searchQuery);

    // Transform sessions to expected format
    const sessionData: SessionData[] = sessions.map((session) => ({
      id: String(session._id),
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages?.length || 0,
      lastMessage:
        session.messages?.length > 0
          ? session.messages[session.messages.length - 1].content.substring(
              0,
              100
            )
          : "",
    }));

    return NextResponse.json({
      success: true,
      sessions: sessionData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasMore: skip + sessions.length < totalSessions,
      },
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Ett fel uppstod vid hämtning av chattsessioner" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Autentisering krävs" },
        { status: 401 }
      );
    }

    const { title, documentId } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Sessionstitel krävs" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new chat session
    const newSession = new ChatSession({
      userId: user.userId,
      documentId: documentId || null,
      title: title.trim(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newSession.save();

    return NextResponse.json({
      success: true,
      message: "Chattsession skapad",
      session: {
        id: newSession._id,
        title: newSession.title,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
        messageCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Ett fel uppstod vid skapande av chattsession" },
      { status: 500 }
    );
  }
}
