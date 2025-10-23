/** Content Mapper for Theia
 * Maps XML schema elements and course/module structures to human-readable typography.
 * Creates an intermediate representation (MappedContent) that formatters can transform
 * into Markdown, HTML, etc.
 */

import { DOMParser as NodeDOMParser } from '@xmldom/xmldom';
import type {
	ExportConfig,
	MappedContent,
	MappedSection,
	ModuleXMLContent,
	ModuleSection,
	CourseSection
} from '$lib/types/theia';
import type { CourseData, Arc, ModuleSlot } from '$lib/types/themis';

/** Maps module XML content to typography structure */
export function mapModuleXMLToTypography(
	xmlContent: string,
	config: ExportConfig
): MappedContent {
	const ParserClass = typeof window !== 'undefined' ? window.DOMParser : NodeDOMParser;
	const parser = new ParserClass();
	const doc = parser.parseFromString(xmlContent, 'text/xml');
	const root = doc.documentElement;

	const parsed = parseModuleXML(root);
	return mapModuleToTypography(parsed, config);
}

/** Maps a parsed module structure to typography */
export function mapModuleToTypography(
	module: ModuleXMLContent,
	config: ExportConfig
): MappedContent {
	const sections: MappedSection[] = [];
	const shouldInclude = makeSectionFilter(config.sections as ModuleSection[]);

	// Module Overview
	if (shouldInclude('overview') && module.overview) {
		sections.push(mapModuleOverview(module.overview, config));
	}

	// Learning Objectives
	if (shouldInclude('objectives') && module.overview?.objectives) {
		sections.push(mapObjectives(module.overview.objectives, config));
	}

	// Research Topics
	if (shouldInclude('research') && module.research) {
		sections.push(mapResearchTopics(module.research, config));
	}

	// Project Briefs
	if (shouldInclude('project-briefs') && module.projects?.briefs) {
		sections.push(mapProjectBriefs(module.projects.briefs, config));
	}

	// Project Twists
	if (shouldInclude('project-twists') && module.projects?.twists) {
		sections.push(mapProjectTwists(module.projects.twists, config));
	}

	// Additional Skills
	if (shouldInclude('additional-skills') && module.additionalSkills) {
		sections.push(mapAdditionalSkills(module.additionalSkills, config));
	}

	// Metadata & Changelog
	if (config.includeMetadata && shouldInclude('metadata') && module.metadata) {
		sections.push(mapMetadata(module.metadata, config));
	}

	if (config.includeMetadata && shouldInclude('changelog') && module.metadata?.changelog) {
		sections.push(mapChangelog(module.metadata.changelog, config));
	}

	// Notes
	if (shouldInclude('notes') && module.notes) {
		sections.push({
			id: 'notes',
			heading: 'Notes',
			level: 2,
			content: module.notes
		});
	}

	return {
		title: config.customTitle || 'Module Specification',
		sections,
		metadata: config.includeMetadata
			? {
					generated: module.metadata?.generationInfo?.timestamp || new Date().toISOString(),
					source: module.metadata?.generationInfo?.source || 'Unknown'
				}
			: undefined
	};
}

/** Maps course data to typography structure */
export function mapCourseToTypography(course: CourseData, config: ExportConfig): MappedContent {
	const sections: MappedSection[] = [];
	const shouldInclude = makeSectionFilter(config.sections as CourseSection[]);

	// Course Overview
	if (shouldInclude('overview')) {
		sections.push({
			id: 'overview',
			heading: 'Course Overview',
			level: 2,
			content: course.description || ''
		});
	}

	// Logistics
	if (shouldInclude('logistics')) {
		sections.push(mapCourseLogistics(course, config));
	}

	// Cohort Information
	if (shouldInclude('cohort-info')) {
		sections.push(mapCohortInfo(course, config));
	}

	// Course Narrative
	if (shouldInclude('course-narrative') && course.courseNarrative) {
		sections.push({
			id: 'course-narrative',
			heading: 'Course Narrative',
			level: 2,
			content: course.courseNarrative
		});
	}

	// Progression Narrative
	if (shouldInclude('progression-narrative') && course.progressionNarrative) {
		sections.push({
			id: 'progression-narrative',
			heading: 'How the Course Progresses',
			level: 2,
			content: course.progressionNarrative
		});
	}

	// Arcs
	if (shouldInclude('arcs')) {
		sections.push(mapArcs(course.arcs, config));
	}

	return {
		title: config.customTitle || course.title,
		subtitle: `A ${course.logistics.totalWeeks}-week ${course.structure} course`,
		sections,
		metadata: {
			totalWeeks: course.logistics.totalWeeks,
			daysPerWeek: course.logistics.daysPerWeek,
			cohortSize: course.learners.cohortSize,
			structure: course.structure,
			arcs: course.arcs.length,
			modules: course.arcs.reduce((sum, arc) => sum + arc.modules.length, 0)
		}
	};
}

