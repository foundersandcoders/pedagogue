# Pedagogue MVP: CoBu (Course Builder)

## 1. Critical Path (Do These First)

### 1.7. Build ModuleGenerationList Component (Step 4)
- Create `src/lib/course/ModuleGenerationList.svelte`
- Display all modules from refined course structure
- Module-by-module generation using existing module workflow
- Track generation status per module (planned, generating, complete, error)
- Allow regeneration of individual modules
- Progress tracking across all modules
- **Why seventh:** Orchestrates the actual content generation using existing proven module generator

### 1.8. Create /api/course/module/generate Endpoint
- Create `src/routes/api/course/module/+server.ts`
- Accept module data with course context
- Call existing module generation logic with course-aware prompts
- Return XML module spec
- **Why eighth:** API layer for course-aware module generation

### 1.9. Extend /api/generate with Course Context
- Modify existing `src/routes/api/generate/+server.ts`
- Accept optional course context parameter
- Include course narrative and progression in prompts when provided
- Ensure backward compatibility with standalone module generation
- **Why ninth:** Reuses existing module generation with course awareness

### 1.10. Build CourseOverview Component (Step 5)
- Create `src/lib/course/CourseOverview.svelte`
- Display complete course with all generated modules
- Show course narratives and module summaries
- Export functionality trigger
- Final review interface
- **Why tenth:** Final review and export interface

### 1.11. Add Course XML Schema and Validator
- Define course-level XML schema wrapping multiple modules
- Validation for complete course structure
- Include course narratives and metadata
- **Why eleventh:** Ensures exported courses meet quality standards

### 1.12. Implement Export Functionality
- XML export for complete course
- PDF export option
- Individual module file exports
- Course metadata inclusion
- **Why twelfth:** Delivers the final product to users

### 1.13. Add localStorage Persistence
- Auto-save course progress to localStorage
- Restore course on page reload
- "Clear course" functionality
- Save/load multiple courses
- **Why thirteenth:** Production-ready reliability for course creation workflow

### 1.2. CoBu MVP: Miscellaneous Tasks
- [ ] Create a milestoning system in the structure outline (e.g. "by this module, users should be able to do `xyz`")

---

## 2. Beyond MVP
None yet

---

## 3. Completed: Critical Path Progress

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
