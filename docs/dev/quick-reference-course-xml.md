# Course XML Quick Reference

**Quick guide for validating and working with Themis course XML**

---

## Basic Usage

### Validate Course XML

```typescript
import { validateCourseXML } from '$lib/schemas/courseValidator';

const result = validateCourseXML(xmlString);
// Returns: { valid: boolean, errors: string[], warnings: string[] }
```

### Get Summary

```typescript
import { validateAndSummarize } from '$lib/schemas/courseValidator';

const summary = validateAndSummarize(xmlString);
console.log(summary.summary);
// "✓ Course XML is valid (2 warnings)" or
// "✗ Course XML validation failed (5 errors, 2 warnings)"
```

---

## Minimum Requirements

### Course Level
- ✓ At least 1 arc
- ✓ Structure: `"facilitated"` or `"peer-led"`
- ✓ CourseDescription with ≥1 paragraph
- ✓ CohortProps with prerequisites and experience

### Arc Level
- ✓ At least 1 module per arc
- ✓ Sequential ordering (1, 2, 3...)
- ✓ ArcDescription, ArcProps, ArcContent

### Module Level
- ✓ Sequential ordering within arc
- ✓ ModuleDescription, ModuleProps, ModuleSpecification

### Module Specification
- ✓ Min 3 objectives
- ✓ Min 5 primary research topics
- ✓ Min 2 project briefs (each: 3+ skills, 3+ examples)
- ✓ Min 2 project twists (each: 2+ examples)
- ✓ Min 1 additional skills category

---

## Temporal Consistency

**Rule:** `sum(module weeks) ≤ arc weeks ≤ course weeks`

**Errors when:**
- Arc weeks exceed course weeks
- Module weeks exceed arc weeks

**Warnings when:**
- Sum is less than parent (indicates buffer/flexibility)

---

## Common Validation Errors

| Error | Fix |
|-------|-----|
| `Root element must be <Course>` | Use `<Course>` as root tag |
| `Course must contain at least one <Arc>` | Add at least one arc |
| `module must have at least 3 objectives` | Add more objectives |
| `module must have at least 5 primary research topics` | Add more topics |
| `sum of arc weeks exceeds course total weeks` | Adjust weeks to be consistent |
| `Structure must be "facilitated" or "peer-led"` | Use exact string value |

---

## Error vs Warning

**Errors** (block validation):
- Missing required elements
- Invalid attribute values
- Cardinality violations (too few objectives/topics/etc)
- Temporal inconsistency (child > parent)

**Warnings** (non-blocking):
- Missing optional metadata
- Count attribute mismatch
- Temporal buffer (child < parent)
- Empty/self-closing modules

---

## XML Structure Cheatsheet

```xml
<Course name="" doc_date="" doc_time="" version="1.0">
  <CourseProps arcs="" modules="" weeks="" days="">
    <CourseMetadata />
    <CourseLogistics><TotalArcs/><TotalModules/><Structure/></CourseLogistics>
    <CourseTemporal><TotalWeeks/><DaysPerWeek/><TotalDays/></CourseTemporal>
  </CourseProps>
  <CohortProps learners="">
    <CohortAssumptions><AssumedCohortSize/></CohortAssumptions>
    <LearnerPrerequisites/>
    <LearnerExperience><PrereqLevel/><FocusArea/></LearnerExperience>
  </CohortProps>
  <CourseDescription><DescriptionParagraph/></CourseDescription>
  <CourseContent>
    <CourseProgression />
    <Arcs>
      <Arc order="" name="" modules="" weeks="">
        <ArcDescription />
        <ArcProps><ArcLogistics/><ArcTemporal/></ArcProps>
        <ArcContent>
          <Themes><ArcTheme/></Themes>
          <ArcProgression />
          <Modules>
            <Module order="" in_arc="" name="" weeks="">
              <ModuleDescription />
              <ModuleProps><ModuleTemporal/></ModuleProps>
              <ModuleSpecification>
                <ModuleOverview><ModuleObjectives/></ModuleOverview>
                <ResearchTopics><PrimaryTopics/></ResearchTopics>
                <Projects><ProjectBriefs/><ProjectTwists/></Projects>
                <AdditionalSkills><SkillsCategory/></AdditionalSkills>
              </ModuleSpecification>
            </Module>
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>
```

---

## File Locations

- **Schema Template:** `src/data/templates/themis/courseSchema.xml`
- **Validator:** `src/lib/schemas/courseValidator.ts`
- **Tests:** `src/lib/schemas/courseValidator.test.ts`
- **Full Docs:** `docs/dev/course-xml-specification.md`

---

## Quick Debug Pattern

```typescript
const result = validateCourseXML(xmlString);

if (!result.valid) {
  console.error('Validation Errors:');
  result.errors.forEach((e, i) => console.error(`${i + 1}. ${e}`));
  
  console.warn('Validation Warnings:');
  result.warnings.forEach((w, i) => console.warn(`${i + 1}. ${w}`));
}
```

---

## Self-Closing vs Full Modules

```xml
<!-- Planned but not generated -->
<Module order="1" in_arc="1" name="" weeks="4" />

<!-- Fully generated -->
<Module order="1" in_arc="1" name="Module Title" weeks="4">
  <ModuleDescription>...</ModuleDescription>
  <ModuleProps>...</ModuleProps>
  <ModuleSpecification>...</ModuleSpecification>
</Module>
```

Validator warns on self-closing modules but doesn't error.

---

## Integration Points

**Themis 2.3 (XML Export):**
```typescript
// 1. Serialize course to XML
const xmlString = serialiseCourseToXml(courseData);

// 2. Validate
const validation = validateCourseXML(xmlString);
if (!validation.valid) {
  throw new Error('Invalid XML: ' + validation.errors.join(', '));
}

// 3. Download
downloadCourseXml(courseData);
```

**Theia (XML Upload - Future):**
```typescript
// 1. Upload XML file
const xmlString = await file.text();

// 2. Validate
const validation = validateCourseXML(xmlString);
if (!validation.valid) {
  showErrors(validation.errors);
  return;
}

// 3. Parse and resume workflow
const courseData = parseXmlToCourseData(xmlString);
```

---

## Related Documentation

- **Full Specification:** `docs/dev/course-xml-specification.md`
- **Module XML Schema:** `src/data/templates/metis/outputSchema.xml`
- **Module Validator:** `src/lib/schemas/moduleValidator.ts`
- **Themis Types:** `src/lib/types/themis.ts`
