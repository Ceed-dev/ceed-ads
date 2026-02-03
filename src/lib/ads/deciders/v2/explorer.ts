import type { Ad } from "@/types/ad";
import { EPSILON } from "./constants";

/**
 * Select a candidate using epsilon-greedy exploration.
 *
 * With probability epsilon, randomly select from top 5 candidates.
 * Otherwise, select the top-ranked candidate.
 */
export function selectWithExploration<T extends { ad: Ad }>(
  rankedCandidates: T[],
  epsilon: number = EPSILON
): T | null {
  if (rankedCandidates.length === 0) {
    return null;
  }

  // Exploration: random selection from top 5
  if (Math.random() < epsilon) {
    const top5 = rankedCandidates.slice(0, 5);
    const randomIndex = Math.floor(Math.random() * top5.length);
    return top5[randomIndex];
  }

  // Exploitation: select top candidate
  return rankedCandidates[0];
}
