# Architectural Refactoring Progress

**Started:** 2025-10-20
**Current Branch:** `feat/new-course-generation`

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

### Phase 2: Extract AI Utilities ✅

#### ✅ Task 2a: Extract AI Client Factory and Response Parser
**Commit:** `0413fba`
**Status:** ✅ Complete

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

#### ✅ Task 2b: Integrate AI Utilities into API Routes
**Commit:** `0413fba`
**Status:** ✅ Complete

**Files Modified:**
- `src/routes/api/generate/+server.ts`
  - **Before:** 658 lines (with inline implementations)
  - **After:** 578 lines (using imported utilities)
  - **Reduction:** 80 lines (-12.2%)
  - Removed inline `extractTextContent()` and `extractModuleXML()` functions
  - Replaced inline ChatAnthropic client creation with `createStreamingClient()` and `createChatClient()`
  - Replaced inline web search binding with `withWebSearch()`

- `src/routes/api/course/structure/+server.ts`
  - **Before:** 268 lines (with inline implementations)
  - **After:** 202 lines (using imported utilities)
  - **Reduction:** 66 lines (-24.6%)
  - Removed inline `parseCourseStructureResponse()` function
  - Removed inline text extraction logic (replaced with `extractTextContent()`)
  - Replaced inline ChatAnthropic client creation with `createChatClient()`
  - Replaced inline web search binding with `withWebSearch()`

**Impact:**
- Total code reduction: 146 lines eliminated across both API routes
- Centralized AI client configuration ensures consistency
- Response parsing logic now maintained in single location
- Both streaming and non-streaming paths use same utilities
- Build verification: ✅ Passed (no new warnings or errors)

#### ✅ Task 2c: Extract Prompt Builders
**Commit:** `eed76c6`
**Status:** ✅ Complete

**Files Created:**
- `src/lib/generation/prompts/module-prompt-builder.ts`
  - `buildGenerationPrompt()` - Module generation prompt construction
  - Handles input formatting, research instructions, retry logic, schema requirements

- `src/lib/generation/prompts/course-prompt-builder.ts`
  - `buildCourseStructurePrompt()` - Course structure prompt construction
  - Handles course config, arc structure, module details

**Files Modified:**
- `src/routes/api/generate/+server.ts`
  - **Before:** 578 lines (with inline prompt builder)
  - **After:** 397 lines (using imported builder)
  - **Reduction:** 181 lines (-31.3%)
  - Removed inline `buildGenerationPrompt()` function (180 lines)

- `src/routes/api/course/structure/+server.ts`
  - **Before:** 202 lines (with inline prompt builder)
  - **After:** 82 lines (using imported builder)
  - **Reduction:** 120 lines (-59.4%)
  - Removed inline `buildCourseStructurePrompt()` function (120 lines)

**Impact:**
- Total code reduction: 301 lines eliminated across both API routes
- Prompt construction logic separated from API routing concerns
- Easier to test and modify prompts independently
- Clear separation of concerns (routing vs prompt building)
- Build verification: ✅ Passed (no new warnings or errors)

---

**Impact:**
- Total code reduction: 301 lines eliminated across both API routes
- Prompt construction logic separated from API routing concerns
- Easier to test and modify prompts independently
- Clear separation of concerns (routing vs prompt building)
- Build verification: ✅ Passed (no new warnings or errors)

#### ✅ Task 2d: Extract SSE Streaming Logic
**Commit:** `b1ba39f`
**Status:** ✅ Complete

**Files Created:**
- `src/lib/generation/streaming/sse-handler.ts` (236 lines)
  - `createSSEStream()` - SSE stream creation with validation and retry logic
  - `SSEEvent` types and `SSEEventType` enum for type safety
  - `encodeSSEEvent()` - SSE message formatting helper
  - `sendEvent()` - Cleaner event transmission abstraction

**Files Modified:**
- `src/routes/api/generate/+server.ts`
  - **Before:** 397 lines (with inline SSE handler)
  - **After:** 213 lines (using imported handler)
  - **Reduction:** 184 lines (-46.3%)
  - Removed inline `createSSEStream()` function (185 lines)
  - Now creates model client and passes to handler
  - Cleaner routing logic

**Impact:**
- Total code reduction: 184 lines eliminated
- SSE streaming logic isolated and potentially reusable
- Better typed interfaces for SSE events (type-safe event emission)
- Easier to test streaming independently from routing
- API route now focused purely on request/response handling
- Build verification: ✅ Passed (no new warnings or errors)

---

#### ✅ Task 2e: Extract Retry Orchestration
**Commit:** `1ff8aae`
**Status:** ✅ Complete

**Files Created:**
- `src/lib/generation/orchestration/retry-handler.ts` (211 lines)
  - `withRetry()` - Unified retry orchestration for both streaming and non-streaming modes
  - `GenerationResult` interface - Standard result type for all generation attempts
  - `RetryCallbacks` interface - Progress callbacks for streaming integration
  - `performAttempt()` - Single generation attempt with validation
  - `generateWithStreaming()` - Content generation with chunk callbacks
  - `generateWithoutStreaming()` - Standard invocation without streaming

**Files Modified:**
- `src/routes/api/generate/+server.ts`
  - **Before:** 213 lines (with inline retry loop)
  - **After:** 121 lines (using retry handler)
  - **Reduction:** 92 lines (-43.2%)
  - Removed inline retry loop logic (93 lines)
  - generateModule() simplified to just setup + withRetry() call
  - Cleaner separation between routing and generation orchestration

