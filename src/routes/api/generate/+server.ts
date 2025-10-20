import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { validateModuleXML } from '$lib/schemas/moduleValidator.js';
import { GenerateRequestSchema, formatZodError, type GenerateRequest } from '$lib/validation/api-schemas.js';
import { createChatClient, createStreamingClient, withWebSearch } from '$lib/generation/ai/client-factory.js';
import { extractTextContent, extractModuleXML } from '$lib/generation/ai/response-parser.js';
import { buildGenerationPrompt } from '$lib/generation/prompts/module-prompt-builder.js';

/**
 * API endpoint for generating module content using Claude + LangChain
 * Supports SSE streaming for progress updates during generation
 */

export const POST: RequestHandler = async ({ request }) => {
	// Validate environment setup
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw error(500, {
			message: 'ANTHROPIC_API_KEY not configured. Set this in your environment variables.'
		});
	}

	try {
		// Parse and validate incoming request with Zod
		const rawBody = await request.json();
		const validation = GenerateRequestSchema.safeParse(rawBody);

		if (!validation.success) {
			throw error(400, {
				message: 'Invalid request data: ' + formatZodError(validation.error).join(', ')
			});
		}

		const body = validation.data;

		// Additional validation for required file data
		if (!body.projectsData || !body.skillsData || !body.researchData) {
			throw error(400, {
				message: 'Missing required data. projectsData, skillsData, and researchData are all required.'
			});
		}

		// Check if client accepts streaming
		const acceptHeader = request.headers.get('accept');
		const supportsSSE = acceptHeader?.includes('text/event-stream');

		if (supportsSSE) {
			// Return SSE stream for progress updates
			return createSSEStream(body, apiKey);
		} else {
			// Return standard JSON response
			return await generateModule(body, apiKey);
		}
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors
			throw err;
		}

		console.error('Generation error:', err);
		throw error(500, {
			message: err instanceof Error ? err.message : 'Unknown error during generation'
		});
	}
};

/**
 * Create Server-Sent Events stream for real-time progress updates
 * Includes validation and automatic retry logic
 */
function createSSEStream(body: GenerateRequest, apiKey: string) {
	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			const MAX_RETRIES = 3;
			let lastError: string[] = [];

			try {
				// Send initial connection confirmation
				controller.enqueue(
					encoder.encode('data: {"type":"connected","message":"Generation started"}\n\n')
				);

				// Conditionally show research message
				if (body.enableResearch) {
					controller.enqueue(
						encoder.encode('data: {"type":"progress","message":"Enabling deep research with web search..."}\n\n')
					);
				}

				// Initialize streaming client with optional web search
				const model = createStreamingClient({
					apiKey,
					enableResearch: body.enableResearch
				});

				// Retry loop
				for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({
							type: 'progress',
							message: attempt === 1
								? 'Analyzing input files...'
								: `Retry attempt ${attempt}/${MAX_RETRIES} with refined instructions...`
						})}\n\n`)
					);

					// Build the prompt (include validation errors if retrying)
					const prompt = buildGenerationPrompt(body, attempt > 1 ? lastError : undefined);

					const messages = [
						new SystemMessage('You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.'),
						new HumanMessage(prompt)
					];

					controller.enqueue(
						encoder.encode('data: {"type":"progress","message":"Generating module content with Claude..."}\n\n')
					);

					let fullContent = '';

					// Stream the response
					const responseStream = await model.stream(messages);

					for await (const chunk of responseStream) {
						// Extract text content from chunk (handles both string and array formats)
						const textChunk = extractTextContent(chunk.content);

						if (textChunk) {
							fullContent += textChunk;
							// Send chunks of content as they arrive
							const progressData = {
								type: 'content',
								chunk: textChunk,
								message: 'Streaming content...'
							};
							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
							);
						}
					}

					// Extract and validate XML
					controller.enqueue(
						encoder.encode('data: {"type":"validation_started","message":"Validating generated content..."}\n\n')
					);

					const xmlContent = extractModuleXML(fullContent);

					if (!xmlContent) {
						lastError = ['Failed to extract valid XML from response. Ensure output is wrapped in <Module>...</Module> tags.'];

						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({
								type: 'validation_failed',
								message: `XML extraction failed (attempt ${attempt}/${MAX_RETRIES})`,
								errors: lastError
							})}\n\n`)
						);

						if (attempt < MAX_RETRIES) {
							continue; // Retry
						} else {
							// All retries exhausted
							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify({
									type: 'error',
									message: 'Failed to generate valid XML after all retry attempts',
									errors: lastError,
									content: fullContent
								})}\n\n`)
							);
							controller.close();
							return;
						}
					}

					// Validate against schema
					const validation = validateModuleXML(xmlContent);

					if (validation.valid) {
						// Success!
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({
								type: 'validation_success',
								message: 'Schema validation passed!'
							})}\n\n`)
						);

						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({
								type: 'complete',
								message: 'Generation complete',
								content: fullContent,
								xmlContent: xmlContent,
								attempts: attempt,
								warnings: validation.warnings
							})}\n\n`)
						);

						controller.close();
						return;

					} else {
						// Validation failed
						lastError = validation.errors;

						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({
								type: 'validation_failed',
								message: `Schema validation failed (attempt ${attempt}/${MAX_RETRIES})`,
								errors: validation.errors,
								warnings: validation.warnings
							})}\n\n`)
						);

						if (attempt < MAX_RETRIES) {
							continue; // Retry
						} else {
							// All retries exhausted
							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify({
									type: 'error',
									message: `Schema validation failed after ${MAX_RETRIES} attempts`,
									errors: validation.errors,
									warnings: validation.warnings,
									content: fullContent,
									xmlContent: xmlContent
								})}\n\n`)
							);
							controller.close();
							return;
						}
					}
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Stream error';
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({
						type: 'error',
						message: errorMessage
					})}\n\n`)
				);
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

