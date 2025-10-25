<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData, ModuleSlot } from "$lib/types/themis";
  import ExportButton from "$lib/components/theia/ExportButton.svelte";
  import { resetCourseWorkflow } from "$lib/stores/themisStores";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    back: void;
    reset: void;
  }>();

  // Local state
  let expandedArcId: string | null = null;
  let previewModuleId: string | null = null;

  // Create exportable content for Theia
  $: exportableContent = {
    type: "course" as const,
    data: courseData
  };

  // Computed statistics
  $: totalModules = courseData.arcs.reduce((sum, arc) => sum + arc.modules.length, 0);
  $: completedModules = courseData.arcs.reduce((sum, arc) =>
    sum + arc.modules.filter(m => m.status === 'complete').length, 0
  );
  $: completionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  $: allComplete = totalModules > 0 && completedModules === totalModules;

  function toggleArc(arcId: string) {
    expandedArcId = expandedArcId === arcId ? null : arcId;
  }

  function viewModulePreview(moduleId: string) {
    previewModuleId = moduleId;
  }

  function closePreview() {
    previewModuleId = null;
  }

  function handleBack() {
    dispatch('back');
  }

  function handleReset() {
    const confirmed = confirm('Are you sure you want to reset and start a new course? This will clear all current progress.');
    if (confirmed) {
      resetCourseWorkflow();
      dispatch('reset');
    }
  }

  // Format date helper
  function formatDate(date: Date | string | undefined): string {
    if (!date) return 'Not set';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
</script>

<div class="course-overview">
  <header class="section-header">
    <div class="header-content">
      <div class="header-text">
        <h2>Course Review & Export</h2>
        <p>Review your complete course structure and export when ready</p>
      </div>
      <div class="header-actions">
        <ExportButton
          content={exportableContent}
          label="Export Course"
          variant="primary"
          size="large"
          disabled={!allComplete}
        />
      </div>
    </div>
  </header>

  <!-- Completion Status Banner -->
  {#if !allComplete}
    <div class="status-banner warning">
      <span class="banner-icon">⚠️</span>
      <div class="banner-content">
        <strong>Course Incomplete</strong>
        <p>{completedModules} of {totalModules} modules generated. Complete all modules before exporting.</p>
      </div>
    </div>
  {:else}
    <div class="status-banner success">
      <span class="banner-icon">✓</span>
      <div class="banner-content">
        <strong>Course Complete!</strong>
        <p>All {totalModules} modules have been successfully generated. Ready to export.</p>
      </div>
    </div>
  {/if}

  <!-- Course Metadata -->
  <section class="course-metadata">
    <h3>{courseData.title}</h3>
    <p class="course-description">{courseData.description}</p>

    <div class="metadata-grid">
      <div class="metadata-item">
        <span class="metadata-label">Duration</span>
        <span class="metadata-value">{courseData.logistics.totalWeeks} weeks</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Frequency</span>
        <span class="metadata-value">{courseData.logistics.daysPerWeek} day{courseData.logistics.daysPerWeek !== 1 ? 's' : ''}/week</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Start Date</span>
        <span class="metadata-value">{formatDate(courseData.logistics.startDate)}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Cohort Size</span>
        <span class="metadata-value">{courseData.learners.cohortSize} learners</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Structure</span>
        <span class="metadata-value">{courseData.structure === 'peer-led' ? 'Peer-Led' : 'Facilitated'}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Arcs</span>
        <span class="metadata-value">{courseData.arcs.length}</span>
      </div>
    </div>
  </section>

  <!-- Course Statistics -->
  <section class="course-stats">
    <div class="stat-card">
      <span class="stat-value">{totalModules}</span>
      <span class="stat-label">Total Modules</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{completedModules}</span>
      <span class="stat-label">Generated</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{completionPercentage.toFixed(0)}%</span>
      <span class="stat-label">Complete</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{courseData.arcs.length}</span>
      <span class="stat-label">Thematic Arcs</span>
    </div>
  </section>

  <!-- Course Narratives -->
  {#if courseData.courseNarrative || courseData.progressionNarrative}
    <section class="course-narratives">
      {#if courseData.courseNarrative}
        <div class="narrative-section">
          <h4>Course Narrative</h4>
          <p class="narrative-text">{courseData.courseNarrative}</p>
        </div>
      {/if}

      {#if courseData.progressionNarrative}
        <div class="narrative-section">
          <h4>Progression Narrative</h4>
          <p class="narrative-text">{courseData.progressionNarrative}</p>
        </div>
      {/if}
    </section>
  {/if}

  <!-- Arc-grouped Module List -->
  <section class="arc-list">
    <h3>Course Structure</h3>

    {#each courseData.arcs as arc (arc.id)}
      <div class="arc-section">
        <button
          class="arc-header"
          on:click={() => toggleArc(arc.id)}
          class:expanded={expandedArcId === arc.id}
        >
          <div class="arc-header-content">
            <h4>
              <span class="arc-icon">{expandedArcId === arc.id ? '▼' : '▶'}</span>
              Arc {arc.order}: {arc.title}
            </h4>
            <p class="arc-theme">{arc.theme} • {arc.durationWeeks} week{arc.durationWeeks !== 1 ? 's' : ''}</p>
            {#if arc.description}
              <p class="arc-description">{arc.description}</p>
            {/if}
          </div>
          <div class="arc-meta">
            <span class="arc-modules-count">
              {arc.modules.filter(m => m.status === 'complete').length}/{arc.modules.length} modules
            </span>
          </div>
        </button>

        {#if expandedArcId === arc.id}
          <div class="arc-content">
            <!-- Arc Narratives -->
            {#if arc.arcThemeNarrative || arc.arcProgressionNarrative}
              <div class="arc-narratives">
                {#if arc.arcThemeNarrative}
                  <div class="arc-narrative">
                    <strong>Arc Theme:</strong>
                    <p>{arc.arcThemeNarrative}</p>
                  </div>
                {/if}
                {#if arc.arcProgressionNarrative}
                  <div class="arc-narrative">
                    <strong>Arc Progression:</strong>
                    <p>{arc.arcProgressionNarrative}</p>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Module List -->
            <div class="module-list">
              {#each arc.modules as module (module.id)}
                <div class="module-card" class:complete={module.status === 'complete'} class:error={module.status === 'error'}>
                  <div class="module-header">
                    <div class="module-status" class:status-complete={module.status === 'complete'} class:status-error={module.status === 'error'}>
                      {#if module.status === 'complete'}
                        ✓
                      {:else if module.status === 'error'}
                        !
                      {:else}
                        ○
                      {/if}
                    </div>
                    <div class="module-info">
                      <h5>Module {module.order}: {module.title}</h5>
                      <p class="module-description">{module.description}</p>
                      <div class="module-meta">
                        <span>{module.durationWeeks} week{module.durationWeeks !== 1 ? 's' : ''}</span>
                        {#if module.learningObjectives && module.learningObjectives.length > 0}
                          <span>• {module.learningObjectives.length} objectives</span>
                        {/if}
                        {#if module.keyTopics && module.keyTopics.length > 0}
                          <span>• {module.keyTopics.length} topics</span>
                        {/if}
                      </div>
                    </div>
                  </div>

                  {#if module.status === 'complete'}
                    <div class="module-actions">
                      <button
                        class="btn btn-sm btn-secondary"
                        on:click={() => viewModulePreview(module.id)}
                      >
                        View Module XML
                      </button>
                    </div>
                  {:else if module.status === 'error'}
                    <div class="error-message">
                      <strong>Error:</strong> {module.errorMessage || 'Module generation failed'}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </section>

  <!-- Navigation -->
  <div class="navigation-buttons">
    <button class="btn btn-secondary" on:click={handleBack}>
      ← Back to Module Generation
    </button>

    <button class="btn btn-danger" on:click={handleReset}>
      Start New Course
    </button>
  </div>
</div>

<!-- Module Preview Modal -->
{#if previewModuleId}
  {@const module = courseData.arcs
    .flatMap(arc => arc.modules)
    .find(m => m.id === previewModuleId)}

  {#if module && module.moduleData}
    <div class="modal-overlay" on:click={closePreview} role="presentation">
      <div class="modal-content" on:click|stopPropagation role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 id="modal-title">{module.title}</h3>
          <button class="btn-close" on:click={closePreview} aria-label="Close preview">×</button>
        </div>
        <div class="modal-body">
          <pre class="xml-preview">{module.moduleData.xmlContent}</pre>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={closePreview}>Close</button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .course-overview {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Header */
  .section-header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .header-text {
    flex: 1;
  }

  .header-text h2 {
    font-size: 1.75rem;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
  }

  .header-text p {
    color: #666;
    font-size: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Status Banner */
  .status-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .status-banner.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }

  .status-banner.warning {
    background: #fef3c7;
    border: 1px solid #fcd34d;
  }

  .banner-icon {
    font-size: 1.5rem;
  }

  .banner-content strong {
    display: block;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .banner-content p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Course Metadata */
  .course-metadata {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .course-metadata h3 {
    font-size: 1.5rem;
    color: var(--palette-foreground);
    margin-bottom: 0.75rem;
  }

  .course-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .metadata-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metadata-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    font-weight: 600;
  }

  .metadata-value {
    font-size: 1rem;
    color: var(--palette-foreground);
    font-weight: 500;
  }

  /* Course Statistics */
  .course-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--palette-foreground);
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Course Narratives */
  .course-narratives {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .narrative-section {
    margin-bottom: 1.5rem;
  }

  .narrative-section:last-child {
    margin-bottom: 0;
  }

  .narrative-section h4 {
    font-size: 1.1rem;
    color: var(--palette-foreground);
    margin-bottom: 0.75rem;
  }

  .narrative-text {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  /* Arc List */
  .arc-list {
    margin-bottom: 2rem;
  }

  .arc-list > h3 {
    font-size: 1.25rem;
    color: var(--palette-foreground);
    margin-bottom: 1rem;
  }

  .arc-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 1.5rem;
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
    background: #f9fafb;
  }

  .arc-header.expanded {
    background: #f3f4f6;
  }

  .arc-header-content {
    flex: 1;
    text-align: left;
  }

  .arc-header h4 {
    font-size: 1.25rem;
    color: var(--palette-foreground);
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .arc-icon {
    font-size: 0.875rem;
    color: #666;
  }

  .arc-theme {
    color: #666;
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    font-style: italic;
  }

  .arc-description {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }

  .arc-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .arc-modules-count {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  /* Arc Content */
  .arc-content {
    padding: 1.5rem;
  }

  .arc-narratives {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .arc-narrative {
    margin-bottom: 1rem;
  }

  .arc-narrative:last-child {
    margin-bottom: 0;
  }

  .arc-narrative strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .arc-narrative p {
    color: #666;
    line-height: 1.6;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Module List */
  .module-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .module-card {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    transition: box-shadow 0.2s;
  }

  .module-card.complete {
    border-color: #a7f3d0;
    background: #f0fdf4;
  }

  .module-card.error {
    border-color: #fca5a5;
    background: #fef2f2;
  }

  .module-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
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
    background: #94a3b8;
  }

  .module-status.status-complete {
    background: #22c55e;
  }

  .module-status.status-error {
    background: #ef4444;
  }

  .module-info {
    flex: 1;
  }

  .module-info h5 {
    font-size: 1.1rem;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .module-description {
    color: #666;
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
  }

  .module-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }

  .module-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 0.75rem;
    color: #991b1b;
    font-size: 0.875rem;
  }

  /* Buttons */
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

  .btn-secondary {
    background: white;
    color: var(--palette-foreground);
    border: 1px solid var(--palette-foreground);
  }

  .btn-secondary:hover {
    background: var(--palette-bg-nav);
  }

  .btn-danger {
    background: white;
    color: #dc2626;
    border: 1px solid #dc2626;
  }

  .btn-danger:hover {
    background: #fef2f2;
  }

  /* Navigation */
  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
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
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
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
    color: #666;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .btn-close:hover {
    color: #000;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .xml-preview {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
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
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-actions {
      width: 100%;
    }

    .metadata-grid {
      grid-template-columns: 1fr;
    }

    .course-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .navigation-buttons {
      flex-direction: column;
    }
  }
</style>
