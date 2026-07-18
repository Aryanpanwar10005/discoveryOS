/**
 * @fileoverview Primitive type definitions and branded types for DiscoveryOS.
 * Defines type-safe wrappers for common primitives and domain concepts.
 */

import type { DocumentStatus, EvidenceType, OpportunityPriority, AgentName, SourceType, ProcessingStatus, Language } from "./enums.js";

/**
 * Branded string type for UUIDs (v4 format)
 * Ensures type safety for UUID values at compile time
 */
export type UUID = string & { readonly __brand: "UUID" };

/**
 * Branded string type for ISO 8601 date strings
 * Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
 */
export type ISODate = string & { readonly __brand: "ISODate" };

/**
 * Branded number type for Unix timestamps (milliseconds)
 * Represents the number of milliseconds since Unix epoch
 */
export type Timestamp = number & { readonly __brand: "Timestamp" };

/**
 * Email address string type
 * Should be validated against RFC 5322 or similar standard
 */
export type Email = string & { readonly __brand: "Email" };

/**
 * URL string type
 * Should be a valid absolute or relative URL
 */
export type URL = string & { readonly __brand: "URL" };

/**
 * Confidence score between 0 and 1 (inclusive)
 * Represents certainty level for AI-generated classifications
 * 0 = no confidence, 1 = maximum confidence
 */
export type ConfidenceScore = number & { readonly __brand: "ConfidenceScore" };

// Type aliases for enum discriminated unions
export type DocumentStatusType = DocumentStatus;
export type EvidenceTypeValue = EvidenceType;
export type OpportunityPriorityValue = OpportunityPriority;
export type AgentNameValue = AgentName;
export type SourceTypeValue = SourceType;
export type ProcessingStatusValue = ProcessingStatus;
export type LanguageValue = Language;
