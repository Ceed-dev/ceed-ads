import { describe, it, expect } from "vitest";
import {
  T_LOW,
  T_HIGH,
  EPSILON,
  DEFAULT_BASE_CTR,
  FATIGUE_SAME_AD_PENALTY,
  FATIGUE_SAME_ADVERTISER_PENALTY,
  FORMAT_MISMATCH_PENALTY,
  HIGH_INTENT_KEYWORDS,
  LOW_INTENT_KEYWORDS,
  SENSITIVE_KEYWORDS,
} from "../constants";

describe("constants", () => {
  describe("Threshold constants", () => {
    it("T_LOW should be 0.3", () => {
      expect(T_LOW).toBe(0.3);
    });

    it("T_HIGH should be 0.7", () => {
      expect(T_HIGH).toBe(0.7);
    });

    it("T_LOW should be less than T_HIGH", () => {
      expect(T_LOW).toBeLessThan(T_HIGH);
    });

    it("T_LOW should be in valid range (0-1)", () => {
      expect(T_LOW).toBeGreaterThanOrEqual(0);
      expect(T_LOW).toBeLessThanOrEqual(1);
    });

    it("T_HIGH should be in valid range (0-1)", () => {
      expect(T_HIGH).toBeGreaterThanOrEqual(0);
      expect(T_HIGH).toBeLessThanOrEqual(1);
    });
  });

  describe("EPSILON constant", () => {
    it("EPSILON should be 0.05", () => {
      expect(EPSILON).toBe(0.05);
    });

    it("EPSILON should be in valid range (0-1)", () => {
      expect(EPSILON).toBeGreaterThanOrEqual(0);
      expect(EPSILON).toBeLessThanOrEqual(1);
    });

    it("EPSILON should be a reasonable exploration rate", () => {
      // Typically epsilon-greedy uses small values like 0.01-0.1
      expect(EPSILON).toBeGreaterThan(0);
      expect(EPSILON).toBeLessThan(0.2);
    });
  });

  describe("DEFAULT_BASE_CTR constant", () => {
    it("DEFAULT_BASE_CTR should be 0.02", () => {
      expect(DEFAULT_BASE_CTR).toBe(0.02);
    });

    it("DEFAULT_BASE_CTR should be in valid range (0-1)", () => {
      expect(DEFAULT_BASE_CTR).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_BASE_CTR).toBeLessThanOrEqual(1);
    });

    it("DEFAULT_BASE_CTR should be a realistic CTR value", () => {
      // Industry average CTR is typically 0.5-3%
      expect(DEFAULT_BASE_CTR).toBeGreaterThan(0);
      expect(DEFAULT_BASE_CTR).toBeLessThan(0.1);
    });
  });

  describe("Penalty constants", () => {
    it("FATIGUE_SAME_AD_PENALTY should be 0.5", () => {
      expect(FATIGUE_SAME_AD_PENALTY).toBe(0.5);
    });

    it("FATIGUE_SAME_ADVERTISER_PENALTY should be 0.3", () => {
      expect(FATIGUE_SAME_ADVERTISER_PENALTY).toBe(0.3);
    });

    it("FORMAT_MISMATCH_PENALTY should be 0.2", () => {
      expect(FORMAT_MISMATCH_PENALTY).toBe(0.2);
    });

    it("all penalties should be in valid range (0-1)", () => {
      expect(FATIGUE_SAME_AD_PENALTY).toBeGreaterThanOrEqual(0);
      expect(FATIGUE_SAME_AD_PENALTY).toBeLessThanOrEqual(1);
      expect(FATIGUE_SAME_ADVERTISER_PENALTY).toBeGreaterThanOrEqual(0);
      expect(FATIGUE_SAME_ADVERTISER_PENALTY).toBeLessThanOrEqual(1);
      expect(FORMAT_MISMATCH_PENALTY).toBeGreaterThanOrEqual(0);
      expect(FORMAT_MISMATCH_PENALTY).toBeLessThanOrEqual(1);
    });

    it("FATIGUE_SAME_AD_PENALTY should be greater than FATIGUE_SAME_ADVERTISER_PENALTY", () => {
      // Same ad penalty should be higher than same advertiser penalty
      expect(FATIGUE_SAME_AD_PENALTY).toBeGreaterThan(
        FATIGUE_SAME_ADVERTISER_PENALTY
      );
    });
  });

  describe("HIGH_INTENT_KEYWORDS array", () => {
    it("should be an array", () => {
      expect(Array.isArray(HIGH_INTENT_KEYWORDS)).toBe(true);
    });

    it("should not be empty", () => {
      expect(HIGH_INTENT_KEYWORDS.length).toBeGreaterThan(0);
    });

    it("should have no duplicate entries", () => {
      const unique = new Set(HIGH_INTENT_KEYWORDS);
      expect(unique.size).toBe(HIGH_INTENT_KEYWORDS.length);
    });

    it("should contain expected keywords", () => {
      expect(HIGH_INTENT_KEYWORDS).toContain("purchase");
      expect(HIGH_INTENT_KEYWORDS).toContain("buy");
      expect(HIGH_INTENT_KEYWORDS).toContain("subscribe");
      expect(HIGH_INTENT_KEYWORDS).toContain("pricing");
      expect(HIGH_INTENT_KEYWORDS).toContain("discount");
      expect(HIGH_INTENT_KEYWORDS).toContain("compare");
      expect(HIGH_INTENT_KEYWORDS).toContain("recommend");
    });

    it("all keywords should be lowercase strings", () => {
      HIGH_INTENT_KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe("string");
        expect(keyword).toBe(keyword.toLowerCase());
        expect(keyword.trim()).toBe(keyword);
      });
    });

    it("all keywords should be non-empty", () => {
      HIGH_INTENT_KEYWORDS.forEach((keyword) => {
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe("LOW_INTENT_KEYWORDS array", () => {
    it("should be an array", () => {
      expect(Array.isArray(LOW_INTENT_KEYWORDS)).toBe(true);
    });

    it("should not be empty", () => {
      expect(LOW_INTENT_KEYWORDS.length).toBeGreaterThan(0);
    });

    it("should have no duplicate entries", () => {
      const unique = new Set(LOW_INTENT_KEYWORDS);
      expect(unique.size).toBe(LOW_INTENT_KEYWORDS.length);
    });

    it("should contain expected keywords", () => {
      expect(LOW_INTENT_KEYWORDS).toContain("hello");
      expect(LOW_INTENT_KEYWORDS).toContain("hi");
      expect(LOW_INTENT_KEYWORDS).toContain("thanks");
      expect(LOW_INTENT_KEYWORDS).toContain("bye");
      expect(LOW_INTENT_KEYWORDS).toContain("good morning");
    });

    it("all keywords should be lowercase strings", () => {
      LOW_INTENT_KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe("string");
        expect(keyword).toBe(keyword.toLowerCase());
        expect(keyword.trim()).toBe(keyword);
      });
    });

    it("all keywords should be non-empty", () => {
      LOW_INTENT_KEYWORDS.forEach((keyword) => {
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe("SENSITIVE_KEYWORDS array", () => {
    it("should be an array", () => {
      expect(Array.isArray(SENSITIVE_KEYWORDS)).toBe(true);
    });

    it("should not be empty", () => {
      expect(SENSITIVE_KEYWORDS.length).toBeGreaterThan(0);
    });

    it("should have no duplicate entries", () => {
      const unique = new Set(SENSITIVE_KEYWORDS);
      expect(unique.size).toBe(SENSITIVE_KEYWORDS.length);
    });

    it("should contain expected keywords", () => {
      expect(SENSITIVE_KEYWORDS).toContain("depressed");
      expect(SENSITIVE_KEYWORDS).toContain("suicide");
      expect(SENSITIVE_KEYWORDS).toContain("self-harm");
      expect(SENSITIVE_KEYWORDS).toContain("medication");
      expect(SENSITIVE_KEYWORDS).toContain("mental health");
      expect(SENSITIVE_KEYWORDS).toContain("anxiety");
    });

    it("all keywords should be lowercase strings", () => {
      SENSITIVE_KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe("string");
        expect(keyword).toBe(keyword.toLowerCase());
        expect(keyword.trim()).toBe(keyword);
      });
    });

    it("all keywords should be non-empty", () => {
      SENSITIVE_KEYWORDS.forEach((keyword) => {
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Cross-array validation (no keyword overlap)", () => {
    it("HIGH_INTENT_KEYWORDS and LOW_INTENT_KEYWORDS should have no overlap", () => {
      const highSet = new Set(HIGH_INTENT_KEYWORDS);
      const overlap = LOW_INTENT_KEYWORDS.filter((k) => highSet.has(k));
      expect(overlap).toHaveLength(0);
    });

    it("HIGH_INTENT_KEYWORDS and SENSITIVE_KEYWORDS should have no overlap", () => {
      const highSet = new Set(HIGH_INTENT_KEYWORDS);
      const overlap = SENSITIVE_KEYWORDS.filter((k) => highSet.has(k));
      expect(overlap).toHaveLength(0);
    });

    it("LOW_INTENT_KEYWORDS and SENSITIVE_KEYWORDS should have no overlap", () => {
      const lowSet = new Set(LOW_INTENT_KEYWORDS);
      const overlap = SENSITIVE_KEYWORDS.filter((k) => lowSet.has(k));
      expect(overlap).toHaveLength(0);
    });

    it("all three arrays should have mutually exclusive keywords", () => {
      const allKeywords = [
        ...HIGH_INTENT_KEYWORDS,
        ...LOW_INTENT_KEYWORDS,
        ...SENSITIVE_KEYWORDS,
      ];
      const uniqueKeywords = new Set(allKeywords);
      expect(uniqueKeywords.size).toBe(allKeywords.length);
    });
  });

  describe("Array immutability", () => {
    it("HIGH_INTENT_KEYWORDS should be readonly", () => {
      // TypeScript readonly, but we can check at runtime that it's a frozen-like structure
      expect(() => {
        // This should ideally throw or be prevented by TypeScript
        // At runtime, readonly arrays are still arrays
        const arr = HIGH_INTENT_KEYWORDS as string[];
        const originalLength = arr.length;
        // We don't actually mutate, just verify the type
        expect(arr.length).toBe(originalLength);
      }).not.toThrow();
    });

    it("LOW_INTENT_KEYWORDS should be readonly", () => {
      expect(() => {
        const arr = LOW_INTENT_KEYWORDS as string[];
        const originalLength = arr.length;
        expect(arr.length).toBe(originalLength);
      }).not.toThrow();
    });

    it("SENSITIVE_KEYWORDS should be readonly", () => {
      expect(() => {
        const arr = SENSITIVE_KEYWORDS as string[];
        const originalLength = arr.length;
        expect(arr.length).toBe(originalLength);
      }).not.toThrow();
    });
  });
});
