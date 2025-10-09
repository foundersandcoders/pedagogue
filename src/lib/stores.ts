import { writable, derived } from 'svelte/store';
import type { ProjectFile, PythonFile, ResearchFile } from './xml-parser.ts';

export interface StructuredInputData {
	moduleDuration: number;
	cohortSize: number;
	skillLevel: 'beginner' | 'intermediate' | 'advanced';
	deliveryDate: string;
	keyTechnologies: string[];
	additionalContext: string;
	enableResearch: boolean;
	useExtendedThinking: boolean;
}

// Current step in the workflow (1-6)
export const currentStep = writable<number>(1);

// Uploaded file contents
export const projectFile = writable<ProjectFile | null>(null);
export const pythonFile = writable<PythonFile | null>(null);
export const researchFile = writable<ResearchFile | null>(null);

// Structured input data from form
export const structuredInput = writable<StructuredInputData>({
	moduleDuration: 4,
	cohortSize: 20,
	skillLevel: 'intermediate',
	deliveryDate: '',
	keyTechnologies: [],
	additionalContext: '',
	enableResearch: true,
	useExtendedThinking: false
});

// Upload states
export const uploadStates = writable<{
	project: 'idle' | 'uploading' | 'success' | 'error';
	python: 'idle' | 'uploading' | 'success' | 'error';
	research: 'idle' | 'uploading' | 'success' | 'error';
}>({
	project: 'idle',
	python: 'idle',
	research: 'idle'
});

// Error messages for uploads
export const uploadErrors = writable<{
	project: string | null;
	python: string | null;
	research: string | null;
}>({
	project: null,
	python: null,
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
	[projectFile, pythonFile, researchFile],
	([$projectFile, $pythonFile, $researchFile]) =>
		$projectFile !== null && $pythonFile !== null && $researchFile !== null
);

// Derived store - can we proceed to next step?
export const canProceedToStep2 = derived(
	[allFilesUploaded, uploadStates],
	([$allFilesUploaded, $uploadStates]) =>
		$allFilesUploaded &&
		$uploadStates.project === 'success' &&
		$uploadStates.python === 'success' &&
		$uploadStates.research === 'success'
);

// Reset all state (for starting over)
export function resetWorkflow() {
	currentStep.set(1);
	projectFile.set(null);
	pythonFile.set(null);
	researchFile.set(null);
	structuredInput.set({
		moduleDuration: 4,
		cohortSize: 20,
		skillLevel: 'intermediate',
		deliveryDate: '',
		keyTechnologies: [],
		additionalContext: '',
		enableResearch: true,
		useExtendedThinking: false
	});
	uploadStates.set({ project: 'idle', python: 'idle', research: 'idle' });
	uploadErrors.set({ project: null, python: null, research: null });
	conversation.set([]);
	generatedModule.set(null);
}
