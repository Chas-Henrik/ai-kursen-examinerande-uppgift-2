"use client";

import { useState, useEffect } from "react";
import SessionHistory from "@/components/history/SessionHistory";

interface SidebarProps {
  onNewConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
  activeSessionId: string | null;
  refreshTrigger?: number;
}

export default function Sidebar({
  onNewConversation,
  onSessionSelect,
  activeSessionId,
  refreshTrigger,
}: SidebarProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Hämta användar-ID från localStorage eller JWT token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const handleNewConversation = () => {
    onNewConversation();
  };

  const handleSessionSelect = (sessionId: string) => {
    onSessionSelect(sessionId);
  };
  return (
    <aside className="hidden md:block w-64 h-screen bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historik
          </h2>

          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Ny Konversation
          </button>
        </div>

        {/* Session History */}
        <div className="flex-1 overflow-hidden">
          {userId ? (
            <SessionHistory
              userId={userId}
              onSessionSelect={handleSessionSelect}
              activeSessionId={activeSessionId || undefined}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Logga in för att se historik
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
