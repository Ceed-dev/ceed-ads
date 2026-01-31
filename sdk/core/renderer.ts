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
import { trackImpression, trackClick, trackSubmit } from "./tracker";

/* ============================================================
 * DESIGN TOKENS
 * ============================================================ */

/**
 * Color palette for the dark theme.
 * All ad cards use these consistent colors.
 * @internal
 */
const COLORS = {
  /** Card background color */
  background: "#141414",
  /** Border color (subtle separator) */
  border: "rgba(255,255,255,0.12)",
  /** Primary text color */
  text: "#e5e5e5",
  /** Muted/secondary text color */
  textMuted: "rgba(255,255,255,0.55)",
  /** Primary action color (buttons, highlights) */
  primary: "#3a82f7",
  /** Primary color on hover */
  primaryHover: "#2f6ad4",
  /** Success state color */
  success: "#22c55e",
} as const;

/**
 * Maximum width for ad cards.
 * @internal
 */
const MAX_WIDTH = "460px";

/* ============================================================
 * DOM HELPER FUNCTIONS
 * ============================================================ */

/**
 * Creates a DOM element with optional CSS classes.
 *
 * @template K - The HTML element tag name
 * @param tag - The HTML tag name (e.g., "div", "button")
 * @param className - Optional space-separated CSS class names
 * @returns The created HTML element
 * @internal
 */
function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/**
 * Applies base card styles to an HTML element.
 * These styles are shared across all ad formats.
 *
 * @param card - The card element to style
 * @internal
 */
function applyCardStyles(card: HTMLElement): void {
  card.style.border = `1px solid ${COLORS.border}`;
  card.style.padding = "20px";
  card.style.borderRadius = "12px";
  card.style.margin = "16px 0";
  card.style.background = COLORS.background;
  card.style.maxWidth = MAX_WIDTH;
  card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
  card.style.color = COLORS.text;
}

/**
 * Creates the header section for an ad card.
 * Contains advertiser name (with dot indicator) and "Ad" label.
 *
 * @param advertiserName - The name of the advertiser to display
 * @returns The header element
 * @internal
 */
function createHeader(advertiserName: string): HTMLElement {
  const header = createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "14px";

  const left = createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "8px";

  const dot = createElement("div");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.background = COLORS.primary;
  dot.style.borderRadius = "50%";

  const advName = createElement("div");
  advName.textContent = advertiserName ?? "Advertiser";
  advName.style.fontSize = "14px";
  advName.style.opacity = "0.9";

  left.appendChild(dot);
  left.appendChild(advName);

  const adLabel = createElement("div");
  adLabel.textContent = "Ad";
  adLabel.style.fontSize = "14px";
  adLabel.style.opacity = "0.55";

  header.appendChild(left);
  header.appendChild(adLabel);

  return header;
}

/**
 * Creates a styled primary button.
 * Used for CTA buttons across all ad formats.
 *
 * @param text - The button label text
 * @returns The styled button element with hover effects
 * @internal
 */
function createPrimaryButton(text: string): HTMLButtonElement {
  const button = createElement("button");
  button.textContent = text;
  button.style.width = "100%";
  button.style.padding = "14px";
  button.style.background = COLORS.primary;
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "15px";
  button.style.fontWeight = "500";
  button.style.marginTop = "6px";

  button.onmouseenter = () => {
    button.style.background = COLORS.primaryHover;
  };
  button.onmouseleave = () => {
    button.style.background = COLORS.primary;
  };

  return button;
}

