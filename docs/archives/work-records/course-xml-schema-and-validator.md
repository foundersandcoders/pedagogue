# Module XML Schema, Validation, and Course Structure Analysis

## 1. MODULE XML STRUCTURE

The module XML schema is defined in /Users/jasonwarren/code/rhea/src/data/templates/metis/outputSchema.xml and has the following root-level
structure:

```xml
<Module>
  <Metadata> <!--OPTIONAL-->
    <GenerationInfo>
      <Timestamp/>
      <Source/>
      <Model/>
      <InputSources/>
    </GenerationInfo>
    <Changelog/>
    <ProvenanceTracking/>
  </Metadata>
  <ModuleOverview>
    <ModuleDescription/>
    <ModuleObjectives>
      <ModuleObjective> (min 3)
        <Name />
        <Details />
      </ModuleObjective>
    </ModuleObjectives>
  </ModuleOverview>
  <ResearchTopics>
    <PrimaryTopics>
      <PrimaryTopic> <!--min 5-->
        <TopicName/>
        <TopicDescription/>
      </PrimaryTopic>
    </PrimaryTopics>
    <StretchTopics> <!--OPTIONAL-->
      <StretchTopic/>
    </StretchTopics>
  </ResearchTopics>
  <Projects>
    <ProjectBriefs>
      <ProjectBrief> <!--min 2-->
        <Overview>
          <Name/>
          <Task/>
          <Focus/>
        </Overview>
        <Criteria/>
        <Skills>
          <Skill> <!--min 3-->
            <Name/>
            <Details/>
          </Skill>
        </Skills>
        <Examples>
          <Example> <!--min 3-->
            <Name/>
            <Description/>
          </Example>
        </Examples>
      </ProjectBrief>
    </ProjectBriefs>
    <ProjectTwists>
      <ProjectTwist> <!--min 2-->
        <Name/>
        <Task/>
        <ExampleUses>
          <Example/>
        </ExampleUses>
      </ProjectTwist>
    </ProjectTwists>
  </Projects>
  <AdditionalSkills>
    <SkillsCategory> <!--at least 1-->
      <Name/>
      <Skill> <!--at least 1 per category-->
        <SkillName/>
        <Importance/>
        <SkillDescription/>
      </Skill>
    </SkillsCategory>
  </AdditionalSkills>
  <Notes/> <!--OPTIONAL-->
</Module>
```

### Key Validation Requirements (from `moduleValidator.ts`):

- Root element must be <Module>
- Min 3 learning objectives with name attribute and content
- Min 5 primary research topics with name attribute
- Optional stretch topics
- Min 2 project briefs, each with:
  - Task, Focus, Criteria (required)
  - Min 3 skills per brief
  - Min 3 examples per brief
- Min 2 project twists, each with:
  - Task (required)
  - Min 2 examples
- Min 1 additional skills category, each with at least 1 skill

---

## 2. VALIDATION IMPLEMENTATION

File: /Users/jasonwarren/code/rhea/src/lib/schemas/moduleValidator.ts

The validator uses @xmldom/xmldom for both browser and Node.js compatibility and returns a ValidationResult interface:

```ts
interface ValidationResult {
  valid: boolean;
  errors: string[];    // Blocking validation failures
  warnings: string[]; // Non-blocking issues (e.g., missing optional Metadata)
}
````

Validation Pattern:
1. Parse XML string using DOMParser
2. Check for XML parsing errors
3. Validate root element is <Module>
4. Validate each section recursively:
  - Description (required)
  - Learning Objectives (required, min 3)
  - Research Topics (required, min 5 primary)
  - Projects (required, min 2 briefs + min 2 twists)
  - Additional Skills (required, min 1 category)
  - Metadata (optional, but generates warnings if missing)

Key Pattern: Validators use getElementsByTagName() to find children and validate both attributes and text content. This allows flexibility in XML
structure while enforcing cardinality constraints.

---

## 3. COURSE DATA STRUCTURE (Themis)

File: /Users/jasonwarren/code/rhea/src/lib/types/themis.ts

### CourseData (Top-level)

```ts
interface CourseData {
  id: string;                           // UUID
  title: string;
  description: string;
  logistics: {
    totalWeeks: number;
    daysPerWeek: number;
    startDate?: string;                 // Optional
  };
  learners: {
    cohortSize: number;
    teamBased: boolean;
    teamSize?: number;
    prerequisites: string;
    experience: {
      prereq: '<= 1 year' | '1-3 years' | '>= 4 years';
      focus: 'no experience' | 'limited experience' | 'skilled amateur' | 'current professional';
    };
  };
  structure: 'facilitated' | 'peer-led';  // Key pedagogical choice
  arcs: Arc[];                             // Thematic organizational layer
  courseNarrative?: string;               // AI-generated overall narrative
  progressionNarrative?: string;          // How arcs connect temporally
  createdAt: Date;
  updatedAt: Date;
}
````

