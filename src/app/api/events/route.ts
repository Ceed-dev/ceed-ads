import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { EventLog, EventType } from "@/types";

/**
 * Removes any keys with `undefined` values.
 * Ensures the resulting object is Firestore-safe.
 */
function clean<T extends object>(obj: T): T {
  const cleaned: Partial<T> = {};

  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });

  return cleaned as T;
}

/**
 * POST /api/events
 *
 * Records an ad-related event (impression or click) into Firestore.
 * Automatically triggered by the SDK when:
 *  - The ad becomes visible to the user ("impression")
 *  - The user taps/clicks the ad ("click")
 *
 * This endpoint forms the foundation of CTR calculation,
 * advertiser performance analytics, and future reporting features.
 */
export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. Parse and validate request body
    // ------------------------------------------------------------------
    const body = await req.json();

    const {
      type,
      adId,
      advertiserId,
      requestId,
      userId,
      conversationId,
      appId,
    } = body;

    // Basic validation (MVP minimum)
    if (!type || !adId || !advertiserId || !requestId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate event type
    const validTypes: EventType[] = ["impression", "click"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // 2. Prepare and clean Firestore document
    // ------------------------------------------------------------------
    const now = new Date();

    const eventDoc: EventLog = {
      type,
      adId,
      advertiserId,
      requestId,
      userId,
      conversationId,
      appId,
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    };

    // Remove undefined fields
    const cleaned = clean(eventDoc);

    // Write to Firestore
    const ref = await db.collection("events").add(cleaned);

    // ------------------------------------------------------------------
    // 3. Return success response
    // ------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        eventId: ref.id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
