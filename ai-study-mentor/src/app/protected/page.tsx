'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

interface Session {
  _id: string;
  documentId: string;
  documentName: string;
  chatHistory: Message[];
  text: string;
}

export default function ProtectedPage() {
  const [extractedText, setExtractedText] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    const response = await fetch('/api/sessions');
    const data = await response.json();
    setSessions(data.sessions);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setExtractedText(data.text);
    setDocumentId(data.documentId);
    setSessionId(data.sessionId);
    setMessages([]);
    setSelectedSessionId(data.sessionId);
    setIsLoading(false);
    fetchSessions();
  };

  const handleLinkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setExtractedText(data.text);
    setDocumentId(data.documentId);
    setSessionId(data.sessionId);
    setMessages([]);
    setSelectedSessionId(data.sessionId);
    setIsLoading(false);
    fetchSessions();
  };

  const handleQuerySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessages(prev => [...prev, { text: query, isUser: true }]);
    setQuery('');
    setIsLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, documentId, sessionId }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let botMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      botMessage += decoder.decode(value);
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage.isUser) {
          return [...prev.slice(0, -1), { text: botMessage, isUser: false }];
        } else {
          return [...prev, { text: botMessage, isUser: false }];
        }
      });
    }
    setIsLoading(false);
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });
    const data = await response.json();
    setQuestions(data.questions);
    setIsLoading(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchSessions();
      setExtractedText('');
      setMessages([]);
      setDocumentId('');
      setSessionId('');
      setSelectedSessionId('');
    }
  };

  const handleSessionClick = async (session: Session) => {
    await fetchSessions(); // Refresh sessions to get the latest data
    setDocumentId(session.documentId);
    setSessionId(session._id);
    setMessages(session.chatHistory);
    setExtractedText(session.text);
    setSelectedSessionId(session._id);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/4 bg-background p-4 overflow-y-auto shadow-md border-r border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Historik</h2>
        <ul className="space-y-2">
          {sessions.map(session => (
            <li key={session._id} className={`flex justify-between items-center cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 ${session._id === selectedSessionId ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
              <span onClick={() => handleSessionClick(session)} className="flex-grow">{session.documentName}</span>
              <button onClick={() => handleDeleteSession(session._id)} className="text-foreground hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer p-1 rounded-md">X</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 overflow-y-auto flex flex-col">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-foreground">AI Study Mentor</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  name="file"
                  className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-300 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
                >
                  {isLoading ? 'Laddar...' : 'Ladda upp'}
                </button>
              </form>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Klistra in länk</h2>
              <form onSubmit={handleLinkSubmit}>
                <input
                  type="text"
                  name="link"
                  placeholder="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 bg-background dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
                >
                  {isLoading ? 'Laddar...' : 'Ladda upp'}
                </button>
              </form>
            </div>
          </div>
          {extractedText && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Extraherad text</h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md max-h-60 overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300">{extractedText}</p>
              </div>
            </div>
          )}
          {documentId && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-sm flex-grow flex flex-col border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Chatt</h2>
              <div ref={chatContainerRef} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md h-96 overflow-y-auto flex-grow scroll-smooth">
                {messages.map((message, index) => (
                  <div key={index} className={`flex mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg shadow-md ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleQuerySubmit} className="mt-4 flex">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ställ en fråga..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 bg-background dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
                <button type="submit" disabled={isLoading} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400">Skicka</button>
              </form>
              <button onClick={handleGenerateQuestions} disabled={isLoading} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400">Generera studiefrågor</button>
            </div>
          )}
          {questions.length > 0 && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Studiefrågor</h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {questions.map((question, index) => (
                    <div key={index}>{question}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