### Arc (Thematic Container)

```ts
interface Arc {
  id: string;                             // UUID
  order: number;                          // 1, 2, 3...
  titleInput: TitleInput;                 // Supports AI generation or literal
  title: string;                          // Current/finalized title
  description: string;
  themeInput: TitleInput;                 // Supports AI generation or literal
  theme: string;                          // Current/finalized theme
  durationWeeks: number;
  arcThemeNarrative?: string;            // AI narrative explaining thematic focus
  arcProgressionNarrative?: string;      // How modules within arc connect
  modules: ModuleSlot[];                 // Modules within this arc
}
````

### ModuleSlot (Module Reference within Arc)

```ts
interface ModuleSlot {
  id: string;                             // UUID
  arcId: string;                          // Reference to parent arc
  order: number;                          // Order within arc (1, 2, 3...)
  titleInput: TitleInput;                 // Supports AI generation
  title: string;                          // Current/finalized title
  description: string;
  themeInput?: TitleInput;                // Optional theme
  theme?: string;
  durationWeeks: number;
  status: 'planned' | 'overview-ready' | 'generating' | 'complete' | 'error';
  lastAttemptedGeneration?: 'overview' | 'full'; // Retry tracking
  overview?: ModuleOverview;              // Lightweight generation before full module
  learningObjectives?: string[];          // Deprecated - use overview
  keyTopics?: string[];                   // Deprecated - use overview
  moduleData?: {
    xmlContent: string;                   // Full module specification (XML)
    generatedAt: Date;
  };
  inputFiles?: {
    projectsData?: any;
    skillsData?: any;
    researchData?: any;
  };
  errorMessage?: string;
}
````

### ModuleOverview (Lightweight Pre-generation)

