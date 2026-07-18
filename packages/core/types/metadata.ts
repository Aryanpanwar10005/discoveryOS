/**
 * @fileoverview Metadata and relationship types for DiscoveryOS.
 * Defines structures for tracking relationships between domain entities.
 */

import type { UUID, Timestamp, ConfidenceScore } from "./primitives.js";

/**
 * Metadata container for additional contextual information
 * Allows flexible attachment of arbitrary key-value data
 */
export interface Metadata {
  readonly [key: string]: string | number | boolean | string[] | null;
}

/**
 * Metadata associated with text chunks
 * Tracks position and source information for document segments
 */
export interface ChunkMetadata extends Metadata {
  readonly chunkIndex: number;
  readonly sourceDocumentId: UUID;
  readonly startCharacterIndex: number;
  readonly endCharacterIndex: number;
  readonly chunkHash: string;
}

/**
 * Reference to an embedding vector in external storage
 * Used to link text to its vector representation
 */
export interface EmbeddingReference {
  readonly embeddingId: UUID;
  readonly model: string;
  readonly dimension: number;
  readonly createdAt: Timestamp;
}

/**
 * Summary of analysis performed on a piece of content
 * Captures key metrics about processing
 */
export interface AnalysisSummary {
  readonly totalTokensProcessed: number;
  readonly processingDurationMs: number;
  readonly modelsUsed: string[];
  readonly confidenceScore: ConfidenceScore;
  readonly quality: "low" | "medium" | "high";
}

/**
 * Represents a directed relationship between two entities
 * Generic type parameter T is the target entity type
 */
export interface Relationship<T> {
  readonly id: UUID;
  readonly sourceId: UUID;
  readonly targetId: UUID;
  readonly targetEntity?: T;
  readonly type: string;
  readonly strength: ConfidenceScore;
  readonly metadata: Metadata;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Context information for relationships
 * Provides reasoning and backing for relationship creation
 */
export interface RelationshipContext {
  readonly reason: string;
  readonly evidence: string[];
  readonly score: ConfidenceScore;
}

/**
 * Pagination metadata for list results
 * Enables cursor-based or offset-based pagination
 */
export interface PaginationMetadata {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly cursor?: string;
}
