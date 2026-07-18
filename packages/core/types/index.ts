/**
 * @fileoverview Type exports for DiscoveryOS core package.
 * Re-exports all type definitions for convenient importing.
 */

export type { UUID, ISODate, Timestamp, Email, URL, ConfidenceScore, DocumentStatusType, EvidenceTypeValue, OpportunityPriorityValue, AgentNameValue, SourceTypeValue, ProcessingStatusValue, LanguageValue } from "./primitives.js";

export type { Metadata, ChunkMetadata, EmbeddingReference, AnalysisSummary, Relationship, RelationshipContext, PaginationMetadata } from "./metadata.js";

export type { ValidationError, ProcessingError, AnalysisError, AgentError } from "./errors.js";

export type { SuccessResult, FailureResult, Result, DomainError } from "./results.js";

export { Ok, Err, isSuccess, isFailure, unwrap, getError, map, flatMap } from "./results.js";
