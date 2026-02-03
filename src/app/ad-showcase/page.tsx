"use client";

/**
 * ============================================================================
 * Ad Showcase Page — 4 Separate Chat Rooms for Each Ad Format
 * ============================================================================
 *
 * Each tab shows a different chat room with one ad format:
 * - action_card: CTA button opens URL in new tab
 * - lead_gen: Email form with success message after submit
 * - static: Fixed banner at bottom near input field
 * - followup: Tappable card that shows expanded content
 *
 * Purpose: For screen recording demos to showcase ad format UIs and interactions.
 */

import { useState, useEffect, useRef } from "react";
import type { ResolvedAd } from "@/../sdk/core/types";

// ============================================================================
// Design Tokens (matching SDK renderer.ts)
// ============================================================================

const COLORS = {
  background: "#141414",
  border: "rgba(255,255,255,0.12)",
  text: "#e5e5e5",
  textMuted: "rgba(255,255,255,0.55)",
  primary: "#3a82f7",
  primaryHover: "#2f6ad4",
  success: "#22c55e",
} as const;

// ============================================================================
// Types
// ============================================================================

type AdFormatTab = "action_card" | "lead_gen" | "static" | "followup";

interface ConversationMessage {
  id: string;
  role: "user" | "ai" | "ad";
  text?: string;
  ad?: ResolvedAd;
}

interface ChatRoom {
  title: string;
  subtitle: string;
  messages: ConversationMessage[];
  formatDescription: string;
  interactionHint: string;
}

// ============================================================================
// Mock Ad Data
// ============================================================================

const actionCardAd: ResolvedAd = {
  id: "demo-action-card",
  advertiserId: "adv-langlearn",
  advertiserName: "LinguaFlow",
  format: "action_card",
  title: "Learn Japanese in 3 Months",
  description:
    "Our AI-powered lessons adapt to your pace. Join 200,000+ learners who achieved conversational fluency with just 15 minutes a day.",
  ctaText: "Start Free Trial",
  ctaUrl: "https://example.com/linguaflow",
};

const leadGenAd: ResolvedAd = {
  id: "demo-lead-gen",
  advertiserId: "adv-travelnews",
  advertiserName: "Wanderlust Weekly",
  format: "lead_gen",
  title: "Hidden Gems Newsletter",
  description:
    "Discover off-the-beaten-path destinations every week. Curated travel tips from locals, exclusive deals, and inspiring stories.",
  ctaText: "Subscribe",
  ctaUrl: "https://example.com/wanderlust",
  leadGenConfig: {
    placeholder: "Enter your email address",
    submitButtonText: "Get Free Tips",
    autocompleteType: "email",
    successMessage: "Thanks! Check your inbox for this week's hidden gems.",
  },
};

const staticAd: ResolvedAd = {
  id: "demo-static",
  advertiserId: "adv-fittech",
  advertiserName: "FitTrack Pro",
  format: "static",
  title: "Smart Fitness Tracking",
  description:
    "AI-powered workout plans that evolve with you. Track progress, get personalized recommendations, and achieve your goals faster.",
  ctaText: "Download Free",
  ctaUrl: "https://example.com/fittrack",
  staticConfig: {
    displayPosition: "bottom",
    targetingParams: {
      keywords: ["fitness", "workout", "health"],
      deviceTypes: ["desktop", "mobile"],
    },
  },
};

const followupAd: ResolvedAd = {
  id: "demo-followup",
  advertiserId: "adv-cookbook",
  advertiserName: "ChefMate",
  format: "followup",
  title: "Recipe Suggestions",
  description: "Personalized recipes based on your ingredients.",
  ctaText: "Tap to explore",
  ctaUrl: "https://example.com/chefmate",
  followupConfig: {
    questionText:
      "Want personalized recipes based on ingredients you already have? See what you can make tonight.",
    tapAction: "expand",
  },
};

// ============================================================================
// Chat Room Data (4 separate conversations)
// ============================================================================

