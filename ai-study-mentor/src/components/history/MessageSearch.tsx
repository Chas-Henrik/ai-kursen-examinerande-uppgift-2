"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface SearchResult {
  messageId: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
  sessionId: string;
  sessionTitle: string;
  context: Array<{
    content: string;
    role: "user" | "assistant";
    isMatch: boolean;
  }>;
  relevanceScore: number;
}

interface GroupedSearchResult {
  sessionId: string;
  sessionTitle: string;
  matches: SearchResult[];
}

interface MessageSearchProps {
  userId: string;
  onJumpToMessage?: (sessionId: string, messageId: string) => void;
}

export default function MessageSearch({
  userId,
  onJumpToMessage,
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GroupedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    fetchSuggestions();
  }, [userId]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sessions/search", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Fel vid hämtning av sökförslag:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sessions/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalMatches(data.totalMatches || 0);
      } else {
        console.error("Sökning misslyckades");
        setResults([]);
        setTotalMatches(0);
      }
    } catch (error) {
      console.error("Fel vid sökning:", error);
      setResults([]);
      setTotalMatches(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const handleJumpToMessage = (sessionId: string, messageId: string) => {
    if (onJumpToMessage) {
      onJumpToMessage(sessionId, messageId);
    }
  };

  const highlightSearchTerms = (
    text: string,
    query: string
  ): React.ReactNode => {
    if (!query) return text;

    const terms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 1);
    let highlightedText = text;

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Sökformulär */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {/* Huvudsökfält */}
          <div className="relative">
            <input
              type="text"
              placeholder="Sök i alla meddelanden..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400"
            >
              {loading ? "⏳" : "🔍"}
            </button>
          </div>

          {/* Datumfilter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Från datum
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Till datum
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sökförslag */}
          {suggestions.length > 0 && !searchQuery && (
            <div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vanliga söktermer:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sökresultat */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="p-4">
            {/* Resultatsammanfattning */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Hittade {totalMatches} resultat för &quot;{searchQuery}&quot;
            </div>

            {/* Resultat grupperade per session */}
            <div className="space-y-4">
              {results.map((sessionGroup, sessionIndex) => (
                <div
                  key={sessionIndex}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {sessionGroup.sessionTitle}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {sessionGroup.matches.length} träff
                      {sessionGroup.matches.length !== 1 ? "ar" : ""}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sessionGroup.matches.map((match, matchIndex) => (
                      <div
                        key={matchIndex}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                match.role === "user"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              }`}
                            ></span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {match.role === "user" ? "Du" : "AI"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(
                                new Date(match.createdAt),
                                "dd MMM yyyy HH:mm",
                                { locale: sv }
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleJumpToMessage(
                                match.sessionId,
                                match.messageId
                              )
                            }
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Gå till meddelande
                          </button>
                        </div>

                        <div className="text-sm text-gray-900 dark:text-gray-100 mb-3">
                          {highlightSearchTerms(match.content, searchQuery)}
                        </div>

                        {/* Kontext */}
                        {match.context.length > 1 && (
                          <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Kontext:
                            </div>
                            <div className="space-y-1">
                              {match.context.map((ctx, ctxIndex) => (
                                <div
                                  key={ctxIndex}
                                  className={`text-xs ${
                                    ctx.isMatch
                                      ? "font-medium"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {ctx.role === "user" ? "Du" : "AI"}:
                                  </span>{" "}
                                  {ctx.content}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery && !loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              🔍
            </div>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              Inga resultat hittades för &quot;{searchQuery}&quot;
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Försök med andra söktermer eller kontrollera stavningen
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              💬
            </div>
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              Sök i alla dina konversationer
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Skriv in söktermer för att hitta meddelanden
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
