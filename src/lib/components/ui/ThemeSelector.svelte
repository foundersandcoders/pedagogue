<script lang="ts">
  import {
    themePreference,
    cycleThemePreference,
    type ThemePreference,
  } from "$lib/stores/themeStore";

  /**
   * Handle theme selection
   */
  function handleThemeClick(preference: ThemePreference) {
    themePreference.set(preference);
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent, preference: ThemePreference) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleThemeClick(preference);
    }
  }

  /**
   * Get label for theme option
   */
  function getThemeLabel(preference: ThemePreference): string {
    switch (preference) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
    }
  }

  /**
   * Get icon for theme option
   */
  function getThemeIcon(preference: ThemePreference): string {
    switch (preference) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "system":
        return "💻";
    }
  }
  const themeOptions: ThemePreference[] = ["light", "dark", "system"];
</script>

<div class="theme-selector" role="radiogroup" aria-label="Theme selection">
  {#each themeOptions as option}
    <button
      type="button"
      class="theme-option"
      class:active={$themePreference === option}
      role="radio"
      aria-checked={$themePreference === option}
      aria-label={`Switch to ${getThemeLabel(option)} theme`}
      tabindex={$themePreference === option ? 0 : -1}
      on:click={() => handleThemeClick(option)}
      on:keydown={(e) => handleKeydown(e, option)}
    >
      <span class="theme-icon" aria-hidden="true">{getThemeIcon(option)}</span>
      <span class="theme-label">{getThemeLabel(option)}</span>
    </button>
  {/each}
</div>

<style>
  .theme-selector {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.25rem;
    background: var(--palette-bg-subtle, #f5f5f5);
    border-radius: 0.5rem;
    border: 1px solid var(--palette-line, #e0e0e0);
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--palette-foreground, #333);
    white-space: nowrap;
  }

  .theme-option:hover {
    background: var(--palette-bg-nav, #e8e8e8);
  }

  .theme-option:focus-visible {
    outline: 2px solid var(--palette-foreground, #333);
    outline-offset: 2px;
  }

  .theme-option.active {
    background: var(--palette-foreground, #333);
    color: white;
    border-color: var(--palette-foreground, #333);
  }

  .theme-option.active:hover {
    background: var(--palette-accent, #555);
    border-color: var(--palette-accent, #555);
  }

  .theme-icon {
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }

  .theme-label {
    line-height: 1;
  }

  /* Responsive: hide labels on small screens */
  @media (max-width: 640px) {
    .theme-label {
      display: none;
    }

    .theme-option {
      padding: 0.5rem;
    }

    .theme-icon {
      font-size: 1.25rem;
    }
  }
</style>
