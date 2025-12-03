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
   * Root Card
   * ------------------------------ */
  const card = createElement("div", "ceed-ads-card");
  card.style.border = "1px solid rgba(255,255,255,0.12)";
  card.style.padding = "20px";
  card.style.borderRadius = "12px";
  card.style.margin = "16px 0";
  card.style.background = "#141414";
  card.style.maxWidth = "460px";
  card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
  card.style.color = "#e5e5e5";

  /* ------------------------------
   * Header (Advertiser + Icon + Ad label)
   * ------------------------------ */
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
  dot.style.background = "#3a82f7";
  dot.style.borderRadius = "50%";

  const advName = createElement("div");
  advName.textContent = ad.advertiserName ?? "Advertiser";
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
  card.appendChild(header);

  /* ------------------------------
   * Title
   * ------------------------------ */
  const titleEl = createElement("div");
  titleEl.textContent = ad.title;
  titleEl.style.fontSize = "19px";
  titleEl.style.fontWeight = "600";
  titleEl.style.marginBottom = "10px";
  titleEl.style.lineHeight = "1.35";
  card.appendChild(titleEl);

  /* ------------------------------
   * Description
   * ------------------------------ */
  const descEl = createElement("div");
  descEl.textContent = ad.description;
  descEl.style.fontSize = "14px";
  descEl.style.opacity = "0.8";
  descEl.style.marginBottom = "18px";
  descEl.style.lineHeight = "1.45";
  card.appendChild(descEl);

  /* ------------------------------
   * CTA Button
   * ------------------------------ */
  const button = createElement("button");
  button.textContent = ad.ctaText;
  button.style.width = "100%";
  button.style.padding = "14px";
  button.style.background = "#3a82f7";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "15px";
  button.style.fontWeight = "500";
  button.style.marginTop = "6px";

  button.onmouseenter = () => {
    button.style.background = "#2f6ad4";
  };
  button.onmouseleave = () => {
    button.style.background = "#3a82f7";
  };

  card.appendChild(button);

  /* ------------------------------
   * Inject
   * ------------------------------ */
  targetElement.appendChild(card);

  /* ------------------------------
   * Tracking
   * ------------------------------ */
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
