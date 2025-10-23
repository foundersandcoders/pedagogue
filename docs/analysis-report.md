# Rhea: A Thorough Interrogation

## What This Thing Actually Is

Rhea is a rather elegant attempt at solving a genuinely tedious problem: keeping educational content current in a field that moves at the speed of hype cycles. The concept is sound—automate the curriculum review process by having an LLM analyse existing module specs, conduct research, and regenerate updated versions. It's essentially building a structured wrapper around what would otherwise be chaotic ChatGPT sessions punctuated by lost context and copy-paste accidents.

The intended workflow unfolds across six phases:
1. **File Ingestion** – Upload XML-structured module specs
2. **Initial Analysis** – Claude reads and processes the content
3. **Structured Input** – Users provide context via predefined form fields (not free-form chat)
4. **Understanding Confirmation** – Verify Claude actually gets it
5. **Deep Research** – The substantial bit where current state gets evaluated
6. **Module Generation** – Output new specs in predefined (but distinct) XML format

It's automating administrative cognitive labour through structured interaction rather than ambiguous conversation. The UI enforces clarity by design—no meandering chat threads, just purposeful form inputs that map directly to what Claude needs.

---

## What's Actually Working

### The Surprisingly Solid Foundations

**File Upload Infrastructure** demonstrates genuine craft. The `FileUpload.svelte` component handles drag-and-drop elegantly, validates sensibly (1MB limit, XML only), provides clear visual feedback through distinct states, and includes proper keyboard navigation. Someone actually thought about accessibility, which is increasingly rare.

**XML Parsing** (`xml-parser.ts`) doesn't just throw generic errors—it has custom error types with contextual details, intelligently extracts bullet points from various formatting patterns, and gracefully handles malformed XML. The distinction between validation errors and parsing errors shows systems thinking.

**State Management** via Svelte stores is architecturally sound. The use of derived stores (`canProceedToStep2`, `bothFilesUploaded`) demonstrates understanding reactive patterns beyond basic tutorials. State is properly separated: upload states distinct from file contents distinct from errors.

**UI/UX Design** has actual personality. The stepped workflow visualisation with colour-coded states, smooth transitions, the little arrow between steps—it's functional *and* pleasant. The drop zones responding to drag events with visual feedback shows attention to micro-interactions.

**TypeScript Integration** is proper, not performative. Interfaces for `ArcFile`, `NextStepFile`, and `ArcOption` provide genuine type safety rather than sprinkling `any` everywhere and calling it done.

---

## The Rather Substantial Gap

### Where Vision Meets Reality's Awkward Silence

**Zero LLM Integration.** This is the architectural equivalent of building a theatre and forgetting to book any actors. The `@anthropic-ai/sdk` sits in `package.json` like a decorative plant. There are no API routes. No streaming handlers. No conversation management. No actual intelligence whatsoever.

Steps 2 through 6—the entire *purpose* of the application—return a placeholder div saying "Implementation coming soon..."

This creates an amusing tension: immaculate file upload experience leading directly into a void.

### Specific Absences

**No Backend API Routes** – SvelteKit's `+server.ts` pattern remains unused. There's literally nowhere for API calls to happen.

**No Conversation Interface** – The stores reference a `conversation` array, but the vision is actually *structured input forms*, not free-form chat. The current architecture assumes dialogue when the design should enforce purposeful, predefined input fields. This is actually more elegant—force clarity through interface design rather than hoping users provide useful context in chat messages.

**No Research Capabilities** – Step 5's "deep research" would require web search, RAG, or extended thinking. None of this exists.

**No Export Mechanism** – Even if module generation worked, there's no download button, no copy-to-clipboard, no way to actually *get* the output.

**No Persistence** – Everything lives in memory. Refresh the page and your entire session evaporates. Given that generating a module might take 15-20 minutes, this is... optimistic.

---

## Priority-Ordered Implementation Path

### 1. LangChain Integration with Claude [CRITICAL]

**Why**: Without this, the application is literally decorative.

**What**: Create `src/routes/api/generate/+server.ts` handling LangChain orchestration with Claude.

**Implementation considerations**:
- LangChain's `ChatAnthropic` for Claude integration
- File contents injected via system prompts or structured messages
- Six-step workflow orchestrated through LangChain chains
- SSE (Server-Sent Events) for streaming LLM outputs
- LangChain's callback system for progress tracking
- Consider using LangChain's `StructuredOutputParser` for XML generation
- Proper error boundaries because LLMs sometimes just... don't

**Why LangChain specifically**: Abstraction over raw SDK calls, built-in retry logic, easier to add tools/memory later, chain-of-thought patterns supported natively.

