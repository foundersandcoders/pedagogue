# Course XML Specification

**Version:** 1.0  
**Date:** 2025-10-28  
**Status:** Implemented  
**Related:** [Task Themis 2.2](../roadmap/Themis-MVP.md)

---

## Overview

The Course XML schema provides a comprehensive, hierarchical format for representing complete Themis-generated courses. It embeds full module specifications within an arc-based thematic structure, enabling complete course export, validation, and round-trip workflows.

### Key Features

- **Hierarchical Structure**: Course → Arcs → Modules → Module Specifications
- **Thematic Organization**: Arcs provide thematic containers with narratives
- **Complete Module Embedding**: Full Metis-style module specs embedded in each module
- **Temporal Tracking**: Duration and sequencing at all levels (course, arc, module)
- **Comprehensive Validation**: Cardinality constraints and temporal consistency checks
- **Provenance Tracking**: Generation metadata, changelogs, and review history

---

## Schema Location

- **Template**: `src/data/templates/themis/courseSchema.xml`
- **Validator**: `src/lib/schemas/courseValidator.ts`
- **Tests**: `src/lib/schemas/courseValidator.test.ts`

---

## Hierarchical Structure

```
Course
├── CourseProps (metadata, logistics, temporal)
├── CohortProps (learner assumptions, prerequisites)
├── CourseDescription (narrative paragraphs)
└── CourseContent
    ├── CourseProgression (how arcs connect)
    └── Arcs (thematic containers)
        └── Arc (order: 1, 2, 3...)
            ├── ArcDescription
            ├── ArcProps (metadata, logistics, temporal)
            └── ArcContent
                ├── Themes (thematic focus narratives)
                ├── ArcProgression (how modules connect)
                └── Modules
                    └── Module (order: 1, 2, 3...)
                        ├── ModuleDescription
                        ├── ModuleProps (metadata, temporal)
                        └── ModuleSpecification (full Metis-style content)
                            ├── Metadata (optional, provenance)
                            ├── ModuleOverview (description, objectives)
                            ├── ResearchTopics (primary, stretch)
                            ├── Projects (briefs, twists)
                            ├── AdditionalSkills (categorized)
                            └── Notes (optional)
```

---

## Validation Requirements

### Course-Level Requirements

- **Root Element**: Must be `<Course>` with `name` attribute
- **Minimum Arcs**: At least 1 arc
- **Structure**: Must be either "facilitated" or "peer-led"
- **Required Sections**:
  - CourseProps (with arcs, modules, weeks, days attributes)
  - CohortProps (with learners attribute)
  - CourseDescription (min 1 paragraph)
  - CourseContent (with Arcs section)

### Arc-Level Requirements

- **Minimum Modules**: At least 1 module per arc
- **Ordering**: Arc `order` attribute must be sequential (1, 2, 3...)
- **Required Attributes**: `order`, `name`, `modules`, `weeks`
- **Required Sections**:
  - ArcDescription
  - ArcProps (with ArcLogistics and ArcTemporal)
  - ArcContent (with Modules section)

### Module-Level Requirements

- **Ordering**: Module `order` attribute must be sequential within arc
- **Arc Reference**: `in_arc` attribute must match parent arc order
- **Required Attributes**: `order`, `in_arc`, `weeks`
- **Required Sections** (if not empty/self-closing):
  - ModuleDescription
  - ModuleProps (with ModuleTemporal)
  - ModuleSpecification (full module content)

### Module Specification Requirements

Based on Metis module validator (`moduleValidator.ts`):

- **ModuleObjectives**: Minimum 3 objectives
- **ResearchTopics**: Minimum 5 primary topics
- **ProjectBriefs**: Minimum 2 briefs, each with:
  - Min 3 skills per brief
  - Min 3 examples per brief
- **ProjectTwists**: Minimum 2 twists, each with min 2 examples
- **AdditionalSkills**: Minimum 1 category, each with min 1 skill

### Temporal Consistency

The validator enforces temporal consistency across all levels:

```
sum(module weeks) ≤ arc weeks ≤ course weeks
```

**Errors** are raised when:
- Sum of arc weeks exceeds course total weeks
- Sum of module weeks exceeds arc total weeks

**Warnings** are raised when:
- Sum of arc weeks is less than course total weeks (buffer/flexibility)
- Sum of module weeks is less than arc total weeks (buffer/flexibility)

---

