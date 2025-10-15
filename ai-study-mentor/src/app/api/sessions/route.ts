import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatSession } from "@/models/ChatSession";

type SessionDocument = {
  _id: { toString(): string };
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Array<{ content: string }>;
};

interface SessionData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage: string;
}

interface GroupedSessions {
  today: SessionData[];
  yesterday: SessionData[];
  lastWeek: SessionData[];
  older: SessionData[];
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthenticatedUser(request);
    if (!user) {
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

    // Group sessions by date
    const groupedSessions = groupSessionsByDate(sessions as SessionDocument[]);

    return NextResponse.json({
      success: true,
      sessions: groupedSessions,
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

function groupSessionsByDate(sessions: SessionDocument[]): GroupedSessions {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const grouped: GroupedSessions = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  sessions.forEach((session) => {
    const sessionDate = new Date(session.updatedAt);
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );

    const sessionData: SessionData = {
      id: session._id?.toString() || '',
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages?.length || 0,
      lastMessage:
        session.messages && session.messages.length > 0
          ? session.messages[session.messages.length - 1].content.substring(
              0,
              100
            ) + "..."
          : "Ny session",
    };

    if (sessionDay.getTime() === today.getTime()) {
      grouped.today.push(sessionData);
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(sessionData);
    } else if (sessionDate >= lastWeek) {
      grouped.lastWeek.push(sessionData);
    } else {
      grouped.older.push(sessionData);
    }
  });

  return grouped;
}
