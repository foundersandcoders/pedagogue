<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from "svelte";
	import type { CourseData, ModuleSlot, Arc } from "$lib/types/themis";
	import { currentCourse, moduleStatusCounts, allModulesComplete, updateModuleWithOverview } from "$lib/stores/themisStores";
	import { updateModuleStatus, updateModuleWithGeneratedData, updateModuleWithError, setLastAttemptedGeneration } from "$lib/utils/themis/moduleStoreHelpers";
	import { buildKnowledgeContext, getPrecedingModules } from "$lib/utils/themis/knowledgeContextBuilder";
	import ExportButton from "$lib/components/theia/ExportButton.svelte";
	import ProgressSummary from "./ProgressSummary.svelte";
	import ArcSection from "./ArcSection.svelte";
	import ModulePreviewModal from "./ModulePreviewModal.svelte";

	export let courseData: CourseData;

	const dispatch = createEventDispatcher<{
		submit: void;
		back: void;
	}>();

	// Local state
	let expandedArcId: string | null = null;
	let generatingModuleId: string | null = null;
	let previewModuleId: string | null = null;

	// Track active SSE readers for cleanup
	const activeReaders = new Set<ReadableStreamDefaultReader<Uint8Array>>();

	// Reactive computed values
	$: totalModules = courseData.arcs.reduce((sum, arc) => sum + arc.modules.length, 0);
	$: completedModules = $moduleStatusCounts.complete;

	// Create exportable content for Theia
	$: exportableContent = {
		type: "course" as const,
		data: courseData
	};

	// Preview module reference
	$: previewModule = previewModuleId
		? courseData.arcs.flatMap(arc => arc.modules).find(m => m.id === previewModuleId)
		: null;

	onMount(() => {
		// Expand first arc by default
		if (courseData.arcs.length > 0) {
			expandedArcId = courseData.arcs[0].id;
		}
	});

	onDestroy(() => {
		// Cancel all active SSE streams on component unmount
		activeReaders.forEach(reader => {
			reader.cancel().catch(err => {
				console.warn('Error cancelling reader:', err);
			});
		});
		activeReaders.clear();
	});

	function handleToggleArc(event: CustomEvent<{ arcId: string }>) {
		const { arcId } = event.detail;
		expandedArcId = expandedArcId === arcId ? null : arcId;
	}

	async function generateOverview(module: ModuleSlot, arc: Arc): Promise<void> {
		// Update status to generating and track attempt type
		setLastAttemptedGeneration(module.id, 'overview');
		updateModuleStatus(module.id, 'generating');
		generatingModuleId = module.id;

		try {
			// Get preceding modules and build knowledge context
			const precedingModules = getPrecedingModules(module, courseData);

			// Send request to overview generation endpoint
			const response = await fetch('/api/themis/module/overview', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					moduleSlot: module,
					courseContext: {
						title: courseData.title,
						courseNarrative: courseData.courseNarrative || '',
						arcNarrative: arc.arcThemeNarrative || '',
						precedingModules // Full modules with overview data
					}
				})
			});

			if (!response.ok) {
				throw new Error(`Overview generation failed: ${response.status}`);
			}

			const result = await response.json();

			if (!result.success || !result.overview) {
				throw new Error(result.error || 'Overview generation failed');
			}

			// Update module with overview
			updateModuleWithOverview(module.id, result.overview);
			generatingModuleId = null;

		} catch (error) {
			console.error('Overview generation error:', error);
			handleGenerationError(module.id, error instanceof Error ? error.message : 'Overview generation failed');
		}
	}

	async function generateModule(module: ModuleSlot, arc: Arc): Promise<void> {
		// Update status to generating and track attempt type
		setLastAttemptedGeneration(module.id, 'full');
		updateModuleStatus(module.id, 'generating');
		generatingModuleId = module.id;

		// Create a promise that resolves when generation completes or errors
		return new Promise<void>((resolve, reject) => {
			// Store resolve/reject for this module
			const completionHandlers = {
				resolve,
				reject
			};

			// Track this generation's handlers
			const handleComplete = (event: any) => {
				if (event.type === 'complete') {
					completionHandlers.resolve();
				} else if (event.type === 'error') {
					completionHandlers.reject(new Error(event.message || 'Generation failed'));
				}
			};

			(async () => {
				try {
					// Get preceding modules and build knowledge context
					const precedingModules = getPrecedingModules(module, courseData);
					const knowledgeContext = buildKnowledgeContext(precedingModules, arc, courseData);

					// Send POST request with SSE streaming
					const response = await fetch('/api/themis/module', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'text/event-stream'
						},
						body: JSON.stringify({
							moduleSlot: module,
							courseContext: {
								title: courseData.title,
								courseNarrative: courseData.courseNarrative || '',
								progressionNarrative: courseData.progressionNarrative || '',
								arcNarrative: arc.arcThemeNarrative || '',
								arcProgression: arc.arcProgressionNarrative || '',
								precedingModules: getPrecedingModuleTitles(module, arc),
								knowledgeContext // Add knowledge context
							},
							enableResearch: true
						})
					});

					if (!response.ok) {
						throw new Error(`Generation failed: ${response.status}`);
					}

					// Handle SSE stream
					const reader = response.body?.getReader();
					if (!reader) {
						throw new Error('No response body');
					}

					// Track reader for cleanup
					activeReaders.add(reader);

					try {
						const decoder = new TextDecoder();
						let buffer = '';

						while (true) {
							const { done, value } = await reader.read();

							if (done) break;

							buffer += decoder.decode(value, { stream: true });
							const lines = buffer.split('\n\n');
							buffer = lines.pop() || '';

							for (const line of lines) {
								if (line.startsWith('data: ')) {
									const data = JSON.parse(line.slice(6));
									handleSSEEvent(module.id, data);
									handleComplete(data);
								}
							}
						}
					} finally {
						// Remove from active readers when done
						activeReaders.delete(reader);
					}

				} catch (error) {
					console.error('Generation error:', error);
					handleGenerationError(module.id, error instanceof Error ? error.message : 'Generation failed');
					completionHandlers.reject(error);
				}
			})();
		});
	}

	function handleSSEEvent(moduleId: string, event: any) {
		console.log('SSE Event:', event);

		switch (event.type) {
			case 'complete':
				handleGenerationComplete(moduleId, event.xmlContent);
				break;

			case 'error':
				handleGenerationError(moduleId, event.message);
				break;

			case 'progress':
			case 'validation_started':
			case 'validation_success':
				// Visual feedback could be added here
				break;
		}
	}

	function handleGenerationComplete(moduleId: string, xmlContent: string) {
		// Use helper function for store update
		updateModuleWithGeneratedData(moduleId, xmlContent);
		generatingModuleId = null;

		// Check if all modules are complete
		if ($allModulesComplete) {
			alert('All modules generated successfully! Ready to review and export.');
		}
	}

	function handleGenerationError(moduleId: string, errorMessage: string) {
		// Use helper function for store update
		updateModuleWithError(moduleId, errorMessage);
		generatingModuleId = null;
	}

	function getPrecedingModuleTitles(currentModule: ModuleSlot, currentArc: Arc): string[] {
		const titles: string[] = [];

		for (const arc of courseData.arcs) {
			// If we've reached the current arc
			if (arc.id === currentArc.id) {
				// Add modules from current arc up to (but not including) current module
				for (const module of arc.modules) {
					if (module.id === currentModule.id) break;
					titles.push(module.title);
				}
				break;
			}

			// Add all modules from previous arcs
			titles.push(...arc.modules.map(m => m.title));
		}

		return titles;
	}

	async function generateAll() {
		for (const arc of courseData.arcs) {
			for (const module of arc.modules) {
				if (module.status !== 'complete') {
					try {
						// generateModule now returns a Promise that resolves when complete
						await generateModule(module, arc);
					} catch (error) {
						// Error already handled in generateModule, continue to next
						console.error(`Failed to generate module ${module.title}:`, error);
					}
				}
			}
		}
	}

	function handleGenerateModule(event: CustomEvent<{ module: ModuleSlot; arc: Arc }>) {
		const { module, arc } = event.detail;
		generateModule(module, arc);
	}

	function handleGenerateOverview(event: CustomEvent<{ module: ModuleSlot; arc: Arc }>) {
		const { module, arc } = event.detail;
		generateOverview(module, arc);
	}

	function handleViewPreview(event: CustomEvent<{ moduleId: string }>) {
		previewModuleId = event.detail.moduleId;
	}

	function closePreview() {
		previewModuleId = null;
	}

	function handleSubmit() {
		if (!$allModulesComplete) {
			const confirmed = confirm('Not all modules are complete. Proceed anyway?');
			if (!confirmed) return;
		}

		dispatch('submit');
	}

	function handleBack() {
		dispatch('back');
	}
