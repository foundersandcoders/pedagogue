# Themis: Course Builder

![Themis Icon](static/themis/icon.png)

> [!NOTE]
> <!-- one line defining current status -->

---

## 1. Tasks

> [!NOTE]
> This tasklist does not include upcoming [MVP Milestones](docs/dev/roadmap/Themis-MVP.md#2-mvp-milestones)

### 1.1. Open Tasks
#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks

- [ ] 1.1.2.1. Create a milestoning system in the structure outline
  - 1.1.2.1.1. e.g. "by this module, users should be able to do `xyz`"
- [ ] 1.1.2.2. Replace mandatory arc & modules literal input fields with literal/prompt/undefined input fields
  - 1.1.2.2.1. currently, required fields are inserted into the final output as literals
  - 1.1.2.2.2. this requires the user to already know what they want; more importantly, the AI model uses this input to generate content
  - 1.1.2.2.3. this undermines a core purpose of the app: curriculum generation by non-experts
  - 1.1.2.2.4. required inputs should be given three options:
    - 1.1.2.2.4.1. the existing literal value (e.g. "use exactly this input as the module name")
    - 1.1.2.2.4.2. a prompt value (e.g. "generate a module name based on my input")
    - 1.1.2.2.4.3. an undefined value ("use the content of the previous module, subsequent module and parent arc to generate a coherent module name")
- [ ] 1.1.2.3. Ensure "suggest structure" respects time constraints
- [ ] 1.1.2.4. Create "progression type" option
  - 1.1.2.4.1. This can apply at the `course -> arc` level and/or the `arc -> module` level
  - 1.1.2.4.2. It defines the relationship between sibling-level content within a parent unit
  - 1.1.2.4.3. Types include:
    - 1.1.2.4.3.1. **Sequential:** `parent[x].unit[x]` directly builds on knowledge acquired in `parent[x].unit[x-1]`
    - 1.1.2.4.3.2. **Progressive:** `parent[x].unit[x]` does not necessarily directly build on knowledge acquired in `parent[x].unit[x-1]`, but is more advanced on average
    - 1.1.2.4.3.3. **Parallel:** `parent[x].unit[x]` does not directly build on knowledge acquired in `parent[x].unit[x-1]`; it tackles an alternate approach or parallel aspect to the focus of `parent[x]`
- [ ] 1.1.2.5. Allow "invisible" arcs
  - 1.1.2.5.1. Arcs can be defined as consisting of exactly 1 module each
  - 1.1.2.5.2. In this scenario, the UI should obscure any reference to Arcs whilst still preserving them in the data structure
- [ ] 1.1.2.9. Fix Race Condition in SSE Stream Cleanup
  - 1.1.2.9.1. In `ModuleGenerationList.svelte`, the reader is removed from `activeReaders` in a `finally` block
  - 1.1.2.9.2. If `onDestroy` runs concurrently with a completing stream, the `reader.cancel()` call might fail or leave streams in an inconsistent state
  - 1.1.2.9.3. **Status:** Still present after component refactor (2025-10-27)
- [ ] 1.1.2.10. Fix SSE Parsing Vulnerability
  - 1.1.2.10.1. `JSON.parse(line.slice(6))` at `ModuleGenerationList.svelte:189` will throw if the server sends malformed JSON
  - 1.1.2.10.2. This could crash the entire generation flow
  - 1.1.2.10.3. **Status:** Still present after component refactor (2025-10-27)
- [ ] 1.1.2.11. Fix Missing Error Handling in `generateAll`
  - 1.1.2.11.1. The function continues generating after errors without checking if a critical failure occurred
  - 1.1.2.11.2. If the API endpoint is down, it will attempt to generate all remaining modules
  - 1.1.2.11.3. **Status:** PARTIALLY FIXED - now has try-catch but still continues on failure (2025-10-27)
- [ ] 1.1.2.12. Create a more elegant module generation flow
  - 1.1.2.12.1. The `generateAll` function (line 261) generates modules sequentially with await
  - 1.1.2.12.2. For courses with many modules, this could take hours.
  - 1.1.2.12.3. We need to concoct a way of preserving sequential coherence whilst reducing this burden
  - 1.1.2.12.4. One approach could be to begin generating `module[x]` after the initial overview details of `module[x-1]` are completed but before the detailed Project Briefs etc have completed
- [ ] 1.1.2.13. Optimise `ModuleGenerationList` Re-render
  - 1.1.2.13.1. Each store update triggers re-render of the entire ModuleGenerationList. With 20+ modules, this could feel sluggish.
  - 1.1.2.13.2. We could use `{#key moduleId}` blocks or extract `ModuleCard` to a separate component with `export let module` to leverage Svelte's granular reactivity.
- [ ] 1.1.2.14. Improve handling of bullet lists within modules in `CourseOverview`
- [ ] 1.1.2.15. Improve text displayed in "Phase 3: Module Planning"
  - 1.1.2.15.1. ![screenshot of phase 3](assets/screenshots/themis-module-planning.jpg)
- [ ] 1.1.2.15. Improve text layout in "Phase 4: Structure Review"
  - 1.1.2.15.1. ![screenshot of phase 4](assets/screenshots/themis-structure-review.jpg)
- [ ] 1.1.2.16. In "Phase 4: Structure Review", make module previews toggle elements
- [ ] 1.1.2.17. Allow user to define requirements (as in Metis)
  - 1.1.2.17.1. This should be definable per Course (Themis), per Arc (Tethys) and per Module (Metis)
- [ ] 1.1.2.18. Allow multiple toggles to be open/closed without being affected by siblings

### 1.2. Blocked Tasks
<!-- No blocked tasks -->

---

## 2. MVP Milestones

- [x] 2.2. Add Course XML Schema and Validator ✅ COMPLETE (2025-10-28)
  - ✅ Comprehensive course XML schema template (`courseSchema.xml`)
  - ✅ Hierarchical structure: Course → Arcs → Modules → Module Specifications
  - ✅ Full course validator with temporal consistency checks (`courseValidator.ts`)
  - ✅ 15 comprehensive test cases covering all validation requirements
  - ✅ Complete documentation (`course-xml-specification.md`)
  - ✅ Validates course metadata, arc organization, and embedded module specs
  - ✅ Enforces cardinality constraints (min arcs, modules, objectives, topics, etc.)
  - ✅ Validates temporal consistency (module weeks ≤ arc weeks ≤ course weeks)
  - **Why eleventh:** Ensures exported courses meet quality standards
  - **Status:** Complete - ready for use in XML export implementation (Task 2.3)
  - **Implementation:** 1,652 lines across 4 files (schema, validator, tests, docs)
  - **Next Step:** Integrate with course export functionality in Task 2.3
- [ ] 2.3. Implement Export Functionality 📋 PENDING
  - XML export for complete course
  - PDF export option (stretch goal)
  - Individual module file exports
  - Course metadata inclusion
  - **Why twelfth:** Delivers the final product to users
  - **Status:** Partially complete - Theia export service operational, needs XML course schema

---

## 3. Beyond MVP: Future Features

- [ ] 3.1. PDF export for complete courses
- [ ] 3.2. Course templates library
- [ ] 3.3. Import existing courses for modification
- [ ] 3.4. Collaborative course editing (multi-user)
- [ ] 3.5. Version comparison for courses

---

## 4. Work Record

### 4.1. Completed Milestones

- [x] 4.1.1. Break over-large `/Themis` components into subcomponents ✅ COMPLETED (2025-10-27)
  - **Branch:** `themis/refactor/split-large-components`
  - **Commit:** `e744d71`
  - **Summary:** Split 896-line ModuleGenerationList.svelte into focused, reusable components
  - **Components Created:**
    - ProgressSummary.svelte (86 lines): Overall generation progress display
    - ModulePreviewModal.svelte (141 lines): XML preview modal
    - ModuleCard.svelte (221 lines): Individual module display with actions
    - ArcSection.svelte (140 lines): Collapsible arc container
    - moduleStoreHelpers.ts (80 lines): Centralized store update utilities
  - **Impact:**
    - Main component reduced from 896 to 441 lines (51% reduction)
    - Eliminated duplicate store update patterns
    - Improved maintainability and testability
    - Better component composition and reusability
  - **Why completed:** Addresses roadmap tasks 1.1.2.6 and 1.1.2.7, establishing foundation for future improvements
- [x] 4.1.2. Radically Improve Module-to-Module Coherence ✅ COMPLETED (2025-10-27/28)
  - **Branch:** `themis/feat/module-coherence`
  - **PR:** #27 (merged 2025-10-28)
  - **Commits:** `fcea57c` through `5847ee2` (7 commits)
  - **Documentation:** `/docs/dev/feature-guides/themis/module-coherence-continuation.md`
  - **Summary:** Two-phase implementation adding smart title system and overview-first generation workflow
  - **Phase 1 - Foundation:**
    - TitleInput type system (undefined/prompt/literal modes) - `src/lib/types/themis.ts`
    - TitleInputField component (113 lines) - `src/lib/components/themis/TitleInputField.svelte`
    - Migration utilities for backward compatibility - `src/lib/utils/themis/migrations.ts` (109 lines)
    - ModuleOverview interface and validation
  - **Phase 2 - Overview Generation:**
    - Module overview API endpoint - `src/routes/api/themis/module/overview/+server.ts` (201 lines)
    - Knowledge context builder - `src/lib/utils/themis/knowledgeContextBuilder.ts` (241 lines)
    - Overview prompt factory - `src/lib/factories/prompts/metisPromptFactory.ts` (buildModuleOverviewPrompt)
    - Two-step workflow UI in ModuleGenerationList
    - 'overview-ready' status tracking
  - **Key Features:**
    - Smart titles: AI can decide, be guided, or use exact titles
    - Lightweight overviews: ~30s generation, 1/3 cost of full module
    - Knowledge context: Cumulative tracking of learner progress
    - Reduced repetition: Each module knows what came before
    - Faster iteration: Review 10 overviews in ~5min vs 10 full modules in ~20min
  - **Impact:**
    - 1,479 insertions, 238 deletions across 21 code files
    - Addresses MVP milestone 2.1 completely
    - Foundation for improved course coherence and quality
  - **Why completed:** Solves the critical problem of module content repetition by providing rich context about learner knowledge progression
- [x] 4.1.3. Create Hub Dashboard and Navigation Structure ✅ COMPLETED
  - Created hub dashboard at `/` with cards for "Generate Module" and "Generate Course"
  - Moved existing module generator to `/module/new`
  - Added breadcrumb navigation in layout for all routes
  - Hub-based architecture allows parallel workflows
  - **Why first:** Foundation for organizing module vs. course workflows
- [x] 4.1.3. Create Course Types and Stores ✅ COMPLETED
  - Defined TypeScript interfaces in `src/lib/types/course.ts`
  - CourseData interface with logistics, learners, structure, and modules
  - ModuleSlot interface with status tracking, objectives, topics
  - Created Svelte stores in `src/lib/courseStores.ts`
  - Auto-save to localStorage on course changes
  - Derived stores for computed values (totalModuleWeeks)
  - **Why second:** Type-safe state management for course workflow
- [x] 4.1.4. Build CourseConfigForm Component (Step 1) ✅ COMPLETED
  - Created `src/lib/course/CourseConfigForm.svelte`
  - Comprehensive form with course identity, logistics, learner configuration
  - Validation for all inputs (weeks, cohort size, dates, etc.)
  - Disabled SSR for localStorage compatibility
  - Reactive statements ensure nested objects exist before access
  - **Why third:** User input collection for course parameters
- [x] 4.1.5. Build ModuleStructurePlanner Component (Step 2) ✅ COMPLETED
  - Created `src/lib/course/ModuleStructurePlanner.svelte`
  - Visual timeline bar showing proportional week allocation
  - Add/remove modules with validation
  - Auto-suggest feature based on course duration
  - Week budget tracking with overflow detection
  - Module ordering and duration management
  - **Why third:** High-level course structure before AI generation
- [x] 4.1.6. Create /api/course/structure Endpoint ✅ COMPLETED
  - Created `src/routes/api/course/structure/+server.ts`
  - Uses Claude Sonnet 4.5 to generate detailed module structure
  - Accepts course parameters and module skeleton
  - Returns course narrative, module objectives/topics, progression narrative
  - Web search tool integration for research
  - **Why third:** AI-powered course structure generation
- [x] 4.1.7. Build CourseStructureReview Component (Step 3) ✅ COMPLETED
  - Created `src/lib/course/CourseStructureReview.svelte`
  - Auto-generation on component mount
  - Loading state with spinner during 30-60 second generation
  - Error handling with retry functionality
  - Editable course and progression narratives
  - Per-module edit mode with objectives and topics management
  - Regenerate button for fresh AI suggestions
  - Saves refined data back to course store
  - **Why third:** Review and refine AI-generated course structure before module generation
- [x] 4.1.8. Reimplement the Module Overview Generation Based on Thematic Arcs ✅ COMPLETED
  - Introduced "arcs" as thematic organizational layer between courses and modules
  - Created Arc interface with theme, arcThemeNarrative, and arcProgressionNarrative fields
  - Built ArcStructurePlanner component for defining broad thematic arcs
  - Built ModuleWithinArcPlanner component for organizing modules within arcs (with auto-generate option)
  - Updated API endpoint to handle arc-based course structure generation with AI
  - Updated CourseStructureReview to display collapsible arc hierarchy with nested modules
  - Updated workflow to: Config → Arc Planning → Module Planning → Structure Review → Generation → Export
  - Implemented backward compatibility migration for existing module-only courses
  - Arcs support thematic independence with temporal sequencing
  - **Why completed:** Arcs provide the thematic organizational structure needed for coherent course narratives while maintaining module-level detail
- [x] 4.1.9. Add localStorage Persistence ✅ COMPLETED
  - Auto-save course progress to localStorage ✅
  - Restore course on page reload ✅
  - "Clear course" functionality ✅
  - Save/load multiple courses ✅
  - **Completed:** Implemented via `persistedStore()` utility in refactoring Phase 4
  - **Location:** `src/lib/stores/themisStores.ts` using `src/lib/utils/state/persistenceUtils.ts`
- [x] 4.1.10. Complete Module Generation Workflow (Steps 5-6) ✅ COMPLETED (2025-10-25)
  - **Step 5 - Module Generation:**
    - ModuleGenerationList component with arc-grouped display
    - SSE streaming for real-time generation feedback
    - Individual and batch generation capabilities
    - Module regeneration and error handling
    - Module XML preview functionality
  - **Step 6 - Review & Export:**
    - CourseOverview component for final review
    - Complete course display with narratives and statistics
    - Collapsible arc sections with module details
    - Theia export integration (Markdown/HTML)
    - Workflow navigation and reset functionality
  - **Why completed:** Completes the end-to-end Themis MVP workflow from configuration to export
- [x] 4.1.11. Create /api/themis/module Endpoint ✅ COMPLETED (2025-10-25)
  - Created `src/routes/api/themis/module/+server.ts` (193 lines)
  - Accepts module slot data with course context
  - Calls existing module generation logic with course-aware prompts
  - Returns XML module spec via SSE streaming
  - Supports retry logic and validation
  - **Status:** Complete - API layer for course-aware module generation
- [x] 4.1.12. Extend Module Generation with Course Context ✅ COMPLETED (2025-10-25)
  - Added `buildCourseAwareModulePrompt()` to metisPromptFactory
  - Includes course narrative, arc progression, and preceding modules in prompts
  - Maintains backward compatibility with standalone module generation
  - XML injection prevention via escapeXml utilities
  - **Status:** Complete - reuses existing module generation with course awareness
- [x] 4.1.13. Build CourseOverview Component (Step 6) ✅ COMPLETED (2025-10-25)
  - Created `src/lib/components/themis/CourseOverview.svelte` (1462 lines)
  - Displays complete course with metadata, narratives, and all generated modules
  - Arc-grouped collapsible sections with module previews
  - Module XML preview modal
  - Export functionality via Theia integration
  - Course completion status banner
  - Navigation: back to generation or reset workflow
  - **Status:** Complete - final review and export interface operational

### 4.2. Completed Tasks

#### 4.2.1. Record of Past Deadlines

#### 4.2.2. Record of Other Completed Tasks

- [x] 4.2.2.1. `ModuleGenerationList.svelte` is 895 lines; split it into smaller components ✅ COMPLETED (2025-10-27)
  - Created `ArcSection.svelte`: arc header + module list (140 lines)
  - Created `ModuleCard.svelte`: individual module with status/actions (221 lines)
  - Created `ModulePreviewModal.svelte`: preview functionality (141 lines)
  - Created `ProgressSummary.svelte`: statistics and progress bar (86 lines)
  - Refactored main component from 896 to 441 lines
  - **Branch:** `themis/refactor/split-large-components`
  - **Addresses:** Original task 1.1.2.6
- [x] 4.2.2.2. Fix Duplicate Store Updates ✅ COMPLETED (2025-10-27)
  - Created `moduleStoreHelpers.ts` utility (80 lines)
  - Extracted repeated module update patterns into centralized functions
  - Functions: `updateModuleStatus()`, `updateModuleWithGeneratedData()`, `updateModuleWithError()`
  - Eliminated duplicate code across ModuleGenerationList
  - **Branch:** `themis/refactor/split-large-components`
  - **Addresses:** Original task 1.1.2.7
- [x] 4.2.2.3. Timeout values extracted to constants ✅ COMPLETED (2025-10-25)
  - Timeout values in `src/routes/api/themis/module/+server.ts` extracted to constants
  - Research-heavy tasks: 300000ms (5 minutes)
  - Standard tasks: 120000ms (2 minutes)
  - **Addresses:** Original task 1.1.2.6
