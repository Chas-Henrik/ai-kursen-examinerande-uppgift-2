import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatSession } from "@/models/ChatSession";

type SessionDocument = {
  _id: { toString(): string };
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
};

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

    const {
      query,
      dateFrom,
      dateTo,
      limit = 20,
      page = 1,
    } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Sökfråga krävs" }, { status: 400 });
    }

    await connectDB();

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Record<string, unknown> = {
      userId: user.userId,
      $or: [
        { title: { $regex: query.trim(), $options: "i" } },
        { "messages.content": { $regex: query.trim(), $options: "i" } },
      ],
    };

    // Add date filters if provided
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {};
      if (dateFrom) {
        dateFilter.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.$lte = new Date(dateTo);
      }
      searchConditions.updatedAt = dateFilter;
    }

    // Search sessions
    const sessions = await ChatSession.find(searchConditions)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id title createdAt updatedAt messages")
      .exec();

    const totalResults = await ChatSession.countDocuments(searchConditions);

    // Process results to highlight matches and extract relevant messages
    const processedResults = (sessions as SessionDocument[]).map(
      (session: SessionDocument) => {
        const matchingMessages = (session.messages || [])
          .filter(
            (message: { role: string; content: string; timestamp: Date }) =>
              message.content.toLowerCase().includes(query.toLowerCase()) ||
              session.title.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3); // Show max 3 matching messages per session

        return {
          sessionId: session._id?.toString() || "",
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          totalMessages: session.messages.length,
          matchingMessages: matchingMessages.map(
            (msg: { role: string; content: string; timestamp: Date }) => ({
              role: msg.role,
              content: highlightSearchTerm(msg.content, query),
              timestamp: msg.timestamp,
            })
          ),
          titleMatch: session.title.toLowerCase().includes(query.toLowerCase()),
        };
      }
    );

    return NextResponse.json({
      success: true,
      results: processedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasMore: skip + sessions.length < totalResults,
      },
      searchQuery: query.trim(),
    });
  } catch (error) {
    console.error("Error searching chat sessions:", error);
    return NextResponse.json(
      { error: "Ett fel uppstod vid sökning i chattsessioner" },
      { status: 500 }
    );
  }
}

function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, "gi");
  const maxLength = 200;

  // Find the first occurrence
  const match = regex.exec(text);
  if (!match)
    return (
      text.substring(0, maxLength) + (text.length > maxLength ? "..." : "")
    );

  const matchIndex = match.index;
  const contextStart = Math.max(0, matchIndex - 50);
  const contextEnd = Math.min(text.length, matchIndex + searchTerm.length + 50);

  let excerpt = text.substring(contextStart, contextEnd);

  // Add ellipsis if we're not at the start/end
  if (contextStart > 0) excerpt = "..." + excerpt;
  if (contextEnd < text.length) excerpt = excerpt + "...";

  // Highlight the search term
  return excerpt.replace(regex, "<mark>$1</mark>");
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
