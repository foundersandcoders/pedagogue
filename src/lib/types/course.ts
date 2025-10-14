/**
 * Type definitions for course generation
 */

export interface CourseData {
	id: string;
	title: string;
	description: string;
	logistics: {
		totalWeeks: number;
		daysPerWeek: number;
		startDate?: string;
	};
	learners: {
		cohortSize: number;
		teamBased: boolean;
		teamSize?: number;
		prerequisites: string;
		experience: {
			prereq: '<= 1 year' | '1-3 years' | '>= 4 years';
			focus: 'no experience' | 'limited experience' | 'skilled amateur' | 'current professional';
		};
	};
	structure: 'facilitated' | 'peer-led';
	modules: ModuleSlot[];
	courseNarrative?: string; // AI-generated overall course narrative
	progressionNarrative?: string; // AI-generated explanation of how modules connect
	createdAt: Date;
	updatedAt: Date;
}

export interface ModuleSlot {
	id: string;
	order: number; // 1, 2, 3...
	title: string;
	description: string;
	durationWeeks: number;
	status: 'planned' | 'generating' | 'complete' | 'error';
	learningObjectives?: string[]; // AI-generated objectives
	keyTopics?: string[]; // AI-generated topics
	moduleData?: {
		// Generated module spec (XML)
		xmlContent: string;
		generatedAt: Date;
	};
	inputFiles?: {
		projectsData?: any;
		skillsData?: any;
		researchData?: any;
	};
	errorMessage?: string;
}

export interface CourseStructureGenerationRequest {
	title: string;
	description: string;
	totalWeeks: number;
	daysPerWeek: number;
	cohortSize: number;
	structure: 'facilitated' | 'peer-led';
	learnerExperience: {
		prereq: string;
		focus: string;
	};
	enableResearch?: boolean;
	supportingDocuments?: string[];
}

export interface CourseStructureGenerationResponse {
	success: boolean;
	courseNarrative?: string;
	modules: Array<{
		order: number;
		title: string;
		description: string;
		suggestedDurationWeeks: number;
		learningObjectives: string[];
		keyTopics: string[];
	}>;
	progressionNarrative?: string;
	errors?: string[];
}
