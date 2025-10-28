<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ModuleSlot, Arc } from "$lib/types/themis";

	export let module: ModuleSlot;
	export let arc: Arc;
	export let isGenerating: boolean = false;
	export let canGenerate: boolean = true;

	const dispatch = createEventDispatcher<{
		generate: { module: ModuleSlot; arc: Arc };
		generateOverview: { module: ModuleSlot; arc: Arc };
		viewPreview: { moduleId: string };
	}>();

	function getStatusColor(status: ModuleSlot['status']): string {
		switch (status) {
			case 'complete': return 'var(--palette-foreground)';
			case 'generating': return 'var(--palette-foreground-alt)';
			case 'overview-ready': return 'var(--palette-foreground-alt)';
			case 'error': return 'var(--palette-primary)';
			default: return 'var(--palette-foreground-alt)';
		}
	}

	function getStatusIcon(status: ModuleSlot['status']): string {
		switch (status) {
			case 'complete': return '✓';
			case 'generating': return '↻';
			case 'overview-ready': return '◐';
			case 'error': return '!';
			default: return '○';
		}
	}

	function handleGenerate() {
		dispatch('generate', { module, arc });
	}

	function handleGenerateOverview() {
		dispatch('generateOverview', { module, arc });
	}

	function handleRetry() {
		// Retry the same type of generation that failed
		// Default to full generation if not tracked (backward compatibility)
		const attemptType = module.lastAttemptedGeneration || 'full';

		if (attemptType === 'overview') {
			dispatch('generateOverview', { module, arc });
		} else {
			dispatch('generate', { module, arc });
		}
	}

	function handleViewPreview() {
		dispatch('viewPreview', { moduleId: module.id });
	}
</script>

<div class="module-card" class:generating={isGenerating}>
	<div class="module-header">
		<div class="module-status" style="background-color: {getStatusColor(module.status)}">
			{getStatusIcon(module.status)}
		</div>
		<div class="module-info">
			<h4>{module.title}</h4>
			<p class="module-description">{module.description}</p>
			<div class="module-meta">
				<span>{module.durationWeeks} week{module.durationWeeks !== 1 ? 's' : ''}</span>
				{#if module.learningObjectives && module.learningObjectives.length > 0}
					<span>• {module.learningObjectives.length} objectives</span>
				{/if}
			</div>
		</div>
	</div>

	{#if module.errorMessage}
		<div class="error-message">
			<strong>Error:</strong> {module.errorMessage}
		</div>
	{/if}

	{#if module.overview}
		<div class="overview-section">
			<h5>Overview</h5>
			<div class="overview-content">
				<div class="overview-item">
					<strong>Learning Objectives:</strong>
					<ul>
						{#each module.overview.learningObjectives as objective}
							<li>{objective}</li>
						{/each}
					</ul>
				</div>
				<div class="overview-item">
					<strong>Prerequisites:</strong>
					<ul>
						{#each module.overview.prerequisites as prereq}
							<li>{prereq}</li>
						{/each}
					</ul>
				</div>
				<div class="overview-item">
					<strong>Key Concepts:</strong>
					<ul>
						{#each module.overview.keyConceptsIntroduced as concept}
							<li>{concept}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}

	<div class="module-actions">
		{#if module.status === 'planned'}
			<button
				class="btn btn-sm btn-overview"
				on:click={handleGenerateOverview}
				disabled={!canGenerate}
			>
				Generate Overview
			</button>
			<button
				class="btn btn-sm btn-secondary"
				on:click={handleGenerate}
				disabled={!canGenerate}
			>
				Skip to Full Module
			</button>
		{:else if module.status === 'overview-ready'}
			<button
				class="btn btn-sm btn-generate"
				on:click={handleGenerate}
				disabled={!canGenerate}
			>
				Generate Full Module
			</button>
		{:else if module.status === 'error'}
			<button
				class="btn btn-sm btn-generate"
				on:click={handleRetry}
				disabled={!canGenerate}
			>
				Retry {module.lastAttemptedGeneration === 'overview' ? 'Overview' : 'Generation'}
			</button>
		{:else if module.status === 'generating'}
			<button class="btn btn-sm" disabled>
				Generating...
			</button>
		{:else if module.status === 'complete'}
			<button
				class="btn btn-sm btn-secondary"
				on:click={handleViewPreview}
			>
				View Module
			</button>
			<button
				class="btn btn-sm"
				on:click={handleGenerate}
				disabled={!canGenerate}
			>
				Regenerate
			</button>
		{/if}
	</div>
</div>

<style>
	.module-card {
		border: 1px solid var(--palette-line);
		border-radius: 6px;
		padding: 1rem;
		transition: box-shadow 0.2s;
	}

	.module-card.generating {
		box-shadow: 0 0 0 2px var(--palette-foreground-alt);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	.module-header {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.module-status {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		flex-shrink: 0;
		background: var(--palette-foreground-alt);
	}

	.module-info {
		flex: 1;
	}

	.module-info h4 {
		font-size: 1.1rem;
		color: var(--palette-foreground);
		margin: 0 0 0.25rem 0;
	}

	.module-description {
		color: var(--palette-foreground-alt);
		font-size: 0.9rem;
		margin: 0 0 0.5rem 0;
		line-height: 1.5;
	}

	.module-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--palette-foreground-alt);
	}

	.error-message {
		background: var(--palette-bg-subtle-alt);
		border: 1px solid var(--palette-line);
		border-radius: 4px;
		padding: 0.75rem;
		margin-bottom: 1rem;
		color: var(--palette-primary);
		font-size: 0.875rem;
	}

	.overview-section {
		background: var(--palette-bg-subtle);
		border: 1px solid var(--palette-line);
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.overview-section h5 {
		font-size: 0.95rem;
		color: var(--palette-foreground);
		margin: 0 0 0.75rem 0;
		font-weight: 600;
	}

	.overview-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.overview-item {
		font-size: 0.875rem;
	}

	.overview-item strong {
		display: block;
		color: var(--palette-foreground);
		margin-bottom: 0.25rem;
	}

	.overview-item ul {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--palette-foreground-alt);
	}

	.overview-item li {
		margin: 0.25rem 0;
		line-height: 1.5;
	}

	.module-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
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

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: var(--palette-foreground);
		border: 1px solid var(--palette-foreground);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--palette-bg-nav);
	}

	.btn-generate {
		background: var(--palette-foreground-alt);
		color: white;
	}

	.btn-generate:hover:not(:disabled) {
		background: var(--palette-foreground);
	}

	.btn-overview {
		background: var(--palette-foreground);
		color: white;
	}

	.btn-overview:hover:not(:disabled) {
		background: var(--palette-foreground-alt);
	}

	@media (max-width: 768px) {
		.module-header {
			flex-direction: column;
		}

		.module-actions {
			flex-direction: column;
		}
	}
</style>
