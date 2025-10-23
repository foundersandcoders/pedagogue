# Rhea: What It Actually Does

## The Problem (Or: Why This Exists At All)

You're running a peer-led AI Engineering course with rotating three-week administration councils. Technology changes monthly. Module specifications written in September are questionable by October and actively misleading by December. Traditional curriculum maintenance – where you wait until everything's outdated and then do a massive revision – doesn't work when your subject matter evolves faster than your review cycles.

The constraint: councils have one week to prepare their module whilst also learning the previous module's content. They need to review module specifications against current technology landscapes, update what's stale, maintain pedagogical coherence, and propagate changes forward so future modules don't contradict the updates. Oh, and these are volunteers with day jobs.

That's the actual problem. Not curriculum maintenance in general – curriculum maintenance under aggressive time constraints with rotating responsibility and rapidly obsolescing subject matter.

## What Rhea Does (Specifically)

Rhea automates the tedious research and synthesis work whilst keeping human judgment in the decision loop. It doesn't generate curriculum from scratch – there's an expert-designed baseline. Instead, it proposes contextual updates and lets councils accept, reject, or modify them under time pressure.

The operational model is cleverer than it first appears: **cascade pattern maintenance**. Councils review their immediate module (n) intensively whilst the tool propagates contextual updates to future modules (n+1, n+2, n+3...). Those propagated updates become baseline specifications for the next council, who then review *their* module intensively and cascade forward again.

It's temporal load-balancing. Each module eventually gets thorough human review when its turn comes, whilst automation maintains broad coherence in the meantime. You're distributing deep attention across iterations rather than trying to review everything simultaneously under brutal time constraints.

## How It Actually Works (The Six Stages)

Not ceremonial workflow steps – actual epistemic scaffolding:

1. **File Ingestion**: Upload XML-structured `arc.xml` (module specifications) and `next-step.xml` (curriculum context/constraints)
2. **Initial Analysis**: LLM reads and structures its understanding of learning outcomes, project examples, and pedagogical constraints
3. **Structured Questioning**: Council provides context via predefined form fields – when does this module start? What technologies are priorities? What constraints matter? No free-form chat; structured inputs enforce clarity by design
4. **Understanding Confirmation**: Verify the LLM actually comprehends what you've told it before proceeding to research
5. **Deep Research**: The substantial bit. LLM investigates current state of referenced technologies, frameworks, pedagogical approaches. Uses web search, extended thinking, whatever's necessary to understand what's changed since baseline was written
6. **Module Generation**: Output updated specifications in predefined (but distinct from input) XML format

The workflow forces rigour through structure. You're not hoping councils will provide useful context in rambling chat messages – you're designing interfaces that make vague inputs impossible.

## Technical Stack (And Why These Choices)

**SvelteKit** for the application layer. Provides server-side rendering, proper API routes for LLM calls, file handling infrastructure. Chose this over pure client-side because you need controlled LLM orchestration server-side, not exposing API keys in browser.

**LangChain + Claude** for LLM orchestration. LangChain abstracts retry logic, tool integration (for web search during research phase), structured output parsing (for XML generation), and chain-of-thought patterns. Claude (Sonnet 4) for the actual intelligence – extended context windows matter when you're ingesting multiple module specifications plus research results.

**Deno runtime** (apparently, based on recent architecture discussions). Native TypeScript, built-in security model, modern stdlib. Marginally controversial but defensible for a project this size.

**XML for curriculum specifications** because that's what the existing baseline uses. Not starting a format war – maintaining compatibility with established tooling and expert-designed foundations.

## Current State (Brutally Honest Version)

The UI infrastructure is surprisingly solid. File upload with drag-and-drop, XML parsing with proper error handling, state management through Svelte stores, accessibility considerations. Someone actually thought about user experience here.

What's missing: **all the intelligence**. The LangChain integration exists in `package.json` as decorative JSON. No API routes. No streaming responses. No research capabilities. No module generation. The application can accept files, parse them, display pretty workflow visualisations, and then... stop.

Phase 5 (Deep Research) is the entire reason this tool justifies its existence. Without current research, you're just reformatting existing modules with extra steps. That's the critical path: LangChain integration → web search tooling → structured synthesis → XML generation. Everything else is infrastructure to support that.

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