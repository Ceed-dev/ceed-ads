/**
 * Defines the Firestore document structure and domain types
 * for advertisers within the Ceed Ads platform.
 *
 * An advertiser represents a brand, service, or organization
 * that owns and manages ads delivered through the system.
 *
 * This file provides type safety and clarity when reading or
 * writing advertiser-related data, and serves as the basis
 * for future extensions of advertiser functionality.
 */

export type AdvertiserId = string;

/** Serving status for an advertiser. */
export type AdvertiserStatus = "active" | "suspended";

/** Timestamps grouped for cleaner Firestore documents. */
export interface AdvertiserMeta {
  /** Creation timestamp. */
  createdAt: Date;
  /** Last modification timestamp. */
  updatedAt: Date;
}

/**
 * Firestore document shape for `advertisers/{advertiserId}` (MVP).
 *
 * Required fields only — optional advanced fields from the full spec
 * (brand, attributionDefaults, billing, stats, policy...) are omitted
 * for now and can be added later without breaking existing data.
 */
export interface Advertiser {
  /** Primary name of the advertiser (brand, service, or company). */
  name: string;

  /** Operational status flag. Controls whether ads can be served. */
  status: AdvertiserStatus;

  /** Metadata/timestamps for auditability. */
  meta: AdvertiserMeta;

  /** Optional website (lightweight brand information). */
  websiteUrl?: string;
}
