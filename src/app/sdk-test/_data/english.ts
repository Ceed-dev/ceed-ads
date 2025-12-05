// -----------------------------------------------------------------------------
// English Learning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
//
// The final user message intentionally includes keywords such as
// "AI", "English", and "conversation". These keywords match the tags
// defined in the ad documents, so the backend keyword-based ad decider
// will return an English-related ad at that point.
// -----------------------------------------------------------------------------

import type { ChatMessageUserAi } from "@/sdk/core/types";

export const englishScenario: ChatMessageUserAi[] = [
  {
    id: "u1",
    role: "user",
    text: "I want to get better at communicating in another language. Where should I begin?",
  },
  {
    id: "a1",
    role: "ai",
    text: "A good start is to build daily speaking habits. Even short self-talk or reading aloud helps.",
  },
  {
    id: "u2",
    role: "user",
    text: "How can I check whether my pronunciation sounds natural?",
  },
  {
    id: "a2",
    role: "ai",
    text: "Recording your voice and comparing it with native speakers is very effective.",
  },
  {
    id: "u3",
    role: "user",
    text: "I often forget new words I try to memorize. Any tips?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Using spaced repetition is helpful. Simple flashcards can improve long-term memory.",
  },
  {
    id: "u4",
    role: "user",
    text: "I also want to practice more natural interactions.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Role-playing everyday scenes is a great way to build confidence and fluency.",
  },

  // ---------------------------------------------------------------------------
  // Trigger point for ad injection:
  // The following user message includes keywords such as
  // "AI", "English", and "conversation" —
  // these will match the ad's `tags` field (e.g., ["english", "ai", "conversation"]),
  // causing the backend keyword-based system to return a relevant ad here.
  // ---------------------------------------------------------------------------
  {
    id: "u5",
    role: "user",
    text: "Is there any good AI English conversation app you recommend?",
  },
  {
    id: "a5",
    role: "ai",
    text: "There are several options. Let me check what might suit your learning style.",
    // ← Your SDK will inject the Action Card ad here
  },
];
