/**
 * @fileoverview Demo script for ingestion service
 * Shows end-to-end flow: raw text → Document → validation
 */

import {
  SourceTypeEnum,
  DocumentSchema,
} from "@discoveryos/core";
import {
  IngestionService,
  LocalJsonDocumentStore,
} from "./index.js";
import type { IngestionInput } from "./index.js";

async function main() {
  console.log("=== Task 5 Ingestion Service Demo ===\n");

  const store = new LocalJsonDocumentStore(".documents");
  const service = new IngestionService(store);

  // ==========================================================================
  // DEMO 1: Valid ingestion with all required fields
  // ==========================================================================
  console.log("DEMO 1: Valid ingestion with required fields");
  console.log("-------------------------------------------\n");

  const validInput: IngestionInput = {
    rawText: `
      Customer Feedback Summary
      
      Users consistently report challenges with the onboarding flow. The main pain point
      identified is the complexity of the initial setup process, which takes an average
      of 45 minutes to complete. Many users abandon the process before finishing.
      
      Key feedback points:
      - The multi-step form is confusing and lacks clear progress indication
      - Navigation between steps is not intuitive
      - Error messages are too technical for non-technical users
      - The final confirmation step is redundant
      
      Recommendation: Simplify the onboarding to 3 essential steps, add progress bar,
      and provide user-friendly error messages.
    `,
    sourceType: SourceTypeEnum.TXT,
    originalFileName: "customer_feedback_2025-01-18.txt",
    fileSizeBytes: 612,
  };

  try {
    const processed = await service.ingest(validInput);

    console.log("✅ Ingestion succeeded\n");
    console.log("Document ID:", processed.document.id);
    console.log("Title:", processed.document.title);
    console.log("Language:", processed.document.language);
    console.log("File Size:", processed.document.fileSizeBytes, "bytes");
    console.log("Chunk Count:", processed.document.chunkCount);
    console.log("Status:", processed.document.status);
    console.log("Processing Status:", processed.document.processingStatus);
    console.log("File Hash:", processed.document.fileHash.substring(0, 16) + "...");
    console.log("\nProcessing Info:");
    console.log("  Language Detected:", processed.processingInfo.languageDetected);
    console.log("  Chunk Count:", processed.processingInfo.chunkCount);
    console.log("  Processing Time:", processed.processingInfo.processingTimeMs, "ms");

    // Validate against schema
    const validation = DocumentSchema.safeParse(processed.document);
    if (validation.success) {
      console.log("\n✅ Document passes DocumentSchema validation\n");
    } else {
      console.log(
        "\n❌ Document failed validation:",
        validation.error.errors
      );
    }

    // Save to store
    const saved = await service.persist(processed);
    console.log("✅ Document persisted to store");
    console.log("Saved at:", new Date(saved.createdAt).toISOString());
  } catch (e) {
    console.error(
      "❌ Error:",
      e instanceof Error ? e.message : String(e)
    );
  }

  // ==========================================================================
  // DEMO 2: Missing fileSizeBytes — should fail validation
  // ==========================================================================
  console.log("\n\nDEMO 2: Missing fileSizeBytes (should fail loudly)");
  console.log("--------------------------------------------------\n");

  const missingFileSizeInput = {
    rawText: "Some document content here",
    sourceType: SourceTypeEnum.TXT,
    originalFileName: "test.txt",
    // fileSizeBytes intentionally omitted
  } as unknown as IngestionInput;

  try {
    await service.ingest(missingFileSizeInput);
    console.log("❌ ERROR: Should have failed but did not!");
  } catch (e) {
    console.log(
      "✅ Validation failed as expected:",
      e instanceof Error ? e.message : String(e)
    );
  }

  // ==========================================================================
  // DEMO 3: Empty raw text — should fail validation
  // ==========================================================================
  console.log("\n\nDEMO 3: Empty raw text (should fail)");
  console.log("------------------------------------\n");

  const emptyTextInput: IngestionInput = {
    rawText: "",
    sourceType: SourceTypeEnum.TXT,
    fileSizeBytes: 0,
  };

  try {
    await service.ingest(emptyTextInput);
    console.log("❌ ERROR: Should have failed but did not!");
  } catch (e) {
    console.log(
      "✅ Validation failed as expected:",
      e instanceof Error ? e.message : String(e)
    );
  }

  // ==========================================================================
  // DEMO 4: Different source type with metadata
  // ==========================================================================
  console.log("\n\nDEMO 4: PDF input with extra metadata");
  console.log("-------------------------------------\n");

  const pdfInput: IngestionInput = {
    rawText: "This is extracted text from a PDF document about product requirements.",
    sourceType: SourceTypeEnum.PDF,
    originalFileName: "requirements_2025_Q1.pdf",
    fileSizeBytes: 245678,
    extraMetadata: {
      pageCount: 12,
      mimeType: "application/pdf",
      uploadedBy: "product-team",
    },
  };

  try {
    const processed = await service.ingest(pdfInput);
    console.log("✅ PDF ingestion succeeded\n");
    console.log("Title:", processed.document.title);
    console.log("Source Type:", processed.document.sourceType);
    console.log("File Size:", processed.document.fileSizeBytes, "bytes");
    console.log("Extra Metadata Keys:", Object.keys(processed.document.metadata));

    const validation = DocumentSchema.safeParse(processed.document);
    if (validation.success) {
      console.log("✅ PDF Document passes schema validation");
    }
  } catch (e) {
    console.error(
      "❌ Error:",
      e instanceof Error ? e.message : String(e)
    );
  }

  console.log("\n=== Demo Complete ===\n");
}

main().catch(console.error);
