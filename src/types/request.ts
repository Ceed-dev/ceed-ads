/**
 * Defines the Firestore document structure and domain types
 * for ad-request logs within the Ceed Ads platform.
 *
 * A request represents a single call from the SDK or AI client
 * to the `/api/requests` endpoint, including the context that triggered
 * the call and the decision result returned by the backend.
 *
 * This schema is intentionally minimal for the MVP while still allowing
 * future expansion (e.g., attribution, model diagnostics, or richer context).
 */

import type { V2DecisionMeta } from "@/lib/ads/deciders/v2/types";

export type RequestId = string;

/** Processing result for an ad-decision request. */
export type RequestStatus = "success" | "no_ad" | "error";

/** Audit timestamps. */
export interface RequestMeta {
  /** Timestamp at which the request was recorded. */
  createdAt: Date;
  /** Timestamp of the last update. */
  updatedAt: Date;
}

/**
 * Firestore document shape for `requests/{requestId}`.
 *
 * Captures the context, identifiers, and decision outcome for each
 * invocation of `/api/requests`. This data allows later analysis of
 * contextual performance, model accuracy, and SDK/AI integration behavior.
 */
export interface RequestLog {
  /** ID of the SDK application making the request. */
  appId: string;

  /** Unique conversation/session identifier from the client side. */
  conversationId: string;

  /** ID of the user message that triggered the request. */
  messageId: string;

  /** Raw text context used for ad-decision. */
  contextText: string;

  /** Language code detected by `franc` (e.g., "eng", "jpn"). */
  language?: string;

  /** ID of the ad selected by the decision logic (if any). */
  decidedAdId?: string;

  /** Result of the request (success, no_ad, or error). */
  status: RequestStatus;

  /** Optional descriptive reason (e.g., "no matching tags"). */
  reason?: string;

  /** Client-side or backend latency for debugging/observability. */
  latencyMs?: number;

  /** SDK version of the client issuing the request. */
  sdkVersion?: string;

  /** User identifier provided by the host chat app (optional). */
  userId?: string;

  /** Metadata timestamps. */
  meta: RequestMeta;

  /** Algorithm version used for ad decision */
  algorithmVersion?: "v1" | "v2";

  /** V2 algorithm metadata (only if v2 used) */
  v2Meta?: V2DecisionMeta;
}
