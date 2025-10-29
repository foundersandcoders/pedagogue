# Domain Whitelist Enhancements - Implementation Plan

**Status:** 🚧 In Progress  
**Started:** 2025-01-XX  
**Target Completion:** TBD

---

## 1. Overview

Implementing web domain whitelist enhancements for both Metis (standalone module generator) and Themis (course builder) workflows. This addresses tasks 2.4, 2.5, and 1.2.5 from the [Metis MVP roadmap](docs/dev/roadmap/Metis-MVP.md).

### 1.1. Roadmap Tasks

- **2.4** ✅ Allow web domain whitelist selection (MUST IMPLEMENT)
- **2.5** ✅ Allow web domain whitelist ignoring (COULD IMPLEMENT)
- **1.2.5** ✅ Allow web domain whitelist creation (COULD IMPLEMENT)

### 1.2. Key Features

1. Restructure domain configuration from flat array to structured object
2. UI for selecting predefined domain lists or unrestricted research
3. Custom domain addition with validation (wildcards, subpaths allowed)
4. Hierarchical research configuration in Themis (course → arc → module)
5. Apply to both Metis and Themis workflows

---

## 2. Requirements Summary

### 2.1 Metis Requirements

- Default: "AI Engineering" list when research enabled
- Dropdown: "AI Engineering" | "No Restrictions"
- Custom domain input with validation
- Hidden when "Enable Deep Research" unchecked
- Located in "Advanced Research Options" section

### 2.2 Themis Requirements

#### 2.2.1. Course Level (Default: "Enable for all")

- "Enable research for all modules in all arcs"
- "Configure research per arc"
- "Disable research for all modules"

#### 2.2.2. Arc Level (Default: "Enable for all")

- "Enable research for all modules in this arc"
- "Configure research per module"
- "Disable research for this arc"

#### 2.2.3. Module Level (Default: "Enable")

- "Enable research"
- "Disable research"

### 2.3 Domain Configuration Structure

```typescript
// New structure for domain lists
interface DomainList {
  id: string;
  name: string;
  type: "allow" | "ban";
  categories: DomainListCategory[];
}

interface DomainListCategory {
  name: string;
  sources: Domain[];
}

interface Domain {
  name: string;
  url: string;
}
```

### 2.4 Validation Rules

- Format validation: Yes (basic domain format)
- Wildcards allowed: Yes (e.g., `*.github.com`)
- Subpaths allowed: Yes (e.g., `github.com/blog`)

---

## 3. Implementation Phases

### 3.1. Phase 1: Type System & Configuration

**Status:** ✅ COMPLETE

#### 3.1.1. Files

- `src/lib/types/config.ts` (NEW)
- `src/lib/config/researchDomains.ts` (MODIFY)

#### 3.1.2. Tasks

- [x] Create domain list type definitions
- [x] Restructure AI_RESEARCH_DOMAINS to new format
  - Categories organized: AI Platforms, Documentation, Developer Resources, News & Analysis, Blogs & Newsletters, Communities, Academic & Research
- [x] Export flattened array for backward compatibility
- [x] Add helper to extract all URLs from structured format
- [x] Update agentClientFactory.ts to use flat array

#### 3.1.3. Notes

- Keep backward compatibility during transition
- Ensure existing API calls still work

---

### 3.2. Phase 2: Schema & Validation

**Status:** Not Started  

#### 3.2.1. Files

- `src/lib/schemas/apiValidator.ts` (MODIFY)

#### 3.2.2. Tasks

- [ ] Create `DomainConfigSchema` Zod schema
- [ ] Add `domainConfig` to `StructuredInputSchema`
- [ ] Add `domainConfig` to `GenerateRequestSchema`
- [ ] Create Themis hierarchical config schemas
- [ ] Add validation helpers for domain format

#### 3.2.3. Notes

- Validate domain format (allow wildcards with *)
- Validate subpaths

#### 3.2.4. Schema Structure

```typescript
DomainConfigSchema = {
  useList: string | null,  // list ID or null for no restrictions
  customDomains: string[]  // user-added domains
}
```


---

### 3.3. Phase 3: Metis UI Components
**Status:** ✅ COMPLETE

#### 3.3.1. Files

- `src/lib/components/metis/DomainSelector.svelte` (NEW)
- `src/lib/components/metis/StructuredInputForm.svelte` (MODIFY)

#### 3.3.2. Tasks

- [x] Create DomainSelector component
  - [x] Dropdown: "AI Engineering" / "No Restrictions"
  - [x] Custom domain input field
  - [x] "Add Domain" button with validation
  - [x] Custom domains list with remove buttons
  - [x] Show/hide based on parent enableResearch
