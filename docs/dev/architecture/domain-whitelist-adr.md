# Architecture Decision Record: Domain Whitelist System

**Date:** 2025-01-XX  
**Status:** Implemented  
**Tasks:** 2.4, 2.5, 1.2.5 (Metis MVP Roadmap)

---

## Context

Rhea uses Claude's web search capability to research current technologies and best practices during curriculum generation. Initially, this used a hardcoded list of ~40 domains. We needed a flexible system allowing users to:
- Select predefined domain lists
- Add custom domains
- Allow unrestricted research
- Configure research hierarchically in Themis (course → arc → module)

## Decision

We implemented a structured domain whitelist system with:
1. **Structured domain lists** with categorization (not flat arrays)
2. **User-selectable configuration** (predefined lists, custom domains, no restrictions)
3. **Hierarchical configuration** in Themis with cascade resolution
4. **Type-safe validation** using Zod schemas

## Architecture

### Type System

```typescript
// Core types (src/lib/types/config.ts)
interface DomainList {
  id: string;
  name: string;
  type: "allow" | "ban";  // Future: support blacklists
  categories: DomainListCategory[];
}

interface DomainConfig {
  useList: string | null;  // List ID or null for no restrictions
  customDomains: string[]; // User-added domains
}

interface ResearchConfig {
  level: 'all' | 'selective' | 'none';
  domainConfig?: DomainConfig;
}
```

### Domain Resolution Flow

```
User Selection (UI)
  ↓
DomainConfig { useList, customDomains }
  ↓
resolveDomainList()
  ↓
string[] domains
  ↓
withWebSearch(client, maxUses, domains)
  ↓
Anthropic API (web_search tool)
```

### Hierarchical Resolution (Themis)

```
resolveModuleResearchConfig(moduleConfig, arcConfig, courseConfig)
  ↓
Priority: Module > Arc > Course > Default
  ↓
{ enabled: boolean, domains: string[], resolvedFrom: string }
```

## Key Design Decisions

### 1. Whole-List Selection (Not Individual Domains)

**Decision:** Users select entire predefined lists, not individual domains within a list.

**Rationale:**
- Simpler UX - dropdown vs multi-select checkboxes
- Easier maintenance - update list definition, not user selections
- Clear intent - "AI Engineering domains" vs picking 15 individual sites
- Still flexible - custom domains available for additions

**Trade-off:** Less granular control, but custom domains mitigate this.

### 2. Empty Array = No Restrictions

**Decision:** Pass empty array to `withWebSearch()` to allow unrestricted research.

**Rationale:**
- Matches Anthropic API behavior (no `allowed_domains` = unrestricted)
- Simpler than null handling or special flags
- Clear semantic meaning: "no domains in list = no restrictions"

**Implementation:**
```typescript
if (domains.length > 0) {
  toolConfig.allowed_domains = [...domains];
}
// Empty array → allowed_domains omitted → unrestricted
```

### 3. Hierarchical Configuration in Themis

**Decision:** Three-level hierarchy (Course → Arc → Module) with explicit override at each level.

**Rationale:**
- Matches Themis' course/arc/module structure
- Maximum flexibility (set once at top, or per-module granularity)
- Clear inheritance with override capability
- "Configure per X" vs "Use parent config" is intuitive

**Levels:**
- **Course:** all | selective (per-arc) | none
- **Arc:** all | selective (per-module) | none  
- **Module:** enable | disable (simplified)

### 4. Domain Validation (Wildcards + Subpaths)

**Decision:** Support wildcards (`*.example.com`) and subpaths (`example.com/path`).

**Rationale:**
- Wildcards common in domain lists (e.g., `*.github.com` for all GitHub subdomains)
- Subpaths useful for specific sections (e.g., `medium.com/engineering`)
- Validation regex accommodates both while rejecting malformed input

**Validation Rules:**
- Must have TLD (`.com`, `.org`, etc.)
- No consecutive dots (`..`)
- Alphanumeric + hyphens only
- Optional wildcard prefix (`*.`)
- Optional path suffix (`/...`)

