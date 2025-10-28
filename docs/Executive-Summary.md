# Rhea: What It Actually Does

## Executive Summary

Rhea is a curriculum maintenance tool that keeps AI engineering course materials current whilst councils rotate every three weeks. It takes existing expert-designed module specifications, researches what's changed in the technology landscape, and generates updated versions for council review. The tool automates research and synthesis—the time-consuming bits—whilst keeping human judgment in the decision loop. Councils review their assigned module intensively in one week, approve or modify AI-proposed updates, then propagate contextual changes forward through subsequent modules. This cascade pattern distributes deep review attention across iterations rather than attempting comprehensive revision under brutal time constraints.

## The Problem (Or: Why This Exists At All)

You're running a peer-led AI Engineering course with rotating three-week administration councils. Technology changes monthly. Module specifications written in September are questionable by October and actively misleading by December. Traditional curriculum maintenance – where you wait until everything's outdated and then do a massive revision – doesn't work when your subject matter evolves faster than your review cycles.

The constraint: councils have one week to prepare their module whilst also learning the previous module's content. They need to review module specifications against current technology landscapes, update what's stale, maintain pedagogical coherence, and propagate changes forward so future modules don't contradict the updates. Oh, and these are volunteers with day jobs.

That's the actual problem. Not curriculum maintenance in general – curriculum maintenance under aggressive time constraints with rotating responsibility and rapidly obsolescing subject matter.

## What Rhea Does (Specifically)

Rhea automates the tedious research and synthesis work whilst keeping human judgment in the decision loop. It doesn't generate curriculum from scratch – there's an expert-designed baseline. Instead, it proposes contextual updates and lets councils accept, reject, or modify them under time pressure.

The operational model: **cascade pattern maintenance**. Councils review their immediate module (n) intensively whilst the tool propagates contextual updates to future modules (n+1, n+2, n+3...). Those propagated updates become baseline specifications for the next council, who then review *their* module intensively and cascade forward again.

This is temporal load-balancing. Each module eventually gets thorough human review when its turn comes, whilst automation maintains broad coherence in the meantime. Deep attention gets distributed across iterations rather than attempting simultaneous comprehensive review under brutal time constraints.

## How It Actually Works

Rhea has two main workflows:

**Metis** generates standalone modules through:
1. File upload (projects.xml, skills.xml, research.xml)
2. Structured context form (duration, cohort size, technologies, constraints)
3. Optional web research for current best practices
4. AI generation with validation and automatic retry (up to 3 attempts)
5. XML export of complete module specification

**Themis** builds multi-module courses through:
1. Course configuration (identity, duration, pedagogical constraints)
2. Arc planning (thematic groupings of modules)
3. Module organisation within arcs
4. Structure review before generation
5. AI generation of detailed course structure
6. Course-aware module generation with real-time progress tracking
7. Export complete courses (Markdown, HTML, or JSON)

Both workflows enforce rigour through structured inputs – clear questions with specific answers, not rambling chat.

## Technical Stack (And Why These Choices)

**SvelteKit** for the application layer. Provides server-side rendering, proper API routes for LLM calls, file handling infrastructure. Server-side orchestration prevents exposing API keys in browser whilst maintaining clean client-side interactions.

**LangChain + Claude** for LLM orchestration. LangChain abstracts retry logic, tool integration (for web search), structured output parsing, and chain-of-thought patterns. Claude Sonnet 4.5 for intelligence – extended context windows handle multiple module specifications plus research results.

**Node.js 20+** with TypeScript via SvelteKit. Native TypeScript support, established ecosystem, modern development experience.

**Zod** for runtime validation. API requests and generated modules validated against schemas. Type safety throughout.

**XML** for curriculum specifications, maintaining compatibility with existing baseline tooling.

## Why This Approach Works

**Baseline + automation beats pure generation**. The tool proposes updates to known-good foundations rather than inventing pedagogy from scratch. Expert-designed curriculum provides quality scaffolding; automation provides continuous contextual adaptation.

**Cascade pattern acknowledges operational reality**. Humans can't review everything in available time, so attention gets distributed across iterations. Each module receives thorough scrutiny when its turn comes; automation maintains coherence between those review points.

**Structured inputs over conversational ambiguity**. Form fields force precision. Clear questions with specific answers eliminate meandering dialogue about what councils "probably meant."

**Time-boxed cycles enable rapid iteration**. Three-week modules mean quick discovery of what works and what needs adjustment. Built-in error correction through frequent touchpoints.

## Implementation Focus: Managing Compound Updates

The cascade pattern introduces a specific technical challenge worth solving well: tracking provenance across multiple update iterations. Module n+3 might contain material that's been AI-updated twice without direct human review. This isn't a flaw—it's the deliberate trade-off that makes one-week preparation windows feasible.

The MVP implementation addresses this directly:

**Provenance tracking**: Every section maintains lineage metadata showing when it was last human-reviewed versus AI-updated. Councils see exactly what's changed and who/what changed it.

**Diff views**: Side-by-side comparison between current and previous versions makes spotting substantive changes trivial. No hunting through XML looking for subtle modifications.

**Cascade checkpoints**: The system flags sections that have accumulated multiple AI updates without human review. Councils can prioritise spot-checking these flagged areas within their time constraints.

**Confidence calibration**: AI-proposed updates include confidence scores. High-confidence changes ("Keras 2 → Keras 3 API updates") get quick acceptance workflows. Low-confidence changes ("this pedagogical approach might need revision") demand human attention.

**Quick accept / must review classification**: Automatic categorisation of changes based on confidence and scope. Councils spend time on ambiguous decisions, not rubber-stamping obvious updates.

**Student feedback integration**: Rapid error detection through structured student input. Problems surface within days, not months.

These features turn the cascade pattern from "hope it works" into "managed process with explicit checkpoints."

## What Success Looks Like

Councils complete their one-week preparation window with clear understanding of what's changed and why. Module specifications stay current with technology landscapes. Students don't encounter blatantly outdated content. The cascade pattern maintains coherence whilst distributing review workload across iterations. The tool reduces cognitive burden rather than adding coordination overhead.

Competent automation of tedious administrative work, letting humans focus on actual pedagogy and teaching. That's the goal.