/**
 * @fileoverview Zod schemas for DiscoveryOS domain models.
 * Provides validation schemas for all core entities.
 */

import { z } from "zod";
import {
  DocumentStatusEnum,
  EvidenceTypeEnum,
  OpportunityPriorityEnum,
  AgentNameEnum,
  SourceTypeEnum,
  ProcessingStatusEnum,
  LanguageEnum,
} from "../types/enums.js";
import {
  MIN_EVIDENCE_FOR_INSIGHT,
  MIN_INSIGHTS_FOR_THEME,
  MAX_THEMES_PER_OPPORTUNITY,
  MAX_OPPORTUNITIES_PER_REPORT,
} from "../utils/constants.js";

// Base schemas for primitive types
const UUIDSchema = z.string().uuid().brand("UUID");
const ISODateSchema = z.string().datetime().brand("ISODate");
const TimestampSchema = z.number().int().nonnegative().brand("Timestamp");
const EmailSchema = z.string().email().brand("Email");
const URLSchema = z.string().url().brand("URL");
const ConfidenceScoreSchema = z
  .number()
  .min(0)
  .max(1)
  .brand("ConfidenceScore");

// Enum schemas
const DocumentStatusSchema = z.enum([
  DocumentStatusEnum.PENDING,
  DocumentStatusEnum.PROCESSING,
  DocumentStatusEnum.PROCESSED,
  DocumentStatusEnum.FAILED,
  DocumentStatusEnum.ARCHIVED,
]);

const EvidenceTypeSchema = z.enum([
  EvidenceTypeEnum.PAIN_POINT,
  EvidenceTypeEnum.USER_QUOTE,
  EvidenceTypeEnum.COMPLAINT,
  EvidenceTypeEnum.REQUEST,
  EvidenceTypeEnum.BUG,
  EvidenceTypeEnum.WORKFLOW_PROBLEM,
  EvidenceTypeEnum.FEATURE_REQUEST,
  EvidenceTypeEnum.OTHER,
]);

const OpportunityPrioritySchema = z.enum([
  OpportunityPriorityEnum.CRITICAL,
  OpportunityPriorityEnum.HIGH,
  OpportunityPriorityEnum.MEDIUM,
  OpportunityPriorityEnum.LOW,
]);

const AgentNameSchema = z.enum([
  AgentNameEnum.RESEARCH_ANALYST,
  AgentNameEnum.INSIGHT_SYNTHESIZER,
  AgentNameEnum.THEME_GROUPER,
  AgentNameEnum.OPPORTUNITY_STRATEGIST,
  AgentNameEnum.PRODUCT_INTELLIGENCE_MANAGER,
]);

const SourceTypeSchema = z.enum([
  SourceTypeEnum.PDF,
  SourceTypeEnum.DOCX,
  SourceTypeEnum.TXT,
  SourceTypeEnum.CSV,
  SourceTypeEnum.MARKDOWN,
  SourceTypeEnum.GOOGLE_DOCS,
  SourceTypeEnum.NOTION,
  SourceTypeEnum.SLACK,
  SourceTypeEnum.JIRA,
  SourceTypeEnum.GITHUB_ISSUES,
  SourceTypeEnum.ZENDESK,
  SourceTypeEnum.INTERCOM,
  SourceTypeEnum.OTHER,
]);

const ProcessingStatusSchema = z.enum([
  ProcessingStatusEnum.QUEUED,
  ProcessingStatusEnum.IN_PROGRESS,
  ProcessingStatusEnum.COMPLETED,
  ProcessingStatusEnum.FAILED,
  ProcessingStatusEnum.PARTIAL,
]);

const LanguageSchema = z.enum([
  LanguageEnum.ENGLISH,
  LanguageEnum.SPANISH,
  LanguageEnum.FRENCH,
  LanguageEnum.GERMAN,
  LanguageEnum.ITALIAN,
  LanguageEnum.PORTUGUESE,
  LanguageEnum.DUTCH,
  LanguageEnum.RUSSIAN,
  LanguageEnum.CHINESE_SIMPLIFIED,
  LanguageEnum.CHINESE_TRADITIONAL,
  LanguageEnum.JAPANESE,
  LanguageEnum.KOREAN,
]);

// Metadata schemas
const MetadataSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]));

