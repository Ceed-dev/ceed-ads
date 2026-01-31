/**
 * Mock data for demonstrating new ad formats
 * Used in the SDK test page to showcase lead_gen, static, and followup formats
 */

import type { ResolvedAd } from "@/../sdk/core/types";

/**
 * Demo: Action Card (existing format)
 */
export const demoActionCard: ResolvedAd = {
  id: "demo-action-card",
  advertiserId: "demo-advertiser",
  advertiserName: "TechCorp",
  format: "action_card",
  title: "Level Up Your Coding Skills",
  description:
    "Join over 10,000 developers who have mastered new programming languages with our interactive courses.",
  ctaText: "Start Learning",
  ctaUrl: "https://example.com/techcorp",
};

/**
 * Demo: Lead Gen (email collection form)
 */
export const demoLeadGen: ResolvedAd = {
  id: "demo-lead-gen",
  advertiserId: "demo-advertiser",
  advertiserName: "NewsDigest",
  format: "lead_gen",
  title: "Stay Informed with Tech News",
  description:
    "Get curated tech news delivered to your inbox every morning. Join 50,000+ subscribers.",
  ctaText: "Subscribe",
  ctaUrl: "https://example.com/newsdigest",
  leadGenConfig: {
    placeholder: "Enter your email address",
    submitButtonText: "Subscribe Now",
    autocompleteType: "email",
    successMessage: "Thanks! Check your inbox to confirm your subscription.",
  },
};

/**
 * Demo: Static (page load display ad)
 */
export const demoStatic: ResolvedAd = {
  id: "demo-static",
  advertiserId: "demo-advertiser",
  advertiserName: "CloudHost",
  format: "static",
  title: "Lightning-Fast Cloud Hosting",
  description:
    "Deploy your apps in seconds. 99.99% uptime guarantee. Free SSL certificates included.",
  ctaText: "Get Started Free",
  ctaUrl: "https://example.com/cloudhost",
  staticConfig: {
    displayPosition: "inline",
    targetingParams: {
      keywords: ["hosting", "cloud", "deploy"],
      deviceTypes: ["desktop", "mobile"],
    },
  },
};

/**
 * Demo: Followup (sponsored question card)
 */
export const demoFollowup: ResolvedAd = {
  id: "demo-followup",
  advertiserId: "demo-advertiser",
  advertiserName: "DevTools Pro",
  format: "followup",
  title: "Developer Productivity",
  description: "Supercharge your workflow with AI-powered tools.",
  ctaText: "Learn more",
  ctaUrl: "https://example.com/devtools",
  followupConfig: {
    questionText: "Struggling with debugging? Discover how AI can help you fix bugs 10x faster.",
    tapAction: "redirect",
    tapActionUrl: "https://example.com/devtools/ai-debugging",
  },
};

/**
 * All demo ads by format
 */
export const demoAds = {
  action_card: demoActionCard,
  lead_gen: demoLeadGen,
  static: demoStatic,
  followup: demoFollowup,
};

export type DemoFormat = keyof typeof demoAds;
