/**
 * --------------------------------------------------------------------
 * Keyword-Based Ad Decider (MVP)
 *
 * Given a user's message (contextText) and detected language, this function:
 *   1. Returns null if the language is not supported
 *   2. Fetches all active ads from Firestore
 *   3. Normalizes text (lowercase)
 *   4. Checks exact keyword matches (word-level) between contextText and ad.tags
 *   5. Scores each ad based on number of matched tags
 *   6. Returns the highest-scoring ad
 *      - If multiple ads tie → randomly pick one
 *   7. Returns null if no ad matches at all
 *
 * This file intentionally contains no API-specific logic.
 * It is a reusable pure function for selecting ads based on keywords.
 * --------------------------------------------------------------------
 */

import { db } from "@/lib/firebase-admin";
import type { Ad } from "@/types";

/**
 * Languages currently supported by the keyword-based ad decision logic.
 *
 * Ads will NOT be served for languages outside this set.
 * Detection may return other valid language codes, but they are intentionally
 * excluded here until proper support is added.
 */
const SUPPORTED_LANGUAGES = new Set(["eng", "jpn"]);

/**
 * Ad decided by keyword logic (includes Firestore ID + advertiserName).
 */
export interface DecidedAd extends Ad {
  id: string; // Firestore document ID
  advertiserName: string; // Resolved from advertisers/{advertiserId}
}

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
): Promise<DecidedAd | null> {
  // If language is not supported, do not return any ad
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return null;
  }

  const normalizedContext = normalize(contextText);

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
  // 5. Fetch advertiserName for the selected ad
  // --------------------------------------------------------------
  const advSnap = await db
    .collection("advertisers")
    .doc(selected.advertiserId)
    .get();

  const advertiserName = advSnap.exists
    ? (advSnap.data()?.name as string)
    : "Advertiser";

  // Return final decided ad
  return {
    ...selected,
    advertiserName,
  } as DecidedAd;
}
