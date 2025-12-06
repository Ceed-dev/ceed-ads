// -----------------------------------------------------------------------------
// Programming Learning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
//
// The final user message intentionally includes keywords such as
// "AI", "coding", and "course". These keywords match the tags defined
// in the programming-related ad documents, so the backend keyword-based
// ad decider will return a relevant ad at that point.
// -----------------------------------------------------------------------------

import type { ChatMessageUserAi } from "@/../sdk/core/types";

export const programmingScenario: ChatMessageUserAi[] = [
  {
    id: "u1",
    role: "user",
    text: "I'm thinking about getting into tech, but I'm not sure where to start. Any suggestions?",
  },
  {
    id: "a1",
    role: "ai",
    text: "A good entry point is understanding basic problem-solving and logic. Many beginners start with simple tasks to build confidence.",
  },
  {
    id: "u2",
    role: "user",
    text: "Should I focus more on understanding concepts first or try building something right away?",
  },
  {
    id: "a2",
    role: "ai",
    text: "Starting with small hands-on exercises works well. You can pick up the ideas behind them naturally over time.",
  },
  {
    id: "u3",
    role: "user",
    text: "I sometimes lose motivation when things get too difficult. Any advice?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Setting small, clear goals helps. Even completing one simple task a day creates steady progress.",
  },
  {
    id: "u4",
    role: "user",
    text: "What about fixing mistakes? I get stuck pretty easily.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Breaking problems down and checking each part step by step usually helps reveal what's going wrong.",
  },

  // ---------------------------------------------------------------------------
  // Trigger message:
  // This user message includes keywords such as "AI", "coding", and "course".
  // These will match the ad's tags (e.g. ["ai", "coding", "course"]),
  // causing the backend keyword-based ad decider to return a programming ad here.
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
