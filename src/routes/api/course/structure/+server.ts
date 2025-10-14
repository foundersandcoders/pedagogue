import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { CourseStructureGenerationRequest, CourseStructureGenerationResponse } from '$lib/types/course';

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
		const body: CourseStructureGenerationRequest = await request.json();

		// Validate input
		if (!body.title || !body.description) {
			throw error(400, { message: 'Course title and description are required' });
		}

		// Build prompt for course structure generation
		const prompt = buildCourseStructurePrompt(body);

		// Initialize Claude
		const model = new ChatAnthropic({
			anthropicApiKey: apiKey,
			modelName: 'claude-sonnet-4-5-20250929',
			temperature: 0.7,
			maxTokens: 8192
		});

		// Add web search if enabled
		if (body.enableResearch) {
			model.bindTools([{
				type: 'web_search_20250305',
				name: 'web_search',
				max_uses: 3
			}]);
		}

		const messages = [
			new SystemMessage('You are an expert curriculum designer specializing in peer-led technical education.'),
			new HumanMessage(prompt)
		];

		console.log('Generating course structure...');
		const response = await model.invoke(messages);

		// Parse response
		const responseText = typeof response.content === 'string'
			? response.content
			: Array.isArray(response.content)
				? response.content.filter(block => block.type === 'text').map(block => block.text).join('')
				: String(response.content);

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

function buildCourseStructurePrompt(data: CourseStructureGenerationRequest): string {
	const supportingDocs = data.supportingDocuments && data.supportingDocuments.length > 0
		? `\n\n<SupportingDocuments>\n${data.supportingDocuments.join('\n\n')}\n</SupportingDocuments>`
		: '';

	return `<Task>
You are designing a course structure for a ${data.structure} ${data.totalWeeks}-week course.

<CourseDetails>
<Title>${data.title}</Title>
<Description>${data.description}</Description>
<Duration>${data.totalWeeks} weeks, ${data.daysPerWeek} day(s) per week</Duration>
<CohortSize>${data.cohortSize} learners</CohortSize>
<Structure>${data.structure}</Structure>
<LearnerExperience>
  - Related field experience: ${data.learnerExperience.prereq}
  - Course focus experience: ${data.learnerExperience.focus}
</LearnerExperience>
</CourseDetails>
${supportingDocs}

<Instructions>
1. Generate a cohesive course narrative that explains the overall learning journey
2. For EACH module provided below, generate:
   - Refined title (improve if needed, keep if good)
   - Rich description of what learners will focus on
   - 3-5 specific, measurable learning objectives
   - 4-6 key topics that will be covered
3. Ensure modules build on each other progressively
4. Consider the ${data.structure} teaching structure in your recommendations
5. Match content complexity to the learners' experience levels

<Modules>
${data.totalWeeks} weeks divided into modules (details to be determined)
</Modules>

Format your response as a JSON object with this structure:
{
  "courseNarrative": "2-3 paragraph narrative describing the overall course journey and progression",
  "modules": [
    {
      "order": 1,
      "title": "Module title",
      "description": "2-3 sentence description",
      "suggestedDurationWeeks": number,
      "learningObjectives": ["objective 1", "objective 2", ...],
      "keyTopics": ["topic 1", "topic 2", ...]
    }
  ],
  "progressionNarrative": "1-2 paragraphs explaining how modules connect and build on each other"
}

Think carefully about creating a logical, engaging progression that takes learners from their current level to meaningful competence in the course focus area.
</Instructions>
</Task>`;
}

function parseCourseStructureResponse(responseText: string): CourseStructureGenerationResponse {
	try {
		// Try to extract JSON from the response
		const jsonMatch = responseText.match(/\{[\s\S]*\}/);

		if (!jsonMatch) {
			throw new Error('No JSON found in response');
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Validate structure
		if (!parsed.modules || !Array.isArray(parsed.modules)) {
			throw new Error('Invalid response structure: missing modules array');
		}

		return {
			success: true,
			courseNarrative: parsed.courseNarrative || '',
			modules: parsed.modules.map((m: any, index: number) => ({
				order: m.order || index + 1,
				title: m.title || `Module ${index + 1}`,
				description: m.description || '',
				suggestedDurationWeeks: m.suggestedDurationWeeks || 1,
				learningObjectives: Array.isArray(m.learningObjectives) ? m.learningObjectives : [],
				keyTopics: Array.isArray(m.keyTopics) ? m.keyTopics : []
			})),
			progressionNarrative: parsed.progressionNarrative || ''
		};

	} catch (err) {
		console.error('Failed to parse course structure response:', err);

		return {
			success: false,
			errors: ['Failed to parse AI response. Please try again.'],
			modules: []
		};
	}
}
