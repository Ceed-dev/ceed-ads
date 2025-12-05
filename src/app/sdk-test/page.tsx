"use client";

import { useState, useRef, useEffect } from "react";
import { initialize, requestAd, renderAd } from "@/sdk";
import type { Ad, ChatMessage } from "@/sdk/core/types";

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------*/
type ChatMessageUserAi = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ChatMessageAd = {
  id: string;
  role: "ad";
  ad: Ad;
  requestId: string | null;
};

/* ------------------------------------------------------------------
 * Scenarios
 * ------------------------------------------------------------------*/
import { englishScenario, programmingScenario, travelScenario } from "./_data";

const scenarioKeywords = [
  { scenario: "english", keywords: ["communicating", "another", "language"] },
  { scenario: "programming", keywords: ["tech"] },
  { scenario: "travel", keywords: ["off", "places", "refreshing"] },
];

const scenarioTable: Record<string, ChatMessageUserAi[]> = {
  english: englishScenario,
  programming: programmingScenario,
  travel: travelScenario,
};

/* ------------------------------------------------------------------
 * Inline Ad Card
 * ------------------------------------------------------------------*/
function InlineAdCard({ ad, requestId }: { ad: Ad; requestId: string | null }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* Render SDK card into the container */
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    renderAd(ad, containerRef.current, requestId);
  }, [ad, requestId]);

  return (
    <div className="flex justify-start my-4">
      <div ref={containerRef} />
    </div>
  );
}

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

  useEffect(() => {
    // Init SDK once on page load
    initialize("test-app", "/api");
  }, []);

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------------------------
   * Detect scenario on first input
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
   * Push chat message
   * ------------------------------------------------------------------*/
  const pushMessage = (role: "user" | "ai", text: string) => {
    const msg: ChatMessageUserAi = {
      id: crypto.randomUUID(),
      role,
      text,
    };
    setMessages((prev) => [...prev, msg]);
  };

  /* ------------------------------------------------------------------
   * Push ad card into chat
   * ------------------------------------------------------------------*/
  const pushAd = (ad: Ad, requestId: string | null) => {
    const msg: ChatMessageAd = {
      id: crypto.randomUUID(),
      role: "ad",
      ad,
      requestId,
    };
    setMessages((prev) => [...prev, msg]);
  };

  /* ------------------------------------------------------------------
   * Fallback response (no scenario matched)
   * ------------------------------------------------------------------*/
  const fallbackReply = () => {
    pushMessage(
      "ai",
      "I can assist with English learning, programming, or travel planning. Which one are you interested in?",
    );
  };

  /* ------------------------------------------------------------------
   * Scenario ending response
   * ------------------------------------------------------------------*/
  const scenarioFinishedReply = () => {
    pushMessage("ai", "Thanks! Let me know if you need anything else.");
  };

  /* ------------------------------------------------------------------
   * Main send handler (with thinking animation + delay)
   * ------------------------------------------------------------------*/
  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    pushMessage("user", userText);
    setInput("");

    /* Request and enqueue ad after AI reply */
    const showAdAfterReply = () => {
      requestAd({
        conversationId: "demo-conv",
        messageId: crypto.randomUUID(),
        contextText: userText,
      })
        .then(({ ad, requestId }) => {
          if (ad) {
            pushAd(ad, requestId ?? null);
          }
        })
        .catch((err) => console.error("Ad request error:", err));
    };

    /* Scenario not chosen → detect scenario */
    if (!currentScenario) {
      const detected = detectScenario(userText);

      if (!detected) {
        setIsThinking(true);
        const delay = Math.floor(700 + Math.random() * 600);

        setTimeout(() => {
          setIsThinking(false);
          fallbackReply();
          showAdAfterReply();
        }, delay);

        return;
      }

      setCurrentScenario(detected);
      setScenarioIndex(0);

      const scenario = scenarioTable[detected];
      const firstAi = scenario[1];
      if (!firstAi) return;

      setIsThinking(true);
      const delay = Math.floor(700 + Math.random() * 600);

      setTimeout(() => {
        setIsThinking(false);
        pushMessage("ai", firstAi.text);
        setScenarioIndex(2);
        showAdAfterReply();
      }, delay);

      return;
    }

    /* Scenario active but finished */
    const scenario = scenarioTable[currentScenario];
    if (scenarioIndex >= scenario.length) {
      setIsThinking(true);

      const delay = Math.floor(700 + Math.random() * 600);
      setTimeout(() => {
        setIsThinking(false);
        scenarioFinishedReply();
        showAdAfterReply();
      }, delay);

      return;
    }

    /* Normal scenario progression */
    const nextAi = scenario[scenarioIndex + 1];
    if (!nextAi) return;

    setIsThinking(true);
    const delay = Math.floor(700 + Math.random() * 600);

    setTimeout(() => {
      setIsThinking(false);
      pushMessage("ai", nextAi.text);
      setScenarioIndex((prev) => prev + 2);
      showAdAfterReply();
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

        {messages.map((m) =>
          m.role === "ad" ? (
            <InlineAdCard key={m.id} ad={m.ad} requestId={m.requestId} />
          ) : (
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
          ),
        )}

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
