// -----------------------------------------------------------------------------
// Travel Planning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
// Contains: 10 messages (5 user / 5 AI).
//
// The final user message intentionally includes keywords such as
// "nice" and "hotel". These keywords match the tags defined in
// travel-related ads (e.g., ["hotel", "travel", "okinawa"]), so the
// backend keyword-based ad decider will return a travel ad here.
// -----------------------------------------------------------------------------

import type { ChatMessageUserAi } from "@/../sdk/core/types";

export const travelScenario: ChatMessageUserAi[] = [
  {
    id: "u1",
    role: "user",
    text: "I'm thinking about taking some time off soon. Any ideas for places that might be refreshing?",
  },
  {
    id: "a1",
    role: "ai",
    text: "It depends on the atmosphere you enjoy. Do you prefer quiet places, lively areas, or somewhere close to nature?",
  },
  {
    id: "u2",
    role: "user",
    text: "I want somewhere calm but still interesting. Ideally somewhere warm.",
  },
  {
    id: "a2",
    role: "ai",
    text: "In that case, regions with mild climates could be a good fit. Many people enjoy spots where they can unwind but also explore a bit.",
  },
  {
    id: "u3",
    role: "user",
    text: "I haven't really traveled much, so I'm open to new places. When is a good season to go somewhere warm?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Late spring or early autumn tends to be comfortable in many destinations—pleasant weather and not too crowded.",
  },
  {
    id: "u4",
    role: "user",
    text: "That sounds nice. I think I'll pick a warm coastal area then.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Great. Are your dates already decided, or are you still thinking about it?",
  },

  // ---------------------------------------------------------------------------
  // Trigger message:
  // This user message includes keywords such as "nice" and "hotel".
  // These keywords will match the tags defined in travel-related ads
  // (e.g., ["hotel", "travel", "okinawa"]), so the backend keyword-based
  // ad decider will return a travel ad at this point.
  // ---------------------------------------------------------------------------
  {
    id: "u5",
    role: "user",
    text: "Do you know any nice hotel around there?",
  },
  {
    id: "a5",
    role: "ai",
    text: "There are several options depending on your budget and style. Let me check what might be a good fit.",
    // ← Action Card ad will be injected under this message
  },
];
