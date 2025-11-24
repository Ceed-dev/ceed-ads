import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { RequestLog } from "@/types";

/**
 * POST /api/request
 *
 * The main entrypoint for the Ceed Ads SDK.
 * Receives contextual text + identifiers, stores the request,
 * runs a minimal ad-decision process, and returns one ad (or null).
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

    const decidedAd = adsSnap.empty
      ? null
      : { id: adsSnap.docs[0].id, ...adsSnap.docs[0].data() };

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

    await db.collection("requests").add(requestDoc);

    // ---------------------------------------------------------
    // 5. Return response
    // ---------------------------------------------------------
    return NextResponse.json(
      {
        ok: true,
        ad: decidedAd ?? null,
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
