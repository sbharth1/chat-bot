"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavbarClient } from "@/components/NavbarClient";
import { useState, useEffect } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/v1/validate", { credentials: "include" });
        setIsAuthenticated(res.ok);
        if (res.ok) {
          const data = await res.json();
          console.log("User:", data.data.user);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const loadChats = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/v1/chats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setChats(data.data.chats);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  };

  const createChat = async (title: string) => {
    try {
      const res = await fetch("/api/v1/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentChatId(data.data.chat.id);
        return data.data.chat.id;
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
    return null;
  };

  const saveMessage = async (chatId: number, content: string, role: string) => {
    try {
      await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chatId, content, role }),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    setError("");
    const userContent = prompt;
    setPrompt("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
      { role: "assistant", content: "" },
    ]);

    if (isAuthenticated) {
      if (!currentChatId) {
        const chatId = await createChat(userContent.slice(0, 50));
        if (chatId) setCurrentChatId(chatId);
      }
      if (currentChatId) {
        await saveMessage(currentChatId, userContent, "user");
      }
    }

    try {
      const res = await fetch(`/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userContent }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          setError(`Error: ${data?.error?.message || res.statusText}`);
        } catch {
          setError(`Request failed with status ${res.status}`);
        }
        return;
      }

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

      if (isAuthenticated && currentChatId) {
        await saveMessage(currentChatId, assistantMessage, "assistant");
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
            {/* {isAuthenticated && (
              <div className="mb-4">
                <Button onClick={loadChats} variant="outline" size="sm">
                  Load Chat History
                </Button>
                {chats.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {chats.map((chat) => (
                      <div key={chat.id} className="text-sm text-gray-400 p-2 bg-gray-800 rounded">
                        {chat.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )} */}

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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed mb-3 ${
                      message.role === "user"
                        ? "bg-neutral-800 text-neutral-100"
                        : message.content === ""
                        ? "bg-none font-extrabold"
                        : "bg-neutral-900 text-neutral-100"
                    }`}
                  >
                    {message.role === "assistant" &&
                    message.content === "" &&
                    loading ? (
                      <div>...</div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="relative w-full max-w-2xl mx-auto"
            >
              <div className="relative">
                <Textarea
                  rows={1}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !loading) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Send a message..."
                  className="w-full resize-none min-h-[4.25rem] max-h-48 pr-20 p-4 rounded-2xl bg-dark text-dark-100 placeholder:text-dark-400 border-0 focus-visible:ring-0 focus-visible:outline-none"
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
