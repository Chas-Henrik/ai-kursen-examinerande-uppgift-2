"use client";

import React, { useState, useRef, useEffect } from 'react';
import FileUpload from '@/components/documents/FileUpload';
import DocumentManager from '@/components/documents/DocumentManager';

interface Source {
  id: number;
  text: string;
  score: number;
  fileName: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// Chat hook för API-anrop
function useChatAPI() {
  const sendMessage = async (message: string): Promise<{ response: string; sources?: Source[] }> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Använd httpOnly cookies
        body: JSON.stringify({ message: message }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Omdirigera till login genom att ladda om sidan
          window.location.reload();
          throw new Error('Sessionen har gått ut');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.response,
        sources: data.sources || [],
      };
    } catch (error: unknown) {
      console.error('Chat API error:', error);
      throw error;
    }
  };

  return { sendMessage };
}

export default function MainContent() {
  const [activeTab, setActiveTab] = useState<'chat' | 'study'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<{ [messageId: string]: boolean }>({});
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useChatAPI();

  // Auto-scroll till senaste meddelandet
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Välkomstmeddelande när komponenten laddas
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: 'Hej! Jag är din AI-studieassistent. Ladda upp dokument och ställ frågor om innehållet så hjälper jag dig att förstå materialet bättre. Vad kan jag hjälpa dig med idag?',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.content);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Ursäkta, något gick fel när jag försökte svara på din fråga. Försök igen eller kontakta support om problemet kvarstår.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSources = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleUploadSuccess = (document: UploadedDocument) => {
    setUploadSuccess(`Dokument "${document.fileName}" har laddats upp och bearbetats!`);
    setUploadError(null);
    // Dölj meddelandet efter 5 sekunder
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
    // Dölj meddelandet efter 7 sekunder
    setTimeout(() => setUploadError(null), 7000);
  };

  return (
    <main className="flex-1 flex flex-col h-screen">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.879 8-1.171 0-2.292-.192-3.245-.529L3 21l1.529-4.876C4.192 15.292 4 14.171 4 13c0-4.418 4.418-8 9.879-8C18.418 4 21 7.582 21 12z" />
              </svg>
              AI Chat
            </span>
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'study'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Studiefrågor
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
        <>
          {/* Chat Message Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* File Upload Area - Endast visa om inga meddelanden ännu */}
              {messages.length <= 1 && (
                <div className="text-center py-8 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Välkommen till AI Studie Mentor
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Ladda upp dokument och ställ frågor för att få studiehjälp på svenska
                  </p>

                  {/* Upload Success/Error Messages */}
                  {uploadSuccess && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 dark:text-green-200">{uploadSuccess}</span>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 dark:text-red-200">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* File Upload Component */}
              <FileUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble */}
                  <div
                    className={`
                      px-4 py-3 rounded-2xl shadow-sm
                      ${message.type === 'user'
                        ? 'bg-blue-500 text-white ml-4'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-4'
                      }
                    `}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>

                  {/* Message metadata */}
                  <div className={`flex items-center mt-1 px-2 text-xs text-gray-500 dark:text-gray-400 ${
                    message.type === 'user' ? 'justify-end ml-4' : 'justify-start mr-4'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    
                    {/* Sources button for AI messages */}
                    {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                      <button
                        onClick={() => toggleSources(message.id)}
                        className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                      >
                        {message.sources.length} källa{message.sources.length > 1 ? 'r' : ''}
                      </button>
                    )}
                  </div>

                  {/* Sources panel */}
                  {message.type === 'ai' && message.sources && showSources[message.id] && (
                    <div className="mt-3 mr-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Källor:</h4>
                      <div className="space-y-2">
                        {message.sources.map((source) => (
                          <div key={source.id} className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                {source.fileName}
                              </span>
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                {(source.score * 100).toFixed(1)}% relevans
                              </span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded border">
                              &quot;{source.text}&quot;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ställ en fråga om dina dokument..."
                    rows={3}
                    disabled={isLoading}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium self-end disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Tänker...</span>
                    </div>
                  ) : (
                    'Skicka'
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tryck Enter för att skicka, Shift+Enter för ny rad
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Study Tab Content */
        <div className="flex-1 overflow-y-auto">
          <DocumentManager />
        </div>
      )}
    </main>
  );
}
