<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { toGenerationError } from "$lib/utils/errorHandler";
  import { type GenerationError } from "$lib/types/error";
  import ErrorAlert from "./ErrorAlert.svelte";

  /**
   * Error Boundary Component
   *
   * Catches unhandled errors in child components and displays a fallback UI.
   * Note: Svelte doesn't have React-style error boundaries, so this uses
   * global error handlers and provides a wrapper for error-prone sections.
   */

  /** Fallback UI to show when an error occurs (slot takes precedence) */
  export let fallback: string =
    "Something went wrong. Please refresh the page.";

  /** Whether to show retry button */
  export let showRetry: boolean = true;

  /** Callback when retry is clicked */
  export let onRetry: (() => void) | undefined = undefined;

  /** Context name for error reporting */
  export let context: string = "component";

  let error: GenerationError | null = null;
  let errorInfo: string | null = null;

  function handleError(event: ErrorEvent) {
    // Only capture errors that occur in this component's subtree
    // (This is a limitation - we can't perfectly scope errors in Svelte)
    const generationError = toGenerationError(event.error || event.message);
    error = generationError;
    errorInfo = event.error?.stack || event.message;

    console.error(`[ErrorBoundary:${context}]`, generationError);

    // Prevent the error from bubbling up
    event.preventDefault();
  }

  function handleUnhandledRejection(event: PromiseRejectionEvent) {
    const generationError = toGenerationError(event.reason);
    error = generationError;
    errorInfo = event.reason?.stack || String(event.reason);

    console.error(
      `[ErrorBoundary:${context}] Unhandled rejection:`,
      generationError,
    );

    // Prevent the error from bubbling up
    event.preventDefault();
  }

  function handleRetry() {
    error = null;
    errorInfo = null;

    if (onRetry) {
      onRetry();
    }
  }

  onMount(() => {
    // Note: These are global handlers, so they'll catch all errors
    // A more sophisticated implementation would use context to scope errors
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
  });

  onDestroy(() => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  });
</script>

{#if error}
  <div class="error-boundary" role="alert">
    <slot name="fallback">
      <ErrorAlert
        {error}
        {showRetry}
        onRetry={handleRetry}
        showDismiss={false}
        showDetails={true}
      />
      {#if fallback}
        <p class="error-boundary-fallback">{fallback}</p>
      {/if}
    </slot>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    padding: 20px;
    margin: 20px 0;
  }

  .error-boundary-fallback {
    text-align: center;
    color: var(--palette-foreground-alt);
    margin-top: 16px;
  }
</style>
