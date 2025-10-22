<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    parseProjectsXML,
    parseSkillsXML,
    parseResearchXML,
    validateUploadedFile,
    XMLParseError,
  } from "$lib/utils/validation/fileParser";
  import type {
    ProjectsFile,
    SkillsFile,
    ResearchFile,
  } from "$lib/types/metis";

  export let fileType: "projects" | "skills" | "research";
  export let uploadState: "idle" | "uploading" | "success" | "error" = "idle";
  export let error: string | null = null;

  const dispatch = createEventDispatcher<{
    fileUploaded: {
      type: "projects" | "skills" | "research";
      data: ProjectsFile | SkillsFile | ResearchFile;
    };
    uploadError: {
      type: "projects" | "skills" | "research";
      error: string;
    };
  }>();

  let fileInput: HTMLInputElement;
  let dragCounter = 0;
  let isDragOver = false;

  const titles = {
    projects: "Project Briefs",
    skills: "Additional Skills Development",
    research: "Research Topics",
  };
  const expectedFiles = {
    projects: "projects.xml",
    skills: "skills.xml",
    research: "research.xml",
  };

  const title = titles[fileType];
  const expectedFile = expectedFiles[fileType];

  async function handleFile(file: File) {
    // Validate file
    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      error = validation.error!;
      uploadState = "error";
      dispatch("uploadError", {
        type: fileType,
        error: validation.error!,
      });
      return;
    }

    uploadState = "uploading";
    error = null;

    try {
      const content = await file.text();

      let parsedData: ProjectsFile | SkillsFile | ResearchFile;
      if (fileType === "projects") {
        parsedData = parseProjectsXML(content);
      } else if (fileType === "skills") {
        parsedData = parseSkillsXML(content);
      } else if (fileType === "research") {
        parsedData = parseResearchXML(content);
      }

      uploadState = "success";
      dispatch("fileUploaded", { type: fileType, data: parsedData });
    } catch (err) {
      console.error("File processing error:", err);

      if (err instanceof XMLParseError) {
        error = err.message;
        if (err.details) {
          error += ` (${err.details})`;
        }
      } else {
        error = `Failed to process ${expectedFile}`;
      }

      uploadState = "error";
      dispatch("uploadError", { type: fileType, error });
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
    if (fileInput) {
      fileInput.value = "";
    }
  }
</script>

<div class="upload-area">
  <h3>{title}</h3>

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
        <p>Processing {expectedFile}...</p>
      </div>
    {:else if uploadState === "success"}
      <div class="upload-status success">
        <div class="checkmark">✓</div>
        <p><strong>{expectedFile}</strong> uploaded successfully</p>
        <button
          type="button"
          class="reset-button"
          on:click|stopPropagation={reset}
        >
          Upload different file
        </button>
      </div>
    {:else if uploadState === "error"}
      <div class="upload-status error">
        <div class="error-icon">⚠</div>
        <p class="error-message">{error}</p>
        <button
          type="button"
          class="retry-button"
          on:click|stopPropagation={reset}
        >
          Try again
        </button>
      </div>
    {:else}
      <div class="upload-prompt">
        <div class="upload-icon">📄</div>
        <p>Drop <code>{expectedFile}</code> here or click to browse</p>
        <p class="upload-hint">XML files only, max 1MB</p>
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept=".xml,text/xml,application/xml"
    on:change={handleFileSelect}
    style="display: none;"
  />
</div>

<style>
  .upload-area {
    flex: 1;
  }

  .upload-area h3 {
    margin-bottom: 1rem;
    color: #495057;
    font-weight: 600;
  }

  .drop-zone {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drop-zone:hover:not(.uploading) {
    border-color: #007bff;
    background-color: #f8f9ff;
  }

  .drop-zone.drag-over {
    border-color: #007bff;
    background-color: #f0f8ff;
    border-style: solid;
  }

  .drop-zone.success {
    border-color: #28a745;
    background-color: #f8fff8;
  }

  .drop-zone.error {
    border-color: #dc3545;
    background-color: #fff8f8;
  }

  .drop-zone.uploading {
    cursor: wait;
    border-color: #007bff;
    background-color: #f8f9ff;
  }

  .upload-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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
    color: #6c757d;
  }

  .upload-hint {
    font-size: 0.85rem;
    color: #999 !important;
  }

  .checkmark {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #28a745;
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
    background-color: #dc3545;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .error-message {
    color: #dc3545;
    font-weight: 500;
    max-width: 300px;
    word-break: break-word;
  }

  .reset-button,
  .retry-button {
    background: transparent;
    border: 2px solid currentColor;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .reset-button {
    color: #28a745;
  }

  .reset-button:hover {
    background-color: #28a745;
    color: white;
  }

  .retry-button {
    color: #dc3545;
  }

  .retry-button:hover {
    background-color: #dc3545;
    color: white;
  }

  code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: "SF Mono", Consolas, monospace;
    font-size: 0.9em;
  }
</style>
