<script lang="ts">
	import type { ModuleSlot } from "$lib/types/themis";

	export let totalModules: number;
	export let completedModules: number;
	export let statusCounts: Record<ModuleSlot['status'], number>;

	$: progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
</script>

<div class="progress-summary">
	<div class="progress-stats">
		<div class="stat">
			<span class="stat-value">{completedModules}/{totalModules}</span>
			<span class="stat-label">Modules Complete</span>
		</div>
		<div class="stat">
			<span class="stat-value">{statusCounts.generating}</span>
			<span class="stat-label">In Progress</span>
		</div>
		<div class="stat">
			<span class="stat-value">{statusCounts.error}</span>
			<span class="stat-label">Errors</span>
		</div>
	</div>

	<div class="progress-bar-container">
		<div class="progress-bar" style="width: {progressPercentage}%"></div>
	</div>
</div>

<style>
	.progress-summary {
		background: white;
		border: 1px solid var(--palette-line);
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.progress-stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: var(--palette-foreground);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--palette-foreground-alt);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.progress-bar-container {
		width: 100%;
		height: 12px;
		background: var(--palette-line);
		border-radius: 6px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--palette-foreground);
		transition: width 0.3s ease;
	}

	@media (max-width: 768px) {
		.progress-stats {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
