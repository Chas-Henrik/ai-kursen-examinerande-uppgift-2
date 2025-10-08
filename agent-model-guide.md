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