const chatRooms: Record<AdFormatTab, ChatRoom> = {
  action_card: {
    title: "Language Learning",
    subtitle: "Japanese learning conversation",
    formatDescription: "Standard CTA card with button",
    interactionHint: "Click the blue button to open the advertiser's page",
    messages: [
      {
        id: "ac-1",
        role: "user",
        text: "I want to learn Japanese. Is it difficult for English speakers?",
      },
      {
        id: "ac-2",
        role: "ai",
        text: "Japanese has unique challenges like three writing systems (hiragana, katakana, kanji) and different grammar structure. But with consistent practice, many learners reach conversational level in 6-12 months!",
      },
      {
        id: "ac-3",
        role: "user",
        text: "What's the best way to start? Apps, textbooks, or classes?",
      },
      {
        id: "ac-4",
        role: "ai",
        text: "A combination works best! Apps for daily practice and vocabulary, textbooks for grammar foundations, and conversation practice with natives. Start with hiragana — you can learn it in a week!",
      },
      {
        id: "ac-ad",
        role: "ad",
        ad: actionCardAd,
      },
      {
        id: "ac-5",
        role: "user",
        text: "That's really helpful, thanks!",
      },
      {
        id: "ac-6",
        role: "ai",
        text: "You're welcome! Consistency is key — even 15 minutes daily beats occasional long sessions. Good luck with your Japanese journey!",
      },
    ],
  },

  lead_gen: {
    title: "Travel Planning",
    subtitle: "Trip planning conversation",
    formatDescription: "Email capture form with success message",
    interactionHint: "Enter any email and click submit to see the success message",
    messages: [
      {
        id: "lg-1",
        role: "user",
        text: "I'm planning a trip to Portugal. Any recommendations for places outside Lisbon?",
      },
      {
        id: "lg-2",
        role: "ai",
        text: "Portugal has amazing hidden gems! Porto in the north has stunning architecture and port wine cellars. The Algarve coast has beautiful beaches, and Sintra has fairytale castles just 30 minutes from Lisbon.",
      },
      {
        id: "lg-3",
        role: "user",
        text: "Sintra sounds amazing! What about food recommendations?",
      },
      {
        id: "lg-4",
        role: "ai",
        text: "Portuguese cuisine is incredible! Try pastéis de nata (custard tarts), bacalhau (codfish dishes), and francesinha in Porto. For seafood, the Algarve has the freshest catches. Don't miss local markets for authentic experiences.",
      },
      {
        id: "lg-ad",
        role: "ad",
        ad: leadGenAd,
      },
      {
        id: "lg-5",
        role: "user",
        text: "Perfect! I'll definitely check out those places.",
      },
      {
        id: "lg-6",
        role: "ai",
        text: "Have a wonderful trip! Portugal is one of Europe's best-kept secrets. The people are incredibly friendly and the cost of living is reasonable compared to other Western European countries.",
      },
    ],
  },

  static: {
    title: "Fitness Goals",
    subtitle: "Workout planning conversation",
    formatDescription: "Fixed banner near input field (page load targeting)",
    interactionHint: "Static ad is fixed at the bottom — scroll to see it stays in place",
    messages: [
      {
        id: "st-1",
        role: "user",
        text: "I want to get back into shape but I don't know where to start.",
      },
      {
        id: "st-2",
        role: "ai",
        text: "Starting is the hardest part — great that you're taking the first step! The key is to begin with manageable goals. What's your current fitness level, and do you have any specific goals like weight loss, muscle building, or general health?",
      },
      {
        id: "st-3",
        role: "user",
        text: "I've been pretty sedentary for a year. I just want to feel more energetic and maybe lose some weight.",
      },
      {
        id: "st-4",
        role: "ai",
        text: "Perfect starting point! I'd recommend beginning with 20-30 minute walks daily, then gradually adding bodyweight exercises. Consistency matters more than intensity at first. Also, tracking your progress helps stay motivated!",
      },
      {
        id: "st-5",
        role: "user",
        text: "Should I focus on cardio or strength training?",
      },
      {
        id: "st-6",
        role: "ai",
        text: "Both have benefits! For energy and weight loss, start with cardio (walking, cycling). Add strength training 2-3 times per week to build muscle, which boosts metabolism. A balanced approach gives the best long-term results.",
      },
      {
        id: "st-7",
        role: "user",
        text: "What about diet? Should I count calories?",
      },
      {
        id: "st-8",
        role: "ai",
        text: "For beginners, I'd suggest focusing on eating whole foods rather than strict calorie counting. Prioritize protein, vegetables, and complex carbs. Stay hydrated and avoid processed foods. Small sustainable changes beat drastic diets every time!",
      },
    ],
  },

  followup: {
    title: "Cooking Ideas",
    subtitle: "Recipe discussion",
    formatDescription: "Tappable sponsored question card",
    interactionHint: "Tap anywhere on the card to see the expanded content",
    messages: [
      {
        id: "fu-1",
        role: "user",
        text: "I have chicken, rice, and some vegetables. What can I make for dinner?",
      },
      {
        id: "fu-2",
        role: "ai",
        text: "Great ingredients to work with! You could make a classic chicken stir-fry with rice, chicken fried rice, or a simple chicken and vegetable bowl. What vegetables do you have, and do you prefer Asian or Western flavors?",
      },
      {
        id: "fu-3",
        role: "user",
        text: "I have bell peppers, onions, and broccoli. I like both but maybe something Asian-inspired tonight.",
      },
      {
        id: "fu-4",
        role: "ai",
        text: "Perfect combo! I'd suggest a teriyaki chicken stir-fry. Slice the chicken thin, stir-fry with vegetables, add soy sauce, a bit of honey, garlic, and ginger. Serve over steamed rice. Ready in 20 minutes!",
      },
      {
        id: "fu-ad",
        role: "ad",
        ad: followupAd,
      },
      {
        id: "fu-5",
        role: "user",
        text: "That sounds delicious! Do you have the exact measurements?",
      },
      {
        id: "fu-6",
        role: "ai",
        text: "For 2 servings: 2 chicken breasts, 3 tbsp soy sauce, 1 tbsp honey, 2 cloves garlic, 1 tsp ginger. Stir-fry chicken 5 min, add veggies for 3-4 min, then sauce for 1 min. Enjoy!",
      },
    ],
  },
};

