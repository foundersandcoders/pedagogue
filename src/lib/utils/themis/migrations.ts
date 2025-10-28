import type { CourseData, Arc, ModuleSlot, TitleInput } from '$lib/types/themis';

/**
 * Migration utilities for backward compatibility with legacy course data
 */

/**
 * Check if an arc has the new titleInput/themeInput structure
 */
function hasNewTitleStructure(arc: any): arc is Arc {
	return arc.titleInput !== undefined && arc.themeInput !== undefined;
}

/**
 * Check if a module has the new titleInput structure
 */
function hasNewModuleTitleStructure(module: any): module is ModuleSlot {
	return module.titleInput !== undefined;
}

/**
 * Migrate a single arc from legacy to new structure
 */
function migrateArc(arc: any): Arc {
	if (hasNewTitleStructure(arc)) {
		return arc; // Already migrated
	}

	return {
		...arc,
		// Convert existing string titles to literal TitleInput
		titleInput: { type: 'literal' as const, value: arc.title || '' },
		themeInput: { type: 'literal' as const, value: arc.theme || '' },
		modules: arc.modules?.map((module: any) => migrateModule(module)) || []
	};
}

/**
 * Migrate a single module from legacy to new structure
 */
function migrateModule(module: any): ModuleSlot {
	if (hasNewModuleTitleStructure(module)) {
		return module; // Already migrated
	}

	return {
		...module,
		// Convert existing string titles to literal TitleInput
		titleInput: { type: 'literal' as const, value: module.title || '' },
		// Theme is optional for modules
		themeInput: module.theme
			? { type: 'literal' as const, value: module.theme }
			: undefined
	};
}

/**
 * Migrate entire course data from legacy to new structure
 *
 * Converts existing string-based titles/themes to TitleInput format.
 * Safe to call on already-migrated data (idempotent).
 *
 * @param course - Course data (may be legacy or new format)
 * @returns Migrated course data with TitleInput structure
 */
export function migrateCourseData(course: CourseData | null): CourseData | null {
	if (!course) return null;

	// Check if already migrated by looking at first arc
	if (course.arcs.length > 0 && hasNewTitleStructure(course.arcs[0])) {
		return course; // Already using new structure
	}

	// Migrate all arcs and their modules
	return {
		...course,
		arcs: course.arcs.map(arc => migrateArc(arc))
	};
}

/**
 * Helper to create a new TitleInput from user input
 *
 * @param type - Input type (undefined, prompt, or literal)
 * @param value - Optional value for prompt or literal types
 * @returns Properly structured TitleInput
 */
export function createTitleInput(
	type: 'undefined' | 'prompt' | 'literal',
	value?: string
): TitleInput {
	if (type === 'undefined') {
		return { type: 'undefined' };
	}
	return { type, value: value || '' };
}

/**
 * Get the display value from a TitleInput
 *
 * @param titleInput - TitleInput structure
 * @param generatedValue - Optional AI-generated value (for non-literal inputs)
 * @returns String to display in UI
 */
export function getDisplayTitle(titleInput: TitleInput, generatedValue?: string): string {
	switch (titleInput.type) {
		case 'literal':
			return titleInput.value;
		case 'prompt':
		case 'undefined':
			return generatedValue || titleInput.type === 'prompt' ? `[${titleInput.value}]` : '[AI will decide]';
	}
}
