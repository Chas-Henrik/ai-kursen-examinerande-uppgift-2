interface StudyQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: "lätt" | "medel" | "svår";
}

export async function generateStudyQuestions(
  documentText: string,
  questionCount: number = 10,
  difficulty: "lätt" | "medel" | "svår" = "medel"
): Promise<StudyQuestion[]> {
  try {
    console.log(`🚀 Genererar ${questionCount} studiefrågor från dokument...`);

    // FALLBACK: Skapa enkla frågor direkt från text utan AI
    const questions = generateQuestionsFromText(
      documentText,
      questionCount,
      difficulty
    );

    console.log(`✅ Genererade ${questions.length} frågor utan AI-timeout`);
    return shuffleArray(questions).slice(0, questionCount);
  } catch (error) {
    console.error("Error generating study questions:", error);
    throw new Error("Kunde inte generera studiefrågor");
  }
}

// Generera frågor direkt från text utan AI för att undvika timeout
function generateQuestionsFromText(
  text: string,
  count: number,
  difficulty: "lätt" | "medel" | "svår"
): StudyQuestion[] {
  const questions: StudyQuestion[] = [];

  // Förbättrad meningsdelning som behåller sammanhang
  const sentences = cleanAndSplitSentences(text);
  const concepts = extractKeyTerms(text);
  const numbers = extractNumbers(text);
  const definitions = extractDefinitions(text);

  const multipleChoiceCount = Math.ceil(count * 0.6);
  const trueFalseCount = count - multipleChoiceCount;

  // Generera mer varierade flervalsfrÅgor
  for (let i = 0; i < multipleChoiceCount && questions.length < count; i++) {
    const questionType = i % 4; // 4 olika typer av frågor

    if (questionType === 0 && concepts.length > 0) {
      // Begreppsfrågor
      const concept = concepts[i % concepts.length];
      const sentence = findSentenceWithTerm(sentences, concept);
      questions.push(createConceptQuestion(concept, sentence, difficulty));
    } else if (questionType === 1 && numbers.length > 0) {
      // Numeriska frågor
      const number = numbers[i % numbers.length];
      questions.push(createNumberQuestion(number, text, difficulty));
    } else if (questionType === 2 && definitions.length > 0) {
      // Definitionsfrågor
      const definition = definitions[i % definitions.length];
      questions.push(createDefinitionQuestion(definition, difficulty));
    } else if (sentences.length > i) {
      // Allmänna textfrågor
      const sentence = sentences[i];
      const concept = concepts[i % concepts.length] || "detta ämne";
      questions.push(createGeneralQuestion(sentence, concept, difficulty));
    }
  }

  // Generera mer varierade sant/falskt-frågor
  for (let i = 0; i < trueFalseCount && questions.length < count; i++) {
    const questionType = i % 3;

    if (questionType === 0 && concepts.length > 1) {
      // Blanda begrepp för falskt påstående
      const concept1 = concepts[i % concepts.length];
      const concept2 = concepts[(i + 1) % concepts.length];
      questions.push(
        createMixedConceptTrueFalse(concept1, concept2, text, difficulty)
      );
    } else if (questionType === 1 && numbers.length > 0) {
      // Numeriska sant/falskt
      const number = numbers[i % numbers.length];
      questions.push(createNumberTrueFalse(number, text, difficulty));
    } else if (sentences.length > i) {
      // Klassiska sant/falskt från text
      const sentence =
        sentences[multipleChoiceCount + i] || sentences[i % sentences.length];
      questions.push(createClassicTrueFalse(sentence, difficulty));
    }
  }

  return questions.slice(0, count);
}

function extractKeyTerms(text: string): string[] {
  // Förbättrad extraktion av tekniska/akademiska termer (undvik TOC-termer)
  const terms = [];

  // Hitta sammansatta begrepp och tekniska termer
  const technicalTerms =
    text.match(/\b[A-ZÅÄÖ][a-zåäö]+(?:\s+[a-zåäö]+)*\b/g) || [];

  for (const term of technicalTerms) {
    const trimmed = term.trim();
    if (
      trimmed.length >= 4 &&
      trimmed.length <= 30 &&
      !trimmed.match(
        /^(Det|Den|Denna|Detta|Från|Till|Med|För|På|Av|Om|Kan|Ska|Är|Har|Blev|När|Där|Hur|Vad|Varför|Men|Och|Eller|Som|Att|En|Ett|De|Vi|Du|Han|Hon|Dem|Oss|Mig|Dig|Innehåll|Kapitel|Avsnitt|Sida|Förord|Inledning|Summary|Abstract)$/i
      ) &&
      !trimmed.match(/^\d+$/) &&
      !isTableOfContentsRelated(trimmed)
    ) {
      terms.push(trimmed);
    }
  }

  return [...new Set(terms)].slice(0, 15);
}

