/**
 * Retry wrapper with exponential backoff for rate-limit errors (429).
 * Other errors (auth, validation, etc.) are surfaced immediately.
 * Max 3 attempts, exponential delay: 1s, 2s, 4s between retries.
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Execute fn with automatic retry on rate-limit (429) errors.
 * Non-429 errors bubble up immediately (fail-fast for auth, validation, etc.).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if this is a rate-limit error (429)
      const is429 =
        (error as any)?.status === 429 ||
        (error as any)?.statusCode === 429 ||
        (error as any)?.code === 'RATE_LIMIT_EXCEEDED' ||
        (error as any)?.message?.includes('429');

      if (!is429) {
        // Non-rate-limit error: fail fast
        throw error;
      }

      // Rate-limit error: check if we have retries left
      if (attempt === maxAttempts) {
        throw new RateLimitError(
          `Rate limited after ${maxAttempts} attempts: ${lastError.message}`,
          429
        );
      }

      // Calculate exponential backoff delay
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Rate limited (attempt ${attempt}/${maxAttempts}). ` +
        `Retrying in ${delayMs}ms...`
      );

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Should not reach here, but fail if we do
  throw lastError || new Error('Retry failed with unknown error');
}
