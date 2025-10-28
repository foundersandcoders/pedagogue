/**
 * Module Generation Prompt Builder
 *
 * Constructs prompts for AI-powered module generation.
 * Handles input formatting, research instructions, retry logic, and schema requirements.
 */

import { getSchemaRequirements } from '$lib/schemas/schemaTemplate';
import type { GenerateRequest } from '$lib/schemas/apiValidator';
import type { ModuleSlot, TitleInput } from '$lib/types/themis';
import {
	buildResearchInstructions,
	buildRetrySection,
	buildResearchStep,
	formatInputData
} from '$lib/utils/prompt/shared-components';

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
	// Format input data
	const projectsInfo = formatInputData(body.projectsData);
	const skillsInfo = formatInputData(body.skillsData);
	const researchInfo = formatInputData(body.researchData);
	const structuredInfo = formatInputData(body.structuredInput);

	// Build conditional sections
	const researchInstructions = buildResearchInstructions(body.enableResearch);
	const retrySection = buildRetrySection(validationErrors);
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
          ${buildResearchStep(
						body.enableResearch,
						'Use web searches to check that these learning outcomes are not outdated compared to industry trends. Update the learning outcomes if appropriate, making sure they\'re appropriate to the cohort specified in "<ModuleInput/CohortInput>".',
						['Keep the learning outcomes in mind when completing the next steps']
					)}
        </Step2>

        <Step3>
          ${buildResearchStep(
						body.enableResearch,
						'Use web searches to check that "<ModuleInput/ProjectsInput>" is not outdated compared to industry trends. Update the project briefs if appropriate, making sure they\'re appropriate to the cohort specified in "<ModuleInput/CohortInput>".',
						[
							'Make sure that the projects are relevant to the learning outcomes',
							'Keep the project briefs in mind when completing the next steps'
						]
					)}
        </Step3>

        <Step4>
          ${buildResearchStep(
						body.enableResearch,
						'Use web searches to check that "<ModuleInput/ResearchInput>" is not outdated compared to industry trends. Update the research topics if appropriate, making sure they\'re appropriate to the cohort specified in "<ModuleInput/CohortInput>".',
						[
							'Make sure the research topics are relevant to the learning outcomes',
							'Make sure the research topics are useful in completing the projects',
							'Keep the research topics in mind when completing the next steps'
						]
					)}
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

/**
 * Build course-aware module generation prompt
 *
 * Enhanced version of buildGenerationPrompt that includes course context
 * for modules being generated as part of a complete course.
 *
 * @param body - Generation request with module input data
 * @param courseContext - Course narrative and progression context
 * @param validationErrors - Optional array of validation errors from previous attempt
 * @returns Formatted prompt string for Claude with course context
 */
export function buildCourseAwareModulePrompt(
	body: GenerateRequest,
	courseContext: {
		title: string;
		courseNarrative: string;
		progressionNarrative: string;
		arcNarrative: string;
		arcProgression: string;
		precedingModules?: string[];
	},
	validationErrors?: string[]
): string {
	// Get the base prompt
	const basePrompt = buildGenerationPrompt(body, validationErrors);

	// Build course context section
	const courseContextSection = `
    <CourseContext>
      <OverallContext>
        This module is part of a complete course: "${courseContext.title}"

        Course Narrative:
        ${courseContext.courseNarrative}

        Course Progression:
        ${courseContext.progressionNarrative}
      </OverallContext>

      <ArcContext>
        This module belongs to a thematic arc with the following characteristics:

        Arc Theme:
        ${courseContext.arcNarrative}

        Arc Progression:
        ${courseContext.arcProgression}
      </ArcContext>

      ${courseContext.precedingModules && courseContext.precedingModules.length > 0 ? `
      <PrecedingModules>
        This module comes after the following modules in the course:
        ${courseContext.precedingModules.map((title, i) => `${i + 1}. ${title}`).join('\n        ')}

        IMPORTANT: Avoid repeating content from these previous modules. Build upon their foundations
        and assume learners have completed them successfully.
      </PrecedingModules>` : ''}

      <IntegrationGuidelines>
        - Align module objectives with the overall course narrative
        - Ensure module content fits within the arc's thematic progression
        - Build upon knowledge from preceding modules (don't repeat basics)
        - Consider how this module prepares learners for subsequent modules
        - Maintain consistency with the course's overall tone and approach
        - Reference course-level concepts where relevant
      </IntegrationGuidelines>
    </CourseContext>`;

	// Insert course context after the Overview section
	return basePrompt.replace(
		'</Overview>',
		`</Overview>\n${courseContextSection}`
	);
}

/**
 * Build title guidance section based on TitleInput type
 */
function buildTitleGuidance(titleInput: TitleInput, label: string = 'title'): string {
	switch (titleInput.type) {
		case 'undefined':
			return `Generate an appropriate ${label} based on the module content and context.`;
		case 'prompt':
			return `Use this guidance to generate an appropriate ${label}: "${titleInput.value}"`;
		case 'literal':
			return `Use this exact ${label}: "${titleInput.value}"`;
	}
}

/**
 * Build knowledge context section from preceding modules
 */
