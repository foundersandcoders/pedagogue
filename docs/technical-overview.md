# Technical Overview

## Architecture

Pedagogue is built with:

- **SvelteKit** - Application framework with server-side rendering and API routes
- **Node.js** - Runtime environment
- **LangChain + Claude** - AI orchestration and generation
- **Zod** - Runtime validation and type safety
- **XML** - Curriculum data format

## Project Structure

```
pedagogue/
├── src/
│   ├── routes/              # SvelteKit pages and API endpoints
│   │   ├── metis/          # Module Generator workflow
│   │   ├── themis/           # Course Builder workflow
│   │   └── api/            # Generation endpoints
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── factories/      # Agent & prompt factories
│   │   ├── schemas/        # Validation (Zod, XML)
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # Utilities
│   │   └── config/         # Configuration
│   └── data/
│       ├── templates/      # Output schema definitions
│       └── modules/        # Test data
├── docs/                    # Technical documentation
└── .claude/                 # AI assistant context
```

## Key Components

### Module Generator (Metis)

**Purpose:** Generate standalone module specifications

**Flow:**
1. Upload XML inputs (projects, skills, research)
2. Provide structured context (duration, cohort size, experience levels)
3. Optional: Enable web research for current best practices
4. AI generates complete module with validation
5. Download XML specification

**Implementation:**
- UI: `src/routes/metis/update/+page.svelte`
- API: `src/routes/api/metis/update/+server.ts`
- Prompt: `src/lib/factories/prompts/metisPromptFactory.ts`
- Validation: `src/lib/schemas/moduleValidator.ts`

### Course Builder (Themis)

**Purpose:** Generate multi-module courses with thematic arcs

**Flow:**
1. Configure course (identity, logistics, learners)
2. Plan thematic arcs (high-level themes)
3. Plan modules within each arc
4. AI generates detailed structure
5. Review and refine structure
6. Generate individual modules (not yet implemented)
7. Export complete course (not yet implemented)

**Implementation:**
- UI: `src/routes/themis/generate/+page.svelte`
- API: `src/routes/api/themis/generate/+server.ts`
- Prompt: `src/lib/factories/prompts/themisPromptFactory.ts`
- Components: `src/lib/components/themis/`

## AI Integration

### Client Factory Pattern

```typescript
// Basic client
const client = createChatClient({ apiKey, temperature: 0.7 });

// With web search
const clientWithSearch = withWebSearch(createChatClient({ apiKey }));

// Streaming
const streamingClient = createStreamingClient({ apiKey });
```

Located in: `src/lib/factories/agents/agentClientFactory.ts`

### Prompt Construction

Prompts are built using composable sections:

```typescript
const prompt = buildGenerationPrompt({
  inputFiles: { projects, skills, research },
  structuredInput: formData,
  retryCount: 0,
  validationErrors: [],
  enableResearch: true
});
```

Shared components (research instructions, retry feedback, etc.) are in `src/lib/utils/prompt/shared-components.ts`

### Response Processing

1. **Extract** - Pull content from Claude response
2. **Clean** - Remove comments, fix formatting
3. **Validate** - Check against schema requirements
4. **Retry** - If validation fails, automatically retry with feedback (max 3 attempts)
5. **Enhance** - Add cardinality attributes

Located in: `src/lib/utils/validation/responseParser.ts`

### Streaming & Progress

Server-Sent Events (SSE) provide real-time feedback:
- Research in progress
- Generation started
- Validation status
- Retry attempts
- Success/failure

Located in: `src/lib/utils/model/sseHandler.ts`

## State Management

### Store Pattern

```typescript
// Basic workflow store
export const currentStep = createWorkflowStore(1, 6);

// With persistence
export const courseData = persistedStore('course-data', defaultValue);
```

**Utilities:**
- Workflow steps: `src/lib/utils/state/metisWorkflowStep.ts`
- localStorage persistence: `src/lib/utils/state/persistenceUtils.ts`

### Store Locations

- **Module Generator**: `src/lib/stores/metisStores.ts`
- **Course Builder**: `src/lib/stores/themisStores.ts`
- **Errors**: `src/lib/stores/errorStores.ts`

## Validation

### Runtime (Zod)

API requests/responses validated at runtime:

```typescript
const result = GenerateRequestSchema.safeParse(requestData);
if (!result.success) {
  return json({ error: formatZodError(result.error) }, { status: 400 });
}
```

Located in: `src/lib/schemas/apiValidator.ts`

### Module Schema (XML)

Generated modules must pass structural validation:
- Minimum 3 module objectives
- Minimum 5 primary research topics
- Minimum 2 project briefs
- Minimum 3 skills per project brief
- Minimum 3 examples per project brief
- Minimum 2 project twists

Located in: `src/lib/schemas/moduleValidator.ts`

## Configuration

### Research Domains

Web search restricted to trusted domains:
- AI platforms (anthropic.com, openai.com, huggingface.co)
- Documentation sites (langchain.com, python.org)
- Developer resources (github.com, stackoverflow.com)
- Academic sources (arxiv.org, acm.org, ieee.org)

Located in: `src/lib/config/researchDomains.ts`

### Tech Stack

Pre-defined technology options for structured inputs.

Located in: `src/lib/config/techStack.ts`

## Recent Refactoring (October 2025-10-20)

Major architectural improvements completed across 4 phases:

**Phase 1: Foundation**
- Extracted config duplication
- Clarified schema architecture
- Added Zod type safety

**Phase 2: AI Utilities**
- Factory pattern for AI clients
- Centralized response parsing
- Extracted prompt builders
- SSE streaming handler
- Unified retry orchestration

**Phase 3: Composability**
- Reusable prompt components

**Phase 4: Quality**
- Store utilities with auto-persistence
- Error handling infrastructure

**Impact:** 670+ lines eliminated, better separation of concerns, consistent patterns throughout.

See `/docs/refactoring-progress.md` for full details.

## Error Handling

Typed error classes with user-friendly messages:

```typescript
throw new ValidationError(
  'Generated module missing required sections',
  validationErrors
);
```

Centralized error state via `errorStores.ts` with UI components (`ErrorAlert.svelte`, `ErrorBoundary.svelte`).

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Security:** Never commit `.env` to version control (already in `.gitignore`)

## Testing Approach

Currently manual testing via UI workflows. Automated tests not yet implemented.

**Validation testing:**
- Upload test files from `src/data/test-files/`
- Generate with research enabled/disabled
- Verify validation catches malformed output
- Test retry logic with intentionally invalid inputs

## Deployment

SvelteKit can deploy to:
- Vercel
- Netlify
- Node.js servers
- Cloudflare Workers (with adapter)

See [SvelteKit adapters documentation](https://kit.svelte.dev/docs/adapters) for platform-specific instructions.

**Production considerations:**
- Set `ANTHROPIC_API_KEY` in hosting platform's environment variables
- Configure rate limiting (not currently implemented)
- Monitor API costs (approximately £0.15-£0.30 per module with research)

## Further Reading

- [Refactoring Progress](/docs/refactoring-progress.md) - Recent architectural changes
- [Architecture Decisions](/docs/architecture-decisions.md) - Historical context and rationale
- [Schema Design](/docs/changelog-schema-design.md) - Change tracking and provenance
- [Roadmaps](/.claude/docs/roadmaps/) - Feature status and priorities
