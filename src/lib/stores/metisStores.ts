import { writable, derived } from 'svelte/store';
import type { ProjectsFile, SkillsFile, ResearchFile } from '$lib/types/metis';
import type { StructuredInput } from '$lib/schemas/apiValidator';
import { createWorkflowStore } from '$lib/utils/state/metisWorkflowStep';

// Re-export for backward compatibility
export type StructuredInputData = StructuredInput;

// Default structured input values
const DEFAULT_STRUCTURED_INPUT: StructuredInputData = {
	logistics: {
		duration: 3,
		startDate: ''
	},
	learners: {
		cohortSize: 12,
		experience: {
			prereq: '<= 1 year',
			focus: 'limited experience'
		}
	},
	content: {
		techs: [],
		info: ''
	},
	model: {
		enableResearch: true,
		useExtendedThinking: true,
		domainConfig: {
			useList: 'ai-engineering',
			customDomains: []
		}
	}
};

// Current step in the workflow (1-6)
export const currentStep = createWorkflowStore({
	initialStep: 1,
	totalSteps: 6
});

// Uploaded file contents
export const projectsFile = writable<ProjectsFile | null>(null);
export const skillsFile = writable<SkillsFile | null>(null);
export const researchFile = writable<ResearchFile | null>(null);

// Structured input data from form
export const structuredInput = writable<StructuredInputData>(DEFAULT_STRUCTURED_INPUT);

// Upload states
export const uploadStates = writable<{
	projects: 'idle' | 'uploading' | 'success' | 'error';
	skills: 'idle' | 'uploading' | 'success' | 'error';
	research: 'idle' | 'uploading' | 'success' | 'error';
}>({
	projects: 'idle',
	skills: 'idle',
	research: 'idle'
});

// Error messages for uploads
export const uploadErrors = writable<{
	projects: string | null;
	skills: string | null;
	research: string | null;
}>({
	projects: null,
	skills: null,
	research: null
});

// Conversation history with LLM
export const conversation = writable<Array<{
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}>>([]);

// Generated module specification
export const generatedModule = writable<string | null>(null);

// Derived store - are all files uploaded successfully?
export const allFilesUploaded = derived(
	[projectsFile, skillsFile, researchFile],
	([$projectsFile, $skillsFile, $researchFile]) =>
		$projectsFile !== null && $skillsFile !== null && $researchFile !== null
);

// Derived store - can we proceed to next step?
export const canProceedToStep2 = derived(
	[allFilesUploaded, uploadStates],
	([$allFilesUploaded, $uploadStates]) =>
		$allFilesUploaded &&
		$uploadStates.projects === 'success' &&
		$uploadStates.skills === 'success' &&
		$uploadStates.research === 'success'
);

// Reset all state (for starting over)
export function resetWorkflow() {
	currentStep.reset();
	projectsFile.set(null);
	skillsFile.set(null);
	researchFile.set(null);
	structuredInput.set(DEFAULT_STRUCTURED_INPUT);
	uploadStates.set({ projects: 'idle', skills: 'idle', research: 'idle' });
	uploadErrors.set({ projects: null, skills: null, research: null });
	conversation.set([]);
	generatedModule.set(null);
}
