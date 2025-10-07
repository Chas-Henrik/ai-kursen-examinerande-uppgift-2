"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const initialFormState = {
  name: "",
  email: "",
  password: "",
};

type Mode = "login" | "register" | null;

export function AuthControls() {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstName = user?.name?.split(" ")[0] || user?.name || "vän";
  const headline = useMemo(() => {
    if (mode === "register") {
      return "Registrera ny användare";
    }
    if (mode === "login") {
      return "Logga in";
    }
    return "";
  }, [mode]);

  function resetState() {
    setMode(null);
    setForm(initialFormState);
    setError(null);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        ...(mode === "register" ? { name: form.name.trim() } : {}),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Något gick fel. Försök igen.");
        return;
      }

      setUser(data.user ?? null);
      resetState();
    } catch (err) {
      console.error("Auth request failed", err);
      setError("Kunde inte genomföra åtgärden. Kontrollera uppkopplingen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        alert("Utloggning misslyckades. Försök igen.");
        return;
      }
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
      alert("Kunde inte logga ut just nu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm text-foreground/70">
            Hej, {firstName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            disabled={loading}
          >
            Logga ut
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Logga in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Registrera
          </button>
        </>
      )}

      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{headline}</h3>
                <p className="text-sm text-foreground/70">
                  {mode === "register"
                    ? "Skapa ett konto för att spara dina sessioner och dokument."
                    : "Logga in med din e-post och ditt lösenord."}
                </p>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="rounded-full border border-foreground/10 px-3 py-1 text-sm hover:border-primary hover:text-primary"
                aria-label="Stäng"
              >
                Stäng
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="name">
                    Namn
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-lg border border-foreground/15 bg-background/80 p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Exempel: Sara Svensson"
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="email">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-lg border border-foreground/15 bg-background/80 p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="din@epost.se"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="password">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-lg border border-foreground/15 bg-background/80 p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Minst 8 tecken"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-300 bg-red-200/40 px-3 py-2 text-sm text-red-900">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Bearbetar..." : mode === "register" ? "Skapa konto" : "Logga in"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
