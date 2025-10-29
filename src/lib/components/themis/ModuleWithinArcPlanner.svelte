<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData, Arc, ModuleSlot } from "$lib/types/themis";
  import TitleInputField from "./TitleInputField.svelte";
  import ResearchConfigSelector from "./ResearchConfigSelector.svelte";
  import {
    createTitleInput,
    getDisplayTitle,
  } from "$lib/utils/themis/migrations";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    submit: { arcs: Arc[] };
    back: void;
  }>();

  let arcs: Arc[] = [...courseData.arcs];
  let selectedArcIndex = 0;
  let skipModulePlanning = false;
  let errors: { [key: string]: string } = {};

  function createEmptyModule(arcId: string, order: number): ModuleSlot {
    return {
      id: crypto.randomUUID(),
      arcId,
      order,
      titleInput: createTitleInput("literal", ""),
      title: "",
      description: "",
      durationWeeks: 1,
      status: "planned",
      researchConfig: {
        level: "all",
        domainConfig: {
          useList: "ai-engineering",
          customDomains: [],
        },
      },
    };
  }

  function addModuleToArc(arcIndex: number) {
    const arc = arcs[arcIndex];
    const nextOrder = arc.modules.length + 1;
    arc.modules = [...arc.modules, createEmptyModule(arc.id, nextOrder)];
    arcs = [...arcs]; // Trigger reactivity
  }

  function removeModule(arcIndex: number, moduleIndex: number) {
    const arc = arcs[arcIndex];
    if (arc.modules.length === 1) return; // Keep at least one module per arc

    arc.modules = arc.modules.filter((_, i) => i !== moduleIndex);

    // Reorder remaining modules
    arc.modules = arc.modules.map((module, i) => ({
      ...module,
      order: i + 1,
    }));

    arcs = [...arcs]; // Trigger reactivity
  }

  function autoSuggestModules() {
    arcs = arcs.map((arc) => {
      const weeks = arc.durationWeeks;
      let suggestedCount: number;
      let suggestedDuration: number;

      // Suggest module breakdown based on arc duration
      if (weeks <= 2) {
        suggestedCount = weeks;
        suggestedDuration = 1;
      } else if (weeks <= 4) {
        suggestedCount = 2;
        suggestedDuration = Math.ceil(weeks / 2);
      } else if (weeks <= 8) {
        suggestedCount = Math.ceil(weeks / 2);
        suggestedDuration = 2;
      } else {
        suggestedCount = Math.ceil(weeks / 3);
        suggestedDuration = 3;
      }

      return {
        ...arc,
        modules: Array.from({ length: suggestedCount }, (_, i) => ({
          id: crypto.randomUUID(),
          arcId: arc.id,
          order: i + 1,
          titleInput: createTitleInput(
            "prompt",
            `Module ${i + 1} within ${arc.title}`,
          ),
          title: `Module ${i + 1}`,
          description: "",
          durationWeeks: suggestedDuration,
          status: "planned" as const,
        })),
      };
    });
  }

  function validateArcsWithModules(): boolean {
    errors = {};
    let isValid = true;

    if (skipModulePlanning) {
      // No validation needed - AI will generate modules
      return true;
    }

    arcs.forEach((arc, arcIndex) => {
      // Check that each arc has at least one module
      if (arc.modules.length === 0) {
        errors[`arc-${arcIndex}`] = "Each arc must have at least one module";
        isValid = false;
      }

      // Validate each module
      arc.modules.forEach((module, moduleIndex) => {
        const key = `arc-${arcIndex}-module-${moduleIndex}`;

        // Validate module title input
        if (module.titleInput.type !== "undefined") {
          if (!module.titleInput.value?.trim()) {
            errors[key] =
              module.titleInput.type === "literal"
                ? "Module title is required"
                : "Module title guidance is required";
            isValid = false;
          }
        }

        if (
          module.durationWeeks < 1 ||
          module.durationWeeks > arc.durationWeeks
        ) {
          errors[key] =
            `Duration must be between 1 and ${arc.durationWeeks} weeks`;
          isValid = false;
        }
      });

      // Check that modules don't exceed arc duration
      const totalModuleWeeks = arc.modules.reduce(
        (sum, m) => sum + m.durationWeeks,
        0,
      );
      if (totalModuleWeeks > arc.durationWeeks) {
        errors[`arc-${arcIndex}-overflow`] =
          `Modules total ${totalModuleWeeks} weeks, exceeding arc duration of ${arc.durationWeeks} weeks`;
        isValid = false;
      }
    });

    return isValid;
  }

  function handleSubmit() {
    if (validateArcsWithModules()) {
      dispatch("submit", { arcs });
    }
  }

  function handleBack() {
    dispatch("back");
  }

  function handleModuleResearchConfigChange(
    arcIndex: number,
    moduleIndex: number,
    event: CustomEvent,
  ) {
    arcs[arcIndex].modules[moduleIndex].researchConfig = event.detail;
    arcs = [...arcs]; // Trigger reactivity
  }

  // Computed value for current arc
  $: currentArc = arcs[selectedArcIndex];
  $: moduleWeeksInCurrentArc =
    currentArc?.modules.reduce((sum, m) => sum + (m.durationWeeks || 0), 0) ||
    0;
  $: weeksRemainingInCurrentArc =
    (currentArc?.durationWeeks || 0) - moduleWeeksInCurrentArc;
  $: isCurrentArcOverBudget =
    moduleWeeksInCurrentArc > (currentArc?.durationWeeks || 0);
