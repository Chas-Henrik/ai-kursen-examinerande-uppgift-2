"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Spinner from "../../components/Spinner";
import SafeHtml from "../../components/SafeHtml";
import { QuestionItem } from "@/models/Question";
import { ApiResponseType } from "@/types";

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
  questionId?: string;
}

export default function ProtectedPage() {
  const [extractedText, setExtractedText] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectingSession, setIsSelectingSession] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [isButtonsDisabled, setIsButtonsDisabled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useTheme();

  const fetchSessions = async () => {
    const response = await fetch("/api/sessions");
    const data = await response.json();
    setSessions(data.sessions);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsButtonsDisabled(true);
    try {
      const formData = new FormData(event.currentTarget);
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
        body: formData,
      });
      const jsonData: ApiResponseType = await response.json();
      if (!jsonData.ok) {
        console.error(`Message: ${jsonData.message}, Error: ${jsonData.error || "Unknown error"}`);
        alert(`${jsonData.message}\nError: ${jsonData.error || "Unknown error"}`);
        return;
      }
      const data = jsonData.data as { text: string; documentId: string; sessionId: string };
      setExtractedText(data.text);
      setDocumentId(data.documentId);
      setSessionId(data.sessionId);
      setMessages([]);
      setQuestions([]);
      setSelectedSessionId(data.sessionId);
      fetchSessions();
    } finally {
      setIsLoading(false);
      setIsButtonsDisabled(false);
    }
  };

  const handleLinkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsButtonsDisabled(true);
    try {
      const formData = new FormData(event.currentTarget);
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
        body: formData,
      });
      const jsonData: ApiResponseType = await response.json();
      if (!jsonData.ok) {
        console.error(`Message: ${jsonData.message}, Error: ${jsonData.error || "Unknown error"}`);
        alert(`${jsonData.message}\nError: ${jsonData.error || "Unknown error"}`);
        return;
      }
      const data = jsonData.data as { text: string; documentId: string; sessionId: string };
      setExtractedText(data.text);
      setDocumentId(data.documentId);
      setSessionId(data.sessionId);
      setMessages([]);
      setQuestions([]);
      setSelectedSessionId(data.sessionId);
      fetchSessions();
    } finally {
      setIsLoading(false);
      setIsButtonsDisabled(false);
    }
  };

  const handleQuerySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessages((prev) => [...prev, { text: query, isUser: true }]);
    setQuery("");
    setIsSendingQuestion(true);
    setIsButtonsDisabled(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRF-Token': csrfToken! },
        body: JSON.stringify({ query, documentId, sessionId }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botMessage += decoder.decode(value);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage.isUser) {
            return [...prev.slice(0, -1), { text: botMessage, isUser: false }];
          } else {
            return [...prev, { text: botMessage, isUser: false }];
          }
        });
      }
    } finally {
      setIsSendingQuestion(false);
      setIsButtonsDisabled(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setIsButtonsDisabled(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRF-Token': csrfToken! },
        body: JSON.stringify({ documentId, sessionId }),
      });
      const data: ApiResponseType = await response.json();
      if (!data.ok) {
        console.error(`Message: ${data.message}, Error: ${data.error || "Unknown error"}`);
        alert(`${data.message}\nError: ${data.error || "Unknown error"}`);
        return;
      }
      setQuestions(data.data as QuestionItem[]);
    } finally {
      setIsGeneratingQuestions(false);
      setIsButtonsDisabled(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setIsButtonsDisabled(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
      });

      if (response.ok) {
        fetchSessions();
        setExtractedText("");
        setMessages([]);
        setDocumentId("");
        setSessionId("");
        setSelectedSessionId("");
      }
    } finally {
      setIsButtonsDisabled(false);
    }
  };

  const handleSessionClick = async (session: Session) => {
    setIsSelectingSession(true);
    setIsButtonsDisabled(true);
    try {
      await fetchSessions(); // Refresh sessions to get the latest data
      setDocumentId(session.documentId);
      setSessionId(session._id);
      setMessages(session.chatHistory);
      setExtractedText(session.text);
      setSelectedSessionId(session._id);

      if (session.questionId) {
        const response = await fetch(`/api/questions/${session.questionId}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions.questions);
        } else {
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    } finally {
      setIsSelectingSession(false);
      setIsButtonsDisabled(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/4 bg-background p-4 overflow-y-auto shadow-md border-r border-gray-200 relative">
        <h2 className="text-xl font-semibold mb-4">Historik</h2>
        {isSelectingSession && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="absolute inset-0 bg-background opacity-75"></div>
            <Spinner />
          </div>
        )}
        <ul className="space-y-2">
          {sessions &&
            sessions.map((session) => (
              <li
                key={session._id}
                className={`flex justify-between items-center cursor-pointer p-2 hover:bg-[var(--hover-bg)] rounded-md transition-colors duration-200 ${session._id === selectedSessionId ? "bg-[var(--selected-bg)]" : ""}`}
              >
                <span
                  onClick={() =>
                    !isButtonsDisabled && handleSessionClick(session)
                  }
                  className="flex-grow text-foreground"
                >
                  <SafeHtml html={session.documentName} />
                </span>
                <button
                  onClick={() => handleDeleteSession(session._id)}
                  disabled={isButtonsDisabled}
                  className="text-foreground hover:bg-gray-300  hover:text-black cursor-pointer p-1 rounded-md"
                >
                  X
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 flex flex-col">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            AI Study Mentor
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background p-6 rounded-lg shadow-md border border-gray-200 ">
              <h2 className="text-xl font-semibold mb-4">Ladda upp dokument</h2>
              <form onSubmit={handleFileSubmit}>
                <input
                  type="file"
                  name="file"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || isButtonsDisabled}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <span>Ladda upp</span> {isLoading && <Spinner />}
                  </div>
                </button>
              </form>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-md border border-gray-200 ">
              <h2 className="text-xl font-semibold mb-4">Klistra in länk</h2>
              <form onSubmit={handleLinkSubmit}>
                <input
                  type="text"
                  name="link"
                  placeholder="https://www.w3.org/W3C/E/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  className="block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 bg-background"
                />
                <button
                  type="submit"
                  disabled={isLoading || isButtonsDisabled}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <span>Ladda upp</span> {isLoading && <Spinner />}
                  </div>
                </button>
              </form>
            </div>
          </div>
          {extractedText && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Extraherad text</h2>
              <div className="p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                <SafeHtml html={extractedText} className="text-gray-700" />
              </div>
            </div>
          )}
          {documentId && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-md flex-grow flex flex-col border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Chatt</h2>
              <div
                ref={chatContainerRef}
                className="p-4 bg-gray-50 rounded-md h-96 overflow-y-auto flex-grow scroll-smooth"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow-md ${message.isUser ? "bg-blue-500 text-white" : "bg-gray-300  text-gray-800 "}`}
                    >
                      <SafeHtml html={message.text} />
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleQuerySubmit} className="mt-4 flex">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ställ en fråga..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 bg-background"
                />
                <button
                  type="submit"
                  disabled={isSendingQuestion || isButtonsDisabled}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <span>Skicka</span> {isSendingQuestion && <Spinner />}
                  </div>
                </button>
              </form>
            </div>
          )}
          {documentId && (
            <div className="my-8 bg-background p-6 rounded-lg shadow-md border border-gray-200">
              <button
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions || isButtonsDisabled}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center mx-auto"
              >
                <div className="flex items-center space-x-2">
                  <span>Generera studiefrågor</span>{" "}
                  {isGeneratingQuestions && <Spinner />}
                </div>
              </button>
              {questions?.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Studiefrågor</h2>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="list-decimal list-inside space-y-2 text-gray-700">
                      {questions?.map((questionItem, index) => (
                        <div key={index}>
                          <SafeHtml html={`${index + 1}. ${questionItem.question}`} />
                          <details className="ml-4 mt-1 text-blue-600">
                            <summary className="cursor-pointer">Svar</summary>
                            <SafeHtml html={questionItem.answer} />
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
