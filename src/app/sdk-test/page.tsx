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
 * Scenario imports
 * ------------------------------------------------------------------*/
import { englishScenario, programmingScenario, travelScenario } from "./_data";

/* ------------------------------------------------------------------
 * Scenario keyword map (simple rule-based matching)
 * ------------------------------------------------------------------*/
const scenarioKeywords = [
  { scenario: "english", keywords: ["english", "speaking", "pronunciation"] },
  { scenario: "programming", keywords: ["code", "python", "programming"] },
  { scenario: "travel", keywords: ["travel", "vacation", "hotel", "okinawa"] },
];

/* Scenario lookup table */
const scenarioTable: Record<string, ChatMessage[]> = {
  english: englishScenario,
  programming: programmingScenario,
  travel: travelScenario,
};

/* ------------------------------------------------------------------
 * Page Component
 * ------------------------------------------------------------------*/
export default function SdkTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  /* Scenario state */
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  /* AI thinking state */
  const [isThinking, setIsThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------------------------
   * 1. Detect scenario on first input
   * ------------------------------------------------------------------*/
  const detectScenario = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const entry of scenarioKeywords) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.scenario;
      }
    }
    return null;
  };

  /* ------------------------------------------------------------------
   * 2. Append a new message to the chat
   * ------------------------------------------------------------------*/
  const pushMessage = (role: "user" | "ai", text: string) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      text,
    };
    setMessages((prev) => [...prev, msg]);
  };

  /* ------------------------------------------------------------------
   * 3. Fallback response (no scenario matched)
   * ------------------------------------------------------------------*/
  const fallbackReply = () => {
    pushMessage(
      "ai",
      "I can assist with English learning, programming, or travel planning. Which one are you interested in?",
    );
  };

  /* ------------------------------------------------------------------
   * 4. Scenario ending response
   * ------------------------------------------------------------------*/
  const scenarioFinishedReply = () => {
    pushMessage("ai", "Thanks! Let me know if you need anything else.");
  };

  /* ------------------------------------------------------------------
   * 5. Main send handler (with thinking animation + delay)
   * ------------------------------------------------------------------*/
  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    pushMessage("user", userText);
    setInput("");

    /* If scenario not chosen yet → detect scenario */
    if (!currentScenario) {
      const detected = detectScenario(userText);

      if (!detected) {
        // No scenario matched → fallback AI response
        setIsThinking(true);
        const delay = Math.floor(700 + Math.random() * 600);

        setTimeout(() => {
          setIsThinking(false);
          fallbackReply();
        }, delay);

        return;
      }

      // Scenario matched
      setCurrentScenario(detected);
      setScenarioIndex(0);

      // Respond with the first AI message of the scenario (with delay)
      const scenario = scenarioTable[detected];

      setIsThinking(true);
      const delay = Math.floor(700 + Math.random() * 600);

      setTimeout(() => {
        setIsThinking(false);
        pushMessage("ai", scenario[1].text); // a1
        setScenarioIndex(2); // next AI index → scenario[3]
      }, delay);

      return;
    }

    /* If scenario is active but finished */
    const scenario = scenarioTable[currentScenario];
    if (scenarioIndex >= scenario.length) {
      setIsThinking(true);

      const delay = Math.floor(700 + Math.random() * 600);
      setTimeout(() => {
        setIsThinking(false);
        scenarioFinishedReply();
      }, delay);

      return;
    }

    /* Return next AI line in the scenario (with delay) */
    const nextAi = scenario[scenarioIndex];

    setIsThinking(true);
    const delay = Math.floor(700 + Math.random() * 600);

    setTimeout(() => {
      setIsThinking(false);
      pushMessage("ai", nextAi.text);
      setScenarioIndex((prev) => prev + 2);
    }, delay);
  };

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------*/
  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-gray-200">
      {/* Chat area */}
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

        {/* AI thinking indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="px-4 py-2 max-w-[70%] text-sm text-gray-400 italic animate-pulse">
              Thinking...
            </div>
          </div>
        )}

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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
