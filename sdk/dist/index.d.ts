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
import { renderActionCard, renderLeadGenCard, renderStaticCard, renderFollowupCard } from "./core/renderer";
import type { ResolvedAd, AdFormat } from "./core/types";
export type { ResolvedAd, AdFormat } from "./core/types";
export type { ResolvedLeadGenConfig, ResolvedFollowupConfig, StaticConfig, } from "./core/types";
export declare function initialize(appId: string, apiBaseUrl?: string): void;
/**
 * Requests an ad from the backend.
 * Does NOT render anything — purely retrieves the ad data.
 *
 * @param options - Request options
 * @param options.formats - Accepted ad formats (optional, defaults to all)
 */
export declare function requestAd(options: {
    conversationId: string;
    messageId: string;
    contextText: string;
    userId?: string;
    formats?: AdFormat[];
}): Promise<{
    ad: ResolvedAd | null;
    requestId: string | null;
}>;
/**
 * Renders an ad based on its format and attaches tracking events.
 * Supports: action_card, lead_gen, static, followup.
 */
export declare function renderAd(ad: ResolvedAd, targetElement: HTMLElement, requestId?: string | null): import("./core/types").RenderedAd;
export { renderActionCard, renderLeadGenCard, renderStaticCard, renderFollowupCard };
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
export declare function showAd(options: {
    conversationId: string;
    messageId: string;
    contextText: string;
    targetElement: HTMLElement;
    userId?: string;
    formats?: AdFormat[];
}): Promise<void>;
