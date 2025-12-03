// -----------------------------------------------------------------------------
// English Learning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
// This script contains 10 messages (5 user + 5 AI) and includes a keyword
// in the later stage to trigger ad injection via the SDK.
// -----------------------------------------------------------------------------

import type { ChatMessage } from "../page";

export const englishScenario: ChatMessage[] = [
  {
    id: "u1",
    role: "user",
    text: "I want to improve my English speaking skills. Where should I start?",
  },
  {
    id: "a1",
    role: "ai",
    text: "A great first step is to build daily speaking habits. Even short self-talk or reading aloud can make a big difference.",
  },
  {
    id: "u2",
    role: "user",
    text: "How can I check whether my pronunciation is accurate?",
  },
  {
    id: "a2",
    role: "ai",
    text: "Recording your voice and comparing it to native speakers is surprisingly effective. You can also shadow YouTube videos or podcasts.",
  },
  {
    id: "u3",
    role: "user",
    text: "I struggle with remembering new vocabulary. Do you have any tips?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Using spaced repetition helps a lot. Apps like Anki or simple flashcards improve long-term retention.",
  },
  {
    id: "u4",
    role: "user",
    text: "I also want to practice natural everyday conversation.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Then conversational practice is essential. Role-playing different scenarios is a very good way to build fluency.",
  },

  // ---------------------------------------------------------------------------
  // Trigger keyword for ad injection:
  // The SDK will detect the phrase: "AI English conversation app"
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
