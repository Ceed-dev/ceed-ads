/**
 * @fileoverview Firestore document structure and domain types for ads.
 * @module types/ad
 *
 * This module defines the core data structures for ads within the Ceed Ads platform.
 *
 * Supported ad formats:
 * - `action_card`: Text-based promotional card with a CTA button (default)
 * - `lead_gen`: Email collection form for lead generation
 * - `static`: Display ad for page load targeting
 * - `followup`: Sponsored question format for conversation flow
 *
 * @remarks
 * This schema aligns with ads-dashboard type definitions to ensure
 * consistency across the platform.
 */

/* ============================================================
 * BASE TYPES
 * ============================================================ */

/** Unique identifier for an ad document. */
export type AdId = string;

/**
 * Supported ad formats.
 *
 * - `action_card`: Default format with title, description, and CTA button
 * - `lead_gen`: Email collection form for lead generation
 * - `static`: Display ad for page load targeting
 * - `followup`: Sponsored question card for conversation flow
 */
export type AdFormat = "action_card" | "lead_gen" | "static" | "followup";

/**
 * Supported locale codes for content localization.
 * Based on franc library output codes.
 */
export type LocaleCode = "eng" | "jpn";

/**
 * Serving status for an ad.
 *
 * - `active`: Ad is eligible to be served
 * - `paused`: Ad is temporarily disabled
 * - `archived`: Ad is permanently disabled
 */
export type AdStatus = "active" | "paused" | "archived";

/**
 * Audit timestamps for tracking document changes.
 */
export interface AdMeta {
  /** When the ad was created */
  createdAt: Date;
  /** When the ad was last modified */
  updatedAt: Date;
}

/**
 * Represents localized text keyed by language code.
 * Language codes follow franc library output (e.g., "eng", "jpn").
 *
 * @example
 * ```typescript
 * const title: LocalizedText = {
 *   eng: "Sign up now",
 *   jpn: "今すぐ登録"
 * };
 * ```
 */
export type LocalizedText = Partial<Record<LocaleCode, string>>;

/* ============================================================
 * FORMAT-SPECIFIC CONFIGURATIONS (Firestore Schema)
 * ============================================================ */

/**
 * Autocomplete type for lead_gen form inputs.
 * Maps to HTML autocomplete attribute values.
 */
export type AutocompleteType = "email" | "name" | "tel" | "off";

/**
 * Configuration for lead_gen format stored in Firestore.
 * All text fields support multiple languages.
 */
export interface LeadGenConfig {
  /** Input field placeholder text */
  placeholder: LocalizedText;
  /** Submit button label */
  submitButtonText: LocalizedText;
  /** HTML autocomplete attribute value */
  autocompleteType: AutocompleteType;
  /** Message shown after successful submission */
  successMessage: LocalizedText;
}

/**
 * Display position for static format ads.
 * Indicates where on the page the ad should appear.
 */
export type DisplayPosition = "top" | "bottom" | "inline" | "sidebar";

/**
 * Targeting parameters for static format ads.
 * Used by the ad decision logic for targeting.
 */
export interface StaticTargetingParams {
  /** Keywords for contextual targeting */
  keywords?: string[];
  /** Geographic targeting (country/region codes) */
  geo?: string[];
  /** Device type targeting */
  deviceTypes?: ("desktop" | "mobile" | "tablet")[];
}

/**
 * Configuration for static format stored in Firestore.
 * No localization needed as these are targeting parameters.
 */
export interface StaticConfig {
  /** Where the ad should be displayed on the page */
  displayPosition: DisplayPosition;
  /** Optional targeting parameters */
  targetingParams?: StaticTargetingParams;
}

/**
 * Tap action type for followup format.
 *
 * - `expand`: Expand to show more content
 * - `redirect`: Open a URL in a new tab
 * - `submit`: Submit data to the backend
 */
export type FollowupTapAction = "expand" | "redirect" | "submit";

/**
 * Configuration for followup format stored in Firestore.
 * Question text supports multiple languages.
 */
export interface FollowupConfig {
  /** The sponsored question text */
  questionText: LocalizedText;
  /** Action to take when the card is tapped */
  tapAction: FollowupTapAction;
  /** URL to open when tapAction is "redirect" */
  tapActionUrl?: string;
}

/* ============================================================
 * AD DOCUMENT (Firestore Schema)
 * ============================================================ */

