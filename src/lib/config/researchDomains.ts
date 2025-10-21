/**
 * Trusted Research Domains Configuration
 *
 * Allowlist of domains for Claude's web search tool during module and course generation.
 * Used to ensure research sources are reputable and relevant to AI engineering education.
 */

export const AI_RESEARCH_DOMAINS = [
	// AI Platforms
	'anthropic.com',
	'claude.ai',
	'openai.com',
	'deepmind.google',
	'ai.google',
	'microsoft.com',
	'huggingface.co/blog',
	// Docs
	'js.langchain.com',
	'python.langchain.com',
	'modelcontextprotocol.io',
	'docs.python.org',
	// Resources (Software Dev)
	'dev.to',
	'github.com',
	'medium.com',
	'python.org',
	// News & Analysis
	'techcrunch.com',
	'thenextweb.com',
	'venturebeat.com',
	// Blogs & Newsletters
	'deepgains.substack.com',
	'newsletter.pragmaticengineer.com',
	"simonwillison.net",
	'sundeepteki.org/blog',
	'writer.com/engineering',
	'abnormal.ai/blog/category/engineering',
	// Communities
	'stackoverflow.com',
	'news.ycombinator.com',
	// Academic & Research
	'arxiv.org',
	'acm.org',
	'ieee.org',
] as const;
