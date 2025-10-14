/**
 * Type definitions for course generation
 */

export interface Arc {
	id: string;
	order: number; // 1, 2, 3...
	title: string;
	description: string;
	theme: string; // Thematic focus (e.g., "Agentic Workflows", "Foundation Concepts")
	durationWeeks: number;
	arcThemeNarrative?: string; // AI-generated narrative explaining the arc's thematic focus
	arcProgressionNarrative?: string; // AI-generated explanation of how modules within this arc connect
	modules: ModuleSlot[];
}

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
	arcs: Arc[]; // Thematic organizational layer containing modules
	courseNarrative?: string; // AI-generated overall course narrative
	progressionNarrative?: string; // AI-generated explanation of how arcs connect (thematically independent but temporally sequenced)
	createdAt: Date;
	updatedAt: Date;
}

export interface ModuleSlot {
	id: string;
	arcId: string; // Reference to parent arc
	order: number; // Order within the arc (1, 2, 3...)
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
	arcs?: Array<{
		// Optional arc skeleton for AI to enhance
		order: number;
		title: string;
		description: string;
		theme: string;
		durationWeeks: number;
		modules?: Array<{
			// Optional module skeleton within arc
			order: number;
			title: string;
			description: string;
			durationWeeks: number;
		}>;
	}>;
	enableResearch?: boolean;
	supportingDocuments?: string[];
}

export interface CourseStructureGenerationResponse {
	success: boolean;
	courseNarrative?: string;
	arcs: Array<{
		order: number;
		title: string;
		description: string;
		theme: string;
		arcThemeNarrative: string; // AI-generated thematic focus explanation
		arcProgressionNarrative: string; // How modules within this arc connect
		suggestedDurationWeeks: number;
		modules: Array<{
			order: number; // Order within the arc
			title: string;
			description: string;
			suggestedDurationWeeks: number;
			learningObjectives: string[];
			keyTopics: string[];
		}>;
	}>;
	progressionNarrative?: string; // How arcs connect across the course
	errors?: string[];
}
