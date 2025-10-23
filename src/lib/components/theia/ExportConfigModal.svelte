<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { exportAndDownload, previewExport } from "$lib/services/theiaService";
  import type {
    ExportableContent,
    ExportConfig,
    DetailLevel,
    ExportFormat,
    ModuleSection,
    CourseSection,
  } from "$lib/types/theia";

  // Props
  export let content: ExportableContent;
  export let defaultConfig: Partial<ExportConfig> = {};

  const dispatch = createEventDispatcher<{
    export: { config: ExportConfig };
    cancel: void;
  }>();

  // State
  let detailLevel: DetailLevel = defaultConfig.detailLevel || "detailed";
  let includeMetadata: boolean = defaultConfig.includeMetadata || false;
  let format: ExportFormat = defaultConfig.format || "markdown";
  let includeTableOfContents: boolean =
    defaultConfig.includeTableOfContents || false;
  let selectedSections: Set<string> = new Set(defaultConfig.sections || []);
  let customTitle: string = defaultConfig.customTitle || "";
  let isExporting = false;
  let exportError: string | null = null;
  let showPreview = false;
  let previewContent = "";
  let previewTotalLines = 0;

  // Available sections based on content type
  $: availableSections =
    content.type === "module" || content.type === "module-slot"
      ? [
          { id: "overview", label: "Overview" },
          { id: "objectives", label: "Learning Objectives" },
          { id: "research", label: "Research Topics" },
          { id: "project-briefs", label: "Project Briefs" },
          { id: "project-twists", label: "Project Twists" },
          { id: "additional-skills", label: "Additional Skills" },
          { id: "metadata", label: "Metadata" },
          { id: "changelog", label: "Changelog" },
          { id: "notes", label: "Notes" },
        ]
      : [
          { id: "overview", label: "Course Overview" },
          { id: "description", label: "Description" },
          { id: "logistics", label: "Logistics" },
          { id: "cohort-info", label: "Cohort Information" },
          { id: "course-narrative", label: "Course Narrative" },
          { id: "progression-narrative", label: "Progression Narrative" },
          { id: "arcs", label: "Arcs" },
          { id: "arc-themes", label: "Arc Themes" },
          { id: "arc-progression", label: "Arc Progression" },
          { id: "modules", label: "Modules" },
        ];

  function toggleSection(sectionId: string) {
    if (selectedSections.has(sectionId)) {
      selectedSections.delete(sectionId);
    } else {
      selectedSections.add(sectionId);
    }
    selectedSections = selectedSections; // Trigger reactivity
  }

  function selectAllSections() {
    selectedSections = new Set(availableSections.map((s) => s.id));
  }

  function deselectAllSections() {
    selectedSections = new Set();
  }

  async function handlePreview() {
    showPreview = true;
    const config = buildConfig();
    const result = await previewExport(content, config, 25);
    previewContent = result.preview;
    previewTotalLines = result.totalLines;
  }

  async function handleExport() {
    isExporting = true;
    exportError = null;

    try {
      const config = buildConfig();
      const result = await exportAndDownload(content, config);

      if (!result.success) {
        exportError = result.error || "Unknown error occurred";
        isExporting = false;
        return;
      }

      // Success - dispatch event and close
      dispatch("export", { config });
    } catch (error) {
      exportError =
        error instanceof Error ? error.message : "An unexpected error occurred";
      isExporting = false;
    }
  }

  function handleCancel() {
    dispatch("cancel");
  }

  function buildConfig(): ExportConfig {
    return {
      detailLevel,
      includeMetadata,
      sections: Array.from(selectedSections) as (
        | ModuleSection
        | CourseSection
      )[],
      format,
      includeTableOfContents,
      customTitle: customTitle.trim() || undefined,
    };
  }

  // Close modal on Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && !isExporting) {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-backdrop" on:click={handleCancel}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <h2>Export Configuration</h2>
      <button
        type="button"
        class="close-btn"
        on:click={handleCancel}
        disabled={isExporting}
      >
        ×
      </button>
    </div>

    <div class="modal-body">
      <!-- Custom Title -->
      <div class="form-group">
        <label for="customTitle">
          Custom Title <span class="optional">(optional)</span>
        </label>
        <input
          id="customTitle"
          type="text"
          bind:value={customTitle}
          placeholder="Leave empty to use default title"
          disabled={isExporting}
        />
      </div>

      <!-- Detail Level -->
      <div class="form-group">
        <label>Detail Level</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              name="detailLevel"
              value="minimal"
              bind:group={detailLevel}
              disabled={isExporting}
            />
            <span>Minimal</span>
            <span class="help-text">Titles and structure only</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              name="detailLevel"
              value="summary"
              bind:group={detailLevel}
              disabled={isExporting}
            />
            <span>Summary</span>
            <span class="help-text">Key points and descriptions</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              name="detailLevel"
              value="detailed"
              bind:group={detailLevel}
              disabled={isExporting}
            />
            <span>Detailed</span>
            <span class="help-text">Full content without metadata</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              name="detailLevel"
              value="complete"
              bind:group={detailLevel}
              disabled={isExporting}
            />
            <span>Complete</span>
            <span class="help-text">Everything including metadata</span>
          </label>
        </div>
      </div>

      <!-- Format Selection -->
      <div class="form-group">
        <label>Export Format</label>
        <div class="format-tabs">
          <button
            type="button"
            class="format-tab"
            class:active={format === "markdown"}
            on:click={() => (format = "markdown")}
            disabled={isExporting}
          >
            📝 Markdown
          </button>
          <button
            type="button"
            class="format-tab"
            class:active={format === "html"}
            on:click={() => (format = "html")}
            disabled={isExporting}
          >
            🌐 HTML
          </button>
          <button
            type="button"
            class="format-tab disabled"
            disabled
            title="PDF export coming soon"
          >
            📄 PDF <span class="badge">Soon</span>
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="form-group">
        <label>Options</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              bind:checked={includeMetadata}
              disabled={isExporting}
            />
            <span>Include AI generation metadata</span>
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              bind:checked={includeTableOfContents}
              disabled={isExporting}
            />
            <span>Include table of contents</span>
          </label>
        </div>
      </div>

      <!-- Section Selection -->
      <div class="form-group">
        <div class="section-header">
          <label>Sections to Include</label>
          <div class="section-actions">
            <button
              type="button"
              class="link-btn"
              on:click={selectAllSections}
              disabled={isExporting}
            >
              Select All
            </button>
            <span class="separator">|</span>
            <button
              type="button"
              class="link-btn"
              on:click={deselectAllSections}
              disabled={isExporting}
            >
              Deselect All
            </button>
          </div>
        </div>
        <p class="help-text">
          Leave empty to include all sections based on detail level
        </p>
        <div class="section-grid">
          {#each availableSections as section}
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={selectedSections.has(section.id)}
                on:change={() => toggleSection(section.id)}
                disabled={isExporting}
              />
              <span>{section.label}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Preview Section -->
      {#if showPreview}
        <div class="preview-section">
          <div class="preview-header">
            <h3>Preview ({previewTotalLines} lines total)</h3>
            <button
              type="button"
              class="link-btn"
              on:click={() => (showPreview = false)}
            >
              Hide Preview
            </button>
          </div>
          <pre class="preview-content">{previewContent}</pre>
        </div>
      {/if}

      <!-- Error Display -->
      {#if exportError}
        <div class="error-message">
          <strong>Export Error:</strong>
          {exportError}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="btn-secondary"
        on:click={handlePreview}
        disabled={isExporting}
      >
        Preview
      </button>
      <div class="footer-right">
        <button
          type="button"
          class="btn-secondary"
          on:click={handleCancel}
          disabled={isExporting}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary"
          on:click={handleExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export & Download"}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
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
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover:not(:disabled) {
    background: #e9ecef;
    color: #495057;
  }

  .close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #495057;
  }

  .optional {
    font-weight: normal;
    color: #6c757d;
    font-size: 0.9em;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #28a745;
  }

  input[type="text"]:disabled {
    background: #e9ecef;
    cursor: not-allowed;
  }

  .radio-group,
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radio-label,
  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
  }

  .radio-label input,
  .checkbox-label input {
    margin-top: 0.25rem;
    cursor: pointer;
  }

  .radio-label span:first-of-type,
  .checkbox-label span {
    font-weight: 500;
    color: #495057;
  }

  .help-text {
    font-size: 0.85rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }

  .format-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .format-tab {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #dee2e6;
    background: white;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .format-tab:hover:not(:disabled):not(.disabled) {
    border-color: #28a745;
    background: #f8f9fa;
  }

  .format-tab.active {
    border-color: #28a745;
    background: #d4edda;
    color: #155724;
  }

  .format-tab.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    background: #ffc107;
    color: #000;
    border-radius: 3px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .link-btn {
    background: none;
    border: none;
    color: #28a745;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .link-btn:hover:not(:disabled) {
    color: #218838;
  }

  .link-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .separator {
    color: #dee2e6;
  }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .preview-section {
    margin-top: 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    overflow: hidden;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .preview-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #495057;
  }

  .preview-content {
    padding: 1rem;
    margin: 0;
    font-family: "SF Mono", Consolas, Monaco, monospace;
    font-size: 0.85rem;
    line-height: 1.5;
    background: #f8f9fa;
    max-height: 300px;
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .error-message {
    padding: 1rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    color: #721c24;
    margin-top: 1rem;
  }

  .error-message strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid #dee2e6;
  }

  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #28a745;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #218838;
  }

  .btn-secondary {
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e9ecef;
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modal-content {
      max-height: 95vh;
    }

    .section-grid {
      grid-template-columns: 1fr;
    }

    .format-tabs {
      flex-direction: column;
    }

    .modal-footer {
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-right {
      width: 100%;
    }

    .footer-right button {
      flex: 1;
    }
  }
</style>
