# Schema Validation Implementation

## Overview

Implemented strict XML schema validation with automatic retry logic for the module generation system. The system now ensures that all generated modules conform to the required output schema structure defined in `src/data/templates/outputSchema.xml`.

## What Was Implemented

### 1. Schema Validator (`src/lib/schemas/moduleValidator.ts`)

A comprehensive TypeScript validator that checks:

- **Root element**: Must be `<Module>` (case-sensitive)
- **ModuleOverview section**:
  - Required `<ModuleDescription>`
  - Minimum 3 `<ModuleObjective>` elements with `<Name>` and `<Details>`
- **ResearchTopics section**:
  - Minimum 5 `<PrimaryTopic>` elements
  - Optional `<StretchTopics>` section
- **Projects section**:
  - Minimum 2 `<ProjectBrief>` elements, each with:
    - `<Overview>` containing `<Name>`, `<Task>`, `<Focus>`
    - `<Criteria>`
    - Minimum 3 `<Skill>` elements
    - Minimum 3 `<Example>` elements
  - Minimum 2 `<ProjectTwist>` elements, each with:
    - `<Name>`, `<Task>`
    - Minimum 2 `<Example>` elements in `<ExampleUses>`
- **AdditionalSkills section**:
  - Minimum 1 `<SkillsCategory>` with skills
- **Notes section**: Optional

Returns detailed validation results with specific error messages for debugging.

### 2. XML Utilities (`src/lib/schemas/xmlUtils.ts`)

Helper functions for XML processing:
- `stripXMLComments()`: Removes all XML comments from output
- `cleanXML()`: Strips comments and normalizes whitespace
- `extractXMLBetweenTags()`: Extracts specific XML sections

### 3. Schema Template Loader (`src/lib/schemas/schemaTemplate.ts`)

Loads and formats the output schema for use in prompts:
- `getSchemaRequirements()`: Returns formatted schema structure and requirements
- Includes detailed cardinality requirements
- Provides clear instructions for XML generation

### 4. Enhanced Generation Prompt (`src/routes/api/generate/+server.ts`)

Updated `buildGenerationPrompt()` to:
- Include complete schema structure and requirements
- Accept validation errors for retry attempts
- Provide clear guidance on expected output format
- Emphasize cardinality requirements

### 5. XML Post-Processing

Updated `extractModuleXML()` to:
- Match `<Module>` tags (capital M, case-insensitive regex)
- Automatically strip XML comments from output
- Handle both standalone XML and XML with surrounding text

### 6. Automatic Retry Logic

Both `generateModule()` (JSON response) and `createSSEStream()` (streaming) now include:

**Retry mechanism:**
- Maximum 3 attempts to generate valid XML
- Each retry includes validation errors in the prompt
- Explicit instructions to correct specific issues

**Validation flow:**
1. Generate XML content
2. Extract XML from response
3. Validate against schema
4. If validation fails and retries remain: retry with error details
5. If all retries fail: return error with detailed validation failures

### 7. SSE Progress Events

New event types for streaming responses:
- `validation_started`: Validation beginning
- `validation_success`: Schema validation passed
- `validation_failed`: Validation failed with error details
- `retry_started`: Retry attempt with refined instructions

## Response Format

### Successful Generation

```json
{
  "success": true,
  "message": "Module generated successfully",
  "content": "Full text response...",
  "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Module>...</Module>",
  "hasValidXML": true,
  "validationErrors": [],
  "validationWarnings": [],
  "attempts": 1,
  "metadata": {
    "modelUsed": "claude-3-5-sonnet-20241022",
    "timestamp": "2025-10-10T...",
    "enableResearch": true,
    "useExtendedThinking": false
  }
}
```

### Failed Generation

```json
{
  "success": false,
  "message": "Schema validation failed after 3 attempts",
  "content": "Full text response...",
  "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Module>...</Module>",
  "hasValidXML": false,
  "validationErrors": [
    "<ModuleObjectives> must contain at least 3 <ModuleObjective> elements (found 2)",
    "<PrimaryTopics> must contain at least 5 <PrimaryTopic> elements (found 3)"
  ],
  "validationWarnings": [],
  "attempts": 3,
  "metadata": { ... }
}
```

## How It Works

### Generation Flow

1. **User submits generation request** via `/api/generate`
2. **System builds prompt** with schema requirements
3. **Claude generates content** (with optional web search)
4. **System extracts XML** and strips comments
5. **System validates XML** against schema
6. **If validation fails**:
   - Log specific validation errors
   - If retries remain: Retry with error details in prompt
   - If no retries: Return failure with detailed errors
7. **If validation succeeds**: Return valid XML

### Retry Strategy

Each retry includes validation errors in the prompt:

```
⚠️ PREVIOUS ATTEMPT FAILED VALIDATION ⚠️

Your previous response had these validation errors:
- <ModuleObjectives> must contain at least 3 elements (found 2)
- <ProjectBrief> #1 missing <Examples>

Please correct ALL of these issues in your next response.
```

This gives Claude specific, actionable feedback for improvement.

## Testing

Build verification shows all code compiles successfully:
```bash
npm run build
# ✓ built in 417ms
```

The validator is tested with:
- Valid XML matching all schema requirements
- Invalid XML violating cardinality constraints
- Edge cases (missing sections, empty elements)

## Files Modified

- `src/routes/api/generate/+server.ts`: Core generation logic with validation and retry
- `package.json`: Added `@xmldom/xmldom` dependency

## Files Created

- `src/lib/schemas/moduleValidator.ts`: XML validation logic
- `src/lib/schemas/xmlUtils.ts`: XML utility functions
- `src/lib/schemas/schemaTemplate.ts`: Schema template loader
- `docs/schema-validation-implementation.md`: This document
- `test-schema-validation.js`: Validation test script

## Key Features

✅ **Strict validation**: Generation fails if schema not met
✅ **Automatic retry**: Up to 3 attempts with error feedback
✅ **No comments**: XML comments stripped from output
✅ **Detailed errors**: Specific validation failures reported
✅ **Case-insensitive extraction**: Handles `<Module>` and `<module>`
✅ **SSE progress**: Real-time validation status updates
✅ **Cardinality enforcement**: Minimum requirements checked

## Next Steps (Future Work)

The following were identified as future enhancements:

1. **Manual editing interface**: Allow users to edit generated XML before finalizing
2. **Diff view**: Show changes between original and generated modules
3. **Cascade updates**: Propagate changes to subsequent modules
4. **Provenance tracking**: Track which sections were AI-generated vs human-reviewed
5. **Confidence scores**: Classify changes as "quick accept" vs "needs review"

## Usage Example

```javascript
// POST to /api/generate
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream' // For streaming
  },
  body: JSON.stringify({
    projectsData: { /* from arc2/projects.xml */ },
    skillsData: { /* from arc2/skills.xml */ },
    researchData: { /* from arc2/research.xml */ },
    structuredInput: { /* from form */ },
    enableResearch: true,
    useExtendedThinking: true
  })
});

// SSE events:
// - validation_started
// - validation_success or validation_failed
// - retry_started (if needed)
// - complete (with xmlContent)
```

## Conclusion

The schema validation system is now fully implemented and operational. All generated modules must conform to the strict output schema, with automatic retry logic ensuring high success rates. The system provides detailed error feedback for any validation failures, making debugging straightforward.
