/**
 * --------------------------------------------------------------------
 * Keyword-Based Ad Decider (MVP)
 *
 * Given a user's message (contextText), this function:
 *   1. Fetches all active ads from Firestore
 *   2. Normalizes text (lowercase)
 *   3. Checks partial keyword matches between contextText and ad.tags
 *   4. Scores each ad based on number of matched tags
 *   5. Returns the highest-scoring ad
 *      - If multiple ads tie → randomly pick one
 *   6. Returns null if no ad matches at all
 *
 * This file intentionally contains no API-specific logic.
 * It is a reusable pure function for selecting ads based on keywords.
 * --------------------------------------------------------------------
 */

import { db } from "@/lib/firebase-admin";
import type { Ad } from "@/types/ad"; // adjust path if needed

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
 * Check if a single tag is partially included in the context text.
 * Example:
 *   context: "looking for hotels"
 *   tag: "hotel"
 *   → match (because "hotel" is included inside "hotels")
 */
function tagMatchesContext(context: string, tag: string): boolean {
  return context.includes(tag);
}

/**
 * Main function:
 * Selects the best matching ad based on keyword relevance.
 */
export async function decideAdByKeyword(
  contextText: string,
): Promise<DecidedAd | null> {
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
