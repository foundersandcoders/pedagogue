/**
 * Course XML Validator
 * Validates complete course XML structure including embedded module specifications
 * Based on src/data/templates/themis/courseSchema.xml
 */

import { DOMParser as NodeDOMParser } from '@xmldom/xmldom';
import { validateModuleXML } from './moduleValidator';

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates Course XML structure, cardinality requirements, and temporal consistency
 * Hierarchically validates: Course → Arcs → Modules → Module Specifications
 */
export function validateCourseXML(xmlString: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	try {
		// Use browser DOMParser if available, otherwise Node.js DOMParser
		const ParserClass = typeof window !== 'undefined' ? window.DOMParser : NodeDOMParser;
		const parser = new ParserClass();
		const doc = parser.parseFromString(xmlString, 'text/xml');

		// Check for XML parsing errors
		const parserErrors = doc.getElementsByTagName('parsererror');
		if (parserErrors.length > 0) {
			errors.push(`XML parsing error: ${parserErrors[0].textContent}`);
			return { valid: false, errors, warnings };
		}

		// Validate root element
		const root = doc.documentElement;
		if (root.tagName !== 'Course') {
			errors.push(`Root element must be <Course>, found <${root.tagName}>`);
			return { valid: false, errors, warnings };
		}

		// Validate required attributes on root
		const courseName = root.getAttribute('name');
		if (!courseName || courseName.trim() === '') {
			errors.push('Course must have a non-empty "name" attribute');
		}

		// Validate CourseProps section
		validateCourseProps(root, errors, warnings);

		// Validate CohortProps section
		validateCohortProps(root, errors, warnings);

		// Validate CourseDescription section
		validateCourseDescription(root, errors, warnings);

		// Validate CourseContent section (arcs and modules)
		validateCourseContent(root, errors, warnings);

		return {
			valid: errors.length === 0,
			errors,
			warnings
		};
	} catch (err) {
		errors.push(`Validation error: ${err instanceof Error ? err.message : String(err)}`);
		return { valid: false, errors, warnings };
	}
}

/**
 * Validate CourseProps section
 */
function validateCourseProps(root: Element, errors: string[], warnings: string[]): void {
	const coursePropsElements = root.getElementsByTagName('CourseProps');
	if (coursePropsElements.length === 0) {
		errors.push('Missing required <CourseProps> element');
		return;
	}

	const courseProps = coursePropsElements[0];

	// Validate attributes
	const arcs = courseProps.getAttribute('arcs');
	const modules = courseProps.getAttribute('modules');
	const weeks = courseProps.getAttribute('weeks');
	const days = courseProps.getAttribute('days');

	if (!arcs || isNaN(parseInt(arcs))) {
		errors.push('<CourseProps> must have numeric "arcs" attribute');
	}
	if (!modules || isNaN(parseInt(modules))) {
		errors.push('<CourseProps> must have numeric "modules" attribute');
	}
	if (!weeks || isNaN(parseInt(weeks))) {
		errors.push('<CourseProps> must have numeric "weeks" attribute');
	}
	if (!days || isNaN(parseInt(days))) {
		errors.push('<CourseProps> must have numeric "days" attribute');
	}

	// Validate CourseMetadata (optional but recommended)
	const metadata = courseProps.getElementsByTagName('CourseMetadata');
	if (metadata.length === 0) {
		warnings.push('Missing <CourseMetadata> - recommended for tracking course version and generation info');
	}

	// Validate CourseLogistics (required)
	const logistics = courseProps.getElementsByTagName('CourseLogistics');
	if (logistics.length === 0) {
		errors.push('Missing required <CourseLogistics> element in <CourseProps>');
	} else {
		const totalArcs = logistics[0].getElementsByTagName('TotalArcs');
		const totalModules = logistics[0].getElementsByTagName('TotalModules');
		const structure = logistics[0].getElementsByTagName('Structure');

		if (totalArcs.length === 0) {
			errors.push('Missing required <TotalArcs> in <CourseLogistics>');
		}
		if (totalModules.length === 0) {
			errors.push('Missing required <TotalModules> in <CourseLogistics>');
		}
		if (structure.length === 0) {
			errors.push('Missing required <Structure> in <CourseLogistics>');
		} else {
			const structureValue = structure[0].textContent?.trim();
			if (structureValue !== 'facilitated' && structureValue !== 'peer-led') {
				errors.push(
					'<Structure> must be either "facilitated" or "peer-led", found: ' + structureValue
				);
			}
		}
	}

	// Validate CourseTemporal (required)
	const temporal = courseProps.getElementsByTagName('CourseTemporal');
	if (temporal.length === 0) {
		errors.push('Missing required <CourseTemporal> element in <CourseProps>');
	} else {
		const totalWeeks = temporal[0].getElementsByTagName('TotalWeeks');
		const daysPerWeek = temporal[0].getElementsByTagName('DaysPerWeek');
		const totalDays = temporal[0].getElementsByTagName('TotalDays');

		if (totalWeeks.length === 0) {
			errors.push('Missing required <TotalWeeks> in <CourseTemporal>');
		}
		if (daysPerWeek.length === 0) {
			errors.push('Missing required <DaysPerWeek> in <CourseTemporal>');
		}
		if (totalDays.length === 0) {
			errors.push('Missing required <TotalDays> in <CourseTemporal>');
		}

		// StartDate and EndDate are optional
		const startDate = temporal[0].getElementsByTagName('StartDate');
		const endDate = temporal[0].getElementsByTagName('EndDate');
		if (startDate.length === 0) {
			warnings.push('Missing optional <StartDate> in <CourseTemporal>');
		}
		if (endDate.length === 0) {
			warnings.push('Missing optional <EndDate> in <CourseTemporal>');
		}
	}
}

