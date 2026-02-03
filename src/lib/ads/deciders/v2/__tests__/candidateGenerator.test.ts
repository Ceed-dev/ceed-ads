import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Ad } from "@/types";

// Mock dependencies before imports
vi.mock("@/lib/ads/cache/adsCache", () => ({
  getActiveAds: vi.fn(),
}));

vi.mock("@/lib/ads/deciders/toEnglish", () => ({
  toEnglish: vi.fn(),
}));

import { generateCandidates } from "../candidateGenerator";
import { getActiveAds } from "@/lib/ads/cache/adsCache";
import { toEnglish } from "@/lib/ads/deciders/toEnglish";

const mockedGetActiveAds = vi.mocked(getActiveAds);
const mockedToEnglish = vi.mocked(toEnglish);

function createMockAd(overrides: Partial<Ad> & { id?: string }): Ad & { id: string } {
  return {
    id: overrides.id ?? "ad-1",
    advertiserId: "adv-1",
    format: "action_card",
    title: { eng: "Default Title" },
    description: { eng: "Default Description" },
    ctaText: { eng: "Click" },
    ctaUrl: "https://example.com",
    tags: [],
    status: "active",
    meta: { createdAt: new Date(), updatedAt: new Date() },
    ...overrides,
  } as Ad & { id: string };
}

describe("candidateGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedToEnglish.mockImplementation(async (text) => text);
  });

  describe("Tag Matching", () => {
    it("should match exact tag", async () => {
      const ad = createMockAd({ tags: ["laptop"] });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("tag");
      expect(result[0].score).toBe(1);
    });

    it("should NOT match partial tag (laptops vs laptop)", async () => {
      const ad = createMockAd({ tags: ["laptop"] });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptops", "eng");

      expect(result).toHaveLength(0);
    });

    it("should NOT match substring (lap vs laptop)", async () => {
      const ad = createMockAd({ tags: ["laptop"] });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("lap", "eng");

      // "lap" is 3 chars, but tokenize filters words <= 2 chars
      // Actually "lap" is 3 chars so it passes filter
      expect(result).toHaveLength(0);
    });

    it("should match multiple tags and score correctly", async () => {
      const ad = createMockAd({ tags: ["laptop", "online", "sale"] });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("buy laptop online", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("tag");
      expect(result[0].score).toBe(2); // "laptop" and "online" match
    });

    it("should be case-insensitive", async () => {
      const ad = createMockAd({ tags: ["laptop"] });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("LAPTOP", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("tag");
    });
  });

  describe("Text Matching", () => {
    it("should match keyword in title.eng", async () => {
      const ad = createMockAd({
        tags: [],
        title: { eng: "Best Laptop Deals" },
      });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("text");
    });

    it("should match keyword in description.eng", async () => {
      const ad = createMockAd({
        tags: [],
        description: { eng: "Find the best laptop for your needs" },
      });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("text");
    });

    it("should score text match at 0.5x", async () => {
      const ad = createMockAd({
        tags: [],
        title: { eng: "laptop computer accessories" },
      });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop computer", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(1); // 2 matches * 0.5 = 1
    });
  });

  describe("Score Priority", () => {
    it("should prefer tag match over text match for same ad", async () => {
      const ad = createMockAd({
        tags: ["laptop"],
        title: { eng: "laptop deals" },
      });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop", "eng");

      expect(result).toHaveLength(1);
      expect(result[0].matchSource).toBe("tag");
    });

    it("should sort candidates by score descending", async () => {
      const ad1 = createMockAd({ id: "ad-1", tags: ["laptop"] }); // score: 1
      const ad2 = createMockAd({ id: "ad-2", tags: ["laptop", "buy", "online"] }); // score: 3
      const ad3 = createMockAd({ id: "ad-3", tags: ["laptop", "buy"] }); // score: 2
      mockedGetActiveAds.mockResolvedValue([ad1, ad2, ad3]);

      const result = await generateCandidates("buy laptop online", "eng");

      expect(result).toHaveLength(3);
      expect((result[0].ad as Ad & { id: string }).id).toBe("ad-2");
      expect(result[0].score).toBe(3);
      expect((result[1].ad as Ad & { id: string }).id).toBe("ad-3");
      expect(result[1].score).toBe(2);
      expect((result[2].ad as Ad & { id: string }).id).toBe("ad-1");
      expect(result[2].score).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array for empty context", async () => {
      mockedGetActiveAds.mockResolvedValue([createMockAd({})]);

      const result = await generateCandidates("", "eng");

      expect(result).toHaveLength(0);
    });

    it("should return empty array for short words only", async () => {
      mockedGetActiveAds.mockResolvedValue([createMockAd({ tags: ["a", "ab"] })]);

      const result = await generateCandidates("a ab", "eng");

      expect(result).toHaveLength(0);
    });

    it("should return empty array when no active ads", async () => {
      mockedGetActiveAds.mockResolvedValue([]);

      const result = await generateCandidates("laptop", "eng");

      expect(result).toHaveLength(0);
    });

    it("should return empty array when no matches", async () => {
      const ad = createMockAd({ tags: ["phone"], title: { eng: "Phone deals" } });
      mockedGetActiveAds.mockResolvedValue([ad]);

      const result = await generateCandidates("laptop computer", "eng");

      expect(result).toHaveLength(0);
    });

    it("should translate non-English text before matching", async () => {
      const ad = createMockAd({ tags: ["laptop"] });
      mockedGetActiveAds.mockResolvedValue([ad]);
      mockedToEnglish.mockResolvedValue("laptop computer");

      const result = await generateCandidates("ラップトップ コンピューター", "jpn");

      expect(mockedToEnglish).toHaveBeenCalledWith("ラップトップ コンピューター", "jpn");
      expect(result).toHaveLength(1);
    });
  });
});
