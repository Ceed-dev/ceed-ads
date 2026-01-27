**English** | [日本語](./README.ja.md)

# Ceed Ads Web SDK

> ⚠️ Language Support (Current)
>
> The Ceed Ads Web SDK currently supports **English and Japanese** for ad decisioning and creatives.  
> Additional languages will be added in future releases.

<a href="https://github.com/Ceed-dev/ceed-ads" target="_blank">
  📦 GitHub Repository
</a>

A lightweight JavaScript/TypeScript SDK for integrating **contextual, in-chat action card ads** into any chat-style application.

This SDK provides a clean API for:

- Initializing your app (`initialize`)
- Requesting ads based on user message context (`requestAd`)
- Rendering ads into the DOM (`renderAd`)
- A convenience method that fetches + renders + tracks automatically (`showAd`)

## 🎥 Demo Video — Action Card in Action

See how the Action Card actually appears inside a chat UI:

<a href="https://drive.google.com/file/d/1EBDielkMjenRoehv24jBn9sRLou0MCs-/view?usp=sharing" target="_blank">
  👉 Click here to watch the demo video
</a>

### 🧩 Demo Source Code

<a href="https://github.com/Ceed-dev/ceed-ads/blob/main/src/app/sdk-test/page.tsx" target="_blank">
  👉 View the full demo chat page source code
</a>

## 📦 Installation

```bash
npm install @ceedhq/ads-web-sdk
```

## 🚀 Quick Start

Below is the **minimal setup** needed to integrate Ceed Ads into your application.

### **1. Import the SDK**

```ts
import { initialize, requestAd, renderAd, showAd } from "@ceedhq/ads-web-sdk";
```

### **2. Initialize the SDK (call once on page load)**

```ts
initialize("your-app-id");
```

Options:

- `appId` (**required**) – uniquely identifies your application.
- `apiBaseUrl` (optional) – override backend URL for local testing.

Example:

```ts
initialize("demo-app"); // uses default production API
initialize("demo-app", "/api"); // uses local API (development only)
```

## 📘 Public API

The SDK exposes **four core functions**.

### 1. `initialize(appId, apiBaseUrl?)`

Sets up global configuration used for all subsequent SDK calls.

#### Example:

```ts
initialize("my-app-id");
```

After calling this:

- All ad requests automatically include the appId.
- The tracker is initialized for impression & click events.

### 2. `requestAd(options)`

Fetches an ad based on user message context.  
**Does NOT render anything.**

#### Parameters:

```ts
{
  conversationId: string;   // Unique ID per chat room/thread
  messageId: string;        // Unique ID per message
  contextText: string;      // User message text used for keyword matching
  userId?: string;          // Optional user identifier
}
```

#### Example:

```ts
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn English",
});
```

Returns:

```ts
{
  ad: ResolvedAd | null,
  requestId: string | null
}
```

### 3. `renderAd(ad, targetElement, requestId?)`

Renders the ad into a DOM element and attaches impression/click tracking.

#### Example:

```ts
const container = document.getElementById("ad-slot");

renderAd(ad, container, requestId);
```

### 4. `showAd(options)` — Convenience Method

**The simplest way to use the SDK.**

This function:

1. Fetches an ad
2. Renders it into the target element
3. Tracks impression & click events

#### Example:

```ts
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
});
```

## 🧠 How Ad Context Works

The backend decides when an ad is appropriate based on:

- **Keyword matching** (`contextText`)
- **Conversation-level cooldowns** (prevents ad spam)
- **Scenario-specific targeting logic**

Your application does not need to manage these rules —  
simply call `requestAd(...)` after each user message.

## 💬 Full Integration Example (Chat App)

```ts
import { initialize, requestAd, renderAd } from "@ceedhq/ads-web-sdk";

initialize("test-app"); // run once

async function handleUserMessage(text: string) {
  const { ad, requestId } = await requestAd({
    conversationId: "demo-conv",
    messageId: crypto.randomUUID(),
    contextText: text,
  });

  if (!ad) return;

  const slot = document.getElementById("ad-container");
  slot.innerHTML = "";

  renderAd(ad, slot, requestId);
}
```

## 🧩 Example: Rendering Inline Ads in React

```tsx
function InlineAdCard({ ad, requestId }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";
    renderAd(ad, ref.current, requestId);
  }, [ad, requestId]);

  return <div ref={ref} />;
}
```

## 📡 Backend Behavior Summary

When you call `requestAd()`:

- The backend evaluates your message context.
- If an ad is appropriate:
  - It returns `{ ad, requestId }`
- If not:
  - It returns `{ ad: null }`

When you call `renderAd()`:

- The UI Action Card is generated automatically.
- Impression tracking is triggered.
- Click tracking is attached to CTA elements.

## 🔧 Local Development Tips

To point the SDK toward your **local** API instead of production:

```ts
initialize("test-app", "/api");
```

## 📄 TypeScript Support

```ts
import type { ResolvedAd } from "@ceedhq/ads-web-sdk";
```

## 🪪 License

MIT © Ceed