/** Maps a single arc to typography structure */
export function mapArcToTypography(arc: Arc, config: ExportConfig): MappedContent {
	const sections: MappedSection[] = [];
	const shouldInclude = makeSectionFilter(config.sections as CourseSection[]);

	// Arc Description
	if (config.detailLevel !== 'minimal') {
		sections.push({
			id: 'description',
			heading: 'Description',
			level: 2,
			content: arc.description
		});
	}

	// Arc Theme
	if (shouldInclude('arc-themes') && arc.arcThemeNarrative) {
		sections.push({
			id: 'theme',
			heading: 'Thematic Focus',
			level: 2,
			content: arc.arcThemeNarrative
		});
	}

	// Arc Progression
	if (shouldInclude('arc-progression') && arc.arcProgressionNarrative) {
		sections.push({
			id: 'progression',
			heading: 'Module Progression',
			level: 2,
			content: arc.arcProgressionNarrative
		});
	}

	// Modules
	if (shouldInclude('modules')) {
		sections.push(mapModulesInArc(arc.modules, config));
	}

	return {
		title: config.customTitle || arc.title,
		subtitle: `Arc ${arc.order} • ${arc.durationWeeks} weeks • ${arc.theme}`,
		sections,
		metadata: {
			order: arc.order,
			durationWeeks: arc.durationWeeks,
			theme: arc.theme,
			modules: arc.modules.length
		}
	};
}

/** Maps a module slot to typography structure */
export function mapModuleSlotToTypography(
	moduleSlot: ModuleSlot,
	config: ExportConfig
): MappedContent {
	const sections: MappedSection[] = [];

	// Description
	if (config.detailLevel !== 'minimal' && moduleSlot.description) {
		sections.push({
			id: 'description',
			heading: 'Description',
			level: 2,
			content: moduleSlot.description
		});
	}

	// Learning Objectives
	if (moduleSlot.learningObjectives && moduleSlot.learningObjectives.length > 0) {
		sections.push({
			id: 'objectives',
			heading: 'Learning Objectives',
			level: 2,
			content: '',
			items: moduleSlot.learningObjectives.map((obj) => ({ content: obj }))
		});
	}

	// Key Topics
	if (moduleSlot.keyTopics && moduleSlot.keyTopics.length > 0) {
		sections.push({
			id: 'topics',
			heading: 'Key Topics',
			level: 2,
			content: '',
			items: moduleSlot.keyTopics.map((topic) => ({ content: topic }))
		});
	}

	// Generated XML (if available and complete detail level)
	if (
		config.detailLevel === 'complete' &&
		moduleSlot.moduleData?.xmlContent &&
		moduleSlot.status === 'complete'
	) {
		// Recursively map the full module XML
		const fullModule = mapModuleXMLToTypography(moduleSlot.moduleData.xmlContent, config);
		sections.push(...fullModule.sections);
	}

	return {
		title: config.customTitle || moduleSlot.title,
		subtitle: `Module ${moduleSlot.order} • ${moduleSlot.durationWeeks} weeks • Status: ${moduleSlot.status}`,
		sections,
		metadata: {
			order: moduleSlot.order,
			durationWeeks: moduleSlot.durationWeeks,
			status: moduleSlot.status,
			generatedAt: moduleSlot.moduleData?.generatedAt?.toISOString()
		}
	};
}

