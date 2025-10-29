<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData, ModuleSlot } from "$lib/types/themis";
  import ExportButton from "$lib/components/theia/ExportButton.svelte";
  import { resetCourseWorkflow } from "$lib/stores/themisStores";
  import {
    downloadCourseXml,
    serialiseCourseToXml,
  } from "$lib/utils/validation/outputSerialiser";
  import { validateCourseXML } from "$lib/schemas/courseValidator";
  import type { ValidationResult } from "$lib/schemas/courseValidator";

  export let courseData: CourseData;

  const dispatch = createEventDispatcher<{
    back: void;
    reset: void;
  }>();

  // Local state
  let expandedArcId: string | null = null;
  let expandedModuleId: string | null = null;
  let expandedSections: Record<string, Set<string>> = {}; // moduleId -> Set<sectionName>
  let previewModuleId: string | null = null;
  let showValidationFeedback = false;
  let xmlValidationResult: ValidationResult | null = null;

  // Create exportable content for Theia
  $: exportableContent = {
    type: "course" as const,
    data: courseData,
  };

  // Computed statistics
  $: totalModules = courseData.arcs.reduce(
    (sum, arc) => sum + arc.modules.length,
    0,
  );
  $: completedModules = courseData.arcs.reduce(
    (sum, arc) =>
      sum + arc.modules.filter((m) => m.status === "complete").length,
    0,
  );
  $: completionPercentage =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  $: allComplete = totalModules > 0 && completedModules === totalModules;

  function toggleArc(arcId: string) {
    expandedArcId = expandedArcId === arcId ? null : arcId;
  }

  function toggleModule(moduleId: string) {
    expandedModuleId = expandedModuleId === moduleId ? null : moduleId;
  }

  function toggleModuleSection(moduleId: string, sectionName: string) {
    // Create a new Set to trigger reactivity
    const currentSections = expandedSections[moduleId]
      ? new Set(expandedSections[moduleId])
      : new Set();

    if (currentSections.has(sectionName)) {
      currentSections.delete(sectionName);
    } else {
      currentSections.add(sectionName);
    }

    // Create a completely new object to trigger reactivity
    expandedSections = {
      ...expandedSections,
      [moduleId]: currentSections,
    };
  }

  function isSectionExpanded(moduleId: string, sectionName: string): boolean {
    return expandedSections[moduleId]?.has(sectionName) ?? false;
  }

  function viewModulePreview(moduleId: string) {
    previewModuleId = moduleId;
  }

  function closePreview() {
    previewModuleId = null;
  }

  // Parse module XML content
  function parseModuleXML(xmlContent: string) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, "text/xml");

      // Check for parser errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.error("XML parsing error:", parserError.textContent);
        return null;
      }

      const result = {
        description:
          doc.querySelector("Description")?.textContent?.trim() || "",
        objectives: Array.from(
          doc.querySelectorAll("LearningObjectives LearningObjective"),
        ).map((obj) => ({
          name: obj.getAttribute("name") || "",
          details: obj.textContent?.trim() || "",
        })),
        research: {
          primary: Array.from(
            doc.querySelectorAll("ResearchTopics PrimaryTopics Topic"),
          ).map((topic) => ({
            name: topic.getAttribute("name") || "",
            description: topic.textContent?.trim() || "",
            subtopics: Array.from(topic.querySelectorAll("SubTopic")).map(
              (sub) => ({
                name: sub.getAttribute("name") || "",
                description: sub.textContent?.trim() || "",
              }),
            ),
          })),
          stretch: Array.from(
            doc.querySelectorAll("ResearchTopics StretchTopics Topic"),
          ).map((topic) => ({
            name: topic.getAttribute("name") || "",
            description: topic.textContent?.trim() || "",
          })),
        },
        projects: Array.from(doc.querySelectorAll("Projects Briefs Brief")).map(
          (brief) => ({
            name: brief.getAttribute("name") || "",
            task: brief.querySelector("Task")?.textContent?.trim() || "",
            focus: brief.querySelector("Focus")?.textContent?.trim() || "",
            criteria:
              brief.querySelector("Criteria")?.textContent?.trim() || "",
            skills: Array.from(brief.querySelectorAll("Skills Skill")).map(
              (skill) => ({
                name: skill.getAttribute("name") || "",
                content: skill.textContent?.trim() || "",
              }),
            ),
            examples: Array.from(
              brief.querySelectorAll("Examples Example"),
            ).map((ex) => ({
              name: ex.getAttribute("name") || "",
              content: ex.textContent?.trim() || "",
            })),
          }),
        ),
        twists: Array.from(doc.querySelectorAll("Projects Twists Twist")).map(
          (twist) => ({
            name: twist.getAttribute("name") || "",
            task: twist.querySelector("Task")?.textContent?.trim() || "",
            examples: Array.from(
              twist.querySelectorAll("Examples Example"),
            ).map((ex) => ({
              name: ex.getAttribute("name") || "",
              content: ex.textContent?.trim() || "",
            })),
          }),
        ),
        additionalSkills: Array.from(
          doc.querySelectorAll("AdditionalSkills Category"),
        ).map((cat) => ({
          category: cat.getAttribute("name") || "",
          skills: Array.from(cat.querySelectorAll("Skills Skill")).map(
            (skill) => ({
              name: skill.getAttribute("name") || "",
              content: skill.textContent?.trim() || "",
            }),
          ),
        })),
      };

      return result;
    } catch (error) {
      console.error("Failed to parse module XML:", error);
      return null;
    }
  }

  function handleBack() {
    dispatch("back");
  }

  function handleReset() {
    const confirmed = confirm(
      "Are you sure you want to reset and start a new course? This will clear all current progress.",
    );
    if (confirmed) {
      resetCourseWorkflow();
      dispatch("reset");
    }
  }

  // Format date helper
  function formatDate(date: Date | string | undefined): string {
    if (!date) return "Not set";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Handle XML export with validation
  function handleXmlExport() {
    // Generate XML
    const xmlContent = serialiseCourseToXml(courseData);

    // Validate the generated XML
    const validation = validateCourseXML(xmlContent);
    xmlValidationResult = validation;
    showValidationFeedback = true;

    if (validation.valid) {
      // Download if valid
      downloadCourseXml(courseData);

      // Hide feedback after 5 seconds on success
      setTimeout(() => {
        showValidationFeedback = false;
      }, 5000);
    }
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
        <button
          type="button"
          class="btn-primary btn-large"
          on:click={handleXmlExport}
          disabled={!allComplete}
          title={allComplete
            ? "Download complete course as XML"
            : "Complete all modules before exporting"}
        >
          Export XML
        </button>
        <ExportButton
          content={exportableContent}
          label="Export Preview"
          variant="secondary"
          size="large"
          disabled={!allComplete}
        />
      </div>
    </div>
  </header>

  <!-- Completion Status Banner -->
  {#if !allComplete}
    <div class="status-banner warning">
      <span class="banner-icon">!</span>
      <div class="banner-content">
        <strong>Course Incomplete</strong>
        <p>
          {completedModules} of {totalModules} modules generated. Complete all modules
          before exporting.
        </p>
      </div>
    </div>
  {:else}
    <div class="status-banner success">
      <span class="banner-icon">&check;</span>
      <div class="banner-content">
        <strong>Course Complete!</strong>
        <p>
          All {totalModules} modules have been successfully generated. Ready to export.
        </p>
      </div>
    </div>
  {/if}

  <!-- XML Validation Feedback -->
  {#if showValidationFeedback && xmlValidationResult}
    {#if xmlValidationResult.valid}
      <div class="status-banner success">
        <span class="banner-icon">&check;</span>
        <div class="banner-content">
          <strong>XML Export Successful</strong>
          <p>
            Course XML has been validated and downloaded successfully with all
            module specifications embedded.
          </p>
          {#if xmlValidationResult.warnings.length > 0}
            <details>
              <summary>{xmlValidationResult.warnings.length} warning(s)</summary
              >
              <ul class="validation-list">
                {#each xmlValidationResult.warnings as warning}
                  <li>{warning}</li>
                {/each}
              </ul>
            </details>
          {/if}
        </div>
        <button
          type="button"
          class="close-banner"
          on:click={() => (showValidationFeedback = false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    {:else}
      <div class="status-banner error">
        <span class="banner-icon">✗</span>
        <div class="banner-content">
          <strong>XML Validation Failed</strong>
          <p>The generated XML contains errors. Please review and try again.</p>
          <details open>
            <summary>{xmlValidationResult.errors.length} error(s)</summary>
            <ul class="validation-list">
              {#each xmlValidationResult.errors as error}
                <li>{error}</li>
              {/each}
            </ul>
          </details>
          {#if xmlValidationResult.warnings.length > 0}
            <details>
              <summary>{xmlValidationResult.warnings.length} warning(s)</summary
              >
              <ul class="validation-list">
                {#each xmlValidationResult.warnings as warning}
                  <li>{warning}</li>
                {/each}
              </ul>
            </details>
          {/if}
        </div>
        <button
          type="button"
          class="close-banner"
          on:click={() => (showValidationFeedback = false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    {/if}
  {/if}

  <section class="course-metadata">
    <h3>{courseData.title}</h3>
    <p class="course-description">{courseData.description}</p>

    <div class="metadata-grid">
      <div class="metadata-item">
        <span class="metadata-label">Duration</span>
        <span class="metadata-value"
          >{courseData.logistics.totalWeeks} weeks</span
        >
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Frequency</span>
        <span class="metadata-value"
          >{courseData.logistics.daysPerWeek} day{courseData.logistics
            .daysPerWeek !== 1
            ? "s"
            : ""}/week</span
        >
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Start Date</span>
        <span class="metadata-value"
          >{formatDate(courseData.logistics.startDate)}</span
        >
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Cohort Size</span>
        <span class="metadata-value"
          >{courseData.learners.cohortSize} learners</span
        >
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Structure</span>
        <span class="metadata-value"
          >{courseData.structure === "peer-led"
            ? "Peer-Led"
            : "Facilitated"}</span
        >
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
              <span class="arc-icon"
                >{expandedArcId === arc.id ? "▼" : "▶"}</span
              >
              Arc {arc.order}: {arc.title}
            </h4>
            <p class="arc-theme">
              {arc.theme} • {arc.durationWeeks} week{arc.durationWeeks !== 1
                ? "s"
                : ""}
            </p>
            {#if arc.description}
              <p class="arc-description">{arc.description}</p>
            {/if}
          </div>
          <div class="arc-meta">
            <span class="arc-modules-count">
              {arc.modules.filter((m) => m.status === "complete").length}/{arc
                .modules.length} modules
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
                {@const moduleContent = module.moduleData?.xmlContent
                  ? parseModuleXML(module.moduleData.xmlContent)
                  : null}
                <div
                  class="module-card"
                  class:complete={module.status === "complete"}
                  class:error={module.status === "error"}
                  class:expanded={expandedModuleId === module.id}
                >
                  <button
                    class="module-header"
                    on:click={() =>
                      module.status === "complete" && toggleModule(module.id)}
                    disabled={module.status !== "complete"}
                  >
                    <div
                      class="module-status"
                      class:status-complete={module.status === "complete"}
                      class:status-error={module.status === "error"}
                    >
                      {#if module.status === "complete"}
                        &check;
                      {:else if module.status === "error"}
                        !
                      {:else}
                        ○
                      {/if}
                    </div>
                    <div class="module-info">
                      <div class="module-title-row">
                        {#if module.status === "complete"}
                          <span class="expand-icon"
                            >{expandedModuleId === module.id ? "▼" : "▶"}</span
                          >
                        {/if}
                        <h5>Module {module.order}: {module.title}</h5>
                      </div>
                      <p class="module-description">{module.description}</p>
                      <div class="module-meta">
                        <span
                          >{module.durationWeeks} week{module.durationWeeks !==
                          1
                            ? "s"
                            : ""}</span
                        >
                        {#if module.learningObjectives && module.learningObjectives.length > 0}
                          <span
                            >• {module.learningObjectives.length} objectives</span
                          >
                        {/if}
                        {#if module.keyTopics && module.keyTopics.length > 0}
                          <span>• {module.keyTopics.length} topics</span>
                        {/if}
                      </div>
                    </div>
                  </button>

                  {#if module.status === "error"}
                    <div class="error-message">
                      <strong>Error:</strong>
                      {module.errorMessage || "Module generation failed"}
                    </div>
                  {/if}

                  {#if module.status === "complete" && expandedModuleId === module.id && moduleContent}
                    <div class="module-content">
                      <!-- Module Description -->
                      {#if moduleContent.description}
                        <div class="content-block">
                          <p class="module-full-description">
                            {moduleContent.description}
                          </p>
                        </div>
                      {/if}

                      <!-- Objectives Section -->
                      {#if moduleContent.objectives.length > 0}
                        <div class="content-section">
                          <button
                            class="section-toggle"
                            on:click|stopPropagation={() =>
                              toggleModuleSection(module.id, "objectives")}
                          >
                            <span class="toggle-icon"
                              >{expandedSections[module.id]?.has("objectives")
                                ? "▼"
                                : "▶"}</span
                            >
                            <h6>
                              Learning Objectives ({moduleContent.objectives
                                .length})
                            </h6>
                          </button>
                          {#if expandedSections[module.id]?.has("objectives")}
                            <div class="section-content">
                              {#each moduleContent.objectives as objective}
                                <div class="objective-item">
                                  <strong>{objective.name}</strong>
                                  <p>{objective.details}</p>
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/if}

                      <!-- Research Topics Section -->
                      {#if moduleContent.research.primary.length > 0}
                        <div class="content-section">
                          <button
                            class="section-toggle"
                            on:click|stopPropagation={() =>
                              toggleModuleSection(module.id, "research")}
                          >
                            <span class="toggle-icon"
                              >{expandedSections[module.id]?.has("research")
                                ? "▼"
                                : "▶"}</span
                            >
                            <h6>
                              Research Topics ({moduleContent.research.primary
                                .length})
                            </h6>
                          </button>
                          {#if expandedSections[module.id]?.has("research")}
                            <div class="section-content">
                              {#each moduleContent.research.primary as topic}
                                <div class="research-item">
                                  <strong>{topic.name}</strong>
                                  <p>{topic.description}</p>
                                  {#if topic.subtopics && topic.subtopics.length > 0}
                                    <div class="subtopics">
                                      <strong>Subtopics:</strong>
                                      <ul>
                                        {#each topic.subtopics as subtopic}
                                          <li>
                                            <strong>{subtopic.name}:</strong>
                                            {subtopic.description}
                                          </li>
                                        {/each}
                                      </ul>
                                    </div>
                                  {/if}
                                </div>
                              {/each}
                              {#if moduleContent.research.stretch.length > 0}
                                <div class="stretch-topics">
                                  <strong>Stretch Topics:</strong>
                                  <ul>
                                    {#each moduleContent.research.stretch as topic}
                                      <li>
                                        <strong>{topic.name}:</strong>
                                        {topic.description}
                                      </li>
                                    {/each}
                                  </ul>
                                </div>
                              {/if}
                            </div>
                          {/if}
                        </div>
                      {/if}

                      <!-- Project Briefs Section -->
                      {#if moduleContent.projects.length > 0}
                        <div class="content-section">
                          <button
                            class="section-toggle"
                            on:click|stopPropagation={() =>
                              toggleModuleSection(module.id, "projects")}
                          >
                            <span class="toggle-icon"
                              >{expandedSections[module.id]?.has("projects")
                                ? "▼"
                                : "▶"}</span
                            >
                            <h6>
                              Project Briefs ({moduleContent.projects.length})
                            </h6>
                          </button>
                          {#if expandedSections[module.id]?.has("projects")}
                            <div class="section-content">
                              {#each moduleContent.projects as project}
                                <div class="project-item">
                                  <h7>{project.name}</h7>
                                  <p><strong>Task:</strong> {project.task}</p>
                                  <p><strong>Focus:</strong> {project.focus}</p>
                                  <p>
                                    <strong>Criteria:</strong>
                                    {project.criteria}
                                  </p>
                                  {#if project.skills.length > 0}
                                    <div class="project-skills">
                                      <strong>Skills:</strong>
                                      <ul>
                                        {#each project.skills as skill}
                                          <li>
                                            <strong>{skill.name}:</strong>
                                            {skill.content}
                                          </li>
                                        {/each}
                                      </ul>
                                    </div>
                                  {/if}
                                  {#if project.examples.length > 0}
                                    <div class="project-examples">
                                      <strong>Examples:</strong>
                                      <ul>
                                        {#each project.examples as example}
                                          <li>
                                            <strong>{example.name}:</strong>
                                            {example.content}
                                          </li>
                                        {/each}
                                      </ul>
                                    </div>
                                  {/if}
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/if}

                      <!-- Project Twists Section -->
                      {#if moduleContent.twists.length > 0}
                        <div class="content-section">
                          <button
                            class="section-toggle"
                            on:click|stopPropagation={() =>
                              toggleModuleSection(module.id, "twists")}
                          >
                            <span class="toggle-icon"
                              >{expandedSections[module.id]?.has("twists")
                                ? "▼"
                                : "▶"}</span
                            >
                            <h6>
                              Project Twists ({moduleContent.twists.length})
                            </h6>
                          </button>
                          {#if expandedSections[module.id]?.has("twists")}
                            <div class="section-content">
                              {#each moduleContent.twists as twist}
                                <div class="twist-item">
                                  <strong>{twist.name}</strong>
                                  <p>{twist.task}</p>
                                  {#if twist.examples.length > 0}
                                    <div class="twist-examples">
                                      <strong>Examples:</strong>
                                      <ul>
                                        {#each twist.examples as example}
                                          <li>
                                            <strong>{example.name}:</strong>
                                            {example.content}
                                          </li>
                                        {/each}
                                      </ul>
                                    </div>
                                  {/if}
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/if}

                      <!-- Additional Skills Section -->
                      {#if moduleContent.additionalSkills.length > 0}
                        <div class="content-section">
                          <button
                            class="section-toggle"
                            on:click|stopPropagation={() =>
                              toggleModuleSection(module.id, "skills")}
                          >
                            <span class="toggle-icon"
                              >{expandedSections[module.id]?.has("skills")
                                ? "▼"
                                : "▶"}</span
                            >
                            <h6>
                              Additional Skills ({moduleContent.additionalSkills
                                .length} categories)
                            </h6>
                          </button>
                          {#if expandedSections[module.id]?.has("skills")}
                            <div class="section-content">
                              {#each moduleContent.additionalSkills as category}
                                <div class="skills-category">
                                  <strong>{category.category}</strong>
                                  <ul>
                                    {#each category.skills as skill}
                                      <li>
                                        <strong>{skill.name}:</strong>
                                        {skill.content}
                                      </li>
                                    {/each}
                                  </ul>
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/if}

                      <!-- View Raw XML Button -->
                      <div class="module-actions">
                        <button
                          class="btn btn-sm btn-secondary"
                          on:click|stopPropagation={() =>
                            viewModulePreview(module.id)}
                        >
                          View Raw XML
                        </button>
                      </div>
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
    .flatMap((arc) => arc.modules)
    .find((m) => m.id === previewModuleId)}

  {#if module && module.moduleData}
    <div class="modal-overlay" on:click={closePreview} role="presentation">
      <div
        class="modal-content"
        on:click|stopPropagation
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div class="modal-header">
          <h3 id="modal-title">{module.title}</h3>
          <button
            class="btn-close"
            on:click={closePreview}
            aria-label="Close preview">&times;</button
          >
        </div>
        <div class="modal-body">
          <pre class="xml-preview">{module.moduleData.xmlContent}</pre>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={closePreview}
            >Close</button
          >
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
    color: var(--palette-foreground-alt);
    font-size: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Status Banner */
  .status-banner {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    position: relative;
  }

  .status-banner.success {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-foreground);
  }

  .status-banner.warning {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-accent);
  }

  .status-banner.error {
    background: #fef2f2;
    border: 1px solid #ef4444;
  }

  .status-banner.error .banner-icon {
    color: #ef4444;
  }

  .banner-icon {
    font-size: 1.5rem;
  }

  .banner-content strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.25rem;
  }

  .banner-content p {
    color: var(--palette-foreground-alt);
    margin: 0;
    font-size: 0.9rem;
  }

  .banner-content details {
    margin-top: 0.75rem;
  }

  .banner-content details summary {
    cursor: pointer;
    color: var(--palette-foreground);
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .banner-content details ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
    list-style: disc;
  }

  .banner-content details li {
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
    line-height: 1.5;
    margin-bottom: 0.25rem;
  }

  .close-banner {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--palette-foreground-alt);
    cursor: pointer;
    padding: 0;
    margin-left: auto;
    line-height: 1;
    transition: color 0.2s;
  }

  .close-banner:hover {
    color: var(--palette-foreground);
  }

  /* Course Metadata */
  .course-metadata {
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
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
    color: var(--palette-foreground-alt);
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
    color: var(--palette-foreground-alt);
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
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
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
    color: var(--palette-foreground-alt);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Course Narratives */
  .course-narratives {
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
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
    color: var(--palette-foreground-alt);
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
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
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
    background: var(--palette-bg-subtle);
  }

  .arc-header.expanded {
    background: var(--palette-bg-subtle);
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
    color: var(--palette-foreground-alt);
  }

  .arc-theme {
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    font-style: italic;
  }

  .arc-description {
    color: var(--palette-foreground-alt);
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
    color: var(--palette-foreground-alt);
    font-weight: 500;
  }

  /* Arc Content */
  .arc-content {
    padding: 1.5rem;
  }

  .arc-narratives {
    background: var(--palette-bg-subtle);
    border: 1px solid var(--palette-line);
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
    color: var(--palette-foreground-alt);
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
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .module-card.complete {
    border-color: var(--palette-foreground);
    background: var(--palette-bg-subtle-alt);
  }

  .module-card.error {
    border-color: var(--palette-primary);
    background: var(--palette-bg-subtle-alt);
  }

  .module-card.expanded {
    box-shadow: 0 4px 12px color-mix(in srgb, black 10%, transparent);
  }

  .module-header {
    width: 100%;
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .module-header:hover:not(:disabled) {
    background: color-mix(in srgb, white 50%, transparent);
  }

  .module-header:disabled {
    cursor: default;
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

  .module-status.status-complete {
    background: var(--palette-foreground);
  }

  .module-status.status-error {
    background: var(--palette-primary);
  }

  .module-info {
    flex: 1;
  }

  .module-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .expand-icon {
    font-size: 0.75rem;
    color: var(--palette-foreground-alt);
  }

  .module-info h5 {
    font-size: 1.1rem;
    color: var(--palette-foreground);
    margin: 0;
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

  .module-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .error-message {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    border-radius: 4px;
    padding: 0.75rem;
    margin: 0 1rem 1rem;
    color: var(--palette-primary);
    font-size: 0.875rem;
  }

  /* Module Content */
  .module-content {
    padding: 0 1rem 1rem;
    background: var(--palette-bg-subtle);
  }

  .content-block {
    margin-bottom: 1.5rem;
  }

  .module-full-description {
    color: var(--palette-foreground-alt);
    line-height: 1.6;
    font-size: 0.95rem;
    margin: 0;
  }

  .content-section {
    margin-bottom: 1rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    overflow: hidden;
  }

  .section-toggle {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--palette-bg-subtle);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }

  .section-toggle:hover {
    background: var(--palette-bg-subtle);
  }

  .toggle-icon {
    font-size: 0.75rem;
    color: var(--palette-foreground-alt);
  }

  .section-toggle h6 {
    margin: 0;
    font-size: 1rem;
    color: var(--palette-foreground);
    font-weight: 600;
  }

  .section-content {
    padding: 1rem;
    background: var(--palette-bg-subtle);
  }

  /* Objectives */
  .objective-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .objective-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .objective-item strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .objective-item p {
    color: var(--palette-foreground-alt);
    line-height: 1.5;
    margin: 0;
    font-size: 0.9rem;
  }

  /* Research Topics */
  .research-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .research-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .research-item strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .research-item p {
    color: var(--palette-foreground-alt);
    line-height: 1.5;
    margin: 0;
    font-size: 0.9rem;
  }

  .subtopics {
    margin-top: 0.75rem;
    padding-left: 1rem;
  }

  .subtopics strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .subtopics ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground-alt);
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .stretch-topics {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--palette-line);
  }

  .stretch-topics strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
  }

  .stretch-topics ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground-alt);
    line-height: 1.6;
  }

  /* Projects */
  .project-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .project-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .project-item h7 {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--palette-foreground);
    margin-bottom: 0.75rem;
  }

  .project-item p {
    color: var(--palette-foreground-alt);
    line-height: 1.5;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .project-skills,
  .project-examples {
    margin-top: 0.75rem;
  }

  .project-skills strong,
  .project-examples strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
  }

  .project-skills ul,
  .project-examples ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground-alt);
    line-height: 1.6;
  }

  .project-skills li,
  .project-examples li {
    margin-bottom: 0.25rem;
  }

  /* Twists */
  .twist-item {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .twist-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .twist-item strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .twist-item p {
    color: var(--palette-foreground-alt);
    line-height: 1.5;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  .twist-item ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground-alt);
    line-height: 1.6;
  }

  /* Additional Skills */
  .skills-category {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .skills-category:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .skills-category strong {
    display: block;
    color: var(--palette-foreground);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .skills-category ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground-alt);
    line-height: 1.6;
  }

  .skills-category li {
    margin-bottom: 0.25rem;
  }

  .module-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--palette-line);
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
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    border: 1px solid var(--palette-foreground);
  }

  .btn-secondary:hover {
    background: var(--palette-bg-nav);
  }

  .btn-danger {
    background: var(--palette-bg-subtle);
    color: var(--palette-primary);
    border: 1px solid var(--palette-primary);
  }

  .btn-danger:hover {
    background: var(--palette-bg-subtle-alt);
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
    background: var(--palette-bg-subtle);
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
    font-family: "Monaco", "Courier New", monospace;
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
