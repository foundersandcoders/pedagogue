import type { CourseData, Arc, ModuleSlot } from '$lib/types/themis';

export interface CourseValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates uploaded course structure against CourseData interface
 */
export function validateCourseStructure(course: any): CourseValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Type guards
	if (!course || typeof course !== 'object') {
		return { valid: false, errors: ['Invalid course data: not an object'], warnings: [] };
	}

	// Required top-level fields
	if (!course.id || typeof course.id !== 'string') {
		errors.push('Missing or invalid course.id');
	}

	if (!course.title || typeof course.title !== 'string') {
		errors.push('Missing or invalid course.title');
	}

	if (!course.description || typeof course.description !== 'string') {
		warnings.push('Missing course.description');
	}

	if (!course.arcs || !Array.isArray(course.arcs)) {
		errors.push('Missing or invalid course.arcs array');
		return { valid: false, errors, warnings }; // Fatal - can't continue
	}

	if (course.arcs.length === 0) {
		errors.push('Course must have at least one arc');
	}

	// Validate logistics
	if (!course.logistics) {
		errors.push('Missing course.logistics');
	} else {
		if (typeof course.logistics.totalWeeks !== 'number' || course.logistics.totalWeeks < 1) {
			errors.push('Invalid logistics.totalWeeks (must be number >= 1)');
		}
		if (typeof course.logistics.daysPerWeek !== 'number' || course.logistics.daysPerWeek < 1) {
			errors.push('Invalid logistics.daysPerWeek (must be number >= 1)');
		}
	}

	// Validate learners
	if (!course.learners) {
		errors.push('Missing course.learners');
	} else {
		if (typeof course.learners.cohortSize !== 'number' || course.learners.cohortSize < 1) {
			errors.push('Invalid learners.cohortSize (must be number >= 1)');
		}
		if (typeof course.learners.teamBased !== 'boolean') {
			warnings.push('Invalid learners.teamBased (should be boolean)');
		}
		if (!course.learners.experience) {
			warnings.push('Missing learners.experience');
		}
	}

	// Validate structure
	if (!course.structure || !['facilitated', 'peer-led'].includes(course.structure)) {
		warnings.push('Invalid course.structure (should be "facilitated" or "peer-led")');
	}

	// Validate each arc
	course.arcs.forEach((arc: any, idx: number) => {
		const arcPrefix = `Arc ${idx + 1}`;

		if (!arc.id || typeof arc.id !== 'string') {
			errors.push(`${arcPrefix}: Missing or invalid id`);
		}
		if (!arc.title || typeof arc.title !== 'string') {
			errors.push(`${arcPrefix}: Missing or invalid title`);
		}
		if (!arc.description) {
			warnings.push(`${arcPrefix}: Missing description`);
		}
		if (!arc.theme) {
			warnings.push(`${arcPrefix}: Missing theme`);
		}
		if (typeof arc.durationWeeks !== 'number' || arc.durationWeeks < 1) {
			errors.push(`${arcPrefix}: Invalid durationWeeks`);
		}
		if (typeof arc.order !== 'number') {
			errors.push(`${arcPrefix}: Missing or invalid order`);
		}

		if (!arc.modules || !Array.isArray(arc.modules)) {
			errors.push(`${arcPrefix}: Missing or invalid modules array`);
		} else if (arc.modules.length === 0) {
			warnings.push(`${arcPrefix}: Has no modules`);
		} else {
			// Validate modules
			arc.modules.forEach((module: any, mIdx: number) => {
				const modPrefix = `${arcPrefix} Module ${mIdx + 1}`;

				if (!module.id || typeof module.id !== 'string') {
					errors.push(`${modPrefix}: Missing or invalid id`);
				}
				if (!module.arcId || module.arcId !== arc.id) {
					errors.push(`${modPrefix}: Missing or mismatched arcId`);
				}
				if (!module.title || typeof module.title !== 'string') {
					errors.push(`${modPrefix}: Missing or invalid title`);
				}
				if (typeof module.order !== 'number') {
					errors.push(`${modPrefix}: Missing or invalid order`);
				}
				if (typeof module.durationWeeks !== 'number' || module.durationWeeks < 1) {
					errors.push(`${modPrefix}: Invalid durationWeeks`);
				}
				if (
					!module.status ||
					!['planned', 'generating', 'complete', 'error'].includes(module.status)
				) {
					errors.push(
						`${modPrefix}: Invalid status (must be: planned, generating, complete, or error)`
					);
				}

				// Validate module data if status is 'complete'
				if (module.status === 'complete') {
					if (!module.moduleData?.xmlContent) {
						warnings.push(`${modPrefix}: Marked complete but missing xmlContent`);
					}
				}
			});

			// Check module weeks sum to arc weeks
			const moduleWeeksSum = arc.modules.reduce(
				(sum: number, m: any) => sum + (m.durationWeeks || 0),
				0
			);
			if (moduleWeeksSum !== arc.durationWeeks) {
				warnings.push(
					`${arcPrefix}: Module weeks (${moduleWeeksSum}) don't match arc duration (${arc.durationWeeks})`
				);
			}
		}
	});

	// Validate total weeks consistency
	if (course.arcs && course.logistics) {
		const arcWeeksSum = course.arcs.reduce(
			(sum: number, arc: any) => sum + (arc.durationWeeks || 0),
			0
		);
		if (arcWeeksSum !== course.logistics.totalWeeks) {
			warnings.push(
				`Arc weeks (${arcWeeksSum}) don't match course total weeks (${course.logistics.totalWeeks})`
			);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}

/**
 * Deserialize uploaded course data (convert date strings to Date objects)
 * Handles data from JSON.parse() where dates are strings
 */
export function deserializeUploadedCourse(course: any): CourseData {
	return {
		...course,
		createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
		updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date(),
		arcs: course.arcs.map((arc: any) => ({
			...arc,
			modules: arc.modules.map((module: any) => ({
				...module,
				moduleData: module.moduleData
					? {
							...module.moduleData,
							generatedAt: module.moduleData.generatedAt
								? new Date(module.moduleData.generatedAt)
								: new Date()
						}
					: undefined
			}))
		}))
	};
}

/**
 * Get user-friendly error message from technical error
 */
export function getUserFriendlyError(err: Error): string {
	const msg = err.message.toLowerCase();

	if (msg.includes('json') || msg.includes('parse')) {
		return 'Invalid JSON format. Please upload a valid course structure file exported from Themis.';
	}

	if (msg.includes('arc')) {
		return 'Course structure is missing arc data. Please ensure you exported from the Structure Review step.';
	}

	if (msg.includes('module')) {
		return 'One or more modules are missing required fields.';
	}

	if (msg.includes('logistics')) {
		return 'Course logistics data is incomplete or invalid.';
	}

	if (msg.includes('learners')) {
		return 'Course learner information is incomplete or invalid.';
	}

	return `Upload failed: ${err.message}`;
}
