"use client";

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthControls } from "@/components/auth-controls";
import { useAuth } from "@/hooks/useAuth";

type AppLayoutProps = {
  children: ReactNode;
};

const mockHistory = [
  {
    id: "1",
    title: "Introduktion till hållbar utveckling",
    subtitle: "Senaste aktiviteten för 2 dagar sedan",
  },
  {
    id: "2",
    title: "Kapitel 3 – Analysmetoder",
    subtitle: "Senaste aktiviteten igår",
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold">AI Studiementor</h1>
            <p className="text-sm text-foreground/70">
              Personlig studiecoach på svenska – håll fokus och hitta svar snabbare.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthControls />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
        <aside className="w-full rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-sm lg:w-64">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-medium">Historik</h2>
              <p className="text-xs text-foreground/60">
                {user
                  ? "Dina sparade sessioner visas här när du börjat använda tjänsten."
                  : "Logga in för att spara dokument och chattar."}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
              Snart aktiv
            </span>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {mockHistory.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-foreground/5 bg-background/60 p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-foreground/60">{item.subtitle}</p>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
