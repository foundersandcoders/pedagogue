import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { CourseStructureGenerationResponse } from '$lib/types/course';
import {
	CourseStructureGenerationRequestSchema,
	formatZodError,
	type CourseStructureGenerationRequest
} from '$lib/validation/api-schemas.js';
import { createChatClient, withWebSearch } from '$lib/generation/ai/client-factory.js';
import { extractTextContent, parseCourseStructureResponse } from '$lib/generation/ai/response-parser.js';
import { buildCourseStructurePrompt } from '$lib/generation/prompts/course-prompt-builder.js';

/**
 * API endpoint for generating course structure with AI-enhanced module details
 * Takes high-level course parameters and module skeleton, returns detailed structure
 */

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw error(500, {
			message: 'ANTHROPIC_API_KEY not configured'
		});
	}

	try {
		// Parse and validate incoming request with Zod
		const rawBody = await request.json();
		const validation = CourseStructureGenerationRequestSchema.safeParse(rawBody);

		if (!validation.success) {
			throw error(400, {
				message: 'Invalid request data: ' + formatZodError(validation.error).join(', ')
			});
		}

		const body = validation.data;

		// Build prompt for course structure generation
		const prompt = buildCourseStructurePrompt(body);

		// Initialize client
		let model = createChatClient({ apiKey });

		// Add web search if enabled
		if (body.enableResearch) {
			console.log('Enabling web research with trusted domains...');
			model = withWebSearch(model);
		}

		const messages = [
			new SystemMessage('You are an expert curriculum designer specializing in peer-led technical education.'),
			new HumanMessage(prompt)
		];

		console.log('Generating course structure...');
		const response = await model.invoke(messages);

		// Extract text content from response
		const responseText = extractTextContent(response.content);

		console.log('Course structure generated, parsing response...');

		// Extract structured data from response
		const result = parseCourseStructureResponse(responseText);

		return json(result);

	} catch (err) {
		console.error('Course structure generation error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate course structure'
		});
	}
};
