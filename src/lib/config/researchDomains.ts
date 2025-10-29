/**
 * Trusted Research Domains Configuration
 *
 * Structured allowlist of domains for Claude's web search tool during module and course generation.
 * Used to ensure research sources are reputable and relevant to AI engineering education.
 */

import type { DomainList, Domain } from '$lib/types/config';

/**
 * AI Engineering research domain list
 * Organized by category for maintainability
 */
export const AI_RESEARCH_DOMAINS: DomainList = {
	id: 'ai-engineering',
	name: 'AI Engineering',
	type: 'allow',
	categories: [
		{
			name: 'AI Platforms',
			sources: [
				{ name: 'Anthropic', url: 'anthropic.com' },
				{ name: 'Claude', url: 'claude.ai' },
				{ name: 'OpenAI', url: 'openai.com' },
				{ name: 'Google DeepMind', url: 'deepmind.google' },
				{ name: 'Google AI', url: 'ai.google' },
				{ name: 'Microsoft', url: 'microsoft.com' },
				{ name: 'Hugging Face Blog', url: 'huggingface.co/blog' }
			]
		},
		{
			name: 'Documentation',
			sources: [
				{ name: 'LangChain (JavaScript)', url: 'js.langchain.com' },
				{ name: 'LangChain (Python)', url: 'python.langchain.com' },
				{ name: 'Model Context Protocol', url: 'modelcontextprotocol.io' },
				{ name: 'Python Docs', url: 'docs.python.org' }
			]
		},
		{
			name: 'Developer Resources',
			sources: [
				{ name: 'Dev.to', url: 'dev.to' },
				{ name: 'GitHub', url: 'github.com' },
				{ name: 'Medium', url: 'medium.com' },
				{ name: 'Python.org', url: 'python.org' }
			]
		},
		{
			name: 'News & Analysis',
			sources: [
				{ name: 'TechCrunch', url: 'techcrunch.com' },
				{ name: 'The Next Web', url: 'thenextweb.com' },
				{ name: 'VentureBeat', url: 'venturebeat.com' }
			]
		},
		{
			name: 'Blogs & Newsletters',
			sources: [
				{ name: 'Deep Gains', url: 'deepgains.substack.com' },
				{ name: 'Pragmatic Engineer', url: 'newsletter.pragmaticengineer.com' },
				{ name: 'Simon Willison', url: 'simonwillison.net' },
				{ name: 'Sundeep Teki', url: 'sundeepteki.org/blog' },
				{ name: 'Writer Engineering', url: 'writer.com/engineering' },
				{ name: 'Abnormal Security Engineering', url: 'abnormal.ai/blog/category/engineering' }
			]
		},
		{
			name: 'Communities',
			sources: [
				{ name: 'Stack Overflow', url: 'stackoverflow.com' },
				{ name: 'Hacker News', url: 'news.ycombinator.com' }
			]
		},
		{
			name: 'Academic & Research',
			sources: [
				{ name: 'arXiv', url: 'arxiv.org' },
				{ name: 'Association for Computing Machinery', url: 'acm.org' },
				{ name: 'IEEE', url: 'ieee.org' }
			]
		}
	]
};

/**
 * Flattened array of all AI Engineering domains
 * Provides backward compatibility with existing code
 */
export const AI_RESEARCH_DOMAINS_FLAT: readonly string[] = extractDomainUrls(AI_RESEARCH_DOMAINS);

/**
 * Helper function to extract all domain URLs from a DomainList
 *
 * @param domainList - Structured domain list
 * @returns Flat array of domain URLs
 *
 * @example
 * const urls = extractDomainUrls(AI_RESEARCH_DOMAINS);
 * // ['anthropic.com', 'claude.ai', ...]
 */
export function extractDomainUrls(domainList: DomainList): readonly string[] {
	return domainList.categories
		.flatMap(category => category.sources)
		.map(source => source.url);
}

/**
 * Get domain list by ID
 *
 * @param id - Domain list identifier
 * @returns Domain list or undefined if not found
 *
 * @example
 * const list = getDomainListById('ai-engineering');
 */
export function getDomainListById(id: string): DomainList | undefined {
	// Currently only one list, but extensible for future lists
	if (id === 'ai-engineering') {
		return AI_RESEARCH_DOMAINS;
	}
	return undefined;
}

/**
 * Get all available domain lists
 *
 * @returns Array of all domain lists
 */
export function getAllDomainLists(): DomainList[] {
	return [AI_RESEARCH_DOMAINS];
}
