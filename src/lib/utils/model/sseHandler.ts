/**
 * Server-Sent Events (SSE) Streaming Handler
 *
 * Manages real-time streaming of module generation progress to the client.
 * Includes validation, retry logic, and progress event formatting.
 */
import type { GenerationResult, SSEEvent, SSEStreamConfig } from '$lib/types/agent';
import { withRetry } from '$lib/utils/model/retryHandler';

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

				// Execute generation with retry logic and streaming callbacks
				const result = await withRetry({
					body,
					model,
					maxRetries,
					callbacks: {
						onAttemptStart: (attempt, max, errors) => {
							sendEvent(controller, {
								type: 'progress',
								message: attempt === 1
									? 'Analyzing input files...'
									: `Retry attempt ${attempt}/${max} with refined instructions...`
							});

							if (attempt === 1 || errors.length > 0) {
								sendEvent(controller, {
									type: 'progress',
									message: 'Generating module content with Claude...'
								});
							}
						},

						onContentChunk: (chunk) => {
							sendEvent(controller, {
								type: 'content',
								chunk,
								message: 'Streaming content...'
							});
						},

						onValidationStart: () => {
							sendEvent(controller, {
								type: 'validation_started',
								message: 'Validating generated content...'
							});
						},

						onValidationResult: (result: GenerationResult) => {
							if (result.success) {
								sendEvent(controller, {
									type: 'validation_success',
									message: 'Schema validation passed!'
								});
							} else {
								sendEvent(controller, {
									type: 'validation_failed',
									message: `Validation failed (attempt ${result.attempt}/${maxRetries})`,
									errors: result.validationErrors,
									warnings: result.validationWarnings
								});
							}
						}
					}
				});

				// Send final result
				if (result.success) {
					sendEvent(controller, {
						type: 'complete',
						message: 'Generation complete',
						content: result.fullContent,
						xmlContent: result.xmlContent,
						attempts: result.attempt,
						warnings: result.validationWarnings
					});
				} else {
					sendEvent(controller, {
						type: 'error',
						message: `Generation failed after ${result.attempt} attempts`,
						errors: result.validationErrors,
						warnings: result.validationWarnings,
						content: result.fullContent,
						xmlContent: result.xmlContent
					});
				}

				controller.close();

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
