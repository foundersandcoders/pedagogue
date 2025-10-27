<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ExportConfigModal from "./ExportConfigModal.svelte";
  import type { ExportableContent, ExportConfig } from "$lib/types/theia";

  // Props
  export let content: ExportableContent;
  export let defaultConfig: Partial<ExportConfig> = {};
  export let label: string = "Export";
  export let variant: "primary" | "secondary" = "secondary";
  export let disabled: boolean = false;
  export let size: "small" | "medium" | "large" = "medium";

  const dispatch = createEventDispatcher<{
    export: { content: ExportableContent; config: ExportConfig };
  }>();

  let showModal = false;

  function handleClick() {
    showModal = true;
  }

  function handleExport(event: CustomEvent<{ config: ExportConfig }>) {
    dispatch("export", {
      content,
      config: event.detail.config,
    });
    showModal = false;
  }

  function handleCancel() {
    showModal = false;
  }
</script>

<button
  type="button"
  class="export-btn {variant} {size}"
  {disabled}
  on:click={handleClick}
>
  <span class="icon">📤</span>
  <span class="label">{label}</span>
</button>

{#if showModal}
  <ExportConfigModal
    {content}
    {defaultConfig}
    on:export={handleExport}
    on:cancel={handleCancel}
  />
{/if}

<style>
  .export-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes */
  .export-btn.small {
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
  }

  .export-btn.medium {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .export-btn.large {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  /* Variants */
  .export-btn.primary {
    background: var(--palette-foreground);
    color: white;
  }

  .export-btn.primary:hover:not(:disabled) {
    background: var(--palette-secondary);
  }

  .export-btn.secondary {
    background: white;
    color: var(--palette-foreground);
    border: 1px solid var(--palette-line);
  }

  .export-btn.secondary:hover:not(:disabled) {
    background: var(--palette-line);
  }

  .icon {
    font-size: 1.1em;
    line-height: 1;
  }

  .label {
    line-height: 1;
  }
</style>
