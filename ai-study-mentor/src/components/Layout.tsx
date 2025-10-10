// ai-study-mentor/src/components/Layout.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-background text-foreground p-4 flex justify-between items-center shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <h1 className="text-3xl font-bold">AI Studiementor</h1>
        <div className="flex items-center space-x-4">
          <Link href="/login" passHref>
            <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
              Logga in
            </button>
          </Link>
          <Link href="/register" passHref>
            <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
              Registrera ny användare
            </button>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login'; // Redirect to login page after logout
            }}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Logga ut
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Växla tema
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