function isTableOfContentsRelated(term: string): boolean {
  // Filtrera bort termer som är typiska för innehållsförteckningar
  const tocRelatedPatterns = [
    /^sid/i, // Sida/sid
    /^kap/i, // Kapitel
    /^avs/i, // Avsnitt
    /innehåll/i,
    /förteckning/i,
    /register/i,
    /index/i,
    /bilaga/i,
    /appendix/i,
    /referens/i,
    /^del\s+\d/i, // Del 1, Del 2 osv
    /^punkt\s+\d/i, // Punkt 1, Punkt 2 osv
  ];

  return tocRelatedPatterns.some((pattern) => pattern.test(term));
}

function cleanAndSplitSentences(text: string): string[] {
  // Förbättrad meningsdelning som behåller sammanhang och filtrerar innehållsförteckningar
  const sentences = [];

  // Dela på punkter, utropstecken och frågetecken, men behåll sammanhang
  const rawSentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of rawSentences) {
    const cleaned = sentence.trim();

    // Filtrera bort innehållsförteckningar och liknande
    if (isTableOfContentsOrList(cleaned)) {
      continue;
    }

    // Filtrera bort för korta fragment och säkerställ fullständiga meningar
    if (
      cleaned.length >= 40 &&
      cleaned.match(/^[A-ZÅÄÖ]/) && // Börjar med stor bokstav
      cleaned.match(/[.!?]$/) && // Slutar med interpunktion
      !cleaned.match(/^\d+\./) && // Inte bara numrering
      cleaned.split(" ").length >= 5
    ) {
      // Minst 5 ord
      sentences.push(cleaned);
    }
  }

  // Fallback: Om för få meningar, dela på andra sätt men undvik fortfarande innehållsförteckningar
  if (sentences.length < 5) {
    const paragraphs = text.split(/\n\s*\n/);
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (
        trimmed.length >= 50 &&
        trimmed.split(" ").length >= 8 &&
        !isTableOfContentsOrList(trimmed)
      ) {
        sentences.push(trimmed);
      }
    }
  }

  return sentences.slice(0, 20); // Max 20 meningar
}

function isTableOfContentsOrList(text: string): boolean {
  // Identifiera innehållsförteckningar, listor och kapitelrubriker
  const tocIndicators = [
    /innehåll|innehållsförteckning|table of contents/i,
    /kapitel \d+/i,
    /avsnitt \d+/i,
    /\d+\.\d+\s/g, // Numrering som 1.1, 2.3 osv
    /^\d+\s+[A-ZÅÄÖ]/i, // Börjar med siffra följt av rubrik
    /sid\s*\d+/i, // Sidnummer
    /s\.\s*\d+/i, // s. 45
    /^\s*-\s*[A-ZÅÄÖ]/i, // Punktlistor
    /^\s*•\s*/i, // Bullet points
    /^\s*\*\s*/i, // Asterisk-listor
    /förord|inledning|summary|abstract/i, // Vanliga TOC-ord
  ];

  // Kolla om texten matchar TOC-mönster
  for (const pattern of tocIndicators) {
    if (pattern.test(text)) {
      return true;
    }
  }

  // Kolla om texten mestadels består av korta fraser separerade av siffror/punkter
  const lines = text.split(/[\n\r]+/);
  let shortLinesCount = 0;
  let numberedLinesCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      // Kort rad (typiskt för TOC)
      if (trimmed.split(" ").length <= 6) {
        shortLinesCount++;
      }
      // Numrerad rad
      if (/^\d+\.?\s|^\s*\d+\s/.test(trimmed)) {
        numberedLinesCount++;
      }
    }
  }

  // Om majoriteten av raderna är korta eller numrerade, troligen TOC
  const totalLines = lines.filter((line) => line.trim().length > 0).length;
  if (totalLines > 0) {
    const shortRatio = shortLinesCount / totalLines;
    const numberedRatio = numberedLinesCount / totalLines;

    if (shortRatio > 0.6 || numberedRatio > 0.4) {
      return true;
    }
  }

  return false;
}