```ts
interface ModuleOverview {
  generatedTitle?: string;                // AI-suggested title
  generatedTheme?: string;                // AI-suggested theme
  learningObjectives: string[];           // What learners will gain
  prerequisites: string[];                // What learners need first
  keyConceptsIntroduced: string[];       // Main new topics
  generatedAt: Date;
}
````

### Key Relationships

- CourseData → many Arc[] (thematic organization)
- Arc → many ModuleSlot[] (temporal sequence)
- ModuleSlot.moduleData.xmlContent → Full module XML (from Metis)
- Total course weeks = sum of arc weeks = sum of all module weeks

---

## 4. EXISTING EXPORT FUNCTIONALITY

Course XML Export

File: /Users/jasonwarren/code/rhea/src/lib/utils/validation/outputSerialiser.ts

### Current Course XML Schema (wraps CourseData structure):

```xml
<Course name="..." doc_date="YYYY-MM-DD" doc_time="HHMM">
  <CourseProps arcs="N" modules="N" weeks="N" days="N">
    <CourseMetadata/>
    <CourseLogistics arcs="N" modules="N">
      <TotalArcs/>
      <TotalModules/>
    </CourseLogistics>
    <CourseTemporal weeks="N" days="N" start_date="..." end_date="...">
      <StartDate />
      <TotalWeeks />
      <DaysPerWeek />
      <TotalDays />
      <EndDate />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="N" learners_type="assumed">
    <CohortAssumptions learners="N">
      <AssumedCohortSize/>
      <AssumedTeamSize/>
    </CohortAssumptions>
  </CohortProps>
  <CourseDescription paragraphs="N">
    <DescriptionParagraph order="1"/>
  </CourseDescription>
  <CourseContent arcs="N" modules="N">
    <CourseProgression paragraphs="N">
      <ProgressionParagraph/>
    </CourseProgression>
    <Arcs count="N">
      <Arc order="N" name="..." modules="N" weeks="N">
        <ArcDescription paragraphs="N">
          <DescriptionParagraph/>
        </ArcDescription>
        <ArcProps>
          <ArcMetadata />
          <ArcLogistics modules="N" />
          <ArcTemporal weeks="N" days="N">
            <StartDate />
            <EndDate />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="N" themes="1">
          <Themes count="1">
            <ArcTheme name="..." order="1"/>
          </Themes>
          <ArcProgression>
            <ArcProgressionNarrative/>
          </ArcProgression>
          <Modules count="N">
            <Module in_arc="N" order="N" name="..." weeks="N" days="N">
              <ModuleDescription/>
              <ModuleProps>
                <ModuleMetadata />
                <ModuleTemporal>
                  <StartDate />
                  <TotalWeeks />
                  <EndDate />
                </ModuleTemporal>
              </ModuleProps>
              <ModuleContent learning_objectives="N" key_topics="N" projects="0">
                <ModuleLearningObjectives count="N">
                  <LearningObjective order="N"/>
                </ModuleLearningObjectives>
                <ModuleKeyTopics count="N">
                  <KeyTopic order="N"/>
                </ModuleKeyTopics>
                <ModuleProjects count="0" />
              </ModuleContent>
            </Module>
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>
```

Export Functions:
- serialiseCourseToXml(course: CourseData): string - Convert to XML
- generateXmlFilename(course: CourseData): string - Date-based filename
- downloadCourseXml(course: CourseData): void - Browser download trigger

### Theia Content Exporter

File: /Users/jasonwarren/code/rhea/src/lib/services/theiaService.ts

Handles export in multiple formats (markdown, HTML, JSON) at various detail levels (minimal, summary, detailed, complete) for both courses and
individual modules.

Export Pattern:
1. Content mapping (XML/data → typescript structure)
2. Format conversion (markdown/HTML/JSON)
3. Filename generation (date-prefix + sanitized title)
4. Browser download via Blob

---

## 5. KEY INSIGHTS FOR COURSE XML SCHEMA DESIGN

### Current Gaps I've Identified:

1. Module Content Not Embedded: Current course XML only contains lightweight module metadata (title, description, objectives, topics). The full
module XML (with projects, twists, additional skills) is stored separately in ModuleSlot.moduleData.xmlContent.
2. No Module References in Course XML: The existing outputSerialiser.ts creates a course-level overview XML but doesn't embed or reference the full
module specifications.
3. Thematic Structure Preserved: The Arc → ModuleSlot hierarchy is already well-modeled, so course XML should preserve this hierarchical structure.

### Design Recommendations:

For a course-level XML schema that wraps complete modules:

1. Decide on embedding strategy:
  - Shallow: Reference module XML files (xref/link approach)
  - Deep: Embed full module XML as child elements
  - Hybrid: Include module overview + xref to full spec
2. Preserve hierarchy:
  - Maintain Arc → Module nesting
  - Include arc thematic narratives
  - Include progression narratives
3. Follow existing patterns:
  - Use attributes for metadata and counts (doc_date, order, name, weeks)
  - Use child elements for content (descriptions, narratives, objectives)
  - Use plural tags for collections (Arcs, Modules, LearningObjectives)
  - Use count attributes for cardinality validation
4. Validation structure: Create a courseValidator.ts pattern that validates:
  - Course-level requirements (title, logistics, learners, structure)
  - Arc requirements (order, title, theme, duration)
  - Module requirements (order, title, duration, status)
  - Temporal consistency (module weeks ≤ arc weeks ≤ course weeks)

---

## 6. File Paths Reference:

- Module Schema: /Users/jasonwarren/code/rhea/src/data/templates/metis/outputSchema.xml
- Module Validator: /Users/jasonwarren/code/rhea/src/lib/schemas/moduleValidator.ts
- Themis Types: /Users/jasonwarren/code/rhea/src/lib/types/themis.ts
- Themis Stores: /Users/jasonwarren/code/rhea/src/lib/stores/themisStores.ts
- Course XML Export: /Users/jasonwarren/code/rhea/src/lib/utils/validation/outputSerialiser.ts
- Course Validation: /Users/jasonwarren/code/rhea/src/lib/utils/theia/courseValidator.ts
- Export Service: /Users/jasonwarren/code/rhea/src/lib/services/theiaService.ts
