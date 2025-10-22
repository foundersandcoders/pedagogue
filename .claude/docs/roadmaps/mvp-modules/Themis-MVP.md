# Themis MVP: Course Builder

## 1. Critical Path (Do These First)

### 1.7. Create a

### 1.7. Build ModuleGenerationList Component (Step 4) 📋 PENDING
- Create `src/lib/components/themis/ModuleGenerationList.svelte`
- Display all modules from refined course structure
- Module-by-module generation using existing module workflow
- Track generation status per module (planned, generating, complete, error)
- Allow regeneration of individual modules
- Progress tracking across all modules
- **Why seventh:** Orchestrates the actual content generation using existing proven module generator
- **Status:** Not yet started - depends on completion of structure review workflow

### 1.8. Create /api/themis/module/generate Endpoint 📋 PENDING
- Create `src/routes/api/themis/module/+server.ts`
- Accept module data with course context
- Call existing module generation logic with course-aware prompts
- Return XML module spec
- **Why eighth:** API layer for course-aware module generation
- **Status:** API structure exists at `/api/themis/generate/`, needs module-specific endpoint

### 1.9. Extend Module Generation with Course Context 📋 PENDING
- Modify prompt factories to accept optional course context parameter
- Include course narrative and progression in prompts when provided
- Ensure backward compatibility with standalone module generation
- **Why ninth:** Reuses existing module generation with course awareness
- **Status:** Prompt factories refactored and ready, needs course context integration

### 1.10. Build CourseOverview Component (Step 5) 📋 PENDING
- Create `src/lib/components/themis/CourseOverview.svelte`
- Display complete course with all generated modules
- Show course narratives and module summaries
- Export functionality trigger
- Final review interface
- **Why tenth:** Final review and export interface
- **Status:** Not yet started

### 1.11. Add Course XML Schema and Validator 📋 PENDING
- Define course-level XML schema wrapping multiple modules
- Validation for complete course structure
- Include course narratives and metadata
- **Why eleventh:** Ensures exported courses meet quality standards
- **Status:** Not yet started - will reuse existing validation patterns

### 1.12. Implement Export Functionality 📋 PENDING
- XML export for complete course
- PDF export option (stretch goal)
- Individual module file exports
- Course metadata inclusion
- **Why twelfth:** Delivers the final product to users
- **Status:** Not yet started

### 1.13. Add localStorage Persistence ✅ COMPLETED
- Auto-save course progress to localStorage ✅
- Restore course on page reload ✅
- "Clear course" functionality ✅
- Save/load multiple courses ✅
- **Completed:** Implemented via `persistedStore()` utility in refactoring Phase 4
- **Location:** `src/lib/stores/themisStores.ts` using `src/lib/utils/state/persistenceUtils.ts`

### 1.2. Themis MVP: Miscellaneous Tasks
- [ ] Create a milestoning system in the structure outline (e.g. "by this module, users should be able to do `xyz`")

---

## 2. Beyond MVP
- [ ] 2.1. PDF export for complete courses
- [ ] 2.2. Course templates library
- [ ] 2.3. Import existing courses for modification
- [ ] 2.4. Collaborative course editing (multi-user)
- [ ] 2.5. Version comparison for courses

---

## 3. Current Status Summary

**Overall Progress:** Approximately 50% complete
- ✅ Foundation (hub, types, stores, config form)
- ✅ Arc-based structure planning
- ✅ AI structure generation
- ✅ Structure review interface
- 📋 Module generation orchestration (remaining critical path)
- 📋 Export functionality (remaining critical path)

**Next Priority:** Complete steps 1.7-1.12 to deliver end-to-end course generation

---

## 4. Completed: Critical Path Progress

### 3.1. Create Hub Dashboard and Navigation Structure ✅ COMPLETED
- Created hub dashboard at `/` with cards for "Generate Module" and "Generate Course"
- Moved existing module generator to `/module/new`
- Added breadcrumb navigation in layout for all routes
- Hub-based architecture allows parallel workflows
- **Why first:** Foundation for organizing module vs. course workflows

### 3.2. Create Course Types and Stores ✅ COMPLETED
- Defined TypeScript interfaces in `src/lib/types/course.ts`
- CourseData interface with logistics, learners, structure, and modules
- ModuleSlot interface with status tracking, objectives, topics
- Created Svelte stores in `src/lib/courseStores.ts`
- Auto-save to localStorage on course changes
- Derived stores for computed values (totalModuleWeeks)
- **Why second:** Type-safe state management for course workflow

### 3.3. Build CourseConfigForm Component (Step 1) ✅ COMPLETED
- Created `src/lib/course/CourseConfigForm.svelte`
- Comprehensive form with course identity, logistics, learner configuration
- Validation for all inputs (weeks, cohort size, dates, etc.)
- Disabled SSR for localStorage compatibility
- Reactive statements ensure nested objects exist before access
- **Why third:** User input collection for course parameters

### 3.4. Build ModuleStructurePlanner Component (Step 2) ✅ COMPLETED
- Created `src/lib/course/ModuleStructurePlanner.svelte`
- Visual timeline bar showing proportional week allocation
- Add/remove modules with validation
- Auto-suggest feature based on course duration
- Week budget tracking with overflow detection
- Module ordering and duration management
- **Why third:** High-level course structure before AI generation

### 3.5. Create /api/course/structure Endpoint ✅ COMPLETED
- Created `src/routes/api/course/structure/+server.ts`
- Uses Claude Sonnet 4.5 to generate detailed module structure
- Accepts course parameters and module skeleton
- Returns course narrative, module objectives/topics, progression narrative
- Web search tool integration for research
- **Why third:** AI-powered course structure generation

### 3.6. Build CourseStructureReview Component (Step 3) ✅ COMPLETED
- Created `src/lib/course/CourseStructureReview.svelte`
- Auto-generation on component mount
- Loading state with spinner during 30-60 second generation
- Error handling with retry functionality
- Editable course and progression narratives
- Per-module edit mode with objectives and topics management
- Regenerate button for fresh AI suggestions
- Saves refined data back to course store
- **Why third:** Review and refine AI-generated course structure before module generation

### 3.7. Reimplement the Module Overview Generation Based on Thematic Arcs ✅ COMPLETED
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
