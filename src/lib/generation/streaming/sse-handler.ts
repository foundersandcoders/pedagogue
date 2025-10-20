/**
 * Server-Sent Events (SSE) Streaming Handler
 *
 * Manages real-time streaming of module generation progress to the client.
 * Includes validation, retry logic, and progress event formatting.
 */

import type { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { GenerateRequest } from '$lib/validation/api-schemas.js';
import { validateModuleXML } from '$lib/schemas/moduleValidator.js';
import { extractTextContent, extractModuleXML } from '$lib/generation/ai/response-parser.js';
import { buildGenerationPrompt } from '$lib/generation/prompts/module-prompt-builder.js';

/**
 * SSE event types for module generation
 */
export type SSEEventType =
	| 'connected'
	| 'progress'
	| 'content'
	| 'validation_started'
	| 'validation_success'
	| 'validation_failed'
	| 'complete'
	| 'error';

/**
 * SSE event data structure
 */
export interface SSEEvent {
	type: SSEEventType;
	message?: string;
	chunk?: string;
	content?: string;
	xmlContent?: string;
	attempts?: number;
	errors?: string[];
	warnings?: string[];
}

/**
 * Configuration for SSE stream creation
 */
export interface SSEStreamConfig {
	body: GenerateRequest;
	model: ChatAnthropic;
	maxRetries?: number;
}

/**
 * Encode SSE event as a data string
 */
function encodeSSEEvent(event: SSEEvent): Uint8Array {
	const encoder = new TextEncoder();
	return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * Send an SSE event to the client
 */
function sendEvent(controller: ReadableStreamDefaultController, event: SSEEvent): void {
	controller.enqueue(encodeSSEEvent(event));
}

/**
 * Create a Server-Sent Events stream for real-time module generation
 *
 * Handles streaming progress updates, validation, and automatic retry logic.
 *
 * @param config - Stream configuration including request body and AI model
 * @returns Response with SSE stream
 */
export function createSSEStream(config: SSEStreamConfig): Response {
	const { body, model, maxRetries = 3 } = config;

	const stream = new ReadableStream({
		async start(controller) {
			let lastError: string[] = [];

			try {
				// Send initial connection confirmation
				sendEvent(controller, {
					type: 'connected',
					message: 'Generation started'
				});

				// Conditionally show research message
				if (body.enableResearch) {
					sendEvent(controller, {
						type: 'progress',
						message: 'Enabling deep research with web search...'
					});
				}

				// Retry loop
				for (let attempt = 1; attempt <= maxRetries; attempt++) {
					sendEvent(controller, {
						type: 'progress',
						message: attempt === 1
							? 'Analyzing input files...'
							: `Retry attempt ${attempt}/${maxRetries} with refined instructions...`
					});

					// Build the prompt (include validation errors if retrying)
					const prompt = buildGenerationPrompt(body, attempt > 1 ? lastError : undefined);

					const messages = [
						new SystemMessage('You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.'),
						new HumanMessage(prompt)
					];

					sendEvent(controller, {
						type: 'progress',
						message: 'Generating module content with Claude...'
					});

					let fullContent = '';

					// Stream the response
					const responseStream = await model.stream(messages);

					for await (const chunk of responseStream) {
						// Extract text content from chunk (handles both string and array formats)
						const textChunk = extractTextContent(chunk.content);

						if (textChunk) {
							fullContent += textChunk;
							// Send chunks of content as they arrive
							sendEvent(controller, {
								type: 'content',
								chunk: textChunk,
								message: 'Streaming content...'
							});
						}
					}

					// Extract and validate XML
					sendEvent(controller, {
						type: 'validation_started',
						message: 'Validating generated content...'
					});

					const xmlContent = extractModuleXML(fullContent);

					if (!xmlContent) {
						lastError = ['Failed to extract valid XML from response. Ensure output is wrapped in <Module>...</Module> tags.'];

						sendEvent(controller, {
							type: 'validation_failed',
							message: `XML extraction failed (attempt ${attempt}/${maxRetries})`,
							errors: lastError
						});

						if (attempt < maxRetries) {
							continue; // Retry
						} else {
							// All retries exhausted
							sendEvent(controller, {
								type: 'error',
								message: 'Failed to generate valid XML after all retry attempts',
								errors: lastError,
								content: fullContent
							});
							controller.close();
							return;
						}
					}

					// Validate against schema
					const validation = validateModuleXML(xmlContent);

					if (validation.valid) {
						// Success!
						sendEvent(controller, {
							type: 'validation_success',
							message: 'Schema validation passed!'
						});

						sendEvent(controller, {
							type: 'complete',
							message: 'Generation complete',
							content: fullContent,
							xmlContent: xmlContent,
							attempts: attempt,
							warnings: validation.warnings
						});

						controller.close();
						return;

					} else {
						// Validation failed
						lastError = validation.errors;

						sendEvent(controller, {
							type: 'validation_failed',
							message: `Schema validation failed (attempt ${attempt}/${maxRetries})`,
							errors: validation.errors,
							warnings: validation.warnings
						});

						if (attempt < maxRetries) {
							continue; // Retry
						} else {
							// All retries exhausted
							sendEvent(controller, {
								type: 'error',
								message: `Schema validation failed after ${maxRetries} attempts`,
								errors: validation.errors,
								warnings: validation.warnings,
								content: fullContent,
								xmlContent: xmlContent
							});
							controller.close();
							return;
						}
					}
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Stream error';
				sendEvent(controller, {
					type: 'error',
					message: errorMessage
				});
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
}