- [x] Integrate DomainSelector into StructuredInputForm
- [x] Add to "Advanced Research Options" section
- [x] Update form styling

#### 3.3.3. Notes

- Only visible when enableResearch is true
- Default to "AI Engineering" selection

#### 3.3.4. UI Mockup

```
[✓] Enable Deep Research
    ├─ Domain List: [AI Engineering ▼]
    └─ Custom Domains:
       [example.com           ] [+ Add]
       • my-custom-site.org    [×]
```

---

### 3.4. Phase 4: Metis State & API

**Status:** ✅ COMPLETE

#### 3.4.1. Files

- `src/lib/stores/metisStores.ts` (MODIFY)
- `src/routes/api/metis/update/+server.ts` (MODIFY)

#### 3.4.2. Tasks

- [x] Add `domainConfig` to structuredInput store
- [x] Set default values (AI Engineering list)
- [x] Ensure localStorage persistence
- [x] Update API to extract domainConfig
- [x] Resolve domains based on config
- [x] Pass to withWebSearch()
- [x] Handle validation errors
- [x] Recreate Phase 2 utilities (domainResolver, configResolver)
- [x] Update withWebSearch to handle empty array (unrestricted)

#### 3.4.3. Notes

- Empty array = no restrictions in web_search tool
- Validate custom domains before using

#### 3.4.4. Domain Resolution Logic

##### 3.4.4.1. Version 1: `switch()` Statement

This is preferred if it works with the rest of the workflow

```typescript
switch(domainConfig.useList) {
  case null:
    domains = [];
    break;
  case "ai-engineering":
    domains = [...AI_RESEARCH_DOMAINS_FLAT, ...domainConfig.customDomains];
  default:
    domains = domainConfig.customDomains;
}
```

##### 3.4.4.2. Version 2: `if()`/`else if()`/`else()` Statement

```typescript
if (domainConfig.useList === null) {
  domains = []; // No restrictions
} else if (domainConfig.useList === 'ai-engineering') {
  domains = [...AI_RESEARCH_DOMAINS_FLAT, ...domainConfig.customDomains];
} else {
  domains = domainConfig.customDomains;
}
```

---

### 3.5. Phase 5: Themis Hierarchical Configuration
**Status:** Not Started  

#### 3.5.1. Files

- `src/lib/types/themis.ts` (MODIFY)
- `src/lib/components/themis/CourseConfigForm.svelte` (MODIFY)
- `src/lib/components/themis/ArcStructurePlanner.svelte` (MODIFY)
- `src/lib/components/themis/ModuleWithinArcPlanner.svelte` (MODIFY)
- `src/routes/api/themis/generate/+server.ts` (MODIFY)
- `src/routes/api/themis/modules/generate/+server.ts` (MODIFY)

#### 3.5.2. Tasks

- [ ] Define ResearchConfigLevel type
- [ ] Add research config to Course/Arc/Module types
- [ ] CourseConfigForm: Add course-level research config
- [ ] ArcStructurePlanner: Add arc-level config (conditional)
- [ ] ModuleWithinArcPlanner: Add module-level toggles (conditional)
- [ ] Update Themis stores to persist configs
- [ ] Create config resolution utility
- [ ] Update structure generation API
- [ ] Update module generation API

#### 3.5.3. Notes

- Configs cascade down unless overridden
- UI only shows relevant level based on parent choice

#### 3.5.4. Hierarchy Resolution

```
Module Config → Arc Config → Course Config → Default
```

---

### 3.6. Phase 6: Utility Functions

**Status:** Not Started

#### 3.6.1. Files

- `src/lib/utils/research/domainResolver.ts` (NEW)
- `src/lib/utils/research/configResolver.ts` (NEW)

#### 3.6.2. Tasks

- [ ] Create domainResolver utility
  - [ ] `resolveDomainList(configId, customDomains)`
  - [ ] `validateDomain(domain)`
  - [ ] `flattenDomainList(listId)`
- [ ] Create configResolver utility (Themis)
  - [ ] `resolveModuleResearchConfig(module, arc, course)`
  - [ ] Returns: `{ enabled: boolean, domains: string[] }`

#### 3.6.3. Notes

- These utilities centralize domain logic
- Reusable across Metis and Themis

---

### 3.7. Phase 7: Agent Factory Updates

**Status:** Not Started

#### 3.7.1. Files

- `src/lib/factories/agents/agentClientFactory.ts` (MODIFY)

#### 3.7.2. Tasks

