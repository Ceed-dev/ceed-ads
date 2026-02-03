import type { OpportunityScore, IntentCategory } from "./types";
import {
  SENSITIVE_KEYWORDS,
  LOW_INTENT_KEYWORDS,
  HIGH_INTENT_KEYWORDS,
} from "./constants";

/**
 * Check if a keyword matches in the text using word boundary matching.
 * This prevents false positives like "hi" matching "this" or "machine".
 */
function matchesKeyword(text: string, keyword: string): boolean {
  // For multi-word keywords, use includes (they're specific enough)
  if (keyword.includes(" ")) {
    return text.includes(keyword);
  }
  // For single-word keywords, use word boundary regex
  const regex = new RegExp(`\\b${keyword}\\b`, "i");
  return regex.test(text);
}

export function scoreOpportunity(
  contextText: string,
  _language: string
): { score: OpportunityScore; intent: IntentCategory } {
  const lowerText = contextText.toLowerCase();
  const words = lowerText.split(/\s+/).filter((w) => w.length > 0);

  // Check sensitive keywords first (highest priority)
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (matchesKeyword(lowerText, keyword)) {
      return { score: 0, intent: "sensitive" };
    }
  }

  // Check low intent keywords (chitchat)
  for (const keyword of LOW_INTENT_KEYWORDS) {
    if (matchesKeyword(lowerText, keyword)) {
      return { score: 0.1, intent: "chitchat" };
    }
  }

  // Check high intent keywords (commercial)
  for (const keyword of HIGH_INTENT_KEYWORDS) {
    if (matchesKeyword(lowerText, keyword)) {
      return { score: 0.8, intent: "high_commercial" };
    }
  }

  // Short text indicates low intent
  if (words.length < 3) {
    return { score: 0.2, intent: "low_intent" };
  }

  // Default: medium commercial intent
  return { score: 0.5, intent: "medium_commercial" };
}
