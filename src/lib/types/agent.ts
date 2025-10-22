import type { ChatAnthropic } from '@langchain/anthropic';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { AIMessageChunk } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import type { ChatAnthropicCallOptions } from '@langchain/anthropic/dist/chat_models';
import type { GenerateRequest } from '$lib/schemas/apiValidator';

/**
 * Type representing either a ChatAnthropic client or a Runnable chain
 * (e.g., after binding tools with bindTools())
 */
export type ChatModel = ChatAnthropic | Runnable<BaseLanguageModelInput, AIMessageChunk, ChatAnthropicCallOptions>;

export interface ChatClientOptions {
	apiKey: string;
	temperature?: number;
	maxTokens?: number;
	timeout?: number;
	streaming?: boolean;
}

/**
 * Result of a generation attempt
 */
export interface GenerationResult {
	success: boolean;
	fullContent: string;
	xmlContent: string | null;
	validationErrors: string[];
	validationWarnings?: string[];
	attempt: number;
}

/**
 * Callbacks for retry progress (used by streaming to send SSE events)
 */
export interface RetryCallbacks {
	onAttemptStart?: (attempt: number, maxRetries: number, errors: string[]) => void | Promise<void>;
	onContentChunk?: (chunk: string) => void | Promise<void>;
	onValidationStart?: () => void | Promise<void>;
	onValidationResult?: (result: GenerationResult) => void | Promise<void>;
}

/**
 * Configuration for retry handler
 */
export interface RetryConfig {
	body: GenerateRequest;
	model: ChatModel;
	maxRetries?: number;
	callbacks?: RetryCallbacks;
}

/**
 * SSE event types for module generation
 */
export type SSEEventType =
	| 'connected'
	| 'progress'
	| 'content'
	| 'validation_started'
	| 'validation_success'
	| 'validation_failed'
	| 'complete'
	| 'error';

/**
 * SSE event data structure
 */
export interface SSEEvent {
		type: SSEEventType;
		message?: string;
		chunk?: string;
		content?: string;
		xmlContent?: string;
		attempts?: number;
		errors?: string[];
		warnings?: string[];
}

/**
 * Configuration for SSE stream creation
 */
export interface SSEStreamConfig {
	body: GenerateRequest;
	model: ChatModel;
	maxRetries?: number;
}
