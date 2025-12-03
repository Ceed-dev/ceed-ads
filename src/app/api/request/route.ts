import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { RequestLog } from "@/types";
import {
  decideAdByKeyword,
  type DecidedAd,
} from "@/lib/ads/deciders/keywordBased";

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
    // 3. Decide Ad using keyword-based logic (MVP)
    // ---------------------------------------------------------
    const decidedAd: DecidedAd | null = await decideAdByKeyword(contextText);

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
