import type { Ad } from "@/types/ad";

/** Opportunity score (0-1 range) indicating ad display likelihood */
export type OpportunityScore = number;

/** User intent classification for ad serving decisions */
export type IntentCategory =
  | "high_commercial"
  | "medium_commercial"
  | "low_intent"
  | "sensitive"
  | "chitchat";

/** Source of candidate match */
export type MatchSource = "tag" | "text" | "semantic";

/** Ad candidate with matching score */
export interface ScoredCandidate {
  ad: Ad;
  score: number;
  matchSource: MatchSource;
}

/** Final ranking result with expected value breakdown */
export interface RankingResult {
  ad: Ad;
  expectedValue: number;
  pCTR: number;
  fatiguePenalty: number;
  formatPenalty: number;
}

/** Score breakdown for debugging and analytics */
export interface ScoreBreakdown {
  baseScore: number;
  relevanceBoost: number;
  fatiguePenalty: number;
  formatPenalty: number;
  explorationBonus: number;
}

/** Timing information for each phase */
export interface PhaseTimings {
  opportunityMs: number;
  candidateMs: number;
  rankingMs: number;
  totalMs: number;
}

/** Metadata for v2 decision process */
export interface V2DecisionMeta {
  oppScore: OpportunityScore;
  oppIntent: IntentCategory;
  candidateCount: number;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  fallbackUsed: boolean;
  phaseTimings: PhaseTimings;
}
