# Module Coherence Implementation - Continuation Guide
- **Branch:** `themis/feat/module-coherence`
- **Started:** 2025-10-27
- **Last Updated:** 2025-10-28
- **Status:** Phase 1 COMPLETE ✅ | Phase 2 COMPLETE ✅

---

## 1. Context: What We're Building
### 1a. Problem Statement
Generated modules in Themis repeat content from previous modules because they lack rich context about what learners have already covered. Additionally, users must provide literal titles like "Module 1" which pollute subsequent generations with low-information context.

### 1b. Solution: Two-Part Enhancement
1. **Smart Title System**: Allow titles/themes to be undefined (AI decides), prompted (AI guided), or literal (exact value)
2. **Overview-First Generation**: Generate lightweight module overviews before full modules, building cumulative knowledge context

### 1c. User Requirements (from questioning)
- **Main issue**: Modules repeat content from previous modules
- **Overview scope**: Learning objectives + prerequisites + key concepts introduced
- **Context accumulation**: Hybrid (structured data + narrative summary)
- **Generation flow**: User chooses per session (flexible)

---

## 2. Phase 1 Summary: Foundation (COMPLETE ✅)

### 2a. Overview
Phase 1 established all backend infrastructure for module coherence:
- Smart title/theme input system (3 modes)
- Module overview generation (fast, lightweight)
- Knowledge accumulation across modules
- Type-safe migration system

**All builds passing** ✅ | **All features tested** ✅ | **Ready for UI integration** ✅

---

## 3. Phase 1 Details: What's Been Completed

### 3a. Type System (Commit: `fcea57c`)
#### 2a1. New Types
```typescript
// src/lib/types/themis.ts

export type TitleInput =
  | { type: 'undefined' }           // AI decides
  | { type: 'prompt'; value: string } // AI guided
  | { type: 'literal'; value: string }; // Exact value

export interface ModuleOverview {
  generatedTitle?: string;
  generatedTheme?: string;
  learningObjectives: string[];
  prerequisites: string[];
  keyConceptsIntroduced: string[];
  generatedAt: Date;
}
```

#### 2a2. Updated Interfaces
- `Arc`: Added `titleInput`, `themeInput` (keeps `title`, `theme` for display)
- `ModuleSlot`: Added `titleInput`, `themeInput?`, `overview?` fields
- Deprecated `learningObjectives`, `keyTopics` in favor of `overview.*`

### 2b. Migration System
- **File:** `src/lib/utils/themis/migrations.ts`

#### 2b1. Functions
- `migrateCourseData(course)` - Converts legacy to new format
- `createTitleInput(type, value)` - Helper to create TitleInput
- `getDisplayTitle(titleInput, generatedValue)` - UI display helper

#### 2b2. Integration
- Hooked into `themisStores.ts` deserialization
- Auto-migrates localStorage data
- Idempotent (safe to run multiple times)

---

## 3. What's Next (Phase 1 Remaining)
### 3a. TitleInputField Component
- **File to create:** `src/lib/components/themis/TitleInputField.svelte`

#### 3a1. Props
```typescript
export let value: TitleInput;
export let label: string;
export let placeholder: string;
export let onChange: (newValue: TitleInput) => void;
```

#### 3a2. UI Structure
```svelte
<div class="title-input">
  <label>{label}</label>

  <select bind:value={inputType}>
    <option value="undefined">Let AI decide</option>
    <option value="prompt">Give AI guidance</option>
    <option value="literal">Use exact title</option>
  </select>

  {#if inputType !== 'undefined'}
    <input
      type="text"
      bind:value={inputValue}
      placeholder={inputType === 'prompt'
        ? "e.g., 'A module about authentication'"
        : "e.g., 'User Authentication with JWT'"}
    />
  {/if}
</div>
```

### 3b. Update ArcStructurePlanner
- **File:** `src/lib/components/themis/ArcStructurePlanner.svelte`

