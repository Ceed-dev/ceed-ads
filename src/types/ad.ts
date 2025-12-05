/**
 * Defines the Firestore document structure and domain types
 * for ads within the Ceed Ads platform (MVP Version).
 *
 * In the MVP we support a single creative format: "action_card".
 * This ad type displays a text-based promotional card with a CTA button,
 * injected at the appropriate point in an AI conversation.
 *
 * This schema is intentionally minimal and can be safely expanded
 * as new ad formats or attribution logic are introduced.
 */

export type AdId = string;

/** Supported ad formats for the MVP (single format). */
export type AdFormat = "action_card";

/** Serving status for an ad. */
export type AdStatus = "active" | "paused" | "archived";

/** Audit timestamps grouped for clarity. */
export interface AdMeta {
  /** Creation timestamp. */
  createdAt: Date;
  /** Last modification timestamp. */
  updatedAt: Date;
}

/**
 * Firestore document shape for `ads/{adId}` (MVP).
 *
 * Only the essential fields required to serve a text-based Action Card
 * are included. Additional fields (analytics, multi-format creatives,
 * A/B variants, frequency capping, etc.) can be added later.
 */
export interface Ad {
  /** ID of the advertiser owning this ad. */
  advertiserId: string;

  /** Creative format: currently fixed to "action_card". */
  format: AdFormat;

  /** Short title shown on the card. */
  title: string;

  /** Body text describing the offer or message. */
  description: string;

  /** CTA button label. */
  ctaText: string;

  /** URL opened when the CTA is clicked. */
  ctaUrl: string;

  /** Contextual matching hints (keywords/topics). */
  tags: string[];

  /** Operational status for serving. */
  status: AdStatus;

  /** Metadata and timestamps. */
  meta: AdMeta;
}
