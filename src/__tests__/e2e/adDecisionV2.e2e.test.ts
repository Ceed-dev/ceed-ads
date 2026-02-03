/**
 * E2E Tests for Ad Decision V2
 *
 * These tests verify the end-to-end behavior of the ad decision system
 * using realistic user conversation scenarios.
 */
import { describe, it, expect } from "vitest";
import { scoreOpportunity } from "@/lib/ads/deciders/v2/opportunityScorer";
import { T_LOW, T_HIGH } from "@/lib/ads/deciders/v2/constants";

describe("Ad Decision V2 E2E Tests", () => {
  describe("Scenario 1: Shopping conversation", () => {
    it('should show ads for "I want to buy a new laptop for work"', () => {
      const input = "I want to buy a new laptop for work";
      const result = scoreOpportunity(input, "eng");

      expect(result.intent).toBe("high_commercial");
      expect(result.score).toBe(0.8);
      expect(result.score).toBeGreaterThanOrEqual(T_HIGH);
      // Ad should be shown
    });
  });

  describe("Scenario 2: Emotional conversation", () => {
    it('should NOT show ads for "I\'m feeling really sad today"', () => {
      const input = "I'm feeling really sad today";
      const result = scoreOpportunity(input, "eng");

      expect(result.intent).toBe("sensitive");
      expect(result.score).toBe(0);
      // No ad should be shown - sensitive content
    });
  });

  describe("Scenario 3: Casual greeting", () => {
    it('should NOT show ads for "Hello, how are you?"', () => {
      const input = "Hello, how are you?";
      const result = scoreOpportunity(input, "eng");

      expect(result.intent).toBe("chitchat");
      expect(result.score).toBe(0.1);
      expect(result.score).toBeLessThan(T_LOW);
      // No ad should be shown - below threshold
    });
  });

  describe("Scenario 4: Product comparison", () => {
    it('should show ads for "Which is better, iPhone vs Android?"', () => {
      const input = "Which is better, iPhone vs Android?";
      const result = scoreOpportunity(input, "eng");

      expect(result.intent).toBe("high_commercial");
      expect(result.score).toBe(0.8);
      // "vs" is a HIGH_INTENT keyword
      // Ad should be shown
    });
  });

  describe("Scenario 5: Japanese conversation", () => {
    it('should handle Japanese input (detected as non-English)', () => {
      const input = "新しいスマートフォンを買いたい";
      const result = scoreOpportunity(input, "jpn");

      // Note: scoreOpportunity doesn't translate internally
      // It uses the input as-is, so Japanese keywords won't match English keywords
      // The full decideAdV2 would use toEnglish first
      // For this unit test, we verify it doesn't crash and returns a valid result
      expect(result).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.intent).toBeDefined();
    });
  });

  describe("Scenario 6: Short message", () => {
    it('should NOT show ads for "ok"', () => {
      const input = "ok";
      const result = scoreOpportunity(input, "eng");

      expect(result.intent).toBe("low_intent");
      expect(result.score).toBe(0.2);
      expect(result.score).toBeLessThan(T_LOW);
      // No ad should be shown - short message, below threshold
    });
  });

  describe("Scenario 7: Technical question", () => {
    it('should show ads for "How do machine learning algorithms work?"', () => {
      const input = "How do machine learning algorithms work?";
      const result = scoreOpportunity(input, "eng");

      // BUG FIX VERIFICATION: "machine" should NOT trigger chitchat
      expect(result.intent).toBe("medium_commercial");
      expect(result.score).toBe(0.5);
      expect(result.score).toBeGreaterThanOrEqual(T_LOW);
      // Ad MAY be shown - between thresholds
    });
  });

  describe("Scenario 8: Bug fix confirmation", () => {
    it('should handle "I bought this product and it works great"', () => {
      const input = "I bought this product and it works great";
      const result = scoreOpportunity(input, "eng");

      // "bought" is NOT in HIGH_INTENT_KEYWORDS (only "buy" is)
      // "this" should NOT trigger chitchat (bug fix verified)
      // So this should be MEDIUM_INTENT
      expect(result.intent).toBe("medium_commercial");
      expect(result.score).toBe(0.5);
      // BUG FIX CONFIRMED: "this" does not trigger "hi" chitchat match
    });

    it('should show ads for "I want to buy this product"', () => {
      const input = "I want to buy this product";
      const result = scoreOpportunity(input, "eng");

      // "buy" IS in HIGH_INTENT_KEYWORDS
      // "this" should NOT trigger chitchat (bug fix verified)
      expect(result.intent).toBe("high_commercial");
      expect(result.score).toBe(0.8);
      // BUG FIX CONFIRMED: "buy" matches, "this" is ignored
    });
  });

  describe("Threshold validation", () => {
    it("should have T_LOW < T_HIGH", () => {
      expect(T_LOW).toBeLessThan(T_HIGH);
    });

    it("T_LOW should be 0.3", () => {
      expect(T_LOW).toBe(0.3);
    });

    it("T_HIGH should be 0.7", () => {
      expect(T_HIGH).toBe(0.7);
    });
  });

  describe("Ad display decision summary", () => {
    const testCases = [
      { input: "I want to buy a laptop", expected: "SHOW", reason: "high_commercial" },
      { input: "I'm feeling depressed", expected: "NO_SHOW", reason: "sensitive" },
      { input: "Hello there", expected: "NO_SHOW", reason: "chitchat" },
      { input: "Compare iPhone vs Samsung", expected: "SHOW", reason: "high_commercial" },
      { input: "ok", expected: "NO_SHOW", reason: "low_intent" },
      { input: "Tell me about history", expected: "MAYBE", reason: "medium_commercial" },
      { input: "This machine works great", expected: "MAYBE", reason: "medium_commercial (bug fix)" },
    ];

    testCases.forEach(({ input, expected, reason }) => {
      it(`"${input}" → ${expected} (${reason})`, () => {
        const result = scoreOpportunity(input, "eng");
        const shouldShow =
          result.score >= T_HIGH
            ? "SHOW"
            : result.score >= T_LOW
            ? "MAYBE"
            : "NO_SHOW";
        expect(shouldShow).toBe(expected);
      });
    });
  });
});
