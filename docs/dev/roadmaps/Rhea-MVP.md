# Rhea: Overall Platform
> [!IMPORTANT]
> This document refers to tasks and features that are either:
> 1. Not tied to a specific module, or
> 2. Applicable to multiple modules
> For a status report on Rhea and its submodules, see [README](./README.md)
> [!NOTE]
> Not yet in development

## 1. Tasks
> [!NOTE]
> This tasklist does not include upcoming [MVP Milestones](docs/dev/roadmaps/Rhea-MVP.md#2-mvp-milestones)

### 1.1. Open Tasks
#### 1.1.1. Due Tasks
- [ ] `2025-10-22` Create "Theia": a reusable "content preview exporter"
  - **Criteria**
    1. Exports a human-readable version of generated content by mapping xml schema to typographic layout
    2. Can read and export content from both *Themis* and *Metis*, as well as future modules.
    3. Allows user to modify the level of detail exported
    4. Allows user to export content at any stage of the generation process
  - **Examples**
    1. User used *Themis* to generate a course overview and 4 arcs, then exported a preview of only the first and last arc; this contained no content from...
        - course overview
        - the child modules of arc 1
        - arc 2
        - arc 3
        - the child modules of arc 4
    2. User used *Themis* to generate a course overview and 4 arcs. Exported a preview of only the third module of the final arc
    3. User used *Themis* to generate a course overview and exported that content before arc or module generation occurred
    4. User used *Metis* to generate a module, then exported only the Twists from that module
#### 1.1.2. Other Tasks
- [ ] Steer Claude towards British English

### 1.2. Blocked Tasks

---

## 2. MVP Milestones

---

## 3. Beyond MVP: Future Features

---

## 4. Work Record
### 4.1. Completed Milestones
- 4.1.1. Architectural Refactoring (2025-10-20) ✅ COMPLETED
  **Branch:** `feat/new-course-generation`
  **Commits:** `fea0d91` through `496d44f`
  **Documentation:** See `/docs/refactoring-progress.md` for comprehensive details
  - 4.1.1.1. Foundation
    - [x] Extract research domains duplication (`src/lib/config/researchDomains.ts`)
    - [x] Clarify schema architecture (deprecated `moduleSchema.ts`, documented `moduleValidator.ts`)
    - [x] Add Zod schemas for type safety (`src/lib/schemas/apiValidator.ts`)
  - 4.1.1.2. Extract AI Utilities
    - [x] AI client factory (`src/lib/factories/agents/agentClientFactory.ts`)
    - [x] Response parser (`src/lib/utils/validation/responseParser.ts`)
    - [x] Prompt builders (`src/lib/factories/prompts/metisPromptFactory.ts`)
    - [x] SSE streaming handler (`src/lib/utils/model/sseHandler.ts`)
    - [x] Retry orchestration (`src/lib/utils/model/retryHandler.ts`)
  - 4.1.1.3. Improve Prompt Composability
    - [x] Break prompts into composable sections (`src/lib/utils/prompt/shared-components.ts`)
  - 4.1.1.4. Quality Improvements
    - [x] Store consolidation utilities (`src/lib/utils/state/metisWorkflowStep.ts`, `src/lib/utils/state/persistenceUtils.ts`)
    - [x] Error handling infrastructure (`src/lib/types/error.ts`, `src/lib/stores/errorStores.ts`, `ErrorBoundary.svelte`, `ErrorAlert.svelte`)
  - **Impact**
    - 670+ lines eliminated across API routes
    - Centralized configurations and utilities
    - Type-safe schemas with runtime validation
    - Reusable patterns for stores, workflows, and error handling
    - Better separation of concerns throughout codebase
### 4.2. Completed Tasks
#### 4.2.1. Record of Past Deadlines
#### 4.2.2. Record of Other Completed Tasks
- [x] Create an xml output sanitiser
  - Completed via xmlCleaner.ts and responseParser.ts
- [x] Create colour palettes for Rhea, Themis, Tethys and Metis based on their icons
  - Completed via `src/lib/styles/palettes.css` (2025-10-23)
  - Branch: `ui/module-palettes` (merged via PR #15)
  - Implemented dynamic palette system with CSS custom properties
  - Palettes defined for all four modules: Rhea (default), Themis, Tethys, Metis
  - Applied via `data-palette` attribute on root element
