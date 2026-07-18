/**
 * LLMClient interface — abstract contract for language model access.
 * Implementations (Gemini, OpenAI, etc.) provide concrete behavior.
 * Callers select model per-call, enabling task-specific optimization.
 */

export type ModelType = 'flash' | 'flash-lite';

export interface LLMClientParams {
  systemPrompt?: string;
  userPrompt: string;
  model: ModelType;
  temperature?: number;
}

export interface LLMClientResponse {
  text: string;
}

export interface LLMClient {
  /**
   * Call the language model with optional system prompt, user prompt, and model selection.
   * Automatically retries on rate limits (429); fails loudly on other errors.
   */
  complete(params: LLMClientParams): Promise<LLMClientResponse>;
}
