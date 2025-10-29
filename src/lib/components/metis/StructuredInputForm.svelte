<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { techList } from "$lib/config/techStack";
  import type { StructuredInputData } from "$lib/stores/metisStores";
  import DomainSelector from "./DomainSelector.svelte";

  export let formData: StructuredInputData = {
    logistics: {
      duration: 3,
      startDate: "",
    },
    learners: {
      cohortSize: 12,
      experience: {
        prereq: "1-3 years",
        focus: "limited experience",
      },
    },
    content: {
      techs: [],
      info: "",
    },
    model: {
      enableResearch: true,
      useExtendedThinking: true,
      domainConfig: {
        useList: "ai-engineering",
        customDomains: [],
      },
    },
  };

  const dispatch = createEventDispatcher<{
    submit: StructuredInputData;
    change: StructuredInputData;
  }>();
  let errors: {
    logistics?: {
      duration?: string;
      startDate?: string;
    };
    learners?: {
      cohortSize?: string;
    };
  } = {};

  // Predefined technology options
  const commonTechnologies: string[] = [].concat(
    techList.language,
    techList.frontEnd,
    techList.backEnd,
    techList.runtime,
    techList.db,
    techList.devOps,
    techList.other,
  );

  let techInput = "";

  function addTechnology(tech: string) {
    const trimmed = tech.trim();
    if (trimmed && !formData.content.techs.includes(trimmed)) {
      formData.content.techs = [...formData.content.techs, trimmed];
      techInput = "";
      dispatch("change", formData);
    }
  }

  function removeTechnology(tech: string) {
    formData.content.techs = formData.content.techs.filter((t) => t !== tech);
    dispatch("change", formData);
  }

  function handleTechKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTechnology(techInput);
    }
  }

  function validateForm(): boolean {
    errors = {};

    if (formData.logistics.duration < 1 || formData.logistics.duration > 52) {
      if (!errors.logistics) errors.logistics = {};
      errors.logistics.duration = "Duration must be between 1 and 52 weeks";
    }

    if (
      formData.learners.cohortSize < 1 ||
      formData.learners.cohortSize > 1000
    ) {
      if (!errors.learners) errors.learners = {};
      errors.learners.cohortSize = "Cohort size must be between 1 and 1000";
    }

    if (formData.logistics.startDate) {
      const startDate = new Date(formData.logistics.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        if (!errors.logistics) errors.logistics = {};
        errors.logistics.startDate = "Delivery date cannot be in the past";
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

  function handleDomainConfigChange(event: CustomEvent) {
    formData.model.domainConfig = event.detail;
    dispatch("change", formData);
  }
</script>

<div class="structured-form">
  <h2>Module Context</h2>

  <p class="form-description">
    Provide additional context to help Claude generate a more targeted module
    specification.
  </p>

  <form on:submit={handleSubmit}>
    <div id="logistics-field-group" class="form-grid">
      <div id="duration-field" class="form-field">
        <label for="duration">
          Module Duration (weeks)
          <span class="required">*</span>
        </label>
        <input
          id="duration"
          type="number"
          min="1"
          max="52"
          bind:value={formData.logistics.duration}
          on:input={handleChange}
          class:error={errors.logistics?.duration}
          required
        />
        {#if errors.logistics?.duration}
          <span class="error-message">{errors.logistics?.duration}</span>
        {/if}
      </div>
      <div id="cohort-field" class="form-field">
        <label for="cohort">
          Expected Cohort Size
          <span class="required">*</span>
        </label>
        <input
          id="cohort"
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
      <div id="experience-prior-field" class="form-field">
        <label for="skillPrereq">
          Learners' Experience in Related Fields
          <span class="required">*</span>
        </label>
        <select
          id="skillPrereq"
          bind:value={formData.learners.experience.prereq}
          on:change={handleChange}
          required
        >
          <option value="<= 1 year">Less Than a Year</option>
          <option value="1-3 years">1-3 Years</option>
          <option value=">= 4 years">4 or More Years</option>
        </select>
      </div>
      <div id="experience-focus-field" class="form-field">
        <label for="skillFocus">
          Learners' Experience in This Course's Focus
          <span class="required">*</span>
        </label>
        <select
          id="skillFocus"
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
      <div id="start-date-field" class="form-field">
        <label for="delivery">
          Expected Delivery Date
          <span class="optional">(optional)</span>
        </label>
        <input
          id="delivery"
          type="date"
          bind:value={formData.logistics.startDate}
          on:input={handleChange}
          class:error={errors.logistics?.startDate}
        />
        {#if errors.logistics?.startDate}
          <span class="error-message">{errors.logistics?.startDate}</span>
        {/if}
        <span class="field-hint">
          Helps research find current, relevant information
        </span>
      </div>
    </div>
    <div id="techs-field" class="form-field full-width">
      <label for="technologies">
        Required Technologies & Techniques
        <span class="optional">(optional)</span>
      </label>

      <div class="tech-suggestions">
        {#each commonTechnologies as tech}
          <button
            type="button"
            class="tech-suggestion"
            class:selected={formData.content.techs.includes(tech)}
            on:click={() =>
              formData.content.techs.includes(tech)
                ? removeTechnology(tech)
                : addTechnology(tech)}
          >
            {tech}
            {#if formData.content.techs.includes(tech)}&check;{/if}
          </button>
        {/each}
      </div>

      <div class="tech-input-group">
        <input
          id="technologies"
          type="text"
          placeholder="Or add custom technology..."
          bind:value={techInput}
          on:keydown={handleTechKeydown}
        />
        <button
          type="button"
          class="add-tech-btn"
          on:click={() => addTechnology(techInput)}
          disabled={!techInput.trim()}
        >
          Add
        </button>
      </div>

      {#if formData.content.techs.length > 0}
        <div class="selected-technologies">
          {#each formData.content.techs as tech}
            <span class="tech-tag">
              {tech}
              <button
                type="button"
                class="remove-tech"
                on:click={() => removeTechnology(tech)}
                aria-label="Remove {tech}">&times;</button
              >
            </span>
          {/each}
        </div>
      {/if}
    </div>
    <div id="info-field" class="form-field full-width">
      <label for="info">
        Additional Information
        <span class="optional">(optional)</span>
      </label>
      <textarea
        id="info"
        rows="4"
        placeholder="Any specific requirements, constraints, or goals for this module..."
        bind:value={formData.content.info}
        on:input={handleChange}
      ></textarea>
      <span class="field-hint">
        {formData.content.info.length} / 1000 characters
      </span>
    </div>
    <div id="agent-field" class="form-section">
      <h3>Generation Options</h3>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.model.enableResearch}
            on:change={handleChange}
          />
          <span class="checkbox-text">
            <strong>Enable Deep Research</strong>
            <span class="checkbox-hint">
              Use web search to find current best practices and technologies
            </span>
          </span>
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.model.useExtendedThinking}
            on:change={handleChange}
          />
          <span class="checkbox-text">
            <strong>Use Extended Thinking</strong>
            <span class="checkbox-hint">
              Allow Claude more time to reason about complex requirements
            </span>
          </span>
        </label>
      </div>

      {#if formData.model.enableResearch}
        <div class="advanced-research-options">
          <h4>Research Configuration</h4>
          <DomainSelector
            domainConfig={formData.model.domainConfig}
            on:change={handleDomainConfigChange}
          />
        </div>
      {/if}
    </div>
    <div id="submit-field" class="form-actions">
      <button type="submit" class="submit-btn"> Continue to Review → </button>
    </div>
  </form>
</div>

<style>
  .structured-form {
    max-width: 800px;
    margin: 0 auto;
  }

  .structured-form h2 {
    margin-bottom: 0.5rem;
    color: var(--palette-foreground);
  }

  .form-description {
    color: var(--palette-foreground-alt);
    margin-bottom: 2rem;
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
  }

  .form-field.full-width {
    grid-column: 1 / -1;
    margin-bottom: 1.5rem;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--palette-foreground-alt);
    font-size: 0.95rem;
  }

  .required {
    color: var(--palette-primary);
  }

  .optional {
    font-weight: 400;
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
  }

  input[type="number"],
  input[type="date"],
  input[type="text"],
  select,
  textarea {
    padding: 0.75rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--palette-primary);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  input.error {
    border-color: var(--palette-primary);
  }

  .error-message {
    color: var(--palette-primary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .field-hint {
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .tech-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tech-suggestion {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--palette-line);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .tech-suggestion:hover {
    border-color: var(--palette-primary);
    background: var(--palette-bg-subtle);
  }

  .tech-suggestion.selected {
    background: var(--palette-primary);
    color: white;
    border-color: var(--palette-primary);
  }

  .tech-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .tech-input-group input {
    flex: 1;
  }

  .add-tech-btn {
    padding: 0.75rem 1.5rem;
    background: var(--palette-foreground);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .add-tech-btn:hover:not(:disabled) {
    background: var(--palette-foreground-alt);
  }

  .add-tech-btn:disabled {
    background: var(--palette-foreground-alt);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .selected-technologies {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .tech-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--palette-bg-subtle);
    color: var(--palette-primary);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .remove-tech {
    background: none;
    border: none;
    color: var(--palette-primary);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-weight: bold;
  }

  .remove-tech:hover {
    color: var(--palette-primary);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .form-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: var(--palette-bg-subtle);
    border-radius: 8px;
  }

  .form-section h3 {
    margin: 0 0 1rem 0;
    color: var(--palette-foreground);
    font-size: 1.1rem;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .checkbox-label:hover {
    background: rgba(0, 123, 255, 0.05);
  }

  .checkbox-label input[type="checkbox"] {
    margin-top: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .checkbox-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkbox-hint {
    font-weight: 400;
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
  }

  .advanced-research-options {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--palette-line);
  }

  .advanced-research-options h4 {
    margin: 0 0 1rem 0;
    color: var(--palette-foreground);
    font-size: 1rem;
    font-weight: 600;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--palette-line);
  }

  .submit-btn {
    padding: 1rem 2rem;
    background: var(--palette-primary);
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
    background: var(--palette-secondary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
