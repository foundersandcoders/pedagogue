/**
 * Module Generation Prompt Builder
 *
 * Constructs prompts for AI-powered module generation.
 * Handles input formatting, research instructions, retry logic, and schema requirements.
 */

import { getSchemaRequirements } from '$lib/schemas/schemaTemplate.js';
import type { GenerateRequest } from '$lib/validation/api-schemas.js';

/**
 * Build the generation prompt from input data
 *
 * Includes retry-specific validation errors if this is a retry attempt.
 *
 * @param body - Generation request with module input data
 * @param validationErrors - Optional array of validation errors from previous attempt
 * @returns Formatted prompt string for Claude
 */
export function buildGenerationPrompt(body: GenerateRequest, validationErrors?: string[]): string {
	const projectsInfo = JSON.stringify(body.projectsData, null, 2);
	const skillsInfo = JSON.stringify(body.skillsData, null, 2);
	const researchInfo = JSON.stringify(body.researchData, null, 2);
	const structuredInfo = body.structuredInput
  	? JSON.stringify(body.structuredInput, null, 2)
  	: 'None provided';

	const researchInstructions = body.enableResearch
  	? `RESEARCH INSTRUCTIONS:
      You have access to web search to find current, relevant information about:
      - Latest best practices and trends for the technologies mentioned
      - Current industry standards and tooling
      - Recent developments in AI and software development
      - Real-world examples and case studies

      Use web search to ensure the curriculum is up-to-date and reflects current industry practice.
      Focus on reputable sources: vendor documentation, established tech publications, and academic sources.`
    : '';

	const retrySection = validationErrors && validationErrors.length > 0
  	? `⚠️ PREVIOUS ATTEMPT FAILED VALIDATION ⚠️
      Your previous response had these validation errors:
      ${validationErrors.map(err => `- ${err}`).join('\n')}

      Please correct ALL of these issues in your next response. Pay special attention to:
      - Meeting minimum cardinality requirements (e.g., "at least 3 objectives")
      - Including all required sections and subsections
      - Using exact tag names (case-sensitive)
      - Ensuring proper XML structure with matching opening/closing tags`
    : '';

	const schemaRequirements = getSchemaRequirements();

	return `<Prompt>
	  <Overview>
			<RoleOverview>
			  You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.
			</RoleOverview>

      <TaskOverview>
        Go through <Task/TaskSteps> in order to generate a comprehensive module specification that:
        1. is based on the provided "<ModuleInput>"
        2. meets "<Task/TaskCriteria>"
        3. adheres to "<SchemaRequirements>"
      </TaskOverview>
    </Overview>

    <ModuleInput>
      <ProjectsInput>
        ${projectsInfo}
      </ProjectsInput>

      <SkillsInput>
        ${skillsInfo}
      </SkillsInput>

      <ResearchInput>
        ${researchInfo}
      </ResearchInput>

      <CohortInput>
        ${structuredInfo}
      </CohortInput>
    </ModuleInput>

    <Task>
      <TaskApproach>
        <ResearchEnabled>
          ${body.enableResearch ? 'Yes - Use web search to find current information' : 'No'}
        <ResearchEnabled>

        <ExtendedThinking>
          ${body.useExtendedThinking ? 'Yes' : 'No'}
        </ExtendedThinking>

        <ResearchInstructions>
          ${researchInstructions}
        </ResearchInstructions>

        <RetrySection>
          ${retrySection}
        </RetrySection>
      </TaskApproach>

      <TaskCriteria>
        Generate a detailed module specification that:
        1. Synthesizes the project requirements with additional skills and research topics
        2. Maintains the depth and detail level shown in the input examples
        3. Creates clear, actionable learning objectives
        4. Defines practical project briefs based on the provided examples
        5. Includes comprehensive research topics with guidance for learners
        6. Provides concrete examples for each project brief (minimum 3)
        7. Suggests interesting project twists to add challenge
        8. Maintains alignment with peer-led teaching philosophy
        ${body.enableResearch
          ? '9. Incorporates current best practices and trends discovered through web research'
          : ''
        }
      </TaskCriteria>

      <TaskSteps>
        <Step1>Think hard about what learning outcomes emerge when the content of "<ModuleInput>" is considered as a whole.</Step1>

        <Step2>
          ${body.enableResearch ? `
            1. Use web searches to check that these learning outcomes are not outdated compared to industry trends. Update the learning outcomes if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2.`
            : `1.`
          } Keep the learning outcomes in mind when completing the next steps
        </Step2>

        <Step3>
          ${body.enableResearch ? `
            1. Use web searches to check that "<ModuleInput/ProjectsInput>" is not outdated compared to industry trends. Update the project briefs if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2. Make sure that the projects are relevant to the learning outcomes
            3.`
            : `1.`
          } Keep the project briefs in mind when completing the next steps
        </Step3>

        <Step4>
          ${body.enableResearch ? `
            1. Use web searches to check that "<ModuleInput/ResearchInput>" is not outdated compared to industry trends. Update the research topics if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2. Make sure the research topics are relevant to the learning outcomes
            3. Make sure the research topics are useful in completing the projects
            4.`
            : `1.`
          } Keep the research topics in mind when completing the next steps
        </Step4>

        <Step5>Generate the module</Step5>
      </TaskSteps>

      <TaskGuidelines>
        - Match the level of detail in the input examples
        - ProjectBriefs should include Overview, Criteria, Skills, and Examples
        - Research topics should include practical guidance for how to research them
        - Skills should be granular and specific (e.g., "Package management in Python" not "Coding in Python")
        - Examples should be diverse and substantially different from each other
        - Write for LEARNERS, not facilitators (avoid "Facilitators should..." or "Instructors can..." - learners are self-directed)

        <ProjectTwistGuidelines>
          A "Twist" is a CONCEPTUAL CURVEBALL, not a technical feature addition.

          Good twists REFRAME the problem space by adding a philosophical or purposeful constraint:
          - "The Helpful Saboteur" - tool that deliberately introduces productive chaos (e.g., CLI suggesting radical refactorings, git hook playing devil's advocate)
          - "The Unreliable Narrator" - system generating multiple perspectives on same data (e.g., docs for different audiences, competing interpretations)
          - "The Contrarian" - agent that challenges assumptions by presenting counterarguments
          - "The Archaeologist" - chatbot treating documents as artifacts, inferring from missing information
          - "The Method Actor" - agent that commits to a persona and never breaks character

          Twist characteristics:
          • Has personality/character in the name (creates intrigue)
          • Reframes the PURPOSE, not the implementation
          • Implementation-agnostic (many technical approaches possible)
          • Philosophically or practically interesting
          • Makes learners think "what if we approached this DIFFERENTLY?"

          ANTI-PATTERNS - These are NOT twists (they're stretch goals):
          ✗ "Add persistent memory" - just a feature addition
          ✗ "Support images/audio" - just capability expansion
          ✗ "Use multiple agents" - just architectural pattern
          ✗ "Add real-time streaming" - just technical implementation
          ✗ "Make it work offline" - just deployment constraint

          Remember: A twist changes how you THINK about the problem, not what FEATURES you build.
        </ProjectTwistGuidelines>
      </TaskGuidelines>
    </Task>

    <SchemaRequirements>
      ${schemaRequirements}
    </SchemaRequirements>
  </Prompt>`;
}