</script>

<div class="module-generation-list">
	<header class="section-header">
		<div class="header-content">
			<div class="header-text">
				<h2>Module Generation</h2>
				<p>Generate content for each module in your course structure</p>
			</div>
			<div class="header-actions">
				<ExportButton
					content={exportableContent}
					label="Export Course"
					variant="secondary"
					size="medium"
				/>
			</div>
		</div>
	</header>

	<!-- Overall Progress -->
	<ProgressSummary
		{totalModules}
		{completedModules}
		statusCounts={$moduleStatusCounts}
	/>

	<!-- Generation Controls -->
	<div class="generation-controls">
		<button
			class="btn btn-primary"
			on:click={generateAll}
			disabled={generatingModuleId !== null || $allModulesComplete}
		>
			{#if $allModulesComplete}
				All Modules Generated
			{:else if generatingModuleId}
				Generating...
			{:else}
				Generate All Modules
			{/if}
		</button>
	</div>

	<!-- Arc-grouped Module List -->
	<div class="arc-list">
		{#each courseData.arcs as arc (arc.id)}
			<ArcSection
				{arc}
				isExpanded={expandedArcId === arc.id}
				{generatingModuleId}
				on:toggle={handleToggleArc}
				on:generateModule={handleGenerateModule}
				on:generateOverview={handleGenerateOverview}
				on:viewPreview={handleViewPreview}
			/>
		{/each}
	</div>

	<!-- Navigation -->
	<div class="navigation-buttons">
		<button class="btn btn-secondary" on:click={handleBack}>
			← Back to Structure Review
		</button>

		<button
			class="btn btn-primary"
			on:click={handleSubmit}
			disabled={!$allModulesComplete && $moduleStatusCounts.complete === 0}
		>
			Continue to Review & Export →
		</button>
	</div>
</div>

<!-- Module Preview Modal -->
<ModulePreviewModal
	module={previewModule}
	isOpen={previewModuleId !== null}
	on:close={closePreview}
/>

<style>
	.module-generation-list {
		max-width: 1000px;
		margin: 0 auto;
	}

	.section-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-text {
		flex: 1;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.section-header h2 {
		font-size: 1.75rem;
		color: var(--palette-foreground);
		margin-bottom: 0.5rem;
	}

	.section-header p {
		color: var(--palette-foreground-alt);
		font-size: 1rem;
	}

	.generation-controls {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.arc-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--palette-foreground);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--palette-foreground-alt);
	}

	.btn-primary:disabled {
		background: var(--palette-line);
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--palette-bg-subtle);
		color: var(--palette-foreground);
		border: 1px solid var(--palette-foreground);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--palette-bg-nav);
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
		}

		.navigation-buttons {
			flex-direction: column;
		}
	}
</style>
