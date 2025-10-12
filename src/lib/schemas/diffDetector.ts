/**
 * Diff Detection Utility for Module Changelog
 * Compares input XML sections with generated output to detect changes
 * Focuses on section-level changes rather than line-by-line diffs
 */

import { DOMParser as NodeDOMParser } from '@xmldom/xmldom';

export interface DetectedChange {
	section: string; // XPath-like identifier
	type: 'content_update' | 'examples_expanded' | 'new_content' | 'removed' | 'reordered';
	summary: string;
	inputContent?: string; // Original content (if it existed)
	outputContent?: string; // New content
}

export interface DiffResult {
	changes: DetectedChange[];
	hasChanges: boolean;
}

/**
 * Compare input data with generated module to detect changes
 * @param projectsData Input projects data
 * @param skillsData Input skills data
 * @param researchData Input research data
 * @param generatedXML Generated module XML
 * @returns List of detected changes
 */
export function detectChanges(
	projectsData: any,
	skillsData: any,
	researchData: any,
	generatedXML: string
): DiffResult {
	const changes: DetectedChange[] = [];

	try {
		// Parse generated XML
		const ParserClass = typeof window !== 'undefined' ? window.DOMParser : NodeDOMParser;
		const parser = new ParserClass();
		const doc = parser.parseFromString(generatedXML, 'text/xml');

		// Check for parsing errors
		const parserErrors = doc.getElementsByTagName('parsererror');
		if (parserErrors.length > 0) {
			console.error('Failed to parse generated XML for diff detection');
			return { changes: [], hasChanges: false };
		}

		const root = doc.documentElement;

		// Compare Projects section
		if (projectsData) {
			const projectChanges = compareProjects(projectsData, root);
			changes.push(...projectChanges);
		}

		// Compare Research Topics
		if (researchData) {
			const researchChanges = compareResearchTopics(researchData, root);
			changes.push(...researchChanges);
		}

		// Compare Skills
		if (skillsData) {
			const skillChanges = compareSkills(skillsData, root);
			changes.push(...skillChanges);
		}

		// Detect new objectives (these wouldn't be in input files)
		const objectiveChanges = detectNewObjectives(root);
		changes.push(...objectiveChanges);

		return {
			changes,
			hasChanges: changes.length > 0
		};
	} catch (err) {
		console.error('Error during diff detection:', err);
		return { changes: [], hasChanges: false };
	}
}

/**
 * Compare Projects section between input and output
 */
function compareProjects(inputData: any, outputRoot: Element): DetectedChange[] {
	const changes: DetectedChange[] = [];

	try {
		// Get project briefs from output
		const projectBriefs = outputRoot.getElementsByTagName('ProjectBrief');

		// Count input projects
		const inputProjectCount = Array.isArray(inputData.ProjectBriefs?.ProjectBrief)
			? inputData.ProjectBriefs.ProjectBrief.length
			: inputData.ProjectBriefs?.ProjectBrief ? 1 : 0;

		// Check if project count changed
		if (projectBriefs.length !== inputProjectCount) {
			changes.push({
				section: 'Projects/ProjectBriefs',
				type: projectBriefs.length > inputProjectCount ? 'new_content' : 'removed',
				summary: `Project brief count changed from ${inputProjectCount} to ${projectBriefs.length}`
			});
		}

		// Check for expanded examples in each project
		for (let i = 0; i < projectBriefs.length; i++) {
			const brief = projectBriefs[i];
			const examples = brief.getElementsByTagName('Example');

			// If we have 3+ examples, it likely means examples were expanded
			if (examples.length >= 3) {
				const nameEls = brief.getElementsByTagName('Name');
				const projectName = nameEls.length > 0 ? nameEls[0].textContent?.trim() : `Project ${i + 1}`;

				changes.push({
					section: `Projects/ProjectBriefs/ProjectBrief[${i + 1}]/Examples`,
					type: 'examples_expanded',
					summary: `Added or updated ${examples.length} examples for "${projectName}"`
				});
			}
		}
	} catch (err) {
		console.error('Error comparing projects:', err);
	}

	return changes;
}

