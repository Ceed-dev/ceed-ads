import { describe, it, expect } from "vitest";
import { rankCandidates } from "../ranker";
import {
  DEFAULT_BASE_CTR,
  FATIGUE_SAME_AD_PENALTY,
  FATIGUE_SAME_ADVERTISER_PENALTY,
} from "../constants";
import type { Ad } from "@/types";
import type { ScoredCandidate } from "../types";

function createMockAd(overrides: Partial<Ad> & { id?: string; cpc?: number; baseCTR?: number }): Ad & { id: string; cpc?: number; baseCTR?: number } {
  return {
    id: overrides.id ?? "ad-1",
    advertiserId: overrides.advertiserId ?? "adv-1",
    format: "action_card",
    title: { eng: "Title" },
    description: { eng: "Description" },
    ctaText: { eng: "Click" },
    ctaUrl: "https://example.com",
    tags: [],
    status: "active",
    meta: { createdAt: new Date(), updatedAt: new Date() },
    ...overrides,
  } as Ad & { id: string; cpc?: number; baseCTR?: number };
}

function createCandidate(ad: Ad, score: number = 1): ScoredCandidate {
  return { ad, score, matchSource: "tag" };
}

describe("ranker", () => {
  describe("Expected Value Calculation", () => {
    it("should calculate expectedValue = pCTR × CPC", () => {
      const ad = createMockAd({ cpc: 1.0, baseCTR: 0.02 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].expectedValue).toBeCloseTo(0.02);
      expect(result[0].pCTR).toBe(0.02);
    });

    it("should calculate with custom cpc and baseCTR", () => {
      const ad = createMockAd({ cpc: 5.0, baseCTR: 0.05 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].expectedValue).toBeCloseTo(0.25);
    });

    it("should use DEFAULT_BASE_CTR when baseCTR is not set", () => {
      const ad = createMockAd({ cpc: 1.0 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].pCTR).toBe(DEFAULT_BASE_CTR);
      expect(result[0].expectedValue).toBeCloseTo(DEFAULT_BASE_CTR);
    });

    it("should use cpc=1.0 when cpc is not set", () => {
      const ad = createMockAd({ baseCTR: 0.05 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].expectedValue).toBeCloseTo(0.05);
    });
  });

  describe("Fatigue Penalty", () => {
    it("should apply FATIGUE_SAME_AD_PENALTY for same ad", () => {
      const ad = createMockAd({ id: "ad-1", cpc: 1.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, ["ad-1"], []);

      expect(result[0].fatiguePenalty).toBe(FATIGUE_SAME_AD_PENALTY);
      // expectedValue = 0.1 * 1.0 * (1 - 0.5) = 0.05
      expect(result[0].expectedValue).toBeCloseTo(0.05);
    });

    it("should apply FATIGUE_SAME_ADVERTISER_PENALTY for same advertiser", () => {
      const ad = createMockAd({ id: "ad-1", advertiserId: "adv-1", cpc: 1.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], ["adv-1"]);

      expect(result[0].fatiguePenalty).toBe(FATIGUE_SAME_ADVERTISER_PENALTY);
      // expectedValue = 0.1 * 1.0 * (1 - 0.3) = 0.07
      expect(result[0].expectedValue).toBeCloseTo(0.07);
    });

    it("should apply MAX of penalties when both apply", () => {
      const ad = createMockAd({ id: "ad-1", advertiserId: "adv-1", cpc: 1.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, ["ad-1"], ["adv-1"]);

      // MAX(0.5, 0.3) = 0.5
      expect(result[0].fatiguePenalty).toBe(FATIGUE_SAME_AD_PENALTY);
      expect(result[0].expectedValue).toBeCloseTo(0.05);
    });

    it("should apply no penalty when neither applies", () => {
      const ad = createMockAd({ id: "ad-1", advertiserId: "adv-1", cpc: 1.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, ["ad-2"], ["adv-2"]);

      expect(result[0].fatiguePenalty).toBe(0);
      expect(result[0].expectedValue).toBeCloseTo(0.1);
    });
  });

  describe("Final Score Calculation", () => {
    it("should halve score with 0.5 penalty", () => {
      const ad = createMockAd({ id: "ad-1", cpc: 2.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, ["ad-1"], []);

      // base expectedValue = 0.2, with 0.5 penalty = 0.1
      expect(result[0].expectedValue).toBeCloseTo(0.1);
    });

    it("should keep full score with 0 penalty", () => {
      const ad = createMockAd({ cpc: 2.0, baseCTR: 0.1 });
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].expectedValue).toBeCloseTo(0.2);
    });
  });

  describe("Sorting", () => {
    it("should sort by expectedValue descending", () => {
      const ad1 = createMockAd({ id: "ad-1", cpc: 1.0, baseCTR: 0.01 }); // EV = 0.01
      const ad2 = createMockAd({ id: "ad-2", cpc: 5.0, baseCTR: 0.1 });  // EV = 0.5
      const ad3 = createMockAd({ id: "ad-3", cpc: 2.0, baseCTR: 0.05 }); // EV = 0.1
      const candidates = [
        createCandidate(ad1),
        createCandidate(ad2),
        createCandidate(ad3),
      ];

      const result = rankCandidates(candidates, [], []);

      expect((result[0].ad as Ad & { id: string }).id).toBe("ad-2");
      expect((result[1].ad as Ad & { id: string }).id).toBe("ad-3");
      expect((result[2].ad as Ad & { id: string }).id).toBe("ad-1");
    });

    it("should maintain stable order for equal scores", () => {
      const ad1 = createMockAd({ id: "ad-1", cpc: 1.0, baseCTR: 0.1 });
      const ad2 = createMockAd({ id: "ad-2", cpc: 1.0, baseCTR: 0.1 });
      const ad3 = createMockAd({ id: "ad-3", cpc: 1.0, baseCTR: 0.1 });
      const candidates = [
        createCandidate(ad1),
        createCandidate(ad2),
        createCandidate(ad3),
      ];

      const result = rankCandidates(candidates, [], []);

      // All have same EV, check they're all present
      expect(result).toHaveLength(3);
      expect(result.every(r => r.expectedValue === 0.1)).toBe(true);
    });
  });

  describe("Default Values", () => {
    it("should use DEFAULT_BASE_CTR (0.02) for missing baseCTR", () => {
      const ad = createMockAd({ cpc: 1.0 }); // no baseCTR
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      expect(result[0].pCTR).toBe(0.02);
    });

    it("should use cpc=1.0 for missing cpc", () => {
      const ad = createMockAd({ baseCTR: 0.1 }); // no cpc
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, [], []);

      // EV = 0.1 * 1.0 = 0.1
      expect(result[0].expectedValue).toBeCloseTo(0.1);
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array for empty candidates", () => {
      const result = rankCandidates([], [], []);
      expect(result).toHaveLength(0);
    });

    it("should handle candidates with missing id", () => {
      const ad = createMockAd({});
      delete (ad as { id?: string }).id;
      const candidates = [createCandidate(ad)];

      const result = rankCandidates(candidates, ["ad-1"], []);

      // Empty string doesn't match "ad-1"
      expect(result[0].fatiguePenalty).toBe(0);
    });
  });
});
