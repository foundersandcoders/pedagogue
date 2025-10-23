# Metis MVP: Module Generator

## 1. Metis MVP

## 1.1. Metis MVP: Critical Path (Do These First)

### 1.1.10. Implement Cascade Updates for Subsequent Modules
- Not yet planned; refer to `./about-rhea.md` & `./executive-summary.md` then work with the user to implement this feature

### 1.1.11. Session Persistence
- localStorage for progress backup
- Restore on page load with confirmation
- "Clear session" button
- **Why:** Production-ready reliability, but not blocking for initial functionality.

### 1.2. Metis MVP: Miscellaneous Tasks

#### 1.2.1. Metis Documentation
- [x] 1.2.1.1. Add instructions for including an Anthropic API key in `README.md`

#### 1.2.2. Metis UI
- [ ] 1.2.2.1. Create a more interesting aesthetic
- [ ] 1.2.2.2. Add dark mode to UI
  - Should allow user to select light, dark or system

#### 1.2.3. Metis: Input Schema
- [x] 1.2.3.1. Update input xml validator to allow attributes in root elements

#### 1.2.4. Metis: Prompt Template
- [x] 1.2.4.1. Steer Claude towards better Twists
  - Added ProjectTwistGuidelines explaining twists as conceptual curveballs, not technical features
  - Included good examples: "The Helpful Saboteur", "The Unreliable Narrator", "The Contrarian", etc.
  - Added anti-patterns showing what NOT to do (feature additions, capability expansions)
  - Emphasis on reframing PURPOSE rather than adding FEATURES
- [x] 1.2.4.2. Steer Claude away from "Facilitators should" phrases
  - Added guidance to write for LEARNERS, not facilitators (peer-led, self-directed approach)
- [x] 1.2.4.3. Change xml output format to use self-closing tags & attributes

#### 1.2.5. Metis: Response, Output Schema & Export
- [x] 1.2.5.1. Update schema files in to match `~/src/data/templates/outputSchema.xml`
  - Updated schemaTemplate.ts to include missing <Importance> field in AdditionalSkills section
  - Ensures schema consistency between template and outputSchema.xml
- [x] 1.2.5.2. Update output schema to use self-closing tags (similar to input schema)
- [ ] 1.2.5.3. Add boilerplate module text after generation
- [x] 1.2.5.4. Calculate cardinality attributes after generation
  - Completed in commit `68bf1f6` (cardinalityCalculator.ts)
- [x] 1.2.5.5. Create an xml output sanitisier
  - Completed via xmlCleaner.ts and responseParser.ts

---

## 2. Beyond MVP
- [ ] 2.1. Comparison view (original vs. generated with diff)
- [-] 2.2. Update confidence scoring
- [ ] 2.3. Multiple generation variants
- [ ] 2.4. Template management
- [ ] 2.5. Version history tracking
- [ ] 2.6. Staleness (time since human review) tracking
- [-] 2.7. Collaborative editing
- [ ] 2.8. Update documentation to address developers (rather than just users)
- [ ] 2.9. Add ability to upload previous modules for context on learners' existing knowledge
  - Strip boilerplate from uploads from previous modules before sending prompt

---

## 3. General Tasks

### 3.1. Small Tasks
- [ ] 3.1. Steer Claude towards British English
- [x] 3.2. Create an xml output sanitisier

## 3.2. Architectural Refactoring (2025-10-20) ✅ COMPLETED

**Branch:** `feat/new-course-generation`
**Commits:** `fea0d91` through `496d44f`
**Documentation:** See `/docs/refactoring-progress.md` for comprehensive details

### 3.2.1. Foundation
- [x] Extract research domains duplication (`src/lib/config/researchDomains.ts`)
- [x] Clarify schema architecture (deprecated `moduleSchema.ts`, documented `moduleValidator.ts`)
- [x] Add Zod schemas for type safety (`src/lib/schemas/apiValidator.ts`)

### 3.2.2. Extract AI Utilities
- [x] AI client factory (`src/lib/factories/agents/agentClientFactory.ts`)
- [x] Response parser (`src/lib/utils/validation/responseParser.ts`)
- [x] Prompt builders (`src/lib/factories/prompts/metisPromptFactory.ts`)
- [x] SSE streaming handler (`src/lib/utils/model/sseHandler.ts`)
- [x] Retry orchestration (`src/lib/utils/model/retryHandler.ts`)

