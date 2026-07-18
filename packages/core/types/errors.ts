/**
 * @fileoverview Error type definitions for DiscoveryOS.
 * Defines structured error interfaces for different failure scenarios.
 */

import type { UUID } from "./primitives.js";

/**
 * Validation error when input data does not meet requirements
 * Used for schema validation, format validation, etc.
 */
export interface ValidationError {
  readonly type: "VALIDATION_ERROR";
  readonly message: string;
  readonly field?: string;
  readonly value?: unknown;
  readonly constraint?: string;
}

/**
 * Processing error when document/data processing fails
 * Represents errors in ingestion, parsing, chunking, etc.
 */
export interface ProcessingError {
  readonly type: "PROCESSING_ERROR";
  readonly message: string;
  readonly documentId?: UUID;
  readonly stage?: string;
  readonly retryable: boolean;
}

/**
 * Analysis error when AI analysis or synthesis fails
 * Represents errors from LLM calls, analysis failures, etc.
 */
export interface AnalysisError {
  readonly type: "ANALYSIS_ERROR";
  readonly message: string;
  readonly agentId?: string;
  readonly step?: string;
  readonly originalError?: string;
}

/**
 * Agent execution error when an agent in the pipeline fails
 * Captures errors specific to agent processing
 */
export interface AgentError {
  readonly type: "AGENT_ERROR";
  readonly message: string;
  readonly agentName: string;
  readonly inputId?: UUID;
  readonly statusCode?: number;
  readonly retryCount?: number;
}
