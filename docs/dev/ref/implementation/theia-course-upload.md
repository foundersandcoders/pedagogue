# Theia Course Upload Implementation Plan

## Overview

Implementation plan for Course Upload feature (Theia MVP Milestone 2.1.2). This enables users to upload previously exported course structures (JSON format) from Themis Phase 4 (Structure Review) to continue work or export in different formats.

## Design Decisions

### JSON-Based Upload (Not XML)

**Rationale:** Upload `CourseData` JSON from Themis Phase 4 (Structure Review), matching where Theia's export functionality is currently tested.

**Key advantages:**
- Leverages existing export capability (Theia already exports courses from Structure Review)
- No new schema design needed (uses established `CourseData` TypeScript interface)
- Type-safe with full TypeScript validation
- Simple round-trip: JSON → localStorage → JSON
- Fast implementation: ~16-22 hours vs 31-43 hours for XML approach
- Immediate value: Enables save/resume workflow for Themis users

**Deferred:** XML-based upload is postponed to future milestone after course XML schema is fully defined.

## Implementation Phases

### Phase 1: JSON Export for Testing (2-3 hours)

**Purpose:** Create test data by enabling JSON export of course structures.

#### 1.1 Add JSON Format Support

**File:** `src/lib/services/theiaService.ts` (line ~64)

```typescript
// In exportContent() switch statement
case 'json':
  // For courses, export the raw CourseData structure
  if (content.type === 'course') {
    formatted = JSON.stringify(content.data, null, 2);
  } else {
    throw new Error('JSON export only supported for courses');
  }
  break;
```

**File:** `src/lib/types/theia.ts` (line 20)

```typescript
export type ExportFormat = 'markdown' | 'html' | 'pdf' | 'json';
```

#### 1.2 Add JSON Export to UI

**File:** `src/lib/components/themis/CourseStructureReview.svelte`

Update `ExportConfigModal` integration to offer JSON format option when exporting courses.

**Test criteria:**
- ✅ Export course from Themis Structure Review
- ✅ Receive valid JSON file with complete `CourseData` structure
- ✅ JSON includes all arcs, modules, narratives, and metadata

---

### Phase 2: Upload UI Components (4-5 hours)

**Purpose:** Create user interface for uploading course JSON files.

#### 2.1 Create Theia Landing Page

**File:** `src/routes/theia/+page.svelte` (new)

```svelte
<script lang="ts">
  import CourseStructureUpload from '$lib/components/theia/CourseStructureUpload.svelte';
  import type { CourseData } from '$lib/types/themis';
  import { goto } from '$app/navigation';
  import { currentCourse, courseWorkflowStep } from '$lib/stores/themisStores';

  function handleCourseUploaded(event: CustomEvent<{ data: CourseData }>) {
    // Populate store
    currentCourse.set(event.detail.data);
    // Jump to structure review step
    courseWorkflowStep.set(4);
    // Navigate to Themis
    goto('/themis/generate');
  }
</script>

<div class="container">
  <h1>Theia: Content Manager</h1>
  <p>Upload previously generated content to continue working or export in different formats</p>

  <CourseStructureUpload on:courseUploaded={handleCourseUploaded} />
</div>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  h1 {
    margin-bottom: 0.5rem;
  }

  p {
    color: #6c757d;
    margin-bottom: 2rem;
  }
</style>
```

#### 2.2 Create Course Upload Component

**File:** `src/lib/components/theia/CourseStructureUpload.svelte` (new)

