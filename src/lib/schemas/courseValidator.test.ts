/**
 * Course XML Validator Tests
 * Comprehensive test suite for validating course XML structure
 */

import { describe, it, expect } from 'vitest';
import { validateCourseXML, validateAndSummarize } from './courseValidator';

describe('Course XML Validator', () => {
	describe('Valid Course XML', () => {
		it('should validate a complete, valid course XML', () => {
			const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<Course name="Test Course" doc_date="2025-01-01" doc_time="1200" version="1.0">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseMetadata>
      <GenerationInfo>
        <Timestamp>2025-01-01T12:00:00Z</Timestamp>
        <Source>AI-Generated</Source>
        <Model>Claude Sonnet 4.5</Model>
        <Generator>Themis v1.0</Generator>
      </GenerationInfo>
    </CourseMetadata>
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20" start_date="2025-01-01" end_date="2025-01-28">
      <StartDate date="2025-01-01" />
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
      <EndDate date="2025-01-28" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20" team_based="true">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
      <TeamBased>true</TeamBased>
      <AssumedTeamSize>4</AssumedTeamSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic programming knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">A comprehensive test course.</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="1" modules="1">
    <CourseProgression paragraphs="1">
      <ProgressionParagraph order="1">Course progresses through one arc.</ProgressionParagraph>
    </CourseProgression>
    <Arcs count="1">
      <Arc order="1" name="Test Arc" modules="1" weeks="4">
        <ArcDescription paragraphs="1">
          <DescriptionParagraph order="1">Test arc description</DescriptionParagraph>
        </ArcDescription>
        <ArcProps>
          <ArcMetadata>
            <ArcID>arc-123</ArcID>
          </ArcMetadata>
          <ArcLogistics modules="1" />
          <ArcTemporal weeks="4" days="20">
            <StartDate date="2025-01-01" />
            <TotalWeeks number="4" />
            <TotalDays number="20" />
            <EndDate date="2025-01-28" />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="1" themes="1">
          <Themes count="1">
            <ArcTheme name="Test Theme" order="1">Theme narrative</ArcTheme>
          </Themes>
          <ArcProgression>
            <ArcProgressionNarrative>Module progression narrative</ArcProgressionNarrative>
          </ArcProgression>
          <Modules count="1">
            <Module order="1" in_arc="1" name="Test Module" weeks="4" days="20">
              <ModuleDescription>Test module description</ModuleDescription>
              <ModuleProps>
                <ModuleMetadata>
                  <ModuleID>mod-123</ModuleID>
                  <Status>complete</Status>
                </ModuleMetadata>
                <ModuleTemporal weeks="4" days="20">
                  <StartDate date="2025-01-01" />
                  <TotalWeeks number="4" />
                  <EndDate date="2025-01-28" />
                </ModuleTemporal>
              </ModuleProps>
              <ModuleSpecification>
                <ModuleOverview>
                  <ModuleDescription>Module overview</ModuleDescription>
                  <ModuleObjectives>
                    <ModuleObjective>
                      <Name>Objective 1</Name>
                      <Details>Details 1</Details>
                    </ModuleObjective>
                    <ModuleObjective>
                      <Name>Objective 2</Name>
                      <Details>Details 2</Details>
                    </ModuleObjective>
                    <ModuleObjective>
                      <Name>Objective 3</Name>
                      <Details>Details 3</Details>
                    </ModuleObjective>
                  </ModuleObjectives>
                </ModuleOverview>
                <ResearchTopics>
                  <PrimaryTopics>
                    <PrimaryTopic><TopicName>Topic 1</TopicName><TopicDescription>Desc 1</TopicDescription></PrimaryTopic>
                    <PrimaryTopic><TopicName>Topic 2</TopicName><TopicDescription>Desc 2</TopicDescription></PrimaryTopic>
                    <PrimaryTopic><TopicName>Topic 3</TopicName><TopicDescription>Desc 3</TopicDescription></PrimaryTopic>
                    <PrimaryTopic><TopicName>Topic 4</TopicName><TopicDescription>Desc 4</TopicDescription></PrimaryTopic>
                    <PrimaryTopic><TopicName>Topic 5</TopicName><TopicDescription>Desc 5</TopicDescription></PrimaryTopic>
                  </PrimaryTopics>
                </ResearchTopics>
                <Projects>
                  <ProjectBriefs>
                    <ProjectBrief>
                      <Overview>
                        <Name>Project 1</Name>
                        <Task>Task 1</Task>
                        <Focus>Focus 1</Focus>
                      </Overview>
                      <Criteria>Criteria 1</Criteria>
                      <Skills>
                        <Skill><Name>Skill 1</Name><Details>Details 1</Details></Skill>
                        <Skill><Name>Skill 2</Name><Details>Details 2</Details></Skill>
                        <Skill><Name>Skill 3</Name><Details>Details 3</Details></Skill>
                      </Skills>
                      <Examples>
                        <Example><Name>Ex 1</Name><Description>Desc 1</Description></Example>
                        <Example><Name>Ex 2</Name><Description>Desc 2</Description></Example>
                        <Example><Name>Ex 3</Name><Description>Desc 3</Description></Example>
                      </Examples>
                    </ProjectBrief>
                    <ProjectBrief>
                      <Overview>
                        <Name>Project 2</Name>
                        <Task>Task 2</Task>
                        <Focus>Focus 2</Focus>
                      </Overview>
                      <Criteria>Criteria 2</Criteria>
                      <Skills>
                        <Skill><Name>Skill 1</Name><Details>Details 1</Details></Skill>
                        <Skill><Name>Skill 2</Name><Details>Details 2</Details></Skill>
                        <Skill><Name>Skill 3</Name><Details>Details 3</Details></Skill>
                      </Skills>
                      <Examples>
                        <Example><Name>Ex 1</Name><Description>Desc 1</Description></Example>
                        <Example><Name>Ex 2</Name><Description>Desc 2</Description></Example>
                        <Example><Name>Ex 3</Name><Description>Desc 3</Description></Example>
                      </Examples>
                    </ProjectBrief>
                  </ProjectBriefs>
                  <ProjectTwists>
                    <ProjectTwist>
                      <Name>Twist 1</Name>
                      <Task>Task 1</Task>
                      <ExampleUses>
                        <Example>Example 1</Example>
                        <Example>Example 2</Example>
                      </ExampleUses>
                    </ProjectTwist>
                    <ProjectTwist>
                      <Name>Twist 2</Name>
                      <Task>Task 2</Task>
                      <ExampleUses>
                        <Example>Example 1</Example>
                        <Example>Example 2</Example>
                      </ExampleUses>
                    </ProjectTwist>
                  </ProjectTwists>
                </Projects>
                <AdditionalSkills>
                  <SkillsCategory>
                    <Name>Category 1</Name>
                    <Skill>
                      <SkillName>Skill 1</SkillName>
                      <Importance>Recommended</Importance>
                      <SkillDescription>Description 1</SkillDescription>
                    </Skill>
                  </SkillsCategory>
                </AdditionalSkills>
              </ModuleSpecification>
            </Module>
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>`;

			const result = validateCourseXML(validXml);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe('Root Element Validation', () => {
		it('should reject XML with wrong root element', () => {
			const invalidXml = `<?xml version="1.0"?><Module></Module>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Root element must be <Course>, found <Module>');
		});

		it('should reject course without name attribute', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course>
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('name'))).toBe(true);
		});
	});

	describe('CourseProps Validation', () => {
		it('should reject course without CourseProps', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test"></Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Missing required <CourseProps> element');
		});

		it('should reject CourseProps without required attributes', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps>
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
  </CourseProps>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('arcs'))).toBe(true);
			expect(result.errors.some(e => e.includes('modules'))).toBe(true);
			expect(result.errors.some(e => e.includes('weeks'))).toBe(true);
		});

		it('should reject invalid Structure value', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>invalid-value</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('facilitated') || e.includes('peer-led'))).toBe(true);
		});
	});

	describe('CohortProps Validation', () => {
		it('should reject course without CohortProps', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Missing required <CohortProps> element');
		});

		it('should reject CohortProps without learner prerequisites', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
  </CohortProps>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Missing required <LearnerPrerequisites> element in <CohortProps>');
		});
	});

	describe('Temporal Consistency Validation', () => {
		it('should detect when arc weeks exceed course weeks', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test course</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="1" modules="1">
    <Arcs count="1">
      <Arc order="1" name="Test Arc" modules="1" weeks="8">
        <ArcDescription paragraphs="1">
          <DescriptionParagraph order="1">Test</DescriptionParagraph>
        </ArcDescription>
        <ArcProps>
          <ArcLogistics modules="1" />
          <ArcTemporal weeks="8" days="40">
            <TotalWeeks number="8" />
            <TotalDays number="40" />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="1" themes="1">
          <Modules count="1">
            <Module order="1" in_arc="1" name="Test" weeks="8" days="40" />
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('exceeds course total weeks'))).toBe(true);
		});

		it('should detect when module weeks exceed arc weeks', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="8" days="40">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="8" days="40">
      <TotalWeeks number="8" />
      <DaysPerWeek number="5" />
      <TotalDays number="40" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test course</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="1" modules="1">
    <Arcs count="1">
      <Arc order="1" name="Test Arc" modules="1" weeks="4">
        <ArcDescription paragraphs="1">
          <DescriptionParagraph order="1">Test</DescriptionParagraph>
        </ArcDescription>
        <ArcProps>
          <ArcLogistics modules="1" />
          <ArcTemporal weeks="4" days="20">
            <TotalWeeks number="4" />
            <TotalDays number="20" />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="1" themes="1">
          <Modules count="1">
            <Module order="1" in_arc="1" name="Test" weeks="8" days="40" />
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('exceeds arc weeks'))).toBe(true);
		});
	});

	describe('Arc Validation', () => {
		it('should reject course without arcs', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="0" modules="0" weeks="0" days="0">
    <CourseLogistics arcs="0" modules="0">
      <TotalArcs>0</TotalArcs>
      <TotalModules>0</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="0" days="0">
      <TotalWeeks number="0" />
      <DaysPerWeek number="5" />
      <TotalDays number="0" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="0" modules="0">
    <Arcs count="0" />
  </CourseContent>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Course must contain at least one <Arc>');
		});

		it('should validate arc order numbers', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="1" modules="1">
    <Arcs count="1">
      <Arc order="5" name="Test Arc" modules="1" weeks="4">
        <ArcDescription paragraphs="1">
          <DescriptionParagraph order="1">Test</DescriptionParagraph>
        </ArcDescription>
        <ArcProps>
          <ArcLogistics modules="1" />
          <ArcTemporal weeks="4" days="20">
            <TotalWeeks number="4" />
            <TotalDays number="20" />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="1" themes="1">
          <Modules count="1">
            <Module order="1" in_arc="5" name="Test" weeks="4" days="20" />
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('order') && e.includes('must be 1'))).toBe(true);
		});
	});

	describe('Module Specification Validation', () => {
		it('should reject module with insufficient objectives', () => {
			const invalidXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="1" modules="1" weeks="4" days="20">
    <CourseLogistics arcs="1" modules="1">
      <TotalArcs>1</TotalArcs>
      <TotalModules>1</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="4" days="20">
      <TotalWeeks number="4" />
      <DaysPerWeek number="5" />
      <TotalDays number="20" />
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Basic knowledge</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="1" modules="1">
    <Arcs count="1">
      <Arc order="1" name="Test Arc" modules="1" weeks="4">
        <ArcDescription paragraphs="1">
          <DescriptionParagraph order="1">Test</DescriptionParagraph>
        </ArcDescription>
        <ArcProps>
          <ArcLogistics modules="1" />
          <ArcTemporal weeks="4" days="20">
            <TotalWeeks number="4" />
            <TotalDays number="20" />
          </ArcTemporal>
        </ArcProps>
        <ArcContent modules="1" themes="1">
          <Modules count="1">
            <Module order="1" in_arc="1" name="Test" weeks="4" days="20">
              <ModuleDescription>Test</ModuleDescription>
              <ModuleProps>
                <ModuleMetadata />
                <ModuleTemporal weeks="4" days="20">
                  <TotalWeeks number="4" />
                </ModuleTemporal>
              </ModuleProps>
              <ModuleSpecification>
                <ModuleOverview>
                  <ModuleDescription>Test</ModuleDescription>
                  <ModuleObjectives>
                    <ModuleObjective>
                      <Name>Obj 1</Name>
                      <Details>Details</Details>
                    </ModuleObjective>
                  </ModuleObjectives>
                </ModuleOverview>
                <ResearchTopics>
                  <PrimaryTopics />
                </ResearchTopics>
                <Projects>
                  <ProjectBriefs />
                  <ProjectTwists />
                </Projects>
                <AdditionalSkills />
              </ModuleSpecification>
            </Module>
          </Modules>
        </ArcContent>
      </Arc>
    </Arcs>
  </CourseContent>
</Course>`;
			const result = validateCourseXML(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errors.some(e => e.includes('at least 3 objectives'))).toBe(true);
		});
	});

	describe('validateAndSummarize', () => {
		it('should provide a summary for valid XML', () => {
			const validXml = `<?xml version="1.0"?>
<Course name="Test">
  <CourseProps arcs="0" modules="0" weeks="0" days="0">
    <CourseLogistics arcs="0" modules="0">
      <TotalArcs>0</TotalArcs>
      <TotalModules>0</TotalModules>
      <Structure>peer-led</Structure>
    </CourseLogistics>
    <CourseTemporal weeks="0" days="0">
      <TotalWeeks number="0"/>
      <DaysPerWeek number="5"/>
      <TotalDays number="0"/>
    </CourseTemporal>
  </CourseProps>
  <CohortProps learners="20">
    <CohortAssumptions learners="20">
      <AssumedCohortSize>20</AssumedCohortSize>
    </CohortAssumptions>
    <LearnerPrerequisites>Test</LearnerPrerequisites>
    <LearnerExperience>
      <PrereqLevel>1-3 years</PrereqLevel>
      <FocusArea>limited experience</FocusArea>
    </LearnerExperience>
  </CohortProps>
  <CourseDescription paragraphs="1">
    <DescriptionParagraph order="1">Test</DescriptionParagraph>
  </CourseDescription>
  <CourseContent arcs="0" modules="0">
    <Arcs count="0" />
  </CourseContent>
</Course>`;

			const result = validateAndSummarize(validXml);
			expect(result.valid).toBe(false); // Will fail because no arcs
			expect(result.errorCount).toBeGreaterThan(0);
			expect(result.summary).toBeDefined();
		});

		it('should provide summary for invalid XML', () => {
			const invalidXml = `<?xml version="1.0"?><InvalidRoot></InvalidRoot>`;
			const result = validateAndSummarize(invalidXml);
			expect(result.valid).toBe(false);
			expect(result.errorCount).toBeGreaterThan(0);
			expect(result.summary).toContain('failed');
		});
	});
});
