/**
 * @fileoverview Relationship utilities for DiscoveryOS.
 * Provides functions for building and managing relationships between entities.
 */

import type { UUID, ConfidenceScore, Timestamp } from "../types/primitives.js";
import type { Relationship, RelationshipContext, Metadata } from "../types/metadata.js";
import { generateUUID, asUUID } from "./uuid.js";
import { getCurrentTimestamp } from "./dates.js";
import { createConfidenceScore } from "./confidence.js";

/**
 * Builds a relationship between two entities
 * @param sourceId - ID of source entity
 * @param targetId - ID of target entity
 * @param type - Relationship type (e.g., "references", "derives_from")
 * @param strength - Confidence score for relationship
 * @param metadata - Optional additional metadata
 * @returns Created relationship object
 */
export function buildRelationship<T = unknown>(
  sourceId: UUID,
  targetId: UUID,
  type: string,
  strength: ConfidenceScore,
  metadata: Metadata = {}
): Relationship<T> {
  const now = getCurrentTimestamp();
  return {
    id: generateUUID(),
    sourceId,
    targetId,
    type,
    strength,
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a relationship linking to a document
 * @param sourceId - ID of linking entity
 * @param documentId - ID of document being linked to
 * @param strength - Confidence of linkage
 * @param context - Optional relationship context
 * @returns Created document link relationship
 */
export function linkToDocument(
  sourceId: UUID,
  documentId: UUID,
  strength: ConfidenceScore,
  context?: RelationshipContext
): Relationship<unknown> {
  return buildRelationship(
    sourceId,
    documentId,
    "references_document",
    strength,
    context ? { reason: context.reason, confidence: context.score } : {}
  );
}

/**
 * Creates a relationship linking to evidence
 * @param sourceId - ID of linking entity
 * @param evidenceId - ID of evidence being linked to
 * @param strength - Confidence of linkage
 * @param context - Optional relationship context
 * @returns Created evidence link relationship
 */
export function linkToEvidence(
  sourceId: UUID,
  evidenceId: UUID,
  strength: ConfidenceScore,
  context?: RelationshipContext
): Relationship<unknown> {
  return buildRelationship(
    sourceId,
    evidenceId,
    "references_evidence",
    strength,
    context ? { reason: context.reason, confidence: context.score } : {}
  );
}

/**
 * Creates a relationship linking to an insight
 * @param sourceId - ID of linking entity
 * @param insightId - ID of insight being linked to
 * @param strength - Confidence of linkage
 * @param context - Optional relationship context
 * @returns Created insight link relationship
 */
export function linkToInsight(
  sourceId: UUID,
  insightId: UUID,
  strength: ConfidenceScore,
  context?: RelationshipContext
): Relationship<unknown> {
  return buildRelationship(
    sourceId,
    insightId,
    "references_insight",
    strength,
    context ? { reason: context.reason, confidence: context.score } : {}
  );
}

/**
 * Creates a relationship linking to a theme
 * @param sourceId - ID of linking entity
 * @param themeId - ID of theme being linked to
 * @param strength - Confidence of linkage
 * @param context - Optional relationship context
 * @returns Created theme link relationship
 */
export function linkToTheme(
  sourceId: UUID,
  themeId: UUID,
  strength: ConfidenceScore,
  context?: RelationshipContext
): Relationship<unknown> {
  return buildRelationship(
    sourceId,
    themeId,
    "references_theme",
    strength,
    context ? { reason: context.reason, confidence: context.score } : {}
  );
}

/**
 * Creates a relationship linking to an opportunity
 * @param sourceId - ID of linking entity
 * @param opportunityId - ID of opportunity being linked to
 * @param strength - Confidence of linkage
 * @param context - Optional relationship context
 * @returns Created opportunity link relationship
 */
export function linkToOpportunity(
  sourceId: UUID,
  opportunityId: UUID,
  strength: ConfidenceScore,
  context?: RelationshipContext
): Relationship<unknown> {
  return buildRelationship(
    sourceId,
    opportunityId,
    "references_opportunity",
    strength,
    context ? { reason: context.reason, confidence: context.score } : {}
  );
}

/**
 * Validates if a relationship object is well-formed
 * Checks required fields and type constraints
 * @param relationship - Relationship to validate
 * @returns True if relationship is valid
 */
export function isValidRelationship(relationship: unknown): relationship is Relationship<unknown> {
  if (typeof relationship !== "object" || relationship === null) return false;
  const rel = relationship as Record<string, unknown>;
  return (
    typeof rel.id === "string" &&
    typeof rel.sourceId === "string" &&
    typeof rel.targetId === "string" &&
    typeof rel.type === "string" &&
    typeof rel.strength === "number" &&
    rel.strength >= 0 &&
    rel.strength <= 1 &&
    typeof rel.createdAt === "number" &&
    typeof rel.updatedAt === "number" &&
    typeof rel.metadata === "object"
  );
}

/**
 * Filters relationships by type
 * @param relationships - Array of relationships to filter
 * @param type - Relationship type to filter by
 * @returns Array of relationships matching the type
 */
export function getRelationshipsByType(
  relationships: readonly Relationship<unknown>[],
  type: string
): Relationship<unknown>[] {
  return relationships.filter((rel) => rel.type === type);
}

/**
 * Collects all target IDs from a set of relationships
 * @param relationships - Relationships to extract targets from
 * @returns Array of unique target IDs
 */
export function collectTargetIds(relationships: readonly Relationship<unknown>[]): UUID[] {
  return Array.from(new Set(relationships.map((rel) => rel.targetId))) as UUID[];
}

/**
 * Sorts relationships by strength (confidence) in descending order
 * Strongest relationships first
 * @param relationships - Relationships to sort
 * @returns Sorted array of relationships
 */
export function sortByStrength(relationships: readonly Relationship<unknown>[]): Relationship<unknown>[] {
  return [...relationships].sort((a, b) => b.strength - a.strength);
}

/**
 * Filters relationships by minimum strength threshold
 * @param relationships - Relationships to filter
 * @param minStrength - Minimum confidence score required
 * @returns Array of relationships meeting threshold
 */
export function filterByStrength(
  relationships: readonly Relationship<unknown>[],
  minStrength: ConfidenceScore
): Relationship<unknown>[] {
  return relationships.filter((rel) => rel.strength >= minStrength);
}

/**
 * Gets the strongest relationship from a collection
 * @param relationships - Relationships to search
 * @returns Strongest relationship or undefined
 */
export function getStrongestRelationship(relationships: readonly Relationship<unknown>[]): Relationship<unknown> | undefined {
  if (relationships.length === 0) return undefined;
  return sortByStrength(relationships)[0];
}

/**
 * Creates a relationship graph context from related relationships
 * Useful for displaying relationship chains
 * @param relationships - All relationships
 * @param sourceId - Source entity ID
 * @param maxDepth - Maximum relationship depth to traverse
 * @returns Map of related IDs by depth
 */
export function buildRelationshipGraph(
  relationships: readonly Relationship<unknown>[],
  sourceId: UUID,
  maxDepth: number = 3
): Map<number, UUID[]> {
  const graph = new Map<number, UUID[]>();
  const visited = new Set<UUID>();
  let currentLevel = [sourceId];
  let depth = 0;

  const depthCheck = (d: number, max: number): boolean => {
    return d >= max;
  };

  while (currentLevel.length > 0 && !depthCheck(depth, maxDepth)) {
    const nextLevel: UUID[] = [];
    const levelIds: UUID[] = [];

    for (const id of currentLevel) {
      if (visited.has(id)) continue;
      visited.add(id);

      const related = relationships.filter((rel) => rel.sourceId === id);
      for (const rel of related) {
        if (!visited.has(rel.targetId)) {
          nextLevel.push(rel.targetId);
          levelIds.push(rel.targetId);
        }
      }
    }

    if (levelIds.length > 0) {
      graph.set(depth, levelIds);
    }

    currentLevel = nextLevel;
    depth += 1;
  }

  return graph;
}
