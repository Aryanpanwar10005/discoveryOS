/**
 * @fileoverview Confidence score utilities for DiscoveryOS.
 * Provides functions for working with confidence scores (0-1 range).
 */

import type { ConfidenceScore } from "../types/primitives.js";
import { CONFIDENCE_THRESHOLDS } from "./constants.js";

/**
 * Creates a confidence score with validation
 * Constrains value to 0-1 range
 * @param value - Numeric confidence score
 * @returns Validated confidence score clamped to [0, 1]
 * @throws Error if value is not a number
 */
export function createConfidenceScore(value: number): ConfidenceScore {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Invalid confidence score: ${value}`);
  }
  // Clamp to valid range [0, 1]
  const clamped = Math.max(0, Math.min(1, value));
  return clamped as ConfidenceScore;
}

/**
 * Validates if a value is a valid confidence score
 * Checks type and range [0, 1]
 * @param value - Value to validate
 * @returns True if value is valid confidence score
 */
export function isValidConfidenceScore(value: unknown): value is ConfidenceScore {
  return typeof value === "number" && !isNaN(value) && value >= 0 && value <= 1;
}

/**
 * Gets human-readable confidence level name
 * Categorizes score into qualitative levels
 * @param score - Confidence score to categorize
 * @returns Level name: "very_low" | "low" | "medium" | "high" | "very_high"
 */
export function getConfidenceLevel(score: ConfidenceScore): "very_low" | "low" | "medium" | "high" | "very_high" {
  const lowThreshold = CONFIDENCE_THRESHOLDS.LOW;
  const mediumThreshold = CONFIDENCE_THRESHOLDS.MEDIUM;
  const highThreshold = CONFIDENCE_THRESHOLDS.HIGH;
  
  if (score >= highThreshold) {
    if (score >= 0.95) return "very_high";
    return "high";
  }
  if (score >= mediumThreshold) return "medium";
  if (score >= lowThreshold) return "low";
  return "very_low";
}

/**
 * Checks if confidence score meets a threshold
 * @param score - Confidence score to check
 * @param threshold - Minimum threshold required
 * @returns True if score >= threshold
 */
export function meetsThreshold(score: ConfidenceScore, threshold: ConfidenceScore): boolean {
  return score >= threshold;
}

/**
 * Calculates arithmetic mean of confidence scores
 * @param scores - Array of confidence scores
 * @returns Average confidence score
 * @throws Error if scores array is empty
 */
export function averageConfidenceScores(scores: readonly ConfidenceScore[]): ConfidenceScore {
  if (scores.length === 0) {
    throw new Error("Cannot average empty array of confidence scores");
  }
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return createConfidenceScore(sum / scores.length);
}

/**
 * Calculates weighted average of confidence scores
 * @param scores - Array of confidence scores
 * @param weights - Array of weights corresponding to scores
 * @returns Weighted average confidence score
 * @throws Error if arrays are different lengths or empty
 */
export function weightedConfidenceAverage(
  scores: readonly ConfidenceScore[],
  weights: readonly number[]
): ConfidenceScore {
  if (scores.length === 0 || weights.length === 0) {
    throw new Error("Cannot calculate weighted average of empty arrays");
  }
  if (scores.length !== weights.length) {
    throw new Error("Scores and weights arrays must have same length");
  }

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  if (totalWeight === 0) {
    throw new Error("Total weight cannot be zero");
  }

  const weightedSum = scores.reduce((acc, score, idx) => acc + score * (weights[idx]!), 0);
  return createConfidenceScore(weightedSum / totalWeight);
}

/**
 * Combines multiple confidence scores using multiplication (conjunctive)
 * Results in lower scores when combining; suitable for AND logic
 * @param scores - Confidence scores to combine
 * @returns Combined confidence score
 */
export function combineConfidenceScores(scores: readonly ConfidenceScore[]): ConfidenceScore {
  if (scores.length === 0) {
    return createConfidenceScore(0);
  }
  const combined = scores.reduce((acc, score) => acc * score, 1);
  return createConfidenceScore(combined);
}

/**
 * Checks if confidence score represents high confidence
 * Uses HIGH threshold from constants
 * @param score - Score to check
 * @returns True if score is >= HIGH threshold
 */
export function isHighConfidence(score: ConfidenceScore): boolean {
  return meetsThreshold(score, CONFIDENCE_THRESHOLDS.HIGH as ConfidenceScore);
}

/**
 * Checks if confidence score is below minimum acceptable threshold
 * @param score - Score to check
 * @param minimum - Minimum acceptable threshold (default: LOW)
 * @returns True if score is below minimum
 */
export function isBelowThreshold(score: ConfidenceScore, minimum: ConfidenceScore = CONFIDENCE_THRESHOLDS.LOW as ConfidenceScore): boolean {
  return !(score >= minimum);
}
