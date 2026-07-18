/**
 * @fileoverview Ingestion package exports
 */

export { IngestionService, createIngestionService } from "./ingestion-service.js";
export { LocalJsonDocumentStore } from "./document-store.js";
export { chunkText, calculateChunkCount } from "./chunker.js";
export { detectLanguage } from "./language-detector.js";
export { computeFileHash, verifyFileHash } from "./file-hash.js";

export type {
  IngestionInput,
  ProcessedDocument,
  DocumentStore,
  LanguageDetectionResult,
} from "./types.js";
