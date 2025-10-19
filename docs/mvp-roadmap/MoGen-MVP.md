# Pedagogue MVP: MoGen (Module Generator)

## 1. MoGen MVP: Critical Path (Do These First)

### 1.10. Implement Cascade Updates for Subsequent Modules
- Not yet planned; refer to `./about-pedagogue.md` & `./executive-summary.md` then work with the user to implement this feature

### 1.11. Session Persistence
- localStorage for progress backup
- Restore on page load with confirmation
- "Clear session" button
- **Why:** Production-ready reliability, but not blocking for initial functionality.

### 1.2. MoGen MVP: Miscellaneous Tasks

#### 1.2.1. MoGen Documentation
- [x] Add instructions for including an Anthropic API key in `README.md`

#### 1.2.2. MoGen UI
- [ ] Create a more interesting aesthetic
- [ ] Add dark mode to UI
  - Should allow user to select light, dark or system

#### 1.2.3. MoGen: Input Schema
- [x] Update input xml validator to allow attributes in root elements

#### 1.2.4. MoGen: Prompt Template
- [x] Steer Claude towards better Twists
  - Added ProjectTwistGuidelines explaining twists as conceptual curveballs, not technical features
  - Included good examples: "The Helpful Saboteur", "The Unreliable Narrator", "The Contrarian", etc.
  - Added anti-patterns showing what NOT to do (feature additions, capability expansions)
  - Emphasis on reframing PURPOSE rather than adding FEATURES
- [x] Steer Claude away from "Facilitators should" phrases
  - Added guidance to write for LEARNERS, not facilitators (peer-led, self-directed approach)
- [x] Change xml output format to use self-closing tags & attributes

#### 1.2.4. MoGen: Response, Output Schema & Export
- [x] Update files in `~/lib/schemas/` to match `~/src/data/templates/outputSchema.xml`
  - Updated schemaTemplate.ts to include missing <Importance> field in AdditionalSkills section
  - Ensures schema consistency between template and outputSchema.xml
- [x] Update output schema to use self-closing tags (similar to input schema)
- [ ] Add boilerplate module text after generation
- [ ] Calculate cardinality attributes after generation

---

## 2. Beyond MVP
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

## 3. General Tasks
- [ ] 3.1. Steer Claude towards British English
- [ ] 3.2. Fix the output validation error in `docs/drafts/modules/module3-2025-10-19-2158.xml`
    *Think it's partly ampersand on line 228*
    client.ts:122 [hmr] Failed to reload /src/lib/FileUpload.svelte. This could be due to syntax errors or importing non-existent modules. (see errors above)
      warnFailedFetch	@	client.ts:122
      fetchUpdate	@	client.ts:475
      await in fetchUpdate
      (anonymous)	@	client.ts:181
      handleMessage	@	client.ts:179
      (anonymous)	@	client.ts:96
    ⚠ Validation Warnings
      <GenerationInfo> missing <Timestamp>
      <Change> #1 missing <Section> identifier
      <Change> #1 missing <Type>
      <Change> #1 missing <Confidence> level
      <Change> #2 missing <Section> identifier
      <Change> #2 missing <Type>
      <Change> #2 missing <Confidence> level
      <Change> #3 missing <Section> identifier
      <Change> #3 missing <Type>
      <Change> #3 missing <Confidence> level
      <Change> #4 missing <Section> identifier
      <Change> #4 missing <Type>
      <Change> #4 missing <Confidence> level
      <Change> #5 missing <Section> identifier
      <Change> #5 missing <Type>
      <Change> #5 missing <Confidence> level
      <Change> #6 missing <Section> identifier
      <Change> #6 missing <Type>
      <Change> #6 missing <Confidence> level
      <Change> #7 missing <Section> identifier
      <Change> #7 missing <Type>
      <Change> #7 missing <Confidence> level
      <Change> #8 missing <Section> identifier
      <Change> #8 missing <Type>
      <Change> #8 missing <Confidence> level
      <Change> #9 missing <Section> identifier
      <Change> #9 missing <Type>
      <Change> #9 missing <Confidence> level
    ⚠ Validation Errors
      XML parsing error: This page contains the following errors:error on line 228 at column 326: xmlParseEntityRef: no name Below is a rendering of the page up to the first error.

---

## 4. Completed

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