/**
 * Standard JSON response generation (non-streaming) with validation and retry
 */
async function generateModule(body: GenerateRequest, apiKey: string) {
	const MAX_RETRIES = 3;
	let lastError: string[] = [];

	try {
		// Initialize client (non-streaming)
		let model = createChatClient({ apiKey });

		// Conditionally add web search capability
		if (body.enableResearch) {
			model = withWebSearch(model);
		}

		// Retry loop for validation
		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			console.log(`Generation attempt ${attempt}/${MAX_RETRIES}`);

			// Build the prompt (include validation errors if retrying)
			const prompt = buildGenerationPrompt(body, attempt > 1 ? lastError : undefined);

			const messages = [
				new SystemMessage('You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.'),
				new HumanMessage(prompt)
			];

			// Invoke the model
			const response = await model.invoke(messages);

			// Extract text content (filters out citations and other metadata)
			const textContent = extractTextContent(response.content);

			// Debug logging
			console.log(`Response length: ${textContent.length} characters`);
			console.log(`Response starts with: ${textContent.substring(0, 100)}`);
			console.log(`Response ends with: ${textContent.substring(textContent.length - 100)}`);

			// Extract XML from the clean text
			const xmlContent = extractModuleXML(textContent);

			if (!xmlContent) {
				console.warn('Failed to extract valid XML from response.');
				console.warn('Response length:', textContent.length, 'characters');
				console.warn('First 500 chars:', textContent.substring(0, 500));
				console.warn('Last 500 chars:', textContent.substring(Math.max(0, textContent.length - 500)));

				lastError = [
					'Failed to extract valid XML from response.',
					`Response length: ${textContent.length} characters`,
					'Ensure output is complete with closing </Module> tag.'
				];

				if (attempt < MAX_RETRIES) {
					continue; // Retry
				} else {
					// Last attempt failed
					return json({
						success: false,
						message: 'Failed to generate valid XML after all retry attempts',
						content: textContent,
						xmlContent: null,
						hasValidXML: false,
						validationErrors: lastError,
						attempts: attempt,
						metadata: {
							modelUsed: "claude-sonnet-4-5-20250929",
							timestamp: new Date().toISOString(),
							enableResearch: body.enableResearch ?? false,
							useExtendedThinking: body.useExtendedThinking ?? false
						}
					});
				}
			}

			// Validate the XML against schema
			console.log('Validating XML against schema...');
			const validation = validateModuleXML(xmlContent);

			if (validation.valid) {
				// Success! Return the valid XML
				console.log('Validation passed');
				return json({
					success: true,
					message: 'Module generated successfully',
					content: textContent, // Full text response (citations filtered out)
					xmlContent: xmlContent, // Extracted and validated XML
					hasValidXML: true,
					validationErrors: [],
					validationWarnings: validation.warnings,
					attempts: attempt,
					metadata: {
						modelUsed: "claude-sonnet-4-5-20250929",
						timestamp: new Date().toISOString(),
						enableResearch: body.enableResearch ?? false,
						useExtendedThinking: body.useExtendedThinking ?? false
					}
				});
			} else {
				// Validation failed
				console.warn(`Validation failed on attempt ${attempt}:`, validation.errors);
				lastError = validation.errors;

				if (attempt < MAX_RETRIES) {
					// Retry with validation errors
					continue;
				} else {
					// All retries exhausted
					return json({
						success: false,
						message: `Schema validation failed after ${MAX_RETRIES} attempts`,
						content: textContent,
						xmlContent: xmlContent,
						hasValidXML: false,
						validationErrors: validation.errors,
						validationWarnings: validation.warnings,
						attempts: attempt,
						metadata: {
							modelUsed: "claude-sonnet-4-5-20250929",
							timestamp: new Date().toISOString(),
							enableResearch: body.enableResearch ?? false,
							useExtendedThinking: body.useExtendedThinking ?? false
						}
					});
				}
			}
		}

		// Should not reach here, but just in case
		throw new Error('Unexpected end of retry loop');
	} catch (err) {
		console.error('Generation error:', err);
		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate module'
		});
	}
}