/* ============================================================
 * FORMAT-SPECIFIC RENDERERS
 * ============================================================ */

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
export function renderActionCard(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  const card = createElement("div", "ceed-ads-card ceed-ads-action-card");
  applyCardStyles(card);

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  const button = createPrimaryButton(ad.ctaText);
  card.appendChild(button);

  targetElement.appendChild(card);

  trackImpression(ad, requestId);

  button.addEventListener("click", async () => {
    await trackClick(ad, requestId);
    window.open(ad.ctaUrl, "_blank");
  });

  return {
    rootElement: card,
    ad,
    requestId: requestId ?? "unknown",
  };
}

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
export function renderLeadGenCard(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  const config = ad.leadGenConfig;
  if (!config) {
    throw new Error("leadGenConfig is required for lead_gen format");
  }

  const card = createElement("div", "ceed-ads-card ceed-ads-lead-gen");
  applyCardStyles(card);

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  // Form container
  const form = createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "12px";

  // Email input
  const input = createElement("input");
  input.type = config.autocompleteType === "email" ? "email" : "text";
  input.placeholder = config.placeholder;
  input.autocomplete = config.autocompleteType;
  input.style.width = "100%";
  input.style.padding = "14px";
  input.style.background = "rgba(255,255,255,0.08)";
  input.style.border = `1px solid ${COLORS.border}`;
  input.style.borderRadius = "8px";
  input.style.color = COLORS.text;
  input.style.fontSize = "15px";
  input.style.boxSizing = "border-box";
  input.style.outline = "none";

  input.onfocus = () => {
    input.style.borderColor = COLORS.primary;
  };
  input.onblur = () => {
    input.style.borderColor = COLORS.border;
  };

  form.appendChild(input);

  // Submit button
  const submitBtn = createPrimaryButton(config.submitButtonText);
  submitBtn.type = "submit";
  form.appendChild(submitBtn);

  // Success message (hidden initially)
  const successMsg = createElement("div");
  successMsg.textContent = config.successMessage;
  successMsg.style.display = "none";
  successMsg.style.padding = "14px";
  successMsg.style.background = "rgba(34,197,94,0.15)";
  successMsg.style.border = `1px solid ${COLORS.success}`;
  successMsg.style.borderRadius = "8px";
  successMsg.style.color = COLORS.success;
  successMsg.style.fontSize = "14px";
  successMsg.style.textAlign = "center";

  card.appendChild(form);
  card.appendChild(successMsg);

  targetElement.appendChild(card);

  trackImpression(ad, requestId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "...";

    await trackSubmit(ad, requestId, email);

    form.style.display = "none";
    successMsg.style.display = "block";
  });

  return {
    rootElement: card,
    ad,
    requestId: requestId ?? "unknown",
  };
}

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
export function renderStaticCard(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  const card = createElement("div", "ceed-ads-card ceed-ads-static");
  applyCardStyles(card);

  card.appendChild(createHeader(ad.advertiserName));

  const titleEl = createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  const descEl = createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  const button = createPrimaryButton(ad.ctaText);
  card.appendChild(button);

  targetElement.appendChild(card);

  trackImpression(ad, requestId);

  button.addEventListener("click", async () => {
    await trackClick(ad, requestId);
    window.open(ad.ctaUrl, "_blank");
  });

  return {
    rootElement: card,
    ad,
    requestId: requestId ?? "unknown",
  };
}

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
export function renderFollowupCard(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  const config = ad.followupConfig;
  if (!config) {
    throw new Error("followupConfig is required for followup format");
  }

  const card = createElement("div", "ceed-ads-card ceed-ads-followup");
  applyCardStyles(card);
  card.style.cursor = "pointer";
  card.style.transition = "border-color 0.2s ease";

  card.onmouseenter = () => {
    card.style.borderColor = COLORS.primary;
  };
  card.onmouseleave = () => {
    card.style.borderColor = COLORS.border;
  };

  card.appendChild(createHeader(ad.advertiserName));

  // Question text (main content)
  const questionEl = createElement("div");
  questionEl.textContent = config.questionText;
  questionEl.style.fontSize = "17px";
  questionEl.style.fontWeight = "500";
  questionEl.style.lineHeight = "1.4";
  questionEl.style.marginBottom = "12px";
  card.appendChild(questionEl);

  // Tap hint
  const hintEl = createElement("div");
  hintEl.style.fontSize = "13px";
  hintEl.style.opacity = "0.5";
  hintEl.style.display = "flex";
  hintEl.style.alignItems = "center";
  hintEl.style.gap = "6px";

  const arrow = createElement("span");
  arrow.textContent = "→";
  arrow.style.fontSize = "14px";

  const hintText = createElement("span");
  hintText.textContent = ad.ctaText || "Tap to learn more";

  hintEl.appendChild(arrow);
  hintEl.appendChild(hintText);
  card.appendChild(hintEl);

  targetElement.appendChild(card);

  trackImpression(ad, requestId);

  card.addEventListener("click", async () => {
    await trackClick(ad, requestId);

    if (config.tapAction === "redirect" && config.tapActionUrl) {
      window.open(config.tapActionUrl, "_blank");
    } else if (config.tapAction === "redirect" && ad.ctaUrl) {
      window.open(ad.ctaUrl, "_blank");
    }
    // For "expand" and "submit" actions, the host app handles the behavior
  });

  return {
    rootElement: card,
    ad,
    requestId: requestId ?? "unknown",
  };
}

/* ============================================================
 * UNIVERSAL RENDER FUNCTION
 * ============================================================ */

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
export function renderAd(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  switch (ad.format) {
    case "action_card":
      return renderActionCard(ad, targetElement, requestId);
    case "lead_gen":
      return renderLeadGenCard(ad, targetElement, requestId);
    case "static":
      return renderStaticCard(ad, targetElement, requestId);
    case "followup":
      return renderFollowupCard(ad, targetElement, requestId);
    default:
      // Fallback to action_card for unknown formats
      console.warn(`Unknown ad format: ${ad.format}, falling back to action_card`);
      return renderActionCard(ad, targetElement, requestId);
  }
}
