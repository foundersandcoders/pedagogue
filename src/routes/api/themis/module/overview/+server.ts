import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { formatZodError } from '$lib/schemas/apiValidator';
import { createChatClient } from '$lib/factories/agents/agentClientFactory';
import { buildModuleOverviewPrompt } from '$lib/factories/prompts/metisPromptFactory';
import type { ModuleSlot, ModuleOverview } from '$lib/types/themis';

/**
 * Request schema for module overview generation
 */
const OverviewRequestSchema = z.object({
	moduleSlot: z.object({
		id: z.string(),
		arcId: z.string(),
		order: z.number(),
		titleInput: z.union([
			z.object({ type: z.literal('undefined') }),
			z.object({ type: z.literal('prompt'), value: z.string() }),
			z.object({ type: z.literal('literal'), value: z.string() })
		]),
		title: z.string(),
		description: z.string(),
		themeInput: z.union([
			z.object({ type: z.literal('undefined') }),
			z.object({ type: z.literal('prompt'), value: z.string() }),
			z.object({ type: z.literal('literal'), value: z.string() })
		]).optional(),
		theme: z.string().optional(),
		durationWeeks: z.number(),
		status: z.enum(['planned', 'generating', 'complete', 'error'])
	}),
	courseContext: z.object({
		title: z.string(),
		courseNarrative: z.string(),
		arcNarrative: z.string(),
		precedingModules: z.array(z.any()) // ModuleSlot array
	})
});

type OverviewRequest = z.infer<typeof OverviewRequestSchema>;

/**
 * API endpoint for lightweight module overview generation
 *
 * Generates module overviews (learning objectives, prerequisites, key concepts)
 * before full module generation. This enables:
 * - Faster iteration on course structure
 * - Better context building for subsequent modules
 * - Preview of module content before committing to full generation
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
		// Parse and validate incoming request
		const rawBody = await request.json();
		const validation = OverviewRequestSchema.safeParse(rawBody);

		if (!validation.success) {
			throw error(400, {
				message: 'Invalid request data: ' + formatZodError(validation.error).join(', ')
			});
		}

		const body = validation.data;

		// Generate overview with retries
		const maxRetries = 3;
		let lastError: Error | null = null;
		let validationErrors: string[] = [];

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				console.log(`Generating module overview (attempt ${attempt}/${maxRetries})...`);

				// Build prompt
				const prompt = buildModuleOverviewPrompt(
					body.moduleSlot as ModuleSlot,
					body.courseContext,
					validationErrors.length > 0 ? validationErrors : undefined
				);

				// Create Claude client with shorter timeout (overview is much faster)
				const client = createChatClient({ apiKey, timeout: 60000 });

				// Generate overview
				const response = await client.messages.create({
					model: 'claude-sonnet-4-20250514',
					max_tokens: 4096,
					temperature: 1,
					messages: [
						{
							role: 'user',
							content: prompt
						}
					]
				});

				// Extract JSON from response
				const content = response.content[0];
				if (content.type !== 'text') {
					throw new Error('Unexpected response type from Claude');
				}

				// Parse JSON response
				const jsonMatch = content.text.match(/\{[\s\S]*\}/);
				if (!jsonMatch) {
					throw new Error('No JSON object found in response');
				}

				const overview = JSON.parse(jsonMatch[0]);

				// Validate overview structure
				const validationResult = validateOverview(overview);
				if (!validationResult.valid) {
					validationErrors = validationResult.errors;
					throw new Error(`Invalid overview: ${validationErrors.join(', ')}`);
				}

				// Success - return overview with generated timestamp
				return json({
					success: true,
					overview: {
						...overview,
						generatedAt: new Date().toISOString()
					}
				});

			} catch (err) {
				lastError = err as Error;
				console.error(`Attempt ${attempt} failed:`, err);

				if (attempt < maxRetries) {
					console.log('Retrying...');
					continue;
				}
			}
		}

		// All retries failed
		throw error(500, {
			message: `Failed to generate overview after ${maxRetries} attempts: ${lastError?.message}`
		});

	} catch (err) {
		console.error('Module overview generation error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate module overview'
		});
	}
};

/**
 * Validate generated overview structure
 */
function validateOverview(overview: any): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check required fields
	if (!overview.learningObjectives || !Array.isArray(overview.learningObjectives)) {
		errors.push('learningObjectives must be an array');
	} else if (overview.learningObjectives.length < 3 || overview.learningObjectives.length > 5) {
		errors.push('learningObjectives must contain 3-5 items');
	}

	if (!overview.prerequisites || !Array.isArray(overview.prerequisites)) {
		errors.push('prerequisites must be an array');
	} else if (overview.prerequisites.length === 0) {
		errors.push('prerequisites must contain at least 1 item');
	}

	if (!overview.keyConceptsIntroduced || !Array.isArray(overview.keyConceptsIntroduced)) {
		errors.push('keyConceptsIntroduced must be an array');
	} else if (overview.keyConceptsIntroduced.length < 3 || overview.keyConceptsIntroduced.length > 5) {
		errors.push('keyConceptsIntroduced must contain 3-5 items');
	}

	// Check that all arrays contain strings
	const checkStringArray = (arr: any[], name: string) => {
		if (arr.some(item => typeof item !== 'string' || item.trim().length === 0)) {
			errors.push(`${name} must contain non-empty strings`);
		}
	};

	if (Array.isArray(overview.learningObjectives)) {
		checkStringArray(overview.learningObjectives, 'learningObjectives');
	}
	if (Array.isArray(overview.prerequisites)) {
		checkStringArray(overview.prerequisites, 'prerequisites');
	}
	if (Array.isArray(overview.keyConceptsIntroduced)) {
		checkStringArray(overview.keyConceptsIntroduced, 'keyConceptsIntroduced');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
