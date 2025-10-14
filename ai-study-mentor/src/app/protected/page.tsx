"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Spinner from "../../components/Spinner";
import SafeHtml from "../../components/SafeHtml";
import { QuestionItem } from "@/models/Question";
import { ApiResponseType } from "@/types";

// Shape of a chat message for chat history in session
interface Message {
  text: string;
  isUser: boolean;
}

// Shape of a session for session history
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
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useTheme();

  // Fetch sessions for session history
  const fetchSessions = async () => {
    const response = await fetch("/api/sessions");

    // Added check for 401 status to redirect to login
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    const data : ApiResponseType = await response.json();

    if (!data.ok) {
      console.error(`Message: ${data.message}, Error: ${data.error || "Unknown error"}`);
      alert(`${data.message}\nError: ${data.error || "Unknown error"}`);
      return;
    }
    setSessions(data.data as Session[]);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle file upload
  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsButtonsDisabled(true);
    try {

      // Prepare form data and CSRF token
      const formData = new FormData(event.currentTarget);
      const csrfToken = localStorage.getItem('csrfToken');

      // Call upload API with CSRF token in headers
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
        body: formData,
      });

      // Added check for 401 status to redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const jsonData: ApiResponseType = await response.json();
      if (!jsonData.ok) {
        console.error(`Message: ${jsonData.message}, Error: ${jsonData.error || "Unknown error"}`);
        alert(`${jsonData.message}\nError: ${jsonData.error || "Unknown error"}`);
        return;
      }
      const data = jsonData.data as { text: string; documentId: string; sessionId: string };

      // Set states with new session data
      setExtractedText(data.text);
      setDocumentId(data.documentId);
      setSessionId(data.sessionId);
      setMessages([]);
      setQuestions([]);
      setSelectedSessionId(data.sessionId);
      fetchSessions(); // Refresh session history
    } finally {
      setIsLoading(false);
      setIsButtonsDisabled(false);
    }
  };

  // Handle link upload
  const handleLinkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsButtonsDisabled(true);
    try {

      // Prepare form data and CSRF token
      const formData = new FormData(event.currentTarget);
      const csrfToken = localStorage.getItem('csrfToken');

      // Call upload API with CSRF token in headers
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
        body: formData,
      });

      // Added check for 401 status to redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const jsonData: ApiResponseType = await response.json();
      if (!jsonData.ok) {
        console.error(`Message: ${jsonData.message}, Error: ${jsonData.error || "Unknown error"}`);
        alert(`${jsonData.message}\nError: ${jsonData.error || "Unknown error"}`);
        return;
      }
      const data = jsonData.data as { text: string; documentId: string; sessionId: string };

      // Set states with new session data
      setExtractedText(data.text);
      setDocumentId(data.documentId);
      setSessionId(data.sessionId);
      setMessages([]);
      setQuestions([]);
      setSelectedSessionId(data.sessionId);
      fetchSessions(); // Refresh session history
    } finally {
      setIsLoading(false);
      setIsButtonsDisabled(false);
    }
  };

  // Handle query submission
  const handleQuerySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessages((prev) => [...prev, { text: query, isUser: true }]);
    setQuery("");
    setIsSendingQuestion(true);
    setIsButtonsDisabled(true);
    try {

      // Call chat API with CSRF token in headers
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRF-Token': csrfToken! },
        body: JSON.stringify({ query, documentId, sessionId }),
      });

      // Added check for 401 status to redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data: ApiResponseType = await response.json();
        if (!data.ok) {
          console.error(`Message: ${data.message}, Error: ${data.error || "Unknown error"}`);
          alert(`${data.message}\nError: ${data.error || "Unknown error"}`);
          return;
        }
      }

      const reader = response.body!.getReader(); // Use getReader() to handle streamed response

      // Initialize TextDecoder with default UTF-8 interpreter to decode the streamed response
      const decoder = new TextDecoder();
      let botMessage = "";

      // Loop through the stream until done is returned as true
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botMessage += decoder.decode(value); // Decode the current chunk and append to botMessage

        // Update the last message in chat with the current botMessage
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];

          // If the last message is from the bot, update it. Otherwise, add a new bot message.
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

  // Handle question generation
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setIsButtonsDisabled(true);
    try {

      // Call generate-questions API with CSRF token in headers
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRF-Token': csrfToken! },
        body: JSON.stringify({ documentId, sessionId }),
      });

      // Added check for 401 status to redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data: ApiResponseType = await response.json();
      if (!data.ok) {
        console.error(`Message: ${data.message}, Error: ${data.error || "Unknown error"}`);
        alert(`${data.message}\nError: ${data.error || "Unknown error"}`);
        return;
      }

      // Set generated questions
      setQuestions(data.data as QuestionItem[]);
    } finally {
      setIsGeneratingQuestions(false);
      setIsButtonsDisabled(false);
    }
  };

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    setIsDeletingSession(true);
    setIsButtonsDisabled(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          'X-CSRF-Token': csrfToken!,
        },
      });

      // Added check for 401 status to redirect to login
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const jsonData: ApiResponseType = await response.json();

      if (jsonData.ok) {
        fetchSessions(); // Refresh sessions after deletion

        // If the deleted session is currently selected, clear the main view
        if (sessionId === selectedSessionId) {
          setExtractedText("");
          setMessages([]);
          setDocumentId("");
          setSessionId("");
          setSelectedSessionId("");
        }
      } else {
        console.error(`Message: ${jsonData.message}, Error: ${jsonData.error || "Unknown error"}`);
        alert(`${jsonData.message}\nError: ${jsonData.error || "Unknown error"}`);
      }
    } finally {
      setIsDeletingSession(false);
      setIsButtonsDisabled(false);
    }
  };

  // Handle session selection from history
  const handleSessionClick = async (session: Session) => {
    setIsSelectingSession(true);
    setIsButtonsDisabled(true);
    try {
      await fetchSessions(); // Refresh sessions to get the latest data

      // Set states with selected session data
      setDocumentId(session.documentId);
      setSessionId(session._id);
      setMessages(session.chatHistory);
      setExtractedText(session.text);
      setSelectedSessionId(session._id);

      // Fetch questions if the session has a questionId
      if (session.questionId) {
        const response = await fetch(`/api/questions/${session.questionId}`);

        // Added check for 401 status to redirect to login
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        const jsonData: ApiResponseType = await response.json();

        if (jsonData.ok) {
          const data = jsonData.data as { questions: QuestionItem[] };
          setQuestions(data.questions); // Set questions from fetched data
        } else {
          setQuestions([]); // Clear questions if fetch failed
          console.error(`Message: ${jsonData.message}`);
          alert(`${jsonData.message}`);
        }
        
      } else {
        setQuestions([]); // No questions for this session
      }
    } finally {
      setIsSelectingSession(false);
      setIsButtonsDisabled(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/4 bg-background p-4 overflow-y-auto shadow-md border-r border-gray-200 relative">
        {/* Sidebar with session history */}
        <h2 className="text-xl font-semibold mb-4">Historik</h2>
        {(isSelectingSession || isDeletingSession) && (
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
                  <SafeHtml html={session.documentName} /> {/* Use SafeHtml component to render document name safely */}
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
            {/* Main content area */}
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
          {/* Display extracted text and chat if a document is loaded */}
          {extractedText && (
            <div className="mt-8 bg-background p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Extraherad text</h2>
              <div className="p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                <SafeHtml html={extractedText} className="text-gray-700" /> {/* Use SafeHtml component to render extracted text safely */}
              </div>
            </div>
          )}
          {/* Display chat if a document is loaded */}
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
                      <SafeHtml html={message.text} /> {/* Use SafeHtml component to render message text safely */}
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat input form */}
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
          {/* Display question generation if a document is loaded */}
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
                          <SafeHtml html={`${index + 1}. ${questionItem.question}`} /> {/* Use SafeHtml component to render question safely */}
                          <details className="ml-4 mt-1 text-blue-600">
                            <summary className="cursor-pointer">Svar</summary>
                            <SafeHtml html={questionItem.answer} /> {/* Use SafeHtml component to render answer safely */}
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