</script>

<div class="module-arc-planner">
  <div class="planner-header">
    <h2>Module Planning Within Arcs</h2>
    <p class="description">
      Define specific modules within each arc, or let AI auto-generate them.
    </p>
  </div>

  <div class="skip-option">
    <label class="skip-checkbox">
      <input type="checkbox" bind:checked={skipModulePlanning} />
      <span
        >Skip manual planning - let AI automatically break down each arc into
        modules</span
      >
    </label>
  </div>

  {#if !skipModulePlanning}
    <div class="arc-tabs">
      {#each arcs as arc, index}
        <button
          type="button"
          class="arc-tab"
          class:active={selectedArcIndex === index}
          on:click={() => (selectedArcIndex = index)}
        >
          <span class="tab-title">{arc.title || `Arc ${arc.order}`}</span>
          <span class="tab-meta"
            >{arc.durationWeeks}w | {arc.modules.length}m</span
          >
        </button>
      {/each}
    </div>

    <div class="auto-suggest-row">
      <button
        type="button"
        class="suggest-all-btn"
        on:click={autoSuggestModules}
      >
        Auto-Suggest Modules for All Arcs
      </button>
    </div>

    {#if currentArc}
      <div class="arc-section">
        <div class="arc-info">
          <h3>{currentArc.title}</h3>
          <p class="theme"><strong>Theme:</strong> {currentArc.theme}</p>
          {#if currentArc.description}
            <p class="arc-desc">{currentArc.description}</p>
          {/if}
        </div>

        <div class="week-summary" class:error={isCurrentArcOverBudget}>
          <div class="summary-item">
            <span class="label">Arc Duration:</span>
            <span class="value">{currentArc.durationWeeks} weeks</span>
          </div>
          <div class="summary-item">
            <span class="label">Modules Allocated:</span>
            <span class="value" class:over={isCurrentArcOverBudget}
              >{moduleWeeksInCurrentArc} weeks</span
            >
          </div>
          <div class="summary-item">
            <span class="label">Weeks Remaining:</span>
            <span class="value" class:negative={weeksRemainingInCurrentArc < 0}
              >{weeksRemainingInCurrentArc} weeks</span
            >
          </div>
        </div>

        {#if errors[`arc-${selectedArcIndex}-overflow`]}
          <div class="arc-error">
            {errors[`arc-${selectedArcIndex}-overflow`]}
          </div>
        {/if}

        {#if errors[`arc-${selectedArcIndex}`]}
          <div class="arc-error">
            {errors[`arc-${selectedArcIndex}`]}
          </div>
        {/if}

        <div class="timeline-visual">
          <div class="timeline-bar">
            {#each currentArc.modules as module}
              <div
                class="timeline-module"
                style="width: {(module.durationWeeks /
                  currentArc.durationWeeks) *
                  100}%"
                title="Module {module.order}: {module.title ||
                  'Untitled'} ({module.durationWeeks} week{module.durationWeeks !==
                1
                  ? 's'
                  : ''})"
              >
                <span class="module-label">M{module.order}</span>
              </div>
            {/each}
          </div>
          <div class="timeline-weeks">
            {#each Array(currentArc.durationWeeks) as _, week}
              <span class="week-marker">{week + 1}</span>
            {/each}
          </div>
        </div>

        <div class="modules-list">
          <h4>Modules in {currentArc.title}</h4>

          {#each currentArc.modules as module, moduleIndex (module.id)}
            <div
              class="module-card"
              class:error={errors[
                `arc-${selectedArcIndex}-module-${moduleIndex}`
              ]}
            >
              <div class="module-header">
                <span class="module-number">Module {module.order}</span>
                {#if currentArc.modules.length > 1}
                  <button
                    type="button"
                    class="remove-btn"
                    on:click={() => removeModule(selectedArcIndex, moduleIndex)}
                    aria-label="Remove module {module.order}"
                  >
                    &times;
                  </button>
                {/if}
              </div>

              <div class="module-fields">
                <div class="field full-width">
                  <TitleInputField
                    value={module.titleInput}
                    label="Module Title"
                    placeholder="e.g., Introduction to RAG Pipelines"
                    required={true}
                    onChange={(newValue) => {
                      module.titleInput = newValue;
                      // Update display title
                      if (newValue.type === "literal") {
                        module.title = newValue.value;
                      } else if (newValue.type === "prompt") {
                        module.title = `[${newValue.value}]`;
                      } else {
                        module.title = "[AI will decide]";
                      }
                    }}
                  />
                </div>

                <div class="field">
                  <label for="duration-{module.id}">
                    Duration (weeks)
                    <span class="required">*</span>
                  </label>
                  <input
                    id="duration-{module.id}"
                    type="number"
                    min="1"
                    max={currentArc.durationWeeks}
                    bind:value={module.durationWeeks}
                    required
                  />
                </div>

                <div class="field full-width">
                  <label for="description-{module.id}">
                    Brief Description
                    <span class="optional">(optional)</span>
                  </label>
                  <textarea
                    id="description-{module.id}"
                    rows="2"
                    bind:value={module.description}
                    placeholder="What will learners focus on in this module?"
                  ></textarea>
                </div>

                {#if currentArc.researchConfig?.level === "selective"}
                  <div class="field full-width research-config-field">
                    <label>Research Configuration for this Module</label>
                    <ResearchConfigSelector
                      researchConfig={module.researchConfig || {
                        level: "all",
                        domainConfig: {
                          useList: "ai-engineering",
                          customDomains: [],
                        },
                      }}
                      levelType="module"
                      on:change={(e) =>
                        handleModuleResearchConfigChange(
                          selectedArcIndex,
                          moduleIndex,
                          e,
                        )}
                    />
                  </div>
                {/if}
              </div>

              {#if errors[`arc-${selectedArcIndex}-module-${moduleIndex}`]}
                <div class="field-error">
                  {errors[`arc-${selectedArcIndex}-module-${moduleIndex}`]}
                </div>
              {/if}
            </div>
          {/each}

          <button
            type="button"
            class="add-module-btn"
            on:click={() => addModuleToArc(selectedArcIndex)}
          >
            + Add Module to {currentArc.title}
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="skip-message">
      <h3>AI will automatically generate modules</h3>
      <p>
        Based on your arc structure, AI will intelligently break down each arc
        into appropriate modules with detailed learning objectives and topics.
      </p>
    </div>
  {/if}

  <div class="actions">
    <button type="button" class="back-btn" on:click={handleBack}>
      ← Back to Arc Planning
    </button>
    <button type="button" class="submit-btn" on:click={handleSubmit}>
      Continue to Structure Review →
    </button>
  </div>
</div>

<style>
  .module-arc-planner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .planner-header {
    margin-bottom: 2rem;
  }

  .planner-header h2 {
    margin: 0 0 0.5rem 0;
    color: var(--palette-foreground);
  }

  .description {
    color: var(--palette-foreground-alt);
    margin: 0;
  }

  .skip-option {
    background: var(--palette-bg-subtle);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 2px solid var(--palette-line);
  }

  .skip-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: var(--palette-foreground-alt);
  }

  .skip-checkbox input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .arc-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .arc-tab {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem 1.5rem;
    background: var(--palette-bg-subtle);
    border: 2px solid var(--palette-line);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
  }

  .arc-tab:hover {
    border-color: var(--palette-secondary);
    background: var(--palette-bg-nav);
  }

  .arc-tab.active {
    border-color: var(--palette-secondary);
    background: var(--palette-bg-subtle-alt);
  }

  .tab-title {
    font-weight: 600;
    color: var(--palette-foreground);
    margin-bottom: 0.25rem;
  }

  .tab-meta {
    font-size: 0.85rem;
    color: var(--palette-foreground-alt);
  }

  .auto-suggest-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
  }

  .suggest-all-btn {
    padding: 0.5rem 1rem;
    background: var(--palette-accent);
    color: var(--palette-bg-subtle);
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .suggest-all-btn:hover {
    background: var(--palette-secondary);
    transform: translateY(-1px);
  }

  .arc-section {
    background: var(--palette-bg-subtle);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .arc-info {
    margin-bottom: 1.5rem;
  }

  .arc-info h3 {
    margin: 0 0 0.5rem 0;
    color: var(--palette-secondary);
  }

  .theme {
    margin: 0.5rem 0;
    color: var(--palette-foreground-alt);
    font-size: 0.95rem;
  }

  .arc-desc {
    color: var(--palette-foreground-alt);
    margin: 0.5rem 0 0 0;
    font-style: italic;
  }

  .week-summary {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
    background: var(--palette-bg-nav);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 2px solid var(--palette-line);
  }

  .week-summary.error {
    border-color: var(--palette-accent);
    background: var(--palette-bg-subtle-alt);
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .summary-item .label {
    font-size: 0.85rem;
    color: var(--palette-foreground-alt);
  }

  .summary-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--palette-foreground);
  }

  .summary-item .value.over {
    color: var(--palette-accent);
  }

  .summary-item .value.negative {
    color: var(--palette-accent);
  }

  .arc-error {
    background: var(--palette-bg-subtle-alt);
    color: var(--palette-primary);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border: 1px solid var(--palette-line);
  }

  .timeline-visual {
    margin-bottom: 2rem;
  }

  .timeline-bar {
    display: flex;
    height: 50px;
    background: var(--palette-bg-nav);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .timeline-module {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--palette-foreground),
      var(--palette-foreground-alt)
    );
    border-right: 2px solid var(--palette-bg-subtle);
    transition: all 0.3s;
    cursor: pointer;
  }

  .timeline-module:hover {
    filter: brightness(1.1);
    transform: scaleY(1.05);
  }

  .timeline-module:last-child {
    border-right: none;
  }

  .module-label {
    color: var(--palette-bg-subtle);
    font-weight: 700;
    font-size: 0.85rem;
  }

  .timeline-weeks {
    display: flex;
    padding-top: 0.5rem;
  }

  .week-marker {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    color: var(--palette-foreground-alt);
  }

  .modules-list h4 {
    margin: 0 0 1rem 0;
    color: var(--palette-foreground);
  }

  .module-card {
    background: var(--palette-bg-nav);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border: 2px solid var(--palette-line);
    transition: all 0.2s;
  }

  .module-card:hover {
    border-color: var(--palette-foreground);
  }

  .module-card.error {
    border-color: var(--palette-accent);
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--palette-line);
  }

  .module-number {
    font-weight: 700;
    color: var(--palette-foreground);
    font-size: 1rem;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--palette-accent);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: var(--palette-bg-subtle-alt);
  }

  .module-fields {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .field.full-width {
    grid-column: 1 / -1;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
  }

  .required {
    color: var(--palette-accent);
  }

  .optional {
    font-weight: 400;
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
  }

  input,
  textarea {
    padding: 0.75rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--palette-foreground);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--palette-foreground) 10%, transparent);
  }

  textarea {
    resize: vertical;
  }

  .field-error {
    color: var(--palette-accent);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .add-module-btn {
    width: 100%;
    padding: 1rem;
    background: var(--palette-bg-subtle);
    border: 2px dashed var(--palette-line);
    border-radius: 8px;
    color: var(--palette-foreground);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-module-btn:hover {
    border-color: var(--palette-foreground);
    background: var(--palette-bg-nav);
  }

  .skip-message {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--palette-bg-subtle);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .skip-message h3 {
    color: var(--palette-foreground);
    margin-bottom: 1rem;
  }

  .skip-message p {
    color: var(--palette-foreground);
    opacity: 0.8;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;
    margin-top: 2rem;
  }

  .back-btn,
  .submit-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-btn {
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    border: 1px solid var(--palette-line);
  }

  .back-btn:hover {
    background: #e9ecef;
  }

  .submit-btn {
    background: #28a745;
    color: white;
  }

  .submit-btn:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  @media (max-width: 768px) {
    .week-summary {
      flex-direction: column;
      gap: 1rem;
    }

    .module-fields {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
    }

    .arc-tabs {
      flex-direction: column;
    }

    .arc-tab {
      width: 100%;
    }
  }
</style>
