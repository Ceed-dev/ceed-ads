/**
 * --------------------------------------------------------------------
 * Translate text into English using Google Cloud Translation API.
 *
 * Purpose:
 * - Normalize multilingual user input into English
 * - Used before keyword-based ad matching
 *
 * Design notes:
 * - Server-side only
 * - Credentials are provided via env (JSON string)
 * - Returns original text on failure (safe fallback)
 * --------------------------------------------------------------------
 */

import { TranslationServiceClient } from "@google-cloud/translate";

/**
 * Mapping from internal language codes (franc output)
 * to Google Cloud Translation API language codes.
 *
 * Example:
 * - "eng" → "en"
 * - "jpn" → "ja"
 */
const LANGUAGE_MAP: Record<string, string> = {
  eng: "en",
  jpn: "ja",
};

/**
 * Lazily create a Translation client using env-based credentials.
 * This avoids global initialization issues in serverless environments.
 */
function createTranslationClient() {
  const rawCredentials = process.env.GOOGLE_TRANSLATION_CREDENTIALS;

  if (!rawCredentials) {
    throw new Error("GOOGLE_TRANSLATION_CREDENTIALS is not set");
  }

  return new TranslationServiceClient({
    credentials: JSON.parse(rawCredentials),
  });
}

/**
 * Translate arbitrary text into English.
 *
 * @param text - Original user input
 * @param sourceLanguage - Detected language code (e.g. "jpn", "eng")
 * @returns Translated English text (or original text on failure)
 */
export async function toEnglish(
  text: string,
  sourceLanguage: string,
): Promise<string> {
  // If already English, skip translation
  if (sourceLanguage === "eng") {
    return text;
  }

  const sourceLang = LANGUAGE_MAP[sourceLanguage] ?? "auto";

  try {
    const client = createTranslationClient();

    const projectId = JSON.parse(
      process.env.GOOGLE_TRANSLATION_CREDENTIALS as string,
    ).project_id;

    const location = "global";

    const [response] = await client.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain",
      sourceLanguageCode: sourceLang,
      targetLanguageCode: "en",
    });

    const translated = response.translations?.[0]?.translatedText ?? text;

    return translated;
  } catch (error) {
    console.error("[toEnglish] Translation failed:", error);

    // Fail-safe: return original text
    return text;
  }
}
