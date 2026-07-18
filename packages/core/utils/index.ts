/**
 * @fileoverview Utility functions export index for DiscoveryOS.
 * Re-exports all utility modules for convenient importing.
 */

export { generateUUID, generateUUIDv5, isValidUUID, asUUID, createDeterministicUUID, generateUUIDs } from "./uuid.js";

export {
  getCurrentISODate,
  getCurrentTimestamp,
  formatISODate,
  parseISODate,
  timestampToISODate,
  isoDateToTimestamp,
  isPastDate,
  isFutureDate,
  getDateDifference,
  isSameDay,
  addDays,
  addHours,
  getStartOfDay,
  getEndOfDay,
} from "./dates.js";

export {
  createConfidenceScore,
  isValidConfidenceScore,
  getConfidenceLevel,
  meetsThreshold,
  averageConfidenceScores,
  weightedConfidenceAverage,
  combineConfidenceScores,
  isHighConfidence,
  isBelowThreshold,
} from "./confidence.js";

export {
  validateEmail,
  validateURL,
  isNonEmptyString,
  isValidJSON,
  isNonEmptyArray,
  isArraySizeValid,
  isNumberInRange,
  matchesPattern,
  hasRequiredKeys,
  isValidUUIDFormat,
  isPositiveInteger,
  isNonNegativeInteger,
  hasKey,
} from "./validation.js";

export {
  buildRelationship,
  linkToDocument,
  linkToEvidence,
  linkToInsight,
  linkToTheme,
  linkToOpportunity,
  isValidRelationship,
  getRelationshipsByType,
  collectTargetIds,
  sortByStrength,
  filterByStrength,
  getStrongestRelationship,
  buildRelationshipGraph,
} from "./relationships.js";
