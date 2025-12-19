/**
 * ---------------------------------------------------------------------------
 * Temporary Script: franc Language Detection Test
 * ---------------------------------------------------------------------------
 *
 * Purpose:
 * - Manually verify how the `franc` library detects language codes
 *   from raw text input (e.g. "eng", "jpn", or "und").
 *
 * Why this exists:
 * - To confirm real behavior (accuracy, edge cases, fallbacks)
 *   before integrating `franc` into the production API.
 *
 * How to use:
 * 1. Run the script locally:
 *      npx tsx src/scripts/test-franc.ts
 * 2. Check console output for detected language codes.
 *
 * Notes:
 * - This file is NOT used in production.
 * - Safe to modify or delete after verification.
 * ---------------------------------------------------------------------------
 */

import { franc } from "franc";

const samples = [
  { label: "English", text: "I want to learn programming and AI." },
  { label: "Japanese", text: "日本語の文章を入力しています。" },
  { label: "Short text", text: "Hi" },
  { label: "Mixed", text: "これはAIとprogrammingの話です。" },
];

for (const sample of samples) {
  const code = franc(sample.text);
  console.log(`[${sample.label}] →`, code);
}
