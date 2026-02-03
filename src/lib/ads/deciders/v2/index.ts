import type { ResolvedAd, Ad } from "@/types/ad";
import type {
  V2DecisionMeta,
  OpportunityScore,
  IntentCategory,
  ScoreBreakdown,
  PhaseTimings,
} from "./types";
import { T_LOW } from "./constants";
import { scoreOpportunity } from "./opportunityScorer";
import { generateCandidates } from "./candidateGenerator";
import { rankCandidates } from "./ranker";
import { selectWithExploration } from "./explorer";
import { getAdvertiser } from "@/lib/ads/cache/advertiserCache";

function resolveLocalizedText(
  text: { eng?: string; jpn?: string },
  language: string
): string {
  if (language === "jpn" && text.jpn) return text.jpn;
  return text.eng ?? "";
}

function createEmptyMeta(
  oppScore: OpportunityScore,
  oppIntent: IntentCategory,
  phaseTimings: PhaseTimings
): V2DecisionMeta {
  return {
    oppScore,
    oppIntent,
    candidateCount: 0,
    finalScore: 0,
    scoreBreakdown: {
      baseScore: 0,
      relevanceBoost: 0,
      fatiguePenalty: 0,
      formatPenalty: 0,
      explorationBonus: 0,
    },
    fallbackUsed: false,
    phaseTimings,
  };
}

async function toResolvedAd(
  ad: Ad,
  adId: string,
  language: string
): Promise<ResolvedAd> {
  const advertiser = await getAdvertiser(ad.advertiserId);
  const advertiserName = advertiser?.name ?? "Unknown";

  const resolved: ResolvedAd = {
    id: adId,
    advertiserId: ad.advertiserId,
    advertiserName,
    format: ad.format,
    title: resolveLocalizedText(ad.title, language),
    description: resolveLocalizedText(ad.description, language),
    ctaText: resolveLocalizedText(ad.ctaText, language),
    ctaUrl: ad.ctaUrl,
  };

  if (ad.leadGenConfig) {
    resolved.leadGenConfig = {
      placeholder: resolveLocalizedText(ad.leadGenConfig.placeholder, language),
      submitButtonText: resolveLocalizedText(
        ad.leadGenConfig.submitButtonText,
        language
      ),
      autocompleteType: ad.leadGenConfig.autocompleteType,
      successMessage: resolveLocalizedText(
        ad.leadGenConfig.successMessage,
        language
      ),
    };
  }

  if (ad.staticConfig) {
    resolved.staticConfig = ad.staticConfig;
  }

  if (ad.followupConfig) {
    resolved.followupConfig = {
      questionText: resolveLocalizedText(
        ad.followupConfig.questionText,
        language
      ),
      tapAction: ad.followupConfig.tapAction,
      tapActionUrl: ad.followupConfig.tapActionUrl,
    };
  }

  return resolved;
}

export async function decideAdV2(
  contextText: string,
  language: string,
  recentAdIds: string[] = [],
  recentAdvertiserIds: string[] = []
): Promise<{ ad: ResolvedAd | null; meta: V2DecisionMeta }> {
  const startTime = performance.now();

  // Phase 1: Opportunity scoring
  const oppStart = performance.now();
  const { score: oppScore, intent: oppIntent } = scoreOpportunity(
    contextText,
    language
  );
  const oppEnd = performance.now();

  // Early exit if opportunity score is too low
  if (oppScore < T_LOW) {
    const phaseTimings: PhaseTimings = {
      opportunityMs: oppEnd - oppStart,
      candidateMs: 0,
      rankingMs: 0,
      totalMs: performance.now() - startTime,
    };
    return { ad: null, meta: createEmptyMeta(oppScore, oppIntent, phaseTimings) };
  }

  // Phase 2: Candidate generation
  const candStart = performance.now();
  const candidates = await generateCandidates(contextText, language);
  const candEnd = performance.now();

  // Early exit if no candidates
  if (candidates.length === 0) {
    const phaseTimings: PhaseTimings = {
      opportunityMs: oppEnd - oppStart,
      candidateMs: candEnd - candStart,
      rankingMs: 0,
      totalMs: performance.now() - startTime,
    };
    return { ad: null, meta: createEmptyMeta(oppScore, oppIntent, phaseTimings) };
  }

  // Phase 3: Ranking
  const rankStart = performance.now();
  const rankedCandidates = rankCandidates(
    candidates,
    recentAdIds,
    recentAdvertiserIds
  );
  const rankEnd = performance.now();

  // Phase 4: Selection with exploration
  const selected = selectWithExploration(rankedCandidates);

  if (!selected) {
    const phaseTimings: PhaseTimings = {
      opportunityMs: oppEnd - oppStart,
      candidateMs: candEnd - candStart,
      rankingMs: rankEnd - rankStart,
      totalMs: performance.now() - startTime,
    };
    return { ad: null, meta: createEmptyMeta(oppScore, oppIntent, phaseTimings) };
  }

  // Convert to ResolvedAd
  const adId = (selected.ad as unknown as { id?: string }).id ?? "";
  const resolvedAd = await toResolvedAd(selected.ad, adId, language);

  // Build metadata
  const phaseTimings: PhaseTimings = {
    opportunityMs: oppEnd - oppStart,
    candidateMs: candEnd - candStart,
    rankingMs: rankEnd - rankStart,
    totalMs: performance.now() - startTime,
  };

  const scoreBreakdown: ScoreBreakdown = {
    baseScore: selected.pCTR,
    relevanceBoost: 0, // Could be enhanced later
    fatiguePenalty: selected.fatiguePenalty,
    formatPenalty: selected.formatPenalty,
    explorationBonus: 0, // Could track exploration separately
  };

  const meta: V2DecisionMeta = {
    oppScore,
    oppIntent,
    candidateCount: candidates.length,
    finalScore: selected.expectedValue,
    scoreBreakdown,
    fallbackUsed: false,
    phaseTimings,
  };

  return { ad: resolvedAd, meta };
}
