"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [refreshSessions, setRefreshSessions] = useState(0);

  const handleNewConversation = () => {
    setCurrentSessionId(null);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Trigger refresh of session list
    setRefreshSessions((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar
          onNewConversation={handleNewConversation}
          onSessionSelect={handleSessionSelect}
          activeSessionId={currentSessionId}
          refreshTrigger={refreshSessions}
        />
        <MainContent
          sessionId={currentSessionId}
          onSessionIdChange={setCurrentSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
