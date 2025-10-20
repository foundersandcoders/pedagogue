/**
 * AI Client Factory
 *
 * Centralizes ChatAnthropic client configuration and creation.
 * Provides consistent model settings across module and course generation.
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { AI_RESEARCH_DOMAINS } from '$lib/config/research-domains.js';

export interface ChatClientOptions {
	apiKey: string;
	temperature?: number;
	maxTokens?: number;
	timeout?: number;
	streaming?: boolean;
}

/**
 * Default model configuration for all generation tasks
 */
export const DEFAULT_MODEL_CONFIG = {
	modelName: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5
	temperature: 0.7,
	maxTokens: 16384, // Sonnet 4.5 supports up to 64K output tokens
	timeout: 120000 // 2 minute timeout
} as const;

/**
 * Create a configured ChatAnthropic client
 *
 * @example
 * const client = createChatClient({ apiKey: env.ANTHROPIC_API_KEY });
 */
export function createChatClient(options: ChatClientOptions): ChatAnthropic {
	return new ChatAnthropic({
		anthropicApiKey: options.apiKey,
		modelName: DEFAULT_MODEL_CONFIG.modelName,
		temperature: options.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
		maxTokens: options.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
		timeout: options.timeout ?? DEFAULT_MODEL_CONFIG.timeout,
		streaming: options.streaming ?? false
	});
}

/**
 * Bind web search tool to an existing client
 *
 * @param client - Existing ChatAnthropic instance
 * @param maxUses - Maximum number of web searches allowed per request
 * @param domains - Optional custom domain allowlist (defaults to AI_RESEARCH_DOMAINS)
 *
 * @example
 * let client = createChatClient({ apiKey });
 * if (enableResearch) {
 *   client = withWebSearch(client);
 * }
 */
export function withWebSearch(
	client: ChatAnthropic,
	maxUses: number = 5,
	domains: readonly string[] = AI_RESEARCH_DOMAINS
): ChatAnthropic {
	return client.bindTools([{
		type: 'web_search_20250305',
		name: 'web_search',
		max_uses: maxUses,
		allowed_domains: [...domains]
	}]);
}

/**
 * Create a streaming-enabled client with optional web search
 *
 * @example
 * const client = createStreamingClient({
 *   apiKey: env.ANTHROPIC_API_KEY,
 *   enableResearch: true
 * });
 */
export function createStreamingClient(options: ChatClientOptions & { enableResearch?: boolean }): ChatAnthropic {
	let client = createChatClient({ ...options, streaming: true });

	if (options.enableResearch) {
		client = withWebSearch(client);
	}

	return client;
}
