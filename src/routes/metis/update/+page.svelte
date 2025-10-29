<script lang="ts">
  import { onMount } from "svelte";
  import FileUpload from "$lib/components/metis/FileUpload.svelte";
  import StructuredInputForm from "$lib/components/metis/StructuredInputForm.svelte";
  import ModulePreview from "$lib/components/metis/ModulePreview.svelte";
  import {
    currentStep,
    projectsFile,
    skillsFile,
    researchFile,
    uploadStates,
    uploadErrors,
    canProceedToStep2,
    structuredInput,
    generatedModule,
  } from "$lib/stores/metisStores";

  const steps = ["Upload Files", "Add Context", "Generate Module"];

  let isGenerating = false;
  let generationError = null;
  let generatedXML = "";
  let fullResponse = "";
  let progressMessages = [];
  let currentAttempt = 1;
  let validationWarnings = [];

  // Automatic step navigation: advance from step 1 to step 2 when all files uploaded
  $: if ($canProceedToStep2 && $currentStep === 1) {
    currentStep.set(2);
  }

  function handleFileUploaded(event) {
    const { type, data } = event.detail;

    if (type === "projects") {
      projectsFile.set(data);
      uploadStates.update((state) => ({ ...state, projects: "success" }));
      uploadErrors.update((errors) => ({ ...errors, projects: null }));
    } else if (type === "skills") {
      skillsFile.set(data);
      uploadStates.update((state) => ({ ...state, skills: "success" }));
      uploadErrors.update((errors) => ({ ...errors, skills: null }));
    } else if (type === "research") {
      researchFile.set(data);
      uploadStates.update((state) => ({ ...state, research: "success" }));
      uploadErrors.update((errors) => ({ ...errors, research: null }));
    }
  }

  function handleUploadError(event) {
    const { type, error } = event.detail;

    if (type === "projects") {
      uploadStates.update((state) => ({ ...state, projects: "error" }));
      uploadErrors.update((errors) => ({ ...errors, projects: error }));
    } else if (type === "skills") {
      uploadStates.update((state) => ({ ...state, skills: "error" }));
      uploadErrors.update((errors) => ({ ...errors, skills: error }));
    } else if (type === "research") {
      uploadStates.update((state) => ({ ...state, research: "error" }));
      uploadErrors.update((errors) => ({ ...errors, research: error }));
    }
  }

  async function handleFormSubmit(event) {
    structuredInput.set(event.detail);

    // Proceed to generation step
    currentStep.set(3);

    // Automatically start generation
    await generateModule();
  }

  function handleFormChange(event) {
    structuredInput.set(event.detail);
  }

  async function generateModule() {
    isGenerating = true;
    generationError = null;
    generatedXML = "";
    fullResponse = "";
    progressMessages = [];
    currentAttempt = 1;
    validationWarnings = [];

    // First, POST the data to initiate generation
    try {
      const response = await fetch("/api/metis/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          projectsData: $projectsFile,
          skillsData: $skillsFile,
          researchData: $researchFile,
          structuredInput: $structuredInput,
          enableResearch: $structuredInput.model.enableResearch,
          useExtendedThinking: $structuredInput.model.useExtendedThinking,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate module");
      }

      // Check if we got SSE response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/event-stream")) {
        // Handle SSE streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            }
          }
        }
      } else {
        // Fallback to regular JSON response
        const data = await response.json();
        handleJSONResponse(data);
      }
    } catch (error) {
      console.error("Generation error:", error);
      generationError = error.message;
      isGenerating = false;
    }
  }

  function handleSSEEvent(data) {
    switch (data.type) {
      case "connected":
        progressMessages = [
          ...progressMessages,
          { type: "info", text: data.message },
        ];
        break;

      case "progress":
        progressMessages = [
          ...progressMessages,
          { type: "info", text: data.message },
        ];
        break;

      case "content":
        // Accumulate content chunks
        fullResponse += data.chunk;
        break;

      case "validation_started":
        progressMessages = [
          ...progressMessages,
          { type: "info", text: data.message },
        ];
        break;

      case "validation_success":
        progressMessages = [
          ...progressMessages,
          { type: "success", text: data.message },
        ];
        break;

      case "validation_failed":
        progressMessages = [
          ...progressMessages,
          {
            type: "warning",
            text: `${data.message}: ${data.errors.join(", ")}`,
          },
        ];
        currentAttempt = data.attempts || currentAttempt;
        break;

      case "complete":
        fullResponse = data.content;
        generatedXML = data.xmlContent || "";
        validationWarnings = data.warnings || [];
        currentAttempt = data.attempts || 1;

        if (generatedXML) {
          generatedModule.set(generatedXML);
        }

        progressMessages = [
          ...progressMessages,
          {
            type: "success",
            text: `Generation complete${currentAttempt > 1 ? ` (succeeded on attempt ${currentAttempt})` : ""}`,
          },
        ];

        isGenerating = false;
        break;

      case "error":
        generationError = data.message;
        if (data.errors && data.errors.length > 0) {
          generationError += ": " + data.errors.join(", ");
        }
        progressMessages = [
          ...progressMessages,
          { type: "error", text: generationError },
        ];
        isGenerating = false;
        break;

      default:
        console.log("Unknown SSE event type:", data.type);
    }
  }

  function handleJSONResponse(data) {
    if (data.success) {
      fullResponse = data.content;
      generatedXML = data.xmlContent || "";
      validationWarnings = data.validationWarnings || [];

      if (generatedXML) {
        generatedModule.set(generatedXML);
      }

      if (!data.hasValidXML) {
        generationError =
          "Generated content did not include valid XML module specification";
      }
    } else {
      throw new Error(data.message || "Generation failed");
    }
    isGenerating = false;
  }

  function regenerateModule() {
    generateModule();
  }

  function goBackToContext() {
    currentStep.set(2);
  }

  function goBackToFiles() {
    currentStep.set(1);
  }

  onMount(() => {
    console.log("Workflow initialised: Metis");
  });
