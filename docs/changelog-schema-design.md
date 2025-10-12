# Changelog Schema Design

## Purpose
Track what changed, why, and with what confidence level to enable safe cascade pattern maintenance.

## Schema Structure

### Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Module>
  <Metadata>
    <GenerationInfo>
      <Timestamp>2025-10-11T14:30:00Z</Timestamp>
      <Source>AI-Generated</Source>
      <Model>claude-sonnet-4-5-20250929</Model>
      <InputSources>
        <InputFile type="projects">arc2/projects.xml</InputFile>
        <InputFile type="skills">arc2/skills.xml</InputFile>
        <InputFile type="research">arc2/research.xml</InputFile>
      </InputSources>
    </GenerationInfo>

    <Changelog>
      <Change>
        <Section>ModuleObjectives/Objective[1]</Section>
        <Type>content_update</Type>
        <Confidence>high</Confidence>
        <Summary>Updated to reflect Keras 3 API changes and current TensorFlow ecosystem</Summary>
        <Rationale>
          Industry has moved to Keras 3 (September 2023) which unifies the API across
          TensorFlow, JAX, and PyTorch backends. The original content referenced deprecated
          Keras 2 patterns.
        </Rationale>
        <ResearchSources>
          <Source url="https://keras.io/keras_3/">Keras 3 Official Documentation</Source>
          <Source url="https://blog.tensorflow.org/2023/09/keras-3.html">TensorFlow Blog: Keras 3 Release</Source>
        </ResearchSources>
      </Change>

      <Change>
        <Section>Projects/ProjectBriefs/ProjectBrief[2]/Examples</Section>
        <Type>examples_expanded</Type>
        <Confidence>medium</Confidence>
        <Summary>Added 2 new project examples using current AI agent frameworks</Summary>
        <Rationale>
          Original examples focused on older patterns. Added examples using LangChain agents
          and OpenAI's function calling, which are now industry standard approaches. However,
          these frameworks evolve rapidly, so marked as medium confidence.
        </Rationale>
        <ResearchSources>
          <Source url="https://js.langchain.com/docs/modules/agents">LangChain Agents Documentation</Source>
        </ResearchSources>
      </Change>

      <Change>
        <Section>ResearchTopics/PrimaryTopics/Topic[3]</Section>
        <Type>new_content</Type>
        <Confidence>low</Confidence>
        <Summary>Added research topic on emerging multimodal AI capabilities</Summary>
        <Rationale>
          GPT-4V and Claude 3 have introduced strong vision capabilities that weren't available
          when the original module was designed. This is marked low confidence because it's a
          pedagogical decision about whether multimodal belongs in this module versus a later one.
        </Rationale>
        <ResearchSources>
          <Source url="https://openai.com/research/gpt-4v-system-card">GPT-4V System Card</Source>
        </ResearchSources>
      </Change>
    </Changelog>

    <ProvenanceTracking>
      <LastHumanReview>
        <Date>2025-10-01</Date>
        <Reviewer>Council Week 5</Reviewer>
      </LastHumanReview>
      <AIUpdateCount>1</AIUpdateCount>
      <SectionsNeedingReview>
        <Section confidence="low">ResearchTopics/PrimaryTopics/Topic[3]</Section>
      </SectionsNeedingReview>
    </ProvenanceTracking>
  </Metadata>

  <ModuleOverview>
    <!-- Rest of module content -->
  </ModuleOverview>

  <!-- Other sections... -->
