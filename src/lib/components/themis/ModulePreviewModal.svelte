<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { ModuleSlot } from "$lib/types/themis";

	export let module: ModuleSlot | null;
	export let isOpen: boolean;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	function handleClose() {
		dispatch('close');
	}

	function handleOverlayClick() {
		handleClose();
	}

	function handleContentClick(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

{#if isOpen && module && module.moduleData}
	<div class="modal-overlay" on:click={handleOverlayClick}>
		<div class="modal-content" on:click={handleContentClick}>
			<div class="modal-header">
				<h3>{module.title}</h3>
				<button class="btn-close" on:click={handleClose}>×</button>
			</div>
			<div class="modal-body">
				<pre class="xml-preview">{module.moduleData.xmlContent}</pre>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={handleClose}>Close</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: color-mix(in srgb, black 50%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		max-width: 900px;
		max-height: 80vh;
		width: 90%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px color-mix(in srgb, black 10%, transparent);
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--palette-line);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		margin: 0;
		color: var(--palette-foreground);
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: var(--palette-foreground-alt);
		line-height: 1;
		padding: 0;
		width: 32px;
		height: 32px;
	}

	.btn-close:hover {
		color: var(--palette-foreground);
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.xml-preview {
		background: var(--palette-bg-subtle);
		border: 1px solid var(--palette-line);
		border-radius: 6px;
		padding: 1rem;
		overflow-x: auto;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--palette-line);
		display: flex;
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

	.btn-secondary {
		background: white;
		color: var(--palette-foreground);
		border: 1px solid var(--palette-foreground);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--palette-bg-nav);
	}
</style>
