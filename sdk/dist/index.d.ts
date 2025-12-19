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
import type { ResolvedAd } from "./core/types";
export declare function initialize(appId: string, apiBaseUrl?: string): void;
/**
 * Requests an ad from the backend.
 * Does NOT render anything — purely retrieves the ad data.
 */
export declare function requestAd(options: {
    conversationId: string;
    messageId: string;
    contextText: string;
    userId?: string;
}): Promise<{
    ad: ResolvedAd | null;
    requestId: string | null;
}>;
/**
 * Renders an Action Card using the given Ad and attaches
 * tracking events. Does NOT fetch a new ad.
 */
export declare function renderAd(ad: ResolvedAd, targetElement: HTMLElement, requestId?: string | null): import("./core/types").RenderedAd;
/**
 * Convenience method:
 *   - fetch an ad
 *   - render it into the target element
 *   - automatically track impression + click
 *
 * This is the simplest and most common usage pattern.
 */
export declare function showAd(options: {
    conversationId: string;
    messageId: string;
    contextText: string;
    targetElement: HTMLElement;
    userId?: string;
}): Promise<void>;
