# Metis: Module Generator

![Metis Icon](static/metis/icon.png)

> [!NOTE]
> <!-- one line defining current status -->

---

## 1. Tasks

> [!NOTE]
> This tasklist does not include upcoming [MVP Milestones](docs/dev/roadmap/Metis-MVP.md#2-mvp-milestones)

### 1.1. Open Tasks
#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks
- [ ] 1.1.2.1. Add boilerplate module text after generation
- [ ] 1.1.2.2. Add different metadata changelog varieties to distinguish between initial AI creation, AI update of human creation, AI update or AI creation etc
- [ ] 1.1.2.3. Ensure module generation adheres to tech stack requirements
- [ ] 1.1.2.4. Allow toggling of sub-sections:
  - 1.1.2.4.1. Subsections to allow
    - [ ] 1.1.2.4.1.1. `Module[Learning Objectives][Learning Objective]`
    - [ ] 1.1.2.4.1.2. `"Research Topics"[PrimaryTopics]`
    - [ ] 1.1.2.4.1.3. `"Research Topics"[PrimaryTopics][Topic]`
    - [ ] 1.1.2.4.1.4. `"Research Topics"[PrimaryTopics][Topic][Subtopics]`
    - [ ] 1.1.2.4.1.5. `"Research Topics"[PrimaryTopics][Topic][Subtopics][Subtopic]"`
    - [ ] 1.1.2.4.1.6. `"Research Topics"[StretchTopics]`
    - [ ] 1.1.2.4.1.7. `"Research Topics"[StretchTopics][Topic]"`
    - [ ] 1.1.2.4.1.8. `"Project Briefs"[Brief]`
    - [ ] 1.1.2.4.1.9. `"Project Briefs"[Brief][Skills]`
    - [ ] 1.1.2.4.1.10. `"Project Briefs"[Brief][Skills][Skill]`
    - [ ] 1.1.2.4.1.11. `"Project Briefs"[Brief][Examples]`
    - [ ] 1.1.2.4.1.12. `"Project Briefs"[Brief][Examples][Example]`
  - 1.1.2.4.2. Should apply in both Metis and Metis-in-Themis

### 1.2. Blocked Tasks
<!-- No blocked tasks -->

---

## 2. MVP Milestones
- [ ] 2.1. Allow user to choose granularity/detail level of module generation
  - 2.1.1. For example, separate booleans at appropriate stage for project briefs, twists, research topics etc
  - 2.1.2. After generation pass complete, allow user to either progress with existing detail or fill in missing detail levels
  - 2.1.3. This should be applied in both Metis and Metis-in-Themis
- [ ] 2.2. Implement Cascade Updates for Subsequent Modules
  - [ ] 2.2.1. Check for information in [About Rhea](docs/About-Rhea.md)
  - [ ] 2.2.2. Check for information in [Executive Summary](docs/Executive-Summary.md)
  - [ ] 2.2.3. Work with the user to define this feature
  - [ ] 2.2.4. Record decisions in documentation
- [ ] 2.3. Session Persistence
  - [ ] 2.3.1. localStorage for progress backup
  - [ ] 2.3.2. Restore on page load with confirmation
  - [ ] 2.3.3. "Clear session" button

---

## 3. Beyond MVP: Future Features
- [ ] Comparison view (original vs. generated with diff)
- [-] Update confidence scoring
- [ ] Multiple generation variants
- [ ] Template management
- [ ] Version history tracking
- [ ] Staleness (time since human review) tracking
- [-] Collaborative editing
- [ ] Update documentation to address developers (rather than just users)
- [ ] Add ability to upload previous modules for context on learners' existing knowledge
    - Strip boilerplate from uploads from previous modules before sending prompt

---

## 4. Work Record
### 4.1. Completed Milestones
- 4.1.1. LangChain + Claude Integration
  - Create API route: `src/routes/api/generate/+server.ts`
  - LangChain's `ChatAnthropic` for Claude integration
  - Structured output parsing for XML generation
  - SSE streaming for progress feedback
  - **Why first:** Nothing works without this. Literally decorative otherwise.
- 4.1.2. Structured Input Interface
  - Build `src/lib/StructuredInputForm.svelte`
  - Predefined fields per workflow step (date picker, multi-selects, text inputs)
  - Validation to prevent garbage inputs
  - **No chat interface** - this is purposeful data collection
  - **Why second:** Users need to provide context; forms enforce clarity better than chat.
- 4.1.3. Deep Research Capability
  - **THIS IS THE ENTIRE POINT OF THE APP**
  - LangChain tool integration (Brave Search or Tavily)
  - Extended thinking mode option
  - Research progress indicators
  - **Why critical:** Without current research, we're just reformatting existing modules. The whole reason this exists is curriculum relevance.
- 4.1.4. Module Export with Schema Validation
  - Define output XML schema (distinct from input format)
  - LangChain's `StructuredOutputParser` for adherence
  - Download formatted XML
  - Preview panel with syntax highlighting
  - Schema validation before export
  - **Why fourth:** Output delivery completes the value loop.
- 4.1.5. Modify the Export Schema to Meet My Requirements ✅ COMPLETED
  - Implemented strict XML schema validation with automatic retry logic
  - Schema validator checks all cardinality requirements (min 3 objectives, min 5 research topics, etc.)
  - Automatic retry mechanism (max 3 attempts) with validation error feedback
  - XML comment stripping for clean output
  - Enhanced generation prompts with detailed schema requirements
  - SSE progress events for validation status
  - See `docs/schema-validation-implementation.md` for full details
- 4.1.6. Generate a README.md for Users
  - It should focus on how to use the tool
  - Should include specific guidance on:
    - how to make sure the input files are correctly formatted (e.g. correct root elements)
    - common `xml` "gotchas" (e.g. unescaped ampersands will make the file throw an error)
    - how to correctly use the structured input form
  - Should include descriptions of:
    - what exactly will be sent to Claude
    - what Claude will return
    - what sources of information Claude will use
- 4.1.7. Use LangChain's Streaming Functionality to Provide Richer Feedback During Generation
  - Not planned; work with the user to implement this feature
- 4.1.8. Implement Changelog in Returned Modules ✅ COMPLETED
  - Implemented comprehensive change tracking and provenance metadata
  - Schema includes GenerationInfo (timestamp, model, sources), Changelog (section-level changes with confidence scoring), and ProvenanceTracking (human review tracking, sections needing review)
  - ChangelogViewer.svelte component displays changes with color-coded confidence badges
  - Schema validation for metadata structure in moduleValidator.ts
  - Diff detection utility (diffDetector.ts) for automatic change comparison
  - Integrated into module generation prompt with guidance on confidence levels
  - Enables cascade pattern: AI updates with human oversight, tracking AI update count
  - See `docs/changelog-schema-design.md` for full technical details
  - **Why important:** Core feature for maintaining curriculum quality over time. Allows councils to quickly identify what changed and focus review time on low-confidence updates
- 4.1.9. Intelligent Step Navigation ✅ COMPLETED
  - Automatic step advancement: step 1→2 triggers when all files uploaded successfully
  - Reactive navigation using `$: if ($canProceedToStep2 && $currentStep === 1)` pattern
  - Manual overrides: "Back to Files" and "Back to Context" buttons for navigation
  - Visual indicators: completed steps show with green checkmarks, active step highlighted
  - Success message replaces manual "Continue" button for clearer UX
  - **Why:** UX polish that makes the tool feel coherent.

### 4.2. Completed Tasks
#### 4.2.1. Record of Past Deadlines

#### 4.2.2. Record of Other Completed Tasks

##### 4.2.2.1. Metis Documentation
- [x] 4.2.2.1.1. Add instructions for including an Anthropic API key in `README.md` ✅ COMPLETED

##### 4.2.2.2. Metis: Input Schema
- [x] 4.2.2.2.1. Update input xml validator to allow attributes in root elements ✅ COMPLETED

##### 4.2.2.3. Metis: Prompt Template
- [x] 4.2.2.3.1. Steer Claude towards better Twists ✅ COMPLETED
  - Added ProjectTwistGuidelines explaining twists as conceptual curveballs, not technical features
  - Included good examples: "The Helpful Saboteur", "The Unreliable Narrator", "The Contrarian", etc.
  - Added anti-patterns showing what NOT to do (feature additions, capability expansions)
  - Emphasis on reframing PURPOSE rather than adding FEATURES
- [x] 4.2.2.3.2. Steer Claude away from "Facilitators should" phrases ✅ COMPLETED
  - Added guidance to write for LEARNERS, not facilitators (peer-led, self-directed approach)
- [x] 4.2.2.3.3. Change xml output format to use self-closing tags & attributes ✅ COMPLETED

##### 4.2.2.4. Metis: Response, Output Schema & Export
- [x] 4.2.2.4.1. Update schema files to match `~/src/data/templates/outputSchema.xml` ✅ COMPLETED
  - Updated schemaTemplate.ts to include missing <Importance> field in AdditionalSkills section
  - Ensures schema consistency between template and outputSchema.xml
- [x] 4.2.2.4.2. Update output schema to use self-closing tags (similar to input schema) ✅ COMPLETED
- [x] 4.2.2.4.3. Calculate cardinality attributes after generation ✅ COMPLETED
  - Completed in commit `68bf1f6` (cardinalityCalculator.ts)
- [x] 4.2.2.4.4. Create an xml output sanitiser ✅ COMPLETED
  - Completed via xmlCleaner.ts and responseParser.ts

##### 4.2.2.5. Metis: UI Improvements
- [x] 4.2.2.5.1. Display streaming response in UI via scrolling/ephemeral window ✅ COMPLETED
  - SSE (Server-Sent Events) implementation with `progressMessages` array
  - Real-time streaming feedback in `.progress-log` component (src/routes/metis/update/+page.svelte:710-719)
  - Color-coded messages by type (info, success, warning, error) with appropriate icons
  - Handles event types: connected, progress, content, validation_started, validation_success, validation_failed, complete, error
  - Shows validation attempts and retry information
  - **Addresses:** Original task 1.1.2.2
- [x] 4.2.2.5.2. Update generation UI to echo Themis layout ✅ COMPLETED
  - Multi-step workflow pattern with horizontal progress bar (src/routes/metis/update/+page.svelte:285-296)
  - Three steps: "Upload Files" → "Add Context" → "Generate Module"
  - Step indicators with completion status (completed steps show reduced opacity)
  - Active step highlighted with full opacity
  - Automatic step advancement when conditions met
  - Consistent visual pattern with Themis six-step workflow
  - **Addresses:** Original task 1.1.2.3