/**
 * Firestore document shape for `ads/{adId}`.
 *
 * This is the complete ad document structure stored in Firestore.
 * Supports multiple ad formats with format-specific configurations.
 *
 * @example
 * ```typescript
 * const ad: Ad = {
 *   advertiserId: "adv-123",
 *   format: "action_card",
 *   title: { eng: "Special Offer", jpn: "特別オファー" },
 *   description: { eng: "Get 20% off!", jpn: "20%オフ！" },
 *   ctaText: { eng: "Shop Now", jpn: "今すぐ購入" },
 *   ctaUrl: "https://example.com/offer",
 *   tags: ["shopping", "discount"],
 *   status: "active",
 *   meta: { createdAt: new Date(), updatedAt: new Date() }
 * };
 * ```
 */
export interface Ad {
  /** ID of the advertiser owning this ad */
  advertiserId: string;

  /** Creative format type */
  format: AdFormat;

  /** Short title shown on the card (multi-language) */
  title: LocalizedText;

  /** Body text describing the offer or message (multi-language) */
  description: LocalizedText;

  /** CTA button label (multi-language) */
  ctaText: LocalizedText;

  /** URL opened when the CTA is clicked */
  ctaUrl: string;

  /** Contextual matching hints (keywords/topics) for ad selection */
  tags: string[];

  /** Operational status for serving */
  status: AdStatus;

  /** Metadata and timestamps */
  meta: AdMeta;

  /** Configuration for lead_gen format (required if format is "lead_gen") */
  leadGenConfig?: LeadGenConfig;

  /** Configuration for static format (optional) */
  staticConfig?: StaticConfig;

  /** Configuration for followup format (required if format is "followup") */
  followupConfig?: FollowupConfig;

  /** Cost per click in USD (v2 ranking) */
  cpc?: number;

  /** Base click-through rate (v2 ranking) */
  baseCTR?: number;
}

/* ============================================================
 * RESOLVED CONFIGURATIONS (Single Language)
 * ============================================================ */

/**
 * Resolved lead_gen configuration with all text resolved to a single language.
 * Created by the backend when serving an ad.
 */
export interface ResolvedLeadGenConfig {
  /** Input field placeholder text */
  placeholder: string;
  /** Submit button label */
  submitButtonText: string;
  /** HTML autocomplete attribute value */
  autocompleteType: AutocompleteType;
  /** Message shown after successful submission */
  successMessage: string;
}

/**
 * Resolved followup configuration with all text resolved to a single language.
 * Created by the backend when serving an ad.
 */
export interface ResolvedFollowupConfig {
  /** The sponsored question text */
  questionText: string;
  /** Action to take when the card is tapped */
  tapAction: FollowupTapAction;
  /** URL to open when tapAction is "redirect" */
  tapActionUrl?: string;
}

/* ============================================================
 * RESOLVED AD (API Response)
 * ============================================================ */

/**
 * Client-ready ad payload with all text resolved to a single language.
 *
 * This is returned by the ad decision logic (`/api/requests`) and consumed
 * by SDKs and clients. The backend resolves all LocalizedText fields to
 * the detected user language.
 *
 * @remarks
 * This type intentionally excludes:
 * - Localization maps (pre-resolved)
 * - Internal matching tags (server-side only)
 * - Ad status / metadata (not needed for rendering)
 *
 * @example
 * ```typescript
 * const resolvedAd: ResolvedAd = {
 *   id: "ad-123",
 *   advertiserId: "adv-456",
 *   advertiserName: "Example Corp",
 *   format: "action_card",
 *   title: "Special Offer",
 *   description: "Get 20% off today!",
 *   ctaText: "Shop Now",
 *   ctaUrl: "https://example.com/offer"
 * };
 * ```
 */
export interface ResolvedAd {
  /** Firestore document ID of the ad */
  id: string;

  /** ID of the advertiser owning this ad */
  advertiserId: string;

  /** Human-readable advertiser name */
  advertiserName: string;

  /** Creative format type */
  format: AdFormat;

  /** Title resolved to the detected language */
  title: string;

  /** Description resolved to the detected language */
  description: string;

  /** CTA button label resolved to the detected language */
  ctaText: string;

  /** Destination URL opened when CTA is clicked */
  ctaUrl: string;

  /** Resolved lead_gen configuration (required if format is "lead_gen") */
  leadGenConfig?: ResolvedLeadGenConfig;

  /** Static configuration (no localization needed) */
  staticConfig?: StaticConfig;

  /** Resolved followup configuration (required if format is "followup") */
  followupConfig?: ResolvedFollowupConfig;
}
