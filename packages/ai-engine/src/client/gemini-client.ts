import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { LLMClient, LLMClientParams, LLMClientResponse, ModelType } from './llm-client';
import { withRetry } from '../retry/with-retry';

/**
 * Gemini model name mapping — single source of truth for model strings.
 * Free tier uses flash and flash-lite; update here if names change.
 */
const MODEL_MAP: Record<ModelType, string> = {
  flash: 'gemini-2.0-flash',
  'flash-lite': 'gemini-2.0-flash-lite',
};

/**
 * Concrete LLMClient implementation for Google Gemini API.
 * Reads GEMINI_API_KEY from process.env; fails loudly if missing.
 * Handles rate-limit retries internally via withRetry().
 */
export class GeminiClient implements LLMClient {
  private readonly client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is not set. ' +
        'Set it in .env or export it before running this application.'
      );
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(params: LLMClientParams): Promise<LLMClientResponse> {
    const { systemPrompt, userPrompt, model, temperature = 0.7 } = params;

    // Map model type to actual Gemini model string
    const modelName = MODEL_MAP[model];
    if (!modelName) {
      throw new Error(`Unknown model type: ${model}`);
    }

    // Wrap the actual API call with retry logic (handles 429 rate limits)
    return withRetry(async () => {
      const generativeModel = this.client.getGenerativeModel({
        model: modelName,
      });

      const chat = generativeModel.startChat({
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      // Add system prompt if provided
      if (systemPrompt) {
        await chat.sendMessage(systemPrompt);
      }

      // Send user prompt and get response
      const result = await chat.sendMessage(userPrompt);
      const responseText = result.response.text();

      return {
        text: responseText,
      };
    });
  }
}
