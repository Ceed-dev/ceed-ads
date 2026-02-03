import { db } from "@/lib/firebase-admin";
import type { Ad } from "@/types";

const TTL_MS = 60 * 1000;

interface CacheEntry {
  data: Ad[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;

export async function getActiveAds(): Promise<Ad[]> {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  const snapshot = await db
    .collection("ads")
    .where("status", "==", "active")
    .get();

  const ads: Ad[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      meta: {
        createdAt: data.meta?.createdAt?.toDate() ?? new Date(),
        updatedAt: data.meta?.updatedAt?.toDate() ?? new Date(),
      },
    } as Ad;
  });

  cache = {
    data: ads,
    expiresAt: now + TTL_MS,
  };

  return ads;
}

export function invalidateAdsCache(): void {
  cache = null;
}
