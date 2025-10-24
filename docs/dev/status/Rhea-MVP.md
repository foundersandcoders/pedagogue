# Rhea: Overall Platform
> [!IMPORTANT]
> This document refers to tasks and features that are either (a) not tied to a specific module or (b) applicable to multiple modules
> For a status report on the entire Rhea project, see [README](./README.md)

## 1. Tasks
### 1.1. Open Tasks
#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks
[ ] Steer model towards British English in content generation

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
