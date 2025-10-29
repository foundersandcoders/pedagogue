import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import {
	ModuleGenerationRequestSchema,
	formatZodError,
	type ModuleGenerationRequest
} from '$lib/schemas/apiValidator';
import { createStreamingClient, withWebSearch } from '$lib/factories/agents/agentClientFactory';
import { createSSEStream } from '$lib/utils/model/sseHandler';
import { buildCourseAwareModulePrompt } from '$lib/factories/prompts/metisPromptFactory';
import { escapeXml, escapeXmlArray } from '$lib/utils/xml/xmlEscape';
import { getDomains } from '$lib/utils/research/domainResolver';

/**
 * API endpoint for course-aware module generation
 *
 * Generates individual module content with course context, using the same
 * generation logic as Metis but enhanced with course narratives and progression.
 *
 * Supports SSE streaming for real-time progress updates.
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
		const validation = ModuleGenerationRequestSchema.safeParse(rawBody);

		if (!validation.success) {
			throw error(400, {
				message: 'Invalid request data: ' + formatZodError(validation.error).join(', ')
			});
		}

		const body = validation.data;

		// Check if client accepts streaming
		const acceptHeader = request.headers.get('accept');
		const supportsSSE = acceptHeader?.includes('text/event-stream');

		if (supportsSSE) {
			// Create streaming client with optional web search
			// Extended timeout for research-heavy tasks (5min with research, 2min without)
			const timeout = body.enableResearch ? 300000 : 120000;
			let model = createStreamingClient({ apiKey, timeout });

			// Add web search if enabled
			if (body.enableResearch) {
				console.log('Enabling web research for course module generation...');
				model = withWebSearch(model);
			}

			// Convert to Metis format
			const metisBody = convertToMetisFormat(body);

			// Return SSE stream with course-aware generation
			return createSSEStream({
				body: metisBody,
				model,
				maxRetries: 3,
				promptBuilder: (requestBody, validationErrors) => {
					return buildCourseAwareModulePrompt(
						requestBody,
						body.courseContext,
						validationErrors
					);
				}
			});

		} else {
			// Non-streaming fallback (simple JSON response)
			throw error(400, {
				message: 'This endpoint requires SSE support. Please set Accept: text/event-stream header.'
			});
		}

	} catch (err) {
		console.error('Course module generation error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate module'
		});
	}
};

/**
 * Convert Themis module generation request to Metis-compatible format
 *
 * This allows reuse of existing Metis generation logic while adding course context.
 * Creates synthetic XML data from the module slot and course context.
 */
function convertToMetisFormat(request: ModuleGenerationRequest): any {
	const { moduleSlot, courseContext } = request;

	// Escape all user-provided data to prevent XML injection
	const escapedModuleTitle = escapeXml(moduleSlot.title);
	const escapedModuleDescription = escapeXml(moduleSlot.description);
	const escapedObjectives = escapeXmlArray(moduleSlot.learningObjectives);
	const escapedTopics = escapeXmlArray(moduleSlot.keyTopics);

	const escapedCourseTitle = escapeXml(courseContext.title);
	const escapedCourseNarrative = escapeXml(courseContext.courseNarrative);
	const escapedProgressionNarrative = escapeXml(courseContext.progressionNarrative);
	const escapedArcNarrative = escapeXml(courseContext.arcNarrative);
	const escapedArcProgression = escapeXml(courseContext.arcProgression);
	const escapedPrecedingModules = escapeXmlArray(courseContext.precedingModules);

	// Create synthetic projects XML from module objectives
	const projectsXML = `<?xml version="1.0" encoding="UTF-8"?>
<Projects>
	<Project name="${escapedModuleTitle}">
		<Description>${escapedModuleDescription}</Description>
		${escapedObjectives.map((obj, i) =>
			`<Objective order="${i + 1}">${obj}</Objective>`
		).join('\n\t\t')}
	</Project>
</Projects>`;

	// Create synthetic skills XML from module topics
	const skillsXML = `<?xml version="1.0" encoding="UTF-8"?>
<Skills>
	${escapedTopics.map((topic, i) =>
		`<Skill order="${i + 1}">
		<Name>${topic}</Name>
		<Description>Key topic for ${escapedModuleTitle}</Description>
	</Skill>`
	).join('\n\t')}
</Skills>`;

	// Create synthetic research XML with course context
	const researchXML = `<?xml version="1.0" encoding="UTF-8"?>
<Research>
	<CourseContext>
		<CourseTitle>${escapedCourseTitle}</CourseTitle>
		<CourseNarrative>${escapedCourseNarrative}</CourseNarrative>
		<ProgressionNarrative>${escapedProgressionNarrative}</ProgressionNarrative>
	</CourseContext>
	<ArcContext>
		<ArcNarrative>${escapedArcNarrative}</ArcNarrative>
		<ArcProgression>${escapedArcProgression}</ArcProgression>
	</ArcContext>
	${escapedPrecedingModules.length > 0 ? `
	<PrecedingModules>
		${escapedPrecedingModules.map((title, i) =>
			`<Module order="${i + 1}">${title}</Module>`
		).join('\n\t\t')}
	</PrecedingModules>` : ''}
	<Topic>${escapedModuleTitle}</Topic>
	<Focus>${escapedModuleDescription}</Focus>
</Research>`;

	return {
		projectsData: projectsXML,
		skillsData: skillsXML,
		researchData: researchXML,
		structuredInput: {
			logistics: {
				duration: moduleSlot.durationWeeks,
				startDate: undefined
			},
			learners: {
				cohortSize: 12, // Default from course
				experience: {
					prereq: '1-3 years',
					focus: 'limited experience'
				}
			},
			content: {
				techs: moduleSlot.keyTopics || [],
				info: `Module ${moduleSlot.order} in course: ${courseContext.title}`
			},
			model: {
				enableResearch: request.enableResearch || true,
				useExtendedThinking: false
			}
		},
		enableResearch: request.enableResearch || true,
		useExtendedThinking: false
	};
}
