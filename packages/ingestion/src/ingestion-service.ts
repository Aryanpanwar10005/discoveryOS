/**
 * @fileoverview Main ingestion service
 * Orchestrates document ingestion: chunking, language detection, Document assembly, validation
 */

import {
  DocumentStatusEnum,
  ProcessingStatusEnum,
  DocumentSchema,
  generateUUID,
  getCurrentTimestamp,
  asUUID,
} from "@discoveryos/core";
import type {
  Document,
  SourceType,
  UUID,
  Timestamp,
  Language,
  ProcessingStatus,
} from "@discoveryos/core";
import { chunkText, calculateChunkCount } from "./chunker.js";
import { detectLanguage } from "./language-detector.js";
import { computeFileHash } from "./file-hash.js";
import type { IngestionInput, ProcessedDocument, DocumentStore } from "./types.js";

/**
 * Main ingestion service
 * Processes raw parser output into validated Document objects
 */
export class IngestionService {
  /** Workspace ID placeholder — TODO: retrieve from auth in Task 9 */
  private readonly defaultWorkspaceId: UUID =
    asUUID("00000000-0000-0000-0000-000000000001");

  constructor(private documentStore: DocumentStore) {}

  /**
   * Ingest a document from raw text
   * @param input - Ingestion input with parser output
   * @returns Processed document ready for persistence
   * @throws ValidationError if input is invalid or Document fails schema validation
   */
  async ingest(input: IngestionInput): Promise<ProcessedDocument> {
    // Validate input
    this.validateInput(input);

    // Detect language
    const languageResult = await detectLanguage(input.rawText);

    // Chunk text
    const chunks = chunkText(input.rawText);
    const chunkCount = chunks.length;

    // Compute file hash
    const fileHash = computeFileHash(input.rawText);

    // Generate timestamps
    const now = getCurrentTimestamp();

    // Derive document title from filename or fallback
    const title = this.deriveTitle(input.originalFileName);

    // Assemble Document object (type: any to allow schema validation to be source of truth)
    const document = {
      id: generateUUID(),
      workspaceId: this.defaultWorkspaceId,
      title,
      description: `Ingested from ${input.sourceType.toUpperCase()}`,
      content: input.rawText,
      sourceType: input.sourceType,
      originalFileName: input.originalFileName,
      language: languageResult.languageCode,
      status: DocumentStatusEnum.PENDING,
      processingStatus: ProcessingStatusEnum.QUEUED,
      fileHash,
      fileSizeBytes: input.fileSizeBytes,
      chunkCount,
      metadata: {
        ...input.extraMetadata,
        languageDetectionConfidence: languageResult.confidence,
        ingestedAt: new Date(now).toISOString(),
      },
      createdAt: now,
      updatedAt: now,
    };


    // Validate against Core schema
    const validationResult = DocumentSchema.safeParse(document);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new Error(`Document validation failed: ${errors}`);
    }

    // Record processing duration
    const processingTimeMs = Date.now() - now;

    return {
      document: validationResult.data,
      chunks,
      processingInfo: {
        languageDetected: languageResult.languageCode,
        chunkCount,
        processingTimeMs,
      },
    };
  }

  /**
   * Persist processed document to store
   * @param processed - Processed document from ingest()
   * @returns Persisted document (may have server-generated timestamps)
   */
  async persist(processed: ProcessedDocument): Promise<Document> {
    return this.documentStore.save(processed.document);
  }

  /**
   * Validate ingestion input
   * @throws Error if input is invalid
   */
  private validateInput(input: IngestionInput): void {
    if (!input.rawText || input.rawText.trim().length === 0) {
      throw new Error("rawText is required and cannot be empty");
    }

    if (!input.sourceType) {
      throw new Error("sourceType is required");
    }

    if (input.fileSizeBytes === undefined || input.fileSizeBytes === null) {
      throw new Error("fileSizeBytes is REQUIRED and cannot be undefined");
    }

    if (typeof input.fileSizeBytes !== "number") {
      throw new Error("fileSizeBytes must be a number");
    }

    if (input.fileSizeBytes <= 0) {
      throw new Error("fileSizeBytes must be greater than 0");
    }

    if (
      input.originalFileName &&
      typeof input.originalFileName !== "string"
    ) {
      throw new Error("originalFileName must be a string if provided");
    }
  }

  /**
   * Derive document title from filename or use fallback
   * @param filename - Optional original filename
   * @returns Document title
   */
  private deriveTitle(filename?: string): string {
    if (!filename) {
      return `Document_${generateUUID().substring(0, 8)}`;
    }

    // Remove extension
    const withoutExt = filename.replace(/\.[^/.]+$/, "");

    // Replace underscores and hyphens with spaces
    const withSpaces = withoutExt.replace(/[_-]/g, " ");

    // Capitalize
    return withSpaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

/**
 * Factory function to create an ingestion service with a given store
 * @param documentStore - Document storage implementation
 * @returns Configured IngestionService instance
 */
export function createIngestionService(
  documentStore: DocumentStore
): IngestionService {
  return new IngestionService(documentStore);
}