// ============================================================================
// Private Mapping Functions
// ============================================================================

function mapModuleOverview(
	overview: ModuleXMLContent['overview'],
	config: ExportConfig
): MappedSection {
	return {
		id: 'overview',
		heading: 'Module Overview',
		level: 2,
		content: overview.description
	};
}

function mapObjectives(
	objectives: Array<{ name: string; details: string }>,
	config: ExportConfig
): MappedSection {
	const items =
		config.detailLevel === 'minimal'
			? objectives.map((obj) => ({ title: obj.name, content: '' }))
			: objectives.map((obj) => ({ title: obj.name, content: obj.details }));

	return {
		id: 'objectives',
		heading: 'Learning Objectives',
		level: 2,
		content: '',
		items
	};
}

function mapResearchTopics(
	research: ModuleXMLContent['research'],
	config: ExportConfig
): MappedSection {
	const primaryItems = research.primaryTopics.map((topic) => ({
		title: topic.name,
		content: config.detailLevel !== 'minimal' ? topic.description : ''
	}));

	const stretchItems =
		config.detailLevel !== 'minimal' && research.stretchTopics
			? research.stretchTopics.map((topic) => ({ content: topic }))
			: [];

	const subsections: MappedSection[] = [
		{
			id: 'primary-topics',
			heading: 'Primary Research Topics',
			level: 3,
			content: '',
			items: primaryItems
		}
	];

	if (stretchItems.length > 0) {
		subsections.push({
			id: 'stretch-topics',
			heading: 'Stretch Topics',
			level: 3,
			content: '',
			items: stretchItems
		});
	}

	return {
		id: 'research',
		heading: 'Research Topics',
		level: 2,
		content: subsections
	};
}

function mapProjectBriefs(
	briefs: ModuleXMLContent['projects']['briefs'],
	config: ExportConfig
): MappedSection {
	const subsections: MappedSection[] = briefs.map((brief, index) => {
		const briefSubsections: MappedSection[] = [];

		// Task & Focus
		if (config.detailLevel !== 'minimal') {
			briefSubsections.push({
				id: `brief-${index}-task`,
				heading: 'Task',
				level: 4,
				content: brief.task
			});

			briefSubsections.push({
				id: `brief-${index}-focus`,
				heading: 'Focus',
				level: 4,
				content: brief.focus
			});
		}

		// Criteria
		if (config.detailLevel === 'detailed' || config.detailLevel === 'complete') {
			briefSubsections.push({
				id: `brief-${index}-criteria`,
				heading: 'Success Criteria',
				level: 4,
				content: brief.criteria
			});
		}

		// Skills
		if (config.detailLevel === 'detailed' || config.detailLevel === 'complete') {
			briefSubsections.push({
				id: `brief-${index}-skills`,
				heading: 'Skills',
				level: 4,
				content: '',
				items: brief.skills.map((skill) => ({
					title: skill.name,
					content: skill.details
				}))
			});
		}

		// Examples
		if (config.detailLevel === 'complete') {
			briefSubsections.push({
				id: `brief-${index}-examples`,
				heading: 'Examples',
				level: 4,
				content: '',
				items: brief.examples.map((ex) => ({
					title: ex.name,
					content: ex.description
				}))
			});
		}

		return {
			id: `brief-${index}`,
			heading: brief.name,
			level: 3,
			content: briefSubsections
		};
	});

	return {
		id: 'project-briefs',
		heading: 'Project Briefs',
		level: 2,
		content: subsections
	};
}

function mapProjectTwists(
	twists: ModuleXMLContent['projects']['twists'],
	config: ExportConfig
): MappedSection {
	const items = twists.map((twist) => {
		const content =
			config.detailLevel === 'minimal'
				? ''
				: `${twist.task}\n\nExamples:\n${twist.examples.map((ex) => `- ${ex}`).join('\n')}`;

		return {
			title: twist.name,
			content
		};
	});

	return {
		id: 'project-twists',
		heading: 'Project Twists',
		level: 2,
		content: '',
		items
	};
}