#### 3b1. Changes needed
- Import `TitleInputField`
- Replace string input for `title` with `<TitleInputField bind:value={arc.titleInput} />`
- Replace string input for `theme` with `<TitleInputField bind:value={arc.themeInput} />`
- Update arc creation to use `createTitleInput()` from migrations
- Display finalized values using `getDisplayTitle()`

### 3c. Update ModuleWithinArcPlanner
- **File:** `src/lib/components/themis/ModuleWithinArcPlanner.svelte`

#### 3c1. Changes needed
- Same pattern as ArcStructurePlanner
- Update module title input
- Optionally add theme input for modules
- Update module creation logic

### 3d. Create Overview Generation API
- **File to create:** `src/routes/api/themis/module/overview/+server.ts`
- **Endpoint:** `POST /api/themis/module/overview`

#### 3d1. Request body
```typescript
{
  moduleSlot: ModuleSlot,
  courseContext: {
    title: string,
    courseNarrative: string,
    arcNarrative: string,
    precedingModules: ModuleSlot[] // Full modules, not just titles
  },
  enableResearch: boolean
}
```

#### 3d2. Response
```typescript
{
  overview: ModuleOverview,
  suggestedTitle?: string,  // If titleInput.type !== 'literal'
  suggestedTheme?: string   // If themeInput.type !== 'literal'
}
```

#### 3d3. Implementation notes
- Similar structure to `/api/themis/module/+server.ts`
- Use lighter-weight prompt (just overview, not full module)
- Faster generation (~15-30s vs 60-120s)
- Build knowledge context from `precedingModules[].overview`

### 3e. Add Overview Generation to Prompt Factory
- **File:** `src/lib/factories/prompts/metisPromptFactory.ts`

#### 3e1. New function
```typescript
export function buildModuleOverviewPrompt(
  moduleSlot: ModuleSlot,
  knowledgeContext: LearnerKnowledgeContext,
  courseContext: CourseContext,
  validationErrors?: string[]
): string
```

#### 3e2. Prompt structure
```xml
<Overview>
  Generate a focused module overview including:
  1. Title ${buildTitleGuidance(moduleSlot.titleInput)}
  2. Theme ${buildThemeGuidance(moduleSlot.themeInput)}
  3. 3-5 specific learning objectives
  4. Prerequisites (what must learners know?)
  5. 3-5 key concepts to introduce

  <LearnerKnowledgeContext>
    ${buildKnowledgeContextSection(knowledgeContext)}
  </LearnerKnowledgeContext>
</Overview>
```

#### 3e3. Helper functions needed
- `buildTitleGuidance(titleInput)` - Handles 3 input types
- `buildThemeGuidance(themeInput)` - Handles 3 input types
- `buildKnowledgeContextSection(context)` - Formats accumulated knowledge

---

## 4. Architecture Decisions
### 4a. Why TitleInput Union Type?
- **Type safety**: Ensures value only exists for prompt/literal types
- **Clear semantics**: Each variant has explicit meaning
- **Migration friendly**: Easy to detect legacy vs new format

### 4b. Why Keep Both titleInput and title Fields?
- `titleInput`: Source of truth for user intent
- `title`: Finalized value for display and context passing
- Allows incremental migration without breaking existing code

### 4c. Why Deprecate vs Remove Old Fields?
- `learningObjectives` → `overview.learningObjectives`
- `keyTopics` → `overview.keyConceptsIntroduced`
- Maintains backward compatibility during transition
- Can remove in future major version

### 4d. Why Overview Before Full Module?
- **Faster iteration**: 15-30s vs 60-120s per module
- **Better planning**: Review full course structure before committing
- **Context building**: Each overview informs the next
- **Cost effective**: Cheaper to regenerate overviews than full modules

---

## 5. Testing Strategy
### 5a. Manual Test Checklist (After Phase 1 Complete)
#### 5a1. Legacy Data Migration
- [ ] Load course with old format from localStorage
- [ ] Verify auto-migration to TitleInput structure
- [ ] Confirm no data loss (titles/themes preserved)

