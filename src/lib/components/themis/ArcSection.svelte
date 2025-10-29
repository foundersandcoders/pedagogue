<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Arc, ModuleSlot } from "$lib/types/themis";
  import ModuleCard from "./ModuleCard.svelte";

  export let arc: Arc;
  export let isExpanded: boolean;
  export let generatingModuleId: string | null;

  const dispatch = createEventDispatcher<{
    toggle: { arcId: string };
    generateModule: { module: ModuleSlot; arc: Arc };
    generateOverview: { module: ModuleSlot; arc: Arc };
    viewPreview: { moduleId: string };
  }>();

  $: completedCount = arc.modules.filter((m) => m.status === "complete").length;
  $: canGenerate = generatingModuleId === null;

  function handleToggle() {
    dispatch("toggle", { arcId: arc.id });
  }

  function handleGenerateModule(
    event: CustomEvent<{ module: ModuleSlot; arc: Arc }>,
  ) {
    dispatch("generateModule", event.detail);
  }

  function handleGenerateOverview(
    event: CustomEvent<{ module: ModuleSlot; arc: Arc }>,
  ) {
    dispatch("generateOverview", event.detail);
  }

  function handleViewPreview(event: CustomEvent<{ moduleId: string }>) {
    dispatch("viewPreview", event.detail);
  }
</script>

<div class="arc-section">
  <button
    class="arc-header"
    on:click={handleToggle}
    class:expanded={isExpanded}
  >
    <div class="arc-header-content">
      <h3>
        <span class="arc-icon">{isExpanded ? "▼" : "▶"}</span>
        Arc {arc.order}: {arc.title}
      </h3>
      <p class="arc-theme">{arc.theme}</p>
    </div>
    <div class="arc-meta">
      <span class="arc-modules-count">
        {completedCount}/{arc.modules.length} modules
      </span>
    </div>
  </button>

  {#if isExpanded}
    <div class="module-list">
      {#each arc.modules as module (module.id)}
        <ModuleCard
          {module}
          {arc}
          isGenerating={generatingModuleId === module.id}
          {canGenerate}
          on:generate={handleGenerateModule}
          on:generateOverview={handleGenerateOverview}
          on:viewPreview={handleViewPreview}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .arc-section {
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
    border-radius: 8px;
    overflow: hidden;
  }

  .arc-header {
    width: 100%;
    padding: 1.5rem;
    background: var(--palette-bg-nav);
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;
  }

  .arc-header:hover {
    background: var(--palette-bg-subtle);
  }

  .arc-header.expanded {
    background: var(--palette-bg-subtle);
  }

  .arc-header-content {
    flex: 1;
    text-align: left;
  }

  .arc-header h3 {
    font-size: 1.25rem;
    color: var(--palette-foreground);
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .arc-icon {
    font-size: 0.875rem;
    color: var(--palette-foreground-alt);
  }

  .arc-theme {
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
    margin: 0;
    font-style: italic;
  }

  .arc-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .arc-modules-count {
    font-size: 0.875rem;
    color: var(--palette-foreground-alt);
    font-weight: 500;
  }

  .module-list {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
