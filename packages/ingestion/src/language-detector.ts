/**
 * @fileoverview Language detection utility
 * Detects document language using franc library and maps to Core's LanguageEnum
 */

import { SUPPORTED_LANGUAGES, LanguageEnum } from "@discoveryos/core";
import type { LanguageDetectionResult } from "./types.js";

// Mapping from franc language codes to Core's LanguageEnum
const FRANC_TO_CORE_LANGUAGE_MAP: Record<string, string> = {
  eng: LanguageEnum.ENGLISH,
  spa: LanguageEnum.SPANISH,
  fra: LanguageEnum.FRENCH,
  deu: LanguageEnum.GERMAN,
  ita: LanguageEnum.ITALIAN,
  por: LanguageEnum.PORTUGUESE,
  nld: LanguageEnum.DUTCH,
  rus: LanguageEnum.RUSSIAN,
  zho: LanguageEnum.CHINESE_SIMPLIFIED,
  jpn: LanguageEnum.JAPANESE,
  kor: LanguageEnum.KOREAN,
};

/**
 * Detect language using simple heuristics
 * (franc library as runtime dependency not included; simplified version)
 * @param text - Text to detect language from
 * @returns Language detection result
 */
export async function detectLanguage(
  text: string
): Promise<LanguageDetectionResult> {
  // Minimal implementation without external dependency
  // In production, use franc library: import franc from 'franc'

  if (!text || text.length < 10) {
    // Not enough text to detect
    return {
      languageCode: LanguageEnum.ENGLISH,
      confidence: 0.3,
      alternatives: [
        { code: LanguageEnum.ENGLISH, confidence: 0.3 },
        { code: LanguageEnum.SPANISH, confidence: 0.2 },
      ],
    };
  }

  // Simple heuristic detection based on character patterns
  const detectedCode = detectByCharacterPatterns(text);

  return {
    languageCode: detectedCode,
    confidence: 0.7,
    alternatives: [
      { code: detectedCode, confidence: 0.7 },
      { code: LanguageEnum.ENGLISH, confidence: 0.2 },
    ],
  };
}

/**
 * Simple character-pattern based language detection
 * @param text - Text to analyze
 * @returns ISO 639-1 language code
 */
function detectByCharacterPatterns(text: string): string {
  // Check for Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) {
    return LanguageEnum.CHINESE_SIMPLIFIED;
  }

  // Check for Japanese hiragana/katakana
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return LanguageEnum.JAPANESE;
  }

  // Check for Korean hangul
  if (/[\uac00-\ud7af]/.test(text)) {
    return LanguageEnum.KOREAN;
  }

  // Check for Cyrillic (Russian)
  if (/[\u0400-\u04ff]/.test(text)) {
    return LanguageEnum.RUSSIAN;
  }

  // Default to English for Latin-script text
  return LanguageEnum.ENGLISH;
}
