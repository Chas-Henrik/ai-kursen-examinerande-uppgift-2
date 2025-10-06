"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

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
      <header className="bg-gray-800 dark:bg-gray-950 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl">AI Studiementor</h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500"
        >
          Växla tema
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-700 dark:bg-gray-900 text-white p-4">
          <nav>
            <ul>
              <li>
                <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">Historik</a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4 bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
