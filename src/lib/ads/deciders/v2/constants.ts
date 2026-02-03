/** Minimum opportunity score to show ads */
export const T_LOW = 0.3;

/** Threshold for full format availability */
export const T_HIGH = 0.7;

/** Exploration rate for epsilon-greedy selection */
export const EPSILON = 0.05;

/** Keywords indicating high commercial intent */
export const HIGH_INTENT_KEYWORDS: readonly string[] = [
  "purchase",
  "buy",
  "order",
  "subscribe",
  "pricing",
  "cost",
  "discount",
  "compare",
  "vs",
  "alternative",
  "recommend",
  "suggest",
  "best",
  "review",
  "deal",
  "offer",
  "sale",
  "coupon",
  "free trial",
  "sign up",
  "get started",
];

/** Keywords indicating low intent (chitchat) */
export const LOW_INTENT_KEYWORDS: readonly string[] = [
  "hello",
  "hi",
  "hey",
  "thanks",
  "thank you",
  "bye",
  "goodbye",
  "good morning",
  "good night",
  "how are you",
  "what's up",
];

/** Keywords indicating sensitive context (no ads) */
export const SENSITIVE_KEYWORDS: readonly string[] = [
  "sad",
  "depressed",
  "anxious",
  "anxiety",
  "suicide",
  "self-harm",
  "medication",
  "mental health",
  "therapy",
  "counseling",
  "legal",
  "lawsuit",
  "attorney",
  "emergency",
  "crisis",
  "abuse",
  "violence",
  "death",
  "grief",
];

/** Default base CTR for new ads without history */
export const DEFAULT_BASE_CTR = 0.02;

/** Penalty multiplier for showing same ad repeatedly */
export const FATIGUE_SAME_AD_PENALTY = 0.5;

/** Penalty multiplier for showing same advertiser repeatedly */
export const FATIGUE_SAME_ADVERTISER_PENALTY = 0.3;

/** Penalty multiplier for format mismatch */
export const FORMAT_MISMATCH_PENALTY = 0.2;