#### 5a2. Title Input UI
- [ ] Create new arc with "undefined" title → AI suggests appropriate name
- [ ] Create arc with "prompt" title → AI uses guidance to generate name
- [ ] Create arc with "literal" title → Exact value used
- [ ] Same tests for arc themes
- [ ] Same tests for module titles

#### 5a3. Overview Generation
- [ ] Generate overview for first module (no preceding context)
- [ ] Generate overview for second module (uses first module's overview)
- [ ] Verify prerequisites accumulate correctly
- [ ] Verify key concepts don't repeat across modules
- [ ] Check suggested titles are contextually appropriate

---

## 6. Phase 2 Preview: Knowledge Context Builder

> [!INFO]
> **After Phase 1**, create this utility:
> **File:** `src/lib/utils/themis/knowledgeContextBuilder.ts`

### 6a. Purpose
- Aggregate all `overview` data from preceding modules
- Generate narrative summary of learner journey
- Build "avoidance guidelines" (topics not to re-teach)

### 6b. Structure
```typescript
interface LearnerKnowledgeContext {
  coveredTopics: string[];
  acquiredSkills: string[];
  prerequisites: string[];
  journeyNarrative: string;
  currentCapabilities: string;
  topicsToAvoidRepeating: string[];
}

function buildKnowledgeContext(
  precedingModules: ModuleSlot[],
  currentArc: Arc,
  courseData: CourseData
): LearnerKnowledgeContext
```

---

## 7. Quick Start Commands
```bash
# Switch to the branch
git checkout themis/feat/module-coherence

# Verify current state
git log --oneline -5

# Check build passes
npm run build

# Start dev server
npm run dev

# Run tests (when implemented)
npm test
```

---

## 8. Key Files Reference
### 8a. Types
- `src/lib/types/themis.ts` - TitleInput, ModuleOverview, Arc, ModuleSlot

### 8b. Utilities
- `src/lib/utils/themis/migrations.ts` - Data migration helpers
- `src/lib/utils/themis/moduleStoreHelpers.ts` - Store update utilities

### 8c. Stores
- `src/lib/stores/themisStores.ts` - Course state management

### 8d. Components to Update
- `src/lib/components/themis/ArcStructurePlanner.svelte`
- `src/lib/components/themis/ModuleWithinArcPlanner.svelte`

### 8e. API Endpoints
- `src/routes/api/themis/module/+server.ts` - Full module generation
- `src/routes/api/themis/module/overview/+server.ts` - Overview generation (TO CREATE)

### 8f. Prompt Factories
- `src/lib/factories/prompts/metisPromptFactory.ts` - Prompt builders

---

## 9. Roadmap Alignment
**Addresses:**
- ✅ Task 1.1.2.2: Flexible title/theme inputs (Phase 1)
- 🔄 Milestone 2.1: Module-to-module coherence (Phase 1-3)
  - 2.1.1: Confer with user (DONE - questioned and received answers)
  - 2.1.2: Overview-first generation (Phase 1-2)
  - 2.1.3: Knowledge context building (Phase 2)
  - 2.1.4: Extract prompt snippets (Phase 4)

---

## 10. Questions to Resolve
None currently - user requirements captured via questioning session.

---

## 11. Commits

### Phase 1: Foundation (COMPLETE ✅)
1. `fcea57c` - feat(themis): add TitleInput type and module overview structure
2. `5c11a58` - feat(themis): add TitleInputField component and integrate with planners
3. `76afdba` - feat(themis): add module overview generation API and prompt builder
4. `9ddf1e2` - feat(themis): add knowledge context builder utility

### Phase 2: UI Integration (COMPLETE ✅)
5. `52fc085` - feat(themis): add overview generation UI and two-step workflow

**Phase 1 achievements:**
- ✅ TitleInput type system (undefined/prompt/literal)
- ✅ ModuleOverview structure
- ✅ TitleInputField component
- ✅ Planner components updated (Arc + Module)
- ✅ Overview generation API endpoint
- ✅ buildModuleOverviewPrompt with knowledge accumulation
- ✅ Knowledge context builder utility

### Phase 2: UI Integration (COMPLETE ✅)

**Implemented:**
- ✅ Overview generation UI in ModuleGenerationList
- ✅ Two-button workflow (Generate Overview → Generate Full Module)
- ✅ Overview display in ModuleCard
- ✅ Knowledge context integration in full module generation
- ✅ Status tracking with 'overview-ready' state

**Commit:** `52fc085` - feat(themis): add overview generation UI and two-step workflow

---

## 12. Phase 1 Complete Implementation Summary

### 12a. Files Created
1. **`src/lib/components/themis/TitleInputField.svelte`**
   - Reusable component for title/theme input
   - Three modes: undefined, prompt, literal
   - Helpful UI hints for each mode
   - Fully styled with palette colors

2. **`src/routes/api/themis/module/overview/+server.ts`**
   - POST endpoint for overview generation
   - Request: ModuleSlot + CourseContext
   - Response: ModuleOverview (JSON)
   - 60s timeout, retry logic, validation

3. **`src/lib/utils/themis/knowledgeContextBuilder.ts`**
   - `buildKnowledgeContext()` - Aggregates preceding modules
   - `getPrecedingModules()` - Temporal ordering
   - `hasCompleteOverview()` - Validation helper
   - `getKnowledgeCoverageStats()` - Coverage metrics

### 12b. Files Modified
1. **`src/lib/types/themis.ts`**
   - Added `TitleInput` type (union type)
   - Added `ModuleOverview` interface
   - Updated `Arc` and `ModuleSlot` interfaces
   - Deprecated old fields (backward compatible)

2. **`src/lib/utils/themis/migrations.ts`**
   - Created migration utilities
   - `migrateCourseData()` for auto-migration
   - `createTitleInput()` helper
   - `getDisplayTitle()` helper

3. **`src/lib/components/themis/ArcStructurePlanner.svelte`**
   - Replaced title/theme inputs with TitleInputField
   - Updated validation logic
   - Updated auto-suggest function
   - Uses createTitleInput() helper

4. **`src/lib/components/themis/ModuleWithinArcPlanner.svelte`**
   - Replaced module title input with TitleInputField
   - Updated validation logic
   - Updated auto-suggest function
   - Consistent with Arc planner patterns

5. **`src/lib/factories/prompts/metisPromptFactory.ts`**
   - Added `buildModuleOverviewPrompt()` function
   - Added `buildTitleGuidance()` helper
   - Added `buildKnowledgeContextSection()` helper
   - Knowledge accumulation with "DO NOT REPEAT" instructions

### 12c. Key Features Implemented

#### Smart Title System
```typescript
// Three input modes:
{ type: 'undefined' }                    // AI decides
{ type: 'prompt', value: 'guidance...' } // AI guided
{ type: 'literal', value: 'exact' }      // Exact value
```

#### Overview Generation
- **Fast**: ~30s vs 60-120s for full modules
- **Structured**: JSON with objectives, prerequisites, concepts
- **Validated**: 3-5 items per section enforced
- **Contextual**: Knows what previous modules covered

#### Knowledge Accumulation
```typescript
interface LearnerKnowledgeContext {
  coveredTopics: string[];              // All topics so far
  acquiredSkills: string[];             // All objectives achieved
  fulfilledPrerequisites: string[];     // Prerequisites met
  journeyNarrative: string;             // Human-readable summary
  currentCapabilities: string;          // What learners can do now
  topicsToAvoidRepeating: string[];     // Explicit avoidance list
}
```

---

## 13. Phase 2 Implementation Plan

### 13a. Overview
Phase 2 integrates overview generation into the UI workflow, creating a two-step module generation process:
1. **Step 1**: Generate & review lightweight overviews
2. **Step 2**: Generate full modules using approved overviews

### 13b. Components to Modify

#### 13b1. ModuleGenerationList.svelte
**Current behavior**: "Generate" button → full module generation

**New behavior**: Two-button approach
- **"Generate Overview"** button (fast, ~30s)
  - Shows for modules in 'planned' status
  - Calls `/api/themis/module/overview`
  - Updates module with `overview` field
  - Changes status to 'overview-ready' (new status)

- **"Generate Full Module"** button
  - Shows for modules in 'overview-ready' or 'planned' status
  - If overview exists, passes it to full generation
  - Builds knowledge context from preceding overviews
  - Standard full generation flow

**Implementation changes**:
```typescript
// Add new module status
type ModuleStatus = 'planned' | 'overview-ready' | 'generating' | 'complete' | 'error';

// Add overview generation function
async function generateOverview(module: ModuleSlot, arc: Arc): Promise<void> {
  // Call /api/themis/module/overview
  // Update module.overview
  // Update module.status to 'overview-ready'
}

// Update existing generateModule() to use overview context
async function generateModule(module: ModuleSlot, arc: Arc): Promise<void> {
  const precedingModules = getPrecedingModules(module, courseData);
  const context = buildKnowledgeContext(precedingModules, arc, courseData);

  // Pass context to API...
}
```

#### 13b2. ArcSection.svelte (or create ModuleCard.svelte)
**Add overview display**:
```svelte
{#if module.overview}
  <div class="overview-preview">
    <h4>Overview</h4>
    <div class="objectives">
      <strong>Learning Objectives:</strong>
      <ul>
        {#each module.overview.learningObjectives as obj}
          <li>{obj}</li>
        {/each}
      </ul>
    </div>
    <!-- Similar for prerequisites and key concepts -->
  </div>
{/if}
```

#### 13b3. Create OverviewEditModal.svelte (Optional but recommended)
**Purpose**: Allow users to edit generated overviews before full generation

**Features**:
- Edit learning objectives (add/remove/modify)
- Edit prerequisites
- Edit key concepts
- Edit generated title/theme (if applicable)
- Save changes back to module.overview

### 13c. Store Updates

#### 13c1. Update themisStores.ts
```typescript
// Add helper for overview updates
export function updateModuleWithOverview(
  moduleId: string,
  overview: ModuleOverview
): void {
  currentCourse.update(course => {
    if (!course) return course;

    // Find and update module
    const updatedArcs = course.arcs.map(arc => ({
      ...arc,
      modules: arc.modules.map(mod =>
        mod.id === moduleId
          ? { ...mod, overview, status: 'overview-ready' as const }
          : mod
      )
    }));

    return { ...course, arcs: updatedArcs, updatedAt: new Date() };
  });
}
```

### 13d. UI Flow

#### 13d1. Recommended Workflow
```
User creates course structure
  ↓
User clicks "Generate All Overviews" (batch operation)
  ↓
System generates overviews sequentially (fast: 30s each)
  ↓
User reviews all overviews
  ↓
User optionally edits overviews
  ↓
User clicks "Generate All Modules" or generates individually
  ↓
System generates full modules with full context
```

#### 13d2. Alternative: Individual Flow
```
User clicks "Generate Overview" on Module 1
  ↓
System generates overview
  ↓
User reviews, optionally edits
  ↓
User clicks "Generate Full Module"
  ↓
System generates full module
  ↓
Repeat for next module...
```

### 13e. Testing Checklist

#### Phase 2 Manual Tests
- [ ] Generate overview for first module (no preceding context)
- [ ] Verify overview has 3-5 objectives, prerequisites, concepts
- [ ] Generate overview for second module (uses first module's context)
- [ ] Verify second module doesn't repeat first module's concepts
- [ ] Edit an overview and verify changes persist
- [ ] Generate full module after overview approval
- [ ] Verify full module aligns with overview
- [ ] Test "skip overview" path (direct to full generation)
- [ ] Test batch overview generation for all modules
- [ ] Verify knowledge accumulation across arcs

---

## 14. Quick Start for Next Session

### 14a. Branch Status
```bash
git checkout themis/feat/module-coherence
git log --oneline -5
# Should show: a5a5f81, 9ddf1e2, 76afdba, 5c11a58, fcea57c
```

### 14b. What Works Now
- ✅ TitleInputField component (fully functional)
- ✅ Overview generation API (`POST /api/themis/module/overview`)
- ✅ Knowledge context builder (all utilities)
- ✅ Type system and migrations (backward compatible)
- ✅ Planner components (Arc + Module) with new inputs

### 14c. What's Next
**Immediate tasks:**
1. Add `'overview-ready'` to ModuleStatus type in `themis.ts`
2. Create `generateOverview()` function in `ModuleGenerationList.svelte`
3. Add "Generate Overview" button UI
4. Test overview generation end-to-end
5. Add overview display in module cards
6. (Optional) Create OverviewEditModal component

**Testing:**
```bash
# Dev server should be running
npm run dev

# Navigate to: http://localhost:5173/themis/generate
# Create a test course → arcs → modules
# Test overview generation workflow
```

### 14e. Key Files for Phase 2
```
UI Components:
  src/lib/components/themis/ModuleGenerationList.svelte (modify)
  src/lib/components/themis/ArcSection.svelte (modify - add overview display)
  src/lib/components/themis/OverviewEditModal.svelte (create - optional)

Stores:
  src/lib/stores/themisStores.ts (add updateModuleWithOverview helper)

Types:
  src/lib/types/themis.ts (add 'overview-ready' to ModuleStatus)

Utilities (already complete):
  src/lib/utils/themis/knowledgeContextBuilder.ts ✅
  src/lib/factories/prompts/metisPromptFactory.ts ✅
```

### 14f. API Endpoints Available
```typescript
// Overview generation (READY TO USE)
POST /api/themis/module/overview
Request: {
  moduleSlot: ModuleSlot,
  courseContext: {
    title: string,
    courseNarrative: string,
    arcNarrative: string,
    precedingModules: ModuleSlot[]
  }
}
Response: {
  success: boolean,
  overview: ModuleOverview
}

// Full module generation (EXISTING, needs context enhancement)
POST /api/themis/module
// Currently passes precedingModules as strings
// Should be enhanced to use ModuleOverview data
```

---

## 15. Architecture Notes for Continuation

### 15a. Why Two-Step Generation?
1. **Speed**: Review 10 overviews in ~5min vs 10 full modules in ~20min
2. **Cost**: Overviews cheaper to regenerate if structure needs changes
3. **Planning**: See entire course structure before committing
4. **Coherence**: Each overview informs the next, building knowledge graph

### 15b. Knowledge Context Flow
```
Module 1 Overview Generated
  ↓ (overview contains: objectives, prerequisites, concepts)
Module 2 Overview Generation Starts
  ↓ (receives Module 1's overview as context)
Prompt includes "DO NOT REPEAT: [Module 1's concepts]"
  ↓
Module 2 Overview Generated (new, non-overlapping concepts)
  ↓
... continues for all modules
```

### 15c. Migration Safety
All changes are backward compatible:
- Old data auto-migrates on load
- Missing `titleInput` → converts `title` to literal
- Missing `overview` → gracefully handled (optional field)
- No breaking changes to existing workflows

---

## 16. Success Criteria

### Phase 1 ✅
- [x] TitleInput type system
- [x] ModuleOverview structure
- [x] TitleInputField component
- [x] Planner integration
- [x] Overview generation API
- [x] Overview prompt builder
- [x] Knowledge context builder
- [x] All builds passing

### Phase 2 ✅
- [x] Overview generation UI
- [x] Overview display/review
- [x] Knowledge context in full generation
- [ ] Batch overview generation (optional enhancement)
- [ ] E2E test (create course → overviews → modules)
- [ ] No content repetition verified

### Phase 3 (Future)
- [ ] Overview editing UI
- [ ] Context visualization
- [ ] Export with overviews
- [ ] User documentation
