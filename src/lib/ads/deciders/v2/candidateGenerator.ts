import type { Ad } from "@/types";
import { getActiveAds } from "@/lib/ads/cache/adsCache";
import { toEnglish } from "@/lib/ads/deciders/toEnglish";
import type { ScoredCandidate, MatchSource } from "./types";

const TEXT_MATCH_MULTIPLIER = 0.5;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function scoreTagMatch(ad: Ad, keywords: string[]): number {
  const tags = ad.tags.map((tag) => tag.toLowerCase());
  let matches = 0;
  for (const keyword of keywords) {
    if (tags.includes(keyword)) {
      matches++;
    }
  }
  return matches;
}

function scoreTextMatch(ad: Ad, keywords: string[]): number {
  const titleEng = (ad.title.eng ?? "").toLowerCase();
  const descEng = (ad.description.eng ?? "").toLowerCase();
  const searchText = `${titleEng} ${descEng}`;

  let matches = 0;
  for (const keyword of keywords) {
    if (searchText.includes(keyword)) {
      matches++;
    }
  }
  return matches * TEXT_MATCH_MULTIPLIER;
}

export async function generateCandidates(
  contextText: string,
  language: string,
  formats?: string[]
): Promise<ScoredCandidate[]> {
  const englishText = await toEnglish(contextText, language);
  const keywords = tokenize(englishText);

  if (keywords.length === 0) {
    return [];
  }

  let ads = await getActiveAds();

  // Filter by formats if specified
  if (formats && formats.length > 0) {
    ads = ads.filter((ad) => formats.includes(ad.format));
  }

  if (ads.length === 0) {
    return [];
  }
  const candidates: ScoredCandidate[] = [];

  for (const ad of ads) {
    const tagScore = scoreTagMatch(ad, keywords);
    const textScore = scoreTextMatch(ad, keywords);

    if (tagScore > 0) {
      candidates.push({
        ad,
        score: tagScore,
        matchSource: "tag" as MatchSource,
      });
    } else if (textScore > 0) {
      candidates.push({
        ad,
        score: textScore,
        matchSource: "text" as MatchSource,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}
