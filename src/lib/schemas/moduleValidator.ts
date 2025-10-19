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

		// Validate Metadata section (optional, but recommended for change tracking)
		validateMetadata(root, errors, warnings);

		// Validate Description (direct child of Module)
		validateDescription(root, errors, warnings);

		// Validate LearningObjectives section
		validateLearningObjectives(root, errors, warnings);

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

function validateDescription(root: Element, errors: string[], warnings: string[]): void {
	const descriptions = root.getElementsByTagName('Description');
	if (descriptions.length === 0) {
		errors.push('Missing required <Description> element');
		return;
	}

	if (!descriptions[0].textContent?.trim()) {
		errors.push('<Description> element must contain content');
	}
}

function validateLearningObjectives(root: Element, errors: string[], warnings: string[]): void {
	const objectivesSections = root.getElementsByTagName('LearningObjectives');
	if (objectivesSections.length === 0) {
		errors.push('Missing required <LearningObjectives> section');
		return;
	}

	const objectives = objectivesSections[0];
	const objectiveList = objectives.getElementsByTagName('LearningObjective');
	if (objectiveList.length < 3) {
		errors.push(`<LearningObjectives> must contain at least 3 <LearningObjective> elements (found ${objectiveList.length})`);
	}

	// Validate each objective has name attribute and content
	for (let i = 0; i < objectiveList.length; i++) {
		const obj = objectiveList[i];
		const name = obj.getAttribute('name');

		if (!name || !name.trim()) {
			errors.push(`<LearningObjective> #${i + 1} missing 'name' attribute`);
		}
		if (!obj.textContent?.trim()) {
			errors.push(`<LearningObjective> #${i + 1} missing content`);
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
	const primaryTopicList = primaryTopics.getElementsByTagName('Topic');
	if (primaryTopicList.length < 5) {
		errors.push(`<PrimaryTopics> must contain at least 5 <Topic> elements (found ${primaryTopicList.length})`);
	}

	// Validate each primary topic has name attribute and content/subtopics
	for (let i = 0; i < primaryTopicList.length; i++) {
		const topic = primaryTopicList[i];
		const name = topic.getAttribute('name');

		if (!name || !name.trim()) {
			errors.push(`<Topic> #${i + 1} in PrimaryTopics missing 'name' attribute`);
		}

		// Topics should have either direct text content or SubTopic children
		const subTopics = topic.getElementsByTagName('SubTopic');
		const hasContent = topic.textContent?.trim() && topic.textContent.trim().length > 0;

		if (subTopics.length === 0 && !hasContent) {
			errors.push(`<Topic> #${i + 1} "${name || 'unnamed'}" has no content and no SubTopics`);
		}

		// Validate SubTopics if present
		for (let j = 0; j < subTopics.length; j++) {
			const subTopic = subTopics[j];
			const subName = subTopic.getAttribute('name');

			if (!subName || !subName.trim()) {
				errors.push(`<SubTopic> #${j + 1} in Topic "${name || 'unnamed'}" missing 'name' attribute`);
			}
			if (!subTopic.textContent?.trim()) {
				errors.push(`<SubTopic> #${j + 1} "${subName || 'unnamed'}" in Topic "${name || 'unnamed'}" is empty`);
			}
		}
	}

	// StretchTopics are optional, but if present, validate them
	const stretchTopicsSections = researchTopics.getElementsByTagName('StretchTopics');
	if (stretchTopicsSections.length > 0) {
		const stretchTopics = stretchTopicsSections[0];
		const stretchTopicList = stretchTopics.getElementsByTagName('Topic');
		for (let i = 0; i < stretchTopicList.length; i++) {
			const topic = stretchTopicList[i];
			const name = topic.getAttribute('name');

			if (!name || !name.trim()) {
				warnings.push(`<Topic> #${i + 1} in StretchTopics missing 'name' attribute`);
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

	// Check for Briefs (minimum 2)
	const briefsSections = projects.getElementsByTagName('Briefs');
	if (briefsSections.length === 0) {
		errors.push('<Projects> must contain <Briefs>');
		return;
	}

	const briefs = briefsSections[0];
	const briefList = briefs.getElementsByTagName('Brief');
	if (briefList.length < 2) {
		errors.push(`<Briefs> must contain at least 2 <Brief> elements (found ${briefList.length})`);
	}

	// Validate each Brief
	for (let i = 0; i < briefList.length; i++) {
		const brief = briefList[i];
		const briefNum = i + 1;
		const briefName = brief.getAttribute('name') || 'unnamed';

		// Check name attribute
		if (!brief.getAttribute('name')?.trim()) {
			errors.push(`<Brief> #${briefNum} missing 'name' attribute`);
		}

		// Check Task (direct child)
		const tasks = brief.getElementsByTagName('Task');
		if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
			errors.push(`<Brief> #${briefNum} "${briefName}" missing <Task>`);
		}

		// Check Focus (direct child)
		const focuses = brief.getElementsByTagName('Focus');
		if (focuses.length === 0 || !focuses[0].textContent?.trim()) {
			errors.push(`<Brief> #${briefNum} "${briefName}" missing <Focus>`);
		}

		// Check Criteria (direct child)
		const criterias = brief.getElementsByTagName('Criteria');
		if (criterias.length === 0 || !criterias[0].textContent?.trim()) {
			errors.push(`<Brief> #${briefNum} "${briefName}" missing <Criteria>`);
		}

		// Check Skills (minimum 3)
		const skillsSections = brief.getElementsByTagName('Skills');
		if (skillsSections.length === 0) {
			errors.push(`<Brief> #${briefNum} "${briefName}" missing <Skills>`);
		} else {
			const skills = skillsSections[0];
			const skillList = skills.getElementsByTagName('Skill');
			if (skillList.length < 3) {
				errors.push(`<Brief> #${briefNum} "${briefName}" <Skills> must contain at least 3 <Skill> elements (found ${skillList.length})`);
			}

			// Validate each skill has name attribute and content
			for (let j = 0; j < skillList.length; j++) {
				const skill = skillList[j];
				const skillName = skill.getAttribute('name');

				if (!skillName || !skillName.trim()) {
					errors.push(`<Skill> #${j + 1} in Brief "${briefName}" missing 'name' attribute`);
				}
				if (!skill.textContent?.trim()) {
					errors.push(`<Skill> #${j + 1} "${skillName || 'unnamed'}" in Brief "${briefName}" missing content`);
				}
			}
		}

		// Check Examples (minimum 3)
		const examplesSections = brief.getElementsByTagName('Examples');
		if (examplesSections.length === 0) {
			errors.push(`<Brief> #${briefNum} "${briefName}" missing <Examples>`);
		} else {
			const examples = examplesSections[0];
			const exampleList = examples.getElementsByTagName('Example');
			if (exampleList.length < 3) {
				errors.push(`<Brief> #${briefNum} "${briefName}" <Examples> must contain at least 3 <Example> elements (found ${exampleList.length})`);
			}

			// Validate each example has name attribute and content
			for (let j = 0; j < exampleList.length; j++) {
				const example = exampleList[j];
				const exampleName = example.getAttribute('name');

				if (!exampleName || !exampleName.trim()) {
					errors.push(`<Example> #${j + 1} in Brief "${briefName}" missing 'name' attribute`);
				}
				if (!example.textContent?.trim()) {
					errors.push(`<Example> #${j + 1} "${exampleName || 'unnamed'}" in Brief "${briefName}" missing content`);
				}
			}
		}
	}

	// Check for Twists (minimum 2)
	const twistsSections = projects.getElementsByTagName('Twists');
	if (twistsSections.length === 0) {
		errors.push('<Projects> must contain <Twists>');
		return;
	}

	const twists = twistsSections[0];
	const twistList = twists.getElementsByTagName('Twist');
	if (twistList.length < 2) {
		errors.push(`<Twists> must contain at least 2 <Twist> elements (found ${twistList.length})`);
	}

	// Validate each twist
	for (let i = 0; i < twistList.length; i++) {
		const twist = twistList[i];
		const twistNum = i + 1;
		const twistName = twist.getAttribute('name') || 'unnamed';

		// Check name attribute
		if (!twist.getAttribute('name')?.trim()) {
			errors.push(`<Twist> #${twistNum} missing 'name' attribute`);
		}

		// Check Task
		const tasks = twist.getElementsByTagName('Task');
		if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
			errors.push(`<Twist> #${twistNum} "${twistName}" missing <Task>`);
		}

		// Check Examples (minimum 2)
		const examplesSections = twist.getElementsByTagName('Examples');
		if (examplesSections.length === 0) {
			errors.push(`<Twist> #${twistNum} "${twistName}" missing <Examples>`);
		} else {
			const examples = examplesSections[0];
			const exampleList = examples.getElementsByTagName('Example');
			if (exampleList.length < 2) {
				errors.push(`<Twist> #${twistNum} "${twistName}" <Examples> must contain at least 2 <Example> elements (found ${exampleList.length})`);
			}

			// Validate examples have content
			for (let j = 0; j < exampleList.length; j++) {
				const example = exampleList[j];
				if (!example.textContent?.trim()) {
					errors.push(`<Example> #${j + 1} in Twist "${twistName}" is empty`);
				}
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
		const catName = category.getAttribute('name') || 'unnamed';

		// Check name attribute
		if (!category.getAttribute('name')?.trim()) {
			errors.push(`<SkillsCategory> #${catNum} missing 'name' attribute`);
		}

		// Check for Overview element
		const overviews = category.getElementsByTagName('Overview');
		if (overviews.length === 0 || !overviews[0].textContent?.trim()) {
			errors.push(`<SkillsCategory> #${catNum} "${catName}" missing <Overview>`);
		}

		// Check for Skills (at least 1)
		const skills = category.getElementsByTagName('Skill');
		if (skills.length === 0) {
			errors.push(`<SkillsCategory> #${catNum} "${catName}" must contain at least one <Skill>`);
		}

		// Validate each skill
		for (let j = 0; j < skills.length; j++) {
			const skill = skills[j];
			const skillName = skill.getAttribute('name');
			const importance = skill.getAttribute('importance');

			// Check name attribute
			if (!skillName || !skillName.trim()) {
				errors.push(`<Skill> #${j + 1} in SkillsCategory "${catName}" missing 'name' attribute`);
			}

			// Check importance attribute (optional but validate if present)
			if (importance && !['Essential', 'Recommended', 'Stretch'].includes(importance)) {
				warnings.push(`<Skill> "${skillName || 'unnamed'}" in SkillsCategory "${catName}" has invalid 'importance' value "${importance}" (should be Essential, Recommended, or Stretch)`);
			}

			// Skills can be self-closing or have content - both are valid
			// No content validation needed as self-closing is acceptable
		}
	}
}

function validateMetadata(root: Element, errors: string[], warnings: string[]): void {
	const metadataSections = root.getElementsByTagName('Metadata');

	if (metadataSections.length === 0) {
		// Metadata is optional for backward compatibility, but recommended
		warnings.push('Missing optional <Metadata> section - change tracking not available');
		return;
	}

	const metadata = metadataSections[0];

	// Validate GenerationInfo (recommended if Metadata exists)
	const generationInfoSections = metadata.getElementsByTagName('GenerationInfo');
	if (generationInfoSections.length === 0) {
		warnings.push('<Metadata> section exists but missing <GenerationInfo>');
	} else {
		const genInfo = generationInfoSections[0];

		// Check for timestamp - can be attribute OR child element
		const timestampAttr = genInfo.getAttribute('timestamp');
		const timestamps = genInfo.getElementsByTagName('Timestamp');
		if (!timestampAttr && (timestamps.length === 0 || !timestamps[0].textContent?.trim())) {
			warnings.push('<GenerationInfo> missing <Timestamp>');
		}

		const sources = genInfo.getElementsByTagName('Source');
		if (sources.length === 0 || !sources[0].textContent?.trim()) {
			warnings.push('<GenerationInfo> missing <Source>');
		}

		const models = genInfo.getElementsByTagName('Model');
		if (models.length === 0 || !models[0].textContent?.trim()) {
			warnings.push('<GenerationInfo> missing <Model>');
		}
	}

	// Validate Changelog (optional even within Metadata)
	const changelogSections = metadata.getElementsByTagName('Changelog');
	if (changelogSections.length > 0) {
		const changelog = changelogSections[0];
		const changes = changelog.getElementsByTagName('Change');

		for (let i = 0; i < changes.length; i++) {
			const change = changes[i];
			const changeNum = i + 1;

			// Validate required fields in Change - can be attributes OR child elements
			const sectionAttr = change.getAttribute('section');
			const sections = change.getElementsByTagName('Section');
			if (!sectionAttr && (sections.length === 0 || !sections[0].textContent?.trim())) {
				warnings.push(`<Change> #${changeNum} missing <Section> identifier`);
			}

			const typeAttr = change.getAttribute('type');
			const types = change.getElementsByTagName('Type');
			if (!typeAttr && (types.length === 0 || !types[0].textContent?.trim())) {
				warnings.push(`<Change> #${changeNum} missing <Type>`);
			}

			const confidenceAttr = change.getAttribute('confidence');
			const confidences = change.getElementsByTagName('Confidence');
			if (!confidenceAttr && (confidences.length === 0 || !confidences[0].textContent?.trim())) {
				warnings.push(`<Change> #${changeNum} missing <Confidence> level`);
			} else {
				// Validate confidence is one of the allowed values (from attribute or element)
				const confValue = (confidenceAttr || confidences[0]?.textContent)?.trim().toLowerCase();
				if (confValue && !['high', 'medium', 'low'].includes(confValue)) {
					warnings.push(`<Change> #${changeNum} <Confidence> must be 'high', 'medium', or 'low' (found '${confValue}')`);
				}
			}

			const summaries = change.getElementsByTagName('Summary');
			if (summaries.length === 0 || !summaries[0].textContent?.trim()) {
				warnings.push(`<Change> #${changeNum} missing <Summary>`);
			}

			// Rationale and ResearchSources are optional but recommended
		}
	}

	// ProvenanceTracking is optional but useful
	const provenanceSections = metadata.getElementsByTagName('ProvenanceTracking');
	if (provenanceSections.length > 0) {
		const provenance = provenanceSections[0];

		// Validate AIUpdateCount if present
		const updateCounts = provenance.getElementsByTagName('AIUpdateCount');
		if (updateCounts.length > 0 && updateCounts[0].textContent?.trim()) {
			const count = parseInt(updateCounts[0].textContent.trim());
			if (isNaN(count) || count < 0) {
				warnings.push('<AIUpdateCount> must be a non-negative integer');
			}
		}
	}
}
