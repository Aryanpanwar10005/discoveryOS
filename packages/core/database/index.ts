/**
 * @fileoverview Database entity interfaces for DiscoveryOS.
 * Defines persistence layer entity types for database mapping.
 */

import type {
  UUID,
  Timestamp,
  ConfidenceScore,
} from "../types/index.js";
import type {
  DocumentStatus,
  EvidenceType,
  OpportunityPriority,
  AgentName,
  SourceType,
  ProcessingStatus,
  Language,
} from "../types/enums.js";
import type { Metadata } from "../types/index.js";

/**
 * Document entity for database persistence
 * Maps to documents table
 */
export interface DocumentEntity {
  id: UUID;
  workspaceId: UUID;
  title: string;
  description?: string;
  content: string;
  sourceType: SourceType;
  originalFileName?: string;
  language: Language;
  status: DocumentStatus;
  processingStatus: ProcessingStatus;
  fileHash: string;
  fileSizeBytes: number;
  chunkCount: number;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
  archivedAt?: Timestamp;
}

/**
 * Evidence entity for database persistence
 * Maps to evidence table
 */
export interface EvidenceEntity {
  id: UUID;
  documentId: UUID;
  type: EvidenceType;
  excerpt: string;
  fullText: string;
  startCharIndex: number;
  endCharIndex: number;
  confidenceScore: ConfidenceScore;
  agentId: AgentName;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Insight entity for database persistence
 * Maps to insights table
 */
export interface InsightEntity {
  id: UUID;
  title: string;
  description: string;
  evidenceIds: UUID[];
  confidenceScore: ConfidenceScore;
  agentId: AgentName;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Theme entity for database persistence
 * Maps to themes table
 */
export interface ThemeEntity {
  id: UUID;
  title: string;
  description: string;
  insightIds: UUID[];
  confidenceScore: ConfidenceScore;
  agentId: AgentName;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Opportunity entity for database persistence
 * Maps to opportunities table
 */
export interface OpportunityEntity {
  id: UUID;
  title: string;
  description: string;
  themeIds: UUID[];
  priority: OpportunityPriority;
  estimatedImpact: ConfidenceScore;
  estimatedEffort: ConfidenceScore;
  confidenceScore: ConfidenceScore;
  agentId: AgentName;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Report entity for database persistence
 * Maps to reports table
 */
export interface ReportEntity {
  id: UUID;
  workspaceId: UUID;
  title: string;
  description?: string;
  opportunityIds: UUID[];
  summary: string;
  agentId: AgentName;
  metadata: Metadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
