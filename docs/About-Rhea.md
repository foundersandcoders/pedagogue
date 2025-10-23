# Rhea: What It Actually Does

## The Problem (Or: Why This Exists At All)

You're running a peer-led AI Engineering course with rotating three-week administration councils. Technology changes monthly. Module specifications written in September are questionable by October and actively misleading by December. Traditional curriculum maintenance – where you wait until everything's outdated and then do a massive revision – doesn't work when your subject matter evolves faster than your review cycles.

The constraint: councils have one week to prepare their module whilst also learning the previous module's content. They need to review module specifications against current technology landscapes, update what's stale, maintain pedagogical coherence, and propagate changes forward so future modules don't contradict the updates. Oh, and these are volunteers with day jobs.

That's the actual problem. Not curriculum maintenance in general – curriculum maintenance under aggressive time constraints with rotating responsibility and rapidly obsolescing subject matter.

## What Rhea Does (Specifically)

Rhea automates the tedious research and synthesis work whilst keeping human judgment in the decision loop. It doesn't generate curriculum from scratch – there's an expert-designed baseline. Instead, it proposes contextual updates and lets councils accept, reject, or modify them under time pressure.

The operational model is cleverer than it first appears: **cascade pattern maintenance**. Councils review their immediate module (n) intensively whilst the tool propagates contextual updates to future modules (n+1, n+2, n+3...). Those propagated updates become baseline specifications for the next council, who then review *their* module intensively and cascade forward again.

It's temporal load-balancing. Each module eventually gets thorough human review when its turn comes, whilst automation maintains broad coherence in the meantime. You're distributing deep attention across iterations rather than trying to review everything simultaneously under brutal time constraints.

## How It Actually Works

Rhea has two main workflows:

### Metis: Standalone Module Generation

Simple, focused workflow for single modules:

1. **File Upload**: Drag and drop three XML files (projects.xml, skills.xml, research.xml)
2. **Structured Context**: Form fields for module duration, cohort size, experience levels, technologies, delivery date
3. **Optional Research**: Enable web search to verify current best practices and technology states
4. **Generation**: Claude with LangChain generates comprehensive module specification
5. **Validation & Retry**: Automatic schema validation with up to 3 retry attempts if validation fails
6. **Download**: Export complete module specification as XML

The structured form design eliminates vague inputs – you provide specific, actionable context that the AI can actually use.

### Themis: Multi-Module Course Building

More elaborate workflow for complete courses:

1. **Course Configuration**: Define course identity, duration, cohort size, and pedagogical constraints
2. **Arc Planning**: Design thematic arcs that group related modules
3. **Module Planning**: Organise individual modules within arcs with learning progression
4. **Structure Review**: See full course structure before generation
5. **AI Generation**: Claude generates detailed course structure with module summaries and progression
6. **Export Options**: Download course overview or structure for further refinement

Both workflows enforce rigour through structured inputs. No rambling chat – clear questions with specific answers.

## Technical Stack (And Why These Choices)

**SvelteKit** for the application layer. Provides server-side rendering, proper API routes for LLM calls, file handling infrastructure. Chose this over pure client-side because you need controlled LLM orchestration server-side, not exposing API keys in browser.

**LangChain + Claude** for LLM orchestration. LangChain abstracts retry logic, tool integration (for web search during research phase), structured output parsing (for XML generation), and chain-of-thought patterns. Claude Sonnet 4.5 for the actual intelligence – extended context windows handle multiple module specifications plus research results without truncation.

**Node.js 20+** runtime with native TypeScript support via SvelteKit. Modern development experience with established ecosystem.

**Zod** for runtime validation. All API requests validated against schemas; generated modules validated against content requirements (minimum objectives, research topics, project briefs). Type safety from request to response.

**XML for curriculum specifications** maintaining compatibility with existing baseline tooling and expert-designed foundations.

## Current State (Brutally Honest Version)

**What Works:**

- **Full Metis workflow**: Upload XML inputs, provide context, enable research, generate complete module specifications with validation
- **Themis course structure generation**: Multi-step workflow creating detailed course structures with arcs and module planning
- **Web research integration**: LangChain tool calling with curated domain list (vendor docs, GitHub, Stack Overflow, academic sources)
- **SSE streaming**: Real-time progress updates during generation via server-sent events
- **Validation & retry**: Automatic schema validation with up to 3 retry attempts on validation failure
- **API endpoints**: Both Metis and Themis have working `/api/{workflow}/generate` endpoints
- **State management**: Persistent stores with localStorage backup for workflow state
- **Error handling**: Typed error classes and centralized error state

**What's Planned:**

- **Individual module generation in Themis**: Currently generates course structure; needs module-level generation
- **Tethys arc management**: Standalone arc creation and editing between course and module levels
- **Diff views**: Side-by-side comparison for reviewing AI-proposed updates
- **Provenance tracking UI**: Visual representation of change history and confidence levels
- **Export/preview (Theia)**: Human-readable formats (Markdown, HTML, PDF) at various detail levels

The core intelligence is working. Research, generation, validation – all functional. The gap is workflow completeness and review tooling.

## Why This Approach Is Actually Clever

**Baseline + automation beats pure generation**. You're not asking AI to invent pedagogy from scratch (terrifying). You're asking it to propose updates to known-good foundations (tractable). Massive risk reduction.

**Cascade pattern acknowledges reality**. Humans can't review everything in available time, so you distribute attention across iterations. Each module eventually gets scrutiny; automation maintains coherence between those review points.

**Structured inputs over conversational ambiguity**. Form fields force precision. No meandering dialogue about what the council "probably meant" – clear questions with specific answers.

**Time-boxed cycles enable rapid iteration**. Three-week modules mean you'll discover whether the cascade pattern works or creates compound drift problems quickly. Built-in error correction through frequent touchpoints.

## The Design Challenge (Because There Always Is One)

Compound drift. Module n gets careful human review. Modules n+1, n+2, n+3 get AI-generated updates with minimal human scrutiny. Next iteration, council reviews n+1 (which was AI-generated last time) and cascades to n+2, n+3, n+4 (also AI-generated previously). How much content eventually becomes accumulated AI interpretations rather than expert-designed pedagogy?

This is why the MVP focuses hard on provenance tracking, diff views, and cascade checkpoints. You need visibility into what's changed, confidence calibration about automated updates, and mechanisms for councils to spot-check cascaded content without derailing their one-week timeline. The cascade pattern only works if the checkpoints are meaningful.

## What Success Looks Like

Councils complete their one-week preparation window without existential panic. Module specifications stay current with technology landscapes. Students don't encounter blatantly outdated content. Compound drift remains detectable and manageable. The tool reduces cognitive load rather than adding coordination overhead.

Not "revolutionary AI-powered education" – just competent automation of tedious administrative work so humans can focus on actual pedagogy and teaching.

That's what it does. That's why it exists. That's how it works.