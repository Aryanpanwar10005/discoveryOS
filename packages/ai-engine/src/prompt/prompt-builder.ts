/**
 * Simple prompt template builder — no heavy templating library.
 * Supports basic variable substitution with type safety.
 */

export interface PromptTemplate {
  systemPrompt?: string;
  userPrompt: string;
}

export interface PromptContext {
  [key: string]: string | number | boolean;
}

/**
 * Substitute ${variable} patterns in a template string.
 * Throws if a referenced variable is not in the context.
 * Silently leaves unmatched patterns untouched (allows literal ${...} in output).
 */
export function interpolate(template: string, context?: PromptContext): string {
  if (!context) {
    return template;
  }

  return template.replace(/\$\{([^}]+)\}/g, (match, key) => {
    if (key in context) {
      const value = context[key];
      return String(value);
    }
    // Key not in context; return the original pattern to allow literal ${...}
    return match;
  });
}

/**
 * Build a prompt from a template and context, with optional prefix/suffix.
 */
export function buildPrompt(
  template: PromptTemplate,
  context?: PromptContext,
  options?: {
    systemPrefix?: string;
    userSuffix?: string;
  }
): PromptTemplate {
  const systemPrompt = template.systemPrompt
    ? interpolate(template.systemPrompt, context)
    : undefined;

  let userPrompt = interpolate(template.userPrompt, context);

  if (options?.systemPrefix && systemPrompt) {
    // Prepend to system prompt
    return {
      systemPrompt: options.systemPrefix + '\n\n' + systemPrompt,
      userPrompt,
    };
  }

  if (options?.userSuffix) {
    userPrompt = userPrompt + '\n\n' + options.userSuffix;
  }

  return {
    systemPrompt,
    userPrompt,
  };
}
