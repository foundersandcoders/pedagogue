# Pedagogue MVP: Implementation Priorities

## 1. CoBu (Course Builder) MVP

### 1.1. CoBu MVP: Critical Path (Do These First)

#### 1.1.4. Build ModuleGenerationList Component (Step 4)
- Create `src/lib/course/ModuleGenerationList.svelte`
- Display all modules from refined course structure
- Module-by-module generation using existing module workflow
- Track generation status per module (planned, generating, complete, error)
- Allow regeneration of individual modules
- Progress tracking across all modules
- **Why fourth:** Orchestrates the actual content generation using existing proven module generator

#### 1.1.5. Create /api/course/module/generate Endpoint
- Create `src/routes/api/course/module/+server.ts`
- Accept module data with course context
- Call existing module generation logic with course-aware prompts
- Return XML module spec
- **Why fifth:** API layer for course-aware module generation

#### 1.1.6. Extend /api/generate with Course Context
- Modify existing `src/routes/api/generate/+server.ts`
- Accept optional course context parameter
- Include course narrative and progression in prompts when provided
- Ensure backward compatibility with standalone module generation
- **Why sixth:** Reuses existing module generation with course awareness

#### 1.1.7. Build CourseOverview Component (Step 5)
- Create `src/lib/course/CourseOverview.svelte`
- Display complete course with all generated modules
- Show course narratives and module summaries
- Export functionality trigger
- Final review interface
- **Why seventh:** Final review and export interface

#### 1.1.8. Add Course XML Schema and Validator
- Define course-level XML schema wrapping multiple modules
- Validation for complete course structure
- Include course narratives and metadata
- **Why eighth:** Ensures exported courses meet quality standards

#### 1.1.9. Implement Export Functionality
- XML export for complete course
- PDF export option
- Individual module file exports
- Course metadata inclusion
- **Why ninth:** Delivers the final product to users

#### 1.1.10. Add localStorage Persistence
- Auto-save course progress to localStorage
- Restore course on page reload
- "Clear course" functionality
- Save/load multiple courses
- **Why tenth:** Production-ready reliability for course creation workflow

### 1.2. CoBu MVP: Miscellaneous Tasks
- [ ] Create a milestoning system in the structure outline (e.g. "by this module, users should be able to do `xyz`")

---

## 2. MoGen (Module Generator) MVP

### 2.1. MoGen MVP: Critical Path (Do These First)

#### 2.1.10. Implement Cascade Updates for Subsequent Modules
- Not yet planned; refer to `./about-pedagogue.md` & `./executive-summary.md` then work with the user to implement this feature

#### 2.1.11. Session Persistence
- localStorage for progress backup
- Restore on page load with confirmation
- "Clear session" button
- **Why:** Production-ready reliability, but not blocking for initial functionality.

### 2.2. MoGen MVP: Miscellaneous Tasks

#### 2.2.1. MoGen Documentation
- [x] Add instructions for including an Anthropic API key in `README.md`

#### 2.2.2. MoGen UI
- [ ] Create a more interesting aesthetic
- [ ] Add dark mode to UI
  - Should allow user to select light, dark or system

#### 2.2.3. MoGen Prompt & Schema
- [x] Steer Claude towards better Twists
  - Added ProjectTwistGuidelines explaining twists as conceptual curveballs, not technical features
  - Included good examples: "The Helpful Saboteur", "The Unreliable Narrator", "The Contrarian", etc.
  - Added anti-patterns showing what NOT to do (feature additions, capability expansions)
  - Emphasis on reframing PURPOSE rather than adding FEATURES
- [x] Steer Claude away from "Facilitators should" phrases
  - Added guidance to write for LEARNERS, not facilitators (peer-led, self-directed approach)

#### 2.2.4. MoGen Output
- [x] Update files in `~/lib/schemas/` to match `~/src/data/templates/outputSchema.xml`
  - Updated schemaTemplate.ts to include missing <Importance> field in AdditionalSkills section
  - Ensures schema consistency between template and outputSchema.xml

#### 2.2.5. MoGen Export
- [ ] Add boilerplate module text after generation
  - There are some instructional sections that stay constant between modules.
  - We can add them in between generation and download.

---

## 3. AtLAs (Atomic Learning Assembler) MVP

> Coming soon, ignore for now

---

## 4. Beyond MVP

### 4.1. Beyond MVP: CoBu

### 4.2. Beyond MVP: MoGen
- [ ] Comparison view (original vs. generated with diff)
- [-] Update confidence scoring
- [ ] Multiple generation variants
- [ ] Template management
- [ ] Version history tracking
- [ ] Staleness (time since human review) tracking
- [-] Collaborative editing
- [ ] Update documentation to address developers (rather than just users)
- [ ] Add ability to upload previous modules for additional context
  - Strip boilerplate from uploads from previous modules before sending prompt

---

## 5. Completed

### 5.1. CoBu MVP: Critical Path Progress

#### 5.1.1. Create Hub Dashboard and Navigation Structure ✅ COMPLETED
- Created hub dashboard at `/` with cards for "Generate Module" and "Generate Course"
- Moved existing module generator to `/module/new`
- Added breadcrumb navigation in layout for all routes
- Hub-based architecture allows parallel workflows
- **Why first:** Foundation for organizing module vs. course workflows

#### 5.1.2. Create Course Types and Stores ✅ COMPLETED
- Defined TypeScript interfaces in `src/lib/types/course.ts`
- CourseData interface with logistics, learners, structure, and modules
- ModuleSlot interface with status tracking, objectives, topics
- Created Svelte stores in `src/lib/courseStores.ts`
- Auto-save to localStorage on course changes
- Derived stores for computed values (totalModuleWeeks)
- **Why second:** Type-safe state management for course workflow