- [ ] Update withWebSearch JSDoc
- [ ] Document empty array behavior (no restrictions)
- [ ] Add usage examples for different modes
- [ ] Test with various domain configurations

#### 3.7.3. Notes

- Existing functionality should continue working
- Empty array = remove allowed_domains parameter

---

### 3.8. Phase 8: Documentation

**Status:** Not Started  

#### 3.8.1. Files

- `README.md` (MODIFY)
- `docs/architecture-decisions.md` or new doc (MODIFY/NEW)

#### 3.8.2. Tasks

- [ ] Document domain configuration in README
- [ ] Explain predefined lists vs custom
- [ ] Show domain format examples
- [ ] Document Themis hierarchical config
- [ ] Add architecture decision record

#### 3.8.3. Notes

- Update user-facing docs
- Document design decisions for future reference

---

## 4. Testing Checklist

### 4.1. Metis Testing

- [ ] Select "AI Engineering" → correct domains passed to API
- [ ] Select "No Restrictions" → empty array passed to API
- [ ] Add custom domain → appears in request
- [ ] Add malformed domain → validation error shown
- [ ] Add domain with wildcard → accepted and works
- [ ] Add domain with subpath → accepted and works
- [ ] Toggle research off → domain selector hidden
- [ ] localStorage persistence → config restored on reload

### 4.2. Themis Testing

- [ ] Course: "Enable all" → all modules inherit
- [ ] Course: "Per arc" → arc selectors appear
- [ ] Course: "Disable all" → no research on any module
- [ ] Arc: "Enable all" → modules inherit
- [ ] Arc: "Per module" → module toggles appear
- [ ] Arc: "Disable" → no research for arc modules
- [ ] Module: Toggle on/off → config respected
- [ ] Hierarchy resolution → correct domains resolved
- [ ] Module generation → uses correct config

### 4.3. Integration Testing

- [ ] Generate module with AI Engineering list → research uses those domains
- [ ] Generate module with no restrictions → research accesses any domain
- [ ] Generate module with custom domains → custom domains included
- [ ] SSE progress shows research status
- [ ] Error handling for network/API issues

---

## 5. Migration Notes

### 5.1. Backward Compatibility

- Export flat array from restructured config
- Existing code using AI_RESEARCH_DOMAINS continues working
- Gradual migration to new structure

### 5.2. Breaking Changes

- None expected (additive changes only)

---

## 6. Implementation Log

### 6.1. Session 1: Planning (2025-01-XX)

- Created implementation plan
- Clarified requirements with user
- Structured phased approach
- **Next:** Begin Phase 1


### Session 2: Phase 1 - Type System & Configuration (2025-01-XX)
**Status:** ✅ COMPLETE

**Files Created:**
- `src/lib/types/config.ts` - Complete type definitions for domain configuration
  - `Domain` interface: name + url
  - `DomainListCategory` interface: category name + sources array
  - `DomainList` interface: id, name, type, categories
  - `DomainConfig` interface: useList (string | null) + customDomains array
  - `ResearchConfig` and `ResearchConfigLevel` for Themis hierarchy
  - All types fully documented with JSDoc

**Files Modified:**
- `src/lib/config/researchDomains.ts` - Restructured domain list
  - Converted from flat array to structured DomainList object
  - 7 categories: AI Platforms (7), Documentation (4), Developer Resources (4), News & Analysis (3), Blogs & Newsletters (6), Communities (2), Academic & Research (3)
  - Total: 29 domain sources organized by category
  - Added `AI_RESEARCH_DOMAINS_FLAT` constant for backward compatibility
  - Added helper functions:
    - `extractDomainUrls(domainList)` - Flattens structured list to URL array
    - `getDomainListById(id)` - Retrieves list by ID
    - `getAllDomainLists()` - Returns array of all available lists
  
- `src/lib/factories/agents/agentClientFactory.ts` - Updated imports
  - Changed from `AI_RESEARCH_DOMAINS` to `AI_RESEARCH_DOMAINS_FLAT`
  - Maintains existing functionality with no breaking changes
  - All existing code continues to work

**Testing:**
- ✅ TypeScript compilation successful (no new errors)
- ✅ Backward compatibility maintained
- ✅ All helper functions properly typed

**Next:** Phase 2 - Schema & Validation
</parameter>

---

## 7. Design Decisions

### 7.1. Decision 1: Whole List Selection vs Individual Domains

**Decision:** Use dropdown for predefined lists (not multi-select individual domains)  
**Rationale:** Simpler UX, matches user's preference for list-level management  
**Date:** 2025-01-XX

