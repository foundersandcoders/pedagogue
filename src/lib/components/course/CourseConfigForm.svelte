<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CourseData } from "$lib/types/course";

  export let formData: Partial<CourseData> = {
    title: "",
    description: "",
    logistics: {
      totalWeeks: 12,
      daysPerWeek: 1,
      startDate: "",
    },
    learners: {
      cohortSize: 20,
      teamBased: false,
      teamSize: 4,
      prerequisites: "",
      experience: {
        prereq: "1-3 years",
        focus: "limited experience",
      },
    },
    structure: "peer-led",
  };

  // Ensure all nested objects exist - run immediately on prop change
  $: {
    if (!formData.logistics) {
      formData.logistics = { totalWeeks: 12, daysPerWeek: 1, startDate: "" };
    }
    if (!formData.learners) {
      formData.learners = {
        cohortSize: 20,
        teamBased: false,
        teamSize: 4,
        prerequisites: "",
        experience: { prereq: "1-3 years", focus: "limited experience" },
      };
    }
    if (!formData.learners.experience) {
      formData.learners.experience = { prereq: "1-3 years", focus: "limited experience" };
    }
  }

  // Computed flag to ensure data is ready before rendering
  $: isDataReady = formData?.logistics?.totalWeeks !== undefined &&
                   formData?.learners?.cohortSize !== undefined;

  const dispatch = createEventDispatcher<{
    submit: Partial<CourseData>;
    change: Partial<CourseData>;
  }>();

  let errors: {
    title?: string;
    description?: string;
    logistics?: {
      totalWeeks?: string;
      daysPerWeek?: string;
      startDate?: string;
    };
    learners?: {
      cohortSize?: string;
      teamSize?: string;
    };
  } = {};

  function validateForm(): boolean {
    errors = {};

    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = "Course title is required";
    }

    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = "Course description is required";
    }

    if (
      !formData.logistics?.totalWeeks ||
      formData.logistics.totalWeeks < 1 ||
      formData.logistics.totalWeeks > 52
    ) {
      if (!errors.logistics) errors.logistics = {};
      errors.logistics.totalWeeks = "Duration must be between 1 and 52 weeks";
    }

    if (
      !formData.logistics?.daysPerWeek ||
      formData.logistics.daysPerWeek < 1 ||
      formData.logistics.daysPerWeek > 7
    ) {
      if (!errors.logistics) errors.logistics = {};
      errors.logistics.daysPerWeek = "Days per week must be between 1 and 7";
    }

    if (
      !formData.learners?.cohortSize ||
      formData.learners.cohortSize < 1 ||
      formData.learners.cohortSize > 1000
    ) {
      if (!errors.learners) errors.learners = {};
      errors.learners.cohortSize = "Cohort size must be between 1 and 1000";
    }

    if (formData.learners?.teamBased && (!formData.learners?.teamSize || formData.learners.teamSize < 2)) {
      if (!errors.learners) errors.learners = {};
      errors.learners.teamSize = "Team size must be at least 2";
    }

    if (formData.logistics?.startDate) {
      const startDate = new Date(formData.logistics.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        if (!errors.logistics) errors.logistics = {};
        errors.logistics.startDate = "Start date cannot be in the past";
      }
    }

    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: Event) {
    event.preventDefault();

    if (validateForm()) {
      dispatch("submit", formData);
    }
  }

  function handleChange() {
    dispatch("change", formData);
  }
</script>