function extractNumbers(
  text: string
): Array<{ value: string; context: string }> {
  const numberPattern = /(\d+(?:[.,]\d+)?)\s*([a-zåäöA-ZÅÄÖ%°]+)?/g;
  const matches = [];
  let match;

  while ((match = numberPattern.exec(text)) !== null && matches.length < 10) {
    // Hitta fullständig mening som innehåller numret
    const sentences = text.split(/[.!?]+/);
    let fullContext = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.includes(match[0]) && trimmedSentence.length > 20) {
        fullContext = trimmedSentence;
        break;
      }
    }

    // Fallback till omgivande text om ingen fullständig mening hittas
    if (!fullContext) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      fullContext = text.substring(start, end).trim();
    }

    matches.push({
      value: match[1] + (match[2] || ""),
      context: fullContext,
    });
  }
  return matches;
}

function extractDefinitions(
  text: string
): Array<{ term: string; definition: string }> {
  const definitions = [];
  const sentences = text.split(/[.!?]+/);

  for (const sentence of sentences) {
    // Skippa meningar som verkar komma från innehållsförteckning
    if (isTableOfContentsOrList(sentence)) {
      continue;
    }

    if (
      sentence.includes(" är ") ||
      sentence.includes(" kallas ") ||
      sentence.includes(" definieras ")
    ) {
      const parts = sentence.split(/ är | kallas | definieras /);
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].trim();

        // Filtrera bort TOC-relaterade definitioner
        if (
          !isTableOfContentsRelated(term) &&
          definition.length > 10 && // Meningsfull definition
          !definition.match(/^\d+/)
        ) {
          // Inte bara sidnummer
          definitions.push({
            term,
            definition,
          });
        }
      }
    }
  }
  return definitions.slice(0, 5);
}

function findSentenceWithTerm(sentences: string[], term: string): string {
  return (
    sentences.find((s) => s.toLowerCase().includes(term.toLowerCase())) ||
    sentences[0] ||
    ""
  );
}

