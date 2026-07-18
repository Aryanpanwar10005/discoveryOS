/**
 * @fileoverview Document chunking utility
 * Splits raw text into overlapping chunks using Core constants
 */

import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP } from "@discoveryos/core";

/**
 * Split text into overlapping chunks
 * Uses Core's DEFAULT_CHUNK_SIZE and DEFAULT_CHUNK_OVERLAP constants
 * @param text - Raw text to chunk
 * @param chunkSize - Size of each chunk in characters (default: Core constant)
 * @param overlapSize - Overlap between chunks in characters (default: Core constant)
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlapSize: number = DEFAULT_CHUNK_OVERLAP
): string[] {
  if (!text || text.length === 0) {
    return [];
  }

  if (chunkSize <= 0) {
    throw new Error("Chunk size must be positive");
  }

  if (overlapSize < 0) {
    throw new Error("Overlap size must be non-negative");
  }

  if (overlapSize >= chunkSize) {
    throw new Error("Overlap must be less than chunk size");
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex);
    chunks.push(chunk);

    // Move to next chunk start (with overlap)
    const stepSize = chunkSize - overlapSize;
    startIndex += stepSize;

    // Prevent infinite loop on very small text
    if (stepSize <= 0) {
      break;
    }
  }

  return chunks;
}

/**
 * Calculate number of chunks text will be split into
 * @param textLength - Length of text in characters
 * @param chunkSize - Size of each chunk
 * @param overlapSize - Overlap between chunks
 * @returns Number of chunks
 */
export function calculateChunkCount(
  textLength: number,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlapSize: number = DEFAULT_CHUNK_OVERLAP
): number {
  if (textLength === 0) {
    return 0;
  }

  const stepSize = chunkSize - overlapSize;
  return Math.ceil((textLength - overlapSize) / stepSize);
}
