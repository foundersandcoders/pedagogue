/**
 * Cardinality Calculator
 * Adds count and order attributes to XML elements to match existing module format
 */

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * Calculate and add cardinality attributes to module XML
 * Adds count, *_count, and order attributes to elements
 *
 * @param xmlString - Valid module XML string
 * @returns XML string with cardinality attributes added
 */
export function calculateCardinality(xmlString: string): string {
	// Use browser DOMParser if available, otherwise Node.js DOMParser
	const ParserClass = typeof window !== 'undefined' ? window.DOMParser : DOMParser;
	const parser = new ParserClass();
	const doc = parser.parseFromString(xmlString, 'text/xml');

	// Check for parsing errors
	const parserErrors = doc.getElementsByTagName('parsererror');
	if (parserErrors.length > 0) {
		throw new Error(`XML parsing error in cardinalityCalculator: ${parserErrors[0].textContent}`);
	}

	const root = doc.documentElement;

	// Add cardinality to all relevant sections
	addProjectsCardinality(root);
	addResearchTopicsCardinality(root);
	addSkillsCardinality(root);

	// Serialize back to string
	const SerializerClass = typeof window !== 'undefined' ? window.XMLSerializer : XMLSerializer;
	const serializer = new SerializerClass();
	return serializer.serializeToString(doc);
}

/**
 * Add cardinality attributes to Projects section
 */
function addProjectsCardinality(root: Element): void {
	const projectsSections = root.getElementsByTagName('Projects');
	if (projectsSections.length === 0) return;

	const projects = projectsSections[0];

	// Find Briefs and Twists sections
	const briefsSections = projects.getElementsByTagName('Briefs');
	const twistsSections = projects.getElementsByTagName('Twists');

	// Count briefs and twists
	let briefsCount = 0;
	let twistsCount = 0;

	if (briefsSections.length > 0) {
		const briefsList = briefsSections[0].getElementsByTagName('Brief');
		briefsCount = briefsList.length;

		// Add count attribute to Briefs container
		briefsSections[0].setAttribute('count', String(briefsCount));

		// Process each Brief
		for (let i = 0; i < briefsList.length; i++) {
			const brief = briefsList[i];

			// Add order attribute (1-indexed)
			brief.setAttribute('order', String(i + 1));

			// Count skills, examples, and notes within this brief
			const skillsSections = brief.getElementsByTagName('Skills');
			const examplesSections = brief.getElementsByTagName('Examples');
			const notesSections = brief.getElementsByTagName('Notes');

			let skillsCount = 0;
			let examplesCount = 0;
			let notesCount = 0;

			// Skills
			if (skillsSections.length > 0) {
				const skillsList = skillsSections[0].getElementsByTagName('Skill');
				skillsCount = skillsList.length;
				skillsSections[0].setAttribute('count', String(skillsCount));

				// Add order to each skill
				for (let j = 0; j < skillsList.length; j++) {
					skillsList[j].setAttribute('order', String(j + 1));
				}
			}

			// Examples
			if (examplesSections.length > 0) {
				const examplesList = examplesSections[0].getElementsByTagName('Example');
				examplesCount = examplesList.length;
				examplesSections[0].setAttribute('count', String(examplesCount));

				// Add order to each example
				for (let j = 0; j < examplesList.length; j++) {
					examplesList[j].setAttribute('order', String(j + 1));
				}
			}

			// Notes
			if (notesSections.length > 0) {
				const notesList = notesSections[0].getElementsByTagName('Note');
				notesCount = notesList.length;
				notesSections[0].setAttribute('count', String(notesCount));

				// Add order and essential to each note
				for (let j = 0; j < notesList.length; j++) {
					const note = notesList[j];
					note.setAttribute('order', String(j + 1));
					// Add essential attribute if not present (default to true)
					if (!note.hasAttribute('essential')) {
						note.setAttribute('essential', 'true');
					}
				}
			}

			// Add summary counts to Brief element
			brief.setAttribute('skills_count', String(skillsCount));
			brief.setAttribute('examples_count', String(examplesCount));
			brief.setAttribute('notes_count', String(notesCount));
		}
	}

	// Process Twists
	if (twistsSections.length > 0) {
		const twistsList = twistsSections[0].getElementsByTagName('Twist');
		twistsCount = twistsList.length;

		// Add count attribute to Twists container
		twistsSections[0].setAttribute('count', String(twistsCount));

		// Process each Twist
		for (let i = 0; i < twistsList.length; i++) {
			const twist = twistsList[i];

			// Add order attribute
			twist.setAttribute('order', String(i + 1));

			// Count examples within this twist
			const examplesSections = twist.getElementsByTagName('Examples');
			let examplesCount = 0;

			if (examplesSections.length > 0) {
				const examplesList = examplesSections[0].getElementsByTagName('Example');
				examplesCount = examplesList.length;
				examplesSections[0].setAttribute('count', String(examplesCount));

				// Add order to each example
				for (let j = 0; j < examplesList.length; j++) {
					examplesList[j].setAttribute('order', String(j + 1));
				}
			}

			// Add examples_count to Twist element
			twist.setAttribute('examples_count', String(examplesCount));
		}
	}

	// Add summary counts to Projects element
	projects.setAttribute('briefs_count', String(briefsCount));
	projects.setAttribute('twists_count', String(twistsCount));
}

