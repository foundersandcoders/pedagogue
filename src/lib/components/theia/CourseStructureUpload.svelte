<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData } from "$lib/types/themis";
  import {
    validateCourseStructure,
    deserializeUploadedCourse,
    getUserFriendlyError,
  } from "$lib/utils/theia/courseValidator";

  const dispatch = createEventDispatcher<{
    courseUploaded: { data: CourseData };
    uploadError: { error: string };
  }>();

  let fileInput: HTMLInputElement;
  let dragCounter = 0;
  let isDragOver = false;
  let uploadState: "idle" | "uploading" | "success" | "error" = "idle";
  let error: string | null = null;
  let uploadedCourse: CourseData | null = null;
  let validationWarnings: string[] = [];

  async function handleFile(file: File) {
    // Validate file type
    if (!file.name.endsWith(".json")) {
      error = "Please upload a JSON file";
      uploadState = "error";
      dispatch("uploadError", { error });
      return;
    }

    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error = "File too large (max 10MB)";
      uploadState = "error";
      dispatch("uploadError", { error });
      return;
    }

    uploadState = "uploading";
    error = null;
    validationWarnings = [];

    try {
      const content = await file.text();
      const rawCourseData = JSON.parse(content);

      // Validate structure
      const validation = validateCourseStructure(rawCourseData);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }

      // Store warnings for display
      validationWarnings = validation.warnings;

      // Deserialize (convert date strings to Date objects)
      const courseData = deserializeUploadedCourse(rawCourseData);

      uploadedCourse = courseData;
      uploadState = "success";
    } catch (err) {
      console.error("Upload error:", err);
      error =
        err instanceof Error
          ? getUserFriendlyError(err)
          : "Invalid course JSON";
      uploadState = "error";
      dispatch("uploadError", { error });
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    dragCounter = 0;

    const file = event.dataTransfer?.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    dragCounter++;
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      isDragOver = false;
    }
  }

  function openFileDialog() {
    if (uploadState !== "uploading") {
      fileInput.click();
    }
  }

  function reset() {
    uploadState = "idle";
    error = null;
    uploadedCourse = null;
    validationWarnings = [];
    if (fileInput) {
      fileInput.value = "";
    }
  }

  function continueInThemis() {
    if (uploadedCourse) {
      dispatch("courseUploaded", { data: uploadedCourse });
    }
  }
</script>

<div class="upload-area">
  <h3>Upload Course Structure</h3>

  <div
    class="drop-zone"
    class:drag-over={isDragOver}
    class:uploading={uploadState === "uploading"}
    class:success={uploadState === "success"}
    class:error={uploadState === "error"}
    on:click={openFileDialog}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === "Enter" && openFileDialog()}
  >
    {#if uploadState === "uploading"}
      <div class="upload-status">
        <div class="spinner"></div>
        <p>Processing course structure...</p>
      </div>
    {:else if uploadState === "success" && uploadedCourse}
      <div class="upload-status success">
        <div class="checkmark">&check;</div>
        <h4>{uploadedCourse.title}</h4>
        <div class="course-stats">
          <span>{uploadedCourse.arcs.length} arcs</span>
          <span>•</span>
          <span
            >{uploadedCourse.arcs.reduce(
              (sum, arc) => sum + arc.modules.length,
              0,
            )} modules</span
          >
          <span>•</span>
          <span>{uploadedCourse.logistics.totalWeeks} weeks</span>
        </div>

        {#if validationWarnings.length > 0}
          <div class="warnings">
            <p class="warnings-header">
              Warnings ({validationWarnings.length}):
            </p>
            <ul>
              {#each validationWarnings as warning}
                <li>{warning}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="actions">
          <button class="primary" on:click|stopPropagation={continueInThemis}>
            {#if uploadedCourse.arcs.every( (arc) => arc.modules.every((m) => m.status === "complete"), )}
              Preview & Export
            {:else}
              Continue in Themis
            {/if}
          </button>
          <button on:click|stopPropagation={reset}>
            Upload Different File
          </button>
        </div>
      </div>
    {:else if uploadState === "error"}
      <div class="upload-status error">
        <div class="error-icon">!</div>
        <p class="error-message">{error}</p>
        <button
          type="button"
          class="retry-button"
          on:click|stopPropagation={reset}
        >
          Try Again
        </button>
      </div>
    {:else}
      <div class="upload-prompt">
        <div class="upload-icon">[File]</div>
        <p>Drop course JSON here or click to browse</p>
        <p class="upload-hint">Exported from Themis Structure Review</p>
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept=".json,application/json"
    on:change={handleFileSelect}
    style="display: none;"
  />
</div>

<style>
  .upload-area {
    width: 100%;
  }

  .upload-area h3 {
    margin-bottom: 1rem;
    color: var(--palette-foreground);
    font-weight: 600;
  }

  .drop-zone {
    border: 2px dashed var(--palette-line);
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drop-zone:hover:not(.uploading) {
    border-color: var(--palette-secondary);
    background-color: var(--palette-bg-subtle);
  }

  .drop-zone.drag-over {
    border-color: var(--palette-secondary);
    background-color: var(--palette-bg-subtle-alt);
    border-style: solid;
  }

  .drop-zone.success {
    border-color: var(--palette-foreground);
    background-color: var(--palette-bg-subtle-alt);
  }

  .drop-zone.error {
    border-color: var(--palette-primary);
    background-color: var(--palette-bg-subtle-alt);
  }

  .drop-zone.uploading {
    cursor: wait;
  }

  .upload-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .course-stats {
    display: flex;
    gap: 0.5rem;
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
  }

  .warnings {
    max-width: 500px;
    text-align: left;
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-accent);
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .warnings-header {
    font-weight: 600;
    color: var(--palette-foreground);
    margin: 0 0 0.5rem 0;
  }

  .warnings ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground);
    font-size: 0.85rem;
  }

  .warnings li {
    margin: 0.25rem 0;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .actions button {
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid currentColor;
    background: transparent;
    font-family: inherit;
  }

  .actions button.primary {
    background-color: var(--palette-foreground);
    color: white;
    border-color: var(--palette-foreground);
  }

  .actions button.primary:hover {
    background-color: var(--palette-secondary);
    border-color: var(--palette-secondary);
  }

  .actions button:not(.primary) {
    color: var(--palette-foreground-alt);
  }

  .actions button:not(.primary):hover {
    background-color: var(--palette-foreground-alt);
    color: white;
  }

  .checkmark {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: var(--palette-foreground);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .error-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: var(--palette-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .error-message {
    color: var(--palette-primary);
    font-weight: 500;
    max-width: 400px;
    word-break: break-word;
  }

  .retry-button {
    background: transparent;
    border: 2px solid var(--palette-primary);
    color: var(--palette-primary);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .retry-button:hover {
    background-color: var(--palette-primary);
    color: white;
  }

  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .upload-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .upload-prompt p {
    margin: 0;
    color: var(--palette-foreground-alt);
  }

  .upload-hint {
    font-size: 0.85rem;
    color: var(--palette-foreground-alt);
  }

  .spinner {
    border: 3px solid var(--palette-line);
    border-top: 3px solid var(--palette-secondary);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  h4 {
    margin: 0;
    color: var(--palette-foreground);
  }
</style>
