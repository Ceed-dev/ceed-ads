/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — API Client
 * ----------------------------------------------------
 *
 * This module handles all network communication from the
 * SDK to the Ceed Ads backend API.
 *
 * Responsibilities:
 *  - POST /api/requests  (fetch an ad)
 *  - POST /api/events   (send impression/click)
 *
 * No DOM operations, no event logic. Pure networking only.
 */
import type { Ad, RequestPayload, EventPayload } from "./types";
export declare function initClient(appId: string, apiBaseUrl?: string): void;
/**
 * Requests an ad from the backend using contextual info.
 */
export declare function requestAd(payload: Omit<RequestPayload, "sdkVersion" | "appId">): Promise<{
    ad: Ad | null;
    requestId: string | null;
}>;
/**
 * Sends an ad-related event: impression or click.
 */
export declare function sendEvent(event: EventPayload): Promise<void>;
