"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="px-8 py-6 mt-4 text-left bg-background shadow-lg  rounded-lg border border-gray-200 ">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Registrera ny användare
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-foreground" htmlFor="name">
                Namn
              </label>
              <input
                type="text"
                placeholder="Ditt namn"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-background text-foreground border-gray-300 "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-foreground" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                placeholder="Din email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-background text-foreground border-gray-300 "
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-foreground" htmlFor="password">
                Lösenord
              </label>
              <input
                type="password"
                placeholder="Ditt lösenord"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-background text-foreground border-gray-300 "
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              >
                Registrera
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
