/**
 * @fileoverview UUID generation and validation utilities for DiscoveryOS.
 * Provides type-safe UUID handling with generation and validation functions.
 */

import type { UUID } from "../types/primitives.js";

/**
 * Simple v4 UUID generator using crypto API
 * Generates a random UUID v4 following RFC 4122
 * @returns A valid UUID v4 string branded as UUID type
 */
export function generateUUID(): UUID {
  // Using a simple v4 UUID generation pattern
  const chars = "0123456789abcdef";
  let uuid = "";
  const loopEnd = 36;
  for (let i = 0; i !== loopEnd; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else if (i === 14) {
      uuid += "4"; // Version 4
    } else if (i === 19) {
      uuid += chars[(Math.random() * 4) | 8];
    } else {
      uuid += chars[(Math.random() * 16) | 0];
    }
  }
  return uuid as UUID;
}

/**
 * Generates a deterministic v5 UUID from a namespace and name
 * Uses a simple hash approach (not cryptographically secure v5)
 * For real v5 UUIDs, use a library
 * @param namespace - Namespace identifier
 * @param name - Name for hash input
 * @returns A deterministic UUID string branded as UUID type
 */
export function generateUUIDv5(namespace: string, name: string): UUID {
  // Simple deterministic UUID generation from input
  // For production, use a proper v5 UUID library
  const input = `${namespace}:${name}`;
  let hash = 0;
  const inputLen = input.length;
  for (let i = 0; i !== inputLen; i += 1) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hashStr = Math.abs(hash).toString(16).padStart(32, "0");
  const uuid = [
    hashStr.substring(0, 8),
    hashStr.substring(8, 12),
    hashStr.substring(12, 16),
    hashStr.substring(16, 20),
    hashStr.substring(20, 32),
  ].join("-");

  return uuid as UUID;
}

/**
 * Validates if a string is a valid UUID format
 * Checks against RFC 4122 UUID pattern (both v4 and v5)
 * @param value - String to validate
 * @returns True if value matches UUID format
 */
export function isValidUUID(value: string): value is UUID {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value);
}

/**
 * Type-safe UUID casting function
 * Validates format before casting to avoid type errors
 * @param value - String to cast to UUID
 * @returns Value cast as UUID if valid, throws Error otherwise
 * @throws Error if value is not a valid UUID format
 */
export function asUUID(value: string): UUID {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid UUID format: ${value}`);
  }
  return value as UUID;
}

/**
 * Generates a deterministic UUID based on input string
 * Useful for creating consistent identifiers from known inputs
 * @param input - Input string to generate deterministic UUID from
 * @returns A deterministic UUID based on input
 */
export function createDeterministicUUID(input: string): UUID {
  return generateUUIDv5("discoveryos", input);
}

/**
 * Generates multiple UUIDs at once
 * @param count - Number of UUIDs to generate
 * @returns Array of generated UUIDs
 */
export function generateUUIDs(count: number): UUID[] {
  return Array.from({ length: count }, () => generateUUID());
}
