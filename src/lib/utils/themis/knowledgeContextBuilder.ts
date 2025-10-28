/**
 * Knowledge Context Builder
 *
 * Aggregates module overview data to build cumulative context for subsequent modules.
 * This prevents content repetition and ensures proper knowledge progression.
 */

import type { ModuleSlot, Arc, CourseData } from '$lib/types/themis';

/**
 * Learner knowledge context structure
 * Represents what the learner knows at a specific point in the course
 */
export interface LearnerKnowledgeContext {
	/** All topics covered so far */
	coveredTopics: string[];

	/** Skills and capabilities the learner has acquired */
	acquiredSkills: string[];

	/** Prerequisites that have been fulfilled */
	fulfilledPrerequisites: string[];

	/** Narrative summary of the learner's journey so far */
	journeyNarrative: string;

	/** Current capabilities statement */
	currentCapabilities: string;

	/** Topics that should not be repeated */
	topicsToAvoidRepeating: string[];
}

/**
 * Build learner knowledge context from preceding modules
 *
 * Aggregates overview data from all modules the learner has completed or reviewed,
 * creating a comprehensive picture of their current knowledge state.
 *
 * @param precedingModules - Modules that come before the current one
 * @param currentArc - The arc containing the current module
 * @param courseData - Full course data for additional context
 * @returns Structured knowledge context
 */
export function buildKnowledgeContext(
	precedingModules: ModuleSlot[],
	currentArc: Arc,
	courseData: CourseData
): LearnerKnowledgeContext {
	// If no preceding modules, return empty context
	if (!precedingModules || precedingModules.length === 0) {
		return {
			coveredTopics: [],
			acquiredSkills: [],
			fulfilledPrerequisites: [],
			journeyNarrative: `This is the first module in "${courseData.title}". Learners are beginning their journey.`,
			currentCapabilities: 'Learners are at the starting point with no prior modules completed.',
			topicsToAvoidRepeating: []
		};
	}

	// Aggregate data from preceding modules with overviews
	const modulesWithOverviews = precedingModules.filter(m => m.overview);

	// Collect all covered topics (key concepts introduced)
	const coveredTopics = modulesWithOverviews
		.flatMap(m => m.overview!.keyConceptsIntroduced)
		.filter((topic, index, self) => self.indexOf(topic) === index); // Deduplicate

	// Collect all acquired skills (learning objectives achieved)
	const acquiredSkills = modulesWithOverviews
		.flatMap(m => m.overview!.learningObjectives)
		.filter((skill, index, self) => self.indexOf(skill) === index); // Deduplicate

	// Collect all fulfilled prerequisites
	const fulfilledPrerequisites = modulesWithOverviews
		.flatMap(m => m.overview!.prerequisites)
		.filter((prereq, index, self) => self.indexOf(prereq) === index); // Deduplicate

	// Build journey narrative
	const journeyNarrative = buildJourneyNarrative(
		modulesWithOverviews,
		currentArc,
		courseData
	);

	// Build current capabilities statement
	const currentCapabilities = buildCapabilitiesStatement(
		acquiredSkills,
		coveredTopics
	);

	// Topics to avoid are all previously covered topics
	const topicsToAvoidRepeating = [...coveredTopics];

	return {
		coveredTopics,
		acquiredSkills,
		fulfilledPrerequisites,
		journeyNarrative,
		currentCapabilities,
		topicsToAvoidRepeating
	};
}

/**
 * Build narrative summary of learner's journey
 */
