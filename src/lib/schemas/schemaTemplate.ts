/**
 * Output Schema Template Loader
 * Loads and formats the output schema for use in generation prompts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { stripXMLComments } from '$lib/utils/validation/xmlCleaner';

/**
 * Loads the output schema template and returns it as a clean string
 * Comments are preserved for this version (used in prompts)
 */
export function getOutputSchemaTemplate(): string {
	const schemaPath = join(process.cwd(), 'src', 'data', 'templates', 'outputSchema.xml');
	const schemaContent = readFileSync(schemaPath, 'utf-8');

	// Keep comments for the prompt template - they provide guidance
	return schemaContent.trim();
}

/**
 * Loads the output schema template with comments stripped
 * Used as an example of the clean output format
 */
export function getOutputSchemaTemplateClean(): string {
	const schemaTemplate = getOutputSchemaTemplate();
	return stripXMLComments(schemaTemplate).trim();
}

/**
 * Gets a formatted description of the schema requirements
 * Used to provide clear instructions in the generation prompt
 */
export function getSchemaRequirements(): string {
	return `
    <Rulesets>
      <Ruleset name="XML Structure">
        Your output must be valid XML matching the EXACT structure inside RequiredOutputStructure.
        Pay close attention to element names (case-sensitive) and nesting structure.
      </Ruleset>
      <Ruleset name="Cardinality Requirements">
        Minimum number of elements required:
        - LearningObjectives: At least 3 LearningObjective elements
        - PrimaryTopics: At least 5 Topic elements
        - Briefs: At least 2 Brief elements
        - Skills (per Brief): At least 3 Skill elements
        - Examples (per Brief): At least 3 Example elements
        - Twists: At least 2 Twist elements
        - Examples (per Twist): At least 2 Example elements
        - SkillsCategory: At least 1 category, each with at least 1 Skill
        - StretchTopics: Optional (0 or more Topic elements)
        - Notes: Optional (0 or more Note elements)
      </Ruleset>
      <Ruleset name="Changelog">
        - Document EVERY significant change you make (updates, additions, removals)
        - Be specific in <Section> identifiers (use XPath notation)
        - Explain WHY in <Rationale> - reference research, industry changes, or pedagogical reasoning
        - Include <ResearchSources> when you used web search to inform a decision
        - Set appropriate <Confidence> levels to help human reviewers prioritize
        - If you add/modify examples, note it as "examples_expanded"
        - If you update existing content for currency, note it as "content_update"
        - If you create entirely new sections, note it as "new_content"
      </Ruleset>
      <Ruleset name="General">
        1. Output ONLY valid XML - no explanatory text before or after
        2. Do NOT include any XML comments (<!-- ... -->) in your output
        3. Use proper XML entities (&amp; for &, &lt; for <, etc.)
        4. All tag names are case-sensitive and must match exactly
        5. Ensure all opening tags have matching closing tags
        6. All required sections must be present and populated
        7. Meet all minimum cardinality requirements
        8. ALWAYS include <Metadata> section with complete <Changelog>
        9. Document your reasoning in the changelog - this helps human reviewers
        10. CRITICAL: Do NOT generate "order", "count", or "*_count" attributes (e.g., skills_count, examples_count)
        11. ONLY include semantic attributes: "name", "importance", "type", "confidence", "section", "essential", "timestamp", "url"
        12. Self-closing tags are allowed for elements without content (e.g., <Skill name="..." importance="Stretch" />)
      </Ruleset>
    </Rulesets>
    <RequiredOutputStructure>
      <Module>
        <Metadata>
          <!-- REQUIRED: Document what changed, why, and with what confidence -->
          <GenerationInfo timestamp="ISO 8601 datetime (e.g. 2025-10-19T14:30:00Z)">
            <Source>AI-Generated</Source>
            <Model>claude-sonnet-4-5-20250929</Model>
            <InputSources>
              <InputFile type="projects">projects.xml</InputFile>
              <InputFile type="skills">skills.xml</InputFile>
              <InputFile type="research">research.xml</InputFile>
            </InputSources>
          </GenerationInfo>
          <Changelog>
            <!-- Document EVERY significant change you make to the input materials -->
            <!-- Be specific about what changed and WHY -->
            <Change
              section="XPath identifier (e.g. LearningObjectives/LearningObjective[1])"
              type="content_update" | "examples_expanded" | "new_content" | "removed" | "reordered"
              confidence="high" | "medium" | "low"
            >
              <Summary>One sentence: what changed</Summary>
              <Rationale>
                1-3 sentences explaining WHY this change was made.
                Reference research findings, industry changes, or pedagogical decisions.
              </Rationale>
              <ResearchSources>
                <Source url="https://...">
                  Title/description of research source
                </Source> <!-- Repeat Source for all applicable sources -->
              </ResearchSources>
            </Change> <!-- Repeat <Change> for each significant modification -->
          </Changelog>
          <ProvenanceTracking>
            <AIUpdate count="1" />
            <SectionsNeedingReview>
              <!-- List any low-confidence changes that need human review -->
              <Section confidence="low">Section identifier if applicable</Section>
            </SectionsNeedingReview>
          </ProvenanceTracking>
        </Metadata>

        <Description>What topics this module covers and what we'll build</Description>

        <LearningObjectives>
          <!-- REQUIRED: At least 3 LearningObjective elements -->
          <LearningObjective name="Quick memorable name for the objective">
            An explanation of the practical skills & theoretical knowledge learners will have
          </LearningObjective> <!-- Repeat LearningObjective for each learning objective -->
        </LearningObjectives>
        <ResearchTopics>
          <PrimaryTopics>
            <!-- REQUIRED: At least 5 Topic elements -->
            <Topic name="Name of topic">
              <!-- REQUIRED --> Description of topic
              <!-- IF (no SubTopic elements) { REQUIRED } --> guidance for how to start researching it
              <SubTopic name="Name of subtopic">
                Description of topic to research, including:
                1. guidance for how to start researching it
                2. suggestion for subdividing the topic if multiple learners tackle it
              </SubTopic> <!-- Repeat SubTopic for each subtopic -->
            </Topic> <!-- Repeat Topic for each primary topic -->
          </PrimaryTopics>
          <StretchTopics>
            <!-- REQUIRED: StretchTopics element -->
            <!-- OPTIONAL: Topic elements with actual content -->
            <Topic name="name of stretch topic" /> <!-- NOTE: StretchTopics children can be self-closing -->
          </StretchTopics>
        </ResearchTopics>
        <Projects>
          <Briefs>
            <!-- REQUIRED: At least 2 Brief elements -->
            <Brief name="Name of Project">
              <Task>One sentence description of successful outcome</Task>
              <Focus>Techniques & technologies that will help achieve the task</Focus>
              <Criteria>Bullet point list of success criteria</Criteria>
              <Skills>
                <!-- REQUIRED: At least 3 Skill elements per Brief -->
                <Skill name="name of skill, technology or technique">
                  Bullet point list of criteria, guidance and explanation
                </Skill> <!-- Repeat Skill for each skill -->
              </Skills>
              <Examples>
                <!-- REQUIRED: At least 3 Example elements per Brief -->
                <Example name="Memorable name of example">
                  Brief description of example
                </Example> <!-- Repeat Example for each example -->
              </Examples>
            </Brief> <!-- Repeat Brief for each project brief -->
          </Briefs>

          <Twists>
            <!-- REQUIRED: At least 2 Twist elements -->
            <Twist name="Memorable name of twist">
              <Task>Challenge that the twist poses</Task>
              <Examples>
                <!-- REQUIRED: At least 2 Example elements per Twist -->
                <Example>Brief description of example</Example> <!-- Repeat Example for each example -->
              </Examples>
            </Twist> <!-- Repeat Twist for each twist -->
          </Twists>
        </Projects>
        <AdditionalSkills>
          <!-- REQUIRED: At least 1 SkillsCategory -->
          <SkillsCategory name="Name of Category (e.g. Python)">
            <Overview>Explanation of skill category & why it's included</Overview>
            <Skill name="Memorable name of skill" importance="Essential | Recommended | Stretch">
              <!-- IMPORTANT: 'importance="Essential"' should be very rarely used -->
            </Skill> <!-- repeat Skill for each skill -->
          </SkillsCategory> <!-- repeat SkillsCategory for each category -->
        </AdditionalSkills>
        <Notes>
          <!-- GUIDE: Any content that doesn't fit within the schema. Use sparingly. -->
          <!-- IMPORTANT: All content must be separated into Note blocks -->
          <Note></Note>
        </Notes>
      </Module>
    </RequiredOutputStructure>
    <Guidance>
      <ConfidenceLevel>
        <High>Factual updates (API changes, deprecated features, version bumps, documentation updates)</High>
        <Medium>Framework/library updates that may evolve rapidly, industry trend adaptations</Medium>
        <Low>Pedagogical decisions, new content additions, subjective improvements, structural changes</Low>
      </ConfidenceLevel>
    <Guidance>
  `.trim();
}
