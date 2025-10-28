<script lang="ts">
  import { onMount } from "svelte";
  import CourseConfigForm from "$lib/components/themis/CourseConfigForm.svelte";
  import ArcStructurePlanner from "$lib/components/themis/ArcStructurePlanner.svelte";
  import ModuleWithinArcPlanner from "$lib/components/themis/ModuleWithinArcPlanner.svelte";
  import CourseStructureReview from "$lib/components/themis/CourseStructureReview.svelte";
  import ModuleGenerationList from "$lib/components/themis/ModuleGenerationList.svelte";
  import CourseOverview from "$lib/components/themis/CourseOverview.svelte";
  import { currentCourse, courseWorkflowStep } from "$lib/stores/themisStores";

  let { data } = $props();

  const steps = [
    "Course Config",
    "Arc Planning",
    "Module Planning",
    "Structure Review",
    "Module Generation",
    "Review & Export",
  ];

  // Initialize course if not exists or ensure it has all required fields
  onMount(() => {
    const courseExists: boolean =
      $currentCourse && $currentCourse.learners && $currentCourse.logistics
        ? true
        : false;
    if (!courseExists) currentCourse.set(data.initialCourse);
    courseWorkflowStep.set(1);
    console.log("Workflow initialised: Themis", $currentCourse);
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
  }

  function handleFormChange(event) {
    const formData = event.detail;
    // Auto-save changes
    currentCourse.update((course) => ({
      ...course,
      ...formData,
    }));
  }

  function handleArcPlannerSubmit(event) {
    const { arcs } = event.detail;

    // Update current course with arc structure
    currentCourse.update((course) => ({
      ...course,
      arcs,
    }));

    // Move to next step - Module Planning within arcs
    courseWorkflowStep.set(3);
  }

  function handleArcPlannerBack() {
    courseWorkflowStep.set(1);
  }

  function handleModuleWithinArcPlannerSubmit(event) {
    const { arcs } = event.detail;

    // Update current course with arc+module structure
    currentCourse.update((course) => ({
      ...course,
      arcs,
    }));

    // Move to next step - Course Structure Review will auto-generate
    courseWorkflowStep.set(4);
  }

  function handleModuleWithinArcPlannerBack() {
    courseWorkflowStep.set(2);
  }

  function handleStructureReviewSubmit(event) {
    const { arcs, courseNarrative, progressionNarrative } = event.detail;

    // Update course with refined arc/module data and narratives
    currentCourse.update((course) => ({
      ...course,
      arcs,
      courseNarrative,
      progressionNarrative,
    }));

    courseWorkflowStep.set(5);
  }

  function handleStructureReviewBack() {
    courseWorkflowStep.set(3);
  }

  function handleModuleGenerationSubmit() {
    courseWorkflowStep.set(6);
  }

  function handleModuleGenerationBack() {
    courseWorkflowStep.set(4);
  }

  function handleCourseOverviewBack() {
    courseWorkflowStep.set(5);
  }

  function handleCourseOverviewReset() {
    // Reset handled by component, just go back to step 1
    courseWorkflowStep.set(1);
  }
</script>

<svelte:head>
  <title>Themis • Course Designer</title>
  <link rel="icon" href="favicons/favicon.ico" />
</svelte:head>

<div id="themis-container" class="container">
  <header id="themis-header">
    <div class="header-title">
      <img src="icon.png" alt="Themis icon" class="header-icon" />
      <h1>Themis</h1>
    </div>
    <p>Build a complete multi-week course with interconnected modules</p>
  </header>

  <div id="themis-workflow" class="workflow">
    <!-- TODO: sort out layout of this menu -->
    <nav id="themis-steps" class="steps">
      {#each steps as step, i}
        <div
          id="themis-step-{i + 1}"
          class="step"
          class:active={$courseWorkflowStep === i + 1}
          class:completed={$courseWorkflowStep > i + 1}
        >
          <span id="themis-step-{i + 1}-number" class="step-number"
            >{i + 1}</span
          >
          <span id="themis-step-{i + 1}-name" class="step-name">{step}</span>
        </div>
      {/each}
    </nav>

    <main id="themis-content" class="content">
      {#if $courseWorkflowStep === 1 && $currentCourse}
        <CourseConfigForm
          formData={$currentCourse}
          on:submit={handleFormSubmit}
          on:change={handleFormChange}
        />
      {:else if $courseWorkflowStep === 2 && $currentCourse}
        <ArcStructurePlanner
          courseData={$currentCourse}
          on:submit={handleArcPlannerSubmit}
          on:back={handleArcPlannerBack}
        />
      {:else if $courseWorkflowStep === 3 && $currentCourse}
        <ModuleWithinArcPlanner
          courseData={$currentCourse}
          on:submit={handleModuleWithinArcPlannerSubmit}
          on:back={handleModuleWithinArcPlannerBack}
        />
      {:else if $courseWorkflowStep === 4 && $currentCourse}
        <CourseStructureReview
          courseData={$currentCourse}
          on:submit={handleStructureReviewSubmit}
          on:back={handleStructureReviewBack}
        />
      {:else if $courseWorkflowStep === 5 && $currentCourse}
        <ModuleGenerationList
          courseData={$currentCourse}
          on:submit={handleModuleGenerationSubmit}
          on:back={handleModuleGenerationBack}
        />
      {:else if $courseWorkflowStep === 6 && $currentCourse}
        <CourseOverview
          courseData={$currentCourse}
          on:back={handleCourseOverviewBack}
          on:reset={handleCourseOverviewReset}
        />
      {:else}
        <section class="placeholder">
          <p>Step {$courseWorkflowStep} - {steps[$courseWorkflowStep - 1]}</p>
          <p>Coming soon...</p>
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

  .workflow {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .steps {
    display: flex;
    background: var(--palette-bg-nav);
    padding: 1rem;
    border-bottom: 1px solid var(--palette-line);
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
    color: var(--palette-line);
    font-weight: bold;
  }

  .step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--palette-bg-nav);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .step.active .step-number {
    background: var(--palette-foreground);
    color: white;
  }

  .step.completed .step-number {
    background: var(--palette-foreground);
    color: white;
    opacity: 0.7;
  }

  .step-name {
    font-size: 0.9rem;
    color: var(--palette-primary);
    white-space: nowrap;
  }

  .step.active .step-name {
    color: var(--palette-foreground);
    font-weight: 600;
  }

  .content {
    padding: 2rem;
  }

  .placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--palette-foreground);
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
