**English** | [日本語](https://github.com/Ceed-dev/ceed-ads/blob/main/sdk/README.ja.md)

# Ceed Ads Web SDK

A TypeScript SDK for integrating contextual, in-chat ads into web applications.

> ⚠️ **Language Support**: Currently supports **English and Japanese** for ad decisioning and creatives. Additional languages coming soon.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [initialize()](#1-initializeappid-apibaseurl)
  - [requestAd()](#2-requestadoptions)
  - [renderAd()](#3-renderadad-targetelement-requestid)
  - [showAd()](#4-showadoptions)
- [Ad Formats](#ad-formats)
  - [Action Card](#action_card)
  - [Lead Gen](#lead_gen)
  - [Static](#static)
  - [Followup](#followup)
- [Event Tracking](#event-tracking)
- [TypeScript Types](#typescript-types)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Local Development](#local-development)

---

## Installation

```bash
npm install @ceedhq/ads-web-sdk
```

---

## Quick Start

```typescript
import { initialize, showAd } from "@ceedhq/ads-web-sdk";

// 1. Initialize once on app load
initialize("your-app-id");

// 2. Show an ad after user message
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn programming",
  targetElement: document.getElementById("ad-slot"),
});
```

---

## API Reference

### 1. `initialize(appId, apiBaseUrl?)`

**Required before any other SDK calls.**

Sets up global configuration for all subsequent API requests.

```typescript
initialize(appId: string, apiBaseUrl?: string): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appId` | `string` | Yes | Your application identifier |
| `apiBaseUrl` | `string` | No | Override API URL (for development) |

**Example:**

```typescript
// Production (uses default API)
initialize("my-app");

// Development (local API)
initialize("my-app", "/api");
```

---

### 2. `requestAd(options)`

Fetches an ad based on conversation context. **Does NOT render anything.**

Use this when you need full control over rendering.

```typescript
async requestAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  userId?: string;
  formats?: AdFormat[];
}): Promise<{ ad: ResolvedAd | null; requestId: string | null }>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversationId` | `string` | Yes | Unique ID for the chat session |
| `messageId` | `string` | Yes | Unique ID for the message |
| `contextText` | `string` | Yes | User message text for keyword matching |
| `userId` | `string` | No | Optional user identifier |
| `formats` | `AdFormat[]` | No | Array of ad formats to request (defaults to all) |

**Example:**

```typescript
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "How do I book a flight?",
});

if (ad) {
  console.log(`Ad format: ${ad.format}`);
  console.log(`Advertiser: ${ad.advertiserName}`);
}
```

---

### 3. `renderAd(ad, targetElement, requestId?)`

Renders an ad into the DOM and automatically tracks impressions and clicks.

```typescript
renderAd(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId?: string | null
): RenderedAd
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ad` | `ResolvedAd` | Yes | The ad object from `requestAd()` |
| `targetElement` | `HTMLElement` | Yes | DOM element to render into |
| `requestId` | `string \| null` | No | Request ID for event tracking |

**Example:**

```typescript
const container = document.getElementById("ad-slot");
container.innerHTML = ""; // Clear previous ad

renderAd(ad, container, requestId);
```

---

### 4. `showAd(options)`

**Convenience method** that combines fetch + render + tracking in one call.

This is the simplest way to integrate ads.

```typescript
async showAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  targetElement: HTMLElement;
  userId?: string;
  formats?: AdFormat[];
}): Promise<void>
```

**Example:**

```typescript
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
});
```

---

## Ad Formats

The SDK supports four ad formats, each designed for different use cases.

### `action_card`

**Default format** — A card with title, description, and CTA button.

```
┌─────────────────────────────────┐
│ ● Advertiser Name          Ad   │
├─────────────────────────────────┤
│ Ad Title                        │
│ Ad description text goes        │
│ here with supporting details.   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Call to Action        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Use case:** Standard promotional ads with a clear call-to-action.

**Behavior:**
- Impression tracked on render
- Click tracked when CTA button is clicked
- Opens `ctaUrl` in a new tab

---

### `lead_gen`

**Lead generation format** — Email capture form with success message.

```
┌─────────────────────────────────┐
│ ● Advertiser Name          Ad   │
├─────────────────────────────────┤
│ Get Our Free Guide              │
│ Enter your email to download    │
│ the complete tutorial.          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Enter your email...         │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │        Subscribe            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

After submit:
┌─────────────────────────────────┐
│ ✓ Thanks! Check your inbox.     │
└─────────────────────────────────┘
```

**Use case:** Newsletter signups, lead capture, content downloads.

**Behavior:**
- Impression tracked on render
- Submit event tracked with email when form is submitted
- Success message displayed after submission
- Form input supports `autocomplete` attribute

**Required config:**

```typescript
leadGenConfig: {
  placeholder: string;       // Input placeholder text
  submitButtonText: string;  // Button label
  autocompleteType: "email" | "name" | "tel" | "off";
  successMessage: string;    // Shown after submit
}
```

---

### `static`

**Display format** — Renders immediately on page load, typically below the text input field.

```
┌─────────────────────────────────┐
│ Ask AI anything...          [+] │  ← Input field
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ● Advertiser Name          Ad   │
├─────────────────────────────────┤
│ Special Offer                   │
│ Limited time discount on        │
│ selected products.              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Shop Now             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Use case:** User-targeted ads displayed around text input interfaces, based on user's previous conversations and ad behavior data.

**Behavior:**
- Renders immediately on page load before any user interaction
- Identical card rendering to `action_card`
- Different targeting logic on backend (user history, keywords, geo, device type)
- Impression tracked on render
- Click tracked on CTA click

**Optional config:**

```typescript
staticConfig: {
  displayPosition: "top" | "bottom" | "inline" | "sidebar";
  targetingParams?: {
    keywords?: string[];
    geo?: string[];
    deviceTypes?: ("desktop" | "mobile" | "tablet")[];
  }
}
```

---

### `followup`

**Sponsored question format** — Tappable question card for conversation flow.

```
┌─────────────────────────────────┐
│ ● Advertiser Name          Ad   │
├─────────────────────────────────┤
│ Want to learn more about        │
│ our language courses?           │
│                                 │
│ → Tap to learn more             │
└─────────────────────────────────┘
```

**Use case:** Suggested follow-up questions sponsored by advertisers.

**Behavior:**
- Entire card is tappable (not just a button)
- Hover effect on card border
- Click event tracked on tap
- Tap action configurable:
  - `redirect`: Opens URL in new tab
  - `expand`: Host app handles expansion
  - `submit`: Host app handles submission

**Required config:**

```typescript
followupConfig: {
  questionText: string;      // The sponsored question
  tapAction: "expand" | "redirect" | "submit";
  tapActionUrl?: string;     // Required if tapAction is "redirect"
}
```

---

## Specifying Formats

Developers can use the `formats` parameter to specify which ad formats they want to receive.

### Request Specific Formats Only

```typescript
// Request only action_card and lead_gen formats
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn English",
  formats: ["action_card", "lead_gen"],
});

// Also works with showAd
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn English",
  targetElement: document.getElementById("ad-slot"),
  formats: ["action_card", "lead_gen"],
});
```

### Request All Formats (Default)

```typescript
// If formats is not specified, all formats are eligible
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn English",
});
```

### Available Format Values

| Value | Description |
|-------|-------------|
| `"action_card"` | Standard CTA card |
| `"lead_gen"` | Email capture form |
| `"static"` | Banner-style ad |
| `"followup"` | Sponsored question |

---

## Event Tracking

The SDK automatically tracks the following events:

| Event | Trigger | Description |
|-------|---------|-------------|
| `impression` | On render | Ad was displayed to user |
| `click` | On CTA click | User clicked the CTA button |
| `submit` | On form submit | User submitted lead_gen form |

**Automatic deduplication:** Impressions are deduplicated per ad+requestId pair to prevent duplicate tracking (e.g., React StrictMode double renders).

### Manual tracking (advanced)

If you need manual control, import individual renderers:

```typescript
import {
  renderActionCard,
  renderLeadGenCard,
  renderStaticCard,
  renderFollowupCard,
} from "@ceedhq/ads-web-sdk";
```

---

## TypeScript Types

### Core Types

```typescript
import type {
  ResolvedAd,
  AdFormat,
  ResolvedLeadGenConfig,
  ResolvedFollowupConfig,
  StaticConfig,
} from "@ceedhq/ads-web-sdk";
```

### ResolvedAd

The main ad payload returned from `requestAd()`:

```typescript
interface ResolvedAd {
  id: string;
  advertiserId: string;
  advertiserName: string;
  format: AdFormat;  // "action_card" | "lead_gen" | "static" | "followup"
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  leadGenConfig?: ResolvedLeadGenConfig;
  staticConfig?: StaticConfig;
  followupConfig?: ResolvedFollowupConfig;
}
```

### Format-specific configs

```typescript
// Lead Gen
interface ResolvedLeadGenConfig {
  placeholder: string;
  submitButtonText: string;
  autocompleteType: "email" | "name" | "tel" | "off";
  successMessage: string;
}

// Static
interface StaticConfig {
  displayPosition: "top" | "bottom" | "inline" | "sidebar";
  targetingParams?: {
    keywords?: string[];
    geo?: string[];
    deviceTypes?: ("desktop" | "mobile" | "tablet")[];
  };
}

// Followup
interface ResolvedFollowupConfig {
  questionText: string;
  tapAction: "expand" | "redirect" | "submit";
  tapActionUrl?: string;
}
```

---

## Error Handling

### Initialization errors

```typescript
try {
  initialize(""); // Empty appId
} catch (error) {
  // "CeedAds.initialize: appId is required"
}
```

### No ad available

```typescript
const { ad, requestId } = await requestAd({...});

if (!ad) {
  // No matching ad for this context
  // This is normal — ads are not always available
  return;
}
```

### Format config missing

```typescript
// If ad.format is "lead_gen" but leadGenConfig is missing:
renderAd(ad, container, requestId);
// Throws: "leadGenConfig is required for lead_gen format"
```

---

## Examples

### React Integration

```tsx
import { useRef, useEffect } from "react";
import { initialize, requestAd, renderAd } from "@ceedhq/ads-web-sdk";
import type { ResolvedAd } from "@ceedhq/ads-web-sdk";

// Initialize once
initialize("your-app-id");

function ChatMessage({ message }: { message: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [ad, setAd] = useState<ResolvedAd | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAd() {
      const result = await requestAd({
        conversationId: "chat-123",
        messageId: crypto.randomUUID(),
        contextText: message,
      });
      setAd(result.ad);
      setRequestId(result.requestId);
    }
    fetchAd();
  }, [message]);

  useEffect(() => {
    if (ad && adRef.current) {
      adRef.current.innerHTML = "";
      renderAd(ad, adRef.current, requestId);
    }
  }, [ad, requestId]);

  return (
    <div>
      <p>{message}</p>
      <div ref={adRef} />
    </div>
  );
}
```

### Vanilla JavaScript

```html
<div id="ad-container"></div>

<script type="module">
  import { initialize, showAd } from "@ceedhq/ads-web-sdk";

  initialize("demo-app");

  document.getElementById("send-btn").addEventListener("click", async () => {
    const message = document.getElementById("input").value;

    await showAd({
      conversationId: "demo-session",
      messageId: Date.now().toString(),
      contextText: message,
      targetElement: document.getElementById("ad-container"),
    });
  });
</script>
```

---

## Local Development

Point the SDK to a local API server:

```typescript
// Development mode
initialize("test-app", "http://localhost:3000/api");

// Or relative path (same origin)
initialize("test-app", "/api");
```

### Demo Page

See the SDK in action:

- [Demo Video](https://drive.google.com/file/d/1EBDielkMjenRoehv24jBn9sRLou0MCs-/view?usp=sharing)
- [Demo Source Code](https://github.com/Ceed-dev/ceed-ads/blob/main/src/app/sdk-test/page.tsx)

---

## Styling

All ad cards use a dark theme with these CSS classes:

| Class | Description |
|-------|-------------|
| `.ceed-ads-card` | Base card container |
| `.ceed-ads-action-card` | Action Card format |
| `.ceed-ads-lead-gen` | Lead Gen format |
| `.ceed-ads-static` | Static format |
| `.ceed-ads-followup` | Followup format |

Cards have a max-width of 460px and use inline styles for consistency.

---

## License

MIT © Ceed
