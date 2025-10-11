/**
 * Module XML Schema Validator
 * Validates generated XML against the required output schema structure
 * Works in both browser and Node.js environments
 */

import { DOMParser as NodeDOMParser } from '@xmldom/xmldom';

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validates Module XML structure and cardinality requirements
 * Based on src/data/templates/outputSchema.xml
 */
export function validateModuleXML(xmlString: string): ValidationResult {
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
		if (root.tagName !== 'Module') {
			errors.push(`Root element must be <Module>, found <${root.tagName}>`);
			return { valid: false, errors, warnings };
		}

		// Validate ModuleOverview section
		validateModuleOverview(root, errors, warnings);

		// Validate ResearchTopics section
		validateResearchTopics(root, errors, warnings);

		// Validate Projects section
		validateProjects(root, errors, warnings);

		// Validate AdditionalSkills section
		validateAdditionalSkills(root, errors, warnings);

		// Notes section is optional, no validation needed

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

function validateModuleOverview(root: Element, errors: string[], warnings: string[]): void {
	const overviews = root.getElementsByTagName('ModuleOverview');
	if (overviews.length === 0) {
		errors.push('Missing required <ModuleOverview> section');
		return;
	}

	const overview = overviews[0];

	// Check for ModuleDescription
	const descriptions = overview.getElementsByTagName('ModuleDescription');
	if (descriptions.length === 0 || !descriptions[0].textContent?.trim()) {
		errors.push('<ModuleOverview> must contain <ModuleDescription> with content');
	}

	// Check for ModuleObjectives (minimum 3)
	const objectivesSections = overview.getElementsByTagName('ModuleObjectives');
	if (objectivesSections.length === 0) {
		errors.push('<ModuleOverview> must contain <ModuleObjectives>');
		return;
	}

	const objectives = objectivesSections[0];
	const objectiveList = objectives.getElementsByTagName('ModuleObjective');
	if (objectiveList.length < 3) {
		errors.push(`<ModuleObjectives> must contain at least 3 <ModuleObjective> elements (found ${objectiveList.length})`);
	}

	// Validate each objective has Name and Details
	for (let i = 0; i < objectiveList.length; i++) {
		const obj = objectiveList[i];
		const names = obj.getElementsByTagName('Name');
		const details = obj.getElementsByTagName('Details');

		if (names.length === 0 || !names[0].textContent?.trim()) {
			errors.push(`<ModuleObjective> #${i + 1} missing <Name>`);
		}
		if (details.length === 0 || !details[0].textContent?.trim()) {
			errors.push(`<ModuleObjective> #${i + 1} missing <Details>`);
		}
	}
}

function validateResearchTopics(root: Element, errors: string[], warnings: string[]): void {
	const researchTopicsSections = root.getElementsByTagName('ResearchTopics');
	if (researchTopicsSections.length === 0) {
		errors.push('Missing required <ResearchTopics> section');
		return;
	}

	const researchTopics = researchTopicsSections[0];

	// Check for PrimaryTopics (minimum 5)
	const primaryTopicsSections = researchTopics.getElementsByTagName('PrimaryTopics');
	if (primaryTopicsSections.length === 0) {
		errors.push('<ResearchTopics> must contain <PrimaryTopics>');
		return;
	}

	const primaryTopics = primaryTopicsSections[0];
	const primaryTopicList = primaryTopics.getElementsByTagName('PrimaryTopic');
	if (primaryTopicList.length < 5) {
		errors.push(`<PrimaryTopics> must contain at least 5 <PrimaryTopic> elements (found ${primaryTopicList.length})`);
	}

	// Validate each primary topic has content
	for (let i = 0; i < primaryTopicList.length; i++) {
		if (!primaryTopicList[i].textContent?.trim()) {
			errors.push(`<PrimaryTopic> #${i + 1} is empty`);
		}
	}

	// StretchTopics are optional, but if present, validate them
	const stretchTopicsSections = researchTopics.getElementsByTagName('StretchTopics');
	if (stretchTopicsSections.length > 0) {
		const stretchTopics = stretchTopicsSections[0];
		const stretchTopicList = stretchTopics.getElementsByTagName('StretchTopic');
		for (let i = 0; i < stretchTopicList.length; i++) {
			if (!stretchTopicList[i].textContent?.trim()) {
				warnings.push(`<StretchTopic> #${i + 1} is empty`);
			}
		}
	}
}

function validateProjects(root: Element, errors: string[], warnings: string[]): void {
	const projectsSections = root.getElementsByTagName('Projects');
	if (projectsSections.length === 0) {
		errors.push('Missing required <Projects> section');
		return;
	}

	const projects = projectsSections[0];

	// Check for ProjectBriefs (minimum 2)
	const projectBriefsSections = projects.getElementsByTagName('ProjectBriefs');
	if (projectBriefsSections.length === 0) {
		errors.push('<Projects> must contain <ProjectBriefs>');
		return;
	}

	const projectBriefs = projectBriefsSections[0];
	const briefList = projectBriefs.getElementsByTagName('ProjectBrief');
	if (briefList.length < 2) {
		errors.push(`<ProjectBriefs> must contain at least 2 <ProjectBrief> elements (found ${briefList.length})`);
	}

	// Validate each ProjectBrief
	for (let i = 0; i < briefList.length; i++) {
		const brief = briefList[i];
		const briefNum = i + 1;

		// Check Overview
		const overviews = brief.getElementsByTagName('Overview');
		if (overviews.length === 0) {
			errors.push(`<ProjectBrief> #${briefNum} missing <Overview>`);
		} else {
			const overview = overviews[0];
			const names = overview.getElementsByTagName('Name');
			const tasks = overview.getElementsByTagName('Task');
			const focuses = overview.getElementsByTagName('Focus');

			if (names.length === 0 || !names[0].textContent?.trim()) {
				errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Name>`);
			}
			if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
				errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Task>`);
			}
			if (focuses.length === 0 || !focuses[0].textContent?.trim()) {
				errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Focus>`);
			}
		}

		// Check Criteria
		const criterias = brief.getElementsByTagName('Criteria');
		if (criterias.length === 0 || !criterias[0].textContent?.trim()) {
			errors.push(`<ProjectBrief> #${briefNum} missing <Criteria>`);
		}

		// Check Skills (minimum 3)
		const skillsSections = brief.getElementsByTagName('Skills');
		if (skillsSections.length === 0) {
			errors.push(`<ProjectBrief> #${briefNum} missing <Skills>`);
		} else {
			const skills = skillsSections[0];
			const skillList = skills.getElementsByTagName('Skill');
			if (skillList.length < 3) {
				errors.push(`<ProjectBrief> #${briefNum} <Skills> must contain at least 3 <Skill> elements (found ${skillList.length})`);
			}

			// Validate each skill
			for (let j = 0; j < skillList.length; j++) {
				const skill = skillList[j];
				const names = skill.getElementsByTagName('Name');
				const details = skill.getElementsByTagName('Details');

				if (names.length === 0 || !names[0].textContent?.trim()) {
					errors.push(`<ProjectBrief> #${briefNum} <Skill> #${j + 1} missing <Name>`);
				}
				if (details.length === 0 || !details[0].textContent?.trim()) {
					errors.push(`<ProjectBrief> #${briefNum} <Skill> #${j + 1} missing <Details>`);
				}
			}
		}

		// Check Examples (minimum 3)
		const examplesSections = brief.getElementsByTagName('Examples');
		if (examplesSections.length === 0) {
			errors.push(`<ProjectBrief> #${briefNum} missing <Examples>`);
		} else {
			const examples = examplesSections[0];
			const exampleList = examples.getElementsByTagName('Example');
			if (exampleList.length < 3) {
				errors.push(`<ProjectBrief> #${briefNum} <Examples> must contain at least 3 <Example> elements (found ${exampleList.length})`);
			}

			// Validate each example
			for (let j = 0; j < exampleList.length; j++) {
				const example = exampleList[j];
				const names = example.getElementsByTagName('Name');
				const descriptions = example.getElementsByTagName('Description');

				if (names.length === 0 || !names[0].textContent?.trim()) {
					errors.push(`<ProjectBrief> #${briefNum} <Example> #${j + 1} missing <Name>`);
				}
				if (descriptions.length === 0 || !descriptions[0].textContent?.trim()) {
					errors.push(`<ProjectBrief> #${briefNum} <Example> #${j + 1} missing <Description>`);
				}
			}
		}
	}

	// Check for ProjectTwists (minimum 2)
	const projectTwistsSections = projects.getElementsByTagName('ProjectTwists');
	if (projectTwistsSections.length === 0) {
		errors.push('<Projects> must contain <ProjectTwists>');
		return;
	}

	const projectTwists = projectTwistsSections[0];
	const twistList = projectTwists.getElementsByTagName('ProjectTwist');
	if (twistList.length < 2) {
		errors.push(`<ProjectTwists> must contain at least 2 <ProjectTwist> elements (found ${twistList.length})`);
	}

	// Validate each twist
	for (let i = 0; i < twistList.length; i++) {
		const twist = twistList[i];
		const twistNum = i + 1;

		const names = twist.getElementsByTagName('Name');
		const tasks = twist.getElementsByTagName('Task');

		if (names.length === 0 || !names[0].textContent?.trim()) {
			errors.push(`<ProjectTwist> #${twistNum} missing <Name>`);
		}
		if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
			errors.push(`<ProjectTwist> #${twistNum} missing <Task>`);
		}

		// Check ExampleUses (minimum 2)
		const exampleUsesSections = twist.getElementsByTagName('ExampleUses');
		if (exampleUsesSections.length === 0) {
			errors.push(`<ProjectTwist> #${twistNum} missing <ExampleUses>`);
		} else {
			const exampleUses = exampleUsesSections[0];
			const exampleList = exampleUses.getElementsByTagName('Example');
			if (exampleList.length < 2) {
				errors.push(`<ProjectTwist> #${twistNum} <ExampleUses> must contain at least 2 <Example> elements (found ${exampleList.length})`);
			}
		}
	}
}

