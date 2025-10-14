<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData, ModuleSlot } from "$lib/types/course";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    submit: { modules: ModuleSlot[] };
    back: void;
  }>();

  let modules: ModuleSlot[] = courseData.modules.length > 0
    ? courseData.modules
    : [createEmptyModule(1)];

  let errors: { [key: number]: string } = {};

  function createEmptyModule(order: number): ModuleSlot {
    return {
      id: crypto.randomUUID(),
      order,
      title: "",
      description: "",
      durationWeeks: 1,
      status: "planned",
    };
  }

  function addModule() {
    const nextOrder = modules.length + 1;
    modules = [...modules, createEmptyModule(nextOrder)];
  }

  function removeModule(index: number) {
    if (modules.length === 1) return; // Keep at least one module

    modules = modules.filter((_, i) => i !== index);

    // Reorder remaining modules
    modules = modules.map((module, i) => ({
      ...module,
      order: i + 1,
    }));
  }

  function validateModules(): boolean {
    errors = {};
    let isValid = true;

    modules.forEach((module, index) => {
      if (!module.title?.trim()) {
        errors[index] = "Module title is required";
        isValid = false;
      }

      if (module.durationWeeks < 1 || module.durationWeeks > courseData.logistics.totalWeeks) {
        errors[index] = `Duration must be between 1 and ${courseData.logistics.totalWeeks} weeks`;
        isValid = false;
      }
    });

    if (totalWeeksUsed > courseData.logistics.totalWeeks) {
      errors[-1] = `Total weeks (${totalWeeksUsed}) exceeds course duration (${courseData.logistics.totalWeeks})`;
      isValid = false;
    }

    return isValid;
  }

  function handleSubmit() {
    if (validateModules()) {
      dispatch("submit", { modules });
    }
  }

  function handleBack() {
    dispatch("back");
  }

  function suggestModules() {
    const totalWeeks = courseData.logistics.totalWeeks;

    // Suggest module breakdown based on course length
    let suggestedCount: number;
    let suggestedDuration: number;

    if (totalWeeks <= 4) {
      suggestedCount = totalWeeks; // 1 module per week
      suggestedDuration = 1;
    } else if (totalWeeks <= 8) {
      suggestedCount = Math.ceil(totalWeeks / 2);
      suggestedDuration = 2;
    } else if (totalWeeks <= 12) {
      suggestedCount = Math.ceil(totalWeeks / 3);
      suggestedDuration = 3;
    } else {
      suggestedCount = Math.ceil(totalWeeks / 4);
      suggestedDuration = 4;
    }

    modules = Array.from({ length: suggestedCount }, (_, i) => createEmptyModule(i + 1))
      .map(module => ({
        ...module,
        durationWeeks: suggestedDuration,
        title: `Module ${module.order}`,
      }));
  }

  // Computed values
  $: totalWeeksUsed = modules.reduce((sum, m) => sum + (m.durationWeeks || 0), 0);
  $: weeksRemaining = courseData.logistics.totalWeeks - totalWeeksUsed;
  $: isOverBudget = totalWeeksUsed > courseData.logistics.totalWeeks;
</script>

