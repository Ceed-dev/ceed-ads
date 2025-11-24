/**
 * Defines the Firestore document structure and domain types
 * for ad-event logs within the Ceed Ads platform (MVP).
 *
 * An event represents a user-visible outcome of an ad:
 * - "impression": the ad became visible to the user
 * - "click": the user tapped/clicked the CTA
 *
 * These events are essential for impression/click tracking,
 * CTR calculation, and advertiser performance reporting.
 *
 * The schema is intentionally minimal for MVP and can be safely expanded
 * as additional event types or metadata becomes necessary.
 */

export type EventId = string;

/** Types of ad events tracked in the MVP. */
export type EventType = "impression" | "click";

/** Timestamps for auditability. */
export interface EventMeta {
  /** Timestamp when the event was recorded. */
  createdAt: Date;
  /** Timestamp of the last modification. */
  updatedAt: Date;
}

/**
 * Firestore document shape for `events/{eventId}`.
 *
 * Records impressions and clicks tied to a specific ad delivery.
 * These entries allow us to compute performance metrics, attribute
 * results to advertisers, and maintain a clean event timeline.
 */
export interface EventLog {
  /** Type of event (shown or clicked). */
  type: EventType;

  /** ID of the ad associated with this event. */
  adId: string;

  /** ID of the advertiser who owns the ad. */
  advertiserId: string;

  /** ID of the request that originally served the ad. */
  requestId: string;

  /** Optional user identifier from the host chat app. */
  userId?: string;

  /** Optional chat session/conversation identifier. */
  conversationId?: string;

  /** Optional application identifier from the SDK client. */
  appId?: string;

  /** Metadata timestamps. */
  meta: EventMeta;
}
