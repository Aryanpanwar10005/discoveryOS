import { GeminiClient } from '../src/client/gemini-client';
import { generateStructuredOutput } from '../src/structured-output/generate-structured-output';
import { EvidenceSchema } from '@discoveryos/core';

/**
 * Demo: Call Gemini API to generate structured output matching EvidenceSchema.
 * Tests:
 * 1. LLM client connectivity + rate-limit retry
 * 2. Structured output generation + validation
 * 3. Model response formatting and error handling
 *
 * Requires GEMINI_API_KEY in .env
 */

async function main() {
  console.log('=== AI Engine Demo: Structured Output Generation ===\n');

  try {
    // Initialize Gemini client (reads GEMINI_API_KEY from .env)
    console.log('Initializing Gemini client...');
    const llmClient = new GeminiClient();
    console.log('✓ Client initialized.\n');

    // Prepare a sample prompt for evidence extraction
    const systemPrompt = `You are a research analyst extracting evidence from documents.
Your task is to extract a single evidence item that matches the EvidenceSchema.
Be precise and concise.`;

    const userPrompt = `Extract evidence from this text:
"Apple Inc. reported record Q1 2025 revenue of $119.6 billion, up 5% YoY.
iPhone sales were the primary driver, accounting for 52% of total revenue."

Respond with ONLY JSON matching this schema:
{
  "id": "string (UUID v4)",
  "documentId": "string (UUID v4)",
  "type": "enum (one of: PAIN_POINT, USER_QUOTE, COMPLAINT, REQUEST, BUG, WORKFLOW_PROBLEM, FEATURE_REQUEST, OTHER)",
  "excerpt": "string (the evidence text)",
  "fullText": "string (full text)",
  "startCharIndex": "number",
  "endCharIndex": "number",
  "confidenceScore": "number between 0 and 1",
  "agentId": "RESEARCH_ANALYST",
  "metadata": "object",
  "createdAt": "timestamp in milliseconds",
  "updatedAt": "timestamp in milliseconds"
}`;

    console.log('Calling Gemini API (flash model)...\n');

    // Call generateStructuredOutput with EvidenceSchema
    const evidence = await generateStructuredOutput({
      schema: EvidenceSchema,
      systemPrompt,
      userPrompt,
      model: 'flash',
      temperature: 0.7,
      llmClient,
    });

    console.log('✓ Structured output generated and validated!\n');
    console.log('Parsed evidence object:');
    console.log(JSON.stringify(evidence, null, 2));
    console.log('\n✓ Demo completed successfully.');
  } catch (error) {
    console.error('✗ Demo failed:');
    if (error instanceof Error) {
      console.error(`  ${error.name}: ${error.message}`);
      if ((error as any).cause) {
        console.error(`  Cause: ${(error as any).cause}`);
      }
    } else {
      console.error('  ', error);
    }
    process.exit(1);
  }
}

main();
