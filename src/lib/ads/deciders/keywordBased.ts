/**
 * --------------------------------------------------------------------
 * Keyword-Based Ad Decider
 *
 * Given a user's message and detected language, this function:
 *   1. Returns null if the language is not supported
 *   2. Translates the message into English (if needed)
 *   3. Normalizes the text (lowercase, trimmed)
 *   4. Fetches all active ads from Firestore
 *   5. Performs exact word-level keyword matching against ad tags
 *   6. Scores ads by number of matched tags
 *   7. Selects the highest-scoring ad
 *      - If multiple ads tie, one is selected at random
 *   8. Resolves localized ad fields (title, description, CTA) to a single language
 *   9. Returns a client-ready ad payload
 *      - Returns null if no ads match
 *
 * This file intentionally contains no API or request-handling logic.
 * It is a reusable, deterministic function for keyword-based ad selection.
 * --------------------------------------------------------------------
 */

import { db } from "@/lib/firebase-admin";
import { toEnglish } from "./toEnglish";
import type { Ad, ResolvedAd, LocaleCode } from "@/types";

/**
 * Languages currently supported by the keyword-based ad decision logic.
 *
 * Ads will NOT be served for languages outside this set.
 * Detection may return other valid language codes, but they are intentionally
 * excluded here until proper support is added.
 */
const SUPPORTED_LANGUAGES = new Set(["eng", "jpn"]);

/**
 * Normalize a string for comparison.
 * - Lowercase
 * - Trim whitespace
 */
function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Check if a tag matches the context text using **exact word matching**.
 *
 * Why exact matching?
 * - Using `includes()` caused false positives (e.g., "daily" contains "ai")
 * - To avoid accidental ad triggering, we match only whole words
 *
 * Behavior:
 *   context: "I want a nice hotel"
 *   words: ["i", "want", "a", "nice", "hotel"]
 *   tag: "hotel" → match
 *
 *   context: "daily practice"
 *   words: ["daily", "practice"]
 *   tag: "ai" → NOT match (avoids false-positive)
 */
function tagMatchesContext(context: string, tag: string): boolean {
  // Split the normalized context into words (removes punctuation)
  const words = context.split(/\W+/);

  // Exact word match (case-insensitive because normalize() handles casing)
  return words.includes(tag);
}

/**
 * Main function:
 * Selects the best matching ad based on keyword relevance.
 */
export async function decideAdByKeyword(
  contextText: string,
  language: string,
): Promise<ResolvedAd | null> {
  // If language is not supported, do not return any ad
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return null;
  }

  // At this point, language is guaranteed to be a supported LocaleCode
  const locale = language as LocaleCode;

  const englishText = await toEnglish(contextText, language);
  const normalizedContext = normalize(englishText);

  // --------------------------------------------------------------
  // 1. Fetch all active ads from Firestore
  // --------------------------------------------------------------
  const adsSnap = await db
    .collection("ads")
    .where("status", "==", "active")
    .get();

  if (adsSnap.empty) return null;

  // Convert ads into JS objects
  const ads = adsSnap.docs.map((doc) => ({
    ...(doc.data() as Ad),
    id: doc.id,
  }));

  // --------------------------------------------------------------
  // 2. Score each ad based on matched tags
  // --------------------------------------------------------------
  const scoredAds = ads
    .map((ad) => {
      const tags = (ad.tags ?? []).map((t) => normalize(t));

      // Count matched tags
      let matchCount = 0;
      for (const tag of tags) {
        if (tagMatchesContext(normalizedContext, tag)) {
          matchCount++;
        }
      }

      return {
        ad,
        score: matchCount,
      };
    })
    .filter((item) => item.score > 0); // keep only matched ads

  // If nothing matched, return null
  if (scoredAds.length === 0) return null;

  // --------------------------------------------------------------
  // 3. Find max score
  // --------------------------------------------------------------
  const maxScore = Math.max(...scoredAds.map((i) => i.score));

  // Filter only ads with the max score
  const topCandidates = scoredAds.filter((i) => i.score === maxScore);

  // --------------------------------------------------------------
  // 4. If multiple candidates, pick one randomly
  // --------------------------------------------------------------
  const selected =
    topCandidates[Math.floor(Math.random() * topCandidates.length)].ad;

  // --------------------------------------------------------------
  // 5. Fetch advertiser name and resolve localized ad fields
  // --------------------------------------------------------------
  const advSnap = await db
    .collection("advertisers")
    .doc(selected.advertiserId)
    .get();

  const advertiserName = advSnap.exists
    ? (advSnap.data()?.name as string)
    : "Advertiser";

  const title = selected.title[locale] ?? selected.title.eng ?? "";

  const description =
    selected.description[locale] ?? selected.description.eng ?? "";

  const ctaText = selected.ctaText[locale] ?? selected.ctaText.eng ?? "";

  return {
    id: selected.id,
    advertiserId: selected.advertiserId,
    advertiserName,
    format: selected.format,
    title,
    description,
    ctaText,
    ctaUrl: selected.ctaUrl,
  };
}
