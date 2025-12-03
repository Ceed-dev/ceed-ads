import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { RequestLog } from "@/types";

/**
 * Shape of the ad returned from Firestore + advertiserName.
 * This extends the base Ad with one extra field.
 */
interface DecidedAd {
  id: string;
  advertiserId: string;
  advertiserName: string;
  format: "action_card";
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  tags: string[];
  status: "active" | "paused" | "archived";
}

/**
 * POST /api/request
 *
 * Main entrypoint used by the Ceed Ads SDK.
 * - Validates request
 * - Fetches an active ad
 * - Fetches advertiser data to attach name
 * - Stores request log
 * - Returns decided ad + requestId
 */
export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Parse request body
    // ---------------------------------------------------------
    const body = await req.json();

    const {
      appId,
      conversationId,
      messageId,
      contextText,
      language = "ja",
      userId,
      sdkVersion,
    } = body;

    // ---------------------------------------------------------
    // 2. Minimal validation
    // ---------------------------------------------------------
    if (!appId || !conversationId || !messageId || !contextText) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 3. Decide Ad (MVP version)
    //    For now, return the first active ad.
    // ---------------------------------------------------------
    const adsSnap = await db
      .collection("ads")
      .where("status", "==", "active")
      .limit(1)
      .get();

    let decidedAd: DecidedAd | null = null;

    if (!adsSnap.empty) {
      const raw = adsSnap.docs[0];
      const rawAd = {
        id: raw.id,
        ...(raw.data() as Omit<DecidedAd, "id" | "advertiserName">),
      };

      // Fetch advertiser info
      const advSnap = await db
        .collection("advertisers")
        .doc(rawAd.advertiserId)
        .get();

      const advData = advSnap.exists ? advSnap.data() : null;

      decidedAd = {
        ...rawAd,
        advertiserName: advData?.name ?? "Advertiser",
      };
    }

    // ---------------------------------------------------------
    // 4. Store Request Log
    // ---------------------------------------------------------
    const now = new Date();

    const requestDoc: RequestLog = {
      appId,
      conversationId,
      messageId,
      contextText,
      language,
      status: decidedAd ? "success" : "no_ad",
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    };

    if (decidedAd) requestDoc.decidedAdId = decidedAd.id;
    if (sdkVersion) requestDoc.sdkVersion = sdkVersion;
    if (userId) requestDoc.userId = userId;

    const requestRef = await db.collection("requests").add(requestDoc);

    // ---------------------------------------------------------
    // 5. Return response
    // ---------------------------------------------------------
    return NextResponse.json(
      {
        ok: true,
        ad: decidedAd ?? null,
        requestId: requestRef.id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in /api/request:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
