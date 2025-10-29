/**
 * Type definitions for course generation
 */

import type { ResearchConfig } from '$lib/schemas/apiValidator';

/**
 * Title input type - allows AI to decide, use guidance, or use exact value
 */
export type TitleInput =
	| { type: 'undefined' } // AI decides based on content and context
	| { type: 'prompt'; value: string } // AI generates from this guidance
	| { type: 'literal'; value: string }; // Use exactly as provided

/**
 * Module overview structure - lightweight generation before full module
 */
export interface ModuleOverview {
	generatedTitle?: string; // AI-suggested title (if not literal)
	generatedTheme?: string; // AI-suggested theme (if not literal)
	learningObjectives: string[]; // What learners will gain
	prerequisites: string[]; // What learners need to know first
	keyConceptsIntroduced: string[]; // Main new topics covered
	generatedAt: Date;
}

export interface Arc {
	id: string;
	order: number; // 1, 2, 3...

	// Title handling - supports AI generation or exact values
	titleInput: TitleInput;
	title: string; // Current/finalized title (for display and context)

	description: string;

	// Theme handling - supports AI generation or exact values
	themeInput: TitleInput;
	theme: string; // Current/finalized theme (for display and context)

	durationWeeks: number;
	arcThemeNarrative?: string; // AI-generated narrative explaining the arc's thematic focus
	arcProgressionNarrative?: string; // AI-generated explanation of how modules within this arc connect
	modules: ModuleSlot[];
	researchConfig?: ResearchConfig; // Research configuration for this arc
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
	researchConfig?: ResearchConfig; // Research configuration for entire course
	createdAt: Date;
	updatedAt: Date;
}

export interface ModuleSlot {
	id: string;
	arcId: string; // Reference to parent arc
	order: number; // Order within the arc (1, 2, 3...)

	// Title handling - supports AI generation or exact values
	titleInput: TitleInput;
	title: string; // Current/finalized title (for display and context)

	description: string;

	// Theme handling - supports AI generation or exact values (optional)
	themeInput?: TitleInput;
	theme?: string; // Current/finalized theme (for display and context)

	durationWeeks: number;
	status: 'planned' | 'overview-ready' | 'generating' | 'complete' | 'error';
	lastAttemptedGeneration?: 'overview' | 'full'; // Track what type of generation was last attempted (for retry)

	// Overview - lightweight generation before full module
	overview?: ModuleOverview;

	learningObjectives?: string[]; // AI-generated objectives (deprecated - use overview.learningObjectives)
	keyTopics?: string[]; // AI-generated topics (deprecated - use overview.keyConceptsIntroduced)

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
	researchConfig?: ResearchConfig; // Research configuration for this module
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
			researchConfig?: ResearchConfig;
		}>;
		researchConfig?: ResearchConfig;
	}>;
	enableResearch?: boolean;
	supportingDocuments?: string[];
	researchConfig?: ResearchConfig; // Course-level research configuration
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
			researchConfig?: ResearchConfig;
		}>;
		researchConfig?: ResearchConfig;
	}>;
	progressionNarrative?: string; // How arcs connect across the course
	errors?: string[];
}
