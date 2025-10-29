# Course XML Export

**Status:** ✅ Complete (2025-10-28)  
**Feature ID:** Themis 2.3  
**Dependencies:** Themis 2.2 (Course XML Schema and Validator)

---

## Overview

The Course XML Export feature enables users to export complete Themis-generated courses as structured XML documents. Each export includes:

- Complete course metadata (title, description, logistics, learner configuration)
- Arc-based thematic organization with narratives
- Full module specifications embedded from generated content
- Temporal information and duration tracking
- Validation against the course schema before download

This feature delivers the final product to users in a machine-readable, validatable format suitable for archiving, versioning, and integration with other systems.

---

## Features

### 1. Complete XML Generation

The export process generates a comprehensive XML document following the `courseSchema.xml` structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Course name="Course Title" doc_date="YYYY-MM-DD" doc_time="HHMM" version="1.0">
  <CourseProps>...</CourseProps>
  <CohortProps>...</CohortProps>
  <CourseDescription>...</CourseDescription>
  <CourseContent>
    <Arcs>
      <Arc>
        <ArcContent>
          <Modules>
            <Module>
              <ModuleSpecification>
                <!-- Full module content from Metis generation -->
              </ModuleSpecification>
            </Module>
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>
```

### 2. Embedded Module Specifications

Each module embeds its complete specification from the `moduleData.xmlContent` field, including:

- Module overview and learning objectives
- Research topics (primary and stretch)
- Project briefs with skills and examples
- Project twists with example uses
- Additional skills by category
- Metadata and changelog (if present)

Only modules with `status === 'complete'` include full specifications. Modules in other states include placeholder comments.

### 3. Pre-Export Validation

Before downloading, the XML content is validated against `courseValidator.ts`:

- **Schema validation:** Checks XML structure and required elements
- **Cardinality validation:** Verifies minimum counts (objectives, topics, etc.)
- **Temporal consistency:** Ensures module weeks ≤ arc weeks ≤ course weeks
- **Hierarchical integrity:** Validates Course → Arc → Module relationships

Validation results are displayed to the user:
- ✅ **Success:** XML downloads automatically, warnings shown if any
- ❌ **Failure:** Errors displayed, download blocked until issues resolved

### 4. User Interface

The export button is located in the CourseOverview component header:

- **Primary button:** "Export XML" - generates and validates XML
- **Secondary button:** "Export Preview" - uses Theia for JSON/HTML/Markdown formats
- **Disabled state:** Button disabled until all modules complete (`allComplete === true`)
- **Feedback banner:** Success/error banner shows validation results with collapsible details

---

## Technical Implementation

### File Structure

```
src/
├── lib/
│   ├── components/themis/
│   │   └── CourseOverview.svelte          # UI with export button
│   ├── schemas/
│   │   └── courseValidator.ts             # Validation logic
│   └── utils/validation/
│       └── outputSerialiser.ts            # XML generation
└── data/templates/themis/
    └── courseSchema.xml                   # Schema template
