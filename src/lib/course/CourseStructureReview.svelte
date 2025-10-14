<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { CourseData, ModuleSlot } from "$lib/types/course";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    submit: { modules: ModuleSlot[]; courseNarrative: string; progressionNarrative: string };
    back: void;
  }>();

  let isLoading = true;
  let error: string | null = null;
  let courseNarrative = "";
  let progressionNarrative = "";
  let modules: ModuleSlot[] = [...courseData.modules];
  let editingModule: string | null = null;

  onMount(async () => {
    await generateCourseStructure();
  });

  async function generateCourseStructure() {
    isLoading = true;
    error = null;

    try {
      const response = await fetch("/api/course/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          totalWeeks: courseData.logistics.totalWeeks,
          daysPerWeek: courseData.logistics.daysPerWeek,
          cohortSize: courseData.learners.cohortSize,
          structure: courseData.structure,
          learnerExperience: courseData.learners.experience,
          supportingDocuments: [],
          enableResearch: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.errors?.[0] || "Failed to generate structure");
      }

      courseNarrative = result.courseNarrative || "";
      progressionNarrative = result.progressionNarrative || "";

      // Merge AI-generated data with existing module slots
      modules = modules.map((module) => {
        const aiModule = result.modules.find((m: any) => m.order === module.order);
        if (aiModule) {
          return {
            ...module,
            title: aiModule.title || module.title,
            description: aiModule.description || module.description,
            durationWeeks: aiModule.suggestedDurationWeeks || module.durationWeeks,
            learningObjectives: aiModule.learningObjectives || [],
            keyTopics: aiModule.keyTopics || [],
          };
        }
        return module;
      });
    } catch (err) {
      console.error("Course structure generation failed:", err);
      error = err instanceof Error ? err.message : "Unknown error occurred";
    } finally {
      isLoading = false;
    }
  }

  function handleSubmit() {
    dispatch("submit", { modules, courseNarrative, progressionNarrative });
  }

  function handleBack() {
    dispatch("back");
  }

  function handleRegenerate() {
    generateCourseStructure();
  }

  function toggleEditModule(moduleId: string) {
    editingModule = editingModule === moduleId ? null : moduleId;
  }

  function addObjective(moduleIndex: number) {
    modules[moduleIndex].learningObjectives = [
      ...(modules[moduleIndex].learningObjectives || []),
      "",
    ];
  }

  function removeObjective(moduleIndex: number, objIndex: number) {
    if (modules[moduleIndex].learningObjectives) {
      modules[moduleIndex].learningObjectives = modules[moduleIndex].learningObjectives!.filter(
        (_, i) => i !== objIndex
      );
    }
  }

  function addTopic(moduleIndex: number) {
    modules[moduleIndex].keyTopics = [
      ...(modules[moduleIndex].keyTopics || []),
      "",
    ];
  }

  function removeTopic(moduleIndex: number, topicIndex: number) {
    if (modules[moduleIndex].keyTopics) {
      modules[moduleIndex].keyTopics = modules[moduleIndex].keyTopics!.filter(
        (_, i) => i !== topicIndex
      );
    }
  }
</script>

