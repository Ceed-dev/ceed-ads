# Ceed Ads - Project Context

> This document provides background context for AI assistants and developers working on this project.

## Purpose

Ceed Ads is a **contextual advertising platform** designed specifically for AI chat applications. Unlike traditional display advertising, it analyzes conversation context to serve relevant, non-intrusive ads that enhance rather than disrupt the user experience.

### Business Goals

1. Provide monetization for AI chatbot developers
2. Deliver value to users through relevant, contextual ads
3. Enable advertisers to reach users at moments of high intent

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────────────────┐
│  Chat App       │     │  Ceed Ads Backend (Next.js)     │
│  (SDK Client)   │────▶│                                 │
│                 │     │  ┌────────────────────────────┐ │
│  @ceedhq/       │     │  │ /api/requests              │ │
│  ads-web-sdk    │     │  │ - Language detection       │ │
│                 │     │  │ - Keyword matching         │ │
└─────────────────┘     │  │ - Cooldown control         │ │
                        │  └────────────────────────────┘ │
                        │                                 │
                        │  ┌────────────────────────────┐ │
                        │  │ /api/events                │ │
                        │  │ - Impression tracking      │ │
                        │  │ - Click tracking           │ │
                        │  └────────────────────────────┘ │
                        │                                 │
                        │  ┌────────────────────────────┐ │
                        │  │ Firebase Firestore         │ │
                        │  │ - ads, advertisers         │ │
                        │  │ - requests, events         │ │
                        │  └────────────────────────────┘ │
                        └─────────────────────────────────┘
```

## Current Status (MVP)

### Supported Features

- **Ad Format**: `action_card` - A text-based promotional card with CTA button
- **Languages**: English (`eng`) and Japanese (`jpn`)
- **Targeting**: Keyword-based matching using ad tags
- **Tracking**: Impression and click events
- **Frequency Control**: 60-second cooldown per conversation

### Ad Formats

| Format | Status | Description |
|--------|--------|-------------|
| `action_card` | Live | Text card with title, description, CTA button |
| `lead_gen` | Live | Email capture form with success message |
| `static` | Live | Display ad below text input field (page load targeting) |
| `followup` | Live | Tappable sponsored question card with expand/redirect action |

## Key Decisions and Rationale

### 1. Server-Side Language Detection

**Decision**: Use `franc` for language detection on the server, not the client.

**Why**:
- Single source of truth for language
- Clients can't manipulate detection
- Consistent behavior across SDK versions

### 2. Exact Word Matching for Keywords

**Decision**: Match keywords as whole words only, not substrings.

**Why**:
- Avoids false positives (e.g., "daily" containing "ai")
- More predictable ad targeting
- Reduces advertiser confusion

### 3. Translation to English for Matching

**Decision**: Translate non-English text to English before keyword matching.

**Why**:
- Advertisers only need to define English keywords
- Consistent matching logic regardless of input language
- Easier to scale to new languages

### 4. Conversation-Level Cooldown

**Decision**: 60-second cooldown per conversation after showing an ad.

**Why**:
- Prevents ad spam in active conversations
- Better user experience
- Matches natural conversation pacing

## Known Constraints

1. **Language Support**: Only English and Japanese currently supported. Other languages return no ads.

2. **No User Authentication**: The SDK accepts `userId` optionally but does not validate it.

3. **No Advertiser Dashboard**: Advertisers currently rely on direct Firestore access or API calls.

4. **No Real-time Analytics**: Event data is stored but not aggregated in real-time.

5. **Four Ad Formats**: action_card, lead_gen, static, and followup are all implemented and live.

## Related Repositories

This repository contains both the backend API and the Web SDK. The SDK is published separately to npm as `@ceedhq/ads-web-sdk`.

## Development Notes

### Testing the SDK Locally

1. Start the dev server: `npm run dev`
2. Visit `/sdk-test` for the demo chat page
3. Use `initialize("demo-app", "/api")` to point SDK to local API

### Firestore Schema

```typescript
// ads/{adId}
{
  advertiserId: string,
  format: "action_card",
  title: { eng: string, jpn?: string },
  description: { eng: string, jpn?: string },
  ctaText: { eng: string, jpn?: string },
  ctaUrl: string,
  tags: string[],
  status: "active" | "paused" | "archived",
  meta: { createdAt: Date, updatedAt: Date }
}

// advertisers/{advertiserId}
{
  name: string,
  status: "active" | "suspended",
  websiteUrl?: string,
  meta: { createdAt: Date, updatedAt: Date }
}
```

## Session History

### 2026-01-31

- Created comprehensive README.md with setup instructions and API reference
- Created CONTEXT.md with project background and architectural decisions

### 2026-02-03: Ad Decision Algorithm v2 Implementation

#### What Was Done
- Implemented v2 ad decision algorithm with intent-aware scoring
- Added opportunity scoring (0-1 scale) based on user context
- Added CPC-based ranking with fatigue penalty
- Added epsilon exploration (5% random from top-5)
- Added feature flags for gradual v1/v2 rollout
- Added in-memory caching for ads/advertisers (60s TTL)

#### Key Technical Decisions
1. **Word Boundary Matching**: Changed from `includes()` to regex `/\b${keyword}\b/`
   to prevent false positives (e.g., "hi" matching "this")
2. **Intent Categories**: sensitive, chitchat, low_intent, medium_commercial, high_commercial
3. **Thresholds**: T_LOW=0.3 (no ad), T_HIGH=0.7 (all formats allowed)
4. **Feature Flag Control**: V2_ENABLED, V2_APP_IDS, V2_PERCENTAGE env vars

#### Bug Fixes
- Fixed opportunityScorer.ts keyword matching bug
  (was matching "hi" in "this", "machine", "history")

#### Test Coverage
- 171 unit tests (all passing)
- 19 E2E tests covering 8 real-world scenarios

#### New Files
- src/lib/ads/deciders/v2/* (7 files)
- src/lib/ads/cache/* (2 files)
- src/lib/ads/featureFlags.ts
- src/__tests__/e2e/adDecisionV2.e2e.test.ts

#### Commits
- acb198f: feat(ads): implement Ad Decision Algorithm v2

### 2026-02-03: Formats Parameter & Ad Showcase

#### What Was Done
- Added `formats` parameter support to `/api/requests` endpoint
- Backend now filters ads by requested formats (v1 and v2 deciders)
- Created `/ad-showcase` demo page for screen recording
- Updated SDK documentation for `static` format positioning

#### Ad Showcase Page (`/ad-showcase`)
A demo page displaying 4 separate chat rooms, each demonstrating one ad format:
- **action_card**: Language learning conversation, CTA opens URL in new tab
- **lead_gen**: Travel planning conversation, email form with success message
- **static**: Fitness goals conversation, fixed banner below input field
- **followup**: Cooking ideas conversation, tappable card with expand action

#### Documentation Updates
- Updated `static` format description to match Koala Labs specification
- Static ads now described as "below text input field" (not sidebars/headers)
- Added visual diagram showing input field + ad layout

#### Commits
- dc9ba46: feat(api): add formats parameter support to /api/requests
