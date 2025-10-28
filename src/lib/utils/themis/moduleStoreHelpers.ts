import type { ModuleSlot } from '$lib/types/themis';
import { currentCourse } from '$lib/stores/themisStores';

/**
 * Utility functions for updating module state in the course store
 * Centralizes repeated store update patterns
 */

/**
 * Update a module's status
 */
export function updateModuleStatus(
	moduleId: string,
	status: ModuleSlot['status']
): void {
	currentCourse.update(course => {
		if (!course) return course;

		for (const arc of course.arcs) {
			const module = arc.modules.find(m => m.id === moduleId);
			if (module) {
				module.status = status;
				break;
			}
		}

		return course;
	});
}

/**
 * Update a module with generated XML content and mark as complete
 */
export function updateModuleWithGeneratedData(
	moduleId: string,
	xmlContent: string
): void {
	currentCourse.update(course => {
		if (!course) return course;

		for (const arc of course.arcs) {
			const module = arc.modules.find(m => m.id === moduleId);
			if (module) {
				module.status = 'complete';
				module.moduleData = {
					xmlContent,
					generatedAt: new Date()
				};
				// Clear any previous error
				delete module.errorMessage;
				break;
			}
		}

		return course;
	});
}

/**
 * Update a module with an error message and mark as error
 */
export function updateModuleWithError(
	moduleId: string,
	errorMessage: string
): void {
	currentCourse.update(course => {
		if (!course) return course;

		for (const arc of course.arcs) {
			const module = arc.modules.find(m => m.id === moduleId);
			if (module) {
				module.status = 'error';
				module.errorMessage = errorMessage;
				break;
			}
		}

		return course;
	});
}

/**
 * Set the last attempted generation type for a module (for retry tracking)
 */
export function setLastAttemptedGeneration(
	moduleId: string,
	generationType: 'overview' | 'full'
): void {
	currentCourse.update(course => {
		if (!course) return course;

		for (const arc of course.arcs) {
			const module = arc.modules.find(m => m.id === moduleId);
			if (module) {
				module.lastAttemptedGeneration = generationType;
				break;
			}
		}

		return course;
	});
}
