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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="bg-gray-700 dark:bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl">AI Studiementor</h1>
        <div className="flex items-center space-x-4">
          <Link href="/login" passHref>
            <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">
              Logga in
            </button>
          </Link>
          <Link href="/register" passHref>
            <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">
              Registrera ny användare
            </button>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login'; // Redirect to login page after logout
            }}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
          >
            Logga ut
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
          >
            Växla tema
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4 bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
