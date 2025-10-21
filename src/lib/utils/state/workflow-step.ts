/**
 * Workflow Step Management Utilities
 *
 * Reusable patterns for managing multi-step workflows in Svelte stores.
 * Provides consistent interface for step progression and validation.
 */

import { writable, type Writable } from 'svelte/store';

/**
 * Configuration for workflow store
 */
export interface WorkflowConfig {
	/** Initial step number (usually 1) */
	initialStep: number;
	/** Total number of steps in the workflow */
	totalSteps: number;
}

/**
 * Workflow store with step navigation methods
 */
export interface WorkflowStore extends Writable<number> {
	/** Move to the next step (if not at end) */
	next: () => void;
	/** Move to the previous step (if not at start) */
	previous: () => void;
	/** Jump to a specific step */
	goTo: (step: number) => void;
	/** Reset to initial step */
	reset: () => void;
	/** Check if at the first step */
	isFirst: () => boolean;
	/** Check if at the last step */
	isLast: () => boolean;
	/** Get current step value synchronously */
	current: () => number;
}

/**
 * Create a workflow store with step management methods
 *
 * Provides a writable store with additional navigation methods for
 * managing multi-step workflows (wizards, onboarding, etc.).
 *
 * @param config - Workflow configuration
 * @returns Workflow store with navigation methods
 *
 * @example
 * const workflow = createWorkflowStore({ initialStep: 1, totalSteps: 5 });
 * workflow.next(); // Move to step 2
 * workflow.goTo(4); // Jump to step 4
 * workflow.reset(); // Back to step 1
 */
export function createWorkflowStore(config: WorkflowConfig): WorkflowStore {
	const { initialStep, totalSteps } = config;
	const { subscribe, set, update } = writable<number>(initialStep);

	// Track current value for synchronous access
	let currentValue = initialStep;
	subscribe(value => {
		currentValue = value;
	});

	return {
		subscribe,
		set,
		update,

		next: () => {
			update(step => Math.min(step + 1, totalSteps));
		},

		previous: () => {
			update(step => Math.max(step - 1, initialStep));
		},

		goTo: (step: number) => {
			if (step < initialStep || step > totalSteps) {
				console.warn(`Invalid step ${step}. Must be between ${initialStep} and ${totalSteps}`);
				return;
			}
			set(step);
		},

		reset: () => {
			set(initialStep);
		},

		isFirst: () => {
			return currentValue === initialStep;
		},

		isLast: () => {
			return currentValue === totalSteps;
		},

		current: () => {
			return currentValue;
		}
	};
}
