<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ResearchConfig } from "$lib/schemas/apiValidator";
  import DomainSelector from "$lib/components/metis/DomainSelector.svelte";

  export let researchConfig: ResearchConfig = {
    level: "all",
    domainConfig: {
      useList: "ai-engineering",
      customDomains: [],
    },
  };

  export let levelType: "course" | "arc" | "module" = "course";

  const dispatch = createEventDispatcher<{
    change: ResearchConfig;
  }>();

  // Label text based on level type
  const labels = {
    course: {
      all: "Enable research for all modules in all arcs",
      selective: "Configure research per arc",
      none: "Disable research for all modules",
    },
    arc: {
      all: "Enable research for all modules in this arc",
      selective: "Configure research per module",
      none: "Disable research for this arc",
    },
    module: {
      all: "Enable research",
      selective: "Enable research", // Not used for modules
      none: "Disable research",
    },
  };

  function handleLevelChange() {
    // Initialize domainConfig when switching to 'all'
    if (researchConfig.level === "all" && !researchConfig.domainConfig) {
      researchConfig.domainConfig = {
        useList: "ai-engineering",
        customDomains: [],
      };
    }

    dispatch("change", researchConfig);
  }

  function handleDomainConfigChange(event: CustomEvent) {
    researchConfig.domainConfig = event.detail;
    dispatch("change", researchConfig);
  }
</script>

<div class="research-config-selector">
  <div class="config-level-options">
    {#if levelType === "module"}
      <!-- Simplified for modules: just enable/disable -->
      <label class="radio-label">
        <input
          type="radio"
          name="researchLevel-{levelType}"
          value="all"
          bind:group={researchConfig.level}
          on:change={handleLevelChange}
        />
        <span class="radio-text">
          <strong>{labels.module.all}</strong>
          <span class="radio-hint">
            Use web search to find current information for this module
          </span>
        </span>
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="researchLevel-{levelType}"
          value="none"
          bind:group={researchConfig.level}
          on:change={handleLevelChange}
        />
        <span class="radio-text">
          <strong>{labels.module.none}</strong>
          <span class="radio-hint"> Generate module without web research </span>
        </span>
      </label>
    {:else}
      <!-- Full options for course/arc -->
      <label class="radio-label">
        <input
          type="radio"
          name="researchLevel-{levelType}"
          value="all"
          bind:group={researchConfig.level}
          on:change={handleLevelChange}
        />
        <span class="radio-text">
          <strong>{labels[levelType].all}</strong>
          <span class="radio-hint">
            All child modules will use the same research configuration
          </span>
        </span>
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="researchLevel-{levelType}"
          value="selective"
          bind:group={researchConfig.level}
          on:change={handleLevelChange}
        />
        <span class="radio-text">
          <strong>{labels[levelType].selective}</strong>
          <span class="radio-hint">
            Configure research individually for each child
          </span>
        </span>
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="researchLevel-{levelType}"
          value="none"
          bind:group={researchConfig.level}
          on:change={handleLevelChange}
        />
        <span class="radio-text">
          <strong>{labels[levelType].none}</strong>
          <span class="radio-hint">
            No research will be performed for any child modules
          </span>
        </span>
      </label>
    {/if}
  </div>

  {#if researchConfig.level === "all"}
    <div class="domain-config-section">
      <h4>Research Domains</h4>
      <DomainSelector
        domainConfig={researchConfig.domainConfig || {
          useList: "ai-engineering",
          customDomains: [],
        }}
        on:change={handleDomainConfigChange}
      />
    </div>
  {/if}
</div>

<style>
  .research-config-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .config-level-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .radio-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
    padding: 1rem;
    border-radius: 6px;
    border: 2px solid var(--palette-line);
    transition: all 0.2s;
  }

  .radio-label:hover {
    background: var(--palette-bg-subtle);
    border-color: var(--palette-primary);
  }

  .radio-label:has(input:checked) {
    background: var(--palette-bg-subtle);
    border-color: var(--palette-primary);
  }

  .radio-label input[type="radio"] {
    margin-top: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  .radio-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .radio-text strong {
    color: var(--palette-foreground);
    font-size: 1rem;
  }

  .radio-hint {
    font-weight: 400;
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
  }

  .domain-config-section {
    padding: 1.5rem;
    background: var(--palette-bg-subtle);
    border-radius: 6px;
    border: 1px solid var(--palette-line);
  }

  .domain-config-section h4 {
    margin: 0 0 1rem 0;
    color: var(--palette-foreground);
    font-size: 1rem;
    font-weight: 600;
  }
</style>
