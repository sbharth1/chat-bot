"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavbarClient } from "@/components/NavbarClient";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/v1/validate", { credentials: "include" });
        const isAuth = res.ok;
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const data = await res.json();
          await loadChats();
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const loadChats = async () => {
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

  const loadMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/v1/messages?chatId=${chatId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const formattedMessages = data.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));
        setMessages(formattedMessages);
        setCurrentChatId(chatId);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
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
        const newChatId = data.data.chat.id;
        setCurrentChatId(newChatId);
        await loadChats();
        return newChatId;
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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
    ]);

    let chatId = currentChatId;
    
    if (isAuthenticated) {
      if (!chatId) {
        chatId = await createChat(userContent.slice(0, 50));
        if (chatId) {
          setCurrentChatId(chatId);
        }
      }
      if (chatId) {
        await saveMessage(chatId, userContent, "user");
      }
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);

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
        setMessages((prev) => prev.slice(0, -1));
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
          }

          return updated;
        });
      }

      if (isAuthenticated && chatId) { 
        await saveMessage(chatId, assistantMessage, "assistant");
      }
    } catch (err: any) {
      setError("Streaming error: " + err.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen w-full font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed mb-3 ${
                        message.role === "user"
                          ? "bg-neutral-800 text-neutral-100"
                          : message.content === "" && loading
                          ? "bg-neutral-900 text-neutral-100 font-extrabold"
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
                <div ref={messagesEndRef} />
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
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={handleTextareaChange}
                    onKeyDown={handleTextareaKeyDown}
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

  return (
    <SidebarProvider>
    <AppSidebar chats={chats} onChatSelect={loadMessages} currentChatId={currentChatId} />
    <SidebarInset>
      <div className="relative flex flex-col h-screen">
  
        <div className="sticky top-0 z-20 bg-background border-b px-4 py-2 flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Chat</h1>
          {currentChatId && (
            <Button
              onClick={startNewChat}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              New Chat
            </Button>
          )}
        </div>
  
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-red-400 bg-red-950/30 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap mb-4">
              {error}
            </div>
          )}
  
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  message.role === "user"
                    ? "bg-neutral-800 text-neutral-100"
                    : message.content === "" && loading
                    ? "bg-neutral-900 text-neutral-100 font-extrabold"
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
          <div ref={messagesEndRef} />
          <div className="h-28" />
        </div>
  
        <div className="sticky bottom-0 z-20 bg-dark border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="relative w-full max-w-4xl mx-auto"
          >
            <div className="relative">
              <Textarea
                ref={textareaRef}
                rows={1}
                value={prompt}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
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
    </SidebarInset>
  </SidebarProvider>
  
  );
}