## Usage

### Validating Course XML

```typescript
import { validateCourseXML, validateAndSummarize } from '$lib/schemas/courseValidator';

// Basic validation
const result = validateCourseXML(xmlString);
if (result.valid) {
  console.log('✓ Course XML is valid');
} else {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}

// With summary
const summary = validateAndSummarize(xmlString);
console.log(summary.summary); // Human-readable summary
console.log(`${summary.errorCount} errors, ${summary.warningCount} warnings`);
```

### Generating Course XML

Currently implemented in `outputSerialiser.ts` (lightweight version). Full implementation with embedded modules pending (Themis 2.3).

```typescript
import { serialiseCourseToXml } from '$lib/utils/validation/outputSerialiser';
import type { CourseData } from '$lib/types/themis';

// Convert CourseData to XML
const xmlString = serialiseCourseToXml(courseData);

// Validate before export
const validation = validateCourseXML(xmlString);
if (!validation.valid) {
  console.error('Generated XML failed validation:', validation.errors);
}
```

---

## Comparison: Course XML vs Module XML

| Aspect | Module XML | Course XML |
|--------|-----------|-----------|
| **Root Element** | `<Module>` | `<Course>` |
| **Scope** | Single module specification | Complete course with multiple modules |
| **Structure** | Flat (single level) | Hierarchical (Course → Arc → Module) |
| **Thematic Organization** | None | Arc-based themes with narratives |
| **Temporal Tracking** | No duration | Full temporal tracking at all levels |
| **Cardinality** | Module-specific (3+ objectives, 5+ topics) | Inherited + course-level (1+ arcs, 1+ modules) |
| **Validator** | `moduleValidator.ts` | `courseValidator.ts` (calls module validator) |
| **Template** | `metis/outputSchema.xml` | `themis/courseSchema.xml` |
| **Use Case** | Standalone module generation (Metis) | Complete course generation (Themis) |

---

## Integration Points

### Themis Workflow

1. **Course Structure Generation** (Steps 1-4):
   - User configures course parameters
   - AI generates arc and module structure
   - User reviews and edits structure
   
2. **Module Generation** (Step 5):
   - For each module, generate full specification
   - Store in `ModuleSlot.moduleData.xmlContent`
   
3. **Course Export** (Step 6) - **PENDING IMPLEMENTATION**:
   - Serialize complete CourseData to Course XML
   - Embed each module's XML content into ModuleSpecification
   - Validate with `courseValidator.ts`
   - Download as `.xml` file

### Metis Integration

Modules generated in Metis produce XML matching the `<ModuleSpecification>` section. When Metis modules are used in Themis:

1. Metis generates module XML (root: `<Module>`)
2. Themis stores XML in `ModuleSlot.moduleData.xmlContent`
3. During course export, Metis XML is embedded in Course XML `<ModuleSpecification>` section

### Theia Integration

**Current (JSON-based)**:
- Theia exports/imports JSON representation of CourseData
- Supports round-trip: Themis → export JSON → upload → continue

**Future (XML-based)**:
- Upload Course XML → parse → resume Themis workflow
- Upload Module XML → parse → resume Metis workflow
- Validate on upload using appropriate validator

---

## Best Practices

### 1. Always Validate Before Export

```typescript
// ✓ Good
const xmlString = serialiseCourseToXml(courseData);
const validation = validateCourseXML(xmlString);
if (!validation.valid) {
  throw new Error(`Invalid XML: ${validation.errors.join(', ')}`);
}
downloadXml(xmlString);

// ✗ Bad
const xmlString = serialiseCourseToXml(courseData);
downloadXml(xmlString); // No validation!
```

### 2. Handle Warnings Appropriately

Warnings are non-blocking but indicate potential issues:

```typescript
const result = validateCourseXML(xmlString);
if (result.warnings.length > 0) {
  console.warn('Course XML has warnings:', result.warnings);
  // Optionally prompt user to review
}
```

### 3. Preserve Temporal Consistency

When editing course structure, ensure temporal math remains valid:

```typescript
function updateArcWeeks(arc: Arc, newWeeks: number) {
  const moduleWeeksSum = arc.modules.reduce((sum, m) => sum + m.durationWeeks, 0);
  
  if (newWeeks < moduleWeeksSum) {
    throw new Error(
      `Arc weeks (${newWeeks}) cannot be less than sum of module weeks (${moduleWeeksSum})`
    );
  }
  
  arc.durationWeeks = newWeeks;
}
```

