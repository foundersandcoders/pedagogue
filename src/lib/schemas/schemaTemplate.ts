/**
 * Output Schema Template Loader
 * Loads and formats the output schema for use in generation prompts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { stripXMLComments } from './xmlUtils.js';

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
REQUIRED OUTPUT STRUCTURE:

Your output must be valid XML matching this EXACT structure:

<Module>
  <Metadata>
    <!-- REQUIRED: Document what changed, why, and with what confidence -->
    <GenerationInfo>
      <Timestamp>ISO 8601 datetime (e.g. 2025-10-11T14:30:00Z)</Timestamp>
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
      <Change>
        <Section>XPath identifier (e.g. ModuleObjectives/Objective[1])</Section>
        <Type>content_update | examples_expanded | new_content | removed | reordered</Type>
        <Confidence>high | medium | low</Confidence>
        <Summary>One sentence: what changed</Summary>
        <Rationale>
          1-3 sentences explaining WHY this change was made.
          Reference research findings, industry changes, or pedagogical decisions.
        </Rationale>
        <ResearchSources>
          <Source url="https://...">Title/description of research source</Source>
          <!-- Include multiple sources if applicable -->
        </ResearchSources>
      </Change>
      <!-- Repeat <Change> for each significant modification -->
    </Changelog>

    <ProvenanceTracking>
      <AIUpdateCount>1</AIUpdateCount>
      <SectionsNeedingReview>
        <!-- List any low-confidence changes that need human review -->
        <Section confidence="low">Section identifier if applicable</Section>
      </SectionsNeedingReview>
    </ProvenanceTracking>
  </Metadata>

  <ModuleOverview>
    <ModuleDescription>
      What topics this module covers and what we'll build
    </ModuleDescription>

    <ModuleObjectives>
      <!-- REQUIRED: At least 3 ModuleObjective elements -->
      <ModuleObjective>
        <Name>Quick memorable name for the objective</Name>
        <Details>
          An explanation of the practical skills & theoretical knowledge learners will have
        </Details>
      </ModuleObjective>
      <!-- Repeat ModuleObjective for each objective -->
    </ModuleObjectives>
  </ModuleOverview>

  <ResearchTopics>
    <PrimaryTopics>
      <!-- REQUIRED: At least 5 PrimaryTopic elements -->
      <PrimaryTopic>
        <TopicName>Name of topic</TopicName>

        <TopicDescription>
          Description of topic to research, including:
          1. guidance for how to start researching it
          2. suggestion for subdividing the topic if multiple learners tackle it
        </TopicDescription>
      </PrimaryTopic>
      <!-- Repeat PrimaryTopic for each primary topic -->
    </PrimaryTopics>

    <StretchTopics>
      <!-- OPTIONAL: Stretch topics as natural extensions -->
      <StretchTopic>
        One sentence description of topic
      </StretchTopic>
    </StretchTopics>
  </ResearchTopics>

  <Projects>
    <ProjectBriefs>
      <!-- REQUIRED: At least 2 ProjectBrief elements -->
      <ProjectBrief>
        <Overview>
          <Name>Name of Project</Name>
          <Task>One sentence description of successful outcome</Task>
          <Focus>Techniques & technologies that will help achieve the task</Focus>
        </Overview>

        <Criteria>Bullet point list of success criteria</Criteria>

        <Skills>
          <!-- REQUIRED: At least 3 Skill elements per ProjectBrief -->
          <Skill>
            <Name>Memorable name of skill, technology or technique</Name>
            <Details>Bullet point list of criteria, guidance and explanation</Details>
          </Skill>
        </Skills>

        <Examples>
          <!-- REQUIRED: At least 3 Example elements per ProjectBrief -->
          <Example>
            <Name>Memorable name of example</Name>
            <Description>Brief description of example</Description>
          </Example>
        </Examples>
      </ProjectBrief>
    </ProjectBriefs>

    <ProjectTwists>
      <!-- REQUIRED: At least 2 ProjectTwist elements -->
      <ProjectTwist>
        <Name>Memorable name of twist</Name>
        <Task>Challenge that the twist poses</Task>
        <ExampleUses>
          <!-- REQUIRED: At least 2 Example elements per ProjectTwist -->
          <Example>
            Brief description of example
          </Example>
        </ExampleUses>
      </ProjectTwist>
    </ProjectTwists>
  </Projects>

  <AdditionalSkills>
    <!-- REQUIRED: At least 1 SkillsCategory -->
    <SkillsCategory>
      <Name>Name of Category (e.g. "Python")</Name>

      <Skill>
        <SkillName>Memorable name of skill</SkillName>
        <Importance>e.g. Recommended, Stretch etc</Importance>
        <SkillDescription>2 sentences maximum</SkillDescription>
      </Skill>
    </SkillsCategory>
  </AdditionalSkills>

  <Notes>
    Any content that doesn't fit within the schema. Use rarely.
  </Notes>
</Module>

CRITICAL CARDINALITY REQUIREMENTS:
- ModuleObjectives: minimum 3 ModuleObjective elements
- PrimaryTopics: minimum 5 PrimaryTopic elements
- ProjectBriefs: minimum 2 ProjectBrief elements
- Skills (per ProjectBrief): minimum 3 Skill elements
- Examples (per ProjectBrief): minimum 3 Example elements
- ProjectTwists: minimum 2 ProjectTwist elements
- ExampleUses (per ProjectTwist): minimum 2 Example elements
- SkillsCategory: minimum 1 category
- StretchTopics: optional section
- Notes: optional section

CONFIDENCE LEVEL GUIDANCE:
- HIGH: Factual updates (API changes, deprecated features, version bumps, documentation updates)
- MEDIUM: Framework/library updates that may evolve rapidly, industry trend adaptations
- LOW: Pedagogical decisions, new content additions, subjective improvements, structural changes

CHANGELOG REQUIREMENTS:
- Document EVERY significant change you make (updates, additions, removals)
- Be specific in <Section> identifiers (use XPath notation)
- Explain WHY in <Rationale> - reference research, industry changes, or pedagogical reasoning
- Include <ResearchSources> when you used web search to inform a decision
- Set appropriate <Confidence> levels to help human reviewers prioritize
- If you add/modify examples, note it as "examples_expanded"
- If you update existing content for currency, note it as "content_update"
- If you create entirely new sections, note it as "new_content"

IMPORTANT RULES:
1. Output ONLY valid XML - no explanatory text before or after
2. Do NOT include any XML comments (<!-- ... -->) in your output
3. Use proper XML entities (&amp; for &, &lt; for <, etc.)
4. All tag names are case-sensitive and must match exactly
5. Ensure all opening tags have matching closing tags
6. All required sections must be present and populated
7. Meet all minimum cardinality requirements
8. ALWAYS include <Metadata> section with complete <Changelog>
9. Document your reasoning in the changelog - this helps human reviewers
`.trim();
}
