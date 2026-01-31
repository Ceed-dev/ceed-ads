# Ceed Ads

A contextual advertising platform for AI chat applications. Serves relevant ads based on conversation context using keyword-based matching.

## Overview

Ceed Ads provides:
- **Backend API** (Next.js) - Ad decision engine with language detection and frequency control
- **Web SDK** (`@ceedhq/ads-web-sdk`) - Client-side library for chat app integration

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19, TypeScript 5
- **Database**: Firebase Firestore
- **Language Detection**: franc
- **Translation**: Google Cloud Translate API
- **Styling**: Tailwind CSS 4

## Directory Structure

```
ceed-ads/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── requests/    # Ad request endpoint
│   │   │   └── events/      # Impression/click tracking
│   │   └── sdk-test/        # Demo chat page
│   ├── lib/
│   │   ├── ads/deciders/    # Ad selection logic
│   │   └── firebase-admin.ts
│   ├── types/               # TypeScript definitions
│   └── scripts/             # Utility scripts (seed, test)
├── sdk/                     # Web SDK source
│   ├── core/                # SDK core modules
│   └── dist/                # Built SDK files
└── public/
```

## Setup

### Prerequisites

- Node.js 20+
- Firebase project with Firestore
- Google Cloud Translation API credentials (optional, for non-English translation)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Google Cloud Translation (optional)
GOOGLE_TRANSLATION_CREDENTIALS=./translation-api-service-account.json
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo chat page.

### Seed Data

```bash
npm run seed
```

## API Reference

### POST /api/requests

Request an ad based on conversation context.

**Request Body:**
```json
{
  "appId": "your-app-id",
  "conversationId": "chat-123",
  "messageId": "msg-456",
  "contextText": "I want to learn English",
  "userId": "optional-user-id",
  "sdkVersion": "1.2.0"
}
```

**Response:**
```json
{
  "ok": true,
  "ad": {
    "id": "ad-789",
    "advertiserId": "adv-001",
    "advertiserName": "English Academy",
    "format": "action_card",
    "title": "Master English Today",
    "description": "Start your journey...",
    "ctaText": "Get Started",
    "ctaUrl": "https://example.com"
  },
  "requestId": "req-abc"
}
```

### POST /api/events

Track impression or click events.

**Request Body:**
```json
{
  "type": "impression",
  "adId": "ad-789",
  "advertiserId": "adv-001",
  "requestId": "req-abc",
  "conversationId": "chat-123",
  "appId": "your-app-id"
}
```

## Web SDK

See [sdk/README.md](./sdk/README.md) for SDK documentation.

### Quick Start

```typescript
import { initialize, showAd } from "@ceedhq/ads-web-sdk";

// Initialize once
initialize("your-app-id");

// Show ad after user message
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
});
```

### Ad Formats

The SDK supports four ad formats:

| Format | Description | Use Case |
|--------|-------------|----------|
| `action_card` | Text card with CTA button | General promotions |
| `lead_gen` | Email collection form | Lead generation |
| `static` | Display ad for page load | Sidebar/banner ads |
| `followup` | Tappable question card | Conversation flow |

### Format Filtering

You can specify which formats your app accepts using the `formats` option:

```typescript
// Accept only action_card and lead_gen
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
  formats: ["action_card", "lead_gen"]
});

// Accept all formats (default behavior)
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
  // formats not specified = all formats accepted
});
```

### Format-Specific Rendering

Each format renders differently:

**action_card** (default)
- Title, description, and CTA button
- Clicking CTA opens URL in new tab

**lead_gen**
- Title, description, and email input form
- Success message shown after submission

**static**
- Same layout as action_card
- Designed for page load (non-conversation) contexts

**followup**
- Question text with tap hint
- Entire card is clickable
- Hover effect on desktop

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `ads` | Ad creatives with localized content |
| `advertisers` | Advertiser profiles |
| `requests` | Request logs for analytics |
| `events` | Impression/click events |

## Supported Languages

Currently supports **English** and **Japanese** for ad content and keyword matching.

## License

MIT
