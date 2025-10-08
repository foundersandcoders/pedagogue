import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * API endpoint for generating module content using Claude + LangChain
 * Supports SSE streaming for progress updates during generation
 */

interface GenerateRequest {
	arcData?: any;
	nextStepData?: any;
	structuredInput?: Record<string, any>;
	enableResearch?: boolean;
	useExtendedThinking?: boolean;
}

export const POST: RequestHandler = async ({ request }) => {
	// Validate environment setup
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw error(500, {
			message: 'ANTHROPIC_API_KEY not configured. Set this in your environment variables.'
		});
	}

	try {
		// Parse incoming request
		const body: GenerateRequest = await request.json();

		// Validate required inputs
		if (!body.arcData || !body.nextStepData) {
			throw error(400, {
				message: 'Missing required data. Both arcData and nextStepData are required.'
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
 */
function createSSEStream(body: GenerateRequest, apiKey: string) {
	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			try {
				// Send initial connection confirmation
				controller.enqueue(
					encoder.encode('data: {"type":"connected","message":"Generation started"}\n\n')
				);

				// TODO: Implement LangChain streaming here
				// This will be added in subtask 2

				// Placeholder for now
				controller.enqueue(
					encoder.encode('data: {"type":"progress","message":"Analyzing input files..."}\n\n')
				);

				await new Promise(resolve => setTimeout(resolve, 1000));

				controller.enqueue(
					encoder.encode('data: {"type":"progress","message":"Preparing generation..."}\n\n')
				);

				// Final message
				controller.enqueue(
					encoder.encode('data: {"type":"complete","message":"Ready for implementation"}\n\n')
				);

				controller.close();

			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Stream error';
				controller.enqueue(
					encoder.encode(`data: {"type":"error","message":"${errorMessage}"}\n\n`)
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
 * Standard JSON response generation (non-streaming)
 */
async function generateModule(body: GenerateRequest, apiKey: string) {
	// TODO: Implement LangChain generation here
	// This will be added in subtask 2

	return json({
		success: true,
		message: 'API route is ready. LangChain integration coming next.',
		receivedData: {
			hasArcData: !!body.arcData,
			hasNextStepData: !!body.nextStepData,
			hasStructuredInput: !!body.structuredInput,
			enableResearch: body.enableResearch ?? false,
			useExtendedThinking: body.useExtendedThinking ?? false
		}
	});
}