### 5. Structured Lists (Not Flat Arrays)

**Decision:** Organize domains into categories within lists.

**Before:**
```typescript
const AI_RESEARCH_DOMAINS = ['anthropic.com', 'github.com', ...];
```

**After:**
```typescript
const AI_RESEARCH_DOMAINS = {
  id: 'ai-engineering',
  name: 'AI Engineering',
  categories: [
    { name: 'AI Platforms', sources: [{name: 'Anthropic', url: 'anthropic.com'}] },
    { name: 'Documentation', sources: [...] }
  ]
};
```

**Rationale:**
- Maintainability - clear organization
- Extensibility - easy to add new categories or lists
- Documentation - names explain why each domain is included
- Future UI - could show categorized view

**Backward Compatibility:**
```typescript
export const AI_RESEARCH_DOMAINS_FLAT = extractDomainUrls(AI_RESEARCH_DOMAINS);
```

## Implementation

### Components Created

1. **DomainSelector** (`src/lib/components/metis/DomainSelector.svelte`)
   - Dropdown for list selection
   - Custom domain input with validation
   - Real-time feedback on validation errors

2. **ResearchConfigSelector** (`src/lib/components/themis/ResearchConfigSelector.svelte`)
   - Reusable across course/arc/module levels
   - Adaptive labels based on context
   - Conditional domain configuration

### Utilities Created

1. **domainValidator** (`src/lib/utils/validation/domainValidator.ts`)
   - `validateDomain()` - Single domain with wildcards/subpaths
   - `validateDomains()` - Batch validation
   - `normalizeDomain()` - Lowercase + trim

2. **domainResolver** (`src/lib/utils/research/domainResolver.ts`)
   - `resolveDomainList()` - Config → domain array
   - `getDomains()` - Simple wrapper for APIs
   - `describeDomainConfig()` - Human-readable descriptions

3. **configResolver** (`src/lib/utils/research/configResolver.ts`)
   - `resolveModuleResearchConfig()` - Hierarchical resolution
   - Cascade logic with priority

### API Integration

All generation endpoints extract and resolve domain configuration:

```typescript
// Extract config
const domainConfig = body.domainConfig || body.structuredInput?.model?.domainConfig;

// Resolve to array
const domains = getDomains(domainConfig);

// Apply to web search
model = withWebSearch(model, 5, domains);
```

## Consequences

### Positive

- ✅ Users can control research sources without code changes
- ✅ Fine-grained control in Themis (per-module if needed)
- ✅ Backward compatible (default behavior unchanged)
- ✅ Type-safe with Zod validation
- ✅ Extensible for future lists (Web Dev, Data Science, etc.)
- ✅ Clear domain usage (users see what domains are used)

### Negative

- ⚠️ Additional UI complexity (more configuration options)
- ⚠️ Hierarchical config in Themis requires understanding cascade
- ⚠️ Custom domains require manual entry (no autocomplete)

### Neutral

- Domain lists require manual curation/maintenance
- New lists need to be added to code (not user-creatable yet)

## Future Enhancements

1. **Blacklists** (Task 2.6)
   - Support `type: "ban"` in domain lists
   - Combine whitelist + blacklist

2. **Multiple Predefined Lists**
   - Web Development domains
   - Data Science domains
   - Domain-specific curriculum lists

3. **List Management UI**
   - User-created/saved lists
   - Import/export lists
   - Share lists between users

4. **Domain Analytics**
   - Track which domains are actually used
   - Suggest domains based on module topic
   - Dead link detection

5. **List Validation**
   - Periodic checks that domains are accessible
   - Remove defunct sources
   - Update outdated URLs

## Related Documents

- `/docs/wip/domain-whitelist-implementation.md` - Implementation plan and progress
- `/docs/dev/roadmap/Metis-MVP.md` - Feature roadmap
- `README.md` - User-facing documentation

## References

- Anthropic Web Search API: https://docs.anthropic.com/
- Original issue: Metis MVP Task 2.4, 2.5, 1.2.5

