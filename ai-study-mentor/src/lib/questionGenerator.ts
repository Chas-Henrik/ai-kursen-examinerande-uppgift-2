import { generateEmbedding } from '@/lib/embeddings';

interface StudyQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: 'lätt' | 'medel' | 'svår';
}

export async function generateStudyQuestions(
  documentText: string,
  questionCount: number = 10,
  difficulty: 'lätt' | 'medel' | 'svår' = 'medel'
): Promise<StudyQuestion[]> {
  try {
    // Split document into manageable chunks for question generation
    const chunks = splitIntoContextChunks(documentText, 800);
    const questions: StudyQuestion[] = [];
    
    // Calculate how many questions of each type to generate
    const multipleChoiceCount = Math.ceil(questionCount * 0.5); // 50%
    const trueFalseCount = Math.ceil(questionCount * 0.3); // 30%
    const shortAnswerCount = questionCount - multipleChoiceCount - trueFalseCount; // 20%

    // Generate multiple choice questions
    for (let i = 0; i < multipleChoiceCount && questions.length < questionCount; i++) {
      const chunk = chunks[i % chunks.length];
      const mcQuestion = await generateMultipleChoiceQuestion(chunk, difficulty);
      if (mcQuestion) questions.push(mcQuestion);
    }

    // Generate true/false questions
    for (let i = 0; i < trueFalseCount && questions.length < questionCount; i++) {
      const chunk = chunks[(i + multipleChoiceCount) % chunks.length];
      const tfQuestion = await generateTrueFalseQuestion(chunk, difficulty);
      if (tfQuestion) questions.push(tfQuestion);
    }

    // Generate short answer questions
    for (let i = 0; i < shortAnswerCount && questions.length < questionCount; i++) {
      const chunk = chunks[(i + multipleChoiceCount + trueFalseCount) % chunks.length];
      const saQuestion = await generateShortAnswerQuestion(chunk, difficulty);
      if (saQuestion) questions.push(saQuestion);
    }

    // Shuffle questions for variety
    return shuffleArray(questions).slice(0, questionCount);

  } catch (error) {
    console.error('Error generating study questions:', error);
    throw new Error('Kunde inte generera studiefrågor');
  }
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
      type: 'multiple-choice',
      question: parsed.question,
      options: parsed.options,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as 'lätt' | 'medel' | 'svår'
    };
  } catch (error) {
    console.error('Error generating multiple choice question:', error);
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
      type: 'true-false',
      question: parsed.question,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as 'lätt' | 'medel' | 'svår'
    };
  } catch (error) {
    console.error('Error generating true/false question:', error);
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
      type: 'short-answer',
      question: parsed.question,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty: difficulty as 'lätt' | 'medel' | 'svår'
    };
  } catch (error) {
    console.error('Error generating short answer question:', error);
    return null;
  }
}

async function callOllamaForQuestion(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 300
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() || null;
  } catch (error) {
    console.error('Error calling Ollama for question generation:', error);
    return null;
  }
}

function createMultipleChoicePrompt(context: string, difficulty: string): string {
  const difficultyInstructions = {
    'lätt': 'enkla och grundläggande begrepp',
    'medel': 'mer detaljerad förståelse och analys',
    'svår': 'djup analys och kritiskt tänkande'
  };

  return `Du är en expert på att skapa studiefrågor på svenska. Baserat på följande text, skapa EN flervalsfrÅga med svårighetsgrad "${difficulty}" som fokuserar på ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}.

KONTEXT:
${context}

INSTRUKTIONER:
- Skapa EN flervalsfrÅga på svenska
- Inkludera 4 svarsalternativ (A, B, C, D)
- Endast ETT alternativ ska vara korrekt
- Inkludera en kort förklaring till det rätta svaret
- Frågan ska vara relevant för texten ovan

FORMAT (följ exakt):
FRÅGA: [Din fråga här]
A) [Alternativ A]
B) [Alternativ B] 
C) [Alternativ C]
D) [Alternativ D]
RÄTT_SVAR: [A, B, C eller D]
FÖRKLARING: [Kort förklaring på svenska]`;
}

function createTrueFalsePrompt(context: string, difficulty: string): string {
  return `Du är en expert på att skapa studiefrågor på svenska. Baserat på följande text, skapa EN sant/falskt-fråga med svårighetsgrad "${difficulty}".

KONTEXT:
${context}

INSTRUKTIONER:
- Skapa EN sant/falskt-påstående på svenska
- Påståendet ska vara klart sant eller falskt baserat på texten
- Inkludera en kort förklaring

FORMAT (följ exakt):
PÅSTÅENDE: [Ditt påstående här]
SVAR: [SANT eller FALSKT]
FÖRKLARING: [Kort förklaring på svenska]`;
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

function parseMultipleChoiceResponse(response: string): any {
  try {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let question = '';
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (const line of lines) {
      if (line.startsWith('FRÅGA:')) {
        question = line.replace('FRÅGA:', '').trim();
      } else if (line.match(/^[A-D]\)/)) {
        options.push(line);
      } else if (line.startsWith('RÄTT_SVAR:')) {
        correctAnswer = line.replace('RÄTT_SVAR:', '').trim();
      } else if (line.startsWith('FÖRKLARING:')) {
        explanation = line.replace('FÖRKLARING:', '').trim();
      }
    }

    if (question && options.length === 4 && correctAnswer && explanation) {
      return { question, options, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error('Error parsing multiple choice response:', error);
    return null;
  }
}

function parseTrueFalseResponse(response: string): any {
  try {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let question = '';
    let correctAnswer: boolean | null = null;
    let explanation = '';

    for (const line of lines) {
      if (line.startsWith('PÅSTÅENDE:')) {
        question = line.replace('PÅSTÅENDE:', '').trim();
      } else if (line.startsWith('SVAR:')) {
        const answer = line.replace('SVAR:', '').trim().toLowerCase();
        correctAnswer = answer === 'sant' || answer === 'true';
      } else if (line.startsWith('FÖRKLARING:')) {
        explanation = line.replace('FÖRKLARING:', '').trim();
      }
    }

    if (question && correctAnswer !== null && explanation) {
      return { question, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error('Error parsing true/false response:', error);
    return null;
  }
}

function parseShortAnswerResponse(response: string): any {
  try {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let question = '';
    let correctAnswer = '';
    let explanation = '';

    for (const line of lines) {
      if (line.startsWith('FRÅGA:')) {
        question = line.replace('FRÅGA:', '').trim();
      } else if (line.startsWith('EXEMPEL_SVAR:')) {
        correctAnswer = line.replace('EXEMPEL_SVAR:', '').trim();
      } else if (line.startsWith('FÖRKLARING:')) {
        explanation = line.replace('FÖRKLARING:', '').trim();
      }
    }

    if (question && correctAnswer && explanation) {
      return { question, correctAnswer, explanation };
    }
    return null;
  } catch (error) {
    console.error('Error parsing short answer response:', error);
    return null;
  }
}

function splitIntoContextChunks(text: string, chunkSize: number): string[] {
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
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