function buildJourneyNarrative(
	completedModules: ModuleSlot[],
	currentArc: Arc,
	courseData: CourseData
): string {
	const moduleCount = completedModules.length;
	const moduleTitles = completedModules.map(m => m.title).join(', ');

	// Find which arcs have been completed
	const completedArcIds = new Set(completedModules.map(m => m.arcId));
	const currentArcIndex = courseData.arcs.findIndex(a => a.id === currentArc.id);
	const arcsCompleted = courseData.arcs.slice(0, currentArcIndex);

	let narrative = `Learners have completed ${moduleCount} module${moduleCount !== 1 ? 's' : ''} in "${courseData.title}": ${moduleTitles}.`;

	if (arcsCompleted.length > 0) {
		const arcNames = arcsCompleted.map(a => a.title).join(', ');
		narrative += ` They have finished ${arcsCompleted.length} thematic arc${arcsCompleted.length !== 1 ? 's' : ''} (${arcNames})`;

		if (currentArc.order > arcsCompleted.length + 1) {
			narrative += ` and are now in the "${currentArc.title}" arc.`;
		} else {
			narrative += `.`;
		}
	} else {
		narrative += ` They are currently in the "${currentArc.title}" arc.`;
	}

	return narrative;
}

/**
 * Build statement of current learner capabilities
 */
function buildCapabilitiesStatement(
	skills: string[],
	topics: string[]
): string {
	if (skills.length === 0 && topics.length === 0) {
		return 'Learners are at the beginning of their journey with foundational knowledge only.';
	}

	const skillsSummary = skills.length > 0
		? `They can: ${skills.slice(0, 5).join('; ')}${skills.length > 5 ? '; and more' : ''}.`
		: '';

	const topicsSummary = topics.length > 0
		? ` They are familiar with: ${topics.slice(0, 5).join(', ')}${topics.length > 5 ? ', and more' : ''}.`
		: '';

	return `${skillsSummary}${topicsSummary}`.trim();
}

/**
 * Get all modules that precede a given module in the course
 *
 * Returns modules in order, including those from previous arcs and
 * earlier in the current arc.
 *
 * @param targetModule - The module to find predecessors for
 * @param courseData - Full course data
 * @returns Array of preceding modules in temporal order
 */
export function getPrecedingModules(
	targetModule: ModuleSlot,
	courseData: CourseData
): ModuleSlot[] {
	const precedingModules: ModuleSlot[] = [];

	// Find the target module's arc
	const targetArc = courseData.arcs.find(a => a.id === targetModule.arcId);
	if (!targetArc) return precedingModules;

	// Add all modules from previous arcs
	const previousArcs = courseData.arcs.filter(a => a.order < targetArc.order);
	previousArcs.forEach(arc => {
		precedingModules.push(...arc.modules);
	});

	// Add modules from current arc that come before target
	const modulesInCurrentArc = targetArc.modules.filter(
		m => m.order < targetModule.order
	);
	precedingModules.push(...modulesInCurrentArc);

	return precedingModules;
}

/**
 * Check if a module has a complete overview
 */
export function hasCompleteOverview(module: ModuleSlot): boolean {
	if (!module.overview) return false;

	const overview = module.overview;
	return (
		overview.learningObjectives.length >= 3 &&
		overview.prerequisites.length >= 1 &&
		overview.keyConceptsIntroduced.length >= 3
	);
}

/**
 * Get summary statistics for course knowledge coverage
 */
export function getKnowledgeCoverageStats(courseData: CourseData): {
	totalModules: number;
	modulesWithOverviews: number;
	uniqueConceptsCovered: number;
	uniqueSkillsAcquired: number;
	completionPercentage: number;
} {
	const allModules = courseData.arcs.flatMap(a => a.modules);
	const modulesWithOverviews = allModules.filter(hasCompleteOverview);

	const uniqueConcepts = new Set(
		modulesWithOverviews.flatMap(m => m.overview!.keyConceptsIntroduced)
	);

	const uniqueSkills = new Set(
		modulesWithOverviews.flatMap(m => m.overview!.learningObjectives)
	);

	return {
		totalModules: allModules.length,
		modulesWithOverviews: modulesWithOverviews.length,
		uniqueConceptsCovered: uniqueConcepts.size,
		uniqueSkillsAcquired: uniqueSkills.size,
		completionPercentage: allModules.length > 0
			? (modulesWithOverviews.length / allModules.length) * 100
			: 0
	};
}
