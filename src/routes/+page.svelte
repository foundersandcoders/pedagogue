<script>
  import { onMount } from "svelte";
  import FileUpload from "$lib/FileUpload.svelte";
  import StructuredInputForm from "$lib/StructuredInputForm.svelte";
  import ModulePreview from "$lib/ModulePreview.svelte";
  import {
    currentStep,
    projectFile,
    pythonFile,
    researchFile,
    uploadStates,
    uploadErrors,
    canProceedToStep2,
    structuredInput,
    generatedModule,
  } from "$lib/stores.ts";

  const steps = [
    "Upload Files",
    "Add Context",
    "Generate Module",
  ];

  let isGenerating = false;
  let generationError = null;
  let generatedXML = "";
  let fullResponse = "";

  function handleFileUploaded(event) {
    const { type, data } = event.detail;

    if (type === "project") {
      projectFile.set(data);
      uploadStates.update((state) => ({ ...state, project: "success" }));
      uploadErrors.update((errors) => ({ ...errors, project: null }));
    } else if (type === "python") {
      pythonFile.set(data);
      uploadStates.update((state) => ({ ...state, python: "success" }));
      uploadErrors.update((errors) => ({ ...errors, python: null }));
    } else {
      researchFile.set(data);
      uploadStates.update((state) => ({ ...state, research: "success" }));
      uploadErrors.update((errors) => ({ ...errors, research: null }));
    }
  }

  function handleUploadError(event) {
    const { type, error } = event.detail;

    if (type === "project") {
      uploadStates.update((state) => ({ ...state, project: "error" }));
      uploadErrors.update((errors) => ({ ...errors, project: error }));
    } else if (type === "python") {
      uploadStates.update((state) => ({ ...state, python: "error" }));
      uploadErrors.update((errors) => ({ ...errors, python: error }));
    } else {
      uploadStates.update((state) => ({ ...state, research: "error" }));
      uploadErrors.update((errors) => ({ ...errors, research: error }));
    }
  }

  function proceedToStep2() {
    currentStep.set(2);
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

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectData: $projectFile,
          pythonData: $pythonFile,
          researchData: $researchFile,
          structuredInput: $structuredInput,
          enableResearch: $structuredInput.enableResearch,
          useExtendedThinking: $structuredInput.useExtendedThinking,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate module");
      }

      const data = await response.json();

      if (data.success) {
        fullResponse = data.content;
        generatedXML = data.xmlContent || "";

        if (generatedXML) {
          generatedModule.set(generatedXML);
        }

        if (!data.hasValidXML) {
          generationError = "Generated content did not include valid XML module specification";
        }
      } else {
        throw new Error(data.message || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      generationError = error.message;
    } finally {
      isGenerating = false;
    }
  }

  function regenerateModule() {
    generateModule();
  }

  function goBackToContext() {
    currentStep.set(2);
  }

  onMount(() => {
    console.log("Pedagogue app initialized");
  });
</script>

<svelte:head>
  <title>Pedagogue - Module Generator</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Pedagogue</h1>
    <p>AI-powered module specification generator for peer-led courses</p>
  </header>

  <div class="workflow">
    <div class="steps">
      {#each steps as step, index}
        <div
          class="step"
          class:active={$currentStep === index + 1}
          class:completed={$currentStep > index + 1}
        >
          <span class="step-number">{index + 1}</span>
          <span class="step-name">{step}</span>
        </div>
      {/each}
    </div>

    <div class="content">
      <!-- TODO: Turn these divs into Components -->
      {#if $currentStep === 1}
        <div class="upload-section">
          <h2>Upload Module Files</h2>
          <p>
            Upload your three XML files to begin: project, python requirements,
            and research topics.
          </p>

          <div class="upload-areas">
            <FileUpload
              fileType="project"
              uploadState={$uploadStates.project}
              error={$uploadErrors.project}
              on:fileUploaded={handleFileUploaded}
              on:uploadError={handleUploadError}
            />

            <!-- TODO: Make python.xml optional -->
            <FileUpload
              fileType="python"
              uploadState={$uploadStates.python}
              error={$uploadErrors.python}
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
              <button
                type="button"
                class="proceed-button"
                on:click={proceedToStep2}
              >
                Continue to Context →
              </button>
            </div>
          {/if}
        </div>
      {:else if $currentStep === 2}
        <div class="analysis-section">
          <StructuredInputForm
            formData={$structuredInput}
            on:submit={handleFormSubmit}
            on:change={handleFormChange}
          />
        </div>
      {:else if $currentStep === 3}
        <div class="generation-section">
          <div class="generation-header">
            <h2>Module Generation</h2>
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
              <p>Generating module specification...</p>
              {#if $structuredInput.enableResearch}
                <p class="loading-hint">
                  Deep research enabled - this may take 30-60 seconds
                </p>
              {/if}
            </div>
          {:else if generationError}
            <div class="error-state">
              <div class="error-icon">⚠</div>
              <h3>Generation Error</h3>
              <p>{generationError}</p>
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
              <ModulePreview xmlContent={generatedXML} />

              <div class="action-buttons">
                <button
                  type="button"
                  class="btn-secondary"
                  on:click={regenerateModule}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          {:else}
            <div class="empty-generation">
              <p>Ready to generate your module specification</p>
              <button
                type="button"
                class="generate-button"
                on:click={generateModule}
              >
                Generate Module
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="placeholder">
          <p>Step {$currentStep} - {steps[$currentStep - 1]}</p>
          <p>Implementation coming soon...</p>
        </div>
      {/if}
    </div>
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

  header h1 {
    font-size: 3rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  header p {
    color: #666;
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
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
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
    color: #ccc;
    font-weight: bold;
  }

  .step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }

  .step.active .step-number {
    background: #007bff;
    color: white;
  }

  .step.completed .step-number {
    background: #28a745;
    color: white;
  }

  .step-name {
    font-size: 0.9rem;
    color: #495057;
  }

  .step.active .step-name {
    color: #007bff;
    font-weight: 600;
  }

  .content {
    padding: 2rem;
  }

  .upload-section h2 {
    margin-bottom: 1rem;
    color: #333;
  }

  .upload-section p {
    color: #666;
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
    border-top: 1px solid #e9ecef;
  }

  .proceed-button {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .proceed-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  .placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  }

  code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: "SF Mono", Consolas, monospace;
  }

  /* Generation Section Styles */
  .generation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .generation-header h2 {
    margin: 0;
    color: #333;
  }

  .back-button {
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover:not(:disabled) {
    background: #e9ecef;
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
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
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
    color: #495057;
    margin: 0.5rem 0;
  }

  .loading-hint {
    font-size: 0.9rem !important;
    color: #999 !important;
  }

  .error-state {
    text-align: center;
    padding: 3rem 2rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
  }

  .error-icon {
    font-size: 3rem;
    color: #721c24;
    margin-bottom: 1rem;
  }

  .error-state h3 {
    color: #721c24;
    margin: 0 0 0.5rem 0;
  }

  .error-state p {
    color: #721c24;
    margin: 0 0 1.5rem 0;
  }

  .retry-button {
    background: #dc3545;
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
    background: #c82333;
  }

  .empty-generation {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-generation p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .generate-button {
    background: #007bff;
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
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  .result-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn-secondary {
    background: white;
    color: #495057;
    border: 1px solid #dee2e6;
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
    background: #e9ecef;
  }
</style>
