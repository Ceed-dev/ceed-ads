/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Event Tracker
 * ----------------------------------------------------
 *
 * This module handles impression and click tracking.
 * It does NOT perform any DOM operations.
 * Network requests are delegated to client.ts.
 *
 * Responsibilities:
 *  - trackImpression(ad, requestId)
 *  - trackClick(ad, requestId)
 *
 * Both functions construct an EventPayload and send it
 * to the backend via client.sendEvent().
 */

import type { ResolvedAd, EventPayload } from "./types";
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
 * A set used to prevent duplicate impression tracking.
 * React StrictMode renders components twice in development,
 * which can cause impression events to fire multiple times.
 *
 * We store a unique key (adId + requestId) and ignore any
 * subsequent impression calls for the same ad instance.
 */
const sentImpressions = new Set<string>();

/**
 * Sends an impression event when an ad becomes visible.
 * Ensures that each ad/requestId pair only sends one impression.
 */
export async function trackImpression(
  ad: ResolvedAd,
  requestId: string | null,
) {
  if (!appId) {
    throw new Error("Tracker not initialized");
  }
  if (!requestId) {
    console.warn("trackImpression: requestId is null (MVP limitation)");
  }

  // Unique key identifying this ad instance
  const key = `${ad.id}:${requestId}`;

  // Prevent duplicate impressions (e.g., React StrictMode double render)
  if (sentImpressions.has(key)) {
    return;
  }

  sentImpressions.add(key);

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
export async function trackClick(ad: ResolvedAd, requestId: string | null) {
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

/* ----------------------------------------------------
 * Track Submit (for lead_gen format)
 * ---------------------------------------------------- */

/**
 * Sends a submit event when a lead_gen form is submitted.
 */
export async function trackSubmit(
  ad: ResolvedAd,
  requestId: string | null,
  email: string,
) {
  if (!appId) {
    throw new Error("Tracker not initialized");
  }
  if (!requestId) {
    console.warn("trackSubmit: requestId is null (MVP limitation)");
  }

  const payload: EventPayload = {
    type: "submit",
    adId: ad.id,
    advertiserId: ad.advertiserId,
    requestId: requestId ?? "unknown",
    appId,
    conversationId: conversationId ?? undefined,
    userId: userId ?? undefined,
    submittedEmail: email,
  };

  await sendEvent(payload);
}