<div class="course-config-form">
  <h2>Course Configuration</h2>
  <p class="form-description">
    Define the basic structure and parameters for your course.
  </p>

  {#if isDataReady}
  <form on:submit={handleSubmit}>
    <!-- Course Identity -->
    <section class="form-section">
      <h3>Course Identity</h3>

      <div class="form-field">
        <label for="title">
          Course Title
          <span class="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          bind:value={formData.title}
          on:input={handleChange}
          class:error={errors.title}
          placeholder="e.g., AI Engineering Apprenticeship"
          required
        />
        {#if errors.title}
          <span class="error-message">{errors.title}</span>
        {/if}
      </div>

      <div class="form-field">
        <label for="description">
          Course Description
          <span class="required">*</span>
        </label>
        <textarea
          id="description"
          rows="4"
          bind:value={formData.description}
          on:input={handleChange}
          class:error={errors.description}
          placeholder="Describe the course focus, goals, and what participants will learn..."
          required
        ></textarea>
        {#if errors.description}
          <span class="error-message">{errors.description}</span>
        {/if}
        <span class="field-hint">
          {formData.description?.length || 0} / 2000 characters
        </span>
      </div>
    </section>

    <!-- Logistics -->
    <section class="form-section">
      <h3>Logistics</h3>

      <div class="form-grid">
        <div class="form-field">
          <label for="totalWeeks">
            Total Duration (weeks)
            <span class="required">*</span>
          </label>
          <input
            id="totalWeeks"
            type="number"
            min="1"
            max="52"
            bind:value={formData.logistics.totalWeeks}
            on:input={handleChange}
            class:error={errors.logistics?.totalWeeks}
            required
          />
          {#if errors.logistics?.totalWeeks}
            <span class="error-message">{errors.logistics?.totalWeeks}</span>
          {/if}
        </div>

        <div class="form-field">
          <label for="daysPerWeek">
            Days Per Week
            <span class="required">*</span>
          </label>
          <input
            id="daysPerWeek"
            type="number"
            min="1"
            max="7"
            bind:value={formData.logistics.daysPerWeek}
            on:input={handleChange}
            class:error={errors.logistics?.daysPerWeek}
            required
          />
          {#if errors.logistics?.daysPerWeek}
            <span class="error-message">{errors.logistics?.daysPerWeek}</span>
          {/if}
        </div>

        <div class="form-field">
          <label for="startDate">
            Expected Start Date
            <span class="optional">(optional)</span>
          </label>
          <input
            id="startDate"
            type="date"
            bind:value={formData.logistics.startDate}
            on:input={handleChange}
            class:error={errors.logistics?.startDate}
          />
          {#if errors.logistics?.startDate}
            <span class="error-message">{errors.logistics?.startDate}</span>
          {/if}
        </div>
      </div>
    </section>

    <!-- Learners -->
    <section class="form-section">
      <h3>Learners</h3>

      <div class="form-grid">
        <div class="form-field">
          <label for="cohortSize">
            Expected Cohort Size
            <span class="required">*</span>
          </label>
          <input
            id="cohortSize"
            type="number"
            min="1"
            max="1000"
            bind:value={formData.learners.cohortSize}
            on:input={handleChange}
            class:error={errors.learners?.cohortSize}
            required
          />
          {#if errors.learners?.cohortSize}
            <span class="error-message">{errors.learners?.cohortSize}</span>
          {/if}
        </div>

        <div class="form-field">
          <label for="structure">
            Course Structure
            <span class="required">*</span>
          </label>
          <select
            id="structure"
            bind:value={formData.structure}
            on:change={handleChange}
            required
          >
            <option value="peer-led">Peer-Led</option>
            <option value="facilitated">Facilitated</option>
          </select>
        </div>
      </div>

      <div class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.learners.teamBased}
            on:change={handleChange}
          />
          <span>Team-Based Learning</span>
        </label>
      </div>

      {#if formData.learners?.teamBased}
        <div class="form-field indent">
          <label for="teamSize">
            Team Size
            <span class="required">*</span>
          </label>
          <input
            id="teamSize"
            type="number"
            min="2"
            max="20"
            bind:value={formData.learners.teamSize}
            on:input={handleChange}
            class:error={errors.learners?.teamSize}
          />
          {#if errors.learners?.teamSize}
            <span class="error-message">{errors.learners?.teamSize}</span>
          {/if}
          <span class="field-hint">Recommended: 3-5 people per team</span>
        </div>
      {/if}

      <div class="form-grid">
        <div class="form-field">
          <label for="prereq">
            Learners' Experience in Related Fields
            <span class="required">*</span>
          </label>
          <select
            id="prereq"
            bind:value={formData.learners.experience.prereq}
            on:change={handleChange}
            required
          >
            <option value="<= 1 year">Less Than a Year</option>
            <option value="1-3 years">1-3 Years</option>
            <option value=">= 4 years">4 or More Years</option>
          </select>
        </div>

        <div class="form-field">
          <label for="focus">
            Learners' Experience in Course Focus
            <span class="required">*</span>
          </label>
          <select
            id="focus"
            bind:value={formData.learners.experience.focus}
            on:change={handleChange}
            required
          >
            <option value="no experience">No Experience</option>
            <option value="limited experience">Limited Experience</option>
            <option value="skilled amateur">Skilled Amateur</option>
            <option value="current professional">Current Professional</option>
          </select>
        </div>
      </div>

      <div class="form-field">
        <label for="prerequisites">
          Prerequisites
          <span class="optional">(optional)</span>
        </label>
        <textarea
          id="prerequisites"
          rows="3"
          bind:value={formData.learners.prerequisites}
          on:input={handleChange}
          placeholder="Any specific skills, knowledge, or experience required before starting this course..."
        ></textarea>
      </div>
    </section>

    <!-- Submit -->
    <div class="form-actions">
      <button type="submit" class="submit-btn">
        Continue to Module Planning →
      </button>
    </div>
  </form>
  {:else}
  <div class="loading-placeholder">
    <p>Initializing form...</p>
  </div>
  {/if}
</div>

<style>
  .course-config-form {
    max-width: 800px;
    margin: 0 auto;
  }

  h2 {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .form-description {
    color: #666;
    margin-bottom: 2rem;
  }

  .loading-placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
    font-style: italic;
  }

  .form-section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .form-section h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e9ecef;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
  }

  .form-field:last-child {
    margin-bottom: 0;
  }

  .form-field.indent {
    margin-left: 2rem;
    padding-left: 1rem;
    border-left: 3px solid #e9ecef;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
  }

  .required {
    color: #dc3545;
  }

  .optional {
    font-weight: 400;
    color: #999;
    font-size: 0.85rem;
  }

  input[type="text"],
  input[type="number"],
  input[type="date"],
  select,
  textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }

  input.error,
  textarea.error {
    border-color: #dc3545;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .field-hint {
    color: #999;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: 500;
  }

  .checkbox-label input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;
  }

  .submit-btn {
    padding: 1rem 2rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .submit-btn:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: 1.5rem;
    }
  }
</style>
