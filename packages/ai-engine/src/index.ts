// LLM Client interface and Gemini implementation
export type { LLMClient, LLMClientParams, LLMClientResponse, ModelType } from './client/llm-client';
export { GeminiClient } from './client/gemini-client';

// Structured output generation with retry and validation
export { generateStructuredOutput, StructuredOutputError } from './structured-output/generate-structured-output';
export type { GenerateStructuredOutputParams } from './structured-output/generate-structured-output';

// Prompt utilities
export {
  buildPrompt,
  interpolate,
} from './prompt/prompt-builder';
export type {
  PromptTemplate,
  PromptContext,
} from './prompt/prompt-builder';

// Retry utilities
export { withRetry, RateLimitError } from './retry/with-retry';
export type { RetryOptions } from './retry/with-retry';
