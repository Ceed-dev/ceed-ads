import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decideAdV2 } from "../index";
import type { Ad } from "@/types/ad";

// Mock dependencies
vi.mock("@/lib/ads/cache/advertiserCache", () => ({
  getAdvertiser: vi.fn(),
}));

vi.mock("@/lib/ads/cache/adsCache", () => ({
  getActiveAds: vi.fn(),
}));

vi.mock("@/lib/ads/deciders/toEnglish", () => ({
  toEnglish: vi.fn(),
}));

import { getAdvertiser } from "@/lib/ads/cache/advertiserCache";
import { getActiveAds } from "@/lib/ads/cache/adsCache";
import { toEnglish } from "@/lib/ads/deciders/toEnglish";

const mockGetAdvertiser = vi.mocked(getAdvertiser);
const mockGetActiveAds = vi.mocked(getActiveAds);
const mockToEnglish = vi.mocked(toEnglish);

// Mock Ad factory
function createMockAd(
  id: string,
  overrides: Partial<Ad> = {}
): Ad & { id: string } {
  return {
    id,
    advertiserId: `adv-${id}`,
    format: "action_card",
    title: { eng: `Title ${id}`, jpn: `タイトル ${id}` },
    description: { eng: `Description ${id}`, jpn: `説明 ${id}` },
    ctaText: { eng: "Click", jpn: "クリック" },
    ctaUrl: `https://example.com/${id}`,
    tags: ["travel", "hotel"],
    status: "active",
    meta: { createdAt: new Date(), updatedAt: new Date() },
    cpc: 1.0,
    baseCTR: 0.02,
    ...overrides,
  };
}

