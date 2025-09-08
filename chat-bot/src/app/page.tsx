"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavbarClient } from "@/components/NavbarClient";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!prompt.trim()) return;

    setResponse("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/v1/chat",
        { prompt },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success && res.data.data) {
        setResponse(res.data.data.text || "No response from AI.");
      } else {
        setError("No response from AI.");
      }
    } catch (err: any) {
      console.error("Chat error:", err);

      if (err.response?.data?.success === false && err.response?.data?.error) {
        const errorData = err.response.data.error;
        const errorCode = errorData.code;
        
        switch (errorCode) {
          case "API_KEY_MISSING":
            setError("API configuration error. Please contact support.");
            break;
          case "INVALID_API_KEY":
            setError("API authentication failed. Please contact support.");
            break;
          case "QUOTA_EXCEEDED":
            setError("API quota exceeded. Please try again later.");
            break;
          case "PROMPT_REQUIRED":
            setError("Please enter a message.");
            break;
          case "GENERATION_FAILED":
            setError("Failed to generate response. Please try again.");
            break;
          default:
            setError(errorData.message || "Something went wrong. Please try again.");
        }
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full font-sans">
      <NavbarClient />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">ChatBot</h1>
          <p className="text-muted-foreground">How can I help you today?</p>
        </div>

        <div className="w-full max-w-2xl px-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full"
            />

            <Button
              variant="outline"
              type="submit"
              className="px-6"
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send"}
            </Button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
              <strong>Error:</strong>
              <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-6 bg-muted p-4 rounded-md whitespace-pre-wrap">
              <strong>Response:</strong>
              <p>{response}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
