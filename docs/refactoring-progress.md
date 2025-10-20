# Architectural Refactoring Progress

**Started:** 2025-10-20
**Current Branch:** `feat/new-course-generation`
**Last Commit:** `fea0d91` - "refactor: Phase 1 - extract config, clarify schemas, add Zod validation"

## Overview

Addressing architectural issues identified in code review focusing on:
- Duplication elimination
- Separation of concerns
- Type safety improvements
- Consistent patterns

## Completed Tasks ✅

### Phase 1: Foundation (Low-risk, High-value)

#### ✅ Task 1: Extract Research Domains Duplication
**Commit:** `fea0d91`
**Files Created:**
- `src/lib/config/research-domains.ts` - Centralized AI research domains allowlist

**Files Modified:**
- `src/routes/api/generate/+server.ts` - Import from config
- `src/routes/api/course/structure/+server.ts` - Import from config

**Impact:** Eliminated 40-line duplication between two API routes. Single source of truth for web search domains.

---

#### ✅ Task 3: Clarify Schema Architecture
**Commit:** `fea0d91`
**Files Modified:**
- `src/lib/moduleSchema.ts` - Added @deprecated notice explaining it's legacy (lowercase tags)
- `src/lib/schemas/moduleValidator.ts` - Added documentation as AUTHORITATIVE validator

**Key Finding:** `moduleSchema.ts` defines OLD format (`<module>`, `<objectives>`) that's no longer used. Current format is `<Module>`, `<LearningObjectives>` from `src/data/templates/outputSchema.xml`.

**Decision:** Kept legacy file with clear deprecation rather than deletion (historical reference).

---

#### ✅ Task 7: Add Zod Schemas and Strengthen Type Safety
**Commit:** `fea0d91`
**Dependencies Added:** `zod@^3.25.76`

**Files Created:**
- `src/lib/validation/api-schemas.ts` - Comprehensive Zod schemas for all API boundaries
  - `StructuredInputSchema` - Module generation structured input
  - `GenerateRequestSchema` - Module generation request
  - `GenerateResponseSchema` - Module generation response
  - `CourseStructureGenerationRequestSchema` - Course structure request
  - `CourseStructureGenerationResponseSchema` - Course structure response
  - Helper functions: `safeValidate()`, `formatZodError()`

**Files Modified:**
- `src/lib/stores.ts` - Import `StructuredInput` type from validation schemas
- `src/routes/api/generate/+server.ts` - Runtime validation with Zod
- `src/routes/api/course/structure/+server.ts` - Runtime validation with Zod

**Impact:**
- Replaced `Record<string, any>` with properly typed schemas
- Runtime validation catches malformed requests with user-friendly errors
- Compile-time type inference from Zod schemas

---

### Phase 2: Extract AI Utilities (In Progress) 🔄

#### ✅ Task 2a: Extract AI Client Factory and Response Parser
**Status:** Extraction complete, integration pending

**Files Created:**
- `src/lib/generation/ai/client-factory.ts`
  - `createChatClient(options)` - Basic client with consistent config
  - `withWebSearch(client)` - Add web search tool binding
  - `createStreamingClient(options)` - Streaming-enabled client
  - `DEFAULT_MODEL_CONFIG` - Centralized model settings (Sonnet 4.5, temp 0.7, 16k tokens)

- `src/lib/generation/ai/response-parser.ts`
  - `extractTextContent(content)` - Handle array/string responses from Claude
  - `extractModuleXML(content)` - Extract, clean, sanitize, add cardinality to Module XML
  - `parseCourseStructureResponse(text)` - Parse JSON course structure from AI response

**Next Step:** Update API routes to use these utilities (see Pending Tasks below)

---

## Pending Tasks 📋

### Phase 2 (Continue): Complete API Route Decomposition

#### 🔄 Task 2b: Update API Routes to Use Extracted Utilities

**Location:** `src/routes/api/generate/+server.ts` (currently 695 lines)

**Changes Needed:**

1. **Import extracted utilities:**
```typescript
import { createStreamingClient, withWebSearch } from '$lib/generation/ai/client-factory.js';
import { extractTextContent, extractModuleXML } from '$lib/generation/ai/response-parser.js';
```

2. **Replace inline client creation** (lines ~362-383):
```typescript
// OLD:
let model = new ChatAnthropic({
  anthropicApiKey: apiKey,
  modelName: 'claude-sonnet-4-5-20250929',
  temperature: 0.7,
  maxTokens: 16384,
  streaming: true
});

if (body.enableResearch) {
  model = model.bindTools([{
    type: 'web_search_20250305',
    // ...
  }]);
}

// NEW:
const model = createStreamingClient({
  apiKey,
  enableResearch: body.enableResearch
});
```

3. **Use extracted parsing functions** - Replace all instances of:
   - Inline `extractTextContent()` implementation → import from response-parser
   - Inline `extractModuleXML()` implementation → import from response-parser