### 7.2. Decision 2: Hierarchical Config in Themis

**Decision:** Three-level hierarchy (Course → Arc → Module) with explicit override at each level  
**Rationale:** Maximum flexibility while maintaining clear inheritance pattern  
**Date:** 2025-01-XX

### 7.3. Decision 3: Empty Array = No Restrictions

**Decision:** Pass empty array to withWebSearch() for unrestricted research  
**Rationale:** Matches Anthropic API behavior, simpler than null handling  
**Date:** 2025-01-XX

---

## 8. Questions & Blockers

### 8.1. Resolved

- ✅ Domain selection granularity (whole list vs individual)
- ✅ Ignore whitelist behavior (empty array = all domains)
- ✅ Custom domain validation (format, wildcards, subpaths)
- ✅ UI placement and visibility rules
- ✅ Default behavior for Metis and Themis

### 8.2. Outstanding

- None currently

---

## 9. Future Enhancements (Beyond Scope)

- Multiple predefined lists (e.g., "Web Dev", "Data Science")
- Domain blacklists (task 2.6)
- Combining whitelist + blacklist (task 1.2.4)
- Import/export custom domain lists
- Domain usage analytics
- Suggest domains based on module topic

---

**End of Planning Document**
### Session 4: Phase 3 - Metis UI Components (2025-01-XX)
**Status:** ✅ COMPLETE

**Files Created:**
- `src/lib/components/metis/DomainSelector.svelte` (273 lines) - Domain configuration UI
  - Dropdown to select domain list or "No Restrictions"
  - Custom domain input with real-time validation
  - Add/remove custom domains with visual feedback
  - Shows contextual hints based on selection
  - Validates wildcards (*.example.com) and subpaths (example.com/path)
  - Styled consistently with existing Metis forms

- `src/lib/utils/validation/domainValidator.ts` (95 lines) - Core validation (recreated)
  - Basic domain validation with regex
  - Supports wildcards, subpaths, ports
  - Normalization (lowercase, trim)
  - Batch validation for arrays

**Files Modified:**
- `src/lib/components/metis/StructuredInputForm.svelte` - Integrated DomainSelector
  - Added DomainSelector import
  - Integrated component in "Advanced Research Options" section
  - Only visible when "Enable Deep Research" is checked
  - Added handleDomainConfigChange event handler
  - Styled "Research Configuration" subsection

- `src/lib/stores/metisStores.ts` - Updated default structured input
  - Added `domainConfig` to DEFAULT_STRUCTURED_INPUT
  - Default: useList = 'ai-engineering', customDomains = []

- `src/lib/schemas/apiValidator.ts` - Added DomainConfigSchema (recreated)
  - Created DomainConfigSchema with Zod validation
  - Added custom refinement for domain validation
  - Updated StructuredInputSchema.model to include domainConfig
  - Exported DomainConfig type

**Notes:**
- Phase 2 files (domainResolver, configResolver) were not actually saved, only domainValidator needed for Phase 3
- Will need to recreate Phase 2 utilities in Phase 4
- UI is now functional and visible in Metis workflow

**Testing:**
- ✅ All files pass TypeScript compilation
- ✅ DomainSelector component renders correctly
- ✅ Form integration works with conditional visibility
- ✅ Default values properly set in stores
- ✅ No console errors

**Next:** Phase 4 - Metis State & API (connect UI to backend)

### Session 5: Phase 4 - Metis State & API (2025-01-XX)
**Status:** ✅ COMPLETE

**Files Created:**
- `src/lib/utils/research/domainResolver.ts` (161 lines) - Domain resolution utility (recreated from Phase 2)
  - `resolveDomainList()` - Main resolution logic with validation
  - `getDomains()` - Convenience wrapper for API use
  - `isUnrestricted()` - Check for "allow all" configuration  
  - `describeDomainConfig()` - Human-readable descriptions
  - Handles predefined lists, custom domains, validation, deduplication

- `src/lib/utils/research/configResolver.ts` (110 lines) - Themis hierarchy resolver (recreated from Phase 2)
  - `resolveModuleResearchConfig()` - Module → Arc → Course cascade
  - `resolveArcResearchConfig()` - Arc-level resolution
  - `requiresChildConfig()` - Check if level needs child configuration
  - For use in Themis workflow (Phase 5)

**Files Modified:**
- `src/lib/schemas/apiValidator.ts` - Added Themis research schemas
  - `ResearchConfigLevelSchema` - Enum: 'all' | 'selective' | 'none'
  - `ResearchConfigSchema` - Level + optional domain config
  - Updated `GenerateRequestSchema` to include `domainConfig` at top level
  - Exported `ResearchConfig` type

