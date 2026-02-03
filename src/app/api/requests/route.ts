import { NextRequest, NextResponse } from "next/server";
import { franc } from "franc";
import { db } from "@/lib/firebase-admin";
import type { RequestLog } from "@/types";
import { decideAdByKeyword } from "@/lib/ads/deciders/keywordBased";
import type { ResolvedAd } from "@/types";
import type { Timestamp } from "firebase-admin/firestore";
import { isV2Enabled, getV2TimeoutMs } from "@/lib/ads/featureFlags";
import { decideAdV2 } from "@/lib/ads/deciders/v2";
import type { V2DecisionMeta } from "@/lib/ads/deciders/v2/types";

/* --------------------------------------------------------------------------
 * CORS CONFIG
 * --------------------------------------------------------------------------*/
const ALLOWED_ORIGIN = "*"; // MVP: allow all origins (SDK users)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* --------------------------------------------------------------------------
 * AD DECISION WRAPPER (v1/v2 switch)
 * --------------------------------------------------------------------------*/
interface DecisionResult {
  ad: ResolvedAd | null;
  algorithmVersion: "v1" | "v2";
  v2Meta?: V2DecisionMeta;
}

async function decideAd(
  appId: string,
  contextText: string,
  language: string,
  recentAdIds: string[],
  recentAdvertiserIds: string[]
): Promise<DecisionResult> {
  if (!isV2Enabled(appId)) {
    const ad = await decideAdByKeyword(contextText, language);
    return { ad, algorithmVersion: "v1" };
  }

  const timeoutMs = getV2TimeoutMs();

  try {
    const v2Promise = decideAdV2(
      contextText,
      language,
      recentAdIds,
      recentAdvertiserIds
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("V2 timeout")), timeoutMs)
    );

    const result = await Promise.race([v2Promise, timeoutPromise]);
    return {
      ad: result.ad,
      algorithmVersion: "v2",
      v2Meta: result.meta,
    };
  } catch (error) {
    console.warn("[decideAd] V2 failed, falling back to V1:", error);
    const ad = await decideAdByKeyword(contextText, language);
    return { ad, algorithmVersion: "v1" };
  }
}

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
 *  - Detect message language on the server
 *  - Apply per-conversation ad frequency control (cooldown)
 *  - Decide an ad using keyword-based logic
 *    (including translation and localization)
 *  - Store request log in Firestore
 *  - Return a client-ready ad + requestId
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

    // Detect language on the server (source of truth)
    const detected = franc(contextText);

    // Store detected language (fallback only if undetermined)
    const language = detected === "und" ? "eng" : detected;

    /* ------------------------------------------------------------------
     * 3. Ad Frequency Control (Cooldown) & Recent Ads Collection
     *
     * Prevents showing ads too frequently in the same conversation.
     * Checks the latest request with status: "success".
     * Also collects recent ad/advertiser IDs for fatigue penalty.
     * ------------------------------------------------------------------*/
    const COOLDOWN_MS = 60 * 1000; // 60 seconds
    const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours for fatigue

    const recentSuccessSnap = await db
      .collection("requests")
      .where("conversationId", "==", conversationId)
      .where("status", "==", "success")
      .orderBy("meta.createdAt", "desc")
      .limit(10)
      .get();

    let decisionResult: DecisionResult | null = null;
    const recentAdIds: string[] = [];
    const recentAdvertiserIds: string[] = [];

    if (!recentSuccessSnap.empty) {
      const latestData = recentSuccessSnap.docs[0].data() as RequestLog;

      // Firestore may store timestamps as Date or Timestamp → normalize to Date.
      const rawCreatedAt = latestData.meta.createdAt as Date | Timestamp;
      const createdAt =
        rawCreatedAt instanceof Date ? rawCreatedAt : rawCreatedAt.toDate();

      const lastShownAt = createdAt.getTime();
      const nowTs = Date.now();
      const withinCooldown = nowTs - lastShownAt < COOLDOWN_MS;

      // Collect recent ad/advertiser IDs for fatigue penalty
      for (const doc of recentSuccessSnap.docs) {
        const data = doc.data() as RequestLog & { decidedAdvertiserId?: string };
        const rawTs = data.meta.createdAt as Date | Timestamp;
        const ts = rawTs instanceof Date ? rawTs : rawTs.toDate();
        if (nowTs - ts.getTime() < RECENT_WINDOW_MS) {
          if (data.decidedAdId) recentAdIds.push(data.decidedAdId);
          if (data.decidedAdvertiserId) recentAdvertiserIds.push(data.decidedAdvertiserId);
        }
      }

      if (!withinCooldown) {
        // Cooldown expired → run normal ad decision
        decisionResult = await decideAd(appId, contextText, language, recentAdIds, recentAdvertiserIds);
      } else {
        // Cooldown active → do NOT show ad
        decisionResult = null;
      }
    } else {
      // No prior successful ads → run normal ad decision
      decisionResult = await decideAd(appId, contextText, language, recentAdIds, recentAdvertiserIds);
    }

    const decidedAd = decisionResult?.ad ?? null;

    /* ------------------------------------------------------------------
     * 4. Store Request Log
     * ------------------------------------------------------------------*/
    const now = new Date();

    // Build base request document
    const requestDoc: RequestLog & {
      algorithmVersion?: "v1" | "v2";
      v2Meta?: V2DecisionMeta;
      decidedAdvertiserId?: string;
    } = {
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
    if (decidedAd) {
      requestDoc.decidedAdId = decidedAd.id;
      requestDoc.decidedAdvertiserId = decidedAd.advertiserId;
    }
    if (sdkVersion) requestDoc.sdkVersion = sdkVersion;
    if (userId) requestDoc.userId = userId;

    // V2 metadata
    if (decisionResult) {
      requestDoc.algorithmVersion = decisionResult.algorithmVersion;
      if (decisionResult.v2Meta) {
        requestDoc.v2Meta = decisionResult.v2Meta;
      }
    }

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
    console.error("Error in /api/requests:", err);

    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