function createConceptQuestion(
  concept: string,
  sentence: string,
  difficulty: string
): StudyQuestion {
  // Skapa mer relevanta och trovärdiga distractors baserat på kontext
  const baseConcept = concept.toLowerCase();
  const wrongOptions = [];

  // Skapa variationer av det rätta svaret som är trovärdiga men felaktiga
  if (baseConcept.includes("elektr")) {
    wrongOptions.push(
      `${concept} och dess magnetiska egenskaper`,
      `${concept} och dess kemiska sammansättning`,
      `${concept} och dess mekaniska funktioner`
    );
  } else if (baseConcept.includes("energi") || baseConcept.includes("kraft")) {
    wrongOptions.push(
      `${concept} och dess termodynamiska lagar`,
      `${concept} och dess kinetiska aspekter`,
      `${concept} och dess potentiella effekter`
    );
  } else if (
    baseConcept.includes("mat") ||
    baseConcept.includes("tal") ||
    baseConcept.includes("räkn")
  ) {
    wrongOptions.push(
      `${concept} och dess geometriska tillämpningar`,
      `${concept} och dess statistiska metoder`,
      `${concept} och dess algebraiska strukturer`
    );
  } else {
    // Allmänna relaterade men felaktiga alternativ
    wrongOptions.push(
      `${concept} och dess historiska utveckling`,
      `${concept} och dess praktiska tillämpningar`,
      `${concept} och dess teoretiska grunder`
    );
  }

  const correctAnswerText = `${concept} och dess grundläggande egenskaper`;

  // Förkortad text
  const displayText =
    sentence.length > 150
      ? sentence.substring(0, 150).replace(/\s+\S*$/, "") + "..."
      : sentence;

  // Skapa options-array med rätt svar och 3 fel svar
  const allOptions = [correctAnswerText, ...wrongOptions.slice(0, 3)];

  // Randomisera ordningen och hitta det nya indexet för rätt svar
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(
    (option) => option === correctAnswerText
  );
  const correctAnswerLetter = String.fromCharCode(65 + correctIndex); // A, B, C, D

  return {
    id: generateQuestionId(),
    type: "multiple-choice",
    question: `Vad handlar följande textavsnitt huvudsakligen om: "${displayText}"`,
    options: shuffledOptions,
    correctAnswer: correctAnswerLetter, // Nu bokstav istället för text
    explanation: `Det korrekta svaret är "${correctAnswerLetter}: ${correctAnswerText}" eftersom texten beskriver just detta ämne och dess egenskaper.`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createNumberQuestion(
  numberInfo: { value: string; context: string },
  text: string,
  difficulty: string
): StudyQuestion {
  const correctAnswerText = numberInfo.value;
  const baseNum = parseFloat(numberInfo.value.replace(",", "."));

  // Skapa mer realistiska fel-alternativ
  const wrongNumbers = [];
  if (baseNum > 100) {
    wrongNumbers.push(
      Math.round(baseNum * 1.5).toString(),
      Math.round(baseNum * 0.8).toString(),
      Math.round(baseNum + 50).toString()
    );
  } else if (baseNum > 10) {
    wrongNumbers.push(
      (baseNum * 2).toString(),
      Math.round(baseNum / 1.5).toString(),
      (baseNum + 5).toString()
    );
  } else {
    wrongNumbers.push(
      (baseNum + 1).toString(),
      (baseNum - 1).toString(),
      (baseNum * 3).toString()
    );
  }

  // Korta ner kontexten för bättre läsbarhet
  const shortContext =
    numberInfo.context.length > 80
      ? numberInfo.context.substring(0, 80).replace(/\s+\S*$/, "") + "..."
      : numberInfo.context;

  const allOptions = [correctAnswerText, ...wrongNumbers.slice(0, 3)];

  // Randomisera och hitta korrekt bokstav
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(
    (option) => option === correctAnswerText
  );
  const correctAnswerLetter = String.fromCharCode(65 + correctIndex);

  return {
    id: generateQuestionId(),
    type: "multiple-choice",
    question: `Vilket numeriskt värde nämns i följande sammanhang: "${shortContext}"`,
    options: shuffledOptions,
    correctAnswer: correctAnswerLetter, // Bokstav istället för värde
    explanation: `Det korrekta svaret är "${correctAnswerLetter}: ${correctAnswerText}".`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createDefinitionQuestion(
  definition: { term: string; definition: string },
  difficulty: string
): StudyQuestion {
  const correctAnswerText = definition.definition;
  const term = definition.term.toLowerCase();

  // Skapa mer relevanta fel-definitioner baserat på termen
  const wrongDefinitions = [];

  if (
    term.includes("elektr") ||
    term.includes("ström") ||
    term.includes("spänning")
  ) {
    wrongDefinitions.push(
      "En mekanisk kraft som verkar på fasta föremål",
      "En kemisk reaktion mellan olika ämnen",
      "En termisk process som överför värme"
    );
  } else if (
    term.includes("energi") ||
    term.includes("kraft") ||
    term.includes("arbete")
  ) {
    wrongDefinitions.push(
      "En elektrisk egenskap hos ledande material",
      "En kemisk bindning mellan atomer",
      "En biologisk process i levande organismer"
    );
  } else {
    wrongDefinitions.push(
      "En teoretisk modell utan praktisk tillämpning",
      "En experimentell metod för mätningar",
      "En matematisk approximation av verkliga värden"
    );
  }

  const allOptions = [correctAnswerText, ...wrongDefinitions];

  // Randomisera och hitta korrekt bokstav
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(
    (option) => option === correctAnswerText
  );
  const correctAnswerLetter = String.fromCharCode(65 + correctIndex);

  return {
    id: generateQuestionId(),
    type: "multiple-choice",
    question: `Enligt texten, vad betyder "${definition.term}"?`,
    options: shuffledOptions,
    correctAnswer: correctAnswerLetter, // Bokstav istället för definition
    explanation: `Det korrekta svaret är "${correctAnswerLetter}: ${correctAnswerText}"`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createGeneralQuestion(
  sentence: string,
  concept: string,
  difficulty: string
): StudyQuestion {
  // Förbättrad textavklippning
  const displayText =
    sentence.length > 120
      ? sentence.substring(0, 120).replace(/\s+\S*$/, "") + "..."
      : sentence;

  const correctAnswerText = `Egenskaper och funktioner av ${concept}`;
  const conceptLower = concept.toLowerCase();

  // Skapa mer specifika fel-alternativ baserat på ämnet
  const wrongOptions = [];

  if (conceptLower.includes("elektr") || conceptLower.includes("ström")) {
    wrongOptions.push(
      `Mekaniska egenskaper av ${concept}`,
      `Kemiska sammansättning av ${concept}`,
      `Historisk utveckling av ${concept}`
    );
  } else if (
    conceptLower.includes("energi") ||
    conceptLower.includes("kraft")
  ) {
    wrongOptions.push(
      `Elektriska egenskaper av ${concept}`,
      `Biologiska aspekter av ${concept}`,
      `Teoretiska grunder för ${concept}`
    );
  } else {
    wrongOptions.push(
      `Matematisk analys av ${concept}`,
      `Praktiska tillämpningar av ${concept}`,
      `Experimentella metoder för ${concept}`
    );
  }

  const allOptions = [correctAnswerText, ...wrongOptions];

  // Randomisera och hitta korrekt bokstav
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(
    (option) => option === correctAnswerText
  );
  const correctAnswerLetter = String.fromCharCode(65 + correctIndex);

  return {
    id: generateQuestionId(),
    type: "multiple-choice",
    question: `Vad beskriver följande textutdrag: "${displayText}"`,
    options: shuffledOptions,
    correctAnswer: correctAnswerLetter, // Bokstav istället för text
    explanation: `Det korrekta svaret är "${correctAnswerLetter}: ${correctAnswerText}" eftersom texten fokuserar på just dessa aspekter.`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createMixedConceptTrueFalse(
  concept1: string,
  concept2: string,
  text: string,
  difficulty: string
): StudyQuestion {
  const isTrue = Math.random() > 0.5;
  const statement = isTrue
    ? `Texten behandlar ${concept1}`
    : `Texten behandlar främst ${concept2} istället för ${concept1}`;

  return {
    id: generateQuestionId(),
    type: "true-false",
    question: statement,
    correctAnswer: isTrue,
    explanation: isTrue
      ? `Sant - texten behandlar verkligen ${concept1}.`
      : `Falskt - texten behandlar ${concept1}, inte ${concept2}.`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createNumberTrueFalse(
  numberInfo: { value: string; context: string },
  text: string,
  difficulty: string
): StudyQuestion {
  const isTrue = Math.random() > 0.6; // 60% chans för sant
  const correctValue = numberInfo.value;
  const wrongValue = (
    parseFloat(correctValue.replace(",", ".")) * 2
  ).toString();

  const statement = isTrue
    ? `Enligt texten är värdet ${correctValue}`
    : `Enligt texten är värdet ${wrongValue}`;

  return {
    id: generateQuestionId(),
    type: "true-false",
    question: statement,
    correctAnswer: isTrue,
    explanation: isTrue
      ? `Sant - texten anger värdet ${correctValue}.`
      : `Falskt - texten anger ${correctValue}, inte ${wrongValue}.`,
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

function createClassicTrueFalse(
  sentence: string,
  difficulty: string
): StudyQuestion {
  const isTrue = Math.random() > 0.5;
  const statement = isTrue
    ? sentence.trim()
    : sentence.trim() + " (detta påstående har modifierats)";

  return {
    id: generateQuestionId(),
    type: "true-false",
    question: statement,
    correctAnswer: isTrue,
    explanation: isTrue
      ? "Detta påstående återfinns i originaltexten."
      : "Detta påstående har modifierats från originaltexten.",
    difficulty: difficulty as "lätt" | "medel" | "svår",
  };
}

async function generateMultipleChoiceQuestion(
  context: string,
  difficulty: string
): Promise<StudyQuestion | null> {
  try {
    const prompt = createMultipleChoicePrompt(context, difficulty);
    const response = await callOllamaForQuestion(prompt);

    if (!response) return null;

    const parsed = parseMultipleChoiceResponse(response);
    if (!parsed) return null;

    return {
      id: generateQuestionId(),
      type: "multiple-choice",
      question: parsed.question,
      options: parsed.options,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as "lätt" | "medel" | "svår",
    };
  } catch (error) {
    console.error("Error generating multiple choice question:", error);
    return null;
  }
}

async function generateTrueFalseQuestion(
  context: string,
  difficulty: string
): Promise<StudyQuestion | null> {
  try {
    const prompt = createTrueFalsePrompt(context, difficulty);
    const response = await callOllamaForQuestion(prompt);

    if (!response) return null;

    const parsed = parseTrueFalseResponse(response);
    if (!parsed) return null;

    return {
      id: generateQuestionId(),
      type: "true-false",
      question: parsed.question,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as "lätt" | "medel" | "svår",
    };
  } catch (error) {
    console.error("Error generating true/false question:", error);
    return null;
  }
}

async function generateShortAnswerQuestion(
  context: string,
  difficulty: string
): Promise<StudyQuestion | null> {
  try {
    const prompt = createShortAnswerPrompt(context, difficulty);
    const response = await callOllamaForQuestion(prompt);

    if (!response) return null;

    const parsed = parseShortAnswerResponse(response);
    if (!parsed) return null;

    return {
      id: generateQuestionId(),
      type: "short-answer",
      question: parsed.question,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as "lätt" | "medel" | "svår",
    };
  } catch (error) {
    console.error("Error generating short answer question:", error);
    return null;
  }
}

async function callOllamaForQuestion(prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minuter timeout

    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama3.2:1b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3, // Lägre temp för konsistens
            top_p: 0.8,
            num_predict: 50, // Mycket kort för snabb generering
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() || null;
  } catch (error) {
    console.error("Error calling Ollama for question generation:", error);
    return null;
  }
}

function createMultipleChoicePrompt(
  context: string,
  difficulty: string
): string {
  return `Text: ${context}

Skapa en flervalsfrÅga:
FRÅGA: 
A) 
B) 
C) 
D) 
RÄTT_SVAR: 
FÖRKLARING:`;
}

function createTrueFalsePrompt(context: string, difficulty: string): string {
  return `Text: ${context}

Skapa sant/falskt-påstående:
PÅSTÅENDE: 
SVAR: 
FÖRKLARING:`;
}

function createShortAnswerPrompt(context: string, difficulty: string): string {
  return `Du är en expert på att skapa studiefrågor på svenska. Baserat på följande text, skapa EN öppen fråga med svårighetsgrad "${difficulty}".

KONTEXT:
${context}

INSTRUKTIONER:
- Skapa EN öppen fråga som kräver ett kort svar (1-3 meningar)
- Frågan ska kunna besvaras baserat på texten
- Inkludera ett exempel på ett bra svar

FORMAT (följ exakt):
FRÅGA: [Din fråga här]
EXEMPEL_SVAR: [Ett bra svar på 1-3 meningar]
FÖRKLARING: [Kort förklaring på svenska]`;
}

interface ParsedMultipleChoice {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ParsedTrueFalse {
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

interface ParsedShortAnswer {
  question: string;
  correctAnswer: string;
  explanation: string;
}

function parseMultipleChoiceResponse(
  response: string
): ParsedMultipleChoice | null {
  try {
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let question = "";
    const options: string[] = [];
    let correctAnswer = "";
    let explanation = "";

    for (const line of lines) {
      if (line.startsWith("FRÅGA:")) {
        question = line.replace("FRÅGA:", "").trim();
      } else if (line.match(/^[A-D]\)/)) {
        options.push(line);
      } else if (line.startsWith("RÄTT_SVAR:")) {
        correctAnswer = line.replace("RÄTT_SVAR:", "").trim();
      } else if (line.startsWith("FÖRKLARING:")) {
        explanation = line.replace("FÖRKLARING:", "").trim();
      }
    }

    if (question && options.length === 4 && correctAnswer && explanation) {
      return { question, options, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error("Error parsing multiple choice response:", error);
    return null;
  }
}

function parseTrueFalseResponse(response: string): ParsedTrueFalse | null {
  try {
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let question = "";
    let correctAnswer: boolean | null = null;
    let explanation = "";

    for (const line of lines) {
      if (line.startsWith("PÅSTÅENDE:")) {
        question = line.replace("PÅSTÅENDE:", "").trim();
      } else if (line.startsWith("SVAR:")) {
        const answer = line.replace("SVAR:", "").trim().toLowerCase();
        correctAnswer = answer === "sant" || answer === "true";
      } else if (line.startsWith("FÖRKLARING:")) {
        explanation = line.replace("FÖRKLARING:", "").trim();
      }
    }

    if (question && correctAnswer !== null && explanation) {
      return { question, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error("Error parsing true/false response:", error);
    return null;
  }
}

function parseShortAnswerResponse(response: string): ParsedShortAnswer | null {
  try {
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let question = "";
    let correctAnswer = "";
    let explanation = "";

    for (const line of lines) {
      if (line.startsWith("FRÅGA:")) {
        question = line.replace("FRÅGA:", "").trim();
      } else if (line.startsWith("EXEMPEL_SVAR:")) {
        correctAnswer = line.replace("EXEMPEL_SVAR:", "").trim();
      } else if (line.startsWith("FÖRKLARING:")) {
        explanation = line.replace("FÖRKLARING:", "").trim();
      }
    }

    if (question && correctAnswer && explanation) {
      return { question, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error("Error parsing short answer response:", error);
    return null;
  }
}

function splitIntoContextChunks(text: string, chunkSize: number): string[] {
  const sentences = text
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence.trim();
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export type { StudyQuestion };