Pattern after `src/lib/components/metis/FileUpload.svelte` but adapted for JSON:

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CourseData } from '$lib/types/themis';
  import { validateCourseStructure, deserializeUploadedCourse } from '$lib/utils/theia/courseValidator';

  const dispatch = createEventDispatcher<{
    courseUploaded: { data: CourseData };
    uploadError: { error: string };
  }>();

  let fileInput: HTMLInputElement;
  let dragCounter = 0;
  let isDragOver = false;
  let uploadState: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  let error: string | null = null;
  let uploadedCourse: CourseData | null = null;

  async function handleFile(file: File) {
    // Validate file type
    if (!file.name.endsWith('.json')) {
      error = 'Please upload a JSON file';
      uploadState = 'error';
      dispatch('uploadError', { error });
      return;
    }

    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error = 'File too large (max 10MB)';
      uploadState = 'error';
      dispatch('uploadError', { error });
      return;
    }

    uploadState = 'uploading';
    error = null;

    try {
      const content = await file.text();
      const rawCourseData = JSON.parse(content);

      // Validate structure
      const validation = validateCourseStructure(rawCourseData);
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      // Deserialize (convert date strings to Date objects)
      const courseData = deserializeUploadedCourse(rawCourseData);

      uploadedCourse = courseData;
      uploadState = 'success';
    } catch (err) {
      console.error('Upload error:', err);
      error = err instanceof Error ? err.message : 'Invalid course JSON';
      uploadState = 'error';
      dispatch('uploadError', { error });
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    dragCounter = 0;

    const file = event.dataTransfer?.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    dragCounter++;
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      isDragOver = false;
    }
  }

  function openFileDialog() {
    if (uploadState !== 'uploading') {
      fileInput.click();
    }
  }

  function reset() {
    uploadState = 'idle';
    error = null;
    uploadedCourse = null;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function continueInThemis() {
    if (uploadedCourse) {
      dispatch('courseUploaded', { data: uploadedCourse });
    }
  }
</script>

<div class="upload-area">
  <h3>Upload Course Structure</h3>

  <div
    class="drop-zone"
    class:drag-over={isDragOver}
    class:uploading={uploadState === 'uploading'}
    class:success={uploadState === 'success'}
    class:error={uploadState === 'error'}
    on:click={openFileDialog}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
  >
    {#if uploadState === 'uploading'}
      <div class="upload-status">
        <div class="spinner"></div>
        <p>Processing course structure...</p>
      </div>
    {:else if uploadState === 'success' && uploadedCourse}
      <div class="upload-status success">
        <div class="checkmark">✓</div>
        <h4>{uploadedCourse.title}</h4>
        <div class="course-stats">
          <span>{uploadedCourse.arcs.length} arcs</span>
          <span>•</span>
          <span>{uploadedCourse.arcs.reduce((sum, arc) => sum + arc.modules.length, 0)} modules</span>
          <span>•</span>
          <span>{uploadedCourse.logistics.totalWeeks} weeks</span>
        </div>

        <div class="actions">
          <button class="primary" on:click|stopPropagation={continueInThemis}>
            {#if uploadedCourse.arcs.every(arc => arc.modules.every(m => m.status === 'complete'))}
              Preview & Export
            {:else}
              Continue in Themis
            {/if}
          </button>
          <button on:click|stopPropagation={reset}>
            Upload Different File
          </button>
        </div>
      </div>
    {:else if uploadState === 'error'}
      <div class="upload-status error">
        <div class="error-icon">⚠</div>
        <p class="error-message">{error}</p>
        <button
          type="button"
          class="retry-button"
          on:click|stopPropagation={reset}
        >
          Try Again
        </button>
      </div>
    {:else}
      <div class="upload-prompt">
        <div class="upload-icon">📄</div>
        <p>Drop course JSON here or click to browse</p>
        <p class="upload-hint">Exported from Themis Structure Review</p>
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept=".json,application/json"
    on:change={handleFileSelect}
    style="display: none;"
  />
</div>

<style>
  /* Reuse styles from FileUpload.svelte with minor adaptations */
  .upload-area {
    width: 100%;
  }

  .upload-area h3 {
    margin-bottom: 1rem;
    color: #495057;
    font-weight: 600;
  }

  .drop-zone {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drop-zone:hover:not(.uploading) {
    border-color: #007bff;
    background-color: #f8f9ff;
  }

  .drop-zone.drag-over {
    border-color: #007bff;
    background-color: #f0f8ff;
    border-style: solid;
  }

  .drop-zone.success {
    border-color: #28a745;
    background-color: #f8fff8;
  }

  .drop-zone.error {
    border-color: #dc3545;
    background-color: #fff8f8;
  }

  .upload-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .course-stats {
    display: flex;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .actions button {
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid currentColor;
    background: transparent;
  }

  .actions button.primary {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }

  .actions button.primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }

  .checkmark {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #28a745;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .error-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #dc3545;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .error-message {
    color: #dc3545;
    font-weight: 500;
    max-width: 400px;
    word-break: break-word;
  }

  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .upload-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .upload-hint {
    font-size: 0.85rem;
    color: #999;
  }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

---

### Phase 3: Validation Utilities (3-4 hours)

**Purpose:** Validate uploaded course structure and deserialize data correctly.

#### 3.1 Create Course Structure Validator

**File:** `src/lib/utils/theia/courseValidator.ts` (new)

```typescript
import type { CourseData, Arc, ModuleSlot } from '$lib/types/themis';

export interface CourseValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates uploaded course structure against CourseData interface
 */
export function validateCourseStructure(course: any): CourseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type guards
  if (!course || typeof course !== 'object') {
    return { valid: false, errors: ['Invalid course data: not an object'], warnings: [] };
  }

  // Required top-level fields
  if (!course.id || typeof course.id !== 'string') {
    errors.push('Missing or invalid course.id');
  }

  if (!course.title || typeof course.title !== 'string') {
    errors.push('Missing or invalid course.title');
  }

  if (!course.description || typeof course.description !== 'string') {
    warnings.push('Missing course.description');
  }

  if (!course.arcs || !Array.isArray(course.arcs)) {
    errors.push('Missing or invalid course.arcs array');
    return { valid: false, errors, warnings }; // Fatal - can't continue
  }

  if (course.arcs.length === 0) {
    errors.push('Course must have at least one arc');
  }

  // Validate logistics
  if (!course.logistics) {
    errors.push('Missing course.logistics');
  } else {
    if (typeof course.logistics.totalWeeks !== 'number' || course.logistics.totalWeeks < 1) {
      errors.push('Invalid logistics.totalWeeks (must be number >= 1)');
    }
    if (typeof course.logistics.daysPerWeek !== 'number' || course.logistics.daysPerWeek < 1) {
      errors.push('Invalid logistics.daysPerWeek (must be number >= 1)');
    }
  }

  // Validate learners
  if (!course.learners) {
    errors.push('Missing course.learners');
  } else {
    if (typeof course.learners.cohortSize !== 'number' || course.learners.cohortSize < 1) {
      errors.push('Invalid learners.cohortSize (must be number >= 1)');
    }
    if (typeof course.learners.teamBased !== 'boolean') {
      warnings.push('Invalid learners.teamBased (should be boolean)');
    }
    if (!course.learners.experience) {
      warnings.push('Missing learners.experience');
    }
  }

  // Validate structure
  if (!course.structure || !['facilitated', 'peer-led'].includes(course.structure)) {
    warnings.push('Invalid course.structure (should be "facilitated" or "peer-led")');
  }

  // Validate each arc
  course.arcs.forEach((arc: any, idx: number) => {
    const arcPrefix = `Arc ${idx + 1}`;

    if (!arc.id || typeof arc.id !== 'string') {
      errors.push(`${arcPrefix}: Missing or invalid id`);
    }
    if (!arc.title || typeof arc.title !== 'string') {
      errors.push(`${arcPrefix}: Missing or invalid title`);
    }
    if (!arc.description) {
      warnings.push(`${arcPrefix}: Missing description`);
    }
    if (!arc.theme) {
      warnings.push(`${arcPrefix}: Missing theme`);
    }
    if (typeof arc.durationWeeks !== 'number' || arc.durationWeeks < 1) {
      errors.push(`${arcPrefix}: Invalid durationWeeks`);
    }
    if (typeof arc.order !== 'number') {
      errors.push(`${arcPrefix}: Missing or invalid order`);
    }

    if (!arc.modules || !Array.isArray(arc.modules)) {
      errors.push(`${arcPrefix}: Missing or invalid modules array`);
    } else if (arc.modules.length === 0) {
      warnings.push(`${arcPrefix}: Has no modules`);
    } else {
      // Validate modules
      arc.modules.forEach((module: any, mIdx: number) => {
        const modPrefix = `${arcPrefix} Module ${mIdx + 1}`;

        if (!module.id || typeof module.id !== 'string') {
          errors.push(`${modPrefix}: Missing or invalid id`);
        }
        if (!module.arcId || module.arcId !== arc.id) {
          errors.push(`${modPrefix}: Missing or mismatched arcId`);
        }
        if (!module.title || typeof module.title !== 'string') {
          errors.push(`${modPrefix}: Missing or invalid title`);
        }
        if (typeof module.order !== 'number') {
          errors.push(`${modPrefix}: Missing or invalid order`);
        }
        if (typeof module.durationWeeks !== 'number' || module.durationWeeks < 1) {
          errors.push(`${modPrefix}: Invalid durationWeeks`);
        }
        if (!module.status || !['planned', 'generating', 'complete', 'error'].includes(module.status)) {
          errors.push(`${modPrefix}: Invalid status (must be: planned, generating, complete, or error)`);
        }

        // Validate module data if status is 'complete'
        if (module.status === 'complete') {
          if (!module.moduleData?.xmlContent) {
            warnings.push(`${modPrefix}: Marked complete but missing xmlContent`);
          }
        }
      });

      // Check module weeks sum to arc weeks
      const moduleWeeksSum = arc.modules.reduce((sum: number, m: any) => sum + (m.durationWeeks || 0), 0);
      if (moduleWeeksSum !== arc.durationWeeks) {
        warnings.push(`${arcPrefix}: Module weeks (${moduleWeeksSum}) don't match arc duration (${arc.durationWeeks})`);
      }
    }
  });

  // Validate total weeks consistency
  if (course.arcs && course.logistics) {
    const arcWeeksSum = course.arcs.reduce((sum: number, arc: any) => sum + (arc.durationWeeks || 0), 0);
    if (arcWeeksSum !== course.logistics.totalWeeks) {
      warnings.push(`Arc weeks (${arcWeeksSum}) don't match course total weeks (${course.logistics.totalWeeks})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Deserialize uploaded course data (convert date strings to Date objects)
 * Handles data from JSON.parse() where dates are strings
 */
export function deserializeUploadedCourse(course: any): CourseData {
  return {
    ...course,
    createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
    updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date(),
    arcs: course.arcs.map((arc: any) => ({
      ...arc,
      modules: arc.modules.map((module: any) => ({
        ...module,
        moduleData: module.moduleData ? {
          ...module.moduleData,
          generatedAt: module.moduleData.generatedAt
            ? new Date(module.moduleData.generatedAt)
            : new Date()
        } : undefined
      }))
    }))
  };
}

/**
 * Get user-friendly error message from technical error
 */
export function getUserFriendlyError(err: Error): string {
  const msg = err.message.toLowerCase();

  if (msg.includes('json') || msg.includes('parse')) {
    return 'Invalid JSON format. Please upload a valid course structure file exported from Themis.';
  }

  if (msg.includes('arc')) {
    return 'Course structure is missing arc data. Please ensure you exported from the Structure Review step.';
  }

  if (msg.includes('module')) {
    return 'One or more modules are missing required fields.';
  }

  if (msg.includes('logistics')) {
    return 'Course logistics data is incomplete or invalid.';
  }

  if (msg.includes('learners')) {
    return 'Course learner information is incomplete or invalid.';
  }

  return `Upload failed: ${err.message}`;
}
```

---

### Phase 4: Workflow Integration (2-3 hours)

**Purpose:** Integrate upload functionality with Themis workflow resume.

#### 4.1 Add Upload Detection in Structure Review

**File:** `src/lib/components/themis/CourseStructureReview.svelte` (modify)

```typescript
onMount(async () => {
  // Check if courseData already has narratives (uploaded course)
  if (courseData.courseNarrative && courseData.progressionNarrative) {
    console.log('Course uploaded with existing narratives - skipping generation');
    courseNarrative = courseData.courseNarrative;
    progressionNarrative = courseData.progressionNarrative;
    arcs = [...courseData.arcs];
    isLoading = false;
    return; // Skip AI generation
  }

  // Otherwise generate structure as normal
  await generateCourseStructure();
});
```

#### 4.2 Add Route Guards to Themis

**File:** `src/routes/themis/generate/+page.svelte` (modify)

```typescript
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { currentCourse, courseWorkflowStep } from '$lib/stores/themisStores';

onMount(() => {
  // Check if currentCourse is populated
  if (!$currentCourse && $courseWorkflowStep > 1) {
    // User tried to access advanced step without course data
    // Redirect to Theia upload or step 1
    console.warn('No course data found - redirecting');
    goto('/theia?error=resume_required');
  }
});
```

#### 4.3 Handle Query Parameters in Theia

**File:** `src/routes/theia/+page.svelte` (update)

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let errorMessage = '';

  onMount(() => {
    const error = $page.url.searchParams.get('error');
    if (error === 'resume_required') {
      errorMessage = 'Please upload a course structure to continue working, or start a new course in Themis.';
    }
  });
</script>

{#if errorMessage}
  <div class="alert alert-warning">
    {errorMessage}
  </div>
{/if}
```

---

### Phase 5: Error Handling (2-3 hours)

**Purpose:** Robust error handling with user-friendly messages.

#### 5.1 Typed Upload Errors

**File:** `src/lib/types/error.ts` (extend)

```typescript
export class CourseUploadError extends BaseError {
  constructor(
    message: string,
    public readonly code: 'INVALID_JSON' | 'VALIDATION_FAILED' | 'MISSING_REQUIRED_FIELDS' | 'FILE_TOO_LARGE',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CourseUploadError';
  }
}
```

#### 5.2 Error Display in Upload Component

Already integrated in Phase 2.2 via `getUserFriendlyError()` utility.

---

### Phase 6: Testing & Documentation (3-4 hours)

**Purpose:** Comprehensive testing and user documentation.

#### 6.1 Create Test Fixtures

**Directory:** `src/data/test/courses/` (new)

**File:** `valid-complete-course.json`
```json
{
  "id": "test-course-1",
  "title": "Test Course: Complete",
  "description": "A test course with all modules generated",
  "logistics": {
    "totalWeeks": 12,
    "daysPerWeek": 1,
    "startDate": "2025-01-01"
  },
  "learners": {
    "cohortSize": 20,
    "teamBased": true,
    "teamSize": 4,
    "prerequisites": "Basic programming",
    "experience": {
      "prereq": "1-3 years",
      "focus": "limited experience"
    }
  },
  "structure": "peer-led",
  "arcs": [
    {
      "id": "arc-1",
      "order": 1,
      "title": "Foundations",
      "description": "Core concepts",
      "theme": "Basics",
      "durationWeeks": 6,
      "arcThemeNarrative": "This arc focuses on...",
      "arcProgressionNarrative": "Modules progress from...",
      "modules": [
        {
          "id": "mod-1",
          "arcId": "arc-1",
          "order": 1,
          "title": "Introduction",
          "description": "Getting started",
          "durationWeeks": 3,
          "status": "complete",
          "learningObjectives": ["Understand X", "Apply Y"],
          "keyTopics": ["Topic A", "Topic B"],
          "moduleData": {
            "xmlContent": "<?xml version=\"1.0\"?><Module>...</Module>",
            "generatedAt": "2025-01-15T10:00:00Z"
          }
        }
      ]
    }
  ],
  "courseNarrative": "This course teaches...",
  "progressionNarrative": "The course progresses through...",
  "createdAt": "2025-01-10T09:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**File:** `partial-course.json` - Same structure but some modules with `"status": "planned"`

**File:** `invalid-missing-arcs.json` - Missing `arcs` array (for validation testing)

#### 6.2 Manual Test Scenarios

**Test 1: Round-trip**
1. Create course in Themis through Structure Review (Phase 4)
2. Export as JSON from Structure Review
3. Navigate to `/theia`
4. Upload exported JSON
5. Verify all data intact (narratives, arc themes, module descriptions)
6. Continue to module generation
7. Generate a module
8. Export again as JSON
9. Upload again
10. Verify generated module XML persisted

**Test 2: Partial course**
1. Upload `partial-course.json` (mix of planned/complete modules)
2. Verify UI shows correct module statuses
3. Continue to Themis
4. Generate missing modules
5. Export and verify all modules complete

**Test 3: Validation errors**
1. Upload `invalid-missing-arcs.json`
2. Verify clear error message displayed
3. Upload corrupted JSON (invalid syntax)
4. Verify JSON parse error is user-friendly

**Test 4: Large course**
1. Upload `large-course.json` (10 arcs, 50 modules)
2. Measure upload time (should be < 2s)
3. Verify no UI lag
4. Check localStorage persistence

#### 6.3 Documentation Updates

**File:** `README.md` (add section)

```markdown
### Uploading Previous Work

Theia allows you to upload previously generated course structures to continue work or export in different formats.

1. Navigate to `/theia`
2. Upload your course JSON file (exported from Themis Structure Review)
3. Review the course summary
4. Choose an action:
   - **Continue in Themis** - Resume module generation
   - **Preview & Export** - Export in Markdown, HTML, or other formats

**What's preserved:**
- All arc narratives and themes
- Module descriptions and learning objectives
- Generated module XML (for completed modules)
- Course and progression narratives
- All logistics and cohort data
```

**File:** `docs/user-guide/theia-workflow.md` (new)

```markdown
# Theia Workflow Guide

## Overview

Theia is Rhea's content management system for previewing and exporting course structures and modules.

## Uploading Course Structures

### From Themis Structure Review

1. Complete the Structure Review step in Themis
2. Click "Export" and select JSON format
3. Save the JSON file to your computer
4. Navigate to `/theia`
5. Drag-drop or click to upload the JSON file
6. Review the course summary
7. Choose next action

### What Gets Preserved

When uploading a course structure:

- ✅ All arc narratives and themes
- ✅ Module descriptions and learning objectives
- ✅ Generated module XML (for completed modules)
- ✅ Course/progression narratives
- ✅ Logistics and cohort data
- ✅ Module generation status (planned/complete/error)

### Supported Use Cases

- **Save progress:** Export mid-generation, upload later to continue
- **Format conversion:** Upload course, export as Markdown/HTML
- **Review changes:** Upload, review structure, regenerate specific modules
- **Collaboration:** Share JSON file, teammate uploads to continue work

## Troubleshooting

### "Invalid JSON format"
- Ensure you exported from Themis Structure Review (Phase 4)
- Check file isn't corrupted (try opening in text editor)
- Verify file extension is `.json`

### "Missing arc data"
- Course must have at least one arc
- Check you exported the full course, not just a single module

### "Validation failed"
- Review error messages for specific missing fields
- If you manually edited the JSON, check for typos
- Re-export from Themis to get a clean file
```

**File:** `docs/dev/status/Theia-MVP.md` (update)

Mark milestone 2.1.2 as complete:

```markdown
#### 2.1.2. Course Upload ✅ COMPLETED (2025-10-24)
**Branch:** `theia/feat/course-upload`
**PR:** #XX

Implemented JSON-based course structure upload:
- Upload CourseData JSON from Themis Structure Review
- Comprehensive validation with user-friendly error messages
- Workflow resume at Structure Review step
- Round-trip fidelity (export → upload → data intact)
- localStorage persistence

**Files Added:** 3 files, ~600 lines
**Files Modified:** 3 files
```

---

## Implementation Order

1. **Phase 1** → Add JSON export (2-3h)
2. **Phase 3** → Build validation utilities (3-4h)
3. **Phase 2** → Create upload UI (4-5h)
4. **Phase 4** → Integrate with Themis (2-3h)
5. **Phase 5** → Error handling (2-3h)
6. **Phase 6** → Test & document (3-4h)

**Total:** 16-22 hours

---

## File Changes Summary

### New Files (5)
```
src/
├── routes/theia/
│   └── +page.svelte
├── lib/
│   ├── components/theia/
│   │   └── CourseStructureUpload.svelte
│   └── utils/theia/
│       └── courseValidator.ts
└── data/test/courses/
    ├── valid-complete-course.json
    └── partial-course.json
```

### Modified Files (3)
```
src/lib/
├── types/
│   ├── theia.ts (add 'json' to ExportFormat)
│   └── error.ts (add CourseUploadError)
└── services/
    └── theiaService.ts (add JSON export case)
```

---

## Success Criteria

Per milestone requirements (docs/dev/status/Theia-MVP.md):
- ✅ Users can upload valid course JSON from Themis Structure Review
- ✅ Workflow continues at Structure Review step with pre-populated data
- ✅ Validation errors are clear and actionable
- ✅ Export functionality works on uploaded content
- ✅ `localStorage` state persists correctly after upload

**Additional criteria:**
- ✅ Round-trip fidelity: Export → Upload → data matches 100%
- ✅ Performance: Upload & validate < 1s for typical course (5 arcs, 20 modules)
- ✅ UX: Clear status display for modules (planned/generating/complete/error)
- ✅ Error messages guide user to resolution

---

## Out of Scope

Per milestone definition:
- ❌ XML upload (deferred to later milestone)
- ❌ Module-only upload (separate 2.1.1 milestone)
- ❌ Batch upload (multiple files)
- ❌ In-app JSON editing
- ❌ Upload history/versioning
- ❌ Cloud sync

---

## Technical Notes

### Why JSON over XML?

1. **Existing infrastructure:** `CourseData` interface already well-defined
2. **Type safety:** TypeScript validation at compile and runtime
3. **Simplicity:** No schema design, parsing is `JSON.parse()`
4. **Performance:** Faster than XML parsing
5. **Developer experience:** Easier to debug, test, read

### localStorage Persistence

Course upload leverages existing `persistedStore()` pattern:
- `currentCourse` store auto-saves to localStorage (src/lib/stores/themisStores.ts:63)
- Upload populates store → automatic persistence
- Page refresh → store rehydrates from localStorage
- No additional persistence code needed

### Date Deserialization

`JSON.parse()` converts dates to strings. The `deserializeUploadedCourse()` utility converts them back to `Date` objects to match the `CourseData` interface.

### Validation Strategy

Two-tier validation:
1. **Structure validation:** Check required fields, types, cardinality
2. **Consistency validation:** Verify weeks add up, arc IDs match, etc.

Errors block upload, warnings are informational.

---

## Future Enhancements

After 2.1.2 completion, consider:

1. **Module-only upload (2.1.1):** Reuse `courseValidator.ts` patterns for modules
2. **XML support:** Add XML parser once course schema is finalized
3. **Diff view:** Show changes between uploaded and current state
4. **Upload history:** Track recently uploaded courses
5. **In-app editing:** Edit course metadata before importing
6. **Batch operations:** Upload multiple courses at once

---

## References

- **Architecture:** `CLAUDE.md`, `docs/refactoring-progress.md`
- **Existing patterns:** `src/lib/components/metis/FileUpload.svelte`
- **Store persistence:** `src/lib/stores/themisStores.ts`, `src/lib/utils/state/persistenceUtils.ts`
- **Type definitions:** `src/lib/types/themis.ts`, `src/lib/types/theia.ts`
- **Validation patterns:** `src/lib/schemas/moduleValidator.ts`

---

## Conclusion

This implementation plan delivers Course Upload (Milestone 2.1.2) via JSON-based upload of Themis Structure Review exports. The approach is pragmatic, leveraging existing infrastructure and TypeScript types for rapid implementation (~16-22 hours) while maintaining type safety and user experience quality.

The JSON-first approach enables immediate value (save/resume workflow) while deferring XML complexity to a future milestone when the course XML schema is fully defined.