/**
 * Compare Research Topics section
 */
function compareResearchTopics(inputData: any, outputRoot: Element): DetectedChange[] {
	const changes: DetectedChange[] = [];

	try {
		// Get primary topics from output
		const primaryTopics = outputRoot.getElementsByTagName('PrimaryTopic');

		// Count input research topics
		const inputTopicCount = Array.isArray(inputData.PrimaryTopics?.PrimaryTopic)
			? inputData.PrimaryTopics.PrimaryTopic.length
			: inputData.PrimaryTopics?.PrimaryTopic ? 1 : 0;

		// Check if topic count changed significantly
		if (Math.abs(primaryTopics.length - inputTopicCount) > 0) {
			changes.push({
				section: 'ResearchTopics/PrimaryTopics',
				type: primaryTopics.length > inputTopicCount ? 'new_content' : 'removed',
				summary: `Research topic count changed from ${inputTopicCount} to ${primaryTopics.length}`
			});
		}

		// Check for stretch topics (these are often new additions)
		const stretchTopics = outputRoot.getElementsByTagName('StretchTopic');
		if (stretchTopics.length > 0) {
			changes.push({
				section: 'ResearchTopics/StretchTopics',
				type: 'new_content',
				summary: `Added ${stretchTopics.length} stretch topics for advanced learners`
			});
		}
	} catch (err) {
		console.error('Error comparing research topics:', err);
	}

	return changes;
}

/**
 * Compare Additional Skills section
 */
function compareSkills(inputData: any, outputRoot: Element): DetectedChange[] {
	const changes: DetectedChange[] = [];

	try {
		// Get skills categories from output
		const skillsCategories = outputRoot.getElementsByTagName('SkillsCategory');

		// Count input skill categories
		const inputCatCount = Array.isArray(inputData.SkillsCategory)
			? inputData.SkillsCategory.length
			: inputData.SkillsCategory ? 1 : 0;

		// Check if category count changed
		if (skillsCategories.length !== inputCatCount) {
			changes.push({
				section: 'AdditionalSkills',
				type: skillsCategories.length > inputCatCount ? 'new_content' : 'removed',
				summary: `Skill categories changed from ${inputCatCount} to ${skillsCategories.length}`
			});
		}
	} catch (err) {
		console.error('Error comparing skills:', err);
	}

	return changes;
}

/**
 * Detect new module objectives (these are synthesized, not from input)
 */
function detectNewObjectives(outputRoot: Element): DetectedChange[] {
	const changes: DetectedChange[] = [];

	try {
		const objectives = outputRoot.getElementsByTagName('ModuleObjective');

		// Objectives are always synthesized from inputs, so mark them as generated
		if (objectives.length >= 3) {
			changes.push({
				section: 'ModuleOverview/ModuleObjectives',
				type: 'new_content',
				summary: `Generated ${objectives.length} learning objectives from input materials`
			});
		}
	} catch (err) {
		console.error('Error detecting objectives:', err);
	}

	return changes;
}

/**
 * Extract text content from an element and its children
 */
function extractTextContent(element: Element): string {
	return element.textContent?.trim() || '';
}

/**
 * Calculate similarity between two text strings (simple approach)
 * Returns value between 0 (completely different) and 1 (identical)
 */
function calculateSimilarity(text1: string, text2: string): number {
	if (text1 === text2) return 1.0;
	if (!text1 || !text2) return 0.0;

	// Simple word-based similarity (good enough for MVP)
	const words1 = new Set(text1.toLowerCase().split(/\s+/));
	const words2 = new Set(text2.toLowerCase().split(/\s+/));

	const intersection = new Set([...words1].filter(w => words2.has(w)));
	const union = new Set([...words1, ...words2]);

	return intersection.size / union.size;
}
