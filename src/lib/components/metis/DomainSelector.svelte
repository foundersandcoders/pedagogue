<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DomainConfig } from "$lib/schemas/apiValidator";
  import { getAllDomainLists } from "$lib/config/researchDomains";
  import {
    validateDomain,
    normalizeDomain,
  } from "$lib/utils/validation/domainValidator";

  export let domainConfig: DomainConfig = {
    useList: "ai-engineering",
    customDomains: [],
  };

  const dispatch = createEventDispatcher<{
    change: DomainConfig;
  }>();

  // Get available domain lists
  const availableLists = getAllDomainLists();

  let customDomainInput = "";
  let validationError = "";

  function handleListChange() {
    validationError = "";
    dispatch("change", domainConfig);
  }

  function addCustomDomain() {
    const trimmed = customDomainInput.trim();
    if (!trimmed) return;

    // Validate domain
    const validation = validateDomain(trimmed);
    if (!validation.valid) {
      validationError = validation.error || "Invalid domain format";
      return;
    }

    const normalized = normalizeDomain(validation.normalized || trimmed);

    // Check for duplicates
    if (domainConfig.customDomains.includes(normalized)) {
      validationError = "Domain already added";
      return;
    }

    // Add domain
    domainConfig.customDomains = [...domainConfig.customDomains, normalized];
    customDomainInput = "";
    validationError = "";
    dispatch("change", domainConfig);
  }

  function removeCustomDomain(domain: string) {
    domainConfig.customDomains = domainConfig.customDomains.filter(
      (d) => d !== domain,
    );
    dispatch("change", domainConfig);
  }

  function handleCustomDomainKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomDomain();
    }
  }

  function clearValidationError() {
    validationError = "";
  }
</script>

<div class="domain-selector">
  <div class="form-field">
    <label for="domainList">
      Domain List
      <span class="optional">(optional)</span>
    </label>
    <select
      id="domainList"
      bind:value={domainConfig.useList}
      on:change={handleListChange}
    >
      {#each availableLists as list}
        <option value={list.id}>{list.name}</option>
      {/each}
      <option value={null}>No Restrictions</option>
    </select>
    <span class="field-hint">
      {#if domainConfig.useList === null}
        Research can access any domain on the web
      {:else}
        Research limited to trusted sources for {availableLists.find(
          (l) => l.id === domainConfig.useList,
        )?.name || "this list"}
      {/if}
    </span>
  </div>

  <div class="form-field">
    <label for="customDomains">
      Custom Domains
      <span class="optional">(optional)</span>
    </label>
    <div class="custom-domain-input-group">
      <input
        id="customDomains"
        type="text"
        placeholder="example.com or *.github.com or example.com/blog"
        bind:value={customDomainInput}
        on:keydown={handleCustomDomainKeydown}
        on:input={clearValidationError}
        class:error={validationError}
      />
      <button
        type="button"
        class="add-domain-btn"
        on:click={addCustomDomain}
        disabled={!customDomainInput.trim()}
      >
        Add
      </button>
    </div>
    {#if validationError}
      <span class="error-message">{validationError}</span>
    {/if}
    <span class="field-hint">
      Supports wildcards (*.example.com) and subpaths (example.com/path)
    </span>

    {#if domainConfig.customDomains.length > 0}
      <div class="custom-domains-list">
        {#each domainConfig.customDomains as domain}
          <span class="domain-tag">
            {domain}
            <button
              type="button"
              class="remove-domain"
              on:click={() => removeCustomDomain(domain)}
              aria-label="Remove {domain}">&times;</button
            >
          </span>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .domain-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--palette-foreground-alt);
    font-size: 0.95rem;
  }

  .optional {
    font-weight: 400;
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
  }

  select,
  input[type="text"] {
    padding: 0.75rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  select:focus,
  input:focus {
    outline: none;
    border-color: var(--palette-primary);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  input.error {
    border-color: var(--palette-primary);
  }

  .field-hint {
    color: var(--palette-foreground-alt);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .error-message {
    color: var(--palette-primary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .custom-domain-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .custom-domain-input-group input {
    flex: 1;
  }

  .add-domain-btn {
    padding: 0.75rem 1.5rem;
    background: var(--palette-foreground);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .add-domain-btn:hover:not(:disabled) {
    background: var(--palette-foreground-alt);
  }

  .add-domain-btn:disabled {
    background: var(--palette-foreground-alt);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .custom-domains-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .domain-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--palette-bg-subtle);
    color: var(--palette-primary);
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: monospace;
  }

  .remove-domain {
    background: none;
    border: none;
    color: var(--palette-primary);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-weight: bold;
  }

  .remove-domain:hover {
    color: var(--palette-primary);
    opacity: 0.7;
  }
</style>
