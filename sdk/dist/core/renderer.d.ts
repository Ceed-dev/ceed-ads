/**
 * @fileoverview Ceed Ads Web SDK — Renderer (DOM Generator)
 * @module renderer
 *
 * This module is responsible for:
 * - Rendering ad UIs based on format (action_card, lead_gen, static, followup)
 * - Injecting them into target DOM elements
 * - Wiring click/submit events to the tracker
 * - Triggering impression tracking immediately after render
 *
 * @remarks
 * Supported formats:
 * - `action_card`: Text card with CTA button (default)
 * - `lead_gen`: Email collection form for lead generation
 * - `static`: Display ad for page load targeting
 * - `followup`: Sponsored question card for conversation flow
 *
 * No API calls are made here. All networking is handled
 * in client.ts via tracker.ts.
 */
import type { ResolvedAd, RenderedAd } from "./types";
/**
 * Renders an Action Card ad format.
 *
 * Action Card is the default ad format featuring:
 * - Advertiser header with name and "Ad" label
 * - Title and description text
 * - CTA button that opens a URL in a new tab
 *
 * @param ad - The resolved ad data to render
 * @param targetElement - The DOM element to append the card to
 * @param requestId - The request ID for event tracking
 * @returns The rendered ad result containing the root element
 *
 * @example
 * ```typescript
 * const result = renderActionCard(ad, document.getElementById('ad-slot'), 'req-123');
 * ```
 */
export declare function renderActionCard(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
/**
 * Renders a Lead Gen ad format.
 *
 * Lead Gen format is designed for email collection with:
 * - Advertiser header with name and "Ad" label
 * - Title and description text
 * - Email input form with autocomplete support
 * - Submit button that triggers a submit event
 * - Success message displayed after submission
 *
 * @param ad - The resolved ad data (must include leadGenConfig)
 * @param targetElement - The DOM element to append the card to
 * @param requestId - The request ID for event tracking
 * @returns The rendered ad result containing the root element
 * @throws {Error} If leadGenConfig is not provided
 *
 * @example
 * ```typescript
 * const result = renderLeadGenCard(ad, document.getElementById('ad-slot'), 'req-123');
 * ```
 */
export declare function renderLeadGenCard(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
/**
 * Renders a Static ad format.
 *
 * Static format is designed for page load display with:
 * - Advertiser header with name and "Ad" label
 * - Title and description text
 * - CTA button that opens a URL in a new tab
 *
 * @remarks
 * Visually similar to action_card, but intended for different targeting
 * scenarios (page load vs. conversation context).
 *
 * @param ad - The resolved ad data to render
 * @param targetElement - The DOM element to append the card to
 * @param requestId - The request ID for event tracking
 * @returns The rendered ad result containing the root element
 *
 * @example
 * ```typescript
 * const result = renderStaticCard(ad, document.getElementById('sidebar'), 'req-123');
 * ```
 */
export declare function renderStaticCard(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
/**
 * Renders a Followup ad format.
 *
 * Followup format is designed for sponsored questions with:
 * - Advertiser header with name and "Ad" label
 * - Question text as main content
 * - Tappable card with hover effect
 * - Configurable tap action (redirect, expand, submit)
 *
 * @param ad - The resolved ad data (must include followupConfig)
 * @param targetElement - The DOM element to append the card to
 * @param requestId - The request ID for event tracking
 * @returns The rendered ad result containing the root element
 * @throws {Error} If followupConfig is not provided
 *
 * @example
 * ```typescript
 * const result = renderFollowupCard(ad, document.getElementById('ad-slot'), 'req-123');
 * ```
 */
export declare function renderFollowupCard(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
/**
 * Renders an ad based on its format type.
 *
 * This is the main entry point for rendering ads. It dispatches
 * to the appropriate format-specific renderer based on `ad.format`.
 *
 * @param ad - The resolved ad data to render
 * @param targetElement - The DOM element to append the card to
 * @param requestId - The request ID for event tracking
 * @returns The rendered ad result containing the root element
 *
 * @remarks
 * If an unknown format is provided, falls back to action_card
 * and logs a warning to the console.
 *
 * @example
 * ```typescript
 * // Let the function choose the appropriate renderer
 * const result = renderAd(ad, document.getElementById('ad-slot'), 'req-123');
 * ```
 */
export declare function renderAd(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