function mapAdditionalSkills(
	skills: NonNullable<ModuleXMLContent['additionalSkills']>,
	config: ExportConfig
): MappedSection {
	if (config.detailLevel === 'minimal') {
		const allSkills = skills.flatMap((cat) =>
			cat.skills.map((skill) => ({
				content: `${skill.name} (${cat.category})`
			}))
		);

		return {
			id: 'additional-skills',
			heading: 'Additional Skills',
			level: 2,
			content: '',
			items: allSkills
		};
	}

	const subsections: MappedSection[] = skills.map((category, idx) => ({
		id: `skills-${idx}`,
		heading: category.category,
		level: 3,
		content: '',
		items: category.skills.map((skill) => ({
			title: `${skill.name} (${skill.importance})`,
			content: config.detailLevel !== 'summary' ? skill.description : ''
		}))
	}));

	return {
		id: 'additional-skills',
		heading: 'Additional Skills',
		level: 2,
		content: subsections
	};
}

function mapMetadata(
	metadata: NonNullable<ModuleXMLContent['metadata']>,
	config: ExportConfig
): MappedSection {
	const items: Array<{ title?: string; content: string }> = [];

	if (metadata.generationInfo) {
		items.push({
			title: 'Generated',
			content: metadata.generationInfo.timestamp
		});
		items.push({
			title: 'Model',
			content: metadata.generationInfo.model
		});
		items.push({
			title: 'Source',
			content: metadata.generationInfo.source
		});
	}

	if (metadata.provenance) {
		items.push({
			title: 'AI Update Count',
			content: String(metadata.provenance.aiUpdateCount || 0)
		});
		if (metadata.provenance.lastHumanReview) {
			items.push({
				title: 'Last Human Review',
				content: `${metadata.provenance.lastHumanReview.date} by ${metadata.provenance.lastHumanReview.reviewer}`
			});
		}
	}

	return {
		id: 'metadata',
		heading: 'Generation Metadata',
		level: 2,
		content: '',
		items
	};
}

function mapChangelog(
	changelog: NonNullable<ModuleXMLContent['metadata']>['changelog'],
	config: ExportConfig
): MappedSection {
	if (!changelog) {
		return {
			id: 'changelog',
			heading: 'Changelog',
			level: 2,
			content: 'No changes recorded'
		};
	}

	const items = changelog.map((change) => ({
		title: `${change.section} (${change.type})`,
		content: `**Confidence:** ${change.confidence}\n\n${change.summary}\n\n*Rationale:* ${change.rationale}${
			change.sources && change.sources.length > 0
				? '\n\n**Sources:**\n' + change.sources.map((s) => `- [${s.title}](${s.url})`).join('\n')
				: ''
		}`
	}));

	return {
		id: 'changelog',
		heading: 'Changelog',
		level: 2,
		content: '',
		items
	};
}

function mapCourseLogistics(course: CourseData, config: ExportConfig): MappedSection {
	const items = [
		{ title: 'Total Duration', content: `${course.logistics.totalWeeks} weeks` },
		{ title: 'Days per Week', content: String(course.logistics.daysPerWeek) },
		{ title: 'Structure', content: course.structure }
	];

	if (course.logistics.startDate) {
		items.push({ title: 'Start Date', content: course.logistics.startDate });
	}

	return {
		id: 'logistics',
		heading: 'Course Logistics',
		level: 2,
		content: '',
		items
	};
}

function mapCohortInfo(course: CourseData, config: ExportConfig): MappedSection {
	const items = [
		{ title: 'Cohort Size', content: String(course.learners.cohortSize) },
		{ title: 'Team-Based', content: course.learners.teamBased ? 'Yes' : 'No' }
	];

	if (course.learners.teamSize) {
		items.push({ title: 'Team Size', content: String(course.learners.teamSize) });
	}

	if (config.detailLevel !== 'minimal') {
		items.push({
			title: 'Prerequisites',
			content: course.learners.prerequisites || 'None specified'
		});
		items.push({
			title: 'Experience Level',
			content: `${course.learners.experience.prereq} experience, ${course.learners.experience.focus}`
		});
	}

	return {
		id: 'cohort-info',
		heading: 'Cohort Information',
		level: 2,
		content: '',
		items
	};
}

