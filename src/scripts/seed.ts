/**
 * Seed script for Firestore (development only).
 *
 * - Inserts minimal initial data:
 *   1. One advertiser ("Demo Advertiser")
 *   2. One ad (action_card) belonging to the advertiser
 *
 * This script ensures that development can start with
 * predictable Firestore data and can be safely re-run.
 */

import "dotenv/config";
import { db } from "@/lib/firebase-admin";
import type { Ad, Advertiser } from "@/types";

async function seed() {
  console.log("== Running Firestore seed script ==");

  // ---------------------------------------------------------------------------
  // 1. Create advertiser (if not exists)
  // ---------------------------------------------------------------------------
  const advertisersRef = db.collection("advertisers");

  const existingAdvertisers = await advertisersRef
    .where("name", "==", "Demo Advertiser")
    .get();

  let advertiserId: string;

  if (existingAdvertisers.empty) {
    const now = new Date();

    const advertiserDoc: Advertiser = {
      name: "Demo Advertiser",
      status: "active",
      websiteUrl: "https://example.com",
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    };

    const created = await advertisersRef.add(advertiserDoc);
    advertiserId = created.id;

    console.log(`Created advertiser: ${advertiserId}`);
  } else {
    advertiserId = existingAdvertisers.docs[0].id;
    console.log(`Found existing advertiser: ${advertiserId}`);
  }

  // ---------------------------------------------------------------------------
  // 2. Create demo ad (if not exists)
  // ---------------------------------------------------------------------------
  const adsRef = db.collection("ads");

  const existingAds = await adsRef
    .where("advertiserId", "==", advertiserId)
    .where("title", "==", "Demo AI Course")
    .get();

  if (existingAds.empty) {
    const now = new Date();

    const adDoc: Ad = {
      advertiserId,
      format: "action_card",
      title: "Demo AI Course",
      description: "Experience a conversational AI course with a free trial.",
      ctaText: "Start free trial",
      ctaUrl: "https://example.com/signup",
      status: "active",
      tags: ["ai", "education", "trial"],
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    };

    const createdAd = await adsRef.add(adDoc);
    console.log(`Created demo ad: ${createdAd.id}`);
  } else {
    console.log("Demo ad already exists. Skipping ad creation.");
  }

  console.log("== Firestore seed script finished ==");
}

seed()
  .then(() => {
    console.log("Seed completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
