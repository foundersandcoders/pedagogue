import { writable, derived } from 'svelte/store';
import type { ArcFile, NextStepFile } from './xml-parser.ts';

// Current step in the workflow (1-6)
export const currentStep = writable<number>(1);

// Uploaded file contents
export const arcFile = writable<ArcFile | null>(null);
export const nextStepFile = writable<NextStepFile | null>(null);

// Upload states
export const uploadStates = writable<{
	arc: 'idle' | 'uploading' | 'success' | 'error';
	nextStep: 'idle' | 'uploading' | 'success' | 'error';
}>({
	arc: 'idle',
	nextStep: 'idle'
});

// Error messages for uploads
export const uploadErrors = writable<{
	arc: string | null;
	nextStep: string | null;
}>({
	arc: null,
	nextStep: null
});

// Conversation history with LLM
export const conversation = writable<Array<{
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}>>([]);

// Generated module specification
export const generatedModule = writable<string | null>(null);

// Derived store - are both files uploaded successfully?
export const bothFilesUploaded = derived(
	[arcFile, nextStepFile],
	([$arcFile, $nextStepFile]) => $arcFile !== null && $nextStepFile !== null
);

// Derived store - can we proceed to next step?
export const canProceedToStep2 = derived(
	[bothFilesUploaded, uploadStates],
	([$bothFilesUploaded, $uploadStates]) =>
		$bothFilesUploaded &&
		$uploadStates.arc === 'success' &&
		$uploadStates.nextStep === 'success'
);

// Reset all state (for starting over)
export function resetWorkflow() {
	currentStep.set(1);
	arcFile.set(null);
	nextStepFile.set(null);
	uploadStates.set({ arc: 'idle', nextStep: 'idle' });
	uploadErrors.set({ arc: null, nextStep: null });
	conversation.set([]);
	generatedModule.set(null);
}