function mapArcs(arcs: Arc[], config: ExportConfig): MappedSection {
	const subsections: MappedSection[] = arcs.map((arc, index) => {
		const arcSubsections: MappedSection[] = [];

		// Arc Description
		if (config.detailLevel !== 'minimal') {
			arcSubsections.push({
				id: `arc-${index}-description`,
				heading: 'Description',
				level: 4,
				content: arc.description
			});
		}

		// Arc Theme
		if (arc.arcThemeNarrative && config.detailLevel !== 'minimal') {
			arcSubsections.push({
				id: `arc-${index}-theme`,
				heading: 'Thematic Focus',
				level: 4,
				content: arc.arcThemeNarrative
			});
		}

		// Arc Progression
		if (arc.arcProgressionNarrative && config.detailLevel !== 'minimal') {
			arcSubsections.push({
				id: `arc-${index}-progression`,
				heading: 'Module Progression',
				level: 4,
				content: arc.arcProgressionNarrative
			});
		}

		// Modules
		if (config.sections.length === 0 || (config.sections as CourseSection[]).includes('modules')) {
			arcSubsections.push(mapModulesInArc(arc.modules, config));
		}

		return {
			id: `arc-${index}`,
			heading: `Arc ${arc.order}: ${arc.title}`,
			level: 3,
			content: arcSubsections,
			metadata: { theme: arc.theme, weeks: arc.durationWeeks }
		};
	});

	return {
		id: 'arcs',
		heading: 'Course Arcs',
		level: 2,
		content: subsections
	};
}

function mapModulesInArc(modules: ModuleSlot[], config: ExportConfig): MappedSection {
	const items = modules.map((module) => {
		let content = config.detailLevel === 'minimal' ? '' : module.description;

		if (config.detailLevel === 'detailed' || config.detailLevel === 'complete') {
			if (module.learningObjectives && module.learningObjectives.length > 0) {
				content += '\n\n**Learning Objectives:**\n';
				content += module.learningObjectives.map((obj) => `- ${obj}`).join('\n');
			}

			if (module.keyTopics && module.keyTopics.length > 0) {
				content += '\n\n**Key Topics:**\n';
				content += module.keyTopics.map((topic) => `- ${topic}`).join('\n');
			}
		}

		return {
			title: `Module ${module.order}: ${module.title} (${module.durationWeeks} weeks)`,
			content
		};
	});

	return {
		id: 'modules',
		heading: 'Modules',
		level: 4,
		content: '',
		items
	};
}

// ============================================================================
// Utility Functions
// ============================================================================

/** Creates a filter function for sections based on config */
function makeSectionFilter(sections: (ModuleSection | CourseSection)[]) {
	return (section: ModuleSection | CourseSection): boolean => {
		// If no sections specified, include all
		if (sections.length === 0) return true;
		return sections.includes(section);
	};
}

