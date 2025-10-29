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
import { AI_RESEARCH_DOMAINS_FLAT } from '$lib/config/researchDomains.js';

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
 * @param domains - Domain allowlist (defaults to AI_RESEARCH_DOMAINS_FLAT)
 *                  Pass empty array for unrestricted research (no domain filtering)
 *
 * @example
 * // With default AI Engineering domains
 * let client = createChatClient({ apiKey });
 * client = withWebSearch(client);
 *
 * @example
 * // With custom domains
 * client = withWebSearch(client, 5, ['example.com', '*.github.com']);
 *
 * @example
 * // Unrestricted (all domains)
 * client = withWebSearch(client, 5, []);
 */
export function withWebSearch(
	client: ChatAnthropic,
	maxUses: number = 5,
	domains: readonly string[] = AI_RESEARCH_DOMAINS_FLAT
): Runnable<BaseLanguageModelInput, AIMessageChunk, ChatAnthropicCallOptions> {
	// Empty array = no restrictions (don't include allowed_domains parameter)
	const toolConfig: any = {
		type: 'web_search_20250305',
		name: 'web_search',
		max_uses: maxUses
	};

	// Only add allowed_domains if domains array is not empty
	if (domains.length > 0) {
		toolConfig.allowed_domains = [...domains];
	}

	return client.bindTools([toolConfig]);
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