</script>

<svelte:head>
  <title>Metis • Module Designer</title>
  <link rel="icon" href="favicons/favicon.ico" />
</svelte:head>

<div id="metis-container" class="container">
  <header id="metis-header">
    <div class="header-title">
      <img src="icon.png" alt="Metis icon" class="header-icon" />
      <h1>Metis</h1>
    </div>
    <p>AI-powered module specification generator for peer-led courses</p>
  </header>

  <div class="metis-workflow">
    <nav class="metis-steps">
      {#each steps as step, i}
        <div
          class="step"
          class:active={$currentStep === i + 1}
          class:completed={$currentStep > i + 1}
        >
          <span class="step-number">{i + 1}</span>
          <span class="step-name">{step}</span>
        </div>
      {/each}
    </nav>

    <main class="metis-content">
      <!-- TODO: Turn these divs into Components -->
      {#if $currentStep === 1}
        <section class="upload-section">
          <h2>Upload Module Files</h2>
          <p>
            Upload your three XML files to begin: project briefs, additional
            skills, and research topics.
          </p>

          <div class="upload-areas">
            <FileUpload
              fileType="projects"
              uploadState={$uploadStates.projects}
              error={$uploadErrors.projects}
              on:fileUploaded={handleFileUploaded}
              on:uploadError={handleUploadError}
            />
            <FileUpload
              fileType="skills"
              uploadState={$uploadStates.skills}
              error={$uploadErrors.skills}
              on:fileUploaded={handleFileUploaded}
              on:uploadError={handleUploadError}
            />
            <FileUpload
              fileType="research"
              uploadState={$uploadStates.research}
              error={$uploadErrors.research}
              on:fileUploaded={handleFileUploaded}
              on:uploadError={handleUploadError}
            />
          </div>

          {#if $canProceedToStep2}
            <div class="proceed-section">
              <p class="success-message">All files uploaded successfully</p>
            </div>
          {/if}
        </section>
      {:else if $currentStep === 2}
        <section class="analysis-section">
          <div class="section-header">
            <h2>Add Context</h2>
            <!-- TODO: update on:click to onclick -->
            <button type="button" class="back-button" on:click={goBackToFiles}>
              ← Back to Files
            </button>
          </div>

          <!-- TODO: update on:submit to onsubmit -->
          <!-- TODO: update on:change to onchange -->
          <StructuredInputForm
            formData={$structuredInput}
            on:submit={handleFormSubmit}
            on:change={handleFormChange}
          />
        </section>
      {:else if $currentStep === 3}
        <section class="generation-section">
          <div class="generation-header">
            <h2>Module Generation</h2>

            <!-- TODO: update on:click to onclick -->
            <button
              type="button"
              class="back-button"
              on:click={goBackToContext}
              disabled={isGenerating}
            >
              ← Back to Context
            </button>
          </div>

          {#if isGenerating}
            <div class="loading-state">
              <div class="spinner"></div>
              <h3>Generating module specification...</h3>
              {#if $structuredInput.model.enableResearch}
                <p class="loading-hint">
                  Deep research enabled - this may take 2-4 minutes
                </p>
              {/if}

              {#if progressMessages.length > 0}
                <div class="progress-log">
                  {#each progressMessages as message}
                    <div class="progress-message {message.type}">
                      {#if message.type === "success"}
                        <span class="icon">&check;</span>
                      {:else if message.type === "warning"}
                        <span class="icon">!</span>
                      {:else if message.type === "error"}
                        <span class="icon">✗</span>
                      {:else}
                        <span class="icon">•</span>
                      {/if}
                      <span class="message-text">{message.text}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {:else if generationError}
            <div class="error-state">
              <div class="error-icon">!</div>
              <h3>Generation Error</h3>
              <p>{generationError}</p>
              <!-- TODO: update on:click to onclick -->
              <button
                type="button"
                class="retry-button"
                on:click={regenerateModule}
              >
                Try Again
              </button>
            </div>
          {:else if generatedXML}
            <div class="result-section">
              {#if currentAttempt > 1}
                <div class="generation-meta">
                  <p class="retry-info">
                    Generation succeeded after {currentAttempt} attempt{currentAttempt >
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>
              {/if}

              {#if validationWarnings.length > 0}
                <div class="validation-warnings">
                  <h4>Validation Warnings</h4>
                  <ul>
                    {#each validationWarnings as warning}
                      <li>{warning}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <ModulePreview xmlContent={generatedXML} />

              <div class="action-buttons">
                <!-- TODO: update on:click to onclick -->
                <button
                  type="button"
                  class="btn-secondary"
                  on:click={regenerateModule}
                >
                  Regenerate
                </button>
              </div>
            </div>
          {:else}
            <div class="empty-generation">
              <p>Ready to generate your module specification</p>
              <!-- TODO: update on:click to onclick -->
              <button
                type="button"
                class="generate-button"
                on:click={generateModule}
              >
                Generate Module
              </button>
            </div>
          {/if}
        </section>
      {:else}
        <section class="placeholder">
          <p>Step {$currentStep} - {steps[$currentStep - 1]}</p>
          <p>Implementation coming soon...</p>
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

  .metis-workflow {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .metis-steps {
    display: flex;
    background: var(--palette-bg-nav);
    padding: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .step {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 0.5rem;
    position: relative;
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
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    border: 2px solid var(--palette-line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.6;
  }

  .step.active .step-number {
    background: var(--palette-foreground);
    color: white;
    border-color: var(--palette-foreground);
    opacity: 1;
  }

  .step.completed .step-number {
    background: var(--palette-foreground);
    color: white;
    border-color: var(--palette-foreground);
    opacity: 0.7;
  }

  .step-name {
    font-size: 0.9rem;
    color: var(--palette-foreground);
    opacity: 0.6;
  }

  .step.active .step-name {
    color: var(--palette-foreground);
    font-weight: 600;
    opacity: 1;
  }

  .metis-content {
    padding: 2rem;
  }

  .upload-section h2 {
    margin-bottom: 1rem;
    color: var(--palette-primary);
  }

  .upload-section p {
    color: var(--palette-foreground);
    margin-bottom: 2rem;
  }

  .upload-areas {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 1024px) {
    .upload-areas {
      grid-template-columns: 1fr;
    }
  }

  .proceed-section {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--palette-line);
  }

  .success-message {
    color: var(--palette-foreground);
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--palette-line);
  }

  .section-header h2 {
    margin: 0;
  }

  .placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--palette-foreground);
  }

  /*code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: "SF Mono", Consolas, monospace;
  }*/

  /* Generation Section Styles */
  .generation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .generation-header h2 {
    margin: 0;
    color: var(--palette-primary);
  }

  .back-button {
    background: white;
    color: var(--palette-primary);
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover:not(:disabled) {
    background: var(--palette-bg-subtle);
  }

  .back-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--palette-bg-subtle);
    border-top: 4px solid var(--palette-foreground);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    font-size: 1.1rem;
    color: var(--palette-primary);
    margin: 0.5rem 0;
  }

  .loading-hint {
    font-size: 0.9rem !important;
    color: var(--palette-foreground) !important;
  }

  .progress-log {
    max-width: 600px;
    margin: 2rem auto 0;
    text-align: left;
    background: var(--palette-bg-subtle);
    border-radius: 8px;
    padding: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .progress-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .progress-message .icon {
    flex-shrink: 0;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .progress-message.info {
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    border-left: 3px solid var(--palette-foreground);
  }

  .progress-message.info .icon {
    color: var(--palette-foreground);
  }

  .progress-message.success {
    background: var(--palette-bg-subtle-alt);
    color: var(--palette-foreground);
  }

  .progress-message.success .icon {
    color: var(--palette-foreground-alt);
  }

  .progress-message.warning {
    background: var(--palette-bg-subtle-alt);
    color: var(--palette-foreground);
  }

  .progress-message.warning .icon {
    color: var(--palette-accent);
  }

  .progress-message.error {
    background: var(--palette-bg-subtle-alt);
    color: var(--palette-primary);
  }

  .progress-message.error .icon {
    color: var(--palette-primary);
  }

  .progress-message .message-text {
    flex: 1;
    word-wrap: break-word;
  }

  .error-state {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    border-radius: 8px;
  }

  .error-icon {
    font-size: 3rem;
    color: var(--palette-primary);
    margin-bottom: 1rem;
  }

  .error-state h3 {
    color: var(--palette-primary);
    margin: 0 0 0.5rem 0;
  }

  .error-state p {
    color: var(--palette-primary);
    margin: 0 0 1.5rem 0;
  }

  .retry-button {
    background: var(--palette-primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-button:hover {
    filter: brightness(0.9);
  }

  .empty-generation {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-generation p {
    font-size: 1.1rem;
    color: var(--palette-foreground);
    margin-bottom: 2rem;
  }

  .generate-button {
    background: var(--palette-foreground);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .generate-button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .result-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .generation-meta {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .retry-info {
    color: var(--palette-foreground);
    font-weight: 600;
    margin: 0;
  }

  .validation-warnings {
    background: var(--palette-bg-subtle-alt);
    border: 1px solid var(--palette-line);
    border-radius: 8px;
    padding: 1rem 1.5rem;
  }

  .validation-warnings h4 {
    color: var(--palette-foreground);
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
  }

  .validation-warnings ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--palette-foreground);
  }

  .validation-warnings li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn-secondary {
    background: white;
    color: var(--palette-primary);
    border: 1px solid var(--palette-line);
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-secondary:hover {
    background: var(--palette-bg-subtle);
  }
</style>