<div class="module-planner">
  <div class="planner-header">
    <h2>Module Structure Planning</h2>
    <p class="description">
      Define how your {courseData.logistics.totalWeeks}-week course will be divided into modules.
    </p>
  </div>

  <div class="week-summary" class:error={isOverBudget}>
    <div class="summary-item">
      <span class="label">Total Course Duration:</span>
      <span class="value">{courseData.logistics.totalWeeks} weeks</span>
    </div>
    <div class="summary-item">
      <span class="label">Weeks Allocated:</span>
      <span class="value" class:over={isOverBudget}>{totalWeeksUsed} weeks</span>
    </div>
    <div class="summary-item">
      <span class="label">Weeks Remaining:</span>
      <span class="value" class:negative={weeksRemaining < 0}>{weeksRemaining} weeks</span>
    </div>
  </div>

  {#if errors[-1]}
    <div class="global-error">
      {errors[-1]}
    </div>
  {/if}

  <div class="timeline-visual">
    <div class="timeline-bar">
      {#each modules as module, index}
        <div
          class="timeline-module"
          style="width: {(module.durationWeeks / courseData.logistics.totalWeeks) * 100}%"
          title="Module {module.order}: {module.title || 'Untitled'} ({module.durationWeeks} week{module.durationWeeks !== 1 ? 's' : ''})"
        >
          <span class="module-label">M{module.order}</span>
        </div>
      {/each}
    </div>
    <div class="timeline-weeks">
      {#each Array(courseData.logistics.totalWeeks) as _, week}
        <span class="week-marker">{week + 1}</span>
      {/each}
    </div>
  </div>

  <div class="modules-list">
    <div class="list-header">
      <h3>Modules</h3>
      <button type="button" class="suggest-btn" on:click={suggestModules}>
        ✨ Auto-Suggest Structure
      </button>
    </div>

    {#each modules as module, index (module.id)}
      <div class="module-card" class:error={errors[index]}>
        <div class="module-header">
          <span class="module-number">Module {module.order}</span>
          {#if modules.length > 1}
            <button
              type="button"
              class="remove-btn"
              on:click={() => removeModule(index)}
              aria-label="Remove module {module.order}"
            >
              ×
            </button>
          {/if}
        </div>

        <div class="module-fields">
          <div class="field">
            <label for="title-{module.id}">
              Module Title
              <span class="required">*</span>
            </label>
            <input
              id="title-{module.id}"
              type="text"
              bind:value={module.title}
              placeholder="e.g., Foundations of AI Development"
              required
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
              max={courseData.logistics.totalWeeks}
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
        </div>

        {#if errors[index]}
          <div class="field-error">{errors[index]}</div>
        {/if}
      </div>
    {/each}

    <button type="button" class="add-module-btn" on:click={addModule}>
      + Add Module
    </button>
  </div>

  <div class="actions">
    <button type="button" class="back-btn" on:click={handleBack}>
      ← Back to Configuration
    </button>
    <button type="button" class="submit-btn" on:click={handleSubmit}>
      Continue to Structure Review →
    </button>
  </div>
</div>

<style>
  .module-planner {
    max-width: 900px;
    margin: 0 auto;
  }

  .planner-header {
    margin-bottom: 2rem;
  }

  .planner-header h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .description {
    color: #666;
    margin: 0;
  }

  .week-summary {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    border: 2px solid #e9ecef;
  }

  .week-summary.error {
    border-color: #dc3545;
    background: #fff5f5;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .summary-item .label {
    font-size: 0.85rem;
    color: #666;
  }

  .summary-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #28a745;
  }

  .summary-item .value.over {
    color: #dc3545;
  }

  .summary-item .value.negative {
    color: #dc3545;
  }

  .global-error {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid #f5c6cb;
  }

  .timeline-visual {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
  }

  .timeline-bar {
    display: flex;
    height: 60px;
    background: #f8f9fa;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .timeline-module {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #28a745, #20c997);
    border-right: 2px solid white;
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
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .timeline-weeks {
    display: flex;
    padding-top: 0.5rem;
  }

  .week-marker {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    color: #999;
  }

  .modules-list {
    margin-bottom: 2rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .list-header h3 {
    margin: 0;
    color: #333;
  }

  .suggest-btn {
    padding: 0.5rem 1rem;
    background: #6f42c1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .suggest-btn:hover {
    background: #5a32a3;
    transform: translateY(-1px);
  }

  .module-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
    border: 2px solid #e9ecef;
    transition: all 0.2s;
  }

  .module-card:hover {
    border-color: #28a745;
  }

  .module-card.error {
    border-color: #dc3545;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
  }

  .module-number {
    font-weight: 700;
    color: #28a745;
    font-size: 1.1rem;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #dc3545;
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
    background: #f8d7da;
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
    color: #495057;
    font-size: 0.9rem;
  }

  .required {
    color: #dc3545;
  }

  .optional {
    font-weight: 400;
    color: #999;
    font-size: 0.85rem;
  }

  input,
  textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }

  textarea {
    resize: vertical;
  }

  .field-error {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .add-module-btn {
    width: 100%;
    padding: 1rem;
    background: white;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    color: #28a745;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-module-btn:hover {
    border-color: #28a745;
    background: #f0fff4;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;
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
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
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

    .timeline-weeks {
      font-size: 0.65rem;
    }
  }
</style>
