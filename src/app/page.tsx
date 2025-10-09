"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setUrl(""); // Clear URL if file is selected
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setFile(null); // Clear file if URL is entered
  };

  const handleUpload = async () => {
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else if (url) {
      formData.append("url", url);
    } else {
      setMessage("Vänligen ladda upp en fil eller klistra in en länk.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Text extraherad: ${data.extractedText.substring(0, 200)}...`);
        // Further processing for embeddings and chat will go here
      } else {
        setMessage(`Fel vid uppladdning: ${data.message || res.statusText}`);
      }
    } catch (error: any) {
      setMessage(`Ett oväntat fel uppstod: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">
        {/* Chat messages will go here */}
        {message && <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">{message}</div>}
      </div>
      <div className="p-4 border-t flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="flex-1 p-2 border rounded-md"
            accept=".pdf,.txt"
          />
          <span className="flex items-center">ELLER</span>
          <input
            type="text"
            placeholder="Klistra in länk här..."
            value={url}
            onChange={handleUrlChange}
            className="flex-1 p-2 border rounded-md"
          />
        </div>
        <Button onClick={handleUpload} disabled={loading || (!file && !url)}>
          {loading ? "Laddar upp..." : "Ladda upp material"}
        </Button>
        <input
          type="text"
          placeholder="Skriv ditt meddelande..."
          className="w-full p-2 border rounded-md"
        />
      </div>
    </div>
  );
}
