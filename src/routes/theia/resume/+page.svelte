<script lang="ts">
  import CourseStructureUpload from "$lib/components/theia/CourseStructureUpload.svelte";
  import type { CourseData } from "$lib/types/themis";
  import { goto } from "$app/navigation";
  import { currentCourse, courseWorkflowStep } from "$lib/stores/themisStores";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let errorMessage = "";

  onMount(() => {
    const error = $page.url.searchParams.get("error");
    if (error === "resume_required") {
      errorMessage =
        "Please upload a course structure to continue working, or start a new course in Themis.";
    }
  });

  function handleCourseUploaded(event: CustomEvent<{ data: CourseData }>) {
    // Populate store
    currentCourse.set(event.detail.data);
    // Jump to structure review step
    courseWorkflowStep.set(4);
    // Navigate to Themis
    goto("/themis/generate");
  }
</script>

<svelte:head>
  <title>Theia • Content Manager</title>
  <link rel="icon" href="favicons/favicon.ico" />
</svelte:head>

<div id="theia-container" class="container">
  <header id="theia-header">
    <div class="header-title">
      <img src="/theia/icon.png" alt="Theia icon" class="header-icon" />
      <h1>Theia</h1>
    </div>
    <p>AI-powered content management for peer-led courses</p>
  </header>

  {#if errorMessage}
    <div class="alert alert-warning">
      <span class="alert-icon">!</span>
      <span>{errorMessage}</span>
    </div>
  {/if}

  <div class="upload-section">
    <CourseStructureUpload on:courseUploaded={handleCourseUploaded} />
  </div>

  <div class="help-section">
    <h3>How It Works</h3>
    <ol>
      <li>
        Export your course structure from Themis (Structure Review step) as JSON
      </li>
      <li>Upload the JSON file here</li>
      <li>Choose to continue generation or export in different formats</li>
    </ol>

    <h3>What's Preserved</h3>
    <ul>
      <li>All arc narratives and themes</li>
      <li>Module descriptions and learning objectives</li>
      <li>Generated module XML (for completed modules)</li>
      <li>Course and progression narratives</li>
      <li>All logistics and cohort data</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }

  header h1 {
    font-size: 3rem;
    color: var(--palette-primary);
    margin: 0;
  }

  header p {
    color: var(--palette-foreground);
    font-size: 1.1rem;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    margin-bottom: 2rem;
  }

  .alert-warning {
    background-color: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    color: var(--palette-foreground);
  }

  .alert-icon {
    font-size: 1.25rem;
  }

  .upload-section {
    margin-bottom: 3rem;
  }

  .help-section {
    background: var(--palette-bg-subtle);
    border-radius: 8px;
    padding: 2rem;
    margin-top: 2rem;
  }

  .help-section h3 {
    color: var(--palette-primary);
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .help-section h3:not(:first-child) {
    margin-top: 2rem;
  }

  .help-section ol,
  .help-section ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground);
  }

  .help-section li {
    margin: 0.5rem 0;
  }
</style>