<div class="structure-review">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <h2>Generating Course Structure...</h2>
      <p>Claude is analyzing your course requirements and creating detailed module outlines.</p>
      <p class="loading-hint">This may take 30-60 seconds.</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Generation Failed</h2>
      <p class="error-message">{error}</p>
      <div class="error-actions">
        <button type="button" class="retry-btn" on:click={handleRegenerate}>
          🔄 Retry Generation
        </button>
        <button type="button" class="back-btn" on:click={handleBack}>
          ← Back to Planning
        </button>
      </div>
    </div>
  {:else}
    <div class="review-header">
      <h2>Course Structure Review</h2>
      <p class="description">
        Review and refine the AI-generated course structure. You can edit any field before proceeding.
      </p>
      <button type="button" class="regenerate-btn" on:click={handleRegenerate}>
        🔄 Regenerate Structure
      </button>
    </div>

    <section class="narrative-section">
      <h3>Course Narrative</h3>
      <div class="narrative-content">
        <textarea
          bind:value={courseNarrative}
          rows="6"
          placeholder="Overall course learning journey and narrative..."
        ></textarea>
      </div>
    </section>

    <section class="modules-section">
      <h3>Module Details ({modules.length} modules)</h3>

      {#each modules as module, index (module.id)}
        <div class="module-card">
          <div class="module-header">
            <div class="module-title-row">
              <span class="module-number">Module {module.order}</span>
              <h4>{module.title}</h4>
              <span class="module-duration">{module.durationWeeks} week{module.durationWeeks !== 1 ? 's' : ''}</span>
            </div>
            <button
              type="button"
              class="edit-toggle"
              on:click={() => toggleEditModule(module.id)}
            >
              {editingModule === module.id ? '✓ Done' : '✏️ Edit'}
            </button>
          </div>

          {#if editingModule === module.id}
            <div class="module-edit">
              <div class="field">
                <label for="title-{module.id}">Module Title</label>
                <input
                  id="title-{module.id}"
                  type="text"
                  bind:value={module.title}
                />
              </div>

              <div class="field">
                <label for="description-{module.id}">Description</label>
                <textarea
                  id="description-{module.id}"
                  rows="3"
                  bind:value={module.description}
                ></textarea>
              </div>

              <div class="field">
                <label for="duration-{module.id}">Duration (weeks)</label>
                <input
                  id="duration-{module.id}"
                  type="number"
                  min="1"
                  max={courseData.logistics.totalWeeks}
                  bind:value={module.durationWeeks}
                />
              </div>

              <div class="field">
                <label>
                  Learning Objectives
                  <button
                    type="button"
                    class="add-item-btn"
                    on:click={() => addObjective(index)}
                  >
                    + Add
                  </button>
                </label>
                {#if module.learningObjectives && module.learningObjectives.length > 0}
                  {#each module.learningObjectives as objective, objIndex}
                    <div class="list-item">
                      <input
                        type="text"
                        bind:value={module.learningObjectives[objIndex]}
                        placeholder="Learning objective..."
                      />
                      <button
                        type="button"
                        class="remove-item-btn"
                        on:click={() => removeObjective(index, objIndex)}
                      >
                        ×
                      </button>
                    </div>
                  {/each}
                {:else}
                  <p class="empty-list">No objectives yet. Click "+ Add" to create one.</p>
                {/if}
              </div>

              <div class="field">
                <label>
                  Key Topics
                  <button
                    type="button"
                    class="add-item-btn"
                    on:click={() => addTopic(index)}
                  >
                    + Add
                  </button>
                </label>
                {#if module.keyTopics && module.keyTopics.length > 0}
                  {#each module.keyTopics as topic, topicIndex}
                    <div class="list-item">
                      <input
                        type="text"
                        bind:value={module.keyTopics[topicIndex]}
                        placeholder="Key topic..."
                      />
                      <button
                        type="button"
                        class="remove-item-btn"
                        on:click={() => removeTopic(index, topicIndex)}
                      >
                        ×
                      </button>
                    </div>
                  {/each}
                {:else}
                  <p class="empty-list">No topics yet. Click "+ Add" to create one.</p>
                {/if}
              </div>
            </div>
          {:else}
            <div class="module-summary">
              <p class="module-description">{module.description}</p>

              {#if module.learningObjectives && module.learningObjectives.length > 0}
                <div class="objectives-preview">
                  <strong>Learning Objectives:</strong>
                  <ul>
                    {#each module.learningObjectives as objective}
                      <li>{objective}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if module.keyTopics && module.keyTopics.length > 0}
                <div class="topics-preview">
                  <strong>Key Topics:</strong>
                  <div class="topic-tags">
                    {#each module.keyTopics as topic}
                      <span class="topic-tag">{topic}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </section>

    <section class="narrative-section">
      <h3>Progression Narrative</h3>
      <div class="narrative-content">
        <textarea
          bind:value={progressionNarrative}
          rows="5"
          placeholder="How modules connect and build on each other..."
        ></textarea>
      </div>
    </section>

    <div class="actions">
      <button type="button" class="back-btn" on:click={handleBack}>
        ← Back to Module Planning
      </button>
      <button type="button" class="submit-btn" on:click={handleSubmit}>
        Continue to Module Generation →
      </button>
    </div>
  {/if}
</div>

<style>
  .structure-review {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Loading State */
  .loading-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #e9ecef;
    border-top-color: #28a745;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state h2 {
    margin-bottom: 1rem;
    color: #333;
  }

  .loading-state p {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .loading-hint {
    font-size: 0.9rem;
    font-style: italic;
    color: #999;
  }

  /* Error State */
  .error-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-state h2 {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  .error-message {
    color: #666;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8d7da;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .retry-btn {
    padding: 1rem 2rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-btn:hover {
    background: #218838;
  }

  /* Review Content */
  .review-header {
    margin-bottom: 2rem;
    position: relative;
  }

  .review-header h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .description {
    color: #666;
    margin: 0;
  }

  .regenerate-btn {
    position: absolute;
    top: 0;
    right: 0;
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

  .regenerate-btn:hover {
    background: #5a32a3;
  }

  /* Narrative Sections */
  .narrative-section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .narrative-section h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
  }

  .narrative-content textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
  }

  .narrative-content textarea:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }

  /* Modules Section */
  .modules-section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .modules-section h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
  }

  /* Module Cards */
  .module-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border: 2px solid #e9ecef;
    transition: all 0.2s;
  }

  .module-card:hover {
    border-color: #28a745;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .module-title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .module-number {
    font-weight: 700;
    color: #28a745;
    font-size: 0.9rem;
    background: white;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }

  .module-header h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    flex: 1;
  }

  .module-duration {
    font-size: 0.9rem;
    color: #666;
    background: white;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }

  .edit-toggle {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-toggle:hover {
    background: #e9ecef;
  }

  /* Module Summary View */
  .module-summary {
    padding: 1rem;
    background: white;
    border-radius: 6px;
  }

  .module-description {
    color: #495057;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .objectives-preview,
  .topics-preview {
    margin-top: 1rem;
  }

  .objectives-preview strong,
  .topics-preview strong {
    color: #495057;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .objectives-preview ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .objectives-preview li {
    color: #666;
    margin-bottom: 0.25rem;
    line-height: 1.5;
  }

  .topic-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .topic-tag {
    background: #28a745;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Module Edit View */
  .module-edit {
    padding: 1rem;
    background: white;
    border-radius: 6px;
  }

  .field {
    margin-bottom: 1.5rem;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .field label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
  }

  .field input[type="text"],
  .field input[type="number"],
  .field textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
  }

  .field input:focus,
  .field textarea:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }

  .field textarea {
    resize: vertical;
  }

  .add-item-btn {
    padding: 0.25rem 0.75rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-item-btn:hover {
    background: #218838;
  }

  .list-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .list-item input {
    flex: 1;
  }

  .remove-item-btn {
    width: 2rem;
    height: 2rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .remove-item-btn:hover {
    background: #c82333;
  }

  .empty-list {
    color: #999;
    font-style: italic;
    font-size: 0.9rem;
    margin: 0;
  }

  /* Actions */
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
    .review-header {
      margin-bottom: 3rem;
    }

    .regenerate-btn {
      position: static;
      width: 100%;
      margin-top: 1rem;
    }

    .module-title-row {
      flex-wrap: wrap;
    }

    .actions {
      flex-direction: column;
    }
  }
</style>
