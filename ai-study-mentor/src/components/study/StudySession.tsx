'use client';

import { useState, useEffect } from 'react';
import { StudyQuestion } from '@/lib/questionGenerator';

interface StudySessionProps {
  documentId: string;
  onClose: () => void;
}

export default function StudySession({ documentId, onClose }: StudySessionProps) {
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'lätt' | 'medel' | 'svår'>('medel');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [documentId]);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/study/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          documentId,
          questionCount: 10,
          difficulty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera frågor');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setShowExplanation(false);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) correct++;
      } else if (question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) correct++;
      } else if (question.type === 'short-answer') {
        // For short answer, we'll be lenient and count it as correct if answered
        if (userAnswer && userAnswer.trim().length > 0) correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const restartSession = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setShowExplanation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Genererar studiefrågor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="font-semibold">Ett fel uppstod</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateQuestions}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2"
        >
          Försök igen
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Stäng
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Inga frågor kunde genereras från detta dokument.</p>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Stäng
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Studiesession slutförd!
          </h2>
          <div className="text-6xl font-bold mb-4">
            <span className={score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
              {score}%
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Du besvarade {questions.filter(q => userAnswers[q.id]).length} av {questions.length} frågor
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = question.type === 'multiple-choice' || question.type === 'true-false'
              ? userAnswer === question.correctAnswer
              : !!userAnswer; // For short answers, just check if answered

            return (
              <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      {index + 1}. {question.question}
                    </p>
                    {userAnswer && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Ditt svar:</strong> {userAnswer.toString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Rätt svar:</strong> {question.correctAnswer.toString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={restartSession}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Börja om
          </button>
          <button
            onClick={generateQuestions}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Nya frågor
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Stäng
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Studiesession
          </h2>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'lätt' | 'medel' | 'svår')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="lätt">Lätt</option>
            <option value="medel">Medel</option>
            <option value="svår">Svår</option>
          </select>
          <button
            onClick={generateQuestions}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Nya frågor
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Fråga {currentQuestionIndex + 1} av {questions.length}</span>
          <span className="capitalize">{currentQuestion.difficulty}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {currentQuestion.question}
        </h3>

        {/* Multiple Choice */}
        {currentQuestion.type === 'multiple-choice' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={letter}
                    checked={userAnswer === letter}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {currentQuestion.type === 'true-false' && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value="true"
                checked={userAnswer === true}
                onChange={() => handleAnswer(currentQuestion.id, true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900 dark:text-white">Sant</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value="false"
                checked={userAnswer === false}
                onChange={() => handleAnswer(currentQuestion.id, false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900 dark:text-white">Falskt</span>
            </label>
          </div>
        )}

        {/* Short Answer */}
        {currentQuestion.type === 'short-answer' && (
          <textarea
            value={userAnswer || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder="Skriv ditt svar här..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Förklaring:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Föregående
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showExplanation ? 'Dölj förklaring' : 'Visa förklaring'}
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!userAnswer && userAnswer !== false} // Allow false as valid answer
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Slutför' : 'Nästa →'}
          </button>
        </div>
      </div>
    </div>
  );
}