```

### Key Functions

#### `serialiseCourseToXml(course: CourseData): string`

**Location:** `src/lib/utils/validation/outputSerialiser.ts`

Converts a `CourseData` object to XML string:

1. Generates course metadata and properties
2. Serializes cohort assumptions and learner configuration
3. Converts course and arc narratives to paragraph elements
4. Iterates through arcs and modules
5. For each module, calls `serializeModule()` to embed specifications

**Output:** Complete XML string ready for validation and download

#### `serializeModule(lines, module, arcOrder, daysPerWeek): void`

Serializes a single module including its full specification:

1. Creates `<Module>` element with attributes (order, duration, status)
2. Adds module description and metadata
3. Embeds `<ModuleSpecification>` content:
   - Extracts inner XML from `module.moduleData.xmlContent`
   - Removes root `<Module>` tags (to avoid nesting)
   - Indents content appropriately (8 levels deep)
   - Preserves all module sections (objectives, research, projects, skills)

**Status handling:**
- `complete`: Full specification embedded
- Other statuses: Placeholder comment with status

#### `extractModuleSpecificationContent(xmlContent): string`

Extracts the inner content from module XML:

1. Parses XML using `DOMParser`
2. Finds root `<Module>` element
3. Serializes all child nodes (without root tags)
4. Returns cleaned, indented content

This ensures module specifications integrate seamlessly into the course hierarchy without duplicate `<Module>` tags.

#### `validateCourseXML(xmlString): ValidationResult`

**Location:** `src/lib/schemas/courseValidator.ts`

Validates the generated XML:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

Returns validation results used to:
- Display feedback to user
- Block download on critical errors
- Show warnings without blocking

---

## Usage

### From CourseOverview Component

1. Navigate to Themis → Generate Course → Step 6 (Course Overview)
2. Ensure all modules are complete (status `complete`)
3. Click "Export XML" button in header
4. Validation runs automatically:
   - ✅ Success: XML downloads with `.xml` extension
   - ❌ Failure: Error banner displays issues
5. Review validation feedback banner (auto-hides after 5 seconds on success)

### Filename Format

Generated filename: `YYYY-MM-DD-course-title-slug-course.xml`

Example: `2025-10-28-full-stack-web-development-course.xml`

---

## File Format Details

### Root Attributes

- `name`: Course title (escaped)
- `doc_date`: Current date (YYYY-MM-DD)
- `doc_time`: Current time (HHMM)
- `version`: Schema version (1.0)

### Metadata Sections

**CourseMetadata:**
- Generation timestamp (ISO 8601)
- Source: "AI-Generated"
- Model: "claude-sonnet-4-20250514"
- Generator: "Themis v1.0"
- Schema version: "1.0"

**CohortProps:**
- Cohort size and team configuration
- Learner prerequisites and experience level
- Team-based learning flag

**CourseTemporal:**
- Start/end dates
- Total weeks and days per week
- Duration calculations

### Module Specification Embedding

Each complete module includes all sections from `outputSchema.xml`:

- **ModuleOverview:** Description and objectives (min 3)
- **ResearchTopics:** Primary (min 5) and stretch topics
- **Projects:** Briefs (min 2) with skills (min 3 each) and examples (min 3 each)
- **ProjectTwists:** Twists (min 2) with examples (min 2 each)
- **AdditionalSkills:** Categories (min 1) with skills (min 1 per category)
- **Metadata:** Generation info, changelog, provenance tracking (if present)

---

## Validation Requirements

### Course-Level

- ✅ Course must have title, description, logistics, learners config
- ✅ Minimum 1 arc per course
- ✅ Temporal consistency: sum(module weeks) ≤ arc weeks ≤ course weeks

### Arc-Level

- ✅ Minimum 1 module per arc
- ✅ Arc must have description and theme
- ✅ Arc progression narrative required

### Module-Level

Each complete module specification must pass `moduleValidator.ts` checks:

- ✅ Minimum 3 learning objectives
- ✅ Minimum 5 primary research topics
- ✅ Minimum 2 project briefs
- ✅ Minimum 3 skills per brief
- ✅ Minimum 3 examples per brief
- ✅ Minimum 2 project twists
- ✅ Minimum 2 examples per twist
- ✅ Minimum 1 additional skills category
- ✅ Minimum 1 skill per category

---

## Error Handling

### Common Validation Errors

**Missing required elements:**
```
Missing required <CourseProps> element
Missing required <CohortProps> element
```

**Cardinality violations:**
```
Course must have at least 1 arc (found: 0)
Arc "Arc 1" must have at least 1 module (found: 0)
```

**Temporal inconsistencies:**
```
Module "Module 1" in Arc "Arc 1" has duration (3 weeks) exceeding arc duration (2 weeks)
Arc "Arc 1" has duration (5 weeks) exceeding course duration (4 weeks)
```

### Recovery Strategies

**For XML parsing errors:**
- Check module XML content for malformed syntax
- Validate individual modules before course export
- Review module generation logs for issues

**For cardinality violations:**
- Re-generate modules that failed validation during creation
- Check minimum counts in `outputSchema.xml`
- Verify all required sections present in module data

**For temporal inconsistencies:**
- Review course/arc/module duration settings
- Ensure module weeks sum ≤ arc weeks
- Verify arc weeks sum ≤ course weeks

---

## Integration Points

### With Metis (Module Generator)

- Reads `moduleData.xmlContent` from completed modules
- Preserves all Metis-generated sections (objectives, research, projects, skills)
- Maintains metadata and changelog if present

### With Theia (Content Preview & Export)

- XML export complements Theia's JSON/HTML/Markdown formats
- Both export buttons available in CourseOverview
- XML suitable for machine processing, Theia formats for human reading

### With Mnemosyne (Storage - Future)

- XML format ideal for course archiving
- Validates before storage to ensure quality
- Enables versioning and change tracking

---

## Future Enhancements

### Planned Improvements

1. **Individual module XML export** - Export single modules as standalone files
2. **PDF export from XML** - Transform XML to formatted PDF using XSLT
3. **Course import from XML** - Upload XML to resume/edit courses in Themis
4. **Batch export** - Export multiple courses at once
5. **Export analytics** - Track which courses are exported most frequently

### Schema Evolution

When `courseSchema.xml` updates:

1. Update `serialiseCourseToXml()` to match new structure
2. Update `courseValidator.ts` validation rules
3. Increment schema version attribute
4. Document breaking changes in migration guide
5. Test with existing course data for backward compatibility

---

## Testing

### Manual Testing Checklist

- [ ] Generate complete course with all modules
- [ ] Click "Export XML" button
- [ ] Verify validation success banner appears
- [ ] Check downloaded file exists with correct filename
- [ ] Open XML in editor and verify structure
- [ ] Validate XML against `courseSchema.xml` manually
- [ ] Test with incomplete course (should be disabled)
- [ ] Test with course containing errors (should show error banner)

### Automated Testing (Future)

- Unit tests for `serialiseCourseToXml()`
- Integration tests for CourseOverview export flow
- Validation tests against various course configurations
- Regression tests for schema compatibility

---

## Related Documentation

- [Course XML Schema Specification](../specifications/course-xml-specification.md)
- [Course Validator Implementation](../implementations/course-validator.md)
- [Themis Roadmap](../roadmap/Themis-MVP.md)
- [Theia Export Service](./theia-export.md)

---

## Changelog

### 2025-10-28 - Initial Implementation

- ✅ Complete XML serialization with embedded module specifications
- ✅ Pre-download validation with user feedback
- ✅ Export button in CourseOverview component
- ✅ Success/error banners with collapsible validation details
- ✅ Filename generation with course title slug
- ✅ Proper indentation and XML structure
- ✅ Temporal metadata and generation info
- ✅ Integration with existing course validator

**Files Changed:**
- `src/lib/utils/validation/outputSerialiser.ts` (complete rewrite, 448 lines)
- `src/lib/components/themis/CourseOverview.svelte` (+127 lines)
- `docs/dev/features/course-xml-export.md` (new)

**Implementation Notes:**
- Module specifications extracted and embedded without duplicate `<Module>` tags
- XML indentation maintains 2-space consistency throughout hierarchy
- Validation feedback auto-hides after 5 seconds on success
- Download blocked on validation errors (not warnings)