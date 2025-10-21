// INPUT FILES
export interface ProjectsFile { rawContent: string }
export interface SkillsFile { rawContent: string }
export interface ResearchFile { rawContent: string }

// GENERATED MODULE METADATA
export interface Change {
	section: string;
	type: string;
	confidence: 'high' | 'medium' | 'low';
	summary: string;
	rationale: string;
	sources: Array<{ url: string; text: string }>;
}

export interface GenerationInfo {
	timestamp: string;
	source: string;
	model: string;
}

export interface ProvenanceInfo {
	aiUpdateCount: number;
	sectionsNeedingReview: string[];
}
