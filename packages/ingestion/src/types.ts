/**
 * @fileoverview Ingestion layer types and interfaces
 * Defines input contracts and output shapes for document ingestion
 */

import type {
  UUID,
  Timestamp,
  SourceType,
  Document,
} from "@discoveryos/core";

/**
 * Input contract for document ingestion
 * Parser returns {success, text} only — everything else is caller responsibility
 */
export interface IngestionInput {
  /** Raw extracted text from document (from Python parser) */
  rawText: string;

  /** File source type (PDF, DOCX, TXT, CSV, etc.) */
  sourceType: SourceType;

  /** Original filename (optional, from upload) */
  originalFileName?: string;

  /** File size in bytes — REQUIRED, not derivable */
  fileSizeBytes: number;

  /** Additional metadata to attach to document */
  extraMetadata?: Record<string, unknown>;
}

/**
 * Intermediate representation during ingestion processing
 */
export interface ProcessedDocument {
  /** Assembled Document object ready for persistence */
  document: Document;

  /** Text chunks created from document */
  chunks: string[];

  /** Metadata about processing */
  processingInfo: {
    languageDetected: string;
    chunkCount: number;
    processingTimeMs: number;
  };
}

/**
 * Document storage interface — allows multiple implementations
 * (JSON file, Supabase, PostgreSQL, etc.)
 */
export interface DocumentStore {
  /** Save a document and return persisted version with server timestamps */
  save(document: Document): Promise<Document>;

  /** Retrieve document by ID */
  getById(id: UUID): Promise<Document | null>;

  /** List all documents in workspace */
  listByWorkspace(workspaceId: UUID): Promise<Document[]>;
}

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  /** Detected language code (ISO 639-1) */
  languageCode: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** List of possible languages and scores */
  alternatives: Array<{ code: string; confidence: number }>;
}