describe("decideAdV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockToEnglish.mockImplementation(async (text) => text);
    mockGetAdvertiser.mockResolvedValue({ name: "Test Advertiser" });
    mockGetActiveAds.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Early return cases", () => {
    describe("Opportunity score below T_LOW (0.3)", () => {
      it("should return null for sensitive keywords (oppScore=0)", async () => {
        const result = await decideAdV2(
          "I am feeling depressed and anxious",
          "eng"
        );

        expect(result.ad).toBeNull();
        expect(result.meta.oppScore).toBe(0);
        expect(result.meta.oppIntent).toBe("sensitive");
        expect(result.meta.candidateCount).toBe(0);
      });

      it("should return null for chitchat (oppScore=0.1)", async () => {
        const result = await decideAdV2("Hello, how are you?", "eng");

        expect(result.ad).toBeNull();
        expect(result.meta.oppScore).toBe(0.1);
        expect(result.meta.oppIntent).toBe("chitchat");
      });

      it("should return null for very short text (oppScore=0.2)", async () => {
        // "ab" is short text without chitchat keywords
        const result = await decideAdV2("ab", "eng");

        expect(result.ad).toBeNull();
        expect(result.meta.oppScore).toBe(0.2);
        expect(result.meta.oppIntent).toBe("low_intent");
      });

      it("should include phaseTimings even on early return", async () => {
        const result = await decideAdV2("hello", "eng");

        expect(result.meta.phaseTimings).toBeDefined();
        expect(result.meta.phaseTimings.opportunityMs).toBeGreaterThanOrEqual(
          0
        );
        expect(result.meta.phaseTimings.candidateMs).toBe(0);
        expect(result.meta.phaseTimings.rankingMs).toBe(0);
        expect(result.meta.phaseTimings.totalMs).toBeGreaterThanOrEqual(0);
      });
    });

    describe("Zero candidates", () => {
      it("should return null when no ads match", async () => {
        mockGetActiveAds.mockResolvedValue([
          createMockAd("1", { tags: ["unrelated"] }),
        ]);

        const result = await decideAdV2(
          "I want to buy a new smartphone for gaming",
          "eng"
        );

        expect(result.ad).toBeNull();
        expect(result.meta.candidateCount).toBe(0);
      });

      it("should return null when no active ads exist", async () => {
        mockGetActiveAds.mockResolvedValue([]);

        const result = await decideAdV2(
          "I want to purchase a travel package",
          "eng"
        );

        expect(result.ad).toBeNull();
      });
    });
  });

  describe("Normal flow - successful ad selection", () => {
    beforeEach(() => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel", "hotel"] }),
        createMockAd("ad2", { tags: ["travel", "flight"] }),
      ]);
    });

    it("should return ResolvedAd for high intent text", async () => {
      const result = await decideAdV2(
        "I want to buy a travel package for my hotel",
        "eng"
      );

      expect(result.ad).not.toBeNull();
      expect(result.meta.oppScore).toBe(0.8);
      expect(result.meta.oppIntent).toBe("high_commercial");
    });

    it("should return ResolvedAd for medium intent text", async () => {
      const result = await decideAdV2(
        "Looking for a nice hotel for vacation",
        "eng"
      );

      expect(result.ad).not.toBeNull();
      expect(result.meta.oppScore).toBe(0.5);
      expect(result.meta.oppIntent).toBe("medium_commercial");
    });

    it("should have all required ResolvedAd fields", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.ad).not.toBeNull();
      const ad = result.ad!;

      // Required fields
      expect(ad.id).toBeDefined();
      expect(ad.advertiserId).toBeDefined();
      expect(ad.advertiserName).toBe("Test Advertiser");
      expect(ad.format).toBe("action_card");
      expect(ad.title).toBeDefined();
      expect(ad.description).toBeDefined();
      expect(ad.ctaText).toBeDefined();
      expect(ad.ctaUrl).toBeDefined();
    });

    it("should resolve localized text to English for eng language", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.ad?.title).toMatch(/Title/);
      expect(result.ad?.description).toMatch(/Description/);
    });

    it("should resolve localized text to Japanese for jpn language", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "jpn"
      );

      expect(result.ad?.title).toMatch(/タイトル/);
      expect(result.ad?.description).toMatch(/説明/);
    });
  });

  describe("V2DecisionMeta verification", () => {
    beforeEach(() => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
      ]);
    });

    it("should include oppScore in valid range (0-1)", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.meta.oppScore).toBeGreaterThanOrEqual(0);
      expect(result.meta.oppScore).toBeLessThanOrEqual(1);
    });

    it("should include valid oppIntent", async () => {
      const validIntents = [
        "high_commercial",
        "medium_commercial",
        "low_intent",
        "sensitive",
        "chitchat",
      ];

      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(validIntents).toContain(result.meta.oppIntent);
    });

    it("should include candidateCount", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.meta.candidateCount).toBeGreaterThanOrEqual(0);
      expect(typeof result.meta.candidateCount).toBe("number");
    });

    it("should include finalScore", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(typeof result.meta.finalScore).toBe("number");
    });

    it("should include complete scoreBreakdown", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      const breakdown = result.meta.scoreBreakdown;
      expect(breakdown).toBeDefined();
      expect(typeof breakdown.baseScore).toBe("number");
      expect(typeof breakdown.relevanceBoost).toBe("number");
      expect(typeof breakdown.fatiguePenalty).toBe("number");
      expect(typeof breakdown.formatPenalty).toBe("number");
      expect(typeof breakdown.explorationBonus).toBe("number");
    });

    it("should have fallbackUsed as false for v2 flow", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.meta.fallbackUsed).toBe(false);
    });

    it("should include complete phaseTimings", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      const timings = result.meta.phaseTimings;
      expect(timings).toBeDefined();
      expect(typeof timings.opportunityMs).toBe("number");
      expect(typeof timings.candidateMs).toBe("number");
      expect(typeof timings.rankingMs).toBe("number");
      expect(typeof timings.totalMs).toBe("number");
    });

    it("should have totalMs >= sum of phase timings", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      const timings = result.meta.phaseTimings;
      const sumOfPhases =
        timings.opportunityMs + timings.candidateMs + timings.rankingMs;

      // totalMs should be at least the sum (with small tolerance for floating point)
      expect(timings.totalMs).toBeGreaterThanOrEqual(sumOfPhases - 1);
    });
  });

  describe("Phase timing measurements", () => {
    it("should record non-negative opportunity phase time", async () => {
      const result = await decideAdV2("hello", "eng");
      expect(result.meta.phaseTimings.opportunityMs).toBeGreaterThanOrEqual(0);
    });

    it("should record candidate phase time when candidates are generated", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
      ]);

      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.meta.phaseTimings.candidateMs).toBeGreaterThanOrEqual(0);
    });

    it("should record ranking phase time when ranking occurs", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
        createMockAd("ad2", { tags: ["travel"] }),
      ]);

      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng"
      );

      expect(result.meta.phaseTimings.rankingMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("End-to-end scenarios", () => {
    it("Scenario 1: High intent user gets ad", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("premium-ad", {
          tags: ["hotel", "travel", "discount"],
          cpc: 2.0,
          baseCTR: 0.05,
        }),
      ]);

      const result = await decideAdV2(
        "I want to purchase a hotel room with discount for my travel",
        "eng"
      );

      expect(result.ad).not.toBeNull();
      expect(result.meta.oppIntent).toBe("high_commercial");
      expect(result.meta.oppScore).toBe(0.8);
    });

    it("Scenario 2: Greeting only results in no ad", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
      ]);

      const result = await decideAdV2("Hello! Good morning!", "eng");

      expect(result.ad).toBeNull();
      expect(result.meta.oppIntent).toBe("chitchat");
    });

    it("Scenario 3: Sensitive topic results in no ad", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["health", "therapy"] }),
      ]);

      const result = await decideAdV2(
        "I need help with my mental health and anxiety",
        "eng"
      );

      expect(result.ad).toBeNull();
      expect(result.meta.oppIntent).toBe("sensitive");
      expect(result.meta.oppScore).toBe(0);
    });

    it("Scenario 4: Medium intent with matching ad", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("matching-ad", { tags: ["hotel", "vacation"] }),
      ]);

      const result = await decideAdV2(
        "Looking for a nice hotel for my upcoming vacation trip",
        "eng"
      );

      expect(result.ad).not.toBeNull();
      expect(result.meta.oppIntent).toBe("medium_commercial");
    });

    it("Scenario 5: High intent but no matching ads", async () => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("unrelated", { tags: ["cars", "automotive"] }),
      ]);

      const result = await decideAdV2("I want to buy a new smartphone", "eng");

      expect(result.ad).toBeNull();
      expect(result.meta.oppIntent).toBe("high_commercial");
      expect(result.meta.candidateCount).toBe(0);
    });
  });

  describe("Fatigue handling", () => {
    beforeEach(() => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
        createMockAd("ad2", { tags: ["travel"], advertiserId: "adv-same" }),
        createMockAd("ad3", { tags: ["travel"], advertiserId: "adv-same" }),
      ]);
    });

    it("should accept recentAdIds parameter", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng",
        ["ad1"]
      );

      expect(result).toBeDefined();
    });

    it("should accept recentAdvertiserIds parameter", async () => {
      const result = await decideAdV2(
        "I want to purchase a travel package",
        "eng",
        [],
        ["adv-ad1"]
      );

      expect(result).toBeDefined();
    });
  });

  describe("Language handling", () => {
    beforeEach(() => {
      mockGetActiveAds.mockResolvedValue([
        createMockAd("ad1", { tags: ["travel"] }),
      ]);
    });

    it("should call toEnglish with correct parameters", async () => {
      // Use text that passes opportunity scoring (medium+ intent, 3+ words)
      const text = "purchase travel package now please";
      await decideAdV2(text, "jpn");

      expect(mockToEnglish).toHaveBeenCalledWith(text, "jpn");
    });

    it("should pass through English text", async () => {
      mockToEnglish.mockImplementation(async (text) => text);

      await decideAdV2("I want to purchase a travel package", "eng");

      expect(mockToEnglish).toHaveBeenCalledWith(
        "I want to purchase a travel package",
        "eng"
      );
    });
  });
});
