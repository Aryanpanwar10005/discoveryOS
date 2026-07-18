/**
 * @fileoverview Enumeration definitions for DiscoveryOS core domain.
 * Defines all constant enumerations used across the platform for statuses,
 * types, and agent identifiers.
 */

/**
 * Document processing status lifecycle.
 * - PENDING: Awaiting processing
 * - PROCESSING: Currently being processed
 * - PROCESSED: Successfully completed
 * - FAILED: Processing encountered an error
 * - ARCHIVED: Document has been archived
 */
export const DocumentStatusEnum = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  FAILED: "FAILED",
  ARCHIVED: "ARCHIVED",
} as const;

/**
 * Evidence categorization types for research analyst output.
 * Represents different categories of customer research evidence.
 */
export const EvidenceTypeEnum = {
  PAIN_POINT: "PAIN_POINT",
  USER_QUOTE: "USER_QUOTE",
  COMPLAINT: "COMPLAINT",
  REQUEST: "REQUEST",
  BUG: "BUG",
  WORKFLOW_PROBLEM: "WORKFLOW_PROBLEM",
  FEATURE_REQUEST: "FEATURE_REQUEST",
  OTHER: "OTHER",
} as const;

/**
 * Priority levels for product opportunities.
 * Used to rank opportunities by strategic importance.
 */
export const OpportunityPriorityEnum = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

/**
 * Agent identifiers in the discovery pipeline.
 * Represents each specialized agent in the processing workflow.
 */
export const AgentNameEnum = {
  RESEARCH_ANALYST: "RESEARCH_ANALYST",
  INSIGHT_SYNTHESIZER: "INSIGHT_SYNTHESIZER",
  THEME_GROUPER: "THEME_GROUPER",
  OPPORTUNITY_STRATEGIST: "OPPORTUNITY_STRATEGIST",
  PRODUCT_INTELLIGENCE_MANAGER: "PRODUCT_INTELLIGENCE_MANAGER",
} as const;

/**
 * Source document types for ingestion.
 * Represents all supported file and platform formats.
 */
export const SourceTypeEnum = {
  PDF: "PDF",
  DOCX: "DOCX",
  TXT: "TXT",
  CSV: "CSV",
  MARKDOWN: "MARKDOWN",
  GOOGLE_DOCS: "GOOGLE_DOCS",
  NOTION: "NOTION",
  SLACK: "SLACK",
  JIRA: "JIRA",
  GITHUB_ISSUES: "GITHUB_ISSUES",
  ZENDESK: "ZENDESK",
  INTERCOM: "INTERCOM",
  OTHER: "OTHER",
} as const;

/**
 * Processing status for background job tracking.
 * PARTIAL status indicates some content was processed despite errors.
 */
export const ProcessingStatusEnum = {
  QUEUED: "QUEUED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PARTIAL: "PARTIAL",
} as const;

/**
 * Supported language codes for content processing.
 * ISO 639-1 codes with regional variants where applicable.
 */
export const LanguageEnum = {
  ENGLISH: "en",
  SPANISH: "es",
  FRENCH: "fr",
  GERMAN: "de",
  ITALIAN: "it",
  PORTUGUESE: "pt",
  DUTCH: "nl",
  RUSSIAN: "ru",
  CHINESE_SIMPLIFIED: "zh-cn",
  CHINESE_TRADITIONAL: "zh-tw",
  JAPANESE: "ja",
  KOREAN: "ko",
} as const;

// Type exports for use in discriminated unions
export type DocumentStatus = typeof DocumentStatusEnum[keyof typeof DocumentStatusEnum];
export type EvidenceType = typeof EvidenceTypeEnum[keyof typeof EvidenceTypeEnum];
export type OpportunityPriority = typeof OpportunityPriorityEnum[keyof typeof OpportunityPriorityEnum];
export type AgentName = typeof AgentNameEnum[keyof typeof AgentNameEnum];
export type SourceType = typeof SourceTypeEnum[keyof typeof SourceTypeEnum];
export type ProcessingStatus = typeof ProcessingStatusEnum[keyof typeof ProcessingStatusEnum];
export type Language = typeof LanguageEnum[keyof typeof LanguageEnum];
