# @discovery/ai-engine

Foundation layer: LLM client, structured output generation, and prompt utilities for agent orchestration.

## Overview

This package provides the **shared plumbing** that all agents (Research Analyst, Intelligence Synthesizer, etc.) and the orchestration layer (LangGraph) build on top of. It is NOT an agent itself — it is the infrastructure layer.

## Features

- **LLMClient Interface** — Abstract contract for language model access (currently: Gemini implementation)
- **Per-call Model Selection** — Callers choose flash or flash-lite per task
- **Structured Output Generation** — Zod schema validation with automatic retry on parse failure
- **Rate-Limit Handling** — Exponential backoff for 429 errors; fail-fast for auth/validation errors
- **Prompt Utilities** — Simple template interpolation for reusable prompts

## Architecture

```
src/
├── client/
│   ├── llm-client.ts          # Interface: LLMClient, ModelType
│   └── gemini-client.ts       # Concrete: GeminiClient (Gemini API)
├── structured-output/
│   └── generate-structured-output.ts  # Main function + retry logic
├── prompt/
│   └── prompt-builder.ts      # Template interpolation
├── retry/
│   └── with-retry.ts          # Exponential backoff for rate limits
└── index.ts                   # Exports
```

## Usage

### Basic LLM Call

```typescript
import { GeminiClient } from '@discovery/ai-engine';

const llmClient = new GeminiClient(); // Reads GEMINI_API_KEY from .env

const response = await llmClient.complete({
  systemPrompt: 'You are a helpful assistant.',
  userPrompt: 'What is 2 + 2?',
  model: 'flash',
  temperature: 0.7,
});

console.log(response.text);
```

### Structured Output with Validation

```typescript
import { generateStructuredOutput, GeminiClient } from '@discovery/ai-engine';
import { EvidenceSchema } from '@discoveryos/core';

const llmClient = new GeminiClient();

const evidence = await generateStructuredOutput({
  schema: EvidenceSchema,
  systemPrompt: 'Extract evidence from the text.',
  userPrompt: 'The revenue was $100M, up 20% YoY.',
  model: 'flash',
  llmClient,
});

// evidence is now a fully validated Evidence type per the schema
console.log(evidence.id, evidence.confidence);
```

### Prompt Templating

```typescript
import { buildPrompt } from '@discovery/ai-engine';

const prompt = buildPrompt(
  {
    systemPrompt: 'You are a ${role}.',
    userPrompt: 'Analyze: ${topic}',
  },
  { role: 'analyst', topic: 'revenue trends' }
);

// Results in:
// systemPrompt: "You are a analyst."
// userPrompt: "Analyze: revenue trends"
```

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Set Environment**
   ```bash
   # In .env (never committed):
   GEMINI_API_KEY=your-actual-key-here
   
   # .env.example (committed):
   GEMINI_API_KEY=
   ```

3. **Build**
   ```bash
   pnpm build
   ```

## Configuration

### Models

Currently supported:
- `flash` — `gemini-2.0-flash` (reasoning-heavy tasks)
- `flash-lite` — `gemini-2.0-flash-lite` (high-volume, simpler extraction)

Model names are mapped in `src/client/gemini-client.ts`. Update the `MODEL_MAP` if Google changes model naming.

### Rate Limiting

Automatic exponential backoff on 429 errors:
- Attempt 1: immediate
- Attempt 2: 1s delay
- Attempt 3: 2s delay

Other errors (auth, validation) fail immediately (fail-fast).

### Structured Output Retry

`generateStructuredOutput()` retries up to 2 times:
- Attempt 1: If JSON parse or validation fails, collect the error message
- Attempt 2: Retry with the error message appended to the prompt so the model knows what went wrong
- If still invalid: Throw `AppError` with type `VALIDATION_ERROR`

Errors are never silently swallowed.

## Demo

```bash
# Requires GEMINI_API_KEY in .env
pnpm demo
```

This calls the live Gemini API with a sample prompt, generates structured output matching `EvidenceSchema`, and prints the result.

## Testing

Not yet. Structured tests will be added when we know more about free-tier quotas and concurrent usage patterns.

## Notes for Agents

- **Do not redefine schemas** — reuse Evidence, Insight, Theme, etc. from `@discoveryos/core`
- **Do not retry yourself** — `generateStructuredOutput()` handles retries; just await the call
- **Model selection** — pass 'flash' for reasoning tasks, 'flash-lite' for high-volume extraction
- **Error handling** — catch `AppError` and check `.type` field; never assume success
