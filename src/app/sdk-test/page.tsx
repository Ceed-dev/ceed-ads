"use client";

/**
 * ============================================================================
 * Ceed Ads SDK Test Page (Demo Chat Simulator)
 * ============================================================================
 *
 * This page demonstrates **how to integrate the Ceed Ads SDK** inside any
 * chat-style application.
 *
 * ----------------------------------------------------------------------------
 * 🧩 SDK Integration Overview
 * ----------------------------------------------------------------------------
 * 1. initialize(appId)
 *      - Must be called **once** on page load.
 *      - Tells the SDK which app is making ad requests.
 *
 * 2. requestAd({ conversationId, messageId, contextText })
 *      - Call this every time the user sends a message.
 *      - The backend decides whether an ad should be shown.
 *      - Returns: { ad, requestId } or { ad: null }
 *
 * 3. renderAd(ad, containerElement, requestId)
 *      - Renders the Action Card UI inside any DOM element.
 *      - The SDK automatically handles impression + click tracking.
 *
 * ----------------------------------------------------------------------------
 * 📌 This file highlights SDK usage clearly:
 *      → initialize(...)     // emphasized below
 *      → requestAd(...)      // emphasized below
 *      → renderAd(...)       // emphasized below
 * ----------------------------------------------------------------------------
 *
 * ============================================================================
 */

import { useState, useRef, useEffect } from "react";

// ============================================================================
// ⭐ SDK IMPORTS — Core entrypoints for Ceed Ads SDK
// ============================================================================
// Local SDK source (used only during development)
import { initialize, requestAd, renderAd } from "@/../sdk";

// Local dist build (used for verifying the build output)
// import { initialize, requestAd, renderAd } from "@/../sdk/dist";

// Published SDK (official import for production)
// import { initialize, requestAd, renderAd } from "@ceedhq/ads-web-sdk";

import type { Ad, ChatMessage, ChatMessageUserAi } from "@/../sdk/core/types";

// ============================================================================
// Scenarios
// ============================================================================
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

// ============================================================================
// Inline Ad Card Renderer
// ============================================================================
function InlineAdCard({ ad, requestId }: { ad: Ad; requestId: string | null }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous card (if any)
    containerRef.current.innerHTML = "";

    /**
     * ⭐ SDK CALL:
     * Renders the Action Card inside this container.
     * - Generates the DOM
     * - Attaches click handlers
     * - Triggers impression tracking automatically
     */
    renderAd(ad, containerRef.current, requestId);
  }, [ad, requestId]);

  return (
    <div className="flex justify-start my-4">
      <div ref={containerRef} />
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================
export default function SdkTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const [isThinking, setIsThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------------------
  // ⭐ SDK INITIALIZATION — Runs Once
  // ----------------------------------------------------------------------------
  useEffect(() => {
    /**
     * NOTE FOR DEVELOPERS:
     * ---------------------
     * In normal SDK integration:
     *     initialize("your-app-id")
     * is the only required setup. The SDK will automatically use the
     * built-in production `apiBaseUrl`, so developers do NOT need to
     * configure any URL manually.
     *
     * In this demo:
     * We simply call `initialize("test-app")` and let the SDK use its
     * internal production URL or any locally overridden value.
     *
     * If you want to force the SDK to use local API routes during development,
     * you can optionally provide:
     *     initialize("your-app-id", "/api")
     * which overrides the default production URL *only for testing*.
     */
    initialize("test-app");
  }, []);

  // Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scenario detection
  const detectScenario = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const entry of scenarioKeywords) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.scenario;
      }
    }
    return null;
  };

  // Push text message
  const pushMessage = (role: "user" | "ai", text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        text,
      },
    ]);
  };

  // Push ad card
  const pushAd = (ad: Ad, requestId: string | null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ad",
        ad,
        requestId,
      },
    ]);
  };

  // Replies
  const fallbackReply = () => {
    pushMessage(
      "ai",
      "I can assist with English learning, programming, or travel planning. Which one are you interested in?",
    );
  };

  const scenarioFinishedReply = () => {
    pushMessage("ai", "Thanks! Let me know if you need anything else.");
  };

  // ============================================================================
  // Main message handler
  // ============================================================================
  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    pushMessage("user", userText);
    setInput("");

    // ----------------------------------------------------------------------------
    // ⭐ REQUEST AD FROM SDK — Core integration point
    // ----------------------------------------------------------------------------
    // This function calls the Ceed Ads backend using requestAd().
    //
    // Payload explanation:
    //   - conversationId:
    //        Assign a unique ID for each chat room or thread in your app.
    //        This allows the backend to distinguish conversations and apply
    //        per-conversation cooldown logic.
    //        (Prevents ads from overflowing the UI in fast-paced chats.)
    //
    //   - messageId:
    //        Generate any unique value. This allows each message to be
    //        individually identifiable in backend logs.
    //
    //   - contextText:
    //        The actual user message. The backend uses this for keyword-based
    //        ad matching.
    //
    // Backend behavior:
    //   - The backend may return { ad, requestId } when an ad should be shown.
    //   - If no ad is appropriate (or cooldown is active), it returns { ad: null }.
    //
    // When an ad is returned, we inject it into the chat timeline via pushAd().
    const showAdAfterReply = () => {
      requestAd({
        // In a real app, use a real unique ID per chat room/thread instead of "demo-conv".
        conversationId: "demo-conv", // Unique ID per chat room/thread
        messageId: crypto.randomUUID(), // Unique ID for this message
        contextText: userText, // Used for keyword matching
      })
        .then(({ ad, requestId }) => {
          if (ad) {
            pushAd(ad, requestId ?? null);
          }
        })
        .catch((err) => console.error("Ad request error:", err));
    };

    // Scenario detection logic
    if (!currentScenario) {
      const detected = detectScenario(userText);

      if (!detected) {
        setIsThinking(true);
        const delay = Math.floor(700 + Math.random() * 600);

        setTimeout(() => {
          setIsThinking(false);
          fallbackReply();
          showAdAfterReply(); // ⭐ SDK CALL
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
        showAdAfterReply(); // ⭐ SDK CALL
      }, delay);

      return;
    }

    // Scenario finished
    const scenario = scenarioTable[currentScenario];
    if (scenarioIndex >= scenario.length) {
      setIsThinking(true);

      const delay = Math.floor(700 + Math.random() * 600);
      setTimeout(() => {
        setIsThinking(false);
        scenarioFinishedReply();
        showAdAfterReply(); // ⭐ SDK CALL
      }, delay);

      return;
    }

    // Scenario progresses
    const nextAi = scenario[scenarioIndex + 1];
    if (!nextAi) return;

    setIsThinking(true);
    const delay = Math.floor(700 + Math.random() * 600);

    setTimeout(() => {
      setIsThinking(false);
      pushMessage("ai", nextAi.text);
      setScenarioIndex((prev) => prev + 2);
      showAdAfterReply(); // ⭐ SDK CALL
    }, delay);
  };

  // ============================================================================
  // Render UI
  // ============================================================================
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

        {/* Thinking */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="px-4 py-2 max-w-[70%] text-sm text-gray-400 italic animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
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