// ============================================================================
// Custom Card Renderers (Demo-friendly, no API calls)
// ============================================================================

// Shared: Create header element
function createHeader(advertiserName: string): HTMLElement {
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "14px";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "8px";

  const dot = document.createElement("div");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.background = COLORS.primary;
  dot.style.borderRadius = "50%";

  const advName = document.createElement("div");
  advName.textContent = advertiserName;
  advName.style.fontSize = "14px";
  advName.style.opacity = "0.9";

  left.appendChild(dot);
  left.appendChild(advName);

  const adLabel = document.createElement("div");
  adLabel.textContent = "Ad";
  adLabel.style.fontSize = "14px";
  adLabel.style.opacity = "0.55";

  header.appendChild(left);
  header.appendChild(adLabel);

  return header;
}

// Shared: Apply base card styles
function applyCardStyles(card: HTMLElement): void {
  card.style.border = `1px solid ${COLORS.border}`;
  card.style.padding = "20px";
  card.style.borderRadius = "12px";
  card.style.margin = "16px 0";
  card.style.background = COLORS.background;
  card.style.maxWidth = "460px";
  card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
  card.style.color = COLORS.text;
}

// Shared: Create primary button
function createPrimaryButton(text: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.width = "100%";
  button.style.padding = "14px";
  button.style.background = COLORS.primary;
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "15px";
  button.style.fontWeight = "500";
  button.style.marginTop = "6px";
  button.style.transition = "background 0.2s ease";

  button.onmouseenter = () => {
    button.style.background = COLORS.primaryHover;
  };
  button.onmouseleave = () => {
    button.style.background = COLORS.primary;
  };

  return button;
}

// Action Card Renderer
function renderActionCardDemo(ad: ResolvedAd, container: HTMLElement): void {
  const card = document.createElement("div");
  applyCardStyles(card);

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = document.createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = document.createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  const button = createPrimaryButton(ad.ctaText);
  card.appendChild(button);

  container.appendChild(card);

  // Click handler - open URL
  button.addEventListener("click", () => {
    window.open(ad.ctaUrl, "_blank");
  });
}

