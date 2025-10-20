/**
 * Centralized Error State Management
 *
 * Provides a single source of truth for error state across the application.
 * Supports multiple error contexts and automatic timeout clearing.
 */

import { writable, derived, type Writable } from 'svelte/store';
import type { GenerationError } from '$lib/errors/generation-errors.js';

/**
 * Error context identifies where the error occurred
 */
export type ErrorContext = 'module-generation' | 'course-generation' | 'file-upload' | 'global';

/**
 * Error state for a specific context
 */
export interface ErrorState {
	error: GenerationError | null;
	timestamp: Date | null;
	dismissed: boolean;
}

/**
 * Map of error contexts to their states
 */
type ErrorStateMap = Record<ErrorContext, ErrorState>;

/**
 * Initial error state
 */
const initialState: ErrorStateMap = {
	'module-generation': { error: null, timestamp: null, dismissed: false },
	'course-generation': { error: null, timestamp: null, dismissed: false },
	'file-upload': { error: null, timestamp: null, dismissed: false },
	'global': { error: null, timestamp: null, dismissed: false }
};

/**
 * Internal store for all error states
 */
const errorStates = writable<ErrorStateMap>(initialState);

/**
 * Set an error for a specific context
 *
 * @param context - Where the error occurred
 * @param error - The error to set
 * @param autoClearMs - Automatically clear after this many milliseconds (optional)
 */
export function setError(
	context: ErrorContext,
	error: GenerationError,
	autoClearMs?: number
): void {
	errorStates.update(states => ({
		...states,
		[context]: {
			error,
			timestamp: new Date(),
			dismissed: false
		}
	}));

	// Auto-clear if requested
	if (autoClearMs) {
		setTimeout(() => {
			clearError(context);
		}, autoClearMs);
	}
}

/**
 * Clear error for a specific context
 *
 * @param context - Which context to clear
 */
export function clearError(context: ErrorContext): void {
	errorStates.update(states => ({
		...states,
		[context]: {
			error: null,
			timestamp: null,
			dismissed: false
		}
	}));
}

/**
 * Mark error as dismissed (keeps it in state but marks it as seen)
 *
 * @param context - Which context to dismiss
 */
export function dismissError(context: ErrorContext): void {
	errorStates.update(states => {
		const state = states[context];
		if (!state.error) return states;

		return {
			...states,
			[context]: {
				...state,
				dismissed: true
			}
		};
	});
}

/**
 * Clear all errors
 */
export function clearAllErrors(): void {
	errorStates.set(initialState);
}

/**
 * Check if a context has an active (non-dismissed) error
 *
 * @param context - Which context to check
 * @returns Derived store with boolean value
 */
export function hasError(context: ErrorContext) {
	return derived(errorStates, $states => {
		const state = $states[context];
		return state.error !== null && !state.dismissed;
	});
}

/**
 * Get error for a specific context
 *
 * @param context - Which context to get
 * @returns Derived store with error state
 */
export function getError(context: ErrorContext) {
	return derived(errorStates, $states => $states[context]);
}

/**
 * Check if any context has an active error
 */
export const hasAnyError = derived(errorStates, $states => {
	return Object.values($states).some(state => state.error !== null && !state.dismissed);
});

/**
 * Get all active (non-dismissed) errors
 */
export const activeErrors = derived(errorStates, $states => {
	return Object.entries($states)
		.filter(([_, state]) => state.error !== null && !state.dismissed)
		.map(([context, state]) => ({
			context: context as ErrorContext,
			...state
		}));
});

/**
 * Export the main store for advanced use cases
 */
export { errorStates };
