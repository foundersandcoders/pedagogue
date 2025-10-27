<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import type { CourseData, ModuleSlot, Arc } from "$lib/types/themis";
  import { currentCourse, moduleStatusCounts, allModulesComplete } from "$lib/stores/themisStores";
  import ExportButton from "$lib/components/theia/ExportButton.svelte";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    submit: void;
    back: void;
  }>();

  // Local state
  let expandedArcId: string | null = null;
  let generatingModuleId: string | null = null;
  let previewModuleId: string | null = null;

  // Track active SSE readers for cleanup
  const activeReaders = new Set<ReadableStreamDefaultReader<Uint8Array>>();

  // Reactive computed values
  $: totalModules = courseData.arcs.reduce((sum, arc) => sum + arc.modules.length, 0);
  $: completedModules = $moduleStatusCounts.complete;
  $: progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  // Create exportable content for Theia
  $: exportableContent = {
    type: "course" as const,
    data: courseData
  };

  onMount(() => {
    // Expand first arc by default
    if (courseData.arcs.length > 0) {
      expandedArcId = courseData.arcs[0].id;
    }
  });

  onDestroy(() => {
    // Cancel all active SSE streams on component unmount
    activeReaders.forEach(reader => {
      reader.cancel().catch(err => {
        console.warn('Error cancelling reader:', err);
      });
    });
    activeReaders.clear();
  });

  function toggleArc(arcId: string) {
    expandedArcId = expandedArcId === arcId ? null : arcId;
  }

  function getStatusColor(status: ModuleSlot['status']): string {
    switch (status) {
      case 'complete': return 'var(--palette-foreground)';
      case 'generating': return 'var(--palette-foreground-alt)';
      case 'error': return 'var(--palette-primary)';
      default: return 'var(--palette-foreground-alt)';
    }
  }

  function getStatusIcon(status: ModuleSlot['status']): string {
    switch (status) {
      case 'complete': return '✓';
      case 'generating': return '↻';
      case 'error': return '!';
      default: return '○';
    }
  }

  async function generateModule(module: ModuleSlot, arc: Arc): Promise<void> {
    // Update status to generating
    currentCourse.update(course => {
      if (!course) return course;
      const targetArc = course.arcs.find(a => a.id === arc.id);
      const targetModule = targetArc?.modules.find(m => m.id === module.id);
      if (targetModule) {
        targetModule.status = 'generating';
      }
      return course;
    });

    generatingModuleId = module.id;

    // Create a promise that resolves when generation completes or errors
    return new Promise<void>((resolve, reject) => {
      // Store resolve/reject for this module
      const completionHandlers = {
        resolve,
        reject
      };

      // Track this generation's handlers
      const handleComplete = (event: any) => {
        if (event.type === 'complete') {
          completionHandlers.resolve();
        } else if (event.type === 'error') {
          completionHandlers.reject(new Error(event.message || 'Generation failed'));
        }
      };

      (async () => {
        try {
          // Send POST request with SSE streaming
          const response = await fetch('/api/themis/module', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
              moduleSlot: module,
              courseContext: {
                title: courseData.title,
                courseNarrative: courseData.courseNarrative || '',
                progressionNarrative: courseData.progressionNarrative || '',
                arcNarrative: arc.arcThemeNarrative || '',
                arcProgression: arc.arcProgressionNarrative || '',
                precedingModules: getPrecedingModuleTitles(module, arc)
              },
              enableResearch: true
            })
          });

          if (!response.ok) {
            throw new Error(`Generation failed: ${response.status}`);
          }

          // Handle SSE stream
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          // Track reader for cleanup
          activeReaders.add(reader);

          try {
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  handleSSEEvent(module.id, data);
                  handleComplete(data);
                }
              }
            }
          } finally {
            // Remove from active readers when done
            activeReaders.delete(reader);
          }

        } catch (error) {
          console.error('Generation error:', error);
          handleGenerationError(module.id, error instanceof Error ? error.message : 'Generation failed');
          completionHandlers.reject(error);
        }
      })();
    });
  }

  function handleSSEEvent(moduleId: string, event: any) {
    console.log('SSE Event:', event);

    switch (event.type) {
      case 'complete':
        handleGenerationComplete(moduleId, event.xmlContent);
        break;

      case 'error':
        handleGenerationError(moduleId, event.message);
        break;

      case 'progress':
      case 'validation_started':
      case 'validation_success':
        // Visual feedback could be added here
        break;
    }
  }

  function handleGenerationComplete(moduleId: string, xmlContent: string) {
    currentCourse.update(course => {
      if (!course) return course;

      for (const arc of course.arcs) {
        const module = arc.modules.find(m => m.id === moduleId);
        if (module) {
          module.status = 'complete';
          module.moduleData = {
            xmlContent,
            generatedAt: new Date()
          };
          break;
        }
      }

      return course;
    });

    generatingModuleId = null;

    // Check if all modules are complete
    if ($allModulesComplete) {
      alert('All modules generated successfully! Ready to review and export.');
    }
  }

  function handleGenerationError(moduleId: string, errorMessage: string) {
    currentCourse.update(course => {
      if (!course) return course;

      for (const arc of course.arcs) {
        const module = arc.modules.find(m => m.id === moduleId);
        if (module) {
          module.status = 'error';
          module.errorMessage = errorMessage;
          break;
        }
      }

      return course;
    });

    generatingModuleId = null;
  }

  function getPrecedingModuleTitles(currentModule: ModuleSlot, currentArc: Arc): string[] {
    const titles: string[] = [];

    for (const arc of courseData.arcs) {
      // If we've reached the current arc
      if (arc.id === currentArc.id) {
        // Add modules from current arc up to (but not including) current module
        for (const module of arc.modules) {
          if (module.id === currentModule.id) break;
          titles.push(module.title);
        }
        break;
      }

      // Add all modules from previous arcs
      titles.push(...arc.modules.map(m => m.title));
    }

    return titles;
  }

  async function generateAll() {
    for (const arc of courseData.arcs) {
      for (const module of arc.modules) {
        if (module.status !== 'complete') {
          try {
            // generateModule now returns a Promise that resolves when complete
            await generateModule(module, arc);
          } catch (error) {
            // Error already handled in generateModule, continue to next
            console.error(`Failed to generate module ${module.title}:`, error);
          }
        }
      }
    }
  }

  function viewModulePreview(moduleId: string) {
    previewModuleId = moduleId;
  }

  function closePreview() {
    previewModuleId = null;
  }

  function handleSubmit() {
    if (!$allModulesComplete) {
      const confirmed = confirm('Not all modules are complete. Proceed anyway?');
      if (!confirmed) return;
    }

    dispatch('submit');
  }

  function handleBack() {
    dispatch('back');
  }
