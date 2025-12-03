/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Public Entry Point
 * ----------------------------------------------------
 *
 * This file exposes the SDK's public API:
 *   - initialize(appId)
 *   - requestAd(options)
 *   - renderAd(ad, target)
 *   - showAd(options)
 *
 * Internal modules:
 *   client.ts   → API communication
 *   tracker.ts  → impression/click tracking
 *   renderer.ts → DOM generation
 */

import { initClient, requestAd as clientRequestAd } from "./core/client";
import { initTracker } from "./core/tracker";
import { renderActionCard } from "./core/renderer";
import type { Ad } from "./core/types";

/* ----------------------------------------------------
 * 1. Public: initialize(appId)
 * ---------------------------------------------------- */

/**
 * Initializes the SDK with required global settings.
 * Must be called before using any other function.
 */
export function initialize(appId: string, apiBaseUrl = "/api") {
  if (!appId) {
    throw new Error("CeedAds.initialize: appId is required");
  }

  initClient(appId, apiBaseUrl);

  // Tracker keeps global identifiers for event payloads
  initTracker({ appId });

  console.log(`[CeedAds] Initialized with appId=${appId}`);
}

/* ----------------------------------------------------
 * 2. Public: requestAd()
 * ---------------------------------------------------- */

/**
 * Requests an ad from the backend.
 * Does NOT render anything — purely retrieves the ad data.
 */
export async function requestAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  userId?: string;
}): Promise<{ ad: Ad | null; requestId: string | null }> {
  const result = await clientRequestAd(options);

  return {
    ad: result.ad ?? null,
    requestId: result.requestId ?? null,
  };
}

/* ----------------------------------------------------
 * 3. Public: renderAd(ad, targetElement)
 * ---------------------------------------------------- */

/**
 * Renders an Action Card using the given Ad and attaches
 * tracking events. Does NOT fetch a new ad.
 */
export function renderAd(
  ad: Ad,
  targetElement: HTMLElement,
  requestId: string | null = null,
) {
  return renderActionCard(ad, targetElement, requestId);
}

/* ----------------------------------------------------
 * 4. Public: showAd(options)
 * ---------------------------------------------------- */

/**
 * Convenience method:
 *   - fetch an ad
 *   - render it into the target element
 *   - automatically track impression + click
 *
 * This is the simplest and most common usage pattern.
 */
export async function showAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  targetElement: HTMLElement;
  userId?: string;
}) {
  // 1. Fetch ad
  const { ad, requestId } = await clientRequestAd({
    conversationId: options.conversationId,
    messageId: options.messageId,
    contextText: options.contextText,
    userId: options.userId,
  });

  if (!ad) {
    console.log("[CeedAds] No ad available");
    return;
  }

  // 2. Render it
  renderActionCard(ad, options.targetElement, requestId);

  console.log("[CeedAds] Ad rendered successfully");
}
