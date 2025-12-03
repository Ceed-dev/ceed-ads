"use client";

import { useState, useRef, useEffect } from "react";

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------*/
export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

/* ------------------------------------------------------------------
 * Page Component
 * ------------------------------------------------------------------*/
export default function SdkTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom whenever messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Temporary fake AI response (will be replaced with SDK logic later) */
  const fakeAiReply = (userMessage: string): string => {
    return `AI response for: "${userMessage}"`;
  };

  /* Sends the user's message and appends a fake AI response */
  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: input,
    };

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "ai",
      text: fakeAiReply(input),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------*/
  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-gray-200">
      {/* Chat message area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500">Chat will appear here...</p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input bar */}
      <div className="border-t border-gray-700 p-4 bg-[#0d0d0d]">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            className="flex-1 bg-gray-900 text-gray-100 px-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          <button
            onClick={handleSend}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
