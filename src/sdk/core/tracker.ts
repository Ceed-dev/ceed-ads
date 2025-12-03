/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Event Tracker
 * ----------------------------------------------------
 *
 * This module handles impression and click tracking.
 * It does NOT perform any DOM operations or API logic.
 * Instead, it delegates API calls to client.ts.
 *
 * Responsibilities:
 *  - trackImpression(ad, requestId)
 *  - trackClick(ad, requestId)
 *
 * Both functions construct an EventPayload and send it
 * to the backend via client.sendEvent().
 */

import type { Ad, EventPayload } from "./types";
import { sendEvent } from "./client";

/* ----------------------------------------------------
 * Internal State
 * ---------------------------------------------------- */

let appId: string | null = null;
let conversationId: string | null = null;
let userId: string | null = null;

/* ----------------------------------------------------
 * Initialize tracker (called from SDK.initialize)
 * ---------------------------------------------------- */

/**
 * Sets global identifiers for event tracking.
 * These values are reused every time we send an event.
 */
export function initTracker(options: {
  appId: string;
  conversationId?: string;
  userId?: string;
}) {
  appId = options.appId ?? null;
  conversationId = options.conversationId ?? null;
  userId = options.userId ?? null;
}

/* ----------------------------------------------------
 * Track Impression
 * ---------------------------------------------------- */

/**
 * Sends an impression event when an ad becomes visible.
 */
export async function trackImpression(ad: Ad, requestId: string | null) {
  if (!appId) {
    throw new Error("Tracker not initialized");
  }
  if (!requestId) {
    console.warn("trackImpression: requestId is null (MVP limitation)");
  }

  const payload: EventPayload = {
    type: "impression",
    adId: ad.id,
    advertiserId: ad.advertiserId,
    requestId: requestId ?? "unknown",
    appId,
    conversationId: conversationId ?? undefined,
    userId: userId ?? undefined,
  };

  await sendEvent(payload);
}

/* ----------------------------------------------------
 * Track Click
 * ---------------------------------------------------- */

/**
 * Sends a click event when the CTA button is clicked.
 */
export async function trackClick(ad: Ad, requestId: string | null) {
  if (!appId) {
    throw new Error("Tracker not initialized");
  }
  if (!requestId) {
    console.warn("trackClick: requestId is null (MVP limitation)");
  }

  const payload: EventPayload = {
    type: "click",
    adId: ad.id,
    advertiserId: ad.advertiserId,
    requestId: requestId ?? "unknown",
    appId,
    conversationId: conversationId ?? undefined,
    userId: userId ?? undefined,
  };

  await sendEvent(payload);
}
