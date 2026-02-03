import type { ScoredCandidate, RankingResult } from "./types";
import {
  DEFAULT_BASE_CTR,
  FATIGUE_SAME_AD_PENALTY,
  FATIGUE_SAME_ADVERTISER_PENALTY,
} from "./constants";

/**
 * Rank candidates by expected value with fatigue penalty.
 *
 * Scoring formula:
 *   expectedValue = pCTR × CPC
 *   finalScore = expectedValue × (1 - fatiguePenalty)
 */
export function rankCandidates(
  candidates: ScoredCandidate[],
  recentAdIds: string[],
  recentAdvertiserIds: string[]
): RankingResult[] {
  const recentAdSet = new Set(recentAdIds);
  const recentAdvertiserSet = new Set(recentAdvertiserIds);

  const results: RankingResult[] = candidates.map((candidate) => {
    const ad = candidate.ad;

    // Extract CPC and baseCTR with fallbacks
    const cpc = (ad as unknown as { cpc?: number }).cpc ?? 1.0;
    const pCTR = (ad as unknown as { baseCTR?: number }).baseCTR ?? DEFAULT_BASE_CTR;

    // Calculate fatigue penalty
    const adId = (ad as unknown as { id?: string }).id ?? "";
    const sameAdPenalty = recentAdSet.has(adId) ? FATIGUE_SAME_AD_PENALTY : 0;
    const sameAdvertiserPenalty = recentAdvertiserSet.has(ad.advertiserId)
      ? FATIGUE_SAME_ADVERTISER_PENALTY
      : 0;
    const fatiguePenalty = Math.max(sameAdPenalty, sameAdvertiserPenalty);

    // Calculate expected value
    const expectedValue = pCTR * cpc * (1 - fatiguePenalty);

    return {
      ad,
      expectedValue,
      pCTR,
      fatiguePenalty,
      formatPenalty: 0, // Reserved for future use
    };
  });

  // Sort by expected value descending
  return results.sort((a, b) => b.expectedValue - a.expectedValue);
}