</Module>
```

## Field Definitions

### GenerationInfo
- **Timestamp**: ISO 8601 datetime of generation
- **Source**: One of `AI-Generated`, `Human-Reviewed`, `Hybrid` (AI with human edits)
- **Model**: Specific model version used
- **InputSources**: References to input files used for generation

### Changelog > Change
- **Section**: XPath-like identifier to the changed section (e.g., `ModuleObjectives/Objective[1]`)
- **Type**: Category of change
  - `content_update`: Existing content modified
  - `examples_expanded`: Examples added/updated
  - `new_content`: Entirely new section added
  - `removed`: Content removed (rare)
  - `reordered`: Structure changed but content similar
- **Confidence**: Three-level system
  - `high`: Factual updates (API changes, deprecated features, version bumps)
  - `medium`: Framework/library updates that may evolve rapidly
  - `low`: Pedagogical decisions, new content additions, subjective improvements
- **Summary**: One-sentence description of the change
- **Rationale**: 1-3 sentences explaining WHY this change was made
- **ResearchSources**: URLs to documentation, articles, or resources that informed the decision

### ProvenanceTracking
- **LastHumanReview**: When a human last reviewed this module
  - **Date**: ISO 8601 date
  - **Reviewer**: Identifier (e.g., "Council Week 5")
- **AIUpdateCount**: Number of AI generations since last human review (starts at 1)
- **SectionsNeedingReview**: Sections flagged for human attention (typically low confidence changes)

## Design Rationale

### Why Embedded in XML?
- Single file keeps provenance with content
- Easier to manage than separate metadata files
- Can be stripped before final publication if needed
- Provenance travels with content automatically

### Why Section-Level Granularity?
- Simpler to implement and maintain
- Sufficient for council review (they read the section for details)
- Line-by-line diffs would bloat the file
- Can add finer granularity later if needed

### Why Three Confidence Levels?
- Simple enough to be actionable
- Maps to council workflow:
  - **High**: Quick scan and approve
  - **Medium**: Brief review
  - **Low**: Detailed scrutiny required

## Usage in Cascade Pattern

1. **Generation**: AI creates module with Metadata section
2. **Council Review**: Council sees changelog, focuses on medium/low confidence items
3. **Approval**: Council marks as "Human-Reviewed", resets AIUpdateCount
4. **Cascade**: AI uses this module as input for next module (n+1)
   - Inherits ProvenanceTracking
   - Increments AIUpdateCount
   - Adds new Changelog entries
5. **Drift Detection**: If AIUpdateCount > 2, system flags for spot-checking

## Implementation Notes

- Metadata section is **optional** for backward compatibility
- Schema validator should warn if missing but not fail
- UI should handle both old (no metadata) and new (with metadata) formats
- When cascading, previous Metadata should be preserved in a `<PreviousGenerations>` section (future enhancement)

## Implementation Status: ✅ COMPLETED

### What's Been Implemented

1. **Schema Definition** (src/data/templates/outputSchema.xml)
   - Complete Metadata section structure
   - GenerationInfo, Changelog, and ProvenanceTracking subsections
   - Inline documentation and examples

2. **Schema Validation** (src/lib/schemas/moduleValidator.ts)
   - `validateMetadata()` function validates Metadata structure
   - Checks confidence levels (high/medium/low)
   - Warns if optional Metadata is missing
   - Validates change records have required fields

3. **Diff Detection Utility** (src/lib/schemas/diffDetector.ts)
   - Section-level change detection
   - Compares projects, research topics, and skills
   - Detects new content, updates, and removals
   - Available as fallback if Claude doesn't generate changelog

4. **Generation Prompt** (src/lib/schemas/schemaTemplate.ts)
   - Updated `getSchemaRequirements()` with Metadata structure
   - Confidence level guidance for Claude
   - Changelog requirements and examples
   - Instructions on when to use each change type

5. **UI Component** (src/lib/ChangelogViewer.svelte)
   - Displays changes with confidence badges
   - Color-coded confidence levels (green/yellow/red)
   - Shows rationale and research sources
   - Flags sections needing review
   - Generation info display (timestamp, model)

6. **Integration** (src/lib/ModulePreview.svelte)
   - ChangelogViewer integrated into preview flow
   - Appears above XML preview
   - Only displays when Metadata exists

### Testing Checklist

- [x] Build completes without errors
- [ ] Generate module with Arc 2 files
- [ ] Verify Metadata section appears in output
- [ ] Check changelog is populated with changes
- [ ] Confirm UI displays changelog correctly
- [ ] Validate confidence badges show correct colors
- [ ] Test with modules missing Metadata (backward compatibility)

### Known Limitations

- Diff detection is basic (section-level only, not line-level)
- No comparison with previous generation (cascade tracking TBD)
- No manual changelog editing in UI (read-only display)
- Timestamp injection not implemented (Claude generates it)

### Next Steps for Full Cascade Pattern

1. Store previous module versions for comparison
2. Implement cascade updates (Task #10 in roadmap)
3. Add human review workflow (approve/reject changes)
4. Track cumulative AI update count across generations
5. Implement staleness indicators for sections
