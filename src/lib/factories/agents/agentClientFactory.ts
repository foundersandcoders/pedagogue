/**
 * AI Client Factory
 *
 * Centralizes ChatAnthropic client configuration and creation.
 * Provides consistent model settings across module and course generation.
 */
import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { AIMessageChunk } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import type { ChatAnthropicCallOptions } from '@langchain/anthropic/dist/chat_models';
import type { ChatClientOptions } from '$lib/types/agent';
import { AI_RESEARCH_DOMAINS } from '$lib/config/researchDomains.js';

/**
 * Default model configuration for all generation tasks
 */
export const DEFAULT_MODEL_CONFIG = {
	modelName: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5
	temperature: 0.7,
	maxTokens: 16384 // Sonnet 4.5 supports up to 64K output tokens
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
		streaming: options.streaming ?? false,
		// Timeout is configured via clientOptions if needed
		...(options.timeout && {
			clientOptions: { timeout: options.timeout }
		})
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
): Runnable<BaseLanguageModelInput, AIMessageChunk, ChatAnthropicCallOptions> {
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
export function createStreamingClient(
	options: ChatClientOptions & { enableResearch?: boolean }
): ChatAnthropic | Runnable<BaseLanguageModelInput, AIMessageChunk, ChatAnthropicCallOptions> {
	let client = createChatClient({ ...options, streaming: true });

	if (options.enableResearch) return withWebSearch(client);

	return client;
}