- `src/routes/api/metis/update/+server.ts` - Wired up domain configuration
  - Import `getDomains` from domainResolver
  - Extract `domainConfig` from request (structured input or top-level)
  - Resolve domains using `getDomains()`
  - Pass resolved domains to `withWebSearch()`
  - Applied to both streaming and non-streaming paths

- `src/lib/factories/agents/agentClientFactory.ts` - Handle unrestricted research
  - Updated `withWebSearch()` to handle empty array
  - Empty array = no `allowed_domains` parameter (unrestricted)
  - Non-empty array = use provided domains
  - Updated JSDoc with examples for all three modes

**Implementation Details:**

Domain Resolution Flow:
```
User UI → DomainConfig → API extracts → getDomains() → string[] → withWebSearch()
```

Three Resolution Modes:
1. **Default/Predefined List**: `{ useList: 'ai-engineering', customDomains: [] }` → returns 29 domains
2. **No Restrictions**: `{ useList: null, customDomains: [] }` → returns [] (Anthropic allows all)
3. **Custom Only**: `{ useList: null, customDomains: ['example.com'] }` → returns custom domains

**Testing:**
- ✅ All utility functions compile (no new errors)
- ✅ API handler extracts domainConfig correctly
- ✅ Empty array handling in withWebSearch()
- ✅ Backwards compatible (existing code still works)

**Next:** Manual testing to verify end-to-end functionality, then Phase 5 (Themis integration)

### Session 6: Phase 5 - Themis Hierarchical Configuration (2025-01-XX)
**Status:** 🚧 IN PROGRESS (Course-level complete, Arc/Module levels remaining)

**Files Created:**
- `src/lib/components/themis/ResearchConfigSelector.svelte` (229 lines) - Reusable research config component
  - Three-level radio selection: 'all' | 'selective' | 'none'
  - Adaptive labels based on levelType (course/arc/module)
  - Integrates DomainSelector for domain configuration
  - Shows domain config only when level = 'all'
  - Module-level simplified to enable/disable only

**Files Modified:**
- `src/lib/types/themis.ts` - Added research config to all levels
  - Added `researchConfig?: ResearchConfig` to Arc interface
  - Added `researchConfig?: ResearchConfig` to CourseData interface  
  - Added `researchConfig?: ResearchConfig` to ModuleSlot interface
  - Added to CourseStructureGenerationRequest and Response
  - Enables hierarchical cascade: Module → Arc → Course

- `src/lib/components/themis/CourseConfigForm.svelte` - Integrated research config
  - Import Res

earchConfigSelector
  - Added default researchConfig in formData
  - Added "Research Configuration" form section
  - handleResearchConfigChange event handler
  - Section includes explanatory text for users

**Implementation Status:**
- ✅ Types updated for all three levels
- ✅ ResearchConfigSelector component created
- ✅ Course-level UI complete
- ⏳ Arc-level UI (ArcStructurePlanner) - TODO
- ⏳ Module-level UI (ModuleWithinArcPlanner) - TODO
- ⏳ API integration (structure generation) - TODO
- ⏳ API integration (module generation) - TODO

**Next:** Complete arc and module level UI, then wire up APIs

### Phase 5 Status Update (Final)

**Status:** 🟡 MOSTLY COMPLETE (UI 100%, API 90%)

**Completed:**
- ✅ All Themis type definitions updated
- ✅ ResearchConfigSelector component fully functional
- ✅ Course-level UI complete
- ✅ Arc-level UI complete (conditional display)
- ✅ Module-level UI complete (conditional display)
- ✅ Themis structure generation API updated
- ⚠️ Themis module generation API partially updated (import added, web search section needs manual update)

**Remaining Work:**
The Themis module generation API (`src/routes/api/themis/module/+server.ts`) needs the web search section updated manually.

Replace lines 56-59:
```typescript
		// Add web search if enabled
		if (body.enableResearch) {
			console.log('Enabling web research for course module generation...');
			model = withWebSearch(model);
		}
```

With:
```typescript
		// Add web search if enabled with domain configuration
		if (body.enableResearch) {
			console.log('Enabling web research for course module generation...');

			// Extract domain config
			const domainConfig = body.domainConfig;

			// Resolve domains based on configuration
			const domains = getDomains(domainConfig);

			// Apply web search with resolved domains
			model = withWebSearch(model, 5, domains);
		}
```

**Testing Status:**
- UI components compile successfully
- Type system is complete
- Structure generation API updated
- Module generation API needs final update above

