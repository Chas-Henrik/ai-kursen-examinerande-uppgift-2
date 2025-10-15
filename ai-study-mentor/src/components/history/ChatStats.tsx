"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface ChatStats {
  totalMessages: number;
  totalSessions: number;
  documentsUploaded: number;
  studySessionsCompleted: number;
  averageMessagesPerSession: number;
  mostActiveDay: string;
  mostActiveHour: number;
  weeklyActivity: Array<{
    date: string;
    messages: number;
  }>;
  monthlyStats: Array<{
    month: string;
    messages: number;
    sessions: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
  }>;
}

interface ChatStatsProps {
  userId: string;
}

export default function ChatStats({ userId }: ChatStatsProps) {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/stats/chat?range=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          console.error("Kunde inte hämta statistik");
        }
      } catch (error) {
        console.error("Fel vid hämtning av statistik:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId, timeRange]);

  const StatCard = ({
    title,
    value,
    icon,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    icon: string;
    color?: "blue" | "green" | "purple" | "orange";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange:
        "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {title}
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  const ActivityChart = ({
    data,
  }: {
    data: Array<{ date: string; messages: number }>;
  }) => {
    const maxMessages = Math.max(...data.map((d) => d.messages));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Aktivitet senaste veckan
        </h3>
        <div className="flex items-end space-x-2 h-32">
          {data.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-500"
                style={{
                  height: `${
                    maxMessages > 0 ? (day.messages / maxMessages) * 80 : 0
                  }%`,
                  minHeight: "4px",
                }}
                title={`${day.messages} meddelanden`}
              ></div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                {format(new Date(day.date), "EEE", { locale: sv })}
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {day.messages}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TopicsChart = ({
    topics,
  }: {
    topics: Array<{ topic: string; count: number }>;
  }) => {
    const maxCount = Math.max(...topics.map((t) => t.count));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Populäraste ämnena
        </h3>
        <div className="space-y-3">
          {topics.slice(0, 5).map((topic, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
                {topic.topic}
              </div>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        maxCount > 0 ? (topic.count / maxCount) * 100 : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-8 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                {topic.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">📊</div>
        <div className="text-gray-600 dark:text-gray-400">
          Kunde inte ladda statistik
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Tidsintervall val */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Chat-statistik
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["week", "month", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {range === "week"
                ? "Vecka"
                : range === "month"
                ? "Månad"
                : "Allt"}
            </button>
          ))}
        </div>
      </div>

      {/* Huvudstatistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totalt meddelanden"
          value={stats.totalMessages.toLocaleString("sv-SE")}
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Konversationer"
          value={stats.totalSessions.toLocaleString("sv-SE")}
          icon="💭"
          color="green"
        />
        <StatCard
          title="Uppladdade dokument"
          value={stats.documentsUploaded.toLocaleString("sv-SE")}
          icon="📄"
          color="purple"
        />
        <StatCard
          title="Studiesessioner"
          value={stats.studySessionsCompleted.toLocaleString("sv-SE")}
          icon="🎓"
          color="orange"
        />
      </div>

      {/* Detaljerad statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Snitt meddelanden/session"
          value={stats.averageMessagesPerSession.toFixed(1)}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Mest aktiv dag"
          value={stats.mostActiveDay}
          icon="📅"
          color="green"
        />
        <StatCard
          title="Mest aktiv tid"
          value={`${stats.mostActiveHour}:00`}
          icon="🕐"
          color="purple"
        />
      </div>

      {/* Grafer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.weeklyActivity && <ActivityChart data={stats.weeklyActivity} />}
        {stats.topTopics && stats.topTopics.length > 0 && (
          <TopicsChart topics={stats.topTopics} />
        )}
      </div>

      {/* Månadsstatistik */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Månadsöversikt
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">
                    Månad
                  </th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">
                    Meddelanden
                  </th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">
                    Sessioner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.monthlyStats.map((month, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 text-gray-900 dark:text-gray-100">
                      {month.month}
                    </td>
                    <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                      {month.messages.toLocaleString("sv-SE")}
                    </td>
                    <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                      {month.sessions.toLocaleString("sv-SE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