### 4. Use Metadata for Provenance

Always populate Metadata sections for tracking:

```typescript
<Metadata>
  <GenerationInfo>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <Source>AI-Generated</Source>
    <Model>Claude Sonnet 4.5</Model>
    <Generator>Themis v1.0</Generator>
  </GenerationInfo>
  <Changelog>
    <Change>
      <Section>Arc[2]/Module[1]/ModuleObjectives</Section>
      <Type>content_update</Type>
      <Confidence>high</Confidence>
      <Summary>Added objective on API integration</Summary>
      <Rationale>Aligns with project brief requirements</Rationale>
    </Change>
  </Changelog>
</Metadata>
```

### 5. Self-Closing vs Full Module Elements

For planned but not yet generated modules:

```xml
<!-- Self-closing: module not yet generated -->
<Module order="1" in_arc="1" name="" weeks="4" days="20" />

<!-- Full: module has been generated -->
<Module order="1" in_arc="1" name="Generated Module" weeks="4" days="20">
  <ModuleDescription>...</ModuleDescription>
  <ModuleProps>...</ModuleProps>
  <ModuleSpecification>...</ModuleSpecification>
</Module>
```

The validator will warn on self-closing modules but not error.

---

## Error Handling

### Common Validation Errors

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `Root element must be <Course>` | Wrong root tag | Ensure XML starts with `<Course>` |
| `Course must contain at least one <Arc>` | Empty course | Add at least one arc with modules |
| `module must have at least 3 objectives` | Insufficient objectives | Add more objectives to ModuleSpecification |
| `module must have at least 5 primary research topics` | Insufficient topics | Add more research topics |
| `sum of arc weeks exceeds course total weeks` | Temporal inconsistency | Adjust arc/course weeks to be consistent |
| `Structure must be either "facilitated" or "peer-led"` | Invalid structure value | Use exact string "facilitated" or "peer-led" |

### Debugging Validation Failures

```typescript
const result = validateCourseXML(xmlString);

if (!result.valid) {
  console.group('Validation Errors:');
  result.errors.forEach((error, i) => {
    console.log(`${i + 1}. ${error}`);
  });
  console.groupEnd();
  
  console.group('Validation Warnings:');
  result.warnings.forEach((warning, i) => {
    console.log(`${i + 1}. ${warning}`);
  });
  console.groupEnd();
}
```

---

## Future Enhancements

### Themis 2.3: Complete XML Export Implementation

**Objective**: Full course XML export with embedded modules

**Tasks**:
1. Enhance `serialiseCourseToXml()` to embed module XML content
2. Transform Metis XML (`<Module>` root) to Course XML (`<ModuleSpecification>` wrapper)
3. Validate complete output with `courseValidator.ts`
4. Update download functionality

### Theia XML Upload

**Objective**: Upload Course/Module XML and resume workflows

**Tasks**:
1. XML parser and type detection (Course vs Module)
2. XML → TypeScript type conversion
3. Validation on upload
4. Integration with Themis/Metis workflows

### Schema Versioning

**Objective**: Support schema evolution with backward compatibility

**Proposals**:
- Add `version` attribute to `<Course>` root
- Implement version-specific validators
- Migration utilities for older schemas

---

## References

- **Module XML Schema**: `src/data/templates/metis/outputSchema.xml`
- **Module Validator**: `src/lib/schemas/moduleValidator.ts`
- **CourseData Types**: `src/lib/types/themis.ts`
- **Current Course Serializer**: `src/lib/utils/validation/outputSerialiser.ts`
- **Themis Roadmap**: `docs/dev/roadmap/Themis-MVP.md`

---

## Changelog

### 2025-10-28: v1.0 - Initial Implementation

- Created course XML schema template (`courseSchema.xml`)
- Implemented comprehensive course validator (`courseValidator.ts`)
- Added 15 test cases covering all validation requirements
- Documented schema structure and usage patterns
- Established temporal consistency validation

**Files Changed**:
- `src/data/templates/themis/courseSchema.xml` (new, 342 lines)
- `src/lib/schemas/courseValidator.ts` (new, 641 lines)
- `src/lib/schemas/courseValidator.test.ts` (new, 669 lines)
- `docs/dev/course-xml-specification.md` (this file)

**Status**: ✅ Themis Task 2.2 Complete