"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavbarClient } from "@/components/NavbarClient";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError("");
    const userContent = prompt;
    setPrompt("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userContent }]);

    try {
      const res = await fetch(`/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userContent }),
      });

      if (!res.body) {
        throw new Error("No stream found");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage?.role === "assistant") {
            updated[updated.length - 1].content += chunk;
          } else {
            updated.push({ role: "assistant", content: chunk });
          }

          return updated;
        });
      }
    } catch (err: any) {
      setError("Streaming error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans">
      <NavbarClient />
      <div className="items-center justify-center">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl px-4">
            <div className="w-full mx-auto px-0 h-[80vh] overflow-y-auto space-y-4 hide-scrollbar">
              {error && (
                <div className="text-red-400 bg-red-950/30 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                  {error}
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      message.role === "user"
                        ? "bg-neutral-800 text-neutral-100"
                        : "bg-neutral-900 text-neutral-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative w-full max-w-2xl mx-auto bottom-0"
            >
              <div className="relative">
                <Textarea
                  rows={1}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full resize-none min-h-[4.25rem] max-h-48 pr-20 p-4 rounded-2xl bg-dark-900 text-dark-100 placeholder:text-dark-400 border-0 focus-visible:ring-0 focus-visible:outline-none"
                />

                <Button
                  type="submit"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 px-4 text-sm text-dark-100"
                  disabled={loading}
                >
                  {loading ? "Thinking..." : "Send"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
