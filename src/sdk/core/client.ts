/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — API Client
 * ----------------------------------------------------
 *
 * This module handles all network communication from the
 * SDK to the Ceed Ads backend API.
 *
 * Responsibilities:
 *  - POST /api/request  (fetch an ad)
 *  - POST /api/events   (send impression/click)
 *
 * No DOM operations, no event logic. Pure networking only.
 */

import type { Ad, RequestPayload, EventPayload, SDKConfig } from "./types";

/* ----------------------------------------------------
 * Internal SDK State (Populated by initialize())
 * ---------------------------------------------------- */

const config: SDKConfig = {
  appId: null,
  apiBaseUrl: "/api",
  sdkVersion: "0.1.0",
  initialized: false,
};

/* ----------------------------------------------------
 * Internal Helper — POST Wrapper
 * ---------------------------------------------------- */

/**
 * Executes a POST request with JSON payload.
 */
async function postJSON<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/* ----------------------------------------------------
 * Public: initialize client config
 * Called from SDK.initialize()
 * ---------------------------------------------------- */

export function initClient(appId: string, apiBaseUrl = "/api") {
  config.appId = appId;
  config.apiBaseUrl = apiBaseUrl;
  config.initialized = true;
}

/* ----------------------------------------------------
 * Public: Request an Ad
 * Calls POST /api/request
 * ---------------------------------------------------- */

/**
 * Requests an ad from the backend using contextual info.
 */
export async function requestAd(
  payload: Omit<RequestPayload, "sdkVersion" | "appId">,
): Promise<{ ad: Ad | null; requestId: string | null }> {
  if (!config.initialized || !config.appId) {
    throw new Error("CeedAds SDK not initialized");
  }

  const mergedPayload: RequestPayload = {
    ...payload,
    appId: config.appId,
    sdkVersion: config.sdkVersion,
  };

  const url = `${config.apiBaseUrl}/request`;

  const response = await postJSON<{
    ok: boolean;
    ad: Ad | null;
  }>(url, mergedPayload);

  // NOTE: In MVP, requestId is stored in Firestore
  // but not yet returned by API. We return null for now.
  return {
    ad: response.ad,
    requestId: null, // Will be supported when backend returns it
  };
}

/* ----------------------------------------------------
 * Public: Send impression/click events
 * Calls POST /api/events
 * ---------------------------------------------------- */

/**
 * Sends an ad-related event: impression or click.
 */
export async function sendEvent(event: EventPayload): Promise<void> {
  if (!config.initialized || !config.appId) {
    throw new Error("CeedAds SDK not initialized");
  }

  const url = `${config.apiBaseUrl}/events`;

  await postJSON(url, event);

  // No return value needed for MVP
}
