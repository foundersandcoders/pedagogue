<script lang="ts">
  import type { ErrorSeverity, GenerationError } from "$lib/types/error";

  /**
   * Reusable Error Alert Component
   *
   * Displays error messages with appropriate styling based on severity.
   * Supports retry actions and dismissal.
   */

  /** The error to display */
  export let error: GenerationError;

  /** Whether to show the retry button */
  export let showRetry: boolean = false;

  /** Whether to show the dismiss button */
  export let showDismiss: boolean = true;

  /** Callback when retry is clicked */
  export let onRetry: (() => void) | undefined = undefined;

  /** Callback when dismiss is clicked */
  export let onDismiss: (() => void) | undefined = undefined;

  /** Whether to show technical details (stack trace, etc.) */
  export let showDetails: boolean = false;

  let detailsExpanded = false;

  // Determine styling based on severity
  $: severityClass = {
    error: "error-alert-error",
    warning: "error-alert-warning",
    info: "error-alert-info",
  }[error.severity || "error"];

  $: severityIcon = {
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }[error.severity || "error"];

  function handleRetry() {
    if (onRetry) {
      onRetry();
    }
  }

  function handleDismiss() {
    if (onDismiss) {
      onDismiss();
    }
  }

  function toggleDetails() {
    detailsExpanded = !detailsExpanded;
  }
</script>

<div class="error-alert {severityClass}" role="alert">
  <div class="error-alert-header">
    <span class="error-alert-icon">{severityIcon}</span>
    <div class="error-alert-content">
      <p class="error-alert-message">{error.userMessage}</p>
      {#if error.code}
        <p class="error-alert-code">Error code: {error.code}</p>
      {/if}
    </div>
  </div>

  <div class="error-alert-actions">
    {#if showRetry && error.retryable && onRetry}
      <button
        class="error-alert-button error-alert-retry"
        on:click={handleRetry}
      >
        Retry
      </button>
    {/if}

    {#if showDetails}
      <button
        class="error-alert-button error-alert-details"
        on:click={toggleDetails}
      >
        {detailsExpanded ? "Hide" : "Show"} Details
      </button>
    {/if}

    {#if showDismiss && onDismiss}
      <button
        class="error-alert-button error-alert-dismiss"
        on:click={handleDismiss}
      >
        Dismiss
      </button>
    {/if}
  </div>

  {#if showDetails && detailsExpanded}
    <div class="error-alert-details-panel">
      <p><strong>Technical Message:</strong> {error.message}</p>
      {#if error.stack}
        <details>
          <summary>Stack Trace</summary>
          <pre>{error.stack}</pre>
        </details>
      {/if}
    </div>
  {/if}
</div>

<style>
  .error-alert {
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    border-left: 4px solid;
  }

  .error-alert-error {
    background-color: #fee;
    border-left-color: #c33;
    color: #600;
  }

  .error-alert-warning {
    background-color: #ffc;
    border-left-color: #c90;
    color: #630;
  }

  .error-alert-info {
    background-color: #def;
    border-left-color: #39c;
    color: #036;
  }

  .error-alert-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .error-alert-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .error-alert-content {
    flex: 1;
  }

  .error-alert-message {
    margin: 0 0 8px 0;
    font-weight: 500;
    font-size: 16px;
  }

  .error-alert-code {
    margin: 0;
    font-size: 12px;
    opacity: 0.7;
    font-family: monospace;
  }

  .error-alert-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;
  }

  .error-alert-button {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .error-alert-button:hover {
    opacity: 0.8;
  }

  .error-alert-retry {
    border-color: #39c;
    color: #39c;
  }

  .error-alert-retry:hover {
    background-color: #39c;
    color: white;
  }

  .error-alert-details {
    border-color: #666;
    color: #666;
  }

  .error-alert-dismiss {
    border-color: #999;
    color: #999;
  }

  .error-alert-details-panel {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 14px;
  }

  .error-alert-details-panel pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    margin-top: 8px;
  }

  .error-alert-details-panel details {
    margin-top: 12px;
  }

  .error-alert-details-panel summary {
    cursor: pointer;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .error-alert-details-panel summary:hover {
    opacity: 0.7;
  }
</style>
