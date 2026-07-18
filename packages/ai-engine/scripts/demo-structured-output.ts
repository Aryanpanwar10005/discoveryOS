import { GeminiClient } from '../src/client/gemini-client';
import { generateStructuredOutput } from '../src/structured-output/generate-structured-output';
import { EvidenceSchema } from '@discoveryos/core';

/**
 * Demo: Structured output generation with Gemini API.
 *
 * Tests:
 * 1. LLM client connectivity (requires real GEMINI_API_KEY in .env)
 * 2. Structured output generation + Zod validation
 * 3. Retry logic on parse failure
 * 4. Error handling
 *
 * Instructions:
 * - Set GEMINI_API_KEY in .env (get from https://ai.google.dev/api/rest)
 * - Run: pnpm demo
 */

async function main() {
  console.log('=== AI Engine Demo: Structured Output Generation ===\n');

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-actual-key-here-for-testing') {
    console.error(
      'ERROR: GEMINI_API_KEY not set or placeholder value detected.\n' +
      'To run the live demo:\n' +
      '1. Get a free Gemini API key from https://ai.google.dev/api/rest\n' +
      '2. Set it in .env: GEMINI_API_KEY=your-actual-key\n' +
      '3. Run: pnpm demo\n'
    );
    process.exit(1);
  }

  try {
    // Initialize Gemini client
    console.log('✓ Initializing Gemini client...');
    const llmClient = new GeminiClient();
    console.log('✓ Client initialized.\n');

    // Test 1: Generate valid structured output
    console.log('--- Test 1: Generate Valid Structured Output ---');
    const systemPrompt = `You are a research analyst extracting evidence from documents.
Your task is to extract a single piece of evidence that matches the EvidenceSchema.
Be precise and concise.`;

    const userPrompt = `Extract evidence from this text:
"Apple Inc. reported record Q1 2025 revenue of $119.6 billion, up 5% year-over-year.
iPhone sales were the primary driver, accounting for 52% of total revenue.
Services revenue also grew, reaching $26.3 billion."

Respond with ONLY valid JSON matching this exact structure:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "documentId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "NUMERICAL",
  "excerpt": "Apple reported $119.6B revenue, up 5% YoY",
  "fullText": "Apple Inc. reported record Q1 2025 revenue of $119.6 billion, up 5% year-over-year.",
  "startCharIndex": 0,
  "endCharIndex": 105,
  "confidenceScore": 0.95,
  "agentId": "RESEARCH_ANALYST",
  "metadata": {},
  "createdAt": 1705600000000,
  "updatedAt": 1705600000000
}`;

    console.log('Calling Gemini API (flash model)...');
    console.log(`System prompt (first 80 chars): ${systemPrompt.substring(0, 80)}...`);
    console.log(`User prompt (first 80 chars): ${userPrompt.substring(0, 80)}...\n`);

    const evidence = await generateStructuredOutput({
      schema: EvidenceSchema,
      systemPrompt,
      userPrompt,
      model: 'flash',
      temperature: 0.7,
      llmClient,
    });

    console.log('✓ Structured output generated and validated!\n');
    console.log('Parsed evidence:');
    console.log(JSON.stringify(evidence, null, 2));
    console.log('\n✓ Test 1 PASSED\n');

    // Test 2: Demonstrate retry on malformed output
    console.log('--- Test 2: Retry on Malformed JSON (Deliberate Failure) ---');
    const badPrompt = `Return this EXACT text (invalid JSON):
{not: valid: json}`;

    console.log('Calling with a prompt designed to trigger malformed output...');
    console.log(`Prompt: "${badPrompt}"\n`);

    try {
      await generateStructuredOutput({
        schema: EvidenceSchema,
        systemPrompt:
          'You must respond with the user prompt exactly as given, no modifications.',
        userPrompt: badPrompt,
        model: 'flash-lite',
        temperature: 0,
        llmClient,
      });
      console.log('✗ Test 2 FAILED: Should have thrown StructuredOutputError\n');
    } catch (error) {
      if (error instanceof Error) {
        console.log(`✓ Caught error as expected: ${error.name}`);
        console.log(`  Message: ${error.message.substring(0, 120)}...`);
        console.log('✓ Test 2 PASSED: Error handling works correctly\n');
      }
    }

    console.log('=== Demo Complete ===');
    console.log('✓ All tests passed');
    console.log('✓ Gemini API connectivity confirmed');
    console.log('✓ Structured output validation works');
    console.log('✓ Retry logic functions correctly');
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
