import { writable, derived } from 'svelte/store';
import type { CourseData, ModuleSlot } from './types/course';

/**
 * Svelte stores for course generation workflow
 */

// Current course being worked on
export const currentCourse = writable<CourseData | null>(null);

// Current step in course workflow (1-5)
export const courseWorkflowStep = writable<number>(1);

// List of saved courses (loaded from localStorage)
export const savedCourses = writable<CourseData[]>([]);

// Track which module is currently being generated
export const activeModuleGeneration = writable<string | null>(null);

// Derived store - total weeks used by all modules
export const totalModuleWeeks = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse) return 0;
		return $currentCourse.modules.reduce((sum, module) => sum + module.durationWeeks, 0);
	}
);

// Derived store - are all modules complete?
export const allModulesComplete = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse || $currentCourse.modules.length === 0) return false;
		return $currentCourse.modules.every(module => module.status === 'complete');
	}
);

// Derived store - count modules by status
export const moduleStatusCounts = derived(
	currentCourse,
	($currentCourse) => {
		if (!$currentCourse) {
			return { planned: 0, generating: 0, complete: 0, error: 0 };
		}

		return $currentCourse.modules.reduce((counts, module) => {
			counts[module.status]++;
			return counts;
		}, { planned: 0, generating: 0, complete: 0, error: 0 } as Record<ModuleSlot['status'], number>);
	}
);

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
		modules: partial.modules || [],
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

// Reset course workflow
export function resetCourseWorkflow() {
	currentCourse.set(null);
	courseWorkflowStep.set(1);
	activeModuleGeneration.set(null);
}

// Auto-save to localStorage (subscribe to changes)
if (typeof window !== 'undefined') {
	currentCourse.subscribe(course => {
		if (course) {
			try {
				localStorage.setItem('currentCourse', JSON.stringify(course));
			} catch (e) {
				console.error('Failed to save course to localStorage:', e);
			}
		}
	});

	// Load saved course on initialization
	try {
		const saved = localStorage.getItem('currentCourse');
		if (saved) {
			const parsed = JSON.parse(saved);
			// Convert date strings back to Date objects
			parsed.createdAt = new Date(parsed.createdAt);
			parsed.updatedAt = new Date(parsed.updatedAt);
			parsed.modules.forEach((module: ModuleSlot) => {
				if (module.moduleData?.generatedAt) {
					module.moduleData.generatedAt = new Date(module.moduleData.generatedAt);
				}
			});
			currentCourse.set(parsed);
		}
	} catch (e) {
		console.error('Failed to load course from localStorage:', e);
	}

	// Load saved courses list
	try {
		const savedList = localStorage.getItem('savedCourses');
		if (savedList) {
			const parsed = JSON.parse(savedList);
			// Convert date strings
			parsed.forEach((course: CourseData) => {
				course.createdAt = new Date(course.createdAt);
				course.updatedAt = new Date(course.updatedAt);
			});
			savedCourses.set(parsed);
		}
	} catch (e) {
		console.error('Failed to load saved courses from localStorage:', e);
	}
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

	savedCourses.set(courses);

	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem('savedCourses', JSON.stringify(courses));
		} catch (e) {
			console.error('Failed to save courses list to localStorage:', e);
		}
	}
}
