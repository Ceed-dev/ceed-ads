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

import type { Ad, RequestPayload, EventPayload, SDKConfig } from "./types";

/* ----------------------------------------------------
 * Internal SDK State (Populated by initialize())
 * ---------------------------------------------------- */

const config: SDKConfig = {
  appId: null,
  /**
   * Default SDK configuration.
   *
   * NOTE:
   * - `apiBaseUrl` defaults to "/api" for local development inside the Ceed Ads monorepo.
   * - After deploying the backend (e.g., to Vercel), this value must be updated
   *   to the production API URL (e.g., "https://yourdomain.com/api").
   * - External developers typically should NOT change this value unless
   *   they are using a custom proxy or local testing environment.
   */
  apiBaseUrl: "/api",
  sdkVersion: "1.0.0",
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

export function initClient(appId: string, apiBaseUrl?: string) {
  config.appId = appId;
  config.initialized = true;

  // Allow override only when a value is explicitly provided
  if (apiBaseUrl) {
    config.apiBaseUrl = apiBaseUrl;
  }
}

/* ----------------------------------------------------
 * Public: Request an Ad
 * Calls POST /api/requests
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

  const url = `${config.apiBaseUrl}/requests`;

  const response = await postJSON<{
    ok: boolean;
    ad: Ad | null;
    requestId: string | null;
  }>(url, mergedPayload);

  // requestId is returned by the backend and used for event tracking.
  return {
    ad: response.ad,
    requestId: response.requestId,
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
