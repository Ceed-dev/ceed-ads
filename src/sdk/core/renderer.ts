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

import type { Ad, RenderedAd } from "./types";
import { trackImpression, trackClick } from "./tracker";

/* ----------------------------------------------------
 * Helper: Create a DOM Element with classes
 * ---------------------------------------------------- */

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/* ----------------------------------------------------
 * Render an Action Card (MVP)
 * ---------------------------------------------------- */

/**
 * Renders an Action Card for the given ad and appends it
 * to the provided container element.
 *
 * Returns:
 *   { rootElement, ad, requestId }
 *   Used later for event tracking.
 */
export function renderActionCard(
  ad: Ad,
  targetElement: HTMLElement,
  requestId: string | null,
): RenderedAd {
  /* ------------------------------
   * 1. Create root card container
   * ------------------------------ */
  const card = createElement("div", "ceed-ads-card");
  card.style.border = "1px solid #ddd";
  card.style.padding = "12px";
  card.style.borderRadius = "8px";
  card.style.margin = "8px 0";
  card.style.background = "#fff";
  card.style.maxWidth = "360px";
  card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";

  /* ------------------------------
   * 2. Title
   * ------------------------------ */
  const titleEl = createElement("div", "ceed-ads-title");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "16px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "6px";
  card.appendChild(titleEl);

  /* ------------------------------
   * 3. Description
   * ------------------------------ */
  const descEl = createElement("div", "ceed-ads-description");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.color = "#444";
  descEl.style.marginBottom = "10px";
  card.appendChild(descEl);

  /* ------------------------------
   * 4. CTA Button
   * ------------------------------ */
  const button = createElement("button", "ceed-ads-cta");
  button.textContent = ad.ctaText;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.background = "#0066ff";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "6px";
  button.style.cursor = "pointer";
  button.style.fontSize = "15px";

  card.appendChild(button);

  /* ------------------------------
   * 5. Append card to target element
   * ------------------------------ */
  targetElement.appendChild(card);

  /* ------------------------------
   * 6. Track impression automatically
   * ------------------------------ */
  trackImpression(ad, requestId);

  /* ------------------------------
   * 7. Track click + open landing page
   * ------------------------------ */
  button.addEventListener("click", async () => {
    await trackClick(ad, requestId);
    window.location.href = ad.ctaUrl;
  });

  return {
    rootElement: card,
    ad,
    requestId: requestId ?? "unknown",
  };
}
