/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Renderer (DOM Generator)
 * ----------------------------------------------------
 *
 * This module is responsible for:
 *  - Rendering the Action Card UI
 *  - Injecting it into a target DOM element
 *  - Wiring click events to the tracker
 *  - Triggering impression tracking immediately after render
 *
 * No API calls are made here. All networking is handled
 * in client.ts via tracker.ts.
 */
import type { ResolvedAd, RenderedAd } from "./types";
/**
 * Renders an Action Card for the given ad and appends it
 * to the provided container element.
 *
 * Assumes the ad is already resolved to a single language
 * by the backend.
 *
 * Returns:
 *   { rootElement, ad, requestId }
 *   Used later for event tracking.
 */
export declare function renderActionCard(ad: ResolvedAd, targetElement: HTMLElement, requestId: string | null): RenderedAd;