/**
 * Add cardinality attributes to ResearchTopics section
 */
function addResearchTopicsCardinality(root: Element): void {
	const researchTopicsSections = root.getElementsByTagName('ResearchTopics');
	if (researchTopicsSections.length === 0) return;

	const researchTopics = researchTopicsSections[0];

	// Find PrimaryTopics and StretchTopics sections
	const primaryTopicsSections = researchTopics.getElementsByTagName('PrimaryTopics');
	const stretchTopicsSections = researchTopics.getElementsByTagName('StretchTopics');

	let primaryTopicCount = 0;
	let stretchTopicCount = 0;

	// Process PrimaryTopics
	if (primaryTopicsSections.length > 0) {
		const primaryTopics = primaryTopicsSections[0];
		const topicsList = primaryTopics.getElementsByTagName('Topic');
		primaryTopicCount = topicsList.length;

		// Add count attribute to PrimaryTopics container
		primaryTopics.setAttribute('count', String(primaryTopicCount));

		// Process each topic
		for (let i = 0; i < topicsList.length; i++) {
			const topic = topicsList[i];

			// Add order attribute
			topic.setAttribute('order', String(i + 1));

			// Count SubTopics if present
			const subTopicsList = topic.getElementsByTagName('SubTopic');
			if (subTopicsList.length > 0) {
				topic.setAttribute('subtopic_count', String(subTopicsList.length));

				// Add order to each subtopic
				for (let j = 0; j < subTopicsList.length; j++) {
					subTopicsList[j].setAttribute('order', String(j + 1));
				}
			}
		}
	}

	// Process StretchTopics
	if (stretchTopicsSections.length > 0) {
		const stretchTopics = stretchTopicsSections[0];
		const topicsList = stretchTopics.getElementsByTagName('Topic');
		stretchTopicCount = topicsList.length;

		// Add count attribute to StretchTopics container
		stretchTopics.setAttribute('count', String(stretchTopicCount));

		// Process each stretch topic
		for (let i = 0; i < topicsList.length; i++) {
			const topic = topicsList[i];

			// Add order attribute
			topic.setAttribute('order', String(i + 1));
		}
	}

	// Add summary counts to ResearchTopics element
	researchTopics.setAttribute('primary_topic_count', String(primaryTopicCount));
	researchTopics.setAttribute('stretch_topic_count', String(stretchTopicCount));
}

/**
 * Add cardinality attributes to AdditionalSkills section
 */
function addSkillsCardinality(root: Element): void {
	const additionalSkillsSections = root.getElementsByTagName('AdditionalSkills');
	if (additionalSkillsSections.length === 0) return;

	const additionalSkills = additionalSkillsSections[0];

	// Find all SkillsCategory elements
	const categoriesList = additionalSkills.getElementsByTagName('SkillsCategory');

	// Add count attribute to AdditionalSkills container
	additionalSkills.setAttribute('categories_count', String(categoriesList.length));

	// Process each category
	for (let i = 0; i < categoriesList.length; i++) {
		const category = categoriesList[i];

		// Add order attribute
		category.setAttribute('order', String(i + 1));

		// Count skills within this category
		const skillsList = category.getElementsByTagName('Skill');
		category.setAttribute('skills_count', String(skillsList.length));

		// Add order to each skill
		for (let j = 0; j < skillsList.length; j++) {
			skillsList[j].setAttribute('order', String(j + 1));
		}
	}
}
