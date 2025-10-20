/**
 * @deprecated LEGACY MODULE SCHEMA - DO NOT USE
 *
 * This file defines an OLD XML schema format with lowercase tags (<module>, <objectives>, etc.)
 * that is NO LONGER USED in the current application.
 *
 * CURRENT SCHEMA: See src/data/templates/outputSchema.xml (capital tags: <Module>, <LearningObjectives>, etc.)
 * CURRENT VALIDATOR: See src/lib/schemas/moduleValidator.ts
 *
 * This file is retained for historical reference only. If you're working with module XML,
 * use the schemas/moduleValidator.ts instead.
 *
 * Last confirmed unused: 2025-10-20
 */

export interface ModuleProject {
	name: string;
	description: string;
}

export interface ModuleSpec {
	overview: string;
	objectives: string[];
	projects: ModuleProject[];
	technicalRequirements: string[];
	notes: string;
}

/**
 * XML Schema for module output
 * This matches the format expected by the pedagogue system
 */
export const MODULE_XML_SCHEMA = `
<module>
  <overview>Module overview text</overview>
  <objectives>
    <objective>Learning objective 1</objective>
    <objective>Learning objective 2</objective>
  </objectives>
  <projects>
    <project>
      <name>Project name</name>
      <description>Project description</description>
    </project>
  </projects>
  <technical-requirements>
    <requirement>Technical requirement 1</requirement>
    <requirement>Technical requirement 2</requirement>
  </technical-requirements>
  <notes>Additional notes</notes>
</module>
`.trim();

/**
 * Parse module XML string into structured object
 */
export function parseModuleXML(xmlString: string): ModuleSpec {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xmlString, 'text/xml');

	// Check for parse errors
	const parseError = doc.querySelector('parsererror');
	if (parseError) {
		throw new Error(`XML Parse Error: ${parseError.textContent}`);
	}

	const module = doc.querySelector('module');
	if (!module) {
		throw new Error('Invalid XML: No <module> root element found');
	}

	// Extract overview
	const overviewEl = module.querySelector('overview');
	if (!overviewEl) {
		throw new Error('Invalid XML: Missing required <overview> element');
	}

	// Extract objectives
	const objectivesEl = module.querySelector('objectives');
	if (!objectivesEl) {
		throw new Error('Invalid XML: Missing required <objectives> element');
	}
	const objectives = Array.from(objectivesEl.querySelectorAll('objective')).map(
		(obj) => obj.textContent?.trim() || ''
	);

	// Extract projects
	const projectsEl = module.querySelector('projects');
	if (!projectsEl) {
		throw new Error('Invalid XML: Missing required <projects> element');
	}
	const projects = Array.from(projectsEl.querySelectorAll('project')).map((proj) => {
		const name = proj.querySelector('name')?.textContent?.trim() || '';
		const description = proj.querySelector('description')?.textContent?.trim() || '';
		return { name, description };
	});

	// Extract technical requirements
	const techReqEl = module.querySelector('technical-requirements');
	if (!techReqEl) {
		throw new Error('Invalid XML: Missing required <technical-requirements> element');
	}
	const technicalRequirements = Array.from(techReqEl.querySelectorAll('requirement')).map(
		(req) => req.textContent?.trim() || ''
	);

	// Extract notes
	const notesEl = module.querySelector('notes');
	if (!notesEl) {
		throw new Error('Invalid XML: Missing required <notes> element');
	}

	return {
		overview: overviewEl.textContent?.trim() || '',
		objectives,
		projects,
		technicalRequirements,
		notes: notesEl.textContent?.trim() || ''
	};
}

/**
 * Convert structured module spec back to XML
 */
export function moduleToXML(module: ModuleSpec): string {
	const objectivesXML = module.objectives
		.map((obj) => `    <objective>${escapeXML(obj)}</objective>`)
		.join('\n');

	const projectsXML = module.projects
		.map(
			(proj) => `    <project>
      <name>${escapeXML(proj.name)}</name>
      <description>${escapeXML(proj.description)}</description>
    </project>`
		)
		.join('\n');

	const techReqXML = module.technicalRequirements
		.map((req) => `    <requirement>${escapeXML(req)}</requirement>`)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<module>
  <overview>
    ${escapeXML(module.overview)}
  </overview>
  <objectives>
${objectivesXML}
  </objectives>
  <projects>
${projectsXML}
  </projects>
  <technical-requirements>
${techReqXML}
  </technical-requirements>
  <notes>
    ${escapeXML(module.notes)}
  </notes>
</module>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Validate module XML structure
 */
export function validateModuleXML(xmlString: string): {
	valid: boolean;
	errors: string[];
	module?: ModuleSpec;
} {
	const errors: string[] = [];

	try {
		const module = parseModuleXML(xmlString);

		// Validate content
		if (!module.overview || module.overview.length < 10) {
			errors.push('Overview is missing or too short (minimum 10 characters)');
		}

		if (module.objectives.length === 0) {
			errors.push('At least one objective is required');
		}

		if (module.projects.length === 0) {
			errors.push('At least one project is required');
		}

		module.projects.forEach((proj, idx) => {
			if (!proj.name) {
				errors.push(`Project ${idx + 1} is missing a name`);
			}
			if (!proj.description) {
				errors.push(`Project ${idx + 1} is missing a description`);
			}
		});

		if (module.technicalRequirements.length === 0) {
			errors.push('At least one technical requirement is required');
		}

		return {
			valid: errors.length === 0,
			errors,
			module: errors.length === 0 ? module : undefined
		};
	} catch (error) {
		errors.push(error instanceof Error ? error.message : 'Unknown validation error');
		return {
			valid: false,
			errors
		};
	}
}