</script>

<div class="module-generation-list">
  <header class="section-header">
    <div class="header-content">
      <div class="header-text">
        <h2>Module Generation</h2>
        <p>Generate content for each module in your course structure</p>
      </div>
      <div class="header-actions">
        <ExportButton
          content={exportableContent}
          label="Export Course"
          variant="secondary"
          size="medium"
        />
      </div>
    </div>
  </header>

  <!-- Overall Progress -->
  <div class="progress-summary">
    <div class="progress-stats">
      <div class="stat">
        <span class="stat-value">{completedModules}/{totalModules}</span>
        <span class="stat-label">Modules Complete</span>
      </div>
      <div class="stat">
        <span class="stat-value">{$moduleStatusCounts.generating}</span>
        <span class="stat-label">In Progress</span>
      </div>
      <div class="stat">
        <span class="stat-value">{$moduleStatusCounts.error}</span>
        <span class="stat-label">Errors</span>
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: {progressPercentage}%"></div>
    </div>
  </div>

  <!-- Generation Controls -->
  <div class="generation-controls">
    <button
      class="btn btn-primary"
      on:click={generateAll}
      disabled={generatingModuleId !== null || $allModulesComplete}
    >
      {#if $allModulesComplete}
        All Modules Generated
      {:else if generatingModuleId}
        Generating...
      {:else}
        Generate All Modules
      {/if}
    </button>
  </div>

  <!-- Arc-grouped Module List -->
  <div class="arc-list">
    {#each courseData.arcs as arc (arc.id)}
      <div class="arc-section">
        <button
          class="arc-header"
          on:click={() => toggleArc(arc.id)}
          class:expanded={expandedArcId === arc.id}
        >
          <div class="arc-header-content">
            <h3>
              <span class="arc-icon">{expandedArcId === arc.id ? '▼' : '▶'}</span>
              Arc {arc.order}: {arc.title}
            </h3>
            <p class="arc-theme">{arc.theme}</p>
          </div>
          <div class="arc-meta">
            <span class="arc-modules-count">
              {arc.modules.filter(m => m.status === 'complete').length}/{arc.modules.length} modules
            </span>
          </div>
        </button>

        {#if expandedArcId === arc.id}
          <div class="module-list">
            {#each arc.modules as module (module.id)}
              <div class="module-card" class:generating={generatingModuleId === module.id}>
                <div class="module-header">
                  <div class="module-status" style="background-color: {getStatusColor(module.status)}">
                    {getStatusIcon(module.status)}
                  </div>
                  <div class="module-info">
                    <h4>{module.title}</h4>
                    <p class="module-description">{module.description}</p>
                    <div class="module-meta">
                      <span>{module.durationWeeks} week{module.durationWeeks !== 1 ? 's' : ''}</span>
                      {#if module.learningObjectives && module.learningObjectives.length > 0}
                        <span>• {module.learningObjectives.length} objectives</span>
                      {/if}
                    </div>
                  </div>
                </div>

                {#if module.errorMessage}
                  <div class="error-message">
                    <strong>Error:</strong> {module.errorMessage}
                  </div>
                {/if}

                <div class="module-actions">
                  {#if module.status === 'planned' || module.status === 'error'}
                    <button
                      class="btn btn-sm btn-generate"
                      on:click={() => generateModule(module, arc)}
                      disabled={generatingModuleId !== null}
                    >
                      {module.status === 'error' ? 'Retry' : 'Generate'}
                    </button>
                  {:else if module.status === 'generating'}
                    <button class="btn btn-sm" disabled>
                      Generating...
                    </button>
                  {:else if module.status === 'complete'}
                    <button
                      class="btn btn-sm btn-secondary"
                      on:click={() => viewModulePreview(module.id)}
                    >
                      View Module
                    </button>
                    <button
                      class="btn btn-sm"
                      on:click={() => generateModule(module, arc)}
                      disabled={generatingModuleId !== null}
                    >
                      Regenerate
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Navigation -->
  <div class="navigation-buttons">
    <button class="btn btn-secondary" on:click={handleBack}>
      ← Back to Structure Review
    </button>

    <button
      class="btn btn-primary"
      on:click={handleSubmit}
      disabled={!$allModulesComplete && $moduleStatusCounts.complete === 0}
    >
      Continue to Review & Export →
    </button>
  </div>
</div>

<!-- Module Preview Modal -->
{#if previewModuleId}
  {@const module = courseData.arcs
    .flatMap(arc => arc.modules)
    .find(m => m.id === previewModuleId)}

  {#if module && module.moduleData}
    <div class="modal-overlay" on:click={closePreview}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
          <h3>{module.title}</h3>
          <button class="btn-close" on:click={closePreview}>×</button>
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
  .module-generation-list {
    max-width: 1000px;
    margin: 0 auto;
  }

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

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
  }

  .section-header p {
    color: var(--palette-foreground-alt);
    font-size: 1rem;
  }

  /* Progress Summary */
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

  /* Generation Controls */
  .generation-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  /* Arc List */
  .arc-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .arc-section {
    background: white;
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

  /* Module List */
  .module-list {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .module-card {
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    padding: 1rem;
    transition: box-shadow 0.2s;
  }

  .module-card.generating {
    box-shadow: 0 0 0 2px var(--palette-foreground-alt);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .module-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
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
    background: var(--palette-foreground-alt);
  }

  .module-info {
    flex: 1;
  }

  .module-info h4 {
    font-size: 1.1rem;
    color: var(--palette-foreground);
    margin: 0 0 0.25rem 0;
  }

  .module-description {
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    line-height: 1.5;
  }

  .module-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--palette-foreground-alt);
  }

  .error-message {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 1rem;
    color: var(--palette-primary);
    font-size: 0.875rem;
  }

  .module-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
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

  .btn-primary {
    background: var(--palette-foreground);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--palette-foreground-alt);
  }

  .btn-primary:disabled {
    background: var(--palette-line);
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    color: var(--palette-foreground);
    border: 1px solid var(--palette-foreground);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--palette-bg-nav);
  }

  .btn-generate {
    background: var(--palette-foreground-alt);
    color: white;
  }

  .btn-generate:hover:not(:disabled) {
    background: var(--palette-foreground);
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

  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-actions {
      width: 100%;
    }

    .progress-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .module-header {
      flex-direction: column;
    }

    .module-actions {
      flex-direction: column;
    }

    .navigation-buttons {
      flex-direction: column;
    }
  }
</style>
