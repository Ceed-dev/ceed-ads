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

import type { ChatMessageUserAi } from "@/sdk/core/types";

export const travelScenario: ChatMessageUserAi[] = [
  {
    id: "u1",
    role: "user",
    text: "I'm thinking about taking a short vacation soon. Any suggestions for good destinations?",
  },
  {
    id: "a1",
    role: "ai",
    text: "It depends on what kind of experience you're looking for. Do you prefer relaxing beaches, cities, or nature?",
  },
  {
    id: "u2",
    role: "user",
    text: "I want somewhere relaxing but still with things to do. Maybe a warm place.",
  },
  {
    id: "a2",
    role: "ai",
    text: "In that case, Hawaii or Okinawa could be great choices. They offer beautiful beaches along with sightseeing spots.",
  },
  {
    id: "u3",
    role: "user",
    text: "I’ve actually never been to Okinawa. What’s the best time of year to visit?",
  },
  {
    id: "a3",
    role: "ai",
    text: "Late spring or early autumn is ideal—good weather and fewer crowds.",
  },
  {
    id: "u4",
    role: "user",
    text: "Sounds perfect. I think I’ll go with Okinawa then.",
  },
  {
    id: "a4",
    role: "ai",
    text: "Great choice. Do you already have dates in mind or are you still deciding?",
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