### 3.3.3. Improve Prompt Composability
- [x] Break prompts into composable sections (`src/lib/utils/prompt/shared-components.ts`)

### 3.3.4. Quality Improvements
- [x] Store consolidation utilities (`src/lib/utils/state/metisWorkflowStep.ts`, `src/lib/utils/state/persistenceUtils.ts`)
- [x] Error handling infrastructure (`src/lib/types/error.ts`, `src/lib/stores/errorStores.ts`, `ErrorBoundary.svelte`, `ErrorAlert.svelte`)

**Impact:**
- 670+ lines eliminated across API routes
- Centralized configurations and utilities
- Type-safe schemas with runtime validation
- Reusable patterns for stores, workflows, and error handling
- Better separation of concerns throughout codebase

---

## 4. Completed Critical Path

### 4.1. LangChain + Claude Integration
- Create API route: `src/routes/api/generate/+server.ts`
- LangChain's `ChatAnthropic` for Claude integration
- Structured output parsing for XML generation
- SSE streaming for progress feedback
- **Why first:** Nothing works without this. Literally decorative otherwise.

### 4.2. Structured Input Interface
- Build `src/lib/StructuredInputForm.svelte`
- Predefined fields per workflow step (date picker, multi-selects, text inputs)
- Validation to prevent garbage inputs
- **No chat interface** - this is purposeful data collection
- **Why second:** Users need to provide context; forms enforce clarity better than chat.

### 4.3. Deep Research Capability
- **THIS IS THE ENTIRE POINT OF THE APP**
- LangChain tool integration (Brave Search or Tavily)
- Extended thinking mode option
- Research progress indicators
- **Why critical:** Without current research, we're just reformatting existing modules. The whole reason this exists is curriculum relevance.

### 4.4. Module Export with Schema Validation
- Define output XML schema (distinct from input format)
- LangChain's `StructuredOutputParser` for adherence
- Download formatted XML
- Preview panel with syntax highlighting
- Schema validation before export
- **Why fourth:** Output delivery completes the value loop.

### 4.5. Modify the Export Schema to Meet My Requirements ✅ COMPLETED
- Implemented strict XML schema validation with automatic retry logic
- Schema validator checks all cardinality requirements (min 3 objectives, min 5 research topics, etc.)
- Automatic retry mechanism (max 3 attempts) with validation error feedback
- XML comment stripping for clean output
- Enhanced generation prompts with detailed schema requirements
- SSE progress events for validation status
- See `docs/schema-validation-implementation.md` for full details

### 4.6. Generate a README.md for Users
- It should focus on how to use the tool
- Should include specific guidance on:
  - how to make sure the input files are correctly formatted (e.g. correct root elements)
  - common `xml` "gotchas" (e.g. unescaped ampersands will make the file throw an error)
  - how to correctly use the structured input form
- Should include descriptions of:
  - what exactly will be sent to Claude
  - what Claude will return
  - what sources of information Claude will use

### 4.7. Use LangChain's Streaming Functionality to Provide Richer Feedback During Generation
- Not planned; work with the user to implement this feature

### 4.8. Implement Changelog in Returned Modules ✅ COMPLETED
- Implemented comprehensive change tracking and provenance metadata
- Schema includes GenerationInfo (timestamp, model, sources), Changelog (section-level changes with confidence scoring), and ProvenanceTracking (human review tracking, sections needing review)
- ChangelogViewer.svelte component displays changes with color-coded confidence badges
- Schema validation for metadata structure in moduleValidator.ts
- Diff detection utility (diffDetector.ts) for automatic change comparison
- Integrated into module generation prompt with guidance on confidence levels
- Enables cascade pattern: AI updates with human oversight, tracking AI update count
- See `docs/changelog-schema-design.md` for full technical details
- **Why important:** Core feature for maintaining curriculum quality over time. Allows councils to quickly identify what changed and focus review time on low-confidence updates

### 4.9. Intelligent Step Navigation ✅ COMPLETED
- Automatic step advancement: step 1→2 triggers when all files uploaded successfully
- Reactive navigation using `$: if ($canProceedToStep2 && $currentStep === 1)` pattern
- Manual overrides: "Back to Files" and "Back to Context" buttons for navigation
- Visual indicators: completed steps show with green checkmarks, active step highlighted
- Success message replaces manual "Continue" button for clearer UX
- **Why:** UX polish that makes the tool feel coherent.
