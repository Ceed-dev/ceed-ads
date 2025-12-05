import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { RequestLog } from "@/types";
import {
  decideAdByKeyword,
  type DecidedAd,
} from "@/lib/ads/deciders/keywordBased";
import type { Timestamp } from "firebase-admin/firestore";

/* --------------------------------------------------------------------------
 * CORS CONFIG
 * --------------------------------------------------------------------------*/
const ALLOWED_ORIGIN = "*"; // MVP: allow all origins (SDK users)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * OPTIONS /api/requests
 * Needed for browser-based requests from external web apps using the SDK.
 */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/requests
 *
 * Main entrypoint used by the Ceed Ads SDK.
 *
 * Responsibilities:
 *  - Validate request payload
 *  - Apply per-conversation ad frequency control (cooldown)
 *  - Decide an ad using keyword-based logic
 *  - Store request log in Firestore
 *  - Return decided ad + requestId
 */
export async function POST(req: NextRequest) {
  try {
    /* ------------------------------------------------------------------
     * 1. Parse Request Body
     * ------------------------------------------------------------------*/
    const body = await req.json();

    const {
      appId,
      conversationId,
      messageId,
      contextText,
      language = "en",
      userId,
      sdkVersion = "1.0.0",
    } = body;

    /* ------------------------------------------------------------------
     * 2. Minimal Validation
     * ------------------------------------------------------------------*/
    if (!appId || !conversationId || !messageId || !contextText) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    /* ------------------------------------------------------------------
     * 3. Ad Frequency Control (Cooldown)
     *
     * Prevents showing ads too frequently in the same conversation.
     * Checks the latest request with status: "success".
     * ------------------------------------------------------------------*/
    const COOLDOWN_MS = 60 * 1000; // 60 seconds

    const latestSuccessSnap = await db
      .collection("requests")
      .where("conversationId", "==", conversationId)
      .where("status", "==", "success")
      .orderBy("meta.createdAt", "desc")
      .limit(1)
      .get();

    let decidedAd: DecidedAd | null = null;

    if (!latestSuccessSnap.empty) {
      // There is at least one previous successful ad shown in this conversation.
      const latestData = latestSuccessSnap.docs[0].data() as RequestLog;

      // Firestore may store timestamps as Date or Timestamp → normalize to Date.
      const rawCreatedAt = latestData.meta.createdAt as Date | Timestamp;
      const createdAt =
        rawCreatedAt instanceof Date ? rawCreatedAt : rawCreatedAt.toDate();

      const lastShownAt = createdAt.getTime();
      const nowTs = Date.now();
      const withinCooldown = nowTs - lastShownAt < COOLDOWN_MS;

      if (!withinCooldown) {
        // Cooldown expired → run normal ad decision
        decidedAd = await decideAdByKeyword(contextText);
      } else {
        // Cooldown active → do NOT show ad
        decidedAd = null;
      }
    } else {
      // No prior successful ads → run normal ad decision
      decidedAd = await decideAdByKeyword(contextText);
    }

    /* ------------------------------------------------------------------
     * 4. Store Request Log
     * ------------------------------------------------------------------*/
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

    // Optional fields
    if (decidedAd) requestDoc.decidedAdId = decidedAd.id;
    if (sdkVersion) requestDoc.sdkVersion = sdkVersion;
    if (userId) requestDoc.userId = userId;

    const requestRef = await db.collection("requests").add(requestDoc);

    /* ------------------------------------------------------------------
     * 5. Return Response
     * ------------------------------------------------------------------*/
    return NextResponse.json(
      {
        ok: true,
        ad: decidedAd ?? null,
        requestId: requestRef.id,
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error("Error in /api/request:", err);

    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