const ChunkMetadataSchema = z.object({
  chunkIndex: z.number().nonnegative(),
  sourceDocumentId: UUIDSchema,
  startCharacterIndex: z.number().nonnegative(),
  endCharacterIndex: z.number().nonnegative(),
  chunkHash: z.string(),
}).and(MetadataSchema);

const EmbeddingReferenceSchema = z.object({
  embeddingId: UUIDSchema,
  model: z.string(),
  dimension: z.number().positive(),
  createdAt: TimestampSchema,
});

const AnalysisSummarySchema = z.object({
  totalTokensProcessed: z.number().nonnegative(),
  processingDurationMs: z.number().nonnegative(),
  modelsUsed: z.array(z.string()),
  confidenceScore: ConfidenceScoreSchema,
  quality: z.enum(["low", "medium", "high"]),
});

const RelationshipContextSchema = z.object({
  reason: z.string(),
  evidence: z.array(z.string()),
  score: ConfidenceScoreSchema,
});

const RelationshipSchema = z.object({
  id: UUIDSchema,
  sourceId: UUIDSchema,
  targetId: UUIDSchema,
  targetEntity: z.unknown().optional(),
  type: z.string(),
  strength: ConfidenceScoreSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Core domain schemas
export const DocumentSchema = z.object({
  id: UUIDSchema,
  workspaceId: UUIDSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1),
  sourceType: SourceTypeSchema,
  originalFileName: z.string().optional(),
  language: LanguageSchema,
  status: DocumentStatusSchema,
  processingStatus: ProcessingStatusSchema,
  fileHash: z.string(),
  fileSizeBytes: z.number().positive(),
  chunkCount: z.number().nonnegative(),
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  processedAt: TimestampSchema.optional(),
  archivedAt: TimestampSchema.optional(),
});

export const EvidenceSchema = z.object({
  id: UUIDSchema,
  documentId: UUIDSchema,
  type: EvidenceTypeSchema,
  excerpt: z.string().min(1),
  fullText: z.string().min(1),
  startCharIndex: z.number().nonnegative(),
  endCharIndex: z.number().nonnegative(),
  confidenceScore: ConfidenceScoreSchema,
  agentId: AgentNameSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const InsightSchema = z.object({
  id: UUIDSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  evidenceIds: z.array(UUIDSchema).min(MIN_EVIDENCE_FOR_INSIGHT),
  confidenceScore: ConfidenceScoreSchema,
  agentId: AgentNameSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ThemeSchema = z.object({
  id: UUIDSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  insightIds: z.array(UUIDSchema).min(MIN_INSIGHTS_FOR_THEME),
  confidenceScore: ConfidenceScoreSchema,
  agentId: AgentNameSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const OpportunitySchema = z.object({
  id: UUIDSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  themeIds: z.array(UUIDSchema).max(MAX_THEMES_PER_OPPORTUNITY),
  priority: OpportunityPrioritySchema,
  estimatedImpact: ConfidenceScoreSchema,
  estimatedEffort: ConfidenceScoreSchema,
  confidenceScore: ConfidenceScoreSchema,
  agentId: AgentNameSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ReportSchema = z.object({
  id: UUIDSchema,
  workspaceId: UUIDSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  opportunityIds: z.array(UUIDSchema).max(MAX_OPPORTUNITIES_PER_REPORT),
  summary: z.string(),
  agentId: AgentNameSchema,
  metadata: MetadataSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Export types derived from schemas
export type Document = z.infer<typeof DocumentSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Report = z.infer<typeof ReportSchema>;

export type UUID = z.infer<typeof UUIDSchema>;
export type ISODate = z.infer<typeof ISODateSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type URL = z.infer<typeof URLSchema>;
export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>;

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type OpportunityPriority = z.infer<typeof OpportunityPrioritySchema>;
export type AgentName = z.infer<typeof AgentNameSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;
export type Language = z.infer<typeof LanguageSchema>;

export type Metadata = z.infer<typeof MetadataSchema>;
export type ChunkMetadata = z.infer<typeof ChunkMetadataSchema>;
export type EmbeddingReference = z.infer<typeof EmbeddingReferenceSchema>;
export type AnalysisSummary = z.infer<typeof AnalysisSummarySchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type RelationshipContext = z.infer<typeof RelationshipContextSchema>;
