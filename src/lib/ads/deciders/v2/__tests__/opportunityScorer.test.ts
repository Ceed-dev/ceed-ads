import { describe, it, expect } from "vitest";
import { scoreOpportunity } from "../opportunityScorer";

describe("scoreOpportunity", () => {
  describe("SENSITIVE_KEYWORDS detection", () => {
    it('should return score=0, intent="sensitive" for "I feel depressed today"', () => {
      const result = scoreOpportunity("I feel depressed today", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should return score=0, intent="sensitive" for "suicide prevention"', () => {
      const result = scoreOpportunity("suicide prevention", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should return score=0, intent="sensitive" for "I need medication advice"', () => {
      const result = scoreOpportunity("I need medication advice", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should detect "anxious" as sensitive', () => {
      const result = scoreOpportunity("I am feeling anxious", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should detect "self-harm" as sensitive', () => {
      const result = scoreOpportunity("information about self-harm", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should detect "mental health" as sensitive', () => {
      const result = scoreOpportunity("mental health resources", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should detect "legal" as sensitive', () => {
      const result = scoreOpportunity("I need legal advice", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it('should detect "emergency" as sensitive', () => {
      const result = scoreOpportunity("this is an emergency", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });
  });

  describe("LOW_INTENT_KEYWORDS detection (chitchat)", () => {
    it('should return score=0.1, intent="chitchat" for "hello how are you"', () => {
      const result = scoreOpportunity("hello how are you", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should return score=0.1, intent="chitchat" for "thanks bye"', () => {
      const result = scoreOpportunity("thanks bye", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should return score=0.1, intent="chitchat" for "hi there"', () => {
      const result = scoreOpportunity("hi there", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should detect "hey" as chitchat', () => {
      const result = scoreOpportunity("hey everyone", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should detect "thank you" as chitchat', () => {
      const result = scoreOpportunity("thank you very much", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should detect "good morning" as chitchat', () => {
      const result = scoreOpportunity("good morning everyone", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should detect "good night" as chitchat', () => {
      const result = scoreOpportunity("good night sleep well", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it('should detect "what\'s up" as chitchat', () => {
      const result = scoreOpportunity("what's up buddy", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });
  });

  describe("HIGH_INTENT_KEYWORDS detection", () => {
    it('should return score=0.8, intent="high_commercial" for "I want to buy a laptop"', () => {
      const result = scoreOpportunity("I want to buy a laptop", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should return score=0.8, intent="high_commercial" for "compare prices for subscription"', () => {
      const result = scoreOpportunity("compare prices for subscription", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should return score=0.8, intent="high_commercial" for "recommend me a product"', () => {
      const result = scoreOpportunity("recommend me a product", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "purchase" as high_commercial', () => {
      // Note: "I want to purchase this" contains "hi" in "this" which matches LOW_INTENT
      // Using text without "this" to test "purchase" keyword
      const result = scoreOpportunity("I want to purchase now", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "pricing" as high_commercial', () => {
      const result = scoreOpportunity("what is the pricing", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "discount" as high_commercial', () => {
      const result = scoreOpportunity("any discount available", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "free trial" as high_commercial', () => {
      const result = scoreOpportunity("is there a free trial", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "sign up" as high_commercial', () => {
      const result = scoreOpportunity("how to sign up", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it('should detect "get started" as high_commercial', () => {
      const result = scoreOpportunity("help me get started", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });
  });

  describe("Short text detection (<3 words)", () => {
    it('should return score=0.2, intent="low_intent" for single word without keywords', () => {
      const result = scoreOpportunity("testing", "eng");
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });

    it('should return score=0.2, intent="low_intent" for two words without keywords', () => {
      const result = scoreOpportunity("just testing", "eng");
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });

    it("should handle single character words", () => {
      const result = scoreOpportunity("a b", "eng");
      // Words with length <= 2 are filtered out by split, so this might be 0 words
      // Actually looking at the code: .filter((w) => w.length > 0) - so single chars count
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });
  });

  describe("Default behavior (medium_commercial)", () => {
    it('should return score=0.5, intent="medium_commercial" for normal text', () => {
      const result = scoreOpportunity(
        "I'm looking for information about travel destinations",
        "eng"
      );
      expect(result.score).toBe(0.5);
      expect(result.intent).toBe("medium_commercial");
    });

    it('should return score=0.5, intent="medium_commercial" for technical question', () => {
      // Note: "machine" contains "hi" substring, triggering LOW_INTENT match
      // BUG DETECTED: substring matching causes false positives
      // Using text without substring matches
      const result = scoreOpportunity(
        "what does neural network do in production",
        "eng"
      );
      expect(result.score).toBe(0.5);
      expect(result.intent).toBe("medium_commercial");
    });

    it('should return score=0.5, intent="medium_commercial" for general inquiry', () => {
      // Note: "history" contains "hi" substring, triggering LOW_INTENT match
      // BUG DETECTED: substring matching causes false positives
      const result = scoreOpportunity(
        "tell me about computers and software",
        "eng"
      );
      expect(result.score).toBe(0.5);
      expect(result.intent).toBe("medium_commercial");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", () => {
      const result = scoreOpportunity("", "eng");
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });

    it("should handle whitespace only", () => {
      const result = scoreOpportunity("   ", "eng");
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });

    it("should handle special characters only", () => {
      const result = scoreOpportunity("!@#$%^&*()", "eng");
      expect(result.score).toBe(0.2);
      expect(result.intent).toBe("low_intent");
    });

    it("should handle very long text without keywords", () => {
      // Note: "this" contains "hi" substring, triggering LOW_INTENT match
      // BUG DETECTED: substring matching causes false positives
      const longText = "just a very long text ".repeat(100);
      const result = scoreOpportunity(longText, "eng");
      expect(result.score).toBe(0.5);
      expect(result.intent).toBe("medium_commercial");
    });

    it("should be case-insensitive for SENSITIVE keywords", () => {
      const result = scoreOpportunity("I feel DEPRESSED", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it("should be case-insensitive for LOW_INTENT keywords", () => {
      const result = scoreOpportunity("HELLO there friend", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it("should be case-insensitive for HIGH_INTENT keywords", () => {
      // Note: "something" contains "hi" substring, use different text
      const result = scoreOpportunity("I want to BUY now", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it("should handle mixed case throughout", () => {
      // Note: "ThIs" contains "hi" substring, triggering LOW_INTENT match
      // BUG DETECTED: substring matching causes false positives
      const result = scoreOpportunity("PuRcHaSe NoW PlEaSe", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it("should handle newlines and tabs", () => {
      // Note: "this" contains "hi" substring, triggering LOW_INTENT match
      // BUG DETECTED: substring matching causes false positives
      const result = scoreOpportunity("tell\nme\tabout\nthat\ttopic", "eng");
      expect(result.score).toBe(0.5);
      expect(result.intent).toBe("medium_commercial");
    });
  });

  describe("Priority tests (CRITICAL)", () => {
    it("should prioritize SENSITIVE over HIGH_INTENT", () => {
      // "depressed" is sensitive, "buy" is high_intent
      const result = scoreOpportunity("I am depressed and want to buy help", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it("should prioritize SENSITIVE over LOW_INTENT", () => {
      // "suicide" is sensitive, "hello" is low_intent
      const result = scoreOpportunity("hello I am thinking about suicide", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it("should prioritize LOW_INTENT over HIGH_INTENT", () => {
      // "hello" is low_intent, "buy" is high_intent
      const result = scoreOpportunity("hello I want to buy something", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });

    it("should handle multiple sensitive keywords", () => {
      const result = scoreOpportunity("depressed anxious sad", "eng");
      expect(result.score).toBe(0);
      expect(result.intent).toBe("sensitive");
    });

    it("should handle multiple high intent keywords", () => {
      const result = scoreOpportunity("buy purchase order subscribe", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it("should prioritize keywords over short text rule", () => {
      // "buy" is high_intent, but only 1 word
      const result = scoreOpportunity("buy", "eng");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });

    it("should prioritize low_intent keyword over short text rule", () => {
      // "hello" is low_intent keyword
      const result = scoreOpportunity("hello", "eng");
      expect(result.score).toBe(0.1);
      expect(result.intent).toBe("chitchat");
    });
  });

  describe("Bug fix verification: Word boundary matching", () => {
    // These tests verify the bug fix for substring matching false positives
    // The fix uses word boundary regex instead of includes()

    describe("Words containing 'hi' should NOT trigger chitchat", () => {
      it('"this is a test" should be MEDIUM_INTENT (not chitchat)', () => {
        const result = scoreOpportunity("this is a test", "eng");
        expect(result.score).toBe(0.5);
        expect(result.intent).toBe("medium_commercial");
      });

      it('"machine learning is interesting" should be MEDIUM_INTENT (not chitchat)', () => {
        const result = scoreOpportunity("machine learning is interesting", "eng");
        expect(result.score).toBe(0.5);
        expect(result.intent).toBe("medium_commercial");
      });

      it('"history of computers" should be MEDIUM_INTENT (not chitchat)', () => {
        const result = scoreOpportunity("history of computers", "eng");
        expect(result.score).toBe(0.5);
        expect(result.intent).toBe("medium_commercial");
      });

      it('"I\'m thinking about it" should be MEDIUM_INTENT (not chitchat)', () => {
        const result = scoreOpportunity("I'm thinking about it", "eng");
        expect(result.score).toBe(0.5);
        expect(result.intent).toBe("medium_commercial");
      });

      it('"I want to buy this product" should be HIGH_INTENT (buy matches)', () => {
        const result = scoreOpportunity("I want to buy this product", "eng");
        // "buy" should match, "this" should NOT trigger chitchat
        expect(result.score).toBe(0.8);
        expect(result.intent).toBe("high_commercial");
      });
    });

    describe("Actual chitchat keywords should still work correctly", () => {
      it('"hi there" should be CHITCHAT (correct match)', () => {
        const result = scoreOpportunity("hi there", "eng");
        expect(result.score).toBe(0.1);
        expect(result.intent).toBe("chitchat");
      });

      it('"hello world" should be CHITCHAT (correct match)', () => {
        const result = scoreOpportunity("hello world", "eng");
        expect(result.score).toBe(0.1);
        expect(result.intent).toBe("chitchat");
      });

      it('"bye bye" should be CHITCHAT (correct match)', () => {
        const result = scoreOpportunity("bye bye", "eng");
        expect(result.score).toBe(0.1);
        expect(result.intent).toBe("chitchat");
      });

      it('"thanks a lot" should be CHITCHAT (correct match)', () => {
        const result = scoreOpportunity("thanks a lot", "eng");
        expect(result.score).toBe(0.1);
        expect(result.intent).toBe("chitchat");
      });
    });
  });

  describe("Language parameter", () => {
    it("should accept language parameter without error", () => {
      const result = scoreOpportunity("test message", "jpn");
      expect(result).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it("should work with any language code", () => {
      const result = scoreOpportunity("I want to buy", "fra");
      expect(result.score).toBe(0.8);
      expect(result.intent).toBe("high_commercial");
    });
  });
});