/**
 * Validate CohortProps section
 */
function validateCohortProps(root: Element, errors: string[], warnings: string[]): void {
	const cohortPropsElements = root.getElementsByTagName('CohortProps');
	if (cohortPropsElements.length === 0) {
		errors.push('Missing required <CohortProps> element');
		return;
	}

	const cohortProps = cohortPropsElements[0];

	// Validate attributes
	const learners = cohortProps.getAttribute('learners');
	if (!learners || isNaN(parseInt(learners))) {
		errors.push('<CohortProps> must have numeric "learners" attribute');
	}

	// Validate CohortAssumptions (required)
	const assumptions = cohortProps.getElementsByTagName('CohortAssumptions');
	if (assumptions.length === 0) {
		errors.push('Missing required <CohortAssumptions> element in <CohortProps>');
	} else {
		const cohortSize = assumptions[0].getElementsByTagName('AssumedCohortSize');
		if (cohortSize.length === 0) {
			errors.push('Missing required <AssumedCohortSize> in <CohortAssumptions>');
		}

		// TeamBased and AssumedTeamSize are optional
		const teamBased = assumptions[0].getElementsByTagName('TeamBased');
		const teamSize = assumptions[0].getElementsByTagName('AssumedTeamSize');
		if (teamBased.length === 0) {
			warnings.push('Missing optional <TeamBased> in <CohortAssumptions>');
		}
		if (teamSize.length === 0) {
			warnings.push('Missing optional <AssumedTeamSize> in <CohortAssumptions>');
		}
	}

	// Validate LearnerPrerequisites (required)
	const prereqs = cohortProps.getElementsByTagName('LearnerPrerequisites');
	if (prereqs.length === 0) {
		errors.push('Missing required <LearnerPrerequisites> element in <CohortProps>');
	} else if (!prereqs[0].textContent?.trim()) {
		errors.push('<LearnerPrerequisites> must contain content');
	}

	// Validate LearnerExperience (required)
	const experience = cohortProps.getElementsByTagName('LearnerExperience');
	if (experience.length === 0) {
		errors.push('Missing required <LearnerExperience> element in <CohortProps>');
	} else {
		const prereqLevel = experience[0].getElementsByTagName('PrereqLevel');
		const focusArea = experience[0].getElementsByTagName('FocusArea');

		if (prereqLevel.length === 0) {
			errors.push('Missing required <PrereqLevel> in <LearnerExperience>');
		}
		if (focusArea.length === 0) {
			errors.push('Missing required <FocusArea> in <LearnerExperience>');
		}
	}
}

/**
 * Validate CourseDescription section
 */
function validateCourseDescription(root: Element, errors: string[], warnings: string[]): void {
	const descElements = root.getElementsByTagName('CourseDescription');
	if (descElements.length === 0) {
		errors.push('Missing required <CourseDescription> element');
		return;
	}

	const desc = descElements[0];
	const paragraphs = desc.getElementsByTagName('DescriptionParagraph');

	if (paragraphs.length === 0) {
		errors.push('<CourseDescription> must contain at least one <DescriptionParagraph>');
		return;
	}

	// Validate paragraph count attribute matches actual count
	const paragraphsAttr = desc.getAttribute('paragraphs');
	if (paragraphsAttr && parseInt(paragraphsAttr) !== paragraphs.length) {
		warnings.push(
			`<CourseDescription> paragraphs attribute (${paragraphsAttr}) does not match actual paragraph count (${paragraphs.length})`
		);
	}

	// Validate each paragraph has content
	for (let i = 0; i < paragraphs.length; i++) {
		if (!paragraphs[i].textContent?.trim()) {
			errors.push(`<DescriptionParagraph> at position ${i + 1} is empty`);
		}
	}
}

