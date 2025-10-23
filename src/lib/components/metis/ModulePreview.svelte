<script lang="ts">
  import { validateModuleXML } from "$lib/schemas/moduleValidator";
  import { createEventDispatcher } from "svelte";
  import ChangelogViewer from "./ChangelogViewer.svelte";
  import ExportButton from "$lib/components/theia/ExportButton.svelte";
  import type { ExportableContent } from "$lib/types/theia";

  export let xmlContent: string = "";
  export let showValidation: boolean = true;

  const dispatch = createEventDispatcher<{
    download: { content: string; filename: string };
    validated: { valid: boolean };
  }>();

  // Create exportable content for Theia
  $: exportableContent = {
    type: "module" as const,
    data: xmlContent,
  };

  $: validation =
    showValidation && xmlContent ? validateModuleXML(xmlContent) : null;
  $: if (validation) {
    dispatch("validated", {
      valid: validation.valid,
    });
  }

  function downloadXML() {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `module-spec-${timestamp}.xml`;

    dispatch("download", {
      content: xmlContent,
      filename,
    });

    // Trigger browser download
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(xmlContent).then(
      () => {
        alert("XML copied to clipboard!");
      },
      () => {
        alert("Failed to copy to clipboard");
      },
    );
  }

  function highlightXML(xml: string): string {
    return xml
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(&lt;\/?)([\w-]+)/g, '<span class="tag">$1$2</span>')
      .replace(/(&lt;\w+)([^&]*?)(&gt;)/g, '$1<span class="attr">$2</span>$3')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span class="comment">$1</span>');
  }
</script>

<div class="module-preview">
  <div class="preview-header">
    <h3>Generated Module Specification</h3>
    <div class="preview-actions">
      <ExportButton
        content={exportableContent}
        label="Export Preview"
        variant="secondary"
        size="medium"
        disabled={!xmlContent}
      />
      <button
        type="button"
        class="btn-secondary"
        on:click={copyToClipboard}
        disabled={!xmlContent}
      >
        📋 Copy
      </button>
      <button
        type="button"
        class="btn-primary"
        on:click={downloadXML}
        disabled={!xmlContent || (validation && !validation.valid)}
      >
        ⬇️ Download XML
      </button>
    </div>
  </div>

  {#if validation}
    <div
      class="validation-status"
      class:valid={validation.valid}
      class:invalid={!validation.valid}
    >
      {#if validation.valid}
        <div class="status-icon">✓</div>
        <div class="status-message">
          <strong>Valid Module Specification</strong>
          <p>All required elements are present and properly formatted</p>
        </div>
      {:else}
        <div class="status-icon">⚠</div>
        <div class="status-message">
          <strong>Validation Errors</strong>
          <ul>
            {#each validation.errors as error}
              <li>{error}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}

  {#if xmlContent}
    <ChangelogViewer {xmlContent} />
  {/if}

  <div class="preview-content">
    {#if xmlContent}
      <pre class="xml-preview"><code>{@html highlightXML(xmlContent)}</code
        ></pre>
    {:else}
      <div class="empty-state">
        <p>No module specification generated yet</p>
        <p class="hint">
          Fill in the form and click "Generate Module" to create a specification
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .module-preview {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    border-top: 3px solid var(--palette-foreground);
  }

  .preview-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }

  .preview-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-secondary {
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e9ecef;
  }

  .btn-primary {
    background: var(--palette-foreground);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-secondary:disabled,
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .validation-status {
    padding: 1rem 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .validation-status.valid {
    background: #d4edda;
    border-bottom: 1px solid #c3e6cb;
  }

  .validation-status.invalid {
    background: #f8d7da;
    border-bottom: 1px solid #f5c6cb;
  }

  .status-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .validation-status.valid .status-icon {
    color: #155724;
  }

  .validation-status.invalid .status-icon {
    color: #721c24;
  }

  .status-message {
    flex: 1;
  }

  .status-message strong {
    display: block;
    margin-bottom: 0.25rem;
    color: inherit;
  }

  .validation-status.valid .status-message strong {
    color: #155724;
  }

  .validation-status.invalid .status-message strong {
    color: #721c24;
  }

  .status-message p {
    margin: 0;
    font-size: 0.9rem;
    color: #495057;
  }

  .status-message ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }

  .status-message li {
    font-size: 0.9rem;
    color: #721c24;
    margin-bottom: 0.25rem;
  }

  .preview-content {
    padding: 1.5rem;
    max-height: 600px;
    overflow: auto;
  }

  .xml-preview {
    margin: 0;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-family: "SF Mono", Consolas, "Monaco", monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .xml-preview code :global(.tag) {
    color: #0066cc;
    font-weight: 600;
  }

  .xml-preview code :global(.attr) {
    color: #008800;
  }

  .xml-preview code :global(.comment) {
    color: #999;
    font-style: italic;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #6c757d;
  }

  .empty-state p {
    margin: 0 0 0.5rem 0;
  }

  .empty-state .hint {
    font-size: 0.9rem;
    color: #999;
  }
</style>
