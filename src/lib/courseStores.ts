import { writable, derived } from 'svelte/store';
import type { CourseData, ModuleSlot, Arc } from './types/course';

/**
 * Svelte stores for course generation workflow
 */

// Current course being worked on
export const currentCourse = writable<CourseData | null>(null);

// Current step in course workflow (1-6: Config → Arc Planning → Module Planning → Structure Review → Generation → Export)
export const courseWorkflowStep = writable<number>(1);

// List of saved courses (loaded from localStorage)
export const savedCourses = writable<CourseData[]>([]);

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

			// Backward compatibility: migrate old module-based structure to arc-based
			if (parsed.modules && !parsed.arcs) {
				console.log('Migrating old course structure to arc-based format');
				parsed.arcs = [{
					id: crypto.randomUUID(),
					order: 1,
					title: 'Main Course Content',
					description: 'Migrated from previous module-only structure',
					theme: 'General',
					durationWeeks: parsed.modules.reduce((sum: number, m: ModuleSlot) => sum + m.durationWeeks, 0),
					modules: parsed.modules.map((module: ModuleSlot, index: number) => ({
						...module,
						arcId: parsed.arcs[0].id,
						order: index + 1
					}))
				}];
				delete parsed.modules;
			}

			// Convert module dates
			if (parsed.arcs) {
				parsed.arcs.forEach((arc: Arc) => {
					arc.modules.forEach((module: ModuleSlot) => {
						if (module.moduleData?.generatedAt) {
							module.moduleData.generatedAt = new Date(module.moduleData.generatedAt);
						}
					});
				});
			}

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
			// Convert date strings and migrate if needed
			parsed.forEach((course: CourseData) => {
				course.createdAt = new Date(course.createdAt);
				course.updatedAt = new Date(course.updatedAt);

				// Backward compatibility migration
				if ((course as any).modules && !course.arcs) {
					const modules = (course as any).modules;
					course.arcs = [{
						id: crypto.randomUUID(),
						order: 1,
						title: 'Main Course Content',
						description: 'Migrated from previous module-only structure',
						theme: 'General',
						durationWeeks: modules.reduce((sum: number, m: ModuleSlot) => sum + m.durationWeeks, 0),
						modules: modules.map((module: ModuleSlot, index: number) => ({
							...module,
							arcId: course.arcs[0].id,
							order: index + 1
						}))
					}];
					delete (course as any).modules;
				}
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
