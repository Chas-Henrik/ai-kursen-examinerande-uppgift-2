# Guide för att Använda Bäst Passande Agentmodeller

Denna guide beskriver hur du kan använda bäst passande agentmodeller för automatisk kodgenerering. Följ stegen nedan för att optimera din arbetsflöde.

## Steg 1: Förstå Modellval

- **Enkel kodgenerering**: Använd en grundläggande modell som är snabb och effektiv för små uppgifter.
- **Komplexa projekt**: Välj en avancerad modell som kan hantera fler beroenden och större kodbaser.

## Steg 2: Automatisera Modellval

Skapa ett skript som automatiskt väljer rätt modell baserat på uppgiftens komplexitet. Exempel:

```javascript
const selectModel = (taskComplexity) => {
  if (taskComplexity === "simple") {
    return "Grundläggande Modell";
  } else if (taskComplexity === "complex") {
    return "Avancerad Modell";
  }
};

console.log(selectModel("simple")); // Output: Grundläggande Modell
console.log(selectModel("complex")); // Output: Avancerad Modell
```

## Steg 3: Integrera i Arbetsflödet

- Lägg till skriptet i ditt projekt.
- Anropa funktionen `selectModel` med rätt parameter för att välja modell.

## Exempel på Användning

```javascript
const task = "Skapa en API-integration";
const complexity = task.includes("API") ? "complex" : "simple";
const model = selectModel(complexity);
console.log(`Använder: ${model}`);
```

Med dessa steg kan du enkelt välja och använda den bäst passande agentmodellen för dina behov.

<!-- @workspace Jag vill implementera en AI Study Mentor app.

Följ dessa filer som guide:
- plan.md (systeminstruktioner)
- plan-1.md (Stage 1: Foundation)
- plan-2.md (Stage 2: AI Features)

Börja med Step 1 från plan-1.md. Skapa Next.js projekt med TypeScript, Tailwind och alla dependencies enligt checklistorna.

Viktigt: All UI ska vara på svenska enligt planerna.

Iterativ implementation
Efter varje steg:
--@workspace Fortsätt med nästa steg i plan-1.md. Kontrollera att alla checkboxar från föregående steg är uppfyllda innan du går vidare.

Steg 3: Commit efter varje checkpoint
--@workspace Gör commit enligt COMMIT INSTRUCTION efter Step 1 är färdigt

💡 Tips för bästa resultat:
--Tips för bästa resultat:
Nämn alltid planfilerna - Copilot läser dem som kontext
Be om en checkpoint i taget - Gör inte hela appen på en gång
Kontrollera svenska texter - Påminn om språkkrav
Verifiera varje steg - Kör npm run dev efter viktiga ändringar

Efter Step 1 är klar:
När Copilot är färdig med Step 1, fortsätt med:
--@workspace Kontrollera att CHECKPOINT 1 kraven är uppfyllda, sedan fortsätt med Step 2 från plan-1.md-->
