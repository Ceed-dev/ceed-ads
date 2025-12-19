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
import type { ResolvedAd } from "./types";
/**
 * Sets global identifiers for event tracking.
 * These values are reused every time we send an event.
 */
export declare function initTracker(options: {
    appId: string;
    conversationId?: string;
    userId?: string;
}): void;
/**
 * Sends an impression event when an ad becomes visible.
 * Ensures that each ad/requestId pair only sends one impression.
 */
export declare function trackImpression(ad: ResolvedAd, requestId: string | null): Promise<void>;
/**
 * Sends a click event when the CTA button is clicked.
 */
export declare function trackClick(ad: ResolvedAd, requestId: string | null): Promise<void>;
