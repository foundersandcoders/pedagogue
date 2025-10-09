import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * API endpoint for generating module content using Claude + LangChain
 * Supports SSE streaming for progress updates during generation
 */

interface GenerateRequest {
	projectData?: any;
	pythonData?: any;
	researchData?: any;
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
		if (!body.projectData || !body.pythonData || !body.researchData) {
			throw error(400, {
				message: 'Missing required data. projectData, pythonData, and researchData are all required.'
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
 * Build the generation prompt from input data
 */
function buildGenerationPrompt(body: GenerateRequest): string {
	const projectInfo = JSON.stringify(body.projectData, null, 2);
	const pythonInfo = JSON.stringify(body.pythonData, null, 2);
	const researchInfo = JSON.stringify(body.researchData, null, 2);
	const structuredInfo = body.structuredInput ? JSON.stringify(body.structuredInput, null, 2) : 'None provided';

	const researchInstructions = body.enableResearch
		? `
  RESEARCH INSTRUCTIONS:
  You have access to web search to find current, relevant information about:
  - Latest best practices and trends for the technologies mentioned
  - Current industry standards and tooling
  - Recent developments in AI and software development
  - Real-world examples and case studies

  Use web search to ensure the curriculum is up-to-date and reflects current industry practice.
  Focus on reputable sources: vendor documentation, established tech publications, and academic sources.`
		: '';

	return `You are an expert curriculum designer for peer-led coding courses. Generate a comprehensive module specification based on the provided context.

  INPUT DATA:

  Project Context:
  ${projectInfo}

  Python Recommendations:
  ${pythonInfo}

  Research Topics:
  ${researchInfo}

  Structured Input:
  ${structuredInfo}

  Research Enabled: ${body.enableResearch ? 'Yes - Use web search to find current information' : 'No'}
  Extended Thinking: ${body.useExtendedThinking ? 'Yes' : 'No'}
  ${researchInstructions}

  TASK:
  Generate a detailed module specification in XML format that:
  1. Synthesizes the project requirements with Python skills and research topics
  2. Creates clear learning objectives
  3. Defines practical project ideas based on the briefs provided
  4. Includes relevant technical details
  5. Maintains alignment with peer-led teaching philosophy
  ${body.enableResearch ? '6. Incorporates current best practices and trends discovered through web research' : ''}
  
  OUTPUT FORMAT:
  Return valid XML with the following structure:
  <module>
    <overview>Compelling overview of the module</overview>
    <objectives>
      <objective>Clear, actionable learning objective</objective>
      <!-- More objectives -->
    </objectives>
    <projects>
      <project>
        <name>Project name</name>
        <description>Project description</description>
      </project>
      <!-- More projects -->
    </projects>
    <technical-requirements>
      <requirement>Specific technical requirement</requirement>
      <!-- More requirements -->
    </technical-requirements>
    <notes>Additional pedagogical notes</notes>
  </module>`;
}

/**
 * Reputable domains for AI technology research
 * Note: Some major news sites (BBC, Reuters, The Verge, Wired, Ars Technica)
 * block Anthropic's crawler, so they're excluded from this list
 */
const AI_RESEARCH_DOMAINS = [
	// AI Vendors
	'anthropic.com',
	'claude.ai',
	'openai.com',
	'deepmind.google',
	'ai.google',
	'microsoft.com',
	// Tech News & Analysis
	'techcrunch.com',
	'venturebeat.com',
	'thenextweb.com',
	// Developer Resources
	'github.com',
	'stackoverflow.com',
	'medium.com',
	'dev.to',
	'docs.python.org',
	'python.org',
	// LangChain Docs
	'js.langchain.com',
	'python.langchain.com',
	// Academic & Research
	'arxiv.org',
	'acm.org',
	'ieee.org'
];

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

				// Initialize LangChain ChatAnthropic with streaming
				let model = new ChatAnthropic({
					anthropicApiKey: apiKey,
					modelName: 'claude-3-5-sonnet-20241022',
					temperature: 0.7,
					streaming: true
				});

				// Conditionally add web search capability
				if (body.enableResearch) {
					controller.enqueue(
						encoder.encode('data: {"type":"progress","message":"Enabling deep research with web search..."}\n\n')
					);

					model = model.bindTools([{
						type: 'web_search_20250305',
						name: 'web_search',
						max_uses: 5,
						allowed_domains: AI_RESEARCH_DOMAINS
					}]);
				}

				controller.enqueue(
					encoder.encode('data: {"type":"progress","message":"Analyzing input files..."}\n\n')
				);

				// Build the prompt
				const prompt = buildGenerationPrompt(body);

				const messages = [
					new SystemMessage('You are an expert curriculum designer. Generate high-quality educational content.'),
					new HumanMessage(prompt)
				];

				controller.enqueue(
					encoder.encode('data: {"type":"progress","message":"Generating module content with Claude..."}\n\n')
				);

				let fullContent = '';

				// Stream the response
				const stream = await model.stream(messages);

				for await (const chunk of stream) {
					const content = chunk.content;
					if (typeof content === 'string' && content) {
						fullContent += content;
						// Send chunks of content as they arrive
						const progressData = {
							type: 'content',
							chunk: content,
							message: 'Streaming content...'
						};
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
						);
					}
				}

				// Send completion message with full content
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({
						type: 'complete',
						message: 'Generation complete',
						content: fullContent
					})}\n\n`)
				);

				controller.close();

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
 * Standard JSON response generation (non-streaming)
 */
async function generateModule(body: GenerateRequest, apiKey: string) {
	try {
		// Initialize LangChain ChatAnthropic (non-streaming)
		let model = new ChatAnthropic({
			anthropicApiKey: apiKey,
			modelName: 'claude-3-5-sonnet-20241022',
			temperature: 0.7
		});

		// Conditionally add web search capability
		if (body.enableResearch) {
			model = model.bindTools([{
				type: 'web_search_20250305',
				name: 'web_search',
				max_uses: 5,
				allowed_domains: AI_RESEARCH_DOMAINS
			}]);
		}

		// Build the prompt
		const prompt = buildGenerationPrompt(body);

		const messages = [
			new SystemMessage('You are an expert curriculum designer. Generate high-quality educational content.'),
			new HumanMessage(prompt)
		];

		// Invoke the model
		const response = await model.invoke(messages);

		// Extract content
		const content = typeof response.content === 'string'
			? response.content
			: JSON.stringify(response.content);

		return json({
			success: true,
			message: 'Module generated successfully',
			content: content,
			metadata: {
				modelUsed: 'claude-3-5-sonnet-20241022',
				timestamp: new Date().toISOString(),
				enableResearch: body.enableResearch ?? false,
				useExtendedThinking: body.useExtendedThinking ?? false
			}
		});

	} catch (err) {
		console.error('Generation error:', err);
		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to generate module'
		});
	}
}
