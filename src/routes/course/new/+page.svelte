<script lang="ts">
  import { onMount } from "svelte";
  import CourseConfigForm from "$lib/course/CourseConfigForm.svelte";
  import {
    currentCourse,
    courseWorkflowStep,
  } from "$lib/courseStores";
  import { goto } from "$app/navigation";

  export let data: any;

  const steps = [
    "Course Config",
    "Module Planning",
    "Course Structure",
    "Module Generation",
    "Review & Export",
  ];

  // Initialize course if not exists or ensure it has all required fields
  onMount(() => {
    if (!$currentCourse || !$currentCourse.learners || !$currentCourse.logistics) {
      currentCourse.set(data.initialCourse);
    }
    courseWorkflowStep.set(1);
    console.log("Course creation initialized", $currentCourse);
  });

  function handleFormSubmit(event) {
    const formData = event.detail;

    // Update current course with form data
    currentCourse.update((course) => ({
      ...course,
      ...formData,
    }));

    // Move to next step
    courseWorkflowStep.set(2);

    // TODO: Navigate to step 2 when implemented
    console.log("Course config submitted:", formData);
    alert(
      "Course configuration saved! Module planning step coming in Phase 2."
    );
  }

  function handleFormChange(event) {
    const formData = event.detail;
    // Auto-save changes
    currentCourse.update((course) => ({
      ...course,
      ...formData,
    }));
  }
</script>

<svelte:head>
  <title>Create Course - Pedagogue</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Create Course</h1>
    <p>Build a complete multi-week course with interconnected modules</p>
  </header>

  <div class="workflow">
    <nav class="steps">
      {#each steps as step, index}
        <div
          class="step"
          class:active={$courseWorkflowStep === index + 1}
          class:completed={$courseWorkflowStep > index + 1}
        >
          <span class="step-number">{index + 1}</span>
          <span class="step-name">{step}</span>
        </div>
      {/each}
    </nav>

    <main class="content">
      {#if $courseWorkflowStep === 1 && $currentCourse}
        <CourseConfigForm
          formData={$currentCourse}
          on:submit={handleFormSubmit}
          on:change={handleFormChange}
        />
      {:else}
        <section class="placeholder">
          <p>Step {$courseWorkflowStep} - {steps[$courseWorkflowStep - 1]}</p>
          <p>Coming soon in Phase 2...</p>
        </section>
      {/if}
    </main>
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 3rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  header p {
    color: #666;
    font-size: 1.1rem;
  }

  .workflow {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .steps {
    display: flex;
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    overflow-x: auto;
  }

  .step {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 0.5rem;
    position: relative;
    min-width: 140px;
  }

  .step:not(:last-child)::after {
    content: "→";
    position: absolute;
    right: -0.5rem;
    color: #ccc;
    font-weight: bold;
  }

  .step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .step.active .step-number {
    background: #28a745;
    color: white;
  }

  .step.completed .step-number {
    background: #218838;
    color: white;
  }

  .step-name {
    font-size: 0.9rem;
    color: #495057;
    white-space: nowrap;
  }

  .step.active .step-name {
    color: #28a745;
    font-weight: 600;
  }

  .content {
    padding: 2rem;
  }

  .placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  }

  @media (max-width: 768px) {
    header h1 {
      font-size: 2rem;
    }

    .steps {
      padding: 0.75rem;
    }

    .step {
      min-width: 120px;
    }

    .step-name {
      font-size: 0.8rem;
    }

    .content {
      padding: 1rem;
    }
  }
</style>
