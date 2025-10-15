"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Session {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage: string;
}

interface GroupedSessions {
  today: Session[];
  yesterday: Session[];
  lastWeek: Session[];
  older: Session[];
}

interface SessionHistoryProps {
  userId: string;
  onSessionSelect: (sessionId: string) => void;
  activeSessionId?: string;
  refreshTrigger?: number;
}

export default function SessionHistory({
  userId,
  onSessionSelect,
  activeSessionId,
  refreshTrigger,
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<GroupedSessions>({
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    today: true,
    yesterday: true,
    lastWeek: false,
    older: false,
  });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);

      const url = searchQuery
        ? `/api/sessions?search=${encodeURIComponent(searchQuery)}`
        : `/api/sessions`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Använd httpOnly cookies som chat API
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(groupSessionsByDate(data.sessions || []));
      } else {
        console.error("Kunde inte hämta sessioner");
      }
    } catch (error) {
      console.error("Fel vid hämtning av sessioner:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSessions();
  }, [userId, searchQuery, refreshTrigger, fetchSessions]);

  const groupSessionsByDate = (sessionList: Session[]): GroupedSessions => {
    const grouped: GroupedSessions = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    sessionList.forEach((session) => {
      const sessionDate = new Date(session.updatedAt);
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      );

      if (sessionDay.getTime() === today.getTime()) {
        grouped.today.push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(session);
      } else if (sessionDate >= lastWeek) {
        grouped.lastWeek.push(session);
      } else {
        grouped.older.push(session);
      }
    });

    return grouped;
  };

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId);
  };

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!confirm("Är du säker på att du vill ta bort denna konversation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        fetchSessions(); // Uppdatera listan
      }
    } catch (error) {
      console.error("Fel vid borttagning av session:", error);
    }
  };

  const handleExportSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/sessions/${sessionId}/export`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-${sessionId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Fel vid export av session:", error);
    }
  };

  const toggleGroup = (group: keyof GroupedSessions) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const SessionGroup = ({
    title,
    sessions: groupSessions,
    groupKey,
  }: {
    title: string;
    sessions: Session[];
    groupKey: keyof GroupedSessions;
  }) => {
    if (groupSessions.length === 0) return null;

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <span>
            {title} ({groupSessions.length})
          </span>
          <span
            className={`transform transition-transform ${
              expandedGroups[groupKey] ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        </button>

        {expandedGroups[groupKey] && (
          <div className="ml-2 space-y-1">
            {groupSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {session.messageCount} meddelanden •{" "}
                    {new Date(session.updatedAt).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {session.lastMessage && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {session.lastMessage.substring(0, 50)}...
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleExportSession(session.id, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Exportera session"
                  >
                    📄
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Ta bort session"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sökfält */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Sök i historik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Sessionslista */}
      <div className="flex-1 overflow-y-auto p-4">
        <SessionGroup title="Idag" sessions={sessions.today} groupKey="today" />
        <SessionGroup
          title="Igår"
          sessions={sessions.yesterday}
          groupKey="yesterday"
        />
        <SessionGroup
          title="Förra veckan"
          sessions={sessions.lastWeek}
          groupKey="lastWeek"
        />
        <SessionGroup
          title="Äldre"
          sessions={sessions.older}
          groupKey="older"
        />

        {/* Inga resultat */}
        {Object.values(sessions).every((group) => group.length === 0) && (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {searchQuery
                ? "Inga sessioner hittades"
                : "Inga konversationer än"}
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Rensa sökning
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