#### 5.1.3. Build CourseConfigForm Component (Step 1) ✅ COMPLETED
- Created `src/lib/course/CourseConfigForm.svelte`
- Comprehensive form with course identity, logistics, learner configuration
- Validation for all inputs (weeks, cohort size, dates, etc.)
- Disabled SSR for localStorage compatibility
- Reactive statements ensure nested objects exist before access
- **Why third:** User input collection for course parameters

#### 5.1.4. Build ModuleStructurePlanner Component (Step 2) ✅ COMPLETED
- Created `src/lib/course/ModuleStructurePlanner.svelte`
- Visual timeline bar showing proportional week allocation
- Add/remove modules with validation
- Auto-suggest feature based on course duration
- Week budget tracking with overflow detection
- Module ordering and duration management
- **Why third:** High-level course structure before AI generation

#### 5.1.5. Create /api/course/structure Endpoint ✅ COMPLETED
- Created `src/routes/api/course/structure/+server.ts`
- Uses Claude Sonnet 4.5 to generate detailed module structure
- Accepts course parameters and module skeleton
- Returns course narrative, module objectives/topics, progression narrative
- Web search tool integration for research
- **Why third:** AI-powered course structure generation

#### 5.1.6. Build CourseStructureReview Component (Step 3) ✅ COMPLETED
- Created `src/lib/course/CourseStructureReview.svelte`
- Auto-generation on component mount
- Loading state with spinner during 30-60 second generation
- Error handling with retry functionality
- Editable course and progression narratives
- Per-module edit mode with objectives and topics management
- Regenerate button for fresh AI suggestions
- Saves refined data back to course store
- **Why third:** Review and refine AI-generated course structure before module generation

### 5.2. MoGen MVP: Critical Path Progress

#### 5.2.1. LangChain + Claude Integration
- Create API route: `src/routes/api/generate/+server.ts`
- LangChain's `ChatAnthropic` for Claude integration
- Structured output parsing for XML generation
- SSE streaming for progress feedback
- **Why first:** Nothing works without this. Literally decorative otherwise.

#### 5.2.2. Structured Input Interface
- Build `src/lib/StructuredInputForm.svelte`
- Predefined fields per workflow step (date picker, multi-selects, text inputs)
- Validation to prevent garbage inputs
- **No chat interface** - this is purposeful data collection
- **Why second:** Users need to provide context; forms enforce clarity better than chat.

#### 5.2.3. Deep Research Capability
- **THIS IS THE ENTIRE POINT OF THE APP**
- LangChain tool integration (Brave Search or Tavily)
- Extended thinking mode option
- Research progress indicators
- **Why critical:** Without current research, we're just reformatting existing modules. The whole reason this exists is curriculum relevance.

#### 5.2.4. Module Export with Schema Validation
- Define output XML schema (distinct from input format)
- LangChain's `StructuredOutputParser` for adherence
- Download formatted XML
- Preview panel with syntax highlighting
- Schema validation before export
- **Why fourth:** Output delivery completes the value loop.

#### 5.2.5. Modify the Export Schema to Meet My Requirements ✅ COMPLETED
- Implemented strict XML schema validation with automatic retry logic
- Schema validator checks all cardinality requirements (min 3 objectives, min 5 research topics, etc.)
- Automatic retry mechanism (max 3 attempts) with validation error feedback
- XML comment stripping for clean output
- Enhanced generation prompts with detailed schema requirements
- SSE progress events for validation status
- See `docs/schema-validation-implementation.md` for full details

#### 5.2.6. Generate a README.md for Users
- It should focus on how to use the tool
- Should include specific guidance on:
  - how to make sure the input files are correctly formatted (e.g. correct root elements)
  - common `xml` "gotchas" (e.g. unescaped ampersands will make the file throw an error)
  - how to correctly use the structured input form
- Should include descriptions of:
  - what exactly will be sent to Claude
  - what Claude will return
  - what sources of information Claude will use

#### 5.2.7. Use LangChain's Streaming Functionality to Provide Richer Feedback During Generation
- Not planned; work with the user to implement this feature

#### 5.2.8. Implement Changelog in Returned Modules ✅ COMPLETED
- Implemented comprehensive change tracking and provenance metadata
- Schema includes GenerationInfo (timestamp, model, sources), Changelog (section-level changes with confidence scoring), and ProvenanceTracking (human review tracking, sections needing review)
- ChangelogViewer.svelte component displays changes with color-coded confidence badges
- Schema validation for metadata structure in moduleValidator.ts
- Diff detection utility (diffDetector.ts) for automatic change comparison
- Integrated into module generation prompt with guidance on confidence levels
- Enables cascade pattern: AI updates with human oversight, tracking AI update count
- See `docs/changelog-schema-design.md` for full technical details
- **Why important:** Core feature for maintaining curriculum quality over time. Allows councils to quickly identify what changed and focus review time on low-confidence updates

#### 5.2.9. Intelligent Step Navigation ✅ COMPLETED
- Automatic step advancement: step 1→2 triggers when all files uploaded successfully
- Reactive navigation using `$: if ($canProceedToStep2 && $currentStep === 1)` pattern
- Manual overrides: "Back to Files" and "Back to Context" buttons for navigation
- Visual indicators: completed steps show with green checkmarks, active step highlighted
- Success message replaces manual "Continue" button for clearer UX
- **Why:** UX polish that makes the tool feel coherent.
