"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Något gick fel.");
      }

      setSuccess(isRegister ? "Registrering lyckades! Du kan nu logga in." : "Inloggning lyckades!");
      
      if (!isRegister) {
        // Reload the page to update the auth state
        window.location.reload();
      }
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{isRegister ? "Registrera ny användare" : "Logga in"}</h2>
          <Button variant="ghost" onClick={onClose}>X</Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Namn
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-6">
            {isRegister ? "Registrera" : "Logga in"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
            setSuccess(null);
          }} className="text-sm text-primary hover:underline">
            {isRegister ? "Har du redan ett konto? Logga in" : "Har du inget konto? Registrera dig"}
          </button>
        </div>
      </div>
    </div>
  );
}
