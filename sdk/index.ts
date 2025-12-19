/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Public Entry Point
 * ----------------------------------------------------
 *
 * This file exposes the SDK's public API:
 *
 *   - initialize(appId)
 *       → Sets up the SDK with your app ID and prepares internal state.
 *
 *   - requestAd(options)
 *       → Fetches an ad from the backend based on conversation context.
 *         (Does NOT render anything.)
 *
 *   - renderAd(ad, target)
 *       → Renders a given Ad object into a target DOM element.
 *         (Assumes you already fetched the ad.)
 *
 *   - showAd(options)
 *       → Convenience method that:
 *            1. Fetches an ad
 *            2. Renders it into the target
 *            3. Automatically tracks impression & click events
 *
 * Internal modules:
 *   client.ts   → API communication
 *   tracker.ts  → impression/click tracking
 *   renderer.ts → DOM generation
 */

import { initClient, requestAd as clientRequestAd } from "./core/client";
import { initTracker } from "./core/tracker";
import { renderActionCard } from "./core/renderer";
import type { ResolvedAd } from "./core/types";

/* ----------------------------------------------------
 * 1. Public: initialize(appId, apiBaseUrl?)
 * ----------------------------------------------------
 *
 * Initializes the Ceed Ads SDK.
 *
 * Behavior:
 * - `appId` is required.
 * - `apiBaseUrl` is optional.
 *   - If omitted, the SDK uses the internal default ("https://ceed-ads.vercel.app/api").
 *   - External developers normally do NOT set this.
 *   - Developers of Ceed Ads may override it for local testing
 *     or production deployments.
 *
 * After initialization:
 * - All requests sent by the SDK include the provided appId.
 * - Tracker is configured with app-level identifiers.
 */

export function initialize(appId: string, apiBaseUrl?: string) {
  if (!appId) {
    throw new Error("CeedAds.initialize: appId is required");
  }

  // Initialize HTTP client configuration.
  // If apiBaseUrl is undefined, client.ts falls back to its internal default.
  initClient(appId, apiBaseUrl);

  // Initialize event tracker (stores global identifiers).
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
}): Promise<{ ad: ResolvedAd | null; requestId: string | null }> {
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
  ad: ResolvedAd,
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
