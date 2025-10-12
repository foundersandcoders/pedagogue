# Pedagogue MVP: Implementation Priorities

## Roadmap to MVP

### Critical Path (Do These First)

#### 9. Intelligent Step Navigation
- Detect workflow state transitions automatically
- Update `currentStep` store reactively
- Manual override for edge cases
- Clear visual indicators
- **Why:** UX polish that makes the tool feel coherent.

#### 10. Implement Cascade Updates for Subsequent Modules
- Not yet planned; refer to `./about-pedagogue.md` & `./executive-summary.md` then work with the user to implement this feature

#### 11. Session Persistence
- localStorage for progress backup
- Restore on page load with confirmation
- "Clear session" button
- **Why:** Production-ready reliability, but not blocking for initial functionality.

### Other MVP Tasks

#### Documentation
- [x] Add instructions for including an Anthropic API key in `README.md`

#### UI
- [ ] Add dark mode to UI
  - Should allow user to select light, dark or system

#### Prompt & Schema
- [x] Steer Claude towards better Twists
  - Added ProjectTwistGuidelines explaining twists as conceptual curveballs, not technical features
  - Included good examples: "The Helpful Saboteur", "The Unreliable Narrator", "The Contrarian", etc.
  - Added anti-patterns showing what NOT to do (feature additions, capability expansions)
  - Emphasis on reframing PURPOSE rather than adding FEATURES
- [x] Steer Claude away from "Facilitators should" phrases
  - Added guidance to write for LEARNERS, not facilitators (peer-led, self-directed approach)

#### Module Generation
- [x] Update files in `~/lib/schemas/` to match `~/src/data/templates/outputSchema.xml`
  - Updated schemaTemplate.ts to include missing <Importance> field in AdditionalSkills section
  - Ensures schema consistency between template and outputSchema.xml

#### Export & Finalisation
- [ ] Add boilerplate module text after generation
  - There are some instructional sections that stay constant between modules.
  - We can add them in between generation and download.

---

## Beyond MVP
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

## Completed

### 1. LangChain + Claude Integration
- Create API route: `src/routes/api/generate/+server.ts`
- LangChain's `ChatAnthropic` for Claude integration
- Structured output parsing for XML generation
- SSE streaming for progress feedback
- **Why first:** Nothing works without this. Literally decorative otherwise.

### 2. Structured Input Interface
- Build `src/lib/StructuredInputForm.svelte`
- Predefined fields per workflow step (date picker, multi-selects, text inputs)
- Validation to prevent garbage inputs
- **No chat interface** - this is purposeful data collection
- **Why second:** Users need to provide context; forms enforce clarity better than chat.

### 3. Deep Research Capability
- **THIS IS THE ENTIRE POINT OF THE APP**
- LangChain tool integration (Brave Search or Tavily)
- Extended thinking mode option
- Research progress indicators
- **Why critical:** Without current research, we're just reformatting existing modules. The whole reason this exists is curriculum relevance.

### 4. Module Export with Schema Validation
- Define output XML schema (distinct from input format)
- LangChain's `StructuredOutputParser` for adherence
- Download formatted XML
- Preview panel with syntax highlighting
- Schema validation before export
- **Why fourth:** Output delivery completes the value loop.

### 5. Modify the Export Schema to Meet My Requirements ✅ COMPLETED
- Implemented strict XML schema validation with automatic retry logic
- Schema validator checks all cardinality requirements (min 3 objectives, min 5 research topics, etc.)
- Automatic retry mechanism (max 3 attempts) with validation error feedback
- XML comment stripping for clean output
- Enhanced generation prompts with detailed schema requirements
- SSE progress events for validation status
- See `docs/schema-validation-implementation.md` for full details

#### 6. Generate a README.md for Users
- It should focus on how to use the tool
- Should include specific guidance on:
  - how to make sure the input files are correctly formatted (e.g. correct root elements)
  - common `xml` "gotchas" (e.g. unescaped ampersands will make the file throw an error)
  - how to correctly use the structured input form
- Should include descriptions of:
  - what exactly will be sent to Claude
  - what Claude will return
  - what sources of information Claude will use

#### 7. Use LangChain's Streaming Functionality to Provide Richer Feedback During Generation
- Not planned; work with the user to implement this feature

### 8. Implement Changelog in Returned Modules ✅ COMPLETED
- Implemented comprehensive change tracking and provenance metadata
- Schema includes GenerationInfo (timestamp, model, sources), Changelog (section-level changes with confidence scoring), and ProvenanceTracking (human review tracking, sections needing review)
- ChangelogViewer.svelte component displays changes with color-coded confidence badges
- Schema validation for metadata structure in moduleValidator.ts
- Diff detection utility (diffDetector.ts) for automatic change comparison
- Integrated into module generation prompt with guidance on confidence levels
- Enables cascade pattern: AI updates with human oversight, tracking AI update count
- See `docs/changelog-schema-design.md` for full technical details
- **Why important:** Core feature for maintaining curriculum quality over time. Allows councils to quickly identify what changed and focus review time on low-confidence updates