/**
 * Validate CourseContent section (arcs and modules)
 */
function validateCourseContent(root: Element, errors: string[], warnings: string[]): void {
	const contentElements = root.getElementsByTagName('CourseContent');
	if (contentElements.length === 0) {
		errors.push('Missing required <CourseContent> element');
		return;
	}

	const content = contentElements[0];

	// Validate CourseProgression (optional but recommended)
	const progression = content.getElementsByTagName('CourseProgression');
	if (progression.length === 0) {
		warnings.push('Missing <CourseProgression> - recommended for explaining how arcs connect');
	}

	// Validate Arcs section (required)
	const arcsElements = content.getElementsByTagName('Arcs');
	if (arcsElements.length === 0) {
		errors.push('Missing required <Arcs> element in <CourseContent>');
		return;
	}

	const arcs = arcsElements[0];
	const arcElements = arcs.getElementsByTagName('Arc');

	if (arcElements.length === 0) {
		errors.push('Course must contain at least one <Arc>');
		return;
	}

	// Validate count attribute matches actual count
	const countAttr = arcs.getAttribute('count');
	if (countAttr && parseInt(countAttr) !== arcElements.length) {
		warnings.push(
			`<Arcs> count attribute (${countAttr}) does not match actual arc count (${arcElements.length})`
		);
	}

	// Validate each arc
	let totalCourseWeeks = 0;
	for (let i = 0; i < arcElements.length; i++) {
		const arcWeeks = validateArc(arcElements[i], i + 1, errors, warnings);
		totalCourseWeeks += arcWeeks;
	}

	// Validate temporal consistency at course level
	const coursePropsElements = root.getElementsByTagName('CourseProps');
	if (coursePropsElements.length > 0) {
		const weeksAttr = coursePropsElements[0].getAttribute('weeks');
		if (weeksAttr) {
			const declaredWeeks = parseInt(weeksAttr);
			if (totalCourseWeeks > declaredWeeks) {
				errors.push(
					`Temporal inconsistency: sum of arc weeks (${totalCourseWeeks}) exceeds course total weeks (${declaredWeeks})`
				);
			} else if (totalCourseWeeks < declaredWeeks) {
				warnings.push(
					`Temporal inconsistency: sum of arc weeks (${totalCourseWeeks}) is less than course total weeks (${declaredWeeks})`
				);
			}
		}
	}
}

/**
 * Validate a single Arc element
 * Returns the arc's duration in weeks for temporal consistency checking
 */
