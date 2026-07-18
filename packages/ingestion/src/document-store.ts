/**
 * @fileoverview Local JSON file document store (temporary implementation)
 * For development/testing only — will be replaced with SupabaseDocumentStore in production
 * Gitignored: output directory not committed
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { Document, UUID } from "@discoveryos/core";
import type { DocumentStore } from "./types.js";

/**
 * Local file-based document store using JSON files
 * Implements DocumentStore interface for easy swapping with Supabase/DB implementations
 */
export class LocalJsonDocumentStore implements DocumentStore {
  private storagePath: string;

  constructor(storagePath: string = ".documents") {
    this.storagePath = storagePath;
  }

  /**
   * Initialize storage directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (e) {
      if (
        e instanceof Error &&
        !e.message.includes("EEXIST")
      ) {
        throw e;
      }
    }
  }

  /**
   * Save a document to JSON file
   * Filename: <id>.json
   */
  async save(document: Document): Promise<Document> {
    await this.initialize();
    const filePath = join(this.storagePath, `${document.id}.json`);

    try {
      await fs.writeFile(filePath, JSON.stringify(document, null, 2), "utf-8");
      return document;
    } catch (e) {
      throw new Error(
        `Failed to save document ${document.id}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  /**
   * Retrieve document by ID from JSON file
   */
  async getById(id: UUID): Promise<Document | null> {
    const filePath = join(this.storagePath, `${id}.json`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content) as Document;
    } catch (e) {
      if (
        e instanceof Error &&
        "code" in e &&
        e.code === "ENOENT"
      ) {
        return null;
      }
      throw new Error(
        `Failed to read document ${id}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  /**
   * List all documents in a workspace
   * (Scans all files and filters by workspaceId)
   */
  async listByWorkspace(workspaceId: UUID): Promise<Document[]> {
    await this.initialize();

    try {
      const files = await fs.readdir(this.storagePath);
      const documents: Document[] = [];

      for (const file of files) {
        if (!file.endsWith(".json")) {
          continue;
        }

        try {
          const filePath = join(this.storagePath, file);
          const content = await fs.readFile(filePath, "utf-8");
          const doc = JSON.parse(content) as Document;

          if ((doc.workspaceId as string) === (workspaceId as string)) {
            documents.push(doc);
          }
        } catch {
          // Skip malformed files
          continue;
        }
      }

      return documents;
    } catch (e) {
      throw new Error(
        `Failed to list documents: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }
}
