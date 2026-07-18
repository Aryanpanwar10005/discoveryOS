/**
 * @fileoverview Platform constants for DiscoveryOS.
 * Defines all configuration constants used throughout the application.
 */

import { AgentNameEnum, LanguageEnum, SourceTypeEnum } from "../types/enums.js";

/**
 * Supported file extensions for document ingestion
 */
export const SUPPORTED_FILE_TYPES = [
  ".pdf",
  ".docx",
  ".txt",
  ".csv",
  ".md",
  ".markdown",
] as const;

/**
 * MIME types associated with supported file types
 */
export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
] as const;

/**
 * Maximum single file upload size in megabytes
 */
export const MAX_UPLOAD_SIZE_MB = 100;

/**
 * Maximum single file upload size in bytes
 */
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/**
 * Default chunk size for document splitting (characters)
 */
export const DEFAULT_CHUNK_SIZE = 1000;

/**
 * Default overlap between chunks (characters) to maintain context
 */
export const DEFAULT_CHUNK_OVERLAP = 100;

/**
 * All supported language codes
 */
export const SUPPORTED_LANGUAGES = Object.values(LanguageEnum) as readonly string[];

/**
 * Confidence score thresholds for evidence classification
 */
export const CONFIDENCE_THRESHOLDS = {
  MINIMUM: 0.0,
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
  MAXIMUM: 1.0,
} as const;

/**
 * Default confidence score assigned to evidence when not specified
 */
export const DEFAULT_CONFIDENCE_SCORE = 0.5;

/**
 * Execution order of agents in the discovery pipeline
 */
export const AGENT_EXECUTION_ORDER = [
  AgentNameEnum.RESEARCH_ANALYST,
  AgentNameEnum.INSIGHT_SYNTHESIZER,
  AgentNameEnum.THEME_GROUPER,
  AgentNameEnum.OPPORTUNITY_STRATEGIST,
  AgentNameEnum.PRODUCT_INTELLIGENCE_MANAGER,
] as const;

/**
 * Current schema version for data serialization/versioning
 */
export const SCHEMA_VERSION = "1.0.0";

/**
 * Current application version
 */
export const APP_VERSION = "0.1.0";

/**
 * Maximum number of retries for failed processing tasks
 */
export const MAX_PROCESSING_RETRIES = 3;

/**
 * Default timeout for agent execution in milliseconds
 */
export const DEFAULT_AGENT_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Minimum number of evidence items required to create an insight
 */
export const MIN_EVIDENCE_FOR_INSIGHT = 2;

/**
 * Minimum number of insights required to create a theme
 */
export const MIN_INSIGHTS_FOR_THEME = 2;

/**
 * Maximum number of themes that can be grouped into one opportunity
 */
export const MAX_THEMES_PER_OPPORTUNITY = 5;

/**
 * Maximum number of opportunities per generated report
 */
export const MAX_OPPORTUNITIES_PER_REPORT = 20;
