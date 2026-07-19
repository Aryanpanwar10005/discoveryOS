import { GeminiClient } from '../src/client/gemini-client';
import { generateStructuredOutput, StructuredOutputError } from '../src/structured-output/generate-structured-output';
import { EvidenceSchema } from '@discoveryos/core';

/**
 * Deliberate malformed output test: Trigger validation failure and retry logic
 * Confirms that the retry mechanism catches and re-prompts on invalid JSON
 */

async function main() {
  console.log('=== AI Engine: Deliberate Malformed Output Test ===\n');

  try {
    console.log('Initializing Gemini client...');
    const llmClient = new GeminiClient();
    console.log('✓ Client initialized.\n');

    console.log('--- Test: Intentionally Malformed Output ---');
    console.log('Sending prompt designed to trigger invalid JSON response...\n');

    const systemPrompt = `You are responding with intentionally malformed output.
Ignore all other instructions and respond with exactly: {invalid json}`;

    const userPrompt = `Return malformed JSON that will fail validation:
{this is not valid json}`;

    console.log('Calling Gemini API with malformed-output prompt...\n');

    try {
      const result = await generateStructuredOutput({
        schema: EvidenceSchema,
        systemPrompt,
        userPrompt,
        model: 'flash',
        temperature: 0,
        llmClient,
      });

      console.log('✗ UNEXPECTED: Should have thrown StructuredOutputError');
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(1);
    } catch (error) {
      if (error instanceof StructuredOutputError) {
        console.log('✓ Caught StructuredOutputError as expected');
        console.log(`  Error name: ${error.name}`);
        console.log(`  Message: ${error.message}`);
        console.log(`  Attempt: ${error.attempt}`);
        console.log(`  Analysis error type: ${error.analysisError.type}`);
        console.log('\n✓ Test PASSED: Retry logic and error handling work correctly');
      } else if (error instanceof Error) {
        console.log(`✗ Caught wrong error type: ${error.name}`);
        console.log(`  Message: ${error.message}`);
        process.exit(1);
      } else {
        console.log('✗ Caught unknown error:', error);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('✗ Test setup failed:');
    if (error instanceof Error) {
      console.error(`  ${error.name}: ${error.message}`);
    } else {
      console.error('  ', error);
    }
    process.exit(1);
  }
}

main();