**Similar changes for:** `src/routes/api/course/structure/+server.ts` (lines ~71-88, ~96-103)

**Expected Impact:** Reduce both API routes by ~40-60 lines each

---

#### 🔄 Task 2c: Extract Prompt Builders

**New Files to Create:**

1. `src/lib/generation/prompts/module-prompt-builder.ts`
   - Extract `buildGenerationPrompt()` from generate/+server.ts (lines 128-303)
   - Move `GenerateRequest` interface to this file (or keep in api-schemas)

2. `src/lib/generation/prompts/course-prompt-builder.ts`
   - Extract `buildCourseStructurePrompt()` from course/structure/+server.ts (lines 125-243)

**Expected Impact:** Remove ~175 lines from generate/+server.ts, ~120 lines from course/structure/+server.ts

---

#### 🔄 Task 2d: Extract SSE Streaming Logic

**New File:** `src/lib/generation/streaming/sse-handler.ts`

**Extract from:** `src/routes/api/generate/+server.ts`
- `createSSEStream()` function (lines 310-544)
- SSE encoding logic
- Progress event formatting

**New API:**
```typescript
export function createSSEStream(
  generator: AsyncGenerator<StreamEvent>,
  onError?: (error: Error) => void
): Response
```

**Expected Impact:** Remove ~230 lines from generate/+server.ts

---

#### 🔄 Task 2e: Extract Retry Orchestration

**New File:** `src/lib/generation/orchestration/retry-handler.ts`

**Extract:** Retry loop logic (both streaming and non-streaming versions)

**New API:**
```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    validate: (result: T) => ValidationResult;
    onRetry?: (attempt: number, errors: string[]) => void;
  }
): Promise<T>
```

**Expected Impact:** Consolidate duplicate retry logic from both generate modes

---

### Phase 3: Improve Prompt Composability

#### 🔄 Task 6: Break Prompts into Composable Sections

**Work with:** Files created in Task 2c

**In `module-prompt-builder.ts`:**
```typescript
// Break 175-line template into functions:
- buildOverviewSection(role, task)
- buildModuleInputSection(data)
- buildTaskApproachSection(options, errors?)
- buildTaskCriteriaSection(enableResearch)
- buildTaskStepsSection(enableResearch)
- buildTaskGuidelinesSection()

// Main function becomes:
export function buildGenerationPrompt(body, errors?) {
  return [
    buildOverviewSection(),
    buildModuleInputSection(body),
    buildTaskSection(body, errors),
    getSchemaRequirements()
  ].join('\n\n');
}
```

**Create:** `src/lib/generation/prompts/components.ts`
- Shared components used by both module and course prompts
- `buildRetrySection(errors)`
- `buildResearchInstructionsSection(domains)`
- `buildConditionalSection(condition, content)`

**Expected Impact:** Easier prompt testing, modification, and maintenance

---

### Phase 4: Quality Improvements

#### 🔄 Task 5: Store Consolidation Utilities

**New Files:**
- `src/lib/store-utilities/workflow-step.ts`
  - `createWorkflowStore(initialStep)` - Reusable workflow step management

- `src/lib/store-utilities/persistence.ts`
  - `withLocalStorage(store, key)` - Auto-save wrapper for stores
  - `loadFromLocalStorage(key, defaultValue)` - Typed loader with error handling

**Files to Refactor:**
- `src/lib/stores.ts` - Use workflow and persistence utilities
- `src/lib/courseStores.ts` - Use workflow and persistence utilities
- Remove duplicate localStorage logic (courseStores.ts lines 115-206)

**Pattern:** Extract shared utilities, NOT merge stores (domains are separate)

---

#### 🔄 Task 8: Error Handling Consistency

**New Files:**

1. `src/lib/errors/generation-errors.ts`
   - Error classes: `GenerationError`, `ValidationError`, `NetworkError`
   - Include error codes, user messages, retry hints

2. `src/lib/stores/error-store.ts`
   - Centralized error state: `setError()`, `clearError()`, `hasError()`

3. `src/lib/components/ErrorBoundary.svelte`
   - Catches child component errors
   - Consistent error UI

4. `src/lib/components/ErrorAlert.svelte`
   - Reusable error display
   - Severity levels, action buttons

**Files to Update:**
- `src/routes/module/new/+page.svelte` - Wrap in ErrorBoundary
- `src/routes/course/new/+page.svelte` - Wrap in ErrorBoundary
- Both API routes - Use typed errors

---

## Architectural Decisions

### Why These Patterns?

1. **Config Extraction (Task 1)**
   - **Problem:** 40-line duplication meant updates required changing 2 files
   - **Solution:** Single source of truth in `config/`
   - **Trade-off:** None - pure win

2. **Schema Clarification (Task 3)**
   - **Problem:** Two validators with same function names, unclear which is authoritative
   - **Solution:** Deprecation notices + clear documentation
   - **Decision:** Keep legacy file (not delete) for historical reference
   - **Trade-off:** Minimal - one extra file with clear "DO NOT USE" marker

