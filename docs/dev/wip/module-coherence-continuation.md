# Module Coherence Implementation - Continuation Guide
- **Branch:** `themis/feat/module-coherence`
- **Started:** 2025-10-27
- **Status:** Phase 1 in progress (foundation complete)

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

## 2. What's Been Completed ✅
### 2a. Type System (Commit: `fcea57c`)
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

**Phase 1 achievements:**
- ✅ TitleInput type system (undefined/prompt/literal)
- ✅ ModuleOverview structure
- ✅ TitleInputField component
- ✅ Planner components updated (Arc + Module)
- ✅ Overview generation API endpoint
- ✅ buildModuleOverviewPrompt with knowledge accumulation
- ✅ Knowledge context builder utility

### Phase 2: UI Integration (IN PROGRESS 🔄)

**Next steps:**
- Add overview generation UI to ModuleGenerationList
- Create overview review/approval workflow
- Wire up full module generation with overview context
- Test end-to-end flow
