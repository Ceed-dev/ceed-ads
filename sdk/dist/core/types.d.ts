/**
 * @fileoverview Ceed Ads Web SDK — Core Type Definitions
 * @module types
 *
 * This file centralizes all type definitions used internally within the SDK.
 * It does not contain any logic. Keeping types isolated improves clarity,
 * reusability, and maintainability across modules.
 *
 * @remarks
 * The types here align with the client-facing API responses and request/event
 * payloads. Firestore document schemas are intentionally not exposed to the SDK.
 *
 * Type categories:
 * 1. Ad Format Types - Format identifiers and enums
 * 2. Format-Specific Configurations - Config shapes for each format
 * 3. ResolvedAd - The main ad payload type
 * 4. Request/Event Payloads - API communication types
 * 5. Internal SDK types - Config and state management
 */
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
 * Autocomplete type for lead_gen form inputs.
 * Maps to HTML autocomplete attribute values.
 */
export type AutocompleteType = "email" | "name" | "tel" | "off";
/**
 * Tap action type for followup format.
 *
 * - `expand`: Expand to show more content (handled by host app)
 * - `redirect`: Open a URL in a new tab
 * - `submit`: Submit data (handled by host app)
 */
export type FollowupTapAction = "expand" | "redirect" | "submit";
/**
 * Display position for static format ads.
 * Indicates where on the page the ad should appear.
 */
export type DisplayPosition = "top" | "bottom" | "inline" | "sidebar";
/**
 * Resolved lead_gen configuration.
 * All text fields are resolved to a single language by the backend.
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
 * Targeting parameters for static format ads.
 * Used by the backend for ad selection.
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
 * Static format configuration.
 * No localization needed as these are targeting parameters.
 */
export interface StaticConfig {
    /** Where the ad should be displayed on the page */
    displayPosition: DisplayPosition;
    /** Optional targeting parameters */
    targetingParams?: StaticTargetingParams;
}
/**
 * Resolved followup configuration.
 * All text fields are resolved to a single language by the backend.
 */
export interface ResolvedFollowupConfig {
    /** The sponsored question text */
    questionText: string;
    /** Action to take when the card is tapped */
    tapAction: FollowupTapAction;
    /** URL to open when tapAction is "redirect" */
    tapActionUrl?: string;
}
/**
 * Client-ready ad payload returned from `/api/requests`.
 *
 * This is the primary ad type used by the SDK. All text fields
 * are pre-resolved to a single language by the backend based on
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
 * const ad: ResolvedAd = {
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
    /** Unique ad identifier */
    id: string;
    /** Advertiser who owns this ad */
    advertiserId: string;
    /** Display name of the advertiser */
    advertiserName: string;
    /** Ad format type */
    format: AdFormat;
    /** Ad title (resolved to single language) */
    title: string;
    /** Ad description (resolved to single language) */
    description: string;
    /** CTA button text (resolved to single language) */
    ctaText: string;
    /** URL to open when CTA is clicked */
    ctaUrl: string;
    /** Configuration for lead_gen format (required if format is "lead_gen") */
    leadGenConfig?: ResolvedLeadGenConfig;
    /** Configuration for static format (optional) */
    staticConfig?: StaticConfig;
    /** Configuration for followup format (required if format is "followup") */
    followupConfig?: ResolvedFollowupConfig;
}
/**
 * Payload sent by the SDK when requesting an ad.
 * Sent to POST /api/requests.
 */
export interface RequestPayload {
    /** Application identifier */
    appId: string;
    /** Unique conversation/session identifier */
    conversationId: string;
    /** Unique message identifier */
    messageId: string;
    /** User message text for contextual matching */
    contextText: string;
    /** Detected language code (optional, server detects if not provided) */
    language?: string;
    /** User identifier (optional) */
    userId?: string;
    /** SDK version for debugging */
    sdkVersion: string;
    /** Accepted ad formats (optional, defaults to all formats if not specified) */
    formats?: AdFormat[];
}
/**
 * Represents an ad-related event sent to POST /api/events.
 *
 * Event types:
 * - `impression`: Ad was displayed to the user
 * - `click`: User clicked the CTA button
 * - `submit`: User submitted a lead_gen form
 */
export interface EventPayload {
    /** Event type */
    type: "impression" | "click" | "submit";
    /** ID of the ad that triggered the event */
    adId: string;
    /** ID of the advertiser who owns the ad */
    advertiserId: string;
    /** Request ID that served this ad */
    requestId: string;
    /** Application identifier */
    appId: string;
    /** Conversation ID (optional) */
    conversationId?: string;
    /** User identifier (optional) */
    userId?: string;
    /** Email submitted for lead_gen format (only for submit events) */
    submittedEmail?: string;
}
/**
 * Internal state stored in the SDK after initialize().
 * Not exposed to external developers.
 * @internal
 */
export interface SDKConfig {
    /** Application ID set during initialization */
    appId: string | null;
    /** Base URL for API requests */
    apiBaseUrl: string;
    /** Current SDK version */
    sdkVersion: string;
    /** Whether the SDK has been initialized */
    initialized: boolean;
}
/**
 * Result returned from the renderer after successfully rendering an ad.
 * Contains references needed for post-render operations.
 */
export interface RenderedAd {
    /** The root DOM element of the rendered ad card */
    rootElement: HTMLElement;
    /** The ad data that was rendered */
    ad: ResolvedAd;
    /** Request ID used for event tracking */
    requestId: string;
}
/**
 * User or AI message in a chat simulation.
 * Used for SDK testing and demo pages.
 */
export type ChatMessageUserAi = {
    /** Unique message identifier */
    id: string;
    /** Message sender role */
    role: "user" | "ai";
    /** Message text content */
    text: string;
};
/**
 * Ad-injected message in a chat simulation.
 * Used for SDK testing and demo pages.
 */
export type ChatMessageAd = {
    /** Unique message identifier */
    id: string;
    /** Always "ad" for ad messages */
    role: "ad";
    /** The resolved ad to display */
    ad: ResolvedAd;
    /** Request ID for tracking */
    requestId: string | null;
};
/**
 * Unified chat message type.
 * Can be a user message, AI message, or ad injection.
 */
export type ChatMessage = ChatMessageUserAi | ChatMessageAd;
