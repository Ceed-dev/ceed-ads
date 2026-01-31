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
import {
  renderAd as coreRenderAd,
  renderActionCard,
  renderLeadGenCard,
  renderStaticCard,
  renderFollowupCard,
} from "./core/renderer";
import type { ResolvedAd, AdFormat } from "./core/types";

// Re-export types for SDK consumers
export type { ResolvedAd, AdFormat } from "./core/types";
export type {
  ResolvedLeadGenConfig,
  ResolvedFollowupConfig,
  StaticConfig,
} from "./core/types";

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
 *
 * @param options - Request options
 * @param options.formats - Accepted ad formats (optional, defaults to all)
 */
export async function requestAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  userId?: string;
  formats?: AdFormat[];
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
 * Renders an ad based on its format and attaches tracking events.
 * Supports: action_card, lead_gen, static, followup.
 */
export function renderAd(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null = null,
) {
  return coreRenderAd(ad, targetElement, requestId);
}

// Export individual renderers for advanced use cases
export { renderActionCard, renderLeadGenCard, renderStaticCard, renderFollowupCard };

/* ----------------------------------------------------
 * 4. Public: showAd(options)
 * ---------------------------------------------------- */

/**
 * Convenience method:
 *   - fetch an ad
 *   - render it into the target element (format-aware)
 *   - automatically track impression + click/submit
 *
 * This is the simplest and most common usage pattern.
 *
 * @param options - Show ad options
 * @param options.formats - Accepted ad formats (optional, defaults to all)
 *
 * @example
 * ```typescript
 * await showAd({
 *   conversationId: "chat-123",
 *   messageId: crypto.randomUUID(),
 *   contextText: userMessage,
 *   targetElement: document.getElementById("ad-slot"),
 *   formats: ["action_card", "lead_gen"]  // Only accept these formats
 * });
 * ```
 */
export async function showAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  targetElement: HTMLElement;
  userId?: string;
  formats?: AdFormat[];
}) {
  // 1. Fetch ad
  const { ad, requestId } = await clientRequestAd({
    conversationId: options.conversationId,
    messageId: options.messageId,
    contextText: options.contextText,
    userId: options.userId,
    formats: options.formats,
  });

  if (!ad) {
    console.log("[CeedAds] No ad available");
    return;
  }

  // 2. Render based on format
  coreRenderAd(ad, options.targetElement, requestId);

  console.log(`[CeedAds] Ad (${ad.format}) rendered successfully`);
}
