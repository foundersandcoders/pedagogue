import { writable, derived } from 'svelte/store';
import type { CourseData, ModuleSlot, Arc } from './types/course';
import { createWorkflowStore } from './store-utilities/workflow-step.js';
import { persistedStore, loadFromLocalStorage, saveToLocalStorage } from './store-utilities/persistence.js';

/**
 * Svelte stores for course generation workflow
 */

/**
 * Deserializer for CourseData - converts date strings back to Date objects
 * and handles backward compatibility for old module-based structure
 */
function deserializeCourseData(data: CourseData | null): CourseData | null {
	if (!data) return null;

	// Convert date strings to Date objects
	data.createdAt = new Date(data.createdAt);
	data.updatedAt = new Date(data.updatedAt);

	// Backward compatibility: migrate old module-based structure to arc-based
	const anyData = data as any;
	if (anyData.modules && !data.arcs) {
		console.log('Migrating old course structure to arc-based format');
		data.arcs = [{
			id: crypto.randomUUID(),
			order: 1,
			title: 'Main Course Content',
			description: 'Migrated from previous module-only structure',
			theme: 'General',
			durationWeeks: anyData.modules.reduce((sum: number, m: ModuleSlot) => sum + m.durationWeeks, 0),
			modules: anyData.modules.map((module: ModuleSlot, index: number) => ({
				...module,
				arcId: data.arcs[0].id,
				order: index + 1
			}))
		}];
		delete anyData.modules;
	}

	// Convert module dates
	if (data.arcs) {
		data.arcs.forEach((arc: Arc) => {
			arc.modules.forEach((module: ModuleSlot) => {
				if (module.moduleData?.generatedAt) {
					module.moduleData.generatedAt = new Date(module.moduleData.generatedAt);
				}
			});
		});
	}

	return data;
}

/**
 * Deserializer for saved courses list
 */
function deserializeSavedCourses(courses: CourseData[]): CourseData[] {
	return courses.map(course => deserializeCourseData(course)!);
}

// Current course being worked on (with auto-save to localStorage)
export const currentCourse = persistedStore<CourseData | null>({
	key: 'currentCourse',
	defaultValue: null,
	deserialize: deserializeCourseData
});

// Current step in course workflow (1-6: Config → Arc Planning → Module Planning → Structure Review → Generation → Export)
export const courseWorkflowStep = createWorkflowStore({
	initialStep: 1,
	totalSteps: 6
});

// List of saved courses (with auto-save to localStorage)
export const savedCourses = persistedStore<CourseData[]>({
	key: 'savedCourses',
	defaultValue: [],
	deserialize: deserializeSavedCourses
});

// Track which module is currently being generated
export const activeModuleGeneration = writable<string | null>(null);

// Derived store - total weeks used by all arcs
export const totalArcWeeks = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse) return 0;
		return $currentCourse.arcs.reduce((sum, arc) => sum + arc.durationWeeks, 0);
	}
);

// Derived store - total weeks used by all modules (across all arcs)
export const totalModuleWeeks = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse) return 0;
		return $currentCourse.arcs.reduce((arcSum, arc) => {
			const arcModuleWeeks = arc.modules.reduce((modSum, module) => modSum + module.durationWeeks, 0);
			return arcSum + arcModuleWeeks;
		}, 0);
	}
);

// Derived store - are all modules complete?
export const allModulesComplete = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse || $currentCourse.arcs.length === 0) return false;
		return $currentCourse.arcs.every(arc =>
			arc.modules.length > 0 && arc.modules.every(module => module.status === 'complete')
		);
	}
);

// Derived store - count modules by status (across all arcs)
export const moduleStatusCounts = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse) {
			return { planned: 0, generating: 0, complete: 0, error: 0 };
		}

		const allModules = $currentCourse.arcs.flatMap(arc => arc.modules);
		return allModules.reduce((counts, module) => {
			counts[module.status]++;
			return counts;
		}, { planned: 0, generating: 0, complete: 0, error: 0 } as Record<ModuleSlot['status'], number>);
	}
);

// Derived store - get modules by arc ID
export function modulesByArc(arcId: string) {
	return derived(
		currentCourse,
		($currentCourse) => {
			if (!$currentCourse) return [];
			const arc = $currentCourse.arcs.find(a => a.id === arcId);
			return arc?.modules || [];
		}
	);
}

// Initialize a new course
export function initializeCourse(partial: Partial<CourseData>): CourseData {
	return {
		id: crypto.randomUUID(),
		title: partial.title || '',
		description: partial.description || '',
		logistics: partial.logistics || {
			totalWeeks: 12,
			daysPerWeek: 1,
			startDate: ''
		},
		learners: partial.learners || {
			cohortSize: 12,
			teamBased: false,
			prerequisites: '',
			experience: {
				prereq: '1-3 years',
				focus: 'limited experience'
			}
		},
		structure: partial.structure || 'peer-led',
		arcs: partial.arcs || [],
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

// Reset course workflow
export function resetCourseWorkflow() {
	currentCourse.set(null);
	courseWorkflowStep.reset();
	activeModuleGeneration.set(null);
}

// Save current course to saved courses list
export function saveCurrentCourse() {
	let course: CourseData | null = null;
	currentCourse.subscribe(c => course = c)();

	if (!course) return;

	course.updatedAt = new Date();

	let courses: CourseData[] = [];
	savedCourses.subscribe(c => courses = c)();

	// Check if course already exists in saved list
	const existingIndex = courses.findIndex(c => c.id === course!.id);
	if (existingIndex >= 0) {
		courses[existingIndex] = course;
	} else {
		courses.push(course);
	}

	// Update savedCourses - auto-saves to localStorage via persistedStore
	savedCourses.set(courses);
}
