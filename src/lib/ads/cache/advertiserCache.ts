import { db } from "@/lib/firebase-admin";
import type { Advertiser } from "@/types";

const TTL_MS = 60 * 1000;

interface CacheEntry {
  data: Advertiser;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function getAdvertiser(
  advertiserId: string
): Promise<Advertiser | null> {
  const now = Date.now();
  const cached = cache.get(advertiserId);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const doc = await db.collection("advertisers").doc(advertiserId).get();

  if (!doc.exists) {
    cache.delete(advertiserId);
    return null;
  }

  const data = doc.data()!;
  const advertiser: Advertiser = {
    ...data,
    meta: {
      createdAt: data.meta?.createdAt?.toDate() ?? new Date(),
      updatedAt: data.meta?.updatedAt?.toDate() ?? new Date(),
    },
  } as Advertiser;

  cache.set(advertiserId, {
    data: advertiser,
    expiresAt: now + TTL_MS,
  });

  return advertiser;
}

export function invalidateAdvertiserCache(advertiserId?: string): void {
  if (advertiserId) {
    cache.delete(advertiserId);
  } else {
    cache.clear();
  }
}
