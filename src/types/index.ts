/**
 * Central export hub for all domain types used in Ceed Ads.
 *
 * This file enables simple and consistent imports across the codebase:
 *   import { Ad, Advertiser, RequestLog, EventLog } from "@/types";
 *
 * Keeping exports consolidated here improves maintainability and
 * prevents deep relative import paths.
 */

// Advertisers
export * from "./advertiser";

// Ads (creative definitions)
export * from "./ad";

// Request logs (/ads/decide calls)
export * from "./request";

// Event logs (impressions & clicks)
export * from "./event";
