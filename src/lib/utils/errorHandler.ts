import { GenerationError } from "$lib/types/error"

/**
 * Helper to convert unknown errors to GenerationError
 */
export function toGenerationError(error: unknown): GenerationError {
	if (error instanceof GenerationError) {
		return error;
	}

	if (error instanceof Error) {
		return new GenerationError(
			error.message,
			'UNKNOWN_ERROR',
			'An unexpected error occurred. Please try again.',
			true,
			'error',
			error
		);
	}

	return new GenerationError(
		String(error),
		'UNKNOWN_ERROR',
		'An unexpected error occurred. Please try again.',
		true,
		'error'
	);
}

/**
 * Helper to check if an error is retryable
 */
export function isRetryable(error: unknown): boolean {
	if (error instanceof GenerationError) {
		return error.retryable;
	}
	return false;
}

/**
 * Helper to extract user message from any error
 */
export function getUserMessage(error: unknown): string {
	if (error instanceof GenerationError) {
		return error.userMessage;
	}
	if (error instanceof Error) {
		return 'An unexpected error occurred. Please try again.';
	}
	return String(error);
}