/** Parses module XML into structured object */
function parseModuleXML(root: Element): ModuleXMLContent {
	const module: ModuleXMLContent = {
		overview: {
			description: '',
			objectives: []
		},
		research: {
			primaryTopics: []
		},
		projects: {
			briefs: [],
			twists: []
		}
	};

	// Parse Metadata
	const metadataEl = root.getElementsByTagName('Metadata')[0];
	if (metadataEl) {
		module.metadata = parseMetadata(metadataEl);
	}

	// Parse ModuleOverview
	const overviewEl = root.getElementsByTagName('ModuleOverview')[0];
	if (overviewEl) {
		const descEl = overviewEl.getElementsByTagName('ModuleDescription')[0];
		if (descEl) {
			module.overview.description = descEl.textContent?.trim() || '';
		}

		const objectivesEl = overviewEl.getElementsByTagName('ModuleObjectives')[0];
		if (objectivesEl) {
			const objElements = objectivesEl.getElementsByTagName('ModuleObjective');
			for (let i = 0; i < objElements.length; i++) {
				const objEl = objElements[i];
				const name = objEl.getElementsByTagName('Name')[0]?.textContent?.trim() || '';
				const details = objEl.getElementsByTagName('Details')[0]?.textContent?.trim() || '';
				module.overview.objectives.push({ name, details });
			}
		}
	}

	// Parse ResearchTopics
	const researchEl = root.getElementsByTagName('ResearchTopics')[0];
	if (researchEl) {
		const primaryEl = researchEl.getElementsByTagName('PrimaryTopics')[0];
		if (primaryEl) {
			const topicElements = primaryEl.getElementsByTagName('PrimaryTopic');
			for (let i = 0; i < topicElements.length; i++) {
				const topicEl = topicElements[i];
				const name = topicEl.getElementsByTagName('TopicName')[0]?.textContent?.trim() || '';
				const description =
					topicEl.getElementsByTagName('TopicDescription')[0]?.textContent?.trim() || '';
				module.research.primaryTopics.push({ name, description });
			}
		}

		const stretchEl = researchEl.getElementsByTagName('StretchTopics')[0];
		if (stretchEl) {
			const stretchElements = stretchEl.getElementsByTagName('StretchTopic');
			module.research.stretchTopics = [];
			for (let i = 0; i < stretchElements.length; i++) {
				module.research.stretchTopics.push(stretchElements[i].textContent?.trim() || '');
			}
		}
	}

	// Parse Projects (briefs and twists)
	const projectsEl = root.getElementsByTagName('Projects')[0];
	if (projectsEl) {
		// Project Briefs
		const briefsEl = projectsEl.getElementsByTagName('ProjectBriefs')[0];
		if (briefsEl) {
			const briefElements = briefsEl.getElementsByTagName('ProjectBrief');
			for (let i = 0; i < briefElements.length; i++) {
				module.projects.briefs.push(parseProjectBrief(briefElements[i]));
			}
		}

		// Project Twists
		const twistsEl = projectsEl.getElementsByTagName('ProjectTwists')[0];
		if (twistsEl) {
			const twistElements = twistsEl.getElementsByTagName('ProjectTwist');
			for (let i = 0; i < twistElements.length; i++) {
				module.projects.twists.push(parseProjectTwist(twistElements[i]));
			}
		}
	}

	// Parse AdditionalSkills
	const skillsEl = root.getElementsByTagName('AdditionalSkills')[0];
	if (skillsEl) {
		module.additionalSkills = parseAdditionalSkills(skillsEl);
	}

	// Parse Notes
	const notesEl = root.getElementsByTagName('Notes')[0];
	if (notesEl) {
		module.notes = notesEl.textContent?.trim();
	}

	return module;
}

function parseMetadata(metadataEl: Element): ModuleXMLContent['metadata'] {
	const metadata: ModuleXMLContent['metadata'] = {};

	// Generation Info
	const genInfoEl = metadataEl.getElementsByTagName('GenerationInfo')[0];
	if (genInfoEl) {
		metadata.generationInfo = {
			timestamp: genInfoEl.getElementsByTagName('Timestamp')[0]?.textContent?.trim() || '',
			source: genInfoEl.getElementsByTagName('Source')[0]?.textContent?.trim() || '',
			model: genInfoEl.getElementsByTagName('Model')[0]?.textContent?.trim() || ''
		};
	}

	// Changelog
	const changelogEl = metadataEl.getElementsByTagName('Changelog')[0];
	if (changelogEl) {
		metadata.changelog = [];
		const changeElements = changelogEl.getElementsByTagName('Change');
		for (let i = 0; i < changeElements.length; i++) {
			const changeEl = changeElements[i];
			metadata.changelog.push({
				section: changeEl.getElementsByTagName('Section')[0]?.textContent?.trim() || '',
				type: changeEl.getElementsByTagName('Type')[0]?.textContent?.trim() || '',
				confidence: (changeEl.getElementsByTagName('Confidence')[0]?.textContent?.trim() ||
					'medium') as 'high' | 'medium' | 'low',
				summary: changeEl.getElementsByTagName('Summary')[0]?.textContent?.trim() || '',
				rationale: changeEl.getElementsByTagName('Rationale')[0]?.textContent?.trim() || ''
			});
		}
	}

	// Provenance
	const provenanceEl = metadataEl.getElementsByTagName('ProvenanceTracking')[0];
	if (provenanceEl) {
		metadata.provenance = {
			aiUpdateCount:
				parseInt(
					provenanceEl.getElementsByTagName('AIUpdateCount')[0]?.textContent?.trim() || '0'
				) || 0,
			sectionsNeedingReview: []
		};
	}

	return metadata;
}

