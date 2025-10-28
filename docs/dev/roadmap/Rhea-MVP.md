# Rhea: Overall Platform

![Rhea Icon](static/icon.png)

> [!NOTE]
> <!-- one line defining current status -->

---

> [!IMPORTANT]
> This document refers to tasks and features that are either (a) not tied to a specific module or (b) applicable to multiple modules
> For a status report on the entire Rhea project, see [README](./README.md)

---

## 1. Tasks

### 1a. Open Tasks

#### 1a1. Due Tasks

#### 1a2. Other Tasks
- [ ] 1a2b. Add dark mode to UI
  - Should allow user to select light, dark or system
  - requires generating dark palettes for each workflow
- [ ] 1a2c. Workflow Card layout tweaks
  - 1a2c1. Icon & Title should be on same line
  - 1a2c2. Icon/Title line and button line should always be a uniform height across each card while fitting all content
  - 1a2c3. Card should display description by default; on hover, replace with feature bullet points on hover
- [ ] 1a2e. Implement Prettify utility type
  - [Prettify](https://www.totaltypescript.com/concepts/the-prettify-helper)
- [ ] 1a2g. Research and implement different models for each separate LangChain AI call
- [ ] 1a2h. Ensure components use the palette from their native workflow
  Regardless of current route, module generation is part of Metis; using a `/themis` route should show themis' palette, but individual modules that display within the page should have metis' palette applied. Eventually this will apply Tethys to arcs in themis as well.
- [ ] 1a2i. Move module code from `/api/themis/module` to `/api/metis/*`
- [ ] 1a2j. Implement test data generation with British English enforcement
  - Verify that generated modules now use British spelling
  - Test with both Metis and Themis workflows

### 1b. Blocked Tasks
<!-- No blocked tasks -->

---

## 2. MVP Milestones
- [ ] 2a. Implement Themis-style Theia previews for Metis (and Metis-in-Themis)
- [ ] 2b. Address all ARIA violations
- [ ] 2c. Update all Svelte legacy approaches and implementations to use Svelte 5

---

## 3. Beyond MVP: Future Features
- [ ] 3a. Allow defining custom research domains; this supports future generalisation of tool beyond AI engineering contexts

---

## 4. Work Record
### 4a. Completed Milestones
- [x] 4a1. Architectural Refactoring (2025-10-20) ✅ COMPLETED
  - **Branch:** `feat/new-course-generation`
  - **Commits:** `fea0d91` through `496d44f`
  - **Documentation:** See `/docs/refactoring-progress.md` for comprehensive details
  - [x] 4a1a. Foundation
    - [x] Extract research domains duplication (`src/lib/config/researchDomains.ts`)
    - [x] Clarify schema architecture (deprecated `moduleSchema.ts`, documented `moduleValidator.ts`)
    - [x] Add Zod schemas for type safety (`src/lib/schemas/apiValidator.ts`)
  - [x] 4a1b. Extract AI Utilities
    - [x] AI client factory (`src/lib/factories/agents/agentClientFactory.ts`)
    - [x] Response parser (`src/lib/utils/validation/responseParser.ts`)
    - [x] Prompt builders (`src/lib/factories/prompts/metisPromptFactory.ts`)
    - [x] SSE streaming handler (`src/lib/utils/model/sseHandler.ts`)
    - [x] Retry orchestration (`src/lib/utils/model/retryHandler.ts`)
  - [x] 4a1c. Improve Prompt Composability
    - [x] Break prompts into composable sections (`src/lib/utils/prompt/shared-components.ts`)
  - [x] 4a1d. Quality Improvements
    - [x] Store consolidation utilities (`src/lib/utils/state/metisWorkflowStep.ts`, `src/lib/utils/state/persistenceUtils.ts`)
    - [x] Error handling infrastructure (`src/lib/types/error.ts`, `src/lib/stores/errorStores.ts`, `ErrorBoundary.svelte`, `ErrorAlert.svelte`)
  - **Impact**
    - 670+ lines eliminated across API routes
    - Centralized configurations and utilities
    - Type-safe schemas with runtime validation
    - Reusable patterns for stores, workflows, and error handling
    - Better separation of concerns throughout codebase
- [x] 4a2 Overhaul palette system ✅ COMPLETED (2025-10-25)
  - **Branch:** `ui/palette-refactor`
  - **Summary:** Complete refactor of palette system to eliminate duplication and establish single source of truth
  - [x] 4a2a. Rationalise palette application and reference
  - [x] 4a2b. Use the [palette reference files](docs/dev/ref/palettes) as source of truth for palette definitions
  - [x] 4a2c. Create a clear palette reference at `src/lib/config/palettes/`
      - [x] 4a2c1. Export source for all palette usage (`src/lib/config/palettes/*.ts`)
      - [x] 4a2c2. Separate from application logic (`src/lib/utils/palette/paletteTransformer.ts`)
      - [x] 4a2c3. Human-readable (semantic TypeScript structure with colour names)
      - [x] 4a2c4. Human-editable (direct TypeScript objects, no build-time generation)
  - [x] 4a2d. Tailwind evaluation: **Decided against** - custom system sufficient for 5 palettes
  - **Key Changes:**
    - Moved palette definitions from `docs/dev/ref/palettes/` to `src/lib/config/palettes/`
    - Eliminated hardcoded `PALETTES` constant duplication in `paletteLoader.ts`
    - Created `paletteTransformer.ts` for transformation logic
    - Updated type definitions to match rich semantic structure
    - Removed duplicate JSON files
    - Added comprehensive documentation at `docs/dev/ref/palettes/README.md`
- [x] 4a3. British English & Emoji Cleanup ✅ COMPLETED (2025-10-28)
  - **Branch:** main (direct implementation)
  - **Documentation:** `/docs/dev/work-records/2025-10-british-english-emoji-cleanup.md`
  - [x] 4a3a. Steer model towards British English in content generation
    - Created `buildBritishEnglishInstructions()` helper in `shared-components.ts`
    - Integrated into all Metis prompt factories (standalone, course-aware, overview)
    - Integrated into Themis course structure prompt factory
    - Covers spelling, terminology, and phrasing conventions
  - [x] 4a3b. Remove emoji from app
    - Confirmed UI components already emoji-free
    - Removed emoji from build script console output (`generatePaletteCss.js`)
    - Documentation emojis preserved for readability
  - **Impact:**
    - All AI-generated content now uses British English consistently
    - More professional console output for CI/CD environments
    - 54+ emoji instances removed from UI components
    - 49 total lines changed across 4 files (British English)
    - ~757 lines changed across 20 files (emoji removal)
    - Zero breaking changes to existing APIs
  - **Architecture:**
    - Shared component: `src/lib/utils/prompt/shared-components.ts` (British English instructions)
    - Integration: `src/lib/factories/prompts/{metis,themis}PromptFactory.ts`
    - Scope: All AI-generated content (objectives, topics, narratives, project briefs)

### 4b. Completed Tasks
#### 4b1. Record of Past Deadlines

#### 4b2. Record of Other Completed Tasks
- [x] 4b2a. Create an xml output sanitiser
  - Completed via xmlCleaner.ts and responseParser.ts
- [x] 4b2c. Workflow-specific components organized correctly ✅ COMPLETED
  - Components are organized in `src/lib/components/{workflow}/` structure
  - Themis: `src/lib/components/themis/` (12 components)
  - Metis: `src/lib/components/metis/` (3 components)
  - Theia: `src/lib/components/theia/` (3 components)
  - Errors: `src/lib/components/errors/` (2 components)
  - This structure allows for workflow-specific components while maintaining reusability
  - **Note:** Moving to `src/routes/*/components` would reduce reusability; current structure is optimal
  - **Addresses:** Original task 1a2f
- [x] 4b2b. Create colour palettes for Rhea, Themis, Tethys, Metis, and Theia based on their icons
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
