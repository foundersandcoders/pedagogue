import { writable, derived } from 'svelte/store';
import type { ProjectsFile, SkillsFile, ResearchFile } from './xml-parser.ts';

export interface StructuredInputData {
	logistics: {
	  duration: number;
		startDate: string;
	}
	learners: {
  	cohortSize: number;
  	experience: {
  	  prereq: '<= 1 year' | '1-3 years' | '>= 4 years';
  	  focus: 'no experience' | 'limited experience' | 'skilled amateur' | 'current professional';
    }
	}
	content: {
  	techs: string[];
  	info: string;
	}
	model: {
  	enableResearch: boolean;
  	useExtendedThinking: boolean;
	}
}

// Current step in the workflow (1-6)
export const currentStep = writable<number>(1);

// Uploaded file contents
export const projectsFile = writable<ProjectsFile | null>(null);
export const skillsFile = writable<SkillsFile | null>(null);
export const researchFile = writable<ResearchFile | null>(null);

// Structured input data from form
export const structuredInput = writable<StructuredInputData>({
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
  	useExtendedThinking: true
	}
});

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
	currentStep.set(1);
	projectsFile.set(null);
	skillsFile.set(null);
	researchFile.set(null);

	structuredInput.set({
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
     	useExtendedThinking: true
  	}
	});

	uploadStates.set({ projects: 'idle', skills: 'idle', research: 'idle' });
	uploadErrors.set({ projects: null, skills: null, research: null });
	conversation.set([]);

	generatedModule.set(null);
}
