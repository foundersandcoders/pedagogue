<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData, Arc } from "$lib/types/course";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    submit: { arcs: Arc[] };
    back: void;
  }>();

  let arcs: Arc[] = courseData.arcs.length > 0
    ? courseData.arcs
    : [createEmptyArc(1)];

  let errors: { [key: number]: string } = {};

  function createEmptyArc(order: number): Arc {
    return {
      id: crypto.randomUUID(),
      order,
      title: "",
      description: "",
      theme: "",
      durationWeeks: 4,
      modules: []
    };
  }

  function addArc() {
    const nextOrder = arcs.length + 1;
    arcs = [...arcs, createEmptyArc(nextOrder)];
  }

  function removeArc(index: number) {
    if (arcs.length === 1) return; // Keep at least one arc

    arcs = arcs.filter((_, i) => i !== index);

    // Reorder remaining arcs
    arcs = arcs.map((arc, i) => ({
      ...arc,
      order: i + 1,
    }));
  }

  function validateArcs(): boolean {
    errors = {};
    let isValid = true;

    arcs.forEach((arc, index) => {
      if (!arc.title?.trim()) {
        errors[index] = "Arc title is required";
        isValid = false;
      }

      if (!arc.theme?.trim()) {
        errors[index] = "Arc theme is required";
        isValid = false;
      }

      if (arc.durationWeeks < 1 || arc.durationWeeks > courseData.logistics.totalWeeks) {
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
    if (validateArcs()) {
      dispatch("submit", { arcs });
    }
  }

  function handleBack() {
    dispatch("back");
  }

  function suggestArcs() {
    const totalWeeks = courseData.logistics.totalWeeks;

    // Suggest arc breakdown based on course length
    // Arcs are thematic, so they should be longer than individual modules
    let suggestedCount: number;
    let suggestedDuration: number;

    if (totalWeeks <= 8) {
      suggestedCount = 2; // Two thematic arcs
      suggestedDuration = Math.ceil(totalWeeks / 2);
    } else if (totalWeeks <= 16) {
      suggestedCount = 3; // Three thematic arcs
      suggestedDuration = Math.ceil(totalWeeks / 3);
    } else {
      suggestedCount = 4; // Four thematic arcs
      suggestedDuration = Math.ceil(totalWeeks / 4);
    }

    arcs = Array.from({ length: suggestedCount }, (_, i) => createEmptyArc(i + 1))
      .map((arc, index) => ({
        ...arc,
        durationWeeks: suggestedDuration,
        title: `Arc ${arc.order}`,
        description: "Describe the broad thematic focus of this arc",
        theme: "Enter a theme (e.g., 'Foundation Concepts', 'Agentic Workflows')"
      }));
  }

  // Computed values
  $: totalWeeksUsed = arcs.reduce((sum, a) => sum + (a.durationWeeks || 0), 0);
  $: weeksRemaining = courseData.logistics.totalWeeks - totalWeeksUsed;
  $: isOverBudget = totalWeeksUsed > courseData.logistics.totalWeeks;
</script>

<div class="arc-planner">
  <div class="planner-header">
    <h2>Arc Structure Planning</h2>
    <p class="description">
      Define thematic arcs for your {courseData.logistics.totalWeeks}-week course.
      Think in terms of broad themes and learning phases, not granular outcomes.
    </p>
    <p class="guidance">
      <strong>Example themes:</strong> "Foundation Concepts", "Agentic Workflows", "Production Systems", "Advanced Patterns"
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
      {#each arcs as arc, index}
        <div
          class="timeline-arc"
          style="width: {(arc.durationWeeks / courseData.logistics.totalWeeks) * 100}%"
          title="Arc {arc.order}: {arc.title || 'Untitled'} ({arc.durationWeeks} week{arc.durationWeeks !== 1 ? 's' : ''})"
        >
          <span class="arc-label">A{arc.order}</span>
        </div>
      {/each}
    </div>
    <div class="timeline-weeks">
      {#each Array(courseData.logistics.totalWeeks) as _, week}
        <span class="week-marker">{week + 1}</span>
      {/each}
    </div>
  </div>

  <div class="arcs-list">
    <div class="list-header">
      <h3>Arcs</h3>
      <button type="button" class="suggest-btn" on:click={suggestArcs}>
        ✨ Auto-Suggest Structure
      </button>
    </div>

    {#each arcs as arc, index (arc.id)}
      <div class="arc-card" class:error={errors[index]}>
        <div class="arc-header">
          <span class="arc-number">Arc {arc.order}</span>
          {#if arcs.length > 1}
            <button
              type="button"
              class="remove-btn"
              on:click={() => removeArc(index)}
              aria-label="Remove arc {arc.order}"
            >
              ×
            </button>
          {/if}
        </div>

        <div class="arc-fields">
          <div class="field">
            <label for="title-{arc.id}">
              Arc Title
              <span class="required">*</span>
            </label>
            <input
              id="title-{arc.id}"
              type="text"
              bind:value={arc.title}
              placeholder="e.g., Foundation Concepts"
              required
            />
          </div>

          <div class="field">
            <label for="theme-{arc.id}">
              Theme
              <span class="required">*</span>
            </label>
            <input
              id="theme-{arc.id}"
              type="text"
              bind:value={arc.theme}
              placeholder="e.g., Agentic Workflows"
              required
            />
          </div>

          <div class="field">
            <label for="duration-{arc.id}">
              Duration (weeks)
              <span class="required">*</span>
            </label>
            <input
              id="duration-{arc.id}"
              type="number"
              min="1"
              max={courseData.logistics.totalWeeks}
              bind:value={arc.durationWeeks}
              required
            />
          </div>

          <div class="field full-width">
            <label for="description-{arc.id}">
              Thematic Description
              <span class="optional">(optional)</span>
            </label>
            <textarea
              id="description-{arc.id}"
              rows="2"
              bind:value={arc.description}
              placeholder="Describe the broad focus and learning phase this arc represents..."
            ></textarea>
          </div>
        </div>

        {#if errors[index]}
          <div class="field-error">{errors[index]}</div>
        {/if}
      </div>
    {/each}

    <button type="button" class="add-arc-btn" on:click={addArc}>
      + Add Arc
    </button>
  </div>

  <div class="actions">
    <button type="button" class="back-btn" on:click={handleBack}>
      ← Back to Configuration
    </button>
    <button type="button" class="submit-btn" on:click={handleSubmit}>
      Continue to Module Planning →
    </button>
  </div>
</div>

<style>
  .arc-planner {
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
    margin: 0 0 0.5rem 0;
  }

  .guidance {
    color: #495057;
    background: #e7f3ff;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border-left: 3px solid #0066cc;
    font-size: 0.9rem;
    margin: 0;
  }

  .guidance strong {
    color: #0066cc;
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

  .timeline-arc {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    border-right: 2px solid white;
    transition: all 0.3s;
    cursor: pointer;
  }

  .timeline-arc:hover {
    filter: brightness(1.1);
    transform: scaleY(1.05);
  }

  .timeline-arc:last-child {
    border-right: none;
  }

  .arc-label {
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

  .arcs-list {
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

  .arc-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
    border: 2px solid #e9ecef;
    transition: all 0.2s;
  }

  .arc-card:hover {
    border-color: #0066cc;
  }

  .arc-card.error {
    border-color: #dc3545;
  }

  .arc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
  }

  .arc-number {
    font-weight: 700;
    color: #0066cc;
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

  .arc-fields {
    display: grid;
    grid-template-columns: 1fr 1fr 120px;
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
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  textarea {
    resize: vertical;
  }

  .field-error {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .add-arc-btn {
    width: 100%;
    padding: 1rem;
    background: white;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    color: #0066cc;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-arc-btn:hover {
    border-color: #0066cc;
    background: #e7f3ff;
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
    background: #0066cc;
    color: white;
  }

  .submit-btn:hover {
    background: #0052a3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }

  @media (max-width: 768px) {
    .week-summary {
      flex-direction: column;
      gap: 1rem;
    }

    .arc-fields {
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
