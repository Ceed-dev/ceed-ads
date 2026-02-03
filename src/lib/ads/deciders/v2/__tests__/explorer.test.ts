import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { selectWithExploration } from "../explorer";
import type { Ad } from "@/types/ad";

// Mock Ad factory
function createMockAd(id: string): Ad {
  return {
    advertiserId: `adv-${id}`,
    format: "action_card",
    title: { eng: `Title ${id}` },
    description: { eng: `Description ${id}` },
    ctaText: { eng: "Click" },
    ctaUrl: `https://example.com/${id}`,
    tags: ["test"],
    status: "active",
    meta: { createdAt: new Date(), updatedAt: new Date() },
  };
}

// Create ranked candidate
function createCandidate(id: string, expectedValue: number) {
  return {
    ad: createMockAd(id),
    expectedValue,
    pCTR: 0.02,
    fatiguePenalty: 0,
    formatPenalty: 0,
  };
}

describe("selectWithExploration", () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, "random");
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  describe("Basic behavior", () => {
    it("should return null for empty array", () => {
      const result = selectWithExploration([]);
      expect(result).toBeNull();
    });

    it("should return the only candidate when array has one element", () => {
      const candidate = createCandidate("1", 1.0);
      const result = selectWithExploration([candidate]);
      expect(result).toBe(candidate);
    });

    it("should return top candidate when epsilon=0 (exploitation only)", () => {
      mathRandomSpy.mockReturnValue(0.5); // > epsilon=0, so exploitation
      const candidates = [
        createCandidate("top", 1.0),
        createCandidate("second", 0.8),
        createCandidate("third", 0.6),
      ];

      const result = selectWithExploration(candidates, 0);
      expect(result).toBe(candidates[0]);
    });

    it("should always return top candidate when epsilon=0 regardless of Math.random", () => {
      // Even if Math.random returns 0, epsilon=0 means no exploration
      mathRandomSpy.mockReturnValue(0);
      const candidates = [
        createCandidate("top", 1.0),
        createCandidate("second", 0.8),
      ];

      const result = selectWithExploration(candidates, 0);
      expect(result).toBe(candidates[0]);
    });

    it("should select from top 5 when epsilon=1 (exploration only)", () => {
      mathRandomSpy
        .mockReturnValueOnce(0.5) // < epsilon=1, so exploration
        .mockReturnValueOnce(0.4); // randomIndex = floor(0.4 * 5) = 2

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
        createCandidate("4", 0.7),
        createCandidate("5", 0.6),
        createCandidate("6", 0.5),
      ];

      const result = selectWithExploration(candidates, 1);
      expect(result).toBe(candidates[2]); // Index 2 from top 5
    });

    it("should use default epsilon (0.05) when not specified", () => {
      mathRandomSpy.mockReturnValue(0.1); // > 0.05, so exploitation
      const candidates = [
        createCandidate("top", 1.0),
        createCandidate("second", 0.8),
      ];

      const result = selectWithExploration(candidates);
      expect(result).toBe(candidates[0]);
    });
  });

  describe("Edge cases with candidate count", () => {
    it("should handle exactly 5 candidates with exploration", () => {
      mathRandomSpy
        .mockReturnValueOnce(0) // < epsilon=1, exploration
        .mockReturnValueOnce(0.8); // randomIndex = floor(0.8 * 5) = 4

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
        createCandidate("4", 0.7),
        createCandidate("5", 0.6),
      ];

      const result = selectWithExploration(candidates, 1);
      expect(result).toBe(candidates[4]);
    });

    it("should select from all candidates when fewer than 5 with exploration", () => {
      mathRandomSpy
        .mockReturnValueOnce(0) // < epsilon=1, exploration
        .mockReturnValueOnce(0.6); // randomIndex = floor(0.6 * 3) = 1

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
      ];

      const result = selectWithExploration(candidates, 1);
      expect(result).toBe(candidates[1]);
    });

    it("should only select from top 5 when more than 5 candidates", () => {
      mathRandomSpy
        .mockReturnValueOnce(0) // < epsilon=1, exploration
        .mockReturnValueOnce(0.99); // randomIndex = floor(0.99 * 5) = 4

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
        createCandidate("4", 0.7),
        createCandidate("5", 0.6),
        createCandidate("6", 0.5), // Should never be selected
        createCandidate("7", 0.4),
      ];

      const result = selectWithExploration(candidates, 1);
      // Should be one of top 5, not candidates[5] or [6]
      expect(candidates.slice(0, 5)).toContain(result);
    });
  });

  describe("Randomness tests", () => {
    it("should produce different results with epsilon=1 over multiple calls", () => {
      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
        createCandidate("4", 0.7),
        createCandidate("5", 0.6),
      ];

      // Simulate different random values
      const results: string[] = [];

      mathRandomSpy
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.0); // Select index 0
      results.push(
        (selectWithExploration(candidates, 1)?.ad as Ad).advertiserId
      );

      mathRandomSpy
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.4); // Select index 2
      results.push(
        (selectWithExploration(candidates, 1)?.ad as Ad).advertiserId
      );

      mathRandomSpy
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.8); // Select index 4
      results.push(
        (selectWithExploration(candidates, 1)?.ad as Ad).advertiserId
      );

      // Should have different results
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it("should always return the same result with epsilon=0", () => {
      const candidates = [
        createCandidate("top", 1.0),
        createCandidate("second", 0.8),
        createCandidate("third", 0.6),
      ];

      const results: string[] = [];

      // Multiple calls should all return top
      for (let i = 0; i < 5; i++) {
        mathRandomSpy.mockReturnValue(Math.random()); // Any value
        const result = selectWithExploration(candidates, 0);
        results.push(result?.ad.advertiserId ?? "");
      }

      // All results should be the same (top candidate)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(1);
      expect(results[0]).toBe("adv-top");
    });
  });

  describe("Type safety", () => {
    it("should work with extended candidate types", () => {
      interface ExtendedCandidate {
        ad: Ad;
        expectedValue: number;
        customField: string;
      }

      const candidates: ExtendedCandidate[] = [
        {
          ad: createMockAd("1"),
          expectedValue: 1.0,
          customField: "custom1",
        },
        {
          ad: createMockAd("2"),
          expectedValue: 0.8,
          customField: "custom2",
        },
      ];

      mathRandomSpy.mockReturnValue(0.5); // exploitation
      const result = selectWithExploration(candidates, 0);

      expect(result).not.toBeNull();
      expect(result?.customField).toBe("custom1");
    });

    it("should preserve all properties of the selected candidate", () => {
      const candidates = [
        {
          ad: createMockAd("1"),
          expectedValue: 1.0,
          pCTR: 0.05,
          fatiguePenalty: 0.1,
          formatPenalty: 0.2,
          extraProp: "preserved",
        },
      ];

      const result = selectWithExploration(candidates);

      expect(result).toHaveProperty("expectedValue", 1.0);
      expect(result).toHaveProperty("pCTR", 0.05);
      expect(result).toHaveProperty("fatiguePenalty", 0.1);
      expect(result).toHaveProperty("extraProp", "preserved");
    });
  });

  describe("Boundary epsilon values", () => {
    it("should trigger exploration when Math.random returns value just below epsilon", () => {
      mathRandomSpy
        .mockReturnValueOnce(0.049) // Just below 0.05
        .mockReturnValueOnce(0.5); // Select middle candidate

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
        createCandidate("3", 0.8),
      ];

      const result = selectWithExploration(candidates, 0.05);
      // With exploration triggered, should pick from top (which is all 3)
      expect(result).toBe(candidates[1]); // floor(0.5 * 3) = 1
    });

    it("should trigger exploitation when Math.random equals epsilon", () => {
      mathRandomSpy.mockReturnValue(0.05); // Equal to epsilon

      const candidates = [
        createCandidate("1", 1.0),
        createCandidate("2", 0.9),
      ];

      const result = selectWithExploration(candidates, 0.05);
      // 0.05 is not < 0.05, so exploitation
      expect(result).toBe(candidates[0]);
    });
  });
});
