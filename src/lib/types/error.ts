/**
 * Typed Error Classes for Generation Operations
 *
 * Provides structured error handling with error codes, user-friendly messages,
 * and retry hints for module and course generation.
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Base class for all generation-related errors
 */
export class GenerationError extends Error {
	/** Error code for programmatic handling */
	code: string;
	/** User-friendly error message */
	userMessage: string;
	/** Whether this error is retryable */
	retryable: boolean;
	/** Severity level */
	severity: ErrorSeverity;
	/** Original error if this wraps another error */
	cause?: Error;

	constructor(
		message: string,
		code: string,
		userMessage: string,
		retryable: boolean = false,
		severity: ErrorSeverity = 'error',
		cause?: Error
	) {
		super(message);
		this.name = 'GenerationError';
		this.code = code;
		this.userMessage = userMessage;
		this.retryable = retryable;
		this.severity = severity;
		this.cause = cause;

		// Maintains proper stack trace for where error was thrown (V8 only)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Convert error to JSON for API responses
	 */
	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			userMessage: this.userMessage,
			retryable: this.retryable,
			severity: this.severity,
			stack: this.stack
		};
	}
}

/**
 * Validation errors (schema validation, XML parsing, etc.)
 */
export class ValidationError extends GenerationError {
	/** Specific validation errors */
	validationErrors: string[];

	constructor(
		message: string,
		validationErrors: string[],
		userMessage: string = 'The generated content failed validation. Please try again.',
		retryable: boolean = true
	) {
		super(message, 'VALIDATION_ERROR', userMessage, retryable, 'error');
		this.name = 'ValidationError';
		this.validationErrors = validationErrors;
	}

	toJSON() {
		return {
			...super.toJSON(),
			validationErrors: this.validationErrors
		};
	}
}

/**
 * Network and API errors
 */
export class NetworkError extends GenerationError {
	/** HTTP status code if applicable */
	statusCode?: number;

	constructor(
		message: string,
		userMessage: string = 'A network error occurred. Please check your connection and try again.',
		statusCode?: number,
		cause?: Error
	) {
		super(message, 'NETWORK_ERROR', userMessage, true, 'error', cause);
		this.name = 'NetworkError';
		this.statusCode = statusCode;
	}

	toJSON() {
		return {
			...super.toJSON(),
			statusCode: this.statusCode
		};
	}
}

/**
 * Configuration errors (missing API keys, invalid settings, etc.)
 */
export class ConfigurationError extends GenerationError {
	constructor(
		message: string,
		userMessage: string = 'There is a configuration problem. Please contact support.',
		cause?: Error
	) {
		super(message, 'CONFIGURATION_ERROR', userMessage, false, 'error', cause);
		this.name = 'ConfigurationError';
	}
}

/**
 * Rate limit errors
 */
export class RateLimitError extends GenerationError {
	/** When the rate limit resets (if known) */
	resetAt?: Date;
	/** How long to wait before retrying (in seconds) */
	retryAfter?: number;

	constructor(
		message: string,
		retryAfter?: number,
		resetAt?: Date
	) {
		const retryMessage = retryAfter
			? `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
			: 'Rate limit exceeded. Please try again later.';

		super(message, 'RATE_LIMIT_ERROR', retryMessage, true, 'warning');
		this.name = 'RateLimitError';
		this.retryAfter = retryAfter;
		this.resetAt = resetAt;
	}

	toJSON() {
		return {
			...super.toJSON(),
			retryAfter: this.retryAfter,
			resetAt: this.resetAt?.toISOString()
		};
	}
}

/**
 * Timeout errors
 */
export class TimeoutError extends GenerationError {
	/** Timeout duration in milliseconds */
	timeoutMs: number;

	constructor(
		message: string,
		timeoutMs: number,
		userMessage: string = 'The request took too long to complete. Please try again.'
	) {
		super(message, 'TIMEOUT_ERROR', userMessage, true, 'error');
		this.name = 'TimeoutError';
		this.timeoutMs = timeoutMs;
	}

	toJSON() {
		return {
			...super.toJSON(),
			timeoutMs: this.timeoutMs
		};
	}
}

/**
 * Course upload errors
 */
export class CourseUploadError extends GenerationError {
	/** Specific upload error code */
	uploadCode: 'INVALID_JSON' | 'VALIDATION_FAILED' | 'MISSING_REQUIRED_FIELDS' | 'FILE_TOO_LARGE';
	/** Additional error details */
	details?: Record<string, unknown>;

	constructor(
		message: string,
		uploadCode: 'INVALID_JSON' | 'VALIDATION_FAILED' | 'MISSING_REQUIRED_FIELDS' | 'FILE_TOO_LARGE',
		userMessage?: string,
		details?: Record<string, unknown>
	) {
		const defaultMessages = {
			INVALID_JSON: 'Invalid JSON file. Please upload a valid course structure exported from Themis.',
			VALIDATION_FAILED: 'Course structure validation failed. Please check the error details.',
			MISSING_REQUIRED_FIELDS: 'The course structure is missing required fields.',
			FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.'
		};

		super(
			message,
			`UPLOAD_${uploadCode}`,
			userMessage || defaultMessages[uploadCode],
			false,
			'error'
		);
		this.name = 'CourseUploadError';
		this.uploadCode = uploadCode;
		this.details = details;
	}

	toJSON() {
		return {
			...super.toJSON(),
			uploadCode: this.uploadCode,
			details: this.details
		};
	}
}