// Lead Gen Renderer (Demo - no API call)
function renderLeadGenDemo(ad: ResolvedAd, container: HTMLElement): void {
  const config = ad.leadGenConfig;
  if (!config) return;

  const card = document.createElement("div");
  applyCardStyles(card);

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = document.createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = document.createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  // Form container
  const form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "12px";

  // Email input
  const input = document.createElement("input");
  input.type = "email";
  input.placeholder = config.placeholder;
  input.autocomplete = config.autocompleteType;
  input.style.width = "100%";
  input.style.padding = "14px";
  input.style.background = "rgba(255,255,255,0.08)";
  input.style.border = `1px solid ${COLORS.border}`;
  input.style.borderRadius = "8px";
  input.style.color = COLORS.text;
  input.style.fontSize = "15px";
  input.style.boxSizing = "border-box";
  input.style.outline = "none";

  input.onfocus = () => {
    input.style.borderColor = COLORS.primary;
  };
  input.onblur = () => {
    input.style.borderColor = COLORS.border;
  };

  form.appendChild(input);

  // Submit button
  const submitBtn = createPrimaryButton(config.submitButtonText);
  submitBtn.type = "submit";
  form.appendChild(submitBtn);

  // Success message (hidden initially)
  const successMsg = document.createElement("div");
  successMsg.textContent = config.successMessage;
  successMsg.style.display = "none";
  successMsg.style.padding = "14px";
  successMsg.style.background = "rgba(34,197,94,0.15)";
  successMsg.style.border = `1px solid ${COLORS.success}`;
  successMsg.style.borderRadius = "8px";
  successMsg.style.color = COLORS.success;
  successMsg.style.fontSize = "14px";
  successMsg.style.textAlign = "center";

  card.appendChild(form);
  card.appendChild(successMsg);

  container.appendChild(card);

  // Submit handler - Demo version (no API call)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    // Show success immediately (demo)
    form.style.display = "none";
    successMsg.style.display = "block";
  });
}

// Static Ad Renderer (for fixed position)
function renderStaticAdDemo(ad: ResolvedAd, container: HTMLElement): void {
  const card = document.createElement("div");
  applyCardStyles(card);
  card.style.margin = "0";
  card.style.maxWidth = "100%";

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = document.createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "17px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "8px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = document.createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "13px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "14px";
  descEl.style.lineHeight = "1.4";
  card.appendChild(descEl);

  const button = createPrimaryButton(ad.ctaText);
  button.style.padding = "12px";
  button.style.fontSize = "14px";
  card.appendChild(button);

  container.appendChild(card);

  // Click handler - open URL
  button.addEventListener("click", () => {
    window.open(ad.ctaUrl, "_blank");
  });
}

// Followup Renderer with Expand
function renderFollowupDemo(
  ad: ResolvedAd,
  container: HTMLElement,
  setExpanded: (v: boolean) => void
): void {
  const config = ad.followupConfig;
  if (!config) return;

  const card = document.createElement("div");
  applyCardStyles(card);
  card.style.cursor = "pointer";
  card.style.transition = "border-color 0.2s ease";

  card.onmouseenter = () => {
    card.style.borderColor = COLORS.primary;
  };
  card.onmouseleave = () => {
    card.style.borderColor = COLORS.border;
  };

  card.appendChild(createHeader(ad.advertiserName));

  // Question text
  const questionEl = document.createElement("div");
  questionEl.textContent = config.questionText;
  questionEl.style.fontSize = "17px";
  questionEl.style.fontWeight = "500";
  questionEl.style.lineHeight = "1.4";
  questionEl.style.marginBottom = "12px";
  card.appendChild(questionEl);

  // Hint
  const hintEl = document.createElement("div");
  hintEl.style.fontSize = "13px";
  hintEl.style.opacity = "0.5";
  hintEl.style.display = "flex";
  hintEl.style.alignItems = "center";
  hintEl.style.gap = "6px";
  hintEl.innerHTML = `<span style="font-size:14px">→</span><span>${ad.ctaText || "Tap to learn more"}</span>`;
  card.appendChild(hintEl);

  container.appendChild(card);

  // Click handler - expand
  card.addEventListener("click", () => {
    setExpanded(true);
    card.style.borderColor = COLORS.success;
    card.style.cursor = "default";
    card.onmouseenter = null;
    card.onmouseleave = null;
  });
}

// ============================================================================
// Ad Card Components
// ============================================================================

function ActionCardAd({ ad }: { ad: ResolvedAd }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    renderActionCardDemo(ad, containerRef.current);
  }, [ad]);

  return (
    <div className="flex justify-start my-4">
      <div ref={containerRef} />
    </div>
  );
}