- `src/lib/generation/streaming/sse-handler.ts`
  - **Before:** 239 lines (with inline retry loop)
  - **After:** 188 lines (using retry handler)
  - **Reduction:** 51 lines (-21.3%)
  - Removed duplicate retry loop logic
  - Stream now uses callbacks to send SSE events during generation
  - Better separation of concerns (SSE formatting vs generation logic)

**Impact:**
- Total code reduction: 143 lines eliminated across both paths
- Retry logic now maintained in single location
- Both streaming and non-streaming use identical retry behaviour
- Callbacks pattern allows streaming to hook into retry flow
- Easier to modify retry behaviour (maxRetries, validation, error accumulation)
- Consistent error handling and validation across both modes
- Build verification: ✅ Passed (no new warnings or errors)

---

## Pending Tasks 📋

### Phase 2: ✅ COMPLETE

**Summary:** Phase 2 successfully decomposed API routes into focused utilities
- **Total lines eliminated:** 670+ lines across all tasks
- **New structure:** AI utilities, prompt builders, streaming handlers, retry orchestration
- **Pattern:** Composition-based with clear separation of concerns

---

### Phase 3: Improve Prompt Composability

#### ✅ Task 6: Break Prompts into Composable Sections
**Commit:** `TBD`
**Status:** ✅ Complete

**Files Created:**
- `src/lib/generation/prompts/components.ts` (156 lines)
  - `buildResearchInstructions()` - Standard research capability description
  - `buildRetrySection()` - Validation error feedback for retry attempts
  - `buildResearchStep()` - Conditional step numbering with research prefix
  - `buildSupportingDocuments()` - Format document array as XML
  - `formatInputData()` - Standardized JSON formatting
  - `buildSection()` - Generic XML section builder
  - `buildConditionalSection()` - Simple conditional content inclusion

**Files Modified:**
- `src/lib/generation/prompts/module-prompt-builder.ts`
  - **Before:** 196 lines (with inline implementations)
  - **After:** 175 lines (using imported components)
  - **Reduction:** 21 lines (-10.7%)
  - Replaced inline research instructions with `buildResearchInstructions()`
  - Replaced inline retry section with `buildRetrySection()`
  - Replaced conditional step logic with `buildResearchStep()`
  - Replaced inline JSON.stringify with `formatInputData()`

- `src/lib/generation/prompts/course-prompt-builder.ts`
  - **Before:** 136 lines (with inline implementations)
  - **After:** 124 lines (using imported components)
  - **Reduction:** 12 lines (-8.8%)
  - Replaced inline research instructions with `buildResearchInstructions()`
  - Replaced inline document formatting with `buildSupportingDocuments()`
  - Used `buildSection()` for consistent XML wrapping

**Impact:**
- Total code reduction: 33 lines eliminated across both prompt builders
- Shared logic now maintained in single location (research instructions, retry feedback)
- Consistent formatting across all prompts
- Easier to test prompt components in isolation
- Simpler to modify prompt structure without touching multiple files
- Better separation of concerns (structure vs content)
- Build verification: ✅ Passed (no new warnings or errors)

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
│   └── research-domains.ts           ✅ DONE
├── validation/
│   └── api-schemas.ts                ✅ DONE
├── generation/
│   ├── ai/
│   │   ├── client-factory.ts         ✅ DONE
│   │   └── response-parser.ts        ✅ DONE
│   ├── prompts/
│   │   ├── module-prompt-builder.ts  ✅ DONE
│   │   ├── course-prompt-builder.ts  ✅ DONE
│   │   └── components.ts             📋 TODO
│   ├── streaming/
│   │   └── sse-handler.ts            ✅ DONE
│   └── orchestration/
│       └── retry-handler.ts          ✅ DONE
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

**Immediate next step:** Task 5 - Store Consolidation Utilities

1. Analyze `src/lib/stores.ts` and `src/lib/courseStores.ts` for patterns
2. Identify shared utilities (workflow steps, localStorage persistence)
3. Create `src/lib/store-utilities/workflow-step.ts` for workflow management
4. Create `src/lib/store-utilities/persistence.ts` for auto-save functionality
5. Refactor both store files to use utilities
6. Test build + verify stores work correctly
7. Commit: "refactor: Phase 4 - extract store utilities"

**After that:** Task 8 (error handling consistency)

---

## Estimated Time Remaining

- ✅ ~~Task 2b (integrate utilities): 1 hour~~ **DONE**
- ✅ ~~Task 2c (extract prompts): 2 hours~~ **DONE**
- ✅ ~~Task 2d (SSE streaming): 2 hours~~ **DONE**
- ✅ ~~Task 2e (retry logic): 1.5 hours~~ **DONE**
- ✅ ~~Task 6 (prompt composability): 2 hours~~ **DONE**
- ⏱️ Task 5 (store utilities): 3 hours
- ⏱️ Task 8 (error handling): 3 hours

**Total remaining:** ~6 hours

---

## Git History

```
1ff8aae - refactor: Phase 2 - extract retry orchestration logic
b1ba39f - refactor: Phase 2 - extract SSE streaming handler from API route
eed76c6 - refactor: Phase 2 - extract prompt builders from API routes
0413fba - refactor: Phase 2 - integrate AI utilities into API routes
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

**✅ Completed:** 9/12 tasks (Tasks 1, 2a, 2b, 2c, 2d, 2e, 3, 6, 7)
**🔄 In Progress:** None
**📋 Pending:** 2/12 tasks (Task 5: store utilities, Task 8: error handling)
**Deferred:** 1/12 tasks (Task 4: arc migration)
**Build Status:** ✅ All changes compile
**Branch:** `feat/new-course-generation`
**Last Commit:** `TBD (Task 6 complete, needs commit)`
**Safe to /compact:** ✅ Yes
