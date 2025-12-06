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
import { sendEvent } from "./client";
/* ----------------------------------------------------
 * Internal State
 * ---------------------------------------------------- */
let appId = null;
let conversationId = null;
let userId = null;
/* ----------------------------------------------------
 * Initialize tracker (called from SDK.initialize)
 * ---------------------------------------------------- */
/**
 * Sets global identifiers for event tracking.
 * These values are reused every time we send an event.
 */
export function initTracker(options) {
    var _a, _b, _c;
    appId = (_a = options.appId) !== null && _a !== void 0 ? _a : null;
    conversationId = (_b = options.conversationId) !== null && _b !== void 0 ? _b : null;
    userId = (_c = options.userId) !== null && _c !== void 0 ? _c : null;
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
const sentImpressions = new Set();
/**
 * Sends an impression event when an ad becomes visible.
 * Ensures that each ad/requestId pair only sends one impression.
 */
export async function trackImpression(ad, requestId) {
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
    const payload = {
        type: "impression",
        adId: ad.id,
        advertiserId: ad.advertiserId,
        requestId: requestId !== null && requestId !== void 0 ? requestId : "unknown",
        appId,
        conversationId: conversationId !== null && conversationId !== void 0 ? conversationId : undefined,
        userId: userId !== null && userId !== void 0 ? userId : undefined,
    };
    await sendEvent(payload);
}
/* ----------------------------------------------------
 * Track Click
 * ---------------------------------------------------- */
/**
 * Sends a click event when the CTA button is clicked.
 */
export async function trackClick(ad, requestId) {
    if (!appId) {
        throw new Error("Tracker not initialized");
    }
    if (!requestId) {
        console.warn("trackClick: requestId is null (MVP limitation)");
    }
    const payload = {
        type: "click",
        adId: ad.id,
        advertiserId: ad.advertiserId,
        requestId: requestId !== null && requestId !== void 0 ? requestId : "unknown",
        appId,
        conversationId: conversationId !== null && conversationId !== void 0 ? conversationId : undefined,
        userId: userId !== null && userId !== void 0 ? userId : undefined,
    };
    await sendEvent(payload);
}
