"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";

export function Header() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user session", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">AI Studiementor</h1>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>Logga ut</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowModal(true)}>
                Registrera ny användare
              </Button>
              <Button onClick={() => setShowModal(true)}>Logga in</Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
