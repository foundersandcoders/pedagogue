<script lang="ts">
  import type { TitleInput } from "$lib/types/themis";

  export let value: TitleInput;
  export let label: string;
  export let placeholder: string = "";
  export let onChange: (newValue: TitleInput) => void;
  export let required: boolean = false;

  // Safety check: provide default if value is undefined
  const safeValue = value || { type: 'undefined' as const };

  // Internal state for binding
  let inputType: 'undefined' | 'prompt' | 'literal' = safeValue.type;
  let inputValue: string = safeValue.type === 'undefined' ? '' : safeValue.value;

  // Update internal state when value prop changes
  $: if (value) {
    inputType = value.type;
    inputValue = value.type === 'undefined' ? '' : value.value;
  }

  // Reactive statement to call onChange when internal state changes
  $: {
    let newValue: TitleInput;
    if (inputType === 'undefined') {
      newValue = { type: 'undefined' };
    } else {
      newValue = { type: inputType, value: inputValue };
    }
    onChange(newValue);
  }
</script>

<div class="title-input-field">
  <label for="{label.toLowerCase().replace(/\s+/g, '-')}-type">
    {label}
    {#if required}<span class="required">*</span>{/if}
  </label>

  <div class="input-group">
    <select
      id="{label.toLowerCase().replace(/\s+/g, '-')}-type"
      bind:value={inputType}
      class="type-selector"
    >
      <option value="undefined">Let AI decide</option>
      <option value="prompt">Give AI guidance</option>
      <option value="literal">Use exact title</option>
    </select>

    {#if inputType !== 'undefined'}
      <input
        id="{label.toLowerCase().replace(/\s+/g, '-')}-value"
        type="text"
        bind:value={inputValue}
        placeholder={inputType === 'prompt'
          ? placeholder || "e.g., 'A module about authentication'"
          : placeholder || "e.g., 'User Authentication with JWT'"}
        class="value-input"
      />
    {/if}
  </div>

  {#if inputType === 'undefined'}
    <p class="hint">The AI will choose an appropriate title based on the content and context.</p>
  {:else if inputType === 'prompt'}
    <p class="hint">The AI will use your guidance to generate a contextually appropriate title.</p>
  {:else}
    <p class="hint">This exact title will be used without modification.</p>
  {/if}
</div>

<style>
  .title-input-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    color: var(--palette-foreground-alt);
    font-size: 0.9rem;
    margin: 0;
  }

  .required {
    color: var(--palette-accent);
  }

  .input-group {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
  }

  .type-selector {
    flex: 0 0 160px;
    padding: 0.75rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .type-selector:focus {
    outline: none;
    border-color: var(--palette-secondary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--palette-secondary) 10%, transparent);
  }

  .value-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .value-input:focus {
    outline: none;
    border-color: var(--palette-secondary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--palette-secondary) 10%, transparent);
  }

  .hint {
    font-size: 0.85rem;
    color: var(--palette-foreground-alt);
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: var(--palette-bg-subtle);
    border-radius: 4px;
    border-left: 3px solid var(--palette-secondary);
  }

  @media (max-width: 768px) {
    .input-group {
      flex-direction: column;
    }

    .type-selector {
      flex: 1;
    }
  }
</style>