function parseProjectBrief(briefEl: Element): ModuleXMLContent['projects']['briefs'][0] {
	const overviewEl = briefEl.getElementsByTagName('Overview')[0];
	return {
		name: overviewEl?.getElementsByTagName('Name')[0]?.textContent?.trim() || '',
		task: overviewEl?.getElementsByTagName('Task')[0]?.textContent?.trim() || '',
		focus: overviewEl?.getElementsByTagName('Focus')[0]?.textContent?.trim() || '',
		criteria: briefEl.getElementsByTagName('Criteria')[0]?.textContent?.trim() || '',
		skills: parseSkills(briefEl.getElementsByTagName('Skills')[0]),
		examples: parseExamples(briefEl.getElementsByTagName('Examples')[0])
	};
}

function parseProjectTwist(twistEl: Element): ModuleXMLContent['projects']['twists'][0] {
	const examples: string[] = [];
	const examplesEl = twistEl.getElementsByTagName('ExampleUses')[0];
	if (examplesEl) {
		const exampleElements = examplesEl.getElementsByTagName('Example');
		for (let i = 0; i < exampleElements.length; i++) {
			examples.push(exampleElements[i].textContent?.trim() || '');
		}
	}

	return {
		name: twistEl.getElementsByTagName('Name')[0]?.textContent?.trim() || '',
		task: twistEl.getElementsByTagName('Task')[0]?.textContent?.trim() || '',
		examples
	};
}

function parseSkills(skillsEl: Element | undefined): Array<{ name: string; details: string }> {
	if (!skillsEl) return [];
	const skills: Array<{ name: string; details: string }> = [];
	const skillElements = skillsEl.getElementsByTagName('Skill');
	for (let i = 0; i < skillElements.length; i++) {
		const skillEl = skillElements[i];
		skills.push({
			name: skillEl.getElementsByTagName('Name')[0]?.textContent?.trim() || '',
			details: skillEl.getElementsByTagName('Details')[0]?.textContent?.trim() || ''
		});
	}
	return skills;
}

function parseExamples(
	examplesEl: Element | undefined
): Array<{ name: string; description: string }> {
	if (!examplesEl) return [];
	const examples: Array<{ name: string; description: string }> = [];
	const exampleElements = examplesEl.getElementsByTagName('Example');
	for (let i = 0; i < exampleElements.length; i++) {
		const exampleEl = exampleElements[i];
		examples.push({
			name: exampleEl.getElementsByTagName('Name')[0]?.textContent?.trim() || '',
			description: exampleEl.getElementsByTagName('Description')[0]?.textContent?.trim() || ''
		});
	}
	return examples;
}

function parseAdditionalSkills(
	skillsEl: Element
): NonNullable<ModuleXMLContent['additionalSkills']> {
	const categories: NonNullable<ModuleXMLContent['additionalSkills']> = [];
	const categoryElements = skillsEl.getElementsByTagName('SkillsCategory');

	for (let i = 0; i < categoryElements.length; i++) {
		const catEl = categoryElements[i];
		const category = {
			category: catEl.getElementsByTagName('Name')[0]?.textContent?.trim() || '',
			skills: [] as Array<{ name: string; importance: string; description: string }>
		};

		const skillElements = catEl.getElementsByTagName('Skill');
		for (let j = 0; j < skillElements.length; j++) {
			const skillEl = skillElements[j];
			category.skills.push({
				name: skillEl.getElementsByTagName('SkillName')[0]?.textContent?.trim() || '',
				importance: skillEl.getElementsByTagName('Importance')[0]?.textContent?.trim() || '',
				description:
					skillEl.getElementsByTagName('SkillDescription')[0]?.textContent?.trim() || ''
			});
		}

		categories.push(category);
	}

	return categories;
}
