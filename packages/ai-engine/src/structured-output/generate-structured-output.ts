import { ZodSchema, ZodError } from 'zod';
import { LLMClient, ModelType } from '../client/llm-client';
import type { AnalysisError } from '@discoveryos/core';

/**
 * Structured output generator with automatic retry and validation.
 *
 * Flow:
 * 1. Call LLMClient.complete() with the prompt + schema instructions
 * 2. Attempt to parse response via schema.safeParse()
 * 3. If parse fails, retry ONCE with the validation error appended to the prompt
 * 4. If parse still fails, throw a loud, typed error (never silently swallow validation failures)
 *
 * Callers do not retry — all retry logic is here, so agents don't duplicate it.
 */

export interface GenerateStructuredOutputParams<T> {
  schema: ZodSchema;
  systemPrompt?: string;
  userPrompt: string;
  model: ModelType;
  temperature?: number;
  llmClient: LLMClient;
}

/**
 * Custom error for structured output failures.
 * Wraps the underlying validation or parsing error with context.
 */
export class StructuredOutputError extends Error {
  constructor(
    message: string,
    public readonly analysisError: AnalysisError,
    public readonly attempt: number
  ) {
    super(message);
    this.name = 'StructuredOutputError';
  }
}

/**
 * Generate a structured output (typed, validated JSON) from an LLM.
 * Reuses schemas from @discoveryos/core; never redefines them.
 *
 * @throws StructuredOutputError if the model cannot produce valid JSON after 2 attempts
 */
export async function generateStructuredOutput<T>(
  params: GenerateStructuredOutputParams<T>
): Promise<T> {
  const {
    schema,
    systemPrompt,
    userPrompt,
    model,
    temperature,
    llmClient,
  } = params;

  // Instruction to prompt the model to return valid JSON
  const jsonInstruction =
    'Return ONLY valid JSON matching the requested schema. No markdown, no extra text. ' +
    'The response must be parseable by JSON.parse().';

  let attempt = 1;

  while (attempt <= 2) {
    try {
      // Call the LLM
      const response = await llmClient.complete({
        systemPrompt: systemPrompt
          ? `${systemPrompt}\n\n${jsonInstruction}`
          : jsonInstruction,
        userPrompt,
        model,
        temperature,
      });

      // Attempt to parse the response
      const parsed = schema.safeParse(JSON.parse(response.text));

      if (parsed.success) {
        return parsed.data as T;
      }

      // Parse failed — check if we should retry
      if (attempt === 1) {
        // First failure: retry with error context
        const errorMessage = formatZodError(parsed.error);
        console.warn(
          `Structured output validation failed (attempt 1/2). ` +
          `Error: ${errorMessage}. Retrying with error context...`
        );

        // Retry: append error to prompt so model knows what went wrong
        attempt++;

        const retryPrompt =
          userPrompt +
          '\n\n' +
          `Previous attempt failed validation with this error:\n${errorMessage}\n` +
          'Please ensure the output is valid JSON that matches the schema exactly.';

        const retryResponse = await llmClient.complete({
          systemPrompt: systemPrompt
            ? `${systemPrompt}\n\n${jsonInstruction}`
            : jsonInstruction,
          userPrompt: retryPrompt,
          model,
          temperature,
        });

        const retryParsed = schema.safeParse(JSON.parse(retryResponse.text));

        if (retryParsed.success) {
          console.info('Structured output valid after retry.');
          return retryParsed.data as T;
        }

        // Second attempt also failed
        const retryError = formatZodError(retryParsed.error);
        const analysisError: AnalysisError = {
          type: 'ANALYSIS_ERROR',
          message:
            `Structured output validation failed after 2 attempts. ` +
            `Final error: ${retryError}. ` +
            `Model response was not valid JSON or did not match schema.`,
          step: 'structured-output-generation',
          originalError: retryError,
        };
        throw new StructuredOutputError(analysisError.message, analysisError, 2);
      }
    } catch (error) {
      // JSON parse error or other exception
      if (error instanceof StructuredOutputError) {
        throw error; // Re-throw StructuredOutputError as-is
      }

      const errorMsg = error instanceof Error ? error.message : String(error);

      if (attempt === 1) {
        // First attempt: catch JSON parse error, retry
        console.warn(
          `JSON parsing failed (attempt 1/2): ${errorMsg}. Retrying...`
        );
        attempt++;

        const retryPrompt =
          userPrompt +
          '\n\n' +
          `Previous attempt did not return valid JSON. Error: ${errorMsg}\n` +
          'Please return ONLY valid JSON.';

        try {
          const retryResponse = await llmClient.complete({
            systemPrompt: systemPrompt
              ? `${systemPrompt}\n\n${jsonInstruction}`
              : jsonInstruction,
            userPrompt: retryPrompt,
            model,
            temperature,
          });

          const retryParsed = schema.safeParse(JSON.parse(retryResponse.text));

          if (retryParsed.success) {
            console.info('Structured output valid after retry.');
            return retryParsed.data as T;
          }

          // Validation failed on retry
          const retryError = formatZodError(retryParsed.error);
          const analysisError: AnalysisError = {
            type: 'ANALYSIS_ERROR',
            message:
              `Structured output validation failed after 2 attempts. ` +
              `Error: ${retryError}`,
            step: 'structured-output-generation',
            originalError: retryError,
          };
          throw new StructuredOutputError(analysisError.message, analysisError, 2);
        } catch (retryErr) {
          if (retryErr instanceof StructuredOutputError) {
            throw retryErr;
          }

          // Retry also failed with JSON parse error
          const retryErrorMsg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          const analysisError: AnalysisError = {
            type: 'ANALYSIS_ERROR',
            message:
              `Structured output generation failed after 2 attempts. ` +
              `Could not parse JSON from model response. Final error: ${retryErrorMsg}`,
            step: 'structured-output-generation',
            originalError: retryErrorMsg,
          };
          throw new StructuredOutputError(analysisError.message, analysisError, 2);
        }
      } else {
        // Second attempt also failed
        const analysisError: AnalysisError = {
          type: 'ANALYSIS_ERROR',
          message:
            `Structured output generation failed after 2 attempts. ` +
            `Could not parse JSON from model response. Error: ${errorMsg}`,
          step: 'structured-output-generation',
          originalError: errorMsg,
        };
        throw new StructuredOutputError(analysisError.message, analysisError, 2);
      }
    }
  }

  const analysisError: AnalysisError = {
    type: 'ANALYSIS_ERROR',
    message: 'Structured output generation exhausted retry attempts.',
    step: 'structured-output-generation',
  };
  throw new StructuredOutputError(analysisError.message, analysisError, 2);
}

/**
 * Format a Zod validation error into a human-readable string for the model.
 */
function formatZodError(error: ZodError): string {
  const issues = error.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return `Field "${path || 'root'}": ${issue.message}`;
    })
    .join('; ');

  return issues || 'Unknown validation error';
}
