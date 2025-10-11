export interface ProjectsFile { rawContent: string }
export interface SkillsFile { rawContent: string }
export interface ResearchFile { rawContent: string }

export class XMLParseError extends Error {
	constructor(message: string, public readonly details?: string) {
		super(message);
		this.name = 'XMLParseError';
	}
}

/**
 * Parse and validate a Project XML file
 */
export function parseProjectsXML(xmlContent: string): ProjectsFile {
	try {
		// Basic XML validation
		if (!xmlContent.includes('<Projects>') || !xmlContent.includes('</Projects>')) {
			throw new XMLParseError('Invalid Projects XML: Missing <Projects> root element');
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');

		// Check for parser errors
		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			throw new XMLParseError('XML parsing failed', parserError.textContent || undefined);
		}

		// Store raw content for Claude to process
		return { rawContent: xmlContent };
	} catch (error) {
    if (error instanceof XMLParseError) { throw error };

		throw new XMLParseError('Failed to parse Projects XML', error instanceof Error ? error.message : String(error));
	}
}

/**
 * Parse and validate a Skills XML file
 */
export function parseSkillsXML(xmlContent: string): SkillsFile {
	try {
		if (!xmlContent.includes('<AdditionalSkills>') || !xmlContent.includes('</AdditionalSkills>')) {
			throw new XMLParseError('Invalid Skills XML: Missing <Skills> root element');
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');

		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			throw new XMLParseError('XML parsing failed', parserError.textContent || undefined);
		}

		return { rawContent: xmlContent };
	} catch (error) {
		if (error instanceof XMLParseError) { throw error };

		throw new XMLParseError('Failed to parse Skills XML', error instanceof Error ? error.message : String(error));
	}
}

/**
 * Parse and validate a Research XML file
 */
export function parseResearchXML(xmlContent: string): ResearchFile {
	try {
		if (!xmlContent.includes('<ResearchTopics>') || !xmlContent.includes('</ResearchTopics>')) {
			throw new XMLParseError('Invalid Research XML: Missing <ResearchTopics> root element');
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');

		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			throw new XMLParseError('XML parsing failed', parserError.textContent || undefined);
		}

		return { rawContent: xmlContent };
	} catch (error) {
    if (error instanceof XMLParseError) { throw error };

		throw new XMLParseError('Failed to parse Research XML', error instanceof Error ? error.message : String(error));
	}
}

/**
 * Validate file type and size
 */
export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
	// Check file extension
	if (!file.name.toLowerCase().endsWith('.xml')) {
		return {
		  valid: false,
			error: 'File must have .xml extension'
		};
	}

	// Check file size (max 1MB)
	const maxSize = 1024 * 1024; // 1MB
	if (file.size > maxSize) {
		return {
		  valid: false,
			error: 'File size must be less than 1MB'
		};
	}

	// Check MIME type
	if (file.type && !['text/xml', 'application/xml', 'text/plain'].includes(file.type)) {
		return {
		  valid: false,
			error: 'Invalid file type. Expected XML file.'
		};
	}

	return { valid: true };
}
