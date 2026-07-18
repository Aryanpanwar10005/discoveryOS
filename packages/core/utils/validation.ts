/**
 * @fileoverview Validation utilities for DiscoveryOS.
 * Provides type-safe validation functions for common data types.
 */

/**
 * Validates email format using a relaxed regex
 * For production, consider using a proper email validation library
 * @param email - Email string to validate
 * @returns True if email matches basic format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email);
}

/**
 * Validates URL format
 * Checks for valid HTTP/HTTPS URLs or relative paths
 * @param url - URL string to validate
 * @returns True if url is valid
 */
export function validateURL(url: string): boolean {
  if (typeof url !== "string") return false;

  try {
    // Try to parse as absolute URL
    new URL(url);
    return true;
  } catch {
    // Allow relative paths starting with / or ./
    return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
  }
}

/**
 * Checks if value is a non-empty string
 * @param value - Value to check
 * @returns True if value is string and has non-zero length after trim
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Checks if string is valid JSON
 * @param value - String to validate as JSON
 * @returns True if string parses as valid JSON
 */
export function isValidJSON(value: string): boolean {
  if (typeof value !== "string") return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if value is a non-empty array
 * @param value - Value to check
 * @returns True if value is array with at least one element
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Checks if array size is within valid range
 * @param array - Array to check
 * @param minSize - Minimum required size (inclusive)
 * @param maxSize - Maximum allowed size (inclusive)
 * @returns True if array size is in valid range
 */
export function isArraySizeValid<T>(array: T[], minSize: number, maxSize: number): boolean {
  return Array.isArray(array) && array.length >= minSize && array.length <= maxSize;
}

/**
 * Checks if number is within specified range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is in range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return typeof value === "number" && !isNaN(value) && value >= min && value <= max;
}

/**
 * Checks if string matches a regex pattern
 * @param value - String to check
 * @param pattern - Regex pattern to match against
 * @returns True if string matches pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return typeof value === "string" && pattern.test(value);
}

/**
 * Checks if object has all required keys
 * @param obj - Object to check
 * @param requiredKeys - Keys that must be present
 * @returns True if all required keys exist in object
 */
export function hasRequiredKeys<T extends Record<string, unknown>>(
  obj: unknown,
  requiredKeys: readonly (keyof T)[]
): obj is T {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return requiredKeys.every((key) => key in record);
}

/**
 * Checks if string is valid UUID format
 * @param value - String to validate
 * @returns True if string matches UUID pattern
 */
export function isValidUUIDFormat(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof value === "string" && uuidRegex.test(value);
}

/**
 * Checks if value is a positive integer
 * @param value - Value to check
 * @returns True if value is positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Checks if value is a non-negative integer
 * @param value - Value to check
 * @returns True if value is non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Type-safe object key checker
 * @param obj - Object to check
 * @param key - Key to verify
 * @returns True if key exists in object
 */
export function hasKey<T extends Record<string, unknown>>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return key in obj;
}