**Complexity**: Medium. LangChain adds abstraction that helps but also introduces its own learning curve. Worth it for maintainability.

### 2. Structured Input Interface [CRITICAL]

**Why**: Users need to provide context without the ambiguity of free-form chat. Structured inputs enforce clarity by design.

**What**: Build `src/lib/StructuredInputForm.svelte` with predefined fields for each workflow step.

**Implementation considerations**:
- Date picker for "when will this module start?" 
- Multi-select for relevant technologies/frameworks
- Text fields for specific constraints or priorities
- Validation that prevents garbage inputs
- Clear labels explaining what each field affects
- No chat interface—this is purposeful data collection
- (Future: Claude clarifying questions could appear as dynamic form fields, but that's beyond MVP)

**Complexity**: Low-medium. Form validation and state binding, but no streaming complexity.

### 3. Intelligent Step Navigation [HIGH]

**Why**: The current "proceed" button doesn't align with LLM-driven workflows where Claude should signal readiness.

**What**: Detect conversation state transitions and advance automatically.

**Implementation considerations**:
- Parse Claude responses for step-completion signals
- Update `currentStep` store reactively
- Provide manual override for edge cases (Claude gets confused, user wants to skip)
- Visual indicators showing current phase clearly
- Don't auto-advance during active user input

**Complexity**: Low-medium. Mostly state management and pattern matching.

### 4. Module Export with Schema Validation [HIGH]

**Why**: Output is the entire point. Currently there's no way to retrieve generated content.

**What**: Export modules in a predefined XML schema (distinct from input format).

**Implementation considerations**:
- Define output XML schema explicitly (separate from input arc/next-step format)
- Use LangChain's `StructuredOutputParser` to enforce schema adherence
- Download formatted XML with proper indentation
- Copy to clipboard with success feedback
- Preview panel with syntax highlighting
- Schema validation before export to catch malformed outputs
- Optional: JSON export for alternative tooling

**Why distinct schemas matter**: Input optimises for human curriculum authoring; output optimises for downstream consumption (LMS integration, version control, etc.). Separation of concerns.

**Complexity**: Low-medium. File downloads are trivial; schema enforcement via LangChain adds validation overhead.

### 5. Deep Research Integration [CRITICAL]

**Why**: **This is literally the entire point.** Without current research, you're just reformatting existing modules with fancier tools. The whole reason this application exists is to keep curriculum aligned with rapidly evolving technology landscapes.

**What**: Enable Claude to access and synthesise current information about technologies, frameworks, and pedagogical approaches.

**Implementation approaches** (choose wisely):
- **LangChain + Web Search**: Use LangChain's tool integration with Brave Search or Tavily
- **Extended Thinking Mode**: Leverage Claude's deep reasoning without external calls
- **RAG Pipeline**: Curated knowledge base of recent tech developments (requires maintenance)
- **Hybrid Approach**: Extended thinking + selective web search for verification

**LangChain advantages here**:
- Built-in tool calling abstractions
- Easy to compose search → synthesis → generation chains
- Callback handlers for showing research progress
- Memory systems for maintaining context across research steps

**Complexity**: High, but **non-negotiable**. This is where the application delivers actual value. Without this, you've built an elaborate XML reformatter.

### 6. Session Persistence [MEDIUM]

**Why**: Losing 20 minutes of work to a browser crash is user-hostile.

**What**: Save progress continuously, restore on load.

**Implementation considerations**:
- localStorage for single-user scenarios (simple)
- Server-side sessions if multi-user (complex)
- Save after each conversation turn
- Restore with confirmation prompt
- "Clear session" button for fresh starts
- Consider IndexedDB for larger conversations

**Complexity**: Low for localStorage, medium for server sessions.

---

## Speculative Feature Space

### High Value, Low Effort

**Visual XML Preview** – Display parsed structure before processing so users can verify their files parsed correctly. Shows the data model rather than raw XML. *2-3 hours*

**Example Files** – Provide downloadable sample `arc.xml` and `next-step.xml` so users understand expected format without reading documentation like responsible adults. *1 hour*

**Prompt Customisation** – Expose system prompt for tweaking. Different courses might need different emphases. *3-4 hours*

### High Value, Medium Effort

**Comparison View** – Side-by-side original vs. generated with diff highlighting. Makes review process tangible. *1-2 days*

**Multiple Generations** – Create 2-3 alternative versions. Gives council actual choices rather than binary accept/reject. *2 days*

**Template Management** – Save and reuse custom prompts for recurring patterns. *3 days*

### Medium Value, Low Effort

**Dark Mode** – Apparently mandatory now. Uses CSS custom properties if architected sensibly. *2-3 hours*

**Progress Indicators** – Show estimated time remaining, token usage, step completion. Makes waiting less existential. *3-4 hours*

**Error Recovery** – Retry failed API calls, resume interrupted sessions. Production-minded. *4-5 hours*

### High Value, High Effort

**Collaborative Editing** – Multiple council members review simultaneously. Requires WebSocket or similar real-time infrastructure. *1-2 weeks*

**Version History** – Track module evolution over time, compare semester-to-semester. Useful for identifying curriculum drift. *1 week*

**Automated Scheduling** – Trigger reviews automatically before semester starts. Reduces administrative overhead. *1-2 weeks*

### Properly Speculative Territory

**Voice Input** – Dictate responses during clarification phase. Useful for accessibility and might appeal to neurodivergent workflows. Web Speech API makes this surprisingly feasible. *1-2 days*

**Emoji Reactions** – Mark particularly insightful Claude responses. Adds levity to administrative tedium. *2 hours*

**Chaos Mode** – Generate intentionally provocative or experimental module ideas to spark creative thinking. Controlled chaos as pedagogical tool. *4-5 hours of prompt engineering*

**Debate Mode** – Have two Claude instances argue about module design. Entertainment value questionable, insight potential interesting. *1 day*

---

## Architectural Observations

The current structure suggests someone who understands component-driven design and state management but perhaps underestimated the complexity of LLM integration. The UI foundations are genuinely solid—routing, components, stores, styling all demonstrate competence.

The missing backend reveals a common pattern: building the interface first feels productive because it's visible and testable. API integration feels abstract until you're staring at placeholder text wondering why nothing works.

Fortunately, the architecture isn't fighting against itself. SvelteKit's patterns support what needs to happen. The stores are structured appropriately. Adding the API layer won't require significant refactoring, just... actually writing it.

### Structural Strengths

- Component isolation is clean
- TypeScript interfaces provide clear contracts
- Store-driven state prevents prop-drilling nightmares
- File validation happens early, preventing garbage-in scenarios

### Structural Opportunities

- No error boundary pattern visible
- Hardcoded workflow steps could be more configurable
- No testing infrastructure apparent
- API key management strategy unclear

---

## Closing Thoughts

This project exhibits that familiar tension between ambitious vision and pragmatic execution. The care evident in the file upload experience suggests someone who thinks about users, not just features. The wholesale absence of the core AI functionality suggests priorities shifted mid-development, or perhaps the easier problems got solved first whilst the harder ones waited.

The good news: you've built solid foundations. The routing structure supports what's needed. The component architecture is clean. The state management is sound. Adding the intelligence layer won't require demolishing what exists—it'll slot in where the placeholders currently sit.

The ironic observation: building an AI-powered educational tool that itself requires significant educational effort to complete. There's something rather recursive about struggling to implement the automation meant to ease your own struggle.

**About that Deno/npm choice**: The `main.ts` file is a Deno script that spawns `npm run dev` via `Deno.Command`. This is... architecturally curious. You have both `deno.json` (with Deno-native tasks) and `package.json` (with npm scripts), suggesting an identity crisis. The Deno runtime is being used exclusively to launch a Node/npm process, which adds a layer of indirection for unclear benefit. It works, certainly, but why?

Possible explanations:
- **Incremental migration**: Started with Deno, discovered SvelteKit's npm ecosystem, compromised by wrapping
- **Tooling preferences**: Wanted Deno's permission model and built-in TypeScript for scripting, but needed npm for frontend deps
- **Experimental exploration**: Testing Deno as orchestration layer whilst keeping familiar Node tooling
- **Copy-paste archaeology**: Borrowed structure from another project without questioning assumptions

None of these are *wrong*, but the complexity cost seems disproportionate to benefits gained. If using SvelteKit's npm ecosystem anyway, why not just... use Node? If committed to Deno, why not use Deno-native SvelteKit alternatives?

It's the sort of decision that makes perfect sense in context but looks slightly unhinged when viewed externally. I respect it.

---

## Meta-Commentary on This Document

I've attempted to maintain analytical rigour whilst acknowledging the inherent absurdity of thoroughly documenting a partially-implemented application. The gaps are obvious. The fixes are clear. The prioritisation is straightforward.

What makes this interesting isn't the technical diagnosis—that's mechanical. It's observing how projects evolve when vision outpaces implementation capacity. The upload components are *better* than they need to be for an MVP, suggesting either perfectionism or procrastination around the harder problems.

Both are deeply relatable.