3. **Zod Validation (Task 7)**
   - **Problem:** `Record<string, any>` bypasses TypeScript safety, no runtime validation
   - **Solution:** Zod schemas with type inference + runtime checks
   - **Trade-off:** Added dependency (zod), slight bundle increase, but massive type safety win
   - **Alternative Considered:** Manual validation - rejected due to lack of type inference

4. **AI Utilities Extraction (Task 2a)**
   - **Problem:** Client setup duplicated, model config scattered
   - **Solution:** Factory functions with consistent defaults
   - **Pattern:** Composition over inheritance (`withWebSearch` adds capability)
   - **Trade-off:** More files, but each has single responsibility

### What We're NOT Doing (And Why)

1. **NOT merging stores.ts and courseStores.ts**
   - Different domains (module vs course generation)
   - Merging would couple unrelated workflows
   - Instead: Extract shared patterns into utilities

2. **NOT deleting moduleSchema.ts**
   - Historical reference for old data format
   - Clear deprecation is safer than deletion
   - Can delete later if truly unused for 3+ months

3. **NOT using a single God validator**
   - Keep validation close to usage
   - Zod schemas colocated with types
   - Validator utilities separate from business logic

---

## Testing Strategy

After each task:

1. ✅ **Build check:** `npm run build`
2. 🧪 **Manual testing:**
   - Module generation: Upload files → generate → validate
   - Course generation: Config → arcs → modules → structure
   - Test with research enabled/disabled
3. 💾 **Persistence:** Check localStorage survives reload
4. ❌ **Error scenarios:** Invalid XML, API failures, validation errors

---

## File Structure (After Completion)

```
src/lib/
├── config/
│   └── research-domains.ts          ✅ DONE
├── validation/
│   └── api-schemas.ts                ✅ DONE
├── generation/
│   ├── ai/
│   │   ├── client-factory.ts         ✅ DONE (not integrated)
│   │   └── response-parser.ts        ✅ DONE (not integrated)
│   ├── prompts/
│   │   ├── module-prompt-builder.ts  📋 TODO
│   │   ├── course-prompt-builder.ts  📋 TODO
│   │   └── components.ts             📋 TODO
│   ├── streaming/
│   │   └── sse-handler.ts            📋 TODO
│   └── orchestration/
│       └── retry-handler.ts          📋 TODO
├── store-utilities/
│   ├── workflow-step.ts              📋 TODO
│   └── persistence.ts                📋 TODO
├── errors/
│   └── generation-errors.ts          📋 TODO
├── stores/
│   └── error-store.ts                📋 TODO
└── components/
    ├── ErrorBoundary.svelte          📋 TODO
    └── ErrorAlert.svelte             📋 TODO
```

---

## Next Session: Where to Start

**Immediate next step:** Task 2b - Integrate extracted AI utilities

1. Open `src/routes/api/generate/+server.ts`
2. Import from `$lib/generation/ai/client-factory.js`
3. Import from `$lib/generation/ai/response-parser.js`
4. Replace inline implementations (see Task 2b details above)
5. Test build + manual generation
6. Repeat for `src/routes/api/course/structure/+server.ts`
7. Commit: "refactor: integrate AI utilities into API routes"

**After that:** Continue with Task 2c (extract prompt builders)

---

## Estimated Time Remaining

- ⏱️ Task 2b (integrate utilities): 1 hour
- ⏱️ Task 2c (extract prompts): 2 hours
- ⏱️ Task 2d (SSE streaming): 2 hours
- ⏱️ Task 2e (retry logic): 1.5 hours
- ⏱️ Task 6 (prompt composability): 2 hours
- ⏱️ Task 5 (store utilities): 3 hours
- ⏱️ Task 8 (error handling): 3 hours

**Total remaining:** ~14.5 hours

---

## Git History

```
fea0d91 - refactor: Phase 1 - extract config, clarify schemas, add Zod validation
68bf1f6 - feat(MoGen output): calculate cardinality attributes
769f4fb - chore: update module draft naming conventions
```

---

## Quick Reference: Key Findings

1. **AI_RESEARCH_DOMAINS** was duplicated - now centralized
2. **moduleSchema.ts** is LEGACY - use `schemas/moduleValidator.ts`
3. **Zod validation** catches bad requests before they hit business logic
4. **Client factory** provides consistent model config (Sonnet 4.5, 0.7 temp, 16k tokens)
5. **Response parsing** handles both streaming and non-streaming Claude responses

---

## Status Summary

**✅ Completed:** 3/8 tasks (Tasks 1, 3, 7)
**🔄 In Progress:** 1/8 task (Task 2a complete, 2b-2e pending)
**📋 Pending:** 4/8 tasks (Tasks 5, 6, 8, and Task 4 arc migration - deprioritized)
**Build Status:** ✅ All changes compile
**Branch:** `feat/new-course-generation`
**Safe to /compact:** ✅ Yes
