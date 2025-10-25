# Rhea: Overall Platform
> [!IMPORTANT]
> This document refers to tasks and features that are either (a) not tied to a specific module or (b) applicable to multiple modules
> For a status report on the entire Rhea project, see [README](./README.md)

---

## 1. Tasks

### 1.1. Open Tasks

#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks

[ ] 1.1.2.1. Steer model towards British English in content generation
[ ] 1.1.2.2. Add dark mode to UI
  - Should allow user to select light, dark or system
  - requires generating dark palettes for each workflow

### 1.2. Blocked Tasks

---

## 2. MVP Milestones

[x] 2.1. Overhaul palette system ✅ COMPLETED (2025-10-25)
  - **Branch:** `ui/palette-refactor`
  - **Summary:** Complete refactor of palette system to eliminate duplication and establish single source of truth
  - [x] 2.1.1. Rationalise palette application and reference
  - [x] 2.1.2. Use the [palette reference files](docs/dev/ref/palettes) as source of truth for palette definitions
  - [x] 2.1.3. Create a clear palette reference at `src/lib/config/palettes/`
      - [x] 2.1.3.1. Export source for all palette usage (`src/lib/config/palettes/*.ts`)
      - [x] 2.1.3.2. Separate from application logic (`src/lib/utils/palette/paletteTransformer.ts`)
      - [x] 2.1.3.3. Human-readable (semantic TypeScript structure with colour names)
      - [x] 2.1.3.4. Human-editable (direct TypeScript objects, no build-time generation)
  - [x] 2.1.4. Tailwind evaluation: **Decided against** - custom system sufficient for 5 palettes
  - **Key Changes:**
    - Moved palette definitions from `docs/dev/ref/palettes/` to `src/lib/config/palettes/`
    - Eliminated hardcoded `PALETTES` constant duplication in `paletteLoader.ts`
    - Created `paletteTransformer.ts` for transformation logic
    - Updated type definitions to match rich semantic structure
    - Removed duplicate JSON files
    - Added comprehensive documentation at `docs/dev/ref/palettes/README.md`
  - **Architecture:**
    - Single source: `src/lib/config/palettes/{workflow}Palette.ts`
    - Transformation: `src/lib/utils/palette/paletteTransformer.ts`
    - Application: `src/routes/+layout.svelte` (via data-palette attribute)
    - Reference: `src/lib/styles/palettes.css` (static documentation)

---

## 3. Beyond MVP: Future Features

---

## 4. Work Record

### 4.1. Completed Milestones

[x] 4.1.1. Architectural Refactoring (2025-10-20) ✅ COMPLETED
  - **Branch:** `feat/new-course-generation`
  - **Commits:** `fea0d91` through `496d44f`
  - **Documentation:** See `/docs/refactoring-progress.md` for comprehensive details
  [x] 4.1.1.1. Foundation
    [x] Extract research domains duplication (`src/lib/config/researchDomains.ts`)
    [x] Clarify schema architecture (deprecated `moduleSchema.ts`, documented `moduleValidator.ts`)
    [x] Add Zod schemas for type safety (`src/lib/schemas/apiValidator.ts`)
  [x] 4.1.1.2. Extract AI Utilities
    [x] AI client factory (`src/lib/factories/agents/agentClientFactory.ts`)
    [x] Response parser (`src/lib/utils/validation/responseParser.ts`)
    [x] Prompt builders (`src/lib/factories/prompts/metisPromptFactory.ts`)
    [x] SSE streaming handler (`src/lib/utils/model/sseHandler.ts`)
    [x] Retry orchestration (`src/lib/utils/model/retryHandler.ts`)
  [x] 4.1.1.3. Improve Prompt Composability
    [x] Break prompts into composable sections (`src/lib/utils/prompt/shared-components.ts`)
  [x] 4.1.1.4. Quality Improvements
    [x] Store consolidation utilities (`src/lib/utils/state/metisWorkflowStep.ts`, `src/lib/utils/state/persistenceUtils.ts`)
    [x] Error handling infrastructure (`src/lib/types/error.ts`, `src/lib/stores/errorStores.ts`, `ErrorBoundary.svelte`, `ErrorAlert.svelte`)
  - **Impact**
    - 670+ lines eliminated across API routes
    - Centralized configurations and utilities
    - Type-safe schemas with runtime validation
    - Reusable patterns for stores, workflows, and error handling
    - Better separation of concerns throughout codebase

### 4.2. Completed Tasks

#### 4.2.1. Record of Past Deadlines

#### 4.2.2. Record of Other Completed Tasks

[x] Create an xml output sanitiser
  - Completed via xmlCleaner.ts and responseParser.ts
[x] Create colour palettes for Rhea, Themis, Tethys, Metis, and Theia based on their icons
  - Initial implementation: `src/lib/styles/palettes.css` (2025-10-23)
  - Branch: `ui/module-palettes` (merged via PR #15)
  - Implemented dynamic palette system with CSS custom properties
  - Palettes initially defined for four modules: Rhea (default), Themis, Tethys, Metis
  - Applied via `data-palette` attribute on root element
  - **Theia palette added:** (2025-10-24)
    - Branch: `theia/feat/continue-session-from-xml` (PR #21)
    - Magenta/cyan colour scheme (--palette-foreground: #B0127A, --palette-foreground-alt: #11B5C6)
    - Integrated in `paletteLoader.ts` and `paletteTypes.ts`
    - All five workflow palettes now complete
