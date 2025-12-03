// -----------------------------------------------------------------------------
// Programming Learning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
// Contains: 10 messages (5 user / 5 AI).
// Trigger keyword for ad injection:
//   -> "AI coding course"
// The SDK will detect this keyword later.
// -----------------------------------------------------------------------------

import type { ChatMessage } from "../page";

export const programmingScenario: ChatMessage[] = [
  {
    id: "u1",
    role: "user",
    text: "I want to start learning programming. What's the best language for beginners?",
  },
  {
    id: "a1",
    role: "ai",
    text: "Python is one of the best choices for beginners. It's easy to read and widely used in many fields.",
  },
  {
    id: "u2",
    role: "user",
    text: "I see. Should I focus more on theory or projects first?",
  },
  {
    id: "a2",
    role: "ai",
    text: "Starting with small hands-on projects helps a lot. You can pick up theory along the way.",
  },
  {
    id: "u3",
    role: "user",
    text: "I often struggle to stay motivated. Any advice?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Set small achievable goals. Even solving one problem a day builds long-term momentum.",
  },
  {
    id: "u4",
    role: "user",
    text: "What about debugging? I get stuck for hours sometimes.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Learning to read error messages carefully and isolating issues step-by-step makes debugging easier over time.",
  },

  // ---------------------------------------------------------------------------
  // Trigger message — SDK will detect: "AI coding course"
  // ---------------------------------------------------------------------------
  {
    id: "u5",
    role: "user",
    text: "Do you know any good AI coding course that can help me learn faster?",
  },
  {
    id: "a5",
    role: "ai",
    text: "There are a few options depending on your learning style. Let me take a look.",
    // ← This is where the Action Card ad will be injected later.
  },
];
