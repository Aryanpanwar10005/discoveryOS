/**
 * @fileoverview Result type definitions for DiscoveryOS.
 * Implements discriminated union Result type for functional error handling.
 */

import type { ValidationError, ProcessingError, AnalysisError, AgentError } from "./errors.js";

/**
 * Union type for any domain error
 */
export type DomainError = ValidationError | ProcessingError | AnalysisError | AgentError;

/**
 * Success result containing data of type T
 */
export interface SuccessResult<T> {
  readonly type: "success";
  readonly data: T;
}

/**
 * Failure result containing error information
 */
export interface FailureResult {
  readonly type: "failure";
  readonly error: DomainError;
}

/**
 * Discriminated union type for functional result handling
 * Returns either success data or failure error, never throws
 */
export type Result<T> = SuccessResult<T> | FailureResult;

/**
 * Creates a success result
 * @param data - The successful result data
 * @returns Success result with provided data
 */
export function Ok<T>(data: T): SuccessResult<T> {
  return { type: "success", data };
}

/**
 * Creates a failure result
 * @param error - The error that occurred
 * @returns Failure result with provided error
 */
export function Err(error: DomainError): FailureResult {
  return { type: "failure", error };
}

/**
 * Type guard to check if result is successful
 * @param result - Result to check
 * @returns True if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is SuccessResult<T> {
  return result.type === "success";
}

/**
 * Type guard to check if result is a failure
 * @param result - Result to check
 * @returns True if result is a failure
 */
export function isFailure<T>(result: Result<T>): result is FailureResult {
  return result.type === "failure";
}

/**
 * Extracts data from successful result or throws error
 * Unsafe - only use when you want exception behavior
 * @param result - Result to unwrap
 * @returns Data if successful
 * @throws Error if result is failure
 */
export function unwrap<T>(result: Result<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new Error(`Failed to unwrap result: ${result.error.message}`);
}

/**
 * Extracts error from failure result or returns default
 * @param result - Result to extract error from
 * @param defaultError - Default error if result is successful
 * @returns Error if failure, otherwise default error
 */
export function getError<T>(result: Result<T>, defaultError?: DomainError): DomainError | undefined {
  return isFailure(result) ? result.error : defaultError;
}

/**
 * Maps a successful result to a new value, passing through failures
 * @param result - Result to map
 * @param fn - Mapping function for success case
 * @returns Mapped result or original failure
 */
export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  return isSuccess(result) ? Ok(fn(result.data)) : result;
}

/**
 * Chains results, allowing dependent computations
 * @param result - Result to chain
 * @param fn - Function that returns a new Result
 * @returns Result from fn if successful, original failure otherwise
 */
export function flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
  return isSuccess(result) ? fn(result.data) : result;
}