function validateArc(arc: Element, expectedOrder: number, errors: string[], warnings: string[]): number {
	const arcContext = `Arc ${expectedOrder}`;

	// Validate required attributes
	const order = arc.getAttribute('order');
	const name = arc.getAttribute('name');
	const modules = arc.getAttribute('modules');
	const weeks = arc.getAttribute('weeks');

	if (!order || parseInt(order) !== expectedOrder) {
		errors.push(`${arcContext}: "order" attribute must be ${expectedOrder}, found: ${order}`);
	}
	if (!name || name.trim() === '') {
		errors.push(`${arcContext}: must have non-empty "name" attribute`);
	}
	if (!modules || isNaN(parseInt(modules))) {
		errors.push(`${arcContext}: must have numeric "modules" attribute`);
	}
	if (!weeks || isNaN(parseInt(weeks))) {
		errors.push(`${arcContext}: must have numeric "weeks" attribute`);
	}

	const arcWeeks = weeks ? parseInt(weeks) : 0;

	// Validate ArcDescription (required)
	const descriptions = arc.getElementsByTagName('ArcDescription');
	if (descriptions.length === 0) {
		errors.push(`${arcContext}: missing required <ArcDescription>`);
	}

	// Validate ArcProps (required)
	const props = arc.getElementsByTagName('ArcProps');
	if (props.length === 0) {
		errors.push(`${arcContext}: missing required <ArcProps>`);
	}

	// Validate ArcContent (required)
	const contentElements = arc.getElementsByTagName('ArcContent');
	if (contentElements.length === 0) {
		errors.push(`${arcContext}: missing required <ArcContent>`);
		return arcWeeks;
	}

	const arcContent = contentElements[0];

	// Validate Themes (optional but recommended)
	const themes = arcContent.getElementsByTagName('Themes');
	if (themes.length === 0) {
		warnings.push(`${arcContext}: missing <Themes> - recommended for thematic organization`);
	}

	// Validate ArcProgression (optional but recommended)
	const progression = arcContent.getElementsByTagName('ArcProgression');
	if (progression.length === 0) {
		warnings.push(
			`${arcContext}: missing <ArcProgression> - recommended for explaining module connections`
		);
	}

	// Validate Modules section (required)
	const modulesElements = arcContent.getElementsByTagName('Modules');
	if (modulesElements.length === 0) {
		errors.push(`${arcContext}: missing required <Modules> element`);
		return arcWeeks;
	}

	const modulesContainer = modulesElements[0];
	const moduleElements = modulesContainer.getElementsByTagName('Module');

	if (moduleElements.length === 0) {
		errors.push(`${arcContext}: must contain at least one <Module>`);
		return arcWeeks;
	}

	// Validate count attribute matches actual count
	const countAttr = modulesContainer.getAttribute('count');
	if (countAttr && parseInt(countAttr) !== moduleElements.length) {
		warnings.push(
			`${arcContext}: <Modules> count attribute (${countAttr}) does not match actual module count (${moduleElements.length})`
		);
	}

	// Validate each module and check temporal consistency
	let totalArcModuleWeeks = 0;
	for (let i = 0; i < moduleElements.length; i++) {
		const moduleWeeks = validateModule(moduleElements[i], expectedOrder, i + 1, errors, warnings);
		totalArcModuleWeeks += moduleWeeks;
	}

	// Check temporal consistency within arc
	if (totalArcModuleWeeks > arcWeeks) {
		errors.push(
			`${arcContext}: sum of module weeks (${totalArcModuleWeeks}) exceeds arc weeks (${arcWeeks})`
		);
	} else if (totalArcModuleWeeks < arcWeeks) {
		warnings.push(
			`${arcContext}: sum of module weeks (${totalArcModuleWeeks}) is less than arc weeks (${arcWeeks})`
		);
	}

	return arcWeeks;
}

/**
 * Validate a single Module element
 * Returns the module's duration in weeks for temporal consistency checking
 */
function validateModule(
	module: Element,
	arcOrder: number,
	expectedOrder: number,
	errors: string[],
	warnings: string[]
): number {
	const moduleContext = `Arc ${arcOrder}, Module ${expectedOrder}`;

	// Validate required attributes
	const order = module.getAttribute('order');
	const inArc = module.getAttribute('in_arc');
	const name = module.getAttribute('name');
	const weeks = module.getAttribute('weeks');

	if (!order || parseInt(order) !== expectedOrder) {
		errors.push(
			`${moduleContext}: "order" attribute must be ${expectedOrder}, found: ${order}`
		);
	}
	if (!inArc || parseInt(inArc) !== arcOrder) {
		errors.push(
			`${moduleContext}: "in_arc" attribute must be ${arcOrder}, found: ${inArc}`
		);
	}
	if (!weeks || isNaN(parseInt(weeks))) {
		errors.push(`${moduleContext}: must have numeric "weeks" attribute`);
	}

	const moduleWeeks = weeks ? parseInt(weeks) : 0;

	// Check if module has content (not self-closing)
	const hasChildren = module.childNodes.length > 0;
	if (!hasChildren) {
		warnings.push(`${moduleContext}: empty module (self-closing tag)`);
		return moduleWeeks;
	}

	// Validate ModuleDescription (required)
	const descriptions = module.getElementsByTagName('ModuleDescription');
	if (descriptions.length === 0) {
		errors.push(`${moduleContext}: missing required <ModuleDescription>`);
	} else if (!descriptions[0].textContent?.trim()) {
		errors.push(`${moduleContext}: <ModuleDescription> must contain content`);
	}

	// Validate ModuleProps (required)
	const props = module.getElementsByTagName('ModuleProps');
	if (props.length === 0) {
		errors.push(`${moduleContext}: missing required <ModuleProps>`);
	}

	// Validate ModuleSpecification (required for complete modules)
	const specifications = module.getElementsByTagName('ModuleSpecification');
	if (specifications.length === 0) {
		warnings.push(
			`${moduleContext}: missing <ModuleSpecification> - module may be incomplete`
		);
		return moduleWeeks;
	}

	// Validate the embedded module specification using module validator
	validateModuleSpecification(specifications[0], moduleContext, errors, warnings);

	return moduleWeeks;
}

