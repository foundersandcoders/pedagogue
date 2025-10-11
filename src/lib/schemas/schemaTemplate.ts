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
        Description of topic to research, including:
        1. guidance for how to start researching it
        2. suggestion for subdividing the topic if multiple learners tackle it
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

IMPORTANT RULES:
1. Output ONLY valid XML - no explanatory text before or after
2. Do NOT include any XML comments (<!-- ... -->) in your output
3. Use proper XML entities (&amp; for &, &lt; for <, etc.)
4. All tag names are case-sensitive and must match exactly
5. Ensure all opening tags have matching closing tags
6. All required sections must be present and populated
7. Meet all minimum cardinality requirements
`.trim();
}