function validateAdditionalSkills(root: Element, errors: string[], warnings: string[]): void {
	const additionalSkillsSections = root.getElementsByTagName('AdditionalSkills');
	
	if (additionalSkillsSections.length === 0) {
		errors.push('Missing required <AdditionalSkills> section');
		return;
	}

	const additionalSkills = additionalSkillsSections[0];
	const categories = additionalSkills.getElementsByTagName('SkillsCategory');
	if (categories.length === 0) {
		errors.push('<AdditionalSkills> must contain at least one <SkillsCategory>');
		return;
	}

	// Validate each category
	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const catNum = i + 1;

		const names = category.getElementsByTagName('Name');
		if (names.length === 0 || !names[0].textContent?.trim()) {
			errors.push(`<SkillsCategory> #${catNum} missing <Name>`);
		}

		const skills = category.getElementsByTagName('Skill');
		if (skills.length === 0) {
			errors.push(`<SkillsCategory> #${catNum} must contain at least one <Skill>`);
		}

		for (let j = 0; j < skills.length; j++) {
			const skill = skills[j];
			const skillNames = skill.getElementsByTagName('SkillName');
			const skillDescriptions = skill.getElementsByTagName('SkillDescription');

			if (skillNames.length === 0 || !skillNames[0].textContent?.trim()) {
				errors.push(`<SkillsCategory> #${catNum} <Skill> #${j + 1} missing <SkillName>`);
			}
			if (skillDescriptions.length === 0 || !skillDescriptions[0].textContent?.trim()) {
				errors.push(`<SkillsCategory> #${catNum} <Skill> #${j + 1} missing <SkillDescription>`);
			}
		}
	}
}
