/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Core Type Definitions
 * ----------------------------------------------------
 *
 * This file centralizes all type definitions used
 * internally within the SDK. It does not contain any
 * logic. Keeping types isolated improves clarity,
 * reusability, and maintainability across modules.
 *
 * The types here align directly with the server-side
 * API schema (ads, requests, events).
 */

/* ----------------------------------------------------
 * 1. Ad (Returned from /api/request)
 * ---------------------------------------------------- */

/**
 * Represents a single Action Card ad.
 * Returned by `/api/request` and used for rendering.
 */
export interface Ad {
  id: string; // Firestore document ID
  advertiserId: string;
  format: "action_card";
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  tags: string[];
  status: "active" | "paused" | "archived";
}

/* ----------------------------------------------------
 * 2. Request Payload (SDK → /api/request)
 * ---------------------------------------------------- */

/**
 * Payload sent by the SDK when requesting an ad.
 * Matches the server-side RequestLog schema.
 */
export interface RequestPayload {
  appId: string;
  conversationId: string;
  messageId: string;
  contextText: string;
  language?: string;
  userId?: string;
  sdkVersion: string;
}

/* ----------------------------------------------------
 * 3. Event Payload (SDK → /api/events)
 * ---------------------------------------------------- */

/**
 * Represents an ad-related event (impression or click).
 * Sent from the SDK to `/api/events`.
 */
export interface EventPayload {
  type: "impression" | "click";
  adId: string;
  advertiserId: string;
  requestId: string;
  appId: string;
  conversationId?: string;
  userId?: string;
}

/* ----------------------------------------------------
 * 4. Internal SDK Config
 * ---------------------------------------------------- */

/**
 * Internal state stored in the SDK after initialize().
 * Not exposed to external developers.
 */
export interface SDKConfig {
  appId: string | null;
  apiBaseUrl: string; // e.g., "/api"
  sdkVersion: string;
  initialized: boolean;
}

/* ----------------------------------------------------
 * 5. Rendered Ad Result (Renderer → Caller)
 * ---------------------------------------------------- */

/**
 * Result returned from the renderer.
 * Contains the DOM element so tracking can attach events.
 */
export interface RenderedAd {
  rootElement: HTMLElement; // The card's root DOM node
  ad: Ad; // The ad that was rendered
  requestId: string; // Used for event tracking
}
