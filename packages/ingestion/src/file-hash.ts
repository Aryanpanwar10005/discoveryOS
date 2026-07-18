/**
 * @fileoverview File hashing utility
 * Computes SHA-256 hash for document content
 */

import { createHash } from "crypto";

/**
 * Compute SHA-256 hash of text content
 * @param content - Text content to hash
 * @returns SHA-256 hash as hex string
 */
export function computeFileHash(content: string): string {
  const hash = createHash("sha256");
  hash.update(content, "utf-8");
  return hash.digest("hex");
}

/**
 * Verify content against hash
 * @param content - Content to verify
 * @param expectedHash - Expected hash value
 * @returns True if hashes match
 */
export function verifyFileHash(content: string, expectedHash: string): boolean {
  const actualHash = computeFileHash(content);
  return actualHash === expectedHash;
}