/**
 * Validate ModuleSpecification section (embedded module XML)
 * Reuses module validator logic for consistency
 */
function validateModuleSpecification(
	spec: Element,
	context: string,
	errors: string[],
	warnings: string[]
): void {
	// Check for required sections

	// ModuleOverview (required)
	const overview = spec.getElementsByTagName('ModuleOverview');
	if (overview.length === 0) {
		errors.push(`${context}: missing required <ModuleOverview> in module specification`);
	} else {
		// Validate ModuleObjectives (min 3)
		const objectives = overview[0].getElementsByTagName('ModuleObjectives');
		if (objectives.length === 0) {
			errors.push(`${context}: missing required <ModuleObjectives> in module specification`);
		} else {
			const objectiveElements = objectives[0].getElementsByTagName('ModuleObjective');
			if (objectiveElements.length < 3) {
				errors.push(
					`${context}: module must have at least 3 objectives, found ${objectiveElements.length}`
				);
			}
		}
	}

	// ResearchTopics (required, min 5 primary)
	const researchTopics = spec.getElementsByTagName('ResearchTopics');
	if (researchTopics.length === 0) {
		errors.push(`${context}: missing required <ResearchTopics> in module specification`);
	} else {
		const primaryTopics = researchTopics[0].getElementsByTagName('PrimaryTopics');
		if (primaryTopics.length === 0) {
			errors.push(
				`${context}: missing required <PrimaryTopics> in <ResearchTopics>`
			);
		} else {
			const topicElements = primaryTopics[0].getElementsByTagName('PrimaryTopic');
			if (topicElements.length < 5) {
				errors.push(
					`${context}: module must have at least 5 primary research topics, found ${topicElements.length}`
				);
			}
		}
	}

	// Projects (required, min 2 briefs and 2 twists)
	const projects = spec.getElementsByTagName('Projects');
	if (projects.length === 0) {
		errors.push(`${context}: missing required <Projects> in module specification`);
	} else {
		// Validate ProjectBriefs (min 2)
		const briefsContainer = projects[0].getElementsByTagName('ProjectBriefs');
		if (briefsContainer.length === 0) {
			errors.push(`${context}: missing required <ProjectBriefs> in <Projects>`);
		} else {
			const briefs = briefsContainer[0].getElementsByTagName('ProjectBrief');
			if (briefs.length < 2) {
				errors.push(
					`${context}: module must have at least 2 project briefs, found ${briefs.length}`
				);
			}
		}

		// Validate ProjectTwists (min 2)
		const twistsContainer = projects[0].getElementsByTagName('ProjectTwists');
		if (twistsContainer.length === 0) {
			errors.push(`${context}: missing required <ProjectTwists> in <Projects>`);
		} else {
			const twists = twistsContainer[0].getElementsByTagName('ProjectTwist');
			if (twists.length < 2) {
				errors.push(
					`${context}: module must have at least 2 project twists, found ${twists.length}`
				);
			}
		}
	}

	// AdditionalSkills (required, min 1 category)
	const additionalSkills = spec.getElementsByTagName('AdditionalSkills');
	if (additionalSkills.length === 0) {
		errors.push(`${context}: missing required <AdditionalSkills> in module specification`);
	} else {
		const categories = additionalSkills[0].getElementsByTagName('SkillsCategory');
		if (categories.length < 1) {
			errors.push(
				`${context}: module must have at least 1 additional skills category, found ${categories.length}`
			);
		}
	}

	// Metadata is optional but recommended
	const metadata = spec.getElementsByTagName('Metadata');
	if (metadata.length === 0) {
		warnings.push(
			`${context}: missing <Metadata> in module specification - recommended for provenance tracking`
		);
	}
}

/**
 * Helper function to validate a course and return a summary
 */
export function validateAndSummarize(xmlString: string): {
	valid: boolean;
	errorCount: number;
	warningCount: number;
	errors: string[];
	warnings: string[];
	summary: string;
} {
	const result = validateCourseXML(xmlString);

	const summary = result.valid
		? `✓ Course XML is valid (${result.warnings.length} warnings)`
		: `✗ Course XML validation failed (${result.errors.length} errors, ${result.warnings.length} warnings)`;

	return {
		valid: result.valid,
		errorCount: result.errors.length,
		warningCount: result.warnings.length,
		errors: result.errors,
		warnings: result.warnings,
		summary
	};
}
