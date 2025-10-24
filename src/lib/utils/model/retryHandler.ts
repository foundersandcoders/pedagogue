/**
 * Retry Orchestration for Module Generation
 *
 * Unified retry logic supporting both streaming and non-streaming generation modes.
 * Handles validation, error accumulation, and automatic retry with refined prompts.
 */
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { GenerationResult, RetryConfig, ChatModel } from '$lib/types/agent';
import { validateModuleXML } from '$lib/schemas/moduleValidator.js';
import { extractTextContent, extractModuleXML } from '$lib/utils/validation/responseParser';
import { buildGenerationPrompt } from '$lib/factories/prompts/metisPromptFactory';

/**
 * System message used for all generation attempts
 */
const SYSTEM_MESSAGE = 'You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.';

/**
 * Generate module content with streaming support
 *
 * Streams content chunks as they arrive from the AI model.
 *
 * @param messages - Messages to send to the model
 * @param model - ChatModel instance (ChatAnthropic or Runnable)
 * @param onChunk - Callback for each content chunk
 * @returns Full generated content
 */
async function generateWithStreaming(
	messages: (SystemMessage | HumanMessage)[],
	model: ChatModel,
	onChunk?: (chunk: string) => void | Promise<void>
): Promise<string> {
	let fullContent = '';
	const responseStream = await model.stream(messages);

	for await (const chunk of responseStream) {
		const textChunk = extractTextContent(chunk.content);
		if (textChunk) {
			fullContent += textChunk;
			if (onChunk) {
				await onChunk(textChunk);
			}
		}
	}

	return fullContent;
}

/**
 * Generate module content without streaming
 *
 * Returns complete content after full generation.
 *
 * @param messages - Messages to send to the model
 * @param model - ChatModel instance (ChatAnthropic or Runnable)
 * @returns Full generated content
 */
async function generateWithoutStreaming(
	messages: (SystemMessage | HumanMessage)[],
	model: ChatModel
): Promise<string> {
	const response = await model.invoke(messages);
	return extractTextContent(response.content);
}

/**
 * Single generation attempt with validation
 *
 * @param config - Retry configuration
 * @param attempt - Current attempt number
 * @param lastError - Errors from previous attempt (if any)
 * @returns Generation result
 */
async function performAttempt(
	config: RetryConfig,
	attempt: number,
	lastError: string[]
): Promise<GenerationResult> {
	const { body, model, callbacks, promptBuilder = buildGenerationPrompt } = config;

	// Build prompt with error feedback if retrying (using custom or default builder)
	const prompt = promptBuilder(body, attempt > 1 ? lastError : undefined);

	const messages = [
		new SystemMessage(SYSTEM_MESSAGE),
		new HumanMessage(prompt)
	];

	// Generate content (with or without streaming)
	const fullContent = callbacks?.onContentChunk
		? await generateWithStreaming(messages, model, callbacks.onContentChunk)
		: await generateWithoutStreaming(messages, model);

	// Notify that validation is starting
	if (callbacks?.onValidationStart) {
		await callbacks.onValidationStart();
	}

	// Extract XML
	const xmlContent = extractModuleXML(fullContent);

	if (!xmlContent) {
		return {
			success: false,
			fullContent,
			xmlContent: null,
			validationErrors: [
				'Failed to extract valid XML from response.',
				`Response length: ${fullContent.length} characters`,
				'Ensure output is complete with closing </Module> tag.'
			],
			attempt
		};
	}

	// Validate against schema
	const validation = validateModuleXML(xmlContent);

	return {
		success: validation.valid,
		fullContent,
		xmlContent,
		validationErrors: validation.valid ? [] : validation.errors,
		validationWarnings: validation.warnings,
		attempt
	};
}

/**
 * Execute generation with automatic retry on validation failure
 *
 * Supports both streaming and non-streaming modes through callbacks.
 * Accumulates validation errors and includes them in retry prompts.
 *
 * @param config - Retry configuration including model, request body, and optional callbacks
 * @returns Final generation result (success or failure after all retries)
 *
 * @example
 * // Non-streaming usage:
 * const result = await withRetry({ body, model, maxRetries: 3 });
 *
 * @example
 * // Streaming usage with callbacks:
 * const result = await withRetry({
 *   body,
 *   model,
 *   maxRetries: 3,
 *   callbacks: {
 *     onAttemptStart: (attempt, max) => console.log(`Attempt ${attempt}/${max}`),
 *     onContentChunk: (chunk) => process.stdout.write(chunk),
 *     onValidationStart: () => console.log('Validating...'),
 *     onValidationResult: (result) => console.log('Result:', result.success)
 *   }
 * });
 */
export async function withRetry(config: RetryConfig): Promise<GenerationResult> {
	const { callbacks, maxRetries = 3 } = config;
	let lastError: string[] = [];

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		// Notify start of attempt
		if (callbacks?.onAttemptStart) {
			await callbacks.onAttemptStart(attempt, maxRetries, lastError);
		}

		// Perform generation and validation
		const result = await performAttempt(config, attempt, lastError);

		// Notify of validation result
		if (callbacks?.onValidationResult) {
			await callbacks.onValidationResult(result);
		}

		// Success - return immediately
		if (result.success) {
			return result;
		}

		// Update error context for next attempt
		lastError = result.validationErrors;

		// If this was the last attempt, return the failure result
		if (attempt === maxRetries) {
			return result;
		}

		// Otherwise, continue to next retry
	}

	// Should never reach here due to loop logic, but TypeScript requires it
	throw new Error('Unexpected end of retry loop');
}
