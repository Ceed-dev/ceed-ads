/**
 * ----------------------------------------------------
 * Ceed Ads Web SDK — Core Type Definitions
 * ----------------------------------------------------
 *
 * This file centralizes all type definitions used
 * internally within the SDK. It does not contain any
 * logic. Keeping types isolated improves clarity,
 * reusability, and maintainability across modules.
 *
 * The types here align directly with the server-side
 * API schema (ads, requests, events).
 */
/**
 * Represents a single Action Card ad.
 * Returned by `/api/requests` and used for rendering.
 */
export interface Ad {
    id: string;
    advertiserId: string;
    advertiserName: string;
    format: "action_card";
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    tags: string[];
    status: "active" | "paused" | "archived";
}
/**
 * Payload sent by the SDK when requesting an ad.
 * Matches the server-side RequestLog schema.
 */
export interface RequestPayload {
    appId: string;
    conversationId: string;
    messageId: string;
    contextText: string;
    language?: string;
    userId?: string;
    sdkVersion: string;
}
/**
 * Represents an ad-related event (impression or click).
 * Sent from the SDK to `/api/events`.
 */
export interface EventPayload {
    type: "impression" | "click";
    adId: string;
    advertiserId: string;
    requestId: string;
    appId: string;
    conversationId?: string;
    userId?: string;
}
/**
 * Internal state stored in the SDK after initialize().
 * Not exposed to external developers.
 */
export interface SDKConfig {
    appId: string | null;
    apiBaseUrl: string;
    sdkVersion: string;
    initialized: boolean;
}
/**
 * Result returned from the renderer.
 * Contains the DOM element so tracking can attach events.
 */
export interface RenderedAd {
    rootElement: HTMLElement;
    ad: Ad;
    requestId: string;
}
export type ChatMessageUserAi = {
    id: string;
    role: "user" | "ai";
    text: string;
};
export type ChatMessageAd = {
    id: string;
    role: "ad";
    ad: Ad;
    requestId: string | null;
};
export type ChatMessage = ChatMessageUserAi | ChatMessageAd;
