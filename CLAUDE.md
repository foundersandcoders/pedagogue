# Instructions for AI Assistants

## Critical Files: Do Not Edit Without Permission

- **`src/data/templates/outputSchema.xml`** - The authoritative module output schema. Changes affect validation and generation prompts.
- **Prompt factories** - When modifying prompt builders in `src/lib/factories/prompts/`, preserve existing prompt logic until discussing changes with the user.

## Project Architecture Overview

### Two Main Workflows

**Metis (Module Generator)** - `/metis/update`
- Standalone module generation
- Upload XML inputs (projects, skills, research)
- Structured form for context
- AI generates complete module specification
- Entry point: `src/routes/metis/update/+page.svelte`
- API: `src/routes/api/metis/update/+server.ts`

**Themis (Course Builder)** - `/themis/generate`
- Multi-module course generation with thematic arcs
- Six-step workflow: Config → Arc Planning → Module Planning → Structure Review → Generation → Export
- AI generates course structure, then individual modules
- Entry point: `src/routes/themis/generate/+page.svelte`
- API: `src/routes/api/themis/generate/+server.ts`

### Architecture Patterns (Post-Refactoring)

**Factories & Utilities** (completed Oct 2025-10-20)
- **Agent factories**: `src/lib/factories/agents/agentClientFactory.ts` - Create Claude clients with consistent config
- **Prompt factories**: `src/lib/factories/prompts/{metisPromptFactory,themisPromptFactory}.ts` - Build generation prompts
- **Shared prompt components**: `src/lib/utils/prompt/shared-components.ts` - Reusable prompt sections
- **Validation**: `src/lib/schemas/{apiValidator,moduleValidator}.ts` - Zod schemas for API boundaries, XML validation
- **Response parsing**: `src/lib/utils/validation/responseParser.ts` - Extract and clean AI responses
- **SSE streaming**: `src/lib/utils/model/sseHandler.ts` - Server-sent events for progress feedback
- **Retry logic**: `src/lib/utils/model/retryHandler.ts` - Unified retry orchestration

**State Management**
- **Stores**: `src/lib/stores/{metisStores,themisStores}.ts` - Workflow state with localStorage persistence
- **Utilities**: `src/lib/utils/state/{metisWorkflowStep,persistenceUtils}.ts` - Reusable store patterns

**Error Handling**
- **Types**: `src/lib/types/error.ts` - Typed error classes
- **Store**: `src/lib/stores/errorStores.ts` - Centralized error state
- **Components**: `src/lib/components/errors/{ErrorBoundary,ErrorAlert}.svelte` - Error UI

### Key Constraints

1. **Schema Validation**: All generated modules must pass `moduleValidator.ts` checks (min 3 objectives, min 5 research topics, etc.)
2. **Retry Logic**: Generation automatically retries up to 3 times on validation failure
3. **Web Research**: Configured domains in `src/lib/config/researchDomains.ts` - do not modify without user approval
4. **British English**: Prefer British spellings and phrasing in all generated content
5. **Peer-Led Focus**: Content should be written for learners, not facilitators (avoid "facilitators should..." phrasing)

### When Making Changes

**Adding New Features**
- Reuse existing patterns (factories, utilities)
- Follow Zod validation pattern for new API endpoints
- Use `persistedStore()` for new state that should survive page reloads
- Implement error handling using typed error classes

**Modifying Prompts**
- Use composable sections from `shared-components.ts` where possible
- Update both Metis and Themis prompt factories if changes apply to both
- Test with research enabled/disabled

**Debugging**
- Check `/docs/refactoring-progress.md` for recent architectural changes
- Consult `/docs/architecture-decisions.md` for historical context
- Review roadmaps in `.claude/docs/roadmaps/` for feature status

### File Locations Quick Reference

```
src/
├── routes/
│   ├── metis/update/         # Metis UI
│   ├── themis/generate/      # Themis UI
│   └── api/
│       ├── metis/update/     # Metis generation endpoint
│       └── themis/generate/  # Themis structure endpoint
├── lib/
│   ├── components/
│   │   ├── metis/           # Metis-specific components
│   │   ├── themis/          # Themis-specific components
│   │   └── errors/          # Error handling UI
│   ├── factories/           # Agent & prompt factories
│   ├── schemas/             # Validation (Zod, XML)
│   ├── stores/              # State management
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Utilities (validation, state, model)
│   └── config/              # Configuration (domains, tech stack)
└── data/
    ├── templates/           # outputSchema.xml (CRITICAL)
    └── modules/             # Test data
```

### Documentation

- **User guide**: `README.md` - How to use Rhea
- **Technical docs**: `/docs/` - Architecture, design decisions, implementation details
- **Roadmaps**: `.claude/docs/roadmaps/` - Feature status and priorities