function buildKnowledgeContextSection(precedingModules: ModuleSlot[]): string {
	if (!precedingModules || precedingModules.length === 0) {
		return 'This is the first module in the course. No prior knowledge from previous modules.';
	}

	const overviews = precedingModules
		.filter(m => m.overview)
		.map((m, i) => {
			const overview = m.overview!;
			return `
			Module ${i + 1}: ${m.title}
			- Learning Objectives: ${overview.learningObjectives.join(', ')}
			- Key Concepts Introduced: ${overview.keyConceptsIntroduced.join(', ')}
			- Prerequisites Assumed: ${overview.prerequisites.join(', ')}`;
		})
		.join('\n');

	// Collect all concepts covered so far
	const allConcepts = precedingModules
		.filter(m => m.overview)
		.flatMap(m => m.overview!.keyConceptsIntroduced);

	const allObjectives = precedingModules
		.filter(m => m.overview)
		.flatMap(m => m.overview!.learningObjectives);

	return `
		Learners have completed ${precedingModules.length} previous module(s):
		${overviews}

		Cumulative Knowledge:
		- Concepts Already Covered: ${allConcepts.join(', ')}
		- Skills Already Acquired: ${allObjectives.join(', ')}

		CRITICAL: Do NOT repeat these topics. Build upon them as prerequisites.
		Assume learners are familiar with these concepts and can apply them.`;
}

/**
 * Build module overview generation prompt
 *
 * Lightweight generation focused on planning before full module creation.
 * Generates learning objectives, prerequisites, and key concepts without
 * the full module specification.
 *
 * @param moduleSlot - Module slot with title input and basic info
 * @param courseContext - Course and arc context
 * @param precedingModules - Previously completed modules for context
 * @param validationErrors - Optional validation errors from retry
 * @returns Formatted prompt for overview generation
 */
export function buildModuleOverviewPrompt(
	moduleSlot: ModuleSlot,
	courseContext: {
		title: string;
		courseNarrative: string;
		arcNarrative: string;
		precedingModules: ModuleSlot[];
	},
	validationErrors?: string[]
): string {
	const titleGuidance = buildTitleGuidance(moduleSlot.titleInput, 'title');
	const themeGuidance = moduleSlot.themeInput
		? buildTitleGuidance(moduleSlot.themeInput, 'theme')
		: '';
	const knowledgeContext = buildKnowledgeContextSection(courseContext.precedingModules);
	const retrySection = buildRetrySection(validationErrors);

	return `<Prompt>
		<Overview>
			<RoleOverview>
				You are an expert curriculum designer for peer-led AI Engineering courses.
			</RoleOverview>

			<TaskOverview>
				Generate a focused module overview (NOT a full module specification) that includes:
				1. Suggested title (based on guidance)
				${moduleSlot.themeInput ? '2. Suggested theme (based on guidance)' : ''}
				${moduleSlot.themeInput ? '3' : '2'}. 3-5 specific learning objectives
				${moduleSlot.themeInput ? '4' : '3'}. Prerequisites (what learners must know before starting)
				${moduleSlot.themeInput ? '5' : '4'}. 3-5 key concepts that will be introduced

				This overview will help plan the course structure before generating full modules.
			</TaskOverview>
		</Overview>

		<ModuleContext>
			<BasicInfo>
				Module Description: ${moduleSlot.description || 'Not provided'}
				Duration: ${moduleSlot.durationWeeks} week(s)
				Order in Arc: Module ${moduleSlot.order}
			</BasicInfo>

			<TitleGuidance>
				${titleGuidance}
			</TitleGuidance>

			${themeGuidance ? `<ThemeGuidance>${themeGuidance}</ThemeGuidance>` : ''}

			<CourseContext>
				Course: "${courseContext.title}"
				Course Narrative: ${courseContext.courseNarrative}

				Arc Narrative: ${courseContext.arcNarrative}
			</CourseContext>

			<LearnerKnowledgeContext>
				${knowledgeContext}
			</LearnerKnowledgeContext>

			${retrySection ? `<RetryGuidance>${retrySection}</RetryGuidance>` : ''}
		</ModuleContext>

		<Task>
			<TaskSteps>
				<Step1>
					Analyze the module context and learner's current knowledge state.
					Consider what they've already learned and what gaps exist.
				</Step1>

				<Step2>
					Generate an appropriate title ${moduleSlot.themeInput ? 'and theme ' : ''}based on the guidance provided.
					The title should be:
					- Descriptive and specific
					- Aligned with course and arc themes
					- Appropriate for the learner's level
					- Distinct from previous module titles
				</Step2>

				<Step3>
					Define 3-5 specific, measurable learning objectives.
					Each objective should:
					- Build upon prerequisites from previous modules
					- Introduce NEW concepts (not repetition)
					- Be achievable within ${moduleSlot.durationWeeks} week(s)
					- Align with the course progression
				</Step3>

				<Step4>
					List prerequisites - what must learners know BEFORE this module?
					- Reference concepts from previous modules
					- Include external knowledge if needed
					- Be specific (not vague like "basic programming")
				</Step4>

				<Step5>
					Identify 3-5 key concepts that THIS module will introduce.
					These should be:
					- NEW to the learner (not covered in previous modules)
					- Central to achieving the learning objectives
					- Appropriate complexity for the duration
					- Connected to the module theme
				</Step5>
			</TaskSteps>

			<OutputFormat>
				Return a JSON object with this structure:
				{
					"generatedTitle": "string (if title was not literal)",
					"generatedTheme": "string (if theme input was provided and not literal)",
					"learningObjectives": ["objective 1", "objective 2", "objective 3"],
					"prerequisites": ["prereq 1", "prereq 2"],
					"keyConceptsIntroduced": ["concept 1", "concept 2", "concept 3"]
				}

				IMPORTANT: Return ONLY the JSON object, no additional text or explanation.
			</OutputFormat>

			<QualityCriteria>
				- Learning objectives should be specific and actionable
				- Prerequisites should reference actual concepts (be concrete)
				- Key concepts should be NEW (not repetitions from previous modules)
				- Everything should align with the course and arc narratives
				- Title should be engaging and descriptive
				- Avoid generic educational jargon
			</QualityCriteria>
		</Task>
	</Prompt>`;
}
