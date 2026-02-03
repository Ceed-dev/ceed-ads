/**
 * Feature flags for V2 ad system rollout.
 *
 * Environment variables:
 *   V2_ENABLED     - Global switch (true/false)
 *   V2_APP_IDS     - Comma-separated whitelist of app IDs
 *   V2_PERCENTAGE  - Percentage rollout (0-100)
 *   V2_TIMEOUT_MS  - Hard timeout for V2 operations
 */

/**
 * Simple hash function for consistent percentage rollout.
 * Returns a value between 0-99 for any given string.
 */
function hashAppId(appId: string): number {
  let hash = 0;
  for (let i = 0; i < appId.length; i++) {
    const char = appId.charCodeAt(i);
    hash = (hash * 31 + char) >>> 0;
  }
  return hash % 100;
}

/**
 * Get V2 timeout in milliseconds.
 * Defaults to 200ms if not set.
 */
export function getV2TimeoutMs(): number {
  const timeout = process.env.V2_TIMEOUT_MS;
  if (!timeout) return 200;
  const parsed = parseInt(timeout, 10);
  return isNaN(parsed) ? 200 : parsed;
}

/**
 * Determine if V2 ad system is enabled for a given app.
 *
 * Logic:
 *   1. If V2_ENABLED=false, always return false
 *   2. If V2_APP_IDS is set and appId is in the list, return true
 *   3. If V2_PERCENTAGE is set, use hash-based rollout
 *   4. Otherwise return V2_ENABLED value
 */
export function isV2Enabled(appId: string): boolean {
  const globalEnabled = process.env.V2_ENABLED;

  // Global switch: if explicitly false, always return false
  if (globalEnabled === "false") {
    return false;
  }

  // Whitelist check
  const appIds = process.env.V2_APP_IDS;
  if (appIds) {
    const whitelist = appIds.split(",").map((id) => id.trim());
    if (whitelist.includes(appId)) {
      return true;
    }
  }

  // Percentage rollout
  const percentageStr = process.env.V2_PERCENTAGE;
  if (percentageStr) {
    const percentage = parseInt(percentageStr, 10);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      const hash = hashAppId(appId);
      return hash < percentage;
    }
  }

  // Default to global switch value
  return globalEnabled === "true";
}
