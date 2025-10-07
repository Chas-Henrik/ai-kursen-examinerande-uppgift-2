export default function Home() {
  return (
    <section className="flex h-full flex-col gap-6">
      <div className="rounded-xl border border-foreground/10 bg-background/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Välkommen till din studiementor</h2>
          <p className="text-sm text-foreground/65">
            Ladda upp materialet i nästa steg (kommer snart) och ställ dina frågor här nedan.
            Svaren blir korta, tydliga och alltid på svenska.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex-1 space-y-4 overflow-auto rounded-xl border border-foreground/10 bg-background/60 p-5 shadow-inner">
          <div className="flex max-w-lg flex-col gap-2 rounded-xl bg-primary/10 p-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Mentor
            </span>
            <p>
              Hej! Jag är din AI-studiementor. När du laddat upp ett dokument kan du fråga mig om innehållet och få snabba sammanfattningar.
            </p>
          </div>
          <div className="ml-auto flex max-w-lg flex-col gap-2 rounded-xl border border-primary/30 bg-primary/15 p-4 text-right text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Du
            </span>
            <p>Kan du hjälpa mig att skapa en överblick över kapitlet?</p>
          </div>
          <div className="flex max-w-lg flex-col gap-2 rounded-xl bg-primary/10 p-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Mentor
            </span>
            <p>
              Självklart! När din text är uppladdad plockar jag ut de viktigaste delarna och beskriver dem i 3–4 meningar.
            </p>
          </div>
        </div>

        <form className="space-y-3 rounded-xl border border-foreground/10 bg-background/70 p-5 shadow-sm">
          <label className="block text-sm font-medium" htmlFor="question">
            Ställ en fråga
          </label>
          <textarea
            id="question"
            name="question"
            rows={3}
            placeholder="Exempel: Vilka centrala begrepp tar texten upp?"
            className="w-full resize-none rounded-lg border border-foreground/15 bg-background/80 p-3 text-sm shadow-inner outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            disabled
          />
          <span className="block text-xs text-foreground/60">
            Fältet är låst tills dokumentuppladdning och AI-koppling är på plats i senare steg.
          </span>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="cursor-not-allowed rounded-full bg-primary/60 px-4 py-2 text-sm font-medium text-primary-foreground opacity-70"
              disabled
            >
              Skicka fråga
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