function LeadGenAd({ ad }: { ad: ResolvedAd }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    renderLeadGenDemo(ad, containerRef.current);
  }, [ad]);

  return (
    <div className="flex justify-start my-4">
      <div ref={containerRef} />
    </div>
  );
}

function FollowupAd({ ad }: { ad: ResolvedAd }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    renderFollowupDemo(ad, containerRef.current, setExpanded);
  }, [ad]);

  return (
    <div className="flex flex-col justify-start my-4">
      <div ref={containerRef} />
      {expanded && (
        <div className="mt-3 ml-0 max-w-[460px] p-4 bg-[#1a2a1a] border border-green-700/50 rounded-xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-green-400 font-medium text-sm">Sponsored Content</span>
          </div>
          <p className="text-gray-200 text-[15px] leading-relaxed">
            <strong>ChefMate</strong> analyzes your fridge contents and suggests personalized recipes.
            Tonight you could make: Teriyaki Chicken Bowl, Veggie Stir-Fry, or Chicken Fried Rice.
            <span className="text-blue-400 ml-1 cursor-pointer hover:underline">See all 12 recipes →</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Chat Message Component
// ============================================================================

function ChatMessage({ message, format }: { message: ConversationMessage; format: AdFormatTab }) {
  if (message.role === "ad" && message.ad) {
    switch (format) {
      case "action_card":
        return <ActionCardAd ad={message.ad} />;
      case "lead_gen":
        return <LeadGenAd ad={message.ad} />;
      case "followup":
        return <FollowupAd ad={message.ad} />;
      default:
        return null;
    }
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-3 rounded-2xl max-w-[75%] text-[15px] leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-[#2a2a2a] text-gray-100 rounded-bl-md"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

// ============================================================================
// Static Ad Banner Component (Fixed at bottom)
// ============================================================================

function StaticAdBanner({ ad }: { ad: ResolvedAd }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    renderStaticAdDemo(ad, containerRef.current);
  }, [ad]);

  return (
    <div className="px-4 pb-2">
      <div ref={containerRef} />
    </div>
  );
}

// ============================================================================
// Tab Button Component
// ============================================================================

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function AdShowcasePage() {
  const [activeTab, setActiveTab] = useState<AdFormatTab>("action_card");
  const room = chatRooms[activeTab];

  // Filter out ad messages for static tab (ad is shown fixed at bottom)
  const displayMessages = activeTab === "static"
    ? room.messages.filter((m) => m.role !== "ad")
    : room.messages;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col">
      {/* Header with Tabs */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            <TabButton
              label="Action Card"
              isActive={activeTab === "action_card"}
              onClick={() => setActiveTab("action_card")}
            />
            <TabButton
              label="Lead Gen"
              isActive={activeTab === "lead_gen"}
              onClick={() => setActiveTab("lead_gen")}
            />
            <TabButton
              label="Static"
              isActive={activeTab === "static"}
              onClick={() => setActiveTab("static")}
            />
            <TabButton
              label="Followup"
              isActive={activeTab === "followup"}
              onClick={() => setActiveTab("followup")}
            />
          </div>

          {/* Room Title */}
          <div className="pt-2 border-t border-gray-800">
            <h1 className="text-lg font-semibold text-white">{room.title}</h1>
            <p className="text-xs text-gray-500">{room.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Format Info Banner */}
      <div className="max-w-2xl mx-auto px-4 pt-4 w-full">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 text-xs font-mono bg-blue-400/10 px-2 py-0.5 rounded">
              {activeTab}
            </span>
            <span className="text-gray-400 text-sm">{room.formatDescription}</span>
          </div>
          <p className="text-xs text-gray-500">
            <span className="text-yellow-500">Tip:</span> {room.interactionHint}
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="space-y-4">
            {displayMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} format={activeTab} />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Area */}
      <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          {/* Mock Input Field */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-900 text-gray-500 px-4 py-3 rounded-lg border border-gray-700">
                Type your message...
              </div>
              <div className="px-4 py-3 bg-gray-700 text-gray-400 rounded-lg">
                Send
              </div>
            </div>
          </div>

          {/* Static Ad (only for static tab) - below input field */}
          {activeTab === "static" && <StaticAdBanner ad={staticAd} />}

          {/* Footer Info */}
          <div className="px-4 pb-3 text-center">
            <p className="text-xs text-gray-600">
              Ad Format Showcase — Switch tabs to see different ad formats
            </p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
