"use client";

import { useState, useEffect } from "react";
import StudySession from "./StudySession";

interface Document {
  id: string;
  filename: string;
  fileType: string;
  uploadDate: string;
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showStudySession, setShowStudySession] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/study/questions", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunde inte hämta dokument");
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ett fel uppstod vid hämtning av dokument"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudySession = (documentId: string) => {
    setSelectedDocument(documentId);
    setShowStudySession(true);
  };

  const handleCloseStudySession = () => {
    setShowStudySession(false);
    setSelectedDocument(null);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return (
          <svg
            className="h-8 w-8 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "txt":
        return (
          <svg
            className="h-8 w-8 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-8 w-8 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (showStudySession && selectedDocument) {
    return (
      <StudySession
        documentId={selectedDocument}
        onClose={handleCloseStudySession}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dokumenthantering
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Välj ett dokument för att starta en studiesession med AI-genererade
          frågor.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Laddar dokument...
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
          <button
            onClick={fetchDocuments}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
          >
            Försök igen
          </button>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inga dokument hittades
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Du har inte laddat upp några dokument än. Ladda upp ett dokument för
            att börja studera.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Uppdatera sidan
          </button>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 truncate">
                    {document.filename}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p className="mb-1">
                      <span className="font-medium">Typ:</span>{" "}
                      {document.fileType.toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">Uppladdad:</span>{" "}
                      {formatDate(document.uploadDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartStudySession(document.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Starta studiesession
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {!loading && !error && documents.length > 0 && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Statistik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {documents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uppladdade dokument
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {documents.filter((d) => d.fileType === "pdf").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                PDF-dokument
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {documents.filter((d) => d.fileType === "txt").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Textfiler
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
