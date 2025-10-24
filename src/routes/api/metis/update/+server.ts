import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from '$types';
import { GenerateRequestSchema, formatZodError, type GenerateRequest } from '$lib/schemas/apiValidator'
import { createChatClient, createStreamingClient, withWebSearch } from '$lib/factories/agents/agentClientFactory';
import { createSSEStream } from '$lib/utils/model/sseHandler';
import { withRetry } from '$lib/utils/model/retryHandler';

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
			// Create streaming client with optional web search
			// Extended timeout for research-heavy tasks (5min with research, 2min without)
			const timeout = body.enableResearch ? 300000 : 120000;
			const model = createStreamingClient({
				apiKey,
				enableResearch: body.enableResearch,
				timeout
			});

			// Return SSE stream for progress updates
			return createSSEStream({ body, model });
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
 * Standard JSON response generation (non-streaming) with validation and retry
 */
async function generateModule(body: GenerateRequest, apiKey: string) {
	try {
		// Initialize client (non-streaming) with extended timeout
		// Research-enabled requests can take 3-5 minutes with multiple tool calls
		const timeout = body.enableResearch ? 300000 : 120000; // 5min with research, 2min without
		let model = createChatClient({ apiKey, timeout });

		// Conditionally add web search capability
		if (body.enableResearch) {
			model = withWebSearch(model);
		}

		// Execute generation with retry logic
		const result = await withRetry({
			body,
			model,
			maxRetries: 3
		});

		// Build response based on result
		const responseData = {
			success: result.success,
			message: result.success
				? 'Module generated successfully'
				: `Schema validation failed after ${result.attempt} attempts`,
			content: result.fullContent,
			xmlContent: result.xmlContent,
			hasValidXML: result.success,
			validationErrors: result.validationErrors,
			validationWarnings: result.validationWarnings,
			attempts: result.attempt,
			metadata: {
				modelUsed: "claude-sonnet-4-5-20250929",
				timestamp: new Date().toISOString(),
				enableResearch: body.enableResearch ?? false,
				useExtendedThinking: body.useExtendedThinking ?? false
			}
		};

		return json(responseData);
	} catch (err) {
		console.error('Generation error:', err);
		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate module'
		});
